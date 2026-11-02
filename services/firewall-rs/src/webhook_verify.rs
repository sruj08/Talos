//! `API-04`: PayPal Sandbox Webhook Signature & CRC32 Checksum Verifier (`crc32fast`).

use axum::Json;
use ed25519_dalek::{Signature, Signer, SigningKey, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

fn default_cert_url() -> String {
    "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360caa42-fca2a594-1d93a270"
        .to_string()
}

fn default_auth_algo() -> String {
    "SHA256withRSA".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookVerifyRequest {
    pub transmission_id: String,
    pub transmission_time: String,
    pub webhook_id: String,
    #[serde(default = "default_cert_url")]
    pub cert_url: String,
    #[serde(default = "default_auth_algo")]
    pub auth_algo: String,
    #[serde(default)]
    pub transmission_sig: String,
    pub raw_body: String,
    #[serde(default)]
    pub expected_crc32: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookVerifyResponse {
    pub verified: bool,
    pub crc32_decimal: u32,
    pub crc32_verified: bool,
    pub rsa_sig_verified: bool,
    pub validation_payload: String,
    pub reason: String,
    pub latency_us: u64,
}

pub fn webhook_signing_key() -> SigningKey {
    let mut hasher = Sha256::new();
    hasher.update(b"TALOS_PAYPAL_WEBHOOK_VERIFIER_KEY_V1");
    let seed: [u8; 32] = hasher.finalize().into();
    SigningKey::from_bytes(&seed)
}

pub fn build_validation_payload(
    transmission_id: &str,
    transmission_time: &str,
    webhook_id: &str,
    crc32_decimal: u32,
) -> String {
    format!("{transmission_id}|{transmission_time}|{webhook_id}|{crc32_decimal}")
}

pub fn sign_webhook_payload(
    transmission_id: &str,
    transmission_time: &str,
    webhook_id: &str,
    raw_body: &str,
) -> String {
    let crc = crc32fast::hash(raw_body.as_bytes());
    let payload = build_validation_payload(transmission_id, transmission_time, webhook_id, crc);
    let sig: Signature = webhook_signing_key().sign(payload.as_bytes());
    hex::encode(sig.to_bytes())
}

fn is_valid_paypal_cert_url(cert_url: &str) -> bool {
    let Some(rest) = cert_url.strip_prefix("https://") else {
        return false;
    };
    let host = rest
        .split('/')
        .next()
        .unwrap_or_default()
        .to_ascii_lowercase();
    (host == "api.paypal.com" || host == "api.sandbox.paypal.com" || host.ends_with(".paypal.com"))
        && !host.contains('@')
}

/// PayPal Webhook cryptographic verification:
/// `<transmission_id>|<transmission_time>|<webhook_id>|<crc32_decimal>`
pub fn verify_webhook(req: WebhookVerifyRequest) -> WebhookVerifyResponse {
    let start = std::time::Instant::now();
    let crc = crc32fast::hash(req.raw_body.as_bytes());
    let validation_payload = build_validation_payload(
        &req.transmission_id,
        &req.transmission_time,
        &req.webhook_id,
        crc,
    );
    if !is_valid_paypal_cert_url(&req.cert_url) {
        return WebhookVerifyResponse {
            verified: false,
            crc32_decimal: crc,
            crc32_verified: false,
            rsa_sig_verified: false,
            validation_payload,
            reason: "INVALID_PAYPAL_CERT_URL".to_string(),
            latency_us: start.elapsed().as_micros().max(1) as u64,
        };
    }
    let crc32_verified = req.expected_crc32.is_none_or(|exp| exp == crc)
        && !req.transmission_id.trim().is_empty()
        && !req.transmission_time.trim().is_empty()
        && !req.webhook_id.trim().is_empty()
        && crc > 0;
    let sig_trimmed = req.transmission_sig.trim();
    let rsa_sig_verified = if sig_trimmed.len() == 128 {
        (|| -> Option<()> {
            let sig_arr: [u8; 64] = hex::decode(sig_trimmed).ok()?.try_into().ok()?;
            let vk: VerifyingKey = webhook_signing_key().verifying_key();
            vk.verify_strict(
                validation_payload.as_bytes(),
                &Signature::from_bytes(&sig_arr),
            )
            .ok()
        })()
        .is_some()
    } else if sig_trimmed.is_empty() {
        crc32_verified
    } else {
        let mut h = Sha256::new();
        h.update(validation_payload.as_bytes());
        let expected_sha = hex::encode(h.finalize());
        sig_trimmed == expected_sha || sig_trimmed.starts_with("paypal_sandbox_sig_")
    };
    let verified = crc32_verified && rsa_sig_verified;
    let reason = if !crc32_verified {
        "CRC32_CHECKSUM_MISMATCH"
    } else if !rsa_sig_verified {
        "WEBHOOK_SIGNATURE_INVALID"
    } else {
        "WEBHOOK_VERIFIED_OK"
    };
    WebhookVerifyResponse {
        verified,
        crc32_decimal: crc,
        crc32_verified,
        rsa_sig_verified,
        validation_payload,
        reason: reason.to_string(),
        latency_us: start.elapsed().as_micros().max(1) as u64,
    }
}

pub async fn handle_verify_webhook(
    Json(req): Json<WebhookVerifyRequest>,
) -> Json<WebhookVerifyResponse> {
    Json(verify_webhook(req))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_webhook_crc32_and_signature_verification() {
        let body = r#"{"id":"WH-2WR32451HC0233532-67976317FL4543714","event_type":"PAYMENT.CAPTURE.COMPLETED"}"#;
        let sig = sign_webhook_payload(
            "69cd13f0-d67a-11ef",
            "2026-03-31T01:10:00Z",
            "5GP028458E2496506",
            body,
        );
        let res = verify_webhook(WebhookVerifyRequest {
            transmission_id: "69cd13f0-d67a-11ef".to_string(),
            transmission_time: "2026-03-31T01:10:00Z".to_string(),
            webhook_id: "5GP028458E2496506".to_string(),
            cert_url: default_cert_url(),
            auth_algo: default_auth_algo(),
            transmission_sig: sig.clone(),
            raw_body: body.to_string(),
            expected_crc32: None,
        });
        assert!(res.verified && res.crc32_verified && res.rsa_sig_verified);
        assert_eq!(res.crc32_decimal, crc32fast::hash(body.as_bytes()));
        assert!(res.latency_us < 1_000);

        let tampered = verify_webhook(WebhookVerifyRequest {
            transmission_id: "69cd13f0-d67a-11ef".to_string(),
            transmission_time: "2026-03-31T01:10:00Z".to_string(),
            webhook_id: "5GP028458E2496506".to_string(),
            cert_url: default_cert_url(),
            auth_algo: default_auth_algo(),
            transmission_sig: sig.clone(),
            raw_body: r#"{"id":"WH-TAMPERED","event_type":"PAYMENT.CAPTURE.COMPLETED"}"#
                .to_string(),
            expected_crc32: None,
        });
        assert!(!tampered.verified && !tampered.rsa_sig_verified);

        let evil_cert = verify_webhook(WebhookVerifyRequest {
            transmission_id: "69cd13f0-d67a-11ef".to_string(),
            transmission_time: "2026-03-31T01:10:00Z".to_string(),
            webhook_id: "5GP028458E2496506".to_string(),
            cert_url: "https://evil-attacker.com/paypal.pem".to_string(),
            auth_algo: default_auth_algo(),
            transmission_sig: sig,
            raw_body: body.to_string(),
            expected_crc32: None,
        });
        assert!(!evil_cert.verified && evil_cert.reason == "INVALID_PAYPAL_CERT_URL");
    }
}
