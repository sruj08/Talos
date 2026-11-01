# Comprehensive Technical, Financial & Regulatory Glossary — TALOS
> Project: TALOS · Owner: Principal Architecture & Documentation Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [MAP](../../MAP.md) · [ARCHITECTURE](../03-engineering/ARCHITECTURE.md) · [COMPLIANCE](../06-security-compliance/COMPLIANCE.md)

---

## 1. Agentic Commerce & Cryptographic Security Terms

| Term / Acronym | Full Name / Standard | Definition & Role in TALOS |
| :--- | :--- | :--- |
| **KYA** | **Know-Your-Agent** | The agentic commerce successor to KYC (Know Your Customer). Instead of asking *"Is this a human or a bot?"* (which blocks legitimate shopping agents), KYA cryptographically verifies: (1) *Which human principal (`E-01`) authorized this agent (`E-02`)?*, (2) *What is the signed spending mandate (`E-03`)?*, and (3) *Was the agent's context poisoned by an untrusted merchant DOM (`E-04`)?* |
| **`Ed25519`** | **Edwards-curve Digital Signature Algorithm (RFC 8032)** | High-speed, constant-time public-key signature scheme using Curve25519 (`ed25519-dalek` crate in `services/firewall-rs`). Used in **`F-01`** (`API-01`, `API-02`) to sign and verify human spending mandates in `<0.4ms`. |
| **RFC 9421** | **IETF HTTP Message Signatures (Web Bot Auth)** | Internet standard for cryptographically signing HTTP requests (`Signature-Input`, `Signature`, `Content-Digest` headers). Used by TALOS to authenticate requests from registered `AgentIdentity` instances (`E-02`) and prevent replay or tampering in transit. |
| **RFC 8785 (JCS)** | **JSON Canonicalization Scheme** | Deterministic JSON serialization standard that eliminates whitespace and sorts object keys lexicographically before computing `Ed25519` signatures on `KyaMandate` (`E-03`). |
| **Indirect DOM Prompt Injection (`CVE-2026-22708`)** | **Cross-Domain Context Poisoning Attack** | An exploit where an untrusted merchant webpage embeds invisible instructions (`<span style="display:none">`, `opacity:0`, HTML comments, base64 attributes, or Unicode tag blocks `U+E0000`) designed to hijack an autonomous browser agent into executing unauthorized payment tool calls. Blocked in `<4ms` by **`F-02`**. |
| **Unicode Tag Block Smuggling (`U+E0000..U+E007F`)** | **Invisible ASCII Tag Injection (`R-02`)** | Adversarial technique encoding ASCII prompt-injection commands inside invisible Unicode Plane 14 tag characters that render with zero width to humans in a browser but are tokenized as instructions by LLMs. Stripped deterministically by `services/firewall-rs/src/sanitizer.rs`. |
| **`lol_html`** | **Low-Output-Latency Streaming HTML Rewriter** | Cloudflare's high-performance Rust streaming HTML parser and CSS-selector rewriter used in `talos-firewall-rs` (`F-02`, `API-03`) to strip hidden DOM elements and extract forensic diffs at wire speed with minimal memory allocation. |
| **ONNX / `ort`** | **Open Neural Network Exchange / Rust ONNX Runtime** | Cross-platform machine learning execution engine used in `talos-firewall-rs` to run the INT8-quantized `ProtectAI/deberta-v3-base-prompt-injection-v2` model (`M-01`) in memory on standard CPU in `3.4ms` at `$0.00` token cost. |
| **MCP / `rmcp`** | **Model Context Protocol / Official Rust MCP SDK** | Open standard (`modelcontextprotocol.io`) for connecting AI assistants to tools and data sources. TALOS implements its security kernel using the official Rust SDK (`rmcp`, `F-03`) and Go SDK (`modelcontextprotocol/go-sdk`). |

---

## 2. PayPal Sandbox & Two-Phase Commit (2PC) Escrow Terms

| Term / Acronym | PayPal API / Specification | Definition & Role in TALOS |
| :--- | :--- | :--- |
| **2PC Escrow** | **Two-Phase Commit Financial Escrow (`E-06`)** | Distributed transaction pattern separating **Phase 1: Ring-Fenced Reservation (`intent: "AUTHORIZE"`)** from **Phase 2: Conditional Finalization (`CAPTURE` on verified delivery or `VOID` on SLA breach)**. Ensures a stochastic AI agent can never irreversibly lose buyer money. |
| **`AUTHORIZE`** | **PayPal Orders v2 (`POST /v2/checkout/orders`, `intent: "AUTHORIZE"`)** | Locks and verifies buyer funds in PayPal Sandbox for up to **29 days** (with a 3-day automatic honor period) without transferring funds to the merchant until fulfillment conditions are met (`F-05`, `API-07`). |
| **`CAPTURE`** | **PayPal Payments v2 (`POST /v2/payments/authorizations/{id}/capture`)** | Finalizes an authorized hold and settles funds to the merchant (`P-03`). Triggered automatically by `talos-orchestrator-go` (`F-06`, `API-09`) the instant PayPal Shipment Tracking confirms `DELIVERED` within the Bryntum SLA window. |
| **`VOID`** | **PayPal Payments v2 (`POST /v2/payments/authorizations/{id}/void`)** | Immediately cancels an open PayPal authorization hold and releases `100%` of the locked funds back to the buyer (`F-06`, `API-10`). Triggered automatically on carrier SLA breach, price-tamper detection, or when an operator drags/voids a task bar on **Bryntum Scheduler Pro (`F-07`)**. |
| **PayPal Shipment Tracking v1** | **`POST /v1/shipping/trackers-batch` & `@paypal/agent-toolkit` `create_tracking`** | Official PayPal API attaching carrier tracking numbers (`UPS`, `FEDEX`, `DHL`, `USPS`) and delivery statuses (`SHIPPED`, `DELIVERED`) to an order (`F-06`, `API-08`). Used by TALOS as the independent physical-world trigger for `CAPTURE`. |
| **PayPal Customer Disputes v1** | **`GET /v1/customer/disputes` & `POST /v1/customer/disputes/{id}/provide-evidence`** | Official PayPal API for managing buyer/seller disputes and chargebacks. Used by TALOS's **Autonomous Disputes Evidence Packager (`F-10`, `API-11`)** to submit `Ed25519` mandates, Channel3 price snapshots, and KERNEL screenshots (`E-08`). |
| **`PayPal-Request-Id`** | **PayPal HTTP Idempotency Header (`E-10`, `R-03`)** | Unique UUID header sent on `POST` requests to PayPal Sandbox; combined with TALOS's Valkey `IdempotencyLock` (`E-10`) and PostgreSQL `SELECT ... FOR UPDATE`, it guarantees zero duplicate charges on network retries. |
| **`PAYPAL-TRANSMISSION-SIG`** | **PayPal Webhook RSA-SHA256 + CRC32 Signature Header** | Cryptographic signature header sent on incoming PayPal Sandbox webhooks (`API-14`). Verified in `<1.5ms` by `services/firewall-rs` (`API-04`) over `<transmissionId>|<timeStamp>|<webhookId>|<crc32>`. |
| **`@paypal/agent-toolkit`** | **Official PayPal AI Agent Toolkit & MCP Server (`mcp.paypal.com`)** | PayPal's official TypeScript/MCP tool suite exposing `create_order`, `get_order`, `create_tracking`, `list_disputes`, etc., wrapped and protected by TALOS (`API-16`). |
| **PayPal JS SDK v6** | **`@paypal/react-paypal-js` Client Checkout SDK** | PayPal's browser SDK used in `PayPalStepUpModal.tsx` (`F-09`) to render human-in-the-loop biometric/step-up co-sign buttons whenever an autonomous agent request exceeds the mandate cap (`>$300`). |

---

## 3. Sponsor Ecosystem & Polyglot Stack Terms

| Term / Sponsor | Product / Component | Definition & Role in TALOS |
| :--- | :--- | :--- |
| **APIMatic Context Plugin & Codegen** | **APIMatic (`apimatic.io` — Sponsor Prize `$3,000` Pool)** | Provides schema-verified API context to prevent LLM field hallucinations (`R-09`) and generates TALOS's strongly-typed **Golang PayPal SDK (`sdk/paypal-go-apimatic`, `F-05`)** from PayPal's OpenAPI 3.0 specifications. |
| **AG Grid Enterprise & AG Studio** | **AG Grid (`ag-grid.com` — Sponsor Prize `$10,000` Pool)** | High-frequency enterprise React data grid (`v33.1`) + **AG Studio** embedded AI financial copilot used in `AgStudioBlotter.tsx` (`F-08`) for live WebSocket transaction streaming (`applyTransactionAsync`), Master-Detail DOM diff forensics, and natural-language pivoting (`M-03`). |
| **Bryntum Scheduler Pro & Gantt** | **Bryntum (`bryntum.com` — Sponsor Prize `$3,000` Pool)** | Interactive temporal scheduling and critical-path Gantt engine (`v6.1`) used in `BryntumSlaBoard.tsx` (`F-07`) to map 29-day PayPal authorization windows, carrier delivery SLA countdowns, and multi-vendor dependencies with two-way binding to PayPal `VOID` (`API-10`). |
| **Channel3 & Spread (`bps`)** | **Channel3 (`trychannel3.com` — Sponsor Prize `$1,500` Pool)** | Unified product catalog API covering 100M+ SKUs across verified merchants. Used by TALOS as the **Fair-Market Price Oracle (`F-04`, `API-06`)** to compute price spread in **basis points (`100 bps = 1%`)**, block price gouging (`>1500 bps`), and auto-reroute orders. |
| **Render Blueprint (`render.yaml`)** | **Render (`render.com` — Sponsor Prize `$2,250` Credits Pool)** | Declarative Infrastructure-as-Code (`F-14`) provisioning TALOS's 5 polyglot services (`runtime: rust`, `runtime: go`, `runtime: node`, Render PostgreSQL 16, and Render Valkey) in 1 click. |
| **KERNEL** | **KERNEL (`onkernel.com` — Browser Sandbox)** | Disposable headless cloud browser microVMs used by TALOS (`F-11`) to safely render and extract untrusted external merchant DOMs before piping them into `talos-firewall-rs`. |
| **Elastic Cloud OTel & ELSER** | **Elastic (`elastic.co` — `Elasticsearch 8.17` + APM)** | Observability and vector search platform (`F-12`) ingesting TALOS's distributed OpenTelemetry spans (`Next.js → Go → Rust`) and indexing blocked prompt-injection vectors (`M-04`, `E-04`). |
| **Postman MCP & Newman** | **Postman (`postman.com` — Collection v2.1 & CLI)** | API and MCP testing suite (`F-13`) providing 1-click judge verification (`"Run in Postman"`) and automated CI smoke gates (`newman run` in `deploy-render.yml`). |

---

## 4. Indian & Global Financial / Regulatory Acronyms (`COMPLIANCE.md`)

| Acronym | Full Statutory / Regulatory Name | Relevance to TALOS |
| :--- | :--- | :--- |
| **DPDP Act 2023 & Rules 2025** | **Digital Personal Data Protection Act, 2023 (India)** | India's comprehensive data privacy law (`R-06`). TALOS complies via itemized consent notices (§5/§6), automatic PII redaction in Rust/Go logs (§8), and 1-click Data Principal access, erasure, and mandate revocation rights (§11–§14). |
| **CERT-In** | **Indian Computer Emergency Response Team (Directions of April 2022)** | Mandates 6-hour cyber incident reporting, 180-day immutable security log retention (`F-12`), and Stratum-1 NTP clock synchronization (`samay1.nic.in`). |
| **RBI PA-CB** | **Reserve Bank of India Payment Aggregator – Cross Border Directions (Oct 2023)** | Regulates entities facilitating cross-border online payments in India (`R-06`). TALOS operates as a non-custodial **Technical Service Provider (TSP)** on top of PayPal's licensed PA-CB ledger without holding or pooling funds. |
| **ONDC** | **Open Network for Digital Commerce (India DPI)** | India's open protocol network for e-commerce; a key v1 expansion target where TALOS's `Ed25519` KYA firewall and 2PC escrow referee protect autonomous B2B buyer agents. |
| **Reg E / EFTA** | **US Federal Reserve Regulation E (Electronic Fund Transfers Act, 12 CFR 1005)** | US consumer protection regulation governing unauthorized electronic fund transfers; satisfied via TALOS's cryptographic `KyaMandate` (`F-01`) + **PayPal JS SDK v6 (`F-09`)** human step-up co-sign + automated Dispute Evidence bundles (`F-10`). |
| **PSD3 / SCA** | **EU Payment Services Directive 3 / Strong Customer Authentication** | European regulatory framework requiring dynamic linking of payment amount and payee; satisfied by TALOS's RFC 8785 canonical `Ed25519` mandate signatures (`E-03`). |
| **PCI-DSS v4.0 (SAQ-A)** | **Payment Card Industry Data Security Standard v4.0** | Global card security standard; TALOS qualifies for the lightest **SAQ-A** scope because it never touches raw card numbers (PAN/CVV), delegating all card/wallet entry to **PayPal JS SDK v6** and PayPal Sandbox tokens. |
| **ISO/IEC 42001** | **Artificial Intelligence Management System Standard (2023)** | International certification standard for responsible AI governance, risk management, and explainability targeted in TALOS's Month 12 enterprise roadmap. |
