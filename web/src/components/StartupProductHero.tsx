'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { RippleButton, RippleButtonRipples } from '@animate-ui/react/primitives/buttons/ripple';
import { ArrowRight, Play } from 'lucide-react';
import { navigateToRoute } from '../lib/navigation';
import { STARTUP_PRODUCT_POSITIONING, ShowcaseViewMode } from '../lib/storytelling-parts';
import { FragmentSpatialHero3D } from './FragmentSpatialHero3D';
import { LandingCompareTabs } from './LandingCompareTabs';
import { LandingPillarsAccordion } from './LandingPillarsAccordion';
import { LandingPitchRails } from './LandingPitchRails';
import { LandingScrollSplit } from './LandingScrollSplit';
import { TechnicalProofDrawer } from './TechnicalProofDrawer';
import { SilkAurora } from './ui/silk-aurora';

export interface StartupProductHeroProps {
  showcaseView?: ShowcaseViewMode;
  onSelectShowcaseView?: (view: ShowcaseViewMode) => void;
  onTryInteractiveDemo?: () => void;
  activeStage?: number;
  simPlaying?: boolean;
  onSelectStage?: (stageIndex: number) => void;
}

const VIEW_SWITCHER_OPTIONS: Array<{ id: ShowcaseViewMode; testId: string; label: string; href: string }> = [
  { id: 'ALL', testId: 'view-mode-all', label: 'Complete Clearinghouse Suite', href: '/command-center' },
  { id: 'LANDING_STORY', testId: 'view-mode-landing-story', label: 'Interactive Storyline', href: '/story' },
  { id: 'SIMULATOR_ARENA', testId: 'view-mode-simulator-arena', label: 'Red-Team Simulator Arena', href: '/simulator' },
  { id: 'OPERATOR_DASHBOARD', testId: 'view-mode-operator-dashboard', label: 'Escrow Settlement Ledger', href: '/blotter' },
];

export function StartupProductHero({
  showcaseView = 'ALL',
  onSelectShowcaseView = () => {},
  onTryInteractiveDemo,
  activeStage = 1,
  simPlaying = false,
  onSelectStage,
}: StartupProductHeroProps) {
  const navigateToPage = (href: string, viewMode?: ShowcaseViewMode) => {
    if (viewMode) onSelectShowcaseView(viewMode);
    navigateToRoute(href);
  };

  const handleWatchLiveSimulation = () => {
    onSelectShowcaseView('SIMULATOR_ARENA');
    if (onTryInteractiveDemo) {
      onTryInteractiveDemo();
      return;
    }
    if (typeof window !== 'undefined') {
      const scene1 = document.getElementById('storyline-scene-1-rules');
      if (scene1) {
        const top = scene1.getBoundingClientRect().top + window.scrollY - 76;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        return;
      }
    }
    navigateToRoute('/simulator');
  };

  return (
    <section
      id="stage-hook"
      data-testid="startup-landing-hero"
      aria-label="TALOS Above the Fold 5-Second Hook"
      className="flex flex-col"
    >
      <SilkAurora
        data-testid="landing-silk-aurora"
        className="paypal-hero-band min-h-[86vh] w-full items-end"
        contentClassName="mx-auto w-full max-w-[1280px] px-6 sm:px-10"
        baseColor="#07080D"
        midColor="#001435"
        sheenColor="#FFC439"
        accentColor="#0070E0"
        speed={0.85}
        intensity={0.92}
        grain={0.55}
        vignette={0.9}
      >
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="flex flex-col gap-10 lg:col-span-7">
            <p className="paypal-label text-ink-muted">{STARTUP_PRODUCT_POSITIONING.eyebrow}</p>
            <h1 className="paypal-hero text-ink max-w-[18ch]">{STARTUP_PRODUCT_POSITIONING.headline}</h1>
            <p data-subhead="true" className="paypal-body text-ink-secondary max-w-[40ch]">
              {STARTUP_PRODUCT_POSITIONING.subhead}
            </p>
            <div className="cta-row" role="group" aria-label="Primary landing actions">
              <RippleButton
                id="cta-try-simulator-btn"
                data-testid="landing-try-demo-cta"
                className="btn-paypal-primary relative overflow-hidden"
                onClick={handleWatchLiveSimulation}
              >
                <Play className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                <span data-testid="cta-try-simulator-btn">Watch Live 60-Second Simulation -&gt;</span>
                <RippleButtonRipples color="rgba(255,255,255,0.28)" />
              </RippleButton>
              <Link href="/login" data-testid="landing-signin-cta" className="btn-paypal-secondary">
                Sign In / Connect PayPal Wallet
              </Link>
            </div>
          </div>
          <div className="fragment-3d-stage lg:col-span-5">
            <FragmentSpatialHero3D
              activeStage={activeStage}
              simPlaying={simPlaying}
              onStartSimulation={handleWatchLiveSimulation}
              onSelectStage={onSelectStage}
            />
          </div>
        </div>
      </SilkAurora>

      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10">
        <LandingPitchRails />
        <LandingScrollSplit />
        <LandingCompareTabs />

        <TechnicalProofDrawer
          title="4-Stage Protection Pillars & Operator Quick-Jump"
          buttonLabel="View Technical Proof & Workspaces"
          summaryBadge="4 Stages · Dedicated Operator Routes"
          testId="hero-operator-quick-jump-drawer"
          buttonTestId="btn-hero-operator-quick-jump"
        >
          <div className="space-y-6 py-4">
            <LandingPillarsAccordion />
            <div
              data-testid="showcase-view-switcher"
              role="group"
              aria-label="Navigate clearinghouse workspaces"
              className="cta-row"
            >
              {VIEW_SWITCHER_OPTIONS.map((opt) => (
                <Button
                  key={opt.id}
                  data-testid={opt.testId}
                  aria-pressed={showcaseView === opt.id}
                  variant={showcaseView === opt.id ? 'secondary' : 'ghost'}
                  className={showcaseView === opt.id ? 'paypal-tab-pill-active' : 'paypal-tab-pill'}
                  onPress={() => navigateToPage(opt.href, opt.id)}
                >
                  {opt.label}
                </Button>
              ))}
              <Button
                data-testid="cta-story-walkthrough-btn"
                variant="ghost"
                className="paypal-tab-pill"
                onPress={() => navigateToPage('/story', 'LANDING_STORY')}
              >
                Explore Full Storyline
              </Button>
              <Button
                data-testid="cta-operator-dashboard-btn"
                variant="ghost"
                className="paypal-tab-pill inline-flex items-center gap-1.5"
                onPress={() => navigateToPage('/command-center', 'OPERATOR_DASHBOARD')}
              >
                Open Operator Command Center
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </TechnicalProofDrawer>
      </div>
    </section>
  );
}
