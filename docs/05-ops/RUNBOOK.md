# Operational Runbook & Incident Response — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Principal SRE & Security Operations Council · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [OBSERVABILITY](OBSERVABILITY.md) · [DEPLOYMENT](DEPLOYMENT.md) · [COMPLIANCE](../06-security-compliance/COMPLIANCE.md) · [RISK_REGISTER](../06-security-compliance/RISK_REGISTER.md)

---

## 1. Incident Severity Classification & Response SLAs

| Severity | Definition | Response SLA | Resolution / Mitigation Target | Escalation Path |
| :--- | :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Complete checkout outage, unauthorized PayPal `CAPTURE` risk, cryptographic verification bypass, or confirmed PII/credential breach. | `< 5 minutes` | `< 15 minutes` (Automated circuit-breaker in `<10s`) | Systems Lead + Security Lead + Legal/Compliance Officer (CERT-In / DPDP timer starts) |
| **SEV-2 (High)** | PayPal Sandbox `5xx` degradation (`R-01`), Rust Firewall p95 latency `>4ms` (`R-04`), Channel3 API timeout, or WebSocket disconnect storm. | `< 15 minutes` | `< 30 minutes` | Backend Orchestration Lead + SRE |
| **SEV-3 (Medium)** | AG Studio NL copilot (`M-03`) timeout, Elastic APM ingestion lag, or non-critical Bryntum UI rendering warning. | `< 1 hour` | `< 4 hours` | Frontend / Observability Owner |
| **SEV-4 (Low)** | Cosmetic UI alignment issue, documentation typo, or slow cold-build cache in CI. | `< 24 hours` | Next sprint / commit | Assigned Component Owner |

---

## 2. Playbooks for the Top 10 Operational Failures

### Playbook 1: PayPal Sandbox (`api-m.sandbox.paypal.com`) 5xx Outage or High Latency (`R-01`)
- **Symptoms**: Alert `ALT-02` fires; `POST /v2/checkout/orders` or `/v2/payments/authorizations/{id}/capture` returns `500/502/503/504` or exceeds `4,500ms`.
- **Automated Mitigation**: `orchestrator-go`'s circuit breaker (`sony/gobreaker`) trips after 3 consecutive failures or timeouts and activates `FF_PAYPAL_SANDBOX_REPLAY_FALLBACK=true`, returning deterministic, cryptographically hashed PayPal Sandbox fixtures recorded from real Sandbox runs while displaying a transparent amber `"SANDBOX REPLAY FALLBACK ACTIVE"` pill in the UI header.
- **Manual Recovery**:
  ```bash
  # Force-enable replay fallback via Render env or runtime flag endpoint:
  curl -X POST http://localhost:8080/internal/flags -d '{"FF_PAYPAL_SANDBOX_REPLAY_FALLBACK": true}'
  ```

### Playbook 2: Duplicate Webhook or Network Retry Threatening Double `CAPTURE` (`R-03`)
- **Symptoms**: PayPal Sandbox dispatches duplicate `CHECKOUT.ORDER.APPROVED` webhooks (`API-14`) or an agent retries `API-09` (`capture`).
- **Automated Mitigation**:
  1. `orchestrator-go` checks Valkey/Redis `SET idemp:{paypal_request_id} "LOCKED" NX EX 86400` (`E-10`).
  2. Inside PostgreSQL (`E-06`), the state transition query executes `UPDATE escrow_transactions SET state = 'CAPTURED' WHERE id = $1 AND state = 'AUTHORIZED' RETURNING id`. If 0 rows are returned, the duplicate request short-circuits with HTTP `200 OK` (idempotent replay of existing capture receipt).
- **Manual Verification**:
  ```sql
  SELECT id, paypal_order_id, paypal_auth_id, paypal_capture_id, state, updated_at
  FROM escrow_transactions WHERE id = '<escrow_uuid>';
  ```

### Playbook 3: Channel3 API Rate-Limit (`HTTP 429`) or Timeout (`F-04`)
- **Symptoms**: `POST /api/v1/channel3/benchmark` (`API-06`) receives `429 Too Many Requests` or times out (`>1,500ms`).
- **Automated Mitigation**: Go orchestrator serves a 15-minute cached SKU benchmark from Valkey (`channel3:sku:{normalized_query}`) or PostgreSQL `channel3_benchmarks` (`E-05`).
- **Manual Recovery**: Verify `CHANNEL3_API_KEY` quota and inspect cache hit ratio on `/healthz`.

### Playbook 4: Redis / Valkey Lock Contention or Connection Drop (`E-10`)
- **Symptoms**: Alert `ALT-03` fires; `go-redis` connection pool times out.
- **Automated Mitigation**: `orchestrator-go` automatically falls back to PostgreSQL unique constraint locking (`INSERT INTO webhook_event_ledger (transmission_id, ...) ON CONFLICT DO NOTHING` and row-level `SELECT ... FOR UPDATE` on `escrow_transactions`).
- **Manual Recovery**: Restart or scale `pactpay-valkey` in Render Dashboard; flush stale non-lock cache keys if memory saturation occurred (`maxmemoryPolicy: noeviction`).

### Playbook 5: False-Positive DOM Prompt-Injection Block on Benign Merchant (`F-02`, `M-01`)
- **Symptoms**: Legitimate merchant checkout page is flagged with `injection_detected = true` in `firewall_scan_logs` (`E-04`).
- **Diagnosis**: Expand the **AG Grid Master-Detail Forensic Drawer (`F-08`)** on the blocked row to inspect `stripped_payloads_json` and `onnx.m01_score`.
- **Remediation**: If a benign CSS class (e.g., an accessibility `.sr-only` span containing non-imperative text) triggered a borderline score (`0.70–0.78`), add the verified merchant domain to the signed mandate's `trusted_domain_allowlist` or adjust `PACTPAY_ONNX_THRESHOLD=0.82`.

### Playbook 6: Unicode Tag-Block (`U+E0000`) or Base64 Smuggled Prompt Injection (`R-02`)
- **Symptoms**: Red-team attacker attempts invisible ASCII smuggling or `data-*` base64 injection.
- **Verification**: Confirm `services/firewall-rs/src/sanitizer.rs` normalizes NFKC Unicode, strips `U+E0000..U+E007F`, and decodes inline base64 strings `>=16 chars` before passing text to `lol_html` and `DeBERTa-v3` (`M-01`).

### Playbook 7: Rust ONNX Runtime (`ort`) High CPU or Cold Build Delay (`R-04`)
- **Symptoms**: Alert `ALT-01` fires (`p95 > 4.0ms`) under extreme burst load.
- **Remediation**: Toggle `FF_RUST_ONNX_CLASSIFIER=false` to route 100% of traffic through the zero-allocation `lol_html` + `aho-corasick` 140-pattern SIMD automaton (`0.4ms` p95).

### Playbook 8: KERNEL Cloud Browser (`onkernel.com`) Session Pool Exhaustion (`F-11`)
- **Symptoms**: External merchant URL inspection takes `>3s` waiting for a headless browser microVM.
- **Remediation**: Switch `KERNEL_FETCH_MODE=fast_http_tls` for static storefronts or use the built-in local **Poisoned Merchant Simulator (`PoisonedStoreSim.tsx`)** for instant `<5ms` zero-network red-team demonstrations.

### Playbook 9: PayPal Webhook Signature Verification Failure (`API-04`, `API-14`)
- **Symptoms**: Incoming `POST /api/v1/webhooks/paypal` rejected with `401 Unauthorized` by `firewall-rs`.
- **Diagnosis**: Check `webhook_event_ledger` (`E-09`) for `crc32_verified` vs. `rsa_sig_verified`. Almost always caused by a mismatched `PAYPAL_WEBHOOK_ID` environment variable after re-creating a Sandbox webhook listener.
- **Fix**: Update `PAYPAL_WEBHOOK_ID` in Render's `pactpay-shared-secrets` group to match the active PayPal Developer Dashboard Webhook ID.

### Playbook 10: WebSocket Stream Disconnect (`API-15`) in AG Grid / Bryntum UI
- **Symptoms**: Live row flashes pause in `AgStudioBlotter.tsx` or `BryntumSlaBoard.tsx`.
- **Automated Mitigation**: The frontend WebSocket client implements exponential jittered backoff (`250ms -> 500ms -> 1000ms`) and automatically polls `GET /api/v1/escrow/blotter` (`API-12`) every 3 seconds whenever `ws.readyState !== OPEN`, guaranteeing zero missed updates during live demos.

---

## 3. Regulatory Incident Reporting Procedures (India CERT-In & DPDP Act 2023)

### 3.1 CERT-In 6-Hour Cyber Incident Reporting Protocol (`R-06`)
Under the **CERT-In Directions of 28 April 2022**, any confirmed SEV-1 security incident (unauthorized system access, cryptographic key compromise, or targeted DoS/injection breach) must be reported to `incident@cert-in.org.in` **within 6 hours of detection**:
1. **T+0 to T+30 mins (Containment)**: Quarantine affected `AgentIdentity` (`E-02`), revoke active `KyaMandate` records (`E-03`), and rotate PayPal Sandbox/Live OAuth client secrets.
2. **T+30 to T+120 mins (Forensic Snapshot)**: Export immutable trace and scan logs (`E-04`, `E-09`) from Elastic Cloud (`F-12`) covering `T-24h` to `T+current`.
3. **T+120 to T+300 mins (Filing)**: Submit the structured CERT-In Incident Report Form containing: timestamp in IST (NTP-synced), attack vector classification, affected IP/service identifiers, and mitigation actions taken.

### 3.2 DPDP Act 2023 & DPDP Rules 2025 Personal Data Breach Notification
In the event of any unauthorized disclosure of personal data in `PrincipalUser` (`E-01`):
1. **Immediate Notification to the Data Protection Board of India (DPBI)**: Submit preliminary breach intimation without undue delay, followed by a detailed root-cause and remediation filing within **72 hours**.
2. **Data Principal Notice**: Dispatch a clear, plain-language notice (in English and the user's preferred Eighth Schedule language under DPDP §5/§8) detailing the nature of the breach, potential impact, mitigation steps taken by PactPay, and contact details of PactPay's Data Protection Officer (`dpo@pactpay.io`).

---

## 4. Backup, Restore & Disaster Recovery Verification

```bash
# 1. Trigger on-demand logical backup of Render PostgreSQL 16 (E-01..E-09)
pg_dump --format=custom --no-acl --no-owner "$DATABASE_URL" > pactpay_backup_$(date +%Y%m%d_%H%M).dump

# 2. Restore and verify ledger integrity in a clean recovery database
pg_restore --clean --if-exists --no-acl --no-owner -d "$RECOVERY_DATABASE_URL" pactpay_backup_latest.dump
psql "$RECOVERY_DATABASE_URL" -c "SELECT state, COUNT(*) FROM escrow_transactions GROUP BY state;"
```

---

## 5. Hackathon Demo-Day Emergency Checklist (15 Minutes Before Recording / Judging)

- [ ] **Check 1**: Hit `GET /healthz` on both `pactpay-orchestrator-go` and `pactpay-firewall-rs`—verify `"status": "healthy"`.
- [ ] **Check 2**: Verify `FF_PAYPAL_SANDBOX_REPLAY_FALLBACK=true` is armed so even a sudden PayPal Sandbox hiccup during the 3-minute video take or judge click-through results in `0` errors (`R-01`).
- [ ] **Check 3**: Click **"Reset Demo State"** in the Command Center header (re-seeds clean `P-01`..`P-04` mandates and resets Order #1 and Order #2 to initial states in `<150ms`).
- [ ] **Check 4**: Run the 1-click **Postman Collection (`F-13`)** once to warm all Render CPU caches and TLS connection pools.
- [ ] **Check 5**: Confirm `/LICENSE` (MIT) is visible in the GitHub repository's top-right **"About"** sidebar (`R-05`).
