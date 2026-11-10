'use client';

// AG Studio & AG Grid Enterprise v33 Blotter — streams real-time row deltas via gridApi.applyTransactionAsync
import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { BarChart3, Download, Lock, RotateCcw, ShieldAlert, SlidersHorizontal, Table2 } from 'lucide-react';
import { EscrowBlotterRow } from '../hooks/useEscrowStream';
import { AgStudioPresetId, BlotterStatusTab, useAgStudioBlotter } from '../hooks/useAgStudioBlotter';
import { ForensicDetailPanel } from './ForensicDetailPanel';
import { TechnicalProofDrawer } from './TechnicalProofDrawer';
import { formatUsdInr } from '../lib/phase6-events';
import {
  DEFAULT_COL_DEF, GRID_SIDE_BAR, GRID_STATUS_BAR, ROW_GROUP_PANEL_SHOW,
  getEscrowRowId, initAgGridEnterprise, talosDarkTheme, talosLightTheme,
} from '../lib/ag-grid-theme';

export { DEFAULT_COL_DEF, GRID_SIDE_BAR, GRID_STATUS_BAR, getEscrowRowId, initAgGridEnterprise, talosDarkTheme, talosLightTheme };

const STATUS_TABS: BlotterStatusTab[] = ['ALL', 'BLOCKED', 'CLEARED', 'PENDING_HITL', 'PAYPAL_VOIDED'];
const PRESET_BUTTONS: Array<{ id: AgStudioPresetId; testId: string; label: string; Icon: typeof ShieldAlert }> = [
  { id: 'FRAUD_INJECTION_VIEW', testId: 'preset-fraud-injection', label: 'Blocked Scam & Trap View', Icon: ShieldAlert },
  { id: 'ACTIVE_PAYPAL_ESCROWS', testId: 'preset-active-escrows', label: 'Active PayPal Escrow Holds', Icon: Lock },
  { id: 'CHART_SAVED_VS_SETTLED', testId: 'preset-chart-saved-vs-settled', label: 'Chart: Money Saved vs Paid Out', Icon: BarChart3 },
  { id: 'RESET_DEFAULT_BLOTTER', testId: 'preset-reset-blotter', label: 'Reset All Transactions', Icon: RotateCcw },
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
  const [proofDrawerOpen, setProofDrawerOpen] = useState<boolean>(false);

  return (
    <section
      id="chapter-blotter"
      className="paypal-feature-card p-6 sm:p-7 space-y-5"
      data-testid="ag-studio-blotter"
      aria-label="Escrow Settlement Ledger"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-inner icon-medallion-paypal inline-flex items-center justify-center shrink-0">
            <Table2 className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-paypal font-bold">Scene 03 · Live Transaction Table</span>
            </div>
            <h2 className="paypal-title-sm text-ink">Escrow Settlement Ledger</h2>
            <p data-subhead="true" className="paypal-caption text-ink-secondary">
              Live PayPal escrow holds, blocked scam attempts, and carrier payout status
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-secondary">
          <span data-testid="blotter-group-summary" className="inline-flex items-center gap-2 font-mono text-ink-muted px-3 py-1.5 rounded-pill sovereign-subcard">
            <Table2 className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
            <span>Grouped by firewall_verdict (AG Grid v33 Enterprise)</span>
          </span>
          <span data-testid="blotter-saved-fraud-kpi" className="inline-flex items-center gap-2 font-mono text-ink-secondary tabular-nums px-3 py-1.5 rounded-pill tone-emerald">
            <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
            <span>Saved Fraud Volume: {formatUsdInr(48000)}</span>
          </span>
        </div>
      </div>

      <div data-testid="blotter-judge-legend" className="sovereign-well px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-secondary">
        <span className="font-bold text-ink">How to Read This Ledger:</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-xs dot-crimson" aria-hidden="true" /><span>Crimson = Blocked Scam / Auto-Refunded</span></span>
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-xs dot-paypal" aria-hidden="true" /><span>Blue = Held Safely in PayPal Escrow</span></span>
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" /><span>Emerald = Delivered &amp; Paid</span></span>
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-xs dot-amber" aria-hidden="true" /><span>Amber = Paused for Approve with PayPal</span></span>
        </div>
      </div>

      <div className="sovereign-subcard p-4 space-y-4" data-testid="ag-studio-copilot-bar">
        <form onSubmit={(e) => { e.preventDefault(); void handleCopilotSubmit(); }} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            placeholder="Ask in plain English: show blocked scam orders or compare money saved vs settled volume"
            data-testid="input-ag-studio-copilot"
            className="paypal-input h-10 flex-1 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            data-testid="btn-ag-studio-copilot-run"
            className="btn-paypal-primary h-10 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold whitespace-nowrap active:scale-[0.98]"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Run AG Studio Copilot</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" data-testid="ag-studio-preset-pills">
            {PRESET_BUTTONS.map(({ id, testId, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handlePresetClick(id)}
                data-testid={testId}
                className={`h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-pill whitespace-nowrap active:scale-[0.98] ${
                  activePreset === id && id !== 'RESET_DEFAULT_BLOTTER' ? 'tone-paypal text-ink' : 'btn-sovereign-neutral text-ink-secondary'
                }`}
              >
                <Icon className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
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
              className="paypal-input h-9 px-3 py-2 text-xs"
            />
            <button
              type="button"
              onClick={handleExportCsv}
              data-testid="blotter-csv-export-btn"
              className="btn-sovereign-neutral h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by escrow status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={statusTab === tab}
                onClick={() => setStatusTab(tab)}
                data-testid={`blotter-status-tab-${tab}`}
                className={`h-8 px-3.5 py-1 text-xs rounded-pill transition-colors duration-150 ease-unslop whitespace-nowrap active:scale-[0.98] ${
                  statusTab === tab ? 'tone-paypal text-ink font-bold' : 'text-ink-muted hover:text-ink-secondary'
                }`}
              >
                <span className="font-mono">{tab}</span>
              </button>
            ))}
          </div>
          <div data-testid="ag-studio-copilot-status" className="font-mono text-xs text-ink-muted tabular-nums">
            {copilotStatus}
          </div>
        </div>
      </div>

      {showChartSummary ? (
        <div data-testid="ag-studio-integrated-chart-summary" className="tone-emerald p-4 text-xs font-mono tabular-nums">
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

      <div className="flex flex-wrap items-center gap-2" data-testid="blotter-row-selector">
        <span className="font-mono text-xs text-ink-muted">Click any order to inspect its technical proof:</span>
        {visibleRows.map((row) => {
          const isSelected = selectedEscrowId === row.escrow_id;
          const dotClass =
            row.state === 'BLOCKED_DOM_INJECTION' || row.state === 'PAYPAL_VOIDED' ? 'dot-crimson'
              : row.state === 'PAYPAL_CAPTURED' ? 'dot-emerald'
              : row.state === 'STEP_UP_REQUIRED' ? 'dot-amber' : 'dot-paypal';
          return (
            <button
              key={row.escrow_id}
              type="button"
              onClick={() => { setSelectedEscrowId(row.escrow_id); setProofDrawerOpen(true); }}
              data-testid={`select-row-${row.escrow_id}`}
              className={`h-9 inline-flex items-center gap-2 px-3 py-2 text-xs tabular-nums rounded-control whitespace-nowrap active:scale-[0.98] ${
                isSelected ? 'tone-paypal text-ink font-medium' : 'btn-sovereign-neutral text-ink-secondary'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-xs ${dotClass}`} aria-hidden="true" />
              <span data-testid={`blotter-row-${row.escrow_id}`} className="font-mono">
                {row.escrow_id} ({row.merchant_domain}): {row.state} ({formatUsdInr(row.amount_cents)})
              </span>
              <svg width="16" height="8" viewBox="0 0 24 10" className="sr-only" data-testid={`spread-sparkline-${row.escrow_id}`} aria-hidden="true">
                <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={row.spread_bps > 1000 ? '1,9 8,8 16,3 23,1' : '1,7 8,5 16,6 23,5'} />
              </svg>
            </button>
          );
        })}
      </div>

      <TechnicalProofDrawer
        title="Escrow Settlement Ledger & Delivery SLA Timeline · Cryptographic & Firewall Proof"
        buttonLabel="View Technical Proof"
        summaryBadge="128-hex Ed25519 · RFC 9421 · 9277 bps · lol_html + DeBERTa-v3 ONNX"
        open={proofDrawerOpen}
        onToggle={setProofDrawerOpen}
        testId="blotter-technical-proof-drawer"
        buttonTestId="btn-blotter-technical-proof"
      >
        <ForensicDetailPanel
          data={selectedRow}
          onActionCompleted={(res) => updateRowState(res.escrow_id, res.new_state, { paypal_capture_id: res.paypal_capture_id ?? selectedRow?.paypal_capture_id ?? null })}
        />
      </TechnicalProofDrawer>
    </section>
  );
}
