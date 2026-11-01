# 01 — PayPal Sandbox & 4-Surface Integration Guide — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Sponsor / Organizer: **PayPal (`$45,000` Core Prizes + All Categories)** · Judges: **Prakhar Mehrotra** (Sr. Director of AI, PayPal), **Joyojeet Pal**, **Devansh** · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [00-TRACKS_AND_SUBMISSION_STRATEGY](00-TRACKS_AND_SUBMISSION_STRATEGY.md) · [02-APIMATIC_INTEGRATION_GUIDE](02-APIMATIC_INTEGRATION_GUIDE.md) · [ARCHITECTURE](../03-engineering/ARCHITECTURE.md)

---

## 1. Overview: Why PayPal Sandbox Is the Heart of PactPay

Per **Official Rules §4 & §6**, every transaction in the PayPal AI Hackathon **must** execute in the free **PayPal Sandbox (`https://api-m.sandbox.paypal.com`)** and must never ask judges to connect real bank accounts or credit cards.

To win **1st Place Grand Prize (`$12,000`)**, **Best Use of Agentic Commerce (`$5,000`)**, and **Best Use of PayPal + AI (`$5,000`)**, PactPay integrates **four distinct PayPal technical surfaces** across our polyglot stack:
1. **Surface A — PayPal Agent Toolkit & Official MCP Server (`@paypal/agent-toolkit` / `https://mcp.paypal.com`)**: Used by the AI procurement agent for natural-language order creation, carrier tracking attachment (`create_tracking`, `get_tracking`), and dispute inspection (`list_disputes`, `get_dispute`).
2. **Surface B — Custom APIMatic-Generated Golang SDK (`sdk/paypal-go-apimatic`)**: Used by our high-concurrency Go Escrow Orchestrator (`services/orchestrator-go`) to execute deterministic Two-Phase Commit (2PC) escrow state transitions (`Orders v2 AUTHORIZE` → `Shipment Tracking v1` → `Authorizations CAPTURE` or `Authorizations VOID` → `Customer Disputes v1 /provide-evidence`).
3. **Surface C — Official `@paypal/paypal-server-sdk` (TypeScript)**: Used in our Next.js 15 `/api/mcp/paypal-bridge` server routes alongside the **APIMatic Context Plugin**.
4. **Surface D — PayPal JS SDK v6 (`@paypal/react-paypal-js`)**: Used in `web/src/components/PayPalStepUpModal.tsx` to render a live Human-in-the-Loop biometric/step-up co-sign modal whenever an agent checkout exceeds its autonomous `Ed25519` mandate limit (e.g., `>$300`).

---

## 2. Step-by-Step Human Actions on `developer.paypal.com` (Phase `P0` / `P2`)

Follow these exact click-by-click steps on your machine to provision your PayPal Sandbox credentials.

### Step 2.1 — Log In & Switch to Sandbox Mode
1. Open your browser and navigate to **[https://developer.paypal.com/](https://developer.paypal.com/)**.
2. Click **Log into Dashboard** in the top-right corner and sign in with your regular PayPal account (no credit card or bank link is required to use the Developer Sandbox).
3. Look at the **top-left toggle switch** directly below the PayPal Developer logo:
   - Ensure the toggle is switched to **Sandbox** (blue highlight), **NOT** `Live`.

### Step 2.2 — Create Your REST API App (`PactPay-Agentic-Escrow`)
1. In the left navigation bar (or top menu), click **Apps & Credentials**.
2. Confirm again that the **Sandbox** tab is selected.
3. Click the blue **Create App** button.
4. Fill in the modal:
   - **App Name**: `PactPay-Agentic-Escrow`
   - **Type**: Select **Merchant** (or **Platform** if prompted; **Merchant** is simplest and enables `Orders v2`, `Authorizations`, `Tracking v1`, and `Disputes v1` immediately).
   - **Sandbox Business Account**: Select your default `sb-...business.example.com` account from the dropdown.
5. Click **Create App**.
6. You will land on the App Details screen. Locate the **API Credentials** panel:
   - Copy the **Client ID** (starts with `A...`, ~80 characters). This will be your `PAYPAL_CLIENT_ID` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
   - Click **Show** under **Secret key 1** and copy the secret string (starts with `E...`, ~80 characters). This will be your `PAYPAL_CLIENT_SECRET`.
7. Scroll down on the same App Details page to **Features / App Settings** and ensure the following boxes are checked:
   - [x] **Accept payments** (Advanced Credit and Debit Card Payments / PayPal Checkout)
   - [x] **Package tracking** (Shipment Tracking API v1)
   - [x] **Disputes** (Customer Disputes API v1)
   - [x] **Payouts** (optional bonus)
   - Click **Save** if you changed any checkboxes.

### Step 2.3 — Create / Inspect Pre-Funded Sandbox Buyer & Merchant Accounts
Judges need pre-funded Sandbox accounts so they can test 1-click checkouts and the **PayPal JS SDK v6** step-up approval modal without logging into their own accounts.

1. In the left sidebar of the PayPal Developer Dashboard, go to **Testing Tools → Sandbox Accounts**.
2. You will see two default accounts (`...personal.example.com` and `...business.example.com`). You can either use these or click **Create account** to create clean, memorable aliases:
   - **Account #1 — Buyer (Human Principal / Agent Wallet)**:
     - Click **Create account** → Choose **Personal (Buyer Account)** → Country: **United States (US)**.
     - Click **Create custom account** (at the bottom of the popup) so you can set:
       - **Email**: `buyer-pactpay@personal.example.com`
       - **Password**: `PactPaySandbox2026!`
       - **PayPal Balance**: `5000.00` USD
     - Click **Create Account**.
   - **Account #2 — Verified Merchant (Seller)**:
     - Click **Create account** → Choose **Business (Merchant Account)** → Country: **United States (US)**.
     - Click **Create custom account**:
       - **Email**: `merchant-pactpay@business.example.com`
       - **Password**: `PactPayMerchant2026!`
       - **PayPal Balance**: `1000.00` USD
     - Click **Create Account**.

> [!TIP]
> You can view inbound Sandbox emails and receipts sent to these test accounts at any time by visiting **[https://developer.paypal.com/dashboard/notifications](https://developer.paypal.com/dashboard/notifications)**, and you can log into the Sandbox consumer/merchant web wallet directly at **[https://www.sandbox.paypal.com/](https://www.sandbox.paypal.com/)**.

### Step 2.4 — Configure PayPal Sandbox Webhooks (`PAYPAL_WEBHOOK_ID`)
PactPay's Rust Firewall (`services/firewall-rs/src/webhook_verify.rs`) cryptographically verifies incoming PayPal Sandbox webhooks (`PAYPAL-TRANSMISSION-SIG` + `CRC32`), and our Go Orchestrator (`POST /api/v1/webhooks/paypal`) transitions escrow state on webhook receipt.

1. Go back to **Apps & Credentials** → Click on your **`PactPay-Agentic-Escrow`** app.
2. Scroll down to the **Sandbox Webhooks** section and click **Add Webhook**.
3. Enter your **Webhook URL**:
   - **When deployed on Render (Phase `P8`)**: `https://pactpay-orchestrator-go.onrender.com/api/v1/webhooks/paypal`
   - **When testing locally on your laptop (Phase `P2`)**: Start an `ngrok` or Cloudflare tunnel pointing to port `8080` (`ngrok http 8080`) and paste `https://<your-subdomain>.ngrok-free.app/api/v1/webhooks/paypal`.
4. Under **Event types**, select the following **5 events** (or click *All Events* for simplicity):
   - [x] `Checkout order approved` (`CHECKOUT.ORDER.APPROVED`)
   - [x] `Payment authorization created` (`PAYMENT.AUTHORIZATION.CREATED`)
   - [x] `Payment authorization voided` (`PAYMENT.AUTHORIZATION.VOIDED`)
   - [x] `Payment capture completed` (`PAYMENT.CAPTURE.COMPLETED`)
   - [x] `Customer dispute created` (`CUSTOMER.DISPUTE.CREATED`)
5. Click **Save**.
6. Once saved, look at the **Sandbox Webhooks** table and copy the **Webhook ID** (a 17-character alphanumeric string like `4JH82910384719283`). This is your `PAYPAL_WEBHOOK_ID`.

---

## 3. Safe Credentials Protocol: Saving Your PayPal Keys to `.env`

> [!CRITICAL]
> **Never paste your `PAYPAL_CLIENT_SECRET` directly into the AI chat window.** Use the safe `credentials` terminal protocol below so your typing is hidden (`read -s` / `-AsSecureString`) and written directly into `g:\PAYPAL\.env`.

### Step 3.1 — Verify Whether Keys Already Exist (Agent & Human Safe Check)
Run in Git Bash / WSL from `g:/PAYPAL`:
```bash
grep -sq "^PAYPAL_CLIENT_ID=" .env && echo "PAYPAL_CLIENT_ID is set" || echo "MISSING: PAYPAL_CLIENT_ID"
grep -sq "^PAYPAL_CLIENT_SECRET=" .env && echo "PAYPAL_CLIENT_SECRET is set" || echo "MISSING: PAYPAL_CLIENT_SECRET"
grep -sq "^PAYPAL_WEBHOOK_ID=" .env && echo "PAYPAL_WEBHOOK_ID is set" || echo "MISSING: PAYPAL_WEBHOOK_ID"
```

### Step 3.2 — Prompt & Save Keys Safely Without Echoing to Screen

#### Option A: Git Bash / WSL / macOS / Linux Terminal (Standard `credentials` Skill Template)
Run each line one by one in `g:/PAYPAL`:
```bash
printf "Enter PAYPAL_CLIENT_ID (typing hidden): " && read -s val && echo && echo "PAYPAL_CLIENT_ID=$val" >> ".env" && echo "NEXT_PUBLIC_PAYPAL_CLIENT_ID=$val" >> ".env" && echo "Saved PAYPAL_CLIENT_ID."
```
```bash
printf "Enter PAYPAL_CLIENT_SECRET (typing hidden): " && read -s val && echo && echo "PAYPAL_CLIENT_SECRET=$val" >> ".env" && echo "Saved PAYPAL_CLIENT_SECRET."
```
```bash
printf "Enter PAYPAL_WEBHOOK_ID (typing hidden): " && read -s val && echo && echo "PAYPAL_WEBHOOK_ID=$val" >> ".env" && echo "Saved PAYPAL_WEBHOOK_ID."
```
```bash
echo "PAYPAL_ENV=sandbox" >> ".env"
echo "PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com" >> ".env"
```

#### Option B: Windows PowerShell (Native Windows Equivalent with Hidden Typing)
If you are running inside Windows PowerShell in `g:\PAYPAL`:
```powershell
$cid = Read-Host "Enter PAYPAL_CLIENT_ID (typing hidden)" -AsSecureString; $cidPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($cid)); Add-Content -Path ".env" -Value "PAYPAL_CLIENT_ID=$cidPlain`nNEXT_PUBLIC_PAYPAL_CLIENT_ID=$cidPlain"; Write-Host "Saved PAYPAL_CLIENT_ID."
$sec = Read-Host "Enter PAYPAL_CLIENT_SECRET (typing hidden)" -AsSecureString; $secPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)); Add-Content -Path ".env" -Value "PAYPAL_CLIENT_SECRET=$secPlain"; Write-Host "Saved PAYPAL_CLIENT_SECRET."
$wh = Read-Host "Enter PAYPAL_WEBHOOK_ID (typing hidden)" -AsSecureString; $whPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($wh)); Add-Content -Path ".env" -Value "PAYPAL_WEBHOOK_ID=$whPlain`nPAYPAL_ENV=sandbox`nPAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com"; Write-Host "Saved PAYPAL_WEBHOOK_ID."
```

---

## 4. Instant Smoke Test: Verify Your PayPal Sandbox Credentials Work

Before running the full stack, verify that your `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` obtain a valid Sandbox OAuth 2.0 Bearer token (`POST https://api-m.sandbox.paypal.com/v1/oauth2/token`):

```bash
# Run in Git Bash / WSL from g:/PAYPAL (loads .env without printing secrets)
set -a && source .env && set +a && \
curl -s -X POST "https://api-m.sandbox.paypal.com/v1/oauth2/token" \
  -u "${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" | grep -o '"token_type":"Bearer"' && echo "✅ PayPal Sandbox OAuth 2.0 Verified!"
```

---

## 5. How All 4 PayPal Technical Surfaces Are Wired in PactPay

### Surface 1: PayPal Agent Toolkit & MCP (`@paypal/agent-toolkit` & `https://mcp.paypal.com`)
Located in `web/src/app/api/mcp/paypal-bridge/route.ts` and `.mcp.json`.
- **Installation**:
  ```bash
  cd web && npm install @paypal/agent-toolkit @paypal/paypal-server-sdk @paypal/react-paypal-js
  ```
- **MCP Configuration (`.mcp.json` at repo root)**:
  ```json
  {
    "mcpServers": {
      "paypal-official-mcp": {
        "command": "npx",
        "args": ["-y", "@paypal/mcp", "--tools=all"],
        "env": {
          "PAYPAL_ACCESS_TOKEN": "${PAYPAL_SANDBOX_ACCESS_TOKEN}",
          "PAYPAL_ENVIRONMENT": "SANDBOX"
        }
      },
      "pactpay-firewall-rs": {
        "command": "./services/firewall-rs/target/release/pactpay-firewall-rs",
        "args": ["--mcp-stdio"],
        "env": {
          "RUST_LOG": "info"
        }
      }
    }
  }
  ```
- **Exact Tools Used from `@paypal/agent-toolkit`**:
  - `orders.create` / `orders.get` / `orders.capture`
  - `shipment_tracking.create` / `shipment_tracking.get` (used in Act 2 of our demo when carrier delivery is verified!)
  - `disputes.list` / `disputes.get` (used in Act 3 / `F-10` when inspecting post-capture disputes!)

### Surface 2: Reversible 2PC Escrow via `Orders v2 AUTHORIZE` + `Capture` / `Void` (Go Orchestrator)
Located in `services/orchestrator-go/internal/paypal/client.go` (wrapping `sdk/paypal-go-apimatic`).
- **Step A — Create Order with `intent: "AUTHORIZE"`**:
  - Endpoint: `POST https://api-m.sandbox.paypal.com/v2/checkout/orders`
  - Header: `PayPal-Request-Id: <deterministic-uuid-v5-from-mandate-id>` (enforces idempotency in PayPal Sandbox + Redis `E-10`).
  - Body:
    ```json
    {
      "intent": "AUTHORIZE",
      "purchase_units": [
        {
          "reference_id": "ESCROW-SM7B-001",
          "description": "KYA Protected Agentic Purchase: Shure SM7B Dynamic Studio Microphone (Verified via Channel3)",
          "custom_id": "MANDATE-ED25519-9F8A7B",
          "amount": {
            "currency_code": "USD",
            "value": "249.00"
          }
        }
      ],
      "payment_source": {
        "paypal": {
          "experience_context": {
            "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
            "user_action": "PAY_NOW",
            "return_url": "http://localhost:3000/escrow/approved",
            "cancel_url": "http://localhost:3000/escrow/cancelled"
          }
        }
      }
    }
    ```
- **Step B — Authorize Order (`POST /v2/checkout/orders/{order_id}/authorize`)**:
  - Locks the buyer's `$249.00` in a **29-day PayPal Authorization Hold** (3-day honor period guaranteed) and returns `authorization_id` (e.g., `2A84910293847192D`).
- **Step C — Attach Carrier Tracking (`POST /v1/shipping/trackers-batch`)**:
  - Binds carrier tracking (`carrier: "FEDEX"`, `tracking_number: "779812349812"`, `status: "SHIPPED" -> "DELIVERED"`) to the transaction and updates **Bryntum Scheduler Pro**.
- **Step D1 — Happy Path Settlement (`POST /v2/payments/authorizations/{authorization_id}/capture`)**:
  - Triggered automatically by Go the instant carrier tracking confirms `DELIVERED` within the Bryntum SLA window.
- **Step D2 — Attack / SLA Breach Rollback (`POST /v2/payments/authorizations/{authorization_id}/void`)**:
  - Triggered in 0 seconds when a merchant misses the delivery deadline on **Bryntum Scheduler Pro** or when a user drags/cancels the SLA bar on the timeline. Returns `204 No Content` and releases 100% of funds back to the buyer.

### Surface 3: PayPal JS SDK v6 (`@paypal/react-paypal-js`) Step-Up Co-Sign Modal
Located in `web/src/components/PayPalStepUpModal.tsx`.
- Whenever an AI agent attempts a purchase exceeding the autonomous KYA mandate cap (e.g., `$450.00 > $300.00 cap`), PactPay's Rust Firewall returns `STEP_UP_REQUIRED` instead of rejecting outright.
- The frontend opens a modal rendering `<PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, intent: "authorize", currency: "USD" }}>` and `<PayPalButtons createOrder={...} onApprove={...} />` so the human principal can biometrically co-sign the authorization in 1 click.

---

## 6. Dual-Mode Resilience (`R-01` Mitigation): Live Sandbox + Deterministic Replay Fallback

PayPal Sandbox occasionally experiences transient `503 Service Unavailable` spikes during hackathon crunch hours. To ensure judges **never** encounter a broken screen:
- When `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are present in `.env`, `pactpay-orchestrator-go` executes **100% live HTTPS calls** against `https://api-m.sandbox.paypal.com` and displays the live Sandbox `PayPal-Debug-Id` response header in the **AG Grid Master-Detail drawer**.
- If `api-m.sandbox.paypal.com` times out (`>4500ms`) or if a judge runs `docker compose up` offline without adding keys yet, Go automatically falls back to **Recorded Sandbox Replay Mode** (`PAYPAL_FALLBACK_REPLAY=true`), returning authentic pre-captured PayPal Sandbox JSON payloads with a clear badge (`SANDBOX_MODE: LIVE` vs `SANDBOX_MODE: RECORDED_REPLAY`).
