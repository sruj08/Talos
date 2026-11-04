// Package escrow implements TALOS's deterministic Two-Phase Commit (2PC) Escrow State Machine.
package escrow

import (
	"errors"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"
)

type State string

const (
	StateInitiated                State = "INITIATED"
	StateMandateVerified          State = "MANDATE_VERIFIED"
	StateChannel3Benchmarked      State = "CHANNEL3_BENCHMARKED"
	StateBlockedFirewall          State = "BLOCKED_FIREWALL"
	StateBlockedPriceGouging      State = "BLOCKED_PRICE_GOUGING"
	StateStepUpRequired           State = "STEP_UP_REQUIRED"
	StatePayPalAuthorized         State = "PAYPAL_AUTHORIZED"
	StateSlaScheduled             State = "SLA_SCHEDULED"
	StateTrackingVerified         State = "TRACKING_VERIFIED"
	StatePayPalCaptured           State = "PAYPAL_CAPTURED"
	StatePayPalVoided             State = "PAYPAL_VOIDED"
	StateDisputeFiled             State = "DISPUTE_FILED"
	StateDisputeEvidenceSubmitted State = "DISPUTE_EVIDENCE_SUBMITTED"
)

var (
	ErrIllegalStateTransition = errors.New("illegal 2PC escrow state transition")
	ErrEscrowNotFound         = errors.New("escrow transaction not found")
	ErrEmptyRequestID         = errors.New("PayPal-Request-Id is required")
)

func CanTransition(from, to State) bool {
	switch from {
	case StateInitiated:
		return to == StateMandateVerified || to == StateChannel3Benchmarked ||
			to == StateBlockedFirewall || to == StateBlockedPriceGouging ||
			to == StateStepUpRequired || to == StatePayPalAuthorized
	case StateMandateVerified:
		return to == StateChannel3Benchmarked || to == StateBlockedFirewall ||
			to == StateBlockedPriceGouging || to == StateStepUpRequired || to == StatePayPalAuthorized
	case StateChannel3Benchmarked:
		return to == StateBlockedFirewall || to == StateBlockedPriceGouging ||
			to == StateStepUpRequired || to == StatePayPalAuthorized
	case StateStepUpRequired:
		return to == StatePayPalAuthorized || to == StatePayPalVoided
	case StatePayPalAuthorized:
		return to == StateSlaScheduled || to == StateTrackingVerified ||
			to == StatePayPalCaptured || to == StatePayPalVoided
	case StateSlaScheduled:
		return to == StateTrackingVerified || to == StatePayPalCaptured || to == StatePayPalVoided
	case StateTrackingVerified:
		return to == StatePayPalCaptured || to == StatePayPalVoided
	case StatePayPalCaptured:
		return to == StateDisputeFiled || to == StateDisputeEvidenceSubmitted
	case StateDisputeFiled:
		return to == StateDisputeEvidenceSubmitted
	default:
		return false
	}
}

type Record struct {
	EscrowID            string    `json:"escrow_id"`
	MandateID           string    `json:"mandate_id"`
	SKUQuery            string    `json:"sku_query,omitempty"`
	Category            string    `json:"category,omitempty"`
	MerchantName        string    `json:"merchant_name,omitempty"`
	MerchantURL         string    `json:"merchant_url,omitempty"`
	MerchantPayPalEmail string    `json:"merchant_paypal_email,omitempty"`
	AmountCents         int64     `json:"amount_cents"`
	Currency            string    `json:"currency"`
	State               State     `json:"state"`
	StepUpRequired      bool      `json:"step_up_required"`
	PayPalRequestID     string    `json:"paypal_request_id,omitempty"`
	PayPalOrderID       string    `json:"paypal_order_id,omitempty"`
	PayPalAuthID        string    `json:"paypal_auth_id,omitempty"`
	PayPalCaptureID     string    `json:"paypal_capture_id,omitempty"`
	PayPalTrackerID     string    `json:"paypal_tracker_id,omitempty"`
	Carrier             string    `json:"carrier,omitempty"`
	TrackingNumber      string    `json:"tracking_number,omitempty"`
	TrackingStatus      string    `json:"tracking_status,omitempty"`
	FirewallScanID      string    `json:"firewall_scan_id,omitempty"`
	FirewallRiskScore   float64   `json:"firewall_risk_score,omitempty"`
	RawDOMExcerpt       string    `json:"raw_dom_excerpt,omitempty"`
	SanitizedDOMExcerpt string    `json:"sanitized_dom_excerpt,omitempty"`
	Channel3BenchmarkID string    `json:"channel3_benchmark_id,omitempty"`
	SpreadBps           int64     `json:"spread_bps"`
	MedianPriceCents    int64     `json:"median_price_cents,omitempty"`
	SavingsCents        int64     `json:"savings_cents,omitempty"`
	SandboxMode         string    `json:"sandbox_mode,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type Machine struct {
	mu         sync.RWMutex
	records    map[string]*Record
	idempCache map[string]*Record
}

type Engine = Machine

func NewMachine() *Machine {
	m := &Machine{records: make(map[string]*Record), idempCache: make(map[string]*Record)}
	now := time.Now().UTC()
	for _, seed := range []Record{
		{EscrowID: "esc-901-trap", MandateID: "0192e8a0-0000-7000-8000-000000000101", SKUQuery: "Shure SM7B Vocal Dynamic Microphone", Category: "Studio Audio", MerchantName: "ShadowGear Unverified Trap", MerchantURL: "https://poisoned-gear-shop.example.com/shure-sm7b", AmountCents: 48000, Currency: "USD", State: StateBlockedFirewall, PayPalRequestID: "seed-req-901", FirewallRiskScore: 0.9942, SpreadBps: 9277, MedianPriceCents: 24900, SavingsCents: 23100, SandboxMode: "LIVE", CreatedAt: now.Add(-15 * time.Minute), UpdatedAt: now.Add(-15 * time.Minute)},
		{EscrowID: "esc-902-sm7b", MandateID: "0192e8a0-0000-7000-8000-000000000101", SKUQuery: "Shure SM7B Vocal Dynamic Microphone", Category: "Studio Audio", MerchantName: "AudioPro Verified (Channel3 Preferred)", MerchantURL: "https://verified-audio.trychannel3.com/sku/shure-sm7b", AmountCents: 24900, Currency: "USD", State: StatePayPalAuthorized, PayPalRequestID: "seed-req-902", PayPalOrderID: "8XY99887766554433", PayPalAuthID: "2A112233445566778", Carrier: "FEDEX", TrackingNumber: "794892104852", TrackingStatus: "IN_TRANSIT", FirewallRiskScore: 0.0012, SpreadBps: 0, MedianPriceCents: 24900, SavingsCents: 23100, SandboxMode: "LIVE", CreatedAt: now.Add(-10 * time.Minute), UpdatedAt: now.Add(-10 * time.Minute)},
		{EscrowID: "esc-903-scarlett", MandateID: "0192e8a0-0000-7000-8000-000000000101", SKUQuery: "Focusrite Scarlett 4i4 Gen4 Audio Interface", Category: "Studio Audio", MerchantName: "CloudCompute & Studio Logistics", MerchantURL: "https://cloudcompute-audio.example.com/scarlett-4i4", AmountCents: 21900, Currency: "USD", State: StatePayPalAuthorized, PayPalRequestID: "seed-req-903", PayPalOrderID: "4KL88210938471122", PayPalAuthID: "2A883120944556677", Carrier: "DHL", TrackingNumber: "992184710293", TrackingStatus: "IN_TRANSIT", FirewallRiskScore: 0.0020, SpreadBps: 0, MedianPriceCents: 21900, SandboxMode: "LIVE", CreatedAt: now.Add(-8 * time.Minute), UpdatedAt: now.Add(-8 * time.Minute)},
		{EscrowID: "esc-904-genelec", MandateID: "0192e8a0-0000-7000-8000-000000000101", SKUQuery: "Genelec 8030C Studio Monitor Pair", Category: "Studio Audio", MerchantName: "Genelec Certified Pro Audio", MerchantURL: "https://genelec-pro.trychannel3.com/8030c", AmountCents: 45000, Currency: "USD", State: StateStepUpRequired, StepUpRequired: true, PayPalRequestID: "seed-req-904", PayPalOrderID: "9STEPUP4500019283", PayPalAuthID: "2ASTEPUP998877665", FirewallRiskScore: 0.0300, SpreadBps: 0, MedianPriceCents: 45000, SandboxMode: "LIVE", CreatedAt: now.Add(-5 * time.Minute), UpdatedAt: now.Add(-5 * time.Minute)},
	} {
		cp := seed
		m.records[seed.EscrowID] = &cp
	}
	return m
}

func (m *Machine) UpsertRecord(rec Record) *Record {
	m.mu.Lock()
	defer m.mu.Unlock()
	now := time.Now().UTC()
	if rec.Currency == "" {
		rec.Currency = "USD"
	}
	if rec.State == "" {
		rec.State = StateInitiated
	}
	if rec.CreatedAt.IsZero() {
		rec.CreatedAt = now
	}
	rec.UpdatedAt = now
	cp := rec
	m.records[rec.EscrowID] = &cp
	cpOut := cp
	return &cpOut
}

func (m *Machine) GetRecord(escrowID string) (*Record, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	rec, ok := m.records[escrowID]
	if !ok {
		return nil, false
	}
	cp := *rec
	return &cp, true
}

func (m *Machine) Transition(escrowID string, next State, mutate func(*Record)) (*Record, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	rec, ok := m.records[escrowID]
	if !ok {
		return nil, ErrEscrowNotFound
	}
	if !CanTransition(rec.State, next) {
		return nil, fmt.Errorf("%w: from %s to %s", ErrIllegalStateTransition, rec.State, next)
	}
	rec.State = next
	if mutate != nil {
		mutate(rec)
	}
	rec.UpdatedAt = time.Now().UTC()
	cp := *rec
	return &cp, nil
}

func (m *Machine) ExecuteIdempotent(opKey, requestID string, fn func() (*Record, error)) (*Record, bool, error) {
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		return nil, false, ErrEmptyRequestID
	}
	cacheKey := opKey + ":" + reqID
	m.mu.RLock()
	if cached, ok := m.idempCache[cacheKey]; ok {
		cp := *cached
		m.mu.RUnlock()
		return &cp, true, nil
	}
	m.mu.RUnlock()

	res, err := fn()
	if err != nil {
		return nil, false, err
	}
	m.mu.Lock()
	if existing, ok := m.idempCache[cacheKey]; ok {
		cp := *existing
		m.mu.Unlock()
		return &cp, true, nil
	}
	cp := *res
	m.idempCache[cacheKey] = &cp
	m.mu.Unlock()
	out := cp
	return &out, false, nil
}

func (m *Machine) ListRecords(stateFilter string, limit int) []Record {
	m.mu.RLock()
	defer m.mu.RUnlock()
	filter := strings.ToUpper(strings.TrimSpace(stateFilter))
	out := make([]Record, 0, len(m.records))
	for _, r := range m.records {
		if filter != "" && filter != "ALL" && string(r.State) != filter {
			continue
		}
		out = append(out, *r)
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i].UpdatedAt.After(out[j].UpdatedAt)
	})
	if limit > 0 && len(out) > limit {
		out = out[:limit]
	}
	return out
}
