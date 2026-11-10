'use client';

import React from 'react';
import {
  AlertTriangle, ArrowRight, BookOpen, KeyRound, Lock, Play, Scale, ScanEye, ShieldCheck, Sliders, TrendingUp,
} from 'lucide-react';
import { navigateToRoute } from '../lib/navigation';
import { STARTUP_PRODUCT_POSITIONING, ShowcaseViewMode } from '../lib/storytelling-parts';

export interface StartupProductHeroProps {
  showcaseView?: ShowcaseViewMode;
  onSelectShowcaseView?: (view: ShowcaseViewMode) => void;
  onTryInteractiveDemo?: () => void;
}

const VIEW_SWITCHER_OPTIONS: Array<{ id: ShowcaseViewMode; testId: string; label: string; href: string }> = [
  { id: 'ALL', testId: 'view-mode-all', label: 'Complete Clearinghouse Suite', href: '/command-center' },
  { id: 'LANDING_STORY', testId: 'view-mode-landing-story', label: 'Interactive Storyline', href: '/story' },
  { id: 'SIMULATOR_ARENA', testId: 'view-mode-simulator-arena', label: 'Red-Team Simulator Arena', href: '/simulator' },
  { id: 'OPERATOR_DASHBOARD', testId: 'view-mode-operator-dashboard', label: 'Escrow Settlement Ledger', href: '/blotter' },
];

const STORYLINE_CHAPTERS = [
  {
    id: 'talos-pillar-1',
    chapterLabel: 'Chapter One · Delegation',
    title: 'Cryptographic Agent Mandate',
    narrative: 'Before your AI shopping assistant visits any online merchant, you issue a tamper-proof permission slip locking in your spending cap, fair-price boundary, and delivery promise.',
    ctaLabel: 'Open Mandate Studio',
    href: '/mandates',
    Icon: KeyRound,
    medallionClass: 'icon-medallion-paypal',
  },
  {
    id: 'talos-pillar-2',
    chapterLabel: 'Chapter Two · Interception',
    title: 'Webpage X-Ray Sanitization',
    narrative: 'When your AI visits an untrusted store, the Rust DOM Firewall streams and sanitizes the raw webpage code to strip invisible prompt-injection traps before the AI reads a single word.',
    ctaLabel: 'Open Red-Team Arena',
    href: '/simulator',
    Icon: ScanEye,
    medallionClass: 'icon-medallion-emerald',
  },
  {
    id: 'talos-pillar-3',
    chapterLabel: 'Chapter Three · Verification',
    title: 'Market Fair-Price Oracle',
    narrative: 'Every merchant ask price is benchmarked against live global catalog medians to stop artificial price gouging and automatically reroute the AI to a verified merchant.',
    ctaLabel: 'Open Escrow Ledger',
    href: '/blotter',
    Icon: Scale,
    medallionClass: 'icon-medallion-amber',
  },
  {
    id: 'talos-pillar-4',
    chapterLabel: 'Chapter Four · Settlement',
    title: 'Reversible PayPal Escrow Hold',
    narrative: 'Funds are locked inside a reversible PayPal authorization hold that only captures once carrier delivery is verified, or voids automatically if the shipment breaks its promise.',
    ctaLabel: 'Open SLA Forensics',
    href: '/sla',
    Icon: Lock,
    medallionClass: 'icon-medallion-paypal',
  },
] as const;

export function StartupProductHero({
  showcaseView,
  onSelectShowcaseView = () => {},
  onTryInteractiveDemo,
}: StartupProductHeroProps) {
  const navigateToPage = (href: string, viewMode?: ShowcaseViewMode) => {
    if (viewMode) onSelectShowcaseView(viewMode);
    navigateToRoute(href);
  };

  const handleTrySimulatorCta = () => {
    onSelectShowcaseView('SIMULATOR_ARENA');
    onTryInteractiveDemo?.();
    navigateToRoute('/simulator');
  };

  return (
    <section
      data-testid="startup-landing-hero"
      aria-label="TALOS Product Overview and Storyline"
      className="py-6 sm:py-10 flex flex-col gap-12"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-3">
          <span className="w-10 h-10 icon-medallion-paypal" aria-hidden="true">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <span className="paypal-label text-ink">{STARTUP_PRODUCT_POSITIONING.eyebrow}</span>
        </div>

        <div data-testid="showcase-view-switcher" role="group" aria-label="Navigate clearinghouse workspaces" className="flex flex-wrap items-center gap-2">
          {VIEW_SWITCHER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              data-testid={opt.testId}
              aria-pressed={showcaseView === opt.id}
              onClick={() => navigateToPage(opt.href, opt.id)}
              className={showcaseView === opt.id ? 'paypal-tab-pill-active text-xs px-4 py-2' : 'paypal-tab-pill text-xs px-4 py-2'}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="paypal-hero-band flex flex-col gap-8">
        <div className="max-w-[920px] flex flex-col gap-5">
          <span className="paypal-label text-accent">PayPal Agentic Commerce Protection</span>
          <h1 className="paypal-hero text-ink">TALOS: {STARTUP_PRODUCT_POSITIONING.headline}</h1>
          <p data-subhead="true" className="paypal-title-md text-ink font-normal">{STARTUP_PRODUCT_POSITIONING.subhead}</p>
          <p className="paypal-body text-ink-secondary max-w-[68ch]">
            When you delegate shopping to an autonomous AI assistant, standard checkout rails cannot tell the difference between your instructions and a hidden webpage trap. TALOS stands between your AI agent, untrusted online stores, and your PayPal wallet to keep every autonomous purchase safe, fair, and reversible.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="button"
            id="cta-try-simulator-btn"
            data-testid="landing-try-demo-cta"
            onClick={handleTrySimulatorCta}
            className="btn-paypal-primary inline-flex items-center gap-2.5 px-7 py-3.5 text-base font-bold whitespace-nowrap"
          >
            <Play className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            <span data-testid="cta-try-simulator-btn">Launch Interactive Simulator</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </button>

          <button
            type="button"
            data-testid="cta-story-walkthrough-btn"
            onClick={() => navigateToPage('/story', 'LANDING_STORY')}
            className="btn-paypal-secondary inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-accent" strokeWidth={1.75} aria-hidden="true" />
            <span>Explore Full Storyline</span>
          </button>

          <button
            type="button"
            data-testid="cta-operator-dashboard-btn"
            onClick={() => navigateToPage('/command-center', 'OPERATOR_DASHBOARD')}
            className="btn-paypal-secondary inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold whitespace-nowrap"
          >
            <Sliders className="w-4 h-4 text-ink" strokeWidth={1.75} aria-hidden="true" />
            <span>Open Operator Command Center</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="paypal-feature-card flex flex-col justify-between gap-5" data-testid="landing-problem-card">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 icon-medallion-crimson" aria-hidden="true"><AlertTriangle className="w-6 h-6" strokeWidth={1.75} /></span>
            <div className="flex flex-col gap-2">
              <h2 className="paypal-title-sm text-ink">The Threat: Blind AI Checkout</h2>
              <p className="paypal-body-sm text-ink-secondary">{STARTUP_PRODUCT_POSITIONING.theProblem}</p>
            </div>
          </div>
          <div>
            <button type="button" onClick={() => navigateToPage('/story', 'LANDING_STORY')} className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold">
              <span>Read the Threat Storyline</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="paypal-feature-card flex flex-col justify-between gap-5" data-testid="landing-why-it-matters-card">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 icon-medallion-paypal" aria-hidden="true"><TrendingUp className="w-6 h-6" strokeWidth={1.75} /></span>
            <div className="flex flex-col gap-2">
              <h2 className="paypal-title-sm text-ink">The Solution: Sovereign Escrow Clearing</h2>
              <p className="paypal-body-sm text-ink-secondary">
                Every autonomous transaction is verified against your signed mandate, scrubbed for hidden prompt overrides, checked for fair market pricing, and held in reversible PayPal escrow until delivery.
              </p>
            </div>
          </div>
          <div>
            <button type="button" onClick={() => navigateToPage('/step-up')} className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold">
              <span>Inspect Human Co-Sign Guardrails</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="paypal-label text-accent">The Clearinghouse Storyline</span>
            <h2 className="paypal-headline-lg text-ink">How TALOS Protects Every Autonomous Purchase</h2>
          </div>
          <button type="button" onClick={() => navigateToPage('/story', 'LANDING_STORY')} className="btn-paypal-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold">
            <span>Open Interactive Story Walkthrough</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STORYLINE_CHAPTERS.map((chapter) => {
            const { Icon } = chapter;
            return (
              <div key={chapter.id} data-testid={chapter.id} className="paypal-feature-card flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`w-12 h-12 ${chapter.medallionClass}`} aria-hidden="true"><Icon className="w-6 h-6" strokeWidth={1.75} /></span>
                    <span className="paypal-caption font-bold text-accent">{chapter.chapterLabel}</span>
                  </div>
                  <h3 className="paypal-title-sm text-ink">{chapter.title}</h3>
                  <p className="paypal-body-sm text-ink-secondary">{chapter.narrative}</p>
                </div>
                <button type="button" onClick={() => navigateToPage(chapter.href)} className="btn-paypal-primary w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold">
                  <span>{chapter.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
