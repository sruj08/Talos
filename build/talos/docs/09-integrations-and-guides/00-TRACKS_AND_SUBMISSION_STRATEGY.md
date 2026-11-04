# 00 — Tracks, Prize Matrix & Devpost Submission Strategy — TALOS
> Project: TALOS · Target Hackathon: [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/) (`31302-paypal-ai-hackathon`) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [MAP.md](../../MAP.md) · [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [HACKATHON_PLAN](../00-overview/HACKATHON_PLAN.md) · [PITCH](../00-overview/PITCH.md) · [PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK](../08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md)

---

## 1. Executive Summary: Why Our Track & Prize Strategy Wins

In the **PayPal AI Hackathon (`$69,750` total prize pool across 24 prizes)**, most teams submit a generic wrapper around a single API and check only one or two boxes on Devpost. **TALOS** is architected from first principles to:
1. Dominate **Domain 1 (`D1`): AI Agents & Agentic Commerce** (the flagship theme emphasized by PayPal CEO Alex Chriss and Sr. Director **Prakhar Mehrotra**), while cross-solving **Domain 3 (`D3`): Business Solutions** and **Domain 2 (`D2`): Money Movement Experiences**.
2. Qualify legitimately and deeply for **all 14 eligible Prize Categories** (`3 Grand Prizes`, `5 PayPal Honorable Mentions`, and `5 Sponsor Prize Pools` across **AG Grid**, **APIMatic**, **Bryntum**, **Channel3**, and **Render**).
3. Maximize **Official Rules §8 Prize Stacking** (`1 Overall/Category Prize` + `1 Sponsor Prize` = up to **`$17,000` USD in cash (`~₹14.28 Lakhs`) + Cloud/SaaS Subscriptions**).

---

## 2. Official Hackathon Domains (Tracks) & How TALOS Aligns

When filling out the Devpost submission form (`https://paypalaihackathon.devpost.com/`), frame TALOS around these three official problem statements:

| Track / Domain ID | Official Devpost Track Name | Role in TALOS Submission | Exact TALOS Proof Points to Cite in Devpost Form |
| :--- | :--- | :--- | :--- |
| **Primary Track (`D1`)** | **AI Agents & Agentic Commerce** *(Autonomous shopping, agent-to-agent transactions, smart negotiation)* | **Primary Track Selection** | - **Rust Zero-Trust MCP Server (`rmcp`)** exposing `talos_issue_mandate`, `talos_sanitize_dom`, and `talos_execute_protected_checkout`.<br>- **`Ed25519` Know-Your-Agent (KYA) Mandates** + RFC 9421 HTTP Message Signatures.<br>- **Sub-2ms DOM Prompt-Injection Sanitizer (`lol_html` + `DeBERTa-v3` ONNX)** preventing `CVE-2026-22708`-class web hijacking.<br>- **PayPal Agent Toolkit (`@paypal/agent-toolkit` & `mcp.paypal.com`)** + **PayPal JS SDK v6** human step-up co-signing. |
| **Secondary Track (`D3`)** | **Business Solutions** *(Invoicing, cash flow forecasting, dispute resolution, analytics)* | **Secondary Track Narrative** | - **Autonomous Dispute Evidence Packager (`F-10`)** submitting cryptographic KYA mandates + **Channel3** SKU snapshots + **KERNEL** screenshots to PayPal Sandbox `/v1/customer/disputes/{id}/provide-evidence`.<br>- **AG Grid Enterprise + AG Studio** live procurement blotter with natural-language AI financial pivoting.<br>- **Bryntum Scheduler Pro & Gantt** multi-milestone B2B delivery board where late carrier SLAs lock downstream tasks. |
| **Tertiary Track (`D2`)** | **Money Movement Experiences** *(Smarter P2P, payouts, splits, cross-border flows)* | **Tertiary Track Narrative** | - Turns irreversible agentic captures into a **Reversible Two-Phase Commit (2PC) Escrow Referee** using **PayPal Orders v2 (`intent: "AUTHORIZE"`) → Shipment Tracking v1 → Authorizations `CAPTURE` / `VOID`**. |

---

## 3. Complete 14-Category Prize Eligibility & Devpost Selection Matrix

> [!IMPORTANT]
> **Human Action Required on Devpost Submission Page**: Under the **"Opt-in Prizes / Sponsor Categories"** multi-select checkboxes on Devpost, **check EVERY SINGLE ONE of the following boxes**. Below is the exact justification you will paste into the Devpost submission description so every judge sees immediately why TALOS qualifies.

| # | Official Prize Category | Cash / Value | Number of Winners | Dedicated Judge(s) | Exact Component in TALOS Repo That Unlocks This Prize | Dedicated Guide in `docs/09-integrations-and-guides/` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **First Place (Grand Prize)** | **`$12,000` USD** | 1 Winner | Full 13-Judge Panel | Full polyglot `Rust + Go + Next.js 15` architecture, live PayPal Sandbox 2PC Escrow (`AUTHORIZE → Tracking → CAPTURE/VOID`), zero-trust KYA firewall, and 7 sponsor integrations. | [01-PAYPAL_SANDBOX_STEP_BY_STEP.md](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) |
| **2** | **Second Place** | **`$8,000` USD** | 1 Winner | Full 13-Judge Panel | Same as above (automatic runner-up consideration). | [01-PAYPAL_SANDBOX_STEP_BY_STEP.md](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) |
| **3** | **Third Place** | **`$5,000` USD** | 1 Winner | Full 13-Judge Panel | Same as above (automatic 3rd-place consideration). | [01-PAYPAL_SANDBOX_STEP_BY_STEP.md](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) |
| **4** | **Best Use of Agentic Commerce** *(Honorable Mention)* | **`$5,000` USD** | 1 Winner | Prakhar Mehrotra, Joyojeet Pal, Devansh | Solves the #1 blocker of Agentic Commerce: `Ed25519` KYA spending mandates + `lol_html` DOM prompt-injection stripping + reversible PayPal `Orders v2 AUTHORIZE` escrow + `@paypal/agent-toolkit`. | [01-PAYPAL_SANDBOX_STEP_BY_STEP.md](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) |
| **5** | **Best Use of PayPal + AI** *(Honorable Mention)* | **`$5,000` USD** | 1 Winner | Prakhar Mehrotra & PayPal AI Team | Combines 4 distinct PayPal surfaces (`@paypal/agent-toolkit`, `@paypal/paypal-server-sdk`, custom APIMatic Go SDK for Orders/Authorizations/Tracking/Disputes, and **PayPal JS SDK v6**) with local ONNX (`DeBERTa-v3`) & cloud LLM orchestration. | [01-PAYPAL_SANDBOX_STEP_BY_STEP.md](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) |
| **6** | **Most Creative** *(Honorable Mention)* | **`$5,000` USD** | 1 Winner | Full Panel | Repurposing **PayPal's 29-day `Orders v2 AUTHORIZE` hold + Shipment Tracking v1** as a zero-custody, self-enforcing Two-Phase Commit (2PC) smart-contract referee for AI agents—plus dragging a **Bryntum** SLA bar to fire a live PayPal `VOID`. | [04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md](04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md) |
| **7** | **Best Demo Delivery** *(Honorable Mention)* | **`$5,000` USD** | 1 Winner | Full Panel | 3-Act live adversarial demo (`2:45` YouTube video) with an interactive **"Poisoned Merchant Simulator"** where judges watch a live DOM prompt-injection and `$480` price-gouge get blocked in `<4ms`. | [PITCH.md](../00-overview/PITCH.md) |
| **8** | **Most Impactful** *(Honorable Mention)* | **`$5,000` USD** | 1 Winner | Full Panel | Protects consumers and mid-market enterprises from autonomous AI wallet drain (`CVE-2026-22708`), price gouging, and fraudulent merchants without holding custody of funds. | [PROJECT_BRIEF.md](../00-overview/PROJECT_BRIEF.md) |
| **9** | **Best Use of AG Grid** *(1st: `$5,000` / 2nd: `$2,000` / 3rd: `3× $1,000`)* | **`$10,000` Pool** *(5 Winners)* | 5 Winners | **Sylwia Vargas** (AG Grid) | `web/src/components/AgStudioBlotter.tsx` — **AG Grid Enterprise v33 + AG Studio AI Copilot + Integrated AG Charts + Master-Detail Forensics** streaming live PayPal Sandbox transactions via `applyTransactionAsync`. | [03-AG_GRID_AND_AG_STUDIO_GUIDE.md](03-AG_GRID_AND_AG_STUDIO_GUIDE.md) |
| **10** | **Best Use of APIMatic** *(`3× $1,000` Cash + 6mo Business Sub)* | **`$3,000` Cash Pool + Subs** *(3 Winners)* | 3 Winners | **Ameer Hassan** (Co-Founder, APIMatic) | Triple integration: (1) **APIMatic Context Plugin** in agent reasoning loop, (2) `@paypal/paypal-server-sdk`, and (3) custom **APIMatic-generated Golang SDK (`sdk/paypal-go-apimatic/`)** from PayPal OpenAPI 3.0 specs. | [02-APIMATIC_INTEGRATION_GUIDE.md](02-APIMATIC_INTEGRATION_GUIDE.md) |
| **11** | **Best Use of Bryntum** *(`3× $1,000` Cash)* | **`$3,000` Pool** *(3 Winners)* | 3 Winners | **Mats Bryntse** (Founder & CEO, Bryntum) | `web/src/components/BryntumSlaBoard.tsx` — **Bryntum Scheduler Pro & Gantt + Bryntum MCP (`mcp.bryntum.com`)** binding 29-day PayPal `AUTHORIZE` windows and carrier SLAs two-way to live PayPal `CAPTURE` / `VOID` calls. | [04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md](04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md) |
| **12** | **Best Use of Channel3** | **`$1,500` USD** | 1 Winner | **Ignacio Valdez Bicard** (Channel3) | `services/orchestrator-go/internal/channel3/oracle.go` — Queries **Channel3 (`trychannel3.com`)** 100M+ SKU catalog to compute **Fair-Market Median Price**, block `>15%` price gouging, and auto-reroute PayPal checkout. | [05-CHANNEL3_INTEGRATION_GUIDE.md](05-CHANNEL3_INTEGRATION_GUIDE.md) |
| **13** | **Best Use of Render** *(`$1,000` / `$750` / `$500` Credits)* | **`$2,250` Credits** *(3 Winners)* | 3 Winners | **Shifra Williams** (Render) | Root `render.yaml` declarative Blueprint deploying 5 native services (`runtime: rust`, `runtime: go`, `runtime: node`, Render PostgreSQL 16, Render Valkey/Redis). | [06-RENDER_BLUEPRINT_DEPLOYMENT_GUIDE.md](06-RENDER_BLUEPRINT_DEPLOYMENT_GUIDE.md) |
| **14** | **Judge Multipliers: Elastic, Postman, KERNEL, Astropods, Zapier** | **20% Tech + 20% Design Tie-Breakers** | Jury Score Boost | **Carly Richmond** (Elastic) & **Pooja Mistry** (Postman) | Elastic Cloud OTel APM + Vector Threat Index (`07`), Postman MCP & Sandbox Collection with `"Run in Postman"` badge (`08`), KERNEL Cloud Browser + Astropods + Zapier (`09`). | [07-ELASTIC_OTEL_AND_VECTOR_GUIDE.md](07-ELASTIC_OTEL_AND_VECTOR_GUIDE.md)<br>[08-POSTMAN_MCP_AND_COLLECTION_GUIDE.md](08-POSTMAN_MCP_AND_COLLECTION_GUIDE.md)<br>[09-KERNEL_ASTROPODS_ZAPIER_GUIDE.md](09-KERNEL_ASTROPODS_ZAPIER_GUIDE.md) |

---

## 4. Official Rules §8 Prize Stacking Math

Per **Official Rules Section 8 (Prizes)** of the PayPal AI Hackathon:
- A single team/submission may win **at most ONE (1) Overall or Honorable Mention Category Prize** (`$12,000` 1st, `$8,000` 2nd, `$5,000` 3rd, or `$5,000` Honorable Mention) **PLUS ONE (1) Sponsor Prize** (`Best Use of AG Grid`, `Best Use of APIMatic`, `Best Use of Bryntum`, `Best Use of Channel3`, or `Best Use of Render`).
- **Maximum Theoretical Cash Stack**:
  $$\text{First Place Grand Prize } (\$12,000) + \text{Best Use of AG Grid 1st Place } (\$5,000) = \$17,000 \text{ USD Cash } (\approx ₹14,28,000 \text{ INR})$$
- **High-Probability Expected Value Stack**:
  - Even if another team takes 1st Place Overall, TALOS has **8 independent shots** at a `$5,000+` Overall/Category prize (`1st`, `2nd`, `3rd`, `Agentic Commerce`, `PayPal + AI`, `Most Creative`, `Best Demo`, `Most Impactful`) **AND 15 independent winner slots** across the 5 Sponsor Prizes (`5× AG Grid`, `3× APIMatic`, `3× Bryntum`, `1× Channel3`, `3× Render`).

---

## 5. Master Human Action vs. Agent Execution Checklist Across Phases (`P0` – `P9`)

Use this table to know **exact moments when YOU (the human team) need to generate an API key or click a dashboard button**, versus what the coding agent builds automatically:

| Phase | Phase Name | What the Coding Agent Does Automatically | What YOU (Human) Do Using These Guides | Guide Reference |
| :--- | :--- | :--- | :--- | :--- |
| **`P0`** | **Repo, MIT License & Safe `.env` Setup** | Scaffolds monorepo (`services/firewall-rs`, `services/orchestrator-go`, `sdk/paypal-go-apimatic`, `web/`, `postman/`), writes `LICENSE` (MIT), `render.yaml`, `docker-compose.yml`, and `.env.example`. | 1. Push repo to public GitHub and verify the **MIT License badge** appears in the top-right **"About"** box.<br>2. Run the safe `credentials` terminal prompts to populate `.env` (or leave mock fallback enabled while getting keys). | `00`, `01` |
| **`P1`** | **Rust Security Kernel (`firewall-rs`)** | Writes `Ed25519` KYA mandate signer/verifier, `lol_html` + `DeBERTa-v3` ONNX DOM sanitizer, RFC 9421 verifier, and `rmcp` MCP server + runs `cargo test`. | Nothing required (100% local Rust + CPU inference). | `01`, `08` |
| **`P2`** | **APIMatic Go SDK & PayPal Sandbox** | Writes `sdk/paypal-go-apimatic` wrapper, Go 2PC escrow state machine (`AUTHORIZE → Tracking → CAPTURE / VOID`), and Recorded Sandbox Replay fallback. | 1. Log into `developer.paypal.com` (Sandbox mode) → Create App → Copy `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`.<br>2. Optionally run `apimatic-cli` with `APIMATIC_API_KEY` to regenerate `/sdk/paypal-go-apimatic`. | `01`, `02` |
| **`P3`** | **Channel3, KERNEL & Disputes** | Writes Go parallel `errgroup` fan-out to Channel3 oracle (`oracle.go`), KERNEL browser client (`browser.go`), and PayPal Disputes evidence packager. | 1. Sign up at `trychannel3.com` → Claim `$100` hackathon credit → Save `CHANNEL3_API_KEY`.<br>2. (Optional) Sign up at `onkernel.com` → Save `KERNEL_API_KEY`. | `05`, `09` |
| **`P4`** | **Next.js 15 Command Center UI** | Scaffolds Dark-Mode Glassmorphic UI, Poisoned Merchant Storefront Simulator, and WebSocket live state provider. | Nothing required. | `03`, `04` |
| **`P5`** | **AG Grid / AG Studio & Bryntum** | Implements `AgStudioBlotter.tsx` (Master-Detail, `applyTransactionAsync`, AG Studio AI bar) and `BryntumSlaBoard.tsx` (29-day AUTHORIZE + 48h SLA timeline bound to PayPal `VOID`). | (Optional) Add `NEXT_PUBLIC_AG_GRID_LICENSE_KEY` or `BRYNTUM_NPM_TOKEN` if using licensed registry; works out-of-the-box in hackathon trial/evaluation mode. | `03`, `04` |
| **`P6`** | **PayPal JS SDK v6 Step-Up Modal** | Implements `PayPalStepUpModal.tsx` (`@paypal/react-paypal-js`) for `>$300` step-up human co-signing. | Log in with `buyer-talos@personal.example.com` inside the PayPal popup modal when testing the step-up flow. | `01` |
| **`P7`** | **Elastic Cloud & Postman Harness** | Wires Rust & Go OpenTelemetry exporters and generates `postman/Talos-Sandbox-MCP.postman_collection.json`. | 1. (Optional) Create Elastic Cloud deployment → Save `ELASTIC_OTLP_ENDPOINT` & `ELASTIC_API_KEY`.<br>2. Import collection into Postman & create public workspace link. | `07`, `08` |
| **`P8`** | **Render Cloud Deployment** | Validates `render.yaml` and health check endpoints (`/healthz`). | Connect GitHub repo to Render (`Blueprints → New Blueprint Instance`) and paste `.env` secrets into Render dashboard. | `06` |
| **`P9`** | **Video Recording & Devpost Submit** | Generates final submission copy and pre-submission verification report. | Record `<3:00` (`2:45` target) YouTube demo video (Public/Unlisted) and submit form on Devpost before **Nov 12, 2026 @ 12:00 pm PST**. | `00` |

---

## 6. Stage-1 Disqualifier Checklist (Verify 24 Hours Before Deadline)

> [!CAUTION]
> **Every single item below is a hard Stage-1 compliance gate per Official Rules §4 & §6.** Missing even one item can result in administrative disqualification before judges ever score your project.

- [ ] **1. Public GitHub Repository**: Repository URL is publicly accessible without login (`200 OK` in an incognito browser window).
- [ ] **2. Open-Source `LICENSE` Visible in GitHub "About" Section**:
  - A standard `MIT` (or `Apache-2.0`) `LICENSE` file exists at the exact root of the repository (`/LICENSE`).
  - On the GitHub repository homepage, look at the **top-right "About" sidebar** and verify that **`MIT license`** with the balance-scale icon is visibly rendered by GitHub's license detector.
- [ ] **3. Demo Video Under 3:00 Minutes on YouTube / Vimeo**:
  - Video duration is strictly `<= 3:00` (target **`2:45`** so YouTube never rounds `2:59.6` up to `3:01`).
  - Video privacy is set to **Public** (or **Unlisted** with embedding enabled) and plays in an incognito window without age or region restrictions.
- [ ] **4. 100% PayPal Sandbox (`api-m.sandbox.paypal.com`) — Zero Real Financial Prompts**:
  - All API calls point to `https://api-m.sandbox.paypal.com`.
  - Nowhere in the app are judges asked to enter a real credit card, real bank account, or real PayPal production login.
  - Pre-configured Sandbox test credentials (`buyer-talos@personal.example.com`) and a 1-click **"Simulate Sandbox Order / Attack"** button are provided directly in the UI and `README.md`.
- [ ] **5. All 14 Eligible Prize Categories Checked on Devpost**:
  - Verify that `Best Use of AG Grid`, `Best Use of APIMatic`, `Best Use of Bryntum`, `Best Use of Channel3`, `Best Use of Render`, `Best Use of Agentic Commerce`, and `Best Use of PayPal + AI` are all selected in the Devpost submission form.
