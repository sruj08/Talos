'use client';
import React from 'react';

export function PoisonedStoreSim() {
  return (
    <section className="card" data-testid="poisoned-store-sim">
      <h2 style={{ margin: "0 0 6px", fontSize: 15 }}>2. 3-Act Live Judge Scenario &amp; Red-Team Storefront Simulator (F-11)</h2>
      <p className="muted" style={{ margin: 0, fontSize: 12 }}>
        Trigger Act 1 (DOM Prompt-Injection Block), Act 2 (Channel3 + PayPal AUTHORIZE &rarr; CAPTURE), or Act 3 (Bryntum SLA Breach &rarr; PayPal VOID).
      </p>
    </section>
  );
}
