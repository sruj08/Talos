# Phase 3 Specification: APIMatic Go SDK & PayPal Sandbox 2PC Escrow Engine

**Phase**: `03` (`03-apimatic-go-sdk-paypal-sandbox-2pc-escrow-engine`)  
**Tasks**: `TASK-05`, `TASK-06`  
**Ambiguity Score**: `0.02` (Passed `< 0.10` threshold)

## 1. Objective
Deliver the strongly-typed APIMatic-generated Go SDK (`sdk/paypal-go-apimatic`) for PayPal Sandbox (`Orders v2`, `Payments v2`, `Tracking v1`, `Disputes v1`) and the deterministic Go Two-Phase Commit (2PC) Escrow State Machine (`services/orchestrator-go/internal/escrow` & `internal/paypal`) that binds KYA mandates to PayPal Sandbox `Orders v2 AUTHORIZE`, `Authorizations CAPTURE`, and `Authorizations VOID` with Redis/Store `PayPal-Request-Id` idempotency locking.

## 2. Gate #1 Credential Verification Record
- Verified silently via non-leaking `.env` key check (`grep -sq` / length inspection):
  - `PAYPAL_CLIENT_ID`: SET (`len=82`)
  - `PAYPAL_CLIENT_SECRET`: SET (`len=80`)
  - `PAYPAL_WEBHOOK_ID`: SET (`len=17`)
  - `APIMATIC_API_KEY`: SET (`len=64`)
- Verified live OAuth2 client-credentials flow against `https://api-m.sandbox.paypal.com/v1/oauth2/token` (`token_type=Bearer`).

## 3. Architecture & Component Contracts

### 3.1 `TASK-05` — APIMatic Go SDK (`sdk/paypal-go-apimatic`)
- **`client.go` (`< 250` lines)**:
  - `Client` struct with `BaseURL` (defaults to `https://api-m.sandbox.paypal.com`), `ClientID`, `ClientSecret`, `HTTPClient`, `FallbackMode`, `MaxRetries`, `RetryBackoff`, and thread-safe OAuth2 bearer token cache (`sync.RWMutex`, `accessToken`, `tokenExpiry`).
  - `GetAccessToken(ctx context.Context) (string, error)`: Exchanges `ClientID:ClientSecret` via `POST /v1/oauth2/token` (`grant_type=client_credentials`), caches token with a 60-second safety margin before expiry, or returns a deterministic sandbox token when `FallbackMode` is active.
  - `doJSON(ctx, method, path, paypalRequestID, reqBody, respOut)`: Injects `Authorization: Bearer <token>`, `PayPal-Request-Id: <uuid>`, `Prefer: return=representation`, and `User-Agent: APIMatic-Talos-PayPal-Go-SDK/1.0`, retrying transient `502`/`503`/`504` status codes with exponential backoff.
- **`orders_v2.go` (`< 250` lines)**:
  - `CreateOrder(ctx, req)`: `POST /v2/checkout/orders` with `intent: "AUTHORIZE"`, `purchase_units` (`custom_id`, `invoice_id`, `description`, `amount`), enforcing non-empty `PayPalRequestID` and `Intent == "AUTHORIZE"`.
  - `AuthorizeOrder(ctx, orderID, paypalRequestID)`: `POST /v2/checkout/orders/{id}/authorize` returning `OrderAuthorizationResponse` (`OrderID`, `AuthorizationID`, `Status`, `RequestID`, `AmountCents`, `CurrencyCode`, `CustomID`, `CreatedAt`, `ExpiresAt`, `FallbackReplay`).
  - `CreateAndAuthorizeOrder(ctx, req)`: Performs `CreateOrder` followed by `AuthorizeOrder` (with deterministic fallback support if Sandbox buyer approval is required or `FallbackMode` is active).
- **`payments_v2.go` (`< 250` lines)**:
  - `CaptureAuthorization(ctx, authorizationID, req)`: `POST /v2/payments/authorizations/{id}/capture` with `PayPal-Request-Id` header and `final_capture`, `note_to_payer`, and optional `amount` payload, returning `CaptureAuthorizationResponse`.
  - `VoidAuthorization(ctx, authorizationID, paypalRequestID)`: `POST /v2/payments/authorizations/{id}/void` with `PayPal-Request-Id` header (`204 No Content` or `200 OK`), returning `VoidAuthorizationResponse` (`AuthorizationID`, `Status: "VOIDED"`, `RequestID`).
- **`tracking_v1.go` (`< 250` lines)**:
  - `CreateTrackingBatch(ctx, paypalRequestID, trackers)`: `POST /v1/shipping/trackers-batch` with `PayPal-Request-Id` header, returning `TrackersBatchResponse`.
- **`disputes_v1.go` (`< 250` lines)**:
  - `ProvideDisputeEvidence(ctx, paypalRequestID, req)`: `POST /v1/customer/disputes/{id}/provide-evidence` with `PayPal-Request-Id` header, returning `ProvideEvidenceResponse`.

### 3.2 `TASK-06` — 2PC Escrow State Machine (`services/orchestrator-go/internal/escrow` & `internal/paypal`)
- **`internal/paypal/service.go` (`< 250` lines)**:
  - `SandboxService` wrapping `paypalapimatic.Client` with `NewSandboxServiceFromEnv()`, `AuthorizeEscrowOrder`, `CaptureEscrowHold`, `VoidEscrowHold`, `AttachTracking`, and `SubmitDisputeEvidence`.
- **`internal/escrow/machine.go` (`< 250` lines)**:
  - Deterministic state graph supporting:
    - `INITIATED -> MANDATE_VERIFIED -> CHANNEL3_BENCHMARKED -> PAYPAL_AUTHORIZED -> SLA_SCHEDULED -> TRACKING_VERIFIED -> PAYPAL_CAPTURED | PAYPAL_VOIDED | DISPUTE_FILED -> DISPUTE_EVIDENCE_SUBMITTED`
    - Guard & terminal states: `BLOCKED_FIREWALL`, `BLOCKED_PRICE_GOUGING`, `STEP_UP_REQUIRED`
    - Fast-path transitions from `INITIATED -> PAYPAL_AUTHORIZED` and `PAYPAL_AUTHORIZED -> PAYPAL_CAPTURED | PAYPAL_VOIDED | DISPUTE_FILED` for store-level atomic transitions.
  - `Engine` coordinating `store.Store` pessimistic locking, `PayPal-Request-Id` idempotency locks (`idemp:{PayPal-Request-Id}`), cached response replay for duplicate `PayPal-Request-Id` calls, and `paypal.SandboxService` side effects.
- **`internal/escrow/handlers.go` (`< 250` lines)**:
  - `API-07`: `POST /api/v1/escrow/{id}/authorize` (plus `POST /api/v1/escrow/authorize` compatibility)
  - `API-09`: `POST /api/v1/escrow/{id}/capture`
  - `API-10`: `POST /api/v1/escrow/{id}/void`
