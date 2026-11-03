package escrow

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/talos/services/orchestrator-go/internal/paypal"
)

// AuthorizeHold executes Phase 1 of the 2PC Escrow State Machine
// (INITIATED -> MANDATE_VERIFIED -> CHANNEL3_BENCHMARKED -> PAYPAL_AUTHORIZED).
func (e *Engine) AuthorizeHold(ctx context.Context, req AuthorizeRequest) (*TransitionResult, error) {
	escrowID := strings.TrimSpace(req.EscrowID)
	if escrowID == "" {
		return nil, errors.New("escrow: escrow_id is required")
	}
	rowMu := e.rowMutex(escrowID)
	rowMu.Lock()
	defer rowMu.Unlock()

	if replay, err := e.checkOrLockIdempotency(ctx, req.PayPalRequestID, escrowID); err != nil || replay != nil {
		return replay, err
	}

	e.mu.RLock()
	existing, exists := e.holds[escrowID]
	e.mu.RUnlock()
	if exists && !CanTransition(existing.State, StatePayPalAuthorized) {
		return nil, fmt.Errorf("%w: %s -> %s", ErrInvalidStateTransition, existing.State, StatePayPalAuthorized)
	}

	currency := strings.ToUpper(strings.TrimSpace(req.CurrencyCode))
	if currency == "" {
		currency = "USD"
	}

	holdRes, err := e.paypalSvc.AuthorizeEscrowHold(ctx, paypal.HoldRequest{
		EscrowID:        escrowID,
		MandateID:       req.MandateID,
		AmountCents:     req.AmountCents,
		CurrencyCode:    currency,
		Description:     req.Description,
		PayPalRequestID: req.PayPalRequestID,
	})
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	rec := &HoldRecord{
		EscrowID:        escrowID,
		MandateID:       req.MandateID,
		BuyerAgentID:    req.BuyerAgentID,
		SellerID:        req.SellerID,
		AmountCents:     req.AmountCents,
		CurrencyCode:    currency,
		PayPalOrderID:   holdRes.OrderID,
		PayPalAuthID:    holdRes.AuthorizationID,
		PayPalRequestID: strings.TrimSpace(req.PayPalRequestID),
		State:           StatePayPalAuthorized,
		StateHistory: []State{
			StateInitiated,
			StateMandateVerified,
			StateChannel3Benchmarked,
			StatePayPalAuthorized,
		},
		ExpiresAt: holdRes.ExpiresAt,
		UpdatedAt: now,
		Version:   1,
	}
	if exists {
		rec.Version = existing.Version + 1
		rec.StateHistory = append(append([]State{}, existing.StateHistory...), StatePayPalAuthorized)
	}

	res := TransitionResult{Record: cloneHold(rec), FallbackReplay: holdRes.FallbackReplay}
	e.mu.Lock()
	e.holds[escrowID] = rec
	e.idempCache[strings.TrimSpace(req.PayPalRequestID)] = res
	e.mu.Unlock()
	return &res, nil
}

// CaptureHold executes Phase 2A of the 2PC Escrow State Machine
// (PAYPAL_AUTHORIZED / SLA_SCHEDULED / TRACKING_VERIFIED -> PAYPAL_CAPTURED).
func (e *Engine) CaptureHold(ctx context.Context, req CaptureRequest) (*TransitionResult, error) {
	escrowID := strings.TrimSpace(req.EscrowID)
	if escrowID == "" {
		return nil, errors.New("escrow: escrow_id is required")
	}
	rowMu := e.rowMutex(escrowID)
	rowMu.Lock()
	defer rowMu.Unlock()

	if replay, err := e.checkOrLockIdempotency(ctx, req.PayPalRequestID, escrowID); err != nil || replay != nil {
		return replay, err
	}

	e.mu.RLock()
	rec, ok := e.holds[escrowID]
	e.mu.RUnlock()
	if !ok {
		return nil, ErrEscrowNotFound
	}
	if !CanTransition(rec.State, StatePayPalCaptured) {
		return nil, fmt.Errorf("%w: %s -> %s", ErrInvalidStateTransition, rec.State, StatePayPalCaptured)
	}

	capRes, err := e.paypalSvc.CaptureEscrowHold(ctx, paypal.CaptureRequest{
		AuthorizationID: rec.PayPalAuthID,
		PayPalRequestID: req.PayPalRequestID,
		AmountCents:     rec.AmountCents,
		CurrencyCode:    rec.CurrencyCode,
		NoteToPayer:     req.NoteToPayer,
		FinalCapture:    true,
	})
	if err != nil {
		return nil, err
	}

	e.mu.Lock()
	if rec.State == StatePayPalAuthorized {
		rec.StateHistory = append(rec.StateHistory, StateSLAScheduled, StateTrackingVerified)
	} else if rec.State == StateSLAScheduled {
		rec.StateHistory = append(rec.StateHistory, StateTrackingVerified)
	}
	rec.State = StatePayPalCaptured
	rec.StateHistory = append(rec.StateHistory, StatePayPalCaptured)
	rec.PayPalCaptureID = capRes.CaptureID
	rec.UpdatedAt = time.Now().UTC()
	rec.Version++
	res := TransitionResult{Record: cloneHold(rec), FallbackReplay: capRes.FallbackReplay}
	e.idempCache[strings.TrimSpace(req.PayPalRequestID)] = res
	e.mu.Unlock()
	return &res, nil
}

// VoidHold executes Phase 2B of the 2PC Escrow State Machine
// (PAYPAL_AUTHORIZED / SLA_SCHEDULED / TRACKING_VERIFIED -> PAYPAL_VOIDED).
func (e *Engine) VoidHold(ctx context.Context, req VoidRequest) (*TransitionResult, error) {
	escrowID := strings.TrimSpace(req.EscrowID)
	if escrowID == "" {
		return nil, errors.New("escrow: escrow_id is required")
	}
	rowMu := e.rowMutex(escrowID)
	rowMu.Lock()
	defer rowMu.Unlock()

	if replay, err := e.checkOrLockIdempotency(ctx, req.PayPalRequestID, escrowID); err != nil || replay != nil {
		return replay, err
	}

	e.mu.RLock()
	rec, ok := e.holds[escrowID]
	e.mu.RUnlock()
	if !ok {
		return nil, ErrEscrowNotFound
	}
	if !CanTransition(rec.State, StatePayPalVoided) {
		return nil, fmt.Errorf("%w: %s -> %s", ErrInvalidStateTransition, rec.State, StatePayPalVoided)
	}

	voidRes, err := e.paypalSvc.VoidEscrowHold(ctx, rec.PayPalAuthID, req.PayPalRequestID)
	if err != nil {
		return nil, err
	}

	e.mu.Lock()
	rec.State = StatePayPalVoided
	rec.StateHistory = append(rec.StateHistory, StatePayPalVoided)
	rec.FailureReason = strings.TrimSpace(req.Reason)
	rec.UpdatedAt = time.Now().UTC()
	rec.Version++
	res := TransitionResult{Record: cloneHold(rec), FallbackReplay: voidRes.FallbackReplay}
	e.idempCache[strings.TrimSpace(req.PayPalRequestID)] = res
	e.mu.Unlock()
	return &res, nil
}

// AdvanceState transitions an escrow hold along valid intermediate states (e.g., SLA_SCHEDULED, TRACKING_VERIFIED, DISPUTE_FILED).
func (e *Engine) AdvanceState(escrowID string, next State) (*HoldRecord, error) {
	rowMu := e.rowMutex(escrowID)
	rowMu.Lock()
	defer rowMu.Unlock()

	e.mu.Lock()
	defer e.mu.Unlock()
	rec, ok := e.holds[escrowID]
	if !ok {
		return nil, ErrEscrowNotFound
	}
	if !CanTransition(rec.State, next) {
		return nil, fmt.Errorf("%w: %s -> %s", ErrInvalidStateTransition, rec.State, next)
	}
	rec.State = next
	rec.StateHistory = append(rec.StateHistory, next)
	rec.UpdatedAt = time.Now().UTC()
	rec.Version++
	copied := cloneHold(rec)
	return &copied, nil
}

// GetHold returns a snapshot of an escrow hold record.
func (e *Engine) GetHold(escrowID string) (*HoldRecord, bool) {
	e.mu.RLock()
	defer e.mu.RUnlock()
	rec, ok := e.holds[escrowID]
	if !ok {
		return nil, false
	}
	copied := cloneHold(rec)
	return &copied, true
}

func cloneHold(rec *HoldRecord) HoldRecord {
	copied := *rec
	copied.StateHistory = append([]State{}, rec.StateHistory...)
	return copied
}
