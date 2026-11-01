# CLAUDE.md — AI Coding Agent Instructions for TALOS
> Single Source of Truth: [`docs/00-overview/PROJECT_BRIEF.md`](docs/00-overview/PROJECT_BRIEF.md)
> Fast Codebase Graph: [`MAP.md`](MAP.md) & [`.planning/graphs/GRAPH_REPORT.md`](.planning/graphs/GRAPH_REPORT.md)
> Phase-Wise Execution & Skill Playbook: [`docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`](docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md)

## 1. Zero-Scan Rule (Consult Graphify First!)
- **NEVER** blindly scan the entire repository to find a file, struct, or API endpoint.
- **ALWAYS** read [`MAP.md`](MAP.md) or [`.planning/graphs/GRAPH_REPORT.md`](.planning/graphs/GRAPH_REPORT.md) (or run `/gsd-graphify query <term>`) first. Every microservice, struct, React component, API endpoint (`API-01`..`API-16`), entity (`E-01`..`E-10`), and sponsor integration guide is indexed there with its exact path.

## 2. Architecture in 10 Lines
1. **`services/firewall-rs/` (Rust 1.85)**: Inline Zero-Trust Security Kernel (`axum` + `rmcp` MCP Server + `ed25519-dalek` KYA Mandate Signer/Verifier + `lol_html` & `DeBERTa-v3` ONNX DOM Prompt-Injection Sanitizer in `<4ms` + PayPal Webhook CRC32/RSA verifier).
2. **`sdk/paypal-go-apimatic/` (Go 1.24)**: Strongly-typed Golang SDK generated via **APIMatic** from PayPal OpenAPI 3.0 specs (`Orders v2`, `Payments Authorizations v2`, `Shipment Tracking v1`, `Customer Disputes v1`).
3. **`services/orchestrator-go/` (Go 1.24)**: High-concurrency 2PC Escrow State Machine (`chi` + `errgroup` + `pgx/v5` + `go-redis/v9`) orchestrating **Channel3** (`trychannel3.com`) price medians, **KERNEL** (`onkernel.com`) browsers, and **PayPal Sandbox** (`AUTHORIZE -> Tracking -> CAPTURE / VOID`), streaming updates via WebSockets (`/ws/events`).
4. **`web/` (Next.js 15 / React 19 / TypeScript)**: Unified Dark-Mode Financial Command Center featuring **AG Grid Enterprise & AG Studio** (`AgStudioBlotter.tsx`), **Bryntum Scheduler Pro / Gantt** (`BryntumSlaBoard.tsx`), **PayPal JS SDK v6** (`PayPalStepUpModal.tsx`), and `@paypal/agent-toolkit` (`route.ts`).
5. **`postman/`**: Publicly runnable Postman MCP & PayPal Sandbox Collection (`Talos-Sandbox-MCP.postman_collection.json`).

## 3. Essential Commands
- **Infrastructure (Postgres 16 + Valkey)**: `docker compose up -d`
- **Rust Firewall (`services/firewall-rs`)**:
  - Dev: `cd services/firewall-rs && cargo run`
  - Test: `cd services/firewall-rs && cargo test`
  - Lint: `cd services/firewall-rs && cargo clippy -- -D warnings`
- **Go Orchestrator (`services/orchestrator-go`)**:
  - Dev: `cd services/orchestrator-go && go run ./cmd/server`
  - Test: `cd services/orchestrator-go && go test -race ./...`
- **Next.js 15 Command Center (`web`)**:
  - Install: `cd web && npm install`
  - Dev: `cd web && npm run dev`
  - Build/Typecheck: `cd web && npx tsc --noEmit && npm run build`
  - Test: `cd web && npm test`

## 4. Safe Credentials & Human Input Gates (`credentials` Skill)
- Never run `cat .env`, `echo $PAYPAL_CLIENT_SECRET`, or ask the user to paste raw API keys into the chat.
- Always verify credentials using `grep -sq "^CREDENTIAL_NAME=" .env` and prompt the user with the hidden `read -s` terminal command from `credentials/SKILL.md`, pointing them to the matching guide in [`docs/09-integrations-and-guides/`](docs/09-integrations-and-guides/00-TRACKS_AND_SUBMISSION_STRATEGY.md).

## 5. Code Conventions & Modular Limits
- Keep every source file under **250 lines** so `/ralph-loop` iterations remain fast and deterministic.
- Never bypass `PayPal-Request-Id` idempotency locks when calling PayPal Sandbox `Orders v2` or `Authorizations Capture/Void`.
- Always preserve the deterministic Sandbox Replay Fallback (`TALOS_SANDBOX_FALLBACK_ENABLED=true`) so judges can test offline or during PayPal Sandbox maintenance windows.
