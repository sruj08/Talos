'use client';

import React, { useState } from 'react';
import { Code2, Cpu, EyeOff, KeyRound, Layers, PlugZap } from 'lucide-react';
import {
  INTEGRATION_LAYER_LABEL,
  INTEGRATION_PARTNERS,
} from '../../lib/integrations-catalog';
import { GridPatternOverlay, UptimeStatusRibbon } from '@/components/ui/fintech-primitives';

const SERVICE_COUNT = INTEGRATION_PARTNERS.reduce((a, p) => a + p.services.length, 0);

const SUMMARY_STATS = [
  {
    value: String(INTEGRATION_PARTNERS.length),
    label: 'platforms wired in',
    Icon: Layers,
  },
  {
    value: String(SERVICE_COUNT),
    label: 'services and APIs',
    Icon: Cpu,
  },
  {
    value: '3',
    label: 'languages: Rust, Go, TypeScript',
    Icon: Code2,
  },
] as const;

export function IntegrationsShowcase() {
  const [activeId, setActiveId] = useState(INTEGRATION_PARTNERS[0].id);
  const active =
    INTEGRATION_PARTNERS.find((p) => p.id === activeId) ?? INTEGRATION_PARTNERS[0];

  return (
    <section
      className="py-5 md:py-7"
      data-testid="landing-integrations"
      aria-labelledby="integrations-title"
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="paypal-label text-ink-secondary">Infrastructure &amp; Protocol Stack</p>
            <h2 id="integrations-title" className="tx-section-title">
              Built on platforms you already trust
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {SUMMARY_STATS.map(({ value, label, Icon }) => (
              <div key={label} className="tx-card px-3 py-2 flex items-center gap-2.5">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] icon-medallion-paypal shrink-0"
                  aria-hidden="true"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-base font-semibold text-ink tx-num leading-none">
                    {value}
                  </p>
                  <p className="text-[11px] text-ink-secondary mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
          <div
            className="tx-card p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1 content-start"
            role="tablist"
            aria-label="Integration partners"
            aria-orientation="vertical"
          >
            {INTEGRATION_PARTNERS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`integration-tab-${p.id}`}
                aria-selected={p.id === activeId}
                aria-controls="integration-panel"
                onClick={() => setActiveId(p.id)}
                className="tx-tab !justify-start w-full !min-h-[34px] !py-1.5 !px-2.5"
                data-testid={`integration-tab-${p.id}`}
              >
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--surface-well)] border border-[var(--border)] text-[11px] font-mono font-semibold text-ink shrink-0"
                  aria-hidden="true"
                >
                  {p.mark}
                </span>
                <span className="truncate text-xs sm:text-sm">{p.name}</span>
              </button>
            ))}
          </div>

          <div
            id="integration-panel"
            role="tabpanel"
            aria-labelledby={`integration-tab-${active.id}`}
            className="tx-card relative overflow-hidden p-5 flex flex-col justify-between gap-4"
          >
            <GridPatternOverlay squares={[[2, 1], [4, 2], [6, 1]]} />
            <div
              key={active.id}
              className="space-y-4 relative z-10"
              data-testid={`integration-panel-${active.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="tx-chip">
                    {INTEGRATION_LAYER_LABEL[active.layer]}
                  </span>
                  <h3 className="text-xl font-semibold text-ink">{active.name}</h3>
                </div>
                <span className="tx-chip tx-key">Production Ready</span>
              </div>
              <p className="text-sm text-ink-secondary">{active.role}</p>

              <div className="tx-well p-3">
                <UptimeStatusRibbon
                  serviceName={`${active.name} · Deterministic Adapter`}
                  uptimePercent="99.99%"
                  ticks={24}
                  tone="paypal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <PlugZap className="h-3.5 w-3.5 text-ink-secondary" strokeWidth={1.75} aria-hidden="true" />
                    Used in TALOS
                  </h4>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {active.services.map((s) => (
                      <li
                        key={s}
                        className="rounded-[6px] bg-[var(--surface-well)] border border-[var(--border)] px-3 py-1.5 text-xs text-ink"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <KeyRound className="h-3.5 w-3.5 text-ink-secondary" strokeWidth={1.75} aria-hidden="true" />
                    Configuration surface
                  </h4>
                  <ul className="flex flex-wrap gap-1.5" data-testid="integration-config-keys">
                    {active.configKeys.map((k) => (
                      <li key={k} className="tx-chip tx-key text-ink">
                        {k}
                      </li>
                    ))}
                  </ul>
                  <p className="flex items-center gap-1.5 text-[11px] text-ink-muted pt-1">
                    <EyeOff className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    Key names only. Live when configured, deterministic sandbox replay when not.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
