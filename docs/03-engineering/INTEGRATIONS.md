# External Systems & Sponsor Integrations — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Platform Integrations Engineering · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [ARCHITECTURE](ARCHITECTURE.md) · [API_SPEC](API_SPEC.md) · [SPONSOR_INTEGRATION_COOKBOOK](../09-integrations-and-guides/SPONSOR_INTEGRATION_COOKBOOK.md) · [SANDBOX_AND_API_KEYS_SETUP](../09-integrations-and-guides/SANDBOX_AND_API_KEYS_SETUP.md)

---

## 1. Master Integration Matrix (All 10 Hackathon Sponsors & Ecosystem Partners)

> [!TIP]
> For step-by-step human registration, API key retrieval, and dashboard configuration screenshots, see **[SANDBOX_AND_API_KEYS_SETUP.md](../09-integrations-and-guides/SANDBOX_AND_API_KEYS_SETUP.md)** and **[SPONSOR_INTEGRATION_COOKBOOK.md](../09-integrations-and-guides/SPONSOR_INTEGRATION_COOKBOOK.md)**.

| # | External System | Primary Role in PactPay | Auth Mechanism | Timeout / Circuit Breaker | Cost in MVP (`$` / `₹`) | Fallback (`R-01`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **PayPal Sandbox** (`Orders v2`, `Authorizations v2`, `Tracking v1`, `Disputes v1`, `JS SDK v6`, `MCP`) | Reversible 29-day `AUTHORIZE` holds (`F-05`), carrier-linked `CAPTURE` / `VOID` (`F-06`), human step-up (`F-09`), dispute evidence (`F-10`). | OAuth 2.0 Client Credentials (`Basic client_id:secret` → `/v1/oauth2/token`). | `3,500ms` timeout; `gobreaker` trips after 3 consecutive `5xx`. | **`$0.00` (₹0)** — 100% Free Developer Sandbox | Deterministic **Recorded Sandbox Replay Mode** with real captured Sandbox payloads. |
| **2** | **APIMatic** (`Context Plugin`, `Go SDK Codegen`, `DX Portal`) | Generates `sdk/paypal-go-apimatic` from PayPal OpenAPI 3.0 specs + provides zero-hallucination PayPal schema context to agent loop (`F-05`). | `APIMATIC_API_KEY` header / Local generated Go module (`sdk/paypal-go-apimatic`). | Compile-time static Go SDK (`0ms` runtime overhead). | **`$0.00` (₹0)** — Hackathon Sponsor Trial | Local pre-generated `sdk/paypal-go-apimatic` committed in repo + static JSON schema context. |
| **3** | **AG Grid Enterprise & AG Studio** (`v33.1.0`) | Live streaming escrow blotter (`applyTransactionAsync`), Master-Detail forensic DOM diff viewer, and AG Studio AI copilot (`F-08`). | `NEXT_PUBLIC_AG_GRID_LICENSE_KEY` (Sponsor Hackathon Evaluation Token). | Client-side 60fps virtual DOM canvas. | **`$0.00` (₹0)** — Hackathon Trial License | Works with full feature set in evaluation mode + deterministic preset buttons for AG Studio. |
| **4** | **Bryntum Scheduler Pro & Gantt** (`v6.1.4`) | Two-way payment SLA timeline mapping 29-day PayPal holds, carrier countdowns, and drag-to-`VOID` actions (`F-07`). | `@bryntum` npm registry token / Sponsor Trial Bundle. | Client-side reactive store synced via `API-13` & `API-15`. | **`$0.00` (₹0)** — Hackathon Trial License | Local vendored Bryntum Scheduler Pro bundle with full timeline interactivity. |
| **5** | **Channel3 API** (`trychannel3.com`) | Queries 100M+ SKUs to compute fair-market median price & spread bps; blocks merchant price gouging (`>15%`) (`F-04`). | `Authorization: Bearer ${CHANNEL3_API_KEY}` | `800ms` timeout; 15-min Redis read-through cache (`ch3:cache:{sku}`). | **`$0.00` (₹0)** — Hackathon Sponsor Credits | PostgreSQL `channel3_benchmarks` (`E-05`) + pre-seeded 500-SKU catalog. |
| **6** | **Render** (`render.yaml` Blueprint) | Hosts `pactpay-firewall-rs` (Rust), `pactpay-orchestrator-go` (Go), `pactpay-console-web` (Node), Postgres 16, and Valkey (`F-14`). | Render Blueprint GitHub OAuth + Service Environment Groups. | Health check probes (`/healthz` every 10s) + zero-downtime rolling deploy. | **`$0.00` (₹0)** — Covered by Render Free/Sponsor Credits | `docker compose up --build` local execution in `<90s`. |
| **7** | **Elastic Cloud** (`Elasticsearch 8.17` + `OTel APM`) | Ingests distributed OpenTelemetry traces from Rust & Go + indexes blocked prompt-injection vectors via `elser_model_2` (`F-12`). | `ELASTIC_APM_SECRET_TOKEN` & `ELASTIC_API_KEY` over OTLP/gRPC. | Async non-blocking batch span processor (`2,048` queue size). | **`$0.00` (₹0)** — 14-Day Elastic Cloud Trial | Local PostgreSQL `firewall_scan_logs` (`E-04`) + MinHash lexical search. |
| **8** | **Postman** (`v11` + `MCP Client` + `Newman`) | 1-click judge verification of Rust MCP tools, Go endpoints, and PayPal Sandbox lifecycle (`F-13`). | Collection variables (`{{PAYPAL_CLIENT_ID}}`, `{{ORCHESTRATOR_URL}}`). | Newman CLI assertions (`<1,500ms` per request). | **`$0.00` (₹0)** — Free Public Collection | Committed `postman/PactPay-Sandbox-MCP.postman_collection.json`. |
| **9** | **KERNEL** (`onkernel.com`) | Disposable headless cloud browser inspecting untrusted merchant checkout DOMs before piping into Rust `lol_html` (`F-11`). | `Authorization: Bearer ${KERNEL_API_KEY}` | `2,000ms` navigation timeout. | **`$0.00` (₹0)** — Sponsor Sandbox Tier | Built-in **Poisoned Merchant Storefront Simulator** (`PoisonedStoreSim.tsx`) in `web/`. |
| **10** | **Astropods & Zapier** | Outbound webhook dispatchers sending CFO Slack/Email notifications on `STEP_UP_REQUIRED` or `PAYPAL_VOIDED`. | Signed HMAC-SHA256 webhook URL (`ZAPIER_WEBHOOK_URL`). | Async background goroutine with 2 retries. | **`$0.00` (₹0)** — Free Webhook Tier | In-app toast notification & audit log entry. |

---

## 2. Deep Technical Contract: PayPal Sandbox (`F-05`, `F-06`, `F-09`, `F-10`)

### 2.1 Endpoints & Payloads Exchanged
1. **OAuth 2.0 Token Exchange**:
   - `POST https://api-m.sandbox.paypal.com/v1/oauth2/token`
   - Body: `grant_type=client_credentials`
   - Cached in Redis key `paypal:oauth:sandbox_token` for 8 hours (`28,800s`).
2. **Create Order with Reversible Authorization Intent**:
   - `POST https://api-m.sandbox.paypal.com/v2/checkout/orders`
   - Headers: `PayPal-Request-Id: {uuid}`, `Prefer: return=representation`
   - Payload:
     ```json
     {
       "intent": "AUTHORIZE",
       "purchase_units": [
         {
           "reference_id": "escrow_e5555555",
           "description": "Shure SM7B Vocal Dynamic Microphone (KYA Mandate Verified)",
           "custom_id": "mandate_c3333333",
           "amount": {
             "currency_code": "USD",
             "value": "249.00"
           },
           "payee": {
             "email_address": "merchant-pactpay@business.example.com"
           }
         }
       ]
     }
     ```
3. **Authorize Order & Lock 29-Day Hold**:
   - `POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/authorize`
   - Extracts `purchase_units[0].payments.authorizations[0].id` (`paypal_auth_id`) and `expiration_time` (`+29 days`).
4. **Attach Carrier Shipment Tracking (`@paypal/agent-toolkit` `create_tracking`)**:
   - `POST https://api-m.sandbox.paypal.com/v1/shipping/trackers-batch`
   - Payload:
     ```json
     {
       "trackers": [
         {
           "transaction_id": "2A112233445566778",
           "tracking_number": "794892104852",
           "status": "DELIVERED",
           "carrier": "FEDEX"
         }
       ]
     }
     ```
5. **Conditional Settlement (`CAPTURE` vs. `VOID`)**:
   - **On Verified Delivery (`API-09`)**: `POST /v2/payments/authorizations/{auth_id}/capture` (`{"final_capture": true}`).
   - **On Bryntum SLA Breach (`API-10`)**: `POST /v2/payments/authorizations/{auth_id}/void` (Returns `204 No Content`, releasing 100% of locked buyer funds in 0 seconds).
6. **Customer Disputes Auto-Representment (`API-11`)**:
   - `POST https://api-m.sandbox.paypal.com/v1/customer/disputes/{dispute_id}/provide-evidence` (`multipart/form-data` containing signed KYA Mandate + Channel3 SKU snapshot + KERNEL DOM screenshot).

---

## 3. Deep Technical Contract: APIMatic Go SDK & Context Plugin (`F-05`, `ADR-0003`)

- **Why APIMatic Is Essential**: PayPal's official `@paypal/paypal-server-sdk` supports TypeScript, Python, Java, C#, PHP, and Ruby—**not Golang**.
- **Code Generation Pipeline**:
  1. We import PayPal's official OpenAPI 3.0 specifications (`checkout_orders_v2.json`, `payments_payment_v2.json`, `shipping_shipment_tracking_v1.json`, `customer_disputes_v1.json`) into **APIMatic CLI v3.8 (`apimatic-cli`)**.
  2. APIMatic validates the specifications (`0 errors`) and generates `sdk/paypal-go-apimatic` with strongly-typed Go structs (`OrdersController`, `AuthorizationsController`, `TrackersController`, `DisputesController`), built-in OAuth 2.0 token auto-refresh, and exponential backoff retry policies.
  3. On the AI reasoning side (`API-16`), the **APIMatic PayPal Context Plugin** injects deterministic schema definitions into the LLM system prompt so `M-02` never hallucinates PayPal field names (e.g., enforcing `purchase_units[].amount.currency_code` instead of a hallucinated `currency` field).

---

## 4. Deep Technical Contract: Channel3 Fair-Market Price Oracle (`F-04`)

- **Endpoint**: `POST https://api.trychannel3.com/v1/products/search` (and Channel3 MCP tool `channel3_search_products`).
- **Spread Calculation Formula**:
  $$\text{Spread (bps)} = \left\lfloor \frac{\text{Merchant Ask (cents)} - \text{Channel3 Median (cents)}}{\text{Channel3 Median (cents)}} \times 10,000 \right\rfloor$$
- **Enforcement Rule**: If $\text{Spread (bps)} > \text{KyaMandate.max\_spread\_bps}$ (default `1,500 bps` = `+15.0%`), `orchestrator-go` rejects the external merchant checkout with `PACTPAY_CHANNEL3_PRICE_GOUGING` and returns `lowest_merchant_url` from Channel3's verified merchant graph so the agent can seamlessly re-execute checkout at fair market value.

---

## 5. Circuit Breaker & Retry Policy Code (`services/orchestrator-go/internal/paypal/circuit.go`)

```go
package paypal

import (
	"time"
	"github.com/sony/gobreaker/v2"
)

func NewPayPalSandboxBreaker() *gobreaker.CircuitBreaker[[]byte] {
	st := gobreaker.Settings{
		Name:        "PayPalSandboxAPI",
		MaxRequests: 3,
		Interval:    30 * time.Second,
		Timeout:     15 * time.Second,
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			return counts.ConsecutiveFailures >= 3
		},
	}
	return gobreaker.NewCircuitBreaker[[]byte](st)
}
```
