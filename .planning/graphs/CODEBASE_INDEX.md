# O(1) Codebase & Symbol Index — TALOS

> **Purpose for AI Agents**: Read this file FIRST whenever a prompt mentions a feature, struct, React component, SQL table, API endpoint, or sponsor integration. Jump directly to the exact file path below in `O(1)` without scanning directories.

---

## 1. Symbol-to-File Lookup Table (Rust, Go, TypeScript, SQL)

| Symbol / Struct / Component | Language | Exact File Path | Feature / Entity / API ID |
| :--- | :---: | :--- | :--- |
| `AgentMandate`, `SignedMandate`, `verify_ed25519_mandate()` | Rust 1.85 | [`services/firewall-rs/src/mandate.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mandate.rs) | `F-01`, `E-01`, `API-01`, `API-02` |
| `SanitizeRequest`, `SanitizeResponse`, `sanitize_dom_html()` | Rust 1.85 | [`services/firewall-rs/src/sanitizer.rs`](file:///g:/PAYPAL/services/firewall-rs/src/sanitizer.rs) | `F-02`, `M-01`, `E-03`, `API-03` |
| `VerifyWebhookRequest`, `verify_paypal_webhook()` | Rust 1.85 | [`services/firewall-rs/src/webhook_verify.rs`](file:///g:/PAYPAL/services/firewall-rs/src/webhook_verify.rs) | `F-04`, `API-04` |
| `McpRpcRequest`, `McpRpcResponse`, `handle_mcp_rpc()` | Rust 1.85 | [`services/firewall-rs/src/mcp_server.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mcp_server.rs) | `F-03`, `API-05` |
| `PayPalApimaticClient`, `NewClient()` | Go 1.24 | [`sdk/paypal-go-apimatic/client.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/client.go) | `F-10` |
| `AuthorizeOrderInput`, `AuthorizeOrderOutput`, `CreateAuthorizedOrder()` | Go 1.24 | [`sdk/paypal-go-apimatic/orders_v2.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/orders_v2.go) | `F-04`, `F-10`, `API-06` |
| `CaptureAuthorization()`, `VoidAuthorization()` | Go 1.24 | [`sdk/paypal-go-apimatic/payments_v2.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/payments_v2.go) | `F-04`, `F-10`, `API-08`, `API-09` |
| `RegisterShipmentTracker()` | Go 1.24 | [`sdk/paypal-go-apimatic/tracking_v1.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/tracking_v1.go) | `F-04`, `E-05`, `API-11` |
| `SubmitDisputeEvidence()` | Go 1.24 | [`sdk/paypal-go-apimatic/disputes_v1.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/disputes_v1.go) | `F-05`, `E-07`, `API-12` |
| `EscrowState`, `StateMachine`, `CanTransition()` | Go 1.24 | [`services/orchestrator-go/internal/escrow/machine.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/escrow/machine.go) | `F-04`, `E-02` |
| `VerifyResult`, `Oracle`, `VerifyMerchantAndSKU()` | Go 1.24 | [`services/orchestrator-go/internal/channel3/oracle.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/channel3/oracle.go) | `F-11`, `E-04`, `API-13` |
| `BrowserClient`, `FetchRawMerchantDOM()` | Go 1.24 | [`services/orchestrator-go/internal/kernel/browser.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/kernel/browser.go) | `F-02`, `F-06` |
| `InitElasticOTel()` | Go 1.24 | [`services/orchestrator-go/internal/telemetry/elastic_otel.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/telemetry/elastic_otel.go) | `F-13`, `M-04` |
| `Hub`, `BroadcastJSON()` | Go 1.24 | [`services/orchestrator-go/internal/ws/hub.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/ws/hub.go) | `F-07`, `F-08`, `API-15` |
| `Server`, `HandleEvaluateCheckout()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/api.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/api.go) | `API-05` |
| `HandleAuthorizeEscrow()`, `HandleCaptureEscrow()`, `HandleVoidEscrow()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/escrow_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/escrow_handlers.go) | `API-07`, `API-09`, `API-10` |
| `HandleChannel3Benchmark()`, `HandleAttachTracking()`, `HandleSubmitDisputeEvidence()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go) | `API-06`, `API-08`, `API-11` |
| `HandleGetBlotter()`, `HandleGetSlaTimeline()`, `HandlePayPalWebhook()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/sla_webhook_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/sla_webhook_handlers.go) | `API-12`, `API-13`, `API-14` |
| `agent_mandates`, `escrow_transactions`, `audit_events`, `compute_audit_event_hash()` | SQL (PG 16) | [`services/orchestrator-go/migrations/0001_init_schema.up.sql`](file:///g:/PAYPAL/services/orchestrator-go/migrations/0001_init_schema.up.sql) | `E-01`..`E-09`, `F-14` |
| `MandateStudio` | TypeScript / React 19 | [`web/src/components/MandateStudio.tsx`](file:///g:/PAYPAL/web/src/components/MandateStudio.tsx) | `F-01`, `P-01` |
| `PoisonedStoreSim` | TypeScript / React 19 | [`web/src/components/PoisonedStoreSim.tsx`](file:///g:/PAYPAL/web/src/components/PoisonedStoreSim.tsx) | `F-02`, `F-06`, `P-02` |
| `AgStudioBlotter` | TypeScript / React 19 | [`web/src/components/AgStudioBlotter.tsx`](file:///g:/PAYPAL/web/src/components/AgStudioBlotter.tsx) | `F-07`, `M-03`, `P-03` |
| `useAgStudioBlotter()`, `runAgStudioCopilotQuery()` | TypeScript / React 19 | [`web/src/hooks/useAgStudioBlotter.ts`](file:///g:/PAYPAL/web/src/hooks/useAgStudioBlotter.ts) | `F-07`, `F-08`, `M-03` |
| `ForensicDetailPanel` | TypeScript / React 19 | [`web/src/components/ForensicDetailPanel.tsx`](file:///g:/PAYPAL/web/src/components/ForensicDetailPanel.tsx) | `F-07`, `E-03`, `E-06` |
| `BryntumSlaBoard` | TypeScript / React 19 | [`web/src/components/BryntumSlaBoard.tsx`](file:///g:/PAYPAL/web/src/components/BryntumSlaBoard.tsx) | `F-08`, `API-09`, `API-13`, `P-03` |
| `PayPalStepUpModal` | TypeScript / React 19 | [`web/src/components/PayPalStepUpModal.tsx`](file:///g:/PAYPAL/web/src/components/PayPalStepUpModal.tsx) | `F-09`, `API-10`, `P-03` |
| `useBryntumTimeline()` | TypeScript / React 19 | [`web/src/hooks/useBryntumTimeline.ts`](file:///g:/PAYPAL/web/src/hooks/useBryntumTimeline.ts) | `F-08`, `API-09`, `API-13` |
| `usePayPalStepUp()` | TypeScript / React 19 | [`web/src/hooks/usePayPalStepUp.ts`](file:///g:/PAYPAL/web/src/hooks/usePayPalStepUp.ts) | `F-09`, `API-10` |
| `usePoisonedStoreSim()` | TypeScript / React 19 | [`web/src/hooks/usePoisonedStoreSim.ts`](file:///g:/PAYPAL/web/src/hooks/usePoisonedStoreSim.ts) | `F-02`, `F-06`, `P-02` |
| `broadcastTalosEscrowEvent()`, `callEscrowVoidApi()` | TypeScript | [`web/src/lib/phase6-events.ts`](file:///g:/PAYPAL/web/src/lib/phase6-events.ts) | `F-07`, `F-08`, `F-09` |
| `POST /api/mcp/paypal-bridge` (`PayPalAgentToolkit`) | TypeScript / Next.js 15 | [`web/src/app/api/mcp/paypal-bridge/route.ts`](file:///g:/PAYPAL/web/src/app/api/mcp/paypal-bridge/route.ts) | `F-03`, `F-10`, `API-16` |
| `useEscrowStream()` | TypeScript / React 19 | [`web/src/hooks/useEscrowStream.ts`](file:///g:/PAYPAL/web/src/hooks/useEscrowStream.ts) | `API-15`, `API-16` |

---

## 2. API Endpoint (`API-01`..`API-16`) to Implementation Handler Map

| API ID | Method & Route | Service Owner | Source File | OpenAPI Spec Reference |
| :--- | :--- | :--- | :--- | :--- |
| **`API-01`** | `POST /v1/firewall/mandate/sign` | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/mandate.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mandate.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-02`** | `POST /v1/firewall/mandate/verify` | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/mandate.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mandate.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-03`** | `POST /v1/firewall/sanitize-dom` | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/sanitizer.rs`](file:///g:/PAYPAL/services/firewall-rs/src/sanitizer.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-04`** | `POST /v1/firewall/webhook/verify` | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/webhook_verify.rs`](file:///g:/PAYPAL/services/firewall-rs/src/webhook_verify.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-05`** | `POST /mcp` (JSON-RPC 2.0) | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/mcp_server.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mcp_server.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-06`** | `POST /api/v1/escrow/checkout` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/escrow/machine.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/escrow/machine.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-07`** | `GET /api/v1/escrow/{id}` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/cmd/server/main.go`](file:///g:/PAYPAL/services/orchestrator-go/cmd/server/main.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-08`** | `POST /api/v1/escrow/{id}/capture` | `orchestrator-go` (`:8080`) | [`sdk/paypal-go-apimatic/payments_v2.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/payments_v2.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-09`** | `POST /api/v1/escrow/{id}/void` | `orchestrator-go` (`:8080`) | [`sdk/paypal-go-apimatic/payments_v2.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/payments_v2.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-10`** | `POST /api/v1/escrow/{id}/step-up-approve` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/escrow/machine.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/escrow/machine.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-11`** | `POST /api/v1/escrow/{id}/tracking` | `orchestrator-go` (`:8080`) | [`sdk/paypal-go-apimatic/tracking_v1.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/tracking_v1.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-12`** | `POST /api/v1/escrow/{id}/dispute-evidence` | `orchestrator-go` (`:8080`) | [`sdk/paypal-go-apimatic/disputes_v1.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/disputes_v1.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-13`** | `POST /api/v1/oracle/channel3/verify` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/channel3/oracle.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/channel3/oracle.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-14`** | `POST /api/v1/audit/verify-chain` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/migrations/0001_init_schema.up.sql`](file:///g:/PAYPAL/services/orchestrator-go/migrations/0001_init_schema.up.sql) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-15`** | `POST /api/v1/webhooks/paypal` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/cmd/server/main.go`](file:///g:/PAYPAL/services/orchestrator-go/cmd/server/main.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-16`** | `POST /api/mcp/paypal-bridge` & `GET /ws/escrow-stream` | `web` (`:3000`) & `orchestrator-go` (`:8080`) | [`web/src/app/api/mcp/paypal-bridge/route.ts`](file:///g:/PAYPAL/web/src/app/api/mcp/paypal-bridge/route.ts) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
