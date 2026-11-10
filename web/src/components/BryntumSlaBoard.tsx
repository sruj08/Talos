'use client';

import React from 'react';
import { CalendarClock, CheckCircle2, Clock, RefreshCw, Truck, XOctagon } from 'lucide-react';
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
      id="chapter-sla"
      className="paypal-feature-card p-6 sm:p-7 space-y-5"
      data-testid="bryntum-sla-board"
      aria-label="Delivery SLA Timeline"
    >
      <div className="flex flex-wrap items-start justify-between gap-4" data-testid="bryntum-sla-timeline">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-inner icon-medallion-amber inline-flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-ink-amber font-bold">04</span>
              <h2 className="paypal-title-sm text-ink">Delivery SLA Timeline</h2>
              <span className="inline-flex items-center gap-2 text-xs text-ink-muted">
                <CalendarClock className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <span>MCP: https://mcp.bryntum.com/mcp</span>
              </span>
            </div>
            <p data-subhead="true" className="paypal-caption text-ink-secondary">
              Two-way 48-hour carrier SLA bars bound to PayPal Sandbox AUTHORIZE and VOID
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setZoomScale((z) => (z === 'HOURS_48' ? 'DAYS_29' : 'HOURS_48'))}
          className="btn-sovereign-neutral h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
        >
          <Clock className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
          <span>Zoom: {zoomScale === 'HOURS_48' ? '48h SLA View' : '29d Auth Honor View'}</span>
        </button>
      </div>

      <div
        data-testid="bryntum-judge-explainer"
        className="tone-paypal p-3.5 rounded-inner text-xs text-ink-secondary leading-relaxed"
      >
        <strong className="text-ink font-medium">Interactive SLA Referee (Step 3): </strong>
        Drag the 48-Hour SLA slider past 48h (or click Terminate &amp; Void Escrow) to simulate a late shipment and trigger an instant $0-fee PayPal refund.
      </div>

      <div
        role="status"
        aria-live="polite"
        data-testid="bryntum-live-status"
        className="sovereign-subcard px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-secondary tabular-nums"
      >
        <span>{liveStatusMsg}</span>
        <span className="text-ink-muted" data-testid="bryntum-ag-sync-pill">
          AG Grid Sync: {Object.entries(syncedAgGridState).map(([k, v]) => `${k}=${v}`).join(' | ')}
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((task: SlaTaskRecord) => {
          const isVoided = task.escrowState === 'PAYPAL_VOIDED';
          const isCaptured = task.escrowState === 'PAYPAL_CAPTURED';
          const dotClass = isVoided ? 'dot-crimson' : isCaptured ? 'dot-emerald' : 'dot-paypal';
          const medallionClass = isVoided
            ? 'icon-medallion-crimson'
            : isCaptured
            ? 'icon-medallion-emerald'
            : 'icon-medallion-paypal';
          const badgeText = isVoided
            ? '[↩ VOIDED / PAYPAL_VOIDED]'
            : isCaptured
            ? '[✔ CAPTURED / PAYPAL_CAPTURED]'
            : '[🔒 AUTHORIZED / PAYPAL_AUTHORIZED]';
          const breachText = task.downstreamLocked
            ? '[✖ LOCKED IN CRIMSON: SLA BREACH ROLLBACK]'
            : isCaptured
            ? '[✔ UNLOCKED & READY FOR PRODUCTION]'
            : '[⏳ AWAITING CARRIER DELIVERY SLA]';

          return (
            <div
              key={task.id}
              data-testid={`bryntum-lane-${task.escrowId}`}
              data-escrow-state={task.escrowState}
              className={`p-4 sm:p-5 rounded-inner transition-colors duration-150 ease-unslop space-y-4 ${
                isVoided ? 'tone-crimson' : isCaptured ? 'tone-emerald' : 'sovereign-subcard'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className={`w-10 h-10 rounded-control ${medallionClass} inline-flex items-center justify-center shrink-0`}>
                    <Truck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-sm text-ink">{task.skuTitle}</span>
                      <span className="text-xs text-ink-secondary tabular-nums">{formatUsdInr(task.amountCents)}</span>
                      <span
                        data-testid={`bryntum-badge-${task.escrowId}`}
                        data-status-code={badgeText}
                        className="inline-flex items-center gap-2 text-xs text-ink-secondary"
                      >
                        <span className={`w-1.5 h-1.5 rounded-xs ${dotClass}`} aria-hidden="true" />
                        <span data-testid={`sla-void-status-${task.escrowId}`}>{badgeText}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted tabular-nums">
                      <span>Vendor: {task.vendorName}</span>
                      <span>Order: {task.paypalOrderId}</span>
                      <span>Auth: {task.paypalAuthId}</span>
                      <span>Carrier: {task.carrier} #{task.trackingNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isVoided || isCaptured}
                    onClick={() => void executeCarrierDeliveredCapture(task)}
                    data-testid={`btn-deliver-${task.escrowId}`}
                    className="btn-sovereign-emerald h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap disabled:opacity-40 active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                    <span>Simulate Carrier Delivered</span>
                  </button>
                  <button
                    type="button"
                    disabled={isVoided}
                    onClick={() => void executeSlaBreachAndVoid(task, 56, 'BRYNTUM_TERMINATE_AND_VOID_BUTTON')}
                    data-testid={`btn-void-${task.escrowId}`}
                    className="btn-sovereign-crimson h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap disabled:opacity-40 active:scale-[0.98]"
                  >
                    <XOctagon className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                    <span>Terminate &amp; Void Escrow</span>
                  </button>
                  {isVoided ? (
                    <button
                      type="button"
                      onClick={() => handleRerouteChannel3(task)}
                      data-testid={`btn-reroute-${task.escrowId}`}
                      className="btn-paypal-primary h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
                    >
                      <RefreshCw className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                      <span>Reroute via Channel3 Backup ({formatUsdInr(task.channel3BackupCents)})</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch text-xs tabular-nums">
                <div className="sovereign-well p-3 space-y-1">
                  <div className="font-medium text-ink">
                    29-Day PayPal Authorization Honor Period ({task.authHonorHours}h Honor / {task.authExpiryDays}d Max)
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    Hold ID: {task.paypalAuthId} (Ed25519 KYA Locked)
                  </div>
                </div>

                <div className="sovereign-well p-3 space-y-2">
                  <label htmlFor={`sla-drag-${task.id}`} className="block font-medium text-ink">
                    48-Hour Carrier Shipping SLA Bar ({task.slaHoursElapsed}h / {task.slaDeadlineHours}h Cutoff)
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
                        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, slaHoursElapsed: nextHours } : t)));
                      }
                    }}
                    className="w-full cursor-ew-resize accent-[#0070E0]"
                  />
                  <div className="text-[11px] text-ink-muted">
                    Drag right past 48h to simulate late carrier delivery
                  </div>
                </div>

                <div
                  data-testid={`downstream-phase-${task.escrowId}`}
                  className={`p-3 space-y-1 ${
                    task.downstreamLocked ? 'tone-crimson' : isCaptured ? 'tone-emerald' : 'sovereign-well text-ink-secondary'
                  }`}
                >
                  <div className="text-ink-secondary">Dependency (EndToStart): {task.downstreamPhase}</div>
                  <div
                    className="text-[11px] font-medium text-ink"
                    data-testid={`sla-breach-badge-${task.escrowId}`}
                    data-breach-code={breachText}
                  >
                    {breachText}
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
