import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TalosLandingPage from '../app/page';
import { AgStudioBlotter } from '../components/AgStudioBlotter';
import { MandateStudio } from '../components/MandateStudio';
import { PoisonedStoreSim } from '../components/PoisonedStoreSim';
import { SideBySideAgentComparison } from '../components/SideBySideAgentComparison';
import { SovereignTopNavBar } from '../components/SovereignHeaderAndDock';
import { StartupProductHero } from '../components/StartupProductHero';
import { TechnicalProofDrawer } from '../components/TechnicalProofDrawer';
import { DEFAULT_MANDATE_VALUES } from '../hooks/useMandateStudio';
import {
  INVESTOR_BUSINESS_PITCH_STRIP,
  STARTUP_PRODUCT_POSITIONING,
} from '../lib/storytelling-parts';

const SRC_DIR = path.resolve(__dirname, '..');
const WEB_ROOT = path.resolve(SRC_DIR, '..');
const REPO_ROOT = path.resolve(WEB_ROOT, '..');

describe('TALOS Investor Storyline — Tier 1 Feature Coverage Part A (F-01 through F-07)', () => {
  it('F-01 & F-06 (R1.1, R2.1): eliminates 21 competing Screen-1 buttons in favor of the 5-Second Hook headline and single primary CTA', () => {
    const navHtml = renderToStaticMarkup(<SovereignTopNavBar />);
    const heroHtml = renderToStaticMarkup(<StartupProductHero />);

    expect(navHtml).toContain('data-testid="nav-stage-1"');
    expect(navHtml).toContain('data-testid="nav-stage-2"');
    expect(navHtml).toContain('data-testid="nav-stage-3"');
    expect(navHtml).toContain('data-testid="nav-stage-4"');
    expect(navHtml).toContain('5-Second Hook');
    expect(navHtml).toContain('Scene 1: $300 Allowance');
    expect(navHtml).toContain('Scene 2: 3 Store Scenarios');
    expect(navHtml).toContain('Scene 3: CFO Dashboard');

    expect(STARTUP_PRODUCT_POSITIONING.headline).toBe(
      'Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed.'
    );
    expect(heroHtml).toContain(
      'Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed.'
    );
    expect(heroHtml).toContain('data-testid="landing-try-demo-cta"');
    expect(heroHtml).toContain('Watch Live 60-Second Simulation -&gt;');
    expect(heroHtml).toContain('data-testid="hero-operator-quick-jump-drawer"');
    expect(heroHtml).toContain('data-proof-open="false"');
  });

  it('F-02 (R1.2): frames Screen 1 around Problem -> Live Demo -> How Much Money It Saves -> How PayPal Makes Money', () => {
    const heroHtml = renderToStaticMarkup(<StartupProductHero />);

    expect(INVESTOR_BUSINESS_PITCH_STRIP).toHaveLength(4);
    expect(INVESTOR_BUSINESS_PITCH_STRIP.map((c) => c.id)).toEqual([
      'pitch-problem',
      'pitch-live-demo',
      'pitch-money-saved',
      'pitch-paypal-revenue',
    ]);
    expect(heroHtml).toContain('data-testid="investor-business-pitch-strip"');
    expect(heroHtml).toContain('Problem: Blind AI Checkout');
    expect(heroHtml).toContain('Live Demo: 60-Second Store Sim');
    expect(heroHtml).toContain('How Much Money It Saves');
    expect(heroHtml).toContain('How PayPal Makes Money');
    expect(heroHtml).toContain('+$231.00 Saved / Order');
  });

  it('F-03 (R1.3): surfaces SideBySideAgentComparison directly in Scene 2 of the main landing page flow', () => {
    const landingHtml = renderToStaticMarkup(<TalosLandingPage />);
    const comparisonHtml = renderToStaticMarkup(<SideBySideAgentComparison />);

    expect(landingHtml).toContain('data-testid="storyline-scene-2-shop"');
    expect(landingHtml).toContain('data-testid="side-by-side-agent-comparison"');
    expect(comparisonHtml).toContain('Left: Normal AI Agent (Unprotected)');
    expect(comparisonHtml).toContain('Loses $480');
    expect(comparisonHtml).toContain('Right: TALOS + PayPal Agent (Protected)');
    expect(comparisonHtml).toContain('Saves $231');
  });

  it('F-04 (R1.4): encapsulates 128-hex Ed25519 signatures, RFC 9421 headers, 9277 bps, and lol_html + DeBERTa-v3 ONNX inside closed View Technical Proof drawers at second 0', () => {
    const closedDrawerHtml = renderToStaticMarkup(
      <TechnicalProofDrawer testId="custom-proof-drawer">
        <div data-testid="inner-crypto-payload">128-hex Ed25519</div>
      </TechnicalProofDrawer>
    );
    const openDrawerHtml = renderToStaticMarkup(
      <TechnicalProofDrawer defaultOpen={true} testId="custom-proof-drawer-open">
        <div data-testid="inner-crypto-payload">128-hex Ed25519</div>
      </TechnicalProofDrawer>
    );
    const mandateHtml = renderToStaticMarkup(<MandateStudio />);
    const simHtml = renderToStaticMarkup(<PoisonedStoreSim />);
    const blotterHtml = renderToStaticMarkup(<AgStudioBlotter />);

    expect(closedDrawerHtml).toContain('data-testid="custom-proof-drawer"');
    expect(closedDrawerHtml).toContain('data-proof-open="false"');
    expect(closedDrawerHtml).toContain('grid-rows-[0fr] opacity-0 pointer-events-none');
    expect(closedDrawerHtml).toContain('View Technical Proof');
    expect(openDrawerHtml).toContain('data-proof-open="true"');
    expect(openDrawerHtml).toContain('grid-rows-[1fr] opacity-100');

    expect(mandateHtml).toContain('data-testid="mandate-technical-proof-drawer"');
    expect(mandateHtml).toContain('data-proof-open="false"');
    expect(mandateHtml).toContain('data-testid="mandate-crypto-proof"');
    expect(mandateHtml).toContain('data-testid="mandate-signature-hash"');
    expect(mandateHtml).toContain('data-testid="mandate-rfc9421-header"');

    expect(simHtml).toContain('data-testid="arena-technical-proof-drawer"');
    expect(simHtml).toContain('data-proof-open="false"');
    expect(simHtml).toContain('data-testid="scenario-dom-diff"');
    expect(simHtml).toContain('9277 bps');
    expect(simHtml).toContain('DeBERTa-v3 ONNX');

    expect(blotterHtml).toContain('data-testid="blotter-technical-proof-drawer"');
    expect(blotterHtml).toContain('data-proof-open="false"');
    expect(blotterHtml).toContain('data-testid="forensic-detail-panel"');
    expect(blotterHtml).toContain('lol_html + DeBERTa-v3 ONNX');
  });

  it('F-05 (R1): delivers the War-Room Council Storyline Discussion & Implementation Plan document', () => {
    const planPath = path.join(
      REPO_ROOT,
      'docs',
      '08-project',
      'WAR_ROOM_COUNCIL_STORYLINE_AND_IMPLEMENTATION_PLAN.md'
    );
    expect(fs.existsSync(planPath)).toBe(true);
    const planContent = fs.readFileSync(planPath, 'utf8');

    for (const persona of [
      'Steve Jobs', 'Jony Ive', 'Alex Karp', 'Peter Thiel', 'Warren Buffett',
      'Charlie Munger', 'Patrick Jane', 'Andrej Karpathy', 'Harvey Specter', 'R.S. Sharma', 'Paul Graham',
    ]) {
      expect(planContent).toContain(persona);
    }
    for (const skill of [
      '/war-room-council', '/animate-motion-transfer', '/apple-design', '/heroui-react',
      '/ui-ux-pro-max', '/generative_ui', '/ai-video-studio', '/unslop', '/hallmark',
    ]) {
      expect(planContent).toContain(skill);
    }
    expect(planContent).toContain(
      'Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed.'
    );
    expect(planContent).toContain('Watch Live 60-Second Simulation ->');
    expect(planContent).toContain('Step 1: Give Your AI a Spending Allowance ($300 Max)');
    expect(planContent).toContain('The CFO Dashboard (Where the Money Lives)');
  });

  it('F-07 (R2.2): presents Interactive Scene 1 as "Step 1: Give Your AI a Spending Allowance ($300 Max)" in plain English', () => {
    const landingHtml = renderToStaticMarkup(<TalosLandingPage />);
    const mandateHtml = renderToStaticMarkup(<MandateStudio />);

    expect(landingHtml).toContain('data-testid="storyline-scene-1-rules"');
    expect(landingHtml).toContain('Step 1: Give Your AI a Spending Allowance ($300 Max)');
    expect(mandateHtml).toContain('Step 1: Give Your AI a Spending Allowance ($300 Max)');
    expect(mandateHtml).toContain('Lock $300 Spending Allowance');
    expect(DEFAULT_MANDATE_VALUES.maxAmountCents).toBe(30000);
    expect(DEFAULT_MANDATE_VALUES.maxSpreadBps).toBe(1500);
    expect(DEFAULT_MANDATE_VALUES.slaHours).toBe(48);
  });
});
