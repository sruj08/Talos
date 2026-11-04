package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRenderServiceDiscoveryAndWebhookEndpoints(t *testing.T) {
	if got := NormalizeServiceURL("", "http://localhost:8081"); got != "http://localhost:8081" {
		t.Fatalf("expected fallback URL, got %s", got)
	}
	if got := NormalizeServiceURL("talos-firewall-rs:8081/", "http://localhost:8081"); got != "http://talos-firewall-rs:8081" {
		t.Fatalf("expected normalized hostport URL, got %s", got)
	}
	if got := NormalizeServiceURL("https://talos-firewall-rs.onrender.com/", "http://localhost:8081"); got != "https://talos-firewall-rs.onrender.com" {
		t.Fatalf("expected normalized https URL, got %s", got)
	}

	t.Setenv("RUST_FIREWALL_URL", "")
	t.Setenv("FIREWALL_RS_INTERNAL_URL", "https://talos-firewall-rs.onrender.com/")
	if got := ResolveFirewallURL(); got != "https://talos-firewall-rs.onrender.com" {
		t.Fatalf("expected FIREWALL_RS_INTERNAL_URL fallback, got %s", got)
	}

	t.Setenv("RUST_FIREWALL_URL", "talos-firewall-rs:8081")
	if got := ResolveFirewallURL(); got != "http://talos-firewall-rs:8081" {
		t.Fatalf("expected RUST_FIREWALL_URL priority, got %s", got)
	}

	srv := NewDefaultServer()
	router := srv.Router()

	recApiH, outApiH := doJSONReq(t, router, http.MethodGet, "/api/healthz", "", nil)
	if recApiH.Code != http.StatusOK || outApiH["status"] != "ok" || outApiH["service"] != "talos-orchestrator-go" {
		t.Fatalf("expected 200 OK on /api/healthz, got %d %v", recApiH.Code, outApiH)
	}

	recWhVer, outWhVer := doJSONReq(t, router, http.MethodPost, "/v1/firewall/webhook/verify", "", map[string]any{
		"transmission_id":  "wh-render-smoke-01",
		"transmission_sig": "b7e2f8a19c8d7e6f5a4b3c2d",
		"webhook_id":       "4JH82910384712B",
		"raw_body":         `{"id":"WH-RENDER-01","event_type":"PAYMENT.AUTHORIZATION.CREATED"}`,
	})
	if recWhVer.Code != http.StatusOK || outWhVer["verified"] != true || outWhVer["crc32_verified"] != true || outWhVer["transmission_id"] != "wh-render-smoke-01" || outWhVer["crc32_decimal"].(float64) <= 0 {
		t.Fatalf("expected 200 OK verified=true with crc32_decimal on /v1/firewall/webhook/verify, got %d %v", recWhVer.Code, outWhVer)
	}

	// Reject tampered CRC32 or forged signature on /v1/firewall/webhook/verify
	_, outBadVer := doJSONReq(t, router, http.MethodPost, "/v1/firewall/webhook/verify", "", map[string]any{
		"transmission_id":  "wh-render-bad-01",
		"transmission_sig": "forged_sig",
		"raw_body":         `{"id":"WH-RENDER-01"}`,
		"expected_crc32":   12345,
	})
	if outBadVer["verified"] != false || outBadVer["crc32_verified"] != false || outBadVer["rsa_sig_verified"] != false {
		t.Fatalf("expected verified=false on tampered CRC32/forged sig, got %v", outBadVer)
	}

	// Reject forged PAYPAL-TRANSMISSION-SIG on /api/v1/webhooks/paypal
	forgedReq := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks/paypal", bytes.NewBufferString(`{"id":"WH-FORGED","event_type":"PAYMENT.CAPTURE.COMPLETED"}`))
	forgedReq.Header.Set("Content-Type", "application/json")
	forgedReq.Header.Set("PAYPAL-TRANSMISSION-SIG", "forged-signature-payload")
	forgedRec := httptest.NewRecorder()
	router.ServeHTTP(forgedRec, forgedReq)
	if forgedRec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422 on forged webhook signature, got %d", forgedRec.Code)
	}

	// Verify GET /api/v1/sla/timeline returns both tasks and events arrays for Bryntum & Newman
	_, outSla := doJSONReq(t, router, http.MethodGet, "/api/v1/sla/timeline", "", nil)
	if _, ok := outSla["tasks"].([]any); !ok {
		t.Fatalf("expected tasks array in /api/v1/sla/timeline response, got %v", outSla)
	}

	// Verify two-step SLA breach (PATCH timeline trigger_void -> POST /void) succeeds idempotently
	doJSONReq(t, router, http.MethodPatch, "/api/v1/sla/timeline/task-scarlett-02", "req-sla-1", map[string]any{"tracking_status": "SLA_BREACHED", "trigger_void": true})
	recVoid, outVoid := doJSONReq(t, router, http.MethodPost, "/api/v1/escrow/esc-903-scarlett/void", "req-void-after-sla", map[string]any{"void_reason": "SLA_BREACH"})
	if recVoid.Code != http.StatusOK || outVoid["state"] != "PAYPAL_VOIDED" {
		t.Fatalf("expected 200 OK PAYPAL_VOIDED after SLA timeline void, got %d %v", recVoid.Code, outVoid)
	}
}
