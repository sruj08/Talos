# Financial Governance, Fraud Controls & Treasury Audit — TALOS

## 1. Non-Custodial Regulatory Posture
TALOS is architected from Day 1 as a **Zero-Custody Technical Orchestrator & Security Control Plane**:
- **TALOS Never Touches or Holds Fiat Funds**: All buyer funds are held exclusively inside regulated **PayPal Inc.** accounts (`Orders v2` 29-day authorization hold) or settled directly from Buyer PayPal -> Merchant PayPal upon `CAPTURE`.
- Because TALOS never takes possession of funds, it avoids standalone Money Transmitter License (MTL) custody liabilities in the US and operates cleanly alongside **RBI Payment Aggregator – Cross Border (PA-CB)** licensed settlement flows in India.

---

## 2. Four-Layer Financial Control Matrix

| Control Layer | Technical Enforcement | Code / Schema Owner | Financial Risk Mitigated |
| :--- | :--- | :--- | :--- |
| **1. Pre-Transaction KYA Budget & Velocity Cap** | Ed25519-signed `AgentMandate` (`E-01`) enforces `max_amount_cents` per transaction, daily velocity limit, currency lock (`USD`/`INR`), and MCC whitelist inside Rust (`firewall-rs/src/mandate.rs`) in `<0.4ms`. | `services/firewall-rs/src/mandate.rs` | Prevents rogue agent overspend or unauthorized merchant category spend (`100%` hard block before network call). |
| **2. Strictly Integer Monetary Arithmetic** | Every monetary field across Rust (`i64`), Go (`int64`), PostgreSQL (`BIGINT`), and Next.js (`number` integer cents/paise) is stored in minor currency units (`_cents`). IEEE-754 floats (`f32`/`f64`/`float64`) are banned by CI linter rules (`CODING_STANDARDS.md`). | `0001_init_schema.up.sql` | Eliminates penny-rounding drift across multi-currency authorizations and partial captures. |
| **3. Two-Phase Commit (2PC) Idempotency & Row Locking** | Every PayPal Orders v2 call carries a deterministic UUIDv5 `PayPal-Request-Id` cached in Redis (`E-10`, `SET NX EX 86400`) and transitions state inside PostgreSQL `BEGIN ... SELECT FOR UPDATE ... COMMIT` (`services/orchestrator-go/internal/escrow/machine.go`). | `services/orchestrator-go/internal/escrow/machine.go` | Guarantees **zero double-authorizations** and **zero double-captures** even under network retries or duplicate PayPal webhooks (`R-03`). |
| **4. Dual-Control Human Step-Up (`L3`/`L4` Autonomy)** | Any checkout exceeding the KYA `step_up_threshold_cents` (e.g., `>$200.00` / `>₹16,600`) transitions to `STEP_UP_REQUIRED` and requires a human Treasury Officer (`P-03`) to approve via **PayPal JS SDK v6** (`F-09`). | `web/src/components/PayPalStepUpModal.tsx` | Enforces enterprise segregation of duties between autonomous AI execution and human treasury sign-off. |

---

## 3. Automated Reconciliation & Immutable Hash-Chained Ledger (`E-06`)
Every state transition (`MANDATE_VERIFIED -> DOM_SANITIZED -> CHANNEL3_VERIFIED -> AUTHORIZED -> TRACKING_ADDED -> DELIVERED_VERIFIED -> CAPTURED / VOIDED / DISPUTED`) appends an immutable row to `audit_events` (`E-06`):
```text
curr_hash = SHA-256(prev_hash || escrow_id || event_type || actor || payload_json || created_at_unix_ns)
```
- **Tamper Detection**: Running `POST /api/v1/audit/verify-chain` (`API-14`) recomputes the entire SHA-256 chain from genesis in `<12ms` per 10,000 rows. Any altered byte in PostgreSQL immediately triggers a `CRITICAL` alert in **AG Studio** and **Elastic Cloud**.
- **End-of-Day PayPal Settlement Reconciliation**: A scheduled background worker queries PayPal `Orders v2 GET /v2/checkout/orders/{id}` for all open `AUTHORIZED` escrows approaching Day 25 of PayPal's 29-day honor period, alerting FinOps in the **Bryntum SLA Board (`F-08`)** to either re-authorize or auto-void before expiration.
