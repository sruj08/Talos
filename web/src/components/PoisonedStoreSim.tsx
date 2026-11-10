'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Mic, ShieldAlert, Terminal } from 'lucide-react';
import { useTalosClearing } from '../context/TalosClearingContext';
import { usePoisonedStoreSim } from '../hooks/usePoisonedStoreSim';
import { navigateToRoute } from '../lib/navigation';
import { SideBySideAgentComparison } from './SideBySideAgentComparison';
import { TechnicalProofDrawer } from './TechnicalProofDrawer';

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
      aria-label="Watch the AI Shop (3 Real-World Scenarios)"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4" data-testid="judge-scenario-toolbar">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-lg icon-medallion-crimson inline-flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-crimson font-bold">Scene 02 · Live Store Simulation</span>
              </div>
              <h2 className="paypal-title-sm text-ink">Watch the AI Shop (3 Real-World Scenarios)</h2>
              <p data-subhead="true" className="paypal-caption text-ink-secondary">
                Compare Normal AI vs. TALOS across three live store checkouts
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-ink-secondary tabular-nums whitespace-nowrap px-3.5 py-1.5 rounded-pill sovereign-subcard">
            <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
            <span>Saves $231 · 2.84ms Shield</span>
          </span>
        </div>

        {/* Surface the Aha! Moment Directly at the Top of Scene 2 */}
        <SideBySideAgentComparison
          activeAct={activeAct}
          running={running}
          onRunAct1={runAct1PoisonedAttack}
          onRunAct2={runAct2HappyPathCapture}
          onRunAct3={runAct3SlaBreachAndStepUp}
        />

        {/* Visual Storefront Product Card */}
        <div className="sovereign-subcard p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-11 h-11 rounded-lg icon-medallion-paypal inline-flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink">Shure SM7B Vocal Dynamic Microphone</span>
                <span className="text-xs text-ink-muted">SKU #SM7B-PRO</span>
              </div>
              <div className="text-xs text-ink-secondary">
                Click any scenario below to watch the CFO Dashboard update live
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
            <div className="tone-crimson px-3.5 py-2 rounded-lg">
              <div className="text-xs text-ink-secondary">Scam Store Ask</div>
              <div className="text-sm font-bold text-ink-crimson">$480.00 Trap</div>
            </div>
            <div className="tone-emerald px-3.5 py-2 rounded-lg">
              <div className="text-xs text-ink-secondary">Verified Store Price</div>
              <div className="text-sm font-bold text-ink-emerald">$249.00 (Saves $231)</div>
            </div>
          </div>
        </div>

        <div data-testid="arena-judge-explainer" className="tone-paypal p-3.5 rounded-lg text-xs text-ink-secondary leading-relaxed">
          <strong className="text-ink font-bold">Choose a Shopping Scenario (Scene 2): </strong>
          Test how TALOS handles a $480 scam store, a $249 honest store with FedEx delivery, and a late shipment + $450 order requiring Approve with PayPal.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            type="button"
            disabled={running} data-running={running}
            onClick={() => void runAct1PoisonedAttack()}
            data-testid="btn-scenario-act1"
            className={`p-4 text-left text-xs rounded-lg transition-all active:scale-[0.98] ${
              activeAct === 'ACT_1' ? 'tone-crimson font-bold shadow-sm' : 'sovereign-subcard text-ink-secondary hover:text-ink'
            }`}
          >
            <span data-testid="trigger-act1-btn" className="block space-y-2 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-bold text-ink">
                <span className="inline-flex items-center gap-2">
                  <span className="w-8 h-8 rounded-md icon-medallion-crimson inline-flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>Scenario 1: The Scam Store ($480 Trap)</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-xs dot-crimson shrink-0" aria-hidden="true" />
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                Normal AI loses $480 vs. TALOS blocks the hidden trick and buys for $249 (saves $231)
              </span>
              <span className="block text-xs text-ink-muted">Scenario A (Act 1) · Blocked in 2.84ms</span>
            </span>
          </button>

          <button
            type="button"
            disabled={running} data-running={running}
            onClick={() => void runAct2HappyPathCapture()}
            data-testid="btn-scenario-act2"
            className={`p-4 text-left text-xs rounded-lg transition-all active:scale-[0.98] ${
              activeAct === 'ACT_2' ? 'tone-emerald font-bold shadow-sm' : 'sovereign-subcard text-ink-secondary hover:text-ink'
            }`}
          >
            <span data-testid="trigger-act2-btn" className="block space-y-2 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-bold text-ink">
                <span className="inline-flex items-center gap-2">
                  <span className="w-8 h-8 rounded-md icon-medallion-emerald inline-flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>Scenario 2: The Honest Store ($249 Verified)</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-xs dot-emerald shrink-0" aria-hidden="true" />
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                PayPal holds $249 safely until FedEx delivers the box, then pays the seller
              </span>
              <span className="block text-xs text-ink-muted">Scenario B (Act 2) · FedEx Verified</span>
            </span>
          </button>

          <button
            type="button"
            disabled={running} data-running={running}
            onClick={() => void runAct3SlaBreachAndStepUp()}
            data-testid="btn-scenario-act3"
            className={`p-4 text-left text-xs rounded-lg transition-all active:scale-[0.98] ${
              activeAct === 'ACT_3' ? 'tone-amber font-bold shadow-sm' : 'sovereign-subcard text-ink-secondary hover:text-ink'
            }`}
          >
            <span data-testid="trigger-act3-btn" className="block space-y-2 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-bold text-ink">
                <span className="inline-flex items-center gap-2">
                  <span className="w-8 h-8 rounded-md icon-medallion-amber inline-flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>Scenario 3: The Late Delivery &amp; Big Order ($450)</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-xs dot-amber shrink-0" aria-hidden="true" />
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                PayPal auto-refunds a late shipment in 0 seconds &amp; pauses a $450 item for Approve with PayPal
              </span>
              <span className="block text-xs text-ink-muted">Scenario C (Act 3) · 0s Refund + Co-Sign</span>
            </span>
          </button>
        </div>
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
          <p className="text-ink-secondary tabular-nums leading-relaxed">{telemetry.detail}</p>
        </div>

        {/* On-Demand View Technical Proof Drawer for Raw DOM Diff, 9277 bps, and lol_html + DeBERTa-v3 ONNX */}
        <TechnicalProofDrawer
          title="Red-Team Interception Arena · Raw DOM Sanitization & Price Spread Telemetry"
          buttonLabel="View Technical Proof"
          summaryBadge={`Latency: ${telemetry.latencyMs}ms · Risk: ${telemetry.firewallRiskScore} · Spread: ${telemetry.channel3SpreadBps} bps`}
          testId="arena-technical-proof-drawer"
          buttonTestId="btn-arena-technical-proof"
        >
          <div className="space-y-3">
            <div className="text-xs text-ink-secondary tabular-nums flex flex-wrap items-center justify-between gap-3">
              <span>Red-Team Interception Arena · DeBERTa-v3 ONNX &lt;4ms</span>
              <span>Latency: {telemetry.latencyMs}ms · Risk: {telemetry.firewallRiskScore} · Spread: {telemetry.channel3SpreadBps} bps</span>
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
                <code className="font-mono block text-xs text-ink-muted break-all leading-relaxed">
                  {telemetry.rawHtmlExcerpt}
                </code>
              </div>
              <div className="paypal-code-block flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-bold text-ink-secondary">
                  <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
                  <span>Sanitized Agent DOM (After lol_html):</span>
                </div>
                <code className="font-mono block text-xs text-ink break-all leading-relaxed">
                  {telemetry.sanitizedHtmlExcerpt}
                </code>
              </div>
            </div>
          </div>
        </TechnicalProofDrawer>
      </div>
    </section>
  );
}
