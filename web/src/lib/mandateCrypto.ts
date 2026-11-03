// Browser-side mirror of firewall-rs src/mandate.rs. Used as the offline Sandbox Replay Fallback
// when the Rust firewall (POST /v1/mandates/sign) is unreachable.
import type { KyaMandate } from './types';

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

/**
 * Same field set and alphabetical key order as `canonical_mandate_digest` (serde_json BTreeMap),
 * serialized compactly, then SHA-256 hex encoded.
 */
export function canonicalMandateJson(m: KyaMandate): string {
  return JSON.stringify({
    agent_id: m.agent_id,
    allowed_categories: [...m.allowed_categories].sort(),
    currency: m.currency,
    ed25519_pubkey_hex: m.ed25519_pubkey_hex,
    expires_at_unix: m.expires_at_unix,
    mandate_id: m.mandate_id,
    max_amount_cents: m.max_amount_cents,
    max_channel3_spread_bps: m.max_channel3_spread_bps,
    principal_id: m.principal_id,
    sla_hours: m.sla_hours,
  });
}

export async function canonicalMandateDigest(m: KyaMandate): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalMandateJson(m));
  return toHex(await crypto.subtle.digest('SHA-256', bytes));
}

export function isEd25519Supported(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle?.generateKey === 'function';
}

/** Generates an ephemeral Ed25519 keypair and signs the canonical digest (matches sign_mandate). */
export async function signMandateLocally(draft: KyaMandate): Promise<{ mandate: KyaMandate; digest: string }> {
  const keys = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  const pub = new Uint8Array(await crypto.subtle.exportKey('raw', keys.publicKey));
  const withKey: KyaMandate = { ...draft, ed25519_pubkey_hex: toHex(pub) };
  const digest = await canonicalMandateDigest(withKey);
  const sig = await crypto.subtle.sign({ name: 'Ed25519' }, keys.privateKey, new TextEncoder().encode(digest));
  return { mandate: { ...withKey, ed25519_signature_hex: toHex(sig) }, digest };
}

export async function verifyMandateLocally(m: KyaMandate): Promise<boolean> {
  const hexToBytes = (h: string) => new Uint8Array(h.match(/.{2}/g)?.map((x) => parseInt(x, 16)) ?? []);
  try {
    const key = await crypto.subtle.importKey('raw', hexToBytes(m.ed25519_pubkey_hex), { name: 'Ed25519' }, false, [
      'verify',
    ]);
    const digest = await canonicalMandateDigest(m);
    return await crypto.subtle.verify(
      { name: 'Ed25519' },
      key,
      hexToBytes(m.ed25519_signature_hex),
      new TextEncoder().encode(digest),
    );
  } catch {
    return false;
  }
}
