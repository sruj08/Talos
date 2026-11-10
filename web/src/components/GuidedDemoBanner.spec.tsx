import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuidedDemoBanner } from './GuidedDemoBanner';
import { GUIDED_DEMO_STEPS, executeGuidedDemoStepDomAction } from '../lib/guided-demo-steps';
import TALOSCommandCenterPage from '../app/command-center/page';

describe('Guided Judge Walkthrough & Step-by-Step Demo Director (GuidedDemoBanner)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the 3-column plain-English orientation strip and all 4 interactive judge walkthrough steps', () => {
    const html = renderToStaticMarkup(<GuidedDemoBanner />);

    expect(html).toContain('data-testid="guided-demo-banner"');
    expect(html).toContain('data-testid="judge-orientation-strip"');
    expect(html).toContain('The Problem: Blind AI Spending');
    expect(html).toContain('The Solution: TALOS Security + Escrow Referee');
    expect(html).toContain('How to Experience the Demo');
    expect(html).toContain('Interactive 4-Step Judge Walkthrough');
    expect(html).toContain('data-testid="demo-view-mode-toggle"');
    expect(html).toContain('data-testid="mode-command-center-btn"');
    expect(html).toContain('data-testid="mode-step-guide-btn"');
    expect(html).toContain('data-testid="guided-demo-autoplay-btn"');
    expect(html).toContain('data-testid="guided-demo-next-btn"');
    expect(html).toContain('data-testid="guided-step-1"');
    expect(html).toContain('data-testid="guided-step-2"');
    expect(html).toContain('data-testid="guided-step-3"');
    expect(html).toContain('data-testid="guided-step-4"');
    expect(html).toContain('data-testid="guided-demo-outcome-banner"');
  });

  it('renders plain-English judge explainers across all 5 Command Center modules and KPI subtitles', () => {
    const html = renderToStaticMarkup(<TALOSCommandCenterPage />);

    expect(html).toContain('Money protected inside reversible PayPal holds');
    expect(html).toContain('Hack attempts stopped before reaching the AI');
    expect(html).toContain('Money saved by blocking overpriced sellers');
    expect(html).toContain('Orders held in escrow awaiting carrier delivery');
    expect(html).toContain('data-testid="mandate-judge-explainer"');
    expect(html).toContain('data-testid="arena-judge-explainer"');
    expect(html).toContain('data-testid="btn-jump-to-ledger"');
    expect(html).toContain('data-testid="blotter-judge-legend"');
    expect(html).toContain('1. What the Hacker Hid vs. What the AI Saw');
    expect(html).toContain('2. Scammer Price vs. Fair Market Price');
    expect(html).toContain('3. Live PayPal Sandbox Escrow Controls');
    expect(html).toContain('data-testid="bryntum-judge-explainer"');
    expect(html).toContain('data-testid="stepup-judge-explainer"');
  });

  it('executes DOM click actions and multi-page route navigation safely across all 4 step specs and edge cases', () => {
    // Edge case 1: SSR environment where document is undefined
    vi.stubGlobal('document', undefined);
    expect(() => executeGuidedDemoStepDomAction(GUIDED_DEMO_STEPS[0])).not.toThrow();

    // Edge case 2: Document exists, elements missing, navigate callback invoked
    const emptyQuerySelector = vi.fn().mockReturnValue(null);
    const navigateSpy = vi.fn();
    vi.stubGlobal('document', { querySelector: emptyQuerySelector });
    expect(() => executeGuidedDemoStepDomAction(GUIDED_DEMO_STEPS[1], { navigate: navigateSpy })).not.toThrow();
    expect(emptyQuerySelector).toHaveBeenCalledWith('[data-testid="btn-scenario-act1"]');
    expect(emptyQuerySelector).toHaveBeenCalledWith('[data-testid="select-row-esc-901-trap"]');
    expect(navigateSpy).toHaveBeenCalledWith('/simulator');

    // Happy path: clicks primary and secondary buttons and navigates to targetRoute
    const primaryClick = vi.fn();
    const secondaryClick = vi.fn();
    const routeNavigate = vi.fn();
    vi.stubGlobal('document', {
      querySelector: (sel: string) => {
        if (sel === '[data-testid="btn-scenario-act2"]') return { click: primaryClick };
        if (sel === '[data-testid="select-row-esc-902-sm7b"]') return { click: secondaryClick };
        return null;
      },
    });

    executeGuidedDemoStepDomAction(GUIDED_DEMO_STEPS[2], { navigate: routeNavigate });
    expect(primaryClick).toHaveBeenCalledTimes(1);
    expect(secondaryClick).toHaveBeenCalledTimes(1);
    expect(routeNavigate).toHaveBeenCalledWith('/blotter');

    // Edge case 3: omitting navigate skips route transition
    routeNavigate.mockClear();
    executeGuidedDemoStepDomAction(GUIDED_DEMO_STEPS[2]);
    expect(routeNavigate).not.toHaveBeenCalled();

    // Edge case 4: Sub-route fallback broadcasts TalosEscrowEvent when PoisonedStoreSim buttons are absent
    const receivedEvents: Array<{ escrow_id?: string; new_state?: string }> = [];
    const dispatchEvent = vi.fn((evt: { detail?: { escrow_id?: string; new_state?: string } }) => {
      if (evt?.detail) receivedEvents.push(evt.detail);
      return true;
    });
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('CustomEvent', class MockCustomEvent {
      type: string;
      detail: unknown;
      constructor(type: string, init?: { detail?: unknown }) {
        this.type = type;
        this.detail = init?.detail;
      }
    });
    vi.stubGlobal('document', { querySelector: () => null });

    executeGuidedDemoStepDomAction(GUIDED_DEMO_STEPS[1]);
    executeGuidedDemoStepDomAction(GUIDED_DEMO_STEPS[2]);
    executeGuidedDemoStepDomAction(GUIDED_DEMO_STEPS[3]);

    expect(receivedEvents).toEqual([
      expect.objectContaining({ escrow_id: 'esc-901-trap', new_state: 'BLOCKED_DOM_INJECTION' }),
      expect.objectContaining({ escrow_id: 'esc-902-sm7b', new_state: 'PAYPAL_CAPTURED' }),
      expect.objectContaining({ escrow_id: 'esc-903-scarlett', new_state: 'PAYPAL_VOIDED' }),
    ]);
  });
});
