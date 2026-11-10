'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EyeOff, KeyRound, PlugZap } from 'lucide-react';
import { INTEGRATION_LAYER_LABEL, INTEGRATION_PARTNERS } from '../../lib/integrations-catalog';

const SERVICE_COUNT = INTEGRATION_PARTNERS.reduce((a, p) => a + p.services.length, 0);

export function IntegrationsShowcase() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(INTEGRATION_PARTNERS[0].id);
  const active = INTEGRATION_PARTNERS.find((p) => p.id === activeId) ?? INTEGRATION_PARTNERS[0];

  return (
    <section className="bg-[var(--surface)] py-16 md:py-24" data-testid="landing-integrations" aria-labelledby="integrations-title">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8 space-y-10">
        <div className="space-y-4 max-w-[60ch]">
          <h2 id="integrations-title" className="tx-section-title">Built on platforms you already trust</h2>
          <div className="flex flex-wrap gap-x-10 gap-y-3 pt-2">
            {[
              [String(INTEGRATION_PARTNERS.length), 'platforms wired in'],
              [String(SERVICE_COUNT), 'services and APIs'],
              ['3', 'languages: Rust, Go, TypeScript'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-3xl font-semibold text-ink tx-num">{v}</p>
                <p className="text-sm text-ink-secondary">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5" role="tablist" aria-label="Integration partners" aria-orientation="vertical">
            {INTEGRATION_PARTNERS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`integration-tab-${p.id}`}
                aria-selected={p.id === activeId}
                aria-controls="integration-panel"
                onClick={() => setActiveId(p.id)}
                className="tx-tab !justify-start w-full"
                data-testid={`integration-tab-${p.id}`}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--surface-well)] text-[11px] font-semibold text-ink-paypal shrink-0" aria-hidden="true">
                  {p.mark}
                </span>
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>

          <div id="integration-panel" role="tabpanel" aria-labelledby={`integration-tab-${active.id}`} className="tx-well p-5 sm:p-7 min-h-[380px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="space-y-6"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                data-testid={`integration-panel-${active.id}`}
              >
                <div className="space-y-2">
                  <span className="tx-chip tx-chip--paypal">{INTEGRATION_LAYER_LABEL[active.layer]}</span>
                  <h3 className="text-2xl font-semibold text-ink">{active.name}</h3>
                  <p className="text-base text-ink-secondary">{active.role}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <PlugZap className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    Used in TALOS
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {active.services.map((s) => (
                      <li key={s} className="rounded-md bg-[var(--surface)] px-3 py-2.5 text-sm text-ink">{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <KeyRound className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    Configuration surface
                  </h4>
                  <ul className="flex flex-wrap gap-2" data-testid="integration-config-keys">
                    {active.configKeys.map((k) => (
                      <li key={k} className="tx-chip tx-key !bg-[var(--surface)] text-ink">{k}</li>
                    ))}
                  </ul>
                  <p className="flex items-center gap-2 text-xs text-ink-muted">
                    <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                    Key names only. Live when configured, deterministic sandbox replay when not.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
