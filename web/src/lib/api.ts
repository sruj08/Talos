// Typed HTTP client for the Go orchestrator and Rust firewall. Every money-moving call carries a
// unique PayPal-Request-Id so the backend idempotency gate (E-10) can dedupe retries.
import { FIREWALL_URL, ORCHESTRATOR_URL } from './config';
import { newRequestId } from './format';
import { canonicalMandateDigest, signMandateLocally } from './mandateCrypto';
import type { BlotterResponse, EscrowRow, KyaMandate, SignedMandateResult } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init: RequestInit = {}, timeoutMs = 4000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const b = body as { title?: string; detail?: string; code?: string; type?: string };
      throw new ApiError(b.detail ?? b.title ?? `HTTP ${res.status}`, res.status, b.code ?? b.type);
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchBlotter(): Promise<BlotterResponse> {
  return request<BlotterResponse>(`${ORCHESTRATOR_URL}/api/v1/escrow/blotter?limit=500`);
}

export type EscrowAction = 'capture' | 'void' | 'dispute';

export interface ActionResult {
  ok: true;
  patch: Partial<EscrowRow>;
  requestId: string;
}

/** API-09 capture, API-10 void, API-11 dispute evidence. */
export async function runEscrowAction(row: EscrowRow, action: EscrowAction): Promise<ActionResult> {
  const requestId = newRequestId(`talos-ui-${action}-${row.id}`);
  const headers = { 'PayPal-Request-Id': requestId };
  const base = `${ORCHESTRATOR_URL}/api/v1/escrow/${encodeURIComponent(row.id)}`;
  if (action === 'capture') {
    const r = await request<{ state?: string; paypal_capture_id?: string }>(`${base}/capture`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ escrow_id: row.id, paypal_request_id: requestId, final_capture: true }),
    });
    return { ok: true, requestId, patch: { state: 'PAYPAL_CAPTURED', paypal_capture_id: r.paypal_capture_id } };
  }
  if (action === 'void') {
    await request(`${base}/void`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ escrow_id: row.id, paypal_request_id: requestId, reason: 'OPERATOR_VOID_FROM_BLOTTER' }),
    });
    return { ok: true, requestId, patch: { state: 'PAYPAL_VOIDED' } };
  }
  const r = await request<{ dispute_id?: string; paypal_dispute_id?: string }>(`${base}/dispute-evidence`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      paypal_dispute_id: row.dispute_id ?? `PP-D-${row.id}`,
      dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
      kernel_screenshot_url: '',
    }),
  });
  return {
    ok: true,
    requestId,
    patch: { state: 'DISPUTE_EVIDENCE_SUBMITTED', dispute_id: r.paypal_dispute_id ?? r.dispute_id ?? row.dispute_id },
  };
}

/** API-01 POST /v1/mandates/sign with WebCrypto fallback when firewall-rs is offline. */
export async function signMandate(draft: KyaMandate): Promise<SignedMandateResult> {
  const started = performance.now();
  try {
    const signed = await request<KyaMandate & { canonical_digest_hex?: string }>(
      `${FIREWALL_URL}/v1/mandates/sign`,
      { method: 'POST', body: JSON.stringify(draft) },
      2500,
    );
    return {
      mandate: signed,
      canonicalDigestHex: signed.canonical_digest_hex ?? (await canonicalMandateDigest(signed)),
      latencyMs: performance.now() - started,
      source: 'firewall-rs',
    };
  } catch {
    const localStart = performance.now();
    const { mandate, digest } = await signMandateLocally(draft);
    return { mandate, canonicalDigestHex: digest, latencyMs: performance.now() - localStart, source: 'webcrypto-fallback' };
  }
}
