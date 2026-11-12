'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarClock, FileSpreadsheet, KeyRound, MonitorPlay, PlayCircle, ShieldBan, ShieldCheck, TrendingDown, UserCheck, Wallet } from 'lucide-react';
import { useTalosClearing } from '../../context/TalosClearingContext';
import { useSimulatorRun } from '../../context/SimulatorRunContext';
import { formatUsd } from '../../lib/sim/storefront-catalog';
import {
  GridPatternOverlay,
  SegmentedTelemetryBar,
  UptimeStatusRibbon,
} from '../ui/fintech-primitives';

const WORKSPACES = [
  { href: '/simulator', title: 'Live simulator', body: 'Watch an agent shop and try to break it.', icon: MonitorPlay },
  { href: '/mandates', title: 'Spending allowance', body: 'Set the cap, price spread and delivery rule.', icon: KeyRound },
  { href: '/blotter', title: 'CFO escrow ledger', body: 'Every hold, capture, void and blocked attack.', icon: FileSpreadsheet },
  { href: '/sla', title: 'Delivery SLA', body: '29-day holds and 48h carrier deadlines.', icon: CalendarClock },
  { href: '/step-up', title: 'Human approval', body: 'Co-sign carts that exceed the cap.', icon: UserCheck },
] as const;

function usdFromCents(cents: number): string {
  return formatUsd(Math.round(cents / 100));
}

export function CommandOverview() {
  const { kpiMetrics, mode, rows } = useTalosClearing();
  const { totals, lastRun, capUsd } = useSimulatorRun();
  const live = mode === 'LIVE_WS';
  const awaiting = rows.filter((r) => r.state === 'STEP_UP_REQUIRED').length;

  const kpis = [
    { id: 'kpi-protected-gmv', label: 'Protected GMV', caption: 'Money protected inside reversible PayPal holds', value: usdFromCents(kpiMetrics.protectedGmvCents), icon: ShieldCheck, barVal: 86, barMax: 100 },
    { id: 'kpi-blocked-injections', label: 'Blocked Prompt Injections', caption: 'Hack attempts stopped before reaching the AI', value: String(kpiMetrics.blockedInjectionsCount), icon: ShieldBan, barVal: Math.min(20, kpiMetrics.blockedInjectionsCount || 14), barMax: 20 },
    { id: 'kpi-channel3-savings', label: 'Channel3 Savings', caption: 'Money saved by blocking overpriced sellers', value: usdFromCents(kpiMetrics.channel3SavingsCents + totals.savedUsd * 100), icon: TrendingDown, barVal: 92, barMax: 100 },
    { id: 'kpi-active-holds', label: 'Active PayPal Authorizations', caption: 'Orders held in escrow awaiting carrier delivery', value: String(kpiMetrics.activePayPalAuthCount), icon: Wallet, barVal: Math.min(10, kpiMetrics.activePayPalAuthCount || 4), barMax: 10 },
  ];

  const health = [
    { name: 'Rust firewall', detail: `p99 ${kpiMetrics.firewallP99LatencyMs}ms` },
    { name: 'Go escrow orchestrator', detail: live ? 'Streaming' : 'Replay stream' },
    { name: 'PayPal Sandbox', detail: live ? 'Live' : 'Deterministic replay' },
    { name: 'Channel3 price oracle', detail: 'Benchmarks cached' },
  ];

  return (
    <div className="space-y-4" data-testid="sovereign-telemetry-header">
      <div data-testid="kpi-header-bar" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={k.id} data-testid={k.id} className="tx-card relative overflow-hidden p-4 space-y-2.5 flex flex-col justify-between">
              <GridPatternOverlay squares={[[1 + idx, 1], [3, 2], [5, 1]]} />
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span className="text-xs font-medium text-ink-secondary">{k.label}</span>
                <Icon className="h-4 w-4 text-ink-secondary" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <p className="text-2xl font-semibold text-ink tabular-nums relative z-10">{k.value}</p>
              <div className="space-y-1.5 relative z-10">
                <SegmentedTelemetryBar value={k.barVal} max={k.barMax} segments={14} tone="paypal" />
                <p className="text-[11px] text-ink-muted leading-snug">{k.caption}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-4">
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold text-ink">Workspaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WORKSPACES.map((w) => {
              const Icon = w.icon;
              return (
                <Link key={w.href} href={w.href} className="tx-card p-3.5 flex items-start gap-3 group hover:border-[var(--border-strong)]" data-testid={`overview-card-${w.href.slice(1)}`}>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md shrink-0 icon-medallion-paypal">
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-ink">
                      {w.title}
                      <ArrowUpRight className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="block text-xs text-ink-secondary mt-0.5">{w.body}</span>
                  </span>
                </Link>
              );
            })}
            <Link href="/story" className="tx-well p-3.5 flex items-start gap-3 hover:bg-[var(--surface)]" data-testid="overview-guided-tour">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md shrink-0 icon-medallion-paypal">
                <PlayCircle className="h-4 w-4 text-ink" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs sm:text-sm font-semibold text-ink">Guided judge tour</span>
                <span className="block text-xs text-ink-secondary mt-0.5">Five stages, about 60 seconds.</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2.5">
            <h2 className="text-sm font-semibold text-ink">System health</h2>
            <div className="tx-card p-3.5 space-y-2.5" data-testid="overview-system-health">
              <UptimeStatusRibbon serviceName="24h Settlement Enclave SLA" uptimePercent="99.99%" ticks={24} tone="paypal" />
              <ul className="space-y-0.5 pt-0.5">
                {health.map((h) => (
                  <li key={h.name} className="flex items-center justify-between gap-3 px-2 py-1.5 text-xs sm:text-sm rounded-md hover:bg-[var(--surface-well)]">
                    <span className="flex items-center gap-2 text-ink">
                      <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
                      {h.name}
                    </span>
                    <span className="text-ink-secondary font-mono text-xs tx-num">{h.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm font-semibold text-ink">Your session</h2>
            <div className="tx-card p-3.5 space-y-2 text-xs sm:text-sm" data-testid="overview-session">
              <Row label="Signed allowance" value={formatUsd(capUsd)} />
              <Row label="Simulator runs" value={String(totals.runs)} />
              <Row label="Saved by TALOS" value={formatUsd(totals.savedUsd)} />
              <Row label="Awaiting approval" value={String(awaiting)} />
              {lastRun ? <p className="text-xs text-ink-secondary pt-0.5">Last run: {lastRun.headline}</p> : <p className="text-xs text-ink-muted pt-0.5">No runs yet. Start one in the simulator.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-secondary">{label}</span>
      <span className="font-semibold tx-num text-ink">{value}</span>
    </div>
  );
}
