'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarClock } from 'lucide-react';
import { AgStudioBlotter } from '../../components/AgStudioBlotter';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../../components/SovereignHeaderAndDock';

export default function BlotterChapterPage() {
  return (
    <div className="min-h-screen sovereign-canvas flex flex-col justify-between" data-testid="chapter-route-blotter">
      <SovereignTopNavBar />
      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-8 pb-16 space-y-6 flex-1">
        <div id="chapter-blotter">
          <AgStudioBlotter />
        </div>
        <div className="paypal-feature-card flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/simulator"
            data-testid="blotter-prev-page-btn"
            className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Previous Page: Red-Team Arena</span>
          </Link>
          <Link
            href="/sla"
            data-testid="blotter-next-page-btn"
            className="btn-paypal-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
          >
            <CalendarClock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Next Page: SLA Forensics</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
