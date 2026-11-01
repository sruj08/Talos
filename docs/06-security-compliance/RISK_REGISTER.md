# Comprehensive Risk Register (Charlie Munger Pre-Mortem) — TALOS
> Project: TALOS · Owner: War-Room Risk & Pre-Mortem Council (Charlie Munger + Bruce Schneier Bench) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [THREAT_MODEL](THREAT_MODEL.md) · [RUNBOOK](../05-ops/RUNBOOK.md) · [HACKATHON_PLAN](../00-overview/HACKATHON_PLAN.md)

---

## 1. Charlie Munger's Inversion Methodology

> **Charlie Munger**: *"Invert, always invert: tell me where I'm going to die, so I never go there. How could TALOS lose the PayPal AI Hackathon or fail in enterprise production? By crashing when PayPal Sandbox has a 5xx hiccup, by letting a clever base64 prompt injection slip past a naive regex, by accidentally double-capturing an authorization, by forgetting a root `LICENSE` file on GitHub, or by failing to show a live 2-way link between AG Grid, Bryntum, APIMatic, Channel3, and PayPal Sandbox."*

Every one of those failure modes has been cataloged below (`R-01`..`R-12`) and engineered out of the system.

---

## 2. Master Risk Register (`R-01`..`R-12`)

*(Note: `R-01` through `R-06` match the canonical IDs in `PROJECT_BRIEF.md` §10 verbatim; `R-07` through `R-12` extend coverage across Market, Sponsor Integration, Demo, and Ethical dimensions.)*

| Risk ID | Category | Risk Description | Likelihood | Impact | Concrete Mitigation Built into TALOS | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`R-01`** | **Ops / Demo** | **PayPal Sandbox (`api-m.sandbox.paypal.com`) experiences transient `5xx` latency or OAuth timeouts during judge evaluation.** | Medium | High | Dual-mode execution in `orchestrator-go`: live PayPal Sandbox API calls by default + automatic circuit-breaker fallback (`FF_PAYPAL_SANDBOX_REPLAY_FALLBACK=true`) serving real, cryptographically hashed Sandbox `Orders v2 AUTHORIZE / CAPTURE / VOID` recordings so the UI never crashes (`RUNBOOK.md` Playbook 1). | Go Orchestration Lead | **Mitigated** |
| **`R-02`** | **Security / AI** | **Attacker encodes prompt injection inside base64 `data-*` attributes, CSS `content:`, or Unicode tag characters (`U+E0000`) to bypass basic regex.** | Medium | High | `services/firewall-rs` normalizes NFKC Unicode, strips all `U+E0000..U+E007F` invisible tag blocks and zero-width chars, decodes inline base64 strings (`>=16 chars`), strips hidden DOM nodes via `lol_html`, and scores remaining text via local `DeBERTa-v3` INT8 ONNX (`M-01`). | Rust Security Lead | **Mitigated** |
| **`R-03`** | **Financial / Tech** | **Duplicate PayPal webhook (`API-14`) or network retry triggers a race-condition double `CAPTURE` (`API-09`) on an authorization.** | Low | Critical | Triple-layer idempotency: (1) Valkey distributed `IdempotencyLock` (`E-10`, `SET NX EX 86400`), (2) PostgreSQL `SELECT ... FOR UPDATE` state guard (`state == 'AUTHORIZED'`), and (3) deterministic `PayPal-Request-Id` header passed via APIMatic Go SDK. | Go Orchestration Lead | **Mitigated** |
| **`R-04`** | **Build / CI** | **Rust `ort` (ONNX Runtime) native C++ linking slows down cold builds on Render or local Docker machines.** | Medium | Medium | Feature-flagged `ort` Cargo feature with `Swatinem/rust-cache@v2` binary caching + zero-dependency deterministic `lol_html` + `aho-corasick` 140-pattern SIMD engine (`<0.5ms`) always compiled in and toggleable via `FF_RUST_ONNX_CLASSIFIER`. | DevSecOps Lead | **Mitigated** |
| **`R-05`** | **Licensing / Rules** | **Stage-1 Devpost disqualifier: missing open-source `LICENSE` visible in GitHub "About" section or asking judges for real bank/card credentials.** | Low | Critical | Standard MIT `LICENSE` committed in Commit #1 at repo root, verified by `.github/workflows/ci-rust-go-web.yml` Gate 0 on every push; 100% of flows use pre-configured PayPal Sandbox credentials (`Official Rules §4 & §6`). | Release Lead | **Mitigated** |
| **`R-06`** | **Legal / India** | **RBI Payment Aggregator (PA-CB) licensing or DPDP Act 2023 / CERT-In compliance barriers when adopted by Indian enterprises (`P-01`, `P-03`).** | Low | Medium | Non-custodial TSP architecture: TALOS never holds funds or touches raw PAN/CVV (all money stays in PayPal's licensed `Orders v2 AUTHORIZE` ledger); structured logs redact PII under DPDP §8 and retain security traces for 180 days under CERT-In (`COMPLIANCE.md`). | Legal & DPO Lead | **Mitigated** |
| **`R-07`** | **Sponsor Prize Lock** | **Surface-level integration of AG Grid or Bryntum fails to impress Sponsor Judges (`Sylwia Vargas`, `Mats Bryntse`).** | Low | High | Deep two-way integration: **AG Grid Enterprise + AG Studio (`F-08`)** uses live WebSocket `applyTransactionAsync`, Master-Detail DOM diff forensics, and NL pivoting; **Bryntum Scheduler Pro (`F-07`)** binds SLA bar drags/expirations directly to live PayPal Sandbox `VOID` (`API-10`) calls! | Frontend Lead | **Mitigated** |
| **`R-08`** | **External API** | **Channel3 API (`trychannel3.com`) or KERNEL (`onkernel.com`) rate-limits or lacks an obscure custom B2B SKU during live judge testing.** | Medium | Medium | Two-tier caching in Valkey + PostgreSQL `channel3_benchmarks` (`E-05`) pre-seeded with 25 realistic studio audio, laptop, and cloud hardware SKUs, plus an embedded 1-click **Poisoned Storefront Simulator (`F-11`)** that works with zero external network latency. | Backend Lead | **Mitigated** |
| **`R-09`** | **AI Hallucination** | **Procurement LLM (`M-02`) hallucinates invalid JSON field names when constructing PayPal `Orders v2` or `Disputes v1` payloads.** | Medium | High | **APIMatic Context Plugin** injects verified OpenAPI schemas into the agent reasoning prompt, and the **APIMatic-generated Go SDK (`sdk/paypal-go-apimatic`, `F-05`)** enforces strict compile-time struct validation before any HTTP call leaves `orchestrator-go`. | AI & SDK Lead | **Mitigated** |
| **`R-10`** | **Market / Adoption** | **Developers (`P-02`) hesitate to adopt a new security layer if setup takes more than 5 minutes.** | Low | Medium | Zero-config drop-in compatibility: `talos-firewall-rs` implements the official Model Context Protocol (`rmcp`, `F-03`) over `stdio` and `HTTP/SSE`, allowing any Claude Desktop, Cursor, or `@paypal/agent-toolkit` user to wrap their existing agent in `<60 seconds`. | Developer Experience Lead | **Mitigated** |
| **`R-11`** | **Ethical / UX** | **Overly aggressive DOM sanitization (`F-02`) or narrow spread limits (`F-04`) cause false-positive blocks on legitimate merchants (`P-03`).** | Low | Medium | Transparent human-in-the-loop override: blocked or high-spread orders are never silently dropped—they surface in **AG Grid (`F-08`)** with the exact DOM diff and trigger a 1-click **PayPal JS SDK v6 (`F-09`)** step-up co-sign modal so the human principal always has final say. | Product & AI Lead | **Mitigated** |
| **`R-12`** | **Demo Delivery** | **3-minute pitch video (`Tie-Breaker #5`) spends too much time on slides and misses showing real PayPal Sandbox `ORDER-ID` / `AUTH-ID` transitions.** | Low | Critical | Strictly follow `PITCH.md`: `<25 seconds` problem hook, followed by **140 seconds of continuous live screen recording** showing Act 1 (`<4ms` Rust DOM injection block + Channel3 reroute), Act 2 (PayPal Sandbox `AUTHORIZE` -> Tracking -> `CAPTURE`), and Act 3 (Bryntum SLA breach -> instant PayPal `VOID`). | Demo Director | **Mitigated** |

---

## 3. Risk Heat Map (Pre-Mitigation vs. Post-Mitigation)

```mermaid
quadrantChart
    title TALOS Risk Reduction Matrix (Pre -> Post Mitigation)
    x-axis Low Likelihood --> High Likelihood
    y-axis Low Impact --> Critical Impact
    quadrant-1 Critical Priority (Eliminate Immediately)
    quadrant-2 High Impact Guardrails (Automate Fallback)
    quadrant-3 Residual / Low Risk Zone (Safe)
    quadrant-4 Operational Monitoring
    "R-01 PayPal 5xx (Pre)": [0.65, 0.85]
    "R-01 PayPal 5xx (Post Replay Guard)": [0.12, 0.20]
    "R-02 Prompt Injection (Pre)": [0.75, 0.92]
    "R-02 Prompt Injection (Post Rust+ONNX)": [0.10, 0.25]
    "R-03 Double Capture (Pre)": [0.40, 0.95]
    "R-03 Double Capture (Post Redis+PG 2PC)": [0.05, 0.15]
    "R-05 Missing LICENSE (Post CI Gate)": [0.02, 0.10]
```
