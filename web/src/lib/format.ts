import type { EscrowState } from './types';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatCents(cents: number | undefined | null, currency = 'USD'): string {
  if (cents == null || Number.isNaN(cents)) return '—';
  if (currency === 'USD') return usd.format(cents / 100);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function formatBps(bps: number | undefined | null): string {
  if (bps == null) return '—';
  const sign = bps > 0 ? '+' : '';
  return `${sign}${(bps / 100).toFixed(2)}%`;
}

export function shortHex(hex: string | undefined, head = 8, tail = 6): string {
  if (!hex) return '—';
  return hex.length <= head + tail + 1 ? hex : `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

export type Tone = 'paypal' | 'emerald' | 'amber' | 'crimson' | 'indigo' | 'neutral';

export interface StateMeta {
  label: string;
  tone: Tone;
  /** Text prefix so state is never conveyed by color alone (WCAG 1.4.1). */
  glyph: string;
}

export const STATE_META: Record<EscrowState, StateMeta> = {
  INITIATED: { label: 'INITIATED', tone: 'neutral', glyph: '○' },
  MANDATE_VERIFIED: { label: 'MANDATE_VERIFIED', tone: 'indigo', glyph: '◇' },
  BLOCKED_FIREWALL: { label: 'BLOCKED: DOM_INJECTION', tone: 'crimson', glyph: '⛔' },
  BLOCKED_PRICE_GOUGING: { label: 'BLOCKED: PRICE_GOUGING', tone: 'crimson', glyph: '⛔' },
  STEP_UP_REQUIRED: { label: 'STEP_UP_REQUIRED', tone: 'amber', glyph: '△' },
  PAYPAL_AUTHORIZED: { label: 'AUTHORIZED_ESCROW', tone: 'paypal', glyph: '🛡' },
  SLA_SCHEDULED: { label: 'SLA_SCHEDULED', tone: 'paypal', glyph: '◷' },
  TRACKING_VERIFIED: { label: 'TRACKING_VERIFIED', tone: 'paypal', glyph: '⛟' },
  PAYPAL_CAPTURED: { label: 'CAPTURED', tone: 'emerald', glyph: '✔' },
  PAYPAL_VOIDED: { label: 'VOIDED_SLA_BREACH', tone: 'amber', glyph: '↺' },
  DISPUTE_FILED: { label: 'DISPUTE_FILED', tone: 'amber', glyph: '⚑' },
  DISPUTE_EVIDENCE_SUBMITTED: { label: 'DISPUTE_EVIDENCE', tone: 'indigo', glyph: '⚖' },
};

export function stateMeta(state: string | undefined): StateMeta {
  return STATE_META[state as EscrowState] ?? { label: state ?? 'UNKNOWN', tone: 'neutral', glyph: '?' };
}

export const HELD_STATES: ReadonlySet<EscrowState> = new Set([
  'PAYPAL_AUTHORIZED',
  'SLA_SCHEDULED',
  'TRACKING_VERIFIED',
]);

export const BLOCKED_STATES: ReadonlySet<EscrowState> = new Set(['BLOCKED_FIREWALL', 'BLOCKED_PRICE_GOUGING']);

/** Sandbox action eligibility, matching escrow/machine.go CanTransition. */
export function canCapture(s: EscrowState): boolean {
  return HELD_STATES.has(s);
}
export function canVoid(s: EscrowState): boolean {
  return HELD_STATES.has(s) || s === 'STEP_UP_REQUIRED';
}
export function canDispute(s: EscrowState): boolean {
  return s === 'PAYPAL_CAPTURED' || s === 'DISPUTE_FILED';
}

export function newRequestId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${rand}`;
}
