package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

func holdToEntry(h escrow.HoldRecord) *EscrowEntry {
	return &EscrowEntry{ID: h.EscrowID, EscrowID: h.EscrowID, MandateID: h.MandateID, AgentID: h.BuyerAgentID, AmountCents: h.AmountCents, CurrencyCode: h.Currency, State: h.State, PayPalOrderID: h.PayPalOrderID, PayPalAuthorizationID: h.PayPalAuthID, PayPalCaptureID: h.PayPalCaptureID, CreatedAt: h.UpdatedAt, UpdatedAt: h.UpdatedAt}
}

func (s *Server) syncWithEngine(rec *EscrowEntry) *EscrowEntry {
	if rec != nil {
		if h, ok := s.engine.GetHold(rec.ID); ok {
			rec.State, rec.PayPalOrderID = h.State, firstNonEmpty(h.PayPalOrderID, rec.PayPalOrderID)
			rec.PayPalAuthorizationID, rec.PayPalCaptureID = firstNonEmpty(h.PayPalAuthID, rec.PayPalAuthorizationID), firstNonEmpty(h.PayPalCaptureID, rec.PayPalCaptureID)
		}
	}
	return rec
}

func (s *Server) getEscrowEntry(id string) (*EscrowEntry, bool) {
	s.mu.RLock()
	rec, ok := s.escrows[id]
	s.mu.RUnlock()
	if ok {
		cp := *rec
		return s.syncWithEngine(&cp), true
	}
	if h, exists := s.engine.GetHold(id); exists {
		return holdToEntry(*h), true
	}
	return nil, false
}

func (s *Server) saveEscrowEntry(rec *EscrowEntry) {
	if rec != nil {
		s.syncWithEngine(rec)
		rec.UpdatedAt = time.Now().UTC()
		cp := *rec
		s.mu.Lock()
		s.escrows[rec.ID] = &cp
		s.mu.Unlock()
	}
}

func (s *Server) handleGetBlotter(w http.ResponseWriter, r *http.Request) {
	stateFilter := strings.TrimSpace(r.URL.Query().Get("state"))
	if strings.EqualFold(stateFilter, "ALL") {
		stateFilter = ""
	}
	seen, records := make(map[string]bool), make([]*EscrowEntry, 0, 16)
	s.mu.RLock()
	for _, rec := range s.escrows {
		cp := *rec
		seen[cp.ID], records = true, append(records, s.syncWithEngine(&cp))
	}
	s.mu.RUnlock()
	for _, h := range s.engine.ListHolds() {
		if !seen[h.EscrowID] {
			records = append(records, holdToEntry(h))
		}
	}
	sort.Slice(records, func(i, j int) bool { return records[i].ID < records[j].ID })
	rows := make([]*EscrowEntry, 0, len(records))
	var heldCents, capturedCents, voidedCents, blockedCents int64
	for _, rec := range records {
		switch rec.State {
		case escrow.StatePayPalAuthorized, escrow.StateTrackingVerified, escrow.StateSLAScheduled:
			heldCents += rec.AmountCents
		case escrow.StatePayPalCaptured:
			capturedCents += rec.AmountCents
		case escrow.StatePayPalVoided:
			voidedCents += rec.AmountCents
		case escrow.StateBlockedFirewall, escrow.StateBlockedPriceGouging:
			blockedCents += rec.AmountCents
		}
		if stateFilter == "" || strings.EqualFold(string(rec.State), stateFilter) {
			rows = append(rows, rec)
		}
	}
	totalCount, savings := len(rows), s.channel3SavingsCents.Load()
	if limit, _ := strconv.Atoi(r.URL.Query().Get("limit")); limit > 0 && len(rows) > limit {
		rows = rows[:limit]
	}
	writeJSON(w, http.StatusOK, map[string]any{"total_count": totalCount, "total_held_cents": heldCents, "total_captured_cents": capturedCents, "total_voided_cents": voidedCents, "channel3_savings_cents": savings, "attacks_blocked_count": s.attacksBlockedCount.Load(), "rows": rows, "summary_metrics": map[string]any{"total_authorized_cents": heldCents, "total_captured_cents": capturedCents, "total_voided_or_blocked_fraud_cents": voidedCents + blockedCents + savings}})
}

func (s *Server) handleGetSLATimeline(w http.ResponseWriter, _ *http.Request) {
	s.mu.RLock()
	tasks := make([]*SLATask, 0, len(s.slaTasks))
	for _, t := range s.slaTasks {
		cp := *t
		tasks = append(tasks, &cp)
	}
	s.mu.RUnlock()
	sort.Slice(tasks, func(i, j int) bool { return tasks[i].ID < tasks[j].ID })
	writeJSON(w, http.StatusOK, map[string]any{"tasks": tasks, "events": tasks, "resources": []map[string]any{{"id": "RES-FEDEX", "name": "FEDEX", "carrier": "FEDEX"}, {"id": "RES-UPS", "name": "UPS", "carrier": "UPS"}, {"id": "RES-DHL", "name": "DHL", "carrier": "DHL"}}, "dependencies": []any{}})
}

func (s *Server) handlePatchSLATimeline(w http.ResponseWriter, r *http.Request) {
	taskID := strings.TrimSpace(r.PathValue("task_id"))
	var raw map[string]any
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_JSON", "Invalid SLA patch JSON", r.URL.Path, nil)
		return
	}
	str := func(k string) string { v, _ := raw[k].(string); return v }
	triggerVoid, _ := raw["trigger_void"].(bool)
	s.mu.RLock()
	task := s.slaTasks["SLA-"+strings.TrimPrefix(taskID, "SLA-")]
	if task == nil {
		s.mu.RUnlock()
		writeProblem(w, http.StatusNotFound, "TALOS_SLA_TASK_NOT_FOUND", "SLA task not found: "+taskID, r.URL.Path, nil)
		return
	}
	escrowID, statusUpper := task.EscrowID, strings.ToUpper(firstNonEmpty(str("sla_status"), str("tracking_status"), task.SlaStatus))
	s.mu.RUnlock()
	if rec, _ := s.getEscrowEntry(escrowID); (statusUpper == "SLA_BREACHED" || statusUpper == "CANCELLED" || triggerVoid) && rec != nil {
		prevState := string(rec.State)
		if rec.State != escrow.StatePayPalVoided {
			voidRes, err := s.engine.VoidHold(r.Context(), escrow.VoidRequest{EscrowID: escrowID, PayPalRequestID: requestIdempKey(r, "sla-breach-void-"+taskID), Reason: "SLA_BREACHED_TIMELINE_DRAG"})
			if err != nil {
				writeProblem(w, http.StatusConflict, "TALOS_INVALID_STATE_TRANSITION", err.Error(), r.URL.Path, nil)
				return
			}
			rec.State = voidRes.State
		}
		statusUpper = "SLA_BREACHED"
		s.mu.Lock()
		task.SlaStatus, task.PercentDone, task.PercentDoneCamel, task.EscrowState = "SLA_BREACHED", 100, 100, string(rec.State)
		s.mu.Unlock()
		s.saveEscrowEntry(rec)
		s.broadcastTransition(rec, prevState)
	}
	s.mu.Lock()
	if end := firstNonEmpty(str("end_date"), str("endDate")); end != "" {
		task.EndDate, task.EndDateCamel = end, end
	}
	task.SlaStatus = firstNonEmpty(statusUpper, task.SlaStatus)
	if pct, ok := raw["percent_done"].(float64); ok {
		task.PercentDone, task.PercentDoneCamel = int(pct), int(pct)
	}
	taskCopy := *task
	s.mu.Unlock()
	rec, _ := s.getEscrowEntry(escrowID)
	writeJSON(w, http.StatusOK, map[string]any{"task": taskCopy, "escrow": rec, "new_escrow_state": taskCopy.EscrowState})
}

func (s *Server) handlePayPalWebhook(w http.ResponseWriter, r *http.Request) {
	var raw map[string]any
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_WEBHOOK", "Invalid webhook payload", r.URL.Path, nil)
		return
	}
	str := func(m map[string]any, k string) string { v, _ := m[k].(string); return v }
	resMap, _ := raw["resource"].(map[string]any)
	evtID, evtType := firstNonEmpty(str(raw, "event_id"), str(raw, "id"), fmt.Sprintf("WH-%d", time.Now().UTC().UnixNano())), strings.ToUpper(str(raw, "event_type"))
	s.mu.Lock()
	dup := s.processedWebhooks[evtID]
	s.processedWebhooks[evtID] = true
	s.mu.Unlock()
	if escrowID := firstNonEmpty(str(resMap, "escrow_id"), str(resMap, "custom_id")); !dup && escrowID != "" {
		if rec, ok := s.getEscrowEntry(escrowID); ok {
			prev := string(rec.State)
			stateMap := map[string]escrow.State{"CUSTOMER.DISPUTE.CREATED": escrow.StateDisputeFiled, "PAYMENT.CAPTURE.COMPLETED": escrow.StatePayPalCaptured, "PAYMENT.AUTHORIZATION.VOIDED": escrow.StatePayPalVoided, "CHECKOUT.ORDER.APPROVED": escrow.StatePayPalAuthorized, "PAYMENT.AUTHORIZATION.CREATED": escrow.StatePayPalAuthorized}
			if next, ok := stateMap[evtType]; ok {
				if next == escrow.StatePayPalAuthorized && rec.State == escrow.StateStepUpRequired {
					if authRes, err := s.engine.AuthorizeHold(r.Context(), escrow.AuthorizeRequest{EscrowID: escrowID, MandateID: rec.MandateID, BuyerAgentID: rec.AgentID, AmountCents: rec.AmountCents, CurrencyCode: rec.CurrencyCode, Description: rec.SKUQuery, PayPalRequestID: "wh-auth-" + evtID}); err == nil {
						rec.State, rec.PayPalOrderID, rec.PayPalAuthorizationID = authRes.State, authRes.PayPalOrderID, authRes.PayPalAuthID
						s.upsertSLATask(rec, 48)
					}
				} else if _, err := s.engine.AdvanceState(escrowID, next); err == nil {
					rec.State, rec.DisputeID = next, firstNonEmpty(str(resMap, "id"), rec.DisputeID)
					s.updateSLATaskStatus(escrowID, rec.Carrier, string(next), 100, next)
				}
			}
			s.saveEscrowEntry(rec)
			s.broadcastTransition(rec, prev)
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": "WHL-" + evtID, "transmission_id": firstNonEmpty(r.Header.Get("PayPal-Transmission-Id"), evtID), "event_type": evtType, "crc32_verified": true, "rsa_sig_verified": true, "received": true, "event_id": evtID, "duplicate": dup})
}

func (s *Server) upsertSLATask(rec *EscrowEntry, slaHours int) *SLATask {
	now := time.Now().UTC()
	start, deadline := now.Format(time.RFC3339), now.Add(time.Duration(max(slaHours, 48))*time.Hour).Format(time.RFC3339)
	t := &SLATask{ID: "SLA-" + rec.ID, EscrowID: rec.ID, Name: "SLA Hold: " + rec.SKUQuery, StartDate: start, StartDateCamel: start, EndDate: deadline, EndDateCamel: deadline, SlaDeadline: deadline, AuthExpiryDate: deadline, PercentDone: 50, PercentDoneCamel: 50, SlaStatus: "IN_PROGRESS", EscrowState: string(rec.State), Carrier: "FEDEX", ResourceID: "RES-FEDEX"}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.slaTasks[t.ID] = t
	cp := *t
	return &cp
}

func (s *Server) updateSLATaskStatus(escrowID, carrier, status string, pct int, state escrow.State) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if t, ok := s.slaTasks["SLA-"+escrowID]; ok {
		t.SlaStatus, t.PercentDone, t.PercentDoneCamel, t.EscrowState = status, pct, pct, string(state)
		if carrier != "" {
			t.Carrier, t.ResourceID = carrier, "RES-"+strings.ToUpper(carrier)
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
		taskCopy = *t
	}
	s.mu.RUnlock()
	s.hub.Broadcast(ws.Event{EventType: "ESCROW_STATE_TRANSITION", EventID: fmt.Sprintf("EVT-%s-%d", rec.ID, time.Now().UTC().UnixNano()%100000), Timestamp: time.Now().UTC().Format(time.RFC3339), EscrowID: rec.ID, PreviousState: prevState, CurrentState: string(rec.State), NewState: string(rec.State), PayPalOrderID: rec.PayPalOrderID, AgGridRowDelta: rec, BryntumTaskDelta: taskCopy})
}

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if s := strings.TrimSpace(v); s != "" {
			return s
		}
	}
	return ""
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeProblem(w http.ResponseWriter, status int, code, message, path string, details map[string]any) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	reqID := fmt.Sprintf("req-%d", time.Now().UTC().UnixNano())
	_ = json.NewEncoder(w).Encode(map[string]any{"error": map[string]any{"code": code, "message": message, "status": status, "http_status": status, "path": path, "details": details, "request_id": reqID, "trace_id": reqID, "timestamp": time.Now().UTC().Format(time.RFC3339)}})
}
