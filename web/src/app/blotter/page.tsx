'use client';

import React from 'react';
import { AgStudioBlotter } from '../../components/AgStudioBlotter';
import { PayPalStepUpModal } from '../../components/PayPalStepUpModal';
import {
  SovereignStoryChapterDock,
  SovereignTopTelemetryBar,
} from '../../components/SovereignHeaderAndDock';

export default function BlotterChapterPage() {
  return (
    <div className="min-h-screen sovereign-canvas" data-testid="chapter-route-blotter">
      <SovereignTopTelemetryBar />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 pb-24 space-y-6">
        <div id="chapter-blotter">
          <AgStudioBlotter />
        </div>
        <PayPalStepUpModal />
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
