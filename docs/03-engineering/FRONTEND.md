# Frontend Engineering Architecture — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Owner: Frontend & Visualization Team · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) · [ARCHITECTURE](ARCHITECTURE.md) · [UI_SPEC](../02-design/UI_SPEC.md) · [ADR-0005](adr/ADR-0005-ag-grid-studio-and-bryntum-scheduler-command-center.md)

---

## 1. Frontend Architecture Overview (`web/`)

The PactPay Command Center is built on **Next.js 15.2 (App Router)**, **React 19.0**, **TypeScript 5.7**, and **Tailwind CSS v4**, engineered strictly following `vercel-react-best-practices` (Server Component shell, dynamic client boundaries for heavy canvas libraries, zero waterfall data fetching, and <250 lines per component file for Ralph Loop modularity).

### 1.1 Directory Structure (`web/`)
```text
web/
├── next.config.ts                       # Turbopack + transpilePackages for AG Grid & Bryntum
├── package.json                         # ag-grid-enterprise@33.1.0, @bryntum/schedulerpro-react@6.1.4, @paypal/react-paypal-js
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Dark-mode glassmorphic root shell + PayPalScriptProvider v6
│   │   ├── page.tsx                     # Server Component prefetching initial blotter (API-12) & SLA timeline (API-13)
│   │   └── api/
│   │       └── mcp/
│   │           └── paypal-bridge/
│   │               └── route.ts         # API-16: @paypal/agent-toolkit + APIMatic Context Plugin + AG Studio Copilot
│   ├── components/
│   │   ├── command-center/
│   │   │   ├── KpiHeaderBar.tsx         # Live Authorized ($), Captured ($), Blocked Fraud ($/₹), p99 Rust Latency
│   │   │   ├── MandateSignerCard.tsx    # F-01: Interactive Ed25519 KYA Mandate creator (API-01)
│   │   │   └── PoisonedStoreSim.tsx     # F-11: 1-click Red-Team Adversarial Storefront & KERNEL trigger (API-05)
│   │   ├── blotter/
│   │   │   ├── AgStudioBlotter.tsx      # F-08: AG Grid Enterprise v33.1 + AG Studio Copilot + Integrated Charts
│   │   │   └── ForensicDetailDrawer.tsx # Master-Detail expandable row: DOM diff, Ed25519 sig, Channel3 spread
│   │   ├── timeline/
│   │   │   └── BryntumSlaBoard.tsx      # F-07: Bryntum Scheduler Pro / Gantt bound 2-way to PayPal AUTHORIZE/VOID
│   │   └── paypal/
│   │       └── PayPalStepUpModal.tsx    # F-09: PayPal JS SDK v6 human-in-the-loop co-sign modal (> $300 orders)
│   ├── hooks/
│   │   ├── useEscrowWebSocket.ts        # API-15: WebSocket multiplexer feeding AG Grid & Bryntum in real time
│   │   └── useAgStudioCopilot.ts        # M-03: Natural-language query to AG Grid columnState & chart config
│   └── lib/
│       ├── types.ts                     # Shared TypeScript interfaces for E-01..E-10 & API-01..API-16
│       └── formatters.ts                # Dual USD ($249.00) & INR (₹20,916) currency and bps formatters
```

---

## 2. Core Component Implementations

### 2.1 `AgStudioBlotter.tsx` — AG Grid Enterprise v33.1 + AG Studio Copilot (`F-08`)

Implemented to satisfy **Judge #8 (Sylwia Vargas, AG Grid)** and the *"Build a payments dashboard without building a dashboard"* brief:

```tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
  RowGroupingModule,
  MasterDetailModule,
  IntegratedChartsModule,
  SideBarModule,
  StatusBarModule,
} from "ag-grid-enterprise";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import { ForensicDetailDrawer } from "./ForensicDetailDrawer";
import { EscrowBlotterRow } from "@/lib/types";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowGroupingModule,
  MasterDetailModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  SideBarModule,
  StatusBarModule,
]);

interface Props {
  initialRows: EscrowBlotterRow[];
  onSelectEscrow: (escrowId: string) => void;
  onGridReadyRef: (api: any) => void;
}

export function AgStudioBlotter({ initialRows, onSelectEscrow, onGridReadyRef }: Props) {
  const gridRef = useRef<AgGridReact<EscrowBlotterRow>>(null);
  const [copilotPrompt, setCopilotPrompt] = useState("");

  const columnDefs = useMemo<ColDef<EscrowBlotterRow>[]>(
    () => [
      {
        field: "paypal_order_id",
        headerName: "PayPal Order / Auth ID",
        cellRenderer: "agGroupCellRenderer",
        pinned: "left",
        width: 210,
      },
      {
        field: "state",
        headerName: "2PC Escrow State",
        enableCellChangeFlash: true,
        width: 190,
        cellClassRules: {
          "text-emerald-400 font-semibold": (p) => p.value === "PAYPAL_CAPTURED",
          "text-sky-400 font-semibold": (p) => p.value === "PAYPAL_AUTHORIZED",
          "text-amber-400 font-semibold": (p) => p.value === "STEP_UP_REQUIRED" || p.value === "PAYPAL_VOIDED",
          "text-rose-500 font-bold": (p) =>
            p.value === "BLOCKED_FIREWALL" || p.value === "BLOCKED_PRICE_GOUGING",
        },
      },
      { field: "merchant_name", headerName: "Merchant", enableRowGroup: true, width: 180 },
      { field: "sku_summary", headerName: "SKU / Item", width: 220 },
      {
        field: "amount_cents",
        headerName: "Escrow Amount ($ / ₹)",
        aggFunc: "sum",
        enableValue: true,
        enableCellChangeFlash: true,
        valueFormatter: (p) => {
          const usd = (Number(p.value || 0) / 100).toFixed(2);
          const inr = ((Number(p.value || 0) / 100) * 84).toLocaleString("en-IN");
          return `$${usd} (₹${inr})`;
        },
      },
      {
        field: "channel3_spread_bps",
        headerName: "Channel3 Spread",
        width: 150,
        valueFormatter: (p) => `${(Number(p.value || 0) / 100).toFixed(1)}% (${p.value} bps)`,
      },
      {
        field: "deberta_risk_score",
        headerName: "Rust Firewall Risk",
        width: 150,
        valueFormatter: (p) => `${(Number(p.value || 0) * 100).toFixed(2)}%`,
      },
    ],
    []
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      onGridReadyRef(params.api);
    },
    [onGridReadyRef]
  );

  const runAgStudioCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotPrompt.trim() || !gridRef.current?.api) return;
    const res = await fetch("/api/mcp/paypal-bridge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "AG_STUDIO_COPILOT", natural_language_query: copilotPrompt }),
    });
    const data = await res.json();
    if (data.ag_grid_column_state) {
      gridRef.current.api.applyColumnState({ state: data.ag_grid_column_state, applyOrder: true });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/90 border border-slate-800 rounded-xl p-3">
      <form onSubmit={runAgStudioCopilot} className="flex gap-2 mb-3">
        <input
          value={copilotPrompt}
          onChange={(e) => setCopilotPrompt(e.target.value)}
          placeholder="AG Studio AI Copilot: 'Group by state and sum authorized vs voided PayPal holds'..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
        />
        <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg">
          Run AG Studio
        </button>
      </form>
      <div className="ag-theme-quartz-dark flex-1 w-full min-h-[380px]">
        <AgGridReact
          ref={gridRef}
          rowData={initialRows}
          columnDefs={columnDefs}
          getRowId={(params) => params.data.escrow_id}
          asyncTransactionWaitMillis={50}
          masterDetail={true}
          detailCellRenderer={ForensicDetailDrawer}
          detailRowHeight={240}
          enableCharts={true}
          cellSelection={true}
          sideBar={["columns", "filters"]}
          onGridReady={onGridReady}
          onRowClicked={(e) => e.data && onSelectEscrow(e.data.escrow_id)}
        />
      </div>
    </div>
  );
}
```

---

### 2.2 `BryntumSlaBoard.tsx` — Bryntum Scheduler Pro Two-Way Payment SLA Timeline (`F-07`)

Designed for **Judge #9 (Mats Bryntse, Bryntum)**:
- Renders each PayPal `Orders v2 AUTHORIZE` hold as a dual-layer bar:
  1. **Inner Bar**: 48-hour Merchant Carrier Shipping SLA countdown.
  2. **Outer Envelope**: 29-day PayPal Authorization Honor & Expiry Window.
- **Interactive Event Listener (`onEventDrop` / `onContextMenuVoid`)**:
  - When a user drags a shipment bar past its SLA deadline or right-clicks **"Terminate & Void PayPal Hold"**, `BryntumSlaBoard.tsx` immediately dispatches `POST /api/v1/escrow/{id}/void` (`API-10`), executing a live `POST /v2/payments/authorizations/{auth_id}/void` in PayPal Sandbox and locking dependent downstream project tasks in crimson.

---

### 2.3 `PayPalStepUpModal.tsx` — PayPal JS SDK v6 Human-in-the-Loop Co-Sign (`F-09`)

When an AI agent attempts a purchase exceeding the autonomous `KyaMandate.max_amount_cents` cap (e.g., `$450.00` order on a `$300.00` mandate), `orchestrator-go` transitions the transaction to `STEP_UP_REQUIRED` and broadcasts a WebSocket event that opens `PayPalStepUpModal.tsx`:

```tsx
"use client";

import React from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

interface StepUpProps {
  escrowId: string;
  amountUsd: string;
  skuSummary: string;
  onStepUpComplete: (paypalOrderId: string) => void;
}

export function PayPalStepUpModal({ escrowId, amountUsd, skuSummary, onStepUpComplete }: StepUpProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb",
        currency: "USD",
        intent: "authorize",
      }}
    >
      <div className="p-5 bg-slate-900 border border-amber-500/50 rounded-xl shadow-2xl">
        <h3 className="text-base font-bold text-amber-400">
          Human Step-Up Co-Sign Required (Exceeds Autonomous Mandate Cap)
        </h3>
        <p className="text-xs text-slate-300 mt-1 mb-4">
          Approve 29-day Reversible PayPal Authorization Hold of <strong>${amountUsd}</strong> for{" "}
          <strong>{skuSummary}</strong> (Escrow <code>{escrowId}</code>).
        </p>
        <PayPalButtons
          style={{ layout: "horizontal", color: "gold", shape: "rect", label: "pay" }}
          createOrder={async () => {
            const res = await fetch(`/api/v1/escrow/${escrowId}/authorize`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "PayPal-Request-Id": `stepup-${escrowId}`,
              },
              body: JSON.stringify({ amount_usd: amountUsd }),
            });
            const data = await res.json();
            return data.paypal_order_id;
          }}
          onApprove={async (data) => {
            onStepUpComplete(data.orderID);
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
```

---

## 3. Real-Time State Synchronization (`useEscrowWebSocket.ts` — `API-15`)

- Connects to `ws://localhost:8080/ws/events` (or `wss://pactpay-orchestrator-go.onrender.com/ws/events`).
- On receiving an `ESCROW_STATE_TRANSITION` frame:
  1. Calls `gridApi.applyTransactionAsync({ update: [frame.ag_grid_row_delta] })` — triggers a 60fps emerald/crimson cell flash in **AG Grid** without re-rendering the React component tree.
  2. Mutates the corresponding task record in **Bryntum Scheduler Pro's** `EventStore` (`schedulerInstance.eventStore.getById(frame.bryntum_task_delta.id).set(...)`).

---

## 4. Performance Budget & Bundle Optimization (`vercel-react-best-practices`)

- **Dynamic Imports (`next/dynamic`)**: Both `AgStudioBlotter` and `BryntumSlaBoard` are loaded with `ssr: false` and custom skeleton shimmer placeholders so initial First Contentful Paint (FCP) completes in `<0.6s`.
- **Server-Side Parallel Prefetching**: `app/page.tsx` uses `Promise.all([fetchBlotter(), fetchTimeline()])` on the server so the client hydrates with zero client-side network waterfalls.
