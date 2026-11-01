# 05 — Channel3 Fair-Market Price Oracle & MCP Guide — TALOS
> Project: TALOS · Sponsor: **Channel3 (`$1,500` Cash — Best Use of Channel3)** · Judge: **Ignacio Valdez Bicard** (Founding Engineer, Channel3) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [00-TRACKS_AND_SUBMISSION_STRATEGY](00-TRACKS_AND_SUBMISSION_STRATEGY.md) · [01-PAYPAL_SANDBOX_STEP_BY_STEP](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) · [ARCHITECTURE](../03-engineering/ARCHITECTURE.md)

---

## 1. Strategic Overview: How TALOS Wins the `$1,500` Channel3 Prize

**Judge**: **Ignacio Valdez Bicard** (Founding Engineer, Channel3 — `https://trychannel3.com/`).

Almost every competing team in the hackathon will use **Channel3** as a passive product search box (*"search for shoes and show a list"*).
**TALOS elevates Channel3 into an active, cryptographic-grade Financial Security Oracle (`F-04`)**:
1. **Autonomous Agent Product Discovery**: When a human principal (`P-01 Arjun Mehta` or `P-02 Maya Lin`) gives the agent a procurement mandate (e.g., *"Source a Shure SM7B Dynamic Studio Microphone under `$300`"*), the agent queries **Channel3's 100M+ clean product catalog** (`POST /v1/products/search` / Channel3 MCP) with zero scraping required.
2. **The Anti-Gouging & Price-Tampering Oracle (`spread_bps` Guard)**:
   - Before TALOS's Go Orchestrator (`services/orchestrator-go`) permits any **PayPal Sandbox `Orders v2 AUTHORIZE`** hold on an external merchant URL, it spawns a parallel goroutine (`internal/channel3/oracle.go`) that queries Channel3 for all verified merchants carrying that exact SKU/GTIN/MPN.
   - It computes the **Fair-Market Median Price (`median_price_cents`)** and the attempted checkout's **Market Spread in Basis Points (`spread_bps`)**:
     $$\text{spread\_bps} = \left\lfloor \frac{\text{merchant\_price\_cents} - \text{channel3\_median\_cents}}{\text{channel3\_median\_cents}} \times 10,000 \right\rfloor$$
   - If the attempted checkout exceeds the user's KYA mandate spread threshold (default: `+1,500 bps` = `+15.00%` over Channel3 market median—such as our demo's `$480.00` poisoned storefront vs. Channel3's `$249.00` median, a **`+9,277 bps` (`+92.77%`) markup**), TALOS **blocks the gouged checkout in real time** and **automatically reroutes the PayPal `AUTHORIZE` hold to the lowest-priced verified Channel3 merchant (`$249.00`)**!
3. **Post-Capture Dispute Evidence Snapshot (`F-10`)**:
   - Every Channel3 product lookup (`title`, `brand`, `gtin`, `specs`, `image_url`, `verified_merchant_domain`, `median_price_cents`) is persisted in PostgreSQL (`E-05 channel3_benchmarks`). If a merchant ships a counterfeit item and a dispute arises, TALOS attaches the signed **Channel3 Canonical Product Specification Snapshot** directly to PayPal Sandbox's `/v1/customer/disputes/{id}/provide-evidence` endpoint!

---

## 2. Step-by-Step Human Actions on `trychannel3.com` (Phase `P0` / `P3`)

### Step 2.1 — Sign Up & Claim Your `$100` Free Hackathon Credits
1. Open your browser and navigate to **[https://trychannel3.com/](https://trychannel3.com/)**.
2. Click **Get Started / Sign Up** in the top-right corner and sign in with your GitHub or Google account.
3. Claim the **PayPal AI Hackathon `$100` Free Credits** promo code (listed in the Devpost Resources tab / participant welcome email) under **Billing / Credits** in the Channel3 dashboard.
4. Click **API Keys** in the left navigation bar → Click **Create New API Key** (`TALOS-Oracle-Key`).
5. Copy the generated key string (starts with `ch3_...` or `sk_...`). This is your `CHANNEL3_API_KEY`.

### Step 2.2 — Save `CHANNEL3_API_KEY` Using the Safe Credentials Protocol

> [!CRITICAL]
> Never paste `CHANNEL3_API_KEY` into the chat window. Run the safe hidden-input command below in your terminal at `g:\PAYPAL`.

```bash
# 1. Verify if CHANNEL3_API_KEY is already present in .env
grep -sq "^CHANNEL3_API_KEY=" .env && echo "CHANNEL3_API_KEY is set" || echo "MISSING: CHANNEL3_API_KEY"
```

```bash
# 2. Save CHANNEL3_API_KEY safely (Git Bash / WSL)
printf "Enter CHANNEL3_API_KEY (typing hidden): " && read -s val && echo && echo "CHANNEL3_API_KEY=$val" >> ".env" && echo "CHANNEL3_API_BASE_URL=https://api.trychannel3.com/v1" >> ".env" && echo "Saved CHANNEL3_API_KEY."
```

*(PowerShell alternative)*:
```powershell
$c3 = Read-Host "Enter CHANNEL3_API_KEY (typing hidden)" -AsSecureString; $c3Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($c3)); Add-Content -Path ".env" -Value "CHANNEL3_API_KEY=$c3Plain`nCHANNEL3_API_BASE_URL=https://api.trychannel3.com/v1"; Write-Host "Saved CHANNEL3_API_KEY."
```

---

## 3. Configuring Channel3 MCP + Go Oracle (`services/orchestrator-go/internal/channel3/oracle.go`)

### 3.1 — Adding Channel3 MCP Server to `.mcp.json`
Channel3 supports MCP so AI agents can query its 100M+ product catalog natively:
```json
{
  "mcpServers": {
    "channel3-catalog": {
      "command": "npx",
      "args": ["-y", "@channel3/mcp-server"],
      "env": {
        "CHANNEL3_API_KEY": "${CHANNEL3_API_KEY}"
      }
    }
  }
}
```

### 3.2 — Go Parallel Oracle Implementation (`services/orchestrator-go/internal/channel3/oracle.go`)
When `POST /api/v1/checkout/evaluate` (`API-05`) is called, Go executes `BenchmarkAndVerifySKU(ctx, req)` concurrently alongside our Rust Firewall DOM scan:

```go
package channel3

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"
)

type BenchmarkResult struct {
	SKUQuery                 string  `json:"sku_query"`
	MatchedProductID         string  `json:"matched_product_id"`
	CanonicalTitle           string  `json:"canonical_title"`
	GTIN                     string  `json:"gtin"`
	AttemptedPriceCents      int64   `json:"attempted_price_cents"`
	MedianPriceCents         int64   `json:"median_price_cents"`
	LowestVerifiedPriceCents int64   `json:"lowest_verified_price_cents"`
	LowestVerifiedMerchant   string  `json:"lowest_verified_merchant"`
	LowestMerchantURL        string  `json:"lowest_merchant_url"`
	SpreadBps                int64   `json:"spread_bps"`
	MaxAllowedSpreadBps      int64   `json:"max_allowed_spread_bps"`
	PriceGougingDetected     bool    `json:"price_gouging_detected"`
	AutoRerouted             bool    `json:"auto_rerouted"`
	SavingsCents             int64   `json:"savings_cents"`
	OracleMode               string  `json:"oracle_mode"` // "LIVE_CHANNEL3_API" or "CATALOG_CACHE_FALLBACK"
}
```

### 3.3 — Live API + Deterministic Catalog Cache Fallback
- When `CHANNEL3_API_KEY` is present in `.env`, `oracle.go` queries `https://api.trychannel3.com/v1/products/search` (`Authorization: Bearer $CHANNEL3_API_KEY`) with a `2,500ms` timeout, extracts all merchant offers for the matched GTIN/SKU, sorts them to compute the true statistical median (`MedianPriceCents`), and identifies the best verified merchant offer (`LowestVerifiedPriceCents`).
- If a judge runs `docker compose up` offline without a `CHANNEL3_API_KEY` (or if rate-limited), `oracle.go` seamlessly falls back to a pre-indexed snapshot of 25 real Channel3 hardware/electronics/SaaS SKUs (including the **Shure SM7B Dynamic Studio Microphone**, **Sony WH-1000XM5**, **Apple Mac Mini M4**, and **NVIDIA L40S Server Node**) so the price spread bar chart inside **AG Grid / AG Charts** works 100% of the time!

---

## 4. Verification Checklist for Judge Ignacio Valdez Bicard (`Best Use of Channel3`)

- [ ] **1. Live Price Spread Pill in AG Grid Blotter**: Every row in `AgStudioBlotter.tsx` has a dedicated **`Channel3 Spread`** column showing basis points (e.g., `+9,277 bps (BLOCKED - GOUGING)` in crimson vs. `-160 bps (OPTIMAL - VERIFIED)` in emerald).
- [ ] **2. AG Charts Price Distribution Inside Master-Detail Drawer**: Expanding any row shows an **AG Charts** bar chart comparing `Attempted Merchant Price` vs. `Channel3 100M+ Catalog Median` vs. `Channel3 Lowest Verified Offer`.
- [ ] **3. Automatic Reroute in Act 2 of Demo Video**: When the `$480` poisoned merchant is blocked in Act 1, TALOS automatically reroutes the purchase to the `$249` verified merchant discovered via Channel3 and locks the `$249` **PayPal Sandbox `Orders v2 AUTHORIZE`** hold!
