'use client';

import React from 'react';
import { ARCHITECTURE_PILLARS, ArchitecturePillar } from '../../lib/landing-content';
import { AllowanceCardVisual, EscrowVisual, RadarVisual, SanitizerVisual } from './PillarVisuals';

const VISUALS: Record<ArchitecturePillar['visual'], React.ComponentType> = {
  allowance: AllowanceCardVisual,
  sanitizer: SanitizerVisual,
  radar: RadarVisual,
  escrow: EscrowVisual,
};

export function HowItWorksPillars() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-8 py-16 md:py-24 space-y-10" data-testid="landing-how-it-works" aria-labelledby="how-it-works-title">
      <div className="space-y-3 max-w-[56ch]">
        <p className="paypal-label text-ink-paypal">How TALOS works</p>
        <h2 id="how-it-works-title" className="tx-section-title">Four checks between your agent and your money</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ARCHITECTURE_PILLARS.map((p, i) => {
          const Visual = VISUALS[p.visual];
          return (
            <article
              key={p.index}
              className={`tx-card p-5 sm:p-6 flex flex-col gap-6 ${i % 3 === 0 ? 'md:min-h-[400px]' : ''}`}
              data-testid={`talos-pillar-${i + 1}`}
            >
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="tx-index">{p.index}</span>
                  <span className="text-sm text-ink-muted tx-num">
                    <span className="text-ink font-semibold">{p.stat}</span> {p.statLabel}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-ink">{p.title}</h3>
                <p className="text-base text-ink-secondary max-w-[48ch]">{p.promise}</p>
              </div>
              <div className="mt-auto">
                <Visual />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
