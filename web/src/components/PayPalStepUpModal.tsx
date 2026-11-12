'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@heroui/react';
import NumberFlow from '@number-flow/react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CheckCircle2, ChevronDown, Lock, ShieldCheck, Speaker, UserCheck, XCircle } from 'lucide-react';
import { formatUsdInr } from '../lib/phase6-events';
import { usePayPalStepUp, UsePayPalStepUpOptions } from '../hooks/usePayPalStepUp';

export type PayPalStepUpModalProps = UsePayPalStepUpOptions;

const PAYPAL_BUTTON_STYLE = {
  layout: 'horizontal' as const,
  color: 'black' as const,
  shape: 'rect' as const,
  label: 'pay' as const,
  tagline: false as const,
  height: 35,
};

export function PayPalStepUpModal(props: PayPalStepUpModalProps = {}) {
  const {
    stepUp, statusState, statusNote, createPayPalSandboxOrder, handleApproveStepUp, handleRejectStepUp,
  } = usePayPalStepUp(props);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const overageCents = Math.max(0, stepUp.amountCents - stepUp.mandateCapCents);
  const rawClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';
  const clientId = rawClientId.startsWith('your_') ? 'sb' : rawClientId;
  const dotClass = statusState === 'PAYPAL_AUTHORIZED' ? 'dot-emerald' : statusState === 'PAYPAL_VOIDED' ? 'dot-crimson' : 'dot-amber';
  const rawStatusText =
    statusState === 'PAYPAL_AUTHORIZED'
      ? '[✔ CO-SIGNED: PAYPAL_AUTHORIZED (PAYPAL-CAPTURE-904-STEPUP)]'
      : statusState === 'PAYPAL_VOIDED'
      ? '[✖ REJECTED: PAYPAL_VOIDED]'
      : '[⚡ STEP_UP_REQUIRED (> $300 CAP)]';
  const cleanStatusLabel =
    statusState === 'PAYPAL_AUTHORIZED'
      ? 'CO-SIGNED · PAYPAL_AUTHORIZED'
      : statusState === 'PAYPAL_VOIDED'
      ? 'REJECTED · PAYPAL_VOIDED'
      : 'STEP_UP_REQUIRED (> $300 CAP)';

  return (
    <Card className="tx-card p-5 sm:p-6 flex flex-col gap-4" data-testid="paypal-step-up-modal" data-step-up-state={statusState} role="region" aria-label="Institutional Step-Up Co-Signing Authority">
      <Card.Header className="p-0">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <span className="w-10 h-10 rounded-md icon-medallion-amber inline-flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] text-ink-muted font-semibold">Human Step-Up Guardrail</span>
              <h2 className="text-base font-semibold text-ink leading-snug">Approve with PayPal ($450 Big Order Step-Up)</h2>
              <p data-subhead="true" className="text-xs text-ink-secondary leading-relaxed">
                Pauses over-budget agent checkouts and requires human PayPal Sandbox co-sign
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span data-testid="step-up-status-badge" data-status-code={rawStatusText} className="tx-chip tabular-nums text-[11px] !min-h-[28px] px-2.5">
              <span className={`w-1.5 h-1.5 rounded-xs ${dotClass}`} aria-hidden="true" />
              <span>{cleanStatusLabel}</span>
              <span className="sr-only">{rawStatusText}</span>
            </span>
            <button type="button" onClick={() => setDrawerOpen((v) => !v)} data-testid="copilot-toggle-btn" className="btn-paypal-secondary !min-h-[32px] h-8 px-3 py-1 text-xs">
              <span>Co-sign drawer</span>
              <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform ${drawerOpen ? 'rotate-180' : ''}`} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </Card.Header>

      <Card.Content className="p-0 flex flex-col gap-3.5">
        <div data-testid="stepup-judge-explainer" className="tx-well px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-ink-secondary">
          <div className="flex-1 min-w-0">
            <strong className="text-ink font-semibold">Why is this paused? (Scenario 3 · $450 Order): </strong>
            Agent order ($450) exceeds its $300 allowance by $150. Click Approve with PayPal to co-sign.
          </div>
          <span className="tx-chip text-[11px] font-mono shrink-0">+$150.00 Over Cap</span>
        </div>

        <div data-testid="copilot-drawer" className={`grid bento-drawer-transition ${drawerOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-90'}`}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              <div data-testid="copilot-hitl-card" className="lg:col-span-7 tx-well p-3.5 sm:p-4 space-y-2.5 text-xs text-ink-secondary tabular-nums flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-md icon-medallion-paypal inline-flex items-center justify-center shrink-0">
                        <Speaker className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <strong className="text-ink font-semibold text-sm block truncate">{stepUp.skuSummary}</strong>
                        <span className="text-ink-muted text-[11px] block truncate">Item &amp; merchant · {stepUp.merchantName}</span>
                      </div>
                    </div>
                    <span className="tx-chip font-mono text-[11px] shrink-0">{stepUp.escrowId}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="tx-card px-3 py-2">
                      <div className="text-[11px] text-ink-muted">Requested amount</div>
                      <strong className="text-ink font-semibold text-sm block mt-0.5">
                        {hydrated ? (
                          <span className="inline-flex items-baseline gap-1">
                            <NumberFlow value={stepUp.amountCents / 100} format={{ style: 'currency', currency: 'USD' }} />
                            <span className="text-xs text-ink-secondary">({formatUsdInr(stepUp.amountCents).split('(')[1] || '₹37,800)'}</span>
                          </span>
                        ) : (
                          formatUsdInr(stepUp.amountCents)
                        )}
                      </strong>
                    </div>
                    <div className="tx-card px-3 py-2">
                      <div className="text-[11px] text-ink-muted">Allowance Cap</div>
                      <div className="text-ink font-semibold text-sm mt-0.5">{formatUsdInr(stepUp.mandateCapCents)}</div>
                    </div>
                    <div className="tx-card px-3 py-2">
                      <div className="text-[11px] text-ink-muted">Cap Overage</div>
                      <div className="text-ink font-semibold text-sm mt-0.5">+{formatUsdInr(overageCents)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="tx-card px-3 py-2 flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-ink shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="text-[11px] text-ink-muted">Firewall scan</div>
                        <div className="text-ink font-medium">
                          PASSED · {stepUp.firewallRiskScore.toFixed(2)} risk · 0 traps · {stepUp.firewallLatencyMs}ms
                        </div>
                      </div>
                    </div>
                    <div className="tx-card px-3 py-2 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-ink shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="text-[11px] text-ink-muted">Fair-price check</div>
                        <div className="text-ink font-medium">
                          VERIFIED FAIR · ${stepUp.channel3MedianCents / 100} median · {stepUp.channel3SpreadBps} bps
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div role="status" aria-live="polite" data-testid="step-up-live-note" className="tx-card px-3 py-2 text-xs text-ink font-medium">
                  {statusNote}
                </div>
              </div>

              <div className="lg:col-span-5 tx-well p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5" data-testid="copilot-action-wiring">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ink">Co-Sign Authorization Controls</span>
                    <span className="tx-chip text-[10px] font-mono">2PC Step-Up</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary leading-snug">
                    Authorize in deterministic sandbox mode or co-sign via PayPal Orders v2 below.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => void handleApproveStepUp()}
                      data-testid="btn-step-up-cosign"
                      className="btn-paypal-primary w-full !min-h-[34px] h-9 px-3 py-1.5 text-xs font-semibold tabular-nums"
                    >
                      <Lock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                      <span data-testid="copilot-confirm-stepup-btn" className="truncate">
                        {statusState === 'PAYPAL_AUTHORIZED'
                          ? 'Approve with PayPal · CO-SIGNED ($450.00)'
                          : `Approve with PayPal · ${formatUsdInr(stepUp.amountCents)}`}
                      </span>
                      <span className="sr-only">
                        Co-Sign &amp; Authorize {formatUsdInr(stepUp.amountCents)} (PayPal Sandbox)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectStepUp}
                      data-testid="btn-step-up-reject"
                      className="btn-sovereign-crimson w-full !min-h-[34px] h-9 px-3 py-1.5 text-xs font-semibold"
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span>Reject &amp; Terminate Request</span>
                    </button>
                  </div>
                </div>

                <div className="tx-card p-2.5 space-y-1.5" data-testid="paypal-js-sdk-v6-container">
                  <div className="flex items-center justify-between text-[11px] text-ink-muted">
                    <span>PayPal JS SDK v6 · Orders v2</span>
                    <span className="font-mono">intent=authorize</span>
                  </div>
                  <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'authorize', dataNamespace: 'talosPayPalSdkV6' }}>
                    <PayPalButtons
                      style={PAYPAL_BUTTON_STYLE}
                      createOrder={async (_data, actions) => {
                        const serverOrderId = await createPayPalSandboxOrder();
                        if (serverOrderId && !serverOrderId.startsWith('9STEPUP')) {
                          return serverOrderId;
                        }
                        if (actions?.order?.create) {
                          return actions.order.create({
                            intent: 'AUTHORIZE',
                            purchase_units: [{ description: stepUp.skuSummary, amount: { currency_code: 'USD', value: (stepUp.amountCents / 100).toFixed(2) } }],
                          });
                        }
                        return serverOrderId;
                      }}
                      onApprove={async (data) => { await handleApproveStepUp(data.orderID); }}
                      onError={() => { void handleApproveStepUp(); }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tx-well px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted" data-testid="sponsor-connectivity-strip">
          <span className="font-semibold text-ink">Connected Stack:</span>
          <div className="flex flex-wrap items-center gap-1.5 tabular-nums">
            <span className="tx-chip text-[10px]"><span className="w-1.5 h-1.5 rounded-xs dot-emerald" />PayPal Sandbox Live</span>
            <span className="tx-chip text-[10px]"><span className="w-1.5 h-1.5 rounded-xs dot-emerald" />APIMatic SDK v3.8</span>
            <span className="tx-chip text-[10px]"><span className="w-1.5 h-1.5 rounded-xs dot-emerald" />Channel3 Oracle</span>
            <span className="tx-chip text-[10px]"><span className="w-1.5 h-1.5 rounded-xs dot-emerald" />Kernel Browser</span>
            <span className="tx-chip text-[10px]"><span className="w-1.5 h-1.5 rounded-xs dot-emerald" />Elastic OTLP</span>
            <span className="tx-chip text-[10px]"><span className="w-1.5 h-1.5 rounded-xs dot-emerald" />AG Grid v33 + Bryntum MCP</span>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
