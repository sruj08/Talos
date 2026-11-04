//! TALOS Zero-Trust KYA & DOM Prompt-Injection Firewall Kernel (`services/firewall-rs`)
//! Exposes REST endpoints (`API-01`..`API-04`) and MCP JSON-RPC tools (`F-03`).

pub mod mandate;
pub mod mcp_server;
pub mod otel;
pub mod sanitizer;
pub mod webhook_verify;

use axum::{
    middleware,
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

pub async fn healthz() -> Json<Value> {
    Json(json!({
        "service": "talos-firewall-rs",
        "status": "ok",
        "engine": "ed25519-dalek + lol_html + deberta-v3-onnx",
        "otel": "w3c-traceparent+elastic-apm",
        "version": "0.1.0"
    }))
}

pub fn build_router() -> Router {
    Router::new()
        .route("/healthz", get(healthz))
        .route("/v1/telemetry/spans", get(otel::handle_get_spans))
        .route("/v1/mandates/sign", post(mandate::handle_sign_mandate))
        .route("/v1/firewall/mandate/sign", post(mandate::handle_sign_mandate))
        .route("/v1/mandates/verify", post(mandate::handle_verify_mandate))
        .route("/v1/firewall/mandate/verify", post(mandate::handle_verify_mandate))
        .route("/v1/firewall/sanitize-dom", post(sanitizer::handle_sanitize_dom))
        .route("/v1/firewall/verify-webhook", post(webhook_verify::handle_verify_webhook))
        .route("/v1/firewall/webhook/verify", post(webhook_verify::handle_verify_webhook))
        .route("/mcp", post(mcp_server::handle_mcp_rpc))
        .route("/mcp/sse", get(mcp_server::handle_mcp_sse).post(mcp_server::handle_mcp_rpc))
        .layer(middleware::from_fn(otel::otel_trace_middleware))
        .layer(CorsLayer::permissive())
}

#[tokio::main]
async fn main() {
    if std::env::args().any(|arg| arg == "--mcp-stdio") {
        if let Err(err) = mcp_server::run_stdio_loop().await {
            eprintln!("mcp stdio error: {}", err);
        }
        return;
    }

    tracing_subscriber::fmt::init();

    let app = build_router();
    let port: u16 = std::env::var("RUST_FIREWALL_PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(8081);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("talos-firewall-rs listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_healthz_and_otel_span_attributes() {
        let _router = build_router();
        let Json(val) = healthz().await;
        assert_eq!(val["service"], "talos-firewall-rs");
        assert_eq!(val["status"], "ok");

        let tp = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
        let m_span = otel::record_mandate_verify_span(Some(tp), "mnd-test-01", true, "talos-kya-01", 0, 310);
        assert_eq!(m_span.trace_id, "4bf92f3577b34da6a3ce929d0e0e4736");
        assert_eq!(m_span.attributes["talos.mandate.id"], "mnd-test-01");
        assert_eq!(m_span.attributes["kya.ed25519.verified"], true);

        let d_span = otel::record_dom_sanitize_span(Some(tp), "mnd-test-01", 2, 0.9942, "BLOCKED", 2840);
        assert_eq!(d_span.attributes["talos.firewall.risk_score"], 0.9942);
        assert_eq!(d_span.attributes["dom.verdict"], "BLOCKED");
        assert!(!otel::recent_spans().is_empty());
    }
}
