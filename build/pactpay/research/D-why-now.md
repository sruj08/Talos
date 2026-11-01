# Track D — Why These Problem Statements, Why Now (`D-why-now.md`)

*(Mirror of `D-problem-decoding.md` for reference compatibility)*

## 1. Per-Domain Trigger Decoding (`Trigger → Evidence → Real Worry → What a Winning Answer Must Prove`)

### Domain 1 — AI Agents & Agentic Commerce (`D1`)
- **The Trigger**: Launch of **PayPal Agentic Commerce Services** (*Agent Ready* and *Store Sync*), `@paypal/agent-toolkit`, and `mcp.paypal.com` (2025–2026), alongside Google UCP/AP2, Visa TAP, and Cloudflare Web Bot Auth / x402, while security benchmarks (*InjecAgent* `arXiv:2403.02691`, *WASP* 2025) exposed indirect prompt injection vulnerabilities in web shopping agents.
- **The Evidence**: PayPal SVP of AI **Prakhar Mehrotra** publicly identified **Know Your Agent (KYA)** and digital trust as the core bottleneck of agentic commerce; Devpost features a dedicated **$5,000 Best Use of Agentic Commerce** prize.
- **What the Authors Are Actually Worried About**: Irreversible card/crypto rails (`x402`) offer zero recourse when an agent hallucinates or gets hijacked. PayPal wants to prove its reversible `Orders v2 AUTHORIZE → Shipment Tracking → CAPTURE/VOID` + `Disputes` architecture is the only safe settlement rail for AI agents.
- **What a Winning Answer Must Prove**: A deterministic **KYA Firewall & A2A Escrow Referee (`AegisPay`)** combining `mcp.paypal.com`, APIMatic `@paypal/paypal-server-sdk`, **Channel3** price verification, **Bryntum Scheduler** hold windows, and an **AG Studio** live risk ledger.

### Domain 2 — Money Movement Experiences (`D2`)
- **The Trigger**: Launch of **PayPal World** (linking **NPCI UPI**, Venmo, Mercado Pago, Tenpay Global across 2B users) and **PayPal JS SDK v6**, alongside RBI **PA-CB** eFIRA rules and 65M+ micro-gig workers needing instant payouts.
- **What a Winning Answer Must Prove**: Webhook-verified instant **PayPal Payouts** mapped to **Bryntum Scheduler** shifts (`TaskPulse Instant`), multimodal voice/receipt QR settlement (`SplitStream Live`), or cross-border PA-CB eFIRA routing (`CorridorIQ Settle`).

### Domain 3 — Business Solutions (`D3`)
- **The Trigger**: $100B+ in annual merchant chargeback & friendly-fraud losses, plus cross-border freelancer milestone defaults.
- **The Evidence**: `@paypal/agent-toolkit` ships `list_disputes`, `get_dispute`, `accept_dispute_claim`, and `create_tracking`/`get_tracking`, but lacks `provide_evidence`—inviting developers to bridge it via **APIMatic** and `@paypal/paypal-server-sdk`.
- **What a Winning Answer Must Prove**: Autonomous dispute representment (`ChargeShield AI`) or Bryntum Gantt milestone escrow + RBI PA-CB eFIRA generation (`ProofEscrow`).

### Domain 4 — Consumer Experiences (`D4`)
- **The Trigger**: $12.5B+ in elder/consumer online shopping scams and $133/mo average dark-pattern subscription waste.
- **What a Winning Answer Must Prove**: Senior scam interception via **PayPal `Orders v2 AUTHORIZE` holds + Family Guardian Co-Sign (`SilverGuard Pay`)** or autonomous **PayPal Subscriptions API** downgrade/cancellation (`SubSniper AI`).

### Domain 5 — Social Impact Ideas (`D5`)
- **The Trigger**: Donor distrust in opaque NGO fund routing and urgent need for transparent neighborhood climate/disaster resilience.
- **What a Winning Answer Must Prove**: Milestone-gated escrow on **Bryntum Gantt** + **Channel3** equipment price verification + multimodal proof verification releasing **PayPal Captures/Payouts** onto a public **AG Grid Social Audit Ledger (`CivicTrace Escrow`)**.
