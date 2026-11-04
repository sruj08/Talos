package escrow

import (
	"errors"
	"sync"
	"sync/atomic"
	"testing"
)

func Test2PCEscrowFullLifecycleAndIllegalTransitions(t *testing.T) {
	m := NewMachine()

	// 1. Happy Path: INITIATED -> MANDATE_VERIFIED -> CHANNEL3_BENCHMARKED -> PAYPAL_AUTHORIZED -> SLA_SCHEDULED -> TRACKING_VERIFIED -> PAYPAL_CAPTURED -> DISPUTE_FILED -> DISPUTE_EVIDENCE_SUBMITTED
	rec := m.UpsertRecord(Record{
		EscrowID:    "esc-happy-001",
		MandateID:   "0192e8a0-0000-7000-8000-000000000101",
		AmountCents: 24900,
		Currency:    "USD",
		State:       StateInitiated,
	})
	if rec.State != StateInitiated {
		t.Fatalf("expected initial state INITIATED, got %s", rec.State)
	}

	steps := []State{
		StateMandateVerified,
		StateChannel3Benchmarked,
		StatePayPalAuthorized,
		StateSlaScheduled,
		StateTrackingVerified,
		StatePayPalCaptured,
		StateDisputeFiled,
		StateDisputeEvidenceSubmitted,
	}
	for _, st := range steps {
		updated, err := m.Transition("esc-happy-001", st, nil)
		if err != nil {
			t.Fatalf("expected valid transition to %s, got err=%v", st, err)
		}
		if updated.State != st {
			t.Fatalf("expected state %s, got %s", st, updated.State)
		}
	}

	// 2. Rollback Path: INITIATED -> PAYPAL_AUTHORIZED -> PAYPAL_VOIDED
	m.UpsertRecord(Record{
		EscrowID:    "esc-void-002",
		AmountCents: 21900,
		State:       StateInitiated,
	})
	if _, err := m.Transition("esc-void-002", StatePayPalAuthorized, nil); err != nil {
		t.Fatalf("transition to PAYPAL_AUTHORIZED failed: %v", err)
	}
	if _, err := m.Transition("esc-void-002", StatePayPalVoided, nil); err != nil {
		t.Fatalf("transition to PAYPAL_VOIDED failed: %v", err)
	}

	// 3. Reject Illegal Transitions: PAYPAL_VOIDED -> PAYPAL_CAPTURED and PAYPAL_CAPTURED -> PAYPAL_VOIDED
	if _, err := m.Transition("esc-void-002", StatePayPalCaptured, nil); !errors.Is(err, ErrIllegalStateTransition) {
		t.Fatalf("expected ErrIllegalStateTransition on PAYPAL_VOIDED -> PAYPAL_CAPTURED, got %v", err)
	}
	if CanTransition(StatePayPalCaptured, StatePayPalVoided) {
		t.Fatalf("expected PAYPAL_CAPTURED -> PAYPAL_VOIDED to be rejected")
	}
	if CanTransition(StateBlockedFirewall, StatePayPalAuthorized) {
		t.Fatalf("expected BLOCKED_FIREWALL -> PAYPAL_AUTHORIZED to be rejected")
	}
}

func TestIdempotentExecutionAndConcurrentRaceSafety(t *testing.T) {
	m := NewMachine()
	m.UpsertRecord(Record{
		EscrowID:    "esc-race-003",
		AmountCents: 24900,
		State:       StatePayPalAuthorized,
	})

	// Duplicate PayPal-Request-Id must execute underlying transition only once and return cached result
	var execCount atomic.Int32
	fn := func() (*Record, error) {
		execCount.Add(1)
		return m.Transition("esc-race-003", StatePayPalCaptured, func(r *Record) {
			r.PayPalCaptureID = "9CAP-IDEMP-003"
		})
	}

	res1, cached1, err1 := m.ExecuteIdempotent("capture", "pp-req-dup-003", fn)
	if err1 != nil || cached1 || res1.State != StatePayPalCaptured {
		t.Fatalf("first idempotent call failed: res=%+v cached=%v err=%v", res1, cached1, err1)
	}

	res2, cached2, err2 := m.ExecuteIdempotent("capture", "pp-req-dup-003", fn)
	if err2 != nil || !cached2 || res2.PayPalCaptureID != "9CAP-IDEMP-003" {
		t.Fatalf("second idempotent call failed: res=%+v cached=%v err=%v", res2, cached2, err2)
	}
	if execCount.Load() != 1 {
		t.Fatalf("expected underlying transition to execute once, got %d", execCount.Load())
	}

	// Race 20 goroutines attempting Capture vs Void on a fresh PAYPAL_AUTHORIZED escrow
	m.UpsertRecord(Record{
		EscrowID:    "esc-race-004",
		AmountCents: 24900,
		State:       StatePayPalAuthorized,
	})
	var wins atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		next := StatePayPalCaptured
		if i%2 == 1 {
			next = StatePayPalVoided
		}
		go func(target State) {
			defer wg.Done()
			if _, err := m.Transition("esc-race-004", target, nil); err == nil {
				wins.Add(1)
			}
		}(next)
	}
	wg.Wait()
	if wins.Load() != 1 {
		t.Fatalf("expected exactly 1 terminal transition to win race, got %d", wins.Load())
	}
}
