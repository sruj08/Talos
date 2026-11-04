Verify and complete everything from Phase 1 through Phase 6 (`TASK-01` through `TASK-12`) for TALOS according to `docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md` and `build/talos/docs/09-integrations-and-guides/` (including `build/talos/docs/09-integrations-and-guides/04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`), using the credentials and configuration added in `.env` so that not a single item up to Phase 6 is left undone.

Working directory: g:\PAYPAL
Integrity mode: development

## Verification Resources

- `docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`
- `build/talos/docs/09-integrations-and-guides/` (including `build/talos/docs/09-integrations-and-guides/04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`)
- `.agent/tasks.json`
- `.env` (for live credential and service verification, without printing or leaking secret values)

## Requirements

### R1. Complete and Verify All Tasks Through Phase 6 (`TASK-01` through `TASK-12`)
Verify and complete every task from Phase 1 through Phase 6 (`TASK-01` through `TASK-12` in `.agent/tasks.json`) in accordance with `docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md` and all guides in `build/talos/docs/09-integrations-and-guides/` (including `build/talos/docs/09-integrations-and-guides/04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`), using all necessary skills so that each and every item up to Phase 6 is properly completed and nothing is left undone.

### R2. Live `.env` and Integration Verification Without Secret Leaks
Verify the credentials and configuration added in `.env` (including Bryntum and sponsor/sandbox keys) against the live configured credentials and services as well as automated tests across Phases 1 through 6, while never printing or leaking any secret values from `.env`.

### R3. No Direct Git Commits and Clear Manual Action Guidance
Do not commit directly to git (`dont commit directly i will do that manually`); leave git commits to the user, update `.agent/tasks.json` for completed and verified tasks through Phase 6, and clearly explain to the user where they need to perform any manual steps (`tell where i should do what properly`).

## Acceptance Criteria

### Phase 1 through Phase 6 Completion and Verification
- [ ] Every task from Phase 1 through Phase 6 (`TASK-01` through `TASK-12` in `.agent/tasks.json`) is implemented, verified end-to-end against `docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md` and `build/talos/docs/09-integrations-and-guides/` (including `04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`), and marked `"passes": true` in `.agent/tasks.json`.
- [ ] All automated tests, build checks, and live credential/service verification checks configured via `.env` for Phases 1 through 6 execute and pass.

### Constraints and User Handover
- [ ] Zero secret values from `.env` appear in any terminal output, logs, test output, or repository files.
- [ ] No new git commits are created (`git rev-parse HEAD` remains unchanged).
- [ ] A clear summary is provided specifying what was completed and verified across Phases 1 through 6 and exact instructions on where and how the user should perform any manual steps (including manual git commits).
