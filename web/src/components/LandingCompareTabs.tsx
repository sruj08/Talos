'use client';

import React from 'react';
import {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import { Fade } from '@animate-ui/react/primitives/effects/fade';
import { STARTUP_PRODUCT_POSITIONING } from '../lib/storytelling-parts';
import { RailCard } from './RailCard';

export function LandingCompareTabs() {
  const [view, setView] = React.useState('both');

  return (
    <section aria-label="Problem versus TALOS outcome" className="space-y-6 py-10">
      <Tabs value={view} onValueChange={setView}>
        <TabsHighlight className="animate-tabs-highlight absolute inset-0">
          <TabsList className="animate-tabs-list relative inline-flex">
            <TabsHighlightItem value="both">
              <TabsTrigger value="both" className="animate-tabs-trigger">
                Side by side
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="problem">
              <TabsTrigger value="problem" className="animate-tabs-trigger">
                Without TALOS
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="with-talos">
              <TabsTrigger value="with-talos" className="animate-tabs-trigger">
                With TALOS + PayPal
              </TabsTrigger>
            </TabsHighlightItem>
          </TabsList>
        </TabsHighlight>
      </Tabs>

      <div
        className={`grid gap-4 ${
          view === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-[52ch]'
        }`}
      >
        {(view === 'both' || view === 'problem') && (
          <Fade key={`problem-${view}`} inViewOnce>
            <RailCard
              data-testid="landing-problem-card"
              tone="crimson"
              eyebrow="Blind checkout"
              title="Without TALOS: Normal AI Loses $480"
            >
              <p className="paypal-body-sm text-ink-secondary tabular-nums">
                {STARTUP_PRODUCT_POSITIONING.theProblem}
              </p>
            </RailCard>
          </Fade>
        )}
        {(view === 'both' || view === 'with-talos') && (
          <Fade key={`with-${view}`} inViewOnce>
            <RailCard
              data-testid="landing-why-it-matters-card"
              tone="emerald"
              eyebrow="Verified escrow path"
              title="With TALOS + PayPal: Buys for $249 (Saves $231)"
            >
              <p className="paypal-body-sm text-ink-secondary tabular-nums">
                {STARTUP_PRODUCT_POSITIONING.whyItMatters}
              </p>
            </RailCard>
          </Fade>
        )}
      </div>
    </section>
  );
}
