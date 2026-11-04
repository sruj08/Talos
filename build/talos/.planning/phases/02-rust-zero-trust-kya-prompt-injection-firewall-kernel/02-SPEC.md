---
phase: 2
slug: rust-zero-trust-kya-prompt-injection-firewall-kernel
title: "Phase 2 Specification — Rust Zero-Trust KYA & Prompt-Injection Firewall Kernel"
status: locked
ambiguity_score: 0.04
tasks:
  - TASK-03
  - TASK-04
requirements:
  - F-01
  - F-02
  - F-03
  - API-01
  - API-02
  - API-03
  - API-04
  - M-01
  - SEC-01
  - SEC-02
  - SEC-06
---

# Phase 2 Specification: Rust Zero-Trust KYA & Prompt-Injection Firewall Kernel

## 1. Objective & Scope
Implement and verify the production-grade Rust security edge (`services/firewall-rs`) delivering:
1. **`TASK-03` (`mandate.rs`, `webhook_verify.rs`)**:
   - Real `Ed25519` (`ed25519-dalek` v2) cryptographic signing and constant-time verification (`verify_strict`) over RFC 8785 JSON Canonicalization Scheme (JCS) SHA-256 digests (`sha2`).
   - Hard enforcement of budget ceiling (`max_amount_cents`), merchant category allowlist (`allowed_categories`), Channel3 spread ceiling (`max_channel3_spread_bps` / `max_spread_bps` ≤ 500 bps), and mandate expiration (`expires_at_unix`).
   - IETF RFC 9421 HTTP Message Signatures (`Signature-Input` and `Signature` headers with `alg="ed25519"`) verification for Web Bot Auth.
   - Sub-millisecond (`< 1000 us`) PayPal Webhook IEEE 802.3 CRC32 (`crc32fast`) + `<transmission_id>|<transmission_time>|<webhook_id>|<crc32_decimal>` validation string + `*.paypal.com` certificate URL domain validation + cryptographic signature check.
2. **`TASK-04` (`sanitizer.rs`, `mcp_server.rs`, `main.rs`)**:
   - Streaming O(1)-memory HTML/DOM prompt-injection sanitizer powered by `lol_html` + `aho-corasick` + `M-01` (`ProtectAI/deberta-v3-base-prompt-injection-v2` INT8 ONNX classifier interface) that neutralizes CVE-2026-22708 vectors (`display:none`, `opacity:0`, `visibility:hidden`, `font-size:0`, `hidden`, `aria-hidden="true"`, `<script>`, `<template>`, HTML comments `<!-- ... -->`, zero-width characters `U+200B..U+200F`/`U+FEFF`, and Unicode Tag characters `U+E0000..U+E007F`).
   - Model Context Protocol (`rmcp` JSON-RPC 2.0) server exposing `talos_issue_mandate`, `talos_verify_mandate`, and `talos_sanitize_dom` alongside Axum HTTP routes (`/healthz`, `/v1/mandates/sign`, `/v1/mandates/verify`, `/v1/webhooks/verify`, `/v1/sanitize`, `/mcp`).

## 2. Falsifiable Acceptance Criteria
| ID | Criterion | Verification Method | Target |
|----|-----------|---------------------|--------|
| `AC-03.1` | `sign_mandate` computes an RFC 8785 JCS canonical SHA-256 digest and signs it using a real `ed25519_dalek::SigningKey`, returning a 128-hex-char (64-byte) `Ed25519` signature and 64-hex-char (32-byte) public key. | `cargo test` in `mandate.rs` | 100% pass |
| `AC-03.2` | `verify_mandate` uses `ed25519_dalek::VerifyingKey::verify_strict` over the canonical digest; tampering with `max_amount_cents` or signature bytes returns `valid == false` and reason `"MANDATE_SIGNATURE_INVALID"`. | `cargo test` (`test_tampered_mandate_rejected`) | 100% pass |
| `AC-03.3` | `verify_mandate` rejects expired mandates (`"MANDATE_EXPIRED"`), disallowed categories (`"CATEGORY_NOT_ALLOWED"`), excessive spread (`"SPREAD_EXCEEDS_MANDATE_CAP"`), and over-budget requests (`"AMOUNT_EXCEEDS_MANDATE_CAP_STEP_UP_REQUIRED"` with `requires_step_up == true`). | `cargo test` in `mandate.rs` | 100% pass |
| `AC-03.4` | `verify_rfc9421_signature` validates RFC 9421 `Signature-Input` and `Signature` headers (`alg="ed25519"`) against the canonical signature base. | `cargo test` (`test_rfc9421_signature_verification`) | 100% pass |
| `AC-03.5` | `verify_webhook` computes IEEE 802.3 CRC32 via `crc32fast::hash`, validates `cert_url` host suffix (`*.paypal.com`), constructs `<transmission_id>|<transmission_time>|<webhook_id>|<crc32_decimal>`, and verifies signature in `< 1000 us`. | `cargo test` in `webhook_verify.rs` | 100% pass |
| `AC-04.1` | `sanitize_html` uses `lol_html::rewrite_str` (`element!`, `comments!`) to strip hidden elements, comments, zero-width/tag Unicode, and detects prompt injections via `aho-corasick` + `M-01` `DeBERTa-v3` classifier with 100% recall on `tests/redteam/prompt_injection_suite.json` in `< 4000 us`. | `cargo test` in `sanitizer.rs` | 100% recall, `< 4000 us` |
| `AC-04.2` | `handle_mcp_request` implements JSON-RPC 2.0 `initialize`, `tools/list`, and `tools/call` for `talos_issue_mandate`, `talos_verify_mandate`, and `talos_sanitize_dom`. | `cargo test` in `mcp_server.rs` & `main.rs` | 100% pass |
| `AC-04.3` | Every `.rs` source file in `services/firewall-rs/src/` is strictly `< 250` lines (`CLAUDE.md` §5) and passes `cargo fmt --all -- --check`, `cargo clippy --all-targets --all-features -- -D warnings`, and `cargo test --all-targets --workspace`. | CI gates | 0 warnings, 0 failures |
