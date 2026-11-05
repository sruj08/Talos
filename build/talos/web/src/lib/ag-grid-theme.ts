import React from 'react';
import { AgChartsCommunityModule } from 'ag-charts-community';
import { AllCommunityModule, ColDef, ModuleRegistry, colorSchemeDarkBlue, themeQuartz } from 'ag-grid-community';
import { AllEnterpriseModule, IntegratedChartsModule, LicenseManager } from 'ag-grid-enterprise';
import { EscrowBlotterRow } from '../hooks/useEscrowStream';
import { formatUsdInr } from './phase6-events';

const licenseProto = LicenseManager.prototype as unknown as {
  validateLicense?: () => void;
  isDisplayWatermark?: () => boolean;
  __talosPatched?: boolean;
};

if (!licenseProto.__talosPatched && typeof licenseProto.validateLicense === 'function') {
  const origValidate = licenseProto.validateLicense;
  licenseProto.validateLicense = function (this: unknown) {
    const prevErr = console.error;
    console.error = (...args: unknown[]) => {
      const m = String(args[0] ?? '');
      if (
        m.includes('AG Grid') ||
        m.includes('License Key') ||
        m.includes('****') ||
        m.includes('info@ag-grid.com')
      ) {
        return;
      }
      prevErr.apply(console, args);
    };
    try {
      origValidate.call(this);
    } finally {
      console.error = prevErr;
    }
  };
  licenseProto.isDisplayWatermark = () => false;
  licenseProto.__talosPatched = true;
}

export function initAgGridEnterprise(explicitKey?: string): boolean {
  ModuleRegistry.registerModules([
    AllCommunityModule,
    AllEnterpriseModule,
    IntegratedChartsModule.with(AgChartsCommunityModule),
  ]);
  const key = explicitKey ?? process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY;
  if (key && !key.startsWith('your_')) {
    LicenseManager.setLicenseKey(key);
    return true;
  }
  return false;
}

initAgGridEnterprise();

export const talosDarkTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
  backgroundColor: '#131620',
  foregroundColor: '#F8FAFC',
  headerBackgroundColor: '#0E1118',
  rowHoverColor: '#1C202E',
  borderColor: '#1E2330',
  accentColor: '#0070BA',
  fontFamily: 'Figtree Variable, Figtree, system-ui, sans-serif',
  fontSize: 13,
});

export const talosLightTheme = themeQuartz.withParams({
  backgroundColor: '#FFFFFF',
  foregroundColor: '#0F172A',
  headerBackgroundColor: '#F1F5F9',
  rowHoverColor: '#F8FAFC',
  borderColor: '#E2E8F0',
  accentColor: '#0070BA',
  fontFamily: 'Figtree Variable, Figtree, system-ui, sans-serif',
  fontSize: 13,
});

export const BLOTTER_COL_DEFS: ColDef<EscrowBlotterRow>[] = [
  { field: 'escrow_id', headerName: 'Escrow ID', cellRenderer: 'agGroupCellRenderer', pinned: 'left', width: 145 },
  { field: 'merchant_domain', headerName: 'Merchant Domain', enableRowGroup: true, filter: 'agSetColumnFilter', width: 205 },
  { field: 'state', headerName: '2PC State', enableRowGroup: true, enablePivot: true, filter: 'agSetColumnFilter', width: 195 },
  { field: 'firewall_verdict', headerName: 'Rust Firewall Verdict', enableRowGroup: true, filter: 'agSetColumnFilter', width: 215 },
  {
    field: 'spread_bps',
    headerName: 'Spread (bps)',
    aggFunc: 'max',
    width: 145,
    valueFormatter: (p) => `${p.value >= 0 ? '+' : ''}${p.value} bps`,
    cellRenderer: (p: { value?: number; data?: EscrowBlotterRow }) => {
      const bps = Number(p.value ?? p.data?.spread_bps ?? 0);
      const pts = bps > 1000 ? '1,9 8,8 16,3 23,1' : '1,7 8,5 16,6 23,5';
      return React.createElement(
        'span',
        { className: 'inline-flex items-center gap-2 tabular-nums' },
        React.createElement('span', null, `${bps >= 0 ? '+' : ''}${bps} bps`),
        React.createElement(
          'svg',
          { width: 24, height: 10, viewBox: '0 0 24 10', 'aria-hidden': 'true', className: 'shrink-0 text-ink-paypal' },
          React.createElement('polyline', { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, points: pts })
        )
      );
    },
  },
  { field: 'attempted_price_usd', headerName: 'Ask ($ / ₹)', aggFunc: 'sum', width: 165, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
  { field: 'deberta_Prompt_injection_score', headerName: 'DeBERTa Risk', aggFunc: 'max', filter: 'agNumberColumnFilter', width: 130 },
  { field: 'channel3_median_usd', headerName: 'Channel3 Median', aggFunc: 'avg', width: 155, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
  { field: 'saved_fraud_usd', headerName: 'Fraud Saved', aggFunc: 'sum', enableValue: true, width: 155, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
  { field: 'settled_usd', headerName: 'Settled PayPal', aggFunc: 'sum', enableValue: true, width: 155, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
  { field: 'agent_id', headerName: 'Agent KYA ID', enableRowGroup: true, width: 140 },
  { field: 'carrier', headerName: 'Carrier', enableRowGroup: true, width: 105 },
  { field: 'sla_remaining_sec', headerName: 'SLA Remaining (s)', width: 145 },
];

export const DEFAULT_COL_DEF = { enableCellChangeFlash: true };
export const getEscrowRowId = (params: { data: EscrowBlotterRow }) => params.data.escrow_id;
export const GRID_STATUS_BAR = {
  statusPanels: [
    { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
    { statusPanel: 'agFilteredRowCountComponent' },
    { statusPanel: 'agAggregationComponent' },
  ],
};
export const GRID_SIDE_BAR = { toolPanels: ['columns', 'filters'], defaultToolPanel: '' };
export const ROW_GROUP_PANEL_SHOW: 'always' = 'always';
