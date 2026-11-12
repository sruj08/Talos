'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  Clock,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  X,
} from 'lucide-react';
import { PREVIEW_SCENARIOS, PreviewOutcome, PreviewScenarioId } from '../../lib/landing-content';

const SCENARIO_ICONS: Record<PreviewScenarioId, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  SCAM: ShieldAlert,
  HONEST: BadgeCheck,
  LATE_BIG: Clock,
};

export function ScenarioPreviewFrame() {
  const [active, setActive] = useState<PreviewScenarioId>('SCAM');
  const scenario = PREVIEW_SCENARIOS.find((s) => s.id === active) ?? PREVIEW_SCENARIOS[0];

  return (
    <section
      className="mx-auto max-w-[1240px] px-4 sm:px-6 py-5 md:py-7 space-y-4"
      data-testid="landing-scenario-preview"
      aria-labelledby="scenario-preview-title"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-1 max-w-[60ch]">
          <p className="paypal-label text-ink-secondary">Interactive Scenario Matrix</p>
          <h2 id="scenario-preview-title" className="tx-section-title">
            Same agent, same store, different ending
          </h2>
          <p className="tx-lede">Pick a scenario and watch what happens with and without TALOS.</p>
        </div>
        <Link
          href="/simulator"
          className="btn-paypal-primary !min-h-[38px] !px-4 text-xs sm:text-sm font-semibold shrink-0 self-start md:self-auto"
          data-testid="landing-scenario-open-sim"
        >
          <span>Run this scenario yourself</span>
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>

      <div className="tx-card p-3 sm:p-4 space-y-3.5">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-1.5 p-1.5 rounded-[8px] bg-[var(--surface-well)] border border-[var(--border)]"
          role="tablist"
          aria-label="Preview scenarios"
        >
          {PREVIEW_SCENARIOS.map((s) => {
            const Icon = SCENARIO_ICONS[s.id];
            const isSelected = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`scenario-tab-${s.id}`}
                aria-selected={isSelected}
                aria-controls="scenario-preview-panel"
                onClick={() => setActive(s.id)}
                className="tx-tab !items-center !justify-between gap-2.5 w-full text-left !px-3 !py-2"
                data-testid={`landing-scenario-tab-${s.id.toLowerCase()}`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md shrink-0 bg-[var(--surface)] text-ink border border-[var(--border)]"
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="font-semibold text-ink text-xs sm:text-sm truncate">{s.tab}</span>
                    <span className="text-[11px] font-normal text-ink-muted tx-num truncate">{s.tabMeta}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div id="scenario-preview-panel" role="tabpanel" aria-labelledby={`scenario-tab-${active}`} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-[8px] bg-[var(--surface-well)] border border-[var(--border)] text-xs text-ink-secondary">
            <div className="flex flex-wrap items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-ink" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-mono text-xs font-medium text-ink">{scenario.storeUrl}</span>
              <span aria-hidden="true" className="text-ink-muted">/</span>
              <span className="text-ink font-semibold">{scenario.item}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="tx-chip tx-key">Ed25519 Cap: $300</span>
              <span className="tx-chip tx-key">SLA: 48h</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <OutcomeLane key={`u-${active}`} kind="unprotected" outcome={scenario.unprotected} />
            <OutcomeLane key={`p-${active}`} kind="protected" outcome={scenario.protectedRun} />
          </div>
        </div>
      </div>
    </section>
  );
}

function OutcomeLane({ kind, outcome }: { kind: 'unprotected' | 'protected'; outcome: PreviewOutcome }) {
  const safe = kind === 'protected';
  return (
    <div
      className={`rounded-[10px] p-4 flex flex-col justify-between gap-4 border ${
        safe ? 'bg-[var(--surface)] border-[var(--border-strong)]' : 'tx-well border-[var(--border)]'
      }`}
      data-testid={safe ? 'landing-lane-protected' : 'landing-lane-unprotected'}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] shrink-0 icon-medallion-paypal"
              aria-hidden="true"
            >
              {safe ? <ShieldCheck className="h-4 w-4 text-ink" strokeWidth={1.75} /> : <ShieldOff className="h-4 w-4 text-ink-secondary" strokeWidth={1.75} />}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{safe ? 'TALOS + PayPal agent' : 'Unprotected agent'}</p>
              <p className="text-xs text-ink-muted">{safe ? 'Zero-trust DOM filter + 2PC escrow' : 'Direct browser execution'}</p>
            </div>
          </div>
          <span className="tx-chip">
            <span className={`w-1.5 h-1.5 rounded-xs ${safe ? 'dot-emerald' : 'dot-crimson'}`} aria-hidden="true" />
            {safe ? 'Escrow protected' : 'Direct exposure'}
          </span>
        </div>

        <ol className="space-y-1.5">
          {outcome.beats.map((beat, i) => (
            <li
              key={beat}
              className="flex items-center justify-between gap-3 rounded-[6px] px-3 py-2 text-xs sm:text-sm text-ink bg-[var(--surface)] border border-[var(--border)]"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] shrink-0 bg-[var(--surface-well)] border border-[var(--border)] text-ink">
                  {i === 0 ? <Bot className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" /> : safe ? <Check className="h-3 w-3" strokeWidth={2} aria-hidden="true" /> : <X className="h-3 w-3 text-ink-secondary" strokeWidth={2} aria-hidden="true" />}
                </span>
                <span className="font-medium">{beat}</span>
              </span>
              <span className="font-mono text-[11px] text-ink-muted tx-num shrink-0">0{i + 1}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-[8px] p-3.5 flex items-end justify-between gap-4 bg-[var(--surface-well)] border border-[var(--border)]">
        <div>
          <p className="text-[11px] font-medium text-ink-muted mb-0.5">{safe ? 'Verified wallet settlement' : 'Net wallet impact'}</p>
          <p className="text-2xl sm:text-3xl tx-num-display text-ink">{outcome.amount}</p>
        </div>
        <p className="text-xs sm:text-sm font-medium text-ink-secondary text-right">{outcome.verdict}</p>
      </div>
    </div>
  );
}
