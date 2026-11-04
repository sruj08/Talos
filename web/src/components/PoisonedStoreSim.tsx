'use client';

import React from 'react';
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
      className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl"
      data-testid="poisoned-store-sim"
      data-active-act={activeAct}
      aria-label="3-Act Live Judge Scenario and Red-Team Merchant Storefront Simulator"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-50">
            2. 3-Act Live Judge Scenario &amp; Red-Team Storefront Simulator (F-11)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Trigger Act 1 (DOM Prompt-Injection Block), Act 2 (Channel3 + PayPal AUTHORIZE &rarr; CAPTURE), or Act 3 (Bryntum SLA Breach &rarr; PayPal VOID + $450 Step-Up).
          </p>
        </div>
        <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
          KERNEL Sandbox: CONNECTED
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        <button
          type="button"
          disabled={running}
          onClick={() => void runAct1PoisonedAttack()}
          data-testid="btn-scenario-act1"
          className={`min-h-[42px] rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
            activeAct === 'ACT_1'
              ? 'border-rose-500 bg-rose-500/25 text-rose-100'
              : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <div className="font-mono text-[11px] text-rose-300">[Scenario A — Act 1]</div>
          <div>Attack: Poisoned DOM ($480 Gouge) &rarr; Blocked &lt;4ms</div>
        </button>

        <button
          type="button"
          disabled={running}
          onClick={() => void runAct2HappyPathCapture()}
          data-testid="btn-scenario-act2"
          className={`min-h-[42px] rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
            activeAct === 'ACT_2'
              ? 'border-emerald-500 bg-emerald-500/25 text-emerald-100'
              : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <div className="font-mono text-[11px] text-emerald-300">[Scenario B — Act 2]</div>
          <div>Happy Path: $249 Channel3 &rarr; AUTHORIZE &rarr; CAPTURE</div>
        </button>

        <button
          type="button"
          disabled={running}
          onClick={() => void runAct3SlaBreachAndStepUp()}
          data-testid="btn-scenario-act3"
          className={`min-h-[42px] rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
            activeAct === 'ACT_3'
              ? 'border-amber-500 bg-amber-500/25 text-amber-100'
              : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <div className="font-mono text-[11px] text-amber-300">[Scenario C — Act 3]</div>
          <div>SLA Breach: Bryntum Delay &rarr; PayPal VOID + $450 Step-Up</div>
        </button>
      </div>

      <div
        role="status"
        aria-live="polite"
        data-testid="simulator-telemetry-card"
        className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-slate-100">{telemetry.headline}</span>
          <span className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-sky-300 tabular-nums">
            Latency: {telemetry.latencyMs}ms · Risk: {telemetry.firewallRiskScore} · Spread: {telemetry.channel3SpreadBps} bps
          </span>
        </div>
        <p className="mt-1 text-slate-300">{telemetry.detail}</p>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div className="rounded border border-rose-500/30 bg-rose-950/20 p-2 text-rose-200">
            <div className="font-semibold text-rose-300">Raw Storefront DOM (Before lol_html):</div>
            <code className="block mt-0.5 break-all">{telemetry.rawHtmlExcerpt}</code>
          </div>
          <div className="rounded border border-emerald-500/30 bg-emerald-950/20 p-2 text-emerald-200">
            <div className="font-semibold text-emerald-300">Sanitized Agent DOM (After lol_html):</div>
            <code className="block mt-0.5 break-all">{telemetry.sanitizedHtmlExcerpt}</code>
          </div>
        </div>
      </div>
    </section>
  );
}
