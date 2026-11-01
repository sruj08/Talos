# Deployment & Release Playbook — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Principal Release & Platform Engineering Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [INFRASTRUCTURE](INFRASTRUCTURE.md) · [CICD](CICD.md) · [RUNBOOK](RUNBOOK.md) · [ENVIRONMENT_SETUP](../03-engineering/ENVIRONMENT_SETUP.md)

---

## 1. Deployment Modes Overview

PactPay supports **three deterministic deployment modes** so hackathon judges, developers, and enterprise operators can launch the entire polyglot stack (`Rust 1.85` + `Go 1.24` + `Next.js 15` + `PostgreSQL 16` + `Valkey/Redis`) in under 120 seconds:

| Mode | Command / Mechanism | Target Audience | External API Dependencies | Cold Start Time |
| :--- | :--- | :--- | :--- | :--- |
| **Mode A: 1-Click Cloud Live URL** | Render Native Blueprint (`render.yaml`, `F-14`) | Hackathon Judges (`Tie-Breaker #1 & #5`) | Live PayPal Sandbox + Channel3 + KERNEL + Elastic | `0s` (Pre-warmed 24/7) |
| **Mode B: Local Docker Compose** | `docker compose up --build` | Local Judge Verification & Dev | Live PayPal Sandbox (auto-falls back to Replay Mode `R-01` if offline) | `~90s` |
| **Mode C: Bare-Metal Polyglot Dev** | `cargo run` + `go run` + `npm run dev` | Core Engineering Iteration | Local Postgres/Redis or Dockerized DBs | `~15s` |

---

## 2. Step-by-Step Local Deployment (Docker Compose — MVP)

### 2.1 Prerequisites
- **Docker Engine** `v26.0+` and **Docker Compose** `v2.24+` (`4 GB RAM` allocated).
- **Git** `v2.40+`.
- *(Optional)* PayPal Developer Sandbox credentials (`PAYPAL_SANDBOX_CLIENT_ID`, `PAYPAL_SANDBOX_CLIENT_SECRET`). If omitted, PactPay automatically boots in **Deterministic Recorded Sandbox Replay Mode (`R-01`)** using real captured PayPal Sandbox `Orders v2 AUTHORIZE / CAPTURE / VOID` payloads so judges never hit a credential wall.

### 2.2 Launch Sequence (3 Commands)
```bash
# 1. Clone the repository and copy the pre-configured sandbox environment template
git clone https://github.com/pactpay/pactpay.git
cd pactpay
cp .env.example .env

# 2. Build and start all 5 containers (Rust Firewall, Go Orchestrator, Next.js UI, Postgres 16, Valkey)
docker compose up --build -d

# 3. Verify all service health checks pass
curl -fsSL http://localhost:8081/healthz && echo " -> Rust Firewall OK"
curl -fsSL http://localhost:8080/healthz && echo " -> Go Orchestrator OK"
curl -fsSL http://localhost:3000/api/healthz && echo " -> Next.js Command Center OK"
```

### 2.3 Service Port Map (Local Docker Compose)
| Container Name | Service / Role | Host Port | Health Endpoint |
| :--- | :--- | :--- | :--- |
| `pactpay-console-web` | Next.js 15 UI (`AG Studio` + `Bryntum` + `PayPal JS SDK v6`) | `http://localhost:3000` | `GET /api/healthz` |
| `pactpay-orchestrator-go` | Golang 1.24 Escrow State Machine & WebSocket Hub | `http://localhost:8080` | `GET /healthz` |
| `pactpay-firewall-rs` | Rust 1.85 Zero-Trust KYA & `lol_html` MCP Server (`rmcp`) | `http://localhost:8081` | `GET /healthz` |
| `pactpay-postgres` | PostgreSQL 16 (`E-01`..`E-09` ledgers) | `localhost:5432` | `pg_isready -U pactpay` |
| `pactpay-valkey` | Valkey / Redis 7.2 (`E-10` idempotency locks) | `localhost:6379` | `valkey-cli ping` |

---

## 3. Step-by-Step Cloud Deployment on Render (`render.yaml` — `F-14`)

1. **Connect Repository to Render Blueprint**:
   - Log into the [Render Dashboard](https://dashboard.render.com/blueprints) and click **New Blueprint Instance**.
   - Select the `pactpay` GitHub repository containing `/render.yaml`.
2. **Populate the `pactpay-shared-secrets` Environment Group**:
   - Render prompts for the `sync: false` variables declared in `render.yaml`:
     - `PAYPAL_SANDBOX_CLIENT_ID` & `PAYPAL_SANDBOX_CLIENT_SECRET` (from [developer.paypal.com](https://developer.paypal.com/dashboard/applications/sandbox))
     - `PAYPAL_WEBHOOK_ID` (configured for `CHECKOUT.ORDER.APPROVED` and `PAYMENT.AUTHORIZATION.*`)
     - `CHANNEL3_API_KEY` (from `trychannel3.com`)
     - `KERNEL_API_KEY` (from `onkernel.com`)
     - `ELASTIC_APM_SERVER_URL` & `ELASTIC_APM_SECRET_TOKEN` (from Elastic Cloud)
3. **Provision & Verify**:
   - Click **Apply**. Render provisions `pactpay-postgres` and `pactpay-valkey` first, compiles `pactpay-firewall-rs` (`runtime: rust`) and `pactpay-orchestrator-go` (`runtime: go`), and builds `pactpay-console-web` (`runtime: node`).
   - Once `/healthz` returns `200 OK` across all services, `.github/workflows/deploy-render.yml` runs the **Postman Newman Smoke Suite (`F-13`)** to verify `API-01` through `API-16`.

---

## 4. Database Migration & Seed Data Strategy (`E-01`..`E-09`)

1. **Automated Startup Migrations (`golang-migrate` / Embedded SQL)**:
   - On startup, `pactpay-orchestrator-go` acquires a PostgreSQL advisory lock (`SELECT pg_advisory_lock(9421001)`) so concurrent container replicas never race during schema migration.
   - Executes idempotent `UP` migrations in `services/orchestrator-go/migrations/0001_init_schema.up.sql` creating tables for `principal_users` (`E-01`), `agent_identities` (`E-02`), `kya_mandates` (`E-03`), `firewall_scan_logs` (`E-04`), `channel3_benchmarks` (`E-05`), `escrow_transactions` (`E-06`), `sla_timeline_tasks` (`E-07`), `dispute_evidence_bundles` (`E-08`), and `webhook_event_ledger` (`E-09`).
2. **Deterministic Judge Demo Seed (`0002_seed_demo_state.up.sql`)**:
   - Automatically seeds the 4 target personas (`P-01` Arjun Mehta, `P-02` Maya Lin, `P-03` Vikram Rao, `P-04` Priya Nair), 3 active `Ed25519` mandates, 12 historical escrow transactions for **AG Studio** pivoting, and 6 chained **Bryntum Scheduler Pro** tasks so the dashboard looks rich and populated at second zero.

---

## 5. Runtime Feature Flags & Resilience Switches

All feature flags can be toggled via environment variables or the `X-PactPay-Flags` header without redeploying containers:

| Feature Flag Env Var | Default (`MVP`) | Default (`v1 Prod`) | Purpose & Risk Mitigated |
| :--- | :--- | :--- | :--- |
| `FF_PAYPAL_SANDBOX_REPLAY_FALLBACK` | `true` | `false` | Mitigates **`R-01`**: If `api-m.sandbox.paypal.com` returns `5xx` or times out (`>4,500ms`), transparently serves signed recorded PayPal Sandbox responses with a visible `"SANDBOX REPLAY FALLBACK"` badge in the UI. |
| `FF_RUST_ONNX_CLASSIFIER` | `true` | `true` | Mitigates **`R-04`**: Enables in-memory `DeBERTa-v3` INT8 ONNX (`M-01`) inside `firewall-rs`. If `false`, runs deterministic `lol_html` + `aho-corasick` 140-rule fast path (`0.4ms`). |
| `FF_CHANNEL3_AUTO_REROUTE` | `true` | `true` | Controls **`F-04`**: When a merchant price exceeds the Channel3 fair-market median by `>15%` (`1500 bps`), automatically swaps the checkout cart to the lowest verified Channel3 merchant. |
| `FF_STEP_UP_THRESHOLD_CENTS` | `30000` (`$300`) | `50000` (`$500`) | Controls **`F-09`**: Orders above this value pause autonomous `AUTHORIZE` and require human co-signing via **PayPal JS SDK v6**. |
| `FF_POISONED_STORE_SIMULATOR` | `true` | `false` | Controls **`F-11`**: Enables the 1-click red-team adversarial storefront drawer in the UI for hackathon judges. |

---

## 6. Zero-Downtime Readiness & Health Check Contract (`/healthz`)

Every service exposes a structured JSON `/healthz` endpoint polled by Render every 10 seconds:

```json
{
  "service": "pactpay-orchestrator-go",
  "version": "1.0.0",
  "status": "healthy",
  "checks": {
    "postgres_e01_e09": { "status": "up", "latency_ms": 1.2 },
    "valkey_e10_locks": { "status": "up", "latency_ms": 0.4 },
    "rust_firewall_rpc": { "status": "up", "latency_ms": 0.9, "onnx_m01_loaded": true },
    "paypal_sandbox_oauth": { "status": "up", "mode": "live_sandbox_with_replay_guard" }
  },
  "timestamp_utc": "2026-11-01T14:55:00Z"
}
```
During rolling deploys on Render, new instances must return HTTP `200 OK` on `/healthz` for 3 consecutive probes before Envoy shifts traffic, and old instances receive `SIGTERM` with a `15-second` graceful shutdown window to drain active Go WebSocket (`API-15`) and PayPal Sandbox HTTP requests.
