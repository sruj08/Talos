'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard, MonitorPlay } from 'lucide-react';
import { StoryWalkthroughFivePart } from '../../components/StoryWalkthroughFivePart';
import { PublicNav } from '../../components/landing/PublicNav';
import { PublicFooter } from '../../components/landing/LandingClosing';

export default function StorylineWalkthroughPage() {
  return (
    <div className="surface-editorial min-h-[100dvh] flex flex-col" data-testid="chapter-route-story">
      <PublicNav />

      <main className="mx-auto max-w-[1240px] w-full px-4 sm:px-8 py-10 sm:py-14 flex-1 space-y-10">
        <div className="space-y-4 max-w-[60ch]">
          <h1 className="tx-section-title">The 60-second product tour</h1>
          <p className="tx-lede">Five stages, from signing the allowance to co-signing a big order. Trigger each one live.</p>
        </div>

        <StoryWalkthroughFivePart />

        <div className="tx-card p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-ink">Seen the story? Now drive it</h2>
            <p className="text-sm text-ink-secondary">Every stage opens as its own workspace with live sandbox state.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/simulator" className="btn-paypal-primary" data-testid="story-open-simulator">
              <MonitorPlay className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              Launch live demo
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <Link href="/command-center" className="btn-paypal-secondary" data-testid="story-open-workspace">
              <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              Enter workspace
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
