# Phase 1 Plan 02 Summary — PostgreSQL 16 Schema & Redis Idempotency Locks (TASK-02)

**Status:** Complete
**Executed:** 2026-11-02
**Task ID:** `TASK-02`

## Summary of Changes

1. **PostgreSQL 16 Schema Review & Upgrade ([`services/orchestrator-go/migrations/0001_init_schema.up.sql`](file:///g:/PAYPAL/services/orchestrator-go/migrations/0001_init_schema.up.sql))**:
   - Applied the `postgres` skill guidelines (`schema-design.md`, `indexing.md`, `mvcc-transactions.md`):
     - Added RFC 9562 time-ordered `uuid_generate_v7()` PL/pgSQL generator alongside `uuid-ossp` (`uuid_generate_v4()`) and set `UUID PRIMARY KEY DEFAULT uuid_generate_v7()` across all 9 canonical entity tables (`E-01`..`E-09`) to prevent B-Tree page-split fragmentation on high-velocity inserts.
     - Verified all 9 canonical tables (`principal_users`, `agent_identities`, `kya_mandates`, `firewall_scan_logs`, `channel3_benchmarks`, `escrow_transactions`, `sla_timeline_tasks`, `dispute_evidence_bundles`, `webhook_event_ledger`) plus the immutable `audit_events` table (`F-14`) with `trg_audit_events_hash_chain` SHA-256 hash-chaining.
     - Added `lock_and_transition_escrow` PL/pgSQL function enforcing row-level `SELECT ... FROM escrow_transactions WHERE id = p_escrow_id FOR UPDATE` locking before state transitions and writing immutable `audit_events` entries.
     - Added 22 B-Tree, partial, composite, and GIN indexes covering all foreign keys (`agent_identities.principal_id`, `kya_mandates.principal_id`, `kya_mandates.agent_id`, `firewall_scan_logs.mandate_id`, `escrow_transactions.mandate_id`, `escrow_transactions.firewall_scan_id`, `escrow_transactions.channel3_benchmark_id`, `sla_timeline_tasks.dependency_task_id`, `dispute_evidence_bundles.escrow_id`), composite state/timestamp sorting, and JSONB/array columns.
     - Added deterministic, idempotent (`ON CONFLICT (id) DO NOTHING`) demo seed data for Buyer, Merchant, Agent Identity, and 3 baseline KYA mandates (`$500`, `$5,000`, `$250`).

2. **Go Persistence & Idempotency Store ([`services/orchestrator-go/internal/store/store.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/store/store.go))**:
   - Implemented domain entity structs (`PrincipalUser`, `AgentIdentity`, `KyaMandate`, `EscrowTransaction`, `IdempotencyLock`).
   - Defined canonical `SelectEscrowForUpdateSQL` (`SELECT ... FROM escrow_transactions WHERE id = $1 FOR UPDATE`) and `UpdateEscrowStateSQL` queries.
   - Implemented `AcquireIdempotencyLock` executing `SET idemp:{PayPal-Request-Id} {value} NX EX 86400` against live Valkey/Redis over RESP2 TCP with thread-safe in-memory fallback.
   - Implemented `LockAndTransitionEscrow` acquiring per-escrow row locks and validating transitions via `escrow.CanTransition`.

3. **Unit & Concurrency Race Tests ([`services/orchestrator-go/internal/store/store_test.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/store/store_test.go))**:
   - Verified `0001_init_schema.up.sql` DDL completeness, index coverage, and `FOR UPDATE` locking semantics.
   - Verified in-memory and live Valkey `SET NX EX 86400` idempotency lock acquisition and duplicate rejection.
   - Verified 10 concurrent goroutines racing `CAPTURE` vs `VOID` transitions on a single `AUTHORIZED_LOCKED` escrow under `LockAndTransitionEscrow` result in exactly 1 winner and 9 deterministic state rejections with zero data races (`go test -race`).
