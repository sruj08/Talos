import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_MANDATE_VALUES,
  MandateStudio,
  computeDeterministicSignatureHex,
  signKyaMandateRequest,
} from './MandateStudio';
import {
  SEEDED_ESCROW_ROWS,
  applyEscrowEventToRows,
  computeKpiMetrics,
  normalizeEscrowState,
} from '../hooks/useEscrowStream';
import TALOSCommandCenterPage from '../app/page';

describe('Phase 5 Micro-Chunk 5.1 (TASK-09): MandateStudio, useEscrowStream & 4-KPI Header Bar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('MandateStudio (Ed25519 Know-Your-Agent Mandate Studio — F-01)', () => {
    it('should render KYA mandate form inputs, Ed25519 public key, 128-hex signature, and RFC 9421 header', () => {
      // Arrange & Act
      const html = renderToStaticMarkup(<MandateStudio />);

      // Assert
      expect(html).toContain('data-testid="mandate-studio"');
      expect(html).toContain('ACTIVE — ZERO-TRUST ENFORCED');
      expect(html).toContain('data-testid="input-mandate-budget"');
      expect(html).toContain('value="300.00"');
      expect(html).toContain('Max Channel3 Spread (15% / 1500 bps)');
      expect(html).toContain('Delivery SLA Window (48h)');
      expect(html).toContain('Studio Audio Equipment, Cloud Compute');
      expect(html).toContain('data-testid="mandate-pubkey-hex"');
      expect(html).toContain('data-testid="mandate-signature-hex"');
      expect(html).toContain('data-testid="mandate-rfc9421-header"');
      expect(html).toContain('alg=&quot;ed25519&quot;');
    });

    it('should sign KYA mandate via POST /v1/mandates/sign when Rust firewall endpoint responds', async () => {
      // Arrange
      const customSig = 'a'.repeat(128);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            mandate_id: 'mandate-live-999',
            ed25519_pubkey_hex: '8f92a1d4c5e6b70891a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6c40b',
            ed25519_signature_hex: customSig,
            rfc9421_signature_input: 'sig1=("@method" "@target-uri");alg="ed25519"',
          }),
        })
      );

      // Act
      const signed = await signKyaMandateRequest({
        ...DEFAULT_MANDATE_VALUES,
        maxAmountCents: 35000,
      });

      // Assert
      expect(signed.signing_mode).toEqual('LIVE_RUST_FIREWALL');
      expect(signed.mandate_id).toEqual('mandate-live-999');
      expect(signed.max_amount_cents).toEqual(35000);
      expect(signed.ed25519_signature_hex).toHaveLength(128);
      expect(signed.status).toEqual('ACTIVE — ZERO-TRUST ENFORCED');
    });

    it('should deterministically compute a 128-hex Ed25519 signature fallback when offline', async () => {
      // Arrange
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Firewall offline')));

      // Act
      const signedDefault = await signKyaMandateRequest(DEFAULT_MANDATE_VALUES);
      const signedUpdated = await signKyaMandateRequest({
        ...DEFAULT_MANDATE_VALUES,
        maxAmountCents: 45000,
        maxSpreadBps: 1200,
      });

      // Assert
      expect(signedDefault.signing_mode).toEqual('DETERMINISTIC_ED25519_FALLBACK');
      expect(signedDefault.ed25519_signature_hex).toHaveLength(128);
      expect(signedUpdated.ed25519_signature_hex).toHaveLength(128);
      expect(signedUpdated.ed25519_signature_hex).not.toEqual(signedDefault.ed25519_signature_hex);
      expect(computeDeterministicSignatureHex(DEFAULT_MANDATE_VALUES)).toEqual(
        signedDefault.ed25519_signature_hex
      );
    });
  });

  describe('useEscrowStream KPI Telemetry & State Transitions', () => {
    it('should compute accurate Protected GMV, Blocked Prompt Injections, Channel3 Savings, and Active PayPal Authorizations', () => {
      // Arrange & Act
      const metrics = computeKpiMetrics(SEEDED_ESCROW_ROWS);

      // Assert
      expect(metrics.protectedGmvCents).toBeGreaterThanOrEqual(2400000);
      expect(metrics.protectedGmvUsd).toContain('$');
      expect(metrics.blockedInjectionsCount).toBeGreaterThanOrEqual(3);
      expect(metrics.channel3SavingsCents).toBeGreaterThanOrEqual(400000);
      expect(metrics.activePayPalAuthCount).toEqual(2);
    });

    it('should transition escrow row states on ESCROW_STATE_TRANSITION events', () => {
      // Arrange & Act
      const afterCapture = applyEscrowEventToRows(SEEDED_ESCROW_ROWS, {
        event_id: 'evt-cap-1',
        event_type: 'ESCROW_STATE_TRANSITION',
        timestamp: '2026-11-04T12:00:00Z',
        escrow_id: 'esc-902-sm7b',
        new_state: 'PAYPAL_CAPTURED',
        ag_grid_row_delta: { escrow_id: 'esc-902-sm7b', state: 'PAYPAL_CAPTURED', amount_cents: 24900 },
      });

      const afterVoid = applyEscrowEventToRows(afterCapture, {
        event_id: 'evt-void-1',
        event_type: 'ESCROW_STATE_TRANSITION',
        timestamp: '2026-11-04T12:01:00Z',
        escrow_id: 'esc-903-scarlett',
        new_state: 'PAYPAL_VOIDED',
        ag_grid_row_delta: { escrow_id: 'esc-903-scarlett', state: 'PAYPAL_VOIDED', amount_cents: 21900 },
      });

      // Assert
      const capturedRow = afterVoid.find((r) => r.escrow_id === 'esc-902-sm7b');
      const voidedRow = afterVoid.find((r) => r.escrow_id === 'esc-903-scarlett');
      expect(capturedRow?.state).toEqual('PAYPAL_CAPTURED');
      expect(capturedRow?.settled_usd).toEqual(249);
      expect(voidedRow?.state).toEqual('PAYPAL_VOIDED');
      expect(voidedRow?.saved_fraud_usd).toEqual(219);
    });

    it('should normalize Go orchestrator ws.EventMessage payload envelopes without wiping existing row states or duplicating Act 1 rows', () => {
      // Arrange & Act
      expect(normalizeEscrowState('BLOCKED_FIREWALL')).toEqual('BLOCKED_DOM_INJECTION');
      expect(normalizeEscrowState('BLOCKED_PRICE_GOUGING')).toEqual('BLOCKED_DOM_INJECTION');
      expect(normalizeEscrowState('TRACKING_VERIFIED')).toEqual('PAYPAL_CAPTURED');
      expect(normalizeEscrowState('INITIATED')).toBeUndefined();

      const afterWsEnvelope = applyEscrowEventToRows(SEEDED_ESCROW_ROWS, {
        event_id: 'evt-init-001',
        event_type: 'ESCROW_STATE_TRANSITION',
        timestamp: '2026-11-04T12:00:00Z',
        escrow_id: 'esc-902-sm7b',
        new_state: undefined as unknown as 'PAYPAL_AUTHORIZED',
        ag_grid_row_delta: undefined as unknown as { escrow_id: string; state: 'PAYPAL_AUTHORIZED' },
        payload: {
          state: 'PAYPAL_AUTHORIZED',
          paypal_order_id: '8XY99887766554433',
          paypal_auth_id: '2A112233445566778',
          amount_cents: 24900,
        },
      });
      const afterAct1Ws = applyEscrowEventToRows(afterWsEnvelope, {
        event_id: 'evt-act1-ws',
        event_type: 'ESCROW_STATE_TRANSITION',
        timestamp: '2026-11-04T12:00:02Z',
        escrow_id: '0192e8a0-4138-7000-8000-0a8e783c4720',
        new_state: undefined as unknown as 'BLOCKED_DOM_INJECTION',
        ag_grid_row_delta: undefined as unknown as { escrow_id: string; state: 'BLOCKED_DOM_INJECTION' },
        payload: {
          escrow_id: '0192e8a0-4138-7000-8000-0a8e783c4720',
          paypal_request_id: 'act1-poisoned-sm7b',
          state: 'BLOCKED_FIREWALL',
          amount_cents: 48000,
        },
      });
      const afterEmptyEnvelope = applyEscrowEventToRows(afterAct1Ws, {
        event_id: 'evt-ping-002',
        event_type: 'ESCROW_STATE_TRANSITION',
        timestamp: '2026-11-04T12:00:05Z',
        escrow_id: 'esc-903-scarlett',
        new_state: undefined as unknown as 'PAYPAL_AUTHORIZED',
        ag_grid_row_delta: undefined as unknown as { escrow_id: string; state: 'PAYPAL_AUTHORIZED' },
        payload: {},
      });

      // Assert
      expect(afterEmptyEnvelope).toHaveLength(4);
      expect(afterEmptyEnvelope[0].escrow_id).toEqual('esc-901-trap');
      expect(afterEmptyEnvelope[0].state).toEqual('BLOCKED_DOM_INJECTION');
      const metrics = computeKpiMetrics(afterEmptyEnvelope);
      expect(metrics.activePayPalAuthCount).toEqual(2);
      expect(metrics.blockedInjectionsCount).toEqual(3);
    });
  });

  describe('TALOSCommandCenterPage (4-KPI Header Bar + Obsidian Shell)', () => {
    it('should render the 4-KPI Header Bar and all 5 Command Center workspaces', () => {
      // Arrange & Act
      const html = renderToStaticMarkup(<TALOSCommandCenterPage />);

      // Assert
      expect(html).toContain('data-testid="kpi-header-bar"');
      expect(html).toContain('Protected GMV');
      expect(html).toContain('Blocked Prompt Injections');
      expect(html).toContain('Channel3 Savings');
      expect(html).toContain('Active PayPal Authorizations');
      expect(html).toContain('data-testid="mandate-studio"');
      expect(html).toContain('data-testid="poisoned-store-sim"');
      expect(html).toContain('data-testid="ag-studio-blotter"');
      expect(html).toContain('data-testid="bryntum-sla-board"');
      expect(html).toContain('data-testid="paypal-step-up-modal"');
    });
  });
});
