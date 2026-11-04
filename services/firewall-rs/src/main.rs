//! TALOS Zero-Trust KYA & DOM Prompt-Injection Firewall Kernel (`services/firewall-rs`)
//! Exposes REST endpoints (`API-01`..`API-04`) and MCP JSON-RPC tools (`F-03`).

pub mod mandate;
pub mod mcp_server;
pub mod sanitizer;
pub mod webhook_verify;

use axum::{
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
        "version": "0.1.0"
    }))
}

pub fn build_router() -> Router {
    Router::new()
        .route("/healthz", get(healthz))
        .route("/v1/mandates/sign", post(mandate::handle_sign_mandate))
        .route("/v1/firewall/mandate/sign", post(mandate::handle_sign_mandate))
        .route("/v1/mandates/verify", post(mandate::handle_verify_mandate))
        .route("/v1/firewall/mandate/verify", post(mandate::handle_verify_mandate))
        .route("/v1/firewall/sanitize-dom", post(sanitizer::handle_sanitize_dom))
        .route("/v1/firewall/verify-webhook", post(webhook_verify::handle_verify_webhook))
        .route("/v1/firewall/webhook/verify", post(webhook_verify::handle_verify_webhook))
        .route("/mcp", post(mcp_server::handle_mcp_rpc))
        .route("/mcp/sse", get(mcp_server::handle_mcp_sse).post(mcp_server::handle_mcp_rpc))
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
    async fn test_healthz_and_router_construction() {
        let _router = build_router();
        let Json(val) = healthz().await;
        assert_eq!(val["service"], "talos-firewall-rs");
        assert_eq!(val["status"], "ok");
    }
}
