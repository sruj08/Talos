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
- Implemented `SandboxService` in [`service.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/paypal/service.go) (`198` lines) wrapping `paypalapimatic.Client` for `AuthorizeEscrowHold`, `CaptureEscrowHold`, `VoidEscrowHold`, `AttachTracking`, and `SubmitDisputeEvidence`.
- Implemented the deterministic 2PC Escrow State Machine in [`machine.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/escrow/machine.go) (`226` lines), [`handlers.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/escrow/handlers.go) (`222` lines), and [`http.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/escrow/http.go) (`81` lines).
- Enforced full state graph transitions (`INITIATED -> MANDATE_VERIFIED -> CHANNEL3_BENCHMARKED -> PAYPAL_AUTHORIZED -> SLA_SCHEDULED -> TRACKING_VERIFIED -> PAYPAL_CAPTURED | PAYPAL_VOIDED | DISPUTE_FILED -> DISPUTE_EVIDENCE_SUBMITTED`) and strict rejection of illegal transitions (`PAYPAL_VOIDED -> PAYPAL_CAPTURED`, `PAYPAL_CAPTURED -> PAYPAL_VOIDED`).
- Wired `API-07` (`POST /api/v1/escrow/{id}/authorize`), `API-08` (`GET /api/v1/escrow/{id}`), `API-09` (`POST /api/v1/escrow/{id}/capture`), and `API-10` (`POST /api/v1/escrow/{id}/void`) into [`main.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/cmd/server/main.go).
