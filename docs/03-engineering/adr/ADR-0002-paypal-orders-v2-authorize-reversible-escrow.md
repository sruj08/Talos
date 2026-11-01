# ADR-0002: PayPal Orders v2 `AUTHORIZE` as a Reversible Two-Phase Commit (2PC) Escrow Referee
> Project: PactPay (AegisPay) · Owner: Payments & Escrow Engineering · Status: Accepted · Last updated: 2026-11-01
> Related: [ARCHITECTURE](../ARCHITECTURE.md) · [API_SPEC](../API_SPEC.md) · [PROJECT_BRIEF](../../00-overview/PROJECT_BRIEF.md)

---

## Status
**Accepted** (2026-11-01)

## Context and Problem Statement
Default AI agent payment toolkits (`@paypal/agent-toolkit` `create_order` with `intent: "CAPTURE"`, Stripe instant charges, or direct invoice payment) execute **immediate, irreversible settlement** the moment an LLM calls the tool. If the agent was tricked by an indirect DOM prompt injection (`CVE-2026-22708`), overpaid a price-gouging merchant, or bought from a seller that never ships within the required SLA, the buyer's money is already gone and requires a slow 30-to-90-day chargeback.

## Decision Drivers
- **Zero False-Capture Guarantee**: No funds should ever be settled to a merchant until cryptographic mandate checks, fair-price checks, and physical/digital delivery SLA checks succeed.
- **Zero-Custody Regulatory Compliance (`R-06`)**: PactPay must never take custody of buyer funds in its own bank account; all funds must remain inside PayPal's regulated ledger.
- **Instant Rollback on SLA Breach (`F-06`, `F-07`)**: If a shipment misses its deadline on **Bryntum Scheduler Pro**, the buyer's funds must be unlocked in 0 seconds with zero refund fees.

## Considered Options
1. **Option 1 (Selected): PayPal Orders v2 (`intent: "AUTHORIZE"`) + Shipment Tracking v1 (`create_tracking`) + Conditional `authorizationsCapture` / `authorizationsVoid`**.
2. **Option 2: Immediate `intent: "CAPTURE"` + Post-Facto `capturesRefund`**.
3. **Option 3: Custom Smart-Contract Crypto Escrow (USDC/Base)**.

## Decision Outcome
Chosen option: **Option 1 (PayPal Orders v2 `AUTHORIZE` Two-Phase Commit Escrow)**.

### Technical Mechanism
1. **Phase 1 (Prepare / Ring-Fence — `API-07`)**: `orchestrator-go` calls `POST /v2/checkout/orders` with `"intent": "AUTHORIZE"` and `POST /v2/checkout/orders/{id}/authorize`. PayPal Sandbox places a **29-day authorization hold** (with a 3-day 100% honor period). Funds are verified and reserved, returning `paypal_auth_id` (`2A...`), while remaining in the buyer's account.
2. **Phase 2A (Commit — `API-08`, `API-09`)**: Only when PayPal Shipment Tracking v1 (`/v1/shipping/trackers-batch`) confirms `status: "DELIVERED"` before `SlaTimelineTask.sla_deadline` (`E-07`) does `orchestrator-go` execute `POST /v2/payments/authorizations/{auth_id}/capture`.
3. **Phase 2B (Abort / Rollback — `API-10`)**: If the SLA expires on **Bryntum Scheduler Pro**, or the human drags/cancels the SLA bar, `orchestrator-go` immediately executes `POST /v2/payments/authorizations/{auth_id}/void`, releasing the hold instantaneously.

### Positive Consequences
- Eliminates refund processing fees and chargeback friction on cancelled/breached agent orders.
- Keeps 100% of funds inside PayPal's licensed infrastructure (`R-06`).
