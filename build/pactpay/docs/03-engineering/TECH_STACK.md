# Technology Stack — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Principal Engineering Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [ARCHITECTURE](ARCHITECTURE.md) · [INTEGRATIONS](INTEGRATIONS.md) · [ADR-0001](adr/ADR-0001-polyglot-rust-go-typescript-architecture.md)

---

## 1. First-Principles Polyglot Justification (Andrej Karpathy + Max Levchin + Patrick Collison)

Many hackathon projects choose languages by convenience. **PactPay** assigns each system layer to the exact runtime whose physical execution characteristics match the domain constraint:

1. **Why Rust 1.85 (`services/firewall-rs`) for the Inline Security & MCP Kernel (`F-01`, `F-02`, `F-03`)**:
   - The firewall sits inline on every DOM inspection and tool call. It performs streaming HTML AST rewriting (`lol_html`), Unicode tag normalization (`R-02`), `Ed25519` + RFC 9421 cryptographic verification, and INT8 quantized ONNX inference (`ort`).
   - Rust provides **zero garbage-collection tail-latency spikes (`p99 < 3.8ms`)**, memory safety against malformed adversarial HTML inputs, and official Model Context Protocol support via `rmcp` (`modelcontextprotocol/rust-sdk`).
2. **Why Go 1.24 (`services/orchestrator-go`) for the Escrow State Machine & Sponsor Fan-Out (`F-04`, `F-05`, `F-06`, `F-10`)**:
   - Evaluating an autonomous checkout requires parallel I/O fan-out (`golang.org/x/sync/errgroup`) across Rust Firewall, **Channel3** price discovery, **KERNEL** browser inspection, Redis idempotency locks, and **PayPal Sandbox** REST APIs, while streaming state transitions over thousands of WebSockets.
   - Crucially, PayPal's pre-built server SDKs do not include Go—enabling us to use **APIMatic CLI / Studio** to generate a strongly-typed **Golang PayPal SDK (`sdk/paypal-go-apimatic`)** directly from PayPal's OpenAPI 3.0 specifications (`ADR-0003`).
3. **Why Next.js 15 + React 19 + TypeScript 5.7 (`web/`) for the Command Center (`F-07`, `F-08`, `F-09`)**:
   - **AG Grid Enterprise / AG Studio (`v33.1.0`)**, **Bryntum Scheduler Pro (`v6.1.x`)**, **PayPal JS SDK v6 (`@paypal/react-paypal-js`)**, and **`@paypal/agent-toolkit`** are native TypeScript/React browser libraries. Next.js 15 App Router hosts both the 60fps Command Center UI and the `/api/mcp/paypal-bridge` (`API-16`).

---

## 2. Complete Layer-by-Layer Stack Matrix

| Layer | Technology Choice | Exact Version | Why Chosen (First Principles) | Alternatives Rejected | License |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Security & MCP Kernel** | **Rust** (Edition 2024) | `1.85.0` | Deterministic `<2ms` p50 latency, zero GC pauses, native `lol_html` & `ort` FFI, memory safety on untrusted DOMs. | Python (GIL & `>45ms` BeautifulSoup overhead); C++ (memory unsafety on adversarial HTML). | MIT / Apache-2.0 |
| **Rust Web & MCP Framework** | `axum` + `rmcp` + `tokio` | `axum 0.8.1`, `rmcp 0.1.5`, `tokio 1.43.0` | Ergonomic async tower middleware + official Rust MCP SDK with `#[tool]` macros over `stdio` and `SSE`. | `actix-web` (heavier actor boilerplate); custom JSON-RPC parser. | MIT |
| **Rust DOM & Regex Sanitizer** | `lol_html` + `aho-corasick` + `unicode-normalization` | `lol_html 2.1.0`, `aho-corasick 1.1.3` | Cloudflare's streaming CSS-selector HTML rewriter works in constant `O(1)` memory buffer without building a full DOM tree. | `scraper` / `html5ever` (allocates full DOM tree, 6× slower on 2MB pages). | BSD-3-Clause / MIT |
| **Rust Local Neural Classifier** | `ort` (ONNX Runtime) + `tokenizers` | `ort 2.0.0-rc.9`, `tokenizers 0.21.0` | Runs INT8 quantized `deberta-v3-base-prompt-injection-v2` (`M-01`) in `<3.4ms` on CPU with zero GPU requirement. | PyTorch Python sidecar (adds 600MB RAM + IPC serialization overhead). | MIT / Apache-2.0 |
| **Rust Cryptography** | `ed25519-dalek` + `ring` + `crc32fast` + `sha2` | `ed25519-dalek 2.1.1`, `ring 0.17.8` | Constant-time `Ed25519` mandate verification (`F-01`), RFC 9421 HTTP signatures, and PayPal webhook `CRC32` + RSA verification (`API-04`). | OpenSSL bindings (complex cross-compilation on Windows/Linux). | BSD-style / ISC |
| **Escrow Orchestrator** | **Golang** | `1.24.0` | Lightweight goroutines (`2KB` stack), `errgroup` structured concurrency, fast compilation, rock-solid PostgreSQL/Redis drivers. | Node.js (single-threaded event loop contention under heavy WS + fan-out); Java Spring Boot (high memory footprint on Render free/starter tiers). | BSD-3-Clause |
| **Go Router & Concurrency** | `go-chi/chi/v5` + `x/sync/errgroup` + `gorilla/websocket` | `chi v5.2.1`, `websocket v1.5.3` | 100% `net/http` standard library compatible, zero-allocation routing, clean context cancellation propagation. | `gin` (custom context wrapper); `fiber` (not `net/http` compatible). | MIT / BSD-2-Clause |
| **PayPal Go SDK** | **APIMatic Generated Go SDK** (`sdk/paypal-go-apimatic`) | `v1.1.0` (APIMatic CLI `v3.8`) | Generated directly from PayPal's OpenAPI 3.0 specs (`Orders v2`, `Authorizations v2`, `Tracking v1`, `Disputes v1`) with strict type safety & retry middleware. | Hand-written `net/http` JSON structs (error-prone, misses nested PayPal schema fields). | MIT |
| **PayPal TypeScript & Agent SDKs** | `@paypal/agent-toolkit` + `@paypal/paypal-server-sdk` + `@paypal/react-paypal-js` | `agent-toolkit 1.2.0`, `server-sdk 1.1.0`, `react-paypal-js 8.7.0 (v6 SDK)` | Official PayPal MCP tools (`create_order`, `create_tracking`, `list_disputes`), APIMatic-built TS SDK, and PayPal JS SDK v6 step-up approval UI. | Legacy `paypal-rest-sdk` (deprecated v1 APIs). | Apache-2.0 / MIT |
| **Frontend Framework** | **Next.js 15 (App Router)** + **React 19** + **TypeScript** | `next 15.2.0`, `react 19.0.0`, `typescript 5.7.3` | Server Components for zero-bundle initial shell + Client Components for high-frequency AG Grid & Bryntum canvases. | Vite SPA (lacks built-in `/api/mcp/paypal-bridge` route handlers). | MIT |
| **Financial Blotter & Copilot** | **AG Grid Enterprise** + **AG Studio** + **AG Charts** | `33.1.0` | High-frequency `applyTransactionAsync` updates, Master-Detail forensic drawers, integrated AG Charts, and AG Studio AI copilot (`F-08`). | TanStack Table (no native Master-Detail, Integrated Charts, Pivoting, or AG Studio AI). | Commercial (Hackathon Trial License) |
| **Temporal SLA Timeline** | **Bryntum Scheduler Pro & Gantt** | `6.1.4` | Interactive dependency scheduling, 29-day authorization bars, SLA countdowns, and 2-way drag-to-void binding (`F-07`). | FullCalendar / DHTMLX (lack constraint-based dependency engine & Bryntum MCP integration). | Commercial (Hackathon Trial License) |
| **Styling & UI Primitives** | **Tailwind CSS v4** + **shadcn/ui** + **Lucide Icons** | `tailwindcss 4.0.6`, `lucide-react 0.475.0` | Dark-mode glassmorphic financial terminal aesthetic with accessible Radix UI primitives (`PayPalStepUpModal.tsx`). | Material UI (heavy runtime CSS-in-JS overhead). | MIT |
| **Primary Relational DB** | **PostgreSQL** (`pgx/v5` + `sqlx`) | `16.6` | ACID transactions, `SELECT ... FOR UPDATE` row-level locking on escrow state transitions, `JSONB` for forensic diffs. | MongoDB (lacks strict relational foreign keys and serializable 2PC guarantees for financial ledgers). | PostgreSQL License |
| **Distributed Lock & Pub/Sub** | **Redis / Valkey** (`go-redis/v9`) | `7.2.x` | Sub-millisecond `SET NX EX 86400` idempotency locks (`E-10`) keyed by `PayPal-Request-Id` + multi-instance WebSocket pub/sub. | In-memory Go `sync.Map` (lost on process restart, fails across multiple replicas). | BSD-3-Clause |
| **Observability & Threat Vector Store** | **OpenTelemetry** + **Elastic Cloud** (`Elasticsearch` + `APM`) | `Elastic 8.17.0`, `otel 1.34.0` | Distributed W3C `traceparent` spans across Next.js → Go → Rust → PayPal Sandbox + `elser_model_2` vector threat indexing (`F-12`). | Local stdout logs only (no cross-service trace correlation or semantic attack search). | Apache-2.0 / Elastic v2 |
| **Cloud Infrastructure & IaC** | **Render Native Blueprint (`render.yaml`)** | `Blueprint v1` | Native multi-runtime support (`runtime: rust`, `runtime: go`, `runtime: node`, Managed Postgres, Managed Valkey) in one repo (`F-14`). | Kubernetes / EKS (massive operational overhead for a 48-hour hackathon). | Platform Service |

---

## 3. Sponsor Technology Integration Matrix (All 10 Hackathon Ecosystem Partners)

| # | Sponsor / Partner | Judge Representative | How PactPay Integrates It | Exact Repo Location | Target Prize Pool |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **PayPal** (`Sandbox`, `Orders v2`, `Tracking v1`, `Disputes v1`, `MCP`, `JS SDK v6`) | PayPal Core Jury (Soups Ranjan, etc.) | Reversible `Orders v2 AUTHORIZE` escrow holds, automatic `CAPTURE` on carrier delivery (`create_tracking`), instant `VOID` on SLA breach, `Disputes v1` evidence upload, and `JS SDK v6` human step-up co-sign. | `services/orchestrator-go/internal/paypal/`, `web/src/components/PayPalStepUpModal.tsx` | **$12k 1st / $8k 2nd / $5k 3rd + $5k Agentic Commerce + $5k PayPal+AI** |
| **2** | **AG Grid & AG Studio** | **Sylwia Vargas** (Judge #8) | Live streaming escrow blotter (`applyTransactionAsync`), Master-Detail DOM diff & Ed25519 forensic viewer, integrated AG Charts price spread, and **AG Studio** natural-language AI copilot. | `web/src/components/AgStudioBlotter.tsx` | **Best Use of AG Grid ($5,000 1st / $2,000 2nd / 3× $1,000 3rd)** |
| **3** | **Bryntum** (`Scheduler Pro`, `Gantt`, `Bryntum MCP`) | **Mats Bryntse** (Judge #9) | Interactive timeline mapping 29-day PayPal authorization holds, carrier SLA countdowns, and task dependencies; dragging/expiring an SLA bar triggers a live PayPal Sandbox `VOID`. | `web/src/components/BryntumSlaBoard.tsx` | **Best Use of Bryntum (3× $1,000 Cash)** |
| **4** | **APIMatic** (`Context Plugin`, `SDK Codegen`, `DX Portal`) | **Ameer Hassan** (Judge #7) | APIMatic Context Plugin injected into agent tool reasoning + custom **APIMatic-generated Golang SDK** for PayPal (`Orders v2`, `Authorizations v2`, `Tracking v1`, `Disputes v1`) + `@paypal/paypal-server-sdk`. | `sdk/paypal-go-apimatic/`, `web/src/app/api/mcp/paypal-bridge/route.ts` | **Best Use of APIMatic (3× $1,000 Cash + 6mo Business Sub)** |
| **5** | **Channel3** (`trychannel3.com`) | **Ignacio Valdez Bicard** (Judge #10) | Real-time fair-market median price discovery across 100M+ SKUs; blocks merchant price gouging (`>15%` spread) and auto-reroutes checkout to verified Channel3 sellers. | `services/orchestrator-go/internal/channel3/oracle.go` | **Best Use of Channel3 ($1,500 Cash)** |
| **6** | **Render** (`render.yaml` Blueprint) | **Shifra Williams** (Judge #13) | 1-click native polyglot `render.yaml` provisioning `runtime: rust`, `runtime: go`, `runtime: node`, Render PostgreSQL 16, and Render Valkey. | `render.yaml` | **Best Use of Render ($1,000 / $750 / $500 Credits)** |
| **7** | **Elastic** (`Elastic Cloud APM` + `Elasticsearch Vector Store`) | **Carly Richmond** (Judge #11) | Distributed OpenTelemetry tracing across Next.js → Go → Rust → PayPal Sandbox + `elser_model_2` vector indexing of intercepted DOM prompt injections (`E-04`). | `services/firewall-rs/src/telemetry.rs`, `services/orchestrator-go/internal/telemetry/` | Jury Technical & Observability Score Multiplier |
| **8** | **Postman** (`Postman v11` + `MCP Client` + `Newman`) | **Pooja Mistry** (Judge #12) | Complete `PactPay-Sandbox-MCP.postman_collection.json` + environment + 1-click `"Run in Postman"` badge + Newman CI contract gate. | `postman/PactPay-Sandbox-MCP.postman_collection.json` | Jury DX & Demo Verification Score Multiplier |
| **9** | **KERNEL** (`onkernel.com`) | Sponsor Partner | Disposable headless cloud browser inspecting untrusted merchant checkout DOMs before streaming HTML into Rust `lol_html`. | `services/orchestrator-go/internal/kernel/browser.go` | Agentic Security Realism |
| **10** | **Astropods & Zapier** | Sponsor Partners | Outbound webhook connectors dispatching Slack/Email CFO escalation alerts when an escrow enters `STEP_UP_REQUIRED` or `PAYPAL_VOIDED`. | `services/orchestrator-go/internal/webhooks/outbound.go` | Enterprise FinOps Workflow Completion |

---

## 4. India & Cross-Border Financial Rails Readiness (`MVP` vs. `v1`)

| Capability | MVP (Hackathon — PayPal Sandbox) | v1 (Production — India & Global Cross-Border) |
| :--- | :--- | :--- |
| **Settlement Rail** | PayPal Sandbox `Orders v2` (`USD`, `EUR`, `GBP`, `INR` display equivalents at `1 USD = ₹84.00`). | PayPal Cross-Border Seller Payouts (`PA-CB` compliant via licensed partner bank) + ONDC B2B RSP integration. |
| **Identity & Mandate Signing** | `Ed25519` keypair per Principal (`E-01`) & Agent (`E-02`) + RFC 9421 HTTP Message Signatures. | Corporate OIDC + India DigiLocker / Aadhaar eSign for high-value B2B procurement mandates (`>₹5,00,000`). |
| **Data Residency & Privacy** | Synthetic Sandbox accounts (`buyer-pactpay@personal.example.com`), zero real PAN/CVV (`R-06`). | AWS Mumbai (`ap-south-1`) primary database shard; CERT-In 180-day immutable audit log retention; DPDP Act 2023 §8 PII redaction. |
