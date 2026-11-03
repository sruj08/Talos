package paypalapimatic

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestOAuth2TokenCachingAndLifecycleEndpoints(t *testing.T) {
	var oauthCalls, transientCalls atomic.Int32

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/v1/oauth2/token":
			user, pass, ok := r.BasicAuth()
			if !ok || user != "test-client-id" || pass != "test-client-secret" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			oauthCalls.Add(1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"access_token":"mock-sandbox-token","token_type":"Bearer","expires_in":32400}`))

		case r.Method == http.MethodPost && r.URL.Path == "/v2/checkout/orders":
			if r.Header.Get("PayPal-Request-Id") == "" || r.Header.Get("Authorization") != "Bearer mock-sandbox-token" {
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			if r.Header.Get("PayPal-Request-Id") == "req-transient-503" && transientCalls.Add(1) == 1 {
				w.WriteHeader(http.StatusServiceUnavailable)
				return
			}
			w.WriteHeader(http.StatusCreated)
			_, _ = w.Write([]byte(`{"id":"5O190127TN364715T","status":"CREATED","create_time":"2026-04-04T07:00:00Z"}`))

		case r.Method == http.MethodPost && r.URL.Path == "/v2/checkout/orders/5O190127TN364715T/authorize":
			w.WriteHeader(http.StatusCreated)
			_, _ = w.Write([]byte(`{"id":"5O190127TN364715T","status":"COMPLETED","purchase_units":[{"custom_id":"escrow_001","payments":{"authorizations":[{"id":"0VF52814937998046","status":"CREATED"}]}}]}`))

		case r.Method == http.MethodPost && r.URL.Path == "/v2/payments/authorizations/0VF52814937998046/capture":
			var body map[string]any
			_ = json.NewDecoder(r.Body).Decode(&body)
			w.WriteHeader(http.StatusCreated)
			_, _ = w.Write([]byte(`{"id":"2GG279541U471931P","status":"COMPLETED","final_capture":true,"create_time":"2026-04-04T07:05:00Z"}`))

		case r.Method == http.MethodPost && r.URL.Path == "/v2/payments/authorizations/0VF52814937998046/void":
			w.WriteHeader(http.StatusNoContent)

		case r.Method == http.MethodPost && r.URL.Path == "/v1/shipping/trackers-batch":
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"tracker_identifiers":[{"transaction_id":"2GG279541U471931P","tracking_number":"FDX-774829104","carrier":"FEDEX","status":"DELIVERED"}]}`))

		case r.Method == http.MethodPost && r.URL.Path == "/v1/customer/disputes/PP-D-40192/provide-evidence":
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"status":"UNDER_REVIEW"}`))

		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer srv.Close()

	client := NewSandboxClient("test-client-id", "test-client-secret")
	client.BaseURL = srv.URL
	client.FallbackMode = false
	client.RetryBackoff = 5 * time.Millisecond
	ctx := context.Background()

	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if tok, err := client.GetAccessToken(ctx); err != nil || tok != "mock-sandbox-token" {
				t.Errorf("unexpected token result: tok=%q err=%v", tok, err)
			}
		}()
	}
	wg.Wait()
	if got := oauthCalls.Load(); got != 1 {
		t.Fatalf("expected 1 OAuth2 token call, got %d", got)
	}

	authResp, err := client.CreateAndAuthorizeOrder(ctx, CreateOrderRequest{
		Intent:          "AUTHORIZE",
		CurrencyCode:    "USD",
		AmountCents:     128000,
		CustomID:        "escrow_001",
		Description:     "Precision Milling Spindle",
		PayPalRequestID: "req-transient-503",
	})
	if err != nil || authResp.OrderID != "5O190127TN364715T" || authResp.AuthorizationID != "0VF52814937998046" {
		t.Fatalf("CreateAndAuthorizeOrder failed: %+v err=%v", authResp, err)
	}

	capResp, err := client.CaptureAuthorization(ctx, authResp.AuthorizationID, CaptureAuthorizationRequest{
		PayPalRequestID: "req-capture-001",
		FinalCapture:    true,
		NoteToPayer:     "Talos Oracle Verified Delivery",
		AmountCents:     128000,
		CurrencyCode:    "USD",
	})
	if err != nil || capResp.CaptureID != "2GG279541U471931P" || capResp.Status != "COMPLETED" {
		t.Fatalf("CaptureAuthorization failed: resp=%+v err=%v", capResp, err)
	}

	if voidResp, err := client.VoidAuthorization(ctx, authResp.AuthorizationID, "req-void-001"); err != nil || voidResp.Status != "VOIDED" {
		t.Fatalf("VoidAuthorization failed: resp=%+v err=%v", voidResp, err)
	}

	trackResp, err := client.CreateTrackingBatch(ctx, "req-track-001", []TrackerPayload{
		{TransactionID: capResp.CaptureID, TrackingNumber: "FDX-774829104", Carrier: "FEDEX", Status: "DELIVERED"},
	})
	if err != nil || len(trackResp.TrackerIdentifiers) != 1 {
		t.Fatalf("CreateTrackingBatch failed: resp=%+v err=%v", trackResp, err)
	}

	dispResp, err := client.ProvideDisputeEvidence(ctx, "req-dispute-001", ProvideEvidenceRequest{
		DisputeID:        "PP-D-40192",
		EvidenceType:     "PROOF_OF_FULFILLMENT",
		Notes:            "Signed KYA mandate + carrier delivery",
		MandateSignature: "ed25519:sig_abc",
		AuditHash:        "sha256:hash_xyz",
	})
	if err != nil || dispResp.Status != "UNDER_REVIEW" || !strings.HasPrefix(dispResp.EvidenceHash, "sha256:") {
		t.Fatalf("ProvideDisputeEvidence failed: resp=%+v err=%v", dispResp, err)
	}
	if got := oauthCalls.Load(); got != 1 {
		t.Fatalf("expected cached OAuth2 token across all lifecycle calls, got %d token calls", got)
	}
}

func TestValidationAndDeterministicFallback(t *testing.T) {
	ctx := context.Background()
	client := NewSandboxClient("", "")
	if !client.FallbackMode {
		t.Fatal("expected FallbackMode=true when credentials are empty")
	}
	if _, err := client.CreateOrder(ctx, CreateOrderRequest{Intent: "CAPTURE", AmountCents: 100, PayPalRequestID: "r1"}); !errors.Is(err, ErrInvalidIntent) {
		t.Fatalf("expected ErrInvalidIntent, got %v", err)
	}
	if _, err := client.CreateOrder(ctx, CreateOrderRequest{Intent: "AUTHORIZE", AmountCents: 100}); !errors.Is(err, ErrMissingRequestID) {
		t.Fatalf("expected ErrMissingRequestID, got %v", err)
	}
	if _, err := client.CaptureAuthorization(ctx, "", CaptureAuthorizationRequest{PayPalRequestID: "r1"}); !errors.Is(err, ErrEmptyIdentifier) {
		t.Fatalf("expected ErrEmptyIdentifier, got %v", err)
	}
	if _, err := client.VoidAuthorization(ctx, "AUTH-1", ""); !errors.Is(err, ErrMissingRequestID) {
		t.Fatalf("expected ErrMissingRequestID, got %v", err)
	}

	r1, err := client.CreateAndAuthorizeOrder(ctx, CreateOrderRequest{
		Intent: "AUTHORIZE", AmountCents: 50000, CurrencyCode: "USD", CustomID: "escrow_det_1", PayPalRequestID: "idemp-key-123",
	})
	if err != nil || !r1.FallbackReplay || r1.Status != "AUTHORIZED" {
		t.Fatalf("fallback CreateAndAuthorizeOrder failed: %+v err=%v", r1, err)
	}
	r2, _ := client.CreateAndAuthorizeOrder(ctx, CreateOrderRequest{
		Intent: "AUTHORIZE", AmountCents: 50000, CurrencyCode: "USD", CustomID: "escrow_det_1", PayPalRequestID: "idemp-key-123",
	})
	if r1.OrderID != r2.OrderID || r1.AuthorizationID != r2.AuthorizationID {
		t.Fatalf("expected deterministic IDs across identical request IDs, got %s vs %s", r1.OrderID, r2.OrderID)
	}
}

func TestLiveSandboxOAuthAndOrderSmokeIfConfigured(t *testing.T) {
	envMap := loadDotEnvSilently(filepath.Join("..", "..", ".env"))
	clientID, clientSecret := envMap["PAYPAL_CLIENT_ID"], envMap["PAYPAL_CLIENT_SECRET"]
	if clientID == "" || clientSecret == "" {
		t.Skip("PayPal Sandbox credentials not present in .env; skipping live smoke test")
	}

	client := NewSandboxClient(clientID, clientSecret)
	client.FallbackMode = false
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	token, err := client.GetAccessToken(ctx)
	if err != nil || len(token) < 16 {
		t.Fatalf("live PayPal Sandbox OAuth2 token exchange failed: %v", err)
	}
	reqID := "talos-sdk-smoke-" + time.Now().UTC().Format("20060102150405")
	orderResp, err := client.CreateOrder(ctx, CreateOrderRequest{
		Intent: "AUTHORIZE", CurrencyCode: "USD", AmountCents: 128000, CustomID: "talos_phase3_smoke",
		Description: "TALOS Phase 3 APIMatic SDK Live Sandbox Smoke", PayPalRequestID: reqID,
	})
	if err != nil || orderResp.OrderID == "" || orderResp.Status != "CREATED" {
		t.Fatalf("live CreateOrder failed: resp=%+v err=%v", orderResp, err)
	}
}

func loadDotEnvSilently(path string) map[string]string {
	out := make(map[string]string)
	f, err := os.Open(path)
	if err != nil {
		return out
	}
	defer f.Close()
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		if k, v, ok := strings.Cut(line, "="); ok {
			out[strings.TrimSpace(k)] = strings.Trim(strings.TrimSpace(v), `"'`)
		}
	}
	return out
}
