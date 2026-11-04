# O(1) Codebase & Symbol Index — TALOS

> **Purpose for AI Agents**: Read this file FIRST whenever a prompt mentions a feature, struct, React component, SQL table, API endpoint, or sponsor integration. Jump directly to the exact file path below in `O(1)` without scanning directories.

---

## 1. Symbol-to-File Lookup Table (Rust, Go, TypeScript, SQL)

| Symbol / Struct / Component | Language | Exact File Path | Feature / Entity / API ID |
| :--- | :---: | :--- | :--- |
| `KyaMandate`, `MandateSignRequest`, `sign_mandate()`, `verify_mandate()` | Rust 1.85 | [`services/firewall-rs/src/mandate.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mandate.rs) | `F-01`, `E-03`, `API-01`, `API-02` |
| `DomSanitizeRequest`, `FirewallScanLog`, `sanitize_dom_html()` | Rust 1.85 | [`services/firewall-rs/src/sanitizer.rs`](file:///g:/PAYPAL/services/firewall-rs/src/sanitizer.rs) | `F-02`, `M-01`, `E-04`, `API-03` |
| `WebhookVerifyRequest`, `verify_paypal_webhook()` | Rust 1.85 | [`services/firewall-rs/src/webhook_verify.rs`](file:///g:/PAYPAL/services/firewall-rs/src/webhook_verify.rs) | `F-04`, `E-09`, `API-04` |
| `McpRpcRequest`, `McpRpcResponse`, `handle_mcp_rpc()` | Rust 1.85 | [`services/firewall-rs/src/mcp_server.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mcp_server.rs) | `F-03`, `API-01`..`API-05` |
| `resolve_listen_port()`, `build_router()`, `healthz()` | Rust 1.85 | [`services/firewall-rs/src/main.rs`](file:///g:/PAYPAL/services/firewall-rs/src/main.rs) | `F-14`, `TASK-15` |
| `Client`, `NewClient()`, `AcquireToken()` | Go 1.24 | [`sdk/paypal-go-apimatic/client.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/client.go) | `F-05` |
| `CreateOrderRequest`, `OrderResponse`, `CreateOrder()`, `AuthorizeOrder()` | Go 1.24 | [`sdk/paypal-go-apimatic/orders_v2.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/orders_v2.go) | `F-05`, `API-07` |
| `CaptureAuthorization()`, `VoidAuthorization()` | Go 1.24 | [`sdk/paypal-go-apimatic/payments_v2.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/payments_v2.go) | `F-05`, `F-06`, `API-09`, `API-10` |
| `CreateTrackingBatch()` | Go 1.24 | [`sdk/paypal-go-apimatic/tracking_v1.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/tracking_v1.go) | `F-06`, `E-07`, `API-08` |
| `ProvideDisputeEvidence()` | Go 1.24 | [`sdk/paypal-go-apimatic/disputes_v1.go`](file:///g:/PAYPAL/sdk/paypal-go-apimatic/disputes_v1.go) | `F-10`, `E-08`, `API-11` |
| `State`, `Machine`, `Transition()`, `ExecuteIdempotent()` | Go 1.24 | [`services/orchestrator-go/internal/escrow/machine.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/escrow/machine.go) | `F-05`, `F-06`, `E-06` |
| `BenchmarkResult`, `OracleClient`, `BenchmarkSKU()` | Go 1.24 | [`services/orchestrator-go/internal/channel3/oracle.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/channel3/oracle.go) | `F-04`, `E-05`, `API-06` |
| `InspectorClient`, `InspectMerchantDOM()` | Go 1.24 | [`services/orchestrator-go/internal/kernel/browser.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/kernel/browser.go) | `F-02`, `F-11` |
| `InitElasticOTel()`, `TelemetryEngine`, `ComputeThreatEmbedding()` | Go 1.24 | [`services/orchestrator-go/internal/telemetry/elastic_otel.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/telemetry/elastic_otel.go) | `F-12`, `M-04`, `TASK-13` |
| `RecordCheckoutTrace()`, `IndexThreatVector()`, `SearchSimilarThreats()` | Go 1.24 | [`services/orchestrator-go/internal/telemetry/elastic_exporter.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/telemetry/elastic_exporter.go) | `F-12`, `M-04`, `TASK-13` |
| `OtelSpanRecord`, `record_mandate_verify_span()`, `record_dom_sanitize_span()` | Rust 1.85 | [`services/firewall-rs/src/otel.rs`](file:///g:/PAYPAL/services/firewall-rs/src/otel.rs) | `F-12`, `TASK-13` |
| `RedTeamCase`, `test_redteam_prompt_injection_100_percent_block_recall()` | Rust 1.85 | [`services/firewall-rs/tests/redteam_suite.rs`](file:///g:/PAYPAL/services/firewall-rs/tests/redteam_suite.rs) | `F-02`, `M-01`, `TASK-14` |
| `Hub`, `Broadcast()` | Go 1.24 | [`services/orchestrator-go/internal/ws/hub.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/ws/hub.go) | `F-07`, `F-08`, `API-15` |
| `Server`, `HandleEvaluateCheckout()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/api.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/api.go) | `API-05` |
| `HandleAuthorizeEscrow()`, `HandleCaptureEscrow()`, `HandleVoidEscrow()`, `HandleStepUpApprove()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/escrow_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/escrow_handlers.go) | `API-07`, `API-09`, `API-10` |
| `HandleChannel3Benchmark()`, `HandleAttachTracking()`, `HandleSubmitDisputeEvidence()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go) | `API-06`, `API-08`, `API-11` |
| `HandleGetBlotter()`, `HandleGetSlaTimeline()`, `HandlePatchSlaTimelineTask()`, `HandlePayPalWebhook()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/sla_webhook_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/sla_webhook_handlers.go) | `API-12`, `API-13`, `API-14` |
| `kya_mandates`, `escrow_transactions`, `audit_events`, `compute_audit_event_hash()` | SQL (PG 16) | [`services/orchestrator-go/migrations/0001_init_schema.up.sql`](file:///g:/PAYPAL/services/orchestrator-go/migrations/0001_init_schema.up.sql) | `E-01`..`E-09`, `F-14` |
| `MandateStudio` | TypeScript / React 19 | [`web/src/components/MandateStudio.tsx`](file:///g:/PAYPAL/web/src/components/MandateStudio.tsx) | `F-01`, `P-01` |
| `PoisonedStoreSim` | TypeScript / React 19 | [`web/src/components/PoisonedStoreSim.tsx`](file:///g:/PAYPAL/web/src/components/PoisonedStoreSim.tsx) | `F-02`, `F-11`, `P-02` |
| `AgStudioBlotter` | TypeScript / React 19 | [`web/src/components/AgStudioBlotter.tsx`](file:///g:/PAYPAL/web/src/components/AgStudioBlotter.tsx) | `F-08`, `M-03`, `P-04` |
| `useAgStudioBlotter()`, `runAgStudioCopilotQuery()` | TypeScript / React 19 | [`web/src/hooks/useAgStudioBlotter.ts`](file:///g:/PAYPAL/web/src/hooks/useAgStudioBlotter.ts) | `F-08`, `M-03` |
| `ForensicDetailPanel` | TypeScript / React 19 | [`web/src/components/ForensicDetailPanel.tsx`](file:///g:/PAYPAL/web/src/components/ForensicDetailPanel.tsx) | `F-08`, `E-04`, `E-06` |
| `BryntumSlaBoard` | TypeScript / React 19 | [`web/src/components/BryntumSlaBoard.tsx`](file:///g:/PAYPAL/web/src/components/BryntumSlaBoard.tsx) | `F-07`, `API-10`, `API-13`, `P-01` |
| `PayPalStepUpModal` | TypeScript / React 19 | [`web/src/components/PayPalStepUpModal.tsx`](file:///g:/PAYPAL/web/src/components/PayPalStepUpModal.tsx) | `F-09`, `API-10`, `P-01` |
| `useBryntumTimeline()` | TypeScript / React 19 | [`web/src/hooks/useBryntumTimeline.ts`](file:///g:/PAYPAL/web/src/hooks/useBryntumTimeline.ts) | `F-07`, `API-10`, `API-13` |
| `usePayPalStepUp()` | TypeScript / React 19 | [`web/src/hooks/usePayPalStepUp.ts`](file:///g:/PAYPAL/web/src/hooks/usePayPalStepUp.ts) | `F-09`, `API-10` |
| `usePoisonedStoreSim()` | TypeScript / React 19 | [`web/src/hooks/usePoisonedStoreSim.ts`](file:///g:/PAYPAL/web/src/hooks/usePoisonedStoreSim.ts) | `F-02`, `F-11`, `P-02` |
| `broadcastTalosEscrowEvent()`, `callEscrowVoidApi()` | TypeScript | [`web/src/lib/phase6-events.ts`](file:///g:/PAYPAL/web/src/lib/phase6-events.ts) | `F-07`, `F-08`, `F-09` |
| `POST /api/mcp/paypal-bridge` (`PayPalAgentToolkit`) | TypeScript / Next.js 15 | [`web/src/app/api/mcp/paypal-bridge/route.ts`](file:///g:/PAYPAL/web/src/app/api/mcp/paypal-bridge/route.ts) | `F-03`, `F-05`, `API-16` |
| `useEscrowStream()` | TypeScript / React 19 | [`web/src/hooks/useEscrowStream.ts`](file:///g:/PAYPAL/web/src/hooks/useEscrowStream.ts) | `API-15`, `API-16` |
| `buildHealthzPayload()`, `GET /api/healthz`, `GET /healthz` | TypeScript / Next.js 15 | [`web/src/app/api/healthz/route.ts`](file:///g:/PAYPAL/web/src/app/api/healthz/route.ts) | `F-14`, `TASK-15` |
| `NormalizeServiceURL()`, `ResolveFirewallURL()` | Go 1.24 | [`services/orchestrator-go/internal/handlers/escrow_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/escrow_handlers.go) | `F-14`, `TASK-15` |
| `verify-deployment.sh`, `verify-deployment.ps1` | Bash / PowerShell | [`scripts/verify-deployment.sh`](file:///g:/PAYPAL/scripts/verify-deployment.sh) | `F-14`, `TASK-15` |
| `TalosCommandCenterPage`, `E2E_SCENARIOS` | TypeScript / Playwright | [`web/e2e/talos-3act-demo.spec.ts`](file:///g:/PAYPAL/web/e2e/talos-3act-demo.spec.ts) | `TASK-14` |
| `08-DEVPOST-SUBMISSION-PACKET.md` | Markdown | [`.planning/phases/08-render-native-polyglot-deployment-demo-polish/08-DEVPOST-SUBMISSION-PACKET.md`](file:///g:/PAYPAL/.planning/phases/08-render-native-polyglot-deployment-demo-polish/08-DEVPOST-SUBMISSION-PACKET.md) | `TASK-16` |

---

## 2. API Endpoint (`API-01`..`API-16`) to Implementation Handler Map

| API ID | Method & Route | Service Owner | Source File | OpenAPI Spec Reference |
| :--- | :--- | :--- | :--- | :--- |
| **`API-01`** | `POST /v1/mandates/sign` (`/v1/firewall/mandate/sign`, MCP: `talos_issue_mandate`) | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/mandate.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mandate.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-02`** | `POST /v1/mandates/verify` (`/v1/firewall/mandate/verify`, MCP: `talos_verify_mandate`) | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/mandate.rs`](file:///g:/PAYPAL/services/firewall-rs/src/mandate.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-03`** | `POST /v1/firewall/sanitize-dom` (MCP: `talos_sanitize_dom`) | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/sanitizer.rs`](file:///g:/PAYPAL/services/firewall-rs/src/sanitizer.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-04`** | `POST /v1/firewall/verify-webhook` (`/v1/firewall/webhook/verify`) | `firewall-rs` (`:8081`) | [`services/firewall-rs/src/webhook_verify.rs`](file:///g:/PAYPAL/services/firewall-rs/src/webhook_verify.rs) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-05`** | `POST /api/v1/checkout/evaluate` (`/api/v1/escrow/checkout`, MCP: `talos_execute_protected_checkout`) | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/api.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/api.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-06`** | `POST /api/v1/channel3/benchmark` (`/api/v1/oracle/channel3/verify`) | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-07`** | `POST /api/v1/escrow/{id}/authorize` & `GET /api/v1/escrow/{id}` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/escrow_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/escrow_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-08`** | `POST /api/v1/escrow/{id}/tracking` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-09`** | `POST /api/v1/escrow/{id}/capture` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/escrow_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/escrow_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-10`** | `POST /api/v1/escrow/{id}/void` & `POST /api/v1/escrow/{id}/step-up-approve` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/escrow_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/escrow_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-11`** | `POST /api/v1/escrow/{id}/dispute-evidence` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/tracking_dispute_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-12`** | `GET /api/v1/escrow/blotter` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/sla_webhook_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/sla_webhook_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-13`** | `GET /api/v1/sla/timeline` & `PATCH /api/v1/sla/timeline/{task_id}` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/sla_webhook_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/sla_webhook_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-14`** | `POST /api/v1/webhooks/paypal` & `POST /api/v1/audit/verify-chain` | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/handlers/sla_webhook_handlers.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/handlers/sla_webhook_handlers.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-15`** | `GET /ws/events` (`/ws/escrow-stream`) | `orchestrator-go` (`:8080`) | [`services/orchestrator-go/internal/ws/hub.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/ws/hub.go) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
| **`API-16`** | `POST /api/mcp/paypal-bridge` | `web` (`:3000`) & `orchestrator-go` (`:8080`) | [`web/src/app/api/mcp/paypal-bridge/route.ts`](file:///g:/PAYPAL/web/src/app/api/mcp/paypal-bridge/route.ts) | [`api/openapi.yaml`](file:///g:/PAYPAL/api/openapi.yaml) |
