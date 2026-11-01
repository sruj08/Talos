# Enterprise Service Level Agreement (SLA) — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Principal Enterprise Architecture & Legal Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [PERFORMANCE](../03-engineering/PERFORMANCE.md) · [RUNBOOK](RUNBOOK.md) · [BUSINESS_MODEL](../07-business/BUSINESS_MODEL.md)

---

## 1. Scope & Service Commitment

This Service Level Agreement (**"SLA"**) governs the availability, latency, cryptographic mandate enforcement, and reversible escrow orchestration guarantees provided by **PactPay (AegisPay)** to B2B Mid-Market & Enterprise Customers (`P-01` Arjun Mehta, `P-04` Priya Nair) and Verified Merchants (`P-03` Vikram Rao).

> **Note on MVP (Hackathon) vs. v1 (Production)**: During the PayPal AI Hackathon (`MVP`), PactPay operates against the **PayPal Developer Sandbox (`api-m.sandbox.paypal.com`)** with an automated **Recorded Sandbox Replay Fallback (`R-01`)** to guarantee `100%` demo availability for judges. The contractual service credits below apply to **v1 Production** deployments running on multi-region Render Pro infrastructure (`F-14`).

---

## 2. Quantitative Service Level Objectives (SLOs)

| Metric ID | Service Component | Service Level Indicator (SLI) | Monthly Target (SLO) | Measurement Window |
| :--- | :--- | :--- | :--- | :--- |
| **`SLO-01`** | **Platform Availability** (`API-01`..`API-16`) | Percentage of non-5xx responses at Render Envoy Edge (excluding scheduled maintenance) | **`>= 99.95%`** (`<= 21.9 mins` downtime/month) | Rolling 30-day calendar month |
| **`SLO-02`** | **KYA Mandate Cryptographic Verification** (`API-02`, `F-01`) | `Ed25519` + RFC 9421 verification latency inside `pactpay-firewall-rs` | **p50 `< 0.4 ms`** · **p99 `< 1.2 ms`** | 5-minute sliding window |
| **`SLO-03`** | **Wire-Speed DOM Prompt-Injection Scan** (`API-03`, `F-02`, `M-01`) | `lol_html` + `DeBERTa-v3` INT8 ONNX classification latency (`<= 100 KB` HTML) | **p50 `< 1.9 ms`** · **p95 `< 4.0 ms`** | 5-minute sliding window |
| **`SLO-04`** | **Protected Checkout Orchestration** (`API-05`, `F-04`, `F-05`) | End-to-end orchestration overhead (excluding external PayPal / Channel3 network RTT) | **p50 `< 12 ms`** · **p95 `< 28 ms`** | 5-minute sliding window |
| **`SLO-05`** | **Real-Time UI Telemetry Broadcast** (`API-15`, `F-07`, `F-08`) | WebSocket event propagation from Go state transition to **AG Grid** / **Bryntum** | **p95 `< 50 ms`** | 5-minute sliding window |
| **`SLO-06`** | **Idempotent Zero-Double-Capture Guarantee** (`E-06`, `E-10`, `R-03`) | Incidence of duplicate PayPal `CAPTURE` executions for any unique `PayPal-Request-Id` | **`100.00%` (`0` duplicate captures)** | Continuous invariant |

---

## 3. The PactPay "Zero Unauthorized Capture" Financial Guarantee

Unlike standard agent toolkits that pass raw `CAPTURE` credentials to an LLM, PactPay provides a three-part deterministic architectural guarantee:
1. **Cryptographic Mandate Bound (`F-01`)**: PactPay will never submit a `POST /v2/checkout/orders` (`intent: "AUTHORIZE"`) request (`API-07`) unless the request bears a valid, non-expired `Ed25519` signature from a registered `PrincipalUser` (`E-01`) and satisfies `amount_cents <= max_amount_cents` (or has received an explicit human co-sign via **PayPal JS SDK v6**, `F-09`).
2. **Fair-Market Price Ceiling (`F-04`)**: PactPay will never authorize an external merchant checkout whose unit price exceeds the **Channel3 (`trychannel3.com`)** verified market median by more than the mandate's `max_spread_bps` (default `1500 bps` / `15%`).
3. **Automatic SLA Breach Rollback (`F-06`, `F-07`)**: If a verified carrier tracking webhook (`DELIVERED`) is not recorded via PayPal Shipment Tracking (`API-08`) before the `sla_deadline` configured on the **Bryntum Scheduler Pro** timeline (`E-07`), PactPay automatically executes `POST /v2/payments/authorizations/{auth_id}/void` (`API-10`) within **60 seconds** of deadline expiry, returning `100%` of the ring-fenced hold to the buyer before PayPal's 29-day authorization honor window lapses.

---

## 4. Service Credits Schedule (v1 Enterprise Production)

If PactPay fails to meet **`SLO-01` (`99.95%` Monthly Availability)** or **`SLO-03` (`<4.0ms` p95 Firewall Inspection)** in any calendar month, Enterprise customers receive automatic billing credits applied to their next monthly invoice:

| Monthly Uptime Percentage (`SLO-01`) | Maximum Monthly Downtime | Service Credit (% of Monthly SaaS & Escrow Fee) |
| :--- | :--- | :--- |
| `99.90%` to `< 99.95%` | `21.9 mins` – `43.8 mins` | **`10%` Credit** |
| `99.50%` to `< 99.90%` | `43.8 mins` – `3.65 hours` | **`25%` Credit** |
| `99.00%` to `< 99.50%` | `3.65 hours` – `7.30 hours` | **`50%` Credit** |
| `< 99.00%` | `> 7.30 hours` | **`100%` Credit** |

---

## 5. Support Tiers & Incident Response Commitments

| Support Tier | Included Plan | Channels | SEV-1 Response | SEV-2 Response | Dedicated Audit Export (`P-04`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Developer / Indie (`P-02`)** | Free / Starter Tier | GitHub Issues, Discord, Status Page | `< 4 hours` (Automated circuit-breakers active 24/7) | `< 12 hours` | 30-day self-serve JSON/CSV export via AG Studio |
| **Growth B2B (`P-01`)** | Pro Tier (`$199 / ₹16,500 / mo`) | 24/7 Slack Connect, Email, PagerDuty Webhook | **`< 15 minutes`** | **`< 1 hour`** | 180-day CERT-In & DPDP compliant Elastic audit stream |
| **Enterprise FinOps (`P-04`)** | Enterprise Custom | Dedicated TAM, 24/7 Phone/Slack, Custom Runbooks | **`< 5 minutes`** | **`< 15 minutes`** | 7-year WORM S3/Elastic archival + SOC 2 / ISO 42001 attestation |

---

## 6. SLA Exclusions

Service level calculations exclude latency or downtime directly caused by:
1. Upstream outages at external financial rails (`api-m.paypal.com` / `api-m.sandbox.paypal.com`) or carrier tracking networks (UPS/FedEx/DHL), provided PactPay's circuit breaker and idempotency queue (`E-10`) preserve all state without data loss.
2. Customer-configured `KyaMandate` rules (`E-03`) intentionally blocking transactions due to budget caps or spread limits.
3. Scheduled maintenance windows announced at least **72 hours** in advance and totaling `< 2 hours/year` (performed using zero-downtime Render blue/green rolling deploys).
