'use client';
import React from 'react';

export function PayPalStepUpModal() {
  return (
    <section className="card" data-testid="paypal-step-up-modal">
      <h2 style={{ margin: "0 0 6px", fontSize: 15 }}>5. PayPal JS SDK v6 Human-in-the-Loop Step-Up Co-Sign Modal (F-09)</h2>
      <p className="muted" style={{ margin: 0, fontSize: 12 }}>Pauses over-budget agent checkouts (&gt;$300) and renders @paypal/react-paypal-js smart step-up approval.</p>
    </section>
  );
}
