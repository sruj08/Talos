# Project: TALOS — Autonomous Zero-Trust AI Agent Commerce, Escrow & Prompt-Injection Firewall (Phases 1–6 / `TASK-01`..`TASK-12`)

## Architecture
TALOS is a polyglot monorepo implementing a cryptographic Know-Your-Agent (KYA) mandate firewall, streaming DOM prompt-injection sanitizer, fair-market price oracle, two-phase commit (2PC) PayPal Sandbox escrow engine, and real-time institutional command center:
1. **Rust Zero-Trust KYA & Prompt-Injection Firewall (`services/firewall-rs`)**: Axum + `rmcp` MCP server (`:8081` & `--mcp-stdio`) performing `<1ms` `Ed25519` + RFC 9421 mandate signing/verification, PayPal Webhook CRC32/signature verification, and `<4ms` `lol_html` + `aho-corasick` + `DeBERTa-v3` ONNX streaming DOM prompt-injection sanitization.
2. **APIMatic Go PayPal Sandbox SDK (`sdk/paypal-go-apimatic`)**: Strongly-typed Go SDK for PayPal Sandbox OAuth2 (`/v1/oauth2/token`), Orders v2 (`AUTHORIZE`), Payments v2 (`CAPTURE`, `VOID`), Shipment Tracking v1 (`/v1/shipping/trackers-batch`), and Customer Disputes v1 (`/v1/customer/disputes/{id}/provide-evidence`) with mandatory `PayPal-Request-Id` idempotency headers, exponential backoff retry, and deterministic replay fallback.
3. **Go 2PC Escrow & Sponsor Orchestrator (`services/orchestrator-go`)**: Chi HTTP + WebSocket server (`:8080`) with PostgreSQL 16 9-table ledger (`E-01`..`E-09`) + SHA-256 hash chain, Redis/Valkey 24h `SetNX` idempotency locks (`E-10`), concurrency-safe 2PC Escrow State Machine, `errgroup` parallel checkout evaluation (Rust Firewall + Channel3 Fair-Price Oracle + KERNEL Browser Inspector -> PayPal `Orders v2 AUTHORIZE`), Shipment Tracking auto-capture, Disputes evidence submission, and WebSocket event hub (`/ws/events`).
4. **Next.js 15 Obsidian Command Center (`web/`)**: React 19 dark-mode console featuring the 4-KPI Header Bar, interactive `Ed25519` `MandateStudio`, live `useEscrowStream` WebSocket/CustomEvent hook, `AgStudioBlotter` (AG Grid Enterprise v33 + `ForensicDetailPanel` Master-Detail drawer + AG Studio AI Copilot with 4 presets), `BryntumSlaBoard` (Bryntum Scheduler Pro v6 two-way payment-reactive timeline bound to PayPal `AUTHORIZE`, `CAPTURE`, and `VOID`), `PayPalStepUpModal` (PayPal JS SDK v6 co-sign modal for `>$300` orders), `PoisonedStoreSim` (3-Act Judge Simulator), and `/api/mcp/paypal-bridge` (`@paypal/agent-toolkit` + `@paypal/paypal-server-sdk` + APIMatic Context validation).

## Feature Inventory
Every feature from the Survey phase appears below with its assigned milestone. Zero features are left unassigned.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | MIT License, Docker Compose & Graphify Gate (`TASK-01`) | Root MIT `LICENSE`, `docker-compose.yml` (Postgres 16 + Valkey 7.2), `render.yaml`, `.planning/graphs/graph.json`, and `MAP.md`. | M1, M4 | Survey (`TASK-01`) |
| F2 | PostgreSQL 16 9-Table Ledger (`E-01`..`E-09`) & SHA-256 Hash Chain (`TASK-02`) | Relational schema in `0001_init_schema.up.sql` with 9 tables, `audit_events` hash-chain trigger, `BIGINT` `_cents`, UUIDv7 PKs, and `FOR UPDATE` locks. | M2 | Survey (`TASK-02`) |
| F3 | Redis/Valkey 24h `PayPal-Request-Id` Idempotency Lock (`E-10`, `TASK-02`) | `AcquireIdempotencyLock` (`SetNX` 86400s TTL) and idempotent result caching in `services/orchestrator-go/internal/store/store.go`. | M2 | Survey (`TASK-02`) |
| F4 | Rust `Ed25519` KYA Mandate Signer & Verifier + RFC 9421 (`F-01`, `API-01`, `API-02`, `TASK-03`) | Genuine `ed25519-dalek` signing and `<1ms` verification of `KyaMandate` (`max_amount_cents`, `allowed_categories`, `max_spread_bps`, `sla_hours`, `expires_at`, `step_up_required`) + RFC 9421 headers in `mandate.rs`. | M1 | Survey (`TASK-03`) |
| F5 | Rust PayPal Webhook CRC32 & Signature Verifier (`API-04`, `TASK-03`) | Verifies `PAYPAL-TRANSMISSION-SIG` and `crc32fast` checksum in `services/firewall-rs/src/webhook_verify.rs`. | M1 | Survey (`TASK-03`) |
| F6 | Streaming `lol_html` + `DeBERTa-v3` ONNX DOM Prompt-Injection Sanitizer (`F-02`, `API-03`, `M-01`, `TASK-04`) | Strips `display:none`, `opacity:0`, `visibility:hidden`, `font-size:0`, HTML comments `<!-- ... -->`, zero-width Unicode (`U+200B..U+200F`), and Unicode tags (`U+E0000..U+E007F`), scoring threats in `<4ms` in `sanitizer.rs`. | M1 | Survey (`TASK-04`) |
| F7 | Official Rust MCP Server (`F-03`, `rmcp`, `TASK-04`) | Exposes MCP tools (`talos_issue_mandate`, `talos_verify_mandate`, `talos_sanitize_dom`, `talos_execute_protected_checkout`) over `stdio` (`--mcp-stdio`) and HTTP (`/mcp`, `/mcp/sse`) in `mcp_server.rs` & `main.rs`. | M1 | Survey (`TASK-04`) |
| F8 | Strongly-Typed APIMatic Go PayPal Sandbox SDK (`F-05`, `TASK-05`) | `sdk/paypal-go-apimatic` client for live PayPal Sandbox OAuth2 (`/v1/oauth2/token`), `Orders v2 AUTHORIZE`, `Authorizations CAPTURE`/`VOID`, `Tracking v1`, and `Disputes v1` with `PayPal-Request-Id`, retry backoff, APIMatic manifests, and deterministic fallback. | M2 | Survey (`TASK-05`) |
| F9 | Go 2PC Escrow State Machine (`F-05`, `F-06`, `API-07`, `API-09`, `API-10`, `TASK-06`) | Concurrency-safe 2PC state machine in `internal/escrow/machine.go` and `internal/paypal/service.go` enforcing legal state transitions and idempotent `PayPal-Request-Id` capture/void caching. | M2 | Survey (`TASK-06`) |
| F10 | Channel3 Fair-Market Price Oracle (`F-04`, `API-06`) & KERNEL Cloud Browser Inspector (`F-11`, `TASK-07`) | Live Channel3 API (`POST /v1/search` with `x-api-key`) + 25-SKU catalog fallback computing `spread_bps` (`+9277 bps` on `$480` Shure SM7B vs `$249` median -> gouging block & reroute) in `oracle.go`, and KERNEL API (`/browsers`) + Poisoned DOM fallback in `browser.go`. | M2 | Survey (`TASK-07`) |
| F11 | Unified Protected Checkout (`API-05`), Tracking v1 (`API-08`), Disputes v1 (`API-11`), Blotter/Timeline (`API-12`..`API-14`) & WS Hub (`API-15`, `TASK-08`) | Parallel `errgroup` checkout evaluation, auto-capture on `DELIVERED`, dispute evidence packaging, blotter/SLA timeline endpoints, and `/ws/events` WebSocket broadcaster in `services/orchestrator-go`. | M2 | Survey (`TASK-08`) |
| F12 | Next.js 15 Obsidian Command Center Shell, `MandateStudio.tsx` & `useEscrowStream.ts` (`TASK-09`) | 4-KPI header bar (`Protected GMV`, `Blocked Prompt Injections`, `Channel3 Savings`, `Active PayPal Authorizations`), interactive `Ed25519` Mandate Studio (`$300` cap, `15%` spread, `48h` SLA), and live WebSocket + CustomEvent hook. | M3 | Survey (`TASK-09`) |
| F13 | `AgStudioBlotter.tsx` & `ForensicDetailPanel.tsx` (`F-08`, `TASK-10`) | AG Grid Enterprise v33 live blotter (`applyTransactionAsync`, `enableCellChangeFlash`, Status/Side Bar), AG Studio AI Copilot command bar + 4 presets, and Master-Detail forensic drawer (DOM diff, Channel3 bar chart, 1-click Capture/Void/Dispute). | M3 | Survey (`TASK-10`) |
| F14 | `BryntumSlaBoard.tsx` Two-Way Payment-Reactive Timeline (`F-07`, `API-13`, `TASK-11`) | Multi-vendor procurement lanes, 29-day PayPal `AUTHORIZE` hold / 72h honor bar, 48h Carrier SLA bar, `EndToStart` project dependencies, and two-way reactivity (`DELIVERED` -> `CAPTURED` unlock; SLA drag/breach -> PayPal `VOID` + Channel3 backup reroute). | M3 | Survey (`TASK-11`) |
| F15 | `PayPalStepUpModal.tsx` (`F-09`), `PoisonedStoreSim.tsx` (`F-11`) & `@paypal/agent-toolkit` Bridge (`API-16`, `TASK-12`) | PayPal JS SDK v6 (`@paypal/react-paypal-js`) step-up co-sign modal for `>$300` orders, 3-Act Judge Simulator (Act 1 Attack Block, Act 2 Happy Path Capture, Act 3 SLA Breach Void + Step-Up), and `/api/mcp/paypal-bridge` route. | M3 | Survey (`TASK-12`) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | `M1_rust_firewall` | Phase 1 (`TASK-01` check) & Phase 2 (`TASK-03`, `TASK-04`): Configure `x86_64-pc-windows-gnu` linker (`C:\msys64\ucrt64\bin`), implement `mandate.rs`, `webhook_verify.rs`, `sanitizer.rs`, `mcp_server.rs`, `main.rs`, and pass `cargo test` & `cargo clippy -- -D warnings`. | none | DONE |
| M2 | `M2_go_sdk_and_orchestrator` | Phase 1 (`TASK-02`), Phase 3 (`TASK-05`, `TASK-06`), & Phase 4 (`TASK-07`, `TASK-08`): Implement `sdk/paypal-go-apimatic` (with live `.env` OAuth2 verification + fallback) and `services/orchestrator-go` (`escrow`, `paypal`, `channel3`, `kernel`, `ws`, `handlers`, `cmd/server`), passing `go test -race ./...` in both modules. | none | DONE |
| M3 | `M3_web_command_center` | Phase 5 (`TASK-09`, `TASK-10`) & Phase 6 (`TASK-11`, `TASK-12`): Implement `page.tsx`, `MandateStudio.tsx`, `useEscrowStream.ts`, `AgStudioBlotter.tsx`, `ForensicDetailPanel.tsx`, verify & polish Phase 6 (`useBryntumTimeline.ts` `<250L`, `.mcp.json`), and pass `npx tsc --noEmit`, `npm test`, and `npm run build`. | none | DONE |
| E2E | `E2E_testing_track` | Requirement-driven opaque-box E2E test suite (`TEST_INFRA.md`, `TEST_READY.md`, `tests/e2e_phase1_6/`) covering Tiers 1–4 across all 15 features (`TASK-01`..`TASK-12`) and live `.env` verification without secret leaks. | none | DONE |
| M4 | `M4_final_integration_and_e2e` | Final Milestone: Sync all changes to `build/talos/`, update `.agent/tasks.json` + `.agent/tasks/TASK-01..12.json` (`passes: true`) + Graphify index, pass 100% of E2E tests (Phase 1: Tiers 1–4) + Adversarial Hardening (Phase 2: Tier 5) + Forensic Audit, and verify `git rev-parse HEAD` is unchanged. | M1, M2, M3, E2E | DONE |

## Interface Contracts

### `services/firewall-rs` (`:8081`) ↔ `services/orchestrator-go` (`:8080`) & `web/` (`:3000`)
- `POST /v1/mandates/sign` (and alias `POST /v1/firewall/mandate/sign`):
  - Request: `{ principal_id?, agent_id?, max_amount_cents, currency?, allowed_categories, max_spread_bps?, sla_hours?, expires_at? / expiry_utc? }`
  - Response (`200`/`201`): `{ mandate_id, principal_id, agent_id, max_amount_cents, allowed_categories, max_spread_bps, sla_hours, expires_at, ed25519_pubkey_hex, ed25519_signature_hex, rfc9421_signature_input, status: "ACTIVE" }`
- `POST /v1/mandates/verify` (and alias `POST /v1/firewall/mandate/verify`):
  - Request: `{ mandate, requested_amount_cents, merchant_category, observed_spread_bps?, rfc9421_signature_input?, rfc9421_signature? }`
  - Response (`200`): `{ valid: bool, reason: string, step_up_required: bool, verification_latency_us: u64 }`
- `POST /v1/firewall/sanitize-dom`:
  - Request: `{ merchant_url, raw_html }`
  - Response (`200`): `{ scan_id, merchant_url, raw_dom_hash, sanitized_dom, sanitized_html, injection_detected: bool, risk_score: f64, deberta_label: string, stripped_payloads: [{ selector, rule_id, excerpt }], latency_us: u64 }`
- `POST /v1/firewall/verify-webhook` (and alias `POST /v1/firewall/webhook/verify`):
  - Request: `{ transmission_id, transmission_time?, cert_url?, auth_algo?, transmission_sig, webhook_id, raw_body, expected_crc32? }`
  - Response (`200`): `{ verified: bool, crc32_verified: bool, rsa_sig_verified: bool, crc32_decimal: u32, latency_us: u64 }`
- `POST /mcp` & `GET /mcp/sse` (plus `--mcp-stdio`):
  - JSON-RPC 2.0 `tools/list` and `tools/call` for `talos_issue_mandate`, `talos_verify_mandate`, `talos_sanitize_dom`, `talos_execute_protected_checkout`.

### `sdk/paypal-go-apimatic` ↔ `services/orchestrator-go`
- `Client.AcquireOAuthToken(ctx)` -> `(*OAuthToken, error)` (live `https://api-m.sandbox.paypal.com/v1/oauth2/token` when `.env` credentials present, with token caching and deterministic fallback).
- `Client.CreateOrder(ctx, req, requestID)` & `Client.AuthorizeOrder(ctx, orderID, requestID)` -> `(*OrderAuthorizationResponse, error)`
- `Client.CaptureAuthorization(ctx, authID, amountCents, currency, requestID)` -> `(*CaptureResponse, error)`
- `Client.VoidAuthorization(ctx, authID, requestID)` -> `(*VoidResponse, error)`
- `Client.CreateTrackingBatch(ctx, req, requestID)` -> `(*TrackingBatchResponse, error)`
- `Client.ProvideDisputeEvidence(ctx, disputeID, req, requestID)` -> `(*DisputeEvidenceResponse, error)`

### `services/orchestrator-go` (`:8080`) ↔ `web/` (`:3000`)
- `POST /api/v1/checkout/evaluate` (and alias `POST /api/v1/escrow/checkout`) (`API-05`)
- `POST /api/v1/channel3/benchmark` (`API-06`)
- `POST /api/v1/escrow/{id}/authorize` (`API-07`) & `POST /api/v1/escrow/{id}/step-up-approve`
- `POST /api/v1/escrow/{id}/tracking` (`API-08`)
- `POST /api/v1/escrow/{id}/capture` (`API-09`)
- `POST /api/v1/escrow/{id}/void` (`API-10`)
- `POST /api/v1/escrow/{id}/dispute-evidence` (`API-11`)
- `GET /api/v1/escrow/blotter` (`API-12`)
- `GET /api/v1/sla/timeline` & `PATCH /api/v1/sla/timeline/{task_id}` (`API-13`)
- `POST /api/v1/webhooks/paypal` (`API-14`)
- `GET /ws/events` (and alias `GET /ws/escrow-stream`) (`API-15`)

## Code Layout & Write Ownership
Every source file must remain `< 250 lines` per `CLAUDE.md` §5. Concurrent milestones have strictly disjoint write ownership:
- **M1 (`M1_rust_firewall`) owns**: `g:\PAYPAL\services\firewall-rs\**`
- **M2 (`M2_go_sdk_and_orchestrator`) owns**: `g:\PAYPAL\sdk\paypal-go-apimatic\**` and `g:\PAYPAL\services\orchestrator-go\**`
- **M3 (`M3_web_command_center`) owns**: `g:\PAYPAL\web\**` and `g:\PAYPAL\.mcp.json`
- **E2E (`E2E_testing_track`) owns**: `g:\PAYPAL\TEST_INFRA.md`, `g:\PAYPAL\TEST_READY.md`, and `g:\PAYPAL\tests\e2e_phase1_6\**`
- **M4 (`M4_final_integration_and_e2e`) owns**: syncing `g:\PAYPAL\build\talos\**`, `g:\PAYPAL\.agent\**`, `g:\PAYPAL\.planning\**`, and running final E2E + Tier 5 hardening after M1–M3 and E2E complete.
