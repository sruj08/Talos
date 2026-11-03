import { describe, expect, it } from 'vitest';
import { buildMandate, DEFAULT_DRAFT } from '@/components/MandateStudio';
import { canonicalMandateJson, signMandateLocally, verifyMandateLocally } from './mandateCrypto';

describe('mandateCrypto', () => {
  const draft = buildMandate(DEFAULT_DRAFT, 1_793_750_400);

  it('serializes the canonical mandate with sorted keys and sorted categories (matches firewall-rs)', () => {
    const json = canonicalMandateJson({ ...draft, allowed_categories: ['electronics', 'audio_equipment'] });
    const keys = Object.keys(JSON.parse(json));
    expect(keys).toEqual([...keys].sort());
    expect(JSON.parse(json).allowed_categories).toEqual(['audio_equipment', 'electronics']);
    expect(json).not.toContain('ed25519_signature_hex');
  });

  it('encodes the TASK-09 defaults: $300 budget, 15% spread, 48h SLA', () => {
    expect(draft.max_amount_cents).toBe(30000);
    expect(draft.max_channel3_spread_bps).toBe(1500);
    expect(draft.sla_hours).toBe(48);
    expect(draft.expires_at_unix).toBe(1_793_750_400 + 24 * 3600);
  });

  it('signs with Ed25519 and verifies; tampering breaks verification', async () => {
    const { mandate, digest } = await signMandateLocally(draft);
    expect(mandate.ed25519_pubkey_hex).toMatch(/^[0-9a-f]{64}$/);
    expect(mandate.ed25519_signature_hex).toMatch(/^[0-9a-f]{128}$/);
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(await verifyMandateLocally(mandate)).toBe(true);
    expect(await verifyMandateLocally({ ...mandate, max_amount_cents: 999_999 })).toBe(false);
  });
});
