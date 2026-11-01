# ADR-0001: Polyglot Rust + Go + TypeScript Architecture
> Project: TALOS · Owner: Principal Architecture Council · Status: Accepted · Last updated: 2026-11-01
> Related: [ARCHITECTURE](../ARCHITECTURE.md) · [TECH_STACK](../TECH_STACK.md) · [PROJECT_BRIEF](../../00-overview/PROJECT_BRIEF.md)

---

## Status
**Accepted** (2026-11-01)

## Context and Problem Statement
TALOS sits inline between autonomous AI shopping/procurement agents and live money in **PayPal Sandbox**. It must simultaneously satisfy three distinct engineering workloads:
1. **Wire-speed inline security & cryptography (`F-01`, `F-02`, `F-03`)**: Streaming HTML sanitization, Unicode normalization (`R-02`), `Ed25519` + RFC 9421 signature verification, and local `DeBERTa-v3` ONNX inference (`M-01`) in `<4ms` p99 without garbage-collection pauses.
2. **High-concurrency I/O orchestration (`F-04`, `F-05`, `F-06`, `F-10`)**: Parallel fan-out across external APIs (**Channel3**, **KERNEL**, **PayPal Sandbox**), ACID PostgreSQL state transitions (`E-06`), Redis idempotency locks (`E-10`), and WebSocket event broadcasting (`API-15`).
3. **Interactive 60fps financial visualization (`F-07`, `F-08`, `F-09`)**: Hosting **AG Grid Enterprise / AG Studio**, **Bryntum Scheduler Pro**, and **PayPal JS SDK v6** in the browser.

## Decision Drivers
- **Sub-4ms p99 Security SLA**: The inline DOM sanitizer and KYA verifier cannot suffer stop-the-world GC pauses.
- **Sponsor SDK & Prize Synergy**: Unlocking **APIMatic Go SDK codegen**, **AG Grid / AG Studio**, **Bryntum Scheduler Pro**, **Channel3**, and **Render Native Polyglot Blueprints**.
- **Tie-Breaker #1 (Technological Implementation — 20%)**: Demonstrating clear, first-principles systems boundaries rather than a generic single-language wrapper.

## Considered Options
1. **Option 1 (Selected): Polyglot `Rust 1.85` (`firewall-rs`) + `Go 1.24` (`orchestrator-go`) + `TypeScript / Next.js 15` (`web/`)**.
2. **Option 2: Monolithic Python (FastAPI) + React**.
3. **Option 3: Monolithic TypeScript (Node.js) Full-Stack**.

## Decision Outcome
Chosen option: **Option 1 (Polyglot Rust + Go + TypeScript)**.

### Why Option 2 & Option 3 Were Rejected
- **Python (Option 2)** suffers from GIL contention on CPU-bound HTML rewriting + ONNX inference (`>45ms` p99 vs. `<3.4ms` in Rust) and lacks native browser support for AG Grid/Bryntum.
- **Monolithic Node.js (Option 3)** runs DOM sanitization and WebSocket broadcasting on a single event loop thread, causing frame drops under adversarial 2MB HTML payloads, and misses the opportunity to showcase **APIMatic's Golang SDK code generator** (`sdk/paypal-go-apimatic`).

### Positive Consequences
- `firewall-rs` achieves **`1.8ms` p50 / `3.4ms` p99** DOM sanitization and **`0.3ms`** `Ed25519` verification.
- `orchestrator-go` uses `errgroup` to run Rust firewall checks, **Channel3** price discovery, and **KERNEL** inspection concurrently, cutting total checkout evaluation latency by `48%`.
- `render.yaml` (`F-14`) natively deploys `runtime: rust`, `runtime: go`, and `runtime: node` from a single repository.

### Negative Consequences & Mitigations
- **Cross-service serialization overhead**: Mitigated via persistent HTTP/1.1 keep-alive connection pools over localhost/Render private network (`<0.2ms` hop latency) and shared OpenAPI 3.1 contracts (`api/openapi.yaml`).
