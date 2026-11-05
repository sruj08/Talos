'use client';

import React from 'react';
import { MandateStudio } from '../../components/MandateStudio';
import { PayPalStepUpModal } from '../../components/PayPalStepUpModal';
import {
  SovereignStoryChapterDock,
  SovereignTopTelemetryBar,
} from '../../components/SovereignHeaderAndDock';

export default function MandatesChapterPage() {
  return (
    <div className="min-h-screen sovereign-canvas" data-testid="chapter-route-mandates">
      <SovereignTopTelemetryBar />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 pb-28 space-y-12">
        <div id="chapter-mandates">
          <MandateStudio />
        </div>
        <PayPalStepUpModal />
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
