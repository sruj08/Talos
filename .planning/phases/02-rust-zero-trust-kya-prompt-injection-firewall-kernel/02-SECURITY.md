---
phase: 2
slug: rust-zero-trust-kya-prompt-injection-firewall-kernel
title: "Phase 2 Security Audit — STRIDE Verification for KYA Mandate Engine & Prompt-Injection Firewall"
status: verified
requirements:
  - SEC-01
  - SEC-02
  - SEC-06
  - F-01
  - F-02
  - F-03
---

# Phase 2 Security Audit (`02-SECURITY.md`)

## 1. Threat Mitigation Verification Matrix (`THREAT_MODEL.md` & `SECURITY_ARCHITECTURE.md`)

| Threat ID | STRIDE Category | Attack Vector | Mitigation Implemented in `services/firewall-rs` | Verification Test | Status |
|-----------|-----------------|---------------|--------------------------------------------------|-------------------|--------|
| `T-01` | Spoofing | Rogue bot spoofing agent identity or HTTP request headers | `Ed25519` (`ed25519_dalek::VerifyingKey::verify_strict`) over RFC 8785 JCS SHA-256 digest + IETF RFC 9421 `Signature-Input` and `Signature` verification (`alg="ed25519"`) in `mandate.rs` | `mandate::tests::test_sign_verify_and_tamper_expire_category_checks` | PASS |
| `T-02` | Tampering | Modifying `max_amount_cents`, `allowed_categories`, or `expires_at_unix` after mandate issuance | Canonical RFC 8785 JCS SHA-256 digest binds all 10 mandate fields into the `Ed25519` signature; any bit mutation triggers `MANDATE_SIGNATURE_INVALID` | `mandate::tests::test_sign_verify_and_tamper_expire_category_checks` | PASS |
| `T-03` | Tampering / Injection | CVE-2026-22708 indirect prompt injection via hidden DOM (`display:none`, `opacity:0`, `visibility:hidden`, `font-size:0`, `hidden`, `aria-hidden="true"`, `<script>`, `<!-- comments -->`, `aria-label`, Unicode zero-width/tag steganography) | 3-stage `lol_html` streaming rewriter + Unicode zero-width/tag stripper + `aho-corasick` + `M-01` `DeBERTa-v3` INT8 ONNX classifier in `sanitizer.rs` | `sanitizer::tests::test_redteam_prompt_injection_suite_100_percent_recall` | PASS |
| `T-04` | Repudiation / Spoofing | Forged PayPal webhook events or SSRF via malicious `cert_url` | IEEE 802.3 CRC32 (`crc32fast::hash`) + `<transmission_id>|<transmission_time>|<webhook_id>|<crc32_decimal>` validation string + strict `https://*.paypal.com` host validation + `Ed25519`/RSA signature check in `webhook_verify.rs` | `webhook_verify::tests::test_webhook_crc32_and_signature_verification` | PASS |
| `T-05` | Elevation of Privilege | Autonomous checkout exceeding `max_amount_cents` or `max_channel3_spread_bps` (500 bps cap) | Hard bounds checks in `verify_mandate` returning `SPREAD_EXCEEDS_MANDATE_CAP` or `AMOUNT_EXCEEDS_MANDATE_CAP_STEP_UP_REQUIRED` (`requires_step_up: true`) | `mandate::tests::test_sign_verify_and_tamper_expire_category_checks` | PASS |

## 2. Static & Dynamic Security Gates
- **Constant-Time Signature Verification**: Uses `ed25519_dalek::VerifyingKey::verify_strict` to reject small-order public keys, non-canonical signatures, and timing side-channels.
- **Bounded Memory DOM Rewriting**: Uses `lol_html::rewrite_str` streaming HTML parser rather than full DOM tree allocation.
- **Zero Secret Leaks**: Deterministic test/dev seeds use domain-separated SHA-256 contexts; zero live credentials stored in source files.
