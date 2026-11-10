# Dispatch — teamwork_worker_showcase_1

## Identity & Paths
- **Your Identity**: `teamwork_worker_showcase_1` (`teamwork_worker`)
- **Your Working Directory**: `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_worker_showcase_1`
- **Original Request**: `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Scope & Plan**:
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\orchestrator_main_1\SCOPE.md`
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\orchestrator_main_1\plan.md`
- **Explorer Analysis & Handoff Reports (READ FIRST)**:
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\analysis.md`
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\handoff.md`
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_3\analysis.md`
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_3\handoff.md`
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\analysis.md`
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\handoff.md`
- **Parent Conversation ID**: `49f6a062-fba5-4229-aa89-1d33d2111cce`

## Mandatory Integrity Warning
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A teamwork_auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

## Write Ownership & Immutability Boundaries
- **Exclusive Write Ownership**: `d:\Hackathons\PayPal\Talos\web\**` and your metadata folder `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_worker_showcase_1\**` (plus `.agent/` screenshots if captured during browser verification).
- **STRICT PROHIBITION (Zero Backend Changes)**: Do NOT modify any file in `services/firewall-rs/`, `services/orchestrator-go/`, `sdk/`, `api/`, `postman/`, or `tests/`.

## Reference Skills to Load & Follow
Read and apply all 5 reference skills:
- `gsd-plan-phase`: `C:\Users\Harshad\.gemini\config\skills\gsd-plan-phase\SKILL.md`
- `shadcn`: `C:\Users\Harshad\.gemini\config\skills\shadcn\SKILL.md`
- `unslop`: `C:\Users\Harshad\.gemini\config\skills\unslop\SKILL.md`
- `ralph-loop`: `C:\Users\Harshad\.gemini\config\skills\ralph-loop\SKILL.md`
- `agent-browser`: `C:\Users\Harshad\.gemini\config\skills\agent-browser\SKILL.md`

## Implementation Tasks

### Wave 1: Data Models, Pure Evaluators & `fast-check` Setup
1. Install `fast-check` as a devDependency in `d:\Hackathons\PayPal\Talos\web` (`npm install -D fast-check`).
2. Create `web/src/lib/storytelling-parts.ts` (`<= 200` lines):
   - Export `TALOS_FOUR_PILLARS` (KYA Mandate Permission Slip `<1ms` Ed25519, `<4ms` Rust `lol_html` + `DeBERTa-v3` DOM Firewall Webpage X-Ray, Channel3 Fair-Price Oracle blocking price gouging & fake stores, Reversible PayPal Orders v2 Escrow Hold `AUTHORIZE` -> Tracking -> `CAPTURE`/`0s VOID`).
   - Export `FIVE_PART_STORY_STAGES` covering all 5 required stages in plain, non-technical language:
     - Stage 1 (`story-stage-1`): What is happening in the real world (autonomous AI shopping agents given live wallet access).
     - Stage 2 (`story-stage-2`): What problem the user faces (AI agents read raw webpage HTML blindly; standard checkout is irreversible).
     - Stage 3 (`story-stage-3`): How the problem can be exploited (hidden `display:none` / HTML-comment prompt injection overrides budget caps; fake stores gouge `$249` items to `$480`; instant capture drains funds).
     - Stage 4 (`story-stage-4`): How TALOS identifies or prevents it (`<1ms` KYA Mandate check, `2.84ms` DOM Firewall X-ray stripping hidden instructions, Channel3 Fair-Price Oracle rejecting `+9,277 bps` gouging).
     - Stage 5 (`story-stage-5`): What happens after TALOS intervenes (reroutes to verified merchant at `$249.00` saving `$231.00`, holds money in reversible 29-day PayPal `AUTHORIZE` escrow until FedEx confirms `DELIVERED`, auto-voids in `0s` if 48h SLA is breached, or pauses for human passkey co-sign if `>$300`).
3. Create `web/src/lib/agent-comparison-scenarios.ts` (`<= 220` lines):
   - Export pure deterministic evaluation functions (`evaluateAgentComparisonScenario`, `computePriceSpreadBps`, `sanitizeStorefrontDom`, `evaluateEscrowLifecycleTransition`) and presets for `ACT_1` (Hidden Prompt Injection + `$480` Price Gouge), `ACT_2` (Verified `$249` Fair-Price Escrow -> Delivery `CAPTURE`), and `ACT_3` (`56h` Carrier SLA Breach `0s VOID` + `$450` Over-Cap Step-Up), plus interactive custom manipulation parameters (`injectHiddenPrompt`, `merchantAskUsd`, `fairMarketMedianUsd`, `mandateCapUsd`, `carrierHoursElapsed`, `slaDeadlineHours`).
   - Compute both the **Unprotected AI Agent** 5-step decision pipeline & financial consequence (`hijacked`, `chargedUsd`, `overpayLossUsd`, `irreversibleCapture`, `stepTraces`) and the **TALOS-Protected AI Agent** 5-step decision pipeline & financial outcome (`interceptionLayer`, `sanitizedDom`, `spreadBps`, `escrowState`, `protectedSpendUsd`, `savedUsd`, `fraudLossUsd: 0`, `stepTraces`).

### Wave 2: Startup Landing Page & 5-Part Storytelling Walkthrough Components (R1)
1. Create `web/src/components/StartupProductHero.tsx` (`<= 230` lines):
   - Renders `data-testid="startup-landing-hero"` at the top of `web/src/app/page.tsx`.
   - Presents what TALOS does, the problem it solves, why the problem matters, how TALOS works across the 4 pillars (`data-testid="talos-pillar-1"`..`data-testid="talos-pillar-4"`), key features/benefits, and prominent CTA buttons:
     - Primary CTA: **Try Interactive Simulator / Experience the Product** (`data-testid="landing-try-demo-cta"` and `id="cta-try-simulator-btn"`) that smoothly transitions/scrolls to the simulator and triggers a live scenario run.
     - Secondary CTAs: **Explore 5-Part Visual Story** (`data-testid="cta-story-walkthrough-btn"`) and **Open Operator Command Center** (`data-testid="cta-operator-dashboard-btn"`).
   - Includes a smooth **Showcase View Switcher** (`data-testid="showcase-view-switcher"`) with view pills (`All Showcase & Command Views` [default `'ALL'`], `Product Story & Landing` [`'LANDING_STORY'`], `Side-by-Side AI Simulator` [`'SIMULATOR_ARENA'`], `Operator Command Center` [`'OPERATOR_DASHBOARD'`]).
2. Create `web/src/components/StoryWalkthroughFivePart.tsx` (`<= 230` lines):
   - Renders `data-testid="storytelling-walkthrough-5part"` with interactive stage selector tabs/cards (`data-testid="story-stage-1"` .. `data-testid="story-stage-5"`), Next/Previous stage controls, plain-language narrative panels (Real-World Situation, What the Buyer Sees vs. What Happens Under the Hood, Financial Consequence), and a **"Simulate This Stage Live"** button (`data-testid="story-stage-simulate-btn"`) that triggers the live pipeline for that stage and scrolls to the corresponding workspace module.

### Wave 3: Side-by-Side "Unprotected AI vs. TALOS-Protected AI" Manipulation Simulator (R2 & R3)
1. Create `web/src/components/SideBySideAgentComparison.tsx` (`<= 235` lines):
   - Renders `data-testid="side-by-side-agent-comparison"` inside `PoisonedStoreSim.tsx`.
   - Provides interactive manipulation controls (`data-testid="manipulation-controls-bar"`):
     - Toggle Hidden Prompt Injection (`data-testid="toggle-prompt-injection"`)
     - Toggle Merchant Price Gouging (`$249 Fair` vs `$480 Gouge +92.7%`, `data-testid="toggle-price-gouge"`)
     - Toggle Carrier SLA Status (`36h On-Time` vs `56h SLA Breach`, `data-testid="toggle-sla-breach"`)
     - Run Live Comparison Action (`data-testid="btn-run-side-by-side-live"`) which invokes the live backend pipeline (`API-01`..`API-16` / `broadcastTalosEscrowEvent`).
   - Renders the 5-step **Real-Time Internal AI Processing Pipeline** (`data-testid="ai-internal-pipeline"`):
     1. Webpage DOM Ingestion
     2. Prompt & Context Parsing
     3. Price & Merchant Evaluation
     4. KYA Mandate & Policy Check
     5. Wallet / Escrow Execution
   - Renders the Side-by-Side Comparison Columns:
     - Left Column (`data-testid="unprotected-agent-outcome"`, `.tone-crimson`): Unprotected AI Agent decision chain, hijacked prompt parsing, and irreversible wallet loss (`-$480.00 Captured Irreversibly · $231.00 Overpay Loss`).
     - Right Column (`data-testid="talos-protected-agent-outcome"`, `.tone-emerald`): TALOS-Protected AI Agent decision chain, `<4ms` `lol_html` + `DeBERTa-v3` DOM sanitization, Channel3 Fair-Price reroute (`$249.00`), and reversible PayPal `AUTHORIZE` hold (`$231.00 Saved · $0 Unauthorized Spend`).
2. Integrate `<SideBySideAgentComparison />` into `web/src/components/PoisonedStoreSim.tsx` (keeping `PoisonedStoreSim.tsx <= 245` lines and preserving all existing `data-testid`s and text substrings).
3. Integrate `<StartupProductHero />` and `<StoryWalkthroughFivePart />` into `web/src/app/page.tsx` (keeping `page.tsx <= 235` lines, keeping default `showcaseView = 'ALL'` so all existing SSR and Playwright selectors remain mounted and visible, and using CSS `.hidden` when filtering views).

### Wave 4: Strict 20-Gate Anti-Slop Compliance & Property-Based + Component + E2E Tests (R4)
1. Verify all new/modified `.ts`, `.tsx`, and `.css` files in `web/src/` obey all 20 gates in `web/src/__tests__/anti-slop-20-gate.test.ts`:
   - Every file in `web/src/` MUST be **`<= 250` lines**!
   - NEVER use `rounded-full`, `rounded-3xl`, `italic`, `<em>`, `uppercase`, `tracking-wider`, `tracking-widest`, `tracking-tighter`, `border-b`, `divide-y`, `<hr>`, `border-slate-700`, `border-slate-800`, `text-slate-*`, slash-opacity classes (`bg-emerald-500/10`), gradients (`bg-gradient-to-*`, `linear-gradient`), numbered headings (`1. `), trailing periods `.` in `<h1..h3>`, `font-mono` on `<button>`/`<h1..h3>`, or `> 12` words in `<p data-subhead="true">`.
2. Create `web/src/__tests__/showcase-properties.test.ts`:
   - Implement property-based tests using `fast-check` (`fc.assert(fc.property(...), { numRuns: 100 })`) plus SSR component rendering assertions covering:
     - Property 1: Deterministic Ed25519 KYA Mandate signature & budget cap/step-up routing invariants across arbitrary budgets, prices, and spreads.
     - Property 2: DOM Firewall prompt-injection stripping invariant across arbitrary visible product strings and hidden injection payloads.
     - Property 3: Channel3 basis-point spread & Unprotected vs. TALOS-Protected financial outcome invariants (`protectedFraudLoss === 0`, `savedUsd >= 0`, never authorizing gouged or injected DOMs).
     - Property 4: Escrow state machine & KPI conservation invariants (`computeKpiMetrics(applyEscrowEventToRows(rows, evt))`) across arbitrary event sequences.
     - Property 5: 5-Part Storytelling & Startup Landing Page completeness and SSR rendering checks (`startup-landing-hero`, `storytelling-walkthrough-5part`, `story-stage-1..5`, `side-by-side-agent-comparison`, `unprotected-agent-outcome`, `talos-protected-agent-outcome`, `ai-internal-pipeline`).
3. Extend `web/e2e/talos-3act-demo.spec.ts` (or add a dedicated scenario in `web/e2e/`) so Playwright E2E verifies the Startup Landing Hero, 5-Part Storytelling Walkthrough stage switching, Side-by-Side Unprotected vs. TALOS-Protected simulator interactions, and Operator Command Center transitions.

### Wave 5: Full Build, Test, Live Stack & `agent-browser` Verification
1. Run in `d:\Hackathons\PayPal\Talos\web`:
   - `npx tsc --noEmit` (must pass with 0 errors)
   - `npm test` (all Vitest suites including `anti-slop-20-gate.test.ts`, `console-f01-f12.test.tsx`, and `showcase-properties.test.ts` must pass with 0 failures)
   - `npm run build` (Next.js production build must succeed with 0 errors)
2. Start the live stack from `d:\Hackathons\PayPal\Talos` (`.\start-dev.ps1 -Detached` so `firewall-rs` runs on `:8081`, `orchestrator-go` runs on `:8082`, and `web` runs on `:3000`).
3. Run Playwright E2E (`npx playwright test` in `web/`) and perform interactive `agent-browser` verification against `http://localhost:3000` (testing the landing page CTA, all 5 storytelling stages, side-by-side manipulation toggles & scenario triggers, and operator dashboard views, confirming zero runtime or console errors).
4. Verify `git status --porcelain services/ sdk/ api/ postman/ tests/` is empty (strict backend immutability).
5. Write `changes.md` and `handoff.md` in `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_worker_showcase_1\` and notify parent `49f6a062-fba5-4229-aa89-1d33d2111cce` via `send_message`.


## 2026-11-09T15:04:17Z
Dispatched `teamwork_worker_showcase_1` (`teamwork_worker`) by parent `49f6a062-fba5-4229-aa89-1d33d2111cce` to execute Waves 1–5 for the TALOS Frontend Capability Showcase (`web/`) with strict zero backend changes.
