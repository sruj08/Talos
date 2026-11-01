# ADR-0005: Dual-Pane Financial Command Center with AG Grid / AG Studio & Bryntum Scheduler Pro
> Project: TALOS · Owner: Frontend Architecture Team · Status: Accepted · Last updated: 2026-11-01
> Related: [FRONTEND](../FRONTEND.md) · [UI_SPEC](../../02-design/UI_SPEC.md) · [PROJECT_BRIEF](../../00-overview/PROJECT_BRIEF.md)

---

## Status
**Accepted** (2026-11-01)

## Context and Problem Statement
Autonomous agentic commerce has two dimensions that standard static payment tables fail to capture:
1. **High-Dimensional Spatial Forensics**: FinOps auditors (`P-04`) and procurement leads (`P-01`) need to inspect live transaction states, `Ed25519` signatures, stripped DOM prompt-injection diffs, and **Channel3** price spreads across hundreds of SKUs, and pivot/chart them via natural language.
2. **Temporal SLA & Escrow Dependencies**: Every PayPal `Orders v2 AUTHORIZE` hold has a **48-hour carrier shipping SLA**, a **3-day PayPal Honor Period**, and a **29-day Authorization Expiry Window**, plus downstream multi-vendor task dependencies where a late shipment blocks the next project phase.

## Decision Drivers
- **Real-Time Streaming Updates without Frame Drops (`60fps`)**.
- **Two-Way Interactive Control**: Dragging or cancelling an SLA bar on the timeline must trigger a live PayPal Sandbox `VOID` (`API-10`).
- **Sponsor Prize Mastery**: **Best Use of AG Grid (`$10,000` pool — Sylwia Vargas)** and **Best Use of Bryntum (`$3,000` pool — Mats Bryntse)**.

## Considered Options
1. **Option 1 (Selected): Synchronized Split-Screen Command Center combining `AG Grid Enterprise + AG Studio + AG Charts v33.1.0` (`AgStudioBlotter.tsx`) and `Bryntum Scheduler Pro / Gantt v6.1.4` (`BryntumSlaBoard.tsx`) over a shared Go WebSocket stream (`API-15`)**.
2. **Option 2: Standard HTML `<table />` + static Chart.js**.
3. **Option 3: Separate disconnected pages for transactions and calendars**.

## Decision Outcome
Chosen option: **Option 1 (Synchronized AG Grid / AG Studio + Bryntum Scheduler Pro Command Center)**.

### Positive Consequences
- Selecting a row in **AG Grid** automatically scrolls and highlights the corresponding 29-day authorization bar in **Bryntum Scheduler Pro**.
- Dragging a deadline or clicking `"Terminate & Void Escrow"` in **Bryntum** fires `API-10`, which broadcasts a WebSocket delta that flashes the corresponding **AG Grid** row crimson/amber via `gridApi.applyTransactionAsync()` and `enableCellChangeFlash: true`.
- **AG Studio Copilot** (`M-03`) enables natural-language grouping, filtering, and integrated **AG Charts** generation on live PayPal Sandbox data.
