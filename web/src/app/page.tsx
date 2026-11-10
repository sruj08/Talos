'use client';

import React, { useState } from 'react';
import { DollarSign, Lock, ShieldCheck } from 'lucide-react';
import { AgStudioBlotter } from '../components/AgStudioBlotter';
import { BryntumSlaBoard } from '../components/BryntumSlaBoard';
import { MandateStudio } from '../components/MandateStudio';
import { PayPalStepUpModal } from '../components/PayPalStepUpModal';
import { PoisonedStoreSim } from '../components/PoisonedStoreSim';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../components/SovereignHeaderAndDock';
import { LandingScrollChrome } from '../components/LandingScrollChrome';
import { StartupProductHero } from '../components/StartupProductHero';

const SCENE_ANCHOR_IDS = [
  'storyline-scene-1-rules',
  'storyline-scene-2-shop',
  'storyline-scene-2-shop',
  'storyline-scene-3-cfo',
] as const;

export default function TalosLandingPage() {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [simPlaying, setSimPlaying] = useState<boolean>(false);

  const scrollToElementId = (elementId: string) => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(elementId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  const handleStartGuidedSimulation = () => {
    setSimPlaying(true);
    setActiveStage(0);
    scrollToElementId('storyline-scene-1-rules');
  };

  const handleSelectStage = (stageIdx: number) => {
    setActiveStage(stageIdx);
    const targetId = SCENE_ANCHOR_IDS[stageIdx] ?? 'storyline-scene-1-rules';
    scrollToElementId(targetId);
  };

  return (
    <LandingScrollChrome>
      <div className="min-h-screen sovereign-canvas flex flex-col" data-testid="talos-landing-page">
        <SovereignTopNavBar />

        <main className="w-full flex-1">
          <StartupProductHero
            activeStage={activeStage}
            simPlaying={simPlaying}
            onTryInteractiveDemo={handleStartGuidedSimulation}
            onSelectStage={handleSelectStage}
          />

          <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10">
            <section
              id="storyline-scene-1-rules"
              data-testid="storyline-scene-1-rules"
              aria-label="Interactive Scene 1: Set the Rules"
              className="space-y-8 py-20"
            >
              <div className="max-w-[48ch] space-y-3">
                <p className="paypal-label text-ink-muted">Scene 1</p>
                <h2 className="paypal-headline-lg text-ink">
                  Step 1: Give Your AI a Spending Allowance ($300 Max)
                </h2>
                <p className="paypal-body-sm text-ink-secondary">
                  Lock a $300 max cap, fair-price check, and 48h delivery guarantee before the agent shops.
                </p>
              </div>
              <MandateStudio />
            </section>

            <section
              id="storyline-scene-2-shop"
              data-testid="storyline-scene-2-shop"
              aria-label="Interactive Scene 2: Watch the AI Shop (3 Real-World Scenarios)"
              className="space-y-8 py-20"
            >
              <div className="max-w-[52ch] space-y-3">
                <p className="paypal-label text-ink-muted">Scene 2</p>
                <h2 className="paypal-headline-lg text-ink">Watch the AI Shop (3 Real-World Scenarios)</h2>
                <p className="paypal-body-sm text-ink-secondary tabular-nums">
                  Left: Normal AI loses $480. Right: TALOS buys for $249 and saves $231.
                </p>
              </div>
              <PoisonedStoreSim />
              <PayPalStepUpModal />
            </section>

            <section
              id="storyline-scene-3-cfo"
              data-testid="storyline-scene-3-cfo"
              aria-label="Interactive Scene 3: The CFO Dashboard (Where the Money Lives)"
              className="space-y-10 py-20"
            >
              <div className="max-w-[48ch] space-y-3">
                <p className="paypal-label text-ink-muted">Scene 3</p>
                <h2 className="paypal-headline-lg text-ink">The CFO Dashboard (Where the Money Lives)</h2>
                <p className="paypal-body-sm text-ink-secondary">
                  Escrow float, verified take-rate, and zero dispute ops — live with every scenario click.
                </p>
              </div>

              <div data-testid="cfo-paypal-revenue-bar" className="grid grid-cols-1 gap-4 py-4 md:grid-cols-3">
                <div className="rail-card rail-card--obsidian">
                  <div className="flex items-start gap-4">
                    <span className="icon-medallion-paypal h-10 w-10" aria-hidden="true">
                      <Lock className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="space-y-2">
                      <h3 className="paypal-title-sm text-ink">How PayPal Makes Money · Escrow Float</h3>
                      <p className="paypal-caption text-ink-secondary tabular-nums">
                        Earns institutional yield on 29-day AUTHORIZE escrow holds while shipments are in transit.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rail-card rail-card--emerald">
                  <div className="flex items-start gap-4">
                    <span className="icon-medallion-emerald h-10 w-10" aria-hidden="true">
                      <DollarSign className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="space-y-2">
                      <h3 className="paypal-title-sm text-ink">Verified Agentic Checkout Take-Rate</h3>
                      <p className="paypal-caption text-ink-secondary tabular-nums">
                        Captures merchant settlement fees on verified $249 orders that CFOs otherwise block.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rail-card rail-card--amber">
                  <div className="flex items-start gap-4">
                    <span className="icon-medallion-amber h-10 w-10" aria-hidden="true">
                      <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="space-y-2">
                      <h3 className="paypal-title-sm text-ink">$0 Manual Dispute Operations Cost</h3>
                      <p className="paypal-caption text-ink-secondary tabular-nums">
                        Pre-authorization trap blocking and 0-second late-delivery voids eliminate chargeback losses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <AgStudioBlotter />
              <BryntumSlaBoard />
            </section>
          </div>
        </main>

        <SovereignStoryChapterDock />
      </div>
    </LandingScrollChrome>
  );
}
