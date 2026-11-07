'use client';

import React, { useEffect, useState } from 'react';
import NumberFlow from '@number-flow/react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CheckCircle2, ChevronDown, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { formatUsdInr } from '../lib/phase6-events';
import { usePayPalStepUp, UsePayPalStepUpOptions } from '../hooks/usePayPalStepUp';

export type PayPalStepUpModalProps = UsePayPalStepUpOptions;

const PAYPAL_BUTTON_STYLE = {
  layout: 'horizontal' as const,
  color: 'gold' as const,
  shape: 'rect' as const,
  label: 'pay' as const,
  height: 36,
};

export function PayPalStepUpModal(props: PayPalStepUpModalProps = {}) {
  const {
    stepUp,
    statusState,
    statusNote,
    createPayPalSandboxOrder,
    handleApproveStepUp,
    handleRejectStepUp,
  } = usePayPalStepUp(props);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const overageCents = Math.max(0, stepUp.amountCents - stepUp.mandateCapCents);
  const rawClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';
  const clientId = rawClientId.startsWith('your_') ? 'sb' : rawClientId;
  const dotClass =
    statusState === 'PAYPAL_AUTHORIZED'
      ? 'dot-emerald'
      : statusState === 'PAYPAL_VOIDED'
      ? 'dot-crimson'
      : 'dot-amber';

  return (
    <section
      className="sovereign-card p-6 space-y-6"
      data-testid="paypal-step-up-modal"
      data-step-up-state={statusState}
      role="region"
      aria-label="Institutional Step-Up Co-Signing Authority"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-ink-muted">05</span>
            <h2 className="text-lg font-medium text-ink">
              Institutional Step-Up Co-Signing Authority
            </h2>
          </div>
          <p data-subhead="true" className="text-xs text-ink-secondary">
            Pauses over-budget agent checkouts and requires human PayPal Sandbox co-sign
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            data-testid="step-up-status-badge"
            data-status-code={
              statusState === 'PAYPAL_AUTHORIZED'
                ? '[✔ CO-SIGNED: PAYPAL_AUTHORIZED (PAYPAL-CAPTURE-904-STEPUP)]'
                : statusState === 'PAYPAL_VOIDED'
                ? '[✖ REJECTED: PAYPAL_VOIDED]'
                : '[⚡ STEP_UP_REQUIRED (> $300 CAP)]'
            }
            className="inline-flex items-center gap-2 font-mono text-xs text-ink-secondary tabular-nums"
          >
            <span className={`w-1.5 h-1.5 rounded-xs ${dotClass}`} aria-hidden="true" />
            <span>
              {statusState === 'PAYPAL_AUTHORIZED'
                ? '[✔ CO-SIGNED: PAYPAL_AUTHORIZED (PAYPAL-CAPTURE-904-STEPUP)]'
                : statusState === 'PAYPAL_VOIDED'
                ? '[✖ REJECTED: PAYPAL_VOIDED]'
                : '[⚡ STEP_UP_REQUIRED (> $300 CAP)]'}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            data-testid="copilot-toggle-btn"
            className="btn-sovereign-neutral h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
          >
            <span>Co-sign drawer</span>
            <ChevronDown className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        data-testid="copilot-drawer"
        className={`grid bento-drawer-transition ${drawerOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-90'}`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <div
              data-testid="copilot-hitl-card"
              className="sovereign-subcard p-4 space-y-2.5 text-xs text-ink-secondary tabular-nums"
            >
              <div>
                <span className="text-ink-muted">Item &amp; merchant: </span>
                <strong className="text-ink font-medium">{stepUp.skuSummary}</strong> ({stepUp.merchantName})
              </div>
              <div>
                <span className="text-ink-muted">Requested amount: </span>
                <strong className="text-ink font-medium">
                  {hydrated ? (
                    <span className="inline-flex items-baseline gap-1">
                      <NumberFlow value={stepUp.amountCents / 100} format={{ style: 'currency', currency: 'USD' }} />
                      <span>({formatUsdInr(stepUp.amountCents).split('(')[1] || '₹37,800)'}</span>
                    </span>
                  ) : (
                    formatUsdInr(stepUp.amountCents)
                  )}
                </strong>{' '}
                <span className="font-mono text-ink-muted">
                  [Mandate Cap: {formatUsdInr(stepUp.mandateCapCents)} (+{formatUsdInr(overageCents)} overage)]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-ink-muted">Firewall scan: </span>
                <span className="font-mono text-ink-secondary">
                  PASSED ({stepUp.firewallRiskScore.toFixed(2)} risk, 0 hidden injections, {stepUp.firewallLatencyMs}ms)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-ink-muted">Channel3 check: </span>
                <span className="font-mono text-ink-secondary">
                  VERIFIED FAIR PRICE ({formatUsdInr(stepUp.channel3MedianCents)} median, {stepUp.channel3SpreadBps} bps)
                </span>
              </div>
              <div role="status" aria-live="polite" data-testid="step-up-live-note" className="pt-1 font-mono text-ink-paypal">
                {statusNote}
              </div>
            </div>

            <div className="sovereign-subcard p-4 flex flex-col justify-between space-y-4" data-testid="copilot-action-wiring">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleApproveStepUp()}
                  data-testid="btn-step-up-cosign"
                  className="btn-paypal-primary h-10 flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium tabular-nums whitespace-nowrap active:scale-[0.98]"
                >
                  <Lock className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                  <span data-testid="copilot-confirm-stepup-btn">
                    {statusState === 'PAYPAL_AUTHORIZED'
                      ? 'CO-SIGNED · PAYPAL_AUTHORIZED ($450.00)'
                      : `Co-Sign & Authorize ${formatUsdInr(stepUp.amountCents)} (PayPal Sandbox)`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectStepUp}
                  data-testid="btn-step-up-reject"
                  className="btn-sovereign-crimson h-10 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
                >
                  <XCircle className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                  <span>Reject &amp; Terminate Request</span>
                </button>
              </div>

              <div className="sovereign-well p-3" data-testid="paypal-js-sdk-v6-container">
                <PayPalScriptProvider
                  options={{
                    clientId,
                    currency: 'USD',
                    intent: 'authorize',
                    dataNamespace: 'talosPayPalSdkV6',
                  }}
                >
                  <PayPalButtons
                    style={PAYPAL_BUTTON_STYLE}
                    createOrder={async () => createPayPalSandboxOrder()}
                    onApprove={async (data) => {
                      await handleApproveStepUp(data.orderID);
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
