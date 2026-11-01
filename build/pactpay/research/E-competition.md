# Track E — Competition Forecast & Prior Art Census (`E-competition.md`)

## 1. Participation Volume & Funnel Math
- **Registered Participants on Devpost**: **24,754 developers** ([`https://paypalaihackathon.devpost.com/`](https://paypalaihackathon.devpost.com/)).
- **Historical Devpost Conversion Funnel**:
  - In large global AI hackathons on Devpost (15,000–30,000 registrants), typically **6% to 9%** submit a project (**~1,500 to 2,200 total submissions**).
  - **Stage 1 Pass/Fail Attrition (~35–45% eliminated)**: At least 600–800 submissions will fail Stage 1 because they forget to put an open-source `LICENSE` file visible in the top GitHub "About" section (Official Rules §4/§6), submit a video over 3:00 minutes, or mock PayPal without real Sandbox API calls.
  - **Net Viable Stage 2 Contenders**: **~950 to 1,250 submissions** competing for **24 total prize slots** (a ~2% win rate overall, but **>25% win rate** for teams that deeply integrate AG Grid + Bryntum + APIMatic + Channel3 + Render + PayPal MCP).

---

## 2. Predicted Distribution of Competing Teams Across Domains (The "80% Trap" Map)

| Domain | Est. % of Submissions | Est. Submission Count | What 80% of Teams in This Track Will Build (The Default Tarpit Idea) | Why They Will Lose in Stage 2 |
|---|---|---|---|---|
| **D4: Consumer Experiences** | **~34%** | ~610 projects | **"Chat-to-Shop / AI Personal Stylist"**: A chat box that calls OpenAI + Channel3 search and renders a PayPal checkout button. | Zero technical differentiation; 500+ identical clones; uses only 1 PayPal endpoint (`create_order`); no AG Grid or Bryntum justification. |
| **D1: AI Agents & Agentic Commerce** | **~28%** | ~500 projects | **"Prompt-to-Invoice or Basic MCP Demo"**: Connecting Claude Desktop to `mcp.paypal.com` to type *"Create an invoice for $50"*. | Replicates PayPal's own README quickstart (`paypal/agent-toolkit`); no KYA security, no multi-party escrow, no sponsor UI. |
| **D3: Business Solutions** | **~18%** | ~325 projects | **"AI Invoice Generator & Analytics Table"**: Generating PDF/PayPal invoices from text and listing transactions in a basic table. | Shallow integration; ignores `Disputes API`, `Shipment Tracking API`, and `Orders v2 AUTHORIZE/CAPTURE`. |
| **D2: Money Movement Experiences** | **~12%** | ~215 projects | **"Receipt OCR Bill Splitter"**: Uploading a restaurant receipt image and sending PayPal invoices to friends. | Rebuilt at every hackathon since 2015 (Splitwise clone); low Innovation (20%) and Potential Impact (20%) scores. |
| **D5: Social Impact Ideas** | **~8%** | ~150 projects | **"AI Charity Recommender / Crowdfunding Page"**: A chatbot that recommends NGOs and embeds a PayPal Donate button. | Zero proof of impact after the donation occurs; does not solve fund leakage or milestone verification. |

---

## 3. Prior Art Census by Domain (GitHub Repos, Startups, Papers, Past Hackathon Winners)

| Domain | GitHub Repos (Public) | Funded Startups | Recent Papers (2023–2026) | Notable Prior Art & Exact Gap We Exploit |
|---|---|---|---|---|
| **D1: AI Agents & Agentic Commerce** | ~420 repos (`mcp paypal`, `stripe agent-toolkit`, `x402`, `browser-use shopping`) | Skyfire, Payman AI, Nevermined, Crossmint, Catena Labs, Sardine (KYA) | ~180 papers (*InjecAgent* arXiv:2403.02691, *WASP* 2025, *AgentDojo* 2024, *WAInjectBench* 2025) | Existing repos give agents **unrestricted payment execution** or rely on crypto (`x402`) with **zero chargeback/escrow protection**. None combine KYA policy firewall + Channel3 price verification + PayPal `AUTHORIZE → Shipment Tracking → CAPTURE/VOID`. |
| **D3: Business Solutions** | ~890 repos (`paypal invoice bot`, `stripe dispute automation`, `freelance escrow`) | Chargeflow, Justt, Mercoa, Riskified, Midtrans, Xflow, Skydo | ~110 papers (LLM financial document extraction, graph fraud detection) | Chargeback SaaS tools (Chargeflow, Justt) are closed-source, take 20–25% contingency cuts, and don't expose an open MCP server chaining `@paypal/agent-toolkit` Disputes + Shipment Tracking + APIMatic `provide-evidence`. |
| **D5: Social Impact Ideas** | ~310 repos (`charity tracker`, `ngo donation portal`, `disaster relief payout`) | GiveDirectly, Kiva, Alice.si, OpenCollective, Haqdarshak | ~95 papers (conditional cash transfers, satellite aid verification, MKSS social audits) | GiveDirectly and Kiva lack **automated multimodal milestone proof tied to commercial supplier payouts** on a live public **Bryntum Gantt + AG Grid Social Audit Ledger**. |
| **D2: Money Movement Experiences** | ~1,150 repos (`receipt splitter`, `telegram payment bot`, `payout automation`) | Splitwise, Tab, Wise, Deel, Abound, Salt | ~70 papers (real-time gross settlement, cross-border FX routing) | Almost all open-source splitters stop at generating a payment request; none do **webhook-verified micro-gig instant payouts** (`TaskPulse`) or **PA-CB eFIRA corridor optimization** (`CorridorIQ`). |
| **D4: Consumer Experiences** | ~1,600+ repos (`ai shopping assistant`, `price tracker`, `subscription tracker`) | Honey (PayPal), Perplexity Buy with Pro, Rocket Money, Truebill, Carefull | ~140 papers (conversational recommender systems, dark pattern detection) | Elder financial protection tools (Carefull) only alert *after* money leaves the bank; none intercept suspicious checkouts in real time via a **PayPal `Orders v2 AUTHORIZE` hold + Family Guardian Co-Sign (`SilverGuard Pay`)**. |
