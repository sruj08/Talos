'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { MandateStudio } from '../../components/MandateStudio';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../../components/SovereignHeaderAndDock';
import { WorkspaceTabRail } from '../../components/WorkspaceTabRail';
import { useTalosClearing } from '../../context/TalosClearingContext';

export default function MandatesChapterPage() {
  const { setWorkspaceTab } = useTalosClearing();
  React.useEffect(() => {
    setWorkspaceTab('ALLOWANCE');
  }, [setWorkspaceTab]);

  return (
    <div className="min-h-screen sovereign-canvas flex flex-col justify-between" data-testid="chapter-route-mandates">
      <SovereignTopNavBar />
      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-8 pb-16 space-y-6 flex-1">
        <WorkspaceTabRail />
        <div id="chapter-mandates">
          <MandateStudio />
        </div>
        <div className="paypal-feature-card flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/story"
            data-testid="mandates-prev-page-btn"
            className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Previous Page: Storyline</span>
          </Link>
          <Link
            href="/simulator"
            data-testid="mandates-next-page-btn"
            className="btn-paypal-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
          >
            <ShieldAlert className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Next Page: Red-Team Arena</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
