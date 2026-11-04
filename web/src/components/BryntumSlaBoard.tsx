'use client';

import React from 'react';
import { SlaTaskRecord, formatUsdInr } from '../lib/phase6-events';
import { useBryntumTimeline, UseBryntumTimelineOptions } from '../hooks/useBryntumTimeline';

export type BryntumSlaBoardProps = UseBryntumTimelineOptions;

export function BryntumSlaBoard(props: BryntumSlaBoardProps = {}) {
  const {
    tasks,
    setTasks,
    zoomScale,
    setZoomScale,
    liveStatusMsg,
    syncedAgGridState,
    executeSlaBreachAndVoid,
    executeCarrierDeliveredCapture,
    handleRerouteChannel3,
  } = useBryntumTimeline(props);

  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl"
      data-testid="bryntum-sla-board"
      aria-label="Bryntum Scheduler Pro and Gantt Two-Way Payment SLA Board"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-50">
              4. Bryntum Scheduler Pro &amp; Gantt 2-Way Payment SLA Board ($3,000 Sponsor Pool — F-07)
            </h2>
            <span className="rounded border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] text-sky-300">
              MCP: https://mcp.bryntum.com/mcp
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            48-Hour Carrier Shipping SLA Bar · 29-Day PayPal Authorization Honor Period · Drag past SLA deadline or click Terminate &amp; Void Escrow to execute live PayPal Sandbox VOID.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setZoomScale((z) => (z === 'HOURS_48' ? 'DAYS_29' : 'HOURS_48'))}
          className="min-h-[36px] rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-xs text-slate-100 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          Zoom: {zoomScale === 'HOURS_48' ? '48h SLA View' : '29d Auth Honor View'}
        </button>
      </div>

      <div
        role="status"
        aria-live="polite"
        data-testid="bryntum-live-status"
        className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200"
      >
        <span>{liveStatusMsg}</span>
        <span className="text-sky-300" data-testid="bryntum-ag-sync-pill">
          AG Grid Sync: {Object.entries(syncedAgGridState).map(([k, v]) => `${k}=${v}`).join(' · ')}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {tasks.map((task: SlaTaskRecord) => {
          const isVoided = task.escrowState === 'PAYPAL_VOIDED';
          const isCaptured = task.escrowState === 'PAYPAL_CAPTURED';
          return (
            <div
              key={task.id}
              data-testid={`bryntum-lane-${task.escrowId}`}
              data-escrow-state={task.escrowState}
              className={`rounded-lg border p-3 transition-colors ${
                isVoided
                  ? 'border-rose-500/60 bg-rose-950/20'
                  : isCaptured
                  ? 'border-emerald-500/50 bg-emerald-950/15'
                  : 'border-slate-800 bg-slate-950/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">{task.skuTitle}</span>
                    <span className="font-mono text-xs text-slate-200 tabular-nums">{formatUsdInr(task.amountCents)}</span>
                    <span
                      data-testid={`bryntum-badge-${task.escrowId}`}
                      className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${
                        isVoided
                          ? 'border border-rose-500/50 bg-rose-500/20 text-rose-200'
                          : isCaptured
                          ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-200'
                          : 'border border-sky-500/50 bg-sky-500/20 text-sky-200'
                      }`}
                    >
                      {isVoided
                        ? '[↩ VOIDED / PAYPAL_VOIDED]'
                        : isCaptured
                        ? '[✔ CAPTURED / PAYPAL_CAPTURED]'
                        : '[🔒 AUTHORIZED / PAYPAL_AUTHORIZED]'}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-300 mt-0.5 tabular-nums">
                    Vendor: {task.vendorName} · Order: {task.paypalOrderId} · Auth: {task.paypalAuthId} · Carrier: {task.carrier} #{task.trackingNumber}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isVoided || isCaptured}
                    onClick={() => void executeCarrierDeliveredCapture(task)}
                    data-testid={`btn-deliver-${task.escrowId}`}
                    className="min-h-[36px] rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                  >
                    Simulate Carrier Delivered
                  </button>
                  <button
                    type="button"
                    disabled={isVoided}
                    onClick={() => void executeSlaBreachAndVoid(task, 56, 'BRYNTUM_TERMINATE_AND_VOID_BUTTON')}
                    data-testid={`btn-void-${task.escrowId}`}
                    className="min-h-[36px] rounded-lg border border-rose-500/50 bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-500/30 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                  >
                    Terminate &amp; Void Escrow
                  </button>
                  {isVoided ? (
                    <button
                      type="button"
                      onClick={() => handleRerouteChannel3(task)}
                      data-testid={`btn-reroute-${task.escrowId}`}
                      className="min-h-[36px] rounded-lg border border-amber-400/50 bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                    >
                      Reroute via Channel3 Backup ({formatUsdInr(task.channel3BackupCents)})
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-xs">
                <div className="rounded border border-sky-500/30 bg-sky-950/30 p-2">
                  <div className="font-mono text-[11px] text-sky-200">
                    [1] 29-Day PayPal Authorization Honor Period ({task.authHonorHours}h Honor / {task.authExpiryDays}d Max)
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 mt-0.5">
                    Hold ID: {task.paypalAuthId} · Ed25519 KYA Locked
                  </div>
                </div>

                <div className="rounded border border-amber-500/30 bg-slate-900 p-2">
                  <label htmlFor={`sla-drag-${task.id}`} className="block font-mono text-[11px] text-amber-200">
                    [2] 48-Hour Carrier Shipping SLA Bar ({task.slaHoursElapsed}h / {task.slaDeadlineHours}h Cutoff)
                  </label>
                  <input
                    id={`sla-drag-${task.id}`}
                    type="range"
                    min={0}
                    max={72}
                    value={task.slaHoursElapsed}
                    aria-label={`Drag SLA timeline hours for ${task.skuTitle}`}
                    data-testid={`sla-drag-bar-${task.escrowId}`}
                    onChange={(e) => {
                      const nextHours = Number(e.target.value);
                      if (nextHours > task.slaDeadlineHours) {
                        void executeSlaBreachAndVoid(task, nextHours, 'BRYNTUM_SLA_BAR_DRAGGED_PAST_DEADLINE');
                      } else {
                        setTasks((prev) =>
                          prev.map((t) => (t.id === task.id ? { ...t, slaHoursElapsed: nextHours } : t))
                        );
                      }
                    }}
                    className="mt-1 w-full accent-amber-400 cursor-ew-resize"
                  />
                </div>

                <div
                  data-testid={`downstream-phase-${task.escrowId}`}
                  className={`rounded border p-2 font-mono text-[11px] ${
                    task.downstreamLocked
                      ? 'border-rose-500/60 bg-rose-950/40 text-rose-200'
                      : isCaptured
                      ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200'
                      : 'border-slate-700 bg-slate-900 text-slate-200'
                  }`}
                >
                  <div>[3] Dependency (EndToStart): {task.downstreamPhase}</div>
                  <div className="font-semibold mt-0.5">
                    {task.downstreamLocked
                      ? '[✖ LOCKED IN CRIMSON: SLA BREACH ROLLBACK]'
                      : isCaptured
                      ? '[✔ UNLOCKED & READY FOR PRODUCTION]'
                      : '[⏳ AWAITING CARRIER DELIVERY SLA]'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
