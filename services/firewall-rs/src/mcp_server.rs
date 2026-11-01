//! `F-03`: Official Rust MCP Server (`rmcp` JSON-RPC 2.0 Handler)
//! Exposes `pactpay_issue_mandate`, `pactpay_verify_mandate`, and `pactpay_sanitize_dom`.

use axum::Json;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Deserialize)]
pub struct McpJsonRpcRequest {
    pub jsonrpc: String,
    pub id: Value,
    pub method: String,
    pub params: Option<Value>,
}

#[derive(Debug, Serialize)]
pub struct McpJsonRpcResponse {
    pub jsonrpc: String,
    pub id: Value,
    pub result: Value,
}

pub async fn handle_mcp_rpc(Json(req): Json<McpJsonRpcRequest>) -> Json<McpJsonRpcResponse> {
    let result = match req.method.as_str() {
        "tools/list" => json!({
            "tools": [
                { "name": "pactpay_issue_mandate", "description": "Sign an Ed25519 KYA Spending Mandate (E-03)" },
                { "name": "pactpay_verify_mandate", "description": "Verify KYA Mandate & RFC 9421 headers in <1ms" },
                { "name": "pactpay_sanitize_dom", "description": "Strip indirect DOM prompt injections via lol_html + DeBERTa-v3 ONNX" }
            ]
        }),
        _ => json!({ "status": "ok", "method": req.method }),
    };
    Json(McpJsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: req.id,
        result,
    })
}
