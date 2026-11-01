# ADR-0006: Render Native Polyglot Blueprint (`render.yaml`) Deployment
> Project: TALOS · Owner: Cloud Infrastructure & DevOps · Status: Accepted · Last updated: 2026-11-01
> Related: [ARCHITECTURE](../ARCHITECTURE.md) · [INFRASTRUCTURE](../../05-ops/INFRASTRUCTURE.md) · [DEPLOYMENT](../../05-ops/DEPLOYMENT.md)

---

## Status
**Accepted** (2026-11-01)

## Context and Problem Statement
Deploying a polyglot architecture (`Rust 1.85` + `Go 1.24` + `Next.js 15` + `PostgreSQL 16` + `Redis/Valkey 7.2`) across fragmented cloud providers (e.g., Vercel for Next.js, Fly.io for Rust, Railway for Go, Supabase for Postgres, Upstash for Redis) introduces cross-cloud TLS latency (`15–40ms` per hop) between the Go orchestrator and the Rust firewall, complicates secrets management, and breaks 1-click reproducibility for hackathon judges.

## Decision Drivers
- **Private Network Co-Location (`<0.5ms` hop between Go and Rust)**.
- **1-Click Declarative Infrastructure-as-Code (`F-14`)**.
- **Best Use of Render Sponsor Prize Alignment (`Judge #13: Shifra Williams`)**.

## Considered Options
1. **Option 1 (Selected): Single-Repo Render Native Blueprint (`render.yaml`) provisioning `runtime: rust`, `runtime: go`, `runtime: node`, Render PostgreSQL 16, and Render Managed Valkey**.
2. **Option 2: Multi-cloud split (Vercel + AWS ECS + Supabase + Upstash)**.
3. **Option 3: Self-managed Kubernetes (EKS/GKE)**.

## Decision Outcome
Chosen option: **Option 1 (Render Native Polyglot Blueprint `render.yaml`)**.

### Technical Blueprint Structure
- `talos-firewall-rs`: `type: pserv` (Private Service), `runtime: rust`, reachable only over Render's private internal network (`talos-firewall-rs:8081`).
- `talos-orchestrator-go`: `type: web`, `runtime: go`, connected via `fromService` environment bindings to `talos-firewall-rs`, `talos-postgres`, and `talos-valkey`.
- `talos-console-web`: `type: web`, `runtime: node`, serving the Next.js 15 Command Center.
- `talos-postgres`: Render Managed PostgreSQL 16 (`plan: basic-256mb` / starter).
- `talos-valkey`: Render Managed Key-Value (`plan: starter`).

### Positive Consequences
- Sub-millisecond private networking between `orchestrator-go` and `firewall-rs`.
- Zero Kubernetes operational overhead; automatic preview environments on every pull request.
