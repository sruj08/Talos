# Execution Plan — TALOS Frontend Capability Showcase (`web/`)

## Overview
Follow the Project Pattern Iteration Loop (2B) armed with the 5 requested skills (`gsd-plan-phase`, `shadcn`, `unslop`, `ralph-loop`, `agent-browser`):
1. **Step 2B.a (Completed)**: 3 Survey/Explorer agents mapped all specifications, existing `web/` components, `API-01`..`API-16` integrations, and the 20-gate anti-slop rules.
2. **Step 2B.b (Worker Implementation)**: Dispatch `teamwork_worker_showcase_1` (`teamwork_worker`) armed with all 5 reference skills to implement:
   - Wave 1: Install `fast-check` in `web/` (`npm install -D fast-check`), create `web/src/lib/storytelling-parts.ts` and `web/src/lib/agent-comparison-scenarios.ts` (each `<= 220` lines).
   - Wave 2: Create `web/src/components/StartupProductHero.tsx` and `web/src/components/StoryWalkthroughFivePart.tsx` (each `<= 230` lines, strictly adhering to all 20 gates in `anti-slop-20-gate.test.ts`).
   - Wave 3: Create `web/src/components/SideBySideAgentComparison.tsx` (`<= 235` lines) and wire into `web/src/components/PoisonedStoreSim.tsx` (`<= 245` lines) and `web/src/app/page.tsx` (`<= 235` lines).
   - Wave 4: Create `web/src/__tests__/showcase-properties.test.ts` (property-based tests with `fast-check` + component/integration tests for R1–R4) and update/extend `web/e2e/talos-3act-demo.spec.ts` to also verify the new landing page, 5-part storytelling flow, and side-by-side simulator.
   - Wave 5: Run `npx tsc --noEmit`, `npm test`, `npm run build`, start the live stack (`.\start-dev.ps1 -Detached`), run Playwright E2E and interactive `agent-browser` verification against `http://localhost:3000`, and verify `git status --porcelain services/ sdk/ api/` is completely empty.
3. **Step 2B.c (Independent Reviews)**: Dispatch 2 `teamwork_reviewer` agents (`teamwork_reviewer_showcase_1`, `teamwork_reviewer_showcase_2`) in parallel to independently review code quality, requirement coverage, test execution, and anti-slop compliance.
4. **Step 2B.d (Adversarial Challengers)**: Dispatch 2 `teamwork_challenger` agents (`teamwork_challenger_showcase_1`, `teamwork_challenger_showcase_2`) in parallel to empirically stress-test the property suite, build, live browser flows, and edge cases.
5. **Step 2B.e (Forensic Audit)**: Dispatch 1 `teamwork_auditor` (`teamwork_auditor_showcase_1`) to perform full forensic integrity verification and confirm zero backend modifications.
6. **Step 2B.f (Gate)**: Record all verdicts in `GATE_STATUS.md` and report final synthesized results to Sentinel (`3ddb49a1-12ce-42ce-986a-ad45677c9b37`).
