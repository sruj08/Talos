import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BryntumSlaBoard } from './BryntumSlaBoard';
import {
  INITIAL_SLA_TASKS,
  TALOS_ESCROW_EVENT,
  broadcastTalosEscrowEvent,
  callEscrowVoidApi,
  formatUsdInr,
} from '../lib/phase6-events';

describe('BryntumSlaBoard (TASK-11)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering & Bryntum Timeline Structure', () => {
    it('should render 48-hour Carrier Shipping SLA bars, 29-day PayPal Authorization Honor Period, and downstream dependencies', () => {
      // Arrange & Act
      const html = renderToStaticMarkup(<BryntumSlaBoard />);

      // Assert
      expect(html).toContain('data-testid="bryntum-sla-board"');
      expect(html).toContain('MCP: https://mcp.bryntum.com/mcp');
      expect(html).toContain('29-Day PayPal Authorization Honor Period (72h Honor / 29d Max)');
      expect(html).toContain('48-Hour Carrier Shipping SLA Bar');
      expect(html).toContain('Phase 1 Hardware Escrow -&gt; Phase 2 Studio Setup -&gt; Phase 3 Production');
      expect(html).toContain('Terminate &amp; Void Escrow');
    });

    it('should render locked crimson downstream phase and Channel3 backup reroute button when task is PAYPAL_VOIDED', () => {
      // Arrange
      const voidedTasks = INITIAL_SLA_TASKS.map((t, idx) =>
        idx === 0 ? { ...t, escrowState: 'PAYPAL_VOIDED' as const, downstreamLocked: true, slaHoursElapsed: 54 } : t
      );

      // Act
      const html = renderToStaticMarkup(<BryntumSlaBoard initialTasks={voidedTasks} />);

      // Assert
      expect(html).toContain('[↩ VOIDED / PAYPAL_VOIDED]');
      expect(html).toContain('[✖ LOCKED IN CRIMSON: SLA BREACH ROLLBACK]');
      expect(html).toContain('Reroute via Channel3 Backup');
    });
  });

  describe('Two-Way Payment Binding (POST /api/v1/escrow/{id}/void & AG Grid Sync)', () => {
    it('should call POST /api/v1/escrow/{id}/void and return PAYPAL_VOIDED when SLA bar expires or is dragged past deadline', async () => {
      // Arrange
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          escrow_id: 'esc-903-scarlett',
          state: 'PAYPAL_VOIDED',
          paypal_auth_id: '2A883120944556677',
          voided_at: '2026-11-04T12:00:00Z',
        }),
      });
      vi.stubGlobal('fetch', fetchSpy);

      // Act
      const result = await callEscrowVoidApi(
        'esc-903-scarlett',
        'task-scarlett-02',
        'BRYNTUM_SLA_BAR_DRAGGED_PAST_DEADLINE'
      );

      // Assert
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/v1/escrow/esc-903-scarlett/void',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'PayPal-Request-Id': 'void-esc-903-scarlett',
          }),
        })
      );
      expect(result.state).toEqual('PAYPAL_VOIDED');
      expect(result.paypalAuthId).toEqual('2A883120944556677');
    });

    it('should format dual USD and INR currency strings accurately', () => {
      expect(formatUsdInr(24900)).toEqual('$249.00 (₹20,916)');
      expect(formatUsdInr(45000)).toEqual('$450.00 (₹37,800)');
    });
  });
});
