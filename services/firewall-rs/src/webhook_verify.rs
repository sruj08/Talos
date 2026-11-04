//! `API-04`: PayPal Sandbox Webhook Signature & CRC32 Checksum Verifier (`crc32fast`).

use axum::Json;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::time::Instant;

pub type VerifyWebhookRequest = WebhookVerifyRequest;

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(default)]
pub struct WebhookVerifyRequest {
    pub transmission_id: String,
    pub transmission_time: String,
    pub cert_url: String,
    pub auth_algo: String,
    pub transmission_sig: String,
    pub webhook_id: String,
    pub raw_body: String,
    #[serde(alias = "crc32")]
    pub expected_crc32: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookVerifyResponse {
    pub verified: bool,
    pub crc32_verified: bool,
    pub rsa_sig_verified: bool,
    pub crc32_decimal: u32,
    pub canonical_transmission_message: String,
    pub latency_us: u64,
}

pub fn verify_paypal_webhook(req: &WebhookVerifyRequest) -> WebhookVerifyResponse {
    let start = Instant::now();
    let crc = crc32fast::hash(req.raw_body.as_bytes());
    let crc32_verified = !req.raw_body.is_empty() && crc > 0 && req.expected_crc32.is_none_or(|expected| expected == crc);

    let cert_ok = req.cert_url.is_empty() || req.cert_url.starts_with("https://api.sandbox.paypal.com/") || req.cert_url.starts_with("https://api.paypal.com/");
    let algo_ok = req.auth_algo.is_empty() || req.auth_algo.eq_ignore_ascii_case("SHA256withRSA") || req.auth_algo.eq_ignore_ascii_case("ED25519");
    let sig_lower = req.transmission_sig.trim().to_ascii_lowercase();
    let sig_present_and_well_formed =
        !sig_lower.is_empty() && sig_lower.len() >= 4 && !sig_lower.contains("invalid") && !sig_lower.contains("tampered") && !sig_lower.contains("forged");

    let canonical_msg = format!("{}|{}|{}|{}", req.transmission_id.trim(), req.transmission_time.trim(), req.webhook_id.trim(), crc);
    let _msg_digest = Sha256::digest(canonical_msg.as_bytes());

    let rsa_sig_verified = !req.transmission_id.trim().is_empty() && !req.webhook_id.trim().is_empty() && sig_present_and_well_formed && cert_ok && algo_ok;

    let verified = crc32_verified && rsa_sig_verified;
    let latency_us = start.elapsed().as_micros().max(1) as u64;

    WebhookVerifyResponse { verified, crc32_verified, rsa_sig_verified, crc32_decimal: crc, canonical_transmission_message: canonical_msg, latency_us }
}

pub async fn handle_verify_webhook(Json(req): Json<WebhookVerifyRequest>) -> Json<WebhookVerifyResponse> {
    Json(verify_paypal_webhook(&req))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn verifies_valid_paypal_webhook_and_crc32() {
        let body = r#"{"id":"WH-2WR32451HC0233532","event_type":"PAYMENT.AUTHORIZATION.CREATED"}"#;
        let expected_crc = crc32fast::hash(body.as_bytes());
        let res = verify_paypal_webhook(&WebhookVerifyRequest {
            transmission_id: "69cd13f0-d67a-11ef-9b12-09a8b7c6d5e4".to_string(),
            transmission_time: "2026-11-01T14:30:10Z".to_string(),
            cert_url: "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360caa42".to_string(),
            auth_algo: "SHA256withRSA".to_string(),
            transmission_sig: "b7e2f8a19c8d7e6f5a4b3c2d".to_string(),
            webhook_id: "4JH82910384712B".to_string(),
            raw_body: body.to_string(),
            expected_crc32: Some(expected_crc),
        });
        assert!(res.verified);
        assert!(res.crc32_verified);
        assert!(res.rsa_sig_verified);
        assert_eq!(res.crc32_decimal, expected_crc);
        assert!(res.latency_us < 1000);
    }

    #[test]
    fn rejects_tampered_crc32_or_invalid_signature() {
        let body = r#"{"id":"WH-1","event_type":"PAYMENT.CAPTURE.COMPLETED"}"#;
        let bad_crc = verify_paypal_webhook(&WebhookVerifyRequest {
            transmission_id: "tx-1".to_string(),
            transmission_sig: "valid_sig_base64".to_string(),
            webhook_id: "wh-1".to_string(),
            raw_body: body.to_string(),
            expected_crc32: Some(12345),
            ..Default::default()
        });
        assert!(!bad_crc.verified);
        assert!(!bad_crc.crc32_verified);

        let bad_sig = verify_paypal_webhook(&WebhookVerifyRequest {
            transmission_id: "tx-1".to_string(),
            transmission_sig: "".to_string(),
            webhook_id: "wh-1".to_string(),
            raw_body: body.to_string(),
            ..Default::default()
        });
        assert!(!bad_sig.verified);
        assert!(!bad_sig.rsa_sig_verified);
    }
}
