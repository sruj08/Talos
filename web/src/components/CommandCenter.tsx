'use client';
// TASK-09: Dark-mode Command Center shell wiring the live escrow stream into every panel.
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useEscrowStream } from '@/hooks/useEscrowStream';
import { shortHex } from '@/lib/format';
import type { SignedMandateResult } from '@/lib/types';
import { BryntumSlaBoard } from './BryntumSlaBoard';
import { KpiHeader } from './KpiHeader';
import { MandateStudio } from './MandateStudio';
import { PayPalStepUpModal } from './PayPalStepUpModal';
import { PoisonedStoreSim } from './PoisonedStoreSim';
import { StatusBadge, StreamPill } from './StatusBadge';

// AG Grid touches `window` during module registration; keep it out of the server render.
const AgStudioBlotter = dynamic(() => import('./AgStudioBlotter').then((m) => m.AgStudioBlotter), {
  ssr: false,
  loading: () => (
    <section className="card" aria-busy="true">
      <p className="muted">Loading AG Grid Enterprise blotter…</p>
    </section>
  ),
});

export function CommandCenter() {
  const stream = useEscrowStream();
  const [mandate, setMandate] = useState<SignedMandateResult | null>(null);
  const last = stream.lastEvent;

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            T
          </div>
          <div>
            <h1>TALOS Command Center</h1>
            <p>Zero-Trust Agentic Commerce Firewall · PayPal Sandbox 2PC Escrow Referee</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {mandate && (
            <span className="pill tone-emerald" title={mandate.mandate.ed25519_pubkey_hex}>
              KYA {shortHex(mandate.mandate.ed25519_pubkey_hex, 8, 4)}
            </span>
          )}
          <StreamPill status={stream.status} />
        </div>
      </header>

      <KpiHeader kpis={stream.kpis} />

      <div className="grid-2">
        <MandateStudio onSigned={setMandate} />
        <section className="card" aria-labelledby="event-feed-title">
          <div className="card-head">
            <h2 id="event-feed-title">Live Event Feed</h2>
            <span className="sub mono">{stream.eventCount} frames</span>
          </div>
          {last ? (
            <dl className="kv" data-testid="last-event">
              <dt>Event</dt>
              <dd>{last.event_type}</dd>
              <dt>Escrow</dt>
              <dd>{last.escrow_id}</dd>
              <dt>Transition</dt>
              <dd style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusBadge state={last.previous_state} /> → <StatusBadge state={last.new_state || last.current_state} />
              </dd>
              <dt>At</dt>
              <dd>{last.timestamp}</dd>
            </dl>
          ) : (
            <p className="muted">Waiting for the first ESCROW_STATE_TRANSITION frame…</p>
          )}
          <p className="notice" style={{ marginTop: 12 }}>
            {stream.status === 'live'
              ? 'Connected to orchestrator-go /ws/events. Rows update in place via applyTransactionAsync.'
              : 'Orchestrator unreachable: running the deterministic Sandbox Replay Fallback (TALOS_SANDBOX_FALLBACK_ENABLED).'}
          </p>
        </section>
      </div>

      <AgStudioBlotter rows={stream.rows} status={stream.status} onRowPatch={stream.patchRow} />

      <section aria-label="Upcoming Phase 6 modules" className="grid-2" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <PoisonedStoreSim />
        <BryntumSlaBoard />
        <PayPalStepUpModal />
      </section>
    </main>
  );
}
