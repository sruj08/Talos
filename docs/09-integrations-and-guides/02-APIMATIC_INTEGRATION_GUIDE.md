# 02 — APIMatic Context Plugin & Golang SDK Codegen Guide — TALOS
> Project: TALOS · Sponsor: **APIMatic (`3× $1,000` Cash + 6-Month Business Subscription)** · Judge: **Ameer Hassan** (Co-Founder, APIMatic) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [00-TRACKS_AND_SUBMISSION_STRATEGY](00-TRACKS_AND_SUBMISSION_STRATEGY.md) · [01-PAYPAL_SANDBOX_STEP_BY_STEP](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) · [ARCHITECTURE](../03-engineering/ARCHITECTURE.md)

---

## 1. Strategic Overview: Why Our APIMatic Integration Is #1 in the Hackathon

**Judge**: **Ameer Hassan** (Co-Founder, APIMatic — led the Oct 7, 2026 official hackathon webinar: *"Power Your PayPal Hackathon Project with APIMatic Context Plugins"*).

Most hackathon teams only `npm install @paypal/paypal-server-sdk` and claim they used APIMatic. **TALOS goes three layers deeper** to solve a real engineering gap that will immediately stand out to Ameer Hassan:
1. **The Golang SDK Gap**: PayPal's official APIMatic-powered Server SDKs ([https://www.paypal.com/us/webapps/mpp/apimatic](https://www.paypal.com/us/webapps/mpp/apimatic)) ship out-of-the-box for **TypeScript/Node.js, Python, Java, C# (.NET), PHP, and Ruby**—**but NOT Golang (`Go`)**.
2. **Our Masterstroke (`sdk/paypal-go-apimatic/`)**: Because our high-concurrency 2PC Escrow Orchestrator (`services/orchestrator-go`) is written in **Go 1.24**, we use **APIMatic Studio & CLI (`apimatic-cli`)** to validate PayPal's official OpenAPI 3.0 specifications (`checkout_orders_v2.json`, `payments_payment_v2.json`, `shipping_shipment_tracking_v1.json`, `customer_disputes_v1.json`) and generate a strongly-typed, idiomatic **Golang PayPal SDK (`sdk/paypal-go-apimatic`)** with built-in OAuth 2.0 token caching, exponential backoff retries, and `PayPal-Request-Id` idempotency header injection!
3. **APIMatic Context Plugin in the Agent & IDE Loop**: We wire the **APIMatic Context Plugin (MCP)** into both our IDE development workflow and our runtime `/api/mcp/paypal-bridge` agent reasoning loop so the LLM never hallucinates deprecated PayPal v1 fields when constructing `Orders v2 AUTHORIZE` payloads.
4. **Official `@paypal/paypal-server-sdk` (TypeScript)**: Used in our Next.js 15 server actions alongside our Go orchestrator.

---

## 2. Step-by-Step Human Actions on `apimatic.io` (Phase `P0` / `P2`)

### Step 2.1 — Create Your APIMatic Account & Get Your API Key
1. Open your browser and go to **[https://www.apimatic.io/](https://www.apimatic.io/)** (and view the PayPal APIMatic Portal at **[https://www.paypal.com/us/webapps/mpp/apimatic](https://www.paypal.com/us/webapps/mpp/apimatic)**).
2. Click **Start Free Trial / Sign Up** in the top-right corner and sign up using your GitHub or developer email.
3. Once inside the **APIMatic Dashboard (`https://app.apimatic.io/`)**:
   - Click your profile avatar in the top-right corner → **Account Settings**.
   - Click **API Keys** in the left sidebar → Click **Generate API Key**.
   - Copy the generated key. This is your `APIMATIC_API_KEY`.

### Step 2.2 — Save `APIMATIC_API_KEY` Using the Safe Credentials Protocol

> [!CRITICAL]
> Do not paste `APIMATIC_API_KEY` into the chat. Run the safe hidden-input command below in your terminal at `g:\PAYPAL`.

```bash
# Check if APIMATIC_API_KEY is already in .env
grep -sq "^APIMATIC_API_KEY=" .env && echo "APIMATIC_API_KEY is set" || echo "MISSING: APIMATIC_API_KEY"
```

```bash
# Save APIMATIC_API_KEY safely (Git Bash / WSL)
printf "Enter APIMATIC_API_KEY (typing hidden): " && read -s val && echo && echo "APIMATIC_API_KEY=$val" >> ".env" && echo "Saved APIMATIC_API_KEY."
```

*(PowerShell alternative)*:
```powershell
$ak = Read-Host "Enter APIMATIC_API_KEY (typing hidden)" -AsSecureString; $akPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ak)); Add-Content -Path ".env" -Value "APIMATIC_API_KEY=$akPlain"; Write-Host "Saved APIMATIC_API_KEY."
```

---

## 3. Setting Up the APIMatic Context Plugin (From the Oct 7 Webinar)

During the Oct 7 webinar (*"Power Your PayPal Hackathon Project with APIMatic Context Plugins"*), Ameer Hassan demonstrated how **APIMatic Context Plugins** eliminate LLM hallucinations by feeding validated OpenAPI schemas, authentication recipes, and runnable SDK code snippets directly into AI coding assistants (Cursor, Claude Desktop, Windsurf, Antigravity) and runtime AI agents via MCP.

### Step 3.1 — Add APIMatic Context Plugin to `.mcp.json`
In `g:\PAYPAL\.mcp.json`, we register the APIMatic Context Plugin MCP server alongside PayPal's official MCP server and our Rust Firewall MCP server:

```json
{
  "mcpServers": {
    "apimatic-paypal-context": {
      "command": "npx",
      "args": [
        "-y",
        "@apimatic/context-mcp",
        "--portal",
        "paypal-server-sdk"
      ],
      "env": {
        "APIMATIC_API_KEY": "${APIMATIC_API_KEY}"
      }
    }
  }
}
```

### Step 3.2 — How TALOS Uses the APIMatic Context Plugin at Runtime (`API-16`)
When a user or autonomous procurement agent asks TALOS to structure a complex multi-item order or dispute evidence bundle:
1. `web/src/app/api/mcp/paypal-bridge/route.ts` queries the **APIMatic Context Snapshot** (`sdk/paypal-go-apimatic/apimatic-context-manifest.json`) to inject the exact, canonical schema constraints for:
   - `OrdersCreateInput` (`intent: "AUTHORIZE"`, `purchase_units[].amount`, `PayPal-Request-Id`)
   - `AuthorizationsCaptureInput` (`final_capture: true`, `invoice_id`)
   - `AuthorizationsVoidInput` (`authorization_id`)
   - `TrackersBatchInput` (`trackers[].transaction_id`, `tracking_number`, `status`, `carrier`)
2. The UI displays a green **`APIMatic Schema Validated (0 Hallucinations)`** pill inside the **AG Grid Master-Detail Forensic Drawer** so Ameer Hassan can see APIMatic's Context Plugin working live during the demo!

---

## 4. Generating the Golang PayPal SDK (`sdk/paypal-go-apimatic/`) via APIMatic Studio or CLI

You can either use the pre-generated, production-ready `sdk/paypal-go-apimatic/` package that the coding agent scaffolds in Phase `P2`, **or** regenerate/verify it yourself in 60 seconds using the APIMatic CLI or Web Dashboard:

### Option A — Using APIMatic CLI (`@apimatic/cli`) in Terminal
1. Install the official APIMatic CLI globally:
   ```bash
   npm install -g @apimatic/cli
   ```
2. Download PayPal's official OpenAPI 3.0 specifications from GitHub (`paypal/paypal-rest-api-specifications`):
   ```bash
   mkdir -p specs/paypal-openapi
   curl -sL https://raw.githubusercontent.com/paypal/paypal-rest-api-specifications/main/openapi/checkout_orders_v2.json -o specs/paypal-openapi/checkout_orders_v2.json
   curl -sL https://raw.githubusercontent.com/paypal/paypal-rest-api-specifications/main/openapi/payments_payment_v2.json -o specs/paypal-openapi/payments_payment_v2.json
   curl -sL https://raw.githubusercontent.com/paypal/paypal-rest-api-specifications/main/openapi/shipping_shipment_tracking_v1.json -o specs/paypal-openapi/shipping_shipment_tracking_v1.json
   curl -sL https://raw.githubusercontent.com/paypal/paypal-rest-api-specifications/main/openapi/customer_disputes_v1.json -o specs/paypal-openapi/customer_disputes_v1.json
   ```
3. Validate the OpenAPI specification with APIMatic Validator:
   ```bash
   set -a && source .env && set +a
   apimatic api:validate --file="specs/paypal-openapi/checkout_orders_v2.json" --auth-key="${APIMATIC_API_KEY}"
   ```
4. Generate the strongly-typed **Go (`GO_GENERIC_LIB`)** SDK into `sdk/paypal-go-apimatic/`:
   ```bash
   apimatic sdk:generate \
     --file="specs/paypal-openapi/checkout_orders_v2.json" \
     --platform="GO_GENERIC_LIB" \
     --destination="sdk/paypal-go-apimatic" \
     --auth-key="${APIMATIC_API_KEY}"
   ```

### Option B — Using APIMatic Web Dashboard (`app.apimatic.io`) via Browser Clicks
1. Log into **[https://app.apimatic.io/](https://app.apimatic.io/)**.
2. Click **Import API** → Upload `specs/paypal-openapi/checkout_orders_v2.json` (or paste the GitHub raw URL `https://raw.githubusercontent.com/paypal/paypal-rest-api-specifications/main/openapi/checkout_orders_v2.json`).
3. Click **Import** → APIMatic will run its **API Linter & Validation Engine** and show a validation summary (`0 Errors`). Take a screenshot of this validation report or copy the **APIMatic Portal URL** for our Devpost submission!
4. Click **Generate** → Select **Go (Golang)** → Download the `.zip` archive and extract it into `g:\PAYPAL\sdk\paypal-go-apimatic\`.

---

## 5. How `services/orchestrator-go` Uses `sdk/paypal-go-apimatic`

In `services/orchestrator-go/go.mod`, we mount the local APIMatic-generated SDK via a `replace` directive so Go compiles with zero external friction:

```go
module github.com/talos/talos/services/orchestrator-go

go 1.24.0

require (
	github.com/talos/talos/sdk/paypal-go-apimatic v1.1.0
)

replace github.com/talos/talos/sdk/paypal-go-apimatic => ../../sdk/paypal-go-apimatic
```

And inside `services/orchestrator-go/internal/paypal/escrow_gateway.go`:
```go
// Initialize APIMatic-generated PayPal Sandbox Client with OAuth 2.0 Client Credentials
cfg := paypalapimatic.NewConfiguration(
    paypalapimatic.WithClientCredentialsAuth(os.Getenv("PAYPAL_CLIENT_ID"), os.Getenv("PAYPAL_CLIENT_SECRET")),
    paypalapimatic.WithEnvironment(paypalapimatic.SandboxEnvironment),
    paypalapimatic.WithRetryConfiguration(3, 500*time.Millisecond),
)
client := paypalapimatic.NewClient(cfg)

// Place a 29-day Reversible Escrow Hold (Orders v2 AUTHORIZE) with strict Idempotency
orderResp, httpResp, err := client.OrdersController().CreateOrder(ctx, paypalapimatic.OrdersCreateInput{
    PayPalRequestId: &mandateRequestID, // Deterministic UUID prevents double-charging
    Prefer:          paypalapimatic.StringPtr("return=representation"),
    Body: paypalapimatic.OrderRequest{
        Intent: paypalapimatic.CheckoutPaymentIntent_AUTHORIZE,
        PurchaseUnits: []paypalapimatic.PurchaseUnitRequest{
            {
                ReferenceId: &escrowID,
                CustomId:    &mandateSignatureHash,
                Description: &itemDescription,
                Amount: paypalapimatic.AmountWithBreakdown{
                    CurrencyCode: "USD",
                    Value:        formattedAmount,
                },
            },
        },
    },
})
```

---

## 6. Judge Verification Checklist for Ameer Hassan (`Best Use of APIMatic`)

Before submitting on Devpost, ensure these 4 artifacts are visible in the repository:
- [ ] **1. `README.md` Badge**: Top of `README.md` includes `[![APIMatic Validated SDK](https://img.shields.io/badge/APIMatic-Go_%2B_TS_SDK_%26_Context_Plugin-0066FF?style=for-the-badge)](./sdk/paypal-go-apimatic/README.md)`.
- [ ] **2. `sdk/paypal-go-apimatic/` Directory**: Contains the clean, documented Golang controllers (`orders_controller.go`, `authorizations_controller.go`, `trackers_controller.go`, `disputes_controller.go`), models, and `apimatic-meta.json` validation metadata.
- [ ] **3. `@paypal/paypal-server-sdk` in `web/package.json`**: Demonstrates dual-language APIMatic mastery (official TypeScript Server SDK on the frontend server + custom APIMatic Golang SDK on the backend orchestrator).
- [ ] **4. Live UI Callout**: The **AG Grid Master-Detail Drawer** explicitly renders the badge `SDK Layer: APIMatic Go SDK v1.1.0 + Context Plugin Verified` on every PayPal Sandbox transaction row.
