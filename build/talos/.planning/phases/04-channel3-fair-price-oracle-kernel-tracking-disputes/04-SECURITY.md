# Phase 4 Security & Threat Mitigation Audit (`04-SECURITY.md`)

## 1. Secret Hygiene (Gate #2 Compliance)
- Verified `.env` presence of `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `APIMATIC_API_KEY`, `CHANNEL3_API_KEY`, and `KERNEL_API_KEY` using silent key existence checks (`PRESENT`/`MISSING` only).
- Zero secret values printed to stdout, test logs, or git history.
- `internal/channel3` and `internal/kernel` read API keys via `os.Getenv` and default to deterministic offline fallback (`CHANNEL3_LIVE_CALLS != "true"`, `KERNEL_LIVE_CALLS != "true"`) unless explicitly enabled, preventing accidental external secret transmission during tests.

## 2. Monetary & Arithmetic Integrity
- Zero `float64` usage in any price, spread, or escrow calculation (`CLAUDE.md` §5).
- Channel3 spread is computed strictly in `int64` basis points (`((listed - median) * 10000) / median`).
- Non-positive prices (`<= 0`) and empty SKU queries are rejected with `400 Bad Request` (`ErrInvalidSKURequest`).

## 3. State-Machine & Webhook Replay Protection
- `POST /api/v1/webhooks/paypal` tracks processed `event_id`s under a mutex and marks replayed webhook deliveries with `"duplicate": true` without re-applying state transitions.
- `POST /api/v1/escrow/{id}/tracking` and `POST /api/v1/escrow/{id}/dispute-evidence` enforce terminal state guards (`409 Conflict` / `TALOS_INVALID_STATE_TRANSITION`) so voided (`PAYPAL_VOIDED`) or firewall-blocked (`BLOCKED_BY_FIREWALL`) escrows cannot be captured or disputed.
