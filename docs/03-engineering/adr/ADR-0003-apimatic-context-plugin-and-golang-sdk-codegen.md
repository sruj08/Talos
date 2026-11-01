# ADR-0003: APIMatic Context Plugin & Custom Golang PayPal SDK Code Generation
> Project: PactPay (AegisPay) · Owner: SDK & AI Tooling Team · Status: Accepted · Last updated: 2026-11-01
> Related: [TECH_STACK](../TECH_STACK.md) · [INTEGRATIONS](../INTEGRATIONS.md) · [ADR-0001](ADR-0001-polyglot-rust-go-typescript-architecture.md)

---

## Status
**Accepted** (2026-11-01)

## Context and Problem Statement
We identified two critical challenges when building an AI-native PayPal orchestrator in Go and TypeScript:
1. **Missing Official Go Server SDK**: PayPal's official `@paypal/paypal-server-sdk` (built in partnership with APIMatic) is published for TypeScript/Node.js, Python, Java, .NET, PHP, and Ruby—**not Golang**. Writing raw `net/http` JSON marshaling code for deeply nested PayPal `Orders v2`, `Authorizations v2`, `Shipment Tracking v1`, and `Customer Disputes v1` endpoints is brittle and prone to schema drift.
2. **LLM Tool Payload Hallucinations**: When autonomous agents (`M-02`) construct complex PayPal order or dispute payloads without strict OpenAPI context, they frequently hallucinate v1 vs. v2 field names (e.g., passing `amount.total` instead of `amount.value`).

## Decision Drivers
- **Compile-Time Type Safety in Go (`services/orchestrator-go`)**.
- **Zero-Hallucination Agent Tool Calls (`F-05`, `API-16`)**.
- **Best Use of APIMatic Sponsor Award Alignment (`Judge #7: Ameer Hassan`)**.

## Considered Options
1. **Option 1 (Selected): Triple-Layer APIMatic Integration — (a) APIMatic CLI Codegen of `sdk/paypal-go-apimatic` from PayPal OpenAPI 3.0 specs, (b) APIMatic Context Plugin in the agent loop, and (c) `@paypal/paypal-server-sdk` in Next.js**.
2. **Option 2: Hand-written Go HTTP structs + generic LLM prompt instructions**.
3. **Option 3: `oapi-codegen` community generator without APIMatic validation**.

## Decision Outcome
Chosen option: **Option 1 (Triple-Layer APIMatic Integration)**.

### Technical Implementation
1. **OpenAPI Spec Validation & Go SDK Generation**:
   - We pass PayPal's OpenAPI 3.0 specifications (`checkout_orders_v2.json`, `payments_payment_v2.json`, `shipping_shipment_tracking_v1.json`, `customer_disputes_v1.json`) through **APIMatic CLI v3.8 (`apimatic-cli`)**:
     ```bash
     apimatic api:validate --file ./specs/paypal-escrow-bundle.yaml
     apimatic sdk:generate --file ./specs/paypal-escrow-bundle.yaml --language Go --output ./sdk/paypal-go-apimatic
     ```
2. **APIMatic Context Plugin in Agent Loop**:
   - Wired into `web/src/app/api/mcp/paypal-bridge/route.ts` (`API-16`) and `docs/04-ai/PROMPTS.md` so the agent retrieves verified endpoint schemas and code snippets before invoking any PayPal tool.

### Positive Consequences
- 100% schema-valid PayPal Sandbox requests across Go and TypeScript.
- Automatic `PayPal-Request-Id` header injection, OAuth 2.0 token caching, and typed error unmarshaling inside `sdk/paypal-go-apimatic`.
