'use client';
import React from 'react';

export function PayPalStepUpModal() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4" data-testid="paypal-step-up-modal">
      <h2 className="text-lg font-semibold">5. PayPal JS SDK v6 Human-in-the-Loop Step-Up Co-Sign Modal (F-09)</h2>
      <p className="text-xs text-slate-400">Pauses over-budget agent checkouts (&gt;$300) and renders @paypal/react-paypal-js smart step-up approval.</p>
    </section>
  );
}
