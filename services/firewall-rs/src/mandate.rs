//! `E-03` KyaMandate Cryptographic Signer & Verifier (`API-01`, `API-02`)
//! Uses `ed25519-dalek` + RFC 8785 JCS `SHA-256` canonical digest + RFC 9421 Web Bot Auth headers.

use axum::Json;
use chrono::{TimeZone, Utc};
use ed25519_dalek::{Signature, Signer, SigningKey, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::HashMap,
    sync::{Mutex, OnceLock},
};
use uuid::Uuid;

#[rustfmt::skip]
mod defaults {
    use super::*;
    pub fn id() -> String { format!("mnd_{}", Uuid::new_v4()) }
    pub fn usd() -> String { "USD".to_string() }
    pub fn spread() -> i64 { 500 }
    pub fn sla() -> i32 { 72 }
    pub fn exp() -> i64 { Utc::now().timestamp() + 86_400 }
    pub fn now() -> i64 { Utc::now().timestamp() }
}

fn mandate_registry() -> &'static Mutex<HashMap<String, KyaMandate>> {
    static REG: OnceLock<Mutex<HashMap<String, KyaMandate>>> = OnceLock::new();
    REG.get_or_init(|| Mutex::new(HashMap::new()))
}

#[rustfmt::skip]
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct KyaMandate {
    #[serde(default = "defaults::id")] pub mandate_id: String,
    #[serde(default)] pub principal_id: String,
    #[serde(default)] pub agent_id: String,
    #[serde(default)] pub max_amount_cents: i64,
    #[serde(default = "defaults::usd")] pub currency: String,
    #[serde(default)] pub allowed_categories: Vec<String>,
    #[serde(default = "defaults::spread")] pub max_channel3_spread_bps: i64,
    #[serde(default)] pub max_spread_bps: i64,
    #[serde(default = "defaults::sla")] pub sla_hours: i32,
    #[serde(default)] pub ttl_hours: Option<i64>,
    #[serde(default = "defaults::exp")] pub expires_at_unix: i64,
    #[serde(default)] pub expires_at: String,
    #[serde(default)] pub ed25519_pubkey_hex: String,
    #[serde(default)] pub ed25519_signature_hex: String,
    #[serde(default)] pub ed25519_signature: String,
}

#[rustfmt::skip]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyMandateRequest {
    #[serde(default)] pub mandate: KyaMandate,
    #[serde(default)] pub mandate_id: Option<String>,
    #[serde(default)] pub ed25519_signature: Option<String>,
    pub requested_amount_cents: i64,
    #[serde(alias = "merchant_category")] pub requested_category: String,
    #[serde(default = "defaults::now")] pub now_unix: i64,
    #[serde(default)] pub channel3_spread_bps: i64,
    #[serde(default)] pub rfc9421_signature_input: Option<String>,
    #[serde(default)] pub rfc9421_signature: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyMandateResponse {
    pub valid: bool,
    pub step_up_required: bool,
    pub reason: String,
    pub canonical_digest_hex: String,
    pub latency_us: u64,
    pub verification_latency_us: u64,
}

pub fn derive_agent_signing_key(agent_id: &str) -> SigningKey {
    let mut hasher = Sha256::new();
    hasher.update(b"TALOS_KYA_ED25519_V1:");
    hasher.update(agent_id.as_bytes());
    SigningKey::from_bytes(&hasher.finalize().into())
}

pub fn canonical_mandate_digest(m: &KyaMandate) -> String {
    let mut cats = m.allowed_categories.clone();
    cats.sort();
    let canonical = serde_json::json!({
        "agent_id": m.agent_id, "allowed_categories": cats, "currency": m.currency,
        "ed25519_pubkey_hex": m.ed25519_pubkey_hex, "expires_at_unix": m.expires_at_unix,
        "mandate_id": m.mandate_id, "max_amount_cents": m.max_amount_cents,
        "max_channel3_spread_bps": m.max_channel3_spread_bps, "principal_id": m.principal_id,
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

#[rustfmt::skip]
pub fn sign_rfc9421_headers(
    signing_key: &SigningKey, method: &str, target_uri: &str, content_digest: &str, created: i64, key_id: &str,
) -> (String, String) {
    let params = format!("(\"@method\" \"@target-uri\" \"content-digest\");created={created};keyid=\"{key_id}\";alg=\"ed25519\"");
    let base = format!("\"@method\": {}\n\"@target-uri\": {target_uri}\n\"content-digest\": sha-256=:{content_digest}:\n\"@signature-params\": {params}", method.to_uppercase());
    let sig: Signature = signing_key.sign(base.as_bytes());
    (format!("sig1={params}"), format!("sig1=:{}:", hex::encode(sig.to_bytes())))
}

#[rustfmt::skip]
pub fn verify_rfc9421_signature(
    pubkey_hex: &str, method: &str, target_uri: &str, content_digest: &str, signature_input: &str, signature_header: &str,
) -> bool {
    (|| -> Option<()> {
        let params = signature_input.strip_prefix("sig1=")?;
        let sig_hex = signature_header.strip_prefix("sig1=:")?.strip_suffix(':')?;
        let pub_arr: [u8; 32] = hex::decode(pubkey_hex).ok()?.try_into().ok()?;
        let sig_arr: [u8; 64] = hex::decode(sig_hex).ok()?.try_into().ok()?;
        let vk = VerifyingKey::from_bytes(&pub_arr).ok()?;
        let base = format!("\"@method\": {}\n\"@target-uri\": {target_uri}\n\"content-digest\": sha-256=:{content_digest}:\n\"@signature-params\": {params}", method.to_uppercase());
        vk.verify_strict(base.as_bytes(), &Signature::from_bytes(&sig_arr)).ok()
    })().is_some()
}

#[rustfmt::skip]
pub fn sign_mandate(mut m: KyaMandate) -> KyaMandate {
    if let Some(ttl) = m.ttl_hours.filter(|&h| h > 0) { m.expires_at_unix = Utc::now().timestamp() + ttl * 3600; }
    if m.max_spread_bps > 0 && m.max_channel3_spread_bps == 500 { m.max_channel3_spread_bps = m.max_spread_bps; }
    m.max_spread_bps = m.max_channel3_spread_bps;
    m.expires_at = Utc.timestamp_opt(m.expires_at_unix, 0).single().map(|dt| dt.to_rfc3339()).unwrap_or_default();
    let signing_key = derive_agent_signing_key(&m.agent_id);
    m.ed25519_pubkey_hex = hex::encode(signing_key.verifying_key().as_bytes());
    let digest = canonical_mandate_digest(&m);
    let sig: Signature = signing_key.sign(digest.as_bytes());
    m.ed25519_signature_hex = hex::encode(sig.to_bytes());
    m.ed25519_signature = m.ed25519_signature_hex.clone();
    if let Ok(mut reg) = mandate_registry().lock() { reg.insert(m.mandate_id.clone(), m.clone()); }
    m
}

pub async fn handle_sign_mandate(Json(m): Json<KyaMandate>) -> Json<KyaMandate> {
    Json(sign_mandate(m))
}

#[rustfmt::skip]
pub fn verify_mandate_rules(req: &VerifyMandateRequest) -> VerifyMandateResponse {
    let start = std::time::Instant::now();
    let mut m = req.mandate.clone();
    if m.agent_id.is_empty() {
        if let Some(id) = &req.mandate_id {
            if let Some(cached) = mandate_registry().lock().ok().and_then(|r| r.get(id).cloned()) { m = cached; }
        }
    }
    if let Some(sig_override) = &req.ed25519_signature {
        m.ed25519_signature_hex = sig_override.clone();
    } else if m.ed25519_signature_hex.is_empty() && !m.ed25519_signature.is_empty() {
        m.ed25519_signature_hex = m.ed25519_signature.clone();
    }
    let digest = canonical_mandate_digest(&m);
    let reply = |valid: bool, step_up: bool, reason: &str| {
        let us = start.elapsed().as_micros().max(1) as u64;
        VerifyMandateResponse {
            valid, step_up_required: step_up, reason: reason.to_string(),
            canonical_digest_hex: digest.clone(), latency_us: us, verification_latency_us: us,
        }
    };
    let sig_ok = (|| -> Option<()> {
        let pub_b = hex::decode(&m.ed25519_pubkey_hex).ok()?;
        let sig_b = hex::decode(&m.ed25519_signature_hex).ok()?;
        let vk = VerifyingKey::from_bytes(&pub_b.try_into().ok()?).ok()?;
        let sig = Signature::from_bytes(&sig_b.try_into().ok()?);
        vk.verify_strict(digest.as_bytes(), &sig).ok()
    })().is_some();
    if !sig_ok { return reply(false, false, "MANDATE_SIGNATURE_INVALID"); }
    if req.rfc9421_signature_input.is_some() != req.rfc9421_signature.is_some() {
        return reply(false, false, "RFC9421_SIGNATURE_INVALID");
    }
    if let (Some(s_in), Some(s_hdr)) = (&req.rfc9421_signature_input, &req.rfc9421_signature) {
        let uri = "https://api.talos.network/v1/mandates/verify";
        if !verify_rfc9421_signature(&m.ed25519_pubkey_hex, "POST", uri, &digest, s_in, s_hdr) {
            return reply(false, false, "RFC9421_SIGNATURE_INVALID");
        }
    }
    if req.requested_amount_cents <= 0 || m.max_amount_cents <= 0 {
        return reply(false, false, "INVALID_AMOUNT_CENTS");
    }
    if req.now_unix > m.expires_at_unix { return reply(false, false, "MANDATE_EXPIRED"); }
    let cat_ok = m.allowed_categories.is_empty()
        || m.allowed_categories.iter().any(|c| c.eq_ignore_ascii_case(&req.requested_category));
    if !cat_ok { return reply(false, false, "CATEGORY_NOT_ALLOWED"); }
    if req.channel3_spread_bps < 0 || req.channel3_spread_bps > m.max_channel3_spread_bps {
        return reply(false, false, "SPREAD_EXCEEDS_MANDATE_CAP");
    }
    if req.requested_amount_cents > m.max_amount_cents {
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
#[rustfmt::skip]
mod tests {
    use super::*;

    #[test]
    fn enforces_ed25519_signature_tamper_expiry_category_and_cap() {
        let m: KyaMandate = serde_json::from_value(serde_json::json!({
            "mandate_id": "m-01", "principal_id": "p-01", "agent_id": "a-01",
            "max_amount_cents": 30_000, "allowed_categories": ["hardware", "electronics"],
            "max_channel3_spread_bps": 1000, "sla_hours": 48, "expires_at_unix": 2_000_000_000
        })).unwrap();
        let m = sign_mandate(m);
        let digest = canonical_mandate_digest(&m);
        let sk = derive_agent_signing_key(&m.agent_id);
        let uri = "https://api.talos.network/v1/mandates/verify";
        let (sig_in, sig_hdr) = sign_rfc9421_headers(&sk, "POST", uri, &digest, 1_750_000_000, &m.agent_id);
        let check = |mandate: KyaMandate, amt: i64, cat: &str, now: i64, spread: i64, s_in: Option<String>, s_hdr: Option<String>| {
            verify_mandate_rules(&VerifyMandateRequest {
                mandate, mandate_id: None, ed25519_signature: None, requested_amount_cents: amt,
                requested_category: cat.to_string(), now_unix: now, channel3_spread_bps: spread,
                rfc9421_signature_input: s_in, rfc9421_signature: s_hdr,
            })
        };
        let ok = check(m.clone(), 25_000, "hardware", 1_750_000_000, 600, Some(sig_in.clone()), Some(sig_hdr));
        assert!(ok.valid && !ok.step_up_required && ok.latency_us < 1_000 && ok.verification_latency_us < 1_000);
        assert_eq!(check(m.clone(), 25_000, "hardware", 1_750_000_000, 300, Some(sig_in), None).reason, "RFC9421_SIGNATURE_INVALID");
        assert_eq!(check(m.clone(), 0, "hardware", 1_750_000_000, 300, None, None).reason, "INVALID_AMOUNT_CENTS");
        let mut tampered = m.clone();
        tampered.max_amount_cents = 999_000;
        assert_eq!(check(tampered, 25_000, "hardware", 1_750_000_000, 300, None, None).reason, "MANDATE_SIGNATURE_INVALID");
        assert_eq!(check(m.clone(), 10_000, "hardware", 2_100_000_000, 300, None, None).reason, "MANDATE_EXPIRED");
        assert_eq!(check(m.clone(), 10_000, "jewelry", 1_750_000_000, 300, None, None).reason, "CATEGORY_NOT_ALLOWED");
        let over = check(m, 45_000, "hardware", 1_750_000_000, 300, None, None);
        assert!(!over.valid && over.step_up_required);
    }
}
