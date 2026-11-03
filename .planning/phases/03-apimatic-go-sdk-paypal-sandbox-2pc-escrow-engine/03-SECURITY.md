# Phase 03 Security Audit: APIMatic Go SDK & 2PC Escrow State Machine (`03-SECURITY.md`)

**Phase**: `03-apimatic-go-sdk-paypal-sandbox-2pc-escrow-engine`  
**Status**: `VERIFIED` (`threats_open: 0`)  
**Audited Date**: `2026-04-04`

## 1. Threat Mitigation Matrix

| Threat ID | Category | Threat Description | Mitigation Implemented | Verification Evidence | Status |
|-----------|----------|--------------------|------------------------|-----------------------|--------|
| `T-03-01` | Credential Exposure | Leaking `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, or OAuth2 bearer tokens in logs, test output, or git commits | Checked `.env` silently via key-presence & length checks (`credentials` protocol); `client_test.go` never logs raw secrets or tokens | `TestLiveSandboxOAuthAndOrderSmokeIfConfigured` in `sdk/paypal-go-apimatic/client_test.go` | CLOSED |
| `T-03-02` | Double-Spend / Replay | Duplicate network retries causing multiple PayPal authorizations, captures, or voids | Mandatory `PayPal-Request-Id` header enforcement (`ErrMissingRequestID`) in `sdk/paypal-go-apimatic/client.go` + `IdempotencyGate` (`SETNX`) and `idempCache` in `internal/escrow/machine.go` | `TestIdempotent2PCLifecycleAndIllegalTransitions` in `internal/escrow/machine_test.go` | CLOSED |
| `T-03-03` | Cross-Escrow Idempotency Key Hijack | Reusing an existing `PayPal-Request-Id` against a different `escrow_id` to spoof an authorized or captured state | `checkOrLockIdempotency` verifies `cached.Record.EscrowID == escrowID` and passes `escrowID` as `ownerToken` to `AcquireIdempotencyLock`, returning `ErrDuplicateRequestID` (`409 Conflict`) on mismatch | `TestIdempotent2PCLifecycleAndIllegalTransitions` in `internal/escrow/machine_test.go` | CLOSED |
| `T-03-04` | Race Condition (`CAPTURE` vs `VOID`) | Concurrent Oracle webhook and SLA timeout worker attempting to simultaneously capture and void the same escrow hold | Per-escrow pessimistic mutex (`rowMutex(escrowID)`) in `internal/escrow/machine.go` + `SELECT ... FOR UPDATE` in `internal/store/store.go` serializes transitions | `TestConcurrentCaptureVsVoidAndHTTPRoutes` in `internal/escrow/machine_test.go` | CLOSED |
| `T-03-05` | Premature Settlement Bypass | Calling PayPal Orders v2 with `intent: "CAPTURE"` instead of two-phase `intent: "AUTHORIZE"` | `CreateOrder` in `sdk/paypal-go-apimatic/orders_v2.go` strictly enforces `intent == "AUTHORIZE"` (`ErrInvalidIntent`) | `TestValidationAndDeterministicFallback` in `sdk/paypal-go-apimatic/client_test.go` | CLOSED |
| `T-03-06` | Illegal Terminal State Reversal | Attempting `PAYPAL_VOIDED -> PAYPAL_CAPTURED` or `PAYPAL_CAPTURED -> PAYPAL_VOIDED` | `allowedTransitions` in `internal/escrow/machine.go` defines terminal states (`PAYPAL_CAPTURED`, `PAYPAL_VOIDED`, `BLOCKED_*`, `DISPUTE_EVIDENCE_SUBMITTED`) with zero outgoing edges (`409 Conflict`) | `TestStateTransitionGraphAndIllegalTransitions` & `TestConcurrentCaptureVsVoidAndHTTPRoutes` | CLOSED |
