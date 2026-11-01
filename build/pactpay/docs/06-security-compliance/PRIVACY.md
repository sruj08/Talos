# Privacy Architecture & DPDP / GDPR Compliance — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Data Protection Officer & Legal Council (R.S. Sharma + Harvey Specter Bench) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [DATA_MODEL](../03-engineering/DATA_MODEL.md) · [COMPLIANCE](COMPLIANCE.md) · [OBSERVABILITY](../05-ops/OBSERVABILITY.md)

---

## 1. Privacy-by-Design Principles

PactPay is architected from day one around **Data Minimization, Cryptographic Pseudonymization, and Non-Custodial Financial Insulation** in compliance with:
- **India's Digital Personal Data Protection (DPDP) Act, 2023** & **DPDP Rules, 2025** (`R-06`).
- **EU General Data Protection Regulation (GDPR)** (Articles 5, 6, 15–22, 25, 32).
- **California Consumer Privacy Act / CPRA (CCPA)**.

### Core Privacy Guarantees
1. **Zero Raw Payment Instrument Storage**: PactPay **never** collects, processes, or stores credit card numbers (PAN), CVVs, bank account numbers, UPI PINs, or PayPal login passwords. All payment authentication happens inside **PayPal's hosted Sandbox/Live environment (`Orders v2` & `PayPal JS SDK v6`)**.
2. **Cryptographic Public Keys Over Personal Identifiers**: Autonomous agents (`E-02`) and spending mandates (`E-03`) are identified by `UUID` and `Ed25519` public keys (`ed25519_pubkey`), not personal names or government IDs.
3. **Zero PII Sent to External LLMs (`M-02`, `M-03`)**: Before any transaction context is passed to `Claude 3.7 Sonnet`, `GPT-4o`, or the `AG Studio Copilot`, our Rust/Go middleware strips personal names, emails, and street addresses, passing only pseudonymized `mandate_id`, SKU identifiers, and cent amounts.

---

## 2. Personal Data Inventory Across Entities (`E-01`..`E-10`)

| Entity ID | Entity / Table | Fields Containing Personal or Sensitive Data | PII Classification | Purpose of Processing | Legal Basis (DPDP 2023 / GDPR) | Retention Period | Who Sees It |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`E-01`** | `PrincipalUser` (`principal_users`) | `email`, `display_name`, `paypal_payer_id` (opaque PayPal Sandbox ID) | **PII (Restricted)** | Account authentication, mandate ownership, step-up co-sign notification (`F-09`). | Explicit Consent (DPDP §6 / GDPR Art. 6(1)(a)) & Contract Performance | Active account + `90 days` post-deletion request (except statutory tax/audit hashes) | Authenticated Principal (`P-01`/`P-02`) & Enterprise FinOps (`P-04`, masked) |
| **`E-02`** | `AgentIdentity` (`agent_identities`) | `mcp_client_id`, `ed25519_pubkey`, `rfc9421_key_id` | **Non-PII (Pseudonymous Technical ID)** | Cryptographic Know-Your-Agent (KYA) verification (`F-01`, `API-02`). | Legitimate Security & Contract | Until revoked by Principal | Principal, FinOps Auditor, Rust Firewall |
| **`E-03`** | `KyaMandate` (`kya_mandates`) | `principal_id (FK)`, `ed25519_signature`, spending limits | **Pseudonymous Financial Policy** | Enforcing human spending limits (`max_amount_cents`, `max_spread_bps`). | Explicit Mandate Consent | `180 days` (CERT-In security log requirement) | Principal, FinOps Auditor |
| **`E-04`** | `FirewallScanLog` (`firewall_scan_logs`) | `raw_dom_hash`, `stripped_payloads_json` (PII-scrubbed merchant HTML) | **Non-PII (Security Telemetry)** | Prompt-injection forensics (`F-02`, `F-08`) and Elastic vector indexing (`F-12`). | Security & Fraud Prevention | `180 days` (CERT-In Directions) | FinOps Auditor, Security Ops |
| **`E-05`** | `Channel3Benchmark` (`channel3_benchmarks`) | `sku_query`, `matched_product_id`, `median_price_cents` | **Non-PII (Public Catalog Data)** | Fair-market price validation (`F-04`). | N/A (Non-personal data) | `90 days` | All authorized console users |
| **`E-06`** | `EscrowTransaction` (`escrow_transactions`) | `paypal_order_id`, `paypal_auth_id`, `paypal_capture_id`, `amount_cents` | **Financial Transaction Metadata** | 2PC Escrow orchestration (`F-05`, `F-06`) and reconciliation. | Contract & Statutory Financial Recordkeeping | `180 days` (MVP) / `7 years` (v1 Statutory Financial Audit) | Principal, Merchant (`P-03`), FinOps (`P-04`) |
| **`E-07`** | `SlaTimelineTask` (`sla_timeline_tasks`) | `carrier_code`, `tracking_number` (street address never stored in PactPay; stays in PayPal) | **Pseudonymous Logistics ID** | Carrier delivery verification (`F-06`) and Bryntum SLA timeline (`F-07`). | Contract Performance | `180 days` | Principal, Merchant, FinOps |
| **`E-08`** | `DisputeEvidenceBundle` (`dispute_evidence_bundles`) | `paypal_dispute_id`, `mandate_sig`, `kernel_screenshot_url` (merchant page only) | **Pseudonymous Audit Evidence** | Automated dispute representment (`F-10`, `API-11`). | Legal Claims & Contract | `1 year` after dispute resolution | Principal, PayPal Disputes API |
| **`E-09`** | `WebhookEventLedger` (`webhook_event_ledger`) | `transmission_id`, `payload_json` (payer email masked before DB write) | **Pseudonymous Webhook Log** | Cryptographic webhook audit & replay prevention (`API-04`, `API-14`). | Security & Fraud Prevention | `180 days` (CERT-In Directions) | Security Ops, FinOps Auditor |
| **`E-10`** | `IdempotencyLock` (`idemp:{request_id}`) | `request_id` (UUID), state string | **Non-PII (Ephemeral Lock)** | Preventing double PayPal `CAPTURE` (`R-03`). | Technical Integrity | `24 hours` automatic TTL in Valkey | Internal Go Orchestrator only |

---

## 3. DPDP Act 2023 & DPDP Rules 2025 Compliance Architecture (`R-06`)

### 3.1 Itemized Notice & Verifiable Consent (§5 & §6 of DPDP Act 2023)
Before a user (`P-01` or `P-02`) registers an account or signs their first `KyaMandate` (`E-03`), PactPay presents a clear, standalone **DPDP Consent & Mandate Notice** (available in English and 22 Indian languages supported under the Eighth Schedule via our localization layer):

> **PactPay Data Fiduciary Notice (DPDP Act 2023 §5)**:
> 1. **What Personal Data We Collect**: Your work email address, display name, and opaque PayPal Sandbox Payer ID (`E-01`), plus the cryptographic public keys of your AI agents (`E-02`).
> 2. **Why We Collect It**: Strictly to cryptographically verify your AI spending mandates (`F-01`), place reversible PayPal `Orders v2 AUTHORIZE` escrow holds (`F-05`), and notify you when an order requires human step-up approval (`F-09`).
> 3. **What We Never Collect**: We never access or store your credit card numbers, bank account credentials, or home address.
> 4. **Your Rights as a Data Principal**: You may withdraw mandate consent in 1 click (immediately revoking your agent's `Ed25519` key and voiding pending authorizations), export a machine-readable JSON copy of your records, or request account erasure at any time via **Settings → Privacy & DPDP Rights** or by emailing `dpo@pactpay.io`.

### 3.2 Data Principal Rights Implementation (§11–§14 of DPDP Act 2023 & GDPR Art. 15–22)
| Statutory Right | SLA | Self-Serve Mechanism in PactPay |
| :--- | :--- | :--- |
| **Right to Access & Summary (§11)** | Instant (`<2s`) | Click **"Export My DPDP / GDPR Data Package (JSON)"** in the Command Center to download all `E-01`, `E-02`, `E-03`, and `E-06` records linked to the user. |
| **Right to Correction & Erasure (§12)** | Instant (`<5s`) | Clicking **"Erase Personal Profile"** anonymizes `email` and `display_name` in `principal_users` (`E-01` -> `deleted_user_<sha256>@redacted.invalid`), revokes all `E-02` agent keys, and purges active sessions while preserving non-PII cryptographic audit hashes required by CERT-In. |
| **Right to Withdraw Consent (§6(4))** | Instant (`<100ms`) | Clicking **"Revoke Mandate / Kill-Switch"** sets `kya_mandates.status = 'REVOKED'` in PostgreSQL + Valkey and optionally fires `POST /v2/payments/authorizations/{id}/void` (`API-10`) on uncommitted holds. |
| **Right to Grievance Redressal (§13)** | Ack `<24h`, Resolution `<7 days` | Built-in Grievance Portal routing directly to PactPay's designated Data Protection Officer (`dpo@pactpay.io`), with escalation links to the Data Protection Board of India (DPBI). |
| **Right to Nominate (§14)** | Instant | Enterprise/Individual principals can register a backup nominee email/public key authorized to assume control of or void active escrows in case of incapacity. |

---

## 4. Children's Data & Age-Gating (§9 of DPDP Act 2023 & COPPA)

PactPay is strictly a **B2B Procurement and Developer FinOps platform (`18+` years of age)** governed by PayPal's commercial account eligibility rules.
- PactPay does not knowingly onboard or process personal data of individuals under 18 years of age.
- No behavioral tracking, profiling, or targeted advertising exists anywhere in the platform.

---

## 5. Data Protection Impact Assessment (DPIA) Summary

| Risk Identified in DPIA | Severity Before Controls | Technical & Organizational Control | Residual Risk |
| :--- | :--- | :--- | :--- |
| **Automated AI Decision-Making Affecting User Funds (GDPR Art. 22)** | High | AI agents (`M-02`) cannot execute irreversible captures; deterministic Rust rules (`F-01`) enforce human-signed limits, `AUTHORIZE` holds are 100% reversible (`F-06`), and orders `>$300` require explicit human step-up via **PayPal JS SDK v6 (`F-09`)**. | Low |
| **Inadvertent PII Ingestion from Scraped Merchant Pages (`E-04`)** | Medium | `services/firewall-rs` runs regex PII scrubbing (emails, phone numbers, credit-card Luhn patterns) on `sanitized_dom` before persisting to PostgreSQL or Elastic Cloud. | Very Low |
| **Cross-Border Telemetry Transfer** | Medium | All logs exported to Elastic Cloud (`F-12`) are pre-redacted of PII; in v1 India Production, PostgreSQL and Elastic nodes reside in Mumbai (`ap-south-1`), and no Government of India restricted-country transfers occur (DPDP §16). | Very Low |
