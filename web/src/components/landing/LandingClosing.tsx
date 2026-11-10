'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { INVESTOR_METRICS } from '../../lib/landing-content';

export function InvestorEconomics() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-8 py-16 md:py-24 space-y-10" data-testid="investor-business-pitch-strip" aria-labelledby="economics-title">
      <h2 id="economics-title" className="tx-section-title max-w-[22ch]">Why PayPal and enterprises win</h2>
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-x-10 gap-y-8">
        {INVESTOR_METRICS.map((m, i) => (
          <div key={m.label} className={`space-y-2 ${i === 0 ? 'md:pr-6' : ''}`}>
            <p className={`font-semibold tracking-[-0.035em] text-ink tx-num ${i === 0 ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'}`}>{m.value}</p>
            <h3 className="text-base font-semibold text-ink">{m.label}</h3>
            <p className="text-sm text-ink-secondary max-w-[36ch]">{m.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LaunchBanner() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-8 pb-16 md:pb-24" data-testid="landing-launch-banner">
      <div className="rounded-[28px] bg-[#001C64] text-white px-6 py-12 sm:px-12 sm:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 items-center">
        <div className="space-y-3">
          <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold leading-tight tracking-[-0.035em] text-white">Try to scam the agent yourself</h2>
          <p className="text-base text-[#C7D4EA] max-w-[52ch]">No sign-up, no keys. The full flow runs in your browser with a deterministic PayPal Sandbox replay.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/simulator" className="btn-checkout-yellow !min-h-[48px] !px-6 font-semibold" data-testid="landing-launch-sim">
            Launch live demo
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link href="/command-center" className="btn-paypal-secondary !min-h-[48px] !px-6 !bg-transparent !text-white !border-[rgba(255,255,255,0.4)]" data-testid="landing-launch-workspace">
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
    <footer className="paypal-footer" data-testid="public-footer">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-base font-semibold text-ink">TALOS</p>
          <p className="text-sm text-ink-secondary">Zero-trust checkout for AI agents, settled on PayPal.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-secondary hover:text-ink min-h-[32px] inline-flex items-center">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
