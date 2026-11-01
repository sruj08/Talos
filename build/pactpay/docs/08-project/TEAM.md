# Team Structure, RACI Matrix & Governance — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Principal Engineering & Delivery Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [HACKATHON_PLAN](../00-overview/HACKATHON_PLAN.md) · [BACKLOG](BACKLOG.md) · [PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK](PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md)

---

## 1. Core Team Roles & Ownership Boundaries

PactPay is structured around **four specialized, zero-overlap engineering and product pods** that mirror our polyglot system architecture (`Rust 1.85` + `Go 1.24` + `Next.js 15 / TypeScript` + `DevSecOps / Demo`):

| Role ID | Role Title | Primary Architecture & Codebase Scope | Key Sponsor & Jury Alignment |
| :--- | :--- | :--- | :--- |
| **`ROLE-01`** | **Principal Systems & Rust Security Lead** | `services/firewall-rs` (`Rust 1.85`): `rmcp` MCP server (`F-03`), `Ed25519` + RFC 9421 KYA mandates (`F-01`), `lol_html` + `DeBERTa-v3` ONNX DOM sanitizer (`F-02`, `M-01`), PayPal webhook `CRC32` + RSA verifier (`API-04`). | **Tie-Breaker #1 (Tech Implementation — 20%)** + **Best Use of Agentic Commerce (`$5,000`)** |
| **`ROLE-02`** | **Principal Distributed Systems & Golang Escrow Lead** | `services/orchestrator-go` (`Go 1.24`) + `sdk/paypal-go-apimatic`: 2PC escrow state machine (`F-05`), **APIMatic Go SDK** + Context Plugin (`F-05`), **Channel3** price oracle (`F-04`), **KERNEL** browser controller (`F-11`), Shipment Tracking auto-`CAPTURE`/`VOID` (`F-06`), Disputes packager (`F-10`). | **Grand Prize (`$12k`)** + **Best Use of APIMatic (`$1,000`)** + **Best Use of Channel3 (`$1,500`)** |
| **`ROLE-03`** | **Principal Frontend & Financial Visualization Lead** | `web/` (`Next.js 15 / React 19 / TypeScript`): **AG Grid Enterprise + AG Studio** live blotter & Master-Detail forensics (`F-08`), **Bryntum Scheduler Pro / Gantt** two-way SLA board (`F-07`), **PayPal JS SDK v6** step-up co-sign modal (`F-09`), Poisoned Storefront Simulator (`F-11`). | **Tie-Breaker #2 (Design — 20%)** + **Best Use of AG Grid (`$5,000`)** + **Best Use of Bryntum (`$1,000`)** |
| **`ROLE-04`** | **Principal DevSecOps, Observability & Demo Director** | `render.yaml` (`F-14`), `.github/workflows/`, **Elastic Cloud OpenTelemetry** (`F-12`), **Postman MCP Collection & Newman suite** (`F-13`), DPDP/CERT-In compliance (`R-06`), and the 3-minute 4K demo video (`R-12`). | **Best Use of Render (`$1,000`)** + **Judge #11 (Elastic)** + **Judge #12 (Postman)** + **Best Demo Delivery (`$5,000`)** |

---

## 2. RACI Matrix Across Workstreams & Features (`F-01`..`F-14`)

*(Legend: **R** = Responsible [Builds it], **A** = Accountable [Final sign-off], **C** = Consulted, **I** = Informed)*

| Workstream / Deliverable | `ROLE-01` (Rust Kernel) | `ROLE-02` (Go Orchestrator) | `ROLE-03` (Next.js UI) | `ROLE-04` (DevSecOps / Demo) |
| :--- | :---: | :---: | :---: | :---: |
| **Root `LICENSE` (MIT), `README.md` & Repo Governance (`R-05`)** | C | C | I | **R / A** |
| **PostgreSQL 16 Schema (`E-01`..`E-09`) & Valkey Locks (`E-10`)** | C | **R / A** | I | C |
| **Rust `Ed25519` Mandate Signer & RFC 9421 Verifier (`F-01`)** | **R / A** | C | I | I |
| **Rust `lol_html` + `DeBERTa-v3` ONNX DOM Sanitizer (`F-02`, `M-01`)** | **R / A** | C | C | C |
| **Official Rust MCP Server (`rmcp`, `F-03`)** | **R / A** | C | C | C |
| **Channel3 Fair-Market Price Oracle & Auto-Reroute (`F-04`)** | I | **R / A** | C | I |
| **APIMatic Go SDK (`sdk/paypal-go-apimatic`) & PayPal `AUTHORIZE` (`F-05`)** | I | **R / A** | C | C |
| **PayPal Shipment Tracking SLA Monitor & Auto-`CAPTURE`/`VOID` (`F-06`)** | I | **R / A** | C | I |
| **Bryntum Scheduler Pro Two-Way SLA Board (`F-07`)** | I | C | **R / A** | C |
| **AG Grid Enterprise + AG Studio Blotter & Master-Detail (`F-08`)** | C | C | **R / A** | C |
| **PayPal JS SDK v6 Step-Up Co-Sign Modal (`F-09`)** | I | C | **R / A** | I |
| **Autonomous PayPal Disputes Evidence Packager (`F-10`)** | C | **R / A** | C | I |
| **KERNEL Cloud Browser & Poisoned Storefront Simulator (`F-11`)** | C | **R** | **R / A** | C |
| **Elastic Cloud OpenTelemetry APM & Vector Threat Index (`F-12`)** | C | C | I | **R / A** |
| **Postman MCP Collection & Newman Contract Suite (`F-13`)** | C | C | I | **R / A** |
| **Render Polyglot Blueprint (`render.yaml`, `F-14`) & CI/CD** | C | C | C | **R / A** |
| **3-Minute Demo Video (`PITCH.md`, `R-12`) & Devpost Submission** | C | C | C | **R / A** |

---

## 3. Communication Cadence & Architectural Decision Protocol

1. **Contract-First Parallel Execution (`Zero Blocking`)**:
   - All inter-service contracts (`API-01`..`API-16` in `API_SPEC.md` and `api/openapi.yaml`) and PostgreSQL schemas (`E-01`..`E-10` in `DATA_MODEL.md`) are frozen at Hour 1.
   - `ROLE-01` (Rust), `ROLE-02` (Go), and `ROLE-03` (Next.js) build in parallel against deterministic JSON fixtures before joining at the integration checkpoint.
2. **4-Hour War-Room Checkpoints**:
   - Every 4 hours during the build sprint, all 4 roles run a 5-minute standup focused strictly on three questions:
     1. *Does `docker compose up --build` pass `/healthz` across Rust, Go, and Web?*
     2. *Do the Postman Newman contract tests (`F-13`) pass against `API-01`..`API-16`?*
     3. *Can we click through all 3 acts of the live demo script (`PITCH.md`) in under 2 minutes 45 seconds?*
3. **Architecture Decision Records (`docs/03-engineering/adr/`)**:
   - Any proposed deviation from `PROJECT_BRIEF.md` requires a 10-line MADR entry in `docs/03-engineering/adr/` and unanimous sign-off from `ROLE-01` and `ROLE-02`.
