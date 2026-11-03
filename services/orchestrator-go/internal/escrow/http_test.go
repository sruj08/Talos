package escrow

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"

	"github.com/talos/services/orchestrator-go/internal/paypal"
	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
)

type flakyPayPalProvider struct {
	inner         paypal.Provider
	failNextAuth  atomic.Bool
	failNextCap   atomic.Bool
	failNextVoid  atomic.Bool
}

func (f *flakyPayPalProvider) AuthorizeEscrowHold(ctx context.Context, req paypal.HoldRequest) (*paypal.HoldResult, error) {
	if f.failNextAuth.CompareAndSwap(true, false) {
		return nil, errors.New("paypal: upstream 503 gateway timeout")
	}
	return f.inner.AuthorizeEscrowHold(ctx, req)
}

func (f *flakyPayPalProvider) CaptureEscrowHold(ctx context.Context, req paypal.CaptureRequest) (*paypal.CaptureResult, error) {
	if f.failNextCap.CompareAndSwap(true, false) {
		return nil, errors.New("paypal: upstream 503 capture timeout")
	}
	return f.inner.CaptureEscrowHold(ctx, req)
}

func (f *flakyPayPalProvider) VoidEscrowHold(ctx context.Context, authID, reqID string) (*paypal.VoidResult, error) {
	if f.failNextVoid.CompareAndSwap(true, false) {
		return nil, errors.New("paypal: upstream 503 void timeout")
	}
	return f.inner.VoidEscrowHold(ctx, authID, reqID)
}

func TestTransientUpstreamFailureReleasesIdempotencyLockOnRetry(t *testing.T) {
	flaky := &flakyPayPalProvider{
		inner: paypal.NewSandboxService(paypalapimatic.NewSandboxClient("", ""), "WH-RETRY-01"),
	}
	gate := newMemoryIdempGate()
	engine := NewEngine(flaky, gate)
	ctx := context.Background()

	// 1. First AuthorizeHold fails transiently -> lock must be released so retry with same PayPal-Request-Id succeeds
	flaky.failNextAuth.Store(true)
	authReq := AuthorizeRequest{
		EscrowID:        "escrow_retry_01",
		MandateID:       "mandate_retry_01",
		AmountCents:     74000,
		Currency:        "EUR",
		PayPalRequestID: "req-transient-auth-01",
	}
	if _, err := engine.AuthorizeHold(ctx, authReq); err == nil {
		t.Fatalf("expected transient error on first AuthorizeHold")
	}
	resAuth, err := engine.AuthorizeHold(ctx, authReq)
	if err != nil || resAuth.Record.State != StatePayPalAuthorized || resAuth.Record.Currency != "EUR" {
		t.Fatalf("retry AuthorizeHold with same PayPal-Request-Id failed: res=%+v err=%v", resAuth, err)
	}

	// 2. First CaptureHold fails transiently -> lock must be released so retry with same PayPal-Request-Id succeeds
	flaky.failNextCap.Store(true)
	capReq := CaptureRequest{
		EscrowID:        "escrow_retry_01",
		PayPalRequestID: "req-transient-cap-01",
	}
	if _, err := engine.CaptureHold(ctx, capReq); err == nil {
		t.Fatalf("expected transient error on first CaptureHold")
	}
	resCap, err := engine.CaptureHold(ctx, capReq)
	if err != nil || resCap.Record.State != StatePayPalCaptured || resCap.Record.CapturedAmountCents != 74000 {
		t.Fatalf("retry CaptureHold with same PayPal-Request-Id failed: res=%+v err=%v", resCap, err)
	}
}

func TestOpenAPIWireContractAPI07API09API10(t *testing.T) {
	provider := paypal.NewSandboxService(paypalapimatic.NewSandboxClient("", ""), "WH-OPENAPI-01")
	engine := NewEngine(provider, newMemoryIdempGate())
	mux := http.NewServeMux()
	engine.RegisterRoutes(mux)
	srv := httptest.NewServer(mux)
	defer srv.Close()

	// 1. API-07: POST /api/v1/escrow/authorize without escrow_id in path/body (OpenAPI wire payload)
	openAPIAuthBody := []byte(`{
		"mandate_id": "ap2-mnd-9941",
		"agent_id": "agent_buyer_01",
		"payer_sandbox_email": "buyer-treasury@sandbox.paypal.com",
		"payee_sandbox_email": "supplier-bosch@sandbox.paypal.com",
		"amount_cents": 118500,
		"currency": "USD",
		"description": "Bosch Rexroth Linear Guide"
	}`)
	req, _ := http.NewRequest(http.MethodPost, srv.URL+"/api/v1/escrow/authorize", bytes.NewReader(openAPIAuthBody))
	req.Header.Set("PayPal-Request-Id", "3f29a8d0-9b1c-4e7a-8122-0c59f11a9001")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("API-07 POST /api/v1/escrow/authorize failed: status=%v err=%v", resp.StatusCode, err)
	}
	var authOut map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&authOut)
	resp.Body.Close()

	escrowID, _ := authOut["escrow_id"].(string)
	if escrowID == "" || authOut["paypal_auth_id"] == "" || authOut["state"] != string(StatePayPalAuthorized) {
		t.Fatalf("unexpected API-07 response payload: %+v", authOut)
	}

	// 2. API-09: POST /api/v1/escrow/{id}/capture must return 201 Created per API_SPEC.md & openapi.yaml
	capReq, _ := http.NewRequest(http.MethodPost, srv.URL+"/api/v1/escrow/"+escrowID+"/capture", bytes.NewReader([]byte(`{"final_capture":true}`)))
	capReq.Header.Set("PayPal-Request-Id", "5d81e420-1c2a-4b9f-9910-8a74c0029112")
	capResp, err := http.DefaultClient.Do(capReq)
	if err != nil || capResp.StatusCode != http.StatusCreated {
		t.Fatalf("API-09 POST /api/v1/escrow/{id}/capture expected 201 Created, got status=%v err=%v", capResp.StatusCode, err)
	}
	var capOut map[string]any
	_ = json.NewDecoder(capResp.Body).Decode(&capOut)
	capResp.Body.Close()
	if capOut["paypal_capture_id"] == "" || capOut["state"] != string(StatePayPalCaptured) {
		t.Fatalf("unexpected API-09 capture payload: %+v", capOut)
	}

	// 3. API-10 on a fresh hold with void_reason returns 200 OK + buyer_funds_released_cents
	req2, _ := http.NewRequest(http.MethodPost, srv.URL+"/api/v1/escrow/authorize", bytes.NewReader(openAPIAuthBody))
	req2.Header.Set("PayPal-Request-Id", "4a11b902-7c4e-4d1a-9001-1b22c33d4455")
	resp2, _ := http.DefaultClient.Do(req2)
	var authOut2 map[string]any
	_ = json.NewDecoder(resp2.Body).Decode(&authOut2)
	resp2.Body.Close()
	escrowID2 := authOut2["escrow_id"].(string)

	voidReq, _ := http.NewRequest(http.MethodPost, srv.URL+"/api/v1/escrow/"+escrowID2+"/void", bytes.NewReader([]byte(`{"void_reason":"BRYNTUM_SLA_DEADLINE_BREACHED_48H","triggered_by":"SLA_ENGINE"}`)))
	voidReq.Header.Set("PayPal-Request-Id", "7f00c912-3d1e-4f99-8211-9c44b11a0088")
	voidResp, err := http.DefaultClient.Do(voidReq)
	if err != nil || voidResp.StatusCode != http.StatusOK {
		t.Fatalf("API-10 POST /api/v1/escrow/{id}/void failed: status=%v err=%v", voidResp.StatusCode, err)
	}
	var voidOut map[string]any
	_ = json.NewDecoder(voidResp.Body).Decode(&voidOut)
	voidResp.Body.Close()
	if voidOut["void_reason"] != "BRYNTUM_SLA_DEADLINE_BREACHED_48H" || voidOut["buyer_funds_released_cents"] != float64(118500) {
		t.Fatalf("unexpected API-10 void payload: %+v", voidOut)
	}
}
