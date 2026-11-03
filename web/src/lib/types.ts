// Wire contracts mirrored from services/orchestrator-go (API-07..API-15) and firewall-rs (API-01..API-04).

export type EscrowState =
  | 'INITIATED'
  | 'MANDATE_VERIFIED'
  | 'BLOCKED_FIREWALL'
  | 'BLOCKED_PRICE_GOUGING'
  | 'STEP_UP_REQUIRED'
  | 'PAYPAL_AUTHORIZED'
  | 'SLA_SCHEDULED'
  | 'TRACKING_VERIFIED'
  | 'PAYPAL_CAPTURED'
  | 'PAYPAL_VOIDED'
  | 'DISPUTE_FILED'
  | 'DISPUTE_EVIDENCE_SUBMITTED';

export interface DomDiffLine {
  kind: 'removed' | 'kept';
  text: string;
  vector?: string;
}

export interface Channel3Snapshot {
  canonicalTitle: string;
  listedCents: number;
  medianCents: number;
  lowestVerifiedCents: number;
  lowestMerchantName: string;
  spreadHistoryBps: number[];
  oracleMode: 'live' | 'fallback';
}

export interface SignatureEvidence {
  ed25519PubkeyHex: string;
  ed25519SignatureHex: string;
  canonicalDigestHex: string;
  rfc9421SignatureInput: string;
  rfc9421Signature: string;
}

export interface Forensics {
  domDiff: DomDiffLine[];
  firewallLatencyMs: number;
  injectionScore: number;
  channel3?: Channel3Snapshot;
  signature?: SignatureEvidence;
}

/** Row model for the AG Grid blotter (superset of handlers.EscrowEntry). */
export interface EscrowRow {
  id: string;
  escrow_id: string;
  mandate_id: string;
  agent_id: string;
  merchant_url: string;
  merchant_name: string;
  merchant_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  sku_query: string;
  amount_cents: number;
  currency_code: string;
  state: EscrowState;
  paypal_order_id?: string;
  paypal_authorization_id?: string;
  paypal_capture_id?: string;
  channel3_median_cents?: number;
  spread_bps?: number;
  carrier?: string;
  tracking_number?: string;
  dispute_id?: string;
  created_at: string;
  updated_at: string;
  forensics?: Forensics;
}

/** Frame emitted by GET /ws/events (internal/ws/hub.go Event). */
export interface EscrowWsEvent {
  event_type: string;
  event_id: string;
  timestamp: string;
  escrow_id: string;
  previous_state?: string;
  current_state?: string;
  new_state?: string;
  paypal_order_id?: string;
  ag_grid_row_delta?: Partial<EscrowRow> & { id?: string };
  bryntum_task_delta?: unknown;
  recent_events?: EscrowWsEvent[];
}

/** API-12 GET /api/v1/escrow/blotter */
export interface BlotterResponse {
  total_count: number;
  total_held_cents: number;
  total_captured_cents: number;
  total_voided_cents: number;
  channel3_savings_cents: number;
  attacks_blocked_count: number;
  rows: Partial<EscrowRow>[];
}

/** firewall-rs KyaMandate (src/mandate.rs). */
export interface KyaMandate {
  mandate_id: string;
  principal_id: string;
  agent_id: string;
  max_amount_cents: number;
  currency: string;
  allowed_categories: string[];
  max_channel3_spread_bps: number;
  sla_hours: number;
  expires_at_unix: number;
  ed25519_pubkey_hex: string;
  ed25519_signature_hex: string;
}

export interface SignedMandateResult {
  mandate: KyaMandate;
  canonicalDigestHex: string;
  latencyMs: number;
  source: 'firewall-rs' | 'webcrypto-fallback';
}

export type StreamStatus = 'connecting' | 'live' | 'simulated';

export interface Kpis {
  protectedGmvCents: number;
  attacksBlocked: number;
  channel3SavingsCents: number;
  activeAuthorizations: number;
  heldCents: number;
  capturedCents: number;
}
