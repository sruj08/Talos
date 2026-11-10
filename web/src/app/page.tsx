'use client';

import React from 'react';
import { StartupProductHero } from '../components/StartupProductHero';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../components/SovereignHeaderAndDock';

export default function TalosLandingPage() {
  return (
    <div
      className="min-h-screen sovereign-canvas flex flex-col justify-between"
      data-testid="talos-landing-page"
    >
      <SovereignTopNavBar />

      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-6 flex-1">
        <StartupProductHero />
      </main>

      <SovereignStoryChapterDock />
    </div>
  );
}
