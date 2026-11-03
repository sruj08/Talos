'use client';
// KYA Mandate Studio (F-01 / API-01): configure and Ed25519-sign the agent's spending mandate.
import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { signMandate } from '@/lib/api';
import { formatBps, formatCents, newRequestId, shortHex } from '@/lib/format';
import { verifyMandateLocally } from '@/lib/mandateCrypto';
import type { KyaMandate, SignedMandateResult } from '@/lib/types';
import { TonePill } from './StatusBadge';

export const MANDATE_CATEGORIES = ['audio_equipment', 'electronics', 'office_supplies', 'software', 'travel'] as const;

export interface MandateDraftInput {
  agentId: string;
  budgetUsd: number;
  maxSpreadPct: number;
  slaHours: number;
  ttlHours: number;
  categories: string[];
}

export const DEFAULT_DRAFT: MandateDraftInput = {
  agentId: 'agent-talos-1',
  budgetUsd: 300,
  maxSpreadPct: 15,
  slaHours: 48,
  ttlHours: 24,
  categories: ['audio_equipment', 'electronics'],
};

export function buildMandate(d: MandateDraftInput, nowUnix = Math.floor(Date.now() / 1000)): KyaMandate {
  return {
    mandate_id: newRequestId('KYA'),
    principal_id: 'principal-demo-buyer',
    agent_id: d.agentId.trim() || 'agent-talos-1',
    max_amount_cents: Math.round(d.budgetUsd * 100),
    currency: 'USD',
    allowed_categories: [...d.categories].sort(),
    max_channel3_spread_bps: Math.round(d.maxSpreadPct * 100),
    sla_hours: Math.round(d.slaHours),
    expires_at_unix: nowUnix + Math.round(d.ttlHours) * 3600,
    ed25519_pubkey_hex: '',
    ed25519_signature_hex: '',
  };
}

export function MandateStudio({ onSigned }: { onSigned?: (r: SignedMandateResult) => void }) {
  const [draft, setDraft] = useState<MandateDraftInput>(DEFAULT_DRAFT);
  const [result, setResult] = useState<SignedMandateResult | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof MandateDraftInput>(k: K, v: MandateDraftInput[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleCategory = (c: string) =>
    set('categories', draft.categories.includes(c) ? draft.categories.filter((x) => x !== c) : [...draft.categories, c]);

  const invalid = draft.budgetUsd <= 0 || draft.categories.length === 0 || draft.slaHours <= 0 || draft.ttlHours <= 0;

  async function onSign(e: React.FormEvent) {
    e.preventDefault();
    if (invalid) return;
    setBusy(true);
    setError(null);
    setVerified(null);
    try {
      const signed = await signMandate(buildMandate(draft));
      setResult(signed);
      onSigned?.(signed);
      setVerified(await verifyMandateLocally(signed.mandate));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signing failed');
    } finally {
      setBusy(false);
    }
  }

  const num = (k: keyof MandateDraftInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Number(e.target.value) as never);

  return (
    <section className="card" aria-labelledby="mandate-studio-title">
      <div className="card-head">
        <h2 id="mandate-studio-title">
          <KeyRound size={15} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />
          KYA Mandate Studio
        </h2>
        <span className="sub">Ed25519 · RFC 8785 canonical digest</span>
      </div>
      <form className="form" onSubmit={onSign} noValidate>
        <div className="form-row">
          <label className="field">
            Budget ceiling (USD)
            <input type="number" min={1} step={1} value={draft.budgetUsd} onChange={num('budgetUsd')} name="budget" />
          </label>
          <label className="field">
            Max Channel3 spread (%)
            <input type="number" min={0} max={100} step={0.5} value={draft.maxSpreadPct} onChange={num('maxSpreadPct')} name="spread" />
          </label>
          <label className="field">
            Delivery SLA (hours)
            <input type="number" min={1} step={1} value={draft.slaHours} onChange={num('slaHours')} name="sla" />
          </label>
        </div>
        <div className="form-row">
          <label className="field">
            Agent ID
            <input value={draft.agentId} onChange={(e) => set('agentId', e.target.value)} name="agent" />
          </label>
          <label className="field">
            Mandate TTL (hours)
            <input type="number" min={1} step={1} value={draft.ttlHours} onChange={num('ttlHours')} name="ttl" />
          </label>
          <div className="field">
            Limits
            <span className="mono" style={{ color: 'var(--text-primary)', paddingTop: 6 }}>
              {formatCents(draft.budgetUsd * 100)} · ≤{formatBps(draft.maxSpreadPct * 100)}
            </span>
          </div>
        </div>
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: 4 }}>Allowed categories</legend>
          <div className="chips">
            {MANDATE_CATEGORIES.map((c) => (
              <button type="button" key={c} className="chip" aria-pressed={draft.categories.includes(c)} onClick={() => toggleCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </fieldset>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary" disabled={busy || invalid}>
            <ShieldCheck size={14} aria-hidden="true" />
            {busy ? 'Signing…' : 'Sign KYA Mandate'}
          </button>
          {invalid && <span className="muted" style={{ fontSize: 12 }}>Budget, SLA, TTL and ≥1 category are required.</span>}
        </div>
      </form>
      {error && (
        <p className="notice" role="alert" style={{ color: 'var(--crimson)' }}>
          {error}
        </p>
      )}
      {result && (
        <div style={{ marginTop: 14, display: 'grid', gap: 10 }} data-testid="mandate-result">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <TonePill tone={result.source === 'firewall-rs' ? 'emerald' : 'amber'}>
              {result.source === 'firewall-rs' ? 'SIGNED BY firewall-rs' : 'SIGNED LOCALLY (WebCrypto fallback)'}
            </TonePill>
            <TonePill tone={verified ? 'emerald' : verified === false ? 'crimson' : 'neutral'}>
              {verified ? '✔ SIGNATURE VERIFIED' : verified === false ? '✖ VERIFY FAILED' : 'VERIFYING…'}
            </TonePill>
            <TonePill tone="indigo">{result.latencyMs.toFixed(2)} ms</TonePill>
          </div>
          <dl className="kv">
            <dt>Mandate ID</dt>
            <dd>{result.mandate.mandate_id}</dd>
            <dt>Ed25519 public key</dt>
            <dd data-testid="mandate-pubkey" title={result.mandate.ed25519_pubkey_hex}>
              {result.mandate.ed25519_pubkey_hex}
            </dd>
            <dt>Signature</dt>
            <dd data-testid="mandate-signature" title={result.mandate.ed25519_signature_hex}>
              {shortHex(result.mandate.ed25519_signature_hex, 32, 16)}
            </dd>
            <dt>SHA-256 digest</dt>
            <dd data-testid="mandate-digest">{result.canonicalDigestHex}</dd>
            <dt>Expires</dt>
            <dd>{new Date(result.mandate.expires_at_unix * 1000).toISOString()}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}
