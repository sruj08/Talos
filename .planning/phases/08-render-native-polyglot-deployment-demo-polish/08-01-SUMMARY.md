---
phase: 08-render-native-polyglot-deployment-demo-polish
plan: 01
subsystem: render-blueprint-deployment
tags: [render, blueprint, polyglot, rust, go, nextjs, postgres-16, valkey, webhook-crc32]
completed: 2026-11-04
---

# Phase 08 Plan 01 Summary: Render Native Polyglot Blueprint (`render.yaml`) Deployment & Live Webhook Verification

## Accomplishments
1. **Render 5-Resource Native Polyglot Blueprint ([`render.yaml`](file:///g:/PAYPAL/render.yaml))**:
   - Hardened `render.yaml` defining all 5 coordinated Render resources on `plan: starter` (`region: oregon`): `talos-firewall-rs` (`runtime: rust`), `talos-orchestrator-go` (`runtime: go`), `talos-console-web` (`runtime: node`), `talos-valkey` (`type: keyvalue`, `maxmemoryPolicy: allkeys-lru`), and `talos-postgres` (`postgresMajorVersion: "16"`).
   - Configured `healthCheckPath: /healthz` on `talos-firewall-rs` and `talos-orchestrator-go`, and `healthCheckPath: /api/healthz` on `talos-console-web`, plus `fromService` (`RENDER_EXTERNAL_URL` & `connectionString`) and `fromDatabase` (`connectionString`) service discovery bindings.
2. **Polyglot Port, Discovery & Readiness Hardening (`firewall-rs`, `orchestrator-go`, `web`)**:
   - Added `resolve_listen_port()` in [`services/firewall-rs/src/main.rs`](file:///g:/PAYPAL/services/firewall-rs/src/main.rs) and `resolveListenPort()` in [`services/orchestrator-go/cmd/server/main.go`](file:///g:/PAYPAL/services/orchestrator-go/cmd/server/main.go) respecting Render's `PORT` env var with `RUST_FIREWALL_PORT` (`8081`) / `GO_ORCHESTRATOR_PORT` (`8080`) fallbacks and explicit `0.0.0.0` binding.
   - Added `NormalizeServiceURL()` and `ResolveFirewallURL()` in [`services/orchestrator-go/internal/handlers/escrow_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/escrow_handlers.go) supporting both `RUST_FIREWALL_URL` and `FIREWALL_RS_INTERNAL_URL` (`hostport` or full URL).
   - Added [`web/src/app/api/healthz/route.ts`](file:///g:/PAYPAL/web/src/app/api/healthz/route.ts), [`web/src/app/healthz/route.ts`](file:///g:/PAYPAL/web/src/app/healthz/route.ts), and [`web/src/app/api/healthz/route.spec.ts`](file:///g:/PAYPAL/web/src/app/api/healthz/route.spec.ts) so both `/api/healthz` and `/healthz` return `200 OK` JSON on `talos-console-web`.
3. **End-to-End Deployment & PayPal Webhook Verification ([`scripts/verify-deployment.sh`](file:///g:/PAYPAL/scripts/verify-deployment.sh), [`scripts/verify-deployment.ps1`](file:///g:/PAYPAL/scripts/verify-deployment.ps1))**:
   - Verified `render.yaml` schema and all 5 resources, `200 OK` `/healthz` & `/api/healthz` responses across `talos-firewall-rs`, `talos-orchestrator-go`, and `talos-console-web`, and live PayPal Webhook CRC32 + RSA/Ed25519 signature verification (`POST /v1/firewall/webhook/verify` & `POST /api/v1/webhooks/paypal`).
