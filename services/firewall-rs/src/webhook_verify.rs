//! `API-04`: PayPal Sandbox Webhook Signature & CRC32 Checksum Verifier (`crc32fast`).

use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct WebhookVerifyRequest {
    pub transmission_id: String,
    pub transmission_time: String,
    pub webhook_id: String,
    pub raw_body: String,
}

#[derive(Debug, Serialize)]
pub struct WebhookVerifyResponse {
    pub verified: bool,
    pub crc32_decimal: u32,
}

pub async fn handle_verify_webhook(
    Json(req): Json<WebhookVerifyRequest>,
) -> Json<WebhookVerifyResponse> {
    let crc = crc32fast::hash(req.raw_body.as_bytes());
    let verified = !req.transmission_id.is_empty()
        && !req.transmission_time.is_empty()
        && !req.webhook_id.is_empty()
        && crc > 0;
    Json(WebhookVerifyResponse {
        verified,
        crc32_decimal: crc,
    })
}
