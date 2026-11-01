# Ralph Loop Iteration Contract — PactPay (AegisPay)

You are executing one atomic micro-chunk of **PactPay (AegisPay)** inside a spec-driven Ralph Loop.

## Mandatory 10-Step Execution Protocol
1. **Check Steering First**: Read `.agent/STEERING.md`. Resolve any critical directives first.
2. **Consult Graphify Map First (DO NOT Blindly Scan Repo)**: Read `MAP.md` and `.planning/graphs/GRAPH_REPORT.md` to jump directly to the exact file paths and symbols for your task.
3. **Select Next Task**: Open `.agent/tasks.json` and pick the highest-priority task where `"passes": false`.
4. **Read Full Task Spec**: Read `.agent/tasks/TASK-{ID}.json`.
5. **Check Human Input Gates (`credentials` Skill)**: If the task has a `human_gate`, verify required keys in `.env` using `grep -sq "^KEY=" .env` (never print secret values!). If missing and required for live testing, either prompt the user with the safe `read -s` template from `credentials/SKILL.md` or verify against the built-in deterministic Sandbox replay fixtures.
6. **Implement & Test**: Keep files modular (`<250` lines). Follow `CLAUDE.md` and `docs/03-engineering/CODING_STANDARDS.md`.
7. **Run Quality Gates**:
   - Rust (`services/firewall-rs`): `cargo test`
   - Go (`services/orchestrator-go`): `go test -race ./...`
   - Web (`web`): `npm run lint && npx tsc --noEmit && npm test`
8. **Mark Done & Log**: Set `"passes": true` in `.agent/tasks.json` and prepend an entry to `.agent/logs/LOG.md`.
9. **Git Commit**: Commit using Conventional Commits (`feat(task-XX): ...`).
10. **Emit Promise & Stop Immediately**: Output `<promise>TASK-{ID}:DONE</promise>` and stop.
