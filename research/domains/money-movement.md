# Domain 2 Deep Research — Money Movement Experiences (`money-movement.md`)

## 1. The Pain Map
- **Who suffers & scale**:
  - **65M+ global gig/micro-task workers, 15M+ Indian cross-border freelancers/creators, and 400M+ consumers splitting shared expenses** ([World Bank](https://www.worldbank.org/), [PayPal](https://www.paypal.com/)).
  - **Pain #1 — Micro-Gig Payout Latency**: Digital micro-workers (AI data annotators, open-source bug hunters, design micro-contractors, campus taskers) wait 7–30 days for batch payroll or lose 15–20% to platform withdrawal minimums.
  - **Pain #2 — Cross-Border Corridor Opacity & Compliance Toil**: Indian freelancers receiving USD/EUR/GBP face opaque FX spreads, manual invoice follow-ups, and complex RBI **PA-CB / Purpose Code / eFIRA** documentation.
  - **Pain #3 — Group Settlement Friction**: Splitting a multi-item dinner, trip, or shared apartment utility bill across people who use different rails (PayPal, Venmo, Pay Later, international cards, UPI via PayPal World) still requires manual spreadsheet math and nagging friends for weeks.

## 2. Urgency Score: **8.3 / 10**
- **Triggers**:
  - Launch of **PayPal World (2025–2026)** linking **NPCI's UPI**, Venmo, Mercado Pago, and Tenpay Global across 2 billion users ([Economic Times](https://economictimes.indiatimes.com/)).
  - **PayPal JS SDK v6** introducing unified One-Time Payment Sessions supporting PayPal, Venmo, and Pay Later in a single modular component.
  - Explosion of AI RLHF / micro-bounty verification work requiring instant programmatic **PayPal Payouts API** settlement.

## 3. Prior Art Table
| Name | Type | Traction | What It Does | Specific Gap We Exploit | Link |
|---|---|---|---|---|---|
| **Splitwise** | Consumer App | 50M+ downloads | Tracks group IOUs; paywalled item scanning under Splitwise Pro. | Tracks debt passively rather than settling atomically via per-person **PayPal Invoice QR codes + JS SDK v6 Venmo/PayLater**. | [splitwise.com](https://www.splitwise.com/) |
| **Deel** / **Wise** | FinTech Unicorns | Enterprise | Cross-border payroll and FX transfers. | Built for monthly full-time payroll, not sub-minute **webhook-verified micro-gig instant PayPal Payouts** mapped to **Bryntum Scheduler** shifts. | [deel.com](https://www.deel.com/) |
| **Xflow** / **Skydo** | Indian PA-CB | YC / Funded | B2B wire collection and eFIRA generation. | Lacks an AI agent that optimizes invoice currency/splittings under the ₹25L PA-CB cap and auto-generates PayPal Invoices via MCP. | [xflowpay.com](https://www.xflowpay.com/) |

## 4. Gap Analysis (3 Buckets)
- **Doesn't Exist**:
  - **TaskPulse Instant (`8.65/10`)**: Zero-fee verifiable micro-gig & AI-RLHF instant payout rail. Connects shift/task schedules in **Bryntum Scheduler Pro** to live work webhooks (GitHub PR merge, Figma frame approval, RLHF batch pass) and fires instant **PayPal Payouts API** disbursements reconciled in **AG Grid**.
  - **PledgeSplit Cascade (`8.03/10`)**: Programmable multi-recipient conditional split-checkout cascade using **PayPal Orders v2** and **Payouts API**.
- **Exists But Weak**:
  - **SplitStream Live (`8.45/10`)**: Multimodal receipt + voice group expense settler that parses complex receipts and voice instructions (*"Rahul didn't drink alcohol, split the pitcher between the other three"*), generates itemized **PayPal Invoices + QR codes** via `mcp.paypal.com`, and embeds **PayPal JS SDK v6 (Venmo + Pay Later)**.
  - **ChatSettle MCP (`7.80/10`)**: Autonomous Discord/Slack/WhatsApp group treasurer bot powered by `mcp.paypal.com` (`create_invoice`, `send_invoice_reminder`, `list_transactions`) and **AG Grid**.
- **Exists Abroad, Not in India**:
  - **CorridorIQ Settle (`8.30/10`)**: Cross-border freelancer unified receivable & **RBI PA-CB eFIRA** optimizer leveraging **PayPal World / Invoicing API** and **AG Grid**.
