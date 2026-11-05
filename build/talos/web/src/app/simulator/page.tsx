'use client';

import React from 'react';
import { PoisonedStoreSim } from '../../components/PoisonedStoreSim';
import { PayPalStepUpModal } from '../../components/PayPalStepUpModal';
import {
  SovereignStoryChapterDock,
  SovereignTopTelemetryBar,
} from '../../components/SovereignHeaderAndDock';

export default function SimulatorChapterPage() {
  return (
    <div className="min-h-screen sovereign-canvas" data-testid="chapter-route-simulator">
      <SovereignTopTelemetryBar />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 pb-28 space-y-12">
        <div id="chapter-simulator">
          <PoisonedStoreSim />
        </div>
        <PayPalStepUpModal />
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
