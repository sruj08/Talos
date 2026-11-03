package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

func (s *Server) getEscrowEntry(id string) (*EscrowEntry, bool) {
	s.mu.RLock()
	rec, ok := s.escrows[id]
	s.mu.RUnlock()
	if ok {
		cp := *rec
		return &cp, true
	}
	if hold, exists := s.engine.GetHold(id); exists {
		entry := &EscrowEntry{
			ID: hold.EscrowID, EscrowID: hold.EscrowID, MandateID: hold.MandateID,
			AgentID: hold.BuyerAgentID, AmountCents: hold.AmountCents, CurrencyCode: hold.Currency,
			State: hold.State, PayPalOrderID: hold.PayPalOrderID,
			PayPalAuthorizationID: hold.PayPalAuthID, PayPalCaptureID: hold.PayPalCaptureID,
			CreatedAt: hold.UpdatedAt, UpdatedAt: hold.UpdatedAt,
		}
		return entry, true
	}
	return nil, false
}

func (s *Server) saveEscrowEntry(rec *EscrowEntry) {
	if rec == nil {
		return
	}
	rec.UpdatedAt = time.Now().UTC()
	cp := *rec
	s.mu.Lock()
	s.escrows[rec.ID] = &cp
	s.mu.Unlock()
}

func (s *Server) handleGetBlotter(w http.ResponseWriter, r *http.Request) {
	stateFilter := strings.TrimSpace(r.URL.Query().Get("state"))
	s.mu.RLock()
	records := make([]*EscrowEntry, 0, len(s.escrows))
	for _, rec := range s.escrows {
		cp := *rec
		records = append(records, &cp)
	}
	s.mu.RUnlock()
	sort.Slice(records, func(i, j int) bool { return records[i].ID < records[j].ID })

	rows := make([]*EscrowEntry, 0, len(records))
	var heldCents, capturedCents, voidedCents int64
	for _, rec := range records {
		switch rec.State {
		case escrow.StatePayPalAuthorized, escrow.StateTrackingVerified, escrow.StateSLAScheduled:
			heldCents += rec.AmountCents
		case escrow.StatePayPalCaptured:
			capturedCents += rec.AmountCents
		case escrow.StatePayPalVoided:
			voidedCents += rec.AmountCents
		}
		if stateFilter == "" || strings.EqualFold(string(rec.State), stateFilter) {
			rows = append(rows, rec)
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"total_count": len(rows), "total_held_cents": heldCents, "total_captured_cents": capturedCents,
		"total_voided_cents": voidedCents, "channel3_savings_cents": s.channel3SavingsCents.Load(),
		"attacks_blocked_count": s.attacksBlockedCount.Load(), "rows": rows,
	})
}

func (s *Server) handleGetSLATimeline(w http.ResponseWriter, _ *http.Request) {
	s.mu.RLock()
	tasks := make([]*SLATask, 0, len(s.slaTasks))
	for _, t := range s.slaTasks {
		cp := *t
		tasks = append(tasks, &cp)
	}
	s.mu.RUnlock()
	writeJSON(w, http.StatusOK, map[string]any{"tasks": tasks, "dependencies": []any{}})
}

func (s *Server) handlePatchSLATimeline(w http.ResponseWriter, r *http.Request) {
	taskID := strings.TrimSpace(r.PathValue("task_id"))
	var req struct {
		EndDate     string `json:"end_date"`
		SlaStatus   string `json:"sla_status"`
		PercentDone *int   `json:"percent_done"`
		TriggerVoid bool   `json:"trigger_void"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_JSON", "Invalid SLA patch JSON", r.URL.Path, nil)
		return
	}

	s.mu.Lock()
	task := s.slaTasks[taskID]
	if task == nil {
		s.mu.Unlock()
		writeProblem(w, http.StatusNotFound, "TALOS_SLA_TASK_NOT_FOUND", "SLA task not found: "+taskID, r.URL.Path, nil)
		return
	}
	if req.EndDate != "" {
		task.EndDate = req.EndDate
	}
	if req.SlaStatus != "" {
		task.SlaStatus = strings.ToUpper(req.SlaStatus)
	}
	if req.PercentDone != nil {
		task.PercentDone = *req.PercentDone
	}
	escrowID, statusUpper := task.EscrowID, task.SlaStatus
	s.mu.Unlock()

	rec, _ := s.getEscrowEntry(escrowID)
	if (statusUpper == "SLA_BREACHED" || req.TriggerVoid) && rec != nil {
		s.mu.Lock()
		task.SlaStatus, task.PercentDone = "SLA_BREACHED", 100
		s.mu.Unlock()

		prevState := string(rec.State)
		if voidRes, err := s.engine.VoidHold(r.Context(), escrow.VoidRequest{
			EscrowID: escrowID, PayPalRequestID: "sla-breach-void-" + taskID, Reason: "SLA_BREACHED_TIMELINE_DRAG",
		}); err == nil {
			rec.State = voidRes.State
			s.saveEscrowEntry(rec)
			s.broadcastTransition(rec, prevState)
		}
	}

	s.mu.RLock()
	taskCopy := *task
	s.mu.RUnlock()
	writeJSON(w, http.StatusOK, map[string]any{"task": taskCopy, "escrow": rec})
}

func (s *Server) handlePayPalWebhook(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID        string `json:"id"`
		EventID   string `json:"event_id"`
		EventType string `json:"event_type"`
		Resource  struct {
			ID       string `json:"id"`
			EscrowID string `json:"escrow_id"`
			CustomID string `json:"custom_id"`
		} `json:"resource"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_WEBHOOK", "Invalid webhook payload", r.URL.Path, nil)
		return
	}
	evtID := req.EventID
	if evtID == "" {
		evtID = req.ID
	}
	if evtID == "" {
		evtID = fmt.Sprintf("WH-%d", time.Now().UTC().UnixNano())
	}
	s.mu.Lock()
	dup := s.processedWebhooks[evtID]
	s.processedWebhooks[evtID] = true
	s.mu.Unlock()

	escrowID := req.Resource.EscrowID
	if escrowID == "" {
		escrowID = req.Resource.CustomID
	}
	if !dup && escrowID != "" {
		if rec, ok := s.getEscrowEntry(escrowID); ok {
			prev := string(rec.State)
			switch strings.ToUpper(req.EventType) {
			case "CUSTOMER.DISPUTE.CREATED":
				_, _ = s.engine.AdvanceState(escrowID, escrow.StateDisputeFiled)
				rec.State, rec.DisputeID = escrow.StateDisputeFiled, req.Resource.ID
				s.saveEscrowEntry(rec)
				s.broadcastTransition(rec, prev)
			case "PAYMENT.CAPTURE.COMPLETED":
				rec.State = escrow.StatePayPalCaptured
				s.saveEscrowEntry(rec)
				s.broadcastTransition(rec, prev)
			}
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"received": true, "event_id": evtID, "duplicate": dup})
}

func (s *Server) upsertSLATask(rec *EscrowEntry, slaHours int) *SLATask {
	if slaHours <= 0 {
		slaHours = 48
	}
	now := time.Now().UTC()
	deadline := now.Add(time.Duration(slaHours) * time.Hour).Format(time.RFC3339)
	t := &SLATask{
		ID: "SLA-" + rec.ID, EscrowID: rec.ID, Name: "SLA Hold: " + rec.SKUQuery,
		StartDate: now.Format(time.RFC3339), EndDate: deadline, SlaDeadline: deadline,
		PercentDone: 50, SlaStatus: "IN_PROGRESS", Carrier: "FEDEX",
	}
	s.mu.Lock()
	s.slaTasks[t.ID] = t
	cp := *t
	s.mu.Unlock()
	return &cp
}

func (s *Server) updateSLATaskStatus(escrowID, carrier, status string, pct int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if t, ok := s.slaTasks["SLA-"+escrowID]; ok {
		t.SlaStatus, t.PercentDone = status, pct
		if carrier != "" {
			t.Carrier = carrier
		}
	}
}

func (s *Server) broadcastTransition(rec *EscrowEntry, prevState string) {
	if s.hub == nil || rec == nil {
		return
	}
	s.mu.RLock()
	var taskCopy any
	if t, ok := s.slaTasks["SLA-"+rec.ID]; ok {
		cp := *t
		taskCopy = cp
	}
	s.mu.RUnlock()
	s.hub.Broadcast(ws.Event{
		EventType: "ESCROW_STATE_TRANSITION", EventID: fmt.Sprintf("EVT-%s-%d", rec.ID, time.Now().UTC().UnixNano()%100000),
		Timestamp: time.Now().UTC().Format(time.RFC3339), EscrowID: rec.ID, PreviousState: prevState,
		CurrentState: string(rec.State), PayPalOrderID: rec.PayPalOrderID, AgGridRowDelta: rec, BryntumTaskDelta: taskCopy,
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeProblem(w http.ResponseWriter, status int, code, message, path string, details map[string]any) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{"error": map[string]any{
		"code": code, "message": message, "status": status, "path": path, "details": details,
		"request_id": fmt.Sprintf("req-%d", time.Now().UTC().UnixNano()), "timestamp": time.Now().UTC().Format(time.RFC3339),
	}})
}
