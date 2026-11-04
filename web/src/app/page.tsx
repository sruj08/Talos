'use client';

import React from 'react';
import { MandateStudio } from '../components/MandateStudio';
import { PoisonedStoreSim } from '../components/PoisonedStoreSim';
import { AgStudioBlotter } from '../components/AgStudioBlotter';
import { BryntumSlaBoard } from '../components/BryntumSlaBoard';
import { PayPalStepUpModal } from '../components/PayPalStepUpModal';
import { useEscrowStream } from '../hooks/useEscrowStream';

export default function TALOSCommandCenterPage() {
  const { kpiMetrics, mode } = useEscrowStream();

  return (
    <main className="min-h-screen p-4 sm:p-6 space-y-5 bg-slate-950 text-slate-50" data-testid="talos-command-center">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-300">
              TALOS v1.0.0
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50">
              TALOS Command Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Rust rmcp + lol_html Security Kernel · Go APIMatic PayPal Escrow · Channel3 Price Oracle · AG Studio · Bryntum SLA Board
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]" data-testid="header-status-pills">
          <span className="rounded border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-300">
            ● RUST KYA: &lt;1ms
          </span>
          <span className="rounded border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-300">
            ● GO 2PC: ONLINE
          </span>
          <span className="rounded border border-sky-500/40 bg-sky-500/15 px-2.5 py-1 text-sky-200">
            ● PAYPAL SANDBOX: LIVE ({mode})
          </span>
        </div>
      </header>

      <section
        aria-label="Executive Financial Telemetry KPI Strip"
        data-testid="kpi-header-bar"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div
          data-testid="kpi-protected-gmv"
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-lg"
        >
          <span className="text-xs text-slate-400">Protected GMV</span>
          <div className="mt-1 font-mono text-lg font-bold text-emerald-300">
            {kpiMetrics.protectedGmvUsd}
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Zero-Trust 2PC PayPal Sandbox Escrows
          </span>
        </div>

        <div
          data-testid="kpi-blocked-injections"
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-lg"
        >
          <span className="text-xs text-slate-400">Blocked Prompt Injections</span>
          <div className="mt-1 font-mono text-lg font-bold text-rose-300">
            {kpiMetrics.blockedInjectionsCount} Blocked
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            lol_html + DeBERTa-v3 ONNX (&lt;4ms)
          </span>
        </div>

        <div
          data-testid="kpi-channel3-savings"
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-lg"
        >
          <span className="text-xs text-slate-400">Channel3 Savings</span>
          <div className="mt-1 font-mono text-lg font-bold text-sky-300">
            {kpiMetrics.channel3SavingsUsd}
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Autonomous Price-Gouging Reroutes
          </span>
        </div>

        <div
          data-testid="kpi-active-paypal-auths"
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-lg"
        >
          <span className="text-xs text-slate-400">Active PayPal Authorizations</span>
          <div className="mt-1 font-mono text-lg font-bold text-amber-300">
            {kpiMetrics.activePayPalAuthCount} Active Holds
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            APIMatic Go SDK v1.1.0 + RFC 9421
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MandateStudio />
        <PoisonedStoreSim />
      </div>

      <AgStudioBlotter />
      <BryntumSlaBoard />
      <PayPalStepUpModal />
    </main>
  );
}
