'use client';

import React, { useEffect, useState } from 'react';
import NumberFlow from '@number-flow/react';
import { Lock, Scale, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useTalosClearing } from '../context/TalosClearingContext';
import { GuidedDemoBanner } from './GuidedDemoBanner';

export function SovereignTopTelemetryBar() {
  const { rows, kpiMetrics } = useTalosClearing();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const hasVoidOrCapture = rows.some((r) => r.state === 'PAYPAL_CAPTURED' || r.state === 'PAYPAL_VOIDED');
  const pipelineStage = hasVoidOrCapture ? 'CAPTURED / VOIDED' : 'AUTHORIZED';
  const pipelineProgressPct = hasVoidOrCapture ? 100 : 38;

  return (
    <header className="w-full" data-testid="sovereign-telemetry-header">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 icon-medallion-paypal" aria-hidden="true">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.6} />
            </span>
            <div>
              <h1 className="paypal-headline-lg text-ink">TALOS Command Center</h1>
              <p className="paypal-body-sm text-ink-secondary">
                Live clearinghouse telemetry, guided simulator, and PayPal two-phase settlement pipeline
              </p>
            </div>
          </div>

          <div
            className="sovereign-subcard px-4 py-2.5 flex flex-wrap items-center gap-3 text-xs font-mono rounded-pill"
            data-testid="paypal-2pc-pipeline-bar"
          >
            <span className="text-ink-muted">PayPal 2PC Pipeline:</span>
            <span className={pipelineStage === 'AUTHORIZED' ? 'text-ink font-semibold' : 'text-ink-muted'}>AUTHORIZED</span>
            <span className="text-ink-muted">&rarr;</span>
            <span className="text-ink-muted">SLA VERIFIED</span>
            <span className="text-ink-muted">&rarr;</span>
            <span className={pipelineStage === 'CAPTURED / VOIDED' ? 'text-ink-emerald font-semibold' : 'text-ink-muted'}>
              CAPTURED / VOIDED
            </span>
            <div className="w-20 h-1.5 rounded-pill overflow-hidden bar-track ml-1" aria-hidden="true">
              <div className="h-full dot-paypal transition-all duration-300" style={{ width: `${pipelineProgressPct}%` }} />
            </div>
          </div>
        </div>

        <section
          aria-label="Key clearinghouse telemetry"
          data-testid="kpi-header-bar"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <div data-testid="kpi-protected-gmv" className="paypal-pricing-card flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="w-12 h-12 icon-medallion-paypal" aria-hidden="true">
                <ShieldCheck className="w-6 h-6" strokeWidth={1.6} />
              </span>
              <span className="font-mono text-xs text-ink-emerald tabular-nums">+14% vs 30d</span>
            </div>
            <div className="space-y-1">
              <div className="paypal-label text-ink-secondary">Protected GMV</div>
              <div className="paypal-pricing-display text-2xl sm:text-3xl font-bold text-ink tabular-nums">
                {hydrated ? (
                  <span className="inline-flex items-baseline gap-2">
                    <NumberFlow value={kpiMetrics.protectedGmvCents / 100} format={{ style: 'currency', currency: 'USD' }} />
                    <span className="text-xs font-mono text-ink-muted">({kpiMetrics.protectedGmvUsd.split('(')[1] || '₹20,93,280)'}</span>
                  </span>
                ) : (
                  kpiMetrics.protectedGmvUsd
                )}
              </div>
              <p className="paypal-caption text-ink-secondary">Money protected inside reversible PayPal holds</p>
            </div>
          </div>

          <div data-testid="kpi-blocked-injections" className="paypal-pricing-card flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="w-12 h-12 icon-medallion-crimson" aria-hidden="true">
                <ShieldAlert className="w-6 h-6" strokeWidth={1.6} />
              </span>
              <span className="font-mono text-xs text-ink-secondary tabular-nums">100% recall</span>
            </div>
            <div className="space-y-1">
              <div className="paypal-label text-ink-secondary">Blocked Prompt Injections</div>
              <div className="paypal-pricing-display text-2xl sm:text-3xl font-bold text-ink tabular-nums">
                {hydrated ? (
                  <span className="inline-flex items-baseline gap-1.5">
                    <NumberFlow value={kpiMetrics.blockedInjectionsCount} />
                    <span>Blocked</span>
                  </span>
                ) : (
                  `${kpiMetrics.blockedInjectionsCount} Blocked`
                )}
              </div>
              <p className="paypal-caption text-ink-secondary">Hack attempts stopped before reaching the AI</p>
            </div>
          </div>

          <div data-testid="kpi-channel3-savings" className="paypal-pricing-card flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="w-12 h-12 icon-medallion-emerald" aria-hidden="true">
                <Scale className="w-6 h-6" strokeWidth={1.6} />
              </span>
              <span className="font-mono text-xs text-ink-secondary tabular-nums">-380 bps</span>
            </div>
            <div className="space-y-1">
              <div className="paypal-label text-ink-secondary">Channel3 Savings</div>
              <div className="paypal-pricing-display text-2xl sm:text-3xl font-bold text-ink-paypal tabular-nums">
                {hydrated ? (
                  <span className="inline-flex items-baseline gap-2">
                    <NumberFlow value={kpiMetrics.channel3SavingsCents / 100} format={{ style: 'currency', currency: 'USD' }} />
                    <span className="text-xs font-mono text-ink-muted">({kpiMetrics.channel3SavingsUsd.split('(')[1] || '₹3,46,080)'}</span>
                  </span>
                ) : (
                  kpiMetrics.channel3SavingsUsd
                )}
              </div>
              <p className="paypal-caption text-ink-secondary">Money saved by blocking overpriced sellers</p>
            </div>
          </div>

          <div data-testid="kpi-active-paypal-auths" className="paypal-pricing-card flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="w-12 h-12 icon-medallion-amber" aria-hidden="true">
                <Lock className="w-6 h-6" strokeWidth={1.6} />
              </span>
              <span className="font-mono text-xs text-ink-secondary tabular-nums">29d honor</span>
            </div>
            <div className="space-y-1">
              <div className="paypal-label text-ink-secondary">Active PayPal Authorizations</div>
              <div className="paypal-pricing-display text-2xl sm:text-3xl font-bold text-ink tabular-nums">
                {hydrated ? (
                  <span className="inline-flex items-baseline gap-1.5">
                    <NumberFlow value={kpiMetrics.activePayPalAuthCount} />
                    <span>Active Holds</span>
                  </span>
                ) : (
                  `${kpiMetrics.activePayPalAuthCount} Active Holds`
                )}
              </div>
              <p className="paypal-caption text-ink-secondary">Orders held in escrow awaiting carrier delivery</p>
            </div>
          </div>
        </section>

        <GuidedDemoBanner />
      </div>
    </header>
  );
}
