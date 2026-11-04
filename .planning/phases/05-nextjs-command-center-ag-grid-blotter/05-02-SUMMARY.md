---
phase: 05-nextjs-command-center-ag-grid-blotter
plan: 02
subsystem: web-ag-grid-blotter
tags: [ag-grid-enterprise-33, ag-charts-11, master-detail, integrated-charts, pivot, sparklines, copilot]
Completed: 2026-11-03
---

# Phase 5 Plan 02 Summary — AG Grid Enterprise Blotter, Master-Detail Forensics & AG Studio Copilot (`TASK-10`)

**Status:** Complete (`TASK-10: DONE`)

## Implemented
- **`AgStudioBlotter.tsx`**: `getRowId`, incremental `applyTransactionAsync({ add, update, remove })` computed by `diffRows`, cell-change flash, row-group panel, grand total, side bar (columns / filters), status bar aggregations, cell selection, and Excel export.
- **`blotter/columns.tsx`**: two-channel status badges (`BLOCKED: DOM_INJECTION`, `AUTHORIZED_ESCROW`, `CAPTURED`, `VOIDED_SLA_BREACH`, …), merchant risk pills, Channel3 spread colouring, a spread-trend `agSparklineCellRenderer`, Ed25519 signature pills, and PayPal auth / capture IDs.
- **`ForensicDetailPanel.tsx`** (master-detail drawer):
  - the stripped DOM diff with `−` / `+` prefixes and screen-reader labels
  - DeBERTa score and firewall latency
  - an AG Charts bar chart of merchant listed price vs Channel3 median vs lowest verified price
  - Ed25519 / RFC 9421 `Signature-Input` evidence
  - Capture / Void / Dispute buttons, enabled only for transitions `escrow/machine.go` allows. They call API-09/10/11 and fall back to Replay when the orchestrator is offline.
- **AG Studio Copilot** (`lib/copilot.ts`, `blotter/CopilotBar.tsx`): a deterministic natural-language compiler that turns a prompt into row grouping, set and number filters, sorting, and charts. With no grouping it builds an Integrated range chart. When the grid is grouped by a different column it switches to pivot mode and calls `createPivotChart`. If the chart category is the grouping column itself, it builds a range chart of the collapsed groups. `Reset` restores the default grid. Five presets are included, and each applied operation is listed back to the user.

## Verification
- `npm test -- AgStudioBlotter`: 4 / 4 pass: rows and badges render, streamed updates apply in place, Copilot filters and grouping work (including reset), and the master-detail drawer shows the DOM diff, chart and an offline capture via Replay.
- Full suite: 5 files / 25 tests pass. `tsc --noEmit` and `next build` are clean.
- Browser check:
  - The flagship preset groups by merchant risk, excludes attacks, and renders a dark pivot chart of volume by risk × state.
  - Expanding a blocked row shows three stripped vectors (hidden CSS, HTML comment, zero-width text).
  - A live **Capture** against `orchestrator-go` moved `ESC-938500` to `PAYPAL_CAPTURED` with a PayPal capture ID, confirmed through `GET /api/v1/escrow/{id}`.

## Follow-ups
- `orchestrator-go` does not broadcast a WS frame when capture or void goes through `escrow.Engine` (API-09 / API-10). The UI covers this by patching the row optimistically, but a hub broadcast would keep other open dashboards in sync.
- Integrated chart creation is checked in the browser only. jsdom has no real canvas, so it isn't unit-tested.
