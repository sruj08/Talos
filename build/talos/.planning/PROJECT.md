# TALOS — GSD Project Context
> Single Source of Truth: [`docs/00-overview/PROJECT_BRIEF.md`](../docs/00-overview/PROJECT_BRIEF.md)
> Codebase Knowledge Graph: [`.planning/graphs/GRAPH_REPORT.md`](graphs/GRAPH_REPORT.md) & [`MAP.md`](../MAP.md)

## Core Architecture
- **Rust (`services/firewall-rs`)**: `axum` + `rmcp` MCP Server + `ed25519-dalek` KYA Mandate Signer/Verifier + `lol_html` & `ort` (`DeBERTa-v3` ONNX) DOM Prompt-Injection Sanitizer + PayPal Webhook CRC32/RSA verifier.
- **Golang (`services/orchestrator-go`)**: Go 1.24 + `chi` + `modelcontextprotocol/go-sdk` + Custom **APIMatic Go PayPal SDK (`sdk/paypal-go-apimatic`)** + `errgroup` parallel fan-out to **Channel3** (`trychannel3.com`), **KERNEL** (`onkernel.com`), and **PayPal Sandbox** (`Orders v2 AUTHORIZE`, `Authorizations Capture/Void`, `Shipment Tracking v1`, `Customer Disputes v1`) + PostgreSQL 16 + Valkey/Redis + WebSocket hub.
- **TypeScript / Next.js 15 (`web/`)**: **AG Grid Enterprise & AG Studio** Blotter + **Bryntum Scheduler Pro / Gantt** 2-Way Payment SLA Timeline + **PayPal JS SDK v6** (`@paypal/react-paypal-js`) Human Step-Up Modal + `@paypal/agent-toolkit` MCP Bridge.
