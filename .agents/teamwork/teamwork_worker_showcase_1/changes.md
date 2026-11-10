# Changes Summary — `teamwork_worker_showcase_1`

## 1. New Files Created (Inside `d:\Hackathons\PayPal\Talos\web\`)
1. `web/src/lib/storytelling-parts.ts` (`170` lines)
   - Defines `ShowcaseViewMode` (`'ALL' | 'LANDING_STORY' | 'SIMULATOR_ARENA' | 'OPERATOR_DASHBOARD'`), `STARTUP_PRODUCT_POSITIONING` (headline, subhead `<= 12` words, problem statement, why it matters, and 3 key financial benefits), `TALOS_FOUR_PILLARS` (`talos-pillar-1..4`), and `FIVE_PART_STORY_STAGES` (`story-stage-1..5` answering all 5 real-world storytelling questions in plain, non-technical language).
2. `web/src/lib/agent-comparison-scenarios.ts` (`221` lines)
   - Defines pure, deterministic functions and presets for the Side-by-Side Unprotected AI vs. TALOS-Protected AI Simulator: `COMPARISON_ACT_PRESETS`, `computePriceSpreadBps`, `sanitizeStorefrontDom`, `evaluateEscrowLifecycleTransition`, and `evaluateAgentComparisonScenario` (including the 5-step real-time internal AI decision pipeline `pipelineSteps`).
3. `web/src/components/StartupProductHero.tsx` (`220` lines)
   - Implements Requirement R1: Startup product landing page (`data-testid="startup-landing-hero"`), prominent CTA buttons (`data-testid="landing-try-demo-cta"`, `data-testid="cta-try-simulator-btn"`, `data-testid="cta-story-walkthrough-btn"`, `data-testid="cta-operator-dashboard-btn"`), smooth view switcher (`data-testid="showcase-view-switcher"`), problem & why-it-matters cards, and the 4 architectural pillars (`data-testid="talos-pillar-1..4"`).
4. `web/src/components/StoryWalkthroughFivePart.tsx` (`192` lines)
   - Implements Requirement R1: 5-part real-world storytelling walkthrough (`data-testid="storytelling-walkthrough-5part"`, `data-testid="story-stage-1..5"`, `data-testid="story-active-stage-detail"`, `data-testid="story-stage-simulate-btn"`) explaining in plain language what is happening, what problem the user faces, how attackers exploit it, how TALOS detects/prevents it, and what happens after TALOS intervenes.
5. `web/src/components/SideBySideAgentComparison.tsx` (`223` lines)
   - Implements Requirements R2 & R3: Side-by-side comparison of an Unprotected AI Shopping Agent (`data-testid="unprotected-agent-outcome"`) vs. a TALOS-Protected AI Shopping Agent (`data-testid="talos-protected-agent-outcome"`), interactive manipulation controls (`data-testid="toggle-prompt-injection"`, `data-testid="toggle-price-gouge"`, `data-testid="toggle-sla-breach"`, `data-testid="btn-run-side-by-side-live"`), and the 5-step real-time internal AI processing pipeline (`data-testid="ai-internal-pipeline"`, `data-testid="pipeline-step-1..5"`).
6. `web/src/__tests__/showcase-properties.test.ts` (`394` lines)
   - Implements Requirement R4: 10 Vitest test cases including 7 `fast-check` property-based tests (`numRuns: 100`) and 3 SSR/component integration suites verifying Ed25519 KYA Mandate determinism, DOM Firewall prompt-injection stripping, Channel3 basis-point spread & zero-fraud-loss invariants, Escrow state machine terminal finality & KPI conservation, and 5-Part Storytelling + Startup Hero completeness.

## 2. Modified Files (Inside `d:\Hackathons\PayPal\Talos\web\`)
1. `web/package.json` & `web/package-lock.json`
   - Added `fast-check` (`^4.6.0`) to `devDependencies`.
2. `web/src/components/PoisonedStoreSim.tsx` (`227` lines)
   - Embedded `<SideBySideAgentComparison />` inside the Red-Team Interception Arena, wired directly to `runAct1`, `runAct2`, and `runAct3` so live manipulation runs trigger the real backend endpoints (`POST /api/v1/escrow/checkout`, `POST /api/v1/webhooks/tracking`, `POST /api/v1/escrow/{id}/void`) and `broadcastTalosEscrowEvent`. Preserved all existing `data-testid`s and text substrings.
3. `web/src/app/page.tsx` (`223` lines)
   - Mounted `<StartupProductHero />` and `<StoryWalkthroughFivePart />` at the top of `<main>` with `showcaseView` state defaulting to `'ALL'` (`data-showcase-view={showcaseView}`) and CSS `.hidden` view filtering so all 39 existing `data-testid`s remain in the DOM for SSR and E2E tests.
4. `web/e2e/talos-3act-demo.spec.ts` (`370` lines)
   - Added `Act 6: Startup Product Landing Page, 5-Part Real-World Storytelling Walkthrough & Side-by-Side Unprotected vs. TALOS-Protected Simulator` verifying all new showcase components, view switcher modes, 5 story stages, interactive manipulation toggles, and live pipeline execution.
5. `web/next.config.mjs` (`39 lines`)
   - Normalized `localhost` to `127.0.0.1` in `firewallBaseUrl` (`http://127.0.0.1:8081`) and `orchestratorBaseUrl` (`http://127.0.0.1:8082`) so Next.js rewrites connect via IPv4 on Windows without IPv6 `ECONNREFUSED` errors.

## 3. Backend Immutability Verification
- `git status --porcelain services/ sdk/ api/ postman/ tests/` -> Empty (`0` files modified).
- `git diff --stat services/ sdk/ api/ postman/ tests/` -> Empty (`0` files modified).
