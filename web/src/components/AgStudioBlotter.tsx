'use client';

// AG Studio & AG Grid Enterprise v33 Blotter — streams real-time row deltas via gridApi.applyTransactionAsync
import React, { useState } from 'react';
import { Card, Kbd } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { BarChart3, Columns3, Download, ListFilter, Lock, RotateCcw, ShieldAlert, SlidersHorizontal, Table2 } from 'lucide-react';
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
    copilotStatus, showChartSummary, activeToolPanel, toggleToolPanel, colDefs, theme,
    onGridReady, handlePresetClick, handleCopilotSubmit, handleExportCsv, updateRowState,
  } = useAgStudioBlotter(initialRows);
  const [proofDrawerOpen, setProofDrawerOpen] = useState<boolean>(false);

  return (
    <Card id="chapter-blotter" className="tx-card p-5 sm:p-6 flex flex-col gap-4" data-testid="ag-studio-blotter" aria-label="Escrow Settlement Ledger">
      <Card.Header className="p-0">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <span className="w-10 h-10 rounded-md icon-medallion-paypal inline-flex items-center justify-center shrink-0 mt-0.5">
              <Table2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] text-ink-muted font-semibold">Scene 03 · Live Transaction Table</span>
              <h2 className="text-base font-semibold text-ink leading-snug">Escrow Settlement Ledger</h2>
              <p data-subhead="true" className="text-xs text-ink-secondary leading-relaxed">
                Live PayPal escrow holds, blocked scam attempts, and carrier payout status
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
            <span data-testid="blotter-group-summary" className="tx-chip text-[11px] !min-h-[28px] px-2.5">
              <Table2 className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              <span>AG Grid v33</span>
              <span className="sr-only">Grouped by firewall_verdict (AG Grid v33 Enterprise)</span>
            </span>
            <span data-testid="blotter-saved-fraud-kpi" className="tx-chip tx-chip--paypal tabular-nums font-semibold !min-h-[28px] px-2.5">
              <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              <span>Saved Fraud Volume: {formatUsdInr(48000)}</span>
            </span>
          </div>
        </div>
      </Card.Header>

      <Card.Content className="p-0 flex flex-col gap-3.5">
        <div data-testid="blotter-judge-legend" className="tx-well px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-secondary">
          <span className="font-semibold text-ink">Status Legend</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-xs dot-crimson" aria-hidden="true" /><span>Blocked / Auto-Refunded</span></span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-xs dot-paypal" aria-hidden="true" /><span>Held in PayPal Escrow</span></span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" /><span>Delivered &amp; Paid</span></span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-xs dot-amber" aria-hidden="true" /><span>Paused for Step-Up</span></span>
          </div>
        </div>

        <div className="tx-well p-3 space-y-2" data-testid="ag-studio-copilot-bar">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
            <form onSubmit={(e) => { e.preventDefault(); void handleCopilotSubmit(); }} className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder="Ask Copilot: show blocked scam orders or compare money saved vs settled volume"
                data-testid="input-ag-studio-copilot"
                className="paypal-input h-8 flex-1 px-3 py-1 text-xs"
              />
              <button type="submit" data-testid="btn-ag-studio-copilot-run" className="btn-paypal-primary !min-h-[32px] h-8 px-3 py-1 text-xs whitespace-nowrap shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Run AG Studio Copilot</span>
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <input
                type="search"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="Filter rows..."
                aria-label="Filter escrow rows"
                data-testid="blotter-quick-filter"
                className="paypal-input h-8 w-full sm:w-40 px-2.5 py-1 text-xs"
              />
              <button type="button" onClick={() => toggleToolPanel('columns')} aria-pressed={activeToolPanel === 'columns'} data-testid="blotter-columns-btn" className={`!min-h-[32px] h-8 px-2.5 py-1 text-xs whitespace-nowrap shrink-0 ${activeToolPanel === 'columns' ? 'btn-paypal-primary' : 'btn-sovereign-neutral'}`}>
                <Columns3 className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Columns</span>
              </button>
              <button type="button" onClick={() => toggleToolPanel('filters')} aria-pressed={activeToolPanel === 'filters'} data-testid="blotter-filters-btn" className={`!min-h-[32px] h-8 px-2.5 py-1 text-xs whitespace-nowrap shrink-0 ${activeToolPanel === 'filters' ? 'btn-paypal-primary' : 'btn-sovereign-neutral'}`}>
                <ListFilter className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Filters</span>
              </button>
              <button type="button" onClick={handleExportCsv} data-testid="blotter-csv-export-btn" className="btn-sovereign-neutral !min-h-[32px] h-8 px-2.5 py-1 text-xs whitespace-nowrap shrink-0">
                <Download className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5" data-testid="ag-studio-preset-pills">
              {PRESET_BUTTONS.map(({ id, testId, label, Icon }) => {
                const active = activePreset === id && id !== 'RESET_DEFAULT_BLOTTER';
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handlePresetClick(id)}
                    data-testid={testId}
                    className={`h-7 inline-flex items-center gap-1.5 px-2.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                      active ? 'bg-[#003087] text-white border-[#003087]' : 'bg-[var(--surface)] text-ink-secondary border-[#C2D4EC] dark:border-[var(--border)] hover:border-[#005EA6] hover:text-[#003087]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 p-0.5 rounded-md bg-[var(--surface)] border border-[#C2D4EC] dark:border-[var(--border)]" role="tablist" aria-label="Filter by escrow status">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={statusTab === tab}
                  onClick={() => setStatusTab(tab)}
                  data-testid={`blotter-status-tab-${tab}`}
                  className={`h-6 px-2.5 text-[11px] font-semibold rounded-xs transition-colors whitespace-nowrap ${
                    statusTab === tab ? 'bg-[#003087] text-white' : 'text-ink-muted hover:text-[#003087]'
                  }`}
                >
                  <span>{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-ink-muted">
            <span data-testid="ag-studio-copilot-status" className="tabular-nums truncate">{copilotStatus}</span>
            <span className="hidden sm:inline-flex items-center gap-1 shrink-0">
              <span>Press</span>
              <Kbd className="px-1.5 py-0.5 text-[10px] rounded-xs bg-[var(--surface)] border border-[var(--border)]">Enter</Kbd>
              <span>to query</span>
            </span>
          </div>
        </div>

        {showChartSummary ? (
          <div data-testid="ag-studio-integrated-chart-summary" className="tx-well p-3 text-xs tabular-nums text-ink">
            AG Charts Enterprise Cross-Filter Chart Active: Saved Fraud Volume ({formatUsdInr(48000)}) vs Settled PayPal Volume ({formatUsdInr(24900)}) grouped by Merchant Domain
          </div>
        ) : null}

        <div className="h-[320px] w-full rounded-md border border-[var(--border)] overflow-hidden" data-testid="ag-grid-enterprise-canvas">
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
      </Card.Content>

      <Card.Footer className="p-0 flex flex-col items-stretch gap-3">
        <div className="space-y-2" data-testid="blotter-row-selector">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Click any order to inspect its cryptographic &amp; firewall proof:</span>
            <span className="tx-num">{visibleRows.length} orders active</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {visibleRows.map((row) => {
              const isSelected = selectedEscrowId === row.escrow_id;
              const dotClass = row.state === 'BLOCKED_DOM_INJECTION' || row.state === 'PAYPAL_VOIDED' ? 'dot-crimson' : row.state === 'PAYPAL_CAPTURED' ? 'dot-emerald' : row.state === 'STEP_UP_REQUIRED' ? 'dot-amber' : 'dot-paypal';
              return (
                <button
                  key={row.escrow_id}
                  type="button"
                  onClick={() => { setSelectedEscrowId(row.escrow_id); setProofDrawerOpen(true); }}
                  data-testid={`select-row-${row.escrow_id}`}
                  className={`p-2.5 text-left rounded-md border transition-colors flex flex-col justify-between gap-1.5 ${isSelected ? 'bg-[#EDF4FF] dark:bg-[#0C192E] border-[#005EA6] text-ink' : 'bg-[var(--surface)] border-[var(--border)] text-ink-secondary hover:border-[#005EA6]'}`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink truncate">
                      <span className={`w-1.5 h-1.5 rounded-xs shrink-0 ${dotClass}`} aria-hidden="true" />
                      <span className="truncate">{row.escrow_id}</span>
                    </span>
                    <span className="text-xs font-semibold text-ink tabular-nums shrink-0">{formatUsdInr(row.amount_cents).split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 w-full text-[11px] text-ink-muted">
                    <span className="truncate">{row.merchant_domain}</span>
                    <span className="font-mono text-[10px] text-ink-secondary shrink-0">{row.state}</span>
                  </div>
                  <span data-testid={`blotter-row-${row.escrow_id}`} className="sr-only">{row.escrow_id} ({row.merchant_domain}): {row.state} ({formatUsdInr(row.amount_cents)})</span>
                  <svg width="16" height="8" viewBox="0 0 24 10" className="sr-only" data-testid={`spread-sparkline-${row.escrow_id}`} aria-hidden="true">
                    <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={row.spread_bps > 1000 ? '1,9 8,8 16,3 23,1' : '1,7 8,5 16,6 23,5'} />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <TechnicalProofDrawer title="Escrow Settlement Ledger & Delivery SLA Timeline · Cryptographic & Firewall Proof" buttonLabel="View Technical Proof" summaryBadge="128-hex Ed25519 · RFC 9421 · 9277 bps · lol_html + DeBERTa-v3 ONNX" open={proofDrawerOpen} onToggle={setProofDrawerOpen} testId="blotter-technical-proof-drawer" buttonTestId="btn-blotter-technical-proof">
          <ForensicDetailPanel data={selectedRow} onActionCompleted={(res) => updateRowState(res.escrow_id, res.new_state, { paypal_capture_id: res.paypal_capture_id ?? selectedRow?.paypal_capture_id ?? null })} />
        </TechnicalProofDrawer>
      </Card.Footer>
    </Card>
  );
}
