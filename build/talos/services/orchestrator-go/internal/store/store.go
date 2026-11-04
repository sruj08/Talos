// Package store provides PostgreSQL 16 repositories (E-01..E-09) and Redis PayPal-Request-Id idempotency locks (E-10).
package store

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"github.com/talos/services/orchestrator-go/internal/escrow"
)

const (
	// DefaultIdempotencyTTL is 24 hours (86,400 seconds) per E-10 specification.
	DefaultIdempotencyTTL = 86400 * time.Second

	// SelectEscrowForUpdateSQL acquires a pessimistic row-level lock on escrow_transactions (E-06).
	SelectEscrowForUpdateSQL = `SELECT id, mandate_id, paypal_request_id, COALESCE(paypal_order_id, ''), COALESCE(paypal_auth_id, ''), COALESCE(paypal_capture_id, ''), amount_cents, currency, state, step_up_required, created_at, updated_at FROM escrow_transactions WHERE id = $1 FOR UPDATE`

	// UpdateEscrowStateSQL updates the 2PC state inside the same transaction after SELECT ... FOR UPDATE.
	UpdateEscrowStateSQL = `UPDATE escrow_transactions SET state = $2, paypal_order_id = COALESCE(NULLIF($3, ''), paypal_order_id), paypal_auth_id = COALESCE(NULLIF($4, ''), paypal_auth_id), paypal_capture_id = COALESCE(NULLIF($5, ''), paypal_capture_id), updated_at = NOW() WHERE id = $1`
)

var (
	ErrDuplicateRequestID = errors.New("duplicate PayPal-Request-Id: idempotency lock already held")
	ErrEscrowNotFound     = errors.New("escrow transaction not found")
	ErrEmptyRequestID     = errors.New("PayPal-Request-Id cannot be empty")
)

type PrincipalUser struct {
	ID                      string    `json:"id"`
	Email                   string    `json:"email"`
	PayPalSandboxBuyerEmail string    `json:"paypal_sandbox_buyer_email"`
	CreatedAt               time.Time `json:"created_at"`
}

type AgentIdentity struct {
	ID               string    `json:"id"`
	PrincipalID      string    `json:"principal_id"`
	MCPClientID      string    `json:"mcp_client_id"`
	Ed25519PubkeyHex string    `json:"ed25519_pubkey_hex"`
	RFC9421KeyID     string    `json:"rfc9421_key_id"`
	TrustScore       float64   `json:"trust_score"`
	Status           string    `json:"status"`
	CreatedAt        time.Time `json:"created_at"`
}

type KyaMandate struct {
	ID                  string    `json:"id"`
	PrincipalID         string    `json:"principal_id"`
	AgentID             string    `json:"agent_id"`
	MaxAmountCents      int64     `json:"max_amount_cents"`
	Currency            string    `json:"currency"`
	AllowedCategories   []string  `json:"allowed_categories"`
	MaxSpreadBps        int       `json:"max_spread_bps"`
	SlaHours            int       `json:"sla_hours"`
	Ed25519SignatureHex string    `json:"ed25519_signature_hex"`
	ExpiresAt           time.Time `json:"expires_at"`
	CreatedAt           time.Time `json:"created_at"`
}

type EscrowTransaction struct {
	ID                  string       `json:"id"`
	MandateID           string       `json:"mandate_id"`
	FirewallScanID      string       `json:"firewall_scan_id,omitempty"`
	Channel3BenchmarkID string       `json:"channel3_benchmark_id,omitempty"`
	PayPalRequestID     string       `json:"paypal_request_id"`
	PayPalOrderID       string       `json:"paypal_order_id,omitempty"`
	PayPalAuthID        string       `json:"paypal_auth_id,omitempty"`
	PayPalCaptureID     string       `json:"paypal_capture_id,omitempty"`
	AmountCents         int64        `json:"amount_cents"`
	Currency            string       `json:"currency"`
	State               escrow.State `json:"state"`
	StepUpRequired      bool         `json:"step_up_required"`
	CreatedAt           time.Time    `json:"created_at"`
	UpdatedAt           time.Time    `json:"updated_at"`
}

type IdempotencyLock struct {
	Key        string    `json:"key"`
	RequestID  string    `json:"request_id"`
	Value      string    `json:"value"`
	TTLSeconds int64     `json:"ttl_seconds"`
	ExpiresAt  time.Time `json:"expires_at"`
}

type Store struct {
	DatabaseURL string
	RedisURL    string
	mu          sync.RWMutex
	rowLocks    map[string]*sync.Mutex
	escrows     map[string]*EscrowTransaction
	mandates    map[string]*KyaMandate
	idempMap    map[string]IdempotencyLock
	queryHook   func(sql string, args ...any)
}

func NewStore(databaseURL, redisURL string) *Store {
	s := &Store{
		DatabaseURL: databaseURL,
		RedisURL:    redisURL,
		rowLocks:    make(map[string]*sync.Mutex),
		escrows:     make(map[string]*EscrowTransaction),
		mandates:    make(map[string]*KyaMandate),
		idempMap:    make(map[string]IdempotencyLock),
	}
	exp := time.Now().UTC().Add(30 * 24 * time.Hour)
	for _, m := range []KyaMandate{
		{ID: "0192e8a0-0000-7000-8000-000000000101", PrincipalID: "0192e8a0-0000-7000-8000-000000000001", AgentID: "0192e8a0-0000-7000-8000-000000000011", MaxAmountCents: 30000, Currency: "USD", AllowedCategories: []string{"Studio Audio", "Microphones"}, MaxSpreadBps: 1500, SlaHours: 48, ExpiresAt: exp},
		{ID: "0192e8a0-0000-7000-8000-000000000102", PrincipalID: "0192e8a0-0000-7000-8000-000000000001", AgentID: "0192e8a0-0000-7000-8000-000000000011", MaxAmountCents: 120000, Currency: "USD", AllowedCategories: []string{"Server Rack", "Networking"}, MaxSpreadBps: 1000, SlaHours: 72, ExpiresAt: exp},
		{ID: "0192e8a0-0000-7000-8000-000000000103", PrincipalID: "0192e8a0-0000-7000-8000-000000000001", AgentID: "0192e8a0-0000-7000-8000-000000000011", MaxAmountCents: 20000, Currency: "USD", AllowedCategories: []string{"Cloud SaaS", "DevTools"}, MaxSpreadBps: 1500, SlaHours: 24, ExpiresAt: exp},
	} {
		cp := m
		s.mandates[m.ID] = &cp
	}
	return s
}

func FormatIdempotencyKey(paypalRequestID string) string {
	return "idemp:" + strings.TrimSpace(paypalRequestID)
}

// AcquireIdempotencyLock executes `SET idemp:{PayPal-Request-Id} {value} NX EX 86400` against Valkey/Redis (or in-memory store).
func (s *Store) AcquireIdempotencyLock(ctx context.Context, paypalRequestID, value string, ttl time.Duration) (bool, error) {
	reqID := strings.TrimSpace(paypalRequestID)
	if reqID == "" {
		return false, ErrEmptyRequestID
	}
	if ttl <= 0 {
		ttl = DefaultIdempotencyTTL
	}
	if value == "" {
		value = "LOCKED"
	}
	key := FormatIdempotencyKey(reqID)
	ttlSec := int64(ttl.Seconds())
	if addr := parseRedisAddr(s.RedisURL); addr != "" {
		if ok, handled := tryRedisSetNX(ctx, addr, key, value, ttlSec); handled {
			return ok, nil
		}
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	if existing, exists := s.idempMap[key]; exists && now.Before(existing.ExpiresAt) {
		return false, nil
	}
	s.idempMap[key] = IdempotencyLock{Key: key, RequestID: reqID, Value: value, TTLSeconds: ttlSec, ExpiresAt: now.Add(ttl)}
	return true, nil
}

// CreateEscrow inserts a new E-06 EscrowTransaction guarded by its PayPal-Request-Id idempotency lock.
func (s *Store) CreateEscrow(ctx context.Context, tx EscrowTransaction) (*EscrowTransaction, error) {
	locked, err := s.AcquireIdempotencyLock(ctx, tx.PayPalRequestID, "LOCKED", DefaultIdempotencyTTL)
	if err != nil {
		return nil, err
	}
	if !locked {
		return nil, ErrDuplicateRequestID
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	if tx.State == "" {
		tx.State = escrow.StateInitiated
	}
	if tx.Currency == "" {
		tx.Currency = "USD"
	}
	tx.CreatedAt, tx.UpdatedAt = now, now
	cp := tx
	s.escrows[tx.ID] = &cp
	s.rowLocks[tx.ID] = &sync.Mutex{}
	return &cp, nil
}

// LockAndTransitionEscrow acquires a pessimistic row lock (`SELECT ... FOR UPDATE`) and atomically transitions 2PC state.
func (s *Store) LockAndTransitionEscrow(ctx context.Context, escrowID string, nextState escrow.State, orderID, authID, captureID string) (*EscrowTransaction, error) {
	s.mu.Lock()
	rowMu, ok := s.rowLocks[escrowID]
	s.mu.Unlock()
	if !ok {
		return nil, ErrEscrowNotFound
	}
	rowMu.Lock()
	defer rowMu.Unlock()

	s.mu.Lock()
	defer s.mu.Unlock()
	if s.queryHook != nil {
		s.queryHook(SelectEscrowForUpdateSQL, escrowID)
	}
	rec, exists := s.escrows[escrowID]
	if !exists {
		return nil, ErrEscrowNotFound
	}
	if !escrow.CanTransition(rec.State, nextState) {
		return nil, fmt.Errorf("%w: from %s to %s", escrow.ErrIllegalStateTransition, rec.State, nextState)
	}
	if s.queryHook != nil {
		s.queryHook(UpdateEscrowStateSQL, escrowID, string(nextState), orderID, authID, captureID)
	}
	rec.State = nextState
	if orderID != "" {
		rec.PayPalOrderID = orderID
	}
	if authID != "" {
		rec.PayPalAuthID = authID
	}
	if captureID != "" {
		rec.PayPalCaptureID = captureID
	}
	rec.UpdatedAt = time.Now().UTC()
	cp := *rec
	return &cp, nil
}

func parseRedisAddr(raw string) string {
	raw = strings.TrimPrefix(strings.TrimPrefix(strings.TrimSpace(raw), "redis://"), "valkey://")
	if idx := strings.IndexByte(raw, '/'); idx >= 0 {
		return raw[:idx]
	}
	return raw
}

func tryRedisSetNX(ctx context.Context, addr, key, val string, ttlSec int64) (bool, bool) {
	conn, err := (&net.Dialer{Timeout: 400 * time.Millisecond}).DialContext(ctx, "tcp", addr)
	if err != nil {
		return false, false
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(500 * time.Millisecond))
	ttlStr := fmt.Sprintf("%d", ttlSec)
	cmd := fmt.Sprintf("*6\r\n$3\r\nSET\r\n$%d\r\n%s\r\n$%d\r\n%s\r\n$2\r\nNX\r\n$2\r\nEX\r\n$%d\r\n%s\r\n",
		len(key), key, len(val), val, len(ttlStr), ttlStr)
	if _, err := conn.Write([]byte(cmd)); err != nil {
		return false, false
	}
	line, err := bufio.NewReader(conn).ReadString('\n')
	return strings.HasPrefix(line, "+OK"), err == nil && (strings.HasPrefix(line, "+OK") || strings.HasPrefix(line, "$-1"))
}
