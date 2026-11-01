# Track A — Organisers & Committee (`A-organisers.md`)

## 1. Who Owns This Hackathon & What Is Their Mandate?
The **PayPal AI Hackathon** ([`https://paypalaihackathon.devpost.com/`](https://paypalaihackathon.devpost.com/)) is organized and funded by **PayPal, Inc.** (specifically its **Developer Relations**, **AI Platform**, and **Agentic Commerce Product Engineering** divisions), administered on Devpost.

Between 2025 and 2026, PayPal CEO **Alex Chriss**, CTO **Srini Venkatesan**, and SVP & Head of AI **Prakhar Mehrotra** launched an existential company-wide pivot to transform PayPal from a legacy checkout button into the **default settlement, risk, and identity layer for Agentic Commerce** ([PayPal Newsroom](https://newsroom.paypal-corp.com/), [PayPal Developer Portal](https://developer.paypal.com/)).

### Key Pillars of PayPal's 2025–2026 AI & Developer Mandate:
1. **PayPal Agentic Commerce Services (`Agent Ready` & `Store Sync`)**: Unveiled in late 2025, enabling tens of millions of PayPal merchants to expose their product catalogs to AI shopping agents (Perplexity, ChatGPT, Claude, custom MCP agents) and accept autonomous transactions with built-in fraud protection and dispute resolution ([PayPal Agentic Commerce Press Release](https://newsroom.paypal-corp.com/)).
2. **`@paypal/agent-toolkit` & `paypal/AI-Toolkit`**: Open-source SDKs ([`github.com/paypal/agent-toolkit`](https://github.com/paypal/agent-toolkit) and [`github.com/paypal/AI-Toolkit`](https://github.com/paypal/AI-Toolkit)) and remote/local **Model Context Protocol (MCP)** servers (`mcp.paypal.com`) exposing 30+ structured tools across **Invoices**, **Orders**, **Disputes**, **Shipment Tracking**, **Catalog Products**, **Subscriptions**, and **Transaction Search**.
3. **Modern APIMatic-Powered Server SDKs (`@paypal/paypal-server-sdk`)**: Replacing the deprecated `paypal-rest-sdk` across Node.js/TypeScript, Python, Java, C#, PHP, and Ruby, alongside an AI Context Plugin to stop LLMs from hallucinating legacy v1 endpoints ([`@paypal/paypal-server-sdk` on npm](https://www.npmjs.com/package/@paypal/paypal-server-sdk)).
4. **PayPal JS SDK v6 & PayPal World**: Next-generation modular web components (`@paypal/react-paypal-js`, One-Time Payment Sessions, Pay Later, Venmo) and the **PayPal World** interoperability switch linking **NPCI's UPI (India)**, Tenpay Global, Mercado Pago, and Venmo across 2 billion users ([Economic Times](https://economictimes.indiatimes.com/)).

---

## 2. Why Is PayPal Running This Hackathon Right Now? (Hidden Motives)
1. **Battle for Developer Mindshare Against Stripe (`@stripe/agent-toolkit`) and Coinbase/Cloudflare (`x402`)**:
   - Stripe captured early AI agent developer mindshare with `@stripe/agent-toolkit`, and Coinbase + Cloudflare launched the `x402` HTTP-native stablecoin protocol ([Cloudflare Blog](https://blog.cloudflare.com/)). PayPal is spending $69,750 in prizes + DevRel marketing to get **24,754 registered developers** to build public, open-source reference architectures on GitHub using `@paypal/agent-toolkit`, `mcp.paypal.com`, and `@paypal/paypal-server-sdk`.
2. **Real-World Stress-Testing of the MCP + Agent Toolkit Surface**:
   - PayPal's AI engineering and product judges (**Karthik Ravi**, **Himraj Singh**, **Nathaniel Olson**) want to see how external developers chain PayPal's MCP tools (`create_order`, `create_invoice`, `list_disputes`, `create_tracking`, `create_subscription`) in real multi-step workflows, and where the gaps are.
3. **Training Data & Open-Source Reference Repos for AI Coding Assistants**:
   - Notice the strict **Stage 1 Pass/Fail rule**: every submission must have a public GitHub repo with a **visible open-source `LICENSE` in the top About section**. Why? Because PayPal DevRel (**Eddie Jaoude**, **Jo Franchetti**, **Marco Podien**) can only fork, showcase, and index repositories that carry a valid OSI-approved open-source license!
4. **Validating "Know Your Agent" (KYA) & Trust Infrastructure**:
   - Prakhar Mehrotra has repeatedly stated that the bottleneck to agentic commerce is not LLM intelligence—it is **merchant and consumer trust, dispute liability, and KYA verification**. PayPal's unfair advantage over raw crypto (`x402`) or bare card rails is its 25-year two-sided network of **Authorizations, Shipment Tracking, Buyer/Seller Protection, and Disputes APIs**.

---

## 3. Historical DNA: Lessons from Past PayPal Hackathons
- **PayPal BattleHack ($100,000 World Finals)**:
  - *Winners*: **Donate Now** (Tel Aviv — physical BLE beacon instant micro-donations), **Clean Berlin** (civic cleanup verified by photo proof triggering PayPal payouts), **PayPup** (Austin), **Get Fresh** (NYC).
  - *Takeaway*: PayPal judges consistently reward **tangible real-world state transitions** (a physical delivery, a verified civic action, a hardware/webhook trigger) that automatically settle money via PayPal APIs—never passive dashboards or static chat screens.
- **PayPal Opportunity Hack (`ohack.org`)**:
  - *Winners*: **HomeFirst Services**, **Sequoia Humane Society** operational tools.
  - *Takeaway*: In Social Impact tracks, PayPal engineers reward **verifiable operational accountability and zero-leakage fund tracking** over generic donation landing pages.
