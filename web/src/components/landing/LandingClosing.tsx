'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Landmark,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { INVESTOR_METRICS } from '../../lib/landing-content';
import { GridPatternOverlay, SegmentedTelemetryBar } from '@/components/ui/fintech-primitives';
import { TalosLogoMark } from '../brand/TalosLogoMark';

const METRIC_ICONS = [TrendingUp, Landmark, ShieldCheck] as const;
const METRIC_BARS = [
  { value: 88, max: 100, left: 'Autonomous GMV capture', right: '2028 target' },
  { value: 48, max: 48, left: 'Escrow float duration', right: '48h SLA window' },
  { value: 100, max: 100, left: 'Pre-capture dispute shield', right: '0.00% leakage' },
];

export function InvestorEconomics() {
  return (
    <section
      className="mx-auto max-w-[1240px] px-4 sm:px-6 py-5 md:py-7 space-y-4"
      data-testid="investor-business-pitch-strip"
      aria-labelledby="economics-title"
    >
      <div className="space-y-1 max-w-[54ch]">
        <p className="paypal-label text-ink-secondary">Enterprise &amp; Float Economics</p>
        <h2 id="economics-title" className="tx-section-title">
          Why PayPal and enterprises win
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INVESTOR_METRICS.map((m, i) => {
          const Icon = METRIC_ICONS[i] || ShieldCheck;
          const bar = METRIC_BARS[i] || METRIC_BARS[0];
          return (
            <div key={m.label} className="tx-card relative overflow-hidden p-5 space-y-3 flex flex-col justify-between">
              <GridPatternOverlay squares={[[1 + i, 1], [3, 2], [5, 1]]} />
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] icon-medallion-paypal shrink-0"
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="tx-chip tx-key">Verified</span>
              </div>
              <p className="text-3xl sm:text-4xl tx-num-display text-ink relative z-10">
                {m.value}
              </p>
              <div className="space-y-2.5 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-semibold text-ink">{m.label}</h3>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">{m.detail}</p>
                </div>
                <SegmentedTelemetryBar
                  value={bar.value}
                  max={bar.max}
                  segments={16}
                  tone="paypal"
                  labelLeft={bar.left}
                  labelRight={bar.right}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function LaunchBanner() {
  return (
    <section
      className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-8 md:pb-10 pt-2"
      data-testid="landing-launch-banner"
    >
      <div className="tx-card relative overflow-hidden p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 items-center border-[var(--border-strong)]">
        <GridPatternOverlay squares={[[2, 1], [4, 2], [6, 1]]} />
        <div className="space-y-1.5 relative z-10">
          <p className="font-mono text-xs font-semibold text-ink-secondary">LIVE DETERMINISTIC SANDBOX</p>
          <h2 className="tx-section-title text-ink">
            Try to scam the agent yourself
          </h2>
          <p className="text-sm text-ink-secondary max-w-[54ch]">
            No sign-up, no keys. The full flow runs in your browser with a deterministic PayPal Sandbox replay.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 relative z-10">
          <Link
            href="/simulator"
            className="btn-paypal-primary !min-h-[42px] !px-5 font-semibold"
            data-testid="landing-launch-sim"
          >
            Launch live demo
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link
            href="/command-center"
            className="btn-paypal-secondary !min-h-[42px] !px-5"
            data-testid="landing-launch-workspace"
          >
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Enter workspace
          </Link>
        </div>
      </div>
    </section>
  );
}

const FOOTER_LINKS = [
  { href: '/story', label: 'Product tour' },
  { href: '/simulator', label: 'Live demo' },
  { href: '/command-center', label: 'Workspace' },
  { href: '/mandates', label: 'Spending allowance' },
  { href: '/blotter', label: 'CFO ledger' },
  { href: '/login', label: 'Pick a role' },
];

export function PublicFooter() {
  return (
    <footer className="paypal-footer !py-6" data-testid="public-footer">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <TalosLogoMark size={28} />
          <div>
            <p className="text-sm font-bold text-ink">TALOS</p>
            <p className="text-xs text-ink-secondary">
              Zero-trust checkout for AI agents, settled on PayPal.
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-1.5" aria-label="Footer">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs sm:text-sm font-medium text-ink-secondary hover:text-ink min-h-[28px] inline-flex items-center"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
