'use client';
import React from 'react';

export function PoisonedStoreSim() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4" data-testid="poisoned-store-sim">
      <h2 className="text-lg font-semibold">2. 3-Act Live Judge Scenario &amp; Red-Team Storefront Simulator (F-11)</h2>
      <p className="text-xs text-slate-400">
        Trigger Act 1 (DOM Prompt-Injection Block), Act 2 (Channel3 + PayPal AUTHORIZE &rarr; CAPTURE), or Act 3 (Bryntum SLA Breach &rarr; PayPal VOID).
      </p>
    </section>
  );
}
