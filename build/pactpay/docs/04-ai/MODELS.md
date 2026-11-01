# AI Models Catalog & Model Cards — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: AI & Security Research Team · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [PROMPTS](PROMPTS.md) · [AI_EVALS](AI_EVALS.md) · [ADR-0004](../03-engineering/adr/ADR-0004-rust-lol-html-and-deberta-onnx-prompt-firewall.md)

---

## 1. AI Model Architecture Philosophy (Andrej Karpathy First Principles)

PactPay never uses a massive, slow cloud LLM where a fast, deterministic local classifier belongs, and never uses a naive regex where semantic reasoning is required. Every model (`M-01`..`M-04`) has a **deterministic zero-key fallback** so judges can run and verify the full platform even without external LLM API keys (`R-04`).

---

## 2. Master Models Matrix (`M-01`..`M-04`)

| Model ID | Model Name & Provider | Runtime Location | Primary Task in PactPay | Context Limit | Latency (p50 / p95) | Cost per 1,000 Calls (`$` / `₹`) | Deterministic Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`M-01`** | **ProtectAI `deberta-v3-base-prompt-injection-v2` (INT8 Quantized ONNX)** | Local in-memory inside `services/firewall-rs` via `ort` (ONNX Runtime) | Classifies merchant DOM text fragments & stripped nodes for indirect prompt injection (`F-02`, `API-03`). | `512` tokens per chunk (sliding window) | **`1.8 ms / 3.4 ms`** | **`$0.00` (₹0.00)** — 100% Local CPU | `lol_html` + `aho-corasick` 140-pattern regex/CSS rule engine (`0.38 ms`). |
| **`M-02`** | **Claude 3.7 Sonnet (`claude-3-7-sonnet-20250219`) / GPT-4o (`gpt-4o-2024-11-20`)** | Cloud API via `orchestrator-go` & Next.js `/api/mcp/paypal-bridge` (`API-16`) + **APIMatic Context Plugin** | Autonomous procurement reasoning, SKU spec comparison against **Channel3**, and **Dispute Evidence Bundle** (`F-10`) synthesis. | `200k` / `128k` tokens | **`780 ms / 1,150 ms`** | **`$4.50` (₹378.00)** | `gemini-2.5-flash` (`$0.15` / ₹12.60) or built-in deterministic procurement router. |
| **`M-03`** | **AG Studio Copilot Model (`gpt-4o-mini` / `claude-3-5-haiku-20241022`)** | Next.js `/api/mcp/paypal-bridge` (`API-16`) backing `AgStudioBlotter.tsx` | Translates natural-language financial analyst queries into **AG Grid** `ColumnState`, filters, and **AG Charts** configs (`F-08`). | `128k` tokens | **`390 ms / 620 ms`** | **`$0.35` (₹29.40)** | Deterministic NL-to-AG-Grid intent parser + 4 1-click preset view buttons. |
| **`M-04`** | **Elastic `elser_model_2` (Sparse Vector) / `text-embedding-3-small`** | **Elastic Cloud** (`Elasticsearch 8.17`) + `orchestrator-go` (`F-12`) | Embeds intercepted prompt-injection payloads (`E-04`) for cross-merchant zero-day attack clustering and RAG lookup. | `512` / `8,191` tokens | **`45 ms / 85 ms`** | **`$0.04` (₹3.36)** | Local Rust `MinHash` / `SimHash` 64-bit lexical fingerprint index. |

---

## 3. Detailed Model Cards (`M-01`..`M-04`)

### 3.1 Model Card: `M-01` — ProtectAI DeBERTa-v3 Prompt-Injection Classifier (INT8 ONNX)
- **Artifact**: `models/deberta-v3-prompt-injection-int8.onnx` (`~184 MB` INT8 quantized from `ProtectAI/deberta-v3-base-prompt-injection-v2`, Apache-2.0 License).
- **Why Chosen**:
  - Calling a cloud LLM (`GPT-4o`) to check if a merchant HTML page contains a prompt injection adds `>1,000ms` latency and is recursively vulnerable to the injection itself.
  - Running `DeBERTa-v3` locally inside Rust via `ort` + `tokenizers` executes in **`1.8ms` median (`3.4ms` p95)** on standard x86_64 / ARM64 CPUs with zero GPU requirement (`ADR-0004`).
- **Inputs & Outputs**:
  - **Input**: Normalized text extracted from suspicious DOM nodes, HTML comments, `aria-*` attributes, and decoded Base64 strings (`R-02`).
  - **Output**: Logits converted via softmax to `P(INJECTION) ∈ [0.0000, 1.0000]`. Any score `>= 0.7500` marks `injection_detected = true` in `FirewallScanLog` (`E-04`) and blocks checkout (`422 Unprocessable Entity`).
- **Multilingual & Indic Readiness**:
  - Pre-paired with `normalizer.rs` (`R-02`) + multilingual `aho-corasick` rules covering English, Hindi/Devanagari (`सिस्टम ओवरराइड`), and Hinglish adversarial directives.
- **Known Limitations & Mitigation**:
  - Cold linking of native C++ ONNX libraries can slow initial Docker builds on free cloud tiers (`R-04`). Mitigated via Cargo feature flag `onnx-classifier` and our always-active `0.38ms` `lol_html` + `aho-corasick` deterministic fast path.

---

### 3.2 Model Card: `M-02` — Autonomous Procurement & Dispute Reasoning Agent (`Claude 3.7 Sonnet` / `GPT-4o`)
- **Provider**: Anthropic / OpenAI (augmented with **APIMatic PayPal Context Plugin**).
- **Why Chosen**:
  - Best-in-class tool-calling reliability on multi-step MCP workflows (`pactpay_issue_mandate` → `pactpay_sanitize_dom` → `channel3_benchmark` → `pactpay_execute_protected_checkout`).
  - When paired with the **APIMatic Context Plugin**, schema compliance on PayPal `Orders v2` (`intent: "AUTHORIZE"`), `Shipment Tracking v1`, and `Customer Disputes v1` reaches **`100.0%`** in our evaluation suite (`AI_EVALS.md`).
- **Inputs & Outputs**:
  - **Input**: Sanitized merchant DOM (`E-04.sanitized_dom`), active `KyaMandate` (`E-03`), and `Channel3Benchmark` (`E-05`).
  - **Output**: Structured MCP tool invocation (`API-05`) or formal Markdown representment brief (`E-08.evidence_narrative_md`) for PayPal `POST /v1/customer/disputes/{id}/provide-evidence`.
- **Safety Invariant**:
  - `M-02` **never** holds raw `PAYPAL_CLIENT_SECRET` credentials and **never** calls PayPal `CAPTURE` directly; all financial mutations pass through `orchestrator-go`'s deterministic 2PC state machine.

---

### 3.3 Model Card: `M-03` — AG Studio Financial Blotter Copilot (`gpt-4o-mini` / `claude-3-5-haiku`)
- **Role**: Embedded inside `AgStudioBlotter.tsx` (`F-08`, `API-16`) to fulfill the **AG Grid + PayPal** challenge (*"Build a payments dashboard without building a dashboard"*).
- **Inputs & Outputs**:
  - **Input**: Analyst natural-language prompt (e.g., *"Group by merchant risk, filter out voided prompt injections, and chart authorized vs captured PayPal holds in INR"*) + current AG Grid column schema.
  - **Output**: Strict JSON matching AG Grid `ApplyColumnStateParams`, `FilterModel`, and `CreateCrossFilterChartParams`.

---

### 3.4 Model Card: `M-04` — Elastic ELSER v2 / Threat Vector Embedder
- **Role**: Indexes every stripped DOM injection payload (`E-04.stripped_payloads_json`) into **Elastic Cloud** (`F-12`) so when a new merchant storefront uses a semantically similar jailbreak phrasing, PactPay surfaces prior matching incidents across the network in `<85ms`.
