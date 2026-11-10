'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Bot, Check, Lock, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { PREVIEW_SCENARIOS, PreviewOutcome, PreviewScenarioId } from '../../lib/landing-content';

export function ScenarioPreviewFrame() {
  const [active, setActive] = useState<PreviewScenarioId>('SCAM');
  const scenario = PREVIEW_SCENARIOS.find((s) => s.id === active) ?? PREVIEW_SCENARIOS[0];

  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-8 py-16 md:py-24 space-y-8" data-testid="landing-scenario-preview" aria-labelledby="scenario-preview-title">
      <div className="space-y-3 max-w-[60ch]">
        <h2 id="scenario-preview-title" className="tx-section-title">Same agent, same store, different ending</h2>
        <p className="tx-lede">Pick a scenario and watch what happens with and without TALOS.</p>
      </div>

      <div className="tx-card overflow-hidden">
        <div className="flex gap-1 overflow-x-auto p-2 bg-[var(--surface-well)]" role="tablist" aria-label="Preview scenarios">
          {PREVIEW_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`scenario-tab-${s.id}`}
              aria-selected={active === s.id}
              aria-controls="scenario-preview-panel"
              onClick={() => setActive(s.id)}
              className="tx-tab flex-col !items-start !gap-0 shrink-0 min-w-[200px]"
              data-testid={`landing-scenario-tab-${s.id.toLowerCase()}`}
            >
              <span>{s.tab}</span>
              <span className="text-xs font-normal text-ink-muted tx-num">{s.tabMeta}</span>
            </button>
          ))}
        </div>

        <div id="scenario-preview-panel" role="tabpanel" aria-labelledby={`scenario-tab-${active}`} className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-5 text-sm text-ink-secondary">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>{scenario.storeUrl}</span>
            <span aria-hidden="true">/</span>
            <span className="text-ink">{scenario.item}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OutcomeLane key={`u-${active}`} kind="unprotected" outcome={scenario.unprotected} />
            <OutcomeLane key={`p-${active}`} kind="protected" outcome={scenario.protectedRun} />
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/simulator" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-paypal min-h-[40px]" data-testid="landing-scenario-open-sim">
              Run this scenario yourself
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function OutcomeLane({ kind, outcome }: { kind: 'unprotected' | 'protected'; outcome: PreviewOutcome }) {
  const reduce = useReducedMotion();
  const safe = kind === 'protected';
  return (
    <div
      className={`rounded-[16px] p-5 space-y-5 ${safe ? 'bg-[rgba(10,122,61,0.06)] shadow-[inset_0_0_0_1px_rgba(10,122,61,0.25)]' : 'bg-[rgba(217,54,11,0.05)] shadow-[inset_0_0_0_1px_rgba(217,54,11,0.22)]'}`}
      data-testid={safe ? 'landing-lane-protected' : 'landing-lane-unprotected'}
    >
      <div className="flex items-center gap-2">
        {safe ? (
          <ShieldCheck className="h-5 w-5 text-ink-emerald" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <ShieldOff className="h-5 w-5 text-ink-crimson" strokeWidth={1.75} aria-hidden="true" />
        )}
        <span className="text-sm font-semibold text-ink">{safe ? 'TALOS + PayPal agent' : 'Unprotected agent'}</span>
      </div>

      <ol className="space-y-3">
        <AnimatePresence initial>
          {outcome.beats.map((beat, i) => (
            <motion.li
              key={beat}
              className="flex items-center gap-3 text-sm text-ink"
              initial={reduce ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.45, delay: reduce ? 0 : 0.18 + i * 0.32 }}
            >
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md shrink-0 ${safe ? 'bg-[#0A7A3D] text-white' : 'bg-[var(--surface)] text-ink-crimson'}`}>
                {i === 0 ? <Bot className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> : safe ? <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> : <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />}
              </span>
              {beat}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: reduce ? 0 : 1.2 }}
      >
        <p className={`text-4xl font-semibold tx-num ${safe ? 'text-ink-emerald' : 'text-ink-crimson'}`}>{outcome.amount}</p>
        <p className="text-sm text-ink-secondary mt-1">{outcome.verdict}</p>
      </motion.div>
    </div>
  );
}
