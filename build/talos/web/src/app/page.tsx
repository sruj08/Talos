'use client';

import React from 'react';
import { MandateStudio } from '../components/MandateStudio';
import { PoisonedStoreSim } from '../components/PoisonedStoreSim';
import { AgStudioBlotter } from '../components/AgStudioBlotter';
import { BryntumSlaBoard } from '../components/BryntumSlaBoard';
import { PayPalStepUpModal } from '../components/PayPalStepUpModal';
import {
  SovereignStoryChapterDock,
  SovereignTopTelemetryBar,
} from '../components/SovereignHeaderAndDock';

export default function TALOSCommandCenterPage() {
  return (
    <div className="min-h-screen sovereign-canvas" data-testid="talos-command-center">
      <SovereignTopTelemetryBar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 pb-28 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div id="chapter-mandates" className="scroll-mt-28">
            <MandateStudio />
          </div>
          <div id="chapter-simulator" className="scroll-mt-28">
            <PoisonedStoreSim />
          </div>
        </div>

        <div id="chapter-blotter" className="scroll-mt-28">
          <AgStudioBlotter />
        </div>

        <div id="chapter-sla" className="scroll-mt-28">
          <BryntumSlaBoard />
        </div>

        <PayPalStepUpModal />
      </main>

      <SovereignStoryChapterDock />
    </div>
  );
}
