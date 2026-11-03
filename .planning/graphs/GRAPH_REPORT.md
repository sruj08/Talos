# GSD-Graphify Knowledge Graph Report — TALOS

- **Generated At**: `2026-11-03T18:20:00+05:30`
- **Total Indexed Nodes**: `194` files & canonical artifacts
- **Total Architectural Edges**: `37` primary cross-module contracts
- **Leiden Communities**: `8` (`C-01`..`C-08`)

---

## 1. Top God Nodes (Highest-Centrality Hubs)
When an AI coding agent or developer starts any task, inspect the relevant God Node first instead of scanning the filesystem:

| Rank | Node Path | Community | Role & Why It Matters |
| :---: | :--- | :---: | :--- |
| **1** | [`MAP.md`](file:///d:/Hackathons/PayPal/Talos/MAP.md) | `C-06` | Master O(1) lookup index mapping every user prompt/intent to the exact file, symbol, endpoint, or database table. |
| **2** | [`docs/00-overview/PROJECT_BRIEF.md`](file:///d:/Hackathons/PayPal/Talos/docs/00-overview/PROJECT_BRIEF.md) | `C-07` | Canonical ID registry (`F-01`..`F-14`, `P-01`..`P-04`, `E-01`..`E-10`, `API-01`..`API-16`, `M-01`..`M-04`, `R-01`..`R-06`). |
| **3** | [`docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`](file:///d:/Hackathons/PayPal/Talos/docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md) | `C-06` | Step-by-step 8-Phase / 16-Task execution guide with `[HUMAN ACTION REQUIRED]` gates and `/gsd-*` + `/ralph-loop` commands. |
| **4** | [`services/orchestrator-go/internal/escrow/machine.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/escrow/machine.go) | `C-02` | Core Go 1.24 2PC state machine coordinating Channel3, PayPal `AUTHORIZE`/`CAPTURE`/`VOID`, Tracking v1, and Disputes v1. |
| **5** | [`services/firewall-rs/src/main.rs`](file:///d:/Hackathons/PayPal/Talos/services/firewall-rs/src/main.rs) | `C-01` | Core Rust 1.85 security data plane combining `mandate.rs`, `sanitizer.rs`, `webhook_verify.rs`, and `mcp_server.rs`. |
| **6** | [`api/openapi.yaml`](file:///d:/Hackathons/PayPal/Talos/api/openapi.yaml) | `C-04` | Complete OpenAPI 3.1 contract for `API-01`..`API-16` and schemas `E-01`..`E-10`. |
| **7** | [`services/orchestrator-go/migrations/0001_init_schema.up.sql`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/migrations/0001_init_schema.up.sql) | `C-04` | PostgreSQL 16 schema with `BIGINT` `_cents` columns and the `trg_audit_events_hash_chain` SHA-256 trigger. |
| **8** | [`web/src/app/page.tsx`](file:///d:/Hackathons/PayPal/Talos/web/src/app/page.tsx) | `C-03` | Next.js 15 Command Center hosting `MandateStudio`, `PoisonedStoreSim`, `AgStudioBlotter`, `BryntumSlaBoard`, and `PayPalStepUpModal`. |

---

## 2. Community Cluster Breakdown (`C-01`..`C-08`)
| Community ID | Cluster Name | Primary Directory Scope | Key Files |
| :--- | :--- | :--- | :--- |
| **`C-01`** | **Rust Security Data Plane** | `services/firewall-rs/`, `tests/redteam/`, `docs/04-ai/` | `mandate.rs`, `sanitizer.rs`, `mcp_server.rs`, `webhook_verify.rs`, `MODELS.md`, `PROMPTS.md` |
| **`C-02`** | **Go 2PC Control Plane & APIMatic SDK** | `services/orchestrator-go/`, `sdk/paypal-go-apimatic/`, `postman/` | `machine.go`, `oracle.go`, `browser.go`, `hub.go`, `api.go`, `checkout.go`, `sla_blotter.go`, `orders_v2.go`, `payments_v2.go`, `tracking_v1.go`, `disputes_v1.go` |
| **`C-03`** | **Next.js 15 FinOps Command Center** | `web/` | `AgStudioBlotter.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`, `PoisonedStoreSim.tsx`, `ForensicDetailPanel.tsx` |
| **`C-04`** | **Ledger Schemas & API Contracts** | `api/`, `services/orchestrator-go/migrations/`, `docs/03-engineering/` | `openapi.yaml`, `0001_init_schema.up.sql`, `DATA_MODEL.md`, `API_SPEC.md` |
| **`C-05`** | **Sponsor & Sandbox Integration Guides** | `docs/09-integrations-and-guides/` | `00-TRACKS_AND_SUBMISSION_STRATEGY.md` .. `09-KERNEL_ASTROPODS_ZAPIER_GUIDE.md` |
| **`C-06`** | **GSD & Ralph Loop Execution Engine** | `.planning/`, `.agent/`, `docs/08-project/` | `PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`, `tasks.json`, `TASK-01.json`..`TASK-16.json`, `ROADMAP.md` |
| **`C-07`** | **Product, Design & Business Strategy** | `docs/00-overview/`, `docs/01-product/`, `docs/02-design/`, `docs/07-business/` | `PROJECT_BRIEF.md`, `PRD.md`, `PITCH.md`, `UI_SPEC.md`, `BUSINESS_MODEL.md` |
| **`C-08`** | **DevOps, Security & Compliance** | `.github/workflows/`, `docs/05-ops/`, `docs/06-security-compliance/` | `render.yaml`, `ci-rust-go-web.yml`, `SECURITY_ARCHITECTURE.md`, `THREAT_MODEL.md`, `COMPLIANCE.md` |
