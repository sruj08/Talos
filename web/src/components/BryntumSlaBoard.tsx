'use client';

import React from 'react';
import { Card, Chip, Slider } from '@heroui/react';
import { CalendarClock, CheckCircle2, Clock, RefreshCw, Truck, XOctagon } from 'lucide-react';
import { SlaTaskRecord, formatUsdInr } from '../lib/phase6-events';
import { useBryntumTimeline, UseBryntumTimelineOptions } from '../hooks/useBryntumTimeline';

export type BryntumSlaBoardProps = UseBryntumTimelineOptions;

export function BryntumSlaBoard(props: BryntumSlaBoardProps = {}) {
  const {
    tasks, setTasks, zoomScale, setZoomScale, liveStatusMsg, syncedAgGridState,
    executeSlaBreachAndVoid, executeCarrierDeliveredCapture, handleRerouteChannel3,
  } = useBryntumTimeline(props);

  const handleSliderChange = (task: SlaTaskRecord, nextHours: number) => {
    const clamped = Math.min(72, Math.max(0, nextHours));
    if (clamped > task.slaDeadlineHours) {
      void executeSlaBreachAndVoid(task, clamped, 'BRYNTUM_SLA_BAR_DRAGGED_PAST_DEADLINE');
    } else {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, slaHoursElapsed: clamped } : t)));
    }
  };

  const handleInputChange = (task: SlaTaskRecord, event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value === '' ? 0 : Number(event.target.value);
    if (!Number.isNaN(nextValue)) {
      handleSliderChange(task, nextValue);
    }
  };

  const handleBlur = (task: SlaTaskRecord) => {
    if (task.slaHoursElapsed < 0) {
      handleSliderChange(task, 0);
    } else if (task.slaHoursElapsed > 72) {
      handleSliderChange(task, 72);
    }
  };

  return (
    <Card id="chapter-sla" className="tx-card p-5 sm:p-6 flex flex-col gap-4" data-testid="bryntum-sla-board" aria-label="Delivery SLA Timeline">
      <Card.Header className="p-0" data-testid="bryntum-sla-timeline">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <span className="w-10 h-10 rounded-md icon-medallion-amber inline-flex items-center justify-center shrink-0 mt-0.5">
              <CalendarClock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] text-ink-muted font-semibold">04 · Carrier SLA Referee</span>
              <h2 className="text-base font-semibold text-ink leading-snug">Delivery SLA Timeline</h2>
              <p data-subhead="true" className="text-xs text-ink-secondary leading-relaxed">
                Two-way 48-hour carrier SLA bars bound to PayPal Sandbox AUTHORIZE and VOID
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Chip size="sm" variant="secondary" className="tx-chip text-[11px] !min-h-[32px] px-2.5">
              <CalendarClock className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              <Chip.Label>
                <span>Bryntum MCP</span>
                <span className="sr-only">MCP: https://mcp.bryntum.com/mcp</span>
              </Chip.Label>
            </Chip>
            <button type="button" onClick={() => setZoomScale((z) => (z === 'HOURS_48' ? 'DAYS_29' : 'HOURS_48'))} className="btn-sovereign-neutral !min-h-[32px] h-8 px-3 py-1 text-xs shrink-0">
              <Clock className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              <span>Zoom: {zoomScale === 'HOURS_48' ? '48h SLA View' : '29d Auth Honor View'}</span>
            </button>
          </div>
        </div>
      </Card.Header>

      <Card.Content className="p-0 flex flex-col gap-3.5">
        <div data-testid="bryntum-judge-explainer" className="tx-well px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-ink-secondary">
          <div className="flex-1 min-w-0">
            <strong className="text-ink font-semibold">Interactive SLA Referee (Step 3): </strong>
            Slide past 48h or type hours in the input box to simulate late delivery and trigger an instant $0-fee PayPal refund.
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="tx-chip text-[11px] tabular-nums" data-testid="bryntum-ag-sync-pill">
              AG Grid Sync: {Object.entries(syncedAgGridState).map(([k, v]) => `${k}=${v}`).join(' | ')}
            </span>
          </div>
        </div>

        <div role="status" aria-live="polite" data-testid="bryntum-live-status" className="sr-only">{liveStatusMsg}</div>

        <div className="flex flex-col gap-3.5">
          {tasks.map((task: SlaTaskRecord) => {
            const isVoided = task.escrowState === 'PAYPAL_VOIDED';
            const isCaptured = task.escrowState === 'PAYPAL_CAPTURED';
            const dotClass = isVoided ? 'dot-crimson' : isCaptured ? 'dot-emerald' : 'dot-paypal';
            const badgeText = isVoided ? '[↩ VOIDED / PAYPAL_VOIDED]' : isCaptured ? '[✔ CAPTURED / PAYPAL_CAPTURED]' : '[🔒 AUTHORIZED / PAYPAL_AUTHORIZED]';
            const cleanBadge = isVoided ? 'VOIDED' : isCaptured ? 'CAPTURED' : 'AUTHORIZED';
            const breachText = task.downstreamLocked ? '[✖ LOCKED IN CRIMSON: SLA BREACH ROLLBACK]' : isCaptured ? '[✔ UNLOCKED & READY FOR PRODUCTION]' : '[⏳ AWAITING CARRIER DELIVERY SLA]';
            const cleanBreach = task.downstreamLocked ? 'SLA BREACH · ESCROW VOIDED (0s ROLLBACK)' : isCaptured ? 'DELIVERED · FUNDS CAPTURED' : 'AWAITING CARRIER DELIVERY SLA (48h)';
            const pct = Math.min(100, Math.max(0, (task.slaHoursElapsed / 72) * 100));
            const sliderLabelId = `input-slider-${task.id}`;

            return (
              <Card key={task.id} data-testid={`bryntum-lane-${task.escrowId}`} data-escrow-state={task.escrowState} className="tx-card p-4 sm:p-5 flex flex-col gap-3.5">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-7 h-7 rounded-md icon-medallion-paypal inline-flex items-center justify-center shrink-0">
                        <Truck className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="font-semibold text-sm text-ink truncate">{task.skuTitle}</span>
                      <span className="text-xs font-semibold text-ink tabular-nums px-2 py-0.5 rounded-xs bg-[var(--surface-well)] border border-[var(--border)] shrink-0">{formatUsdInr(task.amountCents)}</span>
                      <span data-testid={`bryntum-badge-${task.escrowId}`} data-status-code={badgeText} className="tx-chip text-[11px] shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-xs ${dotClass}`} aria-hidden="true" />
                        <span>{cleanBadge}</span>
                        <span data-testid={`sla-void-status-${task.escrowId}`} className="sr-only">{badgeText}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button type="button" disabled={isVoided || isCaptured} onClick={() => void executeCarrierDeliveredCapture(task)} data-testid={`btn-deliver-${task.escrowId}`} className="btn-sovereign-emerald !min-h-[32px] h-8 px-3 py-1 text-xs disabled:opacity-40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                        <span>Simulate Carrier Delivered</span>
                      </button>
                      <button type="button" disabled={isVoided} onClick={() => void executeSlaBreachAndVoid(task, 56, 'BRYNTUM_TERMINATE_AND_VOID_BUTTON')} data-testid={`btn-void-${task.escrowId}`} className="btn-sovereign-crimson !min-h-[32px] h-8 px-3 py-1 text-xs disabled:opacity-40">
                        <XOctagon className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                        <span>Terminate &amp; Void Escrow</span>
                      </button>
                      {isVoided ? (
                        <button type="button" onClick={() => handleRerouteChannel3(task)} data-testid={`btn-reroute-${task.escrowId}`} className="btn-paypal-primary !min-h-[32px] h-8 px-3 py-1 text-xs">
                          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                          <span>Reroute via Channel3 Backup ({formatUsdInr(task.channel3BackupCents)})</span>
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-muted tabular-nums pl-9">
                    <span>Vendor: <strong className="text-ink-secondary font-medium">{task.vendorName}</strong></span>
                    <span>Order: <code className="font-mono text-ink-secondary">{task.paypalOrderId}</code></span>
                    <span>Auth: <code className="font-mono text-ink-secondary">{task.paypalAuthId}</code></span>
                    <span>Carrier: <strong className="text-ink-secondary font-medium">{task.carrier} #{task.trackingNumber}</strong></span>
                  </div>
                </div>

                <div className="tx-well px-4 py-3.5 flex flex-col gap-2.5" data-testid={`sla-input-slider-box-${task.escrowId}`}>
                  <div className="flex items-center justify-between gap-2">
                    <label id={sliderLabelId} htmlFor={`sla-drag-${task.id}`} className="text-xs font-semibold text-ink">
                      48-Hour Carrier Shipping SLA Bar ({task.slaHoursElapsed}h / {task.slaDeadlineHours}h Cutoff)
                    </label>
                    <span className="text-[11px] text-ink-muted tabular-nums">
                      Cutoff: {task.slaDeadlineHours}h · Max: 72h
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <Clock className="w-4 h-4 text-ink-paypal shrink-0" strokeWidth={1.75} aria-hidden="true" />

                    <div className="relative flex-1 flex items-center h-7 select-none">
                      <div className="w-full h-1.5 rounded-xs bg-[#DCE6F5] dark:bg-[#1E293B] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-75 ${task.slaHoursElapsed > task.slaDeadlineHours ? 'bg-[#334155]' : 'bg-[#005EA6] dark:bg-[#3B82F6]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div
                        className="pointer-events-none absolute top-1 bottom-1 left-[66.67%] -translate-x-1/2 w-0.5 bg-[#003087] dark:bg-[#60A5FA]"
                        title="48h SLA Cutoff"
                        aria-hidden="true"
                      />

                      <div
                        className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-xs bg-[#003087] dark:bg-[#3B82F6] border-2 border-[var(--surface)] shadow-sm transition-transform"
                        style={{ left: `${pct}%` }}
                        aria-hidden="true"
                      />

                      <Slider aria-labelledby={sliderLabelId} minValue={0} maxValue={72} step={1} value={typeof task.slaHoursElapsed === 'number' ? task.slaHoursElapsed : 0} onChange={(val) => handleSliderChange(task, Array.isArray(val) ? val[0] : val)} className="sr-only">
                        <Slider.Track><Slider.Fill /><Slider.Thumb /></Slider.Track>
                      </Slider>

                      <input
                        id={`sla-drag-${task.id}`}
                        type="range"
                        min={0}
                        max={72}
                        step={1}
                        value={typeof task.slaHoursElapsed === 'number' ? task.slaHoursElapsed : 0}
                        aria-labelledby={sliderLabelId}
                        data-testid={`sla-drag-bar-${task.escrowId}`}
                        onChange={(e) => handleSliderChange(task, Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 m-0"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={72}
                        step={1}
                        value={task.slaHoursElapsed}
                        onChange={(e) => handleInputChange(task, e)}
                        onBlur={() => handleBlur(task)}
                        aria-labelledby={sliderLabelId}
                        data-testid={`sla-input-${task.escrowId}`}
                        className="h-8 w-16 px-2 py-1 rounded-xs bg-[var(--surface)] border border-[#C2D4EC] dark:border-[var(--border)] text-xs font-semibold text-ink tabular-nums text-center focus:outline-none focus:border-[#0070E0]"
                      />
                      <span className="text-xs text-ink-muted font-medium">hrs</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs tabular-nums">
                  <div className="tx-well p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">29-Day PayPal Authorization Honor Period ({task.authHonorHours}h Honor / {task.authExpiryDays}d Max)</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">Hold ID: {task.paypalAuthId} (Ed25519 KYA Locked)</div>
                    </div>
                    <span className="tx-chip font-mono text-[11px] shrink-0">29d Vault</span>
                  </div>

                  <div data-testid={`downstream-phase-${task.escrowId}`} className="tx-well p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-ink-secondary truncate">Dependency (EndToStart): {task.downstreamPhase}</div>
                      <div className="text-[11px] font-semibold text-ink mt-0.5" data-testid={`sla-breach-badge-${task.escrowId}`} data-breach-code={breachText}>
                        <span>{cleanBreach}</span>
                        <span className="sr-only">{breachText}</span>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-xs shrink-0 ${dotClass}`} aria-hidden="true" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}
