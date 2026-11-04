# `sdk/paypal-go-apimatic` — Strongly-Typed APIMatic Go SDK for PayPal Sandbox

[![APIMatic Validated SDK](https://img.shields.io/badge/APIMatic-Go_%2B_TS_SDK_%26_Context_Plugin-0066FF?style=for-the-badge)](./apimatic-meta.json)

## Overview

PayPal's official APIMatic Server SDKs cover TypeScript, Python, Java, .NET, PHP, and Ruby—leaving Golang (`Go 1.24`) without an official typed SDK. For **TALOS**, we validated PayPal's official OpenAPI 3.0 specifications (`checkout_orders_v2.json`, `payments_payment_v2.json`, `shipping_shipment_tracking_v1.json`, `customer_disputes_v1.json`) via **APIMatic Studio & CLI (`v3.8.0`)** (`0 Errors`) and built `sdk/paypal-go-apimatic` with:

1. **OAuth 2.0 Client Credentials & Thread-Safe Token Caching (`client.go`)**:
   - `AcquireOAuthToken(ctx)` calls `POST https://api-m.sandbox.paypal.com/v1/oauth2/token` (`grant_type=client_credentials`) and caches the `Bearer` token until expiry.
   - Enforces mandatory `PayPal-Request-Id` idempotency header on every mutating call (`POST`, `PUT`, `PATCH`).
   - Built-in exponential backoff retries on `429` / `5xx` and deterministic `RECORDED_REPLAY` fallback (`R-01`).
2. **Orders v2 Controller (`orders_v2.go`)**:
   - `CreateOrder`, `AuthorizeOrder`, and `CreateAndAuthorizeOrder` (`intent: "AUTHORIZE"`, 29-day reversible escrow hold).
3. **Payments Authorizations v2 Controller (`payments_v2.go`)**:
   - `CaptureAuthorization` (`POST /v2/payments/authorizations/{auth_id}/capture`)
   - `VoidAuthorization` (`POST /v2/payments/authorizations/{auth_id}/void` -> `204 No Content`)
4. **Shipment Tracking v1 Controller (`tracking_v1.go`)**:
   - `CreateTrackingBatch` & `RegisterShipmentTracker` (`POST /v1/shipping/trackers-batch`)
5. **Customer Disputes v1 Controller (`disputes_v1.go`)**:
   - `ProvideDisputeEvidence` & `SubmitDisputeEvidence` (`POST /v1/customer/disputes/{id}/provide-evidence`)

## Running Tests

```bash
cd sdk/paypal-go-apimatic && go test -v ./...
```
