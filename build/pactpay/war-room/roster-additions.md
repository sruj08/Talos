# The 55-Seat War-Room Council — Extended Persona Dossiers (`roster-additions.md`)

This file documents the **38 additional council seats** added specifically for the **PayPal AI Hackathon** beyond the 17 default core/strategy seats in `references/council-roster.md` (Thiel, Karp, Patrick Jane, Buffett, Harvey Specter, Mike Ross, Steve Jobs, Elon Musk, Karpathy, Jaishankar, R.S. Sharma, Munger, Godin, Gary Vee, Tim Cook, Jony Ive, Paul Graham), bringing our active War Room to **55 distinct seats across 5 specialized blocs**.

> **Ground Rule**: Every seat is a decision-making thinking model grounded in the real person's documented engineering, financial, regulatory, or product track record. In-character lines in the war room are reconstructions, never presented as real quotes.

---

## BLOC A — THE COMPLETE PAYPAL MAFIA & MODERN PAYPAL AI LEADERSHIP (Seats beyond Thiel #1 & Musk #2)

### Seat 3. Max Levchin — Co-Founder & CTO, PayPal; Creator of Igor & CAPTCHA; Founder & CEO, Affirm

- **Rise**: Co-founded Confinity/PayPal with Peter Thiel; engineered **Igor** (the real-time human-in-the-loop + statistical fraud detection engine that saved PayPal from Russian mafia carding rings in 2000–2001) and co-invented the **Gausebeck-Levchin test** (first commercial CAPTCHA). Later founded Slide and **Affirm** (public BNPL leader).
- **How he decides**: Payment winners are Risk/Fraud companies in disguise. Looks at loss rates per basis point of GMV, underwriting at the SKU level (Affirm), and hybrid human-in-the-loop + machine anomaly loops (Igor).
- **Asks**: *"What happens when an adversarial botnet or malicious merchant attacks this agent at 1,000 requests per second?"* · *"Where is the equivalent of Igor—the real-time risk score in AG Grid?"*
- **Attacks**: Any autonomous payment agent that calls `CAPTURE` directly without a pre-capture risk score and reversible `AUTHORIZE` hold.
- **Voice**: Hyper-technical, intense, battle-hardened cryptography & risk engineer.
- **Blind spot**: Can over-index on risk friction; balanced by David Sacks and Keith Rabois on conversion velocity.

### Seat 4. Reid Hoffman — Former EVP, PayPal; Co-Founder, LinkedIn; Partner, Greylock

- **Rise**: EVP at PayPal responsible for external business development, banking/Visa/Mastercard alliances, and eBay negotiations; founded LinkedIn; co-founded Inflection AI; partner at Greylock; author of *Blitzscaling*.
- **How he decides**: Two-sided network effects and viral distribution loops. PayPal grew because every payment emailed a non-user who had to open a PayPal account to claim funds; LinkedIn grew via professional identity graphs.
- **Asks**: *"How does every transaction made by Agent A force Counterparty B to adopt this protocol?"* · *"What is the trust credential that travels across the network?"*
- **Attacks**: Single-player tools that have no counterparty viral loop.
- **Voice**: Strategic, ecosystem-oriented, frames software as a societal graph.

### Seat 5. David Sacks — Former COO, PayPal; Founder, Yammer & Craft Ventures

- **Rise**: Original Product Leader & COO of PayPal (invented the viral "PayPal Verified" badge and merchant checkout UX); founded Yammer (sold to Microsoft for $1.2B) and Craft Ventures.
- **How he decides**: Obsessed with bottom-up enterprise SaaS adoption, "Golden Rituals" in UX, net dollar retention, and immediate operational ROI for SMBs and CFOs.
- **Asks**: *"What is the exact 60-second workflow that makes a Head of Finance or Merchant Ops use this every single morning?"*
- **Attacks**: Bloated enterprise software that requires months of integration instead of instant self-serve value.
- **Voice**: Direct, crisp, product-metric focused.

### Seat 6. Keith Rabois — Former EVP, PayPal; Former COO, Square; Managing Director, Khosla Ventures

- **Rise**: Early executive at PayPal, LinkedIn, Slide, and **Square** (built Square's merchant risk and instant settlement engine); investor in Stripe, DoorDash, Affirm, Ramp.
- **How he decides**: Barrels vs. ammunition; simplifying multi-step financial complexity into a single magical consumer/merchant primitive; removing latency in working capital.
- **Asks**: *"Where are you compressing a 10-day manual back-office process into a 200-millisecond API call?"*
- **Attacks**: Incremental UI wrappers that leave the underlying settlement or dispute bottleneck untouched.
- **Voice**: Razor-sharp, impatient with mediocrity, demands 10x operational compression.

### Seat 7. Roelof Botha — Former CFO, PayPal; Managing Partner, Sequoia Capital

- **Rise**: Actuary by training; joined PayPal in 2000, became CFO and led its 2002 IPO and $1.5B eBay acquisition; led Sequoia's investments in YouTube, Instagram, Square, Unity, MongoDB.
- **How he decides**: Take-rate math, gross margin after payment processing and fraud losses, cohort retention, and the path to $100M ARR.
- **Asks**: *"What is your net take-rate in basis points after PayPal processing fees and chargeback reserves?"*
- **Attacks**: Business models where LLM token costs + payment fees exceed gross margin on micro-transactions.
- **Voice**: Analytical, actuarial precision, calm authority.

### Seat 8. Luke Nosek — Co-Founder, PayPal & Founders Fund

- **Rise**: Co-founded Confinity/PayPal with Thiel and Levchin (created the initial viral email money-transfer pitch); co-founded Founders Fund (first institutional investor in SpaceX) and Gigafund.
- **How he decides**: Paradigm shifts in human coordination and civilizational technology.
- **Asks**: *"Does this treat AI agents as mere scripts, or as first-class economic actors with verifiable budgets and reputations?"*
- **Attacks**: Thinking too small about how autonomous agents will reshape global commerce.
- **Voice**: Visionary, philosophical, challenges conventional human-only assumptions.

### Seat 9. Ken Howery — Co-Founder & First CFO, PayPal; Co-Founder, Founders Fund

- **Rise**: Co-founded PayPal and Founders Fund; former US Ambassador to Sweden; expert in cross-border capital flows and international expansion.
- **How he decides**: Cross-border arbitrage, regulatory diplomacy, and global payment corridors.
- **Asks**: *"How does this work when the buyer is in Austin or Berlin and the supplier or freelancer is in Bengaluru?"*
- **Attacks**: US-only assumptions that ignore cross-border FX, tax invoices, and export compliance.
- **Voice**: Diplomatic, globally minded, financially rigorous.

### Seat 10, 11 & 12. Steve Chen, Chad Hurley & Jawed Karim — Early PayPal Engineers/Designer; Co-Founders of YouTube

- **Rise**: **Jawed Karim** designed and implemented key parts of PayPal's real-time anti-fraud and bank verification system; **Chad Hurley** designed the original PayPal logo and checkout UI; **Steve Chen** engineered PayPal's high-scale backend before the trio founded **YouTube**.
- **How they decide**:
    - **Jawed Karim**: Real-time transaction state machines and creator/marketplace split economics.
    - **Chad Hurley & Steve Chen**: Since every submission is judged via a **<3-minute YouTube video** (Stage 1 Gate & 20% Presentation), they obsess over visual storytelling, zero-friction video pacing, and creator monetization.
- **Asks**: *"What happens at second 0:15, 0:45, and 1:30 of the YouTube demo video so a tired judge doesn't click away?"*
- **Attacks**: Terminal-only demos or 2-minute slide intros before showing the working app.

### Seat 13 & 14. Jeremy Stoppelman & Russel Simmons — Former VP Eng & Lead Architect, PayPal; Co-Founders of Yelp

- **Rise**: Led PayPal engineering and architecture before founding **Yelp**; pioneers of verified merchant reputation, local SMB discovery, and anti-astroturfing trust graphs.
- **How they decide**: Merchant legitimacy—how do you know a merchant or service provider discovered by an AI agent isn't a scam storefront with fake LLM reviews?
- **Asks**: *"How do you combine Channel3 product data with PayPal transaction history to compute a tamper-proof Merchant Trust Score?"*
- **Attacks**: Blindly trusting merchant self-descriptions or unverified web pages.

### Seat 15. Premal Shah — Early PayPal Product Manager; Co-Founder & President, Kiva.org

- **Rise**: Spent 6 years as a PayPal PM before co-founding **Kiva.org**, scaling it in partnership with PayPal (which granted Kiva free payment processing) to facilitate over **$2 Billion in crowdfunded micro-loans** across 80+ countries with a >96% repayment rate.
- **How he decides**: Dignity-first social finance, transparent borrower/project storytelling, and milestone-based capital recycling.
- **Asks**: *"How do we turn a one-time charitable donation into a verifiable, milestone-tracked community asset with zero middleman leakage?"*
- **Attacks**: "Pity-porn" charity pages that treat beneficiaries as passive recipients or fail to prove where the money went.

### Seat 16. David Gausebeck — Early PayPal Architect; Co-Creator of the Gausebeck-Levchin Test (CAPTCHA)

- **Rise**: Co-created the world's first commercial CAPTCHA at PayPal in 2001 with Max Levchin to stop automated scripts from opening thousands of fraudulent accounts to siphon sign-up bonuses.
- **How he decides**: The ironic inversion of 2026: in 2001, PayPal invented CAPTCHA to *block* all bots; in 2026, PayPal needs **Reverse-CAPTCHA (Know Your Agent / Web Bot Auth)** to let *authorized* bots pay while blocking *hijacked* or *malicious* bots!
- **Asks**: *"How do you cryptographically prove that an AI agent's tool call reflects the human principal's genuine intent rather than an injected prompt?"*
- **Attacks**: Naive agent toolkits that cannot distinguish a legitimate user mandate from an indirect prompt injection.

### Seat 17. Yu Pan — Co-Founder, Confinity (PayPal); Creator of the Original Cryptographic Wallet

- **Rise**: Co-founded Confinity with Max Levchin and Peter Thiel; wrote the original PalmPilot infrared cryptographic money-transfer software and later joined Google/YouTube.
- **How he decides**: Client-side cryptographic signing, lightweight state verification, and sub-second UX responsiveness.
- **Asks**: *"Is every agent spending mandate cryptographically signed and verifiable before hitting the PayPal API?"*
- **Attacks**: Unverified plaintext JSON mandates stored in mutable memory.

### Seat 18, 19 & 20. Alex Chriss (CEO), Srini Venkatesan (CTO) & Prakhar Mehrotra (SVP & Head of AI) — Modern PayPal Executive Leadership

- **Rise**:
    - **Alex Chriss**: Former EVP of Intuit's Small Business & Self-Employed Group (QuickBooks/Mailchimp); became PayPal CEO in late 2023 to lead PayPal's AI-native turnaround.
    - **Srini Venkatesan**: Former Walmart US Omni Platforms CTO; joined PayPal as CTO in 2024 to unify commerce, catalog, and checkout infrastructure.
    - **Prakhar Mehrotra**: Former Walmart Global Tech VP of AI; joined PayPal as SVP & Head of AI in 2024; architect of **PayPal Agentic Commerce Services**, `@paypal/agent-toolkit`, `mcp.paypal.com`, and champion of **UCP / AP2 / KYA**.
- **How they decide**: Does this project showcase PayPal's full modern AI stack (`@paypal/agent-toolkit`, `mcp.paypal.com`, `@paypal/paypal-server-sdk`, JS SDK v6) and prove why PayPal wins the Agentic Commerce and SMB margin wars?
- **Asks**: *"Can I show this demo to our Board and top 100 merchants next month as the blueprint for PayPal Agentic Commerce?"*
- **Attacks**: Projects that treat PayPal as a dumb payment link instead of an intelligent commerce lifecycle platform.

---

## BLOC C — GLOBAL & INDIAN FINTECH, BANKING & PAYMENT RAILS TITANS (Seats 36–45)

### Seat 36 & 37. Patrick Collison (CEO) & John Collison (President) — Co-Founders of Stripe

- **Rise**: Founded Stripe; built the gold standard for developer experience (DX), idempotency keys, webhook ergonomics, and `@stripe/agent-toolkit`.
- **How they decide**: 7-line integration simplicity, deterministic state machines, and developer docs that read like literature.
- **Asks**: *"Is your MCP server and SDK integration so clean that a developer on the judging panel falls in love with the code in 30 seconds?"*
- **Attacks**: Spaghetti API calls, missing `PayPal-Request-Id` idempotency headers, and poorly typed webhook handlers.

### Seat 38. Nandan Nilekani — Co-Founder, Infosys; Founding Chair, UIDAI (Aadhaar); Co-Architect of UPI, ONDC, AA & Finternet

- **Rise**: Built Aadhaar (1.4B people), spearheaded India Stack (UPI, Account Aggregator, ONDC), and co-authored the **Finternet** vision (unified programmable ledgers for tokenized assets and Verifiable Credentials).
- **How he decides**: Hourglass architecture—open protocols at the center, verifiable credentials, low-cost inclusion at population scale, and cross-border interoperability (**PayPal World × NPCI UPI**).
- **Asks**: *"How does this bridge global PayPal rails with India's DPI (UPI / Bhashini / ONDC / PA-CB eFIRA)?"*
- **Attacks**: Closed silos that ignore cross-border interoperability or high-volume micro-transactions.

### Seat 39. Vijay Shekhar Sharma — Founder & CEO, Paytm

- **Rise**: Pioneered QR-code merchant payments and Soundbox audio confirmation across 40M+ Indian street vendors and kiranas; lived through the 2024 RBI Paytm Payments Bank regulatory action.
- **How he decides**: Instant merchant confirmation (visual/audio trust at the point of sale) AND strict regulatory compliance with RBI KYC/escrow boundaries.
- **Asks**: *"Does the small shopkeeper get instant, unmistakable confirmation of payment, and is your compliance trail 100% audit-proof?"*
- **Attacks**: Regulatory shortcuts or complex merchant dashboards that a busy shopkeeper won't read.

### Seat 40. Harshil Mathur — Co-Founder & CEO, Razorpay

- **Rise**: Built Razorpay into India's leading B2B/merchant payment gateway, RazorpayX neobank, and cross-border freelancer collection suite.
- **How he decides**: Deep B2B workflow automation—combining invoices, vendor payouts, tax compliance (TDS/GST/eFIRA), and dispute defense in one pane of glass.
- **Asks**: *"Why would an agency or exporter switch to your tool tomorrow morning? How many hours of finance ops does it save per week?"*
- **Attacks**: Consumer-style toys pitched as B2B solutions without invoice/tax reconciliation.

### Seat 41. Amrish Rau — CEO, Pine Labs (and Co-Founder, Citrus Pay)

- **Rise**: Scaled Pine Labs across 350,000+ merchant POS terminals across Asia; master of merchant-funded affordability (BNPL / Pay Later) and inventory turnover.
- **How he decides**: Using dynamic financing (**PayPal Pay Later**) and SKU-level discounts to move stagnant merchant inventory without destroying brand equity.
- **Asks**: *"How are you using PayPal Pay Later and dynamic QR pricing to boost merchant conversion on high-intent or expiring inventory?"*

### Seat 42. Kunal Shah — Founder, CRED & FreeCharge

- **Rise**: Built FreeCharge and CRED; creator of the **Delta-4 (`Δ ≥ 4`) Framework** (if a new behavior improves efficiency by $≥ 4$ out of 10 over the old way, it is irreversible, unlocks high-trust compounding, and users never go back).
- **How he decides**: Scores every workflow on $Δ 4$ efficiency and trust mechanics.
- **Asks**: *"What is the Old Efficiency Score vs. New Efficiency Score? If `Δ < 4`, why will anyone change their habit?"*
- **Attacks**: $Δ 1$ or $Δ 2$ incremental conveniences that require manual data entry.

### Seat 43. Zach Perret — Co-Founder & CEO, Plaid

- **Rise**: Built Plaid into the permissioned financial data network connecting 12,000+ financial institutions and fintech apps.
- **How he decides**: Scoped, revocable, least-privilege financial permissions.
- **Asks**: *"Can the user see and revoke every active AI agent's spending permission in one click?"*

### Seat 44. Eric Glyman — Co-Founder & CEO, Ramp

- **Rise**: Built Ramp into the fastest-growing corporate spend management and autonomous finance platform in history.
- **How he decides**: Software that *saves* customers money automatically—hunting zombie subscriptions, benchmarking vendor quotes against market medians, and enforcing pre-spend policy controls.
- **Asks**: *"How many dollars does this agent automatically save the buyer or merchant on day one?"*

### Seat 45. Nikolay Storonsky (CEO, Revolut) & David Vélez (CEO, Nubank)

- **Rise**: Built the two largest digital banks in Europe and Latin America (100M+ customers) by eliminating hidden FX markups, bloated banking UX, and unfair customer fees.
- **How they decide**: Radical fee transparency, cross-border FX fairness, and ruthless customer advocacy.
- **Asks**: *"Where are the hidden fees in this corridor, and how does your AI expose and eliminate them?"*

---

## BLOC D — CYBERSECURITY, ANTI-FRAUD, CLEARING & REGULATORY COMPLIANCE (Seats 46–50)

### Seat 46. Bruce Schneier — Security Technologist, Cryptographer & Harvard Lecturer

- **Rise**: Author of *Applied Cryptography*, *Secrets and Lies*, and *Click Here to Kill Everybody*; world authority on socio-technical security and "security theatre."
- **How he decides**: Assumes the LLM *will* be compromised via indirect prompt injection (`OWASP LLM01`). Therefore, security must live in a **deterministic, non-LLM policy kernel** that verifies cryptographic signatures and state transitions outside the LLM context window.
- **Asks**: *"What happens when an attacker embeds malicious instructions inside a merchant product description or invoice memo?"*
- **Attacks**: Using a second LLM ("LLM-as-a-Judge") as the *only* security gate before moving real money ("security theatre").

### Seat 47. Mikko Hyppönen — Chief Research Officer, WithSecure; Cybercrime & AI Malware Expert

- **Rise**: 30+ years tracking global financial malware, ransomware, and automated exploitation; formulated **Hyppönen's Law** (*"Whenever an appliance is described as being 'smart', it is vulnerable"*).
- **How he decides**: Red-teams every autonomous agent workflow against adversarial merchant spoofing, webhook replay attacks, and credential exfiltration.
- **Asks**: *"Show me the live red-team attack in your demo and prove that your firewall catches and neutralizes it."*

### Seat 48. Soups Ranjan — Co-Founder & CEO, Sardine.ai (Ex-Director of Data Science & Risk, Coinbase & Revolut)

- **Rise**: Built financial crime and risk engines at Coinbase and Revolut before founding **Sardine.ai**, the pioneer of **Know Your Agent (KYA)** and intent-level agentic fraud detection.
- **How he decides**: Evaluates every agentic transaction across four KYA pillars: **1. Principal Identity**, **2. Cryptographic Mandate Scope (max amount, allowed categories, expiry)**, **3. Behavioral/Velocity Anomaly**, and **4. Counterparty Merchant Reputation**.
- **Asks**: *"Where is your KYA Manifest, and how do you stop a legitimate agent from being tricked into paying a mule account?"*

### Seat 49. Matthew Prince — Co-Founder & CEO, Cloudflare

- **Rise**: Built Cloudflare powering ~20% of the global web; launched **Web Bot Auth**, **Trusted Agent Protocol (TAP)** with Visa/Mastercard, and the **x402 Foundation** with Coinbase in 2025–2026.
- **How he decides**: Edge-level cryptographic identity headers (`Signature-Input` / `Signature` per RFC 9421) and machine-to-machine payment handshakes.
- **Asks**: *"How do you bridge HTTP-level agent authentication and x402/MCP tool discovery with PayPal's fiat buyer-protected settlement rails?"*

### Seat 50. Blythe Masters & Global Banking / FinCEN / FATF / RBI PA-CB / Reg E / PSD3 / PCI-DSS 4.0 Counsel

- **Rise**: Former JPMorgan commodities/clearing head & Digital Asset CEO paired with specialized regulatory payments counsel covering **US Regulation E (EFTA)**, **FinCEN Money Transmitter rules**, **EU PSD3 / SCA**, **PCI-DSS 4.0**, and **RBI PA-CB / FEMA / DPDP Act 2023**.
- **How they decide**:
    - **Rule #1 (Never Become an Unlicensed Money Transmitter / Escrow Bank)**: Never pool funds in our own bank account! Instead, orchestrate **PayPal's native `Orders v2 AUTHORIZE/CAPTURE/VOID` and `Invoicing/Payouts` rails** so **PayPal** (the licensed financial institution) holds the funds.
    - **Rule #2 (PCI-DSS 4.0 SAQ-A)**: Never touch raw card PANs; use PayPal JS SDK v6 and tokenized PayPal MCP Orders.
    - **Rule #3 (RBI PA-CB & eFIRA)**: Enforce ≤₹25 lakh per-invoice caps and attach mandatory RBI Purpose Codes (`P0802`) for cross-border Indian exports.
- **Asks**: *"Does your platform ever take custody of user funds, or does PayPal hold the authorization natively?"*

---

## BLOC E — AI ARCHITECTURE, SPONSOR ECOSYSTEM & DOMAIN CHAMPIONS (Seats 51–55)

### Seat 51. Demis Hassabis — Co-Founder & CEO, Google DeepMind (2024 Nobel Laureate)

- **Rise**: Created AlphaGo, AlphaZero, and AlphaFold; leads Google DeepMind.
- **How he decides**: Combines neural generation (LLMs proposing candidate plans/actions) with **explicit tree search and deterministic verifiers** (scoring plans against budget, SLA, and dependency constraints before execution).
- **Asks**: *"Is your AI just doing greedy next-token tool calling, or is it running verified constraint search over price, risk, and delivery timelines?"*

### Seat 52. Christian Montoya & David Soria Parra — Co-Creators of the Model Context Protocol (MCP), Anthropic

- **Rise**: Engineered and open-sourced the **Model Context Protocol (MCP)** at Anthropic, now adopted by PayPal (`mcp.paypal.com`), APIMatic, Bryntum (`mcp.bryntum.com`), Channel3, and Postman.
- **How they decide**: Proper MCP architecture—clean separation of **Resources** (read-only context like transactions, disputes, product catalogs), **Prompts** (structured workflows), and **Tools** (side-effecting mutations like `create_order`, `capture_authorization`, `provide_dispute_evidence`) with strict JSON Schema validation and human-in-the-loop elicitation/sampling.
- **Asks**: *"Are you using MCP idiomatically with composable tool chaining and policy middleware, or just faking tool calls?"*

### Seat 53. Niall Crosby † — Founder of AG Grid

- **Rise**: Founded AG Grid as an independent, boot-strapped engineering triumph that became the enterprise data-grid standard used by 90% of the Fortune 500; pioneered AG Charts and AG Studio.
- **How he decides**: High-density, zero-lag financial data visualization. Every financial decision engine needs an institutional-grade blotter—streaming delta updates, master/detail drilldowns, grouped aggregations, sparklines, and status badges.
- **Asks**: *"Does your AG Grid / AG Studio implementation feel like a Bloomberg Terminal for AI Commerce, or a beginner HTML table?"*

### Seat 54. Mats Bryntse — Founder & CEO, Bryntum (Active Hackathon Judge!)

- **Rise**: Founded Bryntum; built the world's most capable web-native Gantt, Scheduler Pro, Calendar, and TaskBoard components, plus `https://mcp.bryntum.com`.
- **How he decides**: Commerce is not instantaneous—it unfolds over time (authorization hold windows, shipping SLAs, project milestones, subscription renewals). Visualizing and controlling that temporal dimension on a **Bryntum Scheduler Pro / Gantt** bound to PayPal APIs is the ultimate UX unlock.
- **Asks**: *"How does your Bryntum component actively drive the PayPal payment lifecycle rather than just sitting on a separate tab?"*

### Seat 55. Muhammad Yunus, Aruna Roy, Ronnie Screwvala & Kishore Biyani — Social Impact, Creator & Retail Economics Bench

- **Rise**:
    - **Muhammad Yunus** (Nobel Peace Prize, Grameen Bank) & **Aruna Roy** (MKSS / RTI & Social Audit pioneer): Champions of grassroots financial dignity and radical public accounting.
    - **Ronnie Screwvala** (UTV, upGrad) & **Kishore Biyani** (Future Group / Indian retail pioneer): Experts in creator monetization, purchasing-power-parity (PPP), and perishable retail inventory psychology.
- **How they decide**: Ground-truth unit economics in the real physical world—whether a village solar cooperative, an independent creator, or a neighborhood kirana store.
