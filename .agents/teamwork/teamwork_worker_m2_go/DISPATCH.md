# Dispatch — Milestone 2 Worker (`teamwork_worker_m2_go`)

## Identity & Paths
- **Role**: Go SDK & Orchestrator Worker (`teamwork_worker`)
- **Working Directory**: `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go`
- **Parent Conversation ID**: `52b79b48-56f1-40fb-81a2-c616ff2ea33f`
- **Original Request File**: `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Project Scope Document**: `g:\PAYPAL\PROJECT.md`

## Mandatory Integrity Warning
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A teamwork_auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

## Exclusive Write Ownership
- You own ONLY `g:\PAYPAL\sdk\paypal-go-apimatic\**` and `g:\PAYPAL\services\orchestrator-go\**` (plus your metadata directory `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go\**`).
- Do NOT modify any files outside `g:\PAYPAL\sdk\paypal-go-apimatic\` and `g:\PAYPAL\services\orchestrator-go\`.
- NEVER run `git commit` (`git rev-parse HEAD` must remain unchanged).
- **Zero Secret Leaks**: Follow `C:\Users\satav\.gemini\config\plugins\science\skills\credentials\SKILL.md`. NEVER print, echo, or log any secret values or raw OAuth tokens from `.env` in terminal output, test logs, or files.
- Keep every `.go` file strictly under **250 lines** (`CLAUDE.md` §5). Split handlers or helpers into clean files within the package if needed to stay under 250 lines.

## Required Reading Before Coding
1. `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `g:\PAYPAL\PROJECT.md`
3. `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1\handoff.md`
4. `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`
5. `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_3\handoff.md`
6. `g:\PAYPAL\docs\08-project\PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md` (Phases 1, 3, and 4)
7. `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\01-PAYPAL_SANDBOX_STEP_BY_STEP.md`
8. `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\02-APIMATIC_INTEGRATION_GUIDE.md`
9. `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\05-CHANNEL3_INTEGRATION_GUIDE.md`
10. `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\09-KERNEL_ASTROPODS_ZAPIER_GUIDE.md`
11. `g:\PAYPAL\api\openapi.yaml` (`API-05`..`API-15`)
12. `C:\Users\satav\.gemini\config\plugins\science\skills\credentials\SKILL.md` & `C:\Users\satav\.gemini\config\skills\postgres\SKILL.md`

## Objectives (`TASK-02` verify + `TASK-05`, `TASK-06`, `TASK-07`, `TASK-08`)

### 1. `TASK-05` — APIMatic Go SDK (`g:\PAYPAL\sdk\paypal-go-apimatic\`)
- Implement `client.go`, `orders_v2.go`, `payments_v2.go`, `tracking_v1.go`, `disputes_v1.go` (all `< 250 lines`):
  - **OAuth2 Token Acquisition & Caching (`client.go`)**:
    - Load `PAYPAL_API_BASE_URL` (default `https://api-m.sandbox.paypal.com`), `PAYPAL_CLIENT_ID`, and `PAYPAL_CLIENT_SECRET` from environment (or `.env` file loader helper that parses `.env` in memory without printing secrets).
    - Implement `AcquireOAuthToken(ctx context.Context) (*OAuthToken, error)` calling `POST {BaseURL}/v1/oauth2/token` (`grant_type=client_credentials` with HTTP Basic Auth), caching the token thread-safely until expiry, and falling back to deterministic `RECORDED_REPLAY` mode if credentials are missing/placeholder or network times out (`>4500ms`).
    - Enforce mandatory `PayPal-Request-Id` idempotency header injection on all mutating requests (`DoRequest` helper) + exponential backoff retry on transient `429`/`5xx`.
  - **Orders v2 (`orders_v2.go`)**: `CreateOrder` (`POST /v2/checkout/orders` with `intent: "AUTHORIZE"`) and `AuthorizeOrder` (`POST /v2/checkout/orders/{id}/authorize`), plus combined `CreateAndAuthorizeOrder` convenience method with live Sandbox + deterministic fallback.
  - **Payments v2 (`payments_v2.go`)**: `CaptureAuthorization` (`POST /v2/payments/authorizations/{auth_id}/capture`) and `VoidAuthorization` (`POST /v2/payments/authorizations/{auth_id}/void` returning `204 No Content` / `VOIDED`).
  - **Shipment Tracking v1 (`tracking_v1.go`)**: `CreateTrackingBatch` / `RegisterShipmentTracker` (`POST /v1/shipping/trackers-batch`).
  - **Customer Disputes v1 (`disputes_v1.go`)**: `ProvideDisputeEvidence` / `SubmitDisputeEvidence` (`POST /v1/customer/disputes/{id}/provide-evidence`).
  - **APIMatic Metadata Files (`02-APIMATIC_INTEGRATION_GUIDE.md`)**: Create `apimatic-context-manifest.json`, `apimatic-meta.json`, and `README.md` inside `sdk/paypal-go-apimatic/`.
  - **Unit & Live Sandbox OAuth2 Tests (`client_test.go`)**: Test OAuth2 token acquisition (including a live test reading `.env` and verifying live `https://api-m.sandbox.paypal.com/v1/oauth2/token` returns a valid `Bearer` token with `ExpiresIn > 0` without printing any secret/token), `PayPal-Request-Id` header injection, retry logic, and all 4 controller surfaces (`Orders v2`, `Payments v2`, `Tracking v1`, `Disputes v1`).

### 2. `TASK-06` — Go 2PC Escrow State Machine (`services/orchestrator-go/internal/escrow/` & `internal/paypal/`)
- **`internal/escrow/machine.go` (`< 250 lines`)**:
  - Support all states from `TASK-06` and `api/openapi.yaml`: `INITIATED`, `MANDATE_VERIFIED`, `CHANNEL3_BENCHMARKED`, `PAYPAL_AUTHORIZED`, `SLA_SCHEDULED`, `TRACKING_VERIFIED`, `PAYPAL_CAPTURED`, `PAYPAL_VOIDED`, `DISPUTE_FILED`, `DISPUTE_EVIDENCE_SUBMITTED`, `BLOCKED_FIREWALL`, `BLOCKED_PRICE_GOUGING`, `STEP_UP_REQUIRED`.
  - Implement concurrency-safe (`sync.RWMutex`) state machine manager (`Engine` / `Machine`) tracking transactions, enforcing `CanTransition(from, to)`, strictly rejecting illegal transitions (`PAYPAL_VOIDED -> PAYPAL_CAPTURED`, `PAYPAL_CAPTURED -> PAYPAL_VOIDED`), and caching idempotent responses keyed by `PayPal-Request-Id` (alongside `store.AcquireIdempotencyLock`).
- **`internal/paypal/service.go` (`< 250 lines`)**:
  - Wire `github.com/talos/sdk/paypal-go-apimatic` in `services/orchestrator-go/go.mod` (`replace github.com/talos/sdk/paypal-go-apimatic => ../../sdk/paypal-go-apimatic`).
  - Implement `SandboxService` wrapping the APIMatic SDK for `AuthorizeEscrow`, `CaptureEscrow`, `VoidEscrow`, `RegisterTracking`, and `SubmitDisputeEvidence` with `PayPal-Request-Id` idempotency and dual-mode (`LIVE` / `RECORDED_REPLAY`) tracking.
- **Tests (`internal/escrow/machine_test.go` & `internal/paypal/service_test.go`)**:
  - Test full happy path, void rollback path, dispute path, illegal transition rejection (`VOIDED -> CAPTURED`), idempotent duplicate `PayPal-Request-Id` capture/void requests, and concurrent goroutines under `go test -race`.

### 3. `TASK-07` — Channel3 Fair-Price Oracle & KERNEL Cloud Browser (`services/orchestrator-go/internal/channel3/` & `internal/kernel/`)
- **`internal/channel3/oracle.go` (`< 250 lines`)**:
  - Implement `ComputeSpreadBps(listedCents, medianCents int64) int64`: `((listedCents - medianCents) * 10000) / medianCents`.
  - Implement `OracleClient` (`NewOracleClientFromEnv()`) and `BenchmarkSKU(ctx, req)`:
    - When `CHANNEL3_API_KEY` is set (and not `your_...`), query live `POST https://api.trychannel3.com/v1/search` with header `x-api-key: $CHANNEL3_API_KEY` (`2500ms` timeout). Note: use `/v1/search` + `x-api-key` header (verified `HTTP 200 OK` in live survey!).
    - Combine live metadata with the pre-indexed verified SKU benchmark catalog so `"Shure SM7B"` has `MedianPriceCents: 24900` (`$249.00`), `LowestVerifiedPriceCents: 24900` (`$249.00`), `LowestMerchantName: "AudioPro Verified (Channel3 Preferred)"`, `LowestMerchantURL: "https://verified-audio.trychannel3.com/sku/shure-sm7b"`.
    - When a `$480.00` (`48000` cents) Shure SM7B listing is evaluated against the `$249.00` (`24900` cents) median, it computes `SpreadBps = 9277` (`+92.77%`), flags `GougingBlocked: true` (`PriceGougingDetected: true`) when `SpreadBps > MaxAllowedSpreadBps` (default `1500` bps), and returns the `$249.00` verified merchant for auto-rerouting.
- **`internal/kernel/browser.go` (`< 250 lines`)**:
  - Implement `InspectorClient` (`NewInspectorFromEnv()`) and `InspectMerchantDOM(ctx, merchantURL, rawHTMLOverride string)`:
    - When `KERNEL_API_KEY` is set, connect to `https://api.onkernel.com/browsers` (`Authorization: Bearer $KERNEL_API_KEY` / `x-api-key: $KERNEL_API_KEY`) with `2500ms` timeout, and fall back to deterministic local Poisoned/Verified Storefront DOM + screenshot URL so offline/simulated tests work seamlessly.
- **Tests (`internal/channel3/oracle_test.go` & `internal/kernel/browser_test.go`)**:
  - Test `$480` vs `$249` (`+9277 bps`) gouging block & reroute, fair-price pass, concurrent `errgroup` execution, and live `.env` Channel3 & KERNEL probe tests (without printing secrets) under `go test -race`.

### 4. `TASK-08` — Unified Checkout, Tracking, Disputes, Blotter, SLA Timeline & WS Hub (`internal/ws/`, `internal/handlers/`, `cmd/server/`)
- **`internal/ws/hub.go` (`< 250 lines`)**:
  - Implement thread-safe WebSocket/event hub supporting `Broadcast(EventMessage)`, subscriber registration, recent event ring buffer, and HTTP handler for `GET /ws/events` (and alias `GET /ws/escrow-stream`).
- **`internal/handlers/api.go` (and `internal/handlers/escrow_handlers.go` if needed so each file is `< 250 lines`)**:
  - Implement all REST endpoints `API-05` through `API-15` matching `api/openapi.yaml`:
    - `POST /api/v1/checkout/evaluate` (and alias `POST /api/v1/escrow/checkout`) (`API-05`): Uses `golang.org/x/sync/errgroup` to run Rust Firewall KYA mandate + DOM sanitization check (`RUST_FIREWALL_URL` with deterministic in-process fallback when Rust server is offline) and Channel3 Oracle price benchmark in parallel before calling PayPal `Orders v2 AUTHORIZE`. Returns `422` (`ProblemDetails`) when blocked by DOM prompt injection or price gouging (when auto-reroute is disabled), `202` when `STEP_UP_REQUIRED` (`amount_cents > max_amount_cents`), or `201` (`PAYPAL_AUTHORIZED`) when authorized.
    - `POST /api/v1/channel3/benchmark` (`API-06`)
    - `POST /api/v1/escrow/{id}/authorize` (`API-07`) & `POST /api/v1/escrow/{id}/step-up-approve`
    - `POST /api/v1/escrow/{id}/tracking` (`API-08` — calls PayPal Tracking v1 `/v1/shipping/trackers-batch`, updates SLA task, and auto-captures via PayPal `CAPTURE` when `DELIVERED` within SLA)
    - `POST /api/v1/escrow/{id}/capture` (`API-09` — idempotent via `PayPal-Request-Id`)
    - `POST /api/v1/escrow/{id}/void` (`API-10` — idempotent `0s` rollback via `PayPal-Request-Id`)
    - `POST /api/v1/escrow/{id}/dispute-evidence` (`API-11` — packages KYA mandate + Channel3 benchmark + KERNEL screenshot -> PayPal Disputes v1)
    - `GET /api/v1/escrow/blotter` (`API-12`)
    - `GET /api/v1/sla/timeline` & `PATCH /api/v1/sla/timeline/{task_id}` (`API-13` — triggers PayPal `VOID` when `tracking_status == "SLA_BREACHED"` or `trigger_void == true`)
    - `POST /api/v1/webhooks/paypal` (`API-14`)
    - `GET /ws/events` & `/healthz` (`API-15`)
- **`cmd/server/main.go` (`< 250 lines`)**:
  - Mount Chi router (`github.com/go-chi/chi/v5`) with CORS, `/healthz`, and all `API-05`..`API-15` handlers.
- **Tests (`internal/ws/hub_test.go`, `internal/handlers/api_test.go`)**:
  - Verify all endpoints `API-05`..`API-15` and pass:
    - `cd g:\PAYPAL\sdk\paypal-go-apimatic && go test -v ./...`
    - `cd g:\PAYPAL\services\orchestrator-go && go test -race -v ./...`

5. Write your handoff report to `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go\handoff.md` and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.


## 2026-11-04T09:27:58Z
You are `teamwork_worker_m2_go` (TypeName: `teamwork_worker`).
Your working directory is `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go`.
Your parent conversation ID is `52b79b48-56f1-40fb-81a2-c616ff2ea33f`.

First, read `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`, `g:\PAYPAL\PROJECT.md`, `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go\DISPATCH.md`, and the skills `C:\Users\satav\.gemini\config\plugins\science\skills\credentials\SKILL.md` and `C:\Users\satav\.gemini\config\skills\postgres\SKILL.md`.
Create and maintain `BRIEFING.md` and `progress.md` in `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go`.

Exclusive Write Ownership:
- You own ONLY `g:\PAYPAL\sdk\paypal-go-apimatic\**` and `g:\PAYPAL\services\orchestrator-go\**` (plus your metadata folder `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go\**`).
- Do NOT modify any files outside `g:\PAYPAL\sdk\paypal-go-apimatic\` and `g:\PAYPAL\services\orchestrator-go\`.
- NEVER run `git commit` (`git rev-parse HEAD` must remain unchanged).
- NEVER print, log, or leak any secret values or tokens from `.env`.
- Keep every `.go` file strictly under 250 lines.

Complete all tasks in your `DISPATCH.md` (`TASK-02` verify + `TASK-05`, `TASK-06`, `TASK-07`, `TASK-08` implementation and unit/live `.env` tests), verify `go test -v ./...` in `sdk/paypal-go-apimatic` and `go test -race -v ./...` in `services/orchestrator-go` pass 100%, write `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go\handoff.md`, and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.


## 2026-11-04T09:58:21Z
**Context**: Line-count check for `services/orchestrator-go/internal/handlers/api.go`.
**Content**: Notice that `services/orchestrator-go/internal/handlers/api.go` is currently ~306 total lines. To strictly satisfy the `< 250 lines` per file rule in `CLAUDE.md` §5, please split `internal/handlers/api.go` into two files (e.g., `api.go` and `escrow_routes.go`) so every `.go` file in `services/orchestrator-go/` and `sdk/paypal-go-apimatic/` is `< 250` total lines before delivering `handoff.md`.
**Action**: Split `internal/handlers/api.go` so all `.go` files are `< 250` total lines, re-verify `go test -race -v ./...`, and deliver `handoff.md`.
