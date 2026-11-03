import { describe, expect, it } from 'vitest';
import { applyEvent, computeKpis, diffRows, normalizeRow } from './escrowStore';
import { makeSimRow, nextSimEvent, seedSimRows } from './escrowSim';
import type { EscrowRow } from './types';

describe('normalizeRow', () => {
  it('fills defaults, derives merchant name, risk and spread from a backend EscrowEntry', () => {
    const r = normalizeRow({
      id: 'ESC-1',
      merchant_url: 'https://shop.example/sku',
      amount_cents: 48000,
      channel3_median_cents: 24900,
      state: 'BLOCKED_PRICE_GOUGING',
    });
    expect(r.merchant_name).toBe('shop.example');
    expect(r.spread_bps).toBe(9277);
    expect(r.merchant_risk).toBe('HIGH');
    expect(r.escrow_id).toBe('ESC-1');
  });
});

describe('applyEvent', () => {
  it('merges an ESCROW_STATE_TRANSITION frame into the existing row', () => {
    const seed = makeSimRow(0);
    const rows = new Map<string, EscrowRow>([[seed.id, seed]]);
    const before = seed;
    const touched = applyEvent(rows, {
      event_type: 'ESCROW_STATE_TRANSITION',
      event_id: 'e1',
      timestamp: '2026-11-03T10:00:00Z',
      escrow_id: before.id,
      previous_state: before.state,
      new_state: 'PAYPAL_CAPTURED',
    });
    expect(touched?.state).toBe('PAYPAL_CAPTURED');
    expect(touched?.merchant_name).toBe(before.merchant_name);
    expect(rows.get(before.id)).not.toBe(before);
  });

  it('ignores frames without an escrow id', () => {
    expect(applyEvent(new Map(), { event_type: 'PING', event_id: 'x', timestamp: '', escrow_id: '' })).toBeNull();
  });
});

describe('diffRows', () => {
  it('splits add / update / remove by identity', () => {
    const [a, b, c] = seedSimRows(3);
    const prev = new Map([a, b].map((r) => [r.id, r]));
    const b2 = { ...b, state: 'PAYPAL_VOIDED' as const };
    const tx = diffRows(prev, [b2, c]);
    expect(tx.add.map((r) => r.id)).toEqual([c.id]);
    expect(tx.update.map((r) => r.id)).toEqual([b.id]);
    expect(tx.remove.map((r) => r.id)).toEqual([a.id]);
  });
});

describe('computeKpis', () => {
  it('aggregates blocked, held and captured exposure', () => {
    const rows = seedSimRows(12);
    const k = computeKpis(rows);
    expect(k.attacksBlocked).toBe(rows.filter((r) => r.state.startsWith('BLOCKED')).length);
    expect(k.activeAuthorizations).toBeGreaterThan(0);
    expect(k.channel3SavingsCents).toBeGreaterThan(0);
    expect(k.protectedGmvCents).toBeGreaterThanOrEqual(k.heldCents + k.capturedCents);
  });
});

describe('escrowSim', () => {
  it('is deterministic for the same seed', () => {
    expect(seedSimRows(4, 7)).toEqual(seedSimRows(4, 7));
  });

  it('emits WS-shaped transition frames', () => {
    const rows = seedSimRows(6);
    const evt = nextSimEvent(rows, 1);
    expect(evt.event_type).toBe('ESCROW_STATE_TRANSITION');
    expect(evt.ag_grid_row_delta?.id).toBe(evt.escrow_id);
  });
});
