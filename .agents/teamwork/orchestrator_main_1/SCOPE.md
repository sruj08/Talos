# Scope: TALOS Frontend Capability Showcase (`web/`)

## Architecture
- **Module Boundaries (`web/src/` — strictly `<= 250` lines per file)**:
  1. **`web/src/lib/storytelling-parts.ts` (`<= 200` lines)**:
     - Data model and plain-English content for R1:
       - Startup value proposition (what TALOS does, the problem it solves, why it matters, key features & benefits).
       - The 4 architectural pillars: (1) **KYA Mandate Permission Slip** (`Ed25519` `<1ms`), (2) **`<4ms` DOM Firewall Webpage X-Ray** (`Rust lol_html + DeBERTa-v3`), (3) **Channel3 Fair-Price Oracle** (`100M+` SKU benchmark blocking price gouging & fake stores), and (4) **Reversible PayPal Escrow Hold** (`Orders v2 AUTHORIZE` -> Carrier Tracking -> `CAPTURE` / `0s VOID`).
       - The **5-Part Real-World Storytelling Scenario** in plain, non-technical language:
         - **Part 1 (`what_is_happening`)**: What is happening in the real world (autonomous AI shopping agents delegated wallet access).
         - **Part 2 (`user_problem`)**: What problem the user faces (AI agents read raw webpage HTML blindly; instant payments are irreversible).
         - **Part 3 (`how_exploited`)**: How the problem can be exploited (hidden `display:none` / HTML comment prompt injection overrides budget rules; fake stores gouge `$249` items to `$480`; instant capture drains wallets).
         - **Part 4 (`how_talos_prevents`)**: How TALOS identifies or prevents it (KYA Mandate verification `<1ms`, DOM Firewall X-ray strips hidden traps in `2.84ms`, Channel3 Oracle rejects `+9,277 bps` gouging).
         - **Part 5 (`post_intervention`)**: What happens after TALOS intervenes (reroutes to verified seller at `$249`, locks reversible 29-day PayPal `AUTHORIZE` hold, releases `CAPTURE` on FedEx delivery or triggers `0s VOID` refund on 48h SLA breach, plus human step-up co-sign for orders `>$300`).
  2. **`web/src/components/StartupProductHero.tsx` (`<= 230` lines)**:
     - Startup-grade product landing section rendered at the top of `web/src/app/page.tsx`.
     - Displays the startup mission, problem vs. solution overview, 4-pillar architecture cards, key features/benefits, a prominent **Try Interactive Demo / Experience the Product** CTA button (`data-testid="landing-try-demo-cta"` / `data-testid="cta-try-simulator-btn"`), and a smooth **Showcase View Switcher** (`data-testid="showcase-view-switcher"`) switching cleanly between `All Showcase & Command Views` (default so all SSR and E2E selectors remain visible), `Product Story & Landing`, `Interactive AI Simulator`, and `Operator Command Center` using CSS `.hidden` (never unmounting DOM nodes).
  3. **`web/src/components/StoryWalkthroughFivePart.tsx` (`<= 230` lines)**:
     - Interactive 5-Part Real-World Storytelling Walkthrough (`data-testid="storytelling-walkthrough-5part"`) with clickable stage cards (`data-testid="story-stage-1"` .. `data-testid="story-stage-5"`), plain-language stage breakdown, real-world buyer/attacker/TALOS visual state comparison, and a **"Trigger This Stage in Live Simulator"** action button that invokes the corresponding live pipeline action and scrolls smoothly to the active module.
  4. **`web/src/lib/agent-comparison-scenarios.ts` (`<= 220` lines)**:
     - Pure deterministic model + scenario definitions for R2:
       - Computes side-by-side **Unprotected AI Agent** vs. **TALOS-Protected AI Agent** outcomes across the 5 internal decision stages (`1. Webpage DOM Ingestion`, `2. Prompt & Context Parsing`, `3. Price & Merchant Evaluation`, `4. Mandate & Policy Check`, `5. Wallet / Payment Execution`).
       - Supports both the 3 canonical live acts (`ACT_1` Hidden Prompt Injection + `$480` Price Gouge, `ACT_2` Verified `$249` Fair-Price Checkout -> Delivery `CAPTURE`, `ACT_3` `56h` Carrier SLA Breach `0s VOID` + `$450` Over-Cap Step-Up) and interactive custom manipulation toggles (toggle hidden DOM injection payload, toggle merchant price gouging `$249` vs `$480`, toggle carrier SLA breach `36h` vs `56h`, or inspect custom prompt-injection vectors).
  5. **`web/src/components/SideBySideAgentComparison.tsx` (`<= 235` lines)**:
     - Interactive side-by-side **"Unprotected AI vs. TALOS-Protected AI"** manipulation simulator (`data-testid="side-by-side-agent-comparison"`) with:
       - Interactive manipulation controls (toggle hidden prompt injection, price gouge level, carrier SLA status, and scenario presets) connected to live backend calls (`API-01`..`API-16`) and `broadcastTalosEscrowEvent`.
       - Real-time 5-stage internal AI processing pipeline (`data-testid="ai-internal-pipeline"`).
       - Left column (`data-testid="unprotected-agent-outcome"` / `data-testid="unprotected-ai-column"`, `.tone-crimson`): shows how an unprotected AI agent ingests hidden `SYSTEM OVERRIDE`, ignores the `$300` budget cap, accepts the `$480` scam price, and executes an irreversible payment capture (`-$480.00` drained, `$231.00` overpaid).
       - Right column (`data-testid="talos-protected-agent-outcome"` / `data-testid="talos-protected-ai-column"`, `.tone-emerald`): shows how TALOS strips the hidden DOM trap in `2.84ms`, blocks the `+9,277 bps` price gouge via Channel3, reroutes to `$249.00` verified seller, and locks funds in a reversible PayPal `AUTHORIZE` hold (`$231.00` saved, `$0` unauthorized spend).
  6. **`web/src/components/PoisonedStoreSim.tsx` (`<= 245` lines)** & **`web/src/app/page.tsx` (`<= 235` lines)**:
     - Integrate `<StartupProductHero />`, `<StoryWalkthroughFivePart />`, and `<SideBySideAgentComparison />` while keeping all 39 existing `data-testid` attributes, existing text substrings, and `<= 250` lines per file.
  7. **`web/src/__tests__/showcase-properties.test.ts`**:
     - Property-based test suite using `fast-check` alongside component/integration tests verifying R1–R4 invariants across hundreds of generated inputs.

## Feature Inventory
Every feature from the Survey phase appears below with its assigned milestone (`M1: Full Showcase & Verification`).

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Startup Product Hero & Value Proposition | Startup landing section in `web/src/app/page.tsx` explaining what TALOS does, the problem, why it matters, key features/benefits | M1 | survey (R1) |
| 2 | 4-Pillar "How TALOS Works" Breakdown | Plain-language & technical breakdown of KYA Mandate, `<4ms` DOM Firewall, Channel3 Oracle, and Reversible PayPal Escrow Hold | M1 | survey (R1) |
| 3 | Prominent CTA & Smooth View Switcher | Prominent Try Demo / Experience the Product CTA button + smooth view switching between Landing, Story, Simulator, and Operator Dashboard | M1 | survey (R1) |
| 4 | 5-Part Real-World Storytelling Walkthrough | Interactive 5-stage plain-English walkthrough covering (1) real-world context, (2) user problem, (3) exploitation, (4) TALOS prevention, (5) post-intervention outcome | M1 | survey (R1) |
| 5 | Interactive AI Manipulation Controls | Scenario triggers & interactive manipulation controls (hidden prompt injection, price gouging, fake stores, carrier SLA breach) | M1 | survey (R2) |
| 6 | Real-Time Internal AI Processing Visualizer | 5-stage internal decision pipeline showing how an AI agent processes webpage inputs in real time | M1 | survey (R2) |
| 7 | Side-by-Side Unprotected vs. TALOS-Protected AI | Direct visual & financial comparison of Unprotected AI outcome (hijacked, irreversible loss) vs. TALOS-Protected AI outcome (sanitized, escrow-protected, savings) | M1 | survey (R2) |
| 8 | Live Backend Pipeline Integration (`API-01`..`API-16`) | Live connection to `firewall-rs`, `orchestrator-go`, `/api/mcp/paypal-bridge`, `MandateStudio`, `AgStudioBlotter`, `BryntumSlaBoard`, `PayPalStepUpModal`, `useEscrowStream` | M1 | survey (R3) |
| 9 | Strict Backend Immutability | Zero changes to `services/firewall-rs/`, `services/orchestrator-go/`, `sdk/`, or `api/` | M1 | survey (R3) |
| 10 | 20-Gate Anti-Slop & SSR Contract Compliance | 100% pass on `anti-slop-20-gate.test.ts` (`<= 250` lines per file, Unslop Graphite tokens) and `console-f01-f12.test.tsx` | M1 | survey (R4) |
| 11 | Property-Based Test Suite (`fast-check`) | Generative property tests for KYA Mandate signatures/caps, DOM sanitization, Channel3 spread/savings math, escrow state machine, and simulator invariants | M1 | survey (R4) |
| 12 | Interactive Browser Verification (`agent-browser` + Playwright) | End-to-end live browser verification of landing page, 5-part walkthrough, side-by-side simulator, and operator dashboard with zero console/runtime errors | M1 | survey (R4) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Full Showcase, Simulator & Property Tests | Implement R1–R4 in `web/` using `gsd-plan-phase`, `shadcn`, `unslop`, `ralph-loop`, and `agent-browser` without touching backend files | none | DONE (`StartupProductHero.tsx`, `StoryWalkthroughFivePart.tsx`, `SideBySideAgentComparison.tsx`, `storytelling-parts.ts`, `agent-comparison-scenarios.ts`, `showcase-properties.test.ts`, `talos-3act-demo.spec.ts` — 62/62 Vitest, 6/6 Playwright, 0 backend changes) |

## Interface Contracts
### `StartupProductHero` & `StoryWalkthroughFivePart` ↔ `page.tsx`
- `showcaseView`: `'ALL' | 'LANDING_STORY' | 'SIMULATOR_ARENA' | 'OPERATOR_DASHBOARD'`
- Default `showcaseView` is `'ALL'` so initial SSR and Playwright renders include the Startup Hero, 5-Part Walkthrough, AND all 5 Command Center modules in the DOM. Switching views uses CSS `.hidden` (`className={isVisible ? '' : 'hidden'}`) rather than unmounting components.

### `SideBySideAgentComparison` ↔ `PoisonedStoreSim` & Live Backend Pipeline
- Receives `activeAct: JudgeActId`, `telemetry: ScenarioTelemetry`, `running: boolean`, and callbacks `onTriggerAct1`, `onTriggerAct2`, `onTriggerAct3`.
- Interactive parameter overrides compute live `UnprotectedAgentOutcome` vs. `TalosProtectedAgentOutcome` via `evaluateAgentComparisonScenario(params)` and invoke live pipeline endpoints (`POST /api/v1/checkout/evaluate`, `POST /api/mcp/paypal-bridge`, `PATCH /api/v1/sla/timeline/{id}`, `POST /api/v1/escrow/{id}/void`) plus `broadcastTalosEscrowEvent(...)`.
