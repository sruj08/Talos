'use client';

import React from 'react';
import { Gauge, KeyRound, Landmark, ScanSearch } from 'lucide-react';
import { ARCHITECTURE_PILLARS, ArchitecturePillar } from '../../lib/landing-content';
import {
  AllowanceCardVisual,
  EscrowVisual,
  RadarVisual,
  SanitizerVisual,
} from './PillarVisuals';
import { GridPatternOverlay } from '@/components/ui/fintech-primitives';

const VISUALS: Record<ArchitecturePillar['visual'], React.ComponentType> = {
  allowance: AllowanceCardVisual,
  sanitizer: SanitizerVisual,
  radar: RadarVisual,
  escrow: EscrowVisual,
};

const PILLAR_ICONS: Record<
  ArchitecturePillar['visual'],
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  allowance: KeyRound,
  sanitizer: ScanSearch,
  radar: Gauge,
  escrow: Landmark,
};

export function HowItWorksPillars() {
  return (
    <section
      className="mx-auto max-w-[1240px] px-4 sm:px-6 py-5 md:py-7 space-y-4"
      data-testid="landing-how-it-works"
      aria-labelledby="how-it-works-title"
    >
      <div className="space-y-1 max-w-[56ch]">
        <p className="paypal-label text-ink-secondary">How TALOS works</p>
        <h2 id="how-it-works-title" className="tx-section-title">
          Four checks between your agent and your money
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ARCHITECTURE_PILLARS.map((p, i) => {
          const Visual = VISUALS[p.visual];
          const Icon = PILLAR_ICONS[p.visual];
          return (
            <article
              key={p.index}
              className="tx-card relative overflow-hidden h-full p-4 sm:p-5 flex flex-col justify-between gap-4"
              data-testid={`talos-pillar-${i + 1}`}
            >
              <GridPatternOverlay
                squares={[
                  [1 + i, 1],
                  [3 + (i % 2), 2],
                  [5, 1 + (i % 2)],
                ]}
              />
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2">
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] icon-medallion-paypal shrink-0"
                      aria-hidden="true"
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="tx-index">{p.index}</span>
                  </div>
                  <span className="tx-chip tx-num">
                    <span className="text-ink font-semibold">{p.stat}</span> {p.statLabel}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-ink">{p.title}</h3>
                <p className="text-xs sm:text-sm text-ink-secondary max-w-[52ch]">{p.promise}</p>
              </div>
              <div className="relative z-10">
                <Visual />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
