# BRIEFING — 2026-11-10T13:30:00Z

## Mission
Survey existing `g:\PAYPAL` docs and `g:\PAYPAL\web` Next.js 15 console codebase to map component architecture, routing, dependencies, the 21 first-screen buttons/tabs, raw jargon locations, and feature contracts for R1–R4.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: investigator, synthesizer
- Working directory: g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_1
- Original parent: df172cba-4cf8-413a-92c9-8375a6480b29
- Milestone: Phase 0 Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify any source files
- Write metadata files ONLY inside `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_1\`
- Never place source code, tests, or data in `.agents/teamwork/`

## Current Parent
- Conversation ID: df172cba-4cf8-413a-92c9-8375a6480b29
- Updated: 2026-11-10T13:30:00Z

## Investigation State
- **Explored paths**: `ORIGINAL_REQUEST.md`, `CLAUDE.md`, `MAP.md`, `docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`, `.planning/graphs/GRAPH_REPORT.md`, `.planning/graphs/CODEBASE_INDEX.md`, `docs/00-overview/PROJECT_BRIEF.md`, `docs/00-overview/PITCH.md`, `docs/02-design/DESIGN_SYSTEM.md`, `docs/02-design/UI_SPEC.md`, `web/package.json`, `web/tsconfig.json`, `web/tailwind.config.ts`, `web/next.config.mjs`, `web/src/app/**`, `web/src/components/**`, `web/src/context/**`, `web/src/hooks/**`, `web/src/lib/**`, `web/src/__tests__/**`, `web/e2e/talos-3act-demo.spec.ts`.
- **Key findings**:
  - Screen 1 (`web/src/app/page.tsx`) mounts `SovereignTopNavBar` (8 chapter tabs + 1 Sandbox pill + 1 theme button), `StartupProductHero` (4 view-switcher pills + 3 hero CTAs + 2 problem/solution card CTAs + 1 section header button + 4 chapter card CTAs = 14 buttons), and `SovereignStoryChapterDock` (8 duplicate chapter links in footer) — totaling 22+ competing navigation buttons on Screen 1.
  - `SideBySideAgentComparison.tsx` is currently buried inside `PoisonedStoreSim.tsx` (`/simulator` and `/command-center`), not mounted on `/`.
  - Raw technical telemetry (`128-hex Ed25519`, `RFC 9421`, `9277 bps`, `lol_html + DeBERTa-v3 ONNX`) is currently exposed inline across `MandateStudio.tsx`, `PoisonedStoreSim.tsx`, `SideBySideAgentComparison.tsx`, `ForensicDetailPanel.tsx`, and `storytelling-parts.ts`.
  - Critical test constraints found in `web/src/__tests__/anti-slop-20-gate.test.ts` (20 static source-code regex gates, including <=250 lines per file and bans on `rounded-full`, `scrollIntoView`, `uppercase`, and CSS gradients unless Gate 19 is updated) and `console-f01-f12.test.tsx` / `showcase-rendering.test.ts` / `talos-3act-demo.spec.ts` (which currently assert `landingVisibleText` has no digits `/\d/`).
- **Unexplored areas**: None within `web/` and repository architecture maps.

## Key Decisions Made
- Cataloged all 20 static gates in `anti-slop-20-gate.test.ts` and all `data-testid` contracts in `console-f01-f12.test.tsx` so downstream planners and implementers can cleanly evolve the storyline without breaking CI or violating the 250-line modular limit.

## Artifact Index
- `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_1\DISPATCH.md` — Dispatch log
- `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_1\BRIEFING.md` — Persistent working memory
- `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_1\progress.md` — Liveness heartbeat
- `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_1\handoff.md` — 5-Component Survey Handoff Report
