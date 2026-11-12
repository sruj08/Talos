'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, KeyRound, Landmark, LayoutDashboard } from 'lucide-react';
import { HeroAgentPreview } from './HeroAgentPreview';
import { TalosLogoMark } from '../brand/TalosLogoMark';

export const HERO_HEADLINE = 'Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed.';

const HERO_PILLS = [
  { icon: Cpu, label: '2.84ms DOM firewall' },
  { icon: KeyRound, label: '$300 Ed25519 allowance' },
  { icon: Landmark, label: '2PC PayPal escrow' },
] as const;

export function LandingHero() {
  return (
    <section
      className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-6 pb-6 md:pt-8 md:pb-8 grid grid-cols-1 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] gap-8 lg:gap-10 items-center"
      data-testid="startup-landing-hero"
      aria-labelledby="landing-hero-title"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 tx-chip !min-h-[26px] !px-2.5">
          <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
          <TalosLogoMark size={18} />
          <span className="text-ink">Cryptographic KYA firewall &amp; reversible PayPal referee</span>
        </div>

        <h1
          id="landing-hero-title"
          className="tx-display max-w-[22ch]"
        >
          {HERO_HEADLINE}
        </h1>

        <p className="tx-lede">
          The zero-trust firewall and reversible PayPal escrow referee for AI agents that shop with real money.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Link
            href="/simulator"
            className="btn-paypal-primary !min-h-[42px] !px-5"
            data-testid="landing-try-demo-cta"
          >
            <span>Launch live demo</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>

          <Link
            href="/command-center"
            className="btn-paypal-secondary !min-h-[42px] !px-5"
            data-testid="landing-enter-workspace-cta"
          >
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Enter workspace</span>
          </Link>
        </div>

        <ul className="flex flex-wrap items-center gap-2 pt-0.5" aria-label="Core clearing guarantees">
          {HERO_PILLS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="tx-chip !min-h-[26px] !px-2.5 tx-num">
                <Icon className="h-3.5 w-3.5 text-ink-secondary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <HeroAgentPreview />
      </div>
    </section>
  );
}
