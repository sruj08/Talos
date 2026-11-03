'use client';
// Master-Detail forensic drawer: stripped DOM diff (firewall-rs), Channel3 price chart (AG Charts),
// Ed25519 / RFC 9421 evidence, and 1-click PayPal Sandbox Capture / Void / Dispute.
import { useState } from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import { AgCharts } from 'ag-charts-react';
import type { AgCartesianChartOptions } from 'ag-charts-community';
import { runEscrowAction, type EscrowAction } from '@/lib/api';
import { canCapture, canDispute, canVoid, formatBps, formatCents, shortHex } from '@/lib/format';
import type { EscrowRow } from '@/lib/types';
import { StatusBadge, TonePill } from './StatusBadge';

export interface ForensicContext {
  onAction: (row: EscrowRow, action: EscrowAction, patch: Partial<EscrowRow>) => void;
  simulated: boolean;
}

export function channel3ChartOptions(row: EscrowRow): AgCartesianChartOptions {
  const c3 = row.forensics?.channel3;
  const listed = c3?.listedCents ?? row.amount_cents;
  const median = c3?.medianCents ?? row.channel3_median_cents ?? listed;
  const lowest = c3?.lowestVerifiedCents ?? median;
  return {
    theme: 'ag-default-dark',
    background: { fill: 'transparent' },
    height: 180,
    data: [
      { quote: 'Merchant listed', usd: listed / 100 },
      { quote: 'Channel3 median', usd: median / 100 },
      { quote: 'Lowest verified', usd: lowest / 100 },
    ],
    series: [
      {
        type: 'bar',
        xKey: 'quote',
        yKey: 'usd',
        yName: 'USD',
        itemStyler: ({ datum }) => ({
          fill: datum.quote === 'Merchant listed' ? (listed > median * 1.15 ? '#F87171' : '#38BDF8') : '#34D399',
        }),
        label: { formatter: ({ value }) => `$${Number(value).toFixed(2)}` },
      },
    ],
    axes: [
      { type: 'category', position: 'bottom' },
      { type: 'number', position: 'left', label: { formatter: ({ value }) => `$${value}` } },
    ],
    legend: { enabled: false },
  };
}

export function ForensicDetailBody({ row: baseRow, ctx }: { row: EscrowRow; ctx?: ForensicContext }) {
  // Detail rows are not re-rendered on master updates, so keep this panel's own optimistic patch.
  const [local, setLocal] = useState<Partial<EscrowRow>>({});
  const row: EscrowRow = { ...baseRow, ...local };
  const [busy, setBusy] = useState<EscrowAction | null>(null);
  const [msg, setMsg] = useState<{ tone: 'emerald' | 'crimson' | 'amber'; text: string } | null>(null);
  const f = row.forensics;
  const sig = f?.signature;

  async function act(action: EscrowAction) {
    setBusy(action);
    setMsg(null);
    try {
      const res = await runEscrowAction(row, action);
      setLocal((l) => ({ ...l, ...res.patch }));
      ctx?.onAction(row, action, res.patch);
      setMsg({ tone: 'emerald', text: `${action.toUpperCase()} OK · PayPal-Request-Id ${shortHex(res.requestId, 18, 6)}` });
    } catch (err) {
      if (ctx?.simulated) {
        const patch: Partial<EscrowRow> =
          action === 'capture'
            ? { state: 'PAYPAL_CAPTURED', paypal_capture_id: `3C-REPLAY-${row.id}` }
            : action === 'void'
              ? { state: 'PAYPAL_VOIDED' }
              : { state: 'DISPUTE_EVIDENCE_SUBMITTED', dispute_id: row.dispute_id ?? `PP-D-REPLAY-${row.id}` };
        setLocal((l) => ({ ...l, ...patch }));
        ctx.onAction(row, action, patch);
        setMsg({ tone: 'amber', text: `${action.toUpperCase()} applied via Sandbox Replay (orchestrator offline)` });
      } else {
        setMsg({ tone: 'crimson', text: err instanceof Error ? err.message : `${action} failed` });
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="forensic" data-testid={`forensic-${row.id}`}>
      <section aria-label="Prompt-injection DOM diff">
        <h3>firewall-rs DOM diff</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <StatusBadge state={row.state} />
          {f && <TonePill tone="indigo">{f.firewallLatencyMs.toFixed(2)} ms</TonePill>}
          {f && (
            <TonePill tone={f.injectionScore >= 0.85 ? 'crimson' : 'emerald'}>
              DeBERTa {f.injectionScore.toFixed(3)}
            </TonePill>
          )}
        </div>
        {f?.domDiff?.length ? (
          <ul className="diff" aria-label="Sanitized DOM lines">
            {f.domDiff.map((l, i) => (
              <li key={i} className={l.kind}>
                <span aria-hidden="true">{l.kind === 'removed' ? '− ' : '+ '}</span>
                <span className="sr-only">{l.kind === 'removed' ? 'Stripped:' : 'Kept:'}</span>
                {l.text}
                {l.vector && <span className="muted"> [{l.vector}]</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No DOM snapshot captured for this escrow.</p>
        )}
      </section>

      <section aria-label="Channel3 price benchmark">
        <h3>Channel3 cross-merchant price</h3>
        <div className="mini-chart">
          <AgCharts options={channel3ChartOptions(row)} />
        </div>
        <p className="muted mono" style={{ fontSize: 12, margin: '6px 0 0' }}>
          spread {formatBps(row.spread_bps)} · median {formatCents(row.channel3_median_cents)}
          {f?.channel3 ? ` · ${f.channel3.oracleMode}` : ''}
        </p>
      </section>

      <section aria-label="Signature evidence and Sandbox actions">
        <h3>Ed25519 · RFC 9421</h3>
        <dl className="kv">
          <dt>Mandate</dt>
          <dd>{row.mandate_id || '—'}</dd>
          <dt>Pubkey</dt>
          <dd title={sig?.ed25519PubkeyHex}>{shortHex(sig?.ed25519PubkeyHex, 12, 8)}</dd>
          <dt>Signature</dt>
          <dd title={sig?.ed25519SignatureHex}>{shortHex(sig?.ed25519SignatureHex, 12, 8)}</dd>
          <dt>Sig-Input</dt>
          <dd>{sig?.rfc9421SignatureInput ?? '—'}</dd>
          <dt>PayPal order</dt>
          <dd>{row.paypal_order_id ?? '—'}</dd>
          <dt>Tracking</dt>
          <dd>{row.tracking_number ? `${row.carrier} ${row.tracking_number}` : '—'}</dd>
        </dl>
        <div className="actions">
          <button className="btn btn-emerald" disabled={!!busy || !canCapture(row.state)} onClick={() => act('capture')}>
            {busy === 'capture' ? 'Capturing…' : 'Capture'}
          </button>
          <button className="btn btn-amber" disabled={!!busy || !canVoid(row.state)} onClick={() => act('void')}>
            {busy === 'void' ? 'Voiding…' : 'Void'}
          </button>
          <button className="btn btn-indigo" disabled={!!busy || !canDispute(row.state)} onClick={() => act('dispute')}>
            {busy === 'dispute' ? 'Submitting…' : 'Dispute'}
          </button>
        </div>
        {msg && (
          <p className={`notice tone-${msg.tone}`} role="status" style={{ marginTop: 8 }}>
            {msg.text}
          </p>
        )}
      </section>
    </div>
  );
}

/** AG Grid detailCellRenderer adapter. */
export function ForensicDetailPanel(p: ICellRendererParams<EscrowRow> & { ctx?: ForensicContext }) {
  if (!p.data) return null;
  return <ForensicDetailBody row={p.data} ctx={p.ctx ?? (p.context as ForensicContext | undefined)} />;
}
