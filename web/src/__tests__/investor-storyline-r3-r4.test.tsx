import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TalosLandingPage from '../app/page';
import BlotterChapterPage from '../app/blotter/page';
import SlaChapterPage from '../app/sla/page';
import { FragmentSpatialHero3D } from '../components/FragmentSpatialHero3D';
import { PayPalStepUpModal } from '../components/PayPalStepUpModal';
import { PoisonedStoreSim } from '../components/PoisonedStoreSim';
import {
  COMPARISON_ACT_PRESETS,
  evaluateAgentComparisonScenario,
} from '../lib/agent-comparison-scenarios';

const SRC_DIR = path.resolve(__dirname, '..');
const WEB_ROOT = path.resolve(SRC_DIR, '..');
const REPO_ROOT = path.resolve(WEB_ROOT, '..');

describe('TALOS Investor Storyline — Tier 1 Feature Coverage Part B (F-08 through F-16)', () => {
  it('F-08, F-09, F-10 (R2.3): renders Interactive Scene 2 with all 3 real-world shopping scenarios and Approve with PayPal step-up', () => {
    const simHtml = renderToStaticMarkup(<PoisonedStoreSim />);
    const stepUpHtml = renderToStaticMarkup(<PayPalStepUpModal />);
    const evalAct1 = evaluateAgentComparisonScenario(COMPARISON_ACT_PRESETS.ACT_1);
    const evalAct2 = evaluateAgentComparisonScenario(COMPARISON_ACT_PRESETS.ACT_2);
    const evalAct3 = evaluateAgentComparisonScenario(COMPARISON_ACT_PRESETS.ACT_3);

    expect(simHtml).toContain('Scenario 1: The Scam Store ($480 Trap)');
    expect(evalAct1.unprotected.chargedUsd).toBe(480);
    expect(evalAct1.talosProtected.protectedSpendUsd).toBe(249);
    expect(evalAct1.talosProtected.savedUsd).toBe(231);
    expect(evalAct1.talosProtected.escrowState).toBe('BLOCKED_DOM_INJECTION');

    expect(simHtml).toContain('Scenario 2: The Honest Store ($249 Verified)');
    expect(evalAct2.talosProtected.protectedSpendUsd).toBe(249);
    expect(evalAct2.talosProtected.spreadBps).toBe(0);
    expect(evalAct2.talosProtected.escrowState).toBe('PAYPAL_CAPTURED');

    expect(simHtml).toContain('Scenario 3: The Late Delivery &amp; Big Order ($450)');
    expect(evalAct3.talosProtected.slaAutoVoided).toBe(true);
    expect(evalAct3.talosProtected.stepUpRequired).toBe(true);
    expect(stepUpHtml).toContain('Approve with PayPal ($450 Big Order Step-Up)');
    expect(stepUpHtml).toContain('data-testid="btn-step-up-cosign"');
    expect(stepUpHtml).toContain('Approve with PayPal');
  });

  it('F-11 (R2.4): presents the PayPal business model on / and routes CFO tooling to /blotter and /sla', () => {
    const landingHtml = renderToStaticMarkup(<TalosLandingPage />);
    const blotterHtml = renderToStaticMarkup(<BlotterChapterPage />);
    const slaHtml = renderToStaticMarkup(<SlaChapterPage />);

    expect(landingHtml).toContain('data-testid="investor-business-pitch-strip"');
    expect(landingHtml).toContain('Why PayPal and enterprises win');
    expect(landingHtml).toContain('Escrow float yield');
    expect(landingHtml).toContain('Unlocked agentic spend');
    expect(landingHtml).toContain('Manual dispute overhead');
    expect(blotterHtml).toContain('data-testid="chapter-route-blotter"');
    expect(blotterHtml).toContain('data-testid="ag-studio-blotter"');
    expect(slaHtml).toContain('data-testid="chapter-route-sla"');
    expect(slaHtml).toContain('data-testid="bryntum-sla-board"');
  });

  it('F-12, F-13, F-14 (R3): enforces Colour Psychology tokens, Gradient tokens, Typography scale, and Design System documentation', () => {
    const globalsCss = fs.readFileSync(path.join(SRC_DIR, 'app', 'globals.css'), 'utf8');
    const designSystemMd = fs.readFileSync(
      path.join(REPO_ROOT, 'docs', '02-design', 'DESIGN_SYSTEM.md'),
      'utf8'
    );
    const uiSpecMd = fs.readFileSync(
      path.join(REPO_ROOT, 'docs', '02-design', 'UI_SPEC.md'),
      'utf8'
    );

    const requiredCssTokens = [
      '--color-obsidian-canvas: #07080D',
      '--color-obsidian-surface: #0F1420',
      '--color-obsidian-card: #151C2C',
      '--oklch-paypal-trust: oklch(0.56 0.19 255)',
      '--oklch-emerald-verified: oklch(0.69 0.17 162)',
      '--oklch-amber-escrow: oklch(0.78 0.16 75)',
      '--oklch-crimson-threat: oklch(0.63 0.21 25)',
      '--gradient-obsidian-stage:',
      '--gradient-paypal-vault:',
      '--gradient-specular-border:',
      'font-variant-numeric: tabular-nums',
      'min-height: 44px',
      '--ease-bento: cubic-bezier(0.22, 1, 0.36, 1)',
    ];
    for (const token of requiredCssTokens) {
      expect(globalsCss).toContain(token);
    }

    expect(designSystemMd).toContain('War-Room Council & `fragment.im` Investor Storyline Evolution');
    expect(uiSpecMd).toContain('4-Stage Investor Storyline & `fragment.im` Spatial Architecture');
  });

  it('F-15 & F-16 (R4): renders FragmentSpatialHero3D with 3 translateZ depth shards, 4 stage cues, and bespoke 3D SVG/PNG visual plates', () => {
    const spatialHeroHtml = renderToStaticMarkup(
      <FragmentSpatialHero3D activeStage={1} simPlaying={false} onStartSimulation={() => {}} />
    );
    const svgPath = path.join(WEB_ROOT, 'public', 'assets', 'talos-fragment-shield-3d.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    expect(spatialHeroHtml).toContain('data-testid="fragment-spatial-hero-3d"');
    expect(spatialHeroHtml).toContain('perspective(1100px)');
    expect(spatialHeroHtml).toContain('preserve-3d');
    expect(spatialHeroHtml).toContain('data-testid="spatial-shard-hostile-trap"');
    expect(spatialHeroHtml).toContain('translateZ(16px)');
    expect(spatialHeroHtml).toContain('data-testid="spatial-shard-talos-shield"');
    expect(spatialHeroHtml).toContain('translateZ(30px)');
    expect(spatialHeroHtml).toContain('data-testid="spatial-shard-paypal-vault"');
    expect(spatialHeroHtml).toContain('translateZ(44px)');
    expect(spatialHeroHtml).toContain('data-testid="spatial-stage-cue-1"');
    expect(spatialHeroHtml).toContain('data-testid="spatial-stage-cue-2"');
    expect(spatialHeroHtml).toContain('data-testid="spatial-stage-cue-3"');
    expect(spatialHeroHtml).toContain('data-testid="spatial-stage-cue-4"');
    expect(spatialHeroHtml).toContain('data-testid="spatial-hero-replay-btn"');

    expect(svgContent).toContain('id="layer-1-hostile-shards"');
    expect(svgContent).toContain('id="layer-2-talos-3d-shield"');
    expect(svgContent).toContain('id="layer-3-paypal-escrow-vault"');
    expect(svgContent).toContain('+$231.00 Saved Instantly');

    for (const assetName of [
      'talos-fragment-shield-3d.svg',
      'talos-hero-visual.png',
      'talos-escrow-visual.png',
      'talos-clearing-artifact.png',
    ]) {
      const assetFullPath = path.join(WEB_ROOT, 'public', 'assets', assetName);
      expect(fs.existsSync(assetFullPath), `Missing visual asset ${assetName}`).toBe(true);
      expect(fs.statSync(assetFullPath).size).toBeGreaterThan(100);
    }
  });
});
