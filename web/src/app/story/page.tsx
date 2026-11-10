'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, KeyRound, ShieldAlert, Sliders } from 'lucide-react';
import { StoryWalkthroughFivePart } from '../../components/StoryWalkthroughFivePart';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../../components/SovereignHeaderAndDock';

export default function StorylineWalkthroughPage() {
  return (
    <div
      className="min-h-screen sovereign-canvas flex flex-col justify-between"
      data-testid="chapter-route-story"
    >
      <SovereignTopNavBar />

      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-8 flex-1 space-y-8">
        <div className="paypal-hero-band fragment-stage-obsidian flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-[68ch]">
            <span className="paypal-label text-accent">Cinema storyline theater</span>
            <h1 className="paypal-headline-lg text-ink">
              From Autonomous Delegation to Reversible PayPal Settlement
            </h1>
            <p className="paypal-body text-ink-secondary">
              Five stages with live triggers: lock the $300 allowance, block the $480 trap, hold PayPal escrow, auto-void late delivery, and co-sign big orders.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/"
              data-testid="story-back-home-btn"
              className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-3 text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Back to Landing</span>
            </Link>
            <Link
              href="/mandates"
              data-testid="story-open-mandates-btn"
              className="btn-paypal-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
            >
              <KeyRound className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Start Chapter 01: Mandate Studio</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <StoryWalkthroughFivePart />

        <div className="paypal-feature-card flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="paypal-title-sm text-ink">Continue to the Live Clearinghouse Workspaces</h2>
            <p className="paypal-body-sm text-ink-secondary">
              Every chapter opens in its own dedicated page with live PayPal Sandbox telemetry.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/mandates"
              className="btn-paypal-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <KeyRound className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Open Mandate Studio</span>
            </Link>
            <Link
              href="/simulator"
              className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <ShieldAlert className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Open Red-Team Arena</span>
            </Link>
            <Link
              href="/command-center"
              className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <Sliders className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Open Command Center</span>
            </Link>
          </div>
        </div>
      </main>

      <SovereignStoryChapterDock />
    </div>
  );
}
