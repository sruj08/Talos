# War Room Session 4 — Money Movement Experiences (`money-movement.md`)

- **Chairs**: **Patrick Jane ◇** (Recon Brief) & **Paul Graham** (Scoring & Tarpit Filter)
- **Active LEAD Seats**: Peter Thiel, Elon Musk, Max Levchin, Reid Hoffman, Keith Rabois, Roelof Botha, Ken Howery, Jawed Karim, Yu Pan, Alex Chriss, Srini Venkatesan, Prakhar Mehrotra, Alex Karp, Patrick Jane, Warren Buffett, Charlie Munger, Harvey Specter, Mike Ross, Steve Jobs, Tim Cook, Jony Ive, Andrej Karpathy, Paul Graham, Gary Vaynerchuk, S. Jaishankar, Dr. R.S. Sharma, Patrick Collison, John Collison, Nandan Nilekani, Vijay Shekhar Sharma, Harshil Mathur, Kunal Shah, Zach Perret, Nikolay Storonsky & David Vélez, Bruce Schneier, Soups Ranjan, Matthew Prince, Blythe Masters, Christian Montoya & David Soria Parra, Niall Crosby, Mats Bryntse.

---

## Round 0 — The Brief (Patrick Jane ◇)
**PATRICK JANE ◇:** In **Money Movement Experiences (`D2`)**, 200+ teams will build a Splitwise receipt scanner `[S1]`. If you show a hackathon judge a restaurant bill splitter in 2026 without an extraordinary twist, their eyes glaze over in five seconds. How do we win if we play here? Either we build **instant, webhook-verified micro-gig payouts** tied to **Bryntum Scheduler Pro** and **PayPal Payouts API** (`TaskPulse Instant`), OR we turn group bill splitting into a live multimodal voice + QR experience powered by **PayPal JS SDK v6 (Venmo + Pay Later)** (`SplitStream Live`), OR we solve cross-border **PayPal World / RBI PA-CB eFIRA** receivable optimization (`CorridorIQ Settle`) `[S3, S4, S8, S13]`.

---

## Round 1 — Idea Storm (16 Candidate Seeds Proposed by the Council)

**KEITH RABOIS, KUNAL SHAH & MATS BRYNTSE:** Look at the 65 million micro-gig workers, campus taskers, and AI RLHF data verifiers. Why do they wait 14 days for batch payroll when the task verification happens digitally in 500 milliseconds? **Candidate #1 (`TaskPulse Instant`)** binds shift/task assignments on **Bryntum Scheduler Pro** to real-time work completion webhooks (GitHub PR merged, RLHF annotation verified, delivery photo approved) and fires an instant **PayPal Payouts API** (`/v1/payments/payouts`) disbursement within 3 seconds, logged in **AG Grid** `[S4, S7, S8]`.

**VIJAY SHEKHAR SHARMA, CHAD HURLEY & JONY IVE:** If we touch group bill splitting, apply Kunal Shah's **Delta-4 (`Δ ≥ 4`) rule**: no typing item prices, no nagging friends for weeks. **Candidate #2 (`SplitStream Live`)** lets you snap a complex group receipt and speak naturally (*"Ananya only had the mocktail and shared the nachos; split the rest three ways"*); the agent uses `mcp.paypal.com` (`create_invoice`, `generate_invoice_qr_code`) to generate instant per-person **PayPal Invoice QR codes** and embeds **PayPal JS SDK v6** so friends can settle on the spot via **PayPal, Venmo, or Pay Later** `[S3, S4]`.

**NANDAN NILEKANI, S. JAISHANKAR & KEN HOWERY:** With **PayPal World** connecting **NPCI's UPI** and global wallets in 2025–2026 `[S13]`, Indian cross-border freelancers and micro-exporters need an intelligent receivable router. **Candidate #3 (`CorridorIQ Settle`)** optimizes invoice currency, auto-splits invoices above the ₹25 lakh **RBI PA-CB** limit, attaches Purpose Code `P0802`, and reconciles `list_transactions` into an **AG Grid** **eFIRA** ledger `[S3, S7, S13]`.

**REID HOFFMAN & JAWED KARIM:** What about group purchases where 10 friends or alumni chip in to buy a $1,200 wedding gift or community item sourced on **Channel3**? **Candidate #4 (`PledgeSplit Cascade`)** holds each contributor's share via **PayPal Orders v2 `AUTHORIZE`** and only captures and pays the merchant when 100% of the target pool is reached before the **Bryntum** countdown deadline `[S4, S8, S9]`.

**CHRISTIAN MONTOYA & POOJA MISTRY (MCP Lens):** And for Discord/Slack/WhatsApp student clubs and run clubs, **Candidate #5 (`ChatSettle MCP`)** acts as an autonomous group treasurer using `mcp.paypal.com` (`create_invoice`, `send_invoice_reminder`, `cancel_sent_invoice`, `list_transactions`) with an **AG Grid** dues tracker `[S3, S7]`.

---

## Round 2 — Aggressive Attack & Veto Round

**CHARLIE MUNGER † & SOUPS RANJAN:** How does `TaskPulse Instant` die? Sybil attacks and velocity fraud! A worker writes a script to submit 500 fake GitHub PRs or spam annotations and drains the employer's PayPal Payouts balance in two minutes!
- **The Fix (Soups Ranjan & Max Levchin)**: Add a deterministic **Payout Velocity & Quality Gate** inside `TaskPulse`:
  1. Every task on **Bryntum Scheduler Pro** has a cryptographic budget cap and requires an automated quality verifier score ($≥ 0.90$) before unlocking the payout state.
  2. APIMatic's `@paypal/paypal-server-sdk` enforces unique `sender_batch_id` idempotency keys so a replay attack can never double-pay the same task `[S4]`.
  3. High-value payouts above a configurable threshold ($50 / ₹4,000) pause in **AG Grid** for 1-click batch manager approval.

**HARVEY SPECTER ◇ & DR. R.S. SHARMA (Compliance Check):**
- Under **India's Code on Social Security, 2020** (gig/platform worker ledger transparency) and **US IRS Form 1099-K** rules, `TaskPulse Instant` automatically generates transparent worker earnings statements in **AG Grid** without taking illegal custody of funds (money flows directly from the employer's PayPal business sandbox to the worker's PayPal sandbox account via **PayPal Payouts API**) `[S4, S14]`.

---

## Round 3 & Round 4 — Official Rubric Scoring & Vote (Chaired by Paul Graham)

| Idea | Pain (15%) | Novelty (15%) | Alignment (15%) | Demo (15%) | Feasibility (10%) | India Fit (10%) | Business (10%) | Legal (5%) | Moonshot (5%) | **Weighted Total** |
|---|---|---|---|---|---|---|---|---|---|---|
| **1. TaskPulse Instant** | 8.8 | 8.6 | 8.8 | 8.8 | 8.5 | 8.5 | 8.5 | 8.5 | 8.4 | **8.65 / 10** |
| **2. SplitStream Live** | 8.4 | 8.0 | 8.8 | 9.0 | 8.8 | 8.4 | 8.0 | 8.6 | 7.8 | **8.45 / 10** |
| **3. CorridorIQ Settle** | 8.8 | 8.2 | 8.4 | 8.0 | 8.2 | 9.2 | 8.4 | 8.6 | 7.6 | **8.30 / 10** |
| **4. PledgeSplit Cascade** | 8.0 | 8.2 | 8.2 | 8.2 | 8.0 | 7.8 | 7.8 | 8.2 | 7.6 | **8.03 / 10** |
| **5. ChatSettle MCP** | 7.8 | 7.2 | 8.2 | 8.0 | 8.6 | 7.6 | 7.4 | 8.4 | 7.0 | **7.80 / 10** |

---

## Round 5 — Polish (Steve Jobs † & Alex Karp)
- **STEVE JOBS † (Demo Moment for `TaskPulse Instant`)**: *"Show a live Bryntum Scheduler board of 5 micro-contractors assigned to urgent UI bug fixes and dataset verifications. Contractor #1 merges a passing PR on GitHub. Within 2 seconds, the webhook hits TaskPulse, the AI verifier validates the test suite, the Bryntum task bar turns green, PayPal Payouts API fires a real $45 instant transfer in Sandbox, and the AG Grid ledger updates with the live PayPal Payout Item ID."*
- **ALEX KARP (30-Second Explanation)**: *"In the modern digital economy, work happens at machine speed, yet workers still wait weeks for batch payroll. TaskPulse Instant wires project shifts in Bryntum Scheduler directly to verifiable completion webhooks and PayPal's Payouts API—settling micro-gigs in seconds with deterministic velocity fraud controls and real-time AG Grid reconciliation."*

---

## Domain 2 Winnability Score Computation
- **Competition Density (Inverse, 25%)**: `7.5/10` (~12% of teams enter D2, but Splitwise clones dominate).
- **Prior-Work Saturation (Inverse, 20%)**: `7.0/10` (Many P2P/splitting repos exist; micro-gig webhook payouts stand out).
- **Excitement / Demo Factor (20%)**: `8.2/10` (Instant webhook-to-PayPal Payout + QR codes is crisp).
- **Jury & Organiser Alignment (20%)**: `8.2/10` (Good fit for PayPal Payouts, Invoicing QR, JS SDK v6, AG Grid, Bryntum).
- **Feasibility in Time Box (15%)**: `8.8/10` (Very clean API surface).
- **Weighted Domain 2 Winnability Index**: **$7.88 / 10$ (RANK #4 OVERALL)**.
