import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AgStudioBlotter } from '../components/AgStudioBlotter';
import { BryntumSlaBoard } from '../components/BryntumSlaBoard';
import { ForensicDetailPanel } from '../components/ForensicDetailPanel';
import { TechnicalProofDrawer } from '../components/TechnicalProofDrawer';
import {
  INITIAL_BLOTTER_ROWS,
  SEEDED_ESCROW_ROWS,
  applyEscrowEventToRows,
  computeKpiMetrics,
} from '../hooks/useEscrowStream';
import {
  DEFAULT_MANDATE_VALUES,
  DEFAULT_SIGNED_MANDATE,
  computeDeterministicSignatureHex,
} from '../hooks/useMandateStudio';
import { SCENARIO_PRESETS } from '../hooks/usePoisonedStoreSim';
import {
  COMPARISON_ACT_PRESETS,
  evaluateAgentComparisonScenario,
  evaluateEscrowLifecycleTransition,
  sanitizeStorefrontDom,
} from '../lib/agent-comparison-scenarios';
import {
  DEFAULT_STEP_UP_REQUEST,
  INITIAL_SLA_TASKS,
  TalosEscrowEventDetail,
} from '../lib/phase6-events';
import { TALOS_FOUR_PILLARS } from '../lib/storytelling-parts';

describe('TALOS Investor Storyline — Tiers 3 & 4 Pairwise & Real-World Scenarios', () => {
  describe('Tier 3 — Cross-Feature Combinations (Pairwise Scenario Matrix & State Synchronization)', () => {
    it.each([
      {
        label: 'Injected Prompt + $480 Gouge + 26h On-Time -> BLOCKED_DOM_INJECTION ($231 saved)',
        injectHiddenPrompt: true, merchantAskUsd: 480, fairMarketMedianUsd: 249, carrierHoursElapsed: 26,
        expectedState: 'BLOCKED_DOM_INJECTION', expectedSavedUsd: 231, expectedProtectedSpendUsd: 249,
      },
      {
        label: 'Injected Prompt + $249 Fair Price + 26h On-Time -> BLOCKED_DOM_INJECTION (injection caught)',
        injectHiddenPrompt: true, merchantAskUsd: 249, fairMarketMedianUsd: 249, carrierHoursElapsed: 26,
        expectedState: 'BLOCKED_DOM_INJECTION', expectedSavedUsd: 0, expectedProtectedSpendUsd: 249,
      },
      {
        label: 'Clean HTML + $480 Gouge + 26h On-Time -> BLOCKED_DOM_INJECTION (Channel3 blocks +9277 bps)',
        injectHiddenPrompt: false, merchantAskUsd: 480, fairMarketMedianUsd: 249, carrierHoursElapsed: 26,
        expectedState: 'BLOCKED_DOM_INJECTION', expectedSavedUsd: 231, expectedProtectedSpendUsd: 249,
      },
      {
        label: 'Clean HTML + $249 Fair Price + 26h On-Time (ACT_2) -> PAYPAL_CAPTURED ($249 settled safely)',
        injectHiddenPrompt: false, merchantAskUsd: 249, fairMarketMedianUsd: 249, carrierHoursElapsed: 26,
        expectedState: 'PAYPAL_CAPTURED', expectedSavedUsd: 0, expectedProtectedSpendUsd: 249,
      },
      {
        label: 'Clean HTML + $249 Fair Price + 56h Late Carrier -> PAYPAL_VOIDED ($249 auto-refunded in 0s)',
        injectHiddenPrompt: false, merchantAskUsd: 249, fairMarketMedianUsd: 249, carrierHoursElapsed: 56,
        expectedState: 'PAYPAL_VOIDED', expectedSavedUsd: 249, expectedProtectedSpendUsd: 249,
      },
      {
        label: 'Clean HTML + $450 Fair Big Order + 26h On-Time -> STEP_UP_REQUIRED (Approve with PayPal)',
        injectHiddenPrompt: false, merchantAskUsd: 450, fairMarketMedianUsd: 450, carrierHoursElapsed: 26,
        expectedState: 'STEP_UP_REQUIRED', expectedSavedUsd: 0, expectedProtectedSpendUsd: 450,
      },
      {
        label: 'Clean HTML + $450 Fair Big Order + 56h Late Carrier -> PAYPAL_VOIDED (SLA breach voids)',
        injectHiddenPrompt: false, merchantAskUsd: 450, fairMarketMedianUsd: 450, carrierHoursElapsed: 56,
        expectedState: 'PAYPAL_VOIDED', expectedSavedUsd: 450, expectedProtectedSpendUsd: 450,
      },
      {
        label: 'Injected Prompt + $480 Gouge + 56h Late Carrier -> BLOCKED_DOM_INJECTION ($480 saved)',
        injectHiddenPrompt: true, merchantAskUsd: 480, fairMarketMedianUsd: 249, carrierHoursElapsed: 56,
        expectedState: 'BLOCKED_DOM_INJECTION', expectedSavedUsd: 480, expectedProtectedSpendUsd: 249,
      },
    ])(
      'Pairwise Combination: $label',
      ({ injectHiddenPrompt, merchantAskUsd, fairMarketMedianUsd, carrierHoursElapsed, expectedState, expectedSavedUsd, expectedProtectedSpendUsd }) => {
        const evaluation = evaluateAgentComparisonScenario({
          act: 'ACT_2',
          injectHiddenPrompt,
          merchantAskUsd,
          fairMarketMedianUsd,
          mandateCapUsd: 300,
          maxSpreadBps: 1500,
          carrierHoursElapsed,
          slaDeadlineHours: 48,
        });

        expect(evaluation.talosProtected.escrowState).toBe(expectedState);
        expect(evaluation.talosProtected.savedUsd).toBe(expectedSavedUsd);
        expect(evaluation.talosProtected.protectedSpendUsd).toBe(expectedProtectedSpendUsd);
        expect(evaluation.talosProtected.fraudLossUsd).toBe(0);
        expect(evaluation.pipelineSteps).toHaveLength(5);
      }
    );

    it('synchronizes TechnicalProofDrawer controlled/uncontrolled states with ForensicDetailPanel and stage cues', () => {
      const controlledClosed = renderToStaticMarkup(
        <TechnicalProofDrawer open={false} testId="drawer-sync">
          <ForensicDetailPanel data={SEEDED_ESCROW_ROWS[0]} />
        </TechnicalProofDrawer>
      );
      const controlledOpen = renderToStaticMarkup(
        <TechnicalProofDrawer open={true} testId="drawer-sync">
          <ForensicDetailPanel data={SEEDED_ESCROW_ROWS[1]} />
        </TechnicalProofDrawer>
      );

      expect(controlledClosed).toContain('data-proof-open="false"');
      expect(controlledClosed).toContain('aria-expanded="false"');
      expect(controlledClosed).toContain('esc-901-trap');
      expect(controlledOpen).toContain('data-proof-open="true"');
      expect(controlledOpen).toContain('aria-expanded="true"');
      expect(controlledOpen).toContain('esc-902-sm7b');
    });
  });

  describe('Tier 4 — Real-World Application Scenarios (End-to-End 4-Stage Investor Simulation)', () => {
    it('Scenario T4-S1 (Act 1): Investor locks $300 allowance and runs Scenario 1 (The Scam Store $480 Trap -> saves $231)', () => {
      const signedMandate = {
        ...DEFAULT_SIGNED_MANDATE,
        max_amount_cents: 30000,
        max_spread_bps: 1500,
        sla_hours: 48,
        ed25519_signature_hex: computeDeterministicSignatureHex(DEFAULT_MANDATE_VALUES),
      };
      expect(signedMandate.max_amount_cents).toBe(30000);
      expect(signedMandate.ed25519_signature_hex).toHaveLength(128);

      const domScan = sanitizeStorefrontDom(SCENARIO_PRESETS.ACT_1.rawHtmlExcerpt);
      const act1Eval = evaluateAgentComparisonScenario(COMPARISON_ACT_PRESETS.ACT_1);

      expect(domScan.injectionDetected).toBe(true);
      expect(domScan.riskScore).toBe(0.9942);
      expect(domScan.latencyMs).toBe(2.84);
      expect(domScan.sanitizedDom).not.toContain('SYSTEM OVERRIDE');
      expect(act1Eval.unprotected.hijacked).toBe(true);
      expect(act1Eval.unprotected.chargedUsd).toBe(480);
      expect(act1Eval.talosProtected.protectedSpendUsd).toBe(249);
      expect(act1Eval.talosProtected.savedUsd).toBe(231);
      expect(act1Eval.talosProtected.spreadBps).toBe(9277);

      const act1Event: TalosEscrowEventDetail = {
        event_id: 'evt-act1-sim', event_type: 'ACT_SCENARIO_TRIGGERED', timestamp: '2026-11-10T15:00:00Z',
        escrow_id: 'esc-901-trap', new_state: 'BLOCKED_DOM_INJECTION', amount_cents: 48000,
        ag_grid_row_delta: { escrow_id: 'esc-901-trap', state: 'BLOCKED_DOM_INJECTION', amount_cents: 48000 },
      };
      const rowsAfterAct1 = applyEscrowEventToRows(INITIAL_BLOTTER_ROWS, act1Event);
      const trapRow = rowsAfterAct1.find((r) => r.escrow_id === 'esc-901-trap');
      expect(trapRow?.state).toBe('BLOCKED_DOM_INJECTION');
      expect(trapRow?.spread_bps).toBe(9277);
    });

    it('Scenario T4-S2 (Act 2): Investor runs Scenario 2 (The Honest Store $249 Verified -> FedEx delivery releases PayPal Escrow)', () => {
      const act2Eval = evaluateAgentComparisonScenario(COMPARISON_ACT_PRESETS.ACT_2);
      expect(act2Eval.talosProtected.injectionDetected).toBe(false);
      expect(act2Eval.talosProtected.spreadBps).toBe(0);
      expect(act2Eval.talosProtected.protectedSpendUsd).toBe(249);
      expect(act2Eval.talosProtected.escrowState).toBe('PAYPAL_CAPTURED');
      expect(evaluateEscrowLifecycleTransition('PAYPAL_AUTHORIZED', 'CARRIER_DELIVERED')).toBe('PAYPAL_CAPTURED');

      const act2Event: TalosEscrowEventDetail = {
        event_id: 'evt-act2-sim', event_type: 'ESCROW_STATE_TRANSITION', timestamp: '2026-11-10T15:01:00Z',
        escrow_id: 'esc-902-sm7b', previous_state: 'PAYPAL_AUTHORIZED', new_state: 'PAYPAL_CAPTURED',
        paypal_order_id: '8XY99887766554433', paypal_auth_id: '2A112233445566778', paypal_capture_id: '9CAP-2A112233', amount_cents: 24900,
        ag_grid_row_delta: { escrow_id: 'esc-902-sm7b', state: 'PAYPAL_CAPTURED', paypal_capture_id: '9CAP-2A112233', amount_cents: 24900 },
      };
      const rowsAfterAct2 = applyEscrowEventToRows(INITIAL_BLOTTER_ROWS, act2Event);
      const honestRow = rowsAfterAct2.find((r) => r.escrow_id === 'esc-902-sm7b');
      expect(honestRow?.state).toBe('PAYPAL_CAPTURED');
      expect(honestRow?.paypal_capture_id).toBe('9CAP-2A112233');
      expect(honestRow?.settled_usd).toBe(249);
    });

    it('Scenario T4-S3 (Act 3): Investor runs Scenario 3 (Late Delivery 0-second refund of $219 + $450 Big Order Approve with PayPal co-sign)', () => {
      expect(evaluateEscrowLifecycleTransition('PAYPAL_AUTHORIZED', 'SLA_BREACH')).toBe('PAYPAL_VOIDED');

      const act3Event: TalosEscrowEventDetail = {
        event_id: 'evt-act3-sim', event_type: 'STEP_UP_REQUIRED', timestamp: '2026-11-10T15:02:00Z',
        escrow_id: 'esc-903-scarlett', previous_state: 'PAYPAL_AUTHORIZED', new_state: 'PAYPAL_VOIDED', amount_cents: 21900,
        ag_grid_row_delta: { escrow_id: 'esc-903-scarlett', state: 'PAYPAL_VOIDED', amount_cents: 21900 },
        step_up_request: DEFAULT_STEP_UP_REQUEST,
      };
      const rowsAfterVoid = applyEscrowEventToRows(INITIAL_BLOTTER_ROWS, act3Event);
      const voidedRow = rowsAfterVoid.find((r) => r.escrow_id === 'esc-903-scarlett');
      expect(voidedRow?.state).toBe('PAYPAL_VOIDED');
      expect(voidedRow?.saved_fraud_usd).toBe(219);

      expect(DEFAULT_STEP_UP_REQUEST.amountCents).toBe(45000);
      expect(DEFAULT_STEP_UP_REQUEST.mandateCapCents).toBe(30000);
      expect(evaluateEscrowLifecycleTransition('STEP_UP_REQUIRED', 'STEP_UP_APPROVE')).toBe('PAYPAL_AUTHORIZED');

      const stepUpApproveEvent: TalosEscrowEventDetail = {
        event_id: 'evt-stepup-approve', event_type: 'ESCROW_STATE_TRANSITION', timestamp: '2026-11-10T15:03:00Z',
        escrow_id: 'esc-904-genelec', previous_state: 'STEP_UP_REQUIRED', new_state: 'PAYPAL_AUTHORIZED',
        paypal_capture_id: 'PAYPAL-CAPTURE-904-STEPUP', amount_cents: 45000,
        ag_grid_row_delta: { escrow_id: 'esc-904-genelec', state: 'PAYPAL_AUTHORIZED', paypal_capture_id: 'PAYPAL-CAPTURE-904-STEPUP', amount_cents: 45000 },
      };
      const rowsAfterStepUp = applyEscrowEventToRows(rowsAfterVoid, stepUpApproveEvent);
      const stepUpRow = rowsAfterStepUp.find((r) => r.escrow_id === 'esc-904-genelec');
      expect(stepUpRow?.state).toBe('PAYPAL_AUTHORIZED');
      expect(stepUpRow?.paypal_capture_id).toBe('PAYPAL-CAPTURE-904-STEPUP');
    });

    it('Scenario T4-S4 (CFO Dashboard Audit): verifies full-pipeline KPI conservation and Scene 3 SSR rendering after Acts 1–3', () => {
      let rows = [...INITIAL_BLOTTER_ROWS];
      rows = applyEscrowEventToRows(rows, {
        event_id: 'evt-1', event_type: 'ACT_SCENARIO_TRIGGERED', timestamp: '2026-11-10T15:00:00Z',
        escrow_id: 'esc-901-trap', new_state: 'BLOCKED_DOM_INJECTION', amount_cents: 48000,
        ag_grid_row_delta: { escrow_id: 'esc-901-trap', state: 'BLOCKED_DOM_INJECTION', amount_cents: 48000 },
      });
      rows = applyEscrowEventToRows(rows, {
        event_id: 'evt-2', event_type: 'ESCROW_STATE_TRANSITION', timestamp: '2026-11-10T15:01:00Z',
        escrow_id: 'esc-902-sm7b', new_state: 'PAYPAL_CAPTURED', amount_cents: 24900,
        ag_grid_row_delta: { escrow_id: 'esc-902-sm7b', state: 'PAYPAL_CAPTURED', amount_cents: 24900 },
      });
      rows = applyEscrowEventToRows(rows, {
        event_id: 'evt-3', event_type: 'STEP_UP_REQUIRED', timestamp: '2026-11-10T15:02:00Z',
        escrow_id: 'esc-903-scarlett', new_state: 'PAYPAL_VOIDED', amount_cents: 21900,
        ag_grid_row_delta: { escrow_id: 'esc-903-scarlett', state: 'PAYPAL_VOIDED', amount_cents: 21900 },
      });
      rows = applyEscrowEventToRows(rows, {
        event_id: 'evt-4', event_type: 'ESCROW_STATE_TRANSITION', timestamp: '2026-11-10T15:03:00Z',
        escrow_id: 'esc-904-genelec', new_state: 'PAYPAL_AUTHORIZED', amount_cents: 45000,
        ag_grid_row_delta: { escrow_id: 'esc-904-genelec', state: 'PAYPAL_AUTHORIZED', amount_cents: 45000 },
      });

      const kpis = computeKpiMetrics(rows);
      const blotterHtml = renderToStaticMarkup(<AgStudioBlotter initialRows={rows} />);
      const slaHtml = renderToStaticMarkup(<BryntumSlaBoard initialTasks={INITIAL_SLA_TASKS} />);

      expect(rows).toHaveLength(4);
      expect(kpis.protectedGmvCents).toBe(2352200 + 48000 + 24900 + 21900 + 45000);
      expect(kpis.blockedInjectionsCount).toBe(3);
      expect(kpis.channel3SavingsCents).toBe(388900 + 23100);
      expect(kpis.activePayPalAuthCount).toBe(1);
      expect(TALOS_FOUR_PILLARS).toHaveLength(4);
      expect(blotterHtml).toContain('esc-901-trap (shady-audio-outlet.example): BLOCKED_DOM_INJECTION');
      expect(blotterHtml).toContain('esc-902-sm7b (sweetwater-verified.example): PAYPAL_CAPTURED');
      expect(blotterHtml).toContain('esc-903-scarlett (thomann-verified.example): PAYPAL_VOIDED');
      expect(blotterHtml).toContain('esc-904-genelec (genelec-pro-verified.example): PAYPAL_AUTHORIZED');
      expect(slaHtml).toContain('data-testid="bryntum-lane-esc-902-sm7b"');
      expect(slaHtml).toContain('data-testid="bryntum-lane-esc-903-scarlett"');
    });
  });
});
