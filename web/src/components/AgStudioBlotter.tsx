'use client';
// TASK-10: AG Grid Enterprise live escrow blotter with Master-Detail forensics and AG Studio Copilot.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ChartRef, GetRowIdParams, GridApi, GridReadyEvent } from 'ag-grid-community';
import { intentToFilterModel, parseCopilotPrompt, type CopilotIntent } from '@/lib/copilot';
import { diffRows } from '@/lib/escrowStore';
import type { EscrowAction } from '@/lib/api';
import type { EscrowRow, StreamStatus } from '@/lib/types';
import { buildColumnDefs } from './blotter/columns';
import { CopilotBar } from './blotter/CopilotBar';
import { ensureGridModules, talosGridTheme } from './blotter/gridSetup';
import { ForensicDetailPanel, type ForensicContext } from './ForensicDetailPanel';
import { StreamPill } from './StatusBadge';

ensureGridModules();

export interface AgStudioBlotterProps {
  rows: EscrowRow[];
  status: StreamStatus;
  onRowPatch?: (id: string, patch: Partial<EscrowRow>) => void;
  /** Receives the grid API once ready (tests, external automation). */
  onGridApi?: (api: GridApi<EscrowRow>) => void;
  /** Render every row (jsdom tests have no viewport height). */
  suppressVirtualisation?: boolean;
}

/** Applies a compiled Copilot intent to a live grid. Exported for unit tests. */
export function applyIntent(api: GridApi<EscrowRow>, intent: CopilotIntent, chartContainer?: HTMLElement | null): ChartRef | undefined {
  if (intent.reset) {
    api.setGridOption('pivotMode', false);
    api.setPivotColumns([]);
    api.setRowGroupColumns([]);
    api.setValueColumns(['amount', 'spread_bps']);
    api.setFilterModel(null);
    api.applyColumnState({ state: [{ colId: 'updated_at', sort: 'desc' }], defaultState: { sort: null } });
    return undefined;
  }
  if (intent.groupBy.length) api.setRowGroupColumns(intent.groupBy);
  const filterModel = intentToFilterModel(intent);
  if (Object.keys(filterModel).length) api.setFilterModel({ ...(api.getFilterModel() ?? {}), ...filterModel });
  if (intent.sort) {
    api.applyColumnState({ state: [{ colId: intent.sort.colId, sort: intent.sort.sort }], defaultState: { sort: null } });
  }
  if (!intent.chart || !chartContainer) return undefined;

  const { category, type } = intent.chart;
  const groupCols = api.getRowGroupColumns().map((c) => c.getColId());
  const title = (text: string) => ({ common: { title: { enabled: true, text } } });
  if (groupCols.length && groupCols[0] !== category) {
    // Grouped + different category → pivot chart: one series per category value within each group.
    api.setValueColumns(['amount']);
    api.setPivotColumns([category]);
    api.setGridOption('pivotMode', true);
    return api.createPivotChart({
      chartType: type === 'pie' || type === 'donut' ? 'stackedColumn' : type,
      chartContainer,
      chartThemeOverrides: title(`USD volume by ${groupCols[0]} × ${category}`),
    });
  }
  if (groupCols.length) {
    // Category is the grouping column itself → chart the collapsed group aggregates.
    api.collapseAll();
    return api.createRangeChart({
      chartType: type,
      cellRange: { columns: ['ag-Grid-AutoColumn', 'amount'] },
      suppressChartRanges: true,
      chartContainer,
      chartThemeOverrides: title(`USD volume by ${category}`),
    });
  }
  return api.createRangeChart({
    chartType: type,
    cellRange: { columns: [category, 'amount'] },
    aggFunc: 'sum',
    suppressChartRanges: true,
    chartContainer,
    chartThemeOverrides: title(`USD volume by ${category}`),
  });
}

export function AgStudioBlotter({ rows, status, onRowPatch, onGridApi, suppressVirtualisation }: AgStudioBlotterProps) {
  const apiRef = useRef<GridApi<EscrowRow> | null>(null);
  const knownRef = useRef(new Map<string, EscrowRow>());
  const chartRef = useRef<ChartRef | undefined>(undefined);
  const chartHost = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [flashCount, setFlashCount] = useState(0);

  const columnDefs = useMemo(buildColumnDefs, []);
  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true, filter: true, enableCellChangeFlash: true }), []);
  const getRowId = useCallback((p: GetRowIdParams<EscrowRow>) => p.data.id, []);

  // Stable grid context object; fields are refreshed every render so detail panels see current values.
  const context = useRef<ForensicContext>({ simulated: true, onAction: () => undefined }).current;
  context.simulated = status !== 'live';
  context.onAction = (row, _a: EscrowAction, patch) => onRowPatch?.(row.id, patch);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Stream → grid: incremental transactions so only changed cells re-render and flash.
  const sync = useCallback((next: EscrowRow[]) => {
    const api = apiRef.current;
    if (!api) return;
    const tx = diffRows(knownRef.current, next);
    if (!tx.add.length && !tx.update.length && !tx.remove.length) return;
    knownRef.current = new Map(next.map((r) => [r.id, r]));
    api.applyTransactionAsync(tx);
    if (tx.update.length) setFlashCount((c) => c + tx.update.length);
  }, []);

  useEffect(() => sync(rows), [rows, sync]);

  const onGridReady = useCallback(
    (e: GridReadyEvent<EscrowRow>) => {
      apiRef.current = e.api;
      knownRef.current = new Map();
      sync(rowsRef.current);
      onGridApi?.(e.api);
    },
    [sync, onGridApi],
  );

  const runCopilot = useCallback((prompt: string) => {
    const api = apiRef.current;
    if (!api) return;
    const intent = parseCopilotPrompt(prompt);
    if (intent.reset || intent.chart) {
      chartRef.current?.destroyChart();
      chartRef.current = undefined;
    }
    // Flush pending async transactions so filters/charts see the latest rows.
    api.flushAsyncTransactions();
    chartRef.current = applyIntent(api, intent, chartHost.current) ?? chartRef.current;
    setLog(intent.summary.length ? intent.summary : ['no recognised operation — try "group by merchant risk"']);
  }, []);

  useEffect(() => () => chartRef.current?.destroyChart(), []);

  return (
    <section className="card blotter" aria-labelledby="blotter-title">
      <div className="card-head">
        <div>
          <h2 id="blotter-title">Live Escrow Blotter</h2>
          <span className="sub">
            AG Grid Enterprise · {rows.length} escrows · {flashCount} live cell updates
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StreamPill status={status} />
          <button className="btn" type="button" onClick={() => apiRef.current?.exportDataAsExcel({ fileName: 'talos-escrow-blotter.xlsx' })}>
            Export
          </button>
        </div>
      </div>
      <CopilotBar onRun={runCopilot} log={log} />
      <div className="grid-host" data-testid="blotter-grid">
        <AgGridReact<EscrowRow>
          theme={talosGridTheme}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          onGridReady={onGridReady}
          context={context}
          masterDetail
          detailCellRenderer={ForensicDetailPanel}
          detailRowHeight={330}
          isRowMaster={() => true}
          rowGroupPanelShow="always"
          isGroupOpenByDefault={(p) => p.rowNode.group === true && p.level === 0}
          autoGroupColumnDef={{ headerName: 'Group', minWidth: 220, cellRendererParams: { suppressCount: false } }}
          grandTotalRow="bottom"
          cellSelection
          enableCharts
          chartThemes={['ag-default-dark', 'ag-vivid-dark']}
          animateRows
          asyncTransactionWaitMillis={60}
          suppressRowVirtualisation={suppressVirtualisation}
          suppressColumnVirtualisation={suppressVirtualisation}
          sideBar={{ toolPanels: ['columns', 'filters'], hiddenByDefault: false, defaultToolPanel: '' }}
          statusBar={{ statusPanels: [{ statusPanel: 'agTotalAndFilteredRowCountComponent' }, { statusPanel: 'agAggregationComponent' }] }}
          overlayNoRowsTemplate="Waiting for escrow events from /ws/events…"
        />
      </div>
      <div ref={chartHost} className="chart-host" data-testid="copilot-chart" aria-label="AG Studio chart" />
    </section>
  );
}
