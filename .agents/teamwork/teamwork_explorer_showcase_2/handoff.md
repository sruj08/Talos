# Handoff Report — `teamwork_explorer_showcase_2`

**Summary**: Completed a full read-only investigation of `d:\Hackathons\PayPal\Talos\web\`. All existing components, hooks, context providers, styling rules, backend/WebSocket pipelines, and automated test gates have been mapped in `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\analysis.md`.

---

## 1. Observation

1. **Dependencies & UI Stack (`d:\Hackathons\PayPal\Talos\web\package.json:12-46`)**:
   - Next.js `^15.2.0`, React `^19.0.0`, TypeScript `^5.7.0`, Tailwind CSS `^3.4.19`, Vitest `^3.0.0`, Playwright `^1.50.0`.
   - Installed UI/animation packages: `lucide-react` (`^0.475.0`), `@heroui/react` (`^3.2.7`), `react-aria-components` (`^1.22.1`), `motion` (`^14.9.1`) + `framer-motion`, `@number-flow/react` (`^0.6.2`), `lenis` (`^1.3.27`), `ag-grid-enterprise` (`^33.1.0`), `ag-charts-enterprise`/`ag-charts-react` (`^11.1.0`), `@paypal/react-paypal-js` (`^8.7.0`), `@paypal/agent-toolkit` (`^0.1.0`), `@paypal/paypal-server-sdk` (`^1.1.0`).
   - There is no `components.json` or `src/components/ui/` directory currently in `web/`, and `fast-check` is not yet installed in `web/package.json`.

2. **Root Layout, Page Structure & Global State (`web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/src/context/TalosClearingContext.tsx`)**:
   - `web/src/app/layout.tsx:13-30` sets `html[data-theme="dark"][data-fx="high"]`, loads Google Fonts (`Fraunces`, `Figtree`, `DM Mono`, `Mukta`), and wraps `{children}` in `<TalosClearingProvider>`.
   - `web/src/context/TalosClearingContext.tsx:18-37` provides `connected`, `mode` (`'LIVE_WS' | 'SIMULATION_FALLBACK'`), `rows`, `kpiMetrics`, `activeChapter`, `demoViewMode` (`'COMMAND_CENTER' | 'STEP_GUIDE'`), `activeDemoStep` (`1 | 2 | 3 | 4`), `fxTier`, `theme`, `toggleTheme`, `updateRowState`, and `resetRows`.
   - `web/src/app/page.tsx:23-188` (`189` lines) renders `<SovereignTopTelemetryBar />` (which includes the Hero card, 4-KPI bar, and `<GuidedDemoBanner />`), an optional `step-by-step-wizard-card` when `demoViewMode === 'STEP_GUIDE'`, the 5 Command Center modules (`MandateStudio`, `PoisonedStoreSim`, `AgStudioBlotter`, `BryntumSlaBoard`, `PayPalStepUpModal`), and `<SovereignStoryChapterDock />`. Crucially, `page.tsx:130-182` uses CSS `.hidden` (`className={showMandate ? '' : 'hidden'}`) rather than conditional unmounting.

3. **Existing Simulator & Live Backend Pipeline (`web/src/components/PoisonedStoreSim.tsx`, `web/src/hooks/usePoisonedStoreSim.ts`, `web/src/lib/phase6-events.ts`)**:
   - `PoisonedStoreSim.tsx:42-227` (`229` lines) renders `data-testid="poisoned-store-sim"` with 3 scenario cards (`btn-scenario-act1`, `btn-scenario-act2`, `btn-scenario-act3`), `simulator-telemetry-card` (`scenario-active-banner` + `btn-jump-to-ledger`), and `scenario-dom-diff` (Raw Storefront DOM vs. Sanitized Agent DOM with `dom-diff-laser-scanline`).
   - `usePoisonedStoreSim.ts:69-228` (`229` lines) defines `SCENARIO_PRESETS` (`ACT_1`, `ACT_2`, `ACT_3`) and triggers both browser-wide `CustomEvent('talos:escrow-event')` via `broadcastTalosEscrowEvent` and live HTTP fetches:
     - `runAct1PoisonedAttack` (`usePoisonedStoreSim.ts:74-115`): broadcasts `BLOCKED_DOM_INJECTION` on `esc-901-trap` (`$480.00` gouge) and `POST`s to `/api/v1/checkout/evaluate` (`API-05`).
     - `runAct2HappyPathCapture` (`usePoisonedStoreSim.ts:117-173`): broadcasts `PAYPAL_CAPTURED` on `esc-902-sm7b` (`$249.00`, `9CAP-2A112233`) + Bryntum `task-sm7b-01` `100%` and `POST`s to `/api/mcp/paypal-bridge` (`API-16`, `PAYPAL_AGENT_TOOLKIT`).
     - `runAct3SlaBreachAndStepUp` (`usePoisonedStoreSim.ts:175-218`): broadcasts `PAYPAL_VOIDED` on `esc-903-scarlett` (`$219.00`) + Bryntum `task-scarlett-02` `56h` locked + `step_up_request` (`$450.00` Genelec 8030C) and calls `callEscrowVoidApi` (`PATCH /api/v1/sla/timeline/task-scarlett-02` + `POST /api/v1/escrow/esc-903-scarlett/void`).

4. **Strict Automated Gates in `web/src/__tests__/anti-slop-20-gate.test.ts` (`lines 1-256`)**:
   - Walks **all** `.tsx`, `.ts`, and `.css` files in `web/src/` (excluding `__tests__/` and `*.spec.*`/`*.test.*`) and enforces 20 gates:
     - **Gate 1 (`line 44`)**: Bans `\brounded-full\b` in all `.tsx` files; requires `w-1.5 h-1.5 rounded-xs`.
     - **Gate 2 (`line 52`)**: Bans `<em>`, `\bitalic\b`, `font-style: italic`.
     - **Gate 4 (`line 74`)**: Bans `\btracking-tighter\b` and `-0.0[4-9]em`.
     - **Gate 5 (`line 85`)**: Requires `0fr|1fr`, `@heroui/react`, and `/mandates`, `/simulator`, `/blotter`, `/sla` route files.
     - **Gate 6 (`line 96`)**: Bans `<hr>`, `\bdivide-y\b`, and `\bborder-b\b` in all `.tsx` files.
     - **Gate 7 (`line 104`)**: Bans arbitrary Tailwind slash-opacity modifiers (`bg-emerald-500/10`, etc.) and `\btext-slate-\d+\b` in all `.tsx` files.
     - **Gate 8 (`line 116`)**: Bans `border-slate-800` and `border-slate-700`.
     - **Gate 10 (`line 132`)**: Every `<p data-subhead="true">` must be `<= 12` words.
     - **Gate 11 (`line 143`)**: Bans `\(F-\d{2}\)` and `Sponsor Pool`.
     - **Gate 12 (`line 155`)**: Bans `<h1..h3>` text starting with `/^\d+\.\s+/`.
     - **Gate 15 (`line 183`)**: Bans box-drawing ASCII characters `[┌─┐│└┘├┤┬┴┼]`.
     - **Gate 16 (`line 191`)**: Bans `rounded-3xl` and `rounded-[32px]`.
     - **Gate 17 (`line 201`)**: Bans `font-mono` class directly on `<button>`, `<h1>`, `<h2>`, or `<h3>` tags.
     - **Gate 18 (`line 210`)**: Bans `\buppercase\b`, `\btracking-wider\b`, `\btracking-widest\b` in all `.tsx` files.
     - **Gate 19 (`line 217`)**: Bans `bg-gradient-to-*`, `bg-clip-text`, `linear-gradient(`, `radial-gradient(`.
     - **Gate 20 (`line 227`)**: Bans trailing period `.` in `<h1..h3>`, enforces **`<= 250` lines per source file** across `web/src/`, and verifies 33 required `data-testid` strings.

5. **SSR & Playwright Contract Tests (`web/src/__tests__/console-f01-f12.test.tsx:16-93` & `web/e2e/talos-3act-demo.spec.ts:73-293`)**:
   - `renderToStaticMarkup(<TALOSCommandCenterPage />)` is tested in `console-f01-f12.test.tsx`, `MandateStudio.spec.tsx:193-209`, and `GuidedDemoBanner.spec.tsx:34-50`, asserting that all 5 modules, KPI cards, and 33 `data-testid`s render in the default SSR output of `/`.
   - `talos-3act-demo.spec.ts` navigates to `/` and immediately interacts with `h1` (`/TALOS/i` in `Fraunces` font), `.sovereign-card` (`16px` radius), `input-mandate-budget`, `btn-sign-mandate`, `btn-scenario-act1..3`, `preset-fraud-injection`, `mode-step-guide-btn`, etc.

---

## 2. Logic Chain

1. **Why New Showcase Components Must Be Added as Separate Files (`<= 250` Lines)**:
   - Because `anti-slop-20-gate.test.ts:235-239` checks that every `.ts`, `.tsx`, and `.css` file in `web/src/` is `<= 250` lines—and existing files like `PoisonedStoreSim.tsx` (`229` lines), `usePoisonedStoreSim.ts` (`229` lines), `GuidedDemoBanner.tsx` (`242` lines), `SovereignHeaderAndDock.tsx` (`227` lines), and `AgStudioBlotter.tsx` (`246` lines) have only 4–23 lines of headroom—adding the Startup Landing Page, 5-Part Storytelling Walkthrough, and Side-by-Side Agent Comparison inline into existing files would immediately fail Gate 20.
   - Therefore, new UI and data definitions must be placed in dedicated modular files (`web/src/components/StartupProductHero.tsx`, `web/src/components/StoryWalkthroughFivePart.tsx`, `web/src/components/SideBySideAgentComparison.tsx`, `web/src/lib/storytelling-parts.ts`, `web/src/lib/agent-comparison-scenarios.ts`), each kept well under `250` lines.

2. **Why Default View Mode on `/` Must Keep All Modules Rendered in DOM**:
   - Because `console-f01-f12.test.tsx`, `MandateStudio.spec.tsx`, and `GuidedDemoBanner.spec.tsx` run `renderToStaticMarkup(<TALOSCommandCenterPage />)` with default state and assert all 33 `data-testid`s, and `talos-3act-demo.spec.ts` navigates to `/` and clicks `input-mandate-budget`, `btn-scenario-act1`, etc. without clicking an intermediate "Enter Dashboard" gate first, `page.tsx` must render the new Startup Landing Hero & 5-Part Storytelling Walkthrough **above** the interactive simulator and operator modules, with all sections visible in the default mode (`COMMAND_CENTER`) and filtered via CSS `.hidden` when the user selects a focused view mode (`LANDING_STORY`, `SIMULATOR_ARENA`, `OPERATOR_DASHBOARD`, `STEP_GUIDE`).

3. **How to Architect the Side-by-Side "Unprotected AI vs. TALOS-Protected AI" Simulator (`R2` & `R3`)**:
   - By creating `<SideBySideAgentComparison />` (`web/src/components/SideBySideAgentComparison.tsx`) and embedding it inside `PoisonedStoreSim.tsx` (while keeping `PoisonedStoreSim.tsx <= 250` lines), clicking Scenario A (`Act 1: Poisoned DOM + $480 Gouge`), Scenario B (`Act 2: $249 Verified Channel3 -> AUTHORIZE -> CAPTURE`), or Scenario C (`Act 3: 56h SLA Breach VOID + $450 Step-Up`)—or toggling interactive attack/price parameters—will simultaneously:
     1. Show the side-by-side internal decision pipeline and financial outcome of an **Unprotected AI Agent** (`.tone-crimson`: reads hidden `SYSTEM OVERRIDE`, ignores `$300` budget, executes irreversible `$480` capture, loses `$231` to scammer) vs. **TALOS-Protected AI Agent** (`.tone-emerald`: Rust `lol_html` strips override in `2.84ms`, Channel3 blocks `+9,277 bps` gouge, PayPal holds `$249` in reversible `AUTHORIZE` escrow until FedEx delivery or voids in `0s` on SLA breach).
     2. Trigger the live backend endpoints (`API-01`..`API-16`) and `broadcastTalosEscrowEvent` so `AgStudioBlotter`, `ForensicDetailPanel`, `BryntumSlaBoard`, `PayPalStepUpModal`, and `useEscrowStream` KPIs update in real time.

---

## 3. Caveats

- **`anti-slop-20-gate.test.ts` Applies to Any `shadcn` Files in `src/`**: If `shadcn` components are added under `web/src/components/ui/`, their classes must be adapted to the Unslop Graphite token system (no `rounded-full`, `border-b`, `divide-y`, `uppercase`, `tracking-wider`, `italic`, or `bg-*/opacity` slash classes).
- **`globals.css` Headroom**: `web/src/app/globals.css` is currently `234` lines (`16` lines below the `250`-line limit). Reuse existing `.sovereign-*`, `.tone-*`, `.btn-*`, and `.dot-*` utility classes rather than adding large CSS blocks to `globals.css`.

---

## 4. Conclusion

The `web/` frontend is cleanly structured and ready for the showcase expansion (`R1`–`R4`) by adding modular components (`<= 250` lines per file) integrated into `web/src/app/page.tsx` and `web/src/components/PoisonedStoreSim.tsx`:
1. **`web/src/components/StartupProductHero.tsx`** — Startup landing hero explaining what TALOS does, the problem of unprotected AI agent wallets, why it matters, how the 4-layer architecture works, key features/benefits, prominent CTA buttons (`Try Live Simulator`, `5-Part Story Walkthrough`, `Operator Command Center`), and a smooth view switcher.
2. **`web/src/components/StoryWalkthroughFivePart.tsx` + `web/src/lib/storytelling-parts.ts`** — Interactive 5-part plain-English visual storytelling walkthrough (`Part 01: Real-World Context`, `Part 02: User Problem`, `Part 03: Exploitation Mechanism`, `Part 04: TALOS Detection & Prevention`, `Part 05: Post-Intervention Outcome`) with live stage simulation triggers.
3. **`web/src/components/SideBySideAgentComparison.tsx` + `web/src/lib/agent-comparison-scenarios.ts`** — Side-by-side "Unprotected AI vs. TALOS-Protected AI" real-time manipulation simulator mounted inside `PoisonedStoreSim.tsx` and wired to `usePoisonedStoreSim.ts` and `phase6-events.ts`.
4. **`web/src/__tests__/showcase-properties.test.ts`** — Property-based and component integration test suite verifying mandate signature invariants, escrow state/KPI conservation, side-by-side unprotected vs. protected outcome invariants, and 5-part storytelling completeness.

Full details are documented in `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\analysis.md`.

---

## 5. Verification Method

Run the following commands in `d:\Hackathons\PayPal\Talos\web` to verify all unit, property, anti-slop, typecheck, build, and E2E gates:
```powershell
cd d:\Hackathons\PayPal\Talos\web
npx tsc --noEmit
npm test
npm run build
npx playwright test
```
And verify zero backend modifications from repository root:
```powershell
cd d:\Hackathons\PayPal\Talos
git status --short services/ sdk/ api/
```
