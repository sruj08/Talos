'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Mic, ShieldAlert, Terminal } from 'lucide-react';
import { useTalosClearing } from '../context/TalosClearingContext';
import { usePoisonedStoreSim } from '../hooks/usePoisonedStoreSim';
import { navigateToRoute } from '../lib/navigation';
import { SideBySideAgentComparison } from './SideBySideAgentComparison';

export function PoisonedStoreSim() {
  const { demoViewMode, activeDemoStep, setActiveDemoStep } = useTalosClearing();
  const { activeAct, telemetry, running, runAct1PoisonedAttack, runAct2HappyPathCapture, runAct3SlaBreachAndStepUp } =
    usePoisonedStoreSim();

  const handleJumpToDownstream = () => {
    if (demoViewMode === 'STEP_GUIDE') {
      if (activeAct === 'ACT_3' && activeDemoStep !== 3 && activeDemoStep !== 4) setActiveDemoStep(4);
      else if (activeAct !== 'ACT_3' && activeDemoStep !== 2 && activeDemoStep !== 3) setActiveDemoStep(2);
    }
    const targetRoute = activeAct === 'ACT_3' ? '/sla' : '/blotter';
    navigateToRoute(targetRoute);
  };

  return (
    <section
      id="chapter-arena"
      className="paypal-feature-card p-6 sm:p-7 flex flex-col justify-between gap-5 h-full"
      data-testid="poisoned-store-sim"
      data-active-act={activeAct}
      aria-label="Red-Team Interception Arena"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4" data-testid="judge-scenario-toolbar">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-lg icon-medallion-crimson inline-flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-crimson font-bold">02</span>
                <h2 className="paypal-title-sm text-ink">Red-Team Interception Arena</h2>
              </div>
              <p data-subhead="true" className="paypal-caption text-ink-secondary">
                Simulate poisoned merchant DOM injections, Channel3 verification, and SLA breach rollbacks
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-secondary tabular-nums whitespace-nowrap px-3.5 py-1.5 rounded-pill sovereign-subcard">
            <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
            <span>DeBERTa-v3 ONNX &lt;4ms</span>
          </span>
        </div>

        {/* Visual Storefront Product Card with X-Ray Price & Threat Overlay */}
        <div className="sovereign-subcard p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-lg icon-medallion-paypal inline-flex items-center justify-center shrink-0">
              <Mic className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink">Shure SM7B Vocal Dynamic Microphone</span>
                <span className="font-mono text-[11px] text-ink-muted">SKU #SM7B-PRO</span>
              </div>
              <div className="text-xs text-ink-secondary">
                Live Merchant Storefront Simulation · X-Ray DOM &amp; Price Spread Inspector
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
            <div className="tone-crimson px-3.5 py-2 rounded-lg">
              <div className="text-[10px] text-ink-secondary">Trap Store Ask (+92.7% Gouge)</div>
              <div className="font-mono text-sm font-bold text-ink-crimson">$480.00 · Hidden Override</div>
            </div>
            <div className="tone-emerald px-3.5 py-2 rounded-lg">
              <div className="text-[10px] text-ink-secondary">Channel3 Fair Market Median</div>
              <div className="font-mono text-sm font-bold text-ink-emerald">$249.00 · Verified Escrow</div>
            </div>
          </div>
        </div>

        <div data-testid="arena-judge-explainer" className="tone-paypal p-3.5 rounded-lg text-xs text-ink-secondary leading-relaxed">
          <strong className="text-ink font-bold">What Happens When You Click (Step 2): </strong>
          Pick a scenario below to send the AI shopping agent into a live merchant storefront and watch how TALOS responds.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            type="button"
            data-running={running}
            onClick={() => void runAct1PoisonedAttack()}
            data-testid="btn-scenario-act1"
            className={`p-4 text-left text-xs rounded-lg transition-all ${
              activeAct === 'ACT_1' ? 'tone-crimson font-bold shadow-sm' : 'sovereign-subcard text-ink-secondary hover:text-ink'
            }`}
          >
            <span data-testid="trigger-act1-btn" className="block space-y-2.5 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-bold text-ink whitespace-nowrap">
                <span className="inline-flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-md icon-medallion-crimson inline-flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>Scenario A (Act 1)</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-xs dot-crimson" aria-hidden="true" />
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                Attack: Poisoned DOM ($480 Gouge) &rarr; Blocked &lt;4ms
              </span>
              <span className="block text-[11px] text-ink-muted">Result: Blocks hack &amp; saves $231</span>
            </span>
          </button>

          <button
            type="button"
            data-running={running}
            onClick={() => void runAct2HappyPathCapture()}
            data-testid="btn-scenario-act2"
            className={`p-4 text-left text-xs rounded-lg transition-all ${
              activeAct === 'ACT_2' ? 'tone-emerald font-bold shadow-sm' : 'sovereign-subcard text-ink-secondary hover:text-ink'
            }`}
          >
            <span data-testid="trigger-act2-btn" className="block space-y-2.5 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-bold text-ink whitespace-nowrap">
                <span className="inline-flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-md icon-medallion-emerald inline-flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>Scenario B (Act 2)</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                Happy Path: $249 Channel3 &rarr; AUTHORIZE &rarr; CAPTURE
              </span>
              <span className="block text-[11px] text-ink-muted">Result: Holds $249 &rarr; Paid on delivery</span>
            </span>
          </button>

          <button
            type="button"
            data-running={running}
            onClick={() => void runAct3SlaBreachAndStepUp()}
            data-testid="btn-scenario-act3"
            className={`p-4 text-left text-xs rounded-lg transition-all ${
              activeAct === 'ACT_3' ? 'tone-amber font-bold shadow-sm' : 'sovereign-subcard text-ink-secondary hover:text-ink'
            }`}
          >
            <span data-testid="trigger-act3-btn" className="block space-y-2.5 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-bold text-ink whitespace-nowrap">
                <span className="inline-flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-md icon-medallion-amber inline-flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>Scenario C (Act 3)</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-xs dot-amber" aria-hidden="true" />
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                SLA Breach: Bryntum Delay &rarr; PayPal VOID + $450 Step-Up
              </span>
              <span className="block text-[11px] text-ink-muted">Result: 0s $219 refund + $450 co-sign</span>
            </span>
          </button>
        </div>

        <SideBySideAgentComparison
          activeAct={activeAct}
          running={running}
          onRunAct1={runAct1PoisonedAttack}
          onRunAct2={runAct2HappyPathCapture}
          onRunAct3={runAct3SlaBreachAndStepUp}
        />
      </div>

      <div
        role="status"
        aria-live="polite"
        data-testid="simulator-telemetry-card"
        className="sovereign-subcard p-4 flex flex-col gap-4 text-xs"
      >
        <div className="flex flex-col gap-2" data-testid="scenario-active-banner">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 font-bold text-ink">
              <Terminal className="w-4 h-4 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
              <span>{telemetry.headline}</span>
            </span>
            <div className="font-mono text-xs text-ink-secondary tabular-nums inline-flex flex-wrap items-center gap-3">
              <span>Latency: {telemetry.latencyMs}ms</span>
              <span>Risk: {telemetry.firewallRiskScore}</span>
              <span>Spread: {telemetry.channel3SpreadBps} bps</span>
            </div>
          </div>
          <p className="text-ink-secondary tabular-nums leading-relaxed">{telemetry.detail}</p>
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-ink-muted">
              Plain English: Raw HTML on the left is what the website sent; Sanitized HTML on the right is what the AI actually sees.
            </span>
            <button
              type="button"
              onClick={handleJumpToDownstream}
              data-testid="btn-jump-to-ledger"
              className="btn-paypal-primary h-9 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold whitespace-nowrap"
            >
              <span>Open Ledger Result Page</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="scenario-dom-diff">
          <div
            key={activeAct}
            data-testid="dom-diff-laser-scanline"
            className="laser-scanline-bar pointer-events-none absolute inset-x-0 top-0 h-px"
            aria-hidden="true"
          />
          <div className="paypal-code-block flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-ink-secondary">
              <span className="w-1.5 h-1.5 rounded-xs dot-crimson" aria-hidden="true" />
              <span>Raw Storefront DOM (Before lol_html):</span>
            </div>
            <code className="font-mono block text-[11px] text-ink-muted break-all leading-relaxed">
              {telemetry.rawHtmlExcerpt}
            </code>
          </div>
          <div className="paypal-code-block flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-ink-secondary">
              <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              <span>Sanitized Agent DOM (After lol_html):</span>
            </div>
            <code className="font-mono block text-[11px] text-ink break-all leading-relaxed">
              {telemetry.sanitizedHtmlExcerpt}
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}
