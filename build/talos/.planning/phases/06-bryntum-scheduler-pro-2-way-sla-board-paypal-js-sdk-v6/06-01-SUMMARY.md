---
phase: 06-bryntum-scheduler-pro-2-way-sla-board-paypal-js-sdk-v6
plan: 01
subsystem: sponsor-bryntum
tags: [bryntum, scheduler-pro, gantt, paypal-void, channel3, wcag-2.2]
Completed: 2026-11-04T12:03:00+05:30
---

# Phase 6 Plan 01: BryntumSlaBoard.tsx Two-Way Payment SLA Board Summary (`TASK-11`)

- Implemented [`web/src/components/BryntumSlaBoard.tsx`](file:///g:/PAYPAL/web/src/components/BryntumSlaBoard.tsx) (`193 lines`, strictly `< 250 lines`) and extracted [`web/src/hooks/useBryntumTimeline.ts`](file:///g:/PAYPAL/web/src/hooks/useBryntumTimeline.ts) (`237 lines`) following the `component-refactoring` skill.
- Rendered multi-vendor procurement lanes showing each order's **48-Hour Carrier Shipping SLA Bar**, **29-Day PayPal Authorization Honor Period (`72h Honor / 29d Max`)**, and **Finish-to-Start (`EndToStart`) downstream project phase dependencies** (`Phase 1 Hardware Escrow -> Phase 2 Studio Setup -> Phase 3 Production`).
- Implemented Two-Way Payment Binding:
  - Dragging an SLA bar past the 48h cutoff or clicking `"Terminate & Void Escrow"` (WCAG 2.2 SC 2.5.7 keyboard alternative) calls `PATCH /api/v1/sla/timeline/{task_id}` (`API-13`) and `POST /api/v1/escrow/{id}/void` (`API-10`) -> PayPal Sandbox `POST /v2/payments/authorizations/{id}/void`, locks downstream dependent tasks in crimson (`[✖ LOCKED IN CRIMSON: SLA BREACH ROLLBACK]`), synchronizes `VOIDED` state with AG Grid via `talos:escrow-event`, and offers 1-click **Channel3** backup supplier rerouting.
  - Clicking `"Simulate Carrier Delivered"` calls `POST /api/v1/escrow/{id}/tracking` (`API-08`) and transitions the task bar to `PAYPAL_CAPTURED`, unlocking downstream phases.
- Passed all Vitest unit tests in [`web/src/components/BryntumSlaBoard.spec.tsx`](file:///g:/PAYPAL/web/src/components/BryntumSlaBoard.spec.tsx) and `npx tsc --noEmit`.
