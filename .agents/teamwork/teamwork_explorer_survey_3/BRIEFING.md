# BRIEFING — 2026-11-10T13:28:30Z

## Mission
Investigate interactive simulation components, scenario data flows, raw technical telemetry locations, and existing build/test/docs infrastructure in `g:\PAYPAL\web` and `g:\PAYPAL\docs`.

## 🔒 My Identity
- Archetype: Explorer (Survey Agent 3 of 3)
- Roles: Investigator, Synthesizer
- Working directory: `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_3`
- Original parent: `df172cba-4cf8-413a-92c9-8375a6480b29`
- Milestone: Phase 0 Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source files
- Write metadata files ONLY inside `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_3\`
- Consult `MAP.md` and `.planning/graphs/` first per workspace rules

## Current Parent
- Conversation ID: `df172cba-4cf8-413a-92c9-8375a6480b29`
- Updated: 2026-11-10T13:28:30Z

## Investigation State
- **Explored paths**: `ORIGINAL_REQUEST.md`, `MAP.md`, `CLAUDE.md`, `web/package.json`, `web/vitest.config.ts`, `web/playwright.config.ts`, `web/next.config.mjs`, `web/tailwind.config.ts`, `web/src/app/**`, `web/src/components/**`, `web/src/context/**`, `web/src/hooks/**`, `web/src/lib/**`, `web/src/__tests__/**`, `web/e2e/talos-3act-demo.spec.ts`, `tests/e2e_phase1_6/tier1_f11_f15.ps1`, `tests/e2e_phase1_6/tier2_f11_f15.ps1`, `docs/02-design/**`, `docs/08-project/**`.
- **Key findings**:
  1. Interactive simulation state is coordinated by `TalosClearingContext` (`useEscrowStream`) + `window.dispatchEvent(new CustomEvent('talos:escrow-event'))` (`phase6-events.ts`), with offline deterministic fallbacks for every backend call (`/v1/mandates/sign`, `/api/v1/checkout/evaluate`, `/api/mcp/paypal-bridge`, `/api/v1/escrow/{id}/tracking|capture|void|step-up-approve|dispute-evidence`, `/api/v1/sla/timeline/{task_id}`).
  2. All raw technical telemetry (`128-hex Ed25519`, `RFC 9421`, `9277 bps`, `lol_html + DeBERTa-v3 ONNX`) and backend jargon (`Sovereign Clearinghouse`, `Cryptographic Agent Mandate`, `Red-Team Interception Arena`, `Market Fair-Price Oracle`, `SLA Forensics`) mapped with exact line numbers.
  3. Critical test coupling discovered in `web/src/__tests__/anti-slop-20-gate.test.ts` (20 quality gates + 250-line file limit + 33 required `data-testid`s), `showcase-rendering.test.ts`, `console-f01-f12.test.tsx`, `e2e/talos-3act-demo.spec.ts`, and `tests/e2e_phase1_6/tier1_f11_f15.ps1` + `tier2_f11_f15.ps1`.
- **Unexplored areas**: None within scope.

## Key Decisions Made
- Document exact component props, hooks, API endpoints, event payloads, technical telemetry encapsulation strategy (`grid-rows-[0fr]` / drawer pattern), and test invariants in `handoff.md`.

## Artifact Index
- `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_3\DISPATCH.md` — Dispatch log
- `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_3\BRIEFING.md` — Persistent working memory
- `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_3\progress.md` — Liveness heartbeat
- `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_3\handoff.md` — 5-Component Handoff Report
