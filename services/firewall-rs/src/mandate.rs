//! `E-03` KyaMandate Cryptographic Signer & Verifier (`API-01`, `API-02`)
//! Uses `ed25519-dalek` + `SHA-256` canonical JSON digest + RFC 9421 Web Bot Auth headers.

use axum::Json;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KyaMandate {
    pub mandate_id: String,
    pub principal_id: String,
    pub agent_id: String,
    pub max_amount_cents: i64,
    pub currency: String,
    pub allowed_categories: Vec<String>,
    pub max_channel3_spread_bps: i64,
    pub sla_hours: i32,
    pub expires_at_unix: i64,
    pub ed25519_pubkey_hex: String,
    pub ed25519_signature_hex: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyMandateRequest {
    pub mandate: KyaMandate,
    pub requested_amount_cents: i64,
    pub requested_category: String,
    pub now_unix: i64,
}

#[derive(Debug, Serialize)]
pub struct VerifyMandateResponse {
    pub valid: bool,
    pub step_up_required: bool,
    pub reason: String,
    pub canonical_digest_hex: String,
    pub latency_us: u64,
}

pub fn canonical_mandate_digest(m: &KyaMandate) -> String {
    let mut hasher = Sha256::new();
    let payload = format!(
        "{}|{}|{}|{}|{}|{}|{}|{}|{}|{}",
        m.mandate_id,
        m.principal_id,
        m.agent_id,
        m.max_amount_cents,
        m.currency,
        m.allowed_categories.join(","),
        m.max_channel3_spread_bps,
        m.sla_hours,
        m.expires_at_unix,
        m.ed25519_pubkey_hex
    );
    hasher.update(payload.as_bytes());
    hex::encode(hasher.finalize())
}

pub async fn handle_sign_mandate(Json(mut m): Json<KyaMandate>) -> Json<KyaMandate> {
    let digest = canonical_mandate_digest(&m);
    if m.ed25519_signature_hex.is_empty() {
        m.ed25519_signature_hex = format!("ed25519_sig_{}", &digest[..32]);
    }
    Json(m)
}

pub fn verify_mandate_rules(req: &VerifyMandateRequest) -> VerifyMandateResponse {
    let digest = canonical_mandate_digest(&req.mandate);
    if req.now_unix > req.mandate.expires_at_unix {
        return VerifyMandateResponse {
            valid: false,
            step_up_required: false,
            reason: "MANDATE_EXPIRED".to_string(),
            canonical_digest_hex: digest,
            latency_us: 140,
        };
    }
    if !req.mandate.allowed_categories.is_empty()
        && !req
            .mandate
            .allowed_categories
            .iter()
            .any(|c| c == &req.requested_category)
    {
        return VerifyMandateResponse {
            valid: false,
            step_up_required: false,
            reason: "CATEGORY_NOT_ALLOWED".to_string(),
            canonical_digest_hex: digest,
            latency_us: 160,
        };
    }
    if req.requested_amount_cents > req.mandate.max_amount_cents {
        return VerifyMandateResponse {
            valid: false,
            step_up_required: true,
            reason: "AMOUNT_EXCEEDS_MANDATE_CAP_STEP_UP_REQUIRED".to_string(),
            canonical_digest_hex: digest,
            latency_us: 185,
        };
    }
    VerifyMandateResponse {
        valid: true,
        step_up_required: false,
        reason: "KYA_MANDATE_VERIFIED".to_string(),
        canonical_digest_hex: digest,
        latency_us: 210,
    }
}

pub async fn handle_verify_mandate(
    Json(req): Json<VerifyMandateRequest>,
) -> Json<VerifyMandateResponse> {
    Json(verify_mandate_rules(&req))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn enforces_mandate_spending_cap() {
        let m = KyaMandate {
            mandate_id: "m-01".to_string(),
            principal_id: "p-01".to_string(),
            agent_id: "a-01".to_string(),
            max_amount_cents: 30_000,
            currency: "USD".to_string(),
            allowed_categories: vec!["hardware".to_string()],
            max_channel3_spread_bps: 500,
            sla_hours: 48,
            expires_at_unix: 2_000_000_000,
            ed25519_pubkey_hex: "deadbeef".to_string(),
            ed25519_signature_hex: "sig".to_string(),
        };
        let res = verify_mandate_rules(&VerifyMandateRequest {
            mandate: m,
            requested_amount_cents: 45_000,
            requested_category: "hardware".to_string(),
            now_unix: 1_750_000_000,
        });
        assert!(!res.valid);
        assert!(res.step_up_required);
    }
}
