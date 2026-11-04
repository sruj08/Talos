# TALOS — End-to-End Test Infrastructure (`TEST_INFRA.md`)

## 1. Overview & Scope
This document defines the requirement-driven opaque-box End-to-End (E2E) test infrastructure for **TALOS — Autonomous Zero-Trust AI Agent Commerce, Escrow & Prompt-Injection Firewall** across **Phases 1 through 6 (`TASK-01` through `TASK-12`, Features `F1` through `F15`)**.

All tests reside under `g:\PAYPAL\tests\e2e_phase1_6\`, with every script strictly under **250 lines** per `CLAUDE.md` §5, and execute deterministically via:
```powershell
powershell -ExecutionPolicy Bypass -File g:\PAYPAL\tests\e2e_phase1_6\run_e2e.ps1
```

## 2. Zero-Secret-Leak `.env` Verification Protocol
Per `ORIGINAL_REQUEST.md` (R2) and `CLAUDE.md` §4 (`credentials` skill):
- `run_e2e.ps1` loads `g:\PAYPAL\.env` into process memory to authenticate live sandbox probes (`https://api-m.sandbox.paypal.com/v1/oauth2/token`, `https://api.trychannel3.com/v1/search`, `https://api.onkernel.com/browsers`, `https://mcp.bryntum.com/mcp`) and local services.
- **No secret value, API key, or OAuth Bearer token from `.env` is ever printed, logged, or echoed** to stdout, stderr, or any file. Verification assertions report only boolean presence (`PRESENT` / `MISSING`), HTTP status codes (`200`, `201`, `202`, `204`, `422`), and structural fields (`token_type == "Bearer"`, `expires_in > 0`).

## 3. Runtime Service Topology Under Test
| Service | Directory | Port | Health Endpoint | Primary Interfaces Tested |
| :--- | :--- | :---: | :--- | :--- |
| **Rust Zero-Trust Firewall & MCP Kernel** | `services/firewall-rs` | `:8081` | `GET /healthz` | `API-01` (`/v1/mandates/sign`), `API-02` (`/v1/mandates/verify`), `API-03` (`/v1/firewall/sanitize-dom`), `API-04` (`/v1/firewall/verify-webhook`), `/mcp`, `/mcp/sse`, `--mcp-stdio` |
| **APIMatic Go PayPal Sandbox SDK** | `sdk/paypal-go-apimatic` | Library | `go test ./...` | OAuth2 `/v1/oauth2/token`, `Orders v2 AUTHORIZE`, `Payments v2 CAPTURE/VOID`, `Tracking v1`, `Disputes v1`, `PayPal-Request-Id` idempotency |
| **Go 2PC Escrow & Sponsor Orchestrator** | `services/orchestrator-go` | `:8080` | `GET /healthz` | `API-05` (`/api/v1/checkout/evaluate`), `API-06` (`/api/v1/channel3/benchmark`), `API-07`..`API-11` (`/api/v1/escrow/{id}/*`), `API-12` (`/api/v1/escrow/blotter`), `API-13` (`/api/v1/sla/timeline`), `API-14` (`/api/v1/webhooks/paypal`), `API-15` (`/ws/events`) |
| **Next.js 15 Obsidian Command Center** | `web/` | `:3000` | `npm test` / `build` | `page.tsx`, `MandateStudio.tsx`, `useEscrowStream.ts`, `AgStudioBlotter.tsx`, `ForensicDetailPanel.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`, `PoisonedStoreSim.tsx`, `API-16` (`/api/mcp/paypal-bridge`) |

`run_e2e.ps1` automatically detects running instances on `:8081` and `:8080` or spawns ephemeral background instances for the duration of the test run and cleanly terminates any child processes in its `finally` block.

## 4. Modular Test Suite Layout (`g:\PAYPAL\tests\e2e_phase1_6\`)
Every file in `tests/e2e_phase1_6/` is strictly `< 250 lines`:

| File | Purpose | Tier | Test Cases | Line Limit |
| :--- | :--- | :---: | :---: | :---: |
| `run_e2e.ps1` | Master orchestrator: loads `.env` safely, manages ephemeral `:8081`/`:8080` services, runs Tiers 1–4, prints summary | All | Runner | `< 250` |
| `lib_assert.ps1` | Shared assertion engine, safe `.env` parser, HTTP/JSON-RPC client helpers with route fallback | Shared | Helper | `< 250` |
| `tier1_f1_f5.ps1` | Tier 1 happy-path tests for `F1`–`F5` (`TASK-01`, `TASK-02`, `TASK-03`) | Tier 1 | `25` (`5 × 5`) | `< 250` |
| `tier1_f6_f10.ps1` | Tier 1 happy-path tests for `F6`–`F10` (`TASK-04`, `TASK-05`, `TASK-06`, `TASK-07`) | Tier 1 | `25` (`5 × 5`) | `< 250` |
| `tier1_f11_f15.ps1` | Tier 1 happy-path tests for `F11`–`F15` (`TASK-08`, `TASK-09`, `TASK-10`, `TASK-11`, `TASK-12`) | Tier 1 | `25` (`5 × 5`) | `< 250` |
| `tier2_f1_f5.ps1` | Tier 2 boundary & corner case tests for `F1`–`F5` | Tier 2 | `25` (`5 × 5`) | `< 250` |
| `tier2_f6_f10.ps1` | Tier 2 boundary & corner case tests for `F6`–`F10` | Tier 2 | `25` (`5 × 5`) | `< 250` |
| `tier2_f11_f15.ps1` | Tier 2 boundary & corner case tests for `F11`–`F15` | Tier 2 | `25` (`5 × 5`) | `< 250` |
| `tier3_pairwise.ps1` | Tier 3 cross-feature pairwise interaction tests across Rust, Go SDK, Go Orchestrator, and Web | Tier 3 | `16` (`>= 15`) | `< 250` |
| `tier4_scenarios.ps1` | Tier 4 real-world end-to-end scenarios (Scenarios 1–8 including 3-Act Judge Demo & live `.env` checks) | Tier 4 | `10` (`>= 8`) | `< 250` |
| **Total** | **Full 4-Tier Automated E2E Suite** | **Tiers 1–4** | **`176` (`>= 173`)** | **All `< 250L`** |

## 5. 4-Tier Feature Coverage Matrix (`F1`–`F15` / `TASK-01`–`TASK-12`)
| Feature ID | Task ID | Feature Name | Tier 1 (Happy Path) | Tier 2 (Boundary / Edge) | Tier 3 (Pairwise) | Tier 4 (E2E Scenario) |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| **F1** | `TASK-01` | MIT License, Docker Compose & Graphify Gate | `T1-F1-01..05` (5) | `T2-F1-01..05` (5) | `T3-01`, `T3-15` | `T4-S8` |
| **F2** | `TASK-02` | PostgreSQL 16 9-Table Ledger (`E-01`..`E-09`) & SHA-256 Hash Chain | `T1-F2-01..05` (5) | `T2-F2-01..05` (5) | `T3-02`, `T3-08` | `T4-S5` |
| **F3** | `TASK-02` | Redis/Valkey 24h `PayPal-Request-Id` Idempotency Lock (`E-10`) | `T1-F3-01..05` (5) | `T2-F3-01..05` (5) | `T3-02`, `T3-06` | `T4-S2`, `T4-S3` |
| **F4** | `TASK-03` | Rust `Ed25519` KYA Mandate Signer/Verifier & RFC 9421 (`API-01`, `API-02`) | `T1-F4-01..05` (5) | `T2-F4-01..05` (5) | `T3-03`, `T3-04`, `T3-11` | `T4-S1`, `T4-S4` |
| **F5** | `TASK-03` | Rust PayPal Webhook CRC32 & Signature Verifier (`API-04`) | `T1-F5-01..05` (5) | `T2-F5-01..05` (5) | `T3-05`, `T3-10` | `T4-S2` |
| **F6** | `TASK-04` | Streaming `lol_html` + `DeBERTa-v3` ONNX DOM Sanitizer (`API-03`) | `T1-F6-01..05` (5) | `T2-F6-01..05` (5) | `T3-03`, `T3-07`, `T3-12` | `T4-S1`, `T4-S7` |
| **F7** | `TASK-04` | Official Rust MCP Server (`rmcp`, `/mcp`, `/mcp/sse`, `--mcp-stdio`) | `T1-F7-01..05` (5) | `T2-F7-01..05` (5) | `T3-04`, `T3-16` | `T4-S1` |
| **F8** | `TASK-05` | Strongly-Typed APIMatic Go PayPal Sandbox SDK (`sdk/paypal-go-apimatic`) | `T1-F8-01..05` (5) | `T2-F8-01..05` (5) | `T3-06`, `T3-09`, `T3-14` | `T4-S2`, `T4-S6` |
| **F9** | `TASK-06` | Go 2PC Escrow State Machine (`API-07`, `API-09`, `API-10`) | `T1-F9-01..05` (5) | `T2-F9-01..05` (5) | `T3-06`, `T3-08`, `T3-13` | `T4-S2`, `T4-S3` |
| **F10** | `TASK-07` | Channel3 Fair-Market Price Oracle (`API-06`) & KERNEL Browser (`F-11`) | `T1-F10-01..05` (5) | `T2-F10-01..05` (5) | `T3-07`, `T3-09` | `T4-S1`, `T4-S2`, `T4-S6` |
| **F11** | `TASK-08` | Unified Checkout (`API-05`), Tracking (`API-08`), Disputes (`API-11`), Blotter/SLA (`API-12`..`14`) & WS (`API-15`) | `T1-F11-01..05` (5) | `T2-F11-01..05` (5) | `T3-08`, `T3-10`, `T3-13` | `T4-S1`..`T4-S5` |
| **F12** | `TASK-09` | Next.js 15 Obsidian Shell, `MandateStudio.tsx` & `useEscrowStream.ts` | `T1-F12-01..05` (5) | `T2-F12-01..05` (5) | `T3-11`, `T3-12` | `T4-S4`, `T4-S7` |
| **F13** | `TASK-10` | `AgStudioBlotter.tsx` & `ForensicDetailPanel.tsx` (`F-08`) | `T1-F13-01..05` (5) | `T2-F13-01..05` (5) | `T3-12`, `T3-13`, `T3-14` | `T4-S7` |
| **F14** | `TASK-11` | `BryntumSlaBoard.tsx` Two-Way Payment-Reactive Timeline (`F-07`, `API-13`) | `T1-F14-01..05` (5) | `T2-F14-01..05` (5) | `T3-13`, `T3-15` | `T4-S2`, `T4-S3` |
| **F15** | `TASK-12` | `PayPalStepUpModal.tsx`, `PoisonedStoreSim.tsx` & `/api/mcp/paypal-bridge` (`API-16`) | `T1-F15-01..05` (5) | `T2-F15-01..05` (5) | `T3-14`, `T3-16` | `T4-S1`, `T4-S3`, `T4-S4` |
