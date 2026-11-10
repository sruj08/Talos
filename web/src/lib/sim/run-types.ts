// Shared types for the Live Agent Simulator run engine.
import type { JudgeActId } from '../../hooks/usePoisonedStoreSim';
import type { ProductSku, StoreId } from './storefront-catalog';

export type HazardKey = 'injectOverride' | 'inflatePrice' | 'delayCarrier' | 'overCapItem';
export type Hazards = Record<HazardKey, boolean>;
export type RunMode = 'PROTECTED' | 'UNPROTECTED';

export type XRayLayerId = 'ALLOWANCE' | 'DOM_SCAN' | 'PRICE_RADAR' | 'ESCROW_VAULT' | 'CARRIER_SLA';
export type LayerStatus =
  | 'idle'
  | 'scanning'
  | 'pass'
  | 'blocked'
  | 'paused'
  | 'bypassed'
  | 'held'
  | 'released'
  | 'refunded';

export type CursorTarget =
  | 'url'
  | 'product-primary'
  | 'price-primary'
  | 'add-primary'
  | 'product-genelec'
  | 'add-genelec'
  | 'checkout'
  | 'tracker';

export interface CartLine {
  sku: ProductSku;
  title: string;
  priceUsd: number;
  storeId: StoreId;
  needsApproval?: boolean;
}

export interface LayerUpdate {
  id: XRayLayerId;
  status: LayerStatus;
  metric: string;
  note: string;
}

export interface RunStep {
  id: string;
  /** Short live pill text shown next to the agent cursor. */
  status: string;
  tone: 'neutral' | 'danger' | 'success' | 'warning';
  store: StoreId;
  cursor: CursorTarget;
  layer?: LayerUpdate;
  cart: CartLine[];
  injectionVisible: boolean;
  savedUsd: number;
  lostUsd: number;
  heldUsd: number;
}

export type OutcomeKind = 'HIJACKED' | 'UNPROTECTED_PAID' | 'BLOCKED_REROUTED' | 'CAPTURED' | 'REFUNDED';

export interface RunOutcome {
  kind: OutcomeKind;
  mode: RunMode;
  headline: string;
  savedUsd: number;
  lostUsd: number;
  heldUsd: number;
  settledUsd: number;
  refundedUsd: number;
  pendingApprovalUsd: number;
  /** Matching canonical act used to sync the CFO ledger, SLA board and step-up desk. */
  ledgerAct: JudgeActId | null;
  escrowId: string | null;
}

export interface AgentRun {
  hazards: Hazards;
  mode: RunMode;
  capUsd: number;
  primarySku: ProductSku;
  steps: RunStep[];
  outcome: RunOutcome;
}

export const NO_HAZARDS: Hazards = {
  injectOverride: false,
  inflatePrice: false,
  delayCarrier: false,
  overCapItem: false,
};

export type GuidedScenarioId = 'SCAM' | 'HONEST' | 'LATE_BIG';

export const GUIDED_SCENARIOS: Record<GuidedScenarioId, { label: string; summary: string; hazards: Hazards }> = {
  SCAM: {
    label: 'Poisoned scam store',
    summary: '$480 trap blocked, $231 saved',
    hazards: { ...NO_HAZARDS, injectOverride: true, inflatePrice: true },
  },
  HONEST: {
    label: 'Honest verified store',
    summary: '$249 held, paid after delivery',
    hazards: { ...NO_HAZARDS },
  },
  LATE_BIG: {
    label: 'Late delivery + big order',
    summary: '0-second refund, $450 needs approval',
    hazards: { ...NO_HAZARDS, delayCarrier: true, overCapItem: true },
  },
};

export const HAZARD_LABELS: Record<HazardKey, string> = {
  injectOverride: 'Inject hidden webpage override',
  inflatePrice: 'Inflate store price to $480',
  delayCarrier: 'Delay carrier past 48h',
  overCapItem: 'Add $450 over-cap item',
};

export function matchGuidedScenario(h: Hazards): GuidedScenarioId | null {
  for (const [id, preset] of Object.entries(GUIDED_SCENARIOS) as Array<[GuidedScenarioId, { hazards: Hazards }]>) {
    const p = preset.hazards;
    if (
      p.injectOverride === h.injectOverride &&
      p.inflatePrice === h.inflatePrice &&
      p.delayCarrier === h.delayCarrier &&
      p.overCapItem === h.overCapItem
    ) {
      return id;
    }
  }
  return null;
}
