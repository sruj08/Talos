'use client';

import React from 'react';
import { LandingScrollChrome } from '../components/LandingScrollChrome';
import { LandingScrollSplit } from '../components/LandingScrollSplit';
import { PublicNav } from '../components/landing/PublicNav';
import { LandingHero } from '../components/landing/LandingHero';
import { EconomicContrastBand } from '../components/landing/EconomicContrastBand';
import { ScenarioPreviewFrame } from '../components/landing/ScenarioPreviewFrame';
import { HowItWorksPillars } from '../components/landing/HowItWorksPillars';
import { IntegrationsShowcase } from '../components/landing/IntegrationsShowcase';
import { InvestorEconomics, LaunchBanner, PublicFooter } from '../components/landing/LandingClosing';

/** Public showcase. Every action routes into the real product; nothing here scrolls to fake sections. */
export default function TalosLandingPage() {
  return (
    <LandingScrollChrome>
      <div className="surface-editorial min-h-[100dvh] flex flex-col" data-testid="talos-landing-page">
        <PublicNav />
        <main className="flex-1">
          <LandingHero />
          <EconomicContrastBand />
          <ScenarioPreviewFrame />
          <HowItWorksPillars />
          <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
            <LandingScrollSplit />
          </div>
          <IntegrationsShowcase />
          <InvestorEconomics />
          <LaunchBanner />
        </main>
        <PublicFooter />
      </div>
    </LandingScrollChrome>
  );
}
