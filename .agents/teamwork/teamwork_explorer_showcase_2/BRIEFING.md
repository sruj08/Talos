# BRIEFING — 2026-11-09T14:52:30Z

## Mission
Perform a read-only code investigation of `d:\Hackathons\PayPal\Talos\web\` to map all existing frontend components, pages, hooks, styling, and state flows, and design the architecture for the startup landing page, 5-part storytelling walkthrough, smooth view switcher, and side-by-side manipulation simulator.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: investigator, synthesizer
- Working directory: d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2
- Original parent: 49f6a062-fba5-4229-aa89-1d33d2111cce
- Milestone: Showcase Exploration

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify any files outside `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2`
- Strictly zero backend modifications allowed in the project (`firewall-rs`, `orchestrator-go`)
- Keep source files modular (<250 lines convention per `CLAUDE.md`)
- Preserve all existing component tests and E2E behaviors

## Current Parent
- Conversation ID: 49f6a062-fba5-4229-aa89-1d33d2111cce
- Updated: 2026-11-09T14:52:30Z

## Investigation State
- **Explored paths**: `ORIGINAL_REQUEST.md`, `CLAUDE.md`, `MAP.md`, `web/package.json`, `web/tailwind.config.ts`, `web/next.config.mjs`, `web/vitest.config.ts`, `web/playwright.config.ts`, `web/src/app/**`, `web/src/components/**`, `web/src/hooks/**`, `web/src/lib/**`, `web/src/context/**`, `web/src/__tests__/**`, `web/e2e/talos-3act-demo.spec.ts`
- **Key findings**:
  - `web/src/__tests__/anti-slop-20-gate.test.ts` enforces 20 strict static-analysis rules across every non-test `.tsx`, `.ts`, and `.css` file in `web/src/`, including `<= 250` lines per file, no `rounded-full`, no `uppercase`, no `border-b`/`divide-y`/`<hr>`, no `italic`, no gradients, no slash-opacity classes, and mandatory preservation of 33 Part 5 `data-testid` strings.
  - `web/src/__tests__/console-f01-f12.test.tsx`, `MandateStudio.spec.tsx`, and `GuidedDemoBanner.spec.tsx` render `<TALOSCommandCenterPage />` via `renderToStaticMarkup` and assert all 5 modules exist in SSR HTML; `web/e2e/talos-3act-demo.spec.ts` opens `/` and interacts directly with all 5 modules.
  - Several existing files in `web/src/` are at 227–246 lines, so new features must be decomposed into new modular files (`<= 250` lines each).
- **Unexplored areas**: None — 100% of `web/` has been inspected.

## Key Decisions Made
- Recommended adding modular showcase components (`StartupProductHero.tsx`, `StoryWalkthroughFivePart.tsx`, `SideBySideAgentComparison.tsx`, `storytelling-parts.ts`, `agent-comparison-scenarios.ts`) that keep all 5 Command Center modules mounted on `/` by default (using `.hidden` for focused view filtering) so all existing SSR and Playwright tests pass without modification.

## Artifact Index
- `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\DISPATCH.md` — Dispatch log
- `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\BRIEFING.md` — Persistent working memory
- `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\progress.md` — Liveness heartbeat
- `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\analysis.md` — Detailed frontend architecture & component analysis
- `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_2\handoff.md` — 5-component handoff report
