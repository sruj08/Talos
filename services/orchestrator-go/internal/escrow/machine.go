// Package escrow implements TALOS's deterministic Two-Phase Commit (2PC) Escrow State Machine.
package escrow

import "errors"

type State string

const (
	StateInitiated           State = "INITIATED"
	StateBlockedFirewall     State = "BLOCKED_FIREWALL"
	StateBlockedPriceGouging State = "BLOCKED_PRICE_GOUGING"
	StateStepUpRequired      State = "STEP_UP_REQUIRED"
	StatePayPalAuthorized    State = "PAYPAL_AUTHORIZED"
	StateSlaScheduled        State = "SLA_SCHEDULED"
	StateTrackingVerified    State = "TRACKING_VERIFIED"
	StatePayPalCaptured      State = "PAYPAL_CAPTURED"
	StatePayPalVoided        State = "PAYPAL_VOIDED"
	StateDisputeFiled        State = "DISPUTE_FILED"
)

var ErrIllegalStateTransition = errors.New("illegal 2PC escrow state transition")

func CanTransition(from, to State) bool {
	switch from {
	case StateInitiated:
		return to == StateBlockedFirewall || to == StateBlockedPriceGouging || to == StateStepUpRequired || to == StatePayPalAuthorized
	case StateStepUpRequired:
		return to == StatePayPalAuthorized || to == StatePayPalVoided
	case StatePayPalAuthorized, StateSlaScheduled, StateTrackingVerified:
		return to == StateSlaScheduled || to == StateTrackingVerified || to == StatePayPalCaptured || to == StatePayPalVoided
	case StatePayPalCaptured:
		return to == StateDisputeFiled
	default:
		return false
	}
}
