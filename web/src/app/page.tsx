'use client';

import React from 'react';
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
    <div className="surface-editorial min-h-[100dvh] flex flex-col" data-testid="talos-landing-page">
      <PublicNav />
      <main className="flex-1">
        <LandingHero />
        <EconomicContrastBand />
        <ScenarioPreviewFrame />
        <HowItWorksPillars />
        <IntegrationsShowcase />
        <InvestorEconomics />
        <LaunchBanner />
      </main>
      <PublicFooter />
    </div>
  );
}
