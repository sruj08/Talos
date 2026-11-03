'use client';
// Live escrow store: hydrates from API-12 (blotter), subscribes to API-15 (/ws/events), and falls
// back to the deterministic Sandbox Replay simulation when the orchestrator is unreachable.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchBlotter } from '@/lib/api';
import { SANDBOX_FALLBACK_ENABLED, WS_CONNECT_TIMEOUT_MS, WS_EVENTS_URL } from '@/lib/config';
import { nextSimEvent, seedSimRows } from '@/lib/escrowSim';
import { applyEvent, computeKpis, normalizeRow } from '@/lib/escrowStore';
import type { EscrowRow, EscrowWsEvent, Kpis, StreamStatus } from '@/lib/types';

export interface EscrowStream {
  rows: EscrowRow[];
  status: StreamStatus;
  kpis: Kpis;
  lastEvent: EscrowWsEvent | null;
  eventCount: number;
  /** Optimistically merges a local patch (e.g. after a Sandbox capture/void). */
  patchRow: (id: string, patch: Partial<EscrowRow>) => void;
}

export interface EscrowStreamOptions {
  wsUrl?: string;
  simIntervalMs?: number;
  /** Skip network entirely (tests, storybook, offline demos). */
  forceSimulation?: boolean;
}

export function useEscrowStream(opts: EscrowStreamOptions = {}): EscrowStream {
  const { wsUrl = WS_EVENTS_URL, simIntervalMs = 4000, forceSimulation = false } = opts;
  const store = useRef(new Map<string, EscrowRow>());
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState<StreamStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<EscrowWsEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [serverTotals, setServerTotals] = useState<{ savings: number; attacks: number } | null>(null);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const ingest = useCallback(
    (evt: EscrowWsEvent) => {
      if (evt.event_type === 'RECENT_EVENTS_SNAPSHOT') {
        evt.recent_events?.forEach((e) => applyEvent(store.current, e));
      } else if (!applyEvent(store.current, evt)) {
        return;
      }
      setLastEvent(evt);
      setEventCount((c) => c + 1);
      bump();
    },
    [bump],
  );

  useEffect(() => {
    let disposed = false;
    let ws: WebSocket | null = null;
    let simTimer: ReturnType<typeof setInterval> | undefined;
    let tick = 0;

    const startSimulation = () => {
      if (disposed || simTimer || !SANDBOX_FALLBACK_ENABLED) return;
      if (store.current.size === 0) seedSimRows().forEach((r) => store.current.set(r.id, r));
      setStatus('simulated');
      bump();
      simTimer = setInterval(() => {
        tick += 1;
        ingest(nextSimEvent([...store.current.values()], tick));
      }, simIntervalMs);
    };

    if (forceSimulation || typeof WebSocket === 'undefined') {
      startSimulation();
      return () => {
        disposed = true;
        clearInterval(simTimer);
      };
    }

    const fallbackTimer = setTimeout(startSimulation, WS_CONNECT_TIMEOUT_MS);

    fetchBlotter()
      .then((b) => {
        if (disposed) return;
        b.rows.forEach((raw) => {
          const row = normalizeRow(raw, store.current.get(raw.id ?? raw.escrow_id ?? ''));
          store.current.set(row.id, row);
        });
        setServerTotals({ savings: b.channel3_savings_cents, attacks: b.attacks_blocked_count });
        bump();
      })
      .catch(() => undefined);

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        clearTimeout(fallbackTimer);
        if (!disposed) setStatus('live');
      };
      ws.onmessage = (m) => {
        try {
          ingest(JSON.parse(String(m.data)) as EscrowWsEvent);
        } catch {
          /* non-JSON keepalive frame */
        }
      };
      ws.onerror = () => startSimulation();
      ws.onclose = () => startSimulation();
    } catch {
      startSimulation();
    }

    return () => {
      disposed = true;
      clearTimeout(fallbackTimer);
      clearInterval(simTimer);
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, [wsUrl, simIntervalMs, forceSimulation, ingest, bump]);

  const patchRow = useCallback(
    (id: string, patch: Partial<EscrowRow>) => {
      const existing = store.current.get(id);
      if (!existing) return;
      store.current.set(id, normalizeRow({ ...patch, id, updated_at: new Date().toISOString() }, existing));
      bump();
    },
    [bump],
  );

  // `version` invalidates the memo whenever the mutable store changes.
  const rows = useMemo(() => [...store.current.values()], [version]); // eslint-disable-line react-hooks/exhaustive-deps

  const kpis = useMemo(() => {
    const k = computeKpis(rows);
    if (serverTotals && status === 'live') {
      k.channel3SavingsCents = Math.max(k.channel3SavingsCents, serverTotals.savings);
      k.attacksBlocked = Math.max(k.attacksBlocked, serverTotals.attacks);
    }
    return k;
  }, [rows, serverTotals, status]);

  return { rows, status, kpis, lastEvent, eventCount, patchRow };
}
