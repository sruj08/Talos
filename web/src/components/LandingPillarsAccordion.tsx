'use client';

import React from 'react';
import { Accordion } from '@animate-ui/react/primitives/base-ui/accordion';
import { ChevronDown } from 'lucide-react';
import { TALOS_FOUR_PILLARS } from '../lib/storytelling-parts';

const RAIL_BY_DOT: Record<string, string> = {
  'dot-paypal': 'rail-card--paypal',
  'dot-emerald': 'rail-card--emerald',
  'dot-amber': 'rail-card--amber',
  'dot-crimson': 'rail-card--crimson',
};

export function LandingPillarsAccordion() {
  return (
    <Accordion.Root defaultValue={[TALOS_FOUR_PILLARS[0]?.id]} className="space-y-0">
      {TALOS_FOUR_PILLARS.map((pillar) => (
        <Accordion.Item
          key={pillar.id}
          value={pillar.id}
          data-testid={pillar.id}
          className={`animate-accordion-item ${RAIL_BY_DOT[pillar.dotClass] ?? 'rail-card--paypal'}`}
        >
          <Accordion.Header>
            <Accordion.Trigger className="animate-accordion-trigger group">
              <span className="flex min-w-0 flex-col gap-1">
                <span className="paypal-label text-ink-muted tabular-nums">
                  {pillar.numberBadge} · {pillar.metricBadge}
                </span>
                <span className="paypal-title-sm text-ink">{pillar.title}</span>
              </span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-data-[panel-open]:rotate-180"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="animate-accordion-panel">
            <p className="paypal-caption text-ink-secondary tabular-nums">{pillar.plainExplanation}</p>
            <p className="paypal-legal mt-3 text-ink-muted">{pillar.technicalProof}</p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
