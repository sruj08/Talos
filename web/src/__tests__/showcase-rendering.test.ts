import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  COMPARISON_ACT_PRESETS,
  evaluateEscrowLifecycleTransition,
} from '../lib/agent-comparison-scenarios';
import {
  FIVE_PART_STORY_STAGES,
  STARTUP_PRODUCT_POSITIONING,
  TALOS_FOUR_PILLARS,
} from '../lib/storytelling-parts';
import {
  SEEDED_ESCROW_ROWS,
  applyEscrowEventToRows,
  computeKpiMetrics,
  normalizeEscrowState,
} from '../hooks/useEscrowStream';
import { EscrowLifecycleState } from '../lib/phase6-events';
import { StartupProductHero } from '../components/StartupProductHero';
import { StoryWalkthroughFivePart } from '../components/StoryWalkthroughFivePart';
import { SideBySideAgentComparison } from '../components/SideBySideAgentComparison';
import { PoisonedStoreSim } from '../components/PoisonedStoreSim';
import TalosLandingPage from '../app/page';
import TALOSCommandCenterPage from '../app/command-center/page';

describe('TALOS Showcase Property-Based & Rendering Suite — Properties 4..5 (R3, R4)', () => {
  describe('Property 4: Escrow State Machine & Ledger KPI Conservation Invariants', () => {
    const allStates: EscrowLifecycleState[] = [
      'PAYPAL_AUTHORIZED',
      'PAYPAL_CAPTURED',
      'PAYPAL_VOIDED',
      'STEP_UP_REQUIRED',
      'BLOCKED_DOM_INJECTION',
    ];
    const allEvents = [
      'CARRIER_DELIVERED' as const,
      'SLA_BREACH' as const,
      'STEP_UP_APPROVE' as const,
      'STEP_UP_REJECT' as const,
    ];

    it('enforces terminal state finality and valid escrow state transitions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allStates),
          fc.constantFrom(...allEvents),
          (current, eventType) => {
            const next = evaluateEscrowLifecycleTransition(current, eventType);
            if (
              current === 'PAYPAL_CAPTURED' ||
              current === 'PAYPAL_VOIDED' ||
              current === 'BLOCKED_DOM_INJECTION'
            ) {
              expect(next).toBe(current);
            } else if (current === 'STEP_UP_REQUIRED') {
              expect(next).toBe(
                eventType === 'STEP_UP_APPROVE' ? 'PAYPAL_AUTHORIZED' : 'PAYPAL_VOIDED'
              );
            } else if (current === 'PAYPAL_AUTHORIZED') {
              if (eventType === 'SLA_BREACH' || eventType === 'STEP_UP_REJECT') {
                expect(next).toBe('PAYPAL_VOIDED');
              } else if (eventType === 'CARRIER_DELIVERED') {
                expect(next).toBe('PAYPAL_CAPTURED');
              } else {
                expect(next).toBe('PAYPAL_AUTHORIZED');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('preserves unique escrow_id rows and non-negative KPI metrics across arbitrary event sequences', () => {
      const eventArb = fc.record({
        escrow_id: fc.constantFrom(
          'esc-901-trap',
          'esc-902-sm7b',
          'esc-903-scarlett',
          'esc-904-genelec',
          'esc-905-custom'
        ),
        new_state: fc.constantFrom(...allStates),
        amount_cents: fc.integer({ min: 5000, max: 200_000 }),
      });

      fc.assert(
        fc.property(fc.array(eventArb, { minLength: 1, maxLength: 15 }), (events) => {
          let rows = [...SEEDED_ESCROW_ROWS];
          for (const evt of events) {
            rows = applyEscrowEventToRows(rows, {
              event_id: `evt-${evt.escrow_id}`,
              event_type: 'ESCROW_STATE_TRANSITION',
              timestamp: '2026-11-09T12:00:00Z',
              escrow_id: evt.escrow_id,
              new_state: evt.new_state,
              amount_cents: evt.amount_cents,
              ag_grid_row_delta: {
                escrow_id: evt.escrow_id,
                state: evt.new_state,
                amount_cents: evt.amount_cents,
              },
            });
          }

          const uniqueIds = new Set(rows.map((r) => r.escrow_id));
          expect(uniqueIds.size).toBe(rows.length);

          const kpis = computeKpiMetrics(rows);
          expect(kpis.protectedGmvCents).toBeGreaterThan(0);
          expect(kpis.blockedInjectionsCount).toBeGreaterThanOrEqual(2);
          expect(kpis.channel3SavingsCents).toBeGreaterThanOrEqual(0);
          expect(kpis.activePayPalAuthCount).toBeGreaterThanOrEqual(0);
          expect(normalizeEscrowState('PAYPAL_VOIDED')).toBe('PAYPAL_VOIDED');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Startup Landing Page, 5-Part Storytelling & Side-by-Side Comparison Rendering Contract', () => {
    it('defines all 4 architectural pillars and all 5 plain-language storytelling stages', () => {
      expect(STARTUP_PRODUCT_POSITIONING.headline.length).toBeGreaterThan(15);
      expect(STARTUP_PRODUCT_POSITIONING.keyBenefits).toHaveLength(3);
      expect(TALOS_FOUR_PILLARS).toHaveLength(4);
      expect(FIVE_PART_STORY_STAGES).toHaveLength(5);

      for (const stage of FIVE_PART_STORY_STAGES) {
        expect(stage.plainNarrative.length).toBeGreaterThan(20);
        expect(stage.buyerPerspective.length).toBeGreaterThan(20);
        expect(stage.underTheHood.length).toBeGreaterThan(20);
        expect(stage.financialConsequence.length).toBeGreaterThan(10);
      }

      expect(COMPARISON_ACT_PRESETS.ACT_1.injectHiddenPrompt).toBe(true);
      expect(COMPARISON_ACT_PRESETS.ACT_2.injectHiddenPrompt).toBe(false);
      expect(COMPARISON_ACT_PRESETS.ACT_3.carrierHoursElapsed).toBeGreaterThan(
        COMPARISON_ACT_PRESETS.ACT_3.slaDeadlineHours
      );
    });

    it('renders StartupProductHero, StoryWalkthroughFivePart, SideBySideAgentComparison, PoisonedStoreSim, and full page cleanly', () => {
      const heroHtml = renderToStaticMarkup(
        React.createElement(StartupProductHero, {
          showcaseView: 'ALL',
          onSelectShowcaseView: () => {},
          onTryInteractiveDemo: () => {},
        })
      );
      expect(heroHtml).toContain('data-testid="startup-landing-hero"');
      expect(heroHtml).toContain('data-testid="landing-try-demo-cta"');
      expect(heroHtml).toContain('data-testid="showcase-view-switcher"');
      expect(heroHtml).toContain('data-testid="talos-pillar-1"');
      expect(heroHtml).toContain('data-testid="talos-pillar-4"');

      const storyHtml = renderToStaticMarkup(React.createElement(StoryWalkthroughFivePart));
      expect(storyHtml).toContain('data-testid="storytelling-walkthrough-5part"');
      expect(storyHtml).toContain('data-testid="story-stage-1"');
      expect(storyHtml).toContain('data-testid="story-stage-5"');
      expect(storyHtml).toContain('data-testid="story-active-stage-detail"');

      const comparisonHtml = renderToStaticMarkup(React.createElement(SideBySideAgentComparison));
      expect(comparisonHtml).toContain('data-testid="side-by-side-agent-comparison"');
      expect(comparisonHtml).toContain('data-testid="unprotected-agent-outcome"');
      expect(comparisonHtml).toContain('data-testid="talos-protected-agent-outcome"');
      expect(comparisonHtml).toContain('data-testid="ai-internal-pipeline"');
      expect(comparisonHtml).toContain('data-testid="pipeline-step-1"');
      expect(comparisonHtml).toContain('data-testid="pipeline-step-5"');

      const simHtml = renderToStaticMarkup(React.createElement(PoisonedStoreSim));
      expect(simHtml).toContain('data-testid="poisoned-store-sim"');
      expect(simHtml).toContain('data-testid="side-by-side-agent-comparison"');

      const landingHtml = renderToStaticMarkup(React.createElement(TalosLandingPage));
      expect(landingHtml).toContain('data-testid="talos-landing-page"');
      expect(landingHtml).toContain('data-testid="startup-landing-hero"');
      expect(landingHtml).toContain('data-testid="hero-agent-preview"');
      expect(landingHtml).toContain('data-testid="investor-business-pitch-strip"');
      expect(landingHtml).toContain('data-testid="landing-scenario-preview"');
      expect(landingHtml).toContain('data-testid="talos-pillar-1"');
      expect(landingHtml).toContain('data-testid="talos-pillar-4"');
      expect(landingHtml).toContain('data-testid="landing-integrations"');
      expect(landingHtml).toContain('data-testid="landing-launch-banner"');
      expect(landingHtml).not.toContain('data-testid="ag-studio-blotter"');
      expect(landingHtml).not.toContain('data-testid="kpi-header-bar"');

      const pageHtml = renderToStaticMarkup(React.createElement(TALOSCommandCenterPage));
      expect(pageHtml).toContain('data-testid="sovereign-telemetry-header"');
      expect(pageHtml).toContain('data-testid="kpi-header-bar"');
      expect(pageHtml).toContain('data-testid="side-by-side-agent-comparison"');
      expect(pageHtml).toContain('data-testid="operator-suite"');
      expect(pageHtml).not.toContain('data-testid="startup-landing-hero"');
    });
  });
});
