# Track C — Judges & Jury Psychology (`C-judges.md`)

## 1. Composition of the 13-Judge Panel
The judging panel consists of **13 verified judges** listed on Devpost:
- **6 PayPal Judges (46.2%)**: 3 Developer Advocates (**Jo Franchetti**, **Eddie Jaoude**, **Marco Podien**), 2 Engineering Leaders (**Karthik Ravi**, **Himraj Singh**), and 1 Senior Product Manager (**Nathaniel Olson**).
- **7 Sponsor & Ecosystem Judges (53.8%)**: **Sylwia Vargas** (AG Grid / Bryntum), **Ameer Hassan** (APIMatic), **Mats Bryntse** (Bryntum CEO), **Ignacio Valdez Bicard** (Channel3), **Carly Richmond** (Elastic), **Pooja Mistry** (Postman), and **Shifra Williams** (Render).

> **Crucial Structural Insight**: More than half the judging panel works for the developer-tool sponsors/partners, and 8 of the 13 judges work in **Developer Relations / Open Source Community / SDK DX**. They will inspect your **GitHub repo README, `LICENSE` badge, code hygiene, and live demo UX** within the first 30 seconds!

---

## 2. Individual Judge Profiles (Background, Pet Peeves, Likely Question, Pitch Hook)

### 2.1 Jo Franchetti — Lead Developer Advocate, PayPal
- **Background**: Renowned web standards, CSS/UI, PWA, and hardware/IoT developer advocate (formerly Samsung Internet, Ably, Netlify). Deeply passionate about accessible, human-centric web experiences and clean frontend engineering.
- **What she rewards**: Crisp, accessible, responsive web UI; zero-jank live demos; projects that solve real human problems without confusing UX.
- **Pet peeve**: Inaccessible dark-on-dark UIs, broken mobile/web layouts, and over-complicated jargon that hides what the app actually does.
- **Likely question**: *"How does an everyday user or small merchant understand and trust what the AI agent is doing on screen?"*
- **How to pitch to her**: Highlight WCAG-compliant visual clarity, clear human-in-the-loop approval states, and modern PayPal JS SDK v6 web components.

### 2.2 Eddie Jaoude — Developer Relations, PayPal (GitHub Star & Open-Source Leader)
- **Background**: Creator of EddieHub, GitHub Star, YouTube educator with 100k+ developer followers. Obsessed with **Open Source hygiene**, commit history, GitHub Actions CI, clear `README.md` documentation, and inclusive developer onboarding.
- **What he rewards**: Repositories with a clean `LICENSE` in the top About section, badges, one-command setup, architecture diagrams, PR/commit structure, and a punchy demo video.
- **Pet peeve**: Single-"initial-commit" code dumps with missing `.env.example`, no tests, or missing open-source licenses.
- **Likely question**: *"Can another developer clone your repo today and run the PayPal Sandbox flow in under 3 minutes?"*
- **How to pitch to him**: Make the GitHub repo look like a flagship open-source project (`MIT` license, `render.yaml`, `.env.example`, Postman collection, automated tests).

### 2.3 Marco Podien — Senior Developer Advocate (EMEA), PayPal
- **Background**: Long-time PayPal Developer Evangelist across Europe; frequent speaker at WeAreDevelopers and fintech hackathons (including BattleHack veterans). Deep expertise in PayPal Orders v2, Multiparty payments, JS SDK v6, and MCP integrations.
- **What he rewards**: Proper PayPal payment lifecycle states (`CREATED` → `APPROVED` → `AUTHORIZED` → `CAPTURED` / `VOIDED`), webhook signature verification, and real Sandbox transactions.
- **Pet peeve**: Mocking PayPal with a fake "Payment Successful!" toast instead of hitting the real PayPal Developer Sandbox API.
- **Likely question**: *"Show me the actual PayPal Sandbox Order ID / Capture ID and how you handle asynchronous webhooks."*
- **How to pitch to him**: Display live clickable PayPal Sandbox Order/Authorization/Dispute IDs and real webhook payloads inside the AG Grid detail drawer.

### 2.4 Karthik Ravi — Software Engineer, PayPal
- **Background**: Software engineer working on PayPal's AI and commerce tooling (`@paypal/agent-toolkit`, MCP server integrations, and agentic workflows).
- **What he rewards**: Real multi-tool orchestration across `@paypal/agent-toolkit` and `mcp.paypal.com` (chaining Orders + Shipment Tracking + Invoices/Disputes), deterministic guardrails around non-deterministic LLMs, and clean TypeScript/Python architecture.
- **Pet peeve**: Using an LLM only to format text while hardcoding a single API call, or allowing raw prompt injection to trigger payment tools.
- **Likely question**: *"How do you prevent an LLM hallucination or indirect prompt injection from executing an unauthorized PayPal capture?"*
- **How to pitch to him**: Show our deterministic **Know-Your-Agent (KYA) Policy Engine** intercepting the MCP tool call and enforcing `intent: "AUTHORIZE"` before capture.

### 2.5 Himraj Singh — Engineering Manager, PayPal
- **Background**: Engineering leader at PayPal focused on production reliability, risk, scalability, idempotency, and enterprise commerce infrastructure.
- **What he rewards**: Idempotency keys (`PayPal-Request-Id`), error recovery, rate-limit handling, audit trails, and production-grade system design.
- **Pet peeve**: Happy-path-only demos that crash or double-charge when a network retry occurs.
- **Likely question**: *"What happens if the merchant webhook fails or the agent retries the payment tool call twice?"*
- **How to pitch to him**: Highlight `PayPal-Request-Id` idempotency enforcement, state-machine locking, and full OpenTelemetry audit traces.

### 2.6 Nathaniel Olson — Senior Product Manager, PayPal
- **Background**: Senior PM at PayPal focused on commerce product adoption, merchant conversion, unit economics, and solving high-friction buyer/seller pain points.
- **What he rewards**: Clear business case, measurable merchant ROI (higher conversion, lower chargebacks, new agentic GMV), and why PayPal is uniquely essential to the product.
- **Pet peeve**: Solutions looking for a problem, or ideas where PayPal could be swapped out for any generic database.
- **Likely question**: *"Why does a merchant or consumer need PayPal specifically for this workflow rather than a standard card rail?"*
- **How to pitch to him**: Emphasize that **only PayPal** offers a programmable two-sided trust network combining `Orders v2 AUTHORIZE/CAPTURE`, `Shipment Tracking`, and `Disputes API` under one roof.

### 2.7 Sylwia Vargas — Senior Technical Community Manager, AG Grid & Bryntum
- **Background**: Developer educator and community leader representing **both AG Grid and Bryntum** (formerly at StackBlitz, Prisma). Evaluates both the **$10,000 AG Grid prize pool** and the **$3,000 Bryntum prize pool**.
- **What she rewards**: Deep, idiomatic integration of **AG Grid / AG Studio** and **Bryntum** components working together seamlessly in a modern React app, with custom cell renderers, live updates, and zero visual clutter.
- **Pet peeve**: Dropping an empty default `<AgGridReact />` table at the bottom of a page just to check a sponsor box.
- **Likely question**: *"How are AG Grid / AG Studio and Bryntum central to the user's decision-making workflow?"*
- **How to pitch to her**: Make the **AG Grid + AG Studio Command Center** and **Bryntum Scheduler Pro Timeline** the primary interactive surfaces of the entire application.

### 2.8 Ameer Hassan — Co-Founder & VP, APIMatic
- **Background**: Co-founder of APIMatic, the company behind PayPal's official `@paypal/paypal-server-sdk`, auto-generated SDKs, and MCP server generation.
- **What he rewards**: Use of `@paypal/paypal-server-sdk` (instead of raw `fetch` or legacy SDKs) plus generating typed SDKs / MCP servers from OpenAPI specs using APIMatic.
- **Pet peeve**: Hand-rolled brittle `axios`/`fetch` wrappers with untyped JSON payloads or deprecated `paypal-rest-sdk` imports.
- **Likely question**: *"How did you ensure strict schema validation and type safety between your AI agent and the PayPal REST endpoints?"*
- **How to pitch to him**: Show APIMatic-generated SDKs and MCP tool wrappers bridging `@paypal/paypal-server-sdk` with PayPal's Disputes & Authorizations APIs.

### 2.9 Mats Bryntse — Founder & CEO, Bryntum
- **Background**: Founder of Bryntum; spent 15+ years engineering the fastest web-based Gantt, Scheduler Pro, Calendar, and TaskBoard engines on the planet, plus `https://mcp.bryntum.com`.
- **What he rewards**: Interactive temporal scheduling—dependencies, critical-path constraints, drag-and-drop milestone updates, and resource allocation driving real backend actions.
- **Pet peeve**: Static timeline graphics or read-only calendars where dragging a bar does nothing.
- **Likely question**: *"What happens in PayPal when a milestone shifts or a delivery window expires on the Bryntum timeline?"*
- **How to pitch to him**: Demonstrate live two-way binding: dragging or completing a task on **Bryntum Scheduler Pro / Gantt** immediately fires a PayPal `CAPTURE` or `VOID` API call.

### 2.10 Ignacio Valdez Bicard — Founding Engineer, Channel3
- **Background**: Founding engineer at Channel3 (`trychannel3.com`), building the universal product graph and MCP server for AI shopping agents.
- **What he rewards**: Real-time multi-merchant product search, multimodal SKU matching, live price/stock verification, and affiliate monetization via Channel3's API/MCP.
- **Pet peeve**: Hardcoded mock JSON product catalogs (`products.json`) when Channel3 gives you 100M+ live products via a single API call.
- **Likely question**: *"How does your agent verify that the item it's buying is actually in stock and fairly priced across the web?"*
- **How to pitch to him**: Use Channel3 live in the demo to query real products, compare cross-merchant pricing, and block overpriced/scam listings before PayPal authorization.

### 2.11 Carly Richmond — Senior Manager DevRel & Principal Developer Advocate, Elastic
- **Background**: Former investment banking technologist turned Principal DevRel at Elastic; specialist in **OpenTelemetry (OTel), observability, APM traces, and Elasticsearch Vector/ES|QL search**.
- **What she rewards**: Observable AI—showing exact LLM latency, token cost, MCP tool-call spans, and fraud/policy vector search inside Elastic.
- **Pet peeve**: "Black-box" AI agents where nobody can explain why the agent chose a tool or where a failure occurred.
- **Likely question**: *"When an autonomous payment agent misbehaves or a tool call fails, how do you trace and audit the root cause?"*
- **How to pitch to her**: Show live OpenTelemetry traces of every MCP tool call and ES|QL risk queries indexed in Elastic.

### 2.12 Pooja Mistry — Senior Developer Advocate (AI & MCP), Postman
- **Background**: Senior Developer Advocate at Postman specializing in **Postman AI Agent Builder, MCP Server generation, and collaborative API collections**.
- **What she rewards**: Clean API contracts, reproducible Postman Collections/Flows, and MCP server inspectability.
- **Pet peeve**: Undocumented backend endpoints that require reading 500 lines of source code to test.
- **Likely question**: *"How did you design, test, and document your MCP tool schemas and PayPal webhook payloads?"*
- **How to pitch to her**: Ship a ready-to-import Postman Collection + Flow in the repository with a one-click "Run in Postman" button.

### 2.13 Shifra Williams — Founding Developer Relations Engineer, Render
- **Background**: Founding DevRel Engineer at Render, focused on cloud infrastructure-as-code (`render.yaml` Blueprints), background workers, managed Postgres/Redis, and zero-downtime deployments.
- **What she rewards**: Production-ready multi-service cloud architecture deployed live on Render via `render.yaml`.
- **Pet peeve**: `localhost:3000`-only demos that fail when judges click the live URL.
- **Likely question**: *"How is your multi-agent system architected and deployed in production so webhooks and background checks run reliably?"*
- **How to pitch to her**: Provide a fast, zero-cold-start live deployment on Render backed by a multi-service `render.yaml` Blueprint.

---

## 3. Judge Heat-Map (What Each Judge Wants to See in 180 Seconds)

| Judge | Role / Org | Primary Criterion Focus | What Makes Them Score 20/20 | Our Specific Hook in `TALOS` / `CivicTrace` / `ChargeShield` |
|---|---|---|---|---|
| **Jo Franchetti** | PayPal DevRel | Design (20%) & Presentation (20%) | Accessible, human-centric UX; crystal-clear agent trust states | Glassbox KYA Approval Card + PayPal JS SDK v6 + zero-jank UI |
| **Eddie Jaoude** | PayPal DevRel | Tech Implementation (20%) | Visible `MIT` license in GitHub About, clean commits, CI, 1-command setup | Flagship OSS repo structure, `LICENSE` in About, `render.yaml`, tests |
| **Marco Podien** | PayPal DevRel | Tech Implementation (20%) | Real PayPal Sandbox Order/Auth/Capture/Dispute IDs & webhooks | Live clickable Sandbox IDs + cryptographic webhook verifier |
| **Karthik Ravi** | PayPal SWE | Tech Implementation (20%) & Innovation (20%) | Multi-tool `@paypal/agent-toolkit` + `mcp.paypal.com` + prompt-injection defense | Deterministic KYA Firewall intercepting MCP tool calls |
| **Himraj Singh** | PayPal Eng Mgr | Tech Implementation (20%) & Impact (20%) | `PayPal-Request-Id` idempotency, state-machine locks, audit logs | Idempotent escrow state machine (`AUTHORIZED` → `CAPTURED`/`VOIDED`) |
| **Nathaniel Olson** | PayPal Sr. PM | Potential Impact (20%) & Innovation (20%) | Clear GMV/margin ROI; why PayPal's 2-sided network is irreplaceable | Solves the $1T agentic commerce trust gap using PayPal Auth + Tracking + Disputes |
| **Sylwia Vargas** | AG Grid & Bryntum | Design (20%) & AG Grid / Bryntum Prizes | Master/Detail AG Grid + AG Studio AI + Bryntum Scheduler in harmony | Live AG Studio Escrow Ledger + Bryntum Hold/Expiry Timeline |
| **Ameer Hassan** | APIMatic Co-Founder | Tech Implementation (20%) & APIMatic Prize | `@paypal/paypal-server-sdk` + APIMatic-generated typed SDK & MCP server | Custom APIMatic-generated SDK & MCP server for Disputes Evidence & Auth/Capture |
| **Mats Bryntse** | Bryntum CEO | Design (20%) & Bryntum Prize | Interactive Gantt/Scheduler dependencies triggering real financial actions | Dragging/verifying Bryntum milestones fires PayPal `CAPTURE` or `VOID` |
| **Ignacio Valdez Bicard** | Channel3 Founding Eng | Tech Implementation (20%) & Channel3 Prize | Live 100M+ SKU search, price-oracle check & affiliate links via Channel3 | Channel3 Price-Gouging & Counterfeit Oracle before PayPal `AUTHORIZE` |
| **Carly Richmond** | Elastic Principal DevRel | Tech Implementation (20%) | OpenTelemetry spans for every LLM/MCP/PayPal call + ES|QL vector search | Full Elastic OTel Agent Trace + ES|QL fraud/dispute policy engine |
| **Pooja Mistry** | Postman Sr. DevRel | Tech Implementation (20%) & Presentation (20%) | Exported Postman Collection + MCP tool inspection | One-click `Run in Postman` collection for all MCP & PayPal Sandbox flows |
| **Shifra Williams** | Render Founding DevRel | Tech Implementation (20%) & Render Prize | Multi-service `render.yaml` Blueprint + fast live production URL | Full `render.yaml` deploying web app, MCP gateway, worker & Postgres on Render |
