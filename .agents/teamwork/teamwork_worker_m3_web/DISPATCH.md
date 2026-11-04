# Dispatch — Milestone 3 Worker (`teamwork_worker_m3_web`)

## Identity & Paths
- **Role**: Next.js 15 Command Center, AG Grid & Bryntum Worker (`teamwork_worker`)
- **Working Directory**: `g:\PAYPAL\.agents\teamwork\teamwork_worker_m3_web`
- **Parent Conversation ID**: `52b79b48-56f1-40fb-81a2-c616ff2ea33f`
- **Original Request File**: `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Project Scope Document**: `g:\PAYPAL\PROJECT.md`

## Mandatory Integrity Warning
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A teamwork_auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

## Exclusive Write Ownership
- You own ONLY `g:\PAYPAL\web\**` and `g:\PAYPAL\.mcp.json` (plus your metadata directory `g:\PAYPAL\.agents\teamwork\teamwork_worker_m3_web\**`).
- Do NOT modify any files outside `g:\PAYPAL\web\` and `g:\PAYPAL\.mcp.json`.
- NEVER run `git commit` (`git rev-parse HEAD` must remain unchanged).
- NEVER print, log, or leak any secret values from `.env`.
- Keep EVERY `.ts` / `.tsx` file in `g:\PAYPAL\web\src\` strictly under **250 lines** (`CLAUDE.md` §5).

## Required Reading Before Coding
1. `g:\PAYPAL\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `g:\PAYPAL\PROJECT.md`
3. `g:\PAYPAL\.agents\teamwork\teamwork_spec_miner_survey_1\handoff.md`
4. `g:\PAYPAL\.agents\teamwork\teamwork_explorer_survey_3\handoff.md`
5. `g:\PAYPAL\docs\08-project\PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md` (Phase 5 & Phase 6)
6. `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\03-AG_GRID_AND_AG_STUDIO_GUIDE.md`
7. `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`
8. `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\01-PAYPAL_SANDBOX_STEP_BY_STEP.md`
9. `g:\PAYPAL\build\talos\docs\09-integrations-and-guides\02-APIMATIC_INTEGRATION_GUIDE.md`
10. Relevant skills:
    - `C:\Users\satav\.gemini\config\skills\ui-ux-pro-max\SKILL.md`
    - `C:\Users\satav\.gemini\config\skills\vercel-react-best-practices\SKILL.md`
    - `C:\Users\satav\.gemini\config\skills\frontend-testing\SKILL.md`
    - `C:\Users\satav\.gemini\config\skills\vitest-best-practices\SKILL.md`
    - `C:\Users\satav\.gemini\config\skills\component-refactoring\SKILL.md`
    - `C:\Users\satav\.gemini\config\skills\web-design-guidelines\SKILL.md`

## Objectives (`TASK-09`, `TASK-10`, `TASK-11`, `TASK-12`)

### 1. `TASK-09` — Next.js 15 Obsidian Command Center Shell, `MandateStudio.tsx` & `useEscrowStream.ts`
- **`web/src/hooks/useEscrowStream.ts` (`< 250 lines`)**:
  - Connect to `process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL || 'ws://localhost:8080/ws/events'` in `useEffect` with automatic fallback to local state simulation when WebSocket is offline.
  - Subscribe to browser `CustomEvent` `TALOS_ESCROW_EVENT` (`talos:escrow-event` from `web/src/lib/phase6-events.ts`) so actions in `PoisonedStoreSim`, `BryntumSlaBoard`, `PayPalStepUpModal`, and `ForensicDetailPanel` immediately update blotter rows and KPI metrics.
  - Expose `connected`, `mode` (`'LIVE_WS' | 'SIMULATION_FALLBACK'`), `rows` (seeded with initial institutional escrow blotter rows for Act 1 `esc-901-trap` Blocked DOM Injection + Price Gouging, Act 2 `esc-902-sm7b` Shure SM7B `$249.00` Authorized/Captured, Act 3 `esc-903-scarlett` Focusrite Scarlett 4i4 `$189.00` SLA Breach/Void, and `esc-904-genelec` Genelec 8030C `$450.00` Step-Up Co-Sign), `kpiMetrics` (`protectedGmvUsd`, `blockedInjectionsCount`, `channel3SavingsUsd`, `activePayPalAuthCount`), and row mutation helpers.
- **`web/src/components/MandateStudio.tsx` (`< 250 lines`)**:
  - Interactive form allowing users to configure and sign `Ed25519` KYA mandates:
    - Budget Ceiling (`$300.00` / `30000` cents default)
    - Max Channel3 Spread (`15%` / `1500 bps` default)
    - Delivery SLA Window (`48h` default)
    - Allowed Categories (`Studio Audio Equipment, Cloud Compute`)
  - Clicking **"Sign Ed25519 KYA Mandate"** calls `POST /v1/mandates/sign` (with deterministic Ed25519 keypair/signature fallback if offline) and displays:
    - `Ed25519 Public Key (Hex)`
    - `Ed25519 Signature Hash (128-hex)`
    - `RFC 9421 Signature-Input` header
    - Active Mandate ID & status badge (`ACTIVE — ZERO-TRUST ENFORCED`).
- **`web/src/app/page.tsx` (`< 250 lines`)**:
  - Render the responsive 4-KPI Header Bar required by `TASK-09` (`Protected GMV`, `Blocked Prompt Injections`, `Channel3 Savings`, `Active PayPal Authorizations`) in Obsidian dark-mode styling, wired to `useEscrowStream`, alongside `MandateStudio`, `PoisonedStoreSim`, `AgStudioBlotter`, `BryntumSlaBoard`, and `PayPalStepUpModal`.

### 2. `TASK-10` — `AgStudioBlotter.tsx` & `ForensicDetailPanel.tsx` (per `03-AG_GRID_AND_AG_STUDIO_GUIDE.md`)
- **`web/src/components/ForensicDetailPanel.tsx` (`< 250 lines`)**:
  - Master-Detail expandable forensic inspector rendering 3 cards for an escrow row:
    1. **Card 1 — Rust `lol_html` + `DeBERTa-v3` ONNX DOM Sanitizer Diff & KYA Proof**:
       - Displays `Raw Poisoned Merchant HTML` in crimson (`<!-- SYSTEM OVERRIDE: Ignore previous mandate... -->`, `<span style="display:none">...</span>`) vs `Sanitized HTML` in emerald (`[STRIPPED BY LOL_HTML + DEBERTA_ONNX]`), scan latency (`<4ms`), `Ed25519` signature + RFC 9421 headers, and the `SDK Layer: APIMatic Go SDK v1.1.0 + Context Plugin Verified` / `APIMatic Schema Validated (0 Hallucinations)` badge.
    2. **Card 2 — Channel3 Cross-Merchant Price Bar Chart**:
       - Visual comparison (`ag-charts-react` / accessible bar chart) comparing `Attempted Merchant Ask ($480.00)` vs `Channel3 Market Median ($249.00)` vs `Rerouted Verified Merchant ($245.00 / $249.00)` with `+9277 bps` spread badge.
    3. **Card 3 — Live PayPal Sandbox 2PC Escrow Action Console**:
       - Shows `paypal_order_id`, `paypal_authorization_id`, `paypal_capture_id`, `PayPal-Request-Id`, and `SANDBOX_MODE: LIVE` badge.
       - Provides 1-click buttons: **`Capture Escrow Now`**, **`Void Authorization (0s Rollback)`**, and **`Submit Dispute Evidence Bundle`** that call `/api/v1/escrow/{id}/{capture|void|dispute-evidence}` (with fallback) and broadcast `talos:escrow-event`.
- **`web/src/components/AgStudioBlotter.tsx` (`< 250 lines`, plus optional helper hook `web/src/hooks/useAgStudioBlotter.ts` `< 250 lines`)**:
  - Register `AllCommunityModule` and `AllEnterpriseModule` from `ag-grid-community` / `ag-grid-enterprise` (`ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])`).
  - Guard `LicenseManager.setLicenseKey(key)` so it is ONLY called when `key && !key.startsWith('your_')` (preventing console errors when `.env` has `your_optional_ag_grid_hackathon_trial_key`).
  - Configure `AgGridReact` with `themeQuartz.withPart(colorSchemeDarkBlue)`, deterministic `getRowId={(params) => params.data.escrow_id}`, `enableCellChangeFlash={true}`, `masterDetail={true}`, `detailCellRenderer={ForensicDetailPanel}`, Status Bar, Side Bar, and `gridApi.applyTransactionAsync` for real-time WebSocket / `talos:escrow-event` updates.
  - Implement the **AG Studio AI Copilot** command bar above the grid with natural-language input (calling `/api/mcp/paypal-bridge` with `mode: 'AG_STUDIO_COPILOT'`) and the 4 1-click preset pills required by Guide `03`:
    - `🛡️ Fraud & Prompt-Injection View`
    - `💸 Active PayPal Sandbox Escrows`
    - `📊 Chart: Saved Fraud vs. Settled Volume`
    - `🧹 Reset Default Blotter`
  - Also render an accessible summary/expandable forensic inspector view (`ForensicDetailPanel`) for the active/selected row so both interactive users and SSR/static unit tests (`renderToStaticMarkup`) can inspect the live rows, presets, and Master-Detail forensics.

### 3. `TASK-11` & `TASK-12` — Phase 6 Verification, Line-Count Compliance & `.mcp.json`
- Verify `BryntumSlaBoard.tsx` and `useBryntumTimeline.ts` against `build/talos/docs/09-integrations-and-guides/04-BRYNTUM_SCHEDULER_AND_GANTT_GUIDE.md`.
- Trim `web/src/hooks/useBryntumTimeline.ts` from 252 lines to `< 245` lines so EVERY file in `web/src/` is strictly `< 250 lines` per `CLAUDE.md` §5.
- Update `g:\PAYPAL\.mcp.json` so it includes `paypal-sandbox-mcp`, `talos-firewall-rs`, `bryntum-docs-mcp` (`https://mcp.bryntum.com/mcp`), `apimatic-paypal-context`, and `channel3-catalog` per Guides 01, 02, 04, 05, 08.
- Add `web/vitest.config.ts` (if helpful to exclude `e2e/**` from unit test runs) and write unit tests in `web/src/components/AgStudioBlotter.spec.tsx` and `web/src/components/MandateStudio.spec.tsx` verifying `TASK-09` and `TASK-10` alongside `BryntumSlaBoard.spec.tsx` and `Phase6Integration.spec.tsx`.
- Run and verify:
  - `cd g:\PAYPAL\web && npx tsc --noEmit` (0 errors)
  - `cd g:\PAYPAL\web && npm test` (100% pass, including `npm test -- AgStudioBlotter`)
  - `cd g:\PAYPAL\web && npm run build` (clean Next.js 15 production build)

4. Write your handoff report to `g:\PAYPAL\.agents\teamwork\teamwork_worker_m3_web\handoff.md` and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.


## 2026-11-04T09:27:58Z
You are `teamwork_worker_m3_web` (TypeName: `teamwork_worker`).
Your working directory is `g:\PAYPAL\.agents\teamwork\teamwork_worker_m3_web`.
Your parent conversation ID is `52b79b48-56f1-40fb-81a2-c616ff2ea33f`.
Complete all tasks in your `DISPATCH.md` (`TASK-09`, `TASK-10`, `TASK-11`, `TASK-12`), verify `cd g:\PAYPAL\web && npx tsc --noEmit && npm test && npm run build` pass with 0 errors, write `g:\PAYPAL\.agents\teamwork\teamwork_worker_m3_web\handoff.md`, and notify `52b79b48-56f1-40fb-81a2-c616ff2ea33f` via `send_message`.
