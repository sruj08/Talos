'use client';

import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { BarChart3, Download, Lock, RotateCcw, ShieldAlert, Sparkles, Table2 } from 'lucide-react';
import { EscrowBlotterRow } from '../hooks/useEscrowStream';
import { AgStudioPresetId, BlotterStatusTab, useAgStudioBlotter } from '../hooks/useAgStudioBlotter';
import { ForensicDetailPanel } from './ForensicDetailPanel';
import { formatUsdInr } from '../lib/phase6-events';
import {
  DEFAULT_COL_DEF,
  GRID_SIDE_BAR,
  GRID_STATUS_BAR,
  ROW_GROUP_PANEL_SHOW,
  getEscrowRowId,
  initAgGridEnterprise,
  talosDarkTheme,
  talosLightTheme,
} from '../lib/ag-grid-theme';

export { DEFAULT_COL_DEF, GRID_SIDE_BAR, GRID_STATUS_BAR, getEscrowRowId, initAgGridEnterprise, talosDarkTheme, talosLightTheme };

const STATUS_TABS: BlotterStatusTab[] = ['ALL', 'BLOCKED', 'CLEARED', 'PENDING_HITL', 'PAYPAL_VOIDED'];
const PRESET_BUTTONS: Array<{
  id: AgStudioPresetId;
  testId: string;
  label: string;
  activeClass: string;
  Icon: typeof ShieldAlert;
  iconClass: string;
}> = [
  { id: 'FRAUD_INJECTION_VIEW', testId: 'preset-fraud-injection', label: 'Fraud & Prompt-Injection View', activeClass: 'btn-sovereign-crimson', Icon: ShieldAlert, iconClass: 'text-ink-crimson' },
  { id: 'ACTIVE_PAYPAL_ESCROWS', testId: 'preset-active-escrows', label: 'Active PayPal Sandbox Escrows', activeClass: 'btn-paypal-primary', Icon: Lock, iconClass: 'text-ink-paypal' },
  { id: 'CHART_SAVED_VS_SETTLED', testId: 'preset-chart-saved-vs-settled', label: 'Chart: Saved Fraud vs Settled Volume', activeClass: 'btn-sovereign-emerald', Icon: BarChart3, iconClass: 'text-ink-emerald' },
  { id: 'RESET_DEFAULT_BLOTTER', testId: 'preset-reset-blotter', label: 'Reset Default Blotter', activeClass: 'btn-sovereign-neutral', Icon: RotateCcw, iconClass: 'text-ink-secondary' },
];

export interface AgStudioBlotterProps {
  initialRows?: EscrowBlotterRow[];
}

export function AgStudioBlotter({ initialRows }: AgStudioBlotterProps = {}) {
  const {
    visibleRows, selectedRow, selectedEscrowId, setSelectedEscrowId, activePreset,
    statusTab, setStatusTab, quickFilter, setQuickFilter, copilotQuery, setCopilotQuery,
    copilotStatus, showChartSummary, colDefs, theme, onGridReady, handlePresetClick,
    handleCopilotSubmit, handleExportCsv, updateRowState,
  } = useAgStudioBlotter(initialRows);

  return (
    <section
      id="chapter-blotter"
      className="sovereign-card p-6 space-y-5"
      data-testid="ag-studio-blotter"
      aria-label="Escrow Settlement Ledger"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-medium text-ink">Escrow Settlement Ledger</h2>
          <p data-subhead="true" className="text-xs text-ink-secondary mt-1">
            Streaming AG Grid v33 ledger, Master-Detail forensics, and AG Studio Copilot
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-secondary">
          <span data-testid="blotter-group-summary" className="inline-flex items-center gap-2 font-medium">
            <Table2 className="w-4 h-4 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
            <span>Grouped by firewall_verdict (AG Grid v33 Enterprise)</span>
          </span>
          <span data-testid="blotter-saved-fraud-kpi" className="inline-flex items-center gap-2 text-ink-emerald font-medium tabular-nums">
            <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
            <span>Saved Fraud Volume: {formatUsdInr(48000)}</span>
          </span>
        </div>
      </div>

      <div className="sovereign-subcard p-4 space-y-3" data-testid="ag-studio-copilot-bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleCopilotSubmit();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            placeholder="Ask AG Studio Copilot to group by merchant risk and chart saved fraud vs settled PayPal volume"
            data-testid="input-ag-studio-copilot"
            className="sovereign-field flex-1 px-3.5 py-2.5 text-xs"
          />
          <button
            type="submit"
            data-testid="btn-ag-studio-copilot-run"
            className="btn-paypal-primary min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.96]"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Run AG Studio Copilot</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" data-testid="ag-studio-preset-pills">
            {PRESET_BUTTONS.map(({ id, testId, label, activeClass, Icon, iconClass }) => (
              <button
                key={id}
                type="button"
                onClick={() => handlePresetClick(id)}
                data-testid={testId}
                className={`min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium whitespace-nowrap active:scale-[0.96] ${
                  activePreset === id && id !== 'RESET_DEFAULT_BLOTTER' ? activeClass : 'btn-sovereign-neutral text-ink-secondary'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${iconClass}`} strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Filter rows"
              aria-label="Filter escrow rows"
              data-testid="blotter-quick-filter"
              className="sovereign-field px-3 py-2 text-xs"
            />
            <button
              type="button"
              onClick={handleExportCsv}
              data-testid="blotter-csv-export-btn"
              className="btn-sovereign-neutral min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap active:scale-[0.96]"
            >
              <Download className="w-3.5 h-3.5 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by escrow status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={statusTab === tab}
                onClick={() => setStatusTab(tab)}
                data-testid={`blotter-status-tab-${tab}`}
                className={`min-h-[36px] px-2.5 py-1 text-xs font-medium rounded-control whitespace-nowrap active:scale-[0.96] ${
                  statusTab === tab ? 'tone-paypal' : 'btn-sovereign-neutral text-ink-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div data-testid="ag-studio-copilot-status" className="text-xs text-ink-paypal tabular-nums">
            {copilotStatus}
          </div>
        </div>
      </div>

      {showChartSummary ? (
        <div data-testid="ag-studio-integrated-chart-summary" className="tone-emerald p-3.5 text-xs font-medium tabular-nums">
          AG Charts Enterprise Cross-Filter Chart Active: Saved Fraud Volume ({formatUsdInr(48000)}) vs Settled PayPal Volume ({formatUsdInr(24900)}) grouped by Merchant Domain
        </div>
      ) : null}

      <div className="h-[340px] w-full sovereign-subcard overflow-hidden" data-testid="ag-grid-enterprise-canvas">
        <AgGridReact<EscrowBlotterRow>
          theme={theme === 'light' ? talosLightTheme : talosDarkTheme}
          rowData={visibleRows}
          columnDefs={colDefs}
          defaultColDef={DEFAULT_COL_DEF}
          getRowId={getEscrowRowId}
          onGridReady={onGridReady}
          asyncTransactionWaitMillis={50}
          cellFlashDuration={1200}
          cellFadeDuration={500}
          masterDetail={true}
          detailRowAutoHeight={true}
          detailCellRenderer={ForensicDetailPanel}
          groupDefaultExpanded={0}
          rowGroupPanelShow={ROW_GROUP_PANEL_SHOW}
          cellSelection={true}
          enableCharts={true}
          statusBar={GRID_STATUS_BAR}
          sideBar={GRID_SIDE_BAR}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1" data-testid="blotter-row-selector">
        <span className="text-xs text-ink-muted">Inspect escrow row forensics:</span>
        {visibleRows.map((row) => {
          const isSelected = selectedEscrowId === row.escrow_id;
          const dotClass =
            row.state === 'BLOCKED_DOM_INJECTION' || row.state === 'PAYPAL_VOIDED'
              ? 'dot-crimson'
              : row.state === 'PAYPAL_CAPTURED'
              ? 'dot-emerald'
              : row.state === 'STEP_UP_REQUIRED'
              ? 'dot-amber'
              : 'dot-paypal';
          return (
            <button
              key={row.escrow_id}
              type="button"
              onClick={() => setSelectedEscrowId(row.escrow_id)}
              data-testid={`select-row-${row.escrow_id}`}
              className={`min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 text-xs tabular-nums whitespace-nowrap active:scale-[0.96] ${
                isSelected ? 'tone-paypal font-medium' : 'btn-sovereign-neutral text-ink-secondary'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-xs ${dotClass}`} aria-hidden="true" />
              <span data-testid={`blotter-row-${row.escrow_id}`}>
                {row.escrow_id} ({row.merchant_domain}): {row.state} ({formatUsdInr(row.amount_cents)})
              </span>
              <svg width="24" height="10" viewBox="0 0 24 10" className="shrink-0 text-ink-paypal" data-testid={`spread-sparkline-${row.escrow_id}`} aria-hidden="true">
                <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={row.spread_bps > 1000 ? '1,9 8,8 16,3 23,1' : '1,7 8,5 16,6 23,5'} />
              </svg>
            </button>
          );
        })}
      </div>

      <ForensicDetailPanel
        data={selectedRow}
        onActionCompleted={(res) => {
          updateRowState(res.escrow_id, res.new_state, {
            paypal_capture_id: res.paypal_capture_id ?? selectedRow?.paypal_capture_id ?? null,
          });
        }}
      />
    </section>
  );
}
