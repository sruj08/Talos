---
status: complete
phase: 07-elastic-opentelemetry-apm-postman-collection-e2e-tests
source:
  - 07-01-SUMMARY.md
  - 07-02-SUMMARY.md
started: 2026-11-04T12:15:00Z
updated: 2026-11-04T12:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Elastic Cloud OpenTelemetry APM & Vector Threat Index (`TASK-13`)
expected: `orchestrator-go` and `firewall-rs` propagate W3C `traceparent` headers, redact buyer PII (`RedactEmail`, `RedactBearer`), record required attributes (`talos.mandate.id`, `talos.firewall.risk_score`, `talos.channel3.spread_bps`, `paypal.order_id`, `paypal.auth_id`), and index semantic threat embeddings into Elastic Cloud (`talos-dom-threats-v1`) with `<20ms` kNN search.
result: pass

### 2. 1-Click Judge Postman Collection & Environment (`TASK-13`)
expected: `postman/Talos-Sandbox-MCP.postman_collection.json` and `postman/Talos-Sandbox.postman_environment.json` cover `API-01`..`API-16` across Rust Firewall, Go Orchestrator, Channel3 Oracle, PayPal Sandbox Orders/Authorizations/Tracking/Disputes, and MCP Bridge with `pm.test()` assertions.
result: pass

### 3. Red-Team Indirect Prompt-Injection Suite (`TASK-14`)
expected: `cargo test --test redteam_suite` evaluates `tests/redteam/prompt_injection_suite.json` (`RT-01`..`RT-08` + `BN-01`..`BN-04`) with 100% adversarial recall (`8/8`), 0% false positive rate (`0/4`), and `<4ms` latency.
result: pass

### 4. Full-Stack 3-Act Playwright E2E Suite & Visual Screenshots (`TASK-14`)
expected: `npx playwright test` executes Act 1 (Poisoned DOM & +92% Gouging Blocked), Act 2 ($249 Channel3 Fair Purchase -> PayPal AUTHORIZE -> DELIVERED -> CAPTURE), Act 3 (Bryntum SLA Breach -> PayPal VOID + $450 Step-Up Co-Sign), and Act 4 (AG Studio Copilot) and saves screenshots to `.agent/screenshots/`.
result: pass

### 5. Cross-Stack Code Review & Line-Count Audit (`TASK-14`)
expected: All Rust, Go, and TypeScript/React source and test files are `<250` lines, pass `cargo clippy -D warnings`, `go vet`, `tsc --noEmit`, and `vitest run` (`22/22` unit tests), with zero secret leaks.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
