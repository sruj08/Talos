# Contributing to PactPay (AegisPay)
> Project: PactPay (AegisPay) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [CLAUDE.md](CLAUDE.md) · [GIT_WORKFLOW](docs/03-engineering/GIT_WORKFLOW.md) · [CODING_STANDARDS](docs/03-engineering/CODING_STANDARDS.md)

## 1. Development Workflow
1. Consult [`MAP.md`](MAP.md) and [`docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`](docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md) for the active phase and micro-chunk (`TASK-01`..`TASK-16`).
2. Create a feature branch (`feat/task-03-rust-mandate` or `fix/paypal-webhook-crc32`).
3. Follow Conventional Commits (`feat(firewall-rs): implement lol_html DOM sanitizer`).

## 2. Definition of Done (Quality Gates)
- `cd services/firewall-rs && cargo fmt --check && cargo clippy && cargo test` passes.
- `cd services/orchestrator-go && go test -race ./...` passes.
- `cd web && npm run lint && npx tsc --noEmit && npm test` passes.
- Graphify knowledge graph updated (`/gsd-graphify build`).
