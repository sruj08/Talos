# Hackathon Execution Plan — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Hackathon Execution Lead · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](PROJECT_BRIEF.md) · [PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK](../08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md) · [PITCH](PITCH.md) · [00-TRACKS_AND_SUBMISSION_STRATEGY](../09-integrations-and-guides/00-TRACKS_AND_SUBMISSION_STRATEGY.md)

---

## 1. Hackathon Timeline & Critical Deadlines

- **Hackathon**: [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/) (`31302-paypal-ai-hackathon`)
- **Early Eligibility Check Deadline**: November 5, 2026
- **Final Submission Deadline**: **November 12, 2026 @ 12:00 pm PST (November 13, 2026 @ 1:30 am IST)**
- **Total Build Window**: 11 Days (or compressed 36-Hour Sprint Mode below)
- **Primary Strategy**: Execute the 16 atomic micro-chunks (`TASK-01`..`TASK-16`) defined in [`PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`](../08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md) using `/gsd-*` and `/ralph-loop`.

---

## 2. Hour-by-Hour / Block-by-Block Build Plan (36-Hour Sprint Schedule)

| Hour Block | Phase & Micro-Chunk | Owner Role | Deliverables | Pre-Execution Skills | Verification Gate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H00 – H02** | **Phase 1: `TASK-01` & `TASK-02`** | Systems Architect | Root `LICENSE`, `docker-compose.yml`, PostgreSQL 16 schema (`E-01`..`E-09`), Redis `IdempotencyLock` (`E-10`), `.planning/graphs/graph.json`. | `/gsd-new-project`, `/gsd-graphify build`, `postgres`, `/ralph-loop` | `docker compose up -d` healthy; all 9 tables migrated. |
| **H02 – H06** | **Phase 2: `TASK-03` & `TASK-04`** | Rust Security Lead | `services/firewall-rs`: `Ed25519` KYA Mandate Signer/Verifier (`ed25519-dalek`), RFC 9421 headers, `lol_html` + `DeBERTa-v3` ONNX DOM sanitizer, `rmcp` MCP server. | `/gsd-spec-phase 2`, `/gsd-ai-integration-phase 2`, `/gsd-secure-phase 2` | `cargo test` passes; `<4ms` DOM prompt-injection strip. |
| **H06 – H11** | **Phase 3: `TASK-05` & `TASK-06`** | Go Backend Lead + **User Gate #1** | **User Gate #1 (PayPal Sandbox + APIMatic)**; `sdk/paypal-go-apimatic` codegen; Go 2PC Escrow State Machine (`Orders v2 AUTHORIZE`, `CAPTURE`, `VOID`). | `credentials`, `/gsd-discuss-phase 3`, `/gsd-plan-phase 3`, `/gsd-execute-phase 3` | Live PayPal Sandbox `ORDER-ID` & `AUTH-ID` created and voided/captured. |
| **H11 – H16** | **Phase 4: `TASK-07` & `TASK-08`** | Go Backend Lead + **User Gate #2** | **User Gate #2 (Channel3 + KERNEL keys)**; Go `errgroup` parallel fan-out to Channel3 price oracle + KERNEL browser + Shipment Tracking v1 + Disputes v1 + WebSocket hub. | `credentials`, `/gsd-plan-phase 4`, `/gsd-execute-phase 4`, `/gsd-add-tests 4` | `go test -race ./...` passes; `+92%` price gouge blocked & rerouted via Channel3. |
| **H16 – H22** | **Phase 5: `TASK-09` & `TASK-10`** | Frontend UI Lead + **User Gate #3** | Next.js 15 Dark-Mode Command Center, KYA Mandate Studio, `AgStudioBlotter.tsx` (AG Grid Enterprise `applyTransactionAsync`, Master-Detail DOM diff, **AG Studio** AI copilot). | `/gsd-ui-phase 5`, `ui-ux-pro-max`, `shadcn`, `vercel-react-best-practices`, `frontend-testing` | AG Grid streams WebSocket updates at 60fps; Master-Detail drawer renders DOM diff & AG Charts. |
| **H22 – H28** | **Phase 6: `TASK-11` & `TASK-12`** | Frontend UI Lead + **User Gate #4** | **User Gate #4 (Bryntum Trial/MCP)**; `BryntumSlaBoard.tsx` 2-way SLA timeline bound to PayPal `VOID`; `PayPalStepUpModal.tsx` (PayPal JS SDK v6); `PoisonedStoreSim.tsx` 1-click red-team simulator; `@paypal/agent-toolkit` bridge. | `/gsd-plan-phase 6`, `component-refactoring`, `web-design-guidelines`, `/gsd-ui-review 6` | Expiring/dragging SLA bar in Bryntum fires live PayPal Sandbox `VOID`. |
| **H28 – H32** | **Phase 7: `TASK-13` & `TASK-14`** | QA & Observability Lead + **User Gate #5** | **User Gate #5 (Elastic + Postman)**; Rust & Go OpenTelemetry export to Elastic Cloud; `postman/PactPay-Sandbox-MCP.postman_collection.json`; Playwright E2E test suite & screenshots. | `credentials`, `/gsd-eval-review 7`, `e2e-tester`, `agent-browser`, `/gsd-audit-fix` | Playwright E2E passes all 3 demo acts; Newman contract tests pass. |
| **H32 – H36** | **Phase 8: `TASK-15` & `TASK-16`** | Full Team + **User Gates #6 & #7** | **User Gate #6 (`render.yaml` Blueprint deploy)**; **User Gate #7 (`2:45` YouTube Demo Video + Devpost Submission)** across all 14 eligible prize categories. | `/gsd-graphify build`, `/gsd-ship`, `/gsd-verify-work 8`, `/gsd-audit-milestone` | Live Render URL healthy; YouTube video public; Devpost submitted. |

---

## 3. What Is 100% Real vs. Deterministic Fallback (Charlie Munger Reliability Rule)

| Component | Primary Live Mode (Default) | Zero-Downtime Fallback Mode (If Wi-Fi / Sandbox 5xx Occurs) |
| :--- | :--- | :--- |
| **Rust `firewall-rs` (`Ed25519` + `lol_html` + `rmcp`)** | **100% Real** native Rust binary running in-memory cryptography and streaming HTML sanitization in `<4ms`. | Always runs locally/in-container with zero external internet dependency. |
| **PayPal Sandbox (`Orders v2 AUTHORIZE / CAPTURE / VOID`, `Tracking v1`, `Disputes v1`)** | **100% Real** HTTPS calls to `https://api-m.sandbox.paypal.com` using your Sandbox `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`. | Automatic circuit-breaker (`R-01`) replays recorded authentic PayPal Sandbox JSON responses (with real Sandbox schema structure) if `api-m.sandbox.paypal.com` times out (>4s). |
| **Channel3 Fair-Price Oracle (`trychannel3.com`)** | **100% Real** REST/MCP queries against Channel3's 100M+ SKU index using `CHANNEL3_API_KEY`. | Cached SKU snapshot table (`channel3_benchmarks` seed data) for the 10 demo electronics/studio SKUs if offline. |
| **AG Grid Enterprise / AG Studio & Bryntum Scheduler Pro** | **100% Real** interactive React 19 DOM engines bound via live WebSockets to `orchestrator-go`. | Always runs in browser with zero external dependency. |
| **PayPal JS SDK v6 (`@paypal/react-paypal-js`)** | **100% Real** PayPal Sandbox smart button & step-up approval modal. | Signed offline step-up override button if judge tests without internet. |

---

## 4. Cut List (If Behind Schedule at Hour 28)

1. **Never Cut (P0 Core Winners)**:
   - Rust `lol_html` + `Ed25519` Firewall (`F-01`, `F-02`, `F-03`)
   - Go APIMatic PayPal Sandbox `Orders v2 AUTHORIZE -> CAPTURE / VOID` (`F-05`, `F-06`)
   - Channel3 Price-Gouging Oracle (`F-04`)
   - AG Grid Enterprise / AG Studio Blotter + Master-Detail Forensics (`F-08`)
   - Bryntum Scheduler Pro 2-Way SLA Timeline (`F-07`)
   - Render `render.yaml` Blueprint (`F-14`) & MIT `LICENSE`
2. **Safe to Simplify to Pre-Recorded/Seeded Mode if Needed (P1/P2)**:
   - Live KERNEL remote cloud browser microVM spawning (`F-11`) -> can use the built-in `PoisonedStoreSim.tsx` local adversarial merchant storefront endpoint by default.
   - Live Zapier outbound Slack notification webhook -> optional bonus.

---

## 5. Submission Checklist Mapped to Every Devpost Criterion (`100%`)

- [x] **Stage-1 Eligibility Gates**:
  - [x] Public GitHub repository with `LICENSE` (MIT) visible in the top-right **About** section.
  - [x] Working hosted demo URL on **Render** (`render.yaml`) + 1-command `docker compose up --build` local instructions.
  - [x] Public YouTube demo video strictly under **3:00** (`2:45` target) showing the app functioning on screen.
  - [x] Uses **PayPal Sandbox** (`api-m.sandbox.paypal.com`) exclusively — zero real bank/card prompts.
- [x] **Criterion 1: Technological Implementation (`20%` — Tie-Breaker #1)**:
  - [x] Polyglot `Rust 1.85` (`rmcp`, `lol_html`, `ed25519-dalek`, `ort`) + `Golang 1.24` (`APIMatic Go SDK`, `errgroup`, 2PC state machine) + `Next.js 15`.
- [x] **Criterion 2: Design (`20%` — Tie-Breaker #2)**:
  - [x] Unified Dark-Mode Financial Command Center combining **AG Grid Enterprise / AG Studio**, **Bryntum Scheduler Pro**, and **PayPal JS SDK v6**.
- [x] **Criterion 3: Potential Impact (`20%` — Tie-Breaker #3)**:
  - [x] Solves the `$15T` agentic commerce trust gap: zero prompt-injection thefts, zero price gouging, and 100% reversible PayPal escrow holds.
- [x] **Criterion 4: Quality of the Idea (`20%` — Tie-Breaker #4)**:
  - [x] First-ever **Zero-Trust KYA Firewall & Two-Phase Commit PayPal Escrow Referee**.
- [x] **Criterion 5: Demo & Presentation (`20%` — Tie-Breaker #5)**:
  - [x] 3-Act live adversarial attack block + Channel3 reroute + Bryntum timeline drag-to-void PayPal Sandbox hold + "Run in Postman" 1-click judge collection.
