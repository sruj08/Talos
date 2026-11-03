// Runtime endpoints. All are public, non-secret NEXT_PUBLIC_* values with local-dev defaults.

const trimSlash = (u: string) => u.replace(/\/+$/, '');

export const ORCHESTRATOR_URL = trimSlash(
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? 'http://localhost:8080',
);

export const FIREWALL_URL = trimSlash(process.env.NEXT_PUBLIC_FIREWALL_URL ?? 'http://localhost:8081');

export const WS_EVENTS_URL =
  process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL ?? `${ORCHESTRATOR_URL.replace(/^http/, 'ws')}/ws/events`;

export const AG_GRID_LICENSE_KEY = process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY ?? '';

/** Mirrors TALOS_SANDBOX_FALLBACK_ENABLED: when the backend is unreachable the UI replays a deterministic simulation. */
export const SANDBOX_FALLBACK_ENABLED = process.env.NEXT_PUBLIC_TALOS_SANDBOX_FALLBACK_ENABLED !== 'false';

/** Milliseconds to wait for the WebSocket to open before switching to the local simulation. */
export const WS_CONNECT_TIMEOUT_MS = 2500;
