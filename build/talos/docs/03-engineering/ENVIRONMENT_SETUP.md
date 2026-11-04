# Local Environment Setup & Developer Guide — TALOS
> Project: TALOS · Owner: Developer Experience (DX) Team · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [TECH_STACK](TECH_STACK.md) · [01-PAYPAL_SANDBOX_STEP_BY_STEP](../09-integrations-and-guides/01-PAYPAL_SANDBOX_STEP_BY_STEP.md)

---

## 1. Prerequisites Matrix (Windows 11 / macOS / Ubuntu Linux)

| Tool / Runtime | Required Version | Verification Command | Windows Install (`winget`) | macOS / Linux Install |
| :--- | :--- | :--- | :--- | :--- |
| **Docker Desktop** | `>= 27.x` (Compose v2) | `docker compose version` | `winget install Docker.DockerDesktop` | `brew install --cask docker` |
| **Rust Toolchain** | `1.85.0` (Edition 2024) | `rustc --version && cargo --version` | `winget install Rustlang.Rustup` | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| **Golang** | `1.24.0` | `go version` | `winget install GoLang.Go` | `brew install go@1.24` |
| **Node.js & pnpm** | `Node >= 22.12.0`, `pnpm >= 9.15` | `node -v && pnpm -v` | `winget install OpenJS.NodeJS.LTS && corepack enable` | `nvm install 22 && corepack enable` |
| **PostgreSQL Client** | `16.x` (Optional outside Docker) | `psql --version` | `winget install PostgreSQL.PostgreSQL.16` | `brew install libpq` |

---

## 2. Zero-to-Running in 90 Seconds (1-Command Docker Compose Path)

Designed so any hackathon judge can boot the entire 5-container stack (`firewall-rs`, `orchestrator-go`, `web`, `postgres`, `valkey`) with pre-seeded demo data in a single command:

```bash
# 1. Clone the repository
git clone https://github.com/talos/talos.git
cd talos

# 2. Copy the pre-configured Sandbox environment template
cp .env.example .env

# 3. Build and launch all 5 services + run migrations & seed script
docker compose up --build
```

Once running, open:
- **TALOS Command Center UI (`AG Studio` + `Bryntum Scheduler Pro` + `PayPal JS SDK v6`)**: `http://localhost:3000`
- **Go Escrow Orchestrator API & Health**: `http://localhost:8080/healthz`
- **Rust Zero-Trust Firewall & MCP Kernel**: `http://localhost:8081/healthz`

---

## 3. Native Multi-Terminal Development Workflow (Hot-Reload Mode)

When actively developing individual services without rebuilding Docker images:

### Step 1: Start Infrastructure Only (`PostgreSQL 16` + `Redis/Valkey 7.2`)
```bash
docker compose up -d postgres valkey
```

### Step 2: Run Database Migrations & Demo Seed Data
```bash
psql "postgres://talos:talos_dev_secret@localhost:5432/talos?sslmode=disable" \
  -f services/orchestrator-go/migrations/000001_init_talos_schema.up.sql
psql "postgres://talos:talos_dev_secret@localhost:5432/talos?sslmode=disable" \
  -f scripts/seed_demo_data.sql
```

### Step 3: Terminal 1 — Start `services/firewall-rs` (Rust `:8081`)
```bash
cd services/firewall-rs
cargo run --release
# Listening on http://0.0.0.0:8081 (HTTP + MCP SSE)
```

### Step 4: Terminal 2 — Start `services/orchestrator-go` (Go `:8080`)
```bash
cd services/orchestrator-go
go run ./cmd/server/main.go
# Listening on http://0.0.0.0:8080 (REST + WebSocket /ws/events)
```

### Step 5: Terminal 3 — Start `web/` (Next.js 15 `:3000`)
```bash
cd web
pnpm install
pnpm dev
# Ready on http://localhost:3000 (Turbopack enabled)
```

---

## 4. Environment Variables Reference (`.env.example` Summary)

| Variable | Service | Default / Sandbox Fallback | Description |
| :--- | :--- | :--- | :--- |
| `PAYPAL_ENV` | `orchestrator-go`, `web` | `sandbox` | Always `sandbox` (`https://api-m.sandbox.paypal.com`). |
| `PAYPAL_CLIENT_ID` | `orchestrator-go`, `web` | Pre-wired Sandbox App ID | PayPal Developer Sandbox REST App Client ID. |
| `PAYPAL_CLIENT_SECRET` | `orchestrator-go`, `web` | Pre-wired Sandbox Secret | PayPal Developer Sandbox REST App Secret. |
| `PAYPAL_REPLAY_FALLBACK` | `orchestrator-go` | `true` | Enables deterministic Recorded Sandbox Replay if `api-m.sandbox.paypal.com` has transient 5xx (`R-01`). |
| `CHANNEL3_API_KEY` | `orchestrator-go` | Pre-seeded + Live Key | API key for `api.trychannel3.com` (`F-04`). |
| `APIMATIC_API_KEY` | `orchestrator-go`, `web` | Configured | Key for APIMatic Context Plugin & codegen validation (`F-05`). |
| `NEXT_PUBLIC_AG_GRID_LICENSE_KEY` | `web` | Hackathon Trial Key | Unlocks AG Grid Enterprise + AG Studio + Integrated Charts (`F-08`). |
| `KERNEL_API_KEY` | `orchestrator-go` | Optional (Sim built-in) | Connects to `onkernel.com` disposable cloud browsers (`F-11`). |
| `ELASTIC_APM_SERVER_URL` | `firewall-rs`, `orchestrator-go` | Optional | Exports OpenTelemetry spans to Elastic Cloud (`F-12`). |

---

## 5. Common Troubleshooting

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| **Windows `cargo build` linker error `LNK1181` on `ort`** | Missing Visual Studio C++ Build Tools or ONNX dynamic binary download blocked (`R-04`). | Run `cargo run --no-default-features` to use the zero-C++-dependency `lol_html` + `aho-corasick` deterministic fast path (`<0.5ms`). |
| **Port `5432` or `6379` already in use on host** | Local PostgreSQL or Redis service running on Windows/macOS. | Stop host service (`Stop-Service postgresql*`) or override `POSTGRES_HOST_PORT=5433` in `.env`. |
| **PayPal Sandbox `401 invalid_client`** | Trailing whitespace in `PAYPAL_CLIENT_SECRET` inside `.env`. | Strip quotes/spaces in `.env`; if testing offline, set `PAYPAL_REPLAY_FALLBACK=true`. |
