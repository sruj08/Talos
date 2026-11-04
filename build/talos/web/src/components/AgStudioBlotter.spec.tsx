import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GridApi } from 'ag-grid-community';
import { AgStudioBlotter, initAgGridEnterprise } from './AgStudioBlotter';
import {
  ForensicDetailPanel,
  executeForensicCapture,
  executeForensicDispute,
  executeForensicVoid,
} from './ForensicDetailPanel';
import {
  applyPresetFilterToRows,
  applyPresetToGridApi,
  runAgStudioCopilotQuery,
} from '../hooks/useAgStudioBlotter';
import { EscrowBlotterRow, SEEDED_ESCROW_ROWS } from '../hooks/useEscrowStream';
import { TalosEscrowEventDetail } from '../lib/phase6-events';

describe('Phase 5 Micro-Chunk 5.2 (TASK-10): AgStudioBlotter & ForensicDetailPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('initAgGridEnterprise License Key Guard', () => {
    it('should skip LicenseManager.setLicenseKey when placeholder key starts with your_', () => {
      // Arrange & Act
      const placeholderApplied = initAgGridEnterprise('your_optional_ag_grid_hackathon_trial_key');
      const emptyApplied = initAgGridEnterprise('');

      // Assert
      expect(placeholderApplied).toBe(false);
      expect(emptyApplied).toBe(false);
    });
  });

  describe('AgStudioBlotter & ForensicDetailPanel Rendering (F-08)', () => {
    it('should render AG Studio Copilot bar, 4 preset pills, 4 seeded escrow rows, and Master-Detail ForensicDetailPanel', () => {
      // Arrange & Act
      const html = renderToStaticMarkup(<AgStudioBlotter />);

      // Assert
      expect(html).toContain('data-testid="ag-studio-blotter"');
      expect(html).toContain('data-testid="ag-studio-copilot-bar"');
      expect(html).toContain('data-testid="preset-fraud-injection"');
      expect(html).toContain('data-testid="preset-active-escrows"');
      expect(html).toContain('data-testid="preset-chart-saved-vs-settled"');
      expect(html).toContain('data-testid="preset-reset-blotter"');
      expect(html).toContain('esc-901-trap');
      expect(html).toContain('esc-902-sm7b');
      expect(html).toContain('esc-903-scarlett');
      expect(html).toContain('esc-904-genelec');
      expect(html).toContain('data-testid="forensic-detail-panel"');
    });

    it('should render all 3 forensic cards (DOM Diff + APIMatic badges, Channel3 Bar Chart, and PayPal Sandbox 2PC Console)', () => {
      // Arrange & Act
      const html = renderToStaticMarkup(<ForensicDetailPanel data={SEEDED_ESCROW_ROWS[0]} />);

      // Assert
      expect(html).toContain('data-testid="forensic-card-dom-diff"');
      expect(html).toContain('[STRIPPED BY LOL_HTML + DEBERTA_ONNX]');
      expect(html).toContain('SDK Layer: APIMatic Go SDK v1.1.0 + Context Plugin Verified');
      expect(html).toContain('APIMatic Schema Validated (0 Hallucinations)');
      expect(html).toContain('data-testid="forensic-card-channel3"');
      expect(html).toContain('+9277 bps');
      expect(html).toContain('Attempted Merchant Ask');
      expect(html).toContain('Channel3 Market Median');
      expect(html).toContain('data-testid="forensic-card-paypal-actions"');
      expect(html).toContain('SANDBOX_MODE: LIVE');
      expect(html).toContain('Capture Escrow Now');
      expect(html).toContain('Void Authorization (0s Rollback)');
      expect(html).toContain('Submit Dispute Evidence Bundle');
    });
  });

  describe('AG Studio 4 Preset Pills & Natural-Language Copilot Queries', () => {
    it('should filter rows and mutate AG Grid column state and integrated charts across all 4 presets', () => {
      // Arrange
      const applyColumnState = vi.fn();
      const setFilterModel = vi.fn();
      const createCrossFilterChart = vi.fn();
      const resetColumnState = vi.fn();
      const mockGridApi = {
        applyColumnState,
        setFilterModel,
        createCrossFilterChart,
        resetColumnState,
      } as unknown as GridApi<EscrowBlotterRow>;

      // Act
      const fraudRows = applyPresetFilterToRows(SEEDED_ESCROW_ROWS, 'FRAUD_INJECTION_VIEW');
      const activeRows = applyPresetFilterToRows(SEEDED_ESCROW_ROWS, 'ACTIVE_PAYPAL_ESCROWS');
      const resFraud = applyPresetToGridApi(mockGridApi, 'FRAUD_INJECTION_VIEW');
      const resActive = applyPresetToGridApi(mockGridApi, 'ACTIVE_PAYPAL_ESCROWS');
      const resChart = applyPresetToGridApi(mockGridApi, 'CHART_SAVED_VS_SETTLED');
      const resReset = applyPresetToGridApi(mockGridApi, 'RESET_DEFAULT_BLOTTER');

      // Assert
      expect(fraudRows).toHaveLength(1);
      expect(fraudRows[0].escrow_id).toEqual('esc-901-trap');
      expect(activeRows.map((r) => r.escrow_id)).toEqual([
        'esc-904-genelec',
        'esc-903-scarlett',
        'esc-902-sm7b',
      ]);
      expect(resFraud.ag_grid_column_state[0].colId).toEqual('firewall_verdict');
      expect(resActive.ag_grid_column_state[1].colId).toEqual('sla_remaining_sec');
      expect(resChart.ag_charts_config?.chartType).toEqual('groupedColumn');
      expect(createCrossFilterChart).toHaveBeenCalledTimes(1);
      expect(resReset.preset).toEqual('RESET_DEFAULT_BLOTTER');
      expect(resetColumnState).toHaveBeenCalledTimes(1);
    });

    it('should invoke POST /api/mcp/paypal-bridge in AG_STUDIO_COPILOT mode and apply returned column state', async () => {
      // Arrange
      const applyColumnState = vi.fn();
      const mockGridApi = { applyColumnState } as unknown as GridApi<EscrowBlotterRow>;
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            mode: 'AG_STUDIO_COPILOT',
            ag_grid_column_state: [
              { colId: 'merchant_domain', rowGroup: true },
              { colId: 'saved_fraud_usd', aggFunc: 'sum', sort: 'desc' },
            ],
            ag_charts_config: { chartType: 'groupedColumn', series: ['saved_fraud_usd', 'settled_usd'] },
          }),
        })
      );

      // Act
      const response = await runAgStudioCopilotQuery(
        'Group by merchant risk and chart saved fraud vs settled PayPal volume',
        mockGridApi
      );

      // Assert
      expect(applyColumnState).toHaveBeenCalledTimes(1);
      expect(response.ag_grid_column_state).toHaveLength(2);
      expect(response.ag_charts_config?.chartType).toEqual('groupedColumn');
    });
  });

  describe('ForensicDetailPanel 1-Click PayPal Sandbox Capture, Void & Dispute Actions', () => {
    it('should execute 1-click Capture, Void, and Dispute actions and broadcast talos:escrow-event', async () => {
      // Arrange
      const dispatchedEvents: TalosEscrowEventDetail[] = [];
      vi.stubGlobal('window', {
        dispatchEvent: (evt: CustomEvent<TalosEscrowEventDetail>) => {
          dispatchedEvents.push(evt.detail);
          return true;
        },
      });
      vi.stubGlobal('document', { querySelector: () => null });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ paypal_capture_id: '9CAP-SM7B-9901', state: 'PAYPAL_CAPTURED' }),
        })
      );

      // Act
      const capRes = await executeForensicCapture(SEEDED_ESCROW_ROWS[1]);
      const voidRes = await executeForensicVoid(SEEDED_ESCROW_ROWS[2]);
      const dispRes = await executeForensicDispute(SEEDED_ESCROW_ROWS[0]);

      // Assert
      expect(capRes.new_state).toEqual('PAYPAL_CAPTURED');
      expect(capRes.paypal_capture_id).toEqual('9CAP-SM7B-9901');
      expect(voidRes.new_state).toEqual('PAYPAL_VOIDED');
      expect(dispRes.action).toEqual('DISPUTE');
      expect(dispRes.dispute_bundle_sha256).toContain('sha256:');
      expect(dispatchedEvents).toHaveLength(2);
      expect(dispatchedEvents[0].new_state).toEqual('PAYPAL_CAPTURED');
      expect(dispatchedEvents[1].new_state).toEqual('PAYPAL_VOIDED');
    });
  });
});
