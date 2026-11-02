# GSD Roadmap — TALOS

| Phase | Name | Mode | Chunks / Tasks | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Foundation, License Gate, Monorepo Skeleton & DB Schema (MVP) | `mvp` | `TASK-01`, `TASK-02` | Complete |
| **Phase 2** | Rust Zero-Trust KYA & Prompt-Injection Firewall Kernel (MVP) | `mvp` | `TASK-03`, `TASK-04` | Ready |
| **Phase 3** | APIMatic Go SDK & PayPal Sandbox 2PC Escrow Engine (MVP) | `mvp` | `TASK-05`, `TASK-06` | Ready (Gate #1) |
| **Phase 4** | Channel3 Fair-Price Oracle, KERNEL, Tracking & Disputes (MVP) | `mvp` | `TASK-07`, `TASK-08` | Ready (Gate #2) |
| **Phase 5** | Next.js 15 Command Center & AG Grid / AG Studio Blotter (MVP) | `mvp` | `TASK-09`, `TASK-10` | Ready (Gate #3) |
| **Phase 6** | Bryntum Scheduler Pro 2-Way SLA Board & PayPal JS SDK v6 (MVP) | `mvp` | `TASK-11`, `TASK-12` | Ready (Gate #4) |
| **Phase 7** | Elastic OpenTelemetry APM, Postman Collection & E2E Tests | `standard` | `TASK-13`, `TASK-14` | Ready (Gate #5) |
| **Phase 8** | Render Native Polyglot Deployment (`render.yaml`) & Demo Polish | `mvp` | `TASK-15`, `TASK-16` | Ready (Gates #6-#7) |

---

## Phases

### Phase 1: Foundation, License Gate, Monorepo Skeleton & DB Schema
**Goal**: Verify MIT LICENSE gate (`TASK-01`), Docker Compose (`postgres:16-alpine` + `valkey:7.2-alpine`), Graphify knowledge graph, and create the PostgreSQL 16 schema (`E-01`..`E-09`) with UUIDv7/v4 primary keys, FK/B-Tree/GIN indexes, `SELECT ... FOR UPDATE` row locking on `escrow_transactions`, SHA-256 hash-chained `audit_events` trigger, and Redis `PayPal-Request-Id` idempotency lock (`E-10`) (`TASK-02`).
**Depends on**: Nothing (first phase)
**Requirements**: `E-01`, `E-02`, `E-03`, `E-04`, `E-05`, `E-06`, `E-07`, `E-08`, `E-09`, `E-10`, `F-04`, `F-14`, `R-03`, `R-05`
**Mode**: mvp
**Plans**: 2 plans
- [x] `01-01-PLAN.md` — Monorepo Bootstrap, MIT License Gate & Graphify Initialization (`TASK-01`)
- [x] `01-02-PLAN.md` — PostgreSQL 16 Schema (`E-01`..`E-09`) & Redis Idempotency Locks (`E-10`) (`TASK-02`)

### Phase 2: Rust Zero-Trust KYA & Prompt-Injection Firewall Kernel
**Goal**: Implement Ed25519 KYA Mandate Signer/Verifier (`TASK-03`) and streaming `lol_html` + `DeBERTa-v3` ONNX DOM Prompt-Injection Sanitizer + `rmcp` MCP Server (`TASK-04`).
**Depends on**: Phase 1
**Requirements**: `F-01`, `F-02`, `F-03`, `API-01`, `API-02`, `API-03`, `API-04`, `API-05`, `M-01`
**Mode**: mvp

### Phase 3: APIMatic Go SDK & PayPal Sandbox 2PC Escrow Engine
**Goal**: Implement APIMatic Go SDK (`sdk/paypal-go-apimatic`) & PayPal Sandbox OAuth2 (`TASK-05`) and Go 2PC Escrow State Machine (`AUTHORIZE`, `CAPTURE`, `VOID`) (`TASK-06`).
**Depends on**: Phase 2
**Requirements**: `F-04`, `F-10`, `API-06`, `API-07`, `API-08`, `API-09`
**Mode**: mvp

### Phase 4: Channel3 Fair-Price Oracle, KERNEL, Tracking & Disputes
**Goal**: Implement Go `errgroup` Channel3 Fair-Price Oracle & KERNEL Browser Inspector (`TASK-07`) and Shipment Tracking v1, Disputes v1 & WebSocket Hub (`TASK-08`).
**Depends on**: Phase 3
**Requirements**: `F-05`, `F-06`, `F-11`, `API-11`, `API-12`, `API-13`, `API-15`, `API-16`
**Mode**: mvp

### Phase 5: Next.js 15 Command Center & AG Grid / AG Studio Blotter
**Goal**: Build Next.js 15 Dark-Mode Command Shell & KYA Mandate Studio (`TASK-09`) and `AgStudioBlotter.tsx` with Master-Detail Forensics & AG Studio Copilot (`TASK-10`).
**Depends on**: Phase 4
**Requirements**: `F-01`, `F-07`, `M-03`
**Mode**: mvp

### Phase 6: Bryntum Scheduler Pro 2-Way SLA Board & PayPal JS SDK v6
**Goal**: Build `BryntumSlaBoard.tsx` 2-Way Payment SLA Timeline (`TASK-11`) and `PayPalStepUpModal.tsx`, `PoisonedStoreSim.tsx` & `@paypal/agent-toolkit` MCP Bridge (`TASK-12`).
**Depends on**: Phase 5
**Requirements**: `F-06`, `F-08`, `F-09`, `API-10`
**Mode**: mvp

### Phase 7: Elastic OpenTelemetry APM, Postman Collection & E2E Tests
**Goal**: Configure Elastic Cloud OpenTelemetry APM + Vector Threat Index & Postman MCP Collection (`TASK-13`) and run Vitest + Playwright E2E Suite & Red-Team Benchmark (`TASK-14`).
**Depends on**: Phase 6
**Requirements**: `F-13`, `M-04`
**Mode**: standard

### Phase 8: Render Native Polyglot Deployment & Demo Polish
**Goal**: Validate `render.yaml` Native Polyglot Blueprint & deployment verification script (`TASK-15`) and complete final 3-Minute Demo & Devpost 14-Prize Submission Audit (`TASK-16`).
**Depends on**: Phase 7
**Requirements**: `F-12`, `R-05`
**Mode**: mvp

