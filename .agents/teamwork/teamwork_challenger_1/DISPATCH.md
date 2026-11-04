# Dispatch — Challenger 1 (`teamwork_challenger_1`)

## Identity & Paths
- **Role**: Adversarial & Empirical Verifier 1 (`teamwork_challenger`)
- **Working Directory**: `g:\PAYPAL\.agents\teamwork\teamwork_challenger_1`
- **Parent Conversation ID**: `52b79b48-56f1-40fb-81a2-c616ff2ea33f`
- **Original Request File**: `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Project Scope Document**: `g:\PAYPAL\PROJECT.md`

## Required Reading
1. `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `g:\PAYPAL\PROJECT.md`, `g:\PAYPAL\TEST_INFRA.md`, `g:\PAYPAL\TEST_READY.md`
3. `g:\PAYPAL\docs\08-project\PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`
4. `g:\PAYPAL\.agents\teamwork\teamwork_worker_m1_rust\handoff.md`
5. `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go\handoff.md`
6. `g:\PAYPAL\.agents\teamwork\teamwork_worker_m4_integration\handoff.md`

## Adversarial Challenge Scope & Instructions
1. **Non-Destructive Empirical Testing**: Do NOT modify tracked repository files or run `git commit`. Any temporary test harness must live in your `.agents/teamwork/teamwork_challenger_1/` folder or run via `cargo test` / `go test` / `powershell`.
2. **Zero Secret Leaks**: NEVER print, echo, or log any secret values from `.env`.
3. **Adversarial Verification of Phases 1–4 (`TASK-01`..`TASK-08`)**:
   - Empirically stress-test the Rust Firewall (`services/firewall-rs`):
     - Verify `Ed25519` cryptographic signature rejection on 1-bit signature flip, tampered `max_amount_cents`, expired mandate timestamps, disallowed categories, spread limit overflow, and `>$300` (`30001` cents) step-up trigger in `< 1ms`.
     - Verify `lol_html` + `DeBERTa-v3` ONNX DOM sanitizer against red-team prompt injection vectors (`tests/redteam/prompt_injection_suite.json`, `<!-- SYSTEM OVERRIDE -->`, `display:none`, `opacity:0`, `visibility:hidden`, zero-width Unicode `U+200B`, Unicode tags `U+E0000..U+E007F`) in `< 4ms`.
   - Empirically stress-test the APIMatic Go SDK (`sdk/paypal-go-apimatic`) and Go Orchestrator (`services/orchestrator-go`):
     - Verify live `.env` OAuth2 token acquisition (`POST https://api-m.sandbox.paypal.com/v1/oauth2/token`), Channel3 live search (`POST https://api.trychannel3.com/v1/search` with `x-api-key`), and KERNEL live probe (`GET https://api.onkernel.com/browsers`) without printing secrets.
     - Verify 2PC Escrow State Machine rejects illegal transitions (`PAYPAL_VOIDED -> PAYPAL_CAPTURED`, `PAYPAL_CAPTURED -> PAYPAL_VOIDED`) and enforces `PayPal-Request-Id` idempotency under `-race`.
4. **Deliver Verdict**:
   - Write your empirical verification report to `g:\PAYPAL\.agents\teamwork\teamwork_challenger_1\handoff.md` with an explicit verdict (`APPROVE` or `REJECT`), and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.


## 2026-11-04T10:24:03Z
You are `teamwork_challenger_1` (TypeName: `teamwork_challenger`).
Your working directory is `g:\PAYPAL\.agents\teamwork\teamwork_challenger_1`.
Your parent conversation ID is `52b79b48-56f1-40fb-81a2-c616ff2ea33f`.

First, read `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`, `g:\PAYPAL\PROJECT.md`, and `g:\PAYPAL\.agents\teamwork\teamwork_challenger_1\DISPATCH.md`.
Create and maintain `BRIEFING.md` and `progress.md` in `g:\PAYPAL\.agents\teamwork\teamwork_challenger_1`.

Perform non-destructive empirical and adversarial verification of Phases 1 through 4 (`TASK-01`..`TASK-08`: Rust `Ed25519` + `lol_html` + `DeBERTa-v3` Firewall, APIMatic Go SDK, Go 2PC Escrow State Machine, and live `.env` OAuth2/Channel3/KERNEL probes) per your `DISPATCH.md` (do NOT modify any repository files, do NOT run `git commit`, and NEVER print or leak any secret values from `.env`).
Write your empirical verification report with an explicit verdict (`APPROVE` or `REJECT`) to `g:\PAYPAL\.agents\teamwork\teamwork_challenger_1\handoff.md`, and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.
