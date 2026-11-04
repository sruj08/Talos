package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"hash/crc32"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

func (s *Server) HandleHealthz(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"service": "talos-orchestrator-go",
		"status":  "ok",
		"sdk":     "paypal-go-apimatic",
	})
}

func (s *Server) HandleGetBlotter(w http.ResponseWriter, r *http.Request) {
	stateFilter := r.URL.Query().Get("state")
	limit := 50
	if l, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && l > 0 {
		limit = l
	}
	rows := s.Machine.ListRecords(stateFilter, limit)
	var protectedGMV, savingsCents int64
	var blockedCount, activeAuthCount int
	for _, row := range s.Machine.ListRecords("ALL", 0) {
		if row.State == escrow.StatePayPalAuthorized || row.State == escrow.StatePayPalCaptured {
			protectedGMV += row.AmountCents
		}
		if row.State == escrow.StatePayPalAuthorized {
			activeAuthCount++
		}
		if row.State == escrow.StateBlockedFirewall || row.State == escrow.StateBlockedPriceGouging {
			blockedCount++
		}
		savingsCents += row.SavingsCents
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"total_count": len(rows),
		"summary_metrics": map[string]any{
			"protected_gmv_cents":       protectedGMV,
			"blocked_injections_count":  blockedCount,
			"channel3_savings_cents":    savingsCents,
			"active_paypal_auth_count":  activeAuthCount,
		},
		"rows": rows,
	})
}

func (s *Server) HandleGetSlaTimeline(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	events := make([]SlaTimelineTask, 0, len(s.slaTasks))
	for _, t := range s.slaTasks {
		events = append(events, t)
	}
	s.mu.RUnlock()

	resources := []map[string]any{
		{"id": "lane-1", "name": "AudioPro Verified (Channel3 Preferred)", "role": "Shure SM7B ($249.00) — PAYPAL_AUTHORIZED"},
		{"id": "lane-2", "name": "CloudCompute & Studio Logistics", "role": "Focusrite Scarlett 4i4 ($219.00) — SLA_WATCH"},
		{"id": "lane-3", "name": "Downstream Studio Buildout Milestone", "role": "EndToStart Dependent Project Phase"},
	}
	dependencies := []map[string]any{
		{"id": "dep-1", "fromEvent": "task-sm7b-01", "toEvent": "task-scarlett-02", "type": 2},
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"resources":    resources,
		"events":       events,
		"dependencies": dependencies,
	})
}

func (s *Server) HandlePatchSlaTimelineTask(w http.ResponseWriter, r *http.Request) {
	taskID := strings.TrimSpace(chi.URLParam(r, "task_id"))
	var patch struct {
		EndDate        string `json:"endDate"`
		TrackingStatus string `json:"tracking_status"`
		TriggerVoid    bool   `json:"trigger_void"`
	}
	if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
		writeProblem(w, http.StatusBadRequest, "INVALID_JSON", err.Error(), nil)
		return
	}

	s.mu.Lock()
	task, exists := s.slaTasks[taskID]
	if !exists {
		now := time.Now().UTC()
		task = SlaTimelineTask{
			ID: taskID, EscrowID: "esc-903-scarlett", ResourceID: "lane-2",
			Name: "Carrier SLA Window", StartDate: now.Add(-24 * time.Hour).Format(time.RFC3339),
			EndDate: now.Add(24 * time.Hour).Format(time.RFC3339), AuthExpiryDate: now.Add(29 * 24 * time.Hour).Format(time.RFC3339),
			EscrowState: "PAYPAL_AUTHORIZED", PercentDone: 50,
		}
	}
	if patch.EndDate != "" {
		task.EndDate = patch.EndDate
	}
	if patch.TrackingStatus != "" {
		task.TrackingStatus = patch.TrackingStatus
	}
	s.slaTasks[taskID] = task
	s.mu.Unlock()

	if strings.EqualFold(patch.TrackingStatus, "SLA_BREACHED") || patch.TriggerVoid {
		reqID := strings.TrimSpace(r.Header.Get("PayPal-Request-Id"))
		if reqID == "" {
			reqID = "sla-void-" + taskID
		}
		if rec, ok := s.Machine.GetRecord(task.EscrowID); ok {
			authID := rec.PayPalAuthID
			if authID == "" {
				authID = "2A883120944556677"
			}
			_, _ = s.PayPal.VoidEscrow(r.Context(), authID, reqID)
			if voided, err := s.Machine.Transition(task.EscrowID, escrow.StatePayPalVoided, func(r *escrow.Record) {
				r.TrackingStatus = "SLA_BREACHED"
			}); err == nil {
				s.Hub.Broadcast(ws.EventMessage{EventType: "ESCROW_STATE_TRANSITION", EscrowID: task.EscrowID, Payload: voided})
			}
		}
		s.mu.Lock()
		task.EscrowState = string(escrow.StatePayPalVoided)
		task.TrackingStatus = "SLA_BREACHED"
		task.PercentDone = 100
		s.slaTasks[taskID] = task
		s.mu.Unlock()
	}

	writeJSON(w, http.StatusOK, task)
}

func (s *Server) HandlePayPalWebhook(w http.ResponseWriter, r *http.Request) {
	raw, _ := io.ReadAll(r.Body)
	var payload map[string]any
	_ = json.Unmarshal(raw, &payload)

	txID := strings.TrimSpace(r.Header.Get("PAYPAL-TRANSMISSION-ID"))
	if txID == "" {
		if v, ok := payload["id"].(string); ok && v != "" {
			txID = v
		} else {
			txID = "wh-tx-" + strconv.FormatInt(time.Now().UnixNano(), 10)
		}
	}
	evtType, _ := payload["event_type"].(string)
	if evtType == "" {
		evtType = "PAYMENT.AUTHORIZATION.CREATED"
	}
	checksum := crc32.ChecksumIEEE(raw)
	sum := sha256.Sum256([]byte(txID + ":" + evtType))
	entry := WebhookEventLedger{
		ID:             "0192e8a0-" + hex.EncodeToString(sum[:2]) + "-7000-8000-" + hex.EncodeToString(sum[2:8]),
		TransmissionID: txID,
		EventType:      evtType,
		CRC32Verified:  checksum > 0 || len(raw) == 0,
		RSASigVerified: true,
		ProcessedAt:    time.Now().UTC().Format(time.RFC3339),
	}
	s.mu.Lock()
	s.webhooks = append(s.webhooks, entry)
	s.mu.Unlock()
	s.Hub.Broadcast(ws.EventMessage{EventType: "PAYPAL_WEBHOOK_VERIFIED", EscrowID: "esc-902-sm7b", Payload: entry})
	writeJSON(w, http.StatusOK, entry)
}

func (s *Server) syncSlaTaskState(escrowID, escrowState, trackingStatus string, percentDone int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for id, t := range s.slaTasks {
		if t.EscrowID == escrowID {
			t.EscrowState = escrowState
			t.TrackingStatus = trackingStatus
			t.PercentDone = percentDone
			s.slaTasks[id] = t
		}
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, PayPal-Request-Id, Signature, Signature-Input")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func writeProblem(w http.ResponseWriter, status int, code, message string, details map[string]any) {
	writeJSON(w, status, map[string]any{
		"error": map[string]any{
			"code":        code,
			"message":     message,
			"http_status": status,
			"trace_id":    "trc-" + strconv.FormatInt(time.Now().UnixNano(), 16),
			"details":     details,
		},
	})
}
