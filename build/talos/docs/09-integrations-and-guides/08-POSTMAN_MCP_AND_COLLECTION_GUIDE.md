# 08 — Postman MCP Client & 1-Click Judge Collection Guide — TALOS
> Project: TALOS · Jury Alignment: **Postman** · Judge: **Pooja Mistry** (Developer Advocate, Postman) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [00-TRACKS_AND_SUBMISSION_STRATEGY](00-TRACKS_AND_SUBMISSION_STRATEGY.md) · [01-PAYPAL_SANDBOX_STEP_BY_STEP](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) · [API_SPEC](../03-engineering/API_SPEC.md)

---

## 1. Strategic Overview: Why TALOS Ships a 1-Click Postman MCP & REST Harness

**Judge #12**: **Pooja Mistry** (Developer Advocate at **Postman**, specializing in AI Agent API testing, Model Context Protocol [MCP] inspection in Postman, and API-first developer experience).

Just like Carly Richmond at Elastic, **Pooja Mistry sits on the 13-judge panel scoring every project across all five 20% criteria**.
To make Pooja Mistry (and every technical judge on the panel) fall in love with TALOS in the first 30 seconds of inspecting our GitHub repository:
1. We place a prominent **"Run in Postman"** badge at the top of `README.md`.
2. We ship two version-controlled files in `/postman/`:
   - `postman/Talos-Sandbox-MCP.postman_collection.json` (Complete Postman Collection v2.1 with automated `pm.test()` assertion scripts for every Rust Firewall endpoint, Go Orchestrator endpoint, and live PayPal Sandbox lifecycle step).
   - `postman/Talos-Sandbox.postman_environment.json` (Pre-configured environment variables chaining `mandate_id` → `escrow_id` → `paypal_order_id` → `paypal_authorization_id` → `paypal_capture_id` automatically across requests!).
3. We include a step-by-step configuration for **Postman's built-in MCP Client** so Pooja Mistry can connect Postman directly to our **Rust Zero-Trust MCP Server (`talos-firewall-rs`)** over `stdio` or `HTTP/SSE` and invoke `talos_issue_mandate`, `talos_sanitize_dom`, and `talos_execute_protected_checkout` interactively!

---

## 2. Step-by-Step Human Actions in Postman (Phase `P7`)

### Step 2.1 — Import the TALOS Collection & Environment into Postman
1. Open the **Postman Desktop App** or **[https://go.postman.co/](https://go.postman.co/)**.
2. Click **Import** in the top-left corner of your workspace.
3. Drag and drop both files from `g:\PAYPAL\postman\`:
   - `g:\PAYPAL\postman\Talos-Sandbox-MCP.postman_collection.json`
   - `g:\PAYPAL\postman\Talos-Sandbox.postman_environment.json`
4. In the top-right **Environment selector dropdown**, select **`TALOS — PayPal Sandbox & Local/Render Environment`**.
5. Click the **Environment Quick Look (eye icon)** in the top-right and verify/paste your `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` into the `Current Value` column (never commit secrets into `Initial Value`; our committed environment file keeps `Initial Value` clean with safe placeholders).

### Step 2.2 — Test Our Rust MCP Server Using Postman's Native MCP Client
Postman v11+ includes a first-class **MCP Request Client** specifically highlighted by Postman's Developer Relations team:
1. In Postman, click **New → MCP Request**.
2. Choose **Transport Type**:
   - **Option A (`HTTP/SSE` — Works with both Local & Render Cloud!)**:
     - Enter URL: `http://localhost:8081/mcp/sse` (or `https://talos-firewall-rs.onrender.com/mcp/sse`).
   - **Option B (`STDIO` — Local Rust Binary)**:
     - Enter Command: `g:/PAYPAL/services/firewall-rs/target/release/talos-firewall-rs --mcp-stdio`
3. Click **Connect**. Postman will automatically discover and list TALOS's 4 registered MCP tools:
   - `talos_issue_mandate`
   - `talos_verify_mandate`
   - `talos_sanitize_dom`
   - `talos_execute_protected_checkout`
4. Select `talos_sanitize_dom`, paste the sample poisoned merchant HTML payload, click **Run Tool**, and watch the `<3ms` sanitized output and `DeBERTa-v3` risk score appear in Postman!

### Step 2.3 — (Optional) Generate a Public Workspace Link for `README.md`
1. In Postman, click **Workspace Settings** → Change visibility to **Public** (ensuring no secret keys are in `Initial Value`).
2. Click the three dots (`...`) next to **`TALOS — Zero-Trust Agentic Commerce & PayPal Sandbox Escrow`** collection → **Share** → **Via Run in Postman** → Copy the Markdown snippet into `README.md`.

---

## 3. Complete Folder & Request Sequence Inside `Talos-Sandbox-MCP.postman_collection.json`

Our Postman Collection is organized into **4 sequential folders** with built-in `pm.test()` assertions and `pm.environment.set()` variable chaining so a judge can click **"Run Collection"** in the Postman Collection Runner and watch **12 automated API tests turn green in 4 seconds**:

| Folder | Request # & Name | Method & URL | Automated `pm.test()` Assertions Included |
| :--- | :--- | :--- | :--- |
| **1. Rust KYA & DOM Firewall (`:8081`)** | `1.1 Health & ONNX Engine Check` | `GET {{firewall_url}}/healthz` | Asserts `200 OK`, `engine == "lol_html+deberta_v3_onnx"`, latency `< 10ms`. |
| | `1.2 Sign Ed25519 KYA Mandate` | `POST {{firewall_url}}/v1/mandates/sign` | Asserts valid 128-hex `ed25519_signature`; saves `{{mandate_id}}` and `{{mandate_sig}}` to environment. |
| | `1.3 Scan Poisoned Merchant DOM (Attack Trap)` | `POST {{firewall_url}}/v1/firewall/sanitize-dom` | Sends hidden `<span style="display:none">SYSTEM OVERRIDE...</span>`; asserts `injection_detected == true`, `verdict == "BLOCKED"`, latency `< 15ms`. |
| **2. Channel3 Fair-Market Price Oracle (`:8080`)** | `2.1 Benchmark SKU & Detect Price Gouging` | `POST {{orchestrator_url}}/api/v1/channel3/benchmark` | Sends `$480.00` Shure SM7B listing; asserts `median_price_cents == 24900`, `spread_bps > 1500`, `price_gouging_detected == true`. |
| **3. PayPal Sandbox 2PC Escrow Lifecycle (`:8080` + `api-m.sandbox.paypal.com`)** | `3.1 Direct PayPal Sandbox OAuth2 Token Check` | `POST https://api-m.sandbox.paypal.com/v1/oauth2/token` | Authenticates with `{{PAYPAL_CLIENT_ID}}` + `{{PAYPAL_CLIENT_SECRET}}`; saves `{{paypal_access_token}}`. |
| | `3.2 Execute Protected Checkout (Reroute + Orders v2 AUTHORIZE)` | `POST {{orchestrator_url}}/api/v1/checkout/evaluate` | Verifies KYA mandate, reroutes to `$249.00` verified merchant, creates PayPal Sandbox `AUTHORIZE` hold; saves `{{escrow_id}}`, `{{paypal_order_id}}`, `{{paypal_auth_id}}`. |
| | `3.3 Attach Carrier Tracking (Shipment Tracking v1)` | `POST {{orchestrator_url}}/api/v1/escrow/{{escrow_id}}/tracking` | Attaches `FEDEX #779812349812` (`status: "DELIVERED"`); asserts Bryntum SLA task updated. |
| | `3.4 Happy Path: Auto-Capture Authorized Hold` | `POST {{orchestrator_url}}/api/v1/escrow/{{escrow_id}}/capture` | Calls PayPal Sandbox `POST /v2/payments/authorizations/{{paypal_auth_id}}/capture`; asserts state `PAYPAL_CAPTURED`. |
| | `3.5 SLA Breach Path: Create Second Hold & Instant VOID` | `POST {{orchestrator_url}}/api/v1/escrow/{{escrow_id_2}}/void` | Simulates Bryntum timeline SLA breach; calls PayPal Sandbox `POST /v2/payments/authorizations/{{paypal_auth_id_2}}/void`; asserts state `PAYPAL_VOIDED` & `0s` fund release. |
| **4. Disputes & Audit Blotter (`:8080`)** | `4.1 Submit Tamper-Evident Dispute Evidence Bundle` | `POST {{orchestrator_url}}/api/v1/escrow/{{escrow_id}}/dispute-evidence` | Packages `Ed25519` mandate + Channel3 SKU snapshot + KERNEL DOM screenshot for `/v1/customer/disputes/{id}/provide-evidence`. |
| | `4.2 Fetch AG Grid / AG Studio Live Blotter State` | `GET {{orchestrator_url}}/api/v1/escrow/blotter` | Asserts paginated rows contain `firewallScan`, `channel3Benchmark`, and `paypalSandbox` fields. |
| | `4.3 Fetch Bryntum Scheduler Pro SLA Timeline` | `GET {{orchestrator_url}}/api/v1/sla/timeline` | Asserts `resources`, `events`, and `dependencies` arrays match Bryntum Scheduler Pro v6 schema. |

---

## 4. Running the Collection via CLI (`newman`) in CI/CD

Any judge or developer can also run our entire Postman suite headlessly from the terminal in 1 command:
```bash
npx newman run postman/Talos-Sandbox-MCP.postman_collection.json \
  -e postman/Talos-Sandbox.postman_environment.json \
  --reporters cli
```
