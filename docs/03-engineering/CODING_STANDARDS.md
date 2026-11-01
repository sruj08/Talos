# Coding Standards & Quality Gates — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Principal Engineering Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [FRONTEND](FRONTEND.md) · [BACKEND](BACKEND.md) · [GIT_WORKFLOW](GIT_WORKFLOW.md)

---

## 1. Universal Engineering Principles (Ralph Loop & Multi-Agent Compatibility)

1. **Strict Modularity (`<250 Lines` Per File)**:
   - Every source file across `services/firewall-rs/src/`, `services/orchestrator-go/internal/`, and `web/src/` **must remain under 250 lines of code**.
   - Why: Ensures single-responsibility boundaries, zero context-window truncation during autonomous **Ralph Loop** execution, and fast parallel compilation.
2. **Zero Secrets in Source Code**:
   - All credentials (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `CHANNEL3_API_KEY`, `APIMATIC_API_KEY`, `ELASTIC_API_KEY`) are injected exclusively via environment variables validated at startup.
3. **Money in Integer Minor Units (`_cents`)**:
   - Floating-point numbers (`f32`, `f64`, `float64`, JS `number` floats) are **strictly forbidden** for monetary amounts. All monetary columns (`max_amount_cents`, `amount_cents`, `median_price_cents`) use 64-bit signed integers (`i64` in Rust, `int64` in Go, `BIGINT` in PostgreSQL) and convert to `"249.00"` strings only at the PayPal `Orders v2` serialization boundary.

---

## 2. Rust Coding Standards (`services/firewall-rs` — Edition 2024, v1.85.0)

- **Formatting & Linting**:
  - `cargo fmt --all -- --check`
  - `cargo clippy --all-targets --all-features -- -D warnings -D clippy::unwrap_used`
- **Error Handling**:
  - `.unwrap()` and `.expect()` are **banned in request handlers** (allowed only in `LazyLock` static initialization of compile-time constants).
  - Use `thiserror` (`FirewallError` enum) mapped cleanly to `axum::response::IntoResponse` with RFC 9457 Problem Details JSON.
- **Cryptography & Timing**:
  - Use `ed25519_dalek::VerifyingKey::verify_strict` to reject malleable small-order subgroup public keys (`F-01`).

---

## 3. Golang Coding Standards (`services/orchestrator-go` — Go 1.24.0)

- **Formatting & Linting**:
  - `gofmt -s -w .`
  - `golangci-lint run ./...` (enables `errcheck`, `govet`, `staticcheck`, `gosec`, `bodyclose`, `contextcheck`).
- **Context & Concurrency**:
  - Every I/O function takes `ctx context.Context` as its first parameter.
  - Never spawn an untracked `go func()`; always use `errgroup.WithContext(ctx)` or a bounded worker channel with graceful shutdown on `SIGTERM`.
- **Error Wrapping**:
  - Always wrap errors with `fmt.Errorf("paypal authorize escrow %s: %w", escrowID, err)` so root causes are preserved in OpenTelemetry spans.

---

## 4. TypeScript & React 19 Coding Standards (`web/` — Next.js 15.2)

- **Compiler & Linter**:
  - `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitAny": true`.
  - `pnpm lint` (`eslint-config-next` + `@typescript-eslint/recommended`) and `pnpm format:check` (`prettier`).
- **Component Rules**:
  - Default to React Server Components in `src/app/`; add `"use client"` only on interactive leaf components (`AgStudioBlotter.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`, `PoisonedStoreSim.tsx`).
  - Memoize `columnDefs` and `defaultColDef` in **AG Grid** using `useMemo` to prevent unnecessary grid re-initializations.

---

## 5. Structured Logging & PII Redaction Standard (`DPDP Act 2023` & `CERT-In`)

All three services output structured JSON logs with unified correlation keys:
```json
{
  "timestamp": "2026-11-01T15:10:00.142Z",
  "level": "INFO",
  "service": "pactpay-orchestrator-go",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "escrow_id": "e5555555-6666-7777-8888-999999999999",
  "paypal_order_id": "8XY99887766554433",
  "event": "PAYPAL_AUTHORIZATION_CAPTURED",
  "latency_ms": 284
}
```
- **Redaction Rule**: Bearer tokens, `PAYPAL_CLIENT_SECRET`, `ed25519` private keys, and unmasked email addresses are automatically redacted before hitting stdout or Elastic Cloud (`F-12`).
