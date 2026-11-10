'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Table2 } from 'lucide-react';
import { PoisonedStoreSim } from '../../components/PoisonedStoreSim';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../../components/SovereignHeaderAndDock';

export default function SimulatorChapterPage() {
  return (
    <div className="min-h-screen sovereign-canvas flex flex-col justify-between" data-testid="chapter-route-simulator">
      <SovereignTopNavBar />
      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-8 pb-16 space-y-6 flex-1">
        <div id="chapter-simulator">
          <PoisonedStoreSim />
        </div>
        <div className="paypal-feature-card flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/mandates"
            data-testid="simulator-prev-page-btn"
            className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Previous Page: Mandate Studio</span>
          </Link>
          <Link
            href="/blotter"
            data-testid="simulator-next-page-btn"
            className="btn-paypal-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
          >
            <Table2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Next Page: Escrow Ledger</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
