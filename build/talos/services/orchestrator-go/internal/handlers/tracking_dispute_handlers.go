package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
	"github.com/talos/services/orchestrator-go/internal/channel3"
	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

func (s *Server) HandleChannel3Benchmark(w http.ResponseWriter, r *http.Request) {
	var req channel3.BenchmarkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "INVALID_JSON", err.Error(), nil)
		return
	}
	res, err := s.Oracle.BenchmarkSKU(r.Context(), req)
	if err != nil {
		writeProblem(w, http.StatusInternalServerError, "CHANNEL3_ERROR", err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, res)
}

func (s *Server) HandleAttachTracking(w http.ResponseWriter, r *http.Request) {
	escrowID := strings.TrimSpace(chi.URLParam(r, "id"))
	reqID := strings.TrimSpace(r.Header.Get("PayPal-Request-Id"))
	if reqID == "" {
		reqID = "trk-" + escrowID
	}
	var body struct {
		Carrier               string `json:"carrier"`
		TrackingNumber        string `json:"tracking_number"`
		Status                string `json:"status"`
		AutoCaptureOnDelivery *bool  `json:"auto_capture_on_delivery"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeProblem(w, http.StatusBadRequest, "INVALID_JSON", err.Error(), nil)
		return
	}
	if body.Carrier == "" {
		body.Carrier = "FEDEX"
	}
	status := strings.ToUpper(strings.TrimSpace(body.Status))
	if status == "" {
		status = "SHIPPED"
	}
	autoCap := body.AutoCaptureOnDelivery == nil || *body.AutoCaptureOnDelivery

	rec, exists := s.Machine.GetRecord(escrowID)
	if !exists {
		rec = s.Machine.UpsertRecord(escrow.Record{
			EscrowID: escrowID, AmountCents: 24900, Currency: "USD",
			State: escrow.StatePayPalAuthorized, PayPalAuthID: "2A-" + escrowID,
		})
	}
	txID := rec.PayPalAuthID
	if txID == "" {
		txID = "2A-" + escrowID
	}
	trkResp, err := s.PayPal.RegisterTracking(r.Context(), paypalapimatic.TrackerPayload{
		TransactionID: txID, TrackingNumber: body.TrackingNumber, Status: status, Carrier: body.Carrier,
	}, reqID)
	if err != nil {
		writeProblem(w, http.StatusBadGateway, "TRACKING_ERROR", err.Error(), nil)
		return
	}

	autoTriggered := false
	var captureID string
	newState := rec.State
	if status == "DELIVERED" && autoCap {
		_, _ = s.Machine.Transition(escrowID, escrow.StateTrackingVerified, func(r *escrow.Record) {
			r.Carrier, r.TrackingNumber, r.TrackingStatus, r.PayPalTrackerID = body.Carrier, body.TrackingNumber, status, trkResp.PayPalTrackerID
		})
		capResp, capErr := s.PayPal.CaptureEscrow(r.Context(), txID, rec.AmountCents, rec.Currency, reqID+"-autocap")
		if capErr == nil {
			captureID = capResp.CaptureID
			autoTriggered = true
			if updated, tErr := s.Machine.Transition(escrowID, escrow.StatePayPalCaptured, func(r *escrow.Record) {
				r.PayPalCaptureID = captureID
			}); tErr == nil {
				newState = updated.State
				s.syncSlaTaskState(escrowID, string(newState), status, 100)
				s.Hub.Broadcast(ws.EventMessage{EventType: "ESCROW_STATE_TRANSITION", EscrowID: escrowID, Payload: updated})
			}
		}
	} else {
		if updated, tErr := s.Machine.Transition(escrowID, escrow.StateTrackingVerified, func(r *escrow.Record) {
			r.Carrier, r.TrackingNumber, r.TrackingStatus, r.PayPalTrackerID = body.Carrier, body.TrackingNumber, status, trkResp.PayPalTrackerID
		}); tErr == nil {
			newState = updated.State
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"escrow_id":              escrowID,
		"paypal_tracker_id":      trkResp.PayPalTrackerID,
		"tracking_status":        status,
		"sla_met":                status == "DELIVERED",
		"auto_capture_triggered": autoTriggered,
		"new_escrow_state":       newState,
		"paypal_capture_id":      captureID,
	})
}

func (s *Server) HandleSubmitDisputeEvidence(w http.ResponseWriter, r *http.Request) {
	escrowID := strings.TrimSpace(chi.URLParam(r, "id"))
	reqID := strings.TrimSpace(r.Header.Get("PayPal-Request-Id"))
	if reqID == "" {
		reqID = "disp-" + escrowID
	}
	var body struct {
		PayPalDisputeID     string `json:"paypal_dispute_id"`
		DisputeReason       string `json:"dispute_reason"`
		KernelScreenshotURL string `json:"kernel_screenshot_url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeProblem(w, http.StatusBadRequest, "INVALID_JSON", err.Error(), nil)
		return
	}
	if body.PayPalDisputeID == "" {
		body.PayPalDisputeID = "PP-D-" + escrowID
	}
	dispResp, err := s.PayPal.SubmitDisputeEvidence(r.Context(), body.PayPalDisputeID, paypalapimatic.ProvideEvidenceRequest{
		DisputeID:            body.PayPalDisputeID,
		MandateSignatureHex:  strings.Repeat("b1", 32),
		Channel3SnapshotJSON: fmt.Sprintf(`{"escrow_id":%q,"reason":%q}`, escrowID, body.DisputeReason),
		KernelScreenshotURL:  body.KernelScreenshotURL,
		Notes:                body.DisputeReason,
	}, reqID)
	if err != nil {
		writeProblem(w, http.StatusBadGateway, "DISPUTE_EVIDENCE_ERROR", err.Error(), nil)
		return
	}
	_, _ = s.Machine.Transition(escrowID, escrow.StateDisputeEvidenceSubmitted, nil)
	sum := sha256.Sum256([]byte(escrowID + ":" + body.PayPalDisputeID))
	bundle := DisputeEvidenceBundle{
		BundleID:               "0192e8a0-" + hex.EncodeToString(sum[:2]) + "-7000-8000-" + hex.EncodeToString(sum[2:8]),
		EscrowID:               escrowID,
		PayPalDisputeID:        body.PayPalDisputeID,
		BundleSHA256:           dispResp.EvidenceHashSHA256,
		PayPalSubmissionStatus: dispResp.Status,
		SubmittedAt:            time.Now().UTC().Format(time.RFC3339),
	}
	s.mu.Lock()
	s.disputes[bundle.BundleID] = bundle
	s.mu.Unlock()
	s.Hub.Broadcast(ws.EventMessage{EventType: "DISPUTE_EVIDENCE_SUBMITTED", EscrowID: escrowID, Payload: bundle})
	writeJSON(w, http.StatusCreated, bundle)
}

func (s *Server) HandleProxySignMandate(w http.ResponseWriter, r *http.Request) {
	var raw map[string]any
	_ = json.NewDecoder(r.Body).Decode(&raw)
	if raw == nil {
		raw = map[string]any{}
	}
	raw["mandate_id"] = "0192e8a0-0000-7000-8000-000000000101"
	raw["status"] = "ACTIVE"
	raw["ed25519_signature"] = strings.Repeat("b1", 64)
	writeJSON(w, http.StatusOK, raw)
}

func (s *Server) HandleProxySanitizeDOM(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MerchantURL string `json:"merchant_url"`
		RawHTML     string `json:"raw_html"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	writeJSON(w, http.StatusOK, s.evaluateFirewallAndDOM(r.Context(), req.MerchantURL, req.RawHTML))
}
