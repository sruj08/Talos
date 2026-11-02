package store

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/talos/services/orchestrator-go/internal/escrow"
)

func TestMigrationSchemaContainsAllEntitiesIndexesAndLocking(t *testing.T) {
	migPath := filepath.Join("..", "..", "migrations", "0001_init_schema.up.sql")
	raw, err := os.ReadFile(migPath)
	if err != nil {
		t.Fatalf("failed to read %s: %v", migPath, err)
	}
	sqlText := string(raw)

	requiredTables := []string{
		"CREATE TABLE IF NOT EXISTS principal_users",
		"CREATE TABLE IF NOT EXISTS agent_identities",
		"CREATE TABLE IF NOT EXISTS kya_mandates",
		"CREATE TABLE IF NOT EXISTS firewall_scan_logs",
		"CREATE TABLE IF NOT EXISTS channel3_benchmarks",
		"CREATE TABLE IF NOT EXISTS escrow_transactions",
		"CREATE TABLE IF NOT EXISTS sla_timeline_tasks",
		"CREATE TABLE IF NOT EXISTS dispute_evidence_bundles",
		"CREATE TABLE IF NOT EXISTS webhook_event_ledger",
		"CREATE TABLE IF NOT EXISTS audit_events",
	}
	for _, tbl := range requiredTables {
		if !strings.Contains(sqlText, tbl) {
			t.Errorf("migration missing table definition: %s", tbl)
		}
	}

	requiredFeatures := []string{
		"uuid_generate_v7()",
		"DEFAULT uuid_generate_v7()",
		"SELECT * INTO v_row FROM escrow_transactions WHERE id = p_escrow_id FOR UPDATE;",
		"trg_audit_events_hash_chain",
		"compute_audit_event_hash()",
		"idx_agent_identities_principal_id",
		"idx_kya_mandates_principal_id",
		"idx_kya_mandates_agent_id",
		"idx_kya_mandates_categories_gin",
		"idx_escrow_mandate_id",
		"idx_escrow_state_created",
		"idx_escrow_paypal_order",
		"idx_escrow_paypal_auth",
		"idx_sla_escrow_id",
		"idx_dispute_escrow_id",
		"idx_webhook_payload_gin",
	}
	for _, feat := range requiredFeatures {
		if !strings.Contains(sqlText, feat) {
			t.Errorf("migration missing required postgres skill feature/index: %s", feat)
		}
	}
}

func TestRedisIdempotencyLockSetNX(t *testing.T) {
	ctx := context.Background()
	s := NewStore("postgres://talos:talos_local_pw@localhost:5432/talos", "")

	ok1, err := s.AcquireIdempotencyLock(ctx, "test-req-1", "LOCKED", DefaultIdempotencyTTL)
	if err != nil || !ok1 {
		t.Fatalf("expected first SetNX lock acquisition to succeed, got ok=%v err=%v", ok1, err)
	}

	ok2, err := s.AcquireIdempotencyLock(ctx, "test-req-1", "LOCKED", DefaultIdempotencyTTL)
	if err != nil {
		t.Fatalf("unexpected error on second SetNX call: %v", err)
	}
	if ok2 {
		t.Fatalf("expected duplicate PayPal-Request-Id lock acquisition to be rejected")
	}

	if _, err := s.AcquireIdempotencyLock(ctx, "   ", "LOCKED", DefaultIdempotencyTTL); !errors.Is(err, ErrEmptyRequestID) {
		t.Fatalf("expected ErrEmptyRequestID for blank request id, got %v", err)
	}
}

func TestLiveValkeyIdempotencyLockIfAvailable(t *testing.T) {
	ctx := context.Background()
	s := NewStore("", "redis://localhost:6379")
	reqID := fmt.Sprintf("live-req-%d", time.Now().UnixNano())

	ok1, err := s.AcquireIdempotencyLock(ctx, reqID, "LOCKED", DefaultIdempotencyTTL)
	if err != nil || !ok1 {
		t.Fatalf("expected first live/fallback SetNX call to succeed: ok=%v err=%v", ok1, err)
	}
	ok2, err := s.AcquireIdempotencyLock(ctx, reqID, "LOCKED", DefaultIdempotencyTTL)
	if err != nil || ok2 {
		t.Fatalf("expected second SetNX call for %s to reject duplicate: ok=%v err=%v", reqID, ok2, err)
	}
}

func TestSelectForUpdateRowLockingAndConcurrent2PCTransitions(t *testing.T) {
	ctx := context.Background()
	s := NewStore("postgres://talos:talos_local_pw@localhost:5432/talos", "")

	var executedSQL []string
	var sqlMu sync.Mutex
	s.queryHook = func(q string, _ ...any) {
		sqlMu.Lock()
		executedSQL = append(executedSQL, q)
		sqlMu.Unlock()
	}

	tx, err := s.CreateEscrow(ctx, EscrowTransaction{
		ID:              "0192e8a0-0000-7000-8000-000000000901",
		MandateID:       "0192e8a0-0000-7000-8000-000000000101",
		PayPalRequestID: "pp-req-901",
		AmountCents:     24900,
		Currency:        "USD",
		State:           escrow.StateInitiated,
	})
	if err != nil {
		t.Fatalf("CreateEscrow failed: %v", err)
	}

	// Duplicate PayPal-Request-Id must fail with ErrDuplicateRequestID
	if _, err := s.CreateEscrow(ctx, EscrowTransaction{
		ID:              "0192e8a0-0000-7000-8000-000000000902",
		MandateID:       tx.MandateID,
		PayPalRequestID: "pp-req-901",
		AmountCents:     24900,
	}); !errors.Is(err, ErrDuplicateRequestID) {
		t.Fatalf("expected ErrDuplicateRequestID, got %v", err)
	}

	// Transition INITIATED -> PAYPAL_AUTHORIZED
	authed, err := s.LockAndTransitionEscrow(ctx, tx.ID, escrow.StatePayPalAuthorized, "ORDER-123", "AUTH-456", "")
	if err != nil {
		t.Fatalf("transition to PAYPAL_AUTHORIZED failed: %v", err)
	}
	if authed.State != escrow.StatePayPalAuthorized || authed.PayPalAuthID != "AUTH-456" {
		t.Fatalf("unexpected state after authorize: %+v", authed)
	}

	// Race 10 goroutines attempting CAPTURE vs VOID concurrently under SELECT ... FOR UPDATE lock
	var wins atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		target := escrow.StatePayPalCaptured
		if i%2 == 1 {
			target = escrow.StatePayPalVoided
		}
		go func(next escrow.State) {
			defer wg.Done()
			if _, err := s.LockAndTransitionEscrow(ctx, tx.ID, next, "", "", "CAP-789"); err == nil {
				wins.Add(1)
			}
		}(target)
	}
	wg.Wait()

	if wins.Load() != 1 {
		t.Fatalf("expected exactly 1 concurrent terminal transition (CAPTURE vs VOID) to succeed under FOR UPDATE lock, got %d", wins.Load())
	}

	sqlMu.Lock()
	defer sqlMu.Unlock()
	if len(executedSQL) == 0 || !strings.Contains(executedSQL[0], "FOR UPDATE") {
		t.Fatalf("expected SelectEscrowForUpdateSQL with FOR UPDATE to be executed, got %v", executedSQL)
	}
}
