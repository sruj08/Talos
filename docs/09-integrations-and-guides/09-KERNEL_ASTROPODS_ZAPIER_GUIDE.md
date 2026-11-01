# 09 — KERNEL Cloud Browser, Astropods & Zapier Ecosystem Guide — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Sponsor Ecosystem Bonus: **KERNEL (`onkernel.com`), Astropods & Zapier** · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [00-TRACKS_AND_SUBMISSION_STRATEGY](00-TRACKS_AND_SUBMISSION_STRATEGY.md) · [01-PAYPAL_SANDBOX_STEP_BY_STEP](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) · [ARCHITECTURE](../03-engineering/ARCHITECTURE.md)

---

## 1. Strategic Overview: Completing the Full Hackathon Sponsor Ecosystem

In addition to the core cash prize sponsors (**PayPal**, **AG Grid**, **APIMatic**, **Bryntum**, **Channel3**, **Render**, **Elastic**, **Postman**), the PayPal AI Hackathon features three ecosystem tooling partners on the Devpost sponsor banner:
1. **KERNEL (`https://onkernel.com/`)**: Sub-second disposable cloud browser infrastructure designed specifically for AI web agents.
2. **Astropods**: Cloud-native ephemeral developer workspaces & containerized agent pods.
3. **Zapier**: Automated webhook workflow orchestration across 7,000+ enterprise apps (Slack, PagerDuty, Jira, Gmail, QuickBooks).

Here is how PactPay integrates all three cleanly—with **zero mandatory blocker if you don't have an account**, and **step-by-step instructions if you want to connect live keys**.

---

## 2. KERNEL (`https://onkernel.com/`) — Disposable Cloud Browser Sandbox (`F-11`)

### 2.1 — Why KERNEL Fits PactPay's Architecture Perfectly
When an autonomous shopping agent inspects an untrusted third-party merchant checkout page, opening that URL on the user's local machine exposes local cookies and session state. Instead, PactPay's Go Orchestrator (`services/orchestrator-go/internal/kernel/browser.go`) spins up an isolated **KERNEL Cloud Browser microVM session**, extracts the raw rendered DOM HTML and a visual evidence screenshot, and pipes the HTML directly into our **Rust `lol_html` + `DeBERTa-v3` Prompt-Injection Sanitizer (`services/firewall-rs`)**!

### 2.2 — Step-by-Step Human Actions on `onkernel.com` (Optional — Phase `P3`)
1. Open your browser and navigate to **[https://onkernel.com/](https://onkernel.com/)**.
2. Sign up with your GitHub account and claim any hackathon participant credits.
3. Go to **Dashboard → API Keys** → Click **Create API Key** → Copy your `KERNEL_API_KEY`.
4. Save `KERNEL_API_KEY` safely into `g:\PAYPAL\.env` using the `credentials` protocol:

```bash
# Verify if KERNEL_API_KEY is present in .env
grep -sq "^KERNEL_API_KEY=" .env && echo "KERNEL_API_KEY is set" || echo "MISSING: KERNEL_API_KEY"
```

```bash
# Save KERNEL_API_KEY safely (Git Bash / WSL)
printf "Enter KERNEL_API_KEY (typing hidden): " && read -s val && echo && echo "KERNEL_API_KEY=$val" >> ".env" && echo "KERNEL_API_BASE_URL=https://api.onkernel.com/v1" >> ".env" && echo "Saved KERNEL_API_KEY."
```

*(PowerShell alternative)*:
```powershell
$kk = Read-Host "Enter KERNEL_API_KEY (typing hidden)" -AsSecureString; $kkPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($kk)); Add-Content -Path ".env" -Value "KERNEL_API_KEY=$kkPlain`nKERNEL_API_BASE_URL=https://api.onkernel.com/v1"; Write-Host "Saved KERNEL_API_KEY."
```

### 2.3 — Built-In Interactive Fallback: `PoisonedStoreSim.tsx`
So that judges can trigger adversarial attacks in 1 click without waiting for external merchant pages, PactPay also embeds an interactive **"KERNEL Browser Sandbox & Poisoned Storefront Simulator" (`web/src/components/PoisonedStoreSim.tsx`)** directly inside the Next.js Command Center. Judges can toggle between:
- **Preset A — Poisoned Merchant Attack (`ShadowGear Audio - $480.00 + Hidden CSS Prompt Injection`)**
- **Preset B — Verified Fair-Market Merchant (`AudioPro Verified via Channel3 - $249.00 Clean DOM`)**
- **Preset C — High-Value Over-Mandate Request (`NVIDIA L40S Node - $450.00 -> Triggers PayPal JS SDK v6 Step-Up Co-Sign`)**
- **Custom URL / HTML Mode** (fetches live via KERNEL API when `KERNEL_API_KEY` is set!).

---

## 3. Astropods — Ephemeral Dev Container & Workspace Configuration

To support judges and developers using **Astropods** (or GitHub Codespaces / DevContainers) to spin up the entire polyglot `Rust 1.85 + Go 1.24 + Node 22 + PostgreSQL 16 + Redis` environment in the cloud with zero local setup:
- PactPay includes `.devcontainer/devcontainer.json` and `.astropods.yaml` at the root of the repository.
- Opening the repository in Astropods automatically builds `pactpay-firewall-rs`, `pactpay-orchestrator-go`, and `web/`, seeds the PostgreSQL escrow ledger, and forwards ports `3000` (Next.js Command Center), `8080` (Go Orchestrator), and `8081` (Rust Firewall & MCP Server).

---

## 4. Zapier — Automated FinOps & Fraud Alert Webhook Sink

When PactPay's Rust Firewall blocks a DOM prompt-injection attack (`verdict: "BLOCKED"`) or when our Go Orchestrator automatically voids an expired SLA hold (`state: "PAYPAL_VOIDED"`), enterprise FinOps teams (`P-04 Priya Nair`) want an instant alert in Slack, Microsoft Teams, Jira, or PagerDuty.

### Step-by-Step Human Setup for Zapier Webhook Integration (Optional — 2 Minutes)
1. Log into **[https://zapier.com/](https://zapier.com/)** → Click **Create Zap**.
2. For the **Trigger**, select **Webhooks by Zapier** → Event: **Catch Hook** → Copy the generated **Custom Webhook URL** (`https://hooks.zapier.com/hooks/catch/...`).
3. Save `ZAPIER_WEBHOOK_URL` safely into `g:\PAYPAL\.env`:
   ```bash
   printf "Enter ZAPIER_WEBHOOK_URL (typing hidden): " && read -s val && echo && echo "ZAPIER_WEBHOOK_URL=$val" >> ".env" && echo "Saved ZAPIER_WEBHOOK_URL."
   ```
4. For the **Action**, connect **Slack (`Send Channel Message`)** or **Email by Zapier** to post real-time alerts containing:
   - `event_type`: `PACTPAY_DOM_INJECTION_BLOCKED` | `PACTPAY_PAYPAL_AUTHORIZATION_VOIDED`
   - `paypal_order_id` & `paypal_auth_id`
   - `channel3_spread_bps` & `savings_usd`
   - `stripped_injection_snippet`

---

## 5. Master `.env.example` Template Reference (All Guides `01` – `09` Combined)

Below is the complete list of environment variables across all 9 integration guides (`g:\PAYPAL\.env.example`). Remember: **every external integration has a deterministic fallback built in**, so you only need to populate the keys you want to run against live remote endpoints!

```ini
# ============================================================================
# 1. PAYPAL SANDBOX CREDENTIALS (Guide 01 — REQUIRED FOR LIVE SANDBOX CALLS)
# ============================================================================
PAYPAL_ENV=sandbox
PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_FALLBACK_REPLAY=true

# ============================================================================
# 2. APIMATIC SDK & CONTEXT PLUGIN (Guide 02)
# ============================================================================
APIMATIC_API_KEY=

# ============================================================================
# 3. AG GRID ENTERPRISE & AG STUDIO (Guide 03 — Works without key in Eval Mode)
# ============================================================================
NEXT_PUBLIC_AG_GRID_LICENSE_KEY=

# ============================================================================
# 4. BRYNTUM SCHEDULER PRO & MCP (Guide 04 — Works with local bundle fallback)
# ============================================================================
BRYNTUM_NPM_TOKEN=
BRYNTUM_MCP_URL=https://mcp.bryntum.com/mcp

# ============================================================================
# 5. CHANNEL3 100M+ SKU PRICE ORACLE (Guide 05)
# ============================================================================
CHANNEL3_API_KEY=
CHANNEL3_API_BASE_URL=https://api.trychannel3.com/v1

# ============================================================================
# 6. ELASTIC CLOUD OPENTELEMETRY & VECTOR STORE (Guide 07 — Optional)
# ============================================================================
ELASTICSEARCH_URL=
ELASTIC_OTLP_ENDPOINT=
ELASTIC_API_KEY=

# ============================================================================
# 7. KERNEL CLOUD BROWSER & ZAPIER WEBHOOKS (Guide 09 — Optional)
# ============================================================================
KERNEL_API_KEY=
KERNEL_API_BASE_URL=https://api.onkernel.com/v1
ZAPIER_WEBHOOK_URL=

# ============================================================================
# 8. LOCAL DOCKER & INTERNAL SERVICE WIRING (Pre-configured)
# ============================================================================
DATABASE_URL=postgres://pactpay_admin:pactpay_local_secret@localhost:5432/pactpay?sslmode=disable
REDIS_URL=redis://localhost:6379/0
FIREWALL_RS_INTERNAL_URL=http://localhost:8081
NEXT_PUBLIC_ORCHESTRATOR_URL=http://localhost:8080
MANDATE_SIGNING_SEED_HEX=0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20
```
