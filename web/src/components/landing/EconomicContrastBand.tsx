'use client';

import React from 'react';
import { Card } from '@heroui/react';
import { Landmark, ShieldCheck, ShieldOff, TriangleAlert } from 'lucide-react';
import {
  BreakdownStatRail,
  GridPatternOverlay,
  SegmentedTelemetryBar,
} from '@/components/ui/fintech-primitives';

export function EconomicContrastBand() {
  return (
    <section
      className="mx-auto max-w-[1240px] px-4 sm:px-6 py-3"
      data-testid="landing-economic-contrast"
      aria-label="Unprotected versus protected outcome"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-4">
        <Card className="tx-card relative overflow-hidden h-full p-5 flex flex-col justify-between gap-4">
          <GridPatternOverlay squares={[[1, 1], [3, 2], [5, 1]]} />
          <Card.Header className="p-0 relative z-10">
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md icon-medallion-paypal shrink-0"
                  aria-hidden="true"
                >
                  <TriangleAlert className="h-4 w-4 text-ink-secondary" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-ink font-semibold leading-tight">Unprotected AI buyer</p>
                  <p className="text-xs font-normal text-ink-muted">Standard autonomous browser agent</p>
                </div>
              </div>
              <span className="tx-chip">
                <span className="w-1.5 h-1.5 rounded-xs dot-crimson" aria-hidden="true" />
                <ShieldOff className="h-3 w-3 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
                No firewall
              </span>
            </div>
          </Card.Header>

          <Card.Content className="p-0 space-y-3 relative z-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <p
                  className="text-3xl sm:text-4xl tx-num-display text-ink"
                  data-testid="contrast-unprotected-amount"
                >
                  -$480
                </p>
                <span className="tx-chip tx-num">Irreversible wire</span>
              </div>
              <span className="font-mono text-xs text-ink-muted tabular-nums">Loss: 100%</span>
            </div>
            <p className="text-sm text-ink-secondary">
              Lost irreversibly to one hidden line of text.
            </p>
            <SegmentedTelemetryBar
              value={480}
              max={480}
              segments={20}
              tone="neutral"
              labelLeft="Mandate breach exposure"
              labelRight="160% of $300 cap"
            />
          </Card.Content>

          <Card.Footer className="p-0 relative z-10">
            <div className="w-full tx-well p-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-ink-muted block">DOM Override</span>
                <span className="font-semibold text-ink">Executed</span>
              </div>
              <div>
                <span className="text-ink-muted block">Price Spread</span>
                <span className="font-semibold text-ink tx-num">+92.7% gouge</span>
              </div>
              <div>
                <span className="text-ink-muted block">Settlement</span>
                <span className="font-semibold text-ink">No recourse</span>
              </div>
            </div>
          </Card.Footer>
        </Card>

        <Card className="tx-card relative overflow-hidden h-full p-5 flex flex-col justify-between gap-4 border-[#B8D3F8] dark:border-[#1E3A5F]">
          <GridPatternOverlay squares={[[2, 1], [4, 2], [6, 1]]} />
          <Card.Header className="p-0 relative z-10">
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md icon-medallion-paypal shrink-0"
                  aria-hidden="true"
                >
                  <Landmark className="h-4 w-4 text-ink-paypal" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-ink font-semibold leading-tight">TALOS + PayPal protected buyer</p>
                  <p className="text-xs font-normal text-ink-muted">Cryptographic KYA &amp; 2PC escrow referee</p>
                </div>
              </div>
              <span className="tx-chip tx-chip--paypal tx-num">
                <span className="w-1.5 h-1.5 rounded-xs dot-paypal" aria-hidden="true" />
                <ShieldCheck className="h-3 w-3 text-ink-paypal" strokeWidth={1.75} aria-hidden="true" />
                2.84ms shield
              </span>
            </div>
          </Card.Header>

          <Card.Content className="p-0 space-y-3 relative z-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-3">
                <p
                  className="text-3xl sm:text-4xl tx-num-display text-ink"
                  data-testid="contrast-protected-amount"
                >
                  $249
                </p>
                <span className="tx-chip tx-chip--paypal font-mono font-semibold tx-num">
                  +$231 saved
                </span>
              </div>
              <span className="font-mono text-xs text-ink-paypal tabular-nums">Escrow verified</span>
            </div>
            <p className="text-sm text-ink-secondary">
              Held safely in PayPal escrow until delivery is proven.
            </p>
            <BreakdownStatRail
              segments={[
                { label: 'Escrow hold', valueLabel: '$249', weight: 249, tone: 'paypal' },
                { label: 'Channel3 saved', valueLabel: '+$231', weight: 231, tone: 'neutral' },
              ]}
            />
          </Card.Content>

          <Card.Footer className="p-0 relative z-10">
            <div className="w-full tx-well p-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-ink-muted block">DOM Firewall</span>
                <span className="font-semibold text-ink tx-num">2.84ms clean</span>
              </div>
              <div>
                <span className="text-ink-muted block">Channel3 Oracle</span>
                <span className="font-semibold text-ink tx-num">$249 median</span>
              </div>
              <div>
                <span className="text-ink-muted block">PayPal 2PC</span>
                <span className="font-semibold text-ink tx-num">48h SLA hold</span>
              </div>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </section>
  );
}
