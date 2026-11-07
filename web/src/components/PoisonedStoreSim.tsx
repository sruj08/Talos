'use client';

import React from 'react';
import { Terminal } from 'lucide-react';
import { usePoisonedStoreSim } from '../hooks/usePoisonedStoreSim';

export function PoisonedStoreSim() {
  const {
    activeAct,
    telemetry,
    running,
    runAct1PoisonedAttack,
    runAct2HappyPathCapture,
    runAct3SlaBreachAndStepUp,
  } = usePoisonedStoreSim();

  return (
    <section
      id="chapter-arena"
      className="sovereign-card p-6 space-y-6 h-full flex flex-col justify-between"
      data-testid="poisoned-store-sim"
      data-active-act={activeAct}
      aria-label="Red-Team Interception Arena"
    >
      <div className="space-y-6">
        <div className="space-y-1" data-testid="judge-scenario-toolbar">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs text-ink-muted">02</span>
              <h2 className="text-lg font-medium text-ink">
                Red-Team Interception Arena
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-secondary tabular-nums whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              <span>DeBERTa-v3 ONNX &lt;4ms</span>
            </span>
          </div>
          <p data-subhead="true" className="text-xs text-ink-secondary">
            Simulate poisoned merchant DOM injections, Channel3 verification, and SLA breach rollbacks
          </p>
        </div>

        {/* Equal-Proportion 3-Act Scenario Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            disabled={running}
            onClick={() => void runAct1PoisonedAttack()}
            data-testid="btn-scenario-act1"
            className={`p-4 text-left text-xs rounded-inner transition-colors duration-150 ease-unslop active:scale-[0.98] ${
              activeAct === 'ACT_1'
                ? 'tone-crimson font-medium'
                : 'btn-sovereign-neutral text-ink-secondary'
            }`}
          >
            <span data-testid="trigger-act1-btn" className="block space-y-1.5 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-medium text-ink whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-xs dot-crimson" aria-hidden="true" />
                  <span>Scenario A (Act 1)</span>
                </span>
                <span className="font-mono text-[11px] text-ink-muted">01</span>
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                Attack: Poisoned DOM ($480 Gouge) &rarr; Blocked &lt;4ms
              </span>
            </span>
          </button>

          <button
            type="button"
            disabled={running}
            onClick={() => void runAct2HappyPathCapture()}
            data-testid="btn-scenario-act2"
            className={`p-4 text-left text-xs rounded-inner transition-colors duration-150 ease-unslop active:scale-[0.98] ${
              activeAct === 'ACT_2'
                ? 'tone-emerald font-medium'
                : 'btn-sovereign-neutral text-ink-secondary'
            }`}
          >
            <span data-testid="trigger-act2-btn" className="block space-y-1.5 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-medium text-ink whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
                  <span>Scenario B (Act 2)</span>
                </span>
                <span className="font-mono text-[11px] text-ink-muted">02</span>
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                Happy Path: $249 Channel3 &rarr; AUTHORIZE &rarr; CAPTURE
              </span>
            </span>
          </button>

          <button
            type="button"
            disabled={running}
            onClick={() => void runAct3SlaBreachAndStepUp()}
            data-testid="btn-scenario-act3"
            className={`p-4 text-left text-xs rounded-inner transition-colors duration-150 ease-unslop active:scale-[0.98] ${
              activeAct === 'ACT_3'
                ? 'tone-amber font-medium'
                : 'btn-sovereign-neutral text-ink-secondary'
            }`}
          >
            <span data-testid="trigger-act3-btn" className="block space-y-1.5 whitespace-normal">
              <span className="flex items-center justify-between gap-2 font-medium text-ink whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-xs dot-amber" aria-hidden="true" />
                  <span>Scenario C (Act 3)</span>
                </span>
                <span className="font-mono text-[11px] text-ink-muted">03</span>
              </span>
              <span className="block text-ink-secondary tabular-nums leading-relaxed">
                SLA Breach: Bryntum Delay &rarr; PayPal VOID + $450 Step-Up
              </span>
            </span>
          </button>
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        data-testid="simulator-telemetry-card"
        className="sovereign-subcard p-4 space-y-4 text-xs"
      >
        <div className="space-y-2" data-testid="scenario-active-banner">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <Terminal className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              <span>{telemetry.headline}</span>
            </span>
            <div className="font-mono text-xs text-ink-secondary tabular-nums inline-flex flex-wrap items-center gap-3">
              <span>Latency: {telemetry.latencyMs}ms</span>
              <span>Risk: {telemetry.firewallRiskScore}</span>
              <span>Spread: {telemetry.channel3SpreadBps} bps</span>
            </div>
          </div>
          <p className="text-ink-secondary tabular-nums leading-relaxed">{telemetry.detail}</p>
        </div>

        <div className="relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="scenario-dom-diff">
          <div
            key={activeAct}
            data-testid="dom-diff-laser-scanline"
            className="laser-scanline-bar pointer-events-none absolute inset-x-0 top-0 h-px"
            aria-hidden="true"
          />
          <div className="sovereign-well p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-ink-secondary">
              <span className="w-1.5 h-1.5 rounded-xs dot-crimson" aria-hidden="true" />
              <span>Raw Storefront DOM (Before lol_html):</span>
            </div>
            <code className="font-mono block text-[11px] text-ink-muted break-all leading-relaxed">
              {telemetry.rawHtmlExcerpt}
            </code>
          </div>
          <div className="sovereign-well p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-ink-secondary">
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
