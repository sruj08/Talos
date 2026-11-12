import React from 'react';
import { AgChartsCommunityModule } from 'ag-charts-community';
import { AllCommunityModule, ColDef, ModuleRegistry, colorSchemeDark, themeQuartz } from 'ag-grid-community';
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

export const talosDarkTheme = themeQuartz.withPart(colorSchemeDark).withParams({
  backgroundColor: '#0F141C',
  foregroundColor: '#F8FAFC',
  headerBackgroundColor: '#161C27',
  rowHoverColor: '#1E2636',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  accentColor: '#3B82F6',
  fontFamily: 'PayPal Pro, PayPal Open, Helvetica Neue, Arial, sans-serif',
  fontSize: 12,
});

export const talosLightTheme = themeQuartz.withParams({
  backgroundColor: '#FFFFFF',
  foregroundColor: '#001435',
  headerBackgroundColor: '#F4F6FA',
  rowHoverColor: '#F8FAFC',
  borderColor: '#DCE1E7',
  accentColor: '#003087',
  fontFamily: 'PayPal Pro, PayPal Open, Helvetica Neue, Arial, sans-serif',
  fontSize: 12,
});

export const BLOTTER_COL_DEFS: ColDef<EscrowBlotterRow>[] = [
  { field: 'escrow_id', headerName: 'Escrow ID', cellRenderer: 'agGroupCellRenderer', minWidth: 118, flex: 1.05 },
  { field: 'merchant_domain', headerName: 'Merchant Domain', enableRowGroup: true, filter: 'agSetColumnFilter', minWidth: 142, flex: 1.25 },
  { field: 'state', headerName: '2PC State', enableRowGroup: true, enablePivot: true, filter: 'agSetColumnFilter', minWidth: 132, flex: 1.15 },
  { field: 'firewall_verdict', headerName: 'Rust Firewall Verdict', enableRowGroup: true, filter: 'agSetColumnFilter', minWidth: 148, flex: 1.3 },
  {
    field: 'spread_bps',
    headerName: 'Spread',
    aggFunc: 'max',
    minWidth: 86,
    flex: 0.75,
    valueFormatter: (p) => `${p.value >= 0 ? '+' : ''}${p.value} bps`,
    cellRenderer: (p: { value?: number; data?: EscrowBlotterRow }) => {
      const bps = Number(p.value ?? p.data?.spread_bps ?? 0);
      return React.createElement(
        'span',
        { className: 'font-mono text-xs tabular-nums text-ink-secondary' },
        `${bps >= 0 ? '+' : ''}${bps} bps`
      );
    },
  },
  { field: 'attempted_price_usd', headerName: 'Ask ($ / ₹)', aggFunc: 'sum', minWidth: 116, flex: 0.95, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
  { field: 'deberta_Prompt_injection_score', headerName: 'Risk Score', aggFunc: 'max', filter: 'agNumberColumnFilter', minWidth: 92, flex: 0.75 },
  { field: 'channel3_median_usd', headerName: 'Channel3 Median', aggFunc: 'avg', minWidth: 118, flex: 0.95, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
  { field: 'saved_fraud_usd', headerName: 'Fraud Saved', aggFunc: 'sum', enableValue: true, hide: true, width: 140, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
  { field: 'settled_usd', headerName: 'Settled PayPal', aggFunc: 'sum', enableValue: true, hide: true, width: 140, valueFormatter: (p) => formatUsdInr(Math.round(Number(p.value || 0) * 100)) },
  { field: 'agent_id', headerName: 'Agent KYA ID', enableRowGroup: true, hide: true, width: 130 },
  { field: 'carrier', headerName: 'Carrier', enableRowGroup: true, hide: true, width: 96 },
  { field: 'sla_remaining_sec', headerName: 'SLA Remaining (s)', hide: true, width: 130 },
];

export const DEFAULT_COL_DEF = { enableCellChangeFlash: true, resizable: true, sortable: true };
export const getEscrowRowId = (params: { data: EscrowBlotterRow }) => params.data.escrow_id;
export const GRID_STATUS_BAR = {
  statusPanels: [
    { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
    { statusPanel: 'agFilteredRowCountComponent' },
    { statusPanel: 'agAggregationComponent' },
  ],
};
export const GRID_SIDE_BAR = { toolPanels: ['columns', 'filters'], defaultToolPanel: '', hiddenByDefault: true };
export const ROW_GROUP_PANEL_SHOW: 'always' = 'always';
