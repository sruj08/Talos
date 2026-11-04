'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { EscrowBlotterRow, applyEscrowEventToRows, useEscrowStream } from './useEscrowStream';
import { TALOS_ESCROW_EVENT, TalosEscrowEventDetail, formatUsdInr } from '../lib/phase6-events';

export type AgStudioPresetId =
  | 'FRAUD_INJECTION_VIEW'
  | 'ACTIVE_PAYPAL_ESCROWS'
  | 'CHART_SAVED_VS_SETTLED'
  | 'RESET_DEFAULT_BLOTTER';

export interface AgStudioCopilotResponse {
  preset?: AgStudioPresetId;
  explanation: string;
  ag_grid_column_state: Array<{
    colId: string;
    rowGroup?: boolean;
    aggFunc?: string;
    sort?: 'asc' | 'desc' | null;
    pinned?: 'left' | 'right' | null;
  }>;
  ag_charts_config?: {
    chartType: 'groupedColumn' | 'bar';
    series: string[];
  };
}

export function applyPresetFilterToRows(
  rows: EscrowBlotterRow[],
  preset: AgStudioPresetId
): EscrowBlotterRow[] {
  if (preset === 'FRAUD_INJECTION_VIEW') {
    return rows
      .filter((r) => r.deberta_Prompt_injection_score > 0.5 || r.state === 'BLOCKED_DOM_INJECTION')
      .sort((a, b) => b.saved_fraud_usd - a.saved_fraud_usd);
  }
  if (preset === 'ACTIVE_PAYPAL_ESCROWS') {
    return rows
      .filter((r) => r.state === 'PAYPAL_AUTHORIZED' || r.state === 'STEP_UP_REQUIRED')
      .sort((a, b) => a.sla_remaining_sec - b.sla_remaining_sec);
  }
  return rows;
}

export function applyPresetToGridApi(
  gridApi: GridApi<EscrowBlotterRow> | null,
  preset: AgStudioPresetId
): AgStudioCopilotResponse {
  if (preset === 'FRAUD_INJECTION_VIEW') {
    const colState = [
      { colId: 'firewall_verdict', rowGroup: true },
      { colId: 'saved_fraud_usd', aggFunc: 'sum', sort: 'desc' as const },
    ];
    gridApi?.applyColumnState?.({ state: colState, defaultState: { rowGroup: false, sort: null } });
    gridApi?.setFilterModel?.({
      deberta_Prompt_injection_score: { filterType: 'number', type: 'greaterThan', filter: 0.5 },
    });
    gridApi?.expandAll?.();
    return {
      preset,
      explanation: 'Grouped by firewall_verdict, filtered DeBERTa score > 0.50, sorted by saved_fraud_usd DESC.',
      ag_grid_column_state: colState,
    };
  }
  if (preset === 'ACTIVE_PAYPAL_ESCROWS') {
    const colState = [
      { colId: 'state', rowGroup: false },
      { colId: 'sla_remaining_sec', sort: 'asc' as const },
    ];
    gridApi?.applyColumnState?.({ state: colState, defaultState: { rowGroup: false, sort: null } });
    gridApi?.setFilterModel?.({
      state: {
        filterType: 'set',
        values: ['PAYPAL_AUTHORIZED', 'STEP_UP_REQUIRED'],
      },
    });
    return {
      preset,
      explanation: 'Filtered to active PayPal Sandbox holds and sorted by remaining SLA countdown ASC.',
      ag_grid_column_state: colState,
    };
  }
  if (preset === 'CHART_SAVED_VS_SETTLED') {
    const colState = [
      { colId: 'merchant_domain', rowGroup: true },
      { colId: 'saved_fraud_usd', aggFunc: 'sum' },
      { colId: 'settled_usd', aggFunc: 'sum' },
    ];
    gridApi?.applyColumnState?.({ state: colState, defaultState: { rowGroup: false } });
    gridApi?.expandAll?.();
    gridApi?.createCrossFilterChart?.({
      chartType: 'column',
      cellRange: { columns: ['merchant_domain', 'saved_fraud_usd', 'settled_usd'] },
      aggFunc: 'sum',
    });
    return {
      preset,
      explanation: 'Grouped by merchant_domain and rendered AG Charts grouped column (Saved Fraud vs. Settled Volume).',
      ag_grid_column_state: colState,
      ag_charts_config: { chartType: 'groupedColumn', series: ['saved_fraud_usd', 'settled_usd'] },
    };
  }
  gridApi?.resetColumnState?.();
  gridApi?.setFilterModel?.(null);
  return {
    preset: 'RESET_DEFAULT_BLOTTER',
    explanation: 'Reset AG Grid blotter column grouping, sorting, and filters to default institutional view.',
    ag_grid_column_state: [],
  };
}

export async function runAgStudioCopilotQuery(
  naturalLanguageQuery: string,
  gridApi: GridApi<EscrowBlotterRow> | null
): Promise<AgStudioCopilotResponse> {
  try {
    const res = await fetch('/api/mcp/paypal-bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'AG_STUDIO_COPILOT',
        natural_language_query: naturalLanguageQuery,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.ag_grid_column_state)) {
        gridApi?.applyColumnState?.({ state: json.ag_grid_column_state, applyOrder: true });
        gridApi?.expandAll?.();
      }
      return {
        explanation: `AG Studio Copilot applied layout for "${naturalLanguageQuery}"`,
        ag_grid_column_state: json.ag_grid_column_state || [],
        ag_charts_config: json.ag_charts_config,
      };
    }
  } catch {
    // Fallback to deterministic local column layout
  }
  return applyPresetToGridApi(gridApi, 'CHART_SAVED_VS_SETTLED');
}

export function useAgStudioBlotter(initialRows?: EscrowBlotterRow[]) {
  const gridApiRef = useRef<GridApi<EscrowBlotterRow> | null>(null);
  const stream = useEscrowStream();
  const baseRows = initialRows || stream.rows;

  useEffect(() => {
    const onEscrowEvt = (e: Event) => {
      const detail = (e as CustomEvent<TalosEscrowEventDetail>).detail;
      if (!detail || !gridApiRef.current) return;
      const targetId = detail.ag_grid_row_delta?.escrow_id || detail.escrow_id;
      const existed = baseRows.some((r) => r.escrow_id === targetId);
      const next = applyEscrowEventToRows(baseRows, detail);
      const changed = next.find((r) => r.escrow_id === targetId);
      if (changed) {
        gridApiRef.current.applyTransactionAsync?.(existed ? { update: [changed] } : { add: [changed], addIndex: 0 });
      }
    };
    window.addEventListener(TALOS_ESCROW_EVENT, onEscrowEvt);
    return () => window.removeEventListener(TALOS_ESCROW_EVENT, onEscrowEvt);
  }, [baseRows]);

  const [activePreset, setActivePreset] = useState<AgStudioPresetId>('RESET_DEFAULT_BLOTTER');
  const [selectedEscrowId, setSelectedEscrowId] = useState<string>(baseRows[0]?.escrow_id || 'esc-901-trap');
  const [copilotQuery, setCopilotQuery] = useState<string>('');
  const [copilotStatus, setCopilotStatus] = useState<string>(
    'AG Studio AI Financial Copilot Ready — Select a preset pill or enter a natural-language layout query.'
  );
  const [showChartSummary, setShowChartSummary] = useState<boolean>(false);

  const visibleRows = useMemo(
    () => applyPresetFilterToRows(baseRows, activePreset),
    [activePreset, baseRows]
  );

  const selectedRow = useMemo(
    () => baseRows.find((r) => r.escrow_id === selectedEscrowId) || baseRows[0],
    [selectedEscrowId, baseRows]
  );

  const colDefs = useMemo<ColDef<EscrowBlotterRow>[]>(
    () => [
      { field: 'escrow_id', headerName: 'Escrow ID', cellRenderer: 'agGroupCellRenderer', pinned: 'left', width: 155 },
      { field: 'agent_id', headerName: 'Agent KYA ID', enableRowGroup: true, width: 145 },
      { field: 'merchant_domain', headerName: 'Merchant Domain', enableRowGroup: true, filter: 'agSetColumnFilter', width: 170 },
      { field: 'state', headerName: '2PC State', enableRowGroup: true, enablePivot: true, filter: 'agSetColumnFilter', width: 195 },
      { field: 'firewall_verdict', headerName: 'Rust Firewall Verdict', enableRowGroup: true, filter: 'agSetColumnFilter', width: 205 },
      { field: 'deberta_Prompt_injection_score', headerName: 'DeBERTa Score', aggFunc: 'max', filter: 'agNumberColumnFilter', width: 140 },
      { field: 'attempted_price_usd', headerName: 'Ask ($ / ₹)', aggFunc: 'sum', width: 145, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
      { field: 'channel3_median_usd', headerName: 'Channel3 Median', aggFunc: 'avg', width: 150, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
      { field: 'spread_bps', headerName: 'Spread (bps)', aggFunc: 'max', width: 125, valueFormatter: (p) => `${p.value >= 0 ? '+' : ''}${p.value} bps` },
      { field: 'saved_fraud_usd', headerName: 'Fraud Saved', aggFunc: 'sum', enableValue: true, width: 145, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
      { field: 'settled_usd', headerName: 'Settled PayPal', aggFunc: 'sum', enableValue: true, width: 145, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
      { field: 'carrier', headerName: 'Carrier', enableRowGroup: true, width: 110 },
      { field: 'sla_remaining_sec', headerName: 'SLA Remaining (s)', width: 145 },
    ],
    []
  );

  const onGridReady = useCallback((event: GridReadyEvent<EscrowBlotterRow>) => {
    gridApiRef.current = event.api;
  }, []);

  const handlePresetClick = useCallback((preset: AgStudioPresetId) => {
    setActivePreset(preset);
    setShowChartSummary(preset === 'CHART_SAVED_VS_SETTLED');
    const result = applyPresetToGridApi(gridApiRef.current, preset);
    setCopilotStatus(result.explanation);
  }, []);

  const handleCopilotSubmit = useCallback(
    async (queryOverride?: string) => {
      const q = (queryOverride ?? copilotQuery).trim() || 'Group by merchant risk and chart saved fraud vs settled PayPal volume';
      const result = await runAgStudioCopilotQuery(q, gridApiRef.current);
      if (result.ag_charts_config) setShowChartSummary(true);
      setCopilotStatus(result.explanation);
    },
    [copilotQuery]
  );

  return {
    rows: baseRows,
    visibleRows,
    selectedRow,
    selectedEscrowId,
    setSelectedEscrowId,
    activePreset,
    copilotQuery,
    setCopilotQuery,
    copilotStatus,
    showChartSummary,
    colDefs,
    onGridReady,
    handlePresetClick,
    handleCopilotSubmit,
    updateRowState: stream.updateRowState,
  };
}
