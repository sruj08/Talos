# Plan 02-01 Summary: Rust Ed25519 KYA Mandate Signer/Verifier & RFC 9421 Signature Engine (`TASK-03`)

## Status
- **Task ID**: `TASK-03`
- **Phase**: `02-rust-zero-trust-kya-prompt-injection-firewall-kernel`
- **Result**: **PASSED** (`passes: true`)

## Changes Implemented
1. **`services/firewall-rs/Cargo.toml`** (`34` lines):
   - Configured `[profile.dev.package.{curve25519-dalek,ed25519-dalek,sha2}] opt-level = 2` so Ed25519 elliptic curve operations run in `< 100 us` even in unoptimized debug test runs.
2. **`services/firewall-rs/src/mandate.rs`** (`241` lines, `< 250` lines):
   - Implemented RFC 8785 JCS canonical SHA-256 mandate digest (`canonical_mandate_digest`) and `ed25519-dalek` signing (`sign_mandate`) + constant-time strict verification (`verify_mandate_and_intent` with `VerifyingKey::verify_strict`).
   - Implemented RFC 9421 Web Bot Auth HTTP Message Signature generation (`sign_rfc9421_headers`) and verification (`verify_rfc9421_signature`) over `@authority` and `@path`.
   - Enforced budget ceiling (`max_amount_cents`), category allowlist (`allowed_categories`), Channel3 spread cap (`max_channel3_spread_bps <= 500`), and expiration timestamp (`expires_at_unix`).
3. **`services/firewall-rs/src/webhook_verify.rs`** (`203` lines, `< 250` lines):
   - Implemented IEEE 802.3 CRC32 (`crc32fast::hash`) over raw webhook JSON body, `<transmission_id>|<transmission_time>|<webhook_id>|<crc32_decimal>` validation payload construction, `https://*.paypal.com` certificate URL validation (`is_valid_paypal_cert_url`), and `Ed25519` / SHA-256 signature verification.

## Verification
- `cargo fmt --all -- --check`: passed (0 diffs)
- `cargo clippy --all-targets --all-features -- -D warnings`: passed (0 warnings)
- `cargo test mandate -- --nocapture`: passed (`enforces_ed25519_signature_tamper_expiry_category_and_cap ok`, `< 1ms` latency)
- `cargo test webhook_verify -- --nocapture`: passed (`test_webhook_crc32_and_signature_verification ok`)
