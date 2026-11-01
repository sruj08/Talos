# Responsible AI, Governance & Human-in-the-Loop Safety — TALOS
> Project: TALOS · Owner: AI Governance, Risk & Compliance Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [MODELS](MODELS.md) · [AI_EVALS](AI_EVALS.md) · [COMPLIANCE](../06-security-compliance/COMPLIANCE.md)

---

## 1. Graded Autonomy Framework (`L1`..`L4`) & Human-in-the-Loop Step-Up (`F-09`)

TALOS rejects binary "full autonomy vs. manual checkout" in favor of a cryptographically enforced **4-Level Graded Autonomy Matrix**:

| Autonomy Level | Order Value & Risk Condition | Allowed Agent Action | Human Principal Involvement | PayPal Sandbox Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **`L1: Discovery Only`** | No active `KyaMandate` (`E-03`) or expired mandate | Search **Channel3** (`API-06`) and inspect DOMs via **Rust Firewall** (`API-03`). | Must explicitly issue & sign a new `Ed25519` Mandate (`API-01`). | None (`$0.00` financial authority). |
| **`L2: Bounded Autonomous Escrow`** | Order `<= KyaMandate.max_amount_cents` (e.g., `<=$300` / `₹25,200`), DOM Risk `< 0.25`, and Channel3 Spread `<= max_spread_bps` | Autonomous placement of a **reversible 29-day PayPal `AUTHORIZE` hold** (`API-07`). **Cannot `CAPTURE`** until carrier tracking confirms `DELIVERED` (`API-08`). | Asynchronous oversight in **AG Grid** (`F-08`) and **Bryntum Scheduler Pro** (`F-07`) with 1-click `VOID` override at any time. | `POST /v2/checkout/orders` (`intent: "AUTHORIZE"`) → Auto-`CAPTURE` on carrier delivery (`API-09`). |
| **`L3: Step-Up Biometric Co-Sign`** | Order `> KyaMandate.max_amount_cents` (e.g., `$450` on a `$300` cap) OR moderate anomaly score (`0.25..0.74`) | Checkout pauses automatically in state `STEP_UP_REQUIRED` (`E-06`). | Principal must approve via **PayPal JS SDK v6 (`PayPalStepUpModal.tsx`, `F-09`)** before authorization proceeds. | `<PayPalButtons intent="authorize" />` interactive human approval (`CHECKOUT.ORDER.APPROVED`). |
| **`L4: Hard Cryptographic Block`** | `firewall-rs` detects DOM prompt injection (`Risk >= 0.75`, `F-02`) OR **Channel3** detects price gouging (`> max_spread_bps`, `F-04`) | Immediate hard abort (`422 Unprocessable Entity`); auto-reroutes agent to verified Channel3 merchant. | Alerted via crimson flash in **AG Grid** and optional Slack/Zapier webhook (`F-12`). | Zero calls made to PayPal `Orders v2` (`$0.00` locked or risked). |

---

## 2. Explainability & Forensic Transparency (`P-04` FinOps Auditor View)

Every AI and security decision in TALOS is **100% inspectable and deterministic**:
1. **No Black-Box Blocks**: When `firewall-rs` blocks a checkout (`BLOCKED_FIREWALL`), expanding the row in **AG Grid's Master-Detail drawer** (`ForensicDetailDrawer.tsx`) displays:
   - The exact CSS selector or HTML comment rule (`rule_id: "CSS_HIDDEN_INSTRUCTION_OVERRIDE"`) that triggered.
   - The verbatim stripped attack string highlighted in red alongside the `raw_dom_hash` (`SHA-256`).
   - The `DeBERTa-v3` (`M-01`) confidence score (`0.9942`) and execution latency (`2,840 µs`).
2. **Transparent Price Oracle Math**: When `orchestrator-go` blocks a price-gouging storefront (`BLOCKED_PRICE_GOUGING`), the drawer renders an **AG Chart** plotting the merchant's ask (`$480.00`) against **Channel3's** verified market median (`$249.00`) and lowest verified seller (`$245.00`), showing the exact basis-point spread (`+9,277 bps`).
3. **Cryptographic Non-Repudiation**: Every row displays the verified `Ed25519` public key and `128-hex` signature of the `KyaMandate` (`E-03`) that authorized the agent.

---

## 3. Fairness, Anti-Bias & Small-Merchant Protection

| Potential Bias / Fairness Risk | Concrete Mitigation Engineered into TALOS |
| :--- | :--- |
| **False-Positive Penalization of Legitimate Discounts or Regional Merchants** | **Channel3 Oracle (`F-04`)** only blocks **upward price gouging** (`ask > median + max_spread_bps`). Independent or Indian cross-border SME merchants offering lower prices (`spread_bps <= 0`) are **prioritized**, provided their storefront DOM is free of prompt injections and they supply valid carrier tracking (`F-06`). |
| **Accessibility HTML (`aria-label`, `sr-only`) Mistaken for Hidden Prompt Injection** | `sanitizer.rs` (`F-02`) does **not** blindly fail on every `aria-label` or `.sr-only` element; it extracts their text and runs `aho-corasick` + `DeBERTa-v3` (`M-01`) semantic classification so standard WCAG 2.2 screen-reader labels pass with `0.0%` false-positive penalty. |
| **Language & Regional Fairness (India + Global)** | Currency normalization supports `USD`, `EUR`, `GBP`, and `INR` (`₹`), and `normalizer.rs` (`R-02`) preserves valid Indic UTF-8 scripts (Devanagari, Tamil, Telugu, Kannada, Bengali) while stripping invisible `U+E0000` tag smuggling blocks. |

---

## 4. Misuse Scenarios & Abuse Prevention

1. **Malicious Agent Attempting to Self-Sign a Mandate**:
   - *Prevention*: `services/firewall-rs` verifies `KyaMandate.ed25519_signature` strictly against the human `PrincipalUser.ed25519_pubkey_hex` (`E-01`), which is distinct from the agent's `AgentIdentity` key (`E-02`). An agent cannot raise its own budget cap.
2. **Merchant Submitting Fake Carrier Tracking Number to Trigger Auto-`CAPTURE`**:
   - *Prevention*: `API-08` verifies the tracking status (`DELIVERED`) against PayPal Shipment Tracking v1 (`/v1/shipping/trackers-batch`) and carrier status webhooks before `API-09` (`authorizationsCapture`) can transition the state machine.
3. **Replay of Captured Mandate on Multiple Orders**:
   - *Prevention*: Cumulative spend against a `mandate_id` is tracked inside a serializable PostgreSQL transaction (`SUM(amount_cents) WHERE mandate_id = $1 AND state NOT IN ('PAYPAL_VOIDED', 'BLOCKED_FIREWALL', 'BLOCKED_PRICE_GOUGING')`), and each checkout requires a unique `PayPal-Request-Id` (`E-10`).

---

## 5. Regulatory Alignment: MeitY AI Advisories, RBI & EU AI Act Classification

| Framework | Classification of TALOS | How TALOS Complies |
| :--- | :--- | :--- |
| **India MeitY AI Advisories (2024–2026) & IndiaAI Safety Guidelines** | **Defensive Financial Cybersecurity & Guardrail Infrastructure** | Prevents unverified/hallucinated financial actions; maintains immutable audit trails (`E-04`, `E-06`, `E-09`) and mandatory human step-up (`F-09`). |
| **DPDP Act 2023 (India) & CERT-In Directions** | **Data Processor (Zero-PII-Retention Security Proxy)** | Scrubs PII before indexing (`DATA_PIPELINE.md`); retains security scan logs (`E-04`) for 180 days per CERT-In mandate (`R-06`). |
| **EU AI Act (Regulation 2024/1689)** | **Limited / Minimal Risk AI Safety Component** (Not credit scoring consumer creditworthiness; acts as a buyer-side fraud & prompt-injection firewall) | Full Article 14 Human Oversight (`L1`–`L4` graded autonomy + `PayPalStepUpModal.tsx`), Article 13 Transparency (Master-Detail forensic explanations), and Article 15 Cybersecurity (`CVE-2026-22708` mitigation). |
