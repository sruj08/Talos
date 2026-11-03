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

	if replay, err := e.checkCachedIdempotency(req.PayPalRequestID, escrowID); err != nil || replay != nil {
		return replay, err
	}

	e.mu.RLock()
	existing, exists := e.holds[escrowID]
	e.mu.RUnlock()
	if exists && !CanTransition(existing.State, StatePayPalAuthorized) {
		return nil, fmt.Errorf("%w: %s -> %s", ErrInvalidStateTransition, existing.State, StatePayPalAuthorized)
	}

	replay, acquired, err := e.acquireIdempotency(ctx, req.PayPalRequestID, escrowID)
	if err != nil || replay != nil {
		return replay, err
	}

	currency := strings.ToUpper(firstNonEmpty(req.CurrencyCode, req.Currency, "USD"))
	buyerAgentID := firstNonEmpty(req.BuyerAgentID, req.AgentID)
	sellerID := firstNonEmpty(req.SellerID, req.PayeeSandboxEmail)

	holdRes, err := e.paypalSvc.AuthorizeEscrowHold(ctx, paypal.HoldRequest{
		EscrowID:        escrowID,
		MandateID:       req.MandateID,
		AmountCents:     req.AmountCents,
		CurrencyCode:    currency,
		Description:     req.Description,
		PayPalRequestID: req.PayPalRequestID,
	})
	if err != nil {
		if acquired {
			e.releaseIdempotency(ctx, req.PayPalRequestID)
		}
		return nil, err
	}

	rec := &HoldRecord{
		EscrowID:              escrowID,
		MandateID:             req.MandateID,
		BuyerAgentID:          buyerAgentID,
		SellerID:              sellerID,
		PayerSandboxEmail:     strings.TrimSpace(req.PayerSandboxEmail),
		PayeeSandboxEmail:     strings.TrimSpace(req.PayeeSandboxEmail),
		AmountCents:           req.AmountCents,
		Currency:              currency,
		CurrencyCode:          currency,
		PayPalOrderID:         holdRes.OrderID,
		PayPalAuthID:          holdRes.AuthorizationID,
		PayPalAuthorizationID: holdRes.AuthorizationID,
		PayPalRequestID:       strings.TrimSpace(req.PayPalRequestID),
		State:                 StatePayPalAuthorized,
		StateHistory:          []State{StateInitiated, StateMandateVerified, StateChannel3Benchmarked, StatePayPalAuthorized},
		ExpiresAt:             holdRes.ExpiresAt,
		UpdatedAt:             time.Now().UTC(),
		Version:               1,
	}
	if exists {
		rec.Version = existing.Version + 1
		rec.StateHistory = append(append([]State{}, existing.StateHistory...), StatePayPalAuthorized)
	}

	e.mu.Lock()
	e.holds[escrowID] = rec
	res := newTransitionResult(rec, holdRes.FallbackReplay)
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

	rec, replay, acquired, err := e.prepareExistingTransition(ctx, escrowID, req.PayPalRequestID, StatePayPalCaptured)
	if err != nil || replay != nil {
		return replay, err
	}

	finalCap := req.FinalCapture == nil || *req.FinalCapture
	capRes, err := e.paypalSvc.CaptureEscrowHold(ctx, paypal.CaptureRequest{
		AuthorizationID: rec.PayPalAuthID,
		PayPalRequestID: req.PayPalRequestID,
		AmountCents:     rec.AmountCents,
		CurrencyCode:    rec.CurrencyCode,
		NoteToPayer:     req.NoteToPayer,
		FinalCapture:    finalCap,
	})
	if err != nil {
		if acquired {
			e.releaseIdempotency(ctx, req.PayPalRequestID)
		}
		return nil, err
	}

	e.mu.Lock()
	switch rec.State {
	case StatePayPalAuthorized:
		rec.StateHistory = append(rec.StateHistory, StateSLAScheduled, StateTrackingVerified)
	case StateSLAScheduled:
		rec.StateHistory = append(rec.StateHistory, StateTrackingVerified)
	}
	rec.State = StatePayPalCaptured
	rec.StateHistory = append(rec.StateHistory, StatePayPalCaptured)
	rec.PayPalCaptureID = capRes.CaptureID
	rec.CapturedAmountCents = rec.AmountCents
	rec.UpdatedAt = time.Now().UTC()
	rec.Version++
	res := newTransitionResult(rec, capRes.FallbackReplay)
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

	rec, replay, acquired, err := e.prepareExistingTransition(ctx, escrowID, req.PayPalRequestID, StatePayPalVoided)
	if err != nil || replay != nil {
		return replay, err
	}

	voidRes, err := e.paypalSvc.VoidEscrowHold(ctx, rec.PayPalAuthID, req.PayPalRequestID)
	if err != nil {
		if acquired {
			e.releaseIdempotency(ctx, req.PayPalRequestID)
		}
		return nil, err
	}

	reason := firstNonEmpty(req.Reason, req.VoidReason)
	e.mu.Lock()
	rec.State = StatePayPalVoided
	rec.StateHistory = append(rec.StateHistory, StatePayPalVoided)
	rec.FailureReason = reason
	rec.VoidReason = reason
	rec.BuyerFundsReleasedCents = rec.AmountCents
	rec.UpdatedAt = time.Now().UTC()
	rec.Version++
	res := newTransitionResult(rec, voidRes.FallbackReplay)
	e.idempCache[strings.TrimSpace(req.PayPalRequestID)] = res
	e.mu.Unlock()
	return &res, nil
}

func (e *Engine) prepareExistingTransition(ctx context.Context, escrowID, reqID string, target State) (*HoldRecord, *TransitionResult, bool, error) {
	if replay, err := e.checkCachedIdempotency(reqID, escrowID); err != nil || replay != nil {
		return nil, replay, false, err
	}
	e.mu.RLock()
	rec, ok := e.holds[escrowID]
	e.mu.RUnlock()
	if !ok {
		return nil, nil, false, ErrEscrowNotFound
	}
	if !CanTransition(rec.State, target) {
		return nil, nil, false, fmt.Errorf("%w: %s -> %s", ErrInvalidStateTransition, rec.State, target)
	}
	replay, acquired, err := e.acquireIdempotency(ctx, reqID, escrowID)
	return rec, replay, acquired, err
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

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if s := strings.TrimSpace(v); s != "" {
			return s
		}
	}
	return ""
}
