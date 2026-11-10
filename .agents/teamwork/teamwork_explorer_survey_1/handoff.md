# Handoff Report — `teamwork_explorer_survey_1` (Repository & `web` Console Architecture Survey)

> **Core Summary**: `g:\PAYPAL\web` is a Next.js 15.2 / React 19 / TypeScript console whose current landing page (`src/app/page.tsx`) overwhelms first-time visitors with **22+ competing navigation buttons/tabs** (`SovereignTopNavBar` + `StartupProductHero` + `SovereignStoryChapterDock`), leads with backend architecture jargon (*"Sovereign Clearinghouse"*, *"Cryptographic Agent Mandate"*, *"Red-Team Interception Arena"*), hides `SideBySideAgentComparison.tsx` behind `/simulator`, and scatters raw telemetry (`128-hex Ed25519`, `RFC 9421`, `9277 bps`, `lol_html + DeBERTa-v3 ONNX`) inline across modules. Furthermore, `src/__tests__/anti-slop-20-gate.test.ts` and `src/__tests__/console-f01-f12.test.tsx` enforce strict static source-code rules (including a **250-line file limit**, a legacy **no-digits (`/\d/`) regex on `/`**, and a **ban on CSS gradients in Gate 19**) that the implementation plan must explicitly account for.

---

## 1. Observation

### 1.1 Repository & Polyglot Architecture Maps
Direct inspection of `g:\PAYPAL\CLAUDE.md` (lines 1–40), `g:\PAYPAL\MAP.md` (lines 1–198), `g:\PAYPAL\.planning\graphs\GRAPH_REPORT.md` (lines 1–39), `g:\PAYPAL\.planning\graphs\CODEBASE_INDEX.md` (lines 1–75), `g:\PAYPAL\docs\08-project\PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md` (lines 1–150), `g:\PAYPAL\docs\00-overview\PROJECT_BRIEF.md` (lines 1–120), `g:\PAYPAL\docs\00-overview\PITCH.md` (lines 1–120), `g:\PAYPAL\docs\02-design\DESIGN_SYSTEM.md` (lines 1–112), and `g:\PAYPAL\docs\02-design\UI_SPEC.md` (lines 1–106) confirms:
- **Runtime Topology (`CLAUDE.md:10-16`, `MAP.md:110-152`)**:
  1. **`services/firewall-rs/` (Rust 1.85, `:8081`)**: Inline Zero-Trust Security Kernel (`axum` + `rmcp` MCP Server + `ed25519-dalek` KYA Mandate Signer/Verifier `API-01`/`API-02` + `lol_html` & `DeBERTa-v3` ONNX DOM Prompt-Injection Sanitizer `API-03` in `<4ms` + PayPal Webhook CRC32/RSA verifier `API-04`).
  2. **`sdk/paypal-go-apimatic/` (Go 1.24)**: Strongly-typed Golang SDK generated via APIMatic (`Orders v2`, `Payments Authorizations v2`, `Shipment Tracking v1`, `Customer Disputes v1`).
  3. **`services/orchestrator-go/` (Go 1.24, `:8080`)**: 2PC Escrow State Machine (`chi` + `errgroup` + `pgx/v5` + `go-redis/v9`) orchestrating Channel3 price medians (`API-06`), KERNEL browsers (`F-11`), PayPal Sandbox (`AUTHORIZE -> Tracking -> CAPTURE / VOID`, `API-05`..`API-14`), and WebSocket streaming (`GET /ws/events`, `API-15`).
  4. **`web/` (Next.js 15 / React 19 / TypeScript, `:3000`)**: Frontend console hosting `MandateStudio.tsx`, `PoisonedStoreSim.tsx`, `SideBySideAgentComparison.tsx`, `AgStudioBlotter.tsx`, `ForensicDetailPanel.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`, and the MCP bridge (`src/app/api/mcp/paypal-bridge/route.ts`, `API-16`).
- **Strict Modular & Offline Rules (`CLAUDE.md:36-39`)**:
  - Every source file in `web/src/` must remain **under 250 lines** (enforced by unit test `src/__tests__/anti-slop-20-gate.test.ts:233-237`).
  - Deterministic Sandbox Replay Fallback (`TALOS_SANDBOX_FALLBACK_ENABLED=true`) is built into every hook (`useMandateStudio.ts`, `usePoisonedStoreSim.ts`, `useAgStudioBlotter.ts`, `useBryntumTimeline.ts`, `usePayPalStepUp.ts`, `useForensicDetail.ts`) so the UI works 100% offline when Rust (`:8081`) or Go (`:8080`) services are not running.

---

### 1.2 `g:\PAYPAL\web` Project Structure, Dependencies, Styling & Routes

#### A. Installed Dependencies (`g:\PAYPAL\web\package.json:12-47`)
| Package | Version | Current Usage in `web/src/` |
| :--- | :--- | :--- |
| `next` | `^15.2.0` | App Router, API routes, rewrites to `:8081` and `:8080` (`next.config.mjs:20-35`) |
| `react` / `react-dom` | `^19.0.0` | Core UI & `renderToStaticMarkup` SSR tests |
| `@heroui/react` / `@heroui/styles` | `^3.2.7` | Installed in `package.json:13-14` (ready for HeroUI v3 components/drawers/modals) |
| `react-aria` / `react-aria-components` | `^3.53.1` / `^1.22.1` | Accessible primitives underlying HeroUI v3 |
| `motion` | `^14.9.1` | Imported as `framer-motion` in `src/app/command-center/page.tsx:4` (`<motion.div>`) |
| `lenis` | `^1.3.27` | Installed in `package.json:27` for smooth inertial scrolling (not yet wired in `layout.tsx`) |
| `@number-flow/react` | `^0.6.2` | Animated tabular counters in `SovereignHeaderAndDock.tsx:6` and `PayPalStepUpModal.tsx:4` |
| `lucide-react` | `^0.475.0` | Geometric vector icons across all components |
| `ag-grid-community` / `ag-grid-enterprise` / `ag-grid-react` | `^33.1.0` | Live Escrow Blotter (`AgStudioBlotter.tsx`, `src/lib/ag-grid-theme.ts`) |
| `ag-charts-community` / `ag-charts-react` | `^11.1.0` | Integrated cross-filter charts in `ag-grid-theme.ts:2,44` |
| `@paypal/react-paypal-js` | `^8.7.0` | `PayPalScriptProvider` + `PayPalButtons` (`PayPalStepUpModal.tsx:5,194-209`) |
| `@paypal/agent-toolkit` / `@paypal/paypal-server-sdk` | `^0.1.0` / `^1.1.0` | Used in `src/app/api/mcp/paypal-bridge/route.ts:3-12` |
| `tailwindcss` / `postcss` / `autoprefixer` | `^3.4.19` | Styling engine (`tailwind.config.ts`, `src/app/globals.css`) |
| `vitest` / `fast-check` / `@playwright/test` | `^3.0.0` / `^4.10.2` / `^1.50.0` | Unit, property-based, and E2E testing suites |

> **Dependency Note for R4 (3D Elements)**: `three`, `@types/three`, `@react-three/fiber`, and `@react-three/drei` are **not** currently installed in `web/package.json`. Currently, 3D visuals are served as static PNG plates in `web/public/assets/` (`talos-hero-visual.png`, `talos-escrow-visual.png`, `talos-clearing-artifact.png`) or CSS/SVG/Canvas/Motion 3D transforms.

#### B. Styling, Theme & Font Configuration (`globals.css` & `tailwind.config.ts`)
- **`g:\PAYPAL\web\src\app\layout.tsx:11-23`**: Sets `<html lang="en" data-theme="light" data-fx="high">` with a prepaint script that checks `prefers-reduced-motion: reduce` and `navigator.hardwareConcurrency <= 2` to toggle `data-fx="static" | "high"`. Wraps `{children}` in `<TalosClearingProvider>`.
- **`g:\PAYPAL\web\src\app\globals.css:1-182`**:
  - Defines CSS custom properties for `html[data-theme='light']` (default `#FFFFFF` canvas, `#FAF8F5` elevated surface, `#001435` ink, `#003087` primary, `#0070E0` accent, `#0A7A3D` emerald, `#FFB600` amber, `#D9360B` crimson) and `html[data-theme='dark']` (`#001435` canvas, `#001C64` surface, `#003087` elevated).
  - Typography variables (`globals.css:55-58`): `--font-sans: 'PayPal Pro', 'PayPal Open', 'Helvetica Neue', Arial, sans-serif;`, `--font-display`, `--font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;`.
  - Utility classes (`globals.css:123-180`): `.paypal-display`, `.paypal-hero`, `.paypal-headline-lg`, `.paypal-title-lg`, `.paypal-title-md`, `.paypal-title-sm`, `.paypal-body`, `.paypal-body-sm`, `.paypal-label`, `.paypal-caption`, `.paypal-pricing-display`, `.sovereign-canvas`, `.paypal-hero-band`, `.paypal-feature-card`, `.sovereign-card`, `.paypal-pricing-card`, `.paypal-checkout-module`, `.sovereign-subcard`, `.sovereign-well`, `.paypal-code-block`, `.tone-paypal`, `.tone-emerald`, `.tone-crimson`, `.tone-amber`, `.icon-medallion-paypal`, `.icon-medallion-emerald`, `.icon-medallion-crimson`, `.icon-medallion-amber`, `.btn-paypal-primary`, `.btn-paypal-secondary`, `.btn-checkout-yellow`, `.paypal-tab-pill`, `.paypal-tab-pill-active`, `.bento-drawer-transition`.

#### C. Complete Route Map (`g:\PAYPAL\web\src\app\`)
| Route URL | File Path | Root `data-testid` | Mounted Components |
| :--- | :--- | :--- | :--- |
| `/` | `web/src/app/page.tsx` | `talos-landing-page` | `SovereignTopNavBar`, `StartupProductHero`, `SovereignStoryChapterDock` |
| `/story` | `web/src/app/story/page.tsx` | `chapter-route-story` | `SovereignTopNavBar`, `StoryWalkthroughFivePart`, `SovereignStoryChapterDock` |
| `/mandates` | `web/src/app/mandates/page.tsx` | `chapter-route-mandates` | `SovereignTopNavBar`, `MandateStudio`, `SovereignStoryChapterDock` |
| `/simulator` | `web/src/app/simulator/page.tsx` | `chapter-route-simulator` | `SovereignTopNavBar`, `PoisonedStoreSim` (which embeds `SideBySideAgentComparison`), `SovereignStoryChapterDock` |
| `/blotter` | `web/src/app/blotter/page.tsx` | `chapter-route-blotter` | `SovereignTopNavBar`, `AgStudioBlotter` (which embeds `ForensicDetailPanel`), `SovereignStoryChapterDock` |
| `/sla` | `web/src/app/sla/page.tsx` | `chapter-route-sla` | `SovereignTopNavBar`, `BryntumSlaBoard`, `SovereignStoryChapterDock` |
| `/step-up` | `web/src/app/step-up/page.tsx` | `chapter-route-step-up` | `SovereignTopNavBar`, `PayPalStepUpModal`, `SovereignStoryChapterDock` |
| `/command-center` | `web/src/app/command-center/page.tsx` | `talos-command-center` | `SovereignTopNavBar`, `SovereignTopTelemetryBar` (includes `GuidedDemoBanner`), `MandateStudio`, `PoisonedStoreSim`, `AgStudioBlotter`, `BryntumSlaBoard`, `PayPalStepUpModal`, `SovereignStoryChapterDock` |
| `/api/mcp/paypal-bridge` | `web/src/app/api/mcp/paypal-bridge/route.ts` | N/A (API-16) | `GET` (APIMatic schemas) & `POST` (`AG_STUDIO_COPILOT` and `PAYPAL_AGENT_TOOLKIT` modes) |
| `/api/healthz` & `/healthz` | `web/src/app/api/healthz/route.ts`, `web/src/app/healthz/route.ts` | N/A | Next.js readiness probes |

---

### 1.3 Anatomy of the "21+ Buttons on Screen 1" & Jargon Locations

When a user or investor opens `/` (`web/src/app/page.tsx:11-26`), three components render: `<SovereignTopNavBar />`, `<StartupProductHero />`, and `<SovereignStoryChapterDock />`.

#### A. The 8 Top-Bar Tabs (`SovereignStoryDock.tsx:7-21` & `SovereignHeaderAndDock.tsx:34-50`)
Defined in `STORY_CHAPTERS` (`web/src/components/SovereignStoryDock.tsx:7-21`) and rendered both in the top navbar (`SovereignHeaderAndDock.tsx:35-49`) and repeated in the bottom footer dock (`SovereignStoryDock.tsx:35-49`):
1. `OVERVIEW` — `"Home"` (`href="/"`, `data-testid="nav-chapter-overview"`)
2. `STORYLINE` — `"Storyline"` (`href="/story"`, `data-testid="nav-chapter-storyline"`)
3. `CHAPTER_1_MANDATE` — `"Mandate Studio"` (`href="/mandates"`, `data-testid="nav-chapter-chapter_1_mandate"`)
4. `CHAPTER_2_ARENA` — `"Red-Team Arena"` (`href="/simulator"`, `data-testid="nav-chapter-chapter_2_arena"`)
5. `CHAPTER_3_BLOTTER` — `"Escrow Ledger"` (`href="/blotter"`, `data-testid="nav-chapter-chapter_3_blotter"`)
6. `CHAPTER_4_SLA` — `"SLA Forensics"` (`href="/sla"`, `data-testid="nav-chapter-chapter_4_sla"`)
7. `CHAPTER_5_STEP_UP` — `"Step-Up Co-Sign"` (`href="/step-up"`, `data-testid="nav-chapter-chapter_5_step_up"`)
8. `COMMAND_CENTER` — `"Command Center"` (`href="/command-center"`, `data-testid="nav-chapter-command_center"`)
*(Plus 3 more interactive elements in `SovereignTopNavBar`: the `"TALOS"` brand link at lines 23–32, the `"PayPal Sandbox"` link pill `data-testid="ws-connection-badge"` at lines 54–63, and the Theme Toggle button `data-testid="theme-toggle-btn"` at lines 65–78).*

#### B. The 13–14 Mode / Hero / Card Buttons in `StartupProductHero.tsx` (`web/src/components/StartupProductHero.tsx:16-226`)
1. **4 View-Switcher Mode Buttons** (`VIEW_SWITCHER_OPTIONS`, lines 16–21, rendered at lines 96–109 inside `data-testid="showcase-view-switcher"`):
   - Button 1: `"Complete Clearinghouse Suite"` (`id: 'ALL'`, `data-testid="view-mode-all"`, `href: '/command-center'`)
   - Button 2: `"Interactive Storyline"` (`id: 'LANDING_STORY'`, `data-testid="view-mode-landing-story"`, `href: '/story'`)
   - Button 3: `"Red-Team Simulator Arena"` (`id: 'SIMULATOR_ARENA'`, `data-testid="view-mode-simulator-arena"`, `href: '/simulator'`)
   - Button 4: `"Escrow Settlement Ledger"` (`id: 'OPERATOR_DASHBOARD'`, `data-testid="view-mode-operator-dashboard"`, `href: '/blotter'`)
2. **3 Hero Band CTA Buttons** (lines 122–154):
   - Button 5: `"Launch Interactive Simulator"` (`id="cta-try-simulator-btn"`, `data-testid="landing-try-demo-cta"`, `href: '/simulator'`)
   - Button 6: `"Explore Full Storyline"` (`data-testid="cta-story-walkthrough-btn"`, `href: '/story'`)
   - Button 7: `"Open Operator Command Center"` (`data-testid="cta-operator-dashboard-btn"`, `href: '/command-center'`)
3. **2 Problem / Solution Feature Card Buttons** (lines 157–191):
   - Button 8: `"Read the Threat Storyline"` (inside `data-testid="landing-problem-card"`, line 167, `href: '/story'`)
   - Button 9: `"Inspect Human Co-Sign Guardrails"` (inside `data-testid="landing-why-it-matters-card"`, line 185, `href: '/step-up'`)
4. **1 Storyline Header Button** (lines 199–202):
   - Button 10: `"Open Interactive Story Walkthrough"` (line 199, `href: '/story'`)
5. **4 Storyline Chapter Card Buttons** (`STORYLINE_CHAPTERS`, lines 23–64, rendered at lines 206–225):
   - Button 11: `"Open Mandate Studio"` (in card `data-testid="talos-pillar-1"`, title `"Cryptographic Agent Mandate"`, `href: '/mandates'`)
   - Button 12: `"Open Red-Team Arena"` (in card `data-testid="talos-pillar-2"`, title `"Webpage X-Ray Sanitization"`, `href: '/simulator'`)
   - Button 13: `"Open Escrow Ledger"` (in card `data-testid="talos-pillar-3"`, title `"Market Fair-Price Oracle"`, `href: '/blotter'`)
   - Button 14: `"Open SLA Forensics"` (in card `data-testid="talos-pillar-4"`, title `"Reversible PayPal Escrow Hold"`, `href: '/sla'`)

#### C. Exact Locations of Engineer Jargon & Raw Telemetry (Targeted by R1.2 & R1.4)
| Raw Jargon / Telemetry String | Exact File & Line Numbers |
| :--- | :--- |
| `"Sovereign Clearinghouse for Autonomous AI Commerce"` | `web/src/lib/storytelling-parts.ts:46` (rendered in `StartupProductHero.tsx:93`) |
| `"Cryptographic Agent Mandate"`, `"Webpage X-Ray Sanitization"`, `"Market Fair-Price Oracle"`, `"Open SLA Forensics"` | `web/src/components/StartupProductHero.tsx:27,37,47,59` |
| `"The Solution: Sovereign Escrow Clearing"`, `"Inspect Human Co-Sign Guardrails"` | `web/src/components/StartupProductHero.tsx:178,186` |
| `"Mandate Studio"`, `"Red-Team Arena"`, `"Escrow Ledger"`, `"SLA Forensics"`, `"Step-Up Co-Sign"` | `web/src/components/SovereignStoryDock.tsx:15-19` |
| `"Mandate Clearing Studio"`, `"Issue Ed25519 cryptographic spending limits, Channel3 spread caps, and delivery SLAs"` | `web/src/components/MandateStudio.tsx:63,66` |
| `128-hex Ed25519 signatures`, `Ed25519 public key`, `RFC 9421 input` (`sig1=("@method"...);alg="ed25519"`) | `web/src/components/MandateStudio.tsx:190-235` (`data-testid="mandate-crypto-proof"`, expanded by default `sealExpanded = true` in `useMandateStudio.ts:130`) and `ForensicDetailPanel.tsx:76-87` (`data-testid="forensic-ed25519-sig"`) |
| `"Red-Team Interception Arena"`, `"DeBERTa-v3 ONNX <4ms"`, `"Raw Storefront DOM (Before lol_html)"`, `"Sanitized Agent DOM (After lol_html)"` | `web/src/components/PoisonedStoreSim.tsx:41,50,221,230` |
| `9277 bps` / `spreadBps` / `lol_html + DeBERTa` / `Ed25519 KYA Mandate` | `web/src/components/SideBySideAgentComparison.tsx:109,188,191,204,208-224`, `web/src/lib/agent-comparison-scenarios.ts:166-218`, `web/src/hooks/usePoisonedStoreSim.ts:30,36`, `web/src/components/ForensicDetailPanel.tsx:61,104` |

---

### 1.4 Complete Component, Hook & State Contract Inventory (`g:\PAYPAL\web\src\`)

| File Path | Lines | Exported Component / Hook & Prop Signature | State & Event Contracts |
| :--- | :---: | :--- | :--- |
| `src/context/TalosClearingContext.tsx` | 146 | `TalosClearingProvider({ children })`, `useTalosClearing(): TalosClearingContextValue` | Holds `connected`, `mode`, `rows`, `kpiMetrics`, `activeChapter`, `demoViewMode`, `activeDemoStep`, `fxTier`, `theme`, `toggleTheme`, `updateRowState`, `resetRows`. Syncs `activeChapter` with `usePathname()`. |
| `src/components/SovereignHeaderAndDock.tsx` | 236 | `SovereignTopNavBar()`, `SovereignTopTelemetryBar()` | Reads `useTalosClearing()`. Renders sticky top bar (`data-testid="sovereign-top-navbar"`) and 4-KPI telemetry header (`data-testid="kpi-header-bar"`) + `<GuidedDemoBanner />`. |
| `src/components/SovereignStoryDock.tsx` | 54 | `STORY_CHAPTERS`, `SovereignStoryChapterDock()` | Renders footer dock (`data-testid="story-chapter-dock"`) with `dock-chapter-*` links. |
| `src/components/StartupProductHero.tsx` | 230 | `StartupProductHero({ showcaseView, onSelectShowcaseView, onTryInteractiveDemo }: StartupProductHeroProps)` | Renders `data-testid="startup-landing-hero"`. Uses `navigateToRoute(href)` from `src/lib/navigation.ts`. |
| `src/components/StoryWalkthroughFivePart.tsx` | 244 | `StoryWalkthroughFivePart({ onSimulateStage }: StoryWalkthroughFivePartProps)` | Renders 5-stage stepper (`data-testid="storytelling-walkthrough-5part"`) driven by `FIVE_PART_STORY_STAGES` (`src/lib/storytelling-parts.ts`). |
| `src/components/GuidedDemoBanner.tsx` | 248 | `GuidedDemoBanner()` | Renders orientation strip + 4-step walkthrough bar (`data-testid="guided-demo-banner"`) driven by `GUIDED_DEMO_STEPS` (`src/lib/guided-demo-steps.ts`). |
| `src/components/MandateStudio.tsx` | 241 | `MandateStudio({ initialValues, onMandateSigned }: MandateStudioProps)` | Uses `useMandateStudio` (`src/hooks/useMandateStudio.ts`). Renders form (`data-testid="kya-mandate-form"`) and expandable seal (`data-testid="mandate-crypto-proof"`). Re-exported by `src/components/mandate/KyaMandateForm.tsx`. |
| `src/components/PoisonedStoreSim.tsx` | 241 | `PoisonedStoreSim()` | Uses `usePoisonedStoreSim` (`src/hooks/usePoisonedStoreSim.ts`). Renders 3 scenario buttons (`btn-scenario-act1..3`), embeds `<SideBySideAgentComparison />`, and renders telemetry + DOM diff (`data-testid="scenario-dom-diff"`). Re-exported by `src/components/JudgeScenarioToolbar.tsx`. |
| `src/components/SideBySideAgentComparison.tsx` | 230 | `SideBySideAgentComparison({ activeAct, running, onRunAct1, onRunAct2, onRunAct3 }: SideBySideAgentComparisonProps)` | Uses `evaluateAgentComparisonScenario(params)` from `src/lib/agent-comparison-scenarios.ts`. Renders manipulation toggles (`toggle-prompt-injection`, `toggle-price-gouge`, `toggle-sla-breach`), `unprotected-agent-outcome` vs `talos-protected-agent-outcome`, and 5-step `ai-internal-pipeline`. |
| `src/components/AgStudioBlotter.tsx` | 236 | `AgStudioBlotter({ initialRows }: AgStudioBlotterProps)` | Uses `useAgStudioBlotter` (`src/hooks/useAgStudioBlotter.ts`) & `ag-grid-theme.ts`. Renders AG Studio Copilot bar, 4 preset pills, status tabs, `AgGridReact` canvas, row selector buttons, and `<ForensicDetailPanel />`. Re-exported by `src/components/blotter/AgStudioBlotter.tsx`. |
| `src/components/ForensicDetailPanel.tsx` | 240 | `ForensicDetailPanel({ data, onActionCompleted }: ForensicDetailPanelProps)` | Uses `useForensicDetail` (`src/hooks/useForensicDetail.ts`). Renders 3 columns: `forensic-card-dom-diff`, `forensic-card-channel3`, `forensic-card-paypal-actions` (Capture, Void, Dispute buttons). |
| `src/components/BryntumSlaBoard.tsx` | 231 | `BryntumSlaBoard(props: BryntumSlaBoardProps)` | Uses `useBryntumTimeline` (`src/hooks/useBryntumTimeline.ts`). Renders 2-way 48h SLA task lanes (`bryntum-lane-esc-902-sm7b`, `bryntum-lane-esc-903-scarlett`) with range sliders (`sla-drag-bar-*`), Deliver/Void/Reroute buttons, and AG Grid sync pill. Re-exported by `src/components/BryntumSlaTimeline.tsx`. |
| `src/components/PayPalStepUpModal.tsx` | 218 | `PayPalStepUpModal(props: PayPalStepUpModalProps)` | Uses `usePayPalStepUp` (`src/hooks/usePayPalStepUp.ts`). Renders human co-sign card (`copilot-hitl-card`), Co-Sign / Reject buttons (`btn-step-up-cosign`, `btn-step-up-reject`), and official `<PayPalScriptProvider>` + `<PayPalButtons>` (`paypal-js-sdk-v6-container`). Re-exported by `src/components/CopilotActionWiring.tsx`. |
| `src/lib/phase6-events.ts` | 231 | `broadcastTalosEscrowEvent`, `callEscrowVoidApi`, `formatUsdInr`, `INITIAL_SLA_TASKS`, `DEFAULT_STEP_UP_REQUEST` | Cross-component `window.dispatchEvent(new CustomEvent('talos:escrow-event', { detail }))` bus synchronizing `PoisonedStoreSim`, `AgStudioBlotter`, `BryntumSlaBoard`, `PayPalStepUpModal`, and `useEscrowStream`. |

---

## 2. Logic Chain

1. **Why Screen 1 Fails the Investor 5-Second Test (Observation 1.3 -> R1.1 & R1.2)**:
   - On `/` (`src/app/page.tsx`), `SovereignTopNavBar` renders 8 route tabs, `StartupProductHero` renders 4 view-mode pills + 3 hero CTAs + 2 problem/solution buttons + 1 section button + 4 chapter buttons (14 buttons), and `SovereignStoryChapterDock` repeats the 8 route tabs in the footer.
   - Instead of a guided linear investor pitch (*Problem -> Live Demo -> How Much Money It Saves -> How PayPal Makes Money*), Screen 1 scatters users across 8 separate routes (`/story`, `/mandates`, `/simulator`, `/blotter`, `/sla`, `/step-up`, `/command-center`) and leads with dense architecture terminology (*"Sovereign Clearinghouse"*, *"Cryptographic Agent Mandate"*, *"Red-Team Interception Arena"*).
2. **Why the "Aha!" Moment Is Hidden (Observation 1.2C & 1.4 -> R1.3)**:
   - `SideBySideAgentComparison.tsx` (which directly contrasts Normal AI losing `$480` vs. TALOS blocking the trick in `2.84ms` and buying for `$249`, saving `$231`) is only mounted inside `PoisonedStoreSim.tsx` on `/simulator` and `/command-center`. A visitor on `/` never sees it unless they click through to `/simulator`.
3. **Why Raw Technical Guts Overwhelm the Storyline (Observation 1.3C -> R1.4)**:
   - `MandateStudio.tsx` defaults `sealExpanded` to `true` (`useMandateStudio.ts:130`), immediately showing `128-hex Ed25519` keys and `RFC 9421` signature headers. `PoisonedStoreSim.tsx`, `SideBySideAgentComparison.tsx`, and `ForensicDetailPanel.tsx` display `9277 bps` and `lol_html + DeBERTa-v3 ONNX` inline at second 0. Encapsulating these inside an on-demand *"View Technical Proof"* drawer satisfies R1.4 while keeping the cryptographic proof 1-click accessible for technical judges.
4. **How Existing Test Suites Constrain the Refactoring (Observation 1.1 & Test Files -> R1–R4)**:
   - `src/__tests__/anti-slop-20-gate.test.ts` scans **all** `.tsx`, `.ts`, and `.css` files in `web/src/`.
   - **Constraint A (250-Line Limit)**: Gate 20 (`anti-slop-20-gate.test.ts:233-237`) fails if any file in `web/src/` exceeds **250 lines**. New storyline scenes (`Scene 1: Set the Rules`, `Scene 2: Watch the AI Shop`, `Scene 3: The CFO Dashboard`, `TechnicalProofDrawer`, 3D/animation wrappers) must be decomposed into modular files `< 250` lines each.
   - **Constraint B (Landing Page Digit Ban in Legacy Tests)**: `src/__tests__/console-f01-f12.test.tsx:117-118`, `src/__tests__/showcase-rendering.test.ts:181-182`, and `e2e/talos-3act-demo.spec.ts:226-227` currently assert `expect(landingVisibleText).not.toMatch(/\d/)` and `expect(landingHtml).not.toContain('data-testid="ag-studio-blotter"')`. Because R2 explicitly requires `"Watch Live 60-Second Simulation ->"`, `"Step 1: Give Your AI a Spending Allowance ($300 Max)"`, `"$480"`, `"$249"`, `"$231"`, `"$450"`, and Scene 3 (`AgStudioBlotter.tsx` + `BryntumSlaBoard.tsx`) on the landing storyline flow, those legacy test assertions in `console-f01-f12.test.tsx`, `showcase-rendering.test.ts`, and `talos-3act-demo.spec.ts` **must be updated** to match the R1/R2 specification.
   - **Constraint C (CSS Gradients & Backdrop Blur in `anti-slop-20-gate.test.ts`)**: Gate 14 (`lines 174-180`) bans `backdrop-filter: blur` and Gate 19 (`lines 216-224`) bans `bg-gradient-to-*`, `bg-clip-text`, and `linear-gradient(` / `radial-gradient(`. Since R3 explicitly asks for a colour psychology palette and gradients inspired by `https://www.fragment.im/`, Gate 14 / Gate 19 in `anti-slop-20-gate.test.ts` must either be updated to permit intentional design-system gradient tokens or gradients must be applied via approved CSS variables/canvas shaders that align with the updated test gate.
   - **Constraint D (Preserved Sub-Routes & `data-testid`s)**: Gate 5 (`anti-slop-20-gate.test.ts:85-96`) requires the sub-route files (`/story`, `/mandates`, `/simulator`, `/blotter`, `/sla`, `/step-up`, `/command-center`) to exist on disk and bans `scrollIntoView`. Gate 11 (`lines 150-153`) requires the strings `'Mandate Clearing Studio'`, `'Red-Team Interception Arena'`, `'Escrow Settlement Ledger'`, and `'Delivery SLA Timeline'` to exist somewhere across `.tsx` files, and Gate 20 (`lines 239-251`) + `console-f01-f12.test.tsx:22-66` require all 32 canonical `data-testid` attributes to render on `TALOSCommandCenterPage`.

---

## 3. Caveats

- **Backend Services Runtime State**: During this read-only survey, we did not mutate or start new daemon servers. As verified in `useMandateStudio.ts`, `usePoisonedStoreSim.ts`, `useEscrowStream.ts`, `useBryntumTimeline.ts`, and `usePayPalStepUp.ts`, every frontend action has a built-in deterministic fallback when `:8080` / `:8081` are offline.
- **No `three` / `@react-three/fiber` Currently Installed**: If R4's 3D visual elements use WebGL/Three.js, packages would need to be added to `web/package.json`; alternatively, hardware-accelerated CSS 3D perspective transforms, interactive HTML5 Canvas/WebGL shaders, `motion` (`^14.9.1`), `lenis` (`^1.3.27`), and `/ai-video-studio` + generated visual plates can run with zero new npm dependencies.

---

## 4. Conclusion & Feature Inventory Contribution (Requirements R1–R4)

To fulfill Requirements R1, R2, R3, and R4 of `ORIGINAL_REQUEST.md` while keeping all Vitest and TypeScript gates green, the implementation plan should target the following feature and file inventory:

| Req ID | Feature / Storyline Requirement | Target Files to Create or Refactor (`<= 250` lines each) | Key Contracts & Test Guardrails to Preserve |
| :--- | :--- | :--- | :--- |
| **R1.1** | **Eliminate Decision Overload (21+ Buttons on Screen 1)** | - Refactor `web/src/app/page.tsx`<br>- Refactor `web/src/components/StartupProductHero.tsx`<br>- Refactor `web/src/components/SovereignHeaderAndDock.tsx` & `SovereignStoryDock.tsx` | Replace the 8 competing top-bar tabs + 14 hero/mode/chapter buttons on `/` with a clean, guided single-entry storyline header and primary CTA (`"Watch Live 60-Second Simulation ->"`), while keeping `/command-center` and sub-routes accessible for deep-link tests (`anti-slop-20-gate.test.ts` Gate 5). |
| **R1.2** | **Business Language Instead of Engineer Jargon** | - Refactor `web/src/lib/storytelling-parts.ts`<br>- Refactor `web/src/components/StartupProductHero.tsx`<br>- Refactor `web/src/components/MandateStudio.tsx`<br>- Refactor `web/src/components/PoisonedStoreSim.tsx` | Frame the landing flow around *Problem -> Live Demo -> How Much Money It Saves -> How PayPal Makes Money*. Keep the 4 institutional titles (`Mandate Clearing Studio`, `Red-Team Interception Arena`, `Escrow Settlement Ledger`, `Delivery SLA Timeline`) inside the Technical Proof drawer or `/command-center` so `anti-slop-20-gate.test.ts` Gate 11 passes. |
| **R1.3** | **Surface the "Aha!" Moment Directly in Main Flow** | - Refactor `web/src/components/SideBySideAgentComparison.tsx`<br>- Mount directly inside Scene 2 of `web/src/app/page.tsx` (or a new `<InvestorStorylineFlow />` component) | Left side: Normal AI gets tricked and loses `$480`; Right side: TALOS blocks the trick and buys it for `$249` (saving `$231`). Preserve `data-testid="side-by-side-agent-comparison"`, `unprotected-agent-outcome`, `talos-protected-agent-outcome`, `ai-internal-pipeline`. |
| **R1.4** | **Move Raw Technical Guts Behind On-Demand Proof** | - Create `web/src/components/TechnicalProofDrawer.tsx` (or collapsible drawer component)<br>- Update `MandateStudio.tsx`, `PoisonedStoreSim.tsx`, `ForensicDetailPanel.tsx` | Encapsulate `128-hex Ed25519 signatures`, `RFC 9421 headers`, `9277 bps`, and `lol_html + DeBERTa-v3 ONNX` inside a *"View Technical Proof"* drawer (`sealExpanded` defaulting to `false` on the consumer view, expandable on click) while preserving `mandate-signature-hash`, `mandate-rfc9421-header`, `forensic-ed25519-sig` in the DOM for SSR tests. |
| **R2.1** | **Stage 1: Above the Fold — The 5-Second Hook** | - `web/src/components/StartupProductHero.tsx` | Headline: *"Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed."*<br>Single primary CTA: **"Watch Live 60-Second Simulation ->"** (`data-testid="landing-try-demo-cta"`). |
| **R2.2** | **Stage 2: Interactive Scene 1 — "Set the Rules" (Plain English)** | - `web/src/components/MandateStudio.tsx` (or plain-English wrapper scene) | Present *"Step 1: Give Your AI a Spending Allowance ($300 Max)"* with plain-English controls (`$300` max budget, fair-price guard, `48h` delivery rule) and *"View Technical Proof"* toggle for the `Ed25519` seal. |
| **R2.3** | **Stage 3: Interactive Scene 2 — "Watch the AI Shop (3 Real-World Scenarios)"** | - `web/src/components/PoisonedStoreSim.tsx`<br>- `web/src/components/SideBySideAgentComparison.tsx`<br>- `web/src/components/PayPalStepUpModal.tsx` | - **Scenario 1: The Scam Store ($480 Trap)** — Normal AI loses `$480` vs. TALOS blocks hidden trick & saves `$231` (buys for `$249`).<br>- **Scenario 2: The Honest Store ($249 Verified)** — PayPal holds `$249` safely until FedEx delivers, then pays seller.<br>- **Scenario 3: The Late Delivery & Big Order ($450)** — PayPal auto-refunds late shipment in `0 seconds` + pauses `$450` item so human clicks **Approve with PayPal** (`PayPalStepUpModal.tsx`). |
| **R2.4** | **Stage 4: Interactive Scene 3 — "The CFO Dashboard (Where the Money Lives)"** | - `web/src/components/AgStudioBlotter.tsx`<br>- `web/src/components/BryntumSlaBoard.tsx`<br>- `web/src/components/ForensicDetailPanel.tsx` | Present the Live Transaction Table (`AgStudioBlotter.tsx`) and Delivery Timeline (`BryntumSlaBoard.tsx`) directly in the storyline as the live consequence of the user's scenario clicks, with the *"View Technical Proof"* drawer accessible. |
| **R3** | **UI/UX Engineering, Colour Psychology & Design System (`fragment.im` inspiration)** | - `web/src/app/globals.css`<br>- `web/tailwind.config.ts`<br>- `web/src/__tests__/anti-slop-20-gate.test.ts` | Define documented colour psychology palette, gradient tokens, typography scale, generous spacing, and iconography (`/apple-design`, `/heroui-react`, `/ui-ux-pro-max`, `/unslop`, `/hallmark`). Update `anti-slop-20-gate.test.ts` (specifically Gate 19 gradient ban & `console-f01-f12.test.tsx` / `showcase-rendering.test.ts` digit regex on `/`) to align with the new design tokens. |
| **R4** | **Animations, 3D Elements & Visual Media Pipeline** | - `web/src/components/` (3D tilt/perspective cards, `motion` `^14.9.1` choreographed stage transitions, `lenis` smooth scroll)<br>- `web/public/assets/` (visual/video assets via `/ai-video-studio`) | Choreograph fluid `fragment.im`-inspired scroll/stage motion (`data-fx="high" | "static"` aware for `prefers-reduced-motion`), interactive 3D card/vault depth, and generated visual media plates. |

---

## 5. Verification Method

To independently verify all observations and test contracts documented in this report:
1. **Verify TypeScript Compilation & Existing Unit/Property Tests (`web`)**:
   ```powershell
   cd g:\PAYPAL\web
   npx tsc --noEmit
   npm test
   ```
2. **Inspect the Target First-Screen & Storyline Files**:
   - `g:\PAYPAL\web\src\app\page.tsx` (lines 1–27)
   - `g:\PAYPAL\web\src\components\StartupProductHero.tsx` (lines 1–230)
   - `g:\PAYPAL\web\src\components\SovereignHeaderAndDock.tsx` (lines 1–236)
   - `g:\PAYPAL\web\src\components\SovereignStoryDock.tsx` (lines 1–54)
   - `g:\PAYPAL\web\src\components\SideBySideAgentComparison.tsx` (lines 1–230)
   - `g:\PAYPAL\web\src\components\MandateStudio.tsx` (lines 1–241)
   - `g:\PAYPAL\web\src\components\PoisonedStoreSim.tsx` (lines 1–241)
   - `g:\PAYPAL\web\src\components\AgStudioBlotter.tsx` (lines 1–236)
   - `g:\PAYPAL\web\src\components\ForensicDetailPanel.tsx` (lines 1–240)
   - `g:\PAYPAL\web\src\components\BryntumSlaBoard.tsx` (lines 1–231)
   - `g:\PAYPAL\web\src\components\PayPalStepUpModal.tsx` (lines 1–218)
3. **Inspect the Static Quality & Contract Gates**:
   - `g:\PAYPAL\web\src\__tests__\anti-slop-20-gate.test.ts` (lines 43–253)
   - `g:\PAYPAL\web\src\__tests__\console-f01-f12.test.tsx` (lines 18–128)
   - `g:\PAYPAL\web\src\__tests__\showcase-rendering.test.ts` (lines 123–191)
   - `g:\PAYPAL\web\e2e\talos-3act-demo.spec.ts` (lines 210–252)
- **Invalidation Condition**: This handoff is invalidated if dependencies in `web/package.json` or component files under `web/src/` are modified prior to Phase 1 planning.
