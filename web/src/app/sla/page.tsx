'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import { BryntumSlaBoard } from '../../components/BryntumSlaBoard';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../../components/SovereignHeaderAndDock';

export default function SlaChapterPage() {
  return (
    <div className="min-h-screen sovereign-canvas flex flex-col justify-between" data-testid="chapter-route-sla">
      <SovereignTopNavBar />
      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-8 pb-16 space-y-6 flex-1">
        <div id="chapter-sla">
          <BryntumSlaBoard />
        </div>
        <div className="paypal-feature-card flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/blotter"
            data-testid="sla-prev-page-btn"
            className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Previous Page: Escrow Ledger</span>
          </Link>
          <Link
            href="/step-up"
            data-testid="sla-next-page-btn"
            className="btn-paypal-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
          >
            <UserCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Next Page: Step-Up Co-Sign</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
