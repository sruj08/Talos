package escrow

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/talos/services/orchestrator-go/internal/paypal"
)

// State represents the deterministic 2PC Escrow State Machine state.
type State string

const (
	StateInitiated                State = "INITIATED"
	StateMandateVerified          State = "MANDATE_VERIFIED"
	StateChannel3Benchmarked      State = "CHANNEL3_BENCHMARKED"
	StateBlockedFirewall          State = "BLOCKED_FIREWALL"
	StateBlockedPriceGouging      State = "BLOCKED_PRICE_GOUGING"
	StateStepUpRequired           State = "STEP_UP_REQUIRED"
	StatePayPalAuthorized         State = "PAYPAL_AUTHORIZED"
	StateSLAScheduled             State = "SLA_SCHEDULED"
	StateTrackingVerified         State = "TRACKING_VERIFIED"
	StatePayPalCaptured           State = "PAYPAL_CAPTURED"
	StatePayPalVoided             State = "PAYPAL_VOIDED"
	StateDisputeFiled             State = "DISPUTE_FILED"
	StateDisputeEvidenceSubmitted State = "DISPUTE_EVIDENCE_SUBMITTED"
)

var (
	ErrMissingRequestID       = errors.New("escrow: PayPal-Request-Id is required")
	ErrDuplicateRequestID     = errors.New("escrow: duplicate or conflicting PayPal-Request-Id")
	ErrEscrowNotFound         = errors.New("escrow: escrow record not found")
	ErrInvalidStateTransition = errors.New("escrow: illegal 2PC state transition")
	ErrIllegalStateTransition = ErrInvalidStateTransition
)

var allowedTransitions = map[State][]State{
	StateInitiated:           {StateMandateVerified, StateBlockedFirewall, StatePayPalAuthorized},
	StateMandateVerified:     {StateChannel3Benchmarked, StateBlockedPriceGouging, StateStepUpRequired, StatePayPalAuthorized},
	StateStepUpRequired:      {StateChannel3Benchmarked, StatePayPalAuthorized, StatePayPalVoided},
	StateChannel3Benchmarked: {StatePayPalAuthorized, StateBlockedPriceGouging, StateStepUpRequired},
	StatePayPalAuthorized:    {StateSLAScheduled, StateTrackingVerified, StatePayPalCaptured, StatePayPalVoided, StateDisputeFiled},
	StateSLAScheduled:        {StateTrackingVerified, StatePayPalCaptured, StatePayPalVoided, StateDisputeFiled},
	StateTrackingVerified:    {StatePayPalCaptured, StatePayPalVoided, StateDisputeFiled},
	StateDisputeFiled:        {StateDisputeEvidenceSubmitted},
}

// CanTransition returns true if the transition from -> to is permitted by the 2PC state graph.
func CanTransition(from, to State) bool {
	for _, allowed := range allowedTransitions[from] {
		if allowed == to {
			return true
		}
	}
	return false
}

// IdempotencyGate abstracts Redis/Store SETNX idempotency locking for PayPal-Request-Id keys.
type IdempotencyGate interface {
	AcquireIdempotencyLock(ctx context.Context, paypalRequestID string, ownerToken string, ttl time.Duration) (bool, error)
}

type idempotencyReleaser interface {
	ReleaseIdempotencyLock(ctx context.Context, paypalRequestID string) error
}

// HoldRecord tracks the full lifecycle and audit history of a 2PC Escrow Hold.
type HoldRecord struct {
	EscrowID                string    `json:"escrow_id"`
	MandateID               string    `json:"mandate_id"`
	BuyerAgentID            string    `json:"buyer_agent_id,omitempty"`
	SellerID                string    `json:"seller_id,omitempty"`
	PayerSandboxEmail       string    `json:"payer_sandbox_email,omitempty"`
	PayeeSandboxEmail       string    `json:"payee_sandbox_email,omitempty"`
	AmountCents             int64     `json:"amount_cents"`
	Currency                string    `json:"currency"`
	CurrencyCode            string    `json:"currency_code"`
	PayPalOrderID           string    `json:"paypal_order_id,omitempty"`
	PayPalAuthID            string    `json:"paypal_auth_id,omitempty"`
	PayPalAuthorizationID   string    `json:"paypal_authorization_id,omitempty"`
	PayPalCaptureID         string    `json:"paypal_capture_id,omitempty"`
	PayPalRequestID         string    `json:"paypal_request_id"`
	State                   State     `json:"state"`
	StateHistory            []State   `json:"state_history"`
	FailureReason           string    `json:"failure_reason,omitempty"`
	VoidReason              string    `json:"void_reason,omitempty"`
	ExpiresAt               string    `json:"expires_at,omitempty"`
	CapturedAmountCents     int64     `json:"captured_amount_cents,omitempty"`
	BuyerFundsReleasedCents int64     `json:"buyer_funds_released_cents,omitempty"`
	UpdatedAt               time.Time `json:"updated_at"`
	Version                 int64     `json:"version"`
}

// AuthorizeRequest represents an API-07 2PC Phase 1 hold input.
type AuthorizeRequest struct {
	EscrowID          string `json:"escrow_id"`
	MandateID         string `json:"mandate_id"`
	AgentID           string `json:"agent_id,omitempty"`
	BuyerAgentID      string `json:"buyer_agent_id,omitempty"`
	SellerID          string `json:"seller_id,omitempty"`
	PayerSandboxEmail string `json:"payer_sandbox_email,omitempty"`
	PayeeSandboxEmail string `json:"payee_sandbox_email,omitempty"`
	AmountCents       int64  `json:"amount_cents"`
	Currency          string `json:"currency,omitempty"`
	CurrencyCode      string `json:"currency_code,omitempty"`
	Description       string `json:"description"`
	PayPalRequestID   string `json:"paypal_request_id"`
}

// CaptureRequest represents an API-09 2PC Phase 2A capture input.
type CaptureRequest struct {
	EscrowID        string `json:"escrow_id"`
	PayPalRequestID string `json:"paypal_request_id"`
	TrackingNumber  string `json:"tracking_number,omitempty"`
	Carrier         string `json:"carrier,omitempty"`
	NoteToPayer     string `json:"note_to_payer,omitempty"`
	FinalCapture    *bool  `json:"final_capture,omitempty"`
}

// VoidRequest represents an API-10 2PC Phase 2B void input.
type VoidRequest struct {
	EscrowID        string `json:"escrow_id"`
	PayPalRequestID string `json:"paypal_request_id"`
	Reason          string `json:"reason,omitempty"`
	VoidReason      string `json:"void_reason,omitempty"`
	TriggeredBy     string `json:"triggered_by,omitempty"`
}

// TransitionResult is returned by AuthorizeHold, CaptureHold, and VoidHold.
type TransitionResult struct {
	Record                  HoldRecord `json:"record"`
	EscrowID                string     `json:"escrow_id"`
	MandateID               string     `json:"mandate_id,omitempty"`
	State                   State      `json:"state"`
	PayPalOrderID           string     `json:"paypal_order_id,omitempty"`
	PayPalAuthID            string     `json:"paypal_auth_id,omitempty"`
	PayPalCaptureID         string     `json:"paypal_capture_id,omitempty"`
	PayPalRequestID         string     `json:"paypal_request_id"`
	AmountCents             int64      `json:"amount_cents"`
	Currency                string     `json:"currency"`
	VoidReason              string     `json:"void_reason,omitempty"`
	CapturedAmountCents     int64      `json:"captured_amount_cents,omitempty"`
	BuyerFundsReleasedCents int64      `json:"buyer_funds_released_cents,omitempty"`
	IdempotentReplay        bool       `json:"idempotent_replay"`
	FallbackReplay          bool       `json:"fallback_replay"`
}

func newTransitionResult(rec *HoldRecord, fallback bool) TransitionResult {
	cp := cloneHold(rec)
	return TransitionResult{
		Record: cp, EscrowID: cp.EscrowID, MandateID: cp.MandateID, State: cp.State,
		PayPalOrderID: cp.PayPalOrderID, PayPalAuthID: cp.PayPalAuthID, PayPalCaptureID: cp.PayPalCaptureID,
		PayPalRequestID: cp.PayPalRequestID, AmountCents: cp.AmountCents, Currency: cp.Currency,
		VoidReason: cp.VoidReason, CapturedAmountCents: cp.CapturedAmountCents,
		BuyerFundsReleasedCents: cp.BuyerFundsReleasedCents, FallbackReplay: fallback,
	}
}

// Engine executes the concurrency-safe Two-Phase Commit (2PC) Escrow State Machine.
type Engine struct {
	paypalSvc  paypal.Provider
	idempGate  IdempotencyGate
	mu         sync.RWMutex
	holds      map[string]*HoldRecord
	rowLocks   map[string]*sync.Mutex
	idempCache map[string]TransitionResult
}

// NewEngine creates a 2PC Escrow State Machine bound to a PayPal Sandbox provider and idempotency gate.
func NewEngine(paypalSvc paypal.Provider, gate IdempotencyGate) *Engine {
	if paypalSvc == nil {
		paypalSvc = paypal.NewSandboxServiceFromEnv()
	}
	return &Engine{
		paypalSvc:  paypalSvc,
		idempGate:  gate,
		holds:      make(map[string]*HoldRecord),
		rowLocks:   make(map[string]*sync.Mutex),
		idempCache: make(map[string]TransitionResult),
	}
}

func (e *Engine) rowMutex(escrowID string) *sync.Mutex {
	e.mu.Lock()
	defer e.mu.Unlock()
	m, ok := e.rowLocks[escrowID]
	if !ok {
		m = &sync.Mutex{}
		e.rowLocks[escrowID] = m
	}
	return m
}

func (e *Engine) checkCachedIdempotency(reqID, escrowID string) (*TransitionResult, error) {
	reqID = strings.TrimSpace(reqID)
	if reqID == "" {
		return nil, ErrMissingRequestID
	}
	e.mu.RLock()
	cached, ok := e.idempCache[reqID]
	e.mu.RUnlock()
	if !ok {
		return nil, nil
	}
	if cached.Record.EscrowID != escrowID {
		return nil, ErrDuplicateRequestID
	}
	replay := cached
	replay.IdempotentReplay = true
	return &replay, nil
}

func (e *Engine) acquireIdempotency(ctx context.Context, reqID, escrowID string) (*TransitionResult, bool, error) {
	if replay, err := e.checkCachedIdempotency(reqID, escrowID); err != nil || replay != nil {
		return replay, false, err
	}
	reqID = strings.TrimSpace(reqID)
	if e.idempGate != nil {
		acquired, err := e.idempGate.AcquireIdempotencyLock(ctx, reqID, escrowID, 24*time.Hour)
		if err != nil {
			return nil, false, fmt.Errorf("idempotency gate error: %w", err)
		}
		if !acquired {
			if replay, err := e.checkCachedIdempotency(reqID, escrowID); err != nil || replay != nil {
				return replay, false, err
			}
			return nil, false, ErrDuplicateRequestID
		}
		return nil, true, nil
	}
	return nil, false, nil
}

func (e *Engine) releaseIdempotency(ctx context.Context, reqID string) {
	if rel, ok := e.idempGate.(idempotencyReleaser); ok {
		_ = rel.ReleaseIdempotencyLock(ctx, strings.TrimSpace(reqID))
	}
}
