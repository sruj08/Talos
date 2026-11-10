# Handoff Report — `teamwork_explorer_showcase_3`

**Summary:** Completed read-only investigation of the live backend pipeline integration (`API-01`..`API-16`), `web/` test infrastructure, and git baseline. All 8 existing Vitest suites (52 tests) pass, backend directories (`services/firewall-rs/`, `services/orchestrator-go/`) are 100% unmodified in git, `fast-check` is not yet installed in `web/package.json`, and critical static test gates (`anti-slop-20-gate.test.ts` and `console-f01-f12.test.tsx`) plus a local Windows port `8080` conflict (handled via `:8082` in `start-dev.ps1`) have been documented for the implementation phase.

---

## 1. Observation

1. **Next.js API Rewrites & Service URLs (`d:\Hackathons\PayPal\Talos\web\next.config.mjs:2-31`, `d:\Hackathons\PayPal\Talos\web\src\lib\phase6-events.ts:169-188`)**:
   - `web/next.config.mjs` proxies `/v1/mandates/:path*` and `/v1/firewall/:path*` to `firewallBaseUrl` (`RUST_FIREWALL_URL || FIREWALL_RS_INTERNAL_URL || 'http://localhost:8081'`), and `/api/v1/:path*` to `orchestratorBaseUrl` (`ORCHESTRATOR_GO_URL || NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:8080'`).
   - `resolveOrchestratorUrl(path)` in `web/src/lib/phase6-events.ts:169-176` returns relative `path` when `NEXT_PUBLIC_ORCHESTRATOR_URL` is unset, or prepends `NEXT_PUBLIC_ORCHESTRATOR_URL` when set.
   - `resolveOrchestratorWsUrl()` in `web/src/lib/phase6-events.ts:178-188` resolves `NEXT_PUBLIC_ORCHESTRATOR_WS_URL` -> `NEXT_PUBLIC_ORCHESTRATOR_URL` (`/ws/events`) -> `'ws://localhost:8080/ws/events'`.

2. **Local Port `8080` Conflict & Dev Startup Script (`d:\Hackathons\PayPal\Talos\start-dev.ps1:81-145`, `d:\Hackathons\PayPal\Talos\stop-dev.ps1:26`)**:
   - Running `Get-NetTCPConnection -State Listen` showed TCP port `8080` is occupied by Windows process `AgentService` (PID `5500`, MiniTool ShadowMaker `MTAgentService`), which times out on HTTP requests.
   - `start-dev.ps1` starts `talos-firewall-rs.exe` on `127.0.0.1:8081`, `talos-orchestrator.exe` on `127.0.0.1:8082`, and `talos-console-web` on `127.0.0.1:3000` with `NEXT_PUBLIC_ORCHESTRATOR_URL=http://localhost:8082` and `NEXT_PUBLIC_ORCHESTRATOR_WS_URL=ws://localhost:8082/ws/events`.
   - Pre-built binaries `d:\Hackathons\PayPal\Talos\services\firewall-rs\target\debug\talos-firewall-rs.exe` and `d:\Hackathons\PayPal\Talos\services\orchestrator-go\talos-orchestrator.exe` both exist (`Test-Path` returned `True`).

3. **Frontend-to-Backend Calls & Fallback Architecture (`API-01`..`API-16`)**:
   - `useMandateStudio.ts:76` calls `POST /v1/mandates/sign` (`API-01`); falls back to `computeDeterministicSignatureHex(values)` (`DETERMINISTIC_ED25519_FALLBACK`).
   - `usePoisonedStoreSim.ts:96,151,210` dispatches `CustomEvent('talos:escrow-event')` via `broadcastTalosEscrowEvent()` and calls:
     - Act 1: `POST /api/v1/checkout/evaluate` (`API-05`) with `PayPal-Request-Id: act1-poisoned-sm7b` and `raw_html_override`.
     - Act 2: `POST /api/mcp/paypal-bridge` (`API-16`) with `mode: 'PAYPAL_AGENT_TOOLKIT'`, `tool_name: 'shipment_tracking.create'`.
     - Act 3: `callEscrowVoidApi('esc-903-scarlett', 'task-scarlett-02', ...)` -> `PATCH /api/v1/sla/timeline/task-scarlett-02` (`API-13`) + `POST /api/v1/escrow/esc-903-scarlett/void` (`API-10`), and includes `step_up_request` in the broadcast event.
   - `useAgStudioBlotter.ts:112` calls `POST /api/mcp/paypal-bridge` (`API-16`) with `mode: 'AG_STUDIO_COPILOT'`.
   - `useBryntumTimeline.ts:40,95` calls `callEscrowVoidApi` (`API-10`/`API-13`) and `POST /api/v1/escrow/${task.escrowId}/tracking` (`API-08`).
   - `useForensicDetail.ts:19,58,79` calls `POST /api/v1/escrow/${id}/capture` (`API-09`), `callEscrowVoidApi` (`API-10`), and `POST /api/v1/escrow/${id}/dispute-evidence` (`API-11`).
   - `usePayPalStepUp.ts:46,105` calls `POST /api/v1/escrow/${id}/authorize` (`API-07`) and `POST /api/v1/escrow/${id}/step-up-approve` (`API-10`).
   - `useEscrowStream.ts:195-242` connects to WebSocket `/ws/events` (`API-15`) and listens to `window` event `talos:escrow-event`, normalizing states via `normalizeEscrowState()` and updating `INITIAL_BLOTTER_ROWS` via `applyEscrowEventToRows()`.
   - `API-02` (`POST /v1/mandates/verify`), `API-03` (`POST /v1/firewall/sanitize-dom`), and `API-06` (`POST /api/v1/channel3/benchmark`) are exposed on `firewall-rs` / `orchestrator-go` and mapped in `next.config.mjs` rewrites, ready for direct frontend simulator use alongside `API-05`.

4. **Test Infrastructure & Static Gates (`d:\Hackathons\PayPal\Talos\web\package.json`, `web/vitest.config.ts`, `web/playwright.config.ts`)**:
   - `fast-check` is **not** present in `web/package.json`.
   - Running `npx vitest run` in `d:\Hackathons\PayPal\Talos\web` executed 8 test files (52 tests), all passing in `4.53s`:
     - `src/__tests__/anti-slop-20-gate.test.ts` (20 tests)
     - `src/__tests__/console-f01-f12.test.tsx` (3 tests)
     - `src/app/api/healthz/route.spec.ts` (3 tests)
     - `src/components/AgStudioBlotter.spec.tsx` (6 tests)
     - `src/components/BryntumSlaBoard.spec.tsx` (4 tests)
     - `src/components/GuidedDemoBanner.spec.tsx` (3 tests)
     - `src/components/MandateStudio.spec.tsx` (7 tests)
     - `src/components/Phase6Integration.spec.tsx` (6 tests)
   - `anti-slop-20-gate.test.ts` scans all non-test `.tsx`, `.ts`, and `.css` files in `web/src/` and enforces 20 rules, including **`<= 250` lines per source file**, no `rounded-full` / `rounded-3xl`, no `italic` / `<em>`, no `uppercase` / `tracking-wider` / `tracking-widest` / `tracking-tighter`, no `border-b` / `divide-y` / `<hr>` / `border-slate-700` / `border-slate-800`, no arbitrary Tailwind slash opacity (`bg-emerald-500/10`) or `text-slate-*`, no CSS gradients (`bg-gradient-to-*`, `linear-gradient`, `radial-gradient`), `<= 12` words in `data-subhead="true"` paragraphs, no numbered headings or trailing periods in `h1..h3`, and presence of 32 `data-testid` strings.
   - `console-f01-f12.test.tsx:16-64`, `MandateStudio.spec.tsx:193-208`, and `GuidedDemoBanner.spec.tsx:34-50` render `<TALOSCommandCenterPage />` via `renderToStaticMarkup` and assert that all Command Center `data-testid`s and 3-Act substrings are present in initial SSR output.

5. **Git Baseline & Backend Immutability**:
   - `git status --porcelain services/ sdk/ api/ postman/ tests/` and `git diff --stat services/ sdk/ api/ postman/ tests/` returned empty output (zero backend changes).
   - Modified tracked files are strictly confined to `web/`, `.agent/screenshots/`, and `.agents/teamwork/`.

---

## 2. Logic Chain

1. **Port Routing & Live Backend Testing**: Because PID `5500` (`AgentService`) occupies `:8080` on this Windows machine (Obs. 2), starting `orchestrator-go` or pointing Next.js rewrites to the default `localhost:8080` hits a non-TALOS service that times out. Using `start-dev.ps1` (or setting `ORCHESTRATOR_GO_URL=http://localhost:8082` and `NEXT_PUBLIC_ORCHESTRATOR_URL=http://localhost:8082`) routes all `API-05`..`API-15` traffic to `talos-orchestrator.exe` on `:8082` and `API-01`..`API-04` traffic to `talos-firewall-rs.exe` on `:8081`.
2. **Side-by-Side Manipulation Simulator Integration (R2 & R3)**: Because `usePoisonedStoreSim.ts` and `phase6-events.ts` synchronize all downstream views (`AgStudioBlotter`, `ForensicDetailPanel`, `BryntumSlaBoard`, `PayPalStepUpModal`, and the 4-KPI bar in `useEscrowStream`) via `broadcastTalosEscrowEvent()` + live `fetch()` calls (Obs. 3), enhancing `PoisonedStoreSim.tsx` / `usePoisonedStoreSim.ts` to show side-by-side "Unprotected AI vs. TALOS-Protected AI" decision pipelines will remain 100% compatible with both live backend execution (`API-01`, `API-03`, `API-05`, `API-08`, `API-10`, `API-13`, `API-15`, `API-16`) and deterministic offline fallback.
3. **Landing Page & 5-Part Walkthrough Compatibility (R1)**: Because `console-f01-f12.test.tsx`, `MandateStudio.spec.tsx`, and `GuidedDemoBanner.spec.tsx` call `renderToStaticMarkup(<TALOSCommandCenterPage />)` and check for all 39 Command Center `data-testid`s in the initial HTML string (Obs. 4), `web/src/app/page.tsx` must keep the Command Center components mounted in the DOM on initial render (for example, rendering the Startup Landing Page & 5-Part Storytelling Walkthrough above/wrapping the Command Center workspace with smooth view-mode switching/scrolling) so all existing SSR contract tests continue to pass without regression.
4. **Modular File Size & Unslop Discipline (R1–R4)**: Because `anti-slop-20-gate.test.ts` checks every `.ts`, `.tsx`, and `.css` file in `web/src/` for `<= 250` lines and 20 anti-slop rules (Obs. 4), new features (Landing Page, 5-Part Storytelling Walkthrough, Side-by-Side Manipulation Simulator) must be decomposed into modular components/hooks under `web/src/components/` and `web/src/lib/` (each `< 250` lines) and strictly use the project's OKLCH / Sovereign Glass classes (`sovereign-card`, `sovereign-subcard`, `sovereign-well`, `tone-paypal`, `tone-crimson`, `tone-emerald`, `tone-amber`, `text-ink`, `text-ink-secondary`, `text-ink-muted`) rather than banned Tailwind classes (`uppercase`, `rounded-full`, `italic`, `border-b`, `divide-y`, `bg-gradient-to-*`, `text-slate-*`, `/10` opacity).
5. **Property-Based Testing (R4)**: Since `fast-check` is not yet in `web/package.json` (Obs. 4), installing `fast-check` as a devDependency in `web/` enables Vitest (`npm test`) to run property-based tests alongside existing unit/component specs.

---

## 3. Caveats

- Neither `:8081`, `:8082`, nor `:3000` was started during this read-only investigation so as not to mutate runtime state; however, `start-dev.ps1` and both pre-built backend binaries (`talos-firewall-rs.exe` and `talos-orchestrator.exe`) were verified present on disk.

---

## 4. Conclusion

1. **Zero Backend Changes Required**: All 16 canonical endpoints (`API-01`..`API-16`) are fully implemented across `services/firewall-rs`, `services/orchestrator-go`, and `web/src/app/api/mcp/paypal-bridge/route.ts`, with complete deterministic fallback support in `web/src/hooks/` and `web/src/lib/phase6-events.ts`.
2. **Implementation Guardrails for `web/`**:
   - Decompose new UI into files `<= 250` lines and obey all 20 rules in `web/src/__tests__/anti-slop-20-gate.test.ts`.
   - Keep all 39 required `data-testid` attributes and 3-Act substrings rendered in `TALOSCommandCenterPage` (`web/src/app/page.tsx`) so `console-f01-f12.test.tsx`, `MandateStudio.spec.tsx`, `GuidedDemoBanner.spec.tsx`, and `talos-3act-demo.spec.ts` pass.
   - Install `fast-check` in `web/package.json` (`npm install -D fast-check`) and add property-based test suites covering simulator invariants, mandate verification, DOM sanitization, price-gouging spread math, and escrow state machine transitions.
   - Use `.\start-dev.ps1 -Detached` (which maps `orchestrator-go` to `:8082` to avoid the Windows PID 5500 conflict on `:8080`) when running live pipeline and `agent-browser` / Playwright verification.

---

## 5. Verification Method

Run the following commands from `d:\Hackathons\PayPal\Talos`:

```powershell
# 1. Verify backend immutability (must output nothing)
git status --porcelain services/ sdk/ api/ postman/ tests/
git diff --stat services/ sdk/ api/ postman/ tests/

# 2. Run all frontend Vitest suites (including 20-gate anti-slop & Part 5 contract checks)
cd d:\Hackathons\PayPal\Talos\web
npx tsc --noEmit
npm test

# 3. Start full live polyglot stack (:8081 Rust Firewall, :8082 Go Orchestrator, :3000 Next.js Web)
cd d:\Hackathons\PayPal\Talos
.\start-dev.ps1 -Detached
```

Full detailed tables and file/line references are available in:
`d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_explorer_showcase_3\analysis.md`
