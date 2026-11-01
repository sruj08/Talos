# Track B — Sponsors & Partner Ecosystem (`B-sponsors.md`)

## 1. Strategic Sponsor Matrix & Prize Stacking Math

Under **Official Rules §8**, a single project can win **at most 1 Grand Prize (or 1 Honorable Mention) + 1 Sponsor Prize**.
- **Maximum Single-Project Cash Payout**: **$17,000 USD** = **$12,000** (1st Place Grand Prize) + **$5,000** (Best Use of AG Grid / AG Studio 1st Place).
- Because **Technological Implementation (20%)** and **Design (20%)** are the #1 and #2 tie-breakers, and **7 of the 13 judges (53.8%) represent the sponsors/partners**, integrating the full partner stack is both a **Sponsor Prize play** and a **Grand Prize jury score multiplier**.

---

## 2. Deep-Dive on Every Sponsor & Partner

### 2.1 PayPal (Title Organiser — $45,000 across 3 Grand Prizes + 5 Honorable Mentions)
- **What they want developers to use**:
  1. **`@paypal/agent-toolkit` & `mcp.paypal.com`** ([`github.com/paypal/agent-toolkit`](https://github.com/paypal/agent-toolkit)): Native MCP tools for Invoices (`create_invoice`, `send_invoice`, `generate_invoice_qr_code`), Orders (`create_order`, `get_order`, `pay_order`), Disputes (`list_disputes`, `get_dispute`, `accept_dispute_claim`), Shipment Tracking (`create_tracking`, `get_tracking`, `update_tracking`), Catalog/Subscriptions (`create_product`, `create_subscription_plan`, `create_subscription`, `cancel_subscription`), and Reporting (`list_transactions`).
  2. **`@paypal/paypal-server-sdk`** ([npmjs.com](https://www.npmjs.com/package/@paypal/paypal-server-sdk)): Modern typed SDK for `Orders v2` (`intent: "AUTHORIZE"`, `ordersCapture`, `ordersAuthorize`), `Payments v2` (`authorizationsCapture`, `authorizationsVoid`), and REST endpoints not yet wrapped in the default Agent Toolkit (such as `provide_evidence` on `/v1/customer/disputes/{id}/provide-evidence` and `Payouts API` `/v1/payments/payouts`).
  3. **PayPal JS SDK v6 (`@paypal/react-paypal-js`)**: Modern frontend checkout buttons, Pay Later messaging, and Venmo integration.
- **Landmine to avoid**: Never import deprecated `paypal-rest-sdk` or ` @paypal/checkout-server-sdk`. That immediately signals outdated AI training data to PayPal and APIMatic judges.

### 2.2 AG Grid / AG Studio ($10,000 Cash Pool: $5,000 1st · $2,000 2nd · 3 × $1,000 3rd)
- **Judge on Panel**: **Sylwia Vargas** (Senior Technical Community Manager, AG Grid & Bryntum).
- **What they sell & just launched**:
  - **AG Grid v33+**: The gold-standard enterprise JavaScript/React data grid ([`ag-grid.com`](https://www.ag-grid.com/)).
  - **AG Studio**: Newly launched embedded analytics, self-service dashboarding, cross-filtering, and **AI Agent Framework** built on top of AG Grid and AG Charts ([AG Studio](https://www.ag-grid.com/)).
- **How to win their $5,000 1st Prize**:
  - Do **not** render a static 5-row table with default styling.
  - Use **Row Grouping, Tree Data, Master/Detail panels (showing live JSON MCP tool payloads & cryptographic signatures), Custom Cell Renderers (status badges, sparklines), Integrated AG Charts, Real-Time Streaming Transaction Updates (`applyTransactionAsync`), and AG Studio natural-language grid filtering**.

### 2.3 APIMatic ($3,000 Cash + 3 × 6-Month Business Plan Subscriptions: 3 × $1,000)
- **Judge on Panel**: **Ameer Hassan** (Co-Founder & VP of Customer Success / Product, APIMatic).
- **What they sell & why they are here**:
  - APIMatic ([`apimatic.io`](https://www.apimatic.io/)) is the code-generation engine that **built PayPal's official `@paypal/paypal-server-sdk`** and PayPal's Context Plugin for AI coding agents. APIMatic also turns OpenAPI specs into validated SDKs and **MCP servers**.
- **How to win their $1,000 Prize & Ameer Hassan's 20/20 Tech Score**:
  - Explicitly use **`@paypal/paypal-server-sdk`** for type-safe server operations AND use **APIMatic to generate a strongly-typed custom SDK + MCP server** from our own OpenAPI 3.1 spec (or for PayPal's Disputes Evidence & Payouts endpoints that aren't in the base `@paypal/agent-toolkit`). Document this in the README with an architecture diagram!

### 2.4 Bryntum ($3,000 Cash Pool: 3 × $1,000)
- **Judges on Panel**: **Mats Bryntse** (Founder & CEO, Bryntum) AND **Sylwia Vargas** (AG Grid & Bryntum). **2 out of 13 judges (15.4% of the panel) are affiliated with Bryntum!**
- **What they sell & just launched**:
  - Ultra-fast, pure web-technology enterprise UI components (**Bryntum Gantt, Scheduler Pro, Calendar, TaskBoard**) with React wrappers ([`bryntum.com`](https://bryntum.com/)) and their new **Bryntum MCP Server (`https://mcp.bryntum.com`)**.
- **How to win their $1,000 Prize & Mats Bryntse's vote**:
  - Bind **financial state directly to temporal/milestone state**: e.g., dragging a milestone or verifying a task dependency on **Bryntum Gantt / Bryntum Scheduler Pro** triggers a PayPal `AUTHORIZE` hold, `CAPTURE` release, or `VOID` cancellation! Also mention using `https://mcp.bryntum.com` during development.

### 2.5 Channel3 ($1,500 Cash Prize: 1 Winner)
- **Judge on Panel**: **Ignacio Valdez Bicard** (Founding Engineer, Channel3).
- **What they sell**:
  - **Channel3 (`trychannel3.com`)** is the universal product search graph and affiliate monetization API built specifically for AI shopping agents (100M+ normalized products, multimodal vision/text matching, live prices, stock availability, and MCP server integration).
- **How to win their $1,500 Prize & Ignacio's vote**:
  - Use Channel3's API / MCP server as the **live commercial discovery and price-verification oracle** before every PayPal checkout or escrow authorization—proving that the agent found a real SKU, verified its fair market price across merchants, and generated affiliate-attributed links.

### 2.6 Render ($2,250 in Cloud Credits: $1,000 1st · $750 2nd · $500 3rd)
- **Judge on Panel**: **Shifra Williams** (Founding Developer Relations Engineer, Render).
- **How to win their Prize & Shifra's vote**:
  - Include a clean, one-click **`render.yaml` Blueprint** in the root of the GitHub repository deploying the Next.js frontend, FastAPI/Node MCP orchestrator, Redis/Postgres state store, and background webhook workers on Render, with a live `*.onrender.com` production demo link.

### 2.7 Elastic (Judge Partner — Carly Richmond on Panel)
- **Judge on Panel**: **Carly Richmond** (Senior Manager DevRel & Principal Developer Advocate, Elastic).
- **How to win Carly's vote**:
  - Instrument every LLM call, MCP tool invocation, and PayPal Sandbox API call with **OpenTelemetry (OTel) traces exported to Elastic APM / Logs**, and use **Elasticsearch Vector Search / ES|QL** for policy/dispute RAG and anomaly detection.

### 2.8 Postman (Judge Partner — Pooja Mistry on Panel)
- **Judge on Panel**: **Pooja Mistry** (Senior Developer Advocate for AI & MCP, Postman).
- **How to win Pooja's vote**:
  - Include a complete, one-click **Postman Collection + Environment (`paypal-ai-postman-collection.json`)** in the repo and a "Run in Postman" badge in the README so judges can test the MCP server and PayPal Sandbox webhook flows in 10 seconds.

### 2.9 KERNEL (Tech Partner)
- **What they provide**: Cloud headless browser infrastructure for autonomous web agents when interacting with merchants or supplier portals that lack APIs.

---

## 3. Which Sponsor Tech We Should Visibly Use
In our **#1 Overall Pick (`AegisPay`)**, we integrate **all 8 core partner technologies** in a single cohesive loop:
1. **PayPal** (`@paypal/agent-toolkit` + `mcp.paypal.com` + `@paypal/paypal-server-sdk` + JS SDK v6)
2. **AG Grid / AG Studio** (Live Agentic Firewall & Escrow Ledger Grid — targeting the **$5,000 1st Place Sponsor Prize**)
3. **Bryntum Scheduler Pro / Gantt** (Temporal authorization hold, shipment window & auto-void countdown timeline)
4. **Channel3** (100M+ SKU price-oracle & anti-price-gouging verification)
5. **APIMatic** (`@paypal/paypal-server-sdk` + custom typed MCP server for Disputes Evidence & Authorize/Capture)
6. **Elastic** (OpenTelemetry agentic trace audit log + ES|QL policy search)
7. **Postman** (Exported MCP + PayPal Sandbox test collection in repo)
8. **Render** (`render.yaml` Blueprint + live hosted demo)
