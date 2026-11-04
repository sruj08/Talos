//! OpenTelemetry W3C `traceparent` propagation & Elastic APM span recorder (`services/firewall-rs/src/otel.rs`)
//! Captures `talos.mandate.id`, `talos.firewall.risk_score`, `talos.channel3.spread_bps`, `paypal.order_id`, and `paypal.auth_id`.

use axum::{
    body::Body,
    http::{HeaderValue, Request, Response},
    middleware::Next,
    Json,
};
use chrono::{SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::VecDeque,
    sync::{OnceLock, RwLock},
    time::Instant,
};
use uuid::Uuid;

const MAX_RECENT_SPANS: usize = 64;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OtelSpanRecord {
    pub trace_id: String,
    pub span_id: String,
    pub parent_span_id: String,
    pub traceparent: String,
    pub span_name: String,
    pub service_name: String,
    pub timestamp: String,
    pub duration_us: u64,
    pub attributes: Value,
}

static SPAN_BUFFER: OnceLock<RwLock<VecDeque<OtelSpanRecord>>> = OnceLock::new();

fn span_buffer() -> &'static RwLock<VecDeque<OtelSpanRecord>> {
    SPAN_BUFFER.get_or_init(|| RwLock::new(VecDeque::with_capacity(MAX_RECENT_SPANS)))
}

pub fn parse_or_generate_traceparent(raw: Option<&str>) -> (String, String, String, String) {
    let child_hash = hex::encode(Sha256::digest(Uuid::new_v4().as_bytes()));
    let span_id = child_hash[..16].to_string();
    if let Some(h) = raw.map(str::trim).filter(|s| !s.is_empty()) {
        let parts: Vec<&str> = h.split('-').collect();
        if parts.len() == 4
            && parts[0] == "00"
            && parts[1].len() == 32
            && parts[1].chars().all(|c| c.is_ascii_hexdigit())
            && parts[2].len() == 16
            && parts[2].chars().all(|c| c.is_ascii_hexdigit())
        {
            let trace_id = parts[1].to_ascii_lowercase();
            let parent_id = parts[2].to_ascii_lowercase();
            let tp = format!("00-{}-{}-01", trace_id, span_id);
            return (trace_id, span_id, parent_id, tp);
        }
    }
    let trace_id = child_hash[..32].to_string();
    let parent_id = "0000000000000000".to_string();
    let tp = format!("00-{}-{}-01", trace_id, span_id);
    (trace_id, span_id, parent_id, tp)
}

pub fn push_span(record: OtelSpanRecord) {
    tracing::info!(
        target: "talos.elastic.otel",
        trace_id = %record.trace_id,
        span_id = %record.span_id,
        span_name = %record.span_name,
        duration_us = record.duration_us,
        attributes = %record.attributes,
        "exported OTel span"
    );
    if let Ok(mut buf) = span_buffer().write() {
        if buf.len() >= MAX_RECENT_SPANS {
            buf.pop_front();
        }
        buf.push_back(record);
    }
}

pub fn record_mandate_verify_span(traceparent: Option<&str>, mandate_id: &str, verified: bool, key_id: &str, spread_bps: i64, latency_us: u64) -> OtelSpanRecord {
    let (trace_id, span_id, parent_span_id, tp) = parse_or_generate_traceparent(traceparent);
    let rec = OtelSpanRecord {
        trace_id,
        span_id,
        parent_span_id,
        traceparent: tp,
        span_name: "rust_firewall.verify_mandate".to_string(),
        service_name: "talos-firewall-rs".to_string(),
        timestamp: Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
        duration_us: latency_us,
        attributes: json!({
            "talos.mandate.id": mandate_id,
            "talos.firewall.risk_score": if verified { 0.0 } else { 1.0 },
            "talos.channel3.spread_bps": spread_bps,
            "paypal.order_id": "",
            "paypal.auth_id": "",
            "kya.ed25519.verified": verified,
            "kya.rfc9421.key_id": key_id,
            "kya.latency_us": latency_us
        }),
    };
    push_span(rec.clone());
    rec
}

pub fn record_dom_sanitize_span(traceparent: Option<&str>, mandate_id: &str, stripped_nodes: usize, risk_score: f64, verdict: &str, latency_us: u64) -> OtelSpanRecord {
    let (trace_id, span_id, parent_span_id, tp) = parse_or_generate_traceparent(traceparent);
    let rec = OtelSpanRecord {
        trace_id,
        span_id,
        parent_span_id,
        traceparent: tp,
        span_name: "rust_firewall.sanitize_dom".to_string(),
        service_name: "talos-firewall-rs".to_string(),
        timestamp: Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
        duration_us: latency_us,
        attributes: json!({
            "talos.mandate.id": mandate_id,
            "talos.firewall.risk_score": risk_score,
            "talos.channel3.spread_bps": 0,
            "paypal.order_id": "",
            "paypal.auth_id": "",
            "dom.lol_html.stripped_nodes": stripped_nodes,
            "dom.deberta.risk_score": risk_score,
            "dom.verdict": verdict,
            "dom.latency_us": latency_us
        }),
    };
    push_span(rec.clone());
    rec
}

pub fn recent_spans() -> Vec<OtelSpanRecord> {
    span_buffer().read().map(|b| b.iter().cloned().collect()).unwrap_or_default()
}

pub async fn handle_get_spans() -> Json<Value> {
    let spans = recent_spans();
    Json(json!({
        "service": "talos-firewall-rs",
        "otel_exporter": "elastic-otlp+ring-buffer",
        "count": spans.len(),
        "spans": spans
    }))
}

pub async fn otel_trace_middleware(req: Request<Body>, next: Next) -> Response<Body> {
    let start = Instant::now();
    let incoming_tp = req.headers().get("traceparent").and_then(|v| v.to_str().ok()).map(str::to_string);
    let path = req.uri().path().to_string();
    let (trace_id, span_id, parent_span_id, tp) = parse_or_generate_traceparent(incoming_tp.as_deref());
    let mut resp = next.run(req).await;
    let duration_us = start.elapsed().as_micros().max(1) as u64;
    if let Ok(hv) = HeaderValue::from_str(&tp) {
        resp.headers_mut().insert("traceparent", hv);
    }
    if let Ok(hv) = HeaderValue::from_str(&trace_id) {
        resp.headers_mut().insert("x-talos-trace-id", hv);
    }
    push_span(OtelSpanRecord {
        trace_id,
        span_id,
        parent_span_id,
        traceparent: tp,
        span_name: format!("HTTP {}", path),
        service_name: "talos-firewall-rs".to_string(),
        timestamp: Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
        duration_us,
        attributes: json!({
            "http.route": path,
            "http.status_code": resp.status().as_u16()
        }),
    });
    resp
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_traceparent_parse_and_span_recording() {
        let incoming = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
        let (trace_id, span_id, parent_id, tp) = parse_or_generate_traceparent(Some(incoming));
        assert_eq!(trace_id, "4bf92f3577b34da6a3ce929d0e0e4736");
        assert_eq!(parent_id, "00f067aa0ba902b7");
        assert_eq!(span_id.len(), 16);
        assert!(tp.starts_with("00-4bf92f3577b34da6a3ce929d0e0e4736-"));

        let s = record_dom_sanitize_span(Some(incoming), "mnd-otel-01", 3, 0.9942, "BLOCKED", 1850);
        assert_eq!(s.trace_id, "4bf92f3577b34da6a3ce929d0e0e4736");
        assert_eq!(s.parent_span_id, "00f067aa0ba902b7");
        assert_eq!(s.attributes["talos.mandate.id"], "mnd-otel-01");
        assert_eq!(s.attributes["dom.lol_html.stripped_nodes"], 3);
    }
}
