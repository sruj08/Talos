'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Landmark, TriangleAlert } from 'lucide-react';

export function EconomicContrastBand() {
  const reduce = useReducedMotion();
  const reveal = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { type: 'spring' as const, bounce: 0, duration: 0.6, delay },
        };

  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-8" data-testid="landing-economic-contrast" aria-label="Unprotected versus protected outcome">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-4 md:gap-0">
        <motion.div className="tx-card p-6 sm:p-8 space-y-4 md:rounded-r-none" {...reveal(0)}>
          <div className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
            <TriangleAlert className="h-4 w-4 text-ink-crimson" strokeWidth={1.75} aria-hidden="true" />
            Unprotected AI buyer
          </div>
          <p className="text-[clamp(3rem,7vw,5.5rem)] leading-none font-semibold tracking-[-0.04em] text-ink-crimson tx-num" data-testid="contrast-unprotected-amount">
            -$480
          </p>
          <p className="text-base text-ink-secondary">Lost irreversibly to one hidden line of text.</p>
        </motion.div>

        <div className="hidden md:flex items-center justify-center px-5 bg-[var(--surface-well)] border-y border-[var(--border)]" aria-hidden="true">
          <span className="text-sm font-semibold text-ink-muted">vs</span>
        </div>

        <motion.div className="tx-card p-6 sm:p-8 space-y-4 md:rounded-l-none shadow-[inset_0_4px_0_0_#0A7A3D]" {...reveal(0.12)}>
          <div className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
            <Landmark className="h-4 w-4 text-ink-emerald" strokeWidth={1.75} aria-hidden="true" />
            TALOS + PayPal protected buyer
          </div>
          <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
            <p className="text-[clamp(3rem,7vw,5.5rem)] leading-none font-semibold tracking-[-0.04em] text-ink tx-num" data-testid="contrast-protected-amount">
              $249
            </p>
            <p className="text-2xl font-semibold text-ink-emerald tx-num pb-2">+$231 saved</p>
          </div>
          <p className="text-base text-ink-secondary">Held safely in PayPal escrow until delivery is proven.</p>
        </motion.div>
      </div>
    </section>
  );
}
