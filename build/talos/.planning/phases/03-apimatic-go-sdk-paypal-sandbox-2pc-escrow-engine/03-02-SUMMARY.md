---
phase: 03-apimatic-go-sdk-paypal-sandbox-2pc-escrow-engine
plan: 02
subsystem: orchestrator-escrow-2pc
tags:
  - 2pc-escrow
  - paypal-sandbox
  - idempotency
  - state-machine
provides:
  - services/orchestrator-go/internal/escrow
  - services/orchestrator-go/internal/paypal
affects:
  - services/orchestrator-go/cmd/server
tech-stack:
  added:
    - github.com/talos/sdk/paypal-go-apimatic
  patterns:
    - Pessimistic Per-Escrow Row Mutex
    - PayPal-Request-Id Idempotency Gate & Cached Response Replay
    - Deterministic 2PC State Transition Graph
key-files:
  created:
    - services/orchestrator-go/internal/escrow/handlers.go
    - services/orchestrator-go/internal/escrow/http.go
    - services/orchestrator-go/internal/escrow/machine_test.go
    - services/orchestrator-go/internal/paypal/service_test.go
  modified:
    - services/orchestrator-go/go.mod
    - services/orchestrator-go/cmd/server/main.go
    - services/orchestrator-go/internal/escrow/machine.go
    - services/orchestrator-go/internal/paypal/service.go
decisions:
  - Decoupled IdempotencyGate as an implicit Go interface in internal/escrow matching *store.Store.AcquireIdempotencyLock(ctx, paypalRequestID, ownerToken, ttl) to avoid circular imports between internal/store and internal/escrow.
metrics:
  duration_minutes: 8
  completed_date: "2026-04-04"
---

# Phase 03 Plan 02: Two-Phase Commit (2PC) Escrow State Machine Summary

## Accomplishments
- Implemented `Service` in [`service.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/paypal/service.go) (`169` lines) wrapping `paypalapimatic.Client` for `AuthorizeEscrow`, `CaptureEscrow`, `VoidEscrow`, `AttachTracking`, and `SubmitDisputeEvidence`.
- Implemented the deterministic 2PC Escrow State Machine in [`machine.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/escrow/machine.go) (`207` lines) and HTTP handlers in [`escrow_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/escrow_handlers.go) (`218` lines) and [`api.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/api.go) (`221` lines).
- Enforced full state graph transitions (`INITIATED -> BLOCKED_FIREWALL | BLOCKED_PRICE_GOUGING | STEP_UP_REQUIRED | PAYPAL_AUTHORIZED -> TRACKING_VERIFIED -> PAYPAL_CAPTURED | PAYPAL_VOIDED | DISPUTE_EVIDENCE_SUBMITTED`) and strict rejection of illegal transitions (`PAYPAL_VOIDED -> PAYPAL_CAPTURED`, `PAYPAL_CAPTURED -> PAYPAL_VOIDED`).
- Wired `API-07` (`POST /api/v1/escrow/{id}/authorize` & `GET /api/v1/escrow/{id}`), `API-09` (`POST /api/v1/escrow/{id}/capture`), and `API-10` (`POST /api/v1/escrow/{id}/void`) into [`main.go`](file:///g:/PAYPAL/services/orchestrator-go/cmd/server/main.go).
