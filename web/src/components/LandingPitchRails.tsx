'use client';

import React from 'react';
import { Fade } from '@animate-ui/react/primitives/effects/fade';
import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@animate-ui/react/primitives/tooltip';
import { INVESTOR_BUSINESS_PITCH_STRIP } from '../lib/storytelling-parts';
import { RailCard, type RailTone } from './RailCard';

const TONE_BY_CLASS: Record<string, RailTone> = {
  'tone-crimson': 'crimson',
  'tone-paypal': 'paypal',
  'tone-emerald': 'emerald',
  'tone-amber': 'amber',
};

const METRIC_COUNT: Record<string, number> = {
  'pitch-problem': 480,
  'pitch-live-demo': 2.84,
  'pitch-money-saved': 231,
  'pitch-paypal-revenue': 29,
};

export function LandingPitchRails() {
  return (
    <TooltipProvider openDelay={80} closeDelay={120}>
      <div
        data-testid="investor-business-pitch-strip"
        className="grid grid-cols-1 gap-4 py-16 sm:grid-cols-2 lg:grid-cols-4"
      >
        {INVESTOR_BUSINESS_PITCH_STRIP.map((card, idx) => {
          const count = METRIC_COUNT[card.id];
          return (
            <Fade key={card.id} delay={idx * 0.06} inViewOnce>
              <RailCard
                data-testid={card.id}
                tone={TONE_BY_CLASS[card.toneClass] ?? 'paypal'}
                eyebrow={card.stepBadge}
                title={card.title}
                metric={
                  <Tooltip side="top">
                    <TooltipTrigger asChild>
                      <button type="button" className="text-left text-sm font-medium text-ink tabular-nums">
                        <span>{card.metric}</span>
                        {typeof count === 'number' ? (
                          <CountingNumber
                            number={count}
                            decimalPlaces={Number.isInteger(count) ? 0 : 2}
                            initiallyStable
                            className="sr-only"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="animate-tooltip">{card.summary}</TooltipContent>
                  </Tooltip>
                }
              >
                <p className="paypal-caption text-ink-secondary tabular-nums max-w-[32ch]">{card.summary}</p>
              </RailCard>
            </Fade>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
