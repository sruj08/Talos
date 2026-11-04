---
phase: 04-channel3-fair-price-oracle-kernel-tracking-disputes
title: "Phase 4 Specification: Channel3 Fair-Price Oracle, KERNEL Cloud Browser, PayPal Tracking v1, Disputes v1 & WebSocket Event Hub"
status: approved
ambiguity_score: 0.02
tasks:
  - TASK-07
  - TASK-08
requirements:
  - F-04
  - F-06
  - F-07
  - F-08
  - F-11
  - API-05
  - API-06
  - API-08
  - API-11
  - API-12
  - API-13
  - API-14
  - API-15
---

# Phase 4 Specification (`TASK-07` & `TASK-08`)

## 1. Objective
Deliver the **Channel3 Fair-Market Price & SKU Authenticity Oracle** (`F-04`, `API-06`), **KERNEL Disposable Cloud Browser DOM Inspector** (`F-11`), and the unified **Go Orchestrator HTTP/WebSocket API** (`TASK-08`: `API-05` through `API-15`) linking the Rust Zero-Trust Agent Firewall, Channel3 Oracle, KERNEL Browser, and PayPal Sandbox 2PC Escrow Engine (`Orders v2`, `Payments v2`, `Tracking v1`, `Disputes v1`).

## 2. Deliverables & Acceptance Criteria

### 2.1 `TASK-07`: Channel3 Fair-Market Price Oracle & KERNEL Cloud Browser Inspector
1. **Channel3 Price & Authenticity Oracle (`services/orchestrator-go/internal/channel3/oracle.go`)**:
   - Integer basis-point spread computation: `ComputeSpreadBps(listedPriceCents, medianPriceCents int64) int64 = ((listedPriceCents - medianPriceCents) * 10000) / medianPriceCents`.
   - Integer median computation across merchant offers: `ComputeMedianCents(prices []int64) int64` (sorts copy, handles odd/even lengths and filters non-positive values).
   - Queries live Channel3 Universal Product Catalog (`POST https://api.trychannel3.com/v1/products/search` with `x-api-key: $CHANNEL3_API_KEY`) when configured and reachable; automatically falls back to a deterministic 25-SKU verified merchant catalog (`FALLBACK_DATASET`) when offline or rate-limited.
   - Blocks price-gouging checkouts when `spread_bps > max_allowed_spread_bps` (default `1500` bps = `+15.00%`): e.g. `$480.00` (`48000` cents) listing for `Shure SM7B` against `$249.00` (`24900` cents) Channel3 median yields `+9277 bps` (`GougingBlocked: true`, `GougingDetected: true`) and identifies the `$249.00` verified merchant (`https://verified-audio.trychannel3.com/sku/shure-sm7b`) with `savings_cents: 23100`.
2. **KERNEL Cloud Browser Inspector (`services/orchestrator-go/internal/kernel/browser.go`)**:
   - Spins up disposable cloud browser sessions via `POST https://api.onkernel.com/v1/browsers/sessions` (`Authorization: Bearer $KERNEL_API_KEY`) to extract untrusted merchant DOM HTML and capture forensic viewport screenshot URLs before agent evaluation.
   - Provides deterministic local fallback (`FALLBACK_LOCAL_INSPECTOR`) returning realistic poisoned storefront DOM (`display:none` prompt injection for `shadowgear`/`poisoned` URLs) and clean verified merchant DOM (`verified-audio.trychannel3.com`) when offline or in air-gapped test suites.

### 2.2 `TASK-08`: Unified Checkout Fan-Out (`API-05`), PayPal Tracking (`API-08`), Disputes (`API-11`), Blotter/SLA (`API-12`/`API-13`) & WebSocket Hub (`API-15`)
1. **WebSocket Real-Time Event Hub (`services/orchestrator-go/internal/ws/hub.go`)**:
   - Zero-external-dependency RFC 6455 WebSocket upgrade (`GET /ws/events`, `API-15`) + concurrency-safe client registration and non-blocking fan-out broadcast of `ESCROW_STATE_TRANSITION` events containing `ag_grid_row_delta` and `bryntum_task_delta`.
2. **Unified Checkout Pipeline (`POST /api/v1/checkout/evaluate`, `API-05`)**:
   - Executes parallel goroutines (`sync.WaitGroup` fan-out with context deadline) for:
     - Goroutine A: KERNEL DOM inspection + Rust Firewall KYA Ed25519 mandate verification (`API-02`) + DOM prompt-injection sanitization (`API-03`, with in-process deterministic fallback when `firewall-rs` is not running).
     - Goroutine B: Channel3 SKU fair-price benchmark (`API-06`).
   - Returns `422 Unprocessable Entity` (`TALOS_DOM_PROMPT_INJECTION_BLOCKED`) on prompt injection.
   - Returns `422 Unprocessable Entity` (`TALOS_CHANNEL3_PRICE_GOUGING`) on price gouging above `max_spread_bps` unless `auto_reroute: true` is requested, in which case it automatically reroutes to the Channel3 verified merchant URL and price (`24900` cents).
   - Returns `202 Accepted` (`STEP_UP_REQUIRED`) when `amount_cents > max_amount_cents` (`$300.00` threshold).
   - Otherwise calls PayPal `Orders v2 AUTHORIZE` (`PAYPAL_AUTHORIZED`), creates a Bryntum SLA task (`SlaTimelineTask`), broadcasts a WebSocket state transition, and returns `201 Created`.
3. **PayPal Shipment Tracking v1 (`POST /api/v1/escrow/{id}/tracking`, `API-08`)**:
   - Calls `AttachTracking` (`/v1/shipping/trackers-batch`), transitions escrow to `TRACKING_VERIFIED`, and if `status == "DELIVERED"` with `auto_capture_on_delivery: true`, automatically invokes `CaptureHold` (`PAYPAL_CAPTURED`). If `status == "SLA_BREACHED"`, automatically invokes `VoidHold` (`PAYPAL_VOIDED`).
4. **PayPal Disputes v1 Evidence Compiler (`POST /api/v1/escrow/{id}/dispute-evidence`, `API-11`)**:
   - Packages KYA Ed25519 signature, Channel3 benchmark snapshot, and KERNEL screenshot URL, computes SHA-256 bundle digest, calls `SubmitDisputeEvidence` (`/v1/customer/disputes/{id}/provide-evidence`), transitions escrow to `DISPUTE_EVIDENCE_SUBMITTED`, broadcasts WS event, and returns `201 Created`.
5. **Blotter, SLA Timeline & Webhook Routes (`API-12`, `API-13`, `API-14`)**:
   - `GET /api/v1/escrow/blotter`: Returns `EscrowBlotterResponse` with `rows` and KPI aggregates (`total_held_cents`, `total_captured_cents`, `total_voided_cents`, `channel3_savings_cents`, `attacks_blocked_count`).
   - `GET /api/v1/sla/timeline` & `PATCH /api/v1/sla/timeline/{task_id}`: Returns Bryntum Gantt SLA tasks and allows interactive drag-to-breach (`SLA_BREACHED` or `trigger_void: true`), automatically executing `VoidHold` (`PAYPAL_VOIDED`) and broadcasting WS deltas.
   - `POST /api/v1/webhooks/paypal`: Processes `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `CUSTOMER.DISPUTE.CREATED` idempotently.

## 3. Modularity & Non-Functional Invariants
- Every source file in `services/orchestrator-go/` MUST remain strictly `< 250` lines (`CLAUDE.md` §5).
- Zero floating-point currency math (`int64` minor units / cents and `int64` basis points only).
- Zero secret values printed to stdout/stderr or logs.
