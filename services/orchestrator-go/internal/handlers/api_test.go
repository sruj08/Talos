package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/talos/services/orchestrator-go/internal/channel3"
	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/kernel"
	"github.com/talos/services/orchestrator-go/internal/paypal"
	"github.com/talos/services/orchestrator-go/internal/store"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

func setupTestMux() (*http.ServeMux, *ws.Hub) {
	st := store.NewStore("", "")
	ppSvc := paypal.NewSandboxService(nil, "")
	eng := escrow.NewEngine(ppSvc, st)
	ora := channel3.NewOracle()
	krn := kernel.NewInspector()
	hub := ws.NewHub()
	srv := NewServer(eng, ppSvc, ora, krn, hub)

	mux := http.NewServeMux()
	srv.RegisterRoutes(mux)
	return mux, hub
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
	mux, hub := setupTestMux()
	subCh, unsub := hub.Subscribe()
	defer unsub()

	// Flow 1: Poisoned Storefront -> 422 TALOS_DOM_PROMPT_INJECTION_BLOCKED
	rec1, body1 := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id":    "ESC-POISON-01",
		"merchant_url": "https://shadowgear.example/shure-sm7b-poisoned",
		"sku_query":    "Shure SM7B Vocal Dynamic Microphone",
		"amount_cents": 24900,
	})
	if rec1.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422 on poisoned storefront, got %d: %s", rec1.Code, rec1.Body.String())
	}
	errObj1, _ := body1["error"].(map[string]any)
	if errObj1["code"] != "TALOS_DOM_PROMPT_INJECTION_BLOCKED" {
		t.Fatalf("expected TALOS_DOM_PROMPT_INJECTION_BLOCKED, got %v", errObj1["code"])
	}

	// Flow 2A: $480 Shure SM7B Gouging without auto_reroute -> 422 TALOS_CHANNEL3_PRICE_GOUGING
	rec2a, body2a := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id":    "ESC-GOUGE-480",
		"merchant_url": "https://scalper-audio.example/shure-sm7b",
		"sku_query":    "Shure SM7B Vocal Dynamic Microphone",
		"amount_cents": 48000,
		"auto_reroute": false,
	})
	if rec2a.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422 on $480 gouging, got %d", rec2a.Code)
	}
	errObj2, _ := body2a["error"].(map[string]any)
	if errObj2["code"] != "TALOS_CHANNEL3_PRICE_GOUGING" {
		t.Fatalf("expected TALOS_CHANNEL3_PRICE_GOUGING, got %v", errObj2["code"])
	}

	// Flow 2B: $480 Shure SM7B with auto_reroute: true -> 201 Created at $249.00 (24900 cents)
	rec2b, body2b := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id":    "ESC-GOLD-249",
		"merchant_url": "https://scalper-audio.example/shure-sm7b",
		"sku_query":    "Shure SM7B Vocal Dynamic Microphone",
		"amount_cents": 48000,
		"auto_reroute": true,
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
		"carrier":                  "FEDEX",
		"tracking_number":          "779832145900",
		"status":                   "DELIVERED",
		"auto_capture_on_delivery": true,
	})
	if recTrk.Code != http.StatusOK || bodyTrk["state"] != "PAYPAL_CAPTURED" || bodyTrk["paypal_capture_id"] == "" {
		t.Fatalf("expected auto-capture to PAYPAL_CAPTURED, got %+v", bodyTrk)
	}

	// Flow 3: Authorize second escrow -> SLA Breach via PATCH /api/v1/sla/timeline/{task_id} -> PAYPAL_VOIDED
	rec3, _ := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id":    "ESC-SLA-301",
		"merchant_url": "https://verified-audio.trychannel3.com/sku/rode-podmic-usb",
		"sku_query":    "Rode PodMic USB",
		"amount_cents": 19500,
	})
	if rec3.Code != http.StatusCreated {
		t.Fatalf("expected 201 for ESC-SLA-301, got %d", rec3.Code)
	}

	recSLA, bodySLA := doJSON(t, mux, http.MethodPatch, "/api/v1/sla/timeline/SLA-ESC-SLA-301", map[string]any{
		"sla_status":   "SLA_BREACHED",
		"trigger_void": true,
	})
	if recSLA.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on SLA patch, got %d: %s", recSLA.Code, recSLA.Body.String())
	}
	escSLA, _ := bodySLA["escrow"].(map[string]any)
	if escSLA["state"] != "PAYPAL_VOIDED" {
		t.Fatalf("expected SLA breach to auto-void escrow to PAYPAL_VOIDED, got %+v", escSLA)
	}

	// Flow 4: Webhook CUSTOMER.DISPUTE.CREATED (API-14) + Submit Dispute Evidence (API-11)
	recWH, bodyWH := doJSON(t, mux, http.MethodPost, "/api/v1/webhooks/paypal", map[string]any{
		"event_id":   "WH-EVT-901",
		"event_type": "CUSTOMER.DISPUTE.CREATED",
		"resource":   map[string]any{"id": "PP-D-90210", "escrow_id": "ESC-SLA-301"},
	})
	if recWH.Code != http.StatusOK || bodyWH["duplicate"] != false {
		t.Fatalf("expected webhook 200 OK non-duplicate, got %+v", bodyWH)
	}

	recDsp, bodyDsp := doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-SLA-301/dispute-evidence", map[string]any{
		"paypal_dispute_id":     "PP-D-90210",
		"dispute_reason":        "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED",
		"kernel_screenshot_url": "https://cdn.onkernel.com/talos-forensics/ESC-SLA-301.png",
	})
	if recDsp.Code != http.StatusCreated || bodyDsp["state"] != "DISPUTE_EVIDENCE_SUBMITTED" || len(bodyDsp["bundle_sha256"].(string)) != 64 {
		t.Fatalf("unexpected dispute evidence response: %+v", bodyDsp)
	}

	// Step-up approval check ($450 > $300 default max_amount_cents) -> 202 Accepted
	recStep, bodyStep := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id":        "ESC-STEP-450",
		"merchant_url":     "https://verified-audio.trychannel3.com/sku/shure-sm7b",
		"sku_query":        "Shure SM7B",
		"amount_cents":     45000,
		"max_amount_cents": 30000,
		"max_spread_bps":   9999,
	})
	if recStep.Code != http.StatusAccepted || bodyStep["step_up_required"] != true {
		t.Fatalf("expected 202 Accepted step_up_required, got %d: %+v", recStep.Code, bodyStep)
	}

	// Verify Blotter KPIs (API-12), Channel3 Direct Endpoint (API-06), SLA Timeline GET (API-13), and WS Hub (API-15)
	recBlot, bodyBlot := doJSON(t, mux, http.MethodGet, "/api/v1/escrow/blotter", nil)
	if recBlot.Code != http.StatusOK || int64(bodyBlot["total_captured_cents"].(float64)) != 24900 {
		t.Fatalf("unexpected blotter KPIs: %+v", bodyBlot)
	}
	recCh3, bodyCh3 := doJSON(t, mux, http.MethodPost, "/api/v1/channel3/benchmark", map[string]any{
		"sku_query": "Shure SM7B", "merchant_ask_cents": 48000,
	})
	if recCh3.Code != http.StatusOK || int64(bodyCh3["spread_bps"].(float64)) != 9277 {
		t.Fatalf("unexpected channel3 endpoint response: %+v", bodyCh3)
	}
	if recTL, _ := doJSON(t, mux, http.MethodGet, "/api/v1/sla/timeline", nil); recTL.Code != http.StatusOK {
		t.Fatalf("expected 200 OK from GET /api/v1/sla/timeline, got %d", recTL.Code)
	}

	select {
	case evt := <-subCh:
		if evt.EventType != "ESCROW_STATE_TRANSITION" {
			t.Fatalf("expected ESCROW_STATE_TRANSITION event, got %+v", evt)
		}
	default:
		t.Fatalf("expected WebSocket hub events to be published")
	}
}

func TestNegativeAndIllegalStateGuards(t *testing.T) {
	mux, _ := setupTestMux()

	// 1. Missing required checkout fields -> 400
	if rec, _ := doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{"sku_query": "SM7B"}); rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on missing checkout fields, got %d", rec.Code)
	}
	// 2. Non-existent escrow tracking -> 404
	if rec, _ := doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-MISSING/tracking", map[string]any{"tracking_number": "123"}); rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on unknown escrow tracking, got %d", rec.Code)
	}
	// 3. Non-existent SLA task -> 404
	if rec, _ := doJSON(t, mux, http.MethodPatch, "/api/v1/sla/timeline/SLA-MISSING", map[string]any{"sla_status": "SLA_BREACHED"}); rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on unknown SLA task, got %d", rec.Code)
	}
	// 4. Create blocked escrow -> verify tracking & dispute evidence reject with 409 Conflict
	_, _ = doJSON(t, mux, http.MethodPost, "/api/v1/checkout/evaluate", map[string]any{
		"escrow_id": "ESC-BLK-409", "merchant_url": "https://shadowgear.example/poisoned", "sku_query": "Shure SM7B", "amount_cents": 24900,
	})
	if rec, _ := doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-BLK-409/tracking", map[string]any{"tracking_number": "999"}); rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 Conflict attaching tracking to blocked escrow, got %d", rec.Code)
	}
	if rec, _ := doJSON(t, mux, http.MethodPost, "/api/v1/escrow/ESC-BLK-409/dispute-evidence", map[string]any{"paypal_dispute_id": "PP-D-1"}); rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 Conflict submitting dispute evidence on blocked escrow, got %d", rec.Code)
	}
}
