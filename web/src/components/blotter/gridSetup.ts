// One-time AG Grid Enterprise + AG Charts module registration and license wiring (Gate #3).
import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDarkBlue } from 'ag-grid-community';
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  IntegratedChartsModule,
  LicenseManager,
  MasterDetailModule,
  PivotModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  SetFilterModule,
  SideBarModule,
  SparklinesModule,
  StatusBarModule,
} from 'ag-grid-enterprise';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { AG_GRID_LICENSE_KEY } from '@/lib/config';

let registered = false;

export function ensureGridModules(): void {
  if (registered) return;
  registered = true;
  ModuleRegistry.registerModules([
    AllCommunityModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SetFilterModule,
    MasterDetailModule,
    PivotModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    StatusBarModule,
    ContextMenuModule,
    CellSelectionModule,
    ClipboardModule,
    ExcelExportModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    SparklinesModule.with(AgChartsEnterpriseModule),
  ]);
  // Without a key AG Grid Enterprise runs in evaluation mode (console notice + watermark only).
  if (AG_GRID_LICENSE_KEY) LicenseManager.setLicenseKey(AG_GRID_LICENSE_KEY);
}

/** Theming API (v33) aligned with DESIGN_SYSTEM.md surface + PayPal accent tokens. */
export const talosGridTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
  backgroundColor: '#0F172A',
  foregroundColor: '#F8FAFC',
  headerBackgroundColor: '#111C33',
  headerTextColor: '#94A3B8',
  borderColor: '#334155',
  accentColor: '#38BDF8',
  oddRowBackgroundColor: '#0D1526',
  rowHoverColor: '#1E293B',
  selectedRowBackgroundColor: 'rgba(56, 189, 248, 0.12)',
  chromeBackgroundColor: '#0F172A',
  fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontSize: 13,
  headerFontWeight: 600,
  rowHeight: 40,
  headerHeight: 40,
  wrapperBorderRadius: 10,
  cellHorizontalPadding: 12,
});
