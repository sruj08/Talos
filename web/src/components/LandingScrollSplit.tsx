'use client';

import React from 'react';
import { Lock, ShieldCheck, Wallet } from 'lucide-react';
import { ScrollSplitCard } from './ui/scroll-split-card';

export function LandingScrollSplit() {
  const clearingCards = [
    {
      title: 'Mandate Cap',
      description:
        'Lock a $300 spend ceiling, fair-price check, and delivery SLA before the agent shops.',
      bgColor: '#001435',
      textColor: '#F8FAFC',
      icon: <Lock className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      title: 'Trap Intercept',
      description:
        'Rust firewall blocks poisoned DOM instructions in 2.84ms before PayPal AUTHORIZE.',
      bgColor: '#003087',
      textColor: '#FFFFFF',
      icon: <ShieldCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      title: 'Escrow Settle',
      description:
        'Hold funds in reversible PayPal escrow — CAPTURE on delivery, VOID if SLA breaks.',
      bgColor: '#0070E0',
      textColor: '#FFFFFF',
      icon: <Wallet className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />,
    },
  ];

  return (
    <section
      id="landing-scroll-split"
      data-testid="landing-scroll-split"
      aria-label="Scroll-split clearing stages"
      className="py-8"
    >
      <div className="mx-auto mb-10 max-w-[48ch] space-y-3">
        <p className="paypal-label text-ink-muted">Product Journey</p>
        <h2 className="paypal-headline-lg text-ink">One image. Three clearing stages</h2>
        <p className="paypal-body-sm text-ink-secondary">
          Scroll to split the shield into mandate, intercept, and PayPal escrow settlement.
        </p>
      </div>
      <ScrollSplitCard
        imageSrc="/assets/talos-fragment-shield-3d.svg"
        cards={clearingCards}
        startHint="Scroll to open the clearing stages"
        endHint="Three stages. One PayPal-backed clearinghouse"
      />
    </section>
  );
}
