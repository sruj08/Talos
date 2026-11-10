'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sliders } from 'lucide-react';
import { PayPalStepUpModal } from '../../components/PayPalStepUpModal';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../../components/SovereignHeaderAndDock';

export default function StepUpChapterPage() {
  return (
    <div
      className="min-h-screen sovereign-canvas flex flex-col justify-between"
      data-testid="chapter-route-step-up"
    >
      <SovereignTopNavBar />

      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-8 pb-16 space-y-6 flex-1">
        <div id="chapter-step-up">
          <PayPalStepUpModal />
        </div>

        <div className="paypal-feature-card flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/sla"
            data-testid="stepup-prev-page-btn"
            className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Previous Page: SLA Forensics</span>
          </Link>
          <Link
            href="/command-center"
            data-testid="stepup-next-page-btn"
            className="btn-paypal-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
          >
            <Sliders className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Open Full Command Center</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </main>

      <SovereignStoryChapterDock />
    </div>
  );
}
