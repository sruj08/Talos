# Dispatch — Milestone 4 Integration Worker (`teamwork_worker_m4_integration`)

## Identity & Paths
- **Role**: Cross-Phase Integration, Mirror Sync & E2E Execution Worker (`teamwork_worker`)
- **Working Directory**: `g:\PAYPAL\.agents\teamwork\teamwork_worker_m4_integration`
- **Parent Conversation ID**: `52b79b48-56f1-40fb-81a2-c616ff2ea33f`
- **Original Request File**: `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Project Scope Document**: `g:\PAYPAL\PROJECT.md`

## Mandatory Integrity Warning
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A teamwork_auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

## Required Reading
1. `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `g:\PAYPAL\PROJECT.md`
3. `g:\PAYPAL\TEST_INFRA.md` and `g:\PAYPAL\TEST_READY.md`
4. Worker handoffs:
   - `g:\PAYPAL\.agents\teamwork\teamwork_worker_m1_rust\handoff.md`
   - `g:\PAYPAL\.agents\teamwork\teamwork_worker_m2_go\handoff.md`
   - `g:\PAYPAL\.agents\teamwork\teamwork_worker_m3_web\handoff.md`
   - `g:\PAYPAL\.agents\teamwork\teamwork_test_writer_e2e\handoff.md`

## Objectives
1. **Update Task Tracking & Planning Artifacts for Phases 1–6 (`TASK-01`..`TASK-12`)**:
   - Update `g:\PAYPAL\.agent\tasks.json` so that `TASK-01` through `TASK-12` (all 12 tasks across Phases 1 through 6) have `"passes": true` (leaving `TASK-13`..`TASK-16` as `"passes": false`).
   - Update the individual task files `g:\PAYPAL\.agent\tasks\TASK-01.json` through `g:\PAYPAL\.agent\tasks\TASK-12.json` so each has `"passes": true` (and `completed_at` timestamp matching the format in `TASK-01.json` / `TASK-11.json`).
   - Update `g:\PAYPAL\.planning\ROADMAP.md`, `g:\PAYPAL\.planning\STATE.md`, `g:\PAYPAL\.agent\logs\LOG.md`, and `g:\PAYPAL\.planning\graphs\` (`GRAPH_REPORT.md`, `CODEBASE_INDEX.md`, `graph.json`) to reflect completion of Phases 1 through 6 (`TASK-01`..`TASK-12`).
2. **Sync `g:\PAYPAL\build\talos\` Mirror Directory**:
   - Sync all updated source, test, config, and metadata files from `g:\PAYPAL\` into `g:\PAYPAL\build\talos\`:
     - `services/firewall-rs/Cargo.toml`, `services/firewall-rs/.cargo/config.toml`, `services/firewall-rs/src/**`
     - `sdk/paypal-go-apimatic/**`
     - `services/orchestrator-go/go.mod`, `services/orchestrator-go/go.sum`, `services/orchestrator-go/cmd/**`, `services/orchestrator-go/internal/**`, `services/orchestrator-go/migrations/**`
     - `web/package.json`, `web/vitest.config.ts`, `web/src/**`
     - `.mcp.json`, `.agent/tasks.json`, `.agent/tasks/TASK-01.json`..`TASK-12.json`, `.agent/logs/LOG.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/graphs/**`
   - Do NOT copy `node_modules`, `.next`, `target`, or `.env` secrets into tracked git files.
3. **Update `tests/e2e_phase1_6/tier4_scenarios.ps1` (if needed) to Assert All 12 Tasks (`TASK-01`..`TASK-12`) Have `"passes": true`**:
   - Ensure `tier4_scenarios.ps1` explicitly asserts that all 12 tasks `TASK-01`..`TASK-12` in both `g:\PAYPAL\.agent\tasks.json` and `g:\PAYPAL\build\talos\.agent\tasks.json` have `"passes": true`.
4. **Full End-to-End Live Execution & Verification Across All Services**:
   - Run all build & unit test suites and verify 100% pass:
     - `docker compose config -q`
     - `cd g:\PAYPAL\services\firewall-rs && cargo test && cargo clippy -- -D warnings`
     - `cd g:\PAYPAL\sdk\paypal-go-apimatic && go test -v ./...`
     - `cd g:\PAYPAL\services\orchestrator-go && go test -race -v ./...`
     - `cd g:\PAYPAL\web && npx tsc --noEmit && npm test && npm run build`
   - Start `talos-firewall-rs` (`:8081`) and `talos-orchestrator-go` (`:8080`) transiently during a test script run, execute `powershell -ExecutionPolicy Bypass -File g:\PAYPAL\tests\e2e_phase1_6\run_e2e.ps1` against the live running `:8081` and `:8080` servers (resolving any integration edge cases if found), and stop the transient `:8081` and `:8080` processes cleanly after the run.
   - Also run `powershell -ExecutionPolicy Bypass -File g:\PAYPAL\tests\e2e_phase1_6\run_e2e.ps1` standalone to confirm `176/176` pass in both modes.
   - Verify every source file in `services/firewall-rs/src/`, `sdk/paypal-go-apimatic/`, `services/orchestrator-go/`, `web/src/`, and `tests/e2e_phase1_6/` is strictly `< 250 lines`.
   - Verify `git rev-parse HEAD` is still `06de23bbdd92c86093f8e5beec81f97fb9fd6bfc` (NEVER run `git commit`) and zero secret values from `.env` appear in any file or output.
5. Write your handoff report to `g:\PAYPAL\.agents\teamwork\teamwork_worker_m4_integration\handoff.md` and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.


## 2026-11-04T10:09:05Z
You are `teamwork_worker_m4_integration` (TypeName: `teamwork_worker`).
Your working directory is `g:\PAYPAL\.agents\teamwork\teamwork_worker_m4_integration`.
Your parent conversation ID is `52b79b48-56f1-40fb-81a2-c616ff2ea33f`.

First, read `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`, `g:\PAYPAL\PROJECT.md`, and `g:\PAYPAL\.agents\teamwork\teamwork_worker_m4_integration\DISPATCH.md`.
Create and maintain `BRIEFING.md` and `progress.md` in `g:\PAYPAL\.agents\teamwork\teamwork_worker_m4_integration`.

Constraints:
- NEVER run `git commit` (`git rev-parse HEAD` must remain `06de23bbdd92c86093f8e5beec81f97fb9fd6bfc`).
- NEVER print, echo, or leak any secret values from `.env`.
- Keep every source file strictly under 250 lines.

Complete all tasks in your `DISPATCH.md`:
1. Update `.agent/tasks.json` and `.agent/tasks/TASK-01.json`..`TASK-12.json` so all `TASK-01`..`TASK-12` have `"passes": true`, and update `.planning/ROADMAP.md`, `.planning/STATE.md`, `.agent/logs/LOG.md`, and `.planning/graphs/`.
2. Sync all updated files into `g:\PAYPAL\build\talos\`.
3. Run all build/test suites (`cargo test`, `cargo clippy -- -D warnings`, `go test -race ./...`, `npx tsc --noEmit`, `npm test`, `npm run build`) and run `tests/e2e_phase1_6/run_e2e.ps1` both against live running `:8081` + `:8080` daemons (stopping them cleanly afterward) and standalone.
4. Write `g:\PAYPAL\.agents\teamwork\teamwork_worker_m4_integration\handoff.md` and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.
