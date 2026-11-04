---
phase: 07-elastic-opentelemetry-apm-postman-collection-e2e-tests
plan: 01
subsystem: telemetry-and-postman
tags: [elastic-cloud, opentelemetry, vector-search, postman, newman, traceparent]
completed: 2026-11-04
---

# Phase 07 Plan 01 Summary: Elastic Cloud OpenTelemetry APM, Vector Threat Index & Postman MCP Collection

## Accomplishments
1. **Rust Security Firewall OTel Instrumentation ([`services/firewall-rs/src/otel.rs`](file:///g:/PAYPAL/services/firewall-rs/src/otel.rs))**:
   - Implemented W3C `traceparent` header parsing/generation (`00-{trace_id}-{span_id}-01`), Axum middleware (`otel_trace_middleware`), and bounded ring-buffer span recording for `rust_firewall.verify_mandate` and `rust_firewall.sanitize_dom`.
   - Added `GET /v1/telemetry/spans` endpoint and unit tests verifying attribute contracts (`talos.mandate.id`, `talos.firewall.risk_score`, `kya.ed25519.verified`, `dom.lol_html.stripped_nodes`).
2. **Go Orchestrator Elastic Cloud OTel & Vector Threat Index ([`elastic_otel.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/telemetry/elastic_otel.go), [`elastic_exporter.go`](file:///g:/PAYPAL/services/orchestrator-go/internal/telemetry/elastic_exporter.go))**:
   - Implemented `InitElasticOTel()`, `RecordCheckoutTrace()`, `IndexThreatVector()`, `SearchSimilarThreats()`, and `ProbeElasticCloud()`.
   - Enforced DPDP 2023 / PCI-DSS v4.0 PII redaction (`RedactEmail`, `RedactBearer`) prior to span serialization.
   - Verified live Elastic Cloud connectivity against the user's `.env` credentials (`TestLiveElasticCloudConfigAndProbe` in `elastic_otel_test.go`): `live_configured=true`, `otlp_http_status=200`, `es_http_status=200`, `span_export_mode=ELASTIC_APM_OTLP_LIVE`, `threat_storage_mode=ELASTICSEARCH_VECTOR_INDEX_LIVE` with zero secret values printed.
3. **1-Click Judge Verification Postman Collection ([`Talos-Sandbox-MCP.postman_collection.json`](file:///g:/PAYPAL/postman/Talos-Sandbox-MCP.postman_collection.json), [`Talos-Sandbox.postman_environment.json`](file:///g:/PAYPAL/postman/Talos-Sandbox.postman_environment.json))**:
   - Created 16 automated requests across 4 folders covering `API-01`..`API-16` with `pm.test()` contract assertions and W3C `traceparent` headers.

## Verification
- `cargo test --all-targets --workspace` in `services/firewall-rs`: `9/9` unit tests + `5/5` integration tests passed (`otel::tests::test_traceparent_parse_and_span_recording`).
- `go test -v ./internal/telemetry/...` in `services/orchestrator-go`: `3/3` tests passed including live Elastic Cloud OTLP `/v1/traces` ingest (`otlp_http_status=200`), Elasticsearch vector indexing (`es_http_status=200`), and kNN similarity search (`<20ms`).
- `go test -v ./internal/handlers/...` in `services/orchestrator-go`: `2/2` end-to-end API contract suites passed covering `API-01`..`API-16` and W3C `traceparent` header preservation.
