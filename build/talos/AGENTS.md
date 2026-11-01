# AGENTS.md — Universal Agent Execution Standards for TALOS

> **Primary Instructions**: Read [`CLAUDE.md`](CLAUDE.md), [`MAP.md`](MAP.md), and [`docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`](docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md) before modifying any file.

## Ralph Loop & GSD Integration Rules
1. **One Task Per Iteration**: When invoked inside `/ralph-loop`, complete only the single target task in `.agent/tasks.json`, run all tests, commit, and emit `<promise>TASK-{ID}:DONE</promise>`.
2. **Consult Graphify First**: Use `.planning/graphs/GRAPH_REPORT.md` and `MAP.md` to locate files and symbols in `O(1)` without scanning the workspace.
3. **Zero Secret Leaks**: Always use the `credentials` skill (`grep -sq` + `read -s`) when checking or requesting PayPal Sandbox or Sponsor API keys.
