# Handoff Report — `teamwork_spec_miner_showcase_1` (Hard Handoff)

## 1. Observation

1. **User Requirements & Scope (`d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md:1-145`)**:
   - The objective is to upgrade the TALOS Next.js 15 frontend (`web/`) into a comprehensive **TALOS Frontend Capability Showcase** while keeping backend services (`services/firewall-rs/`, `services/orchestrator-go/`, `sdk/paypal-go-apimatic/`) strictly read-only.
   - Four core requirement groups are mandated:
     - **R1 (Startup Landing Page & 5-Part Storytelling Walkthrough)**: Entry landing experience explaining what TALOS does, the problem, why it matters, how it works across the 4 pillars (**KYA Mandate**, **`<4ms` DOM Firewall**, **Channel3 Fair-Price Oracle**, **PayPal Escrow Hold** `AUTHORIZE` -> Tracking -> `CAPTURE`/`VOID`), key benefits, a prominent **Try Demo / Experience the Product** CTA button transitioning smoothly to the interactive simulator/dashboard, and a **5-Part Real-World Storytelling Walkthrough** in plain language covering Stages 1–5.
     - **R2 (Interactive Product Demonstration & Side-by-Side AI Manipulation Simulator)**: Interactive simulator showing how an AI agent normally makes decisions vs. how it processes malicious inputs (hidden prompt injection, price gouging, fake stores), real-time internal processing pipeline observation, and a **Side-by-Side "Unprotected AI Agent vs. TALOS-Protected AI Agent" Comparison**.
     - **R3 (Live Backend Pipeline Integration)**: End-to-end integration with `/api/mcp/paypal-bridge` (`web/src/app/api/mcp/paypal-bridge/route.ts:1-225`), `MandateStudio.tsx`, `AgStudioBlotter.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`, `useEscrowStream.ts`, and `TalosClearingContext.tsx`.
     - **R4 (Skill-Guided Quality, Anti-Slop Design & Automated Verification)**: Compliance with `gsd-plan-phase`, `shadcn`, `unslop`, `ralph-loop`, and `agent-browser`, plus a **property-based test suite** and full unit/component/E2E verification.

2. **Existing Codebase State & Automated Contract Gates (`web/src/`)**:
   - `web/src/app/page.tsx:1-60` currently renders `<SovereignHeaderAndDock />`, `<GuidedDemoBanner />`, and the 4 operator panels (`<MandateStudio />`, `<PoisonedStoreSim />`, `<AgStudioBlotter />`, `<BryntumSlaBoard />`) plus `<PayPalStepUpModal />` inside `<TalosClearingProvider>`.
   - `web/src/components/GuidedDemoBanner.tsx:1-147` currently implements a 4-step judge bar (`guide-step-1`..`guide-step-4`), not the full Startup Landing Page or the 5-Part Real-World Storytelling Walkthrough (`Stage 1`..`Stage 5`).
   - `web/src/components/PoisonedStoreSim.tsx:1-229` (`229` lines) currently displays 3 scenario buttons (`scenario-poisoned-480`, `scenario-clean-249`, `scenario-step-up-340`) and a 2-column Raw vs. Sanitized HTML box (`raw-html-box`, `sanitized-html-box`), but lacks the **Side-by-Side "Unprotected AI Agent vs. TALOS-Protected AI Agent" Comparison** and the **Real-Time Internal AI Processing Pipeline Visualizer**.
   - `web/src/__tests__/anti-slop-20-gate.test.ts:1-294` enforces **20 strict static and SSR DOM gates** across **every** `.ts`, `.tsx`, and `.css` file under `web/src/` (excluding test files):
     - **Line 266 (`Gate #20`)**: Every file under `web/src/` must be `<= 250 lines` (`expect(lines, fullPath).toBeLessThanOrEqual(250)`).
     - **Lines 270–292 (`Gate #20`)**: All 32 required `data-testid`s must remain present in `web/src/components/`.
     - **Lines 67–256 (`Gates #1–#19`)**: Strictly forbids `rounded-full`, `italic`/`<em>`, `Instrument Serif`, `tracking-tighter`, `<hr>`/`divide-y`/`border-b`, Tailwind slash opacity (`bg-emerald-500/10`), `text-slate-\d+`, `border-slate-800`/`700`, `<p data-subhead="true">` > 12 words, `(F-XX)`/`Sponsor Pool`, numbered headings (`1. `), banned eyebrows, `feTurbulence`, box-drawing ASCII, `rounded-3xl`, `font-mono` on `<button>`/`<h1..h3>`, `uppercase`/`tracking-wider`/`tracking-widest`, CSS gradients (`bg-gradient-to-*`, `linear-gradient(`), and trailing periods in `<h1..h3>`.
   - `web/src/__tests__/console-f01-f12.test.tsx:1-130`, `web/src/components/GuidedDemoBanner.spec.tsx:1-41`, and `web/src/components/Phase6Integration.spec.tsx:1-46` call `renderToStaticMarkup(<TALOSCommandCenterPage />)` directly and assert that all 32 `data-testid`s and workspace headings (`Mandate Clearing Studio`, `Red-Team Interception Arena`, `Escrow Settlement Ledger`, `Delivery SLA Timeline`) are present in the initial SSR markup.

3. **Reference Skills Inspected**:
   - `C:\Users\Harshad\.gemini\config\skills\gsd-plan-phase\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\shadcn\SKILL.md` (+ `rules/styling.md`, `rules/composition.md`)
   - `C:\Users\Harshad\.gemini\config\skills\unslop\SKILL.md` (+ `references/tokens.md`, `references/signs.md`)
   - `C:\Users\Harshad\.gemini\config\skills\ralph-loop\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\agent-browser\SKILL.md`

---

## 2. Logic Chain

1. **Why R1 Must Be Integrated Without Unmounting Command Center Panels in SSR** (from Observation #2):
   - Because `console-f01-f12.test.tsx`, `GuidedDemoBanner.spec.tsx`, `Phase6Integration.spec.tsx`, and `e2e/talos-3act-demo.spec.ts` render `<TALOSCommandCenterPage />` and immediately query `kya-mandate-form`, `poisoned-store-sim`, `ag-studio-blotter`, `bryntum-sla-board`, `paypal-step-up-modal`, and `guided-demo-banner`, hiding the Command Center behind a conditional `if (view === 'landing') return <LandingOnly />` would break 5 existing test suites.
   - Therefore, the Startup Landing Page & 5-Part Storytelling Walkthrough must render at the top of `web/src/app/page.tsx` above the Command Center workspace (with smooth CTA transition/scroll + view-focus state), while preserving `guided-demo-banner` and `guide-step-1..4` alongside `story-stage-1..5`.

2. **Why R1 and R2 Must Be Split Into Modular Files `<= 250` Lines Each** (from Observation #2):
   - `anti-slop-20-gate.test.ts:266` fails if any file in `web/src/` exceeds `250` lines.
   - `PoisonedStoreSim.tsx` is already `229` lines (`21` lines below the ceiling).
   - Therefore, the new R1 Startup Hero & 5-Part Storytelling Walkthrough (`StartupHeroAndStory.tsx` + `storytelling-stages.ts`) and R2 Side-by-Side Unprotected vs. TALOS-Protected AI Comparison (`SideBySideAgentComparison.tsx`) must be created as dedicated modular files (`<= 220` lines each) and composed cleanly into `page.tsx` and `PoisonedStoreSim.tsx`.

3. **How R2 Connects to R3 Live Backend Pipeline Without Touching Backend Files** (from Observation #1 & #2):
   - `usePoisonedStoreSim.ts:141-212` already calls `POST /api/mcp/paypal-bridge` (`SCAN_AND_CLEAR`) and dispatches `TALOS_ESCROW_EVENT` (`ESCROW_AUTHORIZED` / `STEP_UP_REQUIRED`), which updates `TalosClearingContext`, `AgStudioBlotter`, `BryntumSlaBoard`, and `PayPalStepUpModal`.
   - Extending `usePoisonedStoreSim.ts` / `SideBySideAgentComparison.tsx` to compute and display the deterministic **Unprotected AI Agent** outcome alongside the live **TALOS-Protected AI Agent** telemetry satisfies R2 and R3 with zero modifications to `services/firewall-rs/`, `services/orchestrator-go/`, or `sdk/paypal-go-apimatic/`.

4. **How R4 Property-Based Testing Can Be Implemented Cleanly** (from Observation #1 & #2):
   - A new Vitest property-based test suite (`web/src/__tests__/showcase-property.test.ts`) can run seeded generative property tests (`>= 100` generated cases per invariant) verifying KYA Mandate budget/step-up routing, DOM Firewall hidden prompt-injection stripping, Channel3 basis-point spread and savings math, 2PC Escrow state transitions (`AUTHORIZED -> CAPTURED | VOIDED`), and 5-Part Storytelling + Side-by-Side Simulator state determinism.

---

## 3. Caveats

- **No caveats.** All specification sources, existing frontend components, test suites, and reference skills were directly inspected and verified.

---

## 4. Conclusion

The complete feature inventory, edge-case matrix, modular file architecture, 20-gate anti-slop constraints, and skill requirements for the **TALOS Frontend Capability Showcase (`web/`)** have been documented in `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\analysis.md`.

Key implementation blueprint for downstream planning/execution:
1. **Create `web/src/lib/storytelling-stages.ts` (`<= 150 lines`)**: Pure data & plain-language copy for the 4 TALOS pillars, the 5-Part Real-World Storytelling Walkthrough (`Stage 1`..`Stage 5`), and the Unprotected AI vs. TALOS-Protected AI pipeline steps.
2. **Create `web/src/components/StartupHeroAndStory.tsx` (`<= 220 lines`)**: Startup Landing Page entry section (what TALOS does, the problem, why it matters, 4-pillar "How It Works" breakdown, prominent `landing-try-demo-cta` button, and interactive 5-Part Storytelling Walkthrough `storytelling-walkthrough-5part` with `story-stage-1`..`story-stage-5`).
3. **Create `web/src/components/SideBySideAgentComparison.tsx` (`<= 220 lines`)**: Side-by-side `unprotected-ai-column` vs. `talos-protected-ai-column` comparison + 5-step `ai-internal-pipeline` real-time processing visualizer.
4. **Update `web/src/components/PoisonedStoreSim.tsx` (`<= 230 lines`) & `web/src/app/page.tsx` (`<= 120 lines`)**: Integrate `StartupHeroAndStory` and `SideBySideAgentComparison` while keeping all 32 existing `data-testid`s and all 20 anti-slop rules satisfied.
5. **Create `web/src/__tests__/showcase-property.test.ts`**: Property-based test suite + component tests for R1, R2, R3, and R4.

---

## 5. Verification Method

To independently verify these findings and any subsequent implementation:

1. **Inspect Specification Report**:
   - View `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\analysis.md`
2. **Verify Zero Backend Changes**:
   - Run `git status --porcelain services/ sdk/ api/` in `d:\Hackathons\PayPal\Talos` (must produce empty output).
3. **Run Frontend Unit, Anti-Slop 20-Gate & Property Test Suites**:
   - Run `npm --prefix web test` (`vitest run` in `d:\Hackathons\PayPal\Talos\web`).
   - Run `npx --prefix web tsc --noEmit`.
   - Run `npm --prefix web run build`.
4. **Run Real Browser Verification (`agent-browser` / Playwright)**:
   - Run `npx --prefix web playwright test` or inspect `http://localhost:3000` via `agent-browser`.
