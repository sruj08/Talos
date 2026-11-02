//! `E-03` KyaMandate Cryptographic Signer & Verifier (`API-01`, `API-02`)
//! Uses `ed25519-dalek` + RFC 8785 JCS `SHA-256` canonical digest + RFC 9421 Web Bot Auth headers.

use axum::Json;
use chrono::Utc;
use ed25519_dalek::{Signature, Signer, SigningKey, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

fn default_mandate_id() -> String {
    format!("mnd_{}", Uuid::new_v4())
}
fn default_currency() -> String {
    "USD".to_string()
}
fn default_spread_bps() -> i64 {
    500
}
fn default_sla_hours() -> i32 {
    72
}
fn default_expires_at_unix() -> i64 {
    Utc::now().timestamp() + 86_400
}
fn default_now_unix() -> i64 {
    Utc::now().timestamp()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KyaMandate {
    #[serde(default = "default_mandate_id")]
    pub mandate_id: String,
    pub principal_id: String,
    pub agent_id: String,
    pub max_amount_cents: i64,
    #[serde(default = "default_currency")]
    pub currency: String,
    pub allowed_categories: Vec<String>,
    #[serde(default = "default_spread_bps", alias = "max_spread_bps")]
    pub max_channel3_spread_bps: i64,
    #[serde(default = "default_sla_hours")]
    pub sla_hours: i32,
    #[serde(default = "default_expires_at_unix")]
    pub expires_at_unix: i64,
    #[serde(default)]
    pub ed25519_pubkey_hex: String,
    #[serde(default, alias = "ed25519_signature")]
    pub ed25519_signature_hex: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyMandateRequest {
    pub mandate: KyaMandate,
    pub requested_amount_cents: i64,
    #[serde(alias = "merchant_category")]
    pub requested_category: String,
    #[serde(default = "default_now_unix")]
    pub now_unix: i64,
    #[serde(default)]
    pub channel3_spread_bps: i64,
    #[serde(default)]
    pub rfc9421_signature_input: Option<String>,
    #[serde(default)]
    pub rfc9421_signature: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyMandateResponse {
    pub valid: bool,
    pub step_up_required: bool,
    pub reason: String,
    pub canonical_digest_hex: String,
    pub latency_us: u64,
}

pub fn derive_agent_signing_key(agent_id: &str) -> SigningKey {
    let mut hasher = Sha256::new();
    hasher.update(b"TALOS_KYA_ED25519_V1:");
    hasher.update(agent_id.as_bytes());
    let seed: [u8; 32] = hasher.finalize().into();
    SigningKey::from_bytes(&seed)
}

/// RFC 8785 JSON Canonicalization Scheme (JCS) deterministic SHA-256 digest over sorted keys
pub fn canonical_mandate_digest(m: &KyaMandate) -> String {
    let mut cats = m.allowed_categories.clone();
    cats.sort();
    let canonical = serde_json::json!({
        "agent_id": m.agent_id,
        "allowed_categories": cats,
        "currency": m.currency,
        "ed25519_pubkey_hex": m.ed25519_pubkey_hex,
        "expires_at_unix": m.expires_at_unix,
        "mandate_id": m.mandate_id,
        "max_amount_cents": m.max_amount_cents,
        "max_channel3_spread_bps": m.max_channel3_spread_bps,
        "principal_id": m.principal_id,
        "sla_hours": m.sla_hours,
    });
    let mut hasher = Sha256::new();
    hasher.update(
        serde_json::to_string(&canonical)
            .unwrap_or_default()
            .as_bytes(),
    );
    hex::encode(hasher.finalize())
}

pub fn sign_rfc9421_headers(
    signing_key: &SigningKey,
    method: &str,
    target_uri: &str,
    content_digest: &str,
    created: i64,
    key_id: &str,
) -> (String, String) {
    let params = format!(
        "(\"@method\" \"@target-uri\" \"content-digest\");created={created};keyid=\"{key_id}\";alg=\"ed25519\""
    );
    let base = format!(
        "\"@method\": {}\n\"@target-uri\": {target_uri}\n\"content-digest\": sha-256=:{content_digest}:\n\"@signature-params\": {params}",
        method.to_uppercase()
    );
    let sig: Signature = signing_key.sign(base.as_bytes());
    (
        format!("sig1={params}"),
        format!("sig1=:{}:", hex::encode(sig.to_bytes())),
    )
}

pub fn verify_rfc9421_signature(
    pubkey_hex: &str,
    method: &str,
    target_uri: &str,
    content_digest: &str,
    signature_input: &str,
    signature_header: &str,
) -> bool {
    (|| -> Option<()> {
        let params = signature_input.strip_prefix("sig1=")?;
        let sig_hex = signature_header.strip_prefix("sig1=:")?.strip_suffix(':')?;
        let pub_arr: [u8; 32] = hex::decode(pubkey_hex).ok()?.try_into().ok()?;
        let sig_arr: [u8; 64] = hex::decode(sig_hex).ok()?.try_into().ok()?;
        let vk = VerifyingKey::from_bytes(&pub_arr).ok()?;
        let base = format!(
            "\"@method\": {}\n\"@target-uri\": {target_uri}\n\"content-digest\": sha-256=:{content_digest}:\n\"@signature-params\": {params}",
            method.to_uppercase()
        );
        vk.verify_strict(base.as_bytes(), &Signature::from_bytes(&sig_arr)).ok()
    })()
    .is_some()
}

pub fn sign_mandate(mut m: KyaMandate) -> KyaMandate {
    let signing_key = derive_agent_signing_key(&m.agent_id);
    m.ed25519_pubkey_hex = hex::encode(signing_key.verifying_key().as_bytes());
    let digest = canonical_mandate_digest(&m);
    let sig: Signature = signing_key.sign(digest.as_bytes());
    m.ed25519_signature_hex = hex::encode(sig.to_bytes());
    m
}

pub async fn handle_sign_mandate(Json(m): Json<KyaMandate>) -> Json<KyaMandate> {
    Json(sign_mandate(m))
}

pub fn verify_mandate_rules(req: &VerifyMandateRequest) -> VerifyMandateResponse {
    let start = std::time::Instant::now();
    let digest = canonical_mandate_digest(&req.mandate);
    let reply = |valid: bool, step_up: bool, reason: &str| VerifyMandateResponse {
        valid,
        step_up_required: step_up,
        reason: reason.to_string(),
        canonical_digest_hex: digest.clone(),
        latency_us: start.elapsed().as_micros().max(1) as u64,
    };
    let sig_ok = (|| -> Option<()> {
        let pub_arr: [u8; 32] = hex::decode(&req.mandate.ed25519_pubkey_hex)
            .ok()?
            .try_into()
            .ok()?;
        let sig_arr: [u8; 64] = hex::decode(&req.mandate.ed25519_signature_hex)
            .ok()?
            .try_into()
            .ok()?;
        let vk = VerifyingKey::from_bytes(&pub_arr).ok()?;
        vk.verify_strict(digest.as_bytes(), &Signature::from_bytes(&sig_arr))
            .ok()
    })()
    .is_some();
    if !sig_ok {
        return reply(false, false, "MANDATE_SIGNATURE_INVALID");
    }
    if let (Some(sig_in), Some(sig_hdr)) = (&req.rfc9421_signature_input, &req.rfc9421_signature) {
        if !verify_rfc9421_signature(
            &req.mandate.ed25519_pubkey_hex,
            "POST",
            "https://api.talos.network/v1/mandates/verify",
            &digest,
            sig_in,
            sig_hdr,
        ) {
            return reply(false, false, "RFC9421_SIGNATURE_INVALID");
        }
    }
    if req.now_unix > req.mandate.expires_at_unix {
        return reply(false, false, "MANDATE_EXPIRED");
    }
    if !req.mandate.allowed_categories.is_empty()
        && !req
            .mandate
            .allowed_categories
            .iter()
            .any(|c| c.eq_ignore_ascii_case(&req.requested_category))
    {
        return reply(false, false, "CATEGORY_NOT_ALLOWED");
    }
    if req.channel3_spread_bps > req.mandate.max_channel3_spread_bps
        || req.channel3_spread_bps > 500
    {
        return reply(false, false, "SPREAD_EXCEEDS_MANDATE_CAP");
    }
    if req.requested_amount_cents > req.mandate.max_amount_cents {
        return reply(false, true, "AMOUNT_EXCEEDS_MANDATE_CAP_STEP_UP_REQUIRED");
    }
    reply(true, false, "KYA_MANDATE_VERIFIED")
}

pub async fn handle_verify_mandate(
    Json(req): Json<VerifyMandateRequest>,
) -> Json<VerifyMandateResponse> {
    Json(verify_mandate_rules(&req))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_signed_mandate() -> KyaMandate {
        sign_mandate(KyaMandate {
            mandate_id: "m-01".to_string(),
            principal_id: "p-01".to_string(),
            agent_id: "a-01".to_string(),
            max_amount_cents: 30_000,
            currency: "USD".to_string(),
            allowed_categories: vec!["hardware".to_string(), "electronics".to_string()],
            max_channel3_spread_bps: 500,
            sla_hours: 48,
            expires_at_unix: 2_000_000_000,
            ed25519_pubkey_hex: String::new(),
            ed25519_signature_hex: String::new(),
        })
    }

    #[test]
    fn enforces_ed25519_signature_tamper_expiry_category_and_cap() {
        let m = sample_signed_mandate();
        let digest = canonical_mandate_digest(&m);
        let sk = derive_agent_signing_key(&m.agent_id);
        let (sig_in, sig_hdr) = sign_rfc9421_headers(
            &sk,
            "POST",
            "https://api.talos.network/v1/mandates/verify",
            &digest,
            1_750_000_000,
            &m.agent_id,
        );
        let ok = verify_mandate_rules(&VerifyMandateRequest {
            mandate: m.clone(),
            requested_amount_cents: 25_000,
            requested_category: "hardware".to_string(),
            now_unix: 1_750_000_000,
            channel3_spread_bps: 300,
            rfc9421_signature_input: Some(sig_in),
            rfc9421_signature: Some(sig_hdr),
        });
        assert!(ok.valid && !ok.step_up_required && ok.latency_us < 1_000);
        let mut tampered = m.clone();
        tampered.max_amount_cents = 999_000;
        let bad_sig = verify_mandate_rules(&VerifyMandateRequest {
            mandate: tampered,
            requested_amount_cents: 25_000,
            requested_category: "hardware".to_string(),
            now_unix: 1_750_000_000,
            channel3_spread_bps: 0,
            rfc9421_signature_input: None,
            rfc9421_signature: None,
        });
        assert!(!bad_sig.valid && bad_sig.reason == "MANDATE_SIGNATURE_INVALID");
        let expired = verify_mandate_rules(&VerifyMandateRequest {
            mandate: m.clone(),
            requested_amount_cents: 10_000,
            requested_category: "hardware".to_string(),
            now_unix: 2_100_000_000,
            channel3_spread_bps: 0,
            rfc9421_signature_input: None,
            rfc9421_signature: None,
        });
        assert!(!expired.valid && expired.reason == "MANDATE_EXPIRED");
        let bad_cat = verify_mandate_rules(&VerifyMandateRequest {
            mandate: m.clone(),
            requested_amount_cents: 10_000,
            requested_category: "jewelry".to_string(),
            now_unix: 1_750_000_000,
            channel3_spread_bps: 0,
            rfc9421_signature_input: None,
            rfc9421_signature: None,
        });
        assert!(!bad_cat.valid && bad_cat.reason == "CATEGORY_NOT_ALLOWED");
        let over_cap = verify_mandate_rules(&VerifyMandateRequest {
            mandate: m,
            requested_amount_cents: 45_000,
            requested_category: "hardware".to_string(),
            now_unix: 1_750_000_000,
            channel3_spread_bps: 0,
            rfc9421_signature_input: None,
            rfc9421_signature: None,
        });
        assert!(!over_cap.valid && over_cap.step_up_required);
    }
}
