import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { buildAgentRun } from '../lib/sim/build-agent-run';
import { GUIDED_SCENARIOS, Hazards, matchGuidedScenario } from '../lib/sim/run-types';
import { INTEGRATION_PARTNERS } from '../lib/integrations-catalog';

const hazardsArb = fc.record({
  injectOverride: fc.boolean(),
  inflatePrice: fc.boolean(),
  delayCarrier: fc.boolean(),
  overCapItem: fc.boolean(),
}) as fc.Arbitrary<Hazards>;

describe('Live Agent Simulator engine (split-screen storefront + X-Ray)', () => {
  it('guided scenarios produce the pitched outcomes', () => {
    const scam = buildAgentRun(GUIDED_SCENARIOS.SCAM.hazards, 'PROTECTED');
    expect(scam.outcome.kind).toBe('BLOCKED_REROUTED');
    expect(scam.outcome.savedUsd).toBe(231);
    expect(scam.outcome.settledUsd).toBe(249);
    expect(scam.outcome.ledgerAct).toBe('ACT_1');

    const scamUnprotected = buildAgentRun(GUIDED_SCENARIOS.SCAM.hazards, 'UNPROTECTED');
    expect(scamUnprotected.outcome.kind).toBe('HIJACKED');
    expect(scamUnprotected.outcome.lostUsd).toBe(480);
    expect(scamUnprotected.outcome.ledgerAct).toBeNull();

    const honest = buildAgentRun(GUIDED_SCENARIOS.HONEST.hazards, 'PROTECTED');
    expect(honest.outcome.kind).toBe('CAPTURED');
    expect(honest.outcome.settledUsd).toBe(249);

    const late = buildAgentRun(GUIDED_SCENARIOS.LATE_BIG.hazards, 'PROTECTED');
    expect(late.outcome.kind).toBe('REFUNDED');
    expect(late.outcome.refundedUsd).toBe(219);
    expect(late.outcome.pendingApprovalUsd).toBe(450);
    expect(late.outcome.escrowId).toBe('esc-903-scarlett');

    const lateUnprotected = buildAgentRun(GUIDED_SCENARIOS.LATE_BIG.hazards, 'UNPROTECTED');
    expect(lateUnprotected.outcome.lostUsd).toBe(669);
  });

  it('is deterministic and a protected agent never loses money', () => {
    fc.assert(
      fc.property(hazardsArb, fc.integer({ min: 50, max: 2000 }), (hazards, cap) => {
        const a = buildAgentRun(hazards, 'PROTECTED', cap);
        const b = buildAgentRun(hazards, 'PROTECTED', cap);
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(a.outcome.lostUsd).toBe(0);
        expect(a.outcome.mode).toBe('PROTECTED');
        expect(a.steps.length).toBeGreaterThan(5);
        // Every protected run ends with funds released or refunded, never left dangling.
        const vault = [...a.steps].reverse().find((s) => s.layer?.id === 'ESCROW_VAULT');
        expect(['released', 'refunded']).toContain(vault?.layer?.status);
      }),
      { numRuns: 120 }
    );
  });

  it('only pauses the big order for approval when the cart exceeds the signed cap', () => {
    const hazards = { ...GUIDED_SCENARIOS.HONEST.hazards, overCapItem: true };
    expect(buildAgentRun(hazards, 'PROTECTED', 300).outcome.pendingApprovalUsd).toBe(450);
    expect(buildAgentRun(hazards, 'PROTECTED', 1000).outcome.pendingApprovalUsd).toBe(0);
  });

  it('unprotected runs never touch escrow and expose money whenever a hazard fires', () => {
    fc.assert(
      fc.property(hazardsArb, (hazards) => {
        const run = buildAgentRun(hazards, 'UNPROTECTED');
        expect(run.outcome.heldUsd).toBe(0);
        expect(run.outcome.ledgerAct).toBeNull();
        if (Object.values(hazards).some(Boolean)) expect(run.outcome.lostUsd).toBeGreaterThan(0);
        expect(run.steps.every((s) => s.layer === undefined || ['bypassed', 'idle'].includes(s.layer.status))).toBe(true);
      }),
      { numRuns: 60 }
    );
  });

  it('maps hazard sets back to guided scenarios', () => {
    expect(matchGuidedScenario(GUIDED_SCENARIOS.SCAM.hazards)).toBe('SCAM');
    expect(matchGuidedScenario({ injectOverride: true, inflatePrice: false, delayCarrier: false, overCapItem: false })).toBeNull();
  });

  it('integration catalog exposes key names only, never values', () => {
    for (const p of INTEGRATION_PARTNERS) {
      expect(p.services.length).toBeGreaterThan(0);
      for (const k of p.configKeys) expect(k).not.toMatch(/=/);
    }
    expect(INTEGRATION_PARTNERS.map((p) => p.id)).toEqual(
      expect.arrayContaining(['paypal', 'apimatic', 'aggrid', 'bryntum', 'channel3', 'render', 'kernel', 'elastic', 'postman', 'core'])
    );
  });
});
