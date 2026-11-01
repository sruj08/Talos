# Market Research — Agentic Commerce, Prompt Injection & Escrow Opportunity

## 1. TAM / SAM / SOM Analysis (Top-Down & Bottom-Up)

### 1.1 Top-Down Market Sizing (2026–2030)
- **Global Digital Payments & B2B E-Commerce TAM**: **`$18.4 Trillion`** global digital commerce volume; PayPal alone processes **`$1.68+ Trillion` Annual Total Payment Volume (TPV)** across **`430+ million` active accounts** in 200+ markets ([PayPal FY2025/2026 10-K](https://investor.paypal.com/)).
- **Global Agentic Commerce Volume (2026–2030)**: Projected by Gartner, McKinsey, and Edgar Dunn & Company to reach **`$1.2 Trillion` in autonomous and semi-autonomous AI-initiated transactions by 2030**, yielding a **`$18.0 Billion` TAM** in Agentic Payment Security, Escrow & FinOps Infrastructure (at a `150 bps` combined software + protection take-rate).
- **Serviceable Addressable Market (SAM)**: Mid-market and Enterprise B2B/B2C autonomous procurement, SaaS licensing, and cross-border D2C supply-chain orders routed over PayPal, Stripe, and UPI rails = **`$2.4 Billion` (`₹20,000 Crore`)**.
- **Serviceable Obtainable Market (SOM — 36 Months)**: Capturing `1.9%` of the PayPal Agentic Commerce early-adopter enterprise cohort (`2,800` enterprise/mid-market accounts processing `$3.4B` Protected Agentic GMV) = **`$46.2 Million ARR` (`₹385.8 Crore ARR`)**.

---

## 2. Verified Industry Catalysts & Why 2026 Is the Inflection Point

| Catalyst | Verified Fact / Source | Strategic Impact on TALOS |
| :--- | :--- | :--- |
| **1. PayPal Agentic Commerce Push** | PayPal launched `@paypal/agent-toolkit`, the official PayPal MCP Server, **PayPal JS SDK v6**, and **PayPal World** (interconnecting PayPal, Venmo, and **NPCI UPI** announced under CEO Alex Chriss & EVP Srini Venkatesan). | PayPal has built the *execution rails* for AI agents, creating an immediate vacuum for the *Enterprise Trust, Prompt-Injection Firewall & Reversible Escrow Control Plane*. |
| **2. Real-World Payment Agent Exploits (`CVE-2026-22708`)** | **CVE-2026-22708** demonstrated remote code/action execution via indirect CSS/DOM prompt injection in autonomous browser agents; **OWASP Top 10 for LLM Applications (`LLM01:2025`)** ranks Indirect Prompt Injection as the #1 enterprise vulnerability. | Proves why autonomous agents with payment authority MUST pass scraped merchant DOMs through a deterministic **Rust `lol_html` + ONNX Firewall (`F-02`)** before any LLM sees the page. |
| **3. Bot Traffic Surpasses Human Traffic** | The **Imperva Bad Bot Report** confirmed automated traffic exceeded **`51%`** of all global web traffic, with AI scraper and agentic checkout bots growing `300%+ YoY`. | Merchants (`P-04`) cannot distinguish malicious scraper bots from legitimate funded buyer agents without **Ed25519 KYA Mandates (`F-01`)** and PayPal `AUTHORIZE` proof of funds. |
| **4. Enterprise CFO Blockade on Unbounded Agent Spend** | Enterprise FinOps surveys (Gartner / Ramp AI Spend Index) show **`78%` of CFOs** refuse to give AI agents direct corporate cards or `intent: CAPTURE` wallet keys due to zero pre-capture SLA verification. | Validates our core architectural wedge: **PayPal Orders v2 `intent: AUTHORIZE` + Shipment Tracking v1 + Bryntum SLA auto-void (`F-04`, `F-08`)**. |
| **5. India Cross-Border & RBI PA-CB Boom** | India's cross-border B2B/D2C SaaS & e-commerce exports exceed **`$120B+` (`₹10 Lakh Crore`)**, governed by RBI's **Payment Aggregator - Cross Border (PA-CB)** circular and **DPDP Act 2023**. | Validates TALOS's first-class `USD ($)` + `INR (₹)` support, eFIRA readiness, and DPDP/CERT-In compliance (`docs/06-security-compliance/`). |
