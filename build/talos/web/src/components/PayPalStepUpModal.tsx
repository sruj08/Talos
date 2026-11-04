'use client';

import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { formatUsdInr } from '../lib/phase6-events';
import { usePayPalStepUp, UsePayPalStepUpOptions } from '../hooks/usePayPalStepUp';

export type PayPalStepUpModalProps = UsePayPalStepUpOptions;

export function PayPalStepUpModal(props: PayPalStepUpModalProps = {}) {
  const {
    stepUp,
    statusState,
    statusNote,
    createPayPalSandboxOrder,
    handleApproveStepUp,
    handleRejectStepUp,
  } = usePayPalStepUp(props);

  const overageCents = Math.max(0, stepUp.amountCents - stepUp.mandateCapCents);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

  return (
    <section
      className="rounded-xl border border-amber-500/40 bg-slate-900/85 p-4 shadow-2xl"
      data-testid="paypal-step-up-modal"
      data-step-up-state={statusState}
      role="region"
      aria-label="PayPal JS SDK v6 Human-in-the-Loop Step-Up Co-Sign Modal"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-semibold text-amber-300">
            5. PayPal JS SDK v6 Human-in-the-Loop Step-Up Co-Sign Modal (F-09)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Pauses over-budget agent checkouts (&gt;$300) and requires 1-click human PayPal Sandbox co-sign via @paypal/react-paypal-js.
          </p>
        </div>
        <span
          data-testid="step-up-status-badge"
          className={`rounded px-2.5 py-1 font-mono text-xs font-semibold ${
            statusState === 'PAYPAL_AUTHORIZED'
              ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-200'
              : statusState === 'PAYPAL_VOIDED'
              ? 'border border-rose-500/50 bg-rose-500/20 text-rose-200'
              : 'border border-amber-500/50 bg-amber-500/20 text-amber-200'
          }`}
        >
          {statusState === 'PAYPAL_AUTHORIZED'
            ? '[✔ CO-SIGNED: PAYPAL_AUTHORIZED]'
            : statusState === 'PAYPAL_VOIDED'
            ? '[✖ REJECTED: PAYPAL_VOIDED]'
            : '[⚡ STEP_UP_REQUIRED (> $300 CAP)]'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 tabular-nums">
          <div>
            <span className="text-slate-400">Item &amp; Merchant :</span>{' '}
            <strong className="text-slate-100">{stepUp.skuSummary}</strong> ({stepUp.merchantName})
          </div>
          <div>
            <span className="text-slate-400">Requested Amt   :</span>{' '}
            <strong className="text-amber-300">{formatUsdInr(stepUp.amountCents)}</strong>{' '}
            <span className="text-rose-300">
              [Mandate Cap: {formatUsdInr(stepUp.mandateCapCents)} (+{formatUsdInr(overageCents)} overage)]
            </span>
          </div>
          <div>
            <span className="text-slate-400">Firewall Scan   :</span>{' '}
            <span className="text-emerald-300">
              PASSED ({stepUp.firewallRiskScore.toFixed(2)} risk · 0 hidden injections · {stepUp.firewallLatencyMs}ms)
            </span>
          </div>
          <div>
            <span className="text-slate-400">Channel3 Check  :</span>{' '}
            <span className="text-emerald-300">
              VERIFIED FAIR PRICE ({formatUsdInr(stepUp.channel3MedianCents)} median · {stepUp.channel3SpreadBps} bps)
            </span>
          </div>
          <div role="status" aria-live="polite" data-testid="step-up-live-note" className="pt-1 text-sky-300">
            {statusNote}
          </div>
        </div>

        <div className="space-y-2.5 rounded-lg border border-slate-800 bg-slate-950/90 p-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleApproveStepUp()}
              data-testid="btn-step-up-cosign"
              className="min-h-[38px] flex-1 rounded-lg border border-amber-400/60 bg-amber-500/25 px-3 py-2 text-xs font-bold text-amber-100 hover:bg-amber-500/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              Co-Sign &amp; Authorize {formatUsdInr(stepUp.amountCents)} (PayPal Sandbox)
            </button>
            <button
              type="button"
              onClick={handleRejectStepUp}
              data-testid="btn-step-up-reject"
              className="min-h-[38px] rounded-lg border border-rose-500/50 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              Reject &amp; Terminate Request
            </button>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2" data-testid="paypal-js-sdk-v6-container">
            <PayPalScriptProvider
              options={{
                clientId,
                currency: 'USD',
                intent: 'authorize',
                dataNamespace: 'talosPayPalSdkV6',
              }}
            >
              <PayPalButtons
                style={{ layout: 'horizontal', color: 'gold', shape: 'rect', label: 'pay', height: 35 }}
                createOrder={async () => createPayPalSandboxOrder()}
                onApprove={async (data) => {
                  await handleApproveStepUp(data.orderID);
                }}
              />
            </PayPalScriptProvider>
          </div>
        </div>
      </div>
    </section>
  );
}
