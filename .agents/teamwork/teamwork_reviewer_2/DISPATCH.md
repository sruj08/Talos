# Dispatch — Reviewer 2 (`teamwork_reviewer_2`)

## Identity & Paths
- **Role**: Independent Code & Spec Reviewer 2 (`teamwork_reviewer`)
- **Working Directory**: `g:\PAYPAL\.agents\teamwork\teamwork_reviewer_2`
- **Parent Conversation ID**: `52b79b48-56f1-40fb-81a2-c616ff2ea33f`
- **Original Request File**: `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Project Scope Document**: `g:\PAYPAL\PROJECT.md`

## Required Reading
1. `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `g:\PAYPAL\PROJECT.md`, `g:\PAYPAL\TEST_INFRA.md`, `g:\PAYPAL\TEST_READY.md`
3. `g:\PAYPAL\docs\08-project\PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`
4. All guides in `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\` (especially `03-AG_GRID_AND_AG_STUDIO_GUIDE.md` and `04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`)
5. Worker handoffs:
   - `g:\PAYPAL\.agents\teamwork\teamwork_worker_m1_rust\handoff.md`
   - `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go\handoff.md`
   - `g:\PAYPAL\.agents\teamwork\teamwork_worker_m3_web\handoff.md`
   - `g:\PAYPAL\.agents\teamwork\teamwork_worker_m4_integration\handoff.md`
6. Relevant review skills: `C:\Users\satav\.gemini\config\skills\frontend-code-review\SKILL.md`, `C:\Users\satav\.gemini\config\skills\web-design-guidelines\SKILL.md`

## Review Scope & Instructions
1. **Read-Only Review**: Do NOT modify any repository files or run `git commit`.
2. **Zero Secret Leaks**: NEVER print, echo, or log any secret values from `.env`.
3. **Comprehensive Review of Phases 4–6 (`TASK-07`..`TASK-12`), Sponsor Integrations & Mirror Sync (`TASK-01`..`TASK-12`)**:
   - Inspect `web/src/app/page.tsx`, `MandateStudio.tsx`, `useEscrowStream.ts` (`TASK-09`).
   - Inspect `web/src/components/AgStudioBlotter.tsx`, `ForensicDetailPanel.tsx`, `useAgStudioBlotter.ts` (`TASK-10` & Guide `03`).
   - Inspect `web/src/components/BryntumSlaBoard.tsx`, `useBryntumTimeline.ts` (`TASK-11` & Guide `04`).
   - Inspect `web/src/components/PayPalStepUpModal.tsx`, `PoisonedStoreSim.tsx`, `web/src/app/api/mcp/paypal-bridge/route.ts`, `.mcp.json` (`TASK-12` & Guides `01`, `02`).
   - Verify all source files across Rust, Go, Web, and E2E tests are strictly `< 250 lines`, `build/talos/` mirror matches root, and `.agent/tasks.json` has `"passes": true` for `TASK-01`..`TASK-12`.
4. **Execute Verification Commands**:
   - Run `cd g:\PAYPAL\web && npx tsc --noEmit && npm test`
   - Run `powershell -ExecutionPolicy Bypass -File g:\PAYPAL\tests\e2e_phase1_6\run_e2e.ps1`
5. **Deliver Verdict**:
   - Write your full review report to `g:\PAYPAL\.agents\teamwork\teamwork_reviewer_2\handoff.md` with an explicit verdict (`APPROVE` or `REQUEST_CHANGES`), and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.


## 2026-11-04T10:24:03Z
You are `teamwork_reviewer_2` (TypeName: `teamwork_reviewer`).
Your working directory is `g:\PAYPAL\.agents\teamwork\teamwork_reviewer_2`.
Your parent conversation ID is `52b79b48-56f1-40fb-81a2-c616ff2ea33f`.

First, read `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`, `g:\PAYPAL\PROJECT.md`, and `g:\PAYPAL\.agents\teamwork\teamwork_reviewer_2\DISPATCH.md`.
Create and maintain `BRIEFING.md` and `progress.md` in `g:\PAYPAL\.agents\teamwork\teamwork_reviewer_2`.

Perform a thorough, read-only review of Phases 4 through 6 (`TASK-07`..`TASK-12`), sponsor guides (`01`–`09` including `04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`), `.agent/tasks.json`, and `build/talos/` mirror sync per your `DISPATCH.md` (do NOT modify any repository files, do NOT run `git commit`, and NEVER print or leak any secret values from `.env`).
Write your full review report with an explicit verdict (`APPROVE` or `REQUEST_CHANGES`) to `g:\PAYPAL\.agents\teamwork\teamwork_reviewer_2\handoff.md`, and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.
