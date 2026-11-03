package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/talos/services/orchestrator-go/internal/channel3"
	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/kernel"
	"github.com/talos/services/orchestrator-go/internal/paypal"
	"github.com/talos/services/orchestrator-go/internal/store"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

func setupTestServer() (*http.ServeMux, *ws.Hub, *Server) {
	st := store.NewStore("", "")
	ppSvc := paypal.NewSandboxService(nil, "")
	eng := escrow.NewEngine(ppSvc, st)
	ora := channel3.NewOracle()
	krn := kernel.NewInspector()
	hub := ws.NewHub()
	srv := NewServer(eng, ppSvc, ora, krn, hub)
	mux := http.NewServeMux()
	srv.RegisterRoutes(mux)
	return mux, hub, srv
}

func doJSON(t *testing.T, mux *http.ServeMux, method, path string, body any) (*httptest.ResponseRecorder, map[string]any) {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("failed encoding request: %v", err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	var out map[string]any
	_ = json.Unmarshal(rec.Body.Bytes(), &out)
	return rec, out
}

func TestGoldenFlows_FirewallBlock_Channel3Reroute_TrackingAutoCapture_SLAVoid_AndDisputes(t *testing.T) {
	mux, hub, _ := setupTestServer()
	subCh, unsub := hub.Subscribe()
	defer unsub()

	// Flow 1: Poisoned Storefront -> 422 TALOS_DOM_PROMPT_INJECTION_BLOCKED
	rec1, body1 := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id": "ESC-POISON-01", "merchant_url": "https://shadowgear.example/shure-sm7b-poisoned",
		"sku_query": "Shure SM7B Vocal Dynamic Microphone", "amount_cents": 24900,
	})
	if rec1.Code != http.StatusUnprocessableEntity || body1["error"].(map[string]any)["code"] != "TALOS_DOM_PROMPT_INJECTION_BLOCKED" {
		t.Fatalf("expected 422 TALOS_DOM_PROMPT_INJECTION_BLOCKED, got %d: %s", rec1.Code, rec1.Body.String())
	}

	// Flow 2A: $480 Shure SM7B Gouging without auto_reroute -> 422 TALOS_CHANNEL3_PRICE_GOUGING
	rec2a, body2a := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id": "ESC-GOUGE-480", "merchant_url": "https://scalper-audio.example/shure-sm7b",
		"sku_query": "Shure SM7B Vocal Dynamic Microphone", "amount_cents": 48000, "auto_reroute": false,
	})
	if rec2a.Code != http.StatusUnprocessableEntity || body2a["error"].(map[string]any)["code"] != "TALOS_CHANNEL3_PRICE_GOUGING" {
		t.Fatalf("expected 422 TALOS_CHANNEL3_PRICE_GOUGING, got %d", rec2a.Code)
	}

	// Flow 2B: $480 Shure SM7B with auto_reroute: true -> 201 Created at $249.00 (24900 cents)
	rec2b, body2b := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id": "ESC-GOLD-249", "merchant_url": "https://scalper-audio.example/shure-sm7b",
		"product_query": "Shure SM7B Vocal Dynamic Microphone", "quoted_price_cents": 48000, "auto_reroute": true,
	})
	if rec2b.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created on auto-rerouted checkout, got %d: %s", rec2b.Code, rec2b.Body.String())
	}
	esc2b, _ := body2b["escrow"].(map[string]any)
	if int64(esc2b["amount_cents"].(float64)) != 24900 || esc2b["state"] != "PAYPAL_AUTHORIZED" {
		t.Fatalf("expected rerouted 24900 cents PAYPAL_AUTHORIZED, got %+v", esc2b)
	}

	// Flow 2C: Attach FEDEX DELIVERED Tracking (API-08) -> Auto-triggers PayPal CAPTURE
	recTrk, bodyTrk := doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-GOLD-249/tracking", map[string]any{
		"carrier": "FEDEX", "tracking_number": "779832145900", "status": "DELIVERED", "auto_capture_on_delivery": true,
	})
	if recTrk.Code != http.StatusOK || bodyTrk["state"] != "PAYPAL_CAPTURED" || bodyTrk["escrow_state"] != "PAYPAL_CAPTURED" || bodyTrk["auto_captured"] != true {
		t.Fatalf("expected auto-capture to PAYPAL_CAPTURED, got %+v", bodyTrk)
	}

	// Flow 3: Authorize second escrow -> SLA Breach via PATCH /api/v1/sla/timeline/{task_id} -> PAYPAL_VOIDED
	rec3, _ := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id": "ESC-SLA-301", "merchant_url": "https://verified-audio.trychannel3.com/sku/rode-podmic-usb",
		"sku_query": "Rode PodMic USB", "amount_cents": 19500,
	})
	if rec3.Code != http.StatusCreated {
		t.Fatalf("expected 201 for ESC-SLA-301, got %d", rec3.Code)
	}
	recSLA, bodySLA := doJSON(t, mux, http.MethodPatch, "/api/v1/sla/timeline/SLA-ESC-SLA-301", map[string]any{
		"endDate": "2026-12-31T00:00:00Z", "tracking_status": "SLA_BREACHED", "trigger_void": true,
	})
	if recSLA.Code != http.StatusOK || bodySLA["new_escrow_state"] != "PAYPAL_VOIDED" {
		t.Fatalf("expected SLA breach to auto-void escrow to PAYPAL_VOIDED, got %+v", bodySLA)
	}

	// Flow 4: Webhook CUSTOMER.DISPUTE.CREATED (API-14) + Submit Dispute Evidence (API-11)
	recWH, bodyWH := doJSON(t, mux, http.MethodPost, "/api/v1/webhooks/paypal", map[string]any{
		"event_id": "WH-EVT-901", "event_type": "CUSTOMER.DISPUTE.CREATED",
		"resource": map[string]any{"id": "PP-D-90210", "escrow_id": "ESC-SLA-301"},
	})
	if recWH.Code != http.StatusOK || bodyWH["duplicate"] != false {
		t.Fatalf("expected webhook 200 OK non-duplicate, got %+v", bodyWH)
	}
	recDsp, bodyDsp := doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-SLA-301/dispute-evidence", map[string]any{
		"paypal_dispute_id": "PP-D-90210", "dispute_reason": "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED",
		"kernel_screenshot_url": "https://cdn.onkernel.com/talos-forensics/ESC-SLA-301.png",
	})
	if recDsp.Code != http.StatusCreated || bodyDsp["state"] != "DISPUTE_EVIDENCE_SUBMITTED" || len(bodyDsp["bundle_sha256"].(string)) != 64 {
		t.Fatalf("unexpected dispute evidence response: %+v", bodyDsp)
	}

	// Step-up approval check ($450 > $300 max_amount_cents) -> 202 Accepted, then CHECKOUT.ORDER.APPROVED webhook -> PAYPAL_AUTHORIZED
	recStep, bodyStep := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id": "ESC-STEP-450", "merchant_url": "https://verified-audio.trychannel3.com/sku/shure-sm7b",
		"sku_query": "Shure SM7B", "amount_cents": 45000, "max_amount_cents": 30000, "max_spread_bps": 9999,
	})
	if recStep.Code != http.StatusAccepted || bodyStep["step_up_required"] != true {
		t.Fatalf("expected 202 Accepted step_up_required, got %d: %+v", recStep.Code, bodyStep)
	}
	recApproveWH, bodyApproveWH := doJSON(t, mux, http.MethodPost, "/api/v1/webhooks/paypal", map[string]any{
		"event_id": "WH-EVT-902", "event_type": "CHECKOUT.ORDER.APPROVED",
		"resource": map[string]any{"custom_id": "ESC-STEP-450"},
	})
	if recApproveWH.Code != http.StatusOK || bodyApproveWH["crc32_verified"] != true || bodyApproveWH["rsa_sig_verified"] != true {
		t.Fatalf("expected CHECKOUT.ORDER.APPROVED webhook 200 OK with verification flags, got %+v", bodyApproveWH)
	}

	// Direct API-07 hold must appear in GET /api/v1/escrow/blotter (API-12)
	if recAuth07, _ := doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-API07/authorize", map[string]any{"mandate_id": "MND-07", "buyer_agent_id": "AG-07", "amount_cents": 12000, "paypal_request_id": "pp-req-07"}); recAuth07.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created from API-07 authorize, got %d", recAuth07.Code)
	}
	recBlot, bodyBlot := doJSON(t, mux, http.MethodGet, "/api/v1/escrow/blotter?state=ALL&limit=1", nil)
	rowsBlot, _ := bodyBlot["rows"].([]any)
	metrics, _ := bodyBlot["summary_metrics"].(map[string]any)
	if recBlot.Code != http.StatusOK || int(bodyBlot["total_count"].(float64)) < 4 || int64(bodyBlot["total_held_cents"].(float64)) < 57000 || len(rowsBlot) != 1 || metrics == nil {
		t.Fatalf("unexpected blotter state=ALL&limit=1 response: %+v", bodyBlot)
	}
	recCh3, bodyCh3 := doJSON(t, mux, http.MethodPost, "/api/v1/channel3/benchmark", map[string]any{"product_query": "Shure SM7B", "quoted_price_cents": 48000})
	if recCh3.Code != http.StatusOK || int64(bodyCh3["spread_bps"].(float64)) != 9277 {
		t.Fatalf("unexpected channel3 endpoint response: %+v", bodyCh3)
	}
	recTL, bodyTL := doJSON(t, mux, http.MethodGet, "/api/v1/sla/timeline", nil)
	tasksTL, _ := bodyTL["tasks"].([]any)
	if recTL.Code != http.StatusOK || len(tasksTL) == 0 || tasksTL[0].(map[string]any)["escrowState"] != "PAYPAL_CAPTURED" {
		t.Fatalf("expected SLA-ESC-GOLD-249 escrowState=PAYPAL_CAPTURED in GET /api/v1/sla/timeline, got %+v", bodyTL)
	}
	if recConflict, _ := doJSON(t, mux, http.MethodPatch, "/api/v1/sla/timeline/SLA-ESC-GOLD-249", map[string]any{"sla_status": "SLA_BREACHED", "trigger_void": true}); recConflict.Code != http.StatusConflict {
		t.Fatalf("expected 409 Conflict when voiding already-captured escrow via SLA patch, got %d", recConflict.Code)
	}

	select {
	case evt := <-subCh:
		if evt.EventType != "ESCROW_STATE_TRANSITION" || evt.NewState == "" {
			t.Fatalf("expected ESCROW_STATE_TRANSITION event with new_state, got %+v", evt)
		}
	default:
		t.Fatalf("expected WebSocket hub events to be published")
	}
}

func TestNegativeGuards_LiveFirewall_AndConcurrentConvergence(t *testing.T) {
	fwHit := false
	fwSrv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v1/firewall/sanitize-dom" {
			fwHit = true
			_ = json.NewEncoder(w).Encode(map[string]any{
				"scan_id": "SCAN-LIVE-1", "action": "SANITIZED", "injection_detected": false,
				"risk_score": 0.0, "sanitized_html": "<main>Shure SM7B</main>", "raw_dom_hash": "abc", "sanitized_dom_hash": "def",
			})
			return
		}
		http.NotFound(w, r)
	}))
	defer fwSrv.Close()
	t.Setenv("FIREWALL_URL", fwSrv.URL)

	mux, _, srv := setupTestServer()
	if rec, _ := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{"sku_query": "SM7B"}); rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on missing checkout fields, got %d", rec.Code)
	}
	if rec, body := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{"merchant_url": "https://verified-audio.trychannel3.com/sku/sm7b", "sku_query": "SM7B", "amount_cents": 24900, "ed25519_signature": "tampered_sig", "category": "Audio", "merchant_paypal_email": "m@example.com"}); rec.Code != http.StatusUnprocessableEntity || body["error"].(map[string]any)["code"] != "TALOS_MANDATE_SIGNATURE_INVALID" {
		t.Fatalf("expected 422 TALOS_MANDATE_SIGNATURE_INVALID on tampered ed25519_signature, got %d: %+v", rec.Code, body)
	}
	if rec, body := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{"merchant_url": "ftp://bad.example/item", "sku_query": "SM7B", "amount_cents": 24900}); rec.Code != http.StatusBadRequest || body["error"].(map[string]any)["code"] != "TALOS_EVALUATION_FAILED" {
		t.Fatalf("expected 400 TALOS_EVALUATION_FAILED on invalid merchant_url in errgroup, got %d: %+v", rec.Code, body)
	}
	if rec, _ := doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-MISSING/tracking", map[string]any{"tracking_number": "123"}); rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on unknown escrow tracking, got %d", rec.Code)
	}
	if rec, _ := doJSON(t, mux, http.MethodPatch, "/api/v1/sla/timeline/SLA-MISSING", map[string]any{"sla_status": "SLA_BREACHED"}); rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on unknown SLA task patch, got %d", rec.Code)
	}

	bodyBytes, _ := json.Marshal(map[string]any{"escrow_id": "ESC-RACE-1", "merchant_url": "https://verified-audio.trychannel3.com/sku/rode-podmic-usb", "sku_query": "Rode PodMic USB", "amount_cents": 19500})
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/checkout/evaluate", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("PayPal-Request-Id", "pp-idemp-race-1")
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, req)
		if rec.Code != http.StatusCreated {
			t.Fatalf("expected 201 on checkout evaluate (iter %d), got %d", i, rec.Code)
		}
	}
	if !fwHit {
		t.Fatalf("expected live firewall /v1/firewall/sanitize-dom endpoint to be called")
	}

	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		_, _ = doJSON(t, mux, http.MethodPatch, "/api/v1/sla/timeline/SLA-ESC-RACE-1", map[string]any{"sla_status": "SLA_BREACHED", "trigger_void": true})
	}()
	go func() {
		defer wg.Done()
		_, _ = doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-RACE-1/tracking", map[string]any{"carrier": "FEDEX", "tracking_number": "777", "status": "DELIVERED"})
	}()
	wg.Wait()

	recEntry, _ := srv.getEscrowEntry("ESC-RACE-1")
	holdEntry, _ := srv.engine.GetHold("ESC-RACE-1")
	if recEntry.State != holdEntry.State || (recEntry.State != escrow.StatePayPalCaptured && recEntry.State != escrow.StatePayPalVoided) {
		t.Fatalf("expected Server.escrows (%s) and Engine (%s) to converge to same terminal state", recEntry.State, holdEntry.State)
	}
}
