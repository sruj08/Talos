---
phase: 03
slug: apimatic-go-sdk-paypal-sandbox-2pc-escrow-engine
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-04-04"
---

# Phase 03 — Validation Strategy (`03-VALIDATION.md`)

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Go `testing` + `net/http/httptest` (`go 1.22`) |
| **Config file** | `sdk/paypal-go-apimatic/go.mod`, `services/orchestrator-go/go.mod` |
| **Quick run command** | `cd sdk/paypal-go-apimatic && go test -v ./...` |
| **Full suite command** | `cd services/orchestrator-go && go test -count=1 -v ./...` |
| **Estimated runtime** | ~5.5 seconds (including live PayPal Sandbox smoke test) |

## Sampling Rate
- **After every task commit**: Run `go test -count=1 -v ./...` in both `sdk/paypal-go-apimatic` and `services/orchestrator-go`.
- **Before `/gsd-verify-work`**: Full suite must be green across all Go and Rust packages.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| `03-01-01` | `01` | `1` | `TASK-05` | `T-03-01` | OAuth2 Basic Auth token exchange & RWMutex caching (`POST /v1/oauth2/token`) | Unit + Live Smoke | `cd sdk/paypal-go-apimatic && go test -v -run TestOAuth2TokenCachingAndLifecycleEndpoints` | ✅ `sdk/paypal-go-apimatic/client_test.go` | ✅ green |
| `03-01-02` | `01` | `1` | `TASK-05` | `T-03-02` | Mandatory `PayPal-Request-Id` header enforcement & `AUTHORIZE` intent check | Unit | `cd sdk/paypal-go-apimatic && go test -v -run TestValidationAndDeterministicFallback` | ✅ `sdk/paypal-go-apimatic/client_test.go` | ✅ green |
| `03-01-03` | `01` | `1` | `TASK-05` | `T-03-03` | Live PayPal Sandbox OAuth2 + `CreateOrder` (`intent: AUTHORIZE`) smoke verification | Integration | `cd sdk/paypal-go-apimatic && go test -v -run TestLiveSandboxOAuthAndOrderSmokeIfConfigured` | ✅ `sdk/paypal-go-apimatic/client_test.go` | ✅ green |
| `03-02-01` | `02` | `2` | `TASK-06` | `T-03-04` | Deterministic 2PC state graph & illegal transition rejection (`PAYPAL_VOIDED -> PAYPAL_CAPTURED`) | Unit | `cd services/orchestrator-go && go test -v ./internal/escrow -run TestStateTransitionGraphAndIllegalTransitions` | ✅ `services/orchestrator-go/internal/escrow/machine_test.go` | ✅ green |
| `03-02-02` | `02` | `2` | `TASK-06` | `T-03-05` | Duplicate `PayPal-Request-Id` idempotent replay & cross-escrow key reuse conflict (`409`) | Unit | `cd services/orchestrator-go && go test -v ./internal/escrow -run TestIdempotent2PCLifecycleAndIllegalTransitions` | ✅ `services/orchestrator-go/internal/escrow/machine_test.go` | ✅ green |
| `03-02-03` | `02` | `2` | `TASK-06` | `T-03-06` | Pessimistic per-escrow locking under concurrent `CaptureHold` vs `VoidHold` + HTTP `API-07`/`09`/`10` | Concurrency + HTTP | `cd services/orchestrator-go && go test -v ./internal/escrow -run TestConcurrentCaptureVsVoidAndHTTPRoutes` | ✅ `services/orchestrator-go/internal/escrow/machine_test.go` | ✅ green |

## Validation Audit Trail
- Audited on `2026-04-04`: 6/6 requirements mapped to automated tests; all passing (`0` gaps).
