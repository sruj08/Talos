// Column definitions + cell renderers for the escrow blotter (two-channel status encoding, WCAG 1.4.1).
import type { ColDef, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { formatBps, formatCents, shortHex, stateMeta } from '@/lib/format';
import type { EscrowRow } from '@/lib/types';
import { StatusBadge, TonePill } from '../StatusBadge';

type P = ICellRendererParams<EscrowRow>;

function StateCell(p: P) {
  if (p.value == null) return null;
  if (p.node.group) return <span>{stateMeta(p.value).label}</span>;
  return <StatusBadge state={p.value} />;
}

function SignatureCell(p: P) {
  const sig = p.data?.forensics?.signature?.ed25519SignatureHex;
  if (!p.data) return null;
  return sig ? (
    <TonePill tone="emerald" title={sig}>
      ✔ ed25519 {shortHex(sig, 6, 4)}
    </TonePill>
  ) : (
    <TonePill tone="neutral" title="Signature held by firewall-rs mandate registry">
      ed25519 · {shortHex(p.data.mandate_id, 10, 0)}
    </TonePill>
  );
}

function RiskCell(p: P) {
  const v = p.value as EscrowRow['merchant_risk'] | undefined;
  if (!v) return null;
  const tone = v === 'HIGH' ? 'crimson' : v === 'MEDIUM' ? 'amber' : 'emerald';
  return <TonePill tone={tone}>{v === 'HIGH' ? '▲' : v === 'MEDIUM' ? '◆' : '●'} {v}</TonePill>;
}

const usd = (p: ValueFormatterParams<EscrowRow, number>) => (p.value == null ? '' : formatCents(Math.round(p.value * 100)));

export function buildColumnDefs(): ColDef<EscrowRow>[] {
  return [
    {
      field: 'id',
      headerName: 'Escrow',
      cellRenderer: 'agGroupCellRenderer',
      pinned: 'left',
      width: 150,
      cellClass: 'mono',
      chartDataType: 'excluded',
    },
    {
      field: 'state',
      headerName: 'Status',
      cellRenderer: StateCell,
      width: 230,
      enableRowGroup: true,
      enablePivot: true,
      filter: 'agSetColumnFilter',
      filterParams: { valueFormatter: (p: ValueFormatterParams) => stateMeta(p.value).label },
      chartDataType: 'category',
      enableCellChangeFlash: true,
    },
    {
      colId: 'amount',
      headerName: 'Amount',
      valueGetter: (p) => (p.data ? p.data.amount_cents / 100 : undefined),
      valueFormatter: usd,
      type: 'rightAligned',
      cellClass: 'mono',
      filter: 'agNumberColumnFilter',
      aggFunc: 'sum',
      enableValue: true,
      width: 130,
      chartDataType: 'series',
      enableCellChangeFlash: true,
    },
    {
      field: 'merchant_name',
      headerName: 'Merchant',
      enableRowGroup: true,
      enablePivot: true,
      filter: 'agSetColumnFilter',
      chartDataType: 'category',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'merchant_risk',
      headerName: 'Risk',
      cellRenderer: RiskCell,
      enableRowGroup: true,
      enablePivot: true,
      filter: 'agSetColumnFilter',
      chartDataType: 'category',
      width: 120,
    },
    { field: 'sku_query', headerName: 'SKU', enableRowGroup: true, filter: true, width: 190, chartDataType: 'category' },
    {
      field: 'spread_bps',
      headerName: 'Ch3 Spread',
      valueFormatter: (p) => formatBps(p.value),
      cellClass: 'mono',
      cellStyle: (p) => ({ color: (p.value ?? 0) > 1500 ? 'var(--crimson)' : (p.value ?? 0) > 500 ? 'var(--amber)' : 'var(--emerald)' }),
      filter: 'agNumberColumnFilter',
      aggFunc: 'avg',
      enableValue: true,
      type: 'rightAligned',
      width: 120,
      chartDataType: 'series',
      enableCellChangeFlash: true,
    },
    {
      colId: 'spread_trend',
      headerName: 'Spread Trend',
      valueGetter: (p) => p.data?.forensics?.channel3?.spreadHistoryBps ?? [],
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: { type: 'line', stroke: '#38BDF8', strokeWidth: 1.5, marker: { enabled: false } },
      },
      sortable: false,
      filter: false,
      width: 140,
      chartDataType: 'excluded',
    },
    { headerName: 'KYA Signature', colId: 'signature', cellRenderer: SignatureCell, width: 190, sortable: false, filter: false, chartDataType: 'excluded' },
    { field: 'paypal_authorization_id', headerName: 'PayPal Auth', cellClass: 'mono', width: 150, chartDataType: 'excluded', enableCellChangeFlash: true },
    { field: 'paypal_capture_id', headerName: 'PayPal Capture', cellClass: 'mono', width: 150, chartDataType: 'excluded', enableCellChangeFlash: true },
    { field: 'carrier', headerName: 'Carrier', enableRowGroup: true, width: 110, chartDataType: 'category' },
    {
      field: 'updated_at',
      headerName: 'Updated',
      sort: 'desc',
      valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleTimeString('en-US', { hour12: false }) : ''),
      cellClass: 'mono',
      width: 120,
      chartDataType: 'excluded',
    },
  ];
}
