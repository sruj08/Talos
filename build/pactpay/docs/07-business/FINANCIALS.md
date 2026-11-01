# Financial Projections, Unit Economics & Funding Strategy — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Chief Financial Officer & Capital Allocation Council (Warren Buffett + Charlie Munger Bench) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [BUSINESS_MODEL](BUSINESS_MODEL.md) · [COST](../05-ops/COST.md) · [GTM](GTM.md)

---

## 1. Executive Financial Highlights

*(Exchange rate used throughout: `1 USD ($) = ₹84.00 INR`)*

1. **84.6% Blended Gross Margin**: Because PactPay executes `100%` of its inline DOM prompt-injection sanitization (`F-02`, `M-01`) locally in Rust on standard Render CPU instances (`$0.00` token cost, see `COST.md`), COGS is just **`15.4%` of revenue**—matching top-decile enterprise cybersecurity SaaS rather than low-margin LLM wrappers.
2. **Exceptional Capital Efficiency (`LTV : CAC = 11.4×`, Payback `= 2.6 Months`)**: Developer-led open-source MCP adoption (`P-02` → `P-01`) and **Channel3** merchant referral loops keep blended B2B Customer Acquisition Cost (CAC) at **`$680` (`₹57,120`)** against a 36-month Customer Lifetime Value (LTV) of **`$7,752` (`₹6,51,168`)**.
3. **Zero Balance-Sheet Credit or Custody Risk**: All escrow funds remain inside **PayPal's `Orders v2 AUTHORIZE` ledger** (`F-05`). PactPay carries `$0` in loan loss reserves or regulatory capital lockups.

---

## 2. Granular B2B Unit Economics (Growth B2B Customer Cohort — `P-01`)

| Unit Economic Metric | Value in USD (`$`) | Value in INR (`₹`) | Derivation & Assumptions |
| :--- | :--- | :--- | :--- |
| **Monthly Base SaaS Subscription (ARPU - SaaS)** | `$199.00 / mo` | `₹16,716 / mo` | Growth B2B Plan (`BUSINESS_MODEL.md` §3). |
| **Average Monthly Protected Escrow Volume (GPMV / Customer)** | `$65,000.00 / mo` | `₹54,60,000 / mo` | ~160 autonomous B2B hardware/SaaS/supply orders per month at `$406` avg order value. |
| **Monthly Escrow Take-Rate & Reroute Revenue (`15–50 bps`)** | `$92.50 / mo` | `₹7,770 / mo` | `15 bps` on volume above `$50k` cap (`$22.50`) + `50 bps` Channel3 merchant reroute fee on `$14k` rerouted volume (`$70.00`). |
| **Total Monthly Revenue per B2B Customer (Total ARPU)** | **`$291.50 / mo`** | **`₹24,486 / mo`** | `$199.00` SaaS + `$92.50` Take-Rate & Referral (`$3,498 / ₹2.93L` Annual ACV). |
| **Monthly COGS per B2B Customer (`COST.md`)** | `$44.89 / mo` | `₹3,771 / mo` | Render Rust/Go/PG/Valkey compute allocation (`$21.50`) + `M-02`/`M-03` LLM tokens (`$12.20`) + Channel3/KERNEL/Elastic (`$11.19`). |
| **Monthly Gross Profit per B2B Customer** | **`$246.61 / mo`** | **`₹20,715 / mo`** | **`84.6%` Gross Margin**. |
| **Blended Customer Acquisition Cost (CAC)** | **`$680.00`** | **`₹57,120`** | 65% bottom-up PLG from open-source MCP (`$180` CAC) + 35% outbound/partner B2B sales (`$1,610` CAC). |
| **CAC Payback Period** | **`2.76 Months`** | **`2.76 Months`** | `$680 CAC / $246.61 Monthly Gross Profit`. |
| **Annual Logo Churn / Net Dollar Retention (NDR)** | `9.5%` Logo Churn / **`132%` NDR** | `9.5%` / **`132%` NDR** | Expansion driven by customers adding more AI procurement agents (`E-02`) and upgrading to Enterprise (`$999/mo`). |
| **36-Month Customer Lifetime Value (LTV)** | **`$7,752.00`** | **`₹6,51,168`** | Gross margin adjusted over 31.4-month effective discounted lifetime. |
| **LTV : CAC Ratio** | **`11.4 ×`** | **`11.4 ×`** | `>3.0×` is venture benchmark; `11.4×` reflects open-source MCP distribution + Rust local inference cost moat. |

---

## 3. Three-Year Financial & P&L Projection (`Year 1` → `Year 3`)

| Line Item | Year 1 (Post-Hackathon Launch) | Year 2 (B2B Scale-Up) | Year 3 (Enterprise Clearinghouse) |
| :--- | :--- | :--- | :--- |
| **Free / Indie Developers (`P-02`)** | `2,500` devs | `14,000` devs | `55,000` devs |
| **Paying Growth B2B Customers (`P-01`, `$199/mo`)** | `180` companies | `950` companies | `3,200` companies |
| **Paying Enterprise FinOps Customers (`P-04`, `$999/mo`)** | `15` enterprises | `85` enterprises | `310` enterprises |
| **Total Active Autonomous Agents (`E-02`)** | `12,400` agents | `88,000` agents | `420,000` agents |
| **Gross Protected PayPal Escrow Volume (GPMV)** | **`$84.0M` (`₹705.6 Cr`)** | **`$640.0M` (`₹5,376 Cr`)** | **`$2.85B` (`₹23,940 Cr`)** |
| **SaaS Subscription Revenue** | `$609,660` (`₹5.12 Cr`) | `$3,287,580` (`₹27.61 Cr`) | `$11,357,880` (`₹95.41 Cr`) |
| **Escrow Take-Rate (`15 bps`) & Channel3 Referral (`50 bps`)** | `$192,000` (`₹1.61 Cr`) | `$1,420,000` (`₹11.93 Cr`) | `$6,180,000` (`₹51.91 Cr`) |
| **Total Annual Revenue (ARR Run-Rate)** | **`$801,660` (`₹6.73 Cr`)** | **`$4,707,580` (`₹39.54 Cr`)** | **`$17,537,880` (`₹147.32 Cr`)** |
| **Cost of Goods Sold (Render Infra + AI + Data APIs — `15.4%`)** | `$123,455` (`₹1.04 Cr`) | `$696,720` (`₹5.85 Cr`) | `$2,490,378` (`₹20.92 Cr`) |
| **Gross Profit** | **`$678,205` (`₹5.70 Cr`)** | **`$4,010,860` (`₹33.69 Cr`)** | **`$15,047,502` (`₹126.40 Cr`)** |
| **Gross Margin (%)** | **`84.6%`** | **`85.2%`** | **`85.8%`** |
| **R&D (Rust/Go/AI Engineering & Security Audits)** | `$380,000` (`₹3.19 Cr`) | `$1,650,000` (`₹13.86 Cr`) | `$4,800,000` (`₹40.32 Cr`) |
| **Sales, Developer Relations & GTM** | `$185,000` (`₹1.55 Cr`) | `$1,120,000` (`₹9.41 Cr`) | `$3,950,000` (`₹33.18 Cr`) |
| **G&A, Legal, SOC 2 / ISO 42001 & RBI Sandbox Compliance** | `$95,000` (`₹0.80 Cr`) | `$410,000` (`₹3.44 Cr`) | `$1,150,000` (`₹9.66 Cr`) |
| **EBITDA / Operating Income** | **`+$18,205` (`+₹15.29 Lakhs`)** | **`+$830,860` (`+₹6.98 Cr`)** | **`+$5,147,502` (`+₹43.24 Cr`)** |
| **EBITDA Margin (%)** | **`+2.3%` (Default Alive Year 1!)** | **`+17.6%`** | **`+29.3%`** |

---

## 4. Non-Dilutive Grants, Hackathon Prize Stack & Seed Funding Roadmap

### 4.1 Immediate Non-Dilutive Capital (Months 0–3: `$80,000+` / `₹67+ Lakhs`)
1. **PayPal AI Hackathon Prize Stack (`Up to $17,000 Cash + $2,500+ Credits` per Official Rules §8)**:
   - Targeting **1st Place Grand Prize (`$12,000`) / Best Use of Agentic Commerce (`$5,000`)** + **Best Use of AG Grid (`$5,000`) / Bryntum (`$1,000`) / APIMatic (`$1,000 + 6mo Business Sub`) / Channel3 (`$1,500`) / Render (`$1,000 Credits`)**.
   - Zero-burn runway: `$1,000` in Render credits covers `100%` of cloud infrastructure for the first 10.6 months (`COST.md`).
2. **India & Global Non-Dilutive Innovation Grants**:
   - **Startup India Seed Fund Scheme (SISFS)**: Up to **`₹20 Lakhs` (`~$24,000`)** non-dilutive grant for prototype/proof-of-concept validation and **`₹50 Lakhs` (`~$60,000`)** convertible debenture for market commercialization.
   - **MeitY Startup Hub (MSH) / IndiaAI Mission Safe & Trusted AI Grant**: Targeted funding for indigenous cybersecurity & AI guardrails (`pactpay-firewall-rs` local ONNX prompt-injection engine).
   - **Cloud & AI Startup Credits**: Elastic Startup Program, Anthropic/OpenAI Startup Credits, and Render Startup Partner credits.

### 4.2 Institutional Seed Round (Month 6 Target: `$1.5M` / `₹12.6 Cr` — Optional Acceleration)
Because PactPay is **Default Alive (`+$18.2k` EBITDA in Year 1)** on bootstrap/grant capital, we raise institutional venture capital strictly from position of strength once we cross `$25k MRR` (`₹21L MRR`):
- **Target Investors**: PayPal Ventures, Y Combinator, Peak XV Surge, Nexus Venture Partners, Lightspeed India.
- **Use of Proceeds (`$1.5M` / `₹12.6 Cr`)**:
  - `50%` (`$750k`): Core Rust Cryptographic Kernel & Multimodal OCR Prompt-Injection R&D + Go Multi-Rail Escrow Connectors.
  - `30%` (`$450k`): Developer Relations, MCP Registry dominance, and Enterprise FinOps GTM in US & India.
  - `20%` (`$300k`): SOC 2 Type II, ISO 27001, ISO 42001 certifications, and RBI Regulatory Sandbox cohort execution.
