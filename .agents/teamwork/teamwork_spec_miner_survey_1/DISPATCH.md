# Dispatch — Survey Spec Miner 1 (`teamwork_spec_miner_survey_1`)

## Identity & Paths
- **Role**: Specification Miner (`teamwork_spec_miner`)
- **Working Directory**: `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1`
- **Parent Conversation ID**: `52b79b48-56f1-40fb-81a2-c616ff2ea33f`
- **Original Request File**: `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`

## Objective
Extract the complete, authoritative specification for TALOS Phase 1 through Phase 6 (`TASK-01` through `TASK-12`) from:
1. `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `g:\PAYPAL\CLAUDE.md`, `g:\PAYPAL\MAP.md`, `g:\PAYPAL\.planning\graphs\GRAPH_REPORT.md` (if present)
3. `g:\PAYPAL\.agent\tasks.json`
4. `g:\PAYPAL\docs\08-project\PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`
5. All files in `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\` (especially `04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md` and any other integration guides in that folder or `docs/09-integrations-and-guides/`).

## Instructions & Constraints
- **Read-only**: Do NOT modify any project files or run `git commit`.
- **Zero Secret Leaks**: NEVER read or print secret values from `.env`. If checking `.env`, only inspect variable names (keys), never values.
- Maintain `BRIEFING.md` and `progress.md` in `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1`.
- Write your comprehensive report to `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1\handoff.md` covering:
  - Exact definition, acceptance criteria, required files, required skills, and verification commands for each task `TASK-01` through `TASK-12` (Phases 1–6).
  - Current status in `.agent/tasks.json` (`passes: true/false` and details) for `TASK-01` through `TASK-12` (and whether there are tasks beyond `TASK-12`).
  - Specific requirements from `04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md` and all other guides in `build/talos/docs/09-integrations-and-guides/`.
- When complete, notify parent (`52b79b48-56f1-40fb-81a2-c616ff2ea33f`) via `send_message`.


## 2026-11-04T09:10:21Z
You are `teamwork_spec_miner_survey_1` (TypeName: `teamwork_spec_miner`).
Your working directory is `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1`.
Your parent conversation ID is `52b79b48-56f1-40fb-81a2-c616ff2ea33f`.

First, read `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md` and `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1\DISPATCH.md`.
Create and maintain `BRIEFING.md` and `progress.md` in `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1`.

Your task:
1. Read `CLAUDE.md`, `MAP.md`, `.planning/graphs/GRAPH_REPORT.md` (if present), `.agent/tasks.json`, `docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`, and all files under `build/talos/docs/09-integrations-and-guides/` (including `04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`).
2. Extract the complete requirements, acceptance criteria, required skills, target files, and current `.agent/tasks.json` status (`passes: true/false`) for every task from Phase 1 through Phase 6 (`TASK-01` through `TASK-12`).
3. NEVER print or leak any secret values from `.env`. Do not modify any project files or run `git commit`.
4. Write your complete specification report to `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1\handoff.md` and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.
