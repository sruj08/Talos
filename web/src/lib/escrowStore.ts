// Pure state helpers shared by useEscrowStream and the blotter (unit-tested in escrowStore.test.ts).
import { BLOCKED_STATES, HELD_STATES } from './format';
import type { EscrowRow, EscrowState, EscrowWsEvent, Kpis } from './types';

const DEFAULTS: Omit<EscrowRow, 'id'> = {
  escrow_id: '',
  mandate_id: '',
  agent_id: '',
  merchant_url: '',
  merchant_name: '',
  merchant_risk: 'MEDIUM',
  sku_query: '',
  amount_cents: 0,
  currency_code: 'USD',
  state: 'INITIATED',
  created_at: '',
  updated_at: '',
};

function riskFor(row: Partial<EscrowRow>): EscrowRow['merchant_risk'] {
  if (row.merchant_risk) return row.merchant_risk;
  if (row.state && BLOCKED_STATES.has(row.state)) return 'HIGH';
  if ((row.spread_bps ?? 0) > 1500) return 'HIGH';
  return (row.spread_bps ?? 0) > 500 ? 'MEDIUM' : 'LOW';
}

function hostOf(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** Normalizes a partial backend EscrowEntry into a complete grid row. */
export function normalizeRow(raw: Partial<EscrowRow>, existing?: EscrowRow): EscrowRow {
  const id = raw.id ?? raw.escrow_id ?? existing?.id ?? '';
  const merged = { ...DEFAULTS, ...existing, ...stripUndefined(raw), id } as EscrowRow;
  merged.escrow_id ||= id;
  merged.merchant_name ||= hostOf(merged.merchant_url) || 'Unknown merchant';
  merged.merchant_risk = riskFor({ ...merged, merchant_risk: raw.merchant_risk ?? existing?.merchant_risk });
  if (merged.spread_bps == null && merged.channel3_median_cents && merged.amount_cents) {
    merged.spread_bps = Math.round(
      ((merged.amount_cents - merged.channel3_median_cents) * 10000) / merged.channel3_median_cents,
    );
  }
  return merged;
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as Partial<T>;
}

/** Applies one orchestrator WS frame to the row map; returns the touched row (or null if ignored). */
export function applyEvent(rows: Map<string, EscrowRow>, evt: EscrowWsEvent): EscrowRow | null {
  const id = evt.ag_grid_row_delta?.id ?? evt.escrow_id;
  if (!id) return null;
  const state = (evt.new_state || evt.current_state || evt.ag_grid_row_delta?.state) as EscrowState | undefined;
  const delta: Partial<EscrowRow> = {
    ...evt.ag_grid_row_delta,
    id,
    ...(state ? { state } : {}),
    ...(evt.paypal_order_id ? { paypal_order_id: evt.paypal_order_id } : {}),
    updated_at: evt.timestamp || new Date().toISOString(),
  };
  const row = normalizeRow(delta, rows.get(id));
  rows.set(id, row);
  return row;
}

export interface RowDiff {
  add: EscrowRow[];
  update: EscrowRow[];
  remove: EscrowRow[];
}

/** Computes an AG Grid transaction between two snapshots, by object identity. */
export function diffRows(prev: Map<string, EscrowRow>, next: EscrowRow[]): RowDiff {
  const add: EscrowRow[] = [];
  const update: EscrowRow[] = [];
  const seen = new Set<string>();
  for (const row of next) {
    seen.add(row.id);
    const old = prev.get(row.id);
    if (!old) add.push(row);
    else if (old !== row) update.push(row);
  }
  const remove = [...prev.values()].filter((r) => !seen.has(r.id));
  return { add, update, remove };
}

export function computeKpis(rows: Iterable<EscrowRow>): Kpis {
  const k: Kpis = {
    protectedGmvCents: 0,
    attacksBlocked: 0,
    channel3SavingsCents: 0,
    activeAuthorizations: 0,
    heldCents: 0,
    capturedCents: 0,
  };
  for (const r of rows) {
    if (BLOCKED_STATES.has(r.state)) {
      k.attacksBlocked += 1;
      k.protectedGmvCents += r.amount_cents;
      if (r.state === 'BLOCKED_PRICE_GOUGING' && r.channel3_median_cents) {
        k.channel3SavingsCents += Math.max(0, r.amount_cents - r.channel3_median_cents);
      }
    }
    if (HELD_STATES.has(r.state)) {
      k.activeAuthorizations += 1;
      k.heldCents += r.amount_cents;
      k.protectedGmvCents += r.amount_cents;
    }
    if (r.state === 'PAYPAL_CAPTURED') {
      k.capturedCents += r.amount_cents;
      k.protectedGmvCents += r.amount_cents;
    }
  }
  return k;
}
