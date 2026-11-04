# 06 — Render Native Polyglot Blueprint (`render.yaml`) Deployment Guide — TALOS
> Project: TALOS · Sponsor: **Render (`$1,000` 1st / `$750` 2nd / `$500` 3rd Credits — 3 Winners)** · Judge: **Shifra Williams** (Founding Developer Relations Engineer, Render) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [00-TRACKS_AND_SUBMISSION_STRATEGY](00-TRACKS_AND_SUBMISSION_STRATEGY.md) · [INFRASTRUCTURE](../05-ops/INFRASTRUCTURE.md) · [RUNBOOK](../05-ops/RUNBOOK.md)

---

## 1. Strategic Overview: Why TALOS Wins `Best Use of Render`

**Judge**: **Shifra Williams** (Founding Developer Relations Engineer, Render — `https://render.com/`).

Most teams deploy a single static frontend or a single Node container to Render manually through the UI without Infrastructure-as-Code.
**TALOS showcases Render's true multi-language cloud power via a single, 1-click declarative `render.yaml` Blueprint** at the root of our repository that provisions **5 coordinated native resources** over Render's private internal network:
1. **`talos-firewall-rs` (`runtime: rust`, Private Service / Web Service)**: Runs our sub-2ms Rust 1.85 Zero-Trust KYA Mandate & `lol_html` DOM Prompt-Injection Firewall + `rmcp` MCP server.
2. **`talos-orchestrator-go` (`runtime: go`, Web Service)**: Runs our Go 1.24 Two-Phase Commit (2PC) Escrow State Machine, APIMatic Go PayPal Sandbox Gateway, Channel3 Oracle, and WebSocket hub.
3. **`talos-console-web` (`runtime: node`, Web Service)**: Runs our Next.js 15 Command Center hosting **AG Grid Enterprise / AG Studio**, **Bryntum Scheduler Pro**, and **PayPal JS SDK v6**.
4. **`talos-postgres` (Render Managed PostgreSQL 16)**: Stores our 9 relational tables (`principal_users`, `agent_identities`, `kya_mandates`, `firewall_scan_logs`, `channel3_benchmarks`, `escrow_transactions`, `sla_timeline_tasks`, `dispute_evidence_bundles`, `webhook_event_ledger`).
5. **`talos-valkey` (Render Managed Key-Value / Valkey 8)**: Enforces distributed 24-hour `PayPal-Request-Id` idempotency locks (`E-10`) and backs real-time WebSocket pub/sub.

---

## 2. Step-by-Step Human Actions on `render.com` (Phase `P8`)

### Step 2.1 — Create Your Render Account & Claim Hackathon Credits
1. Open your browser and navigate to **[https://render.com/](https://render.com/)**.
2. Click **Get Started for Free** and sign in using your **GitHub** account (this automatically links your GitHub repositories for Blueprint deployment).
3. In the Render Dashboard (`https://dashboard.render.com/`), go to **Billing** in the left sidebar → Scroll to **Promo Code / Credits** → Enter the **PayPal AI Hackathon Render Promo Code** (from the Devpost participant resources tab) to unlock free cloud compute credits for the hackathon.

### Step 2.2 — Deploy All 5 Services in 1 Click via Render Blueprints
1. Ensure your `talos` repository (containing `/render.yaml` at the root) is pushed to GitHub.
2. In the Render Dashboard (`https://dashboard.render.com/`), click **Blueprints** in the left sidebar.
3. Click the blue **New Blueprint Instance** button.
4. Select your **`talos`** GitHub repository from the list and click **Connect**.
5. Render will automatically parse `/render.yaml` and display a preview of all 5 resources (`talos-firewall-rs`, `talos-orchestrator-go`, `talos-console-web`, `talos-postgres`, `talos-valkey`).
6. Enter the **Blueprint Name**: `talos-production-sandbox`.
7. Render will prompt you for the secret environment variables marked with `sync: false` in `render.yaml`. Paste the values from your local `.env` file into the Render secure input boxes:
   - `PAYPAL_CLIENT_ID` *(from Guide `01`)*
   - `PAYPAL_CLIENT_SECRET` *(from Guide `01`)*
   - `PAYPAL_WEBHOOK_ID` *(from Guide `01`)*
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID` *(same as `PAYPAL_CLIENT_ID`)*
   - `CHANNEL3_API_KEY` *(from Guide `05`)*
   - `APIMATIC_API_KEY` *(optional, from Guide `02`)*
   - `ELASTIC_OTLP_ENDPOINT` & `ELASTIC_API_KEY` *(optional, from Guide `07`)*
   - `KERNEL_API_KEY` *(optional, from Guide `09`)*
8. Click **Apply / Create Blueprint Instance**.

---

## 3. Exact `/render.yaml` Blueprint Specification

Below is the exact `render.yaml` file placed at the root of `g:\PAYPAL\render.yaml` (validated against Render's official Blueprint Specification):

```yaml
# ==============================================================================
# TALOS — RENDER NATIVE POLYGLOT BLUEPRINT (render.yaml)
# Targets: Best Use of Render ($1,000 / $750 / $500 Credits) — Judge Shifra Williams
# Deploys Rust 1.85 + Golang 1.24 + Next.js 15 + PostgreSQL 16 + Valkey in 1 click!
# ==============================================================================
services:
  # 1. Rust Zero-Trust KYA & Prompt-Injection Firewall Kernel (runtime: rust)
  - type: web
    name: talos-firewall-rs
    runtime: rust
    rootDir: services/firewall-rs
    plan: starter
    region: oregon
    buildCommand: cargo build --release
    startCommand: ./target/release/talos-firewall-rs
    healthCheckPath: /healthz
    envVars:
      - key: RUST_LOG
        value: info,talos_firewall_rs=debug
      - key: PORT
        value: "8081"
      - key: RUST_FIREWALL_PORT
        value: "8081"
      - key: RUST_ED25519_SEED_HEX
        generateValue: true
      - key: MANDATE_SIGNING_SEED_HEX
        generateValue: true
      - key: ELASTIC_OTLP_ENDPOINT
        sync: false
      - key: ELASTIC_API_KEY
        sync: false

  # 2. Golang 2PC Escrow State Machine & APIMatic PayPal Sandbox Gateway (runtime: go)
  - type: web
    name: talos-orchestrator-go
    runtime: go
    rootDir: services/orchestrator-go
    plan: starter
    region: oregon
    buildCommand: go build -tags netgo -ldflags '-s -w' -o bin/orchestrator ./cmd/server
    startCommand: ./bin/orchestrator
    healthCheckPath: /healthz
    envVars:
      - key: PORT
        value: "8080"
      - key: GO_ORCHESTRATOR_PORT
        value: "8080"
      - key: DATABASE_URL
        fromDatabase:
          name: talos-postgres
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: keyvalue
          name: talos-valkey
          property: connectionString
      - key: RUST_FIREWALL_URL
        fromService:
          type: web
          name: talos-firewall-rs
          envVarKey: RENDER_EXTERNAL_URL
      - key: FIREWALL_RS_INTERNAL_URL
        fromService:
          type: web
          name: talos-firewall-rs
          property: hostport
      - key: PAYPAL_ENVIRONMENT
        value: sandbox
      - key: PAYPAL_ENV
        value: sandbox
      - key: PAYPAL_API_BASE_URL
        value: https://api-m.sandbox.paypal.com
      - key: PAYPAL_CLIENT_ID
        sync: false
      - key: PAYPAL_CLIENT_SECRET
        sync: false
      - key: PAYPAL_WEBHOOK_ID
        sync: false
      - key: CHANNEL3_API_KEY
        sync: false
      - key: KERNEL_API_KEY
        sync: false
      - key: ELASTIC_OTLP_ENDPOINT
        sync: false
      - key: ELASTIC_API_KEY
        sync: false
      - key: ELASTICSEARCH_URL
        sync: false
      - key: TALOS_SANDBOX_FALLBACK_ENABLED
        value: "true"

  # 3. Next.js 15 Command Center UI: AG Studio + Bryntum Scheduler Pro + PayPal JS SDK v6 (runtime: node)
  - type: web
    name: talos-console-web
    runtime: node
    rootDir: web
    plan: starter
    region: oregon
    buildCommand: npm install && npm run build
    startCommand: npm run start
    healthCheckPath: /api/healthz
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3000"
      - key: NEXT_PUBLIC_ORCHESTRATOR_URL
        fromService:
          type: web
          name: talos-orchestrator-go
          envVarKey: RENDER_EXTERNAL_URL
      - key: NEXT_PUBLIC_FIREWALL_URL
        fromService:
          type: web
          name: talos-firewall-rs
          envVarKey: RENDER_EXTERNAL_URL
      - key: NEXT_PUBLIC_PAYPAL_CLIENT_ID
        sync: false
      - key: NEXT_PUBLIC_AG_GRID_LICENSE_KEY
        sync: false
      - key: PAYPAL_CLIENT_ID
        sync: false
      - key: PAYPAL_CLIENT_SECRET
        sync: false
      - key: APIMATIC_API_KEY
        sync: false
      - key: NEXT_PUBLIC_TALOS_SANDBOX_FALLBACK_ENABLED
        value: "true"

  # 4. Managed Valkey / Redis for PayPal-Request-Id Idempotency Locks & WebSocket Pub/Sub
  - type: keyvalue
    name: talos-valkey
    plan: starter
    region: oregon
    maxmemoryPolicy: allkeys-lru
    ipAllowList: []

databases:
  # 5. Managed PostgreSQL 16 for Immutable 2PC Escrow & KYA Mandate Ledger
  - name: talos-postgres
    databaseName: talos
    user: talos
    plan: starter
    region: oregon
    postgresMajorVersion: "16"
```

---

## 4. Post-Deployment Verification & Updating Your PayPal Sandbox Webhook URL

Once all 5 services turn green (`Live`) in the Render Dashboard:
1. Verify each service's health check and webhook verification endpoints via `scripts/verify-deployment.sh` (or `scripts/verify-deployment.ps1`):
   ```bash
   RUST_FIREWALL_URL="https://talos-firewall-rs.onrender.com" \
   GO_ORCHESTRATOR_URL="https://talos-orchestrator-go.onrender.com" \
   WEB_CONSOLE_URL="https://talos-console-web.onrender.com" \
   bash scripts/verify-deployment.sh
   ```
2. Copy your live Go Orchestrator URL (`https://talos-orchestrator-go.onrender.com`) and paste `https://talos-orchestrator-go.onrender.com/api/v1/webhooks/paypal` into your **PayPal Developer Dashboard → Apps & Credentials → Sandbox Webhooks** (Step 2.4 of Guide `01`).
3. Copy your live Next.js Command Center URL (`https://talos-console-web.onrender.com`) and place it at the very top of `README.md` and in the **Devpost "Try It Out" URL** field!

---

## 5. Verification Checklist for Judge Shifra Williams (`Best Use of Render`)

- [x] **1. `render.yaml` Committed at Repo Root**: Uses native `runtime: rust`, `runtime: go`, `runtime: node`, `type: keyvalue`, and `databases:` (`postgresMajorVersion: "16"`) with `fromService` and `fromDatabase` service discovery wiring.
- [x] **2. Zero-Downtime Health Checks (`/healthz` & `/api/healthz`)**: Every service (`talos-firewall-rs`, `talos-orchestrator-go`, `talos-console-web`) exposes `/healthz` and `/api/healthz` returning `200 OK` JSON.
- [x] **3. Deploy to Render Badge in `README.md`**: Includes `[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)` at the top of `README.md`.

