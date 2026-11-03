---
phase: 05-nextjs-command-center-ag-grid-blotter
plan: 01
subsystem: web-command-center
tags: [nextjs-15, react-19, ed25519, webcrypto, websocket, sandbox-replay]
Completed: 2026-11-03
---

# Phase 5 Plan 01 Summary — Command Center Shell, KYA Mandate Studio & Live WebSocket Store (`TASK-09`)

**Status:** Complete (`TASK-09: DONE`)

## Implemented
- **Shell** (`CommandCenter.tsx`, `layout.tsx`, `page.tsx`, `globals.css`): dark obsidian layout using `DESIGN_SYSTEM.md` tokens, a live connection pill (`LIVE · /ws/events` or `SANDBOX REPLAY`), a live event feed, and placeholders for the Phase 6 modules. The AG Grid blotter is loaded client-only via `next/dynamic`.
- **KPI header** (`KpiHeader.tsx`): Protected GMV, Blocked Prompt Injections, Channel3 Savings, Active PayPal Authorizations (+ held / captured totals). In live mode it merges the server's `attacks_blocked_count` and `channel3_savings_cents`.
- **KYA Mandate Studio** (`MandateStudio.tsx`): budget, spread %, SLA, TTL, agent and category controls (defaults $300 / 15% / 48h). Signs via `POST {FIREWALL_URL}/v1/mandates/sign`. If that fails it signs with WebCrypto Ed25519 over the same canonical digest as `firewall-rs` `canonical_mandate_digest`, then verifies the signature locally. Shows the public key, signature, SHA-256 digest, latency and which path signed it.
- **Live store** (`useEscrowStream.ts`, `lib/escrowStore.ts`): hydrates from API-12, subscribes to API-15 (including `RECENT_EVENTS_SNAPSHOT`), merges `ag_grid_row_delta` frames, and provides `patchRow` for optimistic Sandbox actions. If the socket hasn't opened within 2.5 s, or it errors or closes, the store switches to the deterministic replay (`lib/escrowSim.ts`).
- **API client** (`lib/api.ts`): timeouts, RFC 7807 problem mapping, and a unique `PayPal-Request-Id` per capture / void / dispute.

## Verification
- `npx tsc --noEmit`: 0 errors. `npm run build`: compiled successfully (`/` 18.8 kB, 122 kB first load).
- `npm test`: `MandateStudio` (3), `mandateCrypto` (3) and `escrowStore` (7) suites pass.
- Live check against `go run ./cmd/server`: the stream pill shows `live`, blotter rows hydrate from API-12, and a new `/api/v1/checkout/evaluate` escrow arrived over `/ws/events` without a reload.
- Offline check: with no backend the UI enters Sandbox Replay. Mandate signing falls back to WebCrypto and the signature verifies.

## Notes
- Gate #3 keys (`NEXT_PUBLIC_AG_GRID_LICENSE_KEY`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`) are still unset. AG Grid runs in evaluation mode (watermark), and the PayPal client ID is only needed in Phase 6.
