'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { HeroAgentPreview } from './HeroAgentPreview';

export const HERO_HEADLINE = 'Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed.';

export function LandingHero() {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring' as const, bounce: 0, duration: 0.6, delay } };

  return (
    <section
      className="mx-auto max-w-[1240px] px-4 sm:px-8 pt-12 pb-16 md:pt-20 md:pb-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-12 lg:gap-16 items-center"
      data-testid="startup-landing-hero"
      aria-labelledby="landing-hero-title"
    >
      <div className="space-y-7">
        <motion.h1 id="landing-hero-title" className="tx-display !text-[clamp(2.25rem,3.6vw,3.25rem)] max-w-[22ch]" {...enter(0)}>
          {HERO_HEADLINE}
        </motion.h1>
        <motion.p className="tx-lede" {...enter(0.08)}>
          The zero-trust firewall and reversible PayPal escrow referee for AI agents that shop with real money.
        </motion.p>
        <motion.div className="flex flex-wrap items-center gap-3" {...enter(0.16)}>
          <Link href="/simulator" className="btn-paypal-primary !min-h-[48px] !px-6" data-testid="landing-try-demo-cta">
            Launch live demo
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link href="/command-center" className="btn-paypal-secondary !min-h-[48px] !px-6" data-testid="landing-enter-workspace-cta">
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Enter workspace
          </Link>
        </motion.div>
      </div>
      <motion.div {...enter(0.12)}>
        <HeroAgentPreview />
      </motion.div>
    </section>
  );
}
