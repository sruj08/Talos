'use client';

import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, Terminal } from 'lucide-react';
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
      className="sovereign-card p-6 space-y-5"
      data-testid="poisoned-store-sim"
      data-active-act={activeAct}
      aria-label="Red-Team Interception Arena"
    >
      <div className="space-y-1" data-testid="judge-scenario-toolbar">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Red-Team Interception Arena
          </h2>
          <span className="inline-flex items-center gap-2 text-xs text-ink-secondary font-medium tabular-nums whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
            <span>DeBERTa-v3 ONNX &lt;4ms</span>
          </span>
        </div>
        <p data-subhead="true" className="text-xs text-ink-secondary">
          Simulate poisoned merchant DOM injections, Channel3 verification, and SLA breach rollbacks
        </p>
      </div>

      {/* Indus Cowork Expandable Flex Bento Scenario Cards */}
      <div className="flex flex-col md:flex-row gap-3">
        <button
          type="button"
          disabled={running}
          onClick={() => void runAct1PoisonedAttack()}
          data-testid="btn-scenario-act1"
          className={`bento-drawer-transition whitespace-nowrap min-h-[44px] p-3.5 text-left text-xs rounded-inner active:scale-[0.96] ${
            activeAct === 'ACT_1'
              ? 'flex-[1.45] btn-sovereign-crimson font-medium'
              : 'flex-1 btn-sovereign-neutral text-ink'
          }`}
        >
          <span data-testid="trigger-act1-btn" className="block whitespace-normal">
            <span className="flex items-center gap-2 text-ink-crimson font-medium whitespace-nowrap">
              <ShieldAlert className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Scenario A (Act 1)</span>
            </span>
            <span className="mt-1 block tabular-nums">
              Attack: Poisoned DOM ($480 Gouge) &rarr; Blocked &lt;4ms
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={running}
          onClick={() => void runAct2HappyPathCapture()}
          data-testid="btn-scenario-act2"
          className={`bento-drawer-transition whitespace-nowrap min-h-[44px] p-3.5 text-left text-xs rounded-inner active:scale-[0.96] ${
            activeAct === 'ACT_2'
              ? 'flex-[1.45] btn-sovereign-emerald font-medium'
              : 'flex-1 btn-sovereign-neutral text-ink'
          }`}
        >
          <span data-testid="trigger-act2-btn" className="block whitespace-normal">
            <span className="flex items-center gap-2 text-ink-emerald font-medium whitespace-nowrap">
              <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Scenario B (Act 2)</span>
            </span>
            <span className="mt-1 block tabular-nums">
              Happy Path: $249 Channel3 &rarr; AUTHORIZE &rarr; CAPTURE
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={running}
          onClick={() => void runAct3SlaBreachAndStepUp()}
          data-testid="btn-scenario-act3"
          className={`bento-drawer-transition whitespace-nowrap min-h-[44px] p-3.5 text-left text-xs rounded-inner active:scale-[0.96] ${
            activeAct === 'ACT_3'
              ? 'flex-[1.45] btn-sovereign-amber font-medium'
              : 'flex-1 btn-sovereign-neutral text-ink'
          }`}
        >
          <span data-testid="trigger-act3-btn" className="block whitespace-normal">
            <span className="flex items-center gap-2 text-ink-amber font-medium whitespace-nowrap">
              <Clock className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Scenario C (Act 3)</span>
            </span>
            <span className="mt-1 block tabular-nums">
              SLA Breach: Bryntum Delay &rarr; PayPal VOID + $450 Step-Up
            </span>
          </span>
        </button>
      </div>

      <div
        role="status"
        aria-live="polite"
        data-testid="simulator-telemetry-card"
        className="sovereign-subcard p-4 space-y-3 text-xs"
      >
        <div className="space-y-2" data-testid="scenario-active-banner">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <Terminal className="w-4 h-4 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
              <span>{telemetry.headline}</span>
            </span>
            <div className="text-xs text-ink-paypal tabular-nums font-medium inline-flex flex-wrap items-center gap-3">
              <span>Latency: {telemetry.latencyMs}ms</span>
              <span>Risk: {telemetry.firewallRiskScore}</span>
              <span>Spread: {telemetry.channel3SpreadBps} bps</span>
            </div>
          </div>
          <p className="text-ink-secondary tabular-nums">{telemetry.detail}</p>
        </div>

        <div className="relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="scenario-dom-diff">
          <div
            key={activeAct}
            data-testid="dom-diff-laser-scanline"
            className="laser-scanline-bar pointer-events-none absolute inset-x-0 top-0 h-1.5"
            aria-hidden="true"
          />
          <div className="tone-crimson p-3 space-y-1">
            <div className="font-medium text-ink-crimson">Raw Storefront DOM (Before lol_html):</div>
            <code className="font-mono block text-[11px] break-all">{telemetry.rawHtmlExcerpt}</code>
          </div>
          <div className="tone-emerald p-3 space-y-1">
            <div className="font-medium text-ink-emerald">Sanitized Agent DOM (After lol_html):</div>
            <code className="font-mono block text-[11px] break-all">{telemetry.sanitizedHtmlExcerpt}</code>
          </div>
        </div>
      </div>
    </section>
  );
}
