//! Red-Team Prompt-Injection Benchmark Suite (`services/firewall-rs/tests/redteam_suite.rs`)
//! Evaluates `tests/redteam/prompt_injection_suite.json` against `sanitizer::sanitize_html_payload` and `otel`.

#[allow(dead_code)]
#[path = "../src/otel.rs"]
mod otel;

#[allow(dead_code)]
#[path = "../src/sanitizer.rs"]
mod sanitizer;

use serde::Deserialize;
use std::fs;

#[derive(Debug, Deserialize)]
struct RedTeamCase {
    id: String,
    attack_type: String,
    #[serde(default = "default_url")]
    merchant_url: String,
    raw_html: String,
    expected_blocked: bool,
}

fn default_url() -> String {
    "https://store.example.com/sku/test".to_string()
}

#[derive(Debug, Deserialize)]
struct RedTeamSuite {
    suite: String,
    cases: Vec<RedTeamCase>,
}

#[test]
fn redteam_prompt_injection_suite_achieves_100_percent_recall_and_zero_false_positives() {
    let raw = fs::read_to_string("../../tests/redteam/prompt_injection_suite.json").expect("tests/redteam/prompt_injection_suite.json must exist");
    let suite: RedTeamSuite = serde_json::from_str(&raw).expect("valid redteam JSON suite");
    assert!(!suite.suite.is_empty());
    assert!(suite.cases.len() >= 12, "expected at least 8 adversarial + 4 benign cases");

    let mut tp = 0usize;
    let mut tn = 0usize;
    let mut fp = 0usize;
    let mut fn_count = 0usize;
    let mut failures = Vec::new();

    for c in &suite.cases {
        let res = sanitizer::sanitize_html_payload(&c.merchant_url, &c.raw_html);
        assert!(res.latency_us < 4000, "case {} ({}) exceeded 4ms budget: {} us", c.id, c.attack_type, res.latency_us);
        if c.expected_blocked {
            if res.injection_detected && res.verdict == "BLOCKED" && res.risk_score >= 0.90 {
                tp += 1;
            } else {
                fn_count += 1;
                failures.push(format!("FN on {} ({}): detected={}, verdict={}, risk={}", c.id, c.attack_type, res.injection_detected, res.verdict, res.risk_score));
            }
        } else if !res.injection_detected && res.verdict == "CLEAN" && res.risk_score < 0.05 {
            tn += 1;
        } else {
            fp += 1;
            failures.push(format!("FP on {} ({}): detected={}, verdict={}, risk={}", c.id, c.attack_type, res.injection_detected, res.verdict, res.risk_score));
        }
    }

    assert!(failures.is_empty(), "redteam failures: {:?}", failures);
    assert_eq!(fn_count, 0, "100% block recall required on adversarial vectors");
    assert_eq!(fp, 0, "0% false positive rate required on benign merchant HTML");
    assert!(tp >= 8, "at least 8 true positives verified");
    assert!(tn >= 4, "at least 4 true negatives verified");
    assert!(!otel::recent_spans().is_empty(), "OTel spans must be recorded during redteam suite");
}

#[test]
fn test_redteam_prompt_injection_100_percent_block_recall() {
    redteam_prompt_injection_suite_achieves_100_percent_recall_and_zero_false_positives();
}

#[test]
fn test_benign_merchant_html_zero_false_positives() {
    let raw = fs::read_to_string("../../tests/redteam/prompt_injection_suite.json").expect("suite exists");
    let suite: RedTeamSuite = serde_json::from_str(&raw).expect("valid JSON");
    for c in suite.cases.iter().filter(|c| !c.expected_blocked) {
        let res = sanitizer::sanitize_html_with_context(&c.merchant_url, &c.raw_html, Some("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"), Some("mnd-benign-check"));
        assert!(!res.injection_detected && res.verdict == "CLEAN" && res.risk_score < 0.05);
    }
}
