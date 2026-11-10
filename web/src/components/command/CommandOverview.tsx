'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarClock, FileSpreadsheet, KeyRound, MonitorPlay, PlayCircle, ShieldBan, ShieldCheck, TrendingDown, UserCheck, Wallet } from 'lucide-react';
import { useTalosClearing } from '../../context/TalosClearingContext';
import { useSimulatorRun } from '../../context/SimulatorRunContext';
import { formatUsd } from '../../lib/sim/storefront-catalog';

const WORKSPACES = [
  { href: '/simulator', title: 'Live simulator', body: 'Watch an agent shop and try to break it.', icon: MonitorPlay, accent: '#0070E0' },
  { href: '/mandates', title: 'Spending allowance', body: 'Set the cap, price spread and delivery rule.', icon: KeyRound, accent: '#003087' },
  { href: '/blotter', title: 'CFO escrow ledger', body: 'Every hold, capture, void and blocked attack.', icon: FileSpreadsheet, accent: '#0A7A3D' },
  { href: '/sla', title: 'Delivery SLA', body: '29-day holds and 48h carrier deadlines.', icon: CalendarClock, accent: '#B45309' },
  { href: '/step-up', title: 'Human approval', body: 'Co-sign carts that exceed the cap.', icon: UserCheck, accent: '#D9360B' },
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
    { id: 'kpi-protected-gmv', label: 'Protected GMV', caption: 'Money protected inside reversible PayPal holds', value: usdFromCents(kpiMetrics.protectedGmvCents), icon: ShieldCheck, tone: 'text-ink-paypal' },
    { id: 'kpi-blocked-injections', label: 'Blocked Prompt Injections', caption: 'Hack attempts stopped before reaching the AI', value: String(kpiMetrics.blockedInjectionsCount), icon: ShieldBan, tone: 'text-ink-crimson' },
    { id: 'kpi-channel3-savings', label: 'Channel3 Savings', caption: 'Money saved by blocking overpriced sellers', value: usdFromCents(kpiMetrics.channel3SavingsCents + totals.savedUsd * 100), icon: TrendingDown, tone: 'text-ink-emerald' },
    { id: 'kpi-active-holds', label: 'Active PayPal Authorizations', caption: 'Orders held in escrow awaiting carrier delivery', value: String(kpiMetrics.activePayPalAuthCount), icon: Wallet, tone: 'text-ink-amber' },
  ];

  const health = [
    { name: 'Rust firewall', detail: `p99 ${kpiMetrics.firewallP99LatencyMs}ms` },
    { name: 'Go escrow orchestrator', detail: live ? 'Streaming' : 'Replay stream' },
    { name: 'PayPal Sandbox', detail: live ? 'Live' : 'Deterministic replay' },
    { name: 'Channel3 price oracle', detail: 'Benchmarks cached' },
  ];

  return (
    <div className="space-y-6" data-testid="sovereign-telemetry-header">
      <div data-testid="kpi-header-bar" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.id} data-testid={k.id} className="tx-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-ink-secondary">{k.label}</span>
                <Icon className={`h-4 w-4 ${k.tone}`} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-semibold text-ink tabular-nums">{k.value}</p>
              <p className="text-xs text-ink-muted leading-snug">{k.caption}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6">
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ink">Workspaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WORKSPACES.map((w) => {
              const Icon = w.icon;
              return (
                <Link key={w.href} href={w.href} className="tx-card p-4 flex items-start gap-3 group hover:border-[var(--border-strong)] active:scale-[0.99] transition-transform" data-testid={`overview-card-${w.href.slice(1)}`}>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md shrink-0 text-white" style={{ backgroundColor: w.accent }}>
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink">
                      {w.title}
                      <ArrowUpRight className="h-4 w-4 text-ink-muted group-hover:text-ink-paypal" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="block text-sm text-ink-secondary mt-0.5">{w.body}</span>
                  </span>
                </Link>
              );
            })}
            <Link href="/story" className="tx-well p-4 flex items-start gap-3 hover:bg-[var(--surface)]" data-testid="overview-guided-tour">
              <PlayCircle className="h-9 w-9 text-ink-paypal shrink-0" strokeWidth={1.25} aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-ink">Guided judge tour</span>
                <span className="block text-sm text-ink-secondary mt-0.5">Five stages, about 60 seconds.</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-ink">System health</h2>
            <ul className="tx-card p-2" data-testid="overview-system-health">
              {health.map((h) => (
                <li key={h.name} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
                    {h.name}
                  </span>
                  <span className="text-ink-secondary tx-num">{h.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-ink">Your session</h2>
            <div className="tx-card p-4 space-y-3 text-sm" data-testid="overview-session">
              <Row label="Signed allowance" value={formatUsd(capUsd)} />
              <Row label="Simulator runs" value={String(totals.runs)} />
              <Row label="Saved by TALOS" value={formatUsd(totals.savedUsd)} tone="text-ink-emerald" />
              <Row label="Awaiting approval" value={String(awaiting)} tone={awaiting ? 'text-ink-amber' : undefined} />
              {lastRun ? <p className="text-ink-secondary">Last run: {lastRun.headline}</p> : <p className="text-ink-muted">No runs yet. Start one in the simulator.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-secondary">{label}</span>
      <span className={`font-semibold tx-num ${tone ?? 'text-ink'}`}>{value}</span>
    </div>
  );
}
