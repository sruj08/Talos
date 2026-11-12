'use client';

import React from 'react';
import { Lock, ShieldCheck, Wallet } from 'lucide-react';
import { ScrollSplitCard } from './ui/scroll-split-card';

export function LandingScrollSplit() {
  const clearingCards = [
    {
      stageCode: 'STAGE 01',
      metric: '$300.00',
      metricLabel: 'Ed25519 Allowance Cap',
      protocolTag: 'RFC 9421 Signed',
      title: 'Mandate Cap',
      description:
        'Lock a $300 spend ceiling, fair-price check, and delivery SLA before the agent shops.',
      bgColor: '#0F141C',
      textColor: '#F8FAFC',
      accentColor: '#E2E8F0',
      icon: <Lock className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      stageCode: 'STAGE 02',
      metric: '2.84ms',
      metricLabel: 'DOM Injection Stripped',
      protocolTag: 'lol_html + ONNX',
      title: 'Trap Intercept',
      description:
        'Rust firewall blocks poisoned DOM instructions in 2.84ms before PayPal AUTHORIZE.',
      bgColor: '#0F141C',
      textColor: '#F8FAFC',
      accentColor: '#E2E8F0',
      icon: <ShieldCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      stageCode: 'STAGE 03',
      metric: '+$231.00',
      metricLabel: 'Saved in PayPal Escrow',
      protocolTag: 'Orders v2 2PC',
      title: 'Escrow Settle',
      description:
        'Hold funds in reversible PayPal escrow — CAPTURE on delivery, VOID if SLA breaks.',
      bgColor: '#0F141C',
      textColor: '#F8FAFC',
      accentColor: '#E2E8F0',
      icon: <Wallet className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
    },
  ];

  return (
    <section
      id="landing-scroll-split"
      data-testid="landing-scroll-split"
      aria-label="Scroll-split clearing stages"
      className="py-5 md:py-7"
    >
      <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="max-w-[56ch] space-y-1">
          <p className="paypal-label text-ink-secondary">Three-Stage Optical Clearinghouse</p>
          <h2 className="tx-section-title text-ink">One architecture. Three clearing stages</h2>
          <p className="tx-lede">
            Scroll or click any stage to split the optical hardware triptych into mandate signing, DOM interception, and reversible PayPal escrow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="tx-chip tx-key">01 · Ed25519 Cap</span>
          <span className="tx-chip tx-key">02 · 2.84ms Firewall</span>
          <span className="tx-chip tx-key">03 · PayPal 2PC Vault</span>
        </div>
      </div>
      <ScrollSplitCard
        imageSrc="/assets/talos-shield-cinema-plate.png"
        cards={clearingCards}
        startHint="Scroll or click any stage to inspect specifications"
        endHint="Three stages. One PayPal-backed clearinghouse"
      />
    </section>
  );
}
