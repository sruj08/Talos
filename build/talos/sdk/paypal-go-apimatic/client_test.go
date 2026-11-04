package paypalapimatic

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

func TestLiveOrEnvPayPalSandboxOAuth2TokenAcquisition(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client := NewClientFromEnv()
	if !client.HasLiveCredentials() {
		t.Log("live PayPal credentials not detected in env; testing deterministic fallback mode")
	}

	tok1, err := client.AcquireOAuthToken(ctx)
	if err != nil {
		t.Fatalf("AcquireOAuthToken failed: %v", err)
	}
	if tok1.TokenType != "Bearer" {
		t.Fatalf("expected TokenType=Bearer, got %q", tok1.TokenType)
	}
	if tok1.ExpiresIn <= 0 {
		t.Fatalf("expected positive ExpiresIn, got %d", tok1.ExpiresIn)
	}
	if len(tok1.AccessToken) < 16 {
		t.Fatalf("expected non-empty AccessToken of valid length")
	}
	if client.HasLiveCredentials() && tok1.SandboxMode != "LIVE" {
		t.Fatalf("expected LIVE sandbox token with valid .env credentials, got mode=%s", tok1.SandboxMode)
	}

	// Second call must hit thread-safe in-memory token cache
	tok2, err := client.AcquireOAuthToken(ctx)
	if err != nil {
		t.Fatalf("second AcquireOAuthToken failed: %v", err)
	}
	if !tok1.ObtainedAt.Equal(tok2.ObtainedAt) {
		t.Fatalf("expected second AcquireOAuthToken call to return cached token")
	}
}

func TestPayPalRequestIdEnforcementAndRetryBackoff(t *testing.T) {
	ctx := context.Background()
	var attempts atomic.Int32
	var receivedReqID atomic.Value

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v1/oauth2/token" {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]any{
				"access_token": "mock_live_token_value_1234567890",
				"token_type":   "Bearer",
				"app_id":       "APP-TEST",
				"expires_in":   32400,
			})
			return
		}
		receivedReqID.Store(r.Header.Get("PayPal-Request-Id"))
		cur := attempts.Add(1)
		if cur == 1 {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Paypal-Debug-Id", "dbg-retry-ok")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"id":     "8XY-MOCK-ORDER-01",
			"status": "CREATED",
		})
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{
		BaseURL:        srv.URL,
		ClientID:       "A_LIVE_TEST_CLIENT_ID",
		ClientSecret:   "E_LIVE_TEST_CLIENT_SECRET",
		SandboxMode:    true,
		FallbackReplay: false,
		MaxRetries:     2,
		RetryBaseDelay: 10 * time.Millisecond,
	})

	// Missing PayPal-Request-Id must be rejected before network call
	_, err := c.CreateOrder(ctx, CreateOrderRequest{AmountCents: 24900, CurrencyCode: "USD"})
	if !errors.Is(err, ErrMissingPayPalRequestID) {
		t.Fatalf("expected ErrMissingPayPalRequestID, got %v", err)
	}

	// Valid request with retry on 503
	resp, err := c.CreateOrder(ctx, CreateOrderRequest{
		PayPalRequestID: "idemp-order-001",
		AmountCents:     24900,
		CurrencyCode:    "USD",
		Description:     "Shure SM7B Escrow Hold",
	})
	if err != nil {
		t.Fatalf("CreateOrder after transient 503 failed: %v", err)
	}
	if attempts.Load() != 2 {
		t.Fatalf("expected 2 attempts (1 transient 503 + 1 retry), got %d", attempts.Load())
	}
	if gotID, _ := receivedReqID.Load().(string); gotID != "idemp-order-001" {
		t.Fatalf("expected PayPal-Request-Id header 'idemp-order-001', got %q", gotID)
	}
	if resp.OrderID != "8XY-MOCK-ORDER-01" || resp.SandboxMode != "LIVE" {
		t.Fatalf("unexpected CreateOrder response: %+v", resp)
	}
}

func TestOrdersV2PaymentsV2TrackingV1AndDisputesV1Controllers(t *testing.T) {
	ctx := context.Background()

	mux := http.NewServeMux()
	mux.HandleFunc("/v1/oauth2/token", func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"access_token": "mock_bearer_token_abcdef123456",
			"token_type":   "Bearer",
			"expires_in":   32400,
		})
	})
	mux.HandleFunc("/v2/checkout/orders", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]any{"id": "ORD-SM7B-249", "status": "CREATED"})
	})
	mux.HandleFunc("/v2/checkout/orders/ORD-SM7B-249/authorize", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"id":     "ORD-SM7B-249",
			"status": "COMPLETED",
			"purchase_units": []map[string]any{
				{"payments": map[string]any{"authorizations": []map[string]any{{"id": "2A-AUTH-SM7B-01", "status": "CREATED"}}}},
			},
		})
	})
	mux.HandleFunc("/v2/payments/authorizations/2A-AUTH-SM7B-01/capture", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]any{"id": "9CAP-SM7B-01", "status": "COMPLETED"})
	})
	mux.HandleFunc("/v2/payments/authorizations/2A-AUTH-SM7B-01/void", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("/v1/shipping/trackers-batch", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"tracker_identifiers": []map[string]any{{"transaction_id": "9CAP-SM7B-01", "tracking_number": "794892104852"}},
		})
	})
	mux.HandleFunc("/v1/customer/disputes/PP-D-40192/provide-evidence", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]any{"status": "EVIDENCE_SUBMITTED"})
	})

	srv := httptest.NewServer(mux)
	defer srv.Close()

	c := NewClient(ClientConfig{
		BaseURL:        srv.URL,
		ClientID:       "A_CLIENT",
		ClientSecret:   "E_SECRET",
		SandboxMode:    true,
		FallbackReplay: false,
	})

	// 1. Orders v2 Create + Authorize
	authResp, err := c.CreateAndAuthorizeOrder(ctx, CreateOrderRequest{
		PayPalRequestID: "req-ord-249",
		AmountCents:     24900,
		CurrencyCode:    "USD",
	})
	if err != nil || authResp.AuthorizationID != "2A-AUTH-SM7B-01" || authResp.Status != "AUTHORIZED" {
		t.Fatalf("CreateAndAuthorizeOrder failed: resp=%+v err=%v", authResp, err)
	}

	// 2. Payments v2 Capture
	capResp, err := c.CaptureAuthorization(ctx, authResp.AuthorizationID, 24900, "USD", "req-cap-249")
	if err != nil || capResp.CaptureID != "9CAP-SM7B-01" || capResp.Status != "COMPLETED" {
		t.Fatalf("CaptureAuthorization failed: resp=%+v err=%v", capResp, err)
	}

	// 3. Payments v2 Void
	voidResp, err := c.VoidAuthorization(ctx, authResp.AuthorizationID, "req-void-249")
	if err != nil || voidResp.Status != "VOIDED" || voidResp.HTTPStatusCode != http.StatusNoContent {
		t.Fatalf("VoidAuthorization failed: resp=%+v err=%v", voidResp, err)
	}

	// 4. Shipment Tracking v1
	trkResp, err := c.RegisterShipmentTracker(ctx, TrackerPayload{
		TransactionID:  capResp.CaptureID,
		TrackingNumber: "794892104852",
		Status:         "DELIVERED",
		Carrier:        "FEDEX",
	}, "req-trk-249")
	if err != nil || trkResp.Status != "DELIVERED" || len(trkResp.TrackerIdentifiers) != 1 {
		t.Fatalf("RegisterShipmentTracker failed: resp=%+v err=%v", trkResp, err)
	}

	// 5. Customer Disputes v1
	dispResp, err := c.ProvideDisputeEvidence(ctx, "PP-D-40192", ProvideEvidenceRequest{
		MandateSignatureHex:  "aabbccddeeff",
		Channel3SnapshotJSON: `{"sku":"Shure SM7B","median_cents":24900}`,
		KernelScreenshotURL:  "https://evidence.onkernel.com/snap-901.png",
		Notes:                "Cryptographic KYA Mandate + Channel3 Benchmark attached",
	}, "req-disp-249")
	if err != nil || dispResp.Status != "EVIDENCE_SUBMITTED" || len(dispResp.EvidenceHashSHA256) != 64 {
		t.Fatalf("ProvideDisputeEvidence failed: resp=%+v err=%v", dispResp, err)
	}
}
