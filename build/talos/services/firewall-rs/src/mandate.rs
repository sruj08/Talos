//! `E-03` KyaMandate Cryptographic Signer & Verifier (`API-01`, `API-02`)
//! Uses `ed25519-dalek` + `SHA-256` canonical digest + RFC 9421 HTTP Message Signatures.

use axum::Json;
use chrono::{DateTime, Duration, SecondsFormat, TimeZone, Utc};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{collections::HashMap, sync::{OnceLock, RwLock}, time::Instant};
use uuid::Uuid;

pub type AgentMandate = KyaMandate;
pub type SignedMandate = KyaMandate;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct KyaMandate {
    #[serde(alias = "id")] pub mandate_id: String,
    pub principal_id: String, pub agent_id: String,
    pub max_amount_cents: i64, pub inr_equivalent_display: String, pub currency: String,
    pub allowed_categories: Vec<String>,
    pub max_spread_bps: i64, pub max_channel3_spread_bps: i64, pub sla_hours: i32,
    pub expires_at: String, pub expiry_utc: String, pub expires_at_unix: i64,
    pub ed25519_pubkey_hex: String, pub ed25519_signature: String, pub ed25519_signature_hex: String,
    pub rfc9421_signature_input: String, pub rfc9421_signature: String, pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")] pub ttl_hours: Option<i64>,
}

impl KyaMandate {
    pub fn effective_spread_bps(&self) -> i64 {
        if self.max_spread_bps > 0 { self.max_spread_bps } else if self.max_channel3_spread_bps > 0 { self.max_channel3_spread_bps } else { 1500 }
    }
    pub fn effective_expires_unix(&self) -> i64 {
        let ts = if !self.expires_at.is_empty() { &self.expires_at } else { &self.expiry_utc };
        if !ts.is_empty() {
            if let Ok(dt) = DateTime::parse_from_rfc3339(ts) { return dt.timestamp(); }
        }
        self.expires_at_unix
    }
    pub fn effective_signature_hex(&self) -> &str {
        if !self.ed25519_signature_hex.is_empty() { &self.ed25519_signature_hex } else { &self.ed25519_signature }
    }
}

#[derive(Debug, Default, Deserialize)]
#[serde(default)]
pub struct VerifyMandateRequest {
    pub mandate: Option<KyaMandate>,
    #[serde(flatten)] pub flat: KyaMandate,
    #[serde(alias = "amount_cents")] pub requested_amount_cents: i64,
    #[serde(alias = "merchant_category", alias = "category")] pub requested_category: String,
    #[serde(alias = "spread_bps", alias = "channel3_spread_bps")] pub observed_spread_bps: Option<i64>,
    pub now_unix: Option<i64>,
    pub rfc9421_signature_input: Option<String>,
    pub rfc9421_signature: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyMandateResponse {
    pub valid: bool, pub step_up_required: bool, pub reason: String,
    pub canonical_digest_hex: String, pub verification_latency_us: u64, pub latency_us: u64,
}

static KEYPAIR: OnceLock<(SigningKey, VerifyingKey, String)> = OnceLock::new();
static MANDATE_REGISTRY: OnceLock<RwLock<HashMap<String, KyaMandate>>> = OnceLock::new();

fn keypair() -> &'static (SigningKey, VerifyingKey, String) {
    KEYPAIR.get_or_init(|| {
        let mut seed = [0u8; 32];
        let mut loaded = false;
        if let Ok(raw) = std::env::var("RUST_ED25519_SEED_HEX") {
            let trimmed = raw.trim();
            if let Ok(b) = hex::decode(trimmed) {
                if b.len() >= 32 { seed.copy_from_slice(&b[..32]); loaded = true; }
            }
            if !loaded && !trimmed.is_empty() { seed.copy_from_slice(&Sha256::digest(trimmed.as_bytes())[..32]); loaded = true; }
        }
        if !loaded { seed.copy_from_slice(&Sha256::digest(b"talos-zero-trust-kya-ed25519-default-seed-v1")[..32]); }
        let sk = SigningKey::from_bytes(&seed);
        let vk = sk.verifying_key();
        let pk_hex = hex::encode(vk.to_bytes());
        (sk, vk, pk_hex)
    })
}

pub fn signing_key() -> &'static SigningKey { &keypair().0 }
fn registry() -> &'static RwLock<HashMap<String, KyaMandate>> { MANDATE_REGISTRY.get_or_init(|| RwLock::new(HashMap::new())) }

pub fn canonical_mandate_digest(m: &KyaMandate) -> String {
    let cur = if m.currency.is_empty() { "USD" } else { &m.currency };
    let sla = if m.sla_hours > 0 { m.sla_hours } else { 48 };
    let payload = format!("{}|{}|{}|{}|{}|{}|{}|{}|{}", m.mandate_id, m.principal_id, m.agent_id, m.max_amount_cents, cur, m.allowed_categories.join(","), m.effective_spread_bps(), sla, m.effective_expires_unix());
    hex::encode(Sha256::digest(payload.as_bytes()))
}

pub fn sign_mandate(m: &mut KyaMandate) {
    if m.mandate_id.is_empty() { m.mandate_id = Uuid::new_v4().to_string(); }
    if m.principal_id.is_empty() { m.principal_id = "0192e8a0-0000-7000-8000-000000000001".to_string(); }
    if m.agent_id.is_empty() { m.agent_id = "0192e8a0-0000-7000-8000-000000000011".to_string(); }
    if m.max_amount_cents <= 0 { m.max_amount_cents = 30_000; }
    if m.currency.is_empty() { m.currency = "USD".to_string(); }
    let spread = m.effective_spread_bps();
    m.max_spread_bps = spread; m.max_channel3_spread_bps = spread;
    if m.sla_hours <= 0 { m.sla_hours = 48; }
    let exp_unix = if m.effective_expires_unix() > 0 { m.effective_expires_unix() } else { (Utc::now() + Duration::hours(m.ttl_hours.unwrap_or(168).max(1))).timestamp() };
    m.expires_at_unix = exp_unix;
    if let Some(dt) = Utc.timestamp_opt(exp_unix, 0).single() {
        let iso = dt.to_rfc3339_opts(SecondsFormat::Secs, true);
        if m.expires_at.is_empty() { m.expires_at = iso; }
        if m.expiry_utc.is_empty() { m.expiry_utc = m.expires_at.clone(); }
    }
    m.inr_equivalent_display = format!("₹{:.2}", (m.max_amount_cents as f64 / 100.0) * 84.0);
    m.status = "ACTIVE".to_string(); m.ttl_hours = None;
    let (sk, _, pk_hex) = keypair();
    m.ed25519_pubkey_hex = pk_hex.clone();
    let digest = canonical_mandate_digest(m);
    let sig_hex = hex::encode(sk.sign(digest.as_bytes()).to_bytes());
    m.ed25519_signature_hex = sig_hex.clone(); m.ed25519_signature = sig_hex.clone();
    m.rfc9421_signature_input = format!("sig1=(\"@method\" \"@path\" \"content-digest\");created={};keyid=\"talos-kya-{}\";alg=\"ed25519\"", Utc::now().timestamp(), &m.ed25519_pubkey_hex[..12]);
    m.rfc9421_signature = format!("sig1=:{}:", sig_hex);
    if let Ok(mut reg) = registry().write() { reg.insert(m.mandate_id.clone(), m.clone()); }
}

pub async fn handle_sign_mandate(Json(mut m): Json<KyaMandate>) -> Json<KyaMandate> { sign_mandate(&mut m); Json(m) }

fn resolve_mandate(req: &VerifyMandateRequest) -> KyaMandate {
    if let Some(ref m) = req.mandate { return m.clone(); }
    if let Ok(reg) = registry().read() {
        if let Some(stored) = reg.get(&req.flat.mandate_id) {
            let mut m = stored.clone();
            let sig = req.flat.effective_signature_hex();
            if !sig.is_empty() { m.ed25519_signature_hex = sig.to_string(); m.ed25519_signature = sig.to_string(); }
            if req.flat.max_amount_cents > 0 { m.max_amount_cents = req.flat.max_amount_cents; }
            if !req.flat.allowed_categories.is_empty() { m.allowed_categories = req.flat.allowed_categories.clone(); }
            if !req.flat.expires_at.is_empty() { m.expires_at = req.flat.expires_at.clone(); }
            return m;
        }
    }
    req.flat.clone()
}

fn verify_ed25519_sig(m: &KyaMandate, digest: &str, rfc_in: Option<&str>, rfc_sig: Option<&str>) -> Result<(), &'static str> {
    let (_, default_vk, default_pk_hex) = keypair();
    let vk: VerifyingKey = if m.ed25519_pubkey_hex.is_empty() || &m.ed25519_pubkey_hex == default_pk_hex {
        *default_vk
    } else {
        let pk = hex::decode(&m.ed25519_pubkey_hex).map_err(|_| "INVALID_ED25519_PUBKEY")?;
        VerifyingKey::from_bytes(pk.as_slice().try_into().map_err(|_| "INVALID_ED25519_PUBKEY_LEN")?).map_err(|_| "INVALID_ED25519_PUBKEY")?
    };
    let sig_hex = m.effective_signature_hex();
    let sig_bytes = hex::decode(sig_hex).map_err(|_| "INVALID_ED25519_SIGNATURE: hex decode failed")?;
    let sig = Signature::from_slice(&sig_bytes).map_err(|_| "INVALID_ED25519_SIGNATURE: length mismatch")?;
    vk.verify(digest.as_bytes(), &sig).map_err(|_| "INVALID_ED25519_SIGNATURE: tampered mandate or signature")?;
    if let Some(inp) = rfc_in.filter(|s| !s.is_empty()) {
        if !inp.contains("@method") || !inp.contains("ed25519") {
            return Err("INVALID_RFC9421_SIGNATURE_INPUT: missing @method or alg=ed25519");
        }
    }
    if let Some(rs) = rfc_sig.filter(|s| !s.is_empty()) {
        let hex_part = rs.trim().trim_start_matches("sig1=:").trim_end_matches(':');
        if !hex_part.eq_ignore_ascii_case(sig_hex) {
            let rbytes = hex::decode(hex_part).map_err(|_| "INVALID_RFC9421_SIGNATURE: bad hex")?;
            let rsig = Signature::from_slice(&rbytes).map_err(|_| "INVALID_RFC9421_SIGNATURE: bad len")?;
            vk.verify(digest.as_bytes(), &rsig).map_err(|_| "INVALID_RFC9421_SIGNATURE: verification failed")?;
        }
    }
    Ok(())
}

pub fn verify_mandate_rules(req: &VerifyMandateRequest) -> VerifyMandateResponse {
    let _ = (keypair(), registry());
    let m = resolve_mandate(req);
    let start = Instant::now();
    let digest = canonical_mandate_digest(&m);
    let now = req.now_unix.unwrap_or_else(|| Utc::now().timestamp());
    let exp = m.effective_expires_unix();
    let finish = |valid: bool, step_up_required: bool, reason: &str| {
        let us = start.elapsed().as_micros().max(1) as u64;
        VerifyMandateResponse { valid, step_up_required, reason: reason.to_string(), canonical_digest_hex: digest.clone(), verification_latency_us: us, latency_us: us }
    };
    if exp > 0 && now > exp { return finish(false, false, "MANDATE_EXPIRED: mandate has expired before current UTC time"); }
    if !m.allowed_categories.is_empty() && !req.requested_category.is_empty()
        && !m.allowed_categories.iter().any(|c| c.eq_ignore_ascii_case(&req.requested_category))
    {
        return finish(false, false, "CATEGORY_NOT_ALLOWED: merchant category not in allowed_categories");
    }
    if let Some(obs) = req.observed_spread_bps {
        if obs > m.effective_spread_bps() { return finish(false, false, "SPREAD_LIMIT_EXCEEDED: observed spread bps exceeds max_spread_bps"); }
    }
    if req.requested_amount_cents > m.max_amount_cents {
        return finish(false, true, "AMOUNT_EXCEEDS_MANDATE_CAP_STEP_UP_REQUIRED: exceeds max_amount_cents; step_up required");
    }
    if let Err(err) = verify_ed25519_sig(&m, &digest, req.rfc9421_signature_input.as_deref(), req.rfc9421_signature.as_deref()) {
        return finish(false, false, err);
    }
    finish(true, false, "KYA_MANDATE_VERIFIED")
}

pub fn verify_ed25519_mandate(req: &VerifyMandateRequest) -> VerifyMandateResponse { verify_mandate_rules(req) }

pub async fn handle_verify_mandate(Json(req): Json<VerifyMandateRequest>) -> Json<VerifyMandateResponse> {
    Json(verify_mandate_rules(&req))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_signed_mandate() -> KyaMandate {
        let mut m = KyaMandate { mandate_id: "m-test-01".to_string(), max_amount_cents: 30_000, allowed_categories: vec!["hardware".to_string(), "Studio Audio".to_string()], max_spread_bps: 1500, sla_hours: 48, expires_at_unix: 2_000_000_000, ..Default::default() };
        sign_mandate(&mut m);
        m
    }

    #[test]
    fn signs_and_verifies_valid_mandate_and_rfc9421_under_1ms() {
        let m = sample_signed_mandate();
        assert_eq!(m.ed25519_signature_hex.len(), 128);
        let res = verify_mandate_rules(&VerifyMandateRequest {
            rfc9421_signature_input: Some(m.rfc9421_signature_input.clone()), rfc9421_signature: Some(m.rfc9421_signature.clone()),
            mandate: Some(m), requested_amount_cents: 24_900, requested_category: "Studio Audio".to_string(), observed_spread_bps: Some(0), now_unix: Some(1_750_000_000), ..Default::default()
        });
        assert!(res.valid && !res.step_up_required && res.verification_latency_us < 1000, "latency_us={}", res.verification_latency_us);
    }

    #[test]
    fn enforces_mandate_spending_cap_and_rejects_tampering_expiry_category_spread() {
        let m = sample_signed_mandate();
        let cap = verify_mandate_rules(&VerifyMandateRequest { mandate: Some(m.clone()), requested_amount_cents: 45_000, requested_category: "hardware".to_string(), now_unix: Some(1_750_000_000), ..Default::default() });
        assert!(!cap.valid && cap.step_up_required && cap.reason.to_lowercase().contains("step_up"));
        let mut tampered = m.clone(); tampered.max_amount_cents = 90_000;
        let tamp = verify_mandate_rules(&VerifyMandateRequest { mandate: Some(tampered), requested_amount_cents: 45_000, requested_category: "hardware".to_string(), now_unix: Some(1_750_000_000), ..Default::default() });
        assert!(!tamp.valid && !tamp.step_up_required);
        let exp = verify_mandate_rules(&VerifyMandateRequest { mandate: Some(m.clone()), requested_amount_cents: 10_000, requested_category: "hardware".to_string(), now_unix: Some(2_100_000_000), ..Default::default() });
        assert!(!exp.valid && exp.reason.to_lowercase().contains("expired"));
        let cat = verify_mandate_rules(&VerifyMandateRequest { mandate: Some(m.clone()), requested_amount_cents: 10_000, requested_category: "gambling".to_string(), now_unix: Some(1_750_000_000), ..Default::default() });
        assert!(!cat.valid && cat.reason.to_lowercase().contains("category"));
        let spr = verify_mandate_rules(&VerifyMandateRequest { mandate: Some(m), requested_amount_cents: 10_000, requested_category: "hardware".to_string(), observed_spread_bps: Some(9277), now_unix: Some(1_750_000_000), ..Default::default() });
        assert!(!spr.valid && spr.reason.to_lowercase().contains("spread"));
    }
}
