'use client';

import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Play, ShieldCheck } from 'lucide-react';
import type { JudgeActId } from '../hooks/usePoisonedStoreSim';
import {
  AgentComparisonParams,
  COMPARISON_ACT_PRESETS,
  evaluateAgentComparisonScenario,
} from '../lib/agent-comparison-scenarios';

export interface SideBySideAgentComparisonProps {
  activeAct?: JudgeActId;
  running?: boolean;
  onRunAct1?: () => Promise<void>;
  onRunAct2?: () => Promise<void>;
  onRunAct3?: () => Promise<void>;
}

export function SideBySideAgentComparison({
  activeAct = 'ACT_1',
  running = false,
  onRunAct1 = async () => {},
  onRunAct2 = async () => {},
  onRunAct3 = async () => {},
}: SideBySideAgentComparisonProps) {
  const [params, setParams] = useState<AgentComparisonParams>(
    COMPARISON_ACT_PRESETS[activeAct] || COMPARISON_ACT_PRESETS.ACT_1
  );

  useEffect(() => {
    setParams(COMPARISON_ACT_PRESETS[activeAct] || COMPARISON_ACT_PRESETS.ACT_1);
  }, [activeAct]);

  const { unprotected, talosProtected, pipelineSteps } = evaluateAgentComparisonScenario(params);

  const togglePromptInjection = () =>
    setParams((prev) => ({ ...prev, injectHiddenPrompt: !prev.injectHiddenPrompt }));

  const togglePriceGouge = () =>
    setParams((prev) => ({
      ...prev,
      merchantAskUsd: prev.merchantAskUsd >= 400 ? 249 : 480,
      fairMarketMedianUsd: 249,
    }));

  const toggleSlaBreach = () =>
    setParams((prev) => ({
      ...prev,
      carrierHoursElapsed: prev.carrierHoursElapsed > prev.slaDeadlineHours ? 26 : 56,
    }));

  const handleRunLiveComparison = () => {
    if (talosProtected.injectionDetected || talosProtected.priceGougeBlocked) {
      void onRunAct1();
    } else if (talosProtected.slaAutoVoided || talosProtected.stepUpRequired) {
      void onRunAct3();
    } else {
      void onRunAct2();
    }
  };

  return (
    <div
      data-testid="side-by-side-agent-comparison"
      className="sovereign-subcard p-4 flex flex-col gap-4 text-xs"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2.5 font-medium text-ink">
            <span className="w-8 h-8 rounded-control icon-medallion-paypal inline-flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span>Side-by-Side Simulator: Unprotected AI Agent vs. TALOS-Protected AI Agent</span>
          </div>
          <span className="font-mono text-[11px] text-ink-muted tabular-nums">
            Live Manipulation Lab · Toggle Attack Vectors Below
          </span>
        </div>

        <div
          data-testid="manipulation-controls-bar"
          className="sovereign-well p-2.5 flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="toggle-prompt-injection"
              aria-pressed={params.injectHiddenPrompt}
              onClick={togglePromptInjection}
              className={`min-h-8 max-w-full inline-flex items-center gap-1.5 px-3 text-xs font-bold rounded-pill transition-colors text-left ${
                params.injectHiddenPrompt ? 'tone-crimson text-ink' : 'btn-sovereign-neutral text-ink-secondary'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-xs ${params.injectHiddenPrompt ? 'dot-crimson' : 'dot-emerald'}`} aria-hidden="true" />
              <span>Hidden DOM Injection: {params.injectHiddenPrompt ? 'Injected (Active)' : 'Clean HTML'}</span>
            </button>

            <button
              type="button"
              data-testid="toggle-price-gouge"
              aria-pressed={talosProtected.priceGougeBlocked}
              onClick={togglePriceGouge}
              className={`h-8 inline-flex items-center gap-1.5 px-3 text-xs font-bold rounded-pill transition-colors tabular-nums whitespace-nowrap ${
                talosProtected.priceGougeBlocked ? 'tone-amber text-ink' : 'btn-sovereign-neutral text-ink-secondary'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-xs ${talosProtected.priceGougeBlocked ? 'dot-amber' : 'dot-emerald'}`} aria-hidden="true" />
              <span>Store Price: ${params.merchantAskUsd.toFixed(0)} Trap vs ${params.fairMarketMedianUsd.toFixed(0)} Fair</span>
            </button>

            <button
              type="button"
              data-testid="toggle-sla-breach"
              aria-pressed={talosProtected.slaAutoVoided}
              onClick={toggleSlaBreach}
              className={`h-8 inline-flex items-center gap-1.5 px-3 text-xs font-bold rounded-pill transition-colors tabular-nums whitespace-nowrap ${
                talosProtected.slaAutoVoided ? 'tone-amber text-ink' : 'btn-sovereign-neutral text-ink-secondary'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-xs ${talosProtected.slaAutoVoided ? 'dot-crimson' : 'dot-paypal'}`} aria-hidden="true" />
              <span>Carrier Delivery: {params.carrierHoursElapsed}h / {params.slaDeadlineHours}h Rule</span>
            </button>
          </div>

          <button
            type="button"
            data-testid="btn-run-side-by-side-live"
            disabled={running}
            onClick={handleRunLiveComparison}
            className="btn-paypal-primary h-8 inline-flex items-center gap-1.5 px-3 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>Run Side-by-Side Comparison</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          data-testid="unprotected-agent-outcome"
          className="tone-crimson p-4 rounded-inner flex flex-col justify-between gap-3"
        >
          <div data-testid="unprotected-ai-column" className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2.5 font-bold text-ink">
                <span className="w-10 h-10 rounded-control icon-medallion-crimson inline-flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span>Left: Normal AI Agent (Unprotected)</span>
              </span>
              <span className="font-mono text-xs text-ink-secondary">Loses $480</span>
            </div>
            <div className="font-mono text-xs text-ink tabular-nums">{unprotected.verdictBadge}</div>
            <p className="text-xs text-ink-secondary leading-relaxed tabular-nums">
              {unprotected.hijacked
                ? 'Normal AI gets tricked and loses $480: it reads hidden webpage instructions, ignores your $300 allowance, and pays the $480 scam price.'
                : talosProtected.slaAutoVoided
                ? 'Pays upfront with no delivery guarantee—leaving your money stuck when the shipment arrives late (56h > 48h).'
                : 'Sends money immediately at checkout without checking fair store prices or holding funds until FedEx delivery.'}
            </p>
          </div>
          <div className="sovereign-well p-2.5 font-mono text-xs text-ink tabular-nums flex items-center justify-between gap-2">
            <span>Wallet Consequence:</span>
            <span className="text-ink-crimson font-bold">{unprotected.summary}</span>
          </div>
        </div>

        <div
          data-testid="talos-protected-agent-outcome"
          className="tone-emerald p-4 rounded-inner flex flex-col justify-between gap-3"
        >
          <div data-testid="talos-protected-ai-column" className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2.5 font-bold text-ink">
                <span className="w-10 h-10 rounded-control icon-medallion-emerald inline-flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span>Right: TALOS + PayPal Agent (Protected)</span>
              </span>
              <span className="font-mono text-xs text-ink-secondary tabular-nums">
                Saves $231 ({talosProtected.latencyMs}ms)
              </span>
            </div>
            <div className="font-mono text-xs text-ink tabular-nums">{talosProtected.verdictBadge}</div>
            <p className="text-xs text-ink-secondary leading-relaxed tabular-nums">
              {talosProtected.injectionDetected || talosProtected.priceGougeBlocked
                ? `TALOS blocks the trick in ${talosProtected.latencyMs}ms and buys it for $${talosProtected.protectedSpendUsd.toFixed(0)} from a verified store—saving $${talosProtected.savedUsd.toFixed(0)} inside PayPal escrow.`
                : talosProtected.slaAutoVoided
                ? 'Detects the late 56h shipment (> 48h rule), automatically refunds $219 in 0 seconds, and pauses the $450 order for Approve with PayPal.'
                : `Checks your $300 allowance and holds $${talosProtected.protectedSpendUsd.toFixed(0)} safely in PayPal escrow until FedEx delivers the box.`}
            </p>
          </div>
          <div className="sovereign-well p-2.5 font-mono text-xs text-ink tabular-nums flex items-center justify-between gap-2">
            <span>Protected Outcome:</span>
            <span className="text-ink-emerald font-bold">{talosProtected.summary}</span>
          </div>
        </div>
      </div>

      <div data-testid="ai-internal-pipeline" className="sovereign-well p-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-ink">Real-Time Internal AI Decision Pipeline (Step-by-Step Comparison)</span>
          <span className="font-mono text-[11px] text-ink-muted tabular-nums">Active Shield: {talosProtected.interceptionLayer}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {pipelineSteps.map((step) => (
            <div key={step.stepNumber} data-testid={`pipeline-step-${step.stepNumber}`} className="sovereign-subcard p-2.5 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between gap-1 font-mono text-[10px] text-ink-muted tabular-nums">
                <span>Step 0{step.stepNumber}</span>
                <span>{step.latencyLabel}</span>
              </div>
              <div className="font-medium text-ink text-[11px]">{step.stepTitle}</div>
              <div className="text-[10px] text-ink-secondary leading-snug">
                <span className="text-ink-crimson">Unprotected: </span>
                {step.unprotectedAction}
              </div>
              <div className="text-[10px] text-ink leading-snug">
                <span className="text-ink-emerald">TALOS: </span>
                {step.talosAction}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
