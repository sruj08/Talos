package escrow

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/talos/services/orchestrator-go/internal/paypal"
	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
)

type memoryIdempGate struct {
	mu   sync.Mutex
	keys map[string]time.Time
}

func newMemoryIdempGate() *memoryIdempGate {
	return &memoryIdempGate{keys: make(map[string]time.Time)}
}

func (g *memoryIdempGate) AcquireIdempotencyLock(_ context.Context, key string, _ string, ttl time.Duration) (bool, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if exp, ok := g.keys[key]; ok && time.Now().Before(exp) {
		return false, nil
	}
	g.keys[key] = time.Now().Add(ttl)
	return true, nil
}

func (g *memoryIdempGate) ReleaseIdempotencyLock(_ context.Context, key string) error {
	g.mu.Lock()
	defer g.mu.Unlock()
	delete(g.keys, key)
	return nil
}

type countingPayPalProvider struct {
	inner     paypal.Provider
	authCalls atomic.Int32
	capCalls  atomic.Int32
	voidCalls atomic.Int32
}

func (c *countingPayPalProvider) AuthorizeEscrowHold(ctx context.Context, req paypal.HoldRequest) (*paypal.HoldResult, error) {
	c.authCalls.Add(1)
	return c.inner.AuthorizeEscrowHold(ctx, req)
}

func (c *countingPayPalProvider) CaptureEscrowHold(ctx context.Context, req paypal.CaptureRequest) (*paypal.CaptureResult, error) {
	c.capCalls.Add(1)
	return c.inner.CaptureEscrowHold(ctx, req)
}

func (c *countingPayPalProvider) VoidEscrowHold(ctx context.Context, authID, reqID string) (*paypal.VoidResult, error) {
	c.voidCalls.Add(1)
	return c.inner.VoidEscrowHold(ctx, authID, reqID)
}

func TestStateTransitionGraphAndIllegalTransitions(t *testing.T) {
	validPairs := [][2]State{
		{StateInitiated, StateMandateVerified},
		{StateInitiated, StateBlockedFirewall},
		{StateMandateVerified, StateChannel3Benchmarked},
		{StateMandateVerified, StateBlockedPriceGouging},
		{StateMandateVerified, StateStepUpRequired},
		{StateChannel3Benchmarked, StatePayPalAuthorized},
		{StatePayPalAuthorized, StateSLAScheduled},
		{StateSLAScheduled, StateTrackingVerified},
		{StateTrackingVerified, StatePayPalCaptured},
		{StateTrackingVerified, StatePayPalVoided},
		{StateTrackingVerified, StateDisputeFiled},
		{StateDisputeFiled, StateDisputeEvidenceSubmitted},
	}
	for _, pair := range validPairs {
		if !CanTransition(pair[0], pair[1]) {
			t.Fatalf("expected transition %s -> %s to be valid", pair[0], pair[1])
		}
	}

	illegalPairs := [][2]State{
		{StatePayPalVoided, StatePayPalCaptured},
		{StatePayPalCaptured, StatePayPalVoided},
		{StateBlockedFirewall, StatePayPalAuthorized},
		{StateBlockedPriceGouging, StatePayPalAuthorized},
		{StateDisputeFiled, StatePayPalCaptured},
		{StateDisputeEvidenceSubmitted, StatePayPalVoided},
	}
	for _, pair := range illegalPairs {
		if CanTransition(pair[0], pair[1]) {
			t.Fatalf("expected transition %s -> %s to be illegal", pair[0], pair[1])
		}
	}
}

func TestIdempotent2PCLifecycleAndIllegalTransitions(t *testing.T) {
	provider := &countingPayPalProvider{
		inner: paypal.NewSandboxService(paypalapimatic.NewSandboxClient("", ""), "WH-01"),
	}
	engine := NewEngine(provider, newMemoryIdempGate())
	ctx := context.Background()

	// 1. Authorize Hold + verify duplicate PayPal-Request-Id idempotency
	authReq := AuthorizeRequest{
		EscrowID:        "escrow_2pc_01",
		MandateID:       "mandate_01",
		BuyerAgentID:    "agent_procure_01",
		SellerID:        "seller_apex_01",
		AmountCents:     128000,
		CurrencyCode:    "USD",
		Description:     "Precision Milling Spindle",
		PayPalRequestID: "req-auth-idemp-01",
	}
	res1, err := engine.AuthorizeHold(ctx, authReq)
	if err != nil || res1.IdempotentReplay || res1.Record.State != StatePayPalAuthorized {
		t.Fatalf("first AuthorizeHold failed: res=%+v err=%v", res1, err)
	}
	res2, err := engine.AuthorizeHold(ctx, authReq)
	if err != nil || !res2.IdempotentReplay || res2.Record.PayPalAuthID != res1.Record.PayPalAuthID {
		t.Fatalf("duplicate AuthorizeHold should return cached idempotent replay: res=%+v err=%v", res2, err)
	}
	if got := provider.authCalls.Load(); got != 1 {
		t.Fatalf("expected exactly 1 underlying AuthorizeEscrowHold call, got %d", got)
	}

	// Reusing same PayPal-Request-Id for a different escrow must fail with ErrDuplicateRequestID
	conflictReq := authReq
	conflictReq.EscrowID = "escrow_2pc_other"
	if _, err := engine.AuthorizeHold(ctx, conflictReq); !errors.Is(err, ErrDuplicateRequestID) {
		t.Fatalf("expected ErrDuplicateRequestID on cross-escrow key reuse, got %v", err)
	}

	// 2. Step through SLA_SCHEDULED -> TRACKING_VERIFIED -> PAYPAL_CAPTURED
	if _, err := engine.AdvanceState("escrow_2pc_01", StateSLAScheduled); err != nil {
		t.Fatalf("AdvanceState to SLA_SCHEDULED failed: %v", err)
	}
	if _, err := engine.AdvanceState("escrow_2pc_01", StateTrackingVerified); err != nil {
		t.Fatalf("AdvanceState to TRACKING_VERIFIED failed: %v", err)
	}
	capRes, err := engine.CaptureHold(ctx, CaptureRequest{
		EscrowID:        "escrow_2pc_01",
		PayPalRequestID: "req-cap-idemp-01",
		TrackingNumber:  "FDX-774829104",
		Carrier:         "FEDEX",
	})
	if err != nil || capRes.Record.State != StatePayPalCaptured || capRes.Record.PayPalCaptureID == "" {
		t.Fatalf("CaptureHold failed: res=%+v err=%v", capRes, err)
	}

	// 3. Verify PAYPAL_CAPTURED -> PAYPAL_VOIDED is strictly rejected
	if _, err := engine.VoidHold(ctx, VoidRequest{
		EscrowID:        "escrow_2pc_01",
		PayPalRequestID: "req-void-after-cap",
		Reason:          "Attempt illegal void after capture",
	}); !errors.Is(err, ErrInvalidStateTransition) {
		t.Fatalf("expected ErrInvalidStateTransition on PAYPAL_CAPTURED -> PAYPAL_VOIDED, got %v", err)
	}
}

func TestConcurrentCaptureVsVoidAndHTTPRoutes(t *testing.T) {
	provider := &countingPayPalProvider{
		inner: paypal.NewSandboxService(paypalapimatic.NewSandboxClient("", ""), "WH-01"),
	}
	engine := NewEngine(provider, newMemoryIdempGate())
	ctx := context.Background()

	_, err := engine.AuthorizeHold(ctx, AuthorizeRequest{
		EscrowID:        "escrow_race_01",
		MandateID:       "mandate_race_01",
		AmountCents:     95000,
		CurrencyCode:    "USD",
		PayPalRequestID: "req-race-auth-01",
	})
	if err != nil {
		t.Fatalf("AuthorizeHold failed: %v", err)
	}

	var wg sync.WaitGroup
	var capErr, voidErr error
	wg.Add(2)
	go func() {
		defer wg.Done()
		_, capErr = engine.CaptureHold(ctx, CaptureRequest{EscrowID: "escrow_race_01", PayPalRequestID: "req-race-cap"})
	}()
	go func() {
		defer wg.Done()
		_, voidErr = engine.VoidHold(ctx, VoidRequest{EscrowID: "escrow_race_01", PayPalRequestID: "req-race-void", Reason: "SLA_BREACH"})
	}()
	wg.Wait()

	if (capErr == nil && voidErr == nil) || (capErr != nil && voidErr != nil) {
		t.Fatalf("expected exactly one of Capture or Void to win, got capErr=%v voidErr=%v", capErr, voidErr)
	}

	// Verify HTTP endpoints API-07 (/authorize), API-10 (/void), and illegal API-09 (/capture after void)
	mux := http.NewServeMux()
	engine.RegisterRoutes(mux)
	srv := httptest.NewServer(mux)
	defer srv.Close()

	authBody, _ := json.Marshal(AuthorizeRequest{MandateID: "m_http", AmountCents: 60000, CurrencyCode: "USD"})
	req, _ := http.NewRequest(http.MethodPost, srv.URL+"/api/v1/escrow/escrow_http_01/authorize", bytes.NewReader(authBody))
	req.Header.Set("PayPal-Request-Id", "http-auth-01")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("API-07 HTTP authorize failed: status=%v err=%v", resp.StatusCode, err)
	}
	resp.Body.Close()

	voidBody, _ := json.Marshal(VoidRequest{Reason: "CARRIER_SLA_TIMEOUT"})
	vReq, _ := http.NewRequest(http.MethodPost, srv.URL+"/api/v1/escrow/escrow_http_01/void", bytes.NewReader(voidBody))
	vReq.Header.Set("PayPal-Request-Id", "http-void-01")
	vResp, err := http.DefaultClient.Do(vReq)
	if err != nil || vResp.StatusCode != http.StatusOK {
		t.Fatalf("API-10 HTTP void failed: status=%v err=%v", vResp.StatusCode, err)
	}
	vResp.Body.Close()

	// Attempting API-09 capture on PAYPAL_VOIDED must return 409 Conflict
	cReq, _ := http.NewRequest(http.MethodPost, srv.URL+"/api/v1/escrow/escrow_http_01/capture", bytes.NewReader([]byte(`{}`)))
	cReq.Header.Set("PayPal-Request-Id", "http-cap-illegal")
	cResp, err := http.DefaultClient.Do(cReq)
	if err != nil || cResp.StatusCode != http.StatusConflict {
		t.Fatalf("expected 409 Conflict on PAYPAL_VOIDED -> PAYPAL_CAPTURED, got status=%v err=%v", cResp.StatusCode, err)
	}
	cResp.Body.Close()
}
