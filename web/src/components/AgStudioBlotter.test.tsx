import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { GridApi } from 'ag-grid-community';
import { seedSimRows } from '@/lib/escrowSim';
import type { EscrowRow } from '@/lib/types';
import { AgStudioBlotter } from './AgStudioBlotter';

// jsdom has no canvas: replace the AG Charts React wrapper with a probe.
vi.mock('ag-charts-react', () => ({ AgCharts: () => <div data-testid="ag-chart" /> }));

async function renderBlotter(rows: EscrowRow[], onRowPatch = vi.fn()) {
  let api: GridApi<EscrowRow> | undefined;
  const utils = render(
    <AgStudioBlotter rows={rows} status="simulated" onRowPatch={onRowPatch} onGridApi={(a) => (api = a)} suppressVirtualisation />,
  );
  await waitFor(() => expect(api).toBeDefined());
  await act(async () => api!.flushAsyncTransactions());
  return { ...utils, api: api!, onRowPatch };
}

const leafCount = (api: GridApi<EscrowRow>) => {
  let n = 0;
  api.forEachNodeAfterFilter((node) => {
    if (!node.group) n += 1;
  });
  return n;
};

describe('AgStudioBlotter', () => {
  it('renders live escrow rows with status badges', async () => {
    const rows = seedSimRows(8);
    const { api } = await renderBlotter(rows);
    expect(api.getDisplayedRowCount()).toBeGreaterThanOrEqual(8);
    await waitFor(() => expect(screen.getAllByText('BLOCKED: DOM_INJECTION').length).toBeGreaterThan(0));
    expect(screen.getAllByText('AUTHORIZED_ESCROW').length).toBeGreaterThan(0);
  });

  it('applies streamed updates in place via applyTransactionAsync', async () => {
    const rows = seedSimRows(4);
    const { api, rerender } = await renderBlotter(rows);
    const target = rows.find((r) => r.state === 'PAYPAL_AUTHORIZED')!;
    const next = rows.map((r) => (r.id === target.id ? { ...r, state: 'PAYPAL_CAPTURED' as const } : r));
    rerender(<AgStudioBlotter rows={next} status="simulated" suppressVirtualisation />);
    await act(async () => api.flushAsyncTransactions());
    expect(api.getRowNode(target.id)?.data?.state).toBe('PAYPAL_CAPTURED');
    expect(leafCount(api)).toBe(4);
  });

  it('executes AG Studio Copilot natural-language filters and grouping', async () => {
    const rows = seedSimRows(12);
    const { api } = await renderBlotter(rows);
    fireEvent.click(screen.getByRole('button', { name: /^Only captured over \$200/ }));
    await waitFor(() => expect(screen.getByTestId('copilot-log').textContent).toMatch(/only PAYPAL_CAPTURED/));
    const expected = rows.filter((r) => r.state === 'PAYPAL_CAPTURED' && r.amount_cents > 20000).length;
    expect(leafCount(api)).toBe(expected);

    fireEvent.change(screen.getByLabelText(/ask ag studio copilot/i), {
      target: { value: 'reset' },
    });
    fireEvent.submit(screen.getByRole('search'));
    await waitFor(() => expect(leafCount(api)).toBe(12));

    fireEvent.change(screen.getByLabelText(/ask ag studio copilot/i), {
      target: { value: 'group by merchant risk, filter out prompt-injection attacks' },
    });
    fireEvent.submit(screen.getByRole('search'));
    await waitFor(() => expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['merchant_risk']));
    expect(leafCount(api)).toBe(rows.filter((r) => r.state !== 'BLOCKED_FIREWALL' && r.state !== 'BLOCKED_PRICE_GOUGING').length);
  });

  it('expands the Master-Detail forensic drawer with DOM diff, chart and Sandbox actions', async () => {
    const rows = seedSimRows(6);
    const blocked = rows.find((r) => r.state === 'BLOCKED_FIREWALL')!;
    const authorized = rows.find((r) => r.state === 'PAYPAL_AUTHORIZED')!;
    const { api, onRowPatch } = await renderBlotter(rows);

    await act(async () => api.getRowNode(blocked.id)?.setExpanded(true));
    const panel = await screen.findByTestId(`forensic-${blocked.id}`);
    expect(panel.querySelectorAll('.diff .removed').length).toBeGreaterThan(0);
    expect(panel.textContent).toMatch(/SYSTEM OVERRIDE/);
    expect(panel.querySelector('[data-testid="ag-chart"]')).not.toBeNull();
    expect((panel.querySelector('button.btn-emerald') as HTMLButtonElement).disabled).toBe(true);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await act(async () => api.getRowNode(authorized.id)?.setExpanded(true));
    const authPanel = await screen.findByTestId(`forensic-${authorized.id}`);
    const capture = authPanel.querySelector('button.btn-emerald') as HTMLButtonElement;
    expect(capture.disabled).toBe(false);
    fireEvent.click(capture);
    await waitFor(() => expect(onRowPatch).toHaveBeenCalledWith(authorized.id, expect.objectContaining({ state: 'PAYPAL_CAPTURED' })));
    expect(authPanel.textContent).toMatch(/Sandbox Replay/);
    vi.unstubAllGlobals();
  });
});
