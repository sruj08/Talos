# Vision & Strategic Thesis — TALOS
> Project: TALOS · Owner: Principal Architecture & Product Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](PROJECT_BRIEF.md) · [PITCH](PITCH.md) · [PRD](../01-product/PRD.md) · [ARCHITECTURE](../03-engineering/ARCHITECTURE.md) · [IMPACT](../07-business/IMPACT.md)

---

## 1. Vision Statement

**To make autonomous AI commerce mathematically trustworthy and 100% reversible—so every human and enterprise on Earth can delegate real money to AI agents without ever risking a single unapproved, hallucinated, or prompt-injected dollar.**

In the coming decade, the primary buyer on the internet will no longer be a human clicking a browser button; it will be an autonomous AI agent negotiating over Model Context Protocol (`MCP`), inspecting storefronts via headless cloud browsers (`KERNEL`), and settling over global payment rails (**PayPal Agentic Commerce Services & PayPal World**). Yet today's payment rails were built for human clicks, not stochastic LLMs. **TALOS** is the foundational Zero-Trust Agentic Commerce Firewall and Two-Phase Commit (2PC) PayPal Escrow Referee that turns raw agent intent into cryptographically bounded, fair-price-verified, SLA-enforced financial execution.

---

## 2. Mission Statement

**Intercept, sanitize, benchmark, and ring-fence every AI agent transaction in under 50 milliseconds.**

TALOS achieves this mission by separating **Cryptographic Intent & DOM Security (`services/firewall-rs` in Rust 1.85)** from **Escrow State Orchestration (`services/orchestrator-go` in Go 1.24)** and **Human Financial Governance (`web/` in Next.js 15 with AG Grid / AG Studio & Bryntum Scheduler Pro)**:
1. **Verify Know-Your-Agent (KYA) Mandates (`F-01`)**: Enforce `Ed25519` and RFC 9421 cryptographic spending policies signed by the human principal (`E-03`) before any agent tool call is evaluated.
2. **Eliminate Indirect Prompt Injection at Wire Speed (`F-02`)**: Strip hidden CSS/HTML prompt injections (`lol_html` + quantized `DeBERTa-v3` ONNX `M-01`) from untrusted merchant pages in `<4ms`.
3. **Guarantee Fair-Market Pricing (`F-04`)**: Benchmark every SKU against **Channel3's** 100M+ product catalog (`E-05`) to block price gouging (`>15%` above median) and reroute to verified merchants.
4. **Replace Blind `CAPTURE` with Reversible PayPal Escrow (`F-05`, `F-06`)**: Lock funds inside a 29-day **PayPal Sandbox `Orders v2` (`intent: "AUTHORIZE"`)** hold (`E-06`), releasing `CAPTURE` only when **PayPal Shipment Tracking v1** verifies on-time SLA delivery on **Bryntum Scheduler Pro** (`F-07`), and automatically executing `VOID` in `0 seconds` upon SLA breach or tampering.

---

## 3. North-Star Metric & Supporting Input Metrics

```mermaid
flowchart LR
    subgraph Inputs["Leading Input Metrics"]
        I1["1. KYA Mandate Signing Velocity<br/>(Mandates / Active Principal / Week)"]
        I2["2. Inline Firewall Interception Rate<br/>(DOM Injections + Gouging Blocked in <4ms)"]
        I3["3. Channel3 Price-Reroute Savings<br/>(Basis Points Saved vs. Raw Agent Quote)"]
        I4["4. SLA-Verified Auto-Capture Ratio<br/>(% Holds Captured via PayPal Tracking v1)"]
    end

    subgraph NSM["North-Star Metric (NSM)"]
        N["Protected Agentic GMV (PA-GMV)<br/>Total USD / INR Volume Ring-Fenced in<br/>Zero-Loss PayPal AUTHORIZE Escrow"]
    end

    subgraph Outcomes["Enterprise & Ecosystem Outcomes"]
        O1["0.00% Unauthorized Agent Loss Rate"]
        O2["<0.05% Post-Capture Dispute Rate"]
        O3["4.2x Higher Enterprise AI Spend Limits"]
    end

    I1 --> N
    I2 --> N
    I3 --> N
    I4 --> N
    N --> O1
    N --> O2
    N --> O3
```

| Metric Tier | Metric Name | Formula / Definition | MVP (Hackathon) Target | Year-1 Production Target |
| :--- | :--- | :--- | :--- | :--- |
| **North-Star Metric** | **Protected Agentic GMV (`PA-GMV`)** | Total gross merchandise value (`USD` / `₹ INR`) processed through TALOS where `KyaMandate` verification + `Channel3` price audit + `PayPal Orders v2 AUTHORIZE` hold succeeded with zero unauthorized loss. | `$25,000` (`₹21.0 Lakh`) across synthetic Sandbox stress suites | `$120,000,000` (`₹1,008 Crore`) across 250 B2B enterprises & 15,000 developers |
| **Input Metric #1** | **Inline Firewall Latency (`p99`)** | End-to-end Rust `firewall-rs` execution time (`Ed25519` verify + `lol_html` + `DeBERTa-v3` ONNX `M-01`). | `<= 3.8 ms` (`0.4 ms` fast-path) | `<= 2.0 ms` globally across 12 edge PoPs |
| **Input Metric #2** | **Adversarial Block Recall** | `%` of indirect DOM prompt injections, Unicode tag smuggling (`R-02`), and price-gouging traps (`>15%` spread) blocked prior to PayPal authorization. | `>= 99.2%` on 500-case red-team benchmark | `>= 99.95%` with Elastic vector threat sharing (`M-04`) |
| **Input Metric #3** | **Channel3 Savings Realized** | Average basis points (`bps`) saved per rerouted procurement order via `API-06`. | `1,850 bps` (`18.5%` savings per rerouted SKU) | `940 bps` (`9.4%` net procurement savings across all B2B spend) |
| **Input Metric #4** | **Autonomous SLA Resolution Rate** | `%` of PayPal `AUTHORIZE` holds settled automatically via `API-09` (`CAPTURE`) or `API-10` (`VOID`) without manual FinOps intervention. | `92.0%` (remaining `8%` routed to `F-09` JS SDK v6 step-up) | `97.5%` autonomous resolution |

---

## 4. The 1-Year / 5-Year / 10-Year First-Principles Roadmap (Elon Musk Framework)

### 4.1 1-Year Picture (2026–2027): The Default Guardrail for PayPal MCP & B2B Procurement Agents
- **Product**: TALOS ships as an open-source Rust MCP proxy (`cargo install talos-firewall` / Docker container) and a managed multi-tenant cloud control plane on **Render** (`F-14`). Every developer using `@paypal/agent-toolkit`, Claude Desktop, Cursor, or OpenAI Agents SDK drops TALOS in front of `mcp.paypal.com` with a 1-line config change.
- **Scale**: Protecting **$120M (`₹1,008 Cr`) in annual PA-GMV** across **15,000 indie developers (`P-02`)** and **250 mid-market SaaS/e-commerce procurement teams (`P-01`, `P-04`)** in the US, EU, and India.
- **Ecosystem**: Native integration with **Channel3** (100M+ SKUs), **PayPal Orders v2 / Tracking v1 / Disputes v1**, **AG Studio** financial blotters, and **Bryntum Scheduler Pro** supply-chain boards.

### 4.2 5-Year Picture (2027–2031): The Global Know-Your-Agent (KYA) Clearinghouse & Cross-Border B2B Referee
- **Product**: TALOS evolves into the industry-standard **KYA Certificate Authority & Programmable Escrow Clearinghouse**. Hardware-backed passkey mandates (`WebAuthn` + corporate Okta/Entra delegation graphs) bind human CFOs to swarms of 1,000+ specialized procurement, cloud-finops, and logistics agents.
- **India & Cross-Border Scale**: Deep integration with **PayPal World + NPCI UPI Delegated Circles**, **ONDC B2B export catalogs**, and automated **RBI PA-CB (`P0802` / eFIRA)** compliance ledgers—enabling Indian MSME exporters (`P-03`) to accept instant zero-chargeback orders from US/EU enterprise AI buyer agents.
- **Scale**: **$18 Billion (`₹1.51 Lakh Crore`) in annual PA-GMV**; sub-millisecond threat intelligence federated across 50,000+ merchant domains via **Elastic** vector threat graphs (`F-12`).

### 4.3 10-Year Picture (2031–2036): Autonomous Machine-to-Machine (M2M) Economic Law
- **Product**: When 80%+ of global B2B and consumer supply-chain commerce is negotiated and executed autonomously by AI agents, TALOS operates as the **Autonomous Commercial Contract Referee**—automatically decomposing multi-million-dollar manufacturing, compute, and logistics contracts into dependency-linked **Bryntum** temporal milestones, verifying physical delivery via carrier/IoT/satellite attestation, and settling instantaneously over global programmable payment rails with zero litigation or chargeback friction.

---

## 5. Seven First-Principles Engineering & Product Tenets

1. **Stochastic Brains Must Never Hold Deterministic Keys**: An LLM (`M-02`) is a probabilistic token predictor; it must never hold raw `CAPTURE` credentials. All policy enforcement, signature verification (`Ed25519`), and HTML sanitization (`lol_html`) must execute in deterministic, memory-safe **Rust (`services/firewall-rs`)** outside the LLM context window.
2. **Authorization Is Not Settlement (Two-Phase Commit Money)**: Every agentic transaction is guilty until delivery is proven. Money moves in two distinct phases: **Phase 1 (`Orders v2 AUTHORIZE`)** locks buyer solvency; **Phase 2 (`CAPTURE` or `VOID`)** executes only when external reality (**Channel3** SKU match + **PayPal Shipment Tracking v1** within the **Bryntum** SLA window) confirms fulfillment.
3. **Inline Security Must Be Faster Than Network Jitter (`<4ms`)**: If a security firewall adds `2,000ms` of secondary LLM latency, developers will bypass it. By combining Rust `lol_html` streaming HTML rewriting (`0.4ms`) with local INT8 quantized `DeBERTa-v3` ONNX inference (`3.4ms`, `M-01`), TALOS secures agent browsing at wire speed.
4. **Independent Fair-Price Oracles Beat Self-Reported Merchant DOMs**: A merchant web page can lie about MSRP or dynamically inflate prices when it detects an AI agent user-agent. TALOS always cross-examines the checkout price against **Channel3's** independent 100M+ SKU graph (`F-04`) before locking funds.
5. **Time Is a First-Class Financial Dimension**: A payment hold without a temporal SLA is a stranded liability. Every dollar in escrow is bound two-way to a **Bryntum Scheduler Pro** timeline bar (`F-07`, `E-07`)—where time expiration or dependency slippage directly triggers financial rollback (`API-10`).
6. **Forensic Explainability Over Black-Box Blocks**: When a transaction is blocked or flagged, FinOps auditors (`P-04`) need courtroom-grade proof. Every row in **AG Grid / AG Studio** (`F-08`) expands to reveal the exact stripped DOM injection diff (`E-04`), the `Ed25519` signature hex, the **Channel3** price distribution, and the **Elastic OpenTelemetry** trace ID.
7. **Graceful Degradation & Human Sovereignty**: When an order exceeds autonomous policy bounds (`>$300`) or when external APIs degrade (`R-01`), TALOS never fails open; it smoothly escalates to the human principal via **PayPal JS SDK v6** (`F-09`) or falls back to deterministic replay verification.

---

## 6. Why Now? (Verified 2025–2026 Market, Security & Regulatory Inflection Points)

| Catalyst | Verified Evidence & Citation | Why This Makes TALOS Inevitable in 2026 |
| :--- | :--- | :--- |
| **1. Explosion of Indirect Prompt Injection Against Browser Agents** | **CVE-2026-22708 (March 2026)** & OWASP LLM01:2025 demonstrated that invisible CSS (`display:none`, `font-size:0`, zero-width Unicode tags `U+E0000`) embedded on third-party web pages reliably hijacks autonomous browser/MCP agents into executing unauthorized financial tool calls. | Existing WAFs inspect incoming HTTP requests to servers; they do **not** sanitize untrusted merchant HTML flowing *into* an AI agent's context window. TALOS's Rust `lol_html` + `DeBERTa-v3` sanitizer (`F-02`) solves this exact gap. |
| **2. Non-Human Traffic Surpassing Human Web Traffic** | The **2026 Imperva Bad Bot Report** confirmed automated bot and AI agent traffic reached **51%+ of all global web traffic**, while **78% of enterprise CFOs and risk leaders** surveyed in Q1 2026 blocked autonomous AI purchasing due to zero spend/reversal guardrails. | Enterprises desperately want the productivity of AI procurement (`P-01`), but cannot adopt `@paypal/agent-toolkit` until a cryptographic KYA + reversible escrow layer sits inline. |
| **3. Standardization of Model Context Protocol (`MCP`) & RFC 9421** | Anthropic's **Model Context Protocol (`MCP`)** (`modelcontextprotocol/rust-sdk`, `go-sdk`), PayPal's official **`mcp.paypal.com` (`@paypal/agent-toolkit`)**, and the IETF **RFC 9421 HTTP Message Signatures** standard for Web Bot Auth matured simultaneously in 2025–2026. | For the first time, TALOS can interpose a standardized MCP proxy (`F-03`) between *any* AI client (Claude, Cursor, OpenAI, custom Go/Python agents) and PayPal's settlement APIs without modifying the underlying LLM. |
| **4. The Platform War for Agentic Settlement (PayPal ACS vs. Stripe ACP)** | Look at `@paypal/agent-toolkit` v1.x today: `create_order` defaults to immediate `CAPTURE`, and `/provide-evidence` for disputes is unimplemented. Meanwhile, PayPal uniquely possesses **29-day `Orders v2 AUTHORIZE` holds**, **Shipment Tracking v1**, and **Customer Disputes v1**. | TALOS unlocks PayPal's latent structural advantage over Stripe and crypto rails—turning PayPal's native authorization, tracking, and dispute primitives into a self-enforcing 2PC Escrow Referee via **APIMatic's** strongly-typed Go SDK (`F-05`, `F-06`, `F-10`). |
| **5. Regulatory Mandates for Delegated AI Oversight (India & Global)** | **India DPDP Act 2023 (§6 Consent Artefacts)**, **NPCI Delegated/Agentic Payment norms**, and **EU AI Act (August 2026 enforcement, Article 14 Human Oversight)** require verifiable cryptographic consent logs and human step-up controls for high-risk automated financial transactions. | TALOS's `KyaMandate` (`E-03`) and **PayPal JS SDK v6** step-up co-signing modal (`F-09`) provide out-of-the-box regulatory compliance across US, EU, and Indian (`₹`) corridors. |

---

## 7. Impact Thesis (Theory of Change)

```mermaid
flowchart TD
    A["Root Problem:<br/>AI Agents Hold Raw CAPTURE Authority<br/>-> Vulnerable to CVE-2026-22708 DOM Injection,<br/>Hallucinated SKUs & 90%+ Price Gouging"] --> B["TALOS Intervention:<br/>1. Rust KYA Mandate + <4ms DOM Sanitizer (F-01..F-03)<br/>2. Go Channel3 Fair-Price Oracle (F-04)<br/>3. PayPal Orders v2 AUTHORIZE + Tracking 2PC Escrow (F-05..F-06)<br/>4. AG Studio & Bryntum Two-Way Command Center (F-07..F-09)"]
    B --> C1["For Buyers & Enterprises (P-01, P-02):<br/>0% Fraud Loss + 18.5% Price Gouging Saved +<br/>Instant 0-Second Auto-VOID on Missed Delivery SLA"]
    B --> C2["For Verified Merchants & Exporters (P-03):<br/>Unlock High-Intent B2B Agent Orders +<br/>Auto-CAPTURE on Delivery + 85% Win Rate on Friendly-Fraud Disputes"]
    B --> C3["For PayPal Ecosystem:<br/>Shifts High-Value B2B & Prosumer Agentic GMV<br/>onto PayPal Orders v2, Tracking v1 & JS SDK v6"]
```

### Quantitative Impact Projections
- **For B2B Procurement Teams (`P-01`)**: Reduces manual purchase-order review labor by **74%** (saving `~14 hours/week` per procurement manager, or `$36,400 / ₹30.5 Lakh` annually per mid-market company) while eliminating **100%** of prompt-injection and price-gouging losses.
- **For Indie AI Developers (`P-02`)**: Shrinks the time required to implement production-grade agentic payment safety from **6 weeks of custom security engineering to 60 seconds** (`npx/cargo` MCP bridge + `render.yaml` Blueprint).
- **For Verified Merchants & Indian MSME Exporters (`P-03`)**: Eliminates the **"Friendly-Fraud Chargeback Tax"** (which costs global merchants `$100B+` annually) by automatically packaging cryptographic `Ed25519` mandates, **Channel3** SKU proofs, and **PayPal Shipment Tracking** delivery receipts into `/v1/customer/disputes/{id}/provide-evidence` (`F-10`), lifting dispute representment win rates from **22% to 84%+**.
