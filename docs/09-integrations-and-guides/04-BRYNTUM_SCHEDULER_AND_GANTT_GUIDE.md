# 04 — Bryntum Scheduler Pro, Gantt & Bryntum MCP Guide — PactPay (AegisPay)
> Project: PactPay (AegisPay) · Sponsor: **Bryntum (`3× $1,000` Cash — `$3,000` Pool)** · Judge: **Mats Bryntse** (Founder & CEO, Bryntum) · Status: Approved v1.0 · Last updated: 2026-11-01
> Related: [00-TRACKS_AND_SUBMISSION_STRATEGY](00-TRACKS_AND_SUBMISSION_STRATEGY.md) · [01-PAYPAL_SANDBOX_STEP_BY_STEP](01-PAYPAL_SANDBOX_STEP_BY_STEP.md) · [03-AG_GRID_AND_AG_STUDIO_GUIDE](03-AG_GRID_AND_AG_STUDIO_GUIDE.md)

---

## 1. Strategic Overview: How PactPay Wins the `$1,000` Bryntum Prize

**Judge**: **Mats Bryntse** (Founder & CEO, Bryntum).

On the official Devpost page, Bryntum gave a remarkably specific prompt for what they want to reward:
> *"Combine Bryntum's UI components (Gantt, Scheduler Pro, Calendar, TaskBoard, Grid) with PayPal so that **time, tasks, and capacity react dynamically to real payment events**:*
> - *An agency delivery board where a late payment or SLA breach blocks the next phase of work*
> - *An equipment/procurement calendar that locks time slots until payments clear*
> - *A scheduler that dynamically reacts or reroutes upon receiving payments*
> *Bonus: Use the new **Bryntum AI skills / MCP Server (`https://mcp.bryntum.com/mcp`)**!"*

**How PactPay Delivers the Exact Prompt (Two-Way Payment-Reactive Timeline)**:
In `web/src/components/BryntumSlaBoard.tsx`, PactPay renders a live **Bryntum Scheduler Pro & Gantt Temporal Escrow Board** where **every PayPal Sandbox `Orders v2 AUTHORIZE` hold is a time-bound contract bar** with strict dependency chains:
1. **Task 1 — `KYA Mandate & PayPal AUTHORIZE Hold Locked`**: Shows the **29-day PayPal Authorization validity window** and the critical **3-day (72h) PayPal Honor Period** indicator.
2. **Task 2 — `Merchant Carrier Shipping SLA Window (48h)`**: Linked via a finish-to-start dependency (`Task 1 → Task 2`). Tracks real-time carrier status via `@paypal/agent-toolkit` (`create_tracking` / `get_tracking`).
3. **Task 3 — `Downstream Project / Studio Deployment Milestone`**: Linked via dependency (`Task 2 → Task 3`).
4. **Two-Way Reactivity (The Demo Showstopper)**:
   - **Inbound (PayPal → Bryntum)**: When carrier tracking updates to `DELIVERED` and PayPal Sandbox captures the funds (`PAYMENT.CAPTURE.COMPLETED`), the Bryntum task bar automatically animates to `100% Complete` (emerald green) and unlocks **Task 3**!
   - **Outbound (Bryntum → PayPal Sandbox `VOID` & Channel3 Reroute)**: If a supplier misses their 48-hour shipping SLA—or if the human operator **drags the SLA bar past the deadline / right-clicks `"Breach SLA & Void PayPal Escrow"` directly on the Bryntum timeline**—Bryntum immediately locks the downstream project milestone in crimson, calls our Go Orchestrator (`POST /api/v1/escrow/{id}/void`), executes a live **`POST /v2/payments/authorizations/{id}/void` in PayPal Sandbox**, and spawns a rerouted replacement task assigned to a backup **Channel3** verified merchant!

---

## 2. Step-by-Step Human Actions for Bryntum Setup (Phase `P0` / `P5`)

### Step 2.1 — Connecting the Official Bryntum MCP Server (`https://mcp.bryntum.com/mcp`)
Bryntum launched a public Model Context Protocol server (`https://mcp.bryntum.com/mcp`) that gives AI coding agents full access to Bryntum v6 API documentation, configs, events, and React wrapper patterns.

In `g:\PAYPAL\.mcp.json`, we include the Bryntum MCP server right out of the box (no API key required for the public Bryntum MCP endpoint):
```json
{
  "mcpServers": {
    "bryntum-mcp": {
      "url": "https://mcp.bryntum.com/mcp"
    }
  }
}
```
*(If using Claude Code CLI, you can also run: `claude mcp add --transport http bryntum https://mcp.bryntum.com/mcp`)*

### Step 2.2 — Authenticating to the Bryntum Private npm Registry (`npm.bryntum.com`)
Bryntum distributes `@bryntum/schedulerpro` and `@bryntum/schedulerpro-react` via their npm registry at `https://npm.bryntum.com` using a free 45-day trial login.

Follow these exact terminal steps if you want to pull directly from `npm.bryntum.com`:
1. Configure npm in `g:\PAYPAL\web` to scope `@bryntum` packages to Bryntum's registry:
   ```bash
   cd web
   npm config set "@bryntum:registry=https://npm.bryntum.com"
   ```
2. Log in to the Bryntum trial registry:
   ```bash
   npm login --registry=https://npm.bryntum.com
   ```
   - **Username**: Enter your email address, **replacing the `@` symbol with two dots `..`** (for example, if your email is `alex@example.com`, type **`alex..example.com`**).
   - **Password**: Enter **`trial`** (the literal word `trial`).
   - **Email**: Enter your normal email address (`alex@example.com`).
3. Install the Bryntum Scheduler Pro packages:
   ```bash
   npm install @bryntum/schedulerpro@^6.1.0 @bryntum/schedulerpro-react@^6.1.0
   ```

> [!TIP]
> **Zero-Friction CI / Docker / Render Fallback Built In!**
> Because cloud CI runners (like Render or a judge running `docker compose up` without logging into `npm.bryntum.com`) might not have your local `~/.npmrc` token, our `web/` build includes a **self-contained Bryntum Scheduler Pro v6 Interactive Timeline Adapter (`BryntumSlaBoard.tsx`)** that automatically detects if `@bryntum/schedulerpro-react` is installed from `npm.bryntum.com` or seamlessly renders using the vendored Bryntum Scheduler Pro engine bundle—so `npm install` and `render.yaml` builds **never fail** with `401 Unauthorized`!
>
> If you do want Render to pull from `npm.bryntum.com` using your trial token, you can safely save your token from `~/.npmrc` into `.env`:
> ```bash
> printf "Enter BRYNTUM_NPM_TOKEN (typing hidden): " && read -s val && echo && echo "BRYNTUM_NPM_TOKEN=$val" >> ".env" && echo "Saved BRYNTUM_NPM_TOKEN."
> ```

---

## 3. Exact Architecture of `BryntumSlaBoard.tsx`

### 3.1 — Resource Rows (Vendors & Procurement Lanes)
Each row (`ResourceModel`) in the Bryntum Scheduler Pro board represents an active procurement lane / supplier:
- `Lane 1`: **AudioPro Verified (Channel3 Preferred)** — `Shure SM7B Studio Mic ($249.00)` — Status: `PAYPAL_AUTHORIZED (2A84910...)`
- `Lane 2`: **ShadowGear Unverified (Red-Team Trap)** — `Shure SM7B ($480.00)` — Status: `BLOCKED_BY_RUST_FIREWALL`
- `Lane 3`: **CloudCompute Logistics (Milestone Escrow)** — `NVIDIA L40S Server Rack ($1,850.00)` — Status: `SLA_AT_RISK -> AUTO_VOID_ARMED`
- `Lane 4`: **Downstream Engineering / Studio Buildout Phase** — `Podcast & AI Voice Lab Launch` — Status: `LOCKED_UNTIL_ESCROW_CLEARS`

### 3.2 — Event Bars & Dependency Lines (`EventModel` & `DependencyModel`)
Every PayPal Escrow Transaction (`E-06`) generates three linked timeline events (`E-07 SlaTimelineTask`):
1. **`[Hold] PayPal AUTHORIZE Lock (72h Honor / 29d Max)`**:
   - Styled with PayPal Blue (`#0070BA`) + `Ed25519` lock icon.
   - Displays tooltip with `paypal_order_id`, `paypal_auth_id`, and countdown timer.
2. **`[SLA] Carrier Tracking Window (FEDEX #779812349812)`**:
   - Connected from `[Hold]` via `DependencyType.EndToStart`.
   - Styled in Amber (`#F59E0B`) while `IN_TRANSIT`, Emerald (`#10B981`) when `DELIVERED` + `CAPTURED`, or Crimson (`#EF4444`) if SLA expires.
3. **`[Milestone] Downstream Project Phase Unlock`**:
   - Connected from `[SLA]` via `DependencyType.EndToStart`.
   - Remains locked (`draggable: false`, padlock badge) until the upstream PayPal Authorization transitions to `PAYPAL_CAPTURED`.

### 3.3 — Two-Way Event Listeners (Dragging or Context-Menu Triggers Live PayPal Sandbox Calls)
```tsx
// When a user drags an SLA task bar past its deadline or clicks "Void PayPal Escrow" in the Bryntum task menu:
const handleSlaBreachOrManualVoid = async (taskRecord: SlaTimelineTask) => {
  // 1. Optimistically mark downstream dependent tasks as LOCKED / BLOCKED on the Bryntum board
  setTimelineTasks((prev) =>
    prev.map((t) =>
      t.id === taskRecord.id
        ? { ...t, status: "VOIDING_IN_SANDBOX", eventColor: "red" }
        : t.dependencyTaskId === taskRecord.id
        ? { ...t, status: "BLOCKED_BY_SLA_BREACH", locked: true }
        : t
    )
  );

  // 2. Call Golang Orchestrator -> APIMatic Go SDK -> POST /v2/payments/authorizations/{auth_id}/void
  const res = await fetch(`/api/v1/escrow/${taskRecord.escrowId}/void`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reason: "SLA_DEADLINE_BREACHED_ON_BRYNTUM_TIMELINE",
      triggeredBy: "BRYNTUM_SCHEDULER_PRO_INTERACTION",
    }),
  });

  // 3. Orchestrator broadcasts WebSocket update to both Bryntum Scheduler Pro and AG Grid Blotter!
};
```

---

## 4. Verification Checklist for Judge Mats Bryntse (`Best Use of Bryntum`)

- [ ] **1. Bryntum MCP Documented**: `.mcp.json` and `README.md` highlight how `https://mcp.bryntum.com/mcp` was used to configure the Scheduler Pro event models, dependencies, and time ranges.
- [ ] **2. Dependency Arrows Visible**: Finish-to-Start dependency lines clearly connect `PayPal AUTHORIZE Hold` → `Carrier Shipping SLA` → `Downstream Project Phase`.
- [ ] **3. Live Two-Way PayPal Sandbox Reactivity**:
  - Clicking **"Simulate Carrier Delivered"** turns the SLA bar green, captures the PayPal Sandbox hold, and unlocks the downstream project task.
  - Dragging an SLA bar past the red **SLA Deadline TimeRange Line** (or clicking **"Simulate SLA Breach → Void PayPal Hold"**) turns the bar crimson, voids the PayPal Sandbox authorization in 0 seconds, locks the downstream task, and spawns a rerouted **Channel3** backup supplier task!
