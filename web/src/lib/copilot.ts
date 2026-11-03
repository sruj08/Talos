// AG Studio Copilot (M-03): deterministic natural-language → grid intent compiler. Runs fully
// client-side so the demo works offline; every applied operation is echoed back for auditability.
import type { EscrowState } from './types';

export type GroupColumn = 'merchant_risk' | 'merchant_name' | 'state' | 'carrier' | 'sku_query';
export type ChartColumn = 'state' | 'merchant_name' | 'merchant_risk';
export type ChartKind = 'groupedColumn' | 'pie' | 'donut' | 'bar' | 'line';

export interface CopilotIntent {
  reset: boolean;
  groupBy: GroupColumn[];
  excludeStates: EscrowState[];
  includeStates: EscrowState[];
  minAmountUsd?: number;
  maxAmountUsd?: number;
  sort?: { colId: 'amount' | 'spread_bps' | 'updated_at'; sort: 'asc' | 'desc' };
  chart?: { category: ChartColumn; type: ChartKind };
  summary: string[];
}

export const PRESET_PROMPTS = [
  'Group by merchant risk, filter out prompt-injection attacks, and chart authorized vs captured PayPal volume',
  'Show only blocked attacks grouped by merchant',
  'Only captured over $200 sorted by amount',
  'Pie chart of volume by merchant risk',
  'Reset',
] as const;

const GROUP_WORDS: [RegExp, GroupColumn][] = [
  [/merchant[\s_-]*risk|\brisk\b/, 'merchant_risk'],
  [/\bmerchants?\b|\bstores?\b|\bsellers?\b/, 'merchant_name'],
  [/\bstate\b|\bstatus\b/, 'state'],
  [/\bcarriers?\b|\bshipping\b/, 'carrier'],
  [/\bskus?\b|\bproducts?\b/, 'sku_query'],
];

const STATE_WORDS: [RegExp, EscrowState[]][] = [
  [/prompt[\s-]*injections?|\binjections?\b|\bdom\b|firewall/, ['BLOCKED_FIREWALL']],
  [/goug(e|ing)|overpric/, ['BLOCKED_PRICE_GOUGING']],
  [/\battacks?\b|\bblocked\b|\bthreats?\b|\bfraud\b/, ['BLOCKED_FIREWALL', 'BLOCKED_PRICE_GOUGING']],
  [/\bauthori[sz](ed|ations?)\b|\bheld\b|\bescrow(ed)?\b/, ['PAYPAL_AUTHORIZED', 'SLA_SCHEDULED', 'TRACKING_VERIFIED']],
  [/\bcaptured?\b|\bsettled\b/, ['PAYPAL_CAPTURED']],
  [/\bvoid(ed)?\b|\bbreach(es|ed)?\b/, ['PAYPAL_VOIDED']],
  [/\bdisputes?\b/, ['DISPUTE_FILED', 'DISPUTE_EVIDENCE_SUBMITTED']],
  [/step[\s-]*up/, ['STEP_UP_REQUIRED']],
];

function statesIn(text: string): EscrowState[] {
  const out = new Set<EscrowState>();
  for (const [re, states] of STATE_WORDS) if (re.test(text)) states.forEach((s) => out.add(s));
  // "attacks" subsumes the specific vectors; avoid double-labelling but keep the union.
  return [...out];
}

/** Splits a prompt into clauses: "group by X, filter out Y, and chart Z" → 3 clauses. */
function clauses(prompt: string): string[] {
  return prompt
    .toLowerCase()
    .split(/,|;|\band then\b|\bthen\b|\band\b(?=\s+(?:group|filter|exclude|hide|show|only|chart|plot|graph|sort|rank|pie|visuali))/)
    .map((c) => c.trim())
    .filter(Boolean);
}

export function parseCopilotPrompt(prompt: string): CopilotIntent {
  const intent: CopilotIntent = { reset: false, groupBy: [], excludeStates: [], includeStates: [], summary: [] };
  const text = prompt.trim().toLowerCase();
  if (!text) return intent;
  if (/^(reset|clear|show all|start over)\b/.test(text)) {
    intent.reset = true;
    intent.summary.push('reset grid state');
    return intent;
  }

  for (const clause of clauses(prompt)) {
    const chartMatch = /\b(chart|plot|graph|visuali[sz]e|pie|donut|bar|line)\b/.test(clause);
    const groupMatch = /\bgroup(ed)?\s+(by|on)\b(.+)/.exec(clause);
    const exclude = /\b(filter\s*out|exclude|hide|remove|without|except|no)\b/.test(clause);
    const include = /\b(only|just|show|filter\s*(to|for|by)?|where)\b/.test(clause) && !exclude;

    if (groupMatch && !chartMatch) {
      for (const [re, col] of GROUP_WORDS) {
        if (re.test(groupMatch[3]) && !intent.groupBy.includes(col)) {
          intent.groupBy.push(col);
          if (col === 'merchant_risk') break; // "merchant risk" must not also group by merchant
        }
      }
    }

    if (chartMatch) {
      const type: ChartKind = /\bdonut\b/.test(clause)
        ? 'donut'
        : /\bpie\b/.test(clause)
          ? 'pie'
          : /\bline\b/.test(clause)
            ? 'line'
            : /\bbar\b/.test(clause)
              ? 'bar'
              : 'groupedColumn';
      const category: ChartColumn = /merchant[\s_-]*risk|\brisk\b/.test(clause)
        ? 'merchant_risk'
        : /by\s+(merchant|store|seller)/.test(clause)
          ? 'merchant_name'
          : 'state';
      intent.chart = { category, type };
      intent.summary.push(`chart ${type} of USD volume by ${category}`);
    } else if (exclude) {
      for (const s of statesIn(clause)) if (!intent.excludeStates.includes(s)) intent.excludeStates.push(s);
    } else if (include && !groupMatch) {
      for (const s of statesIn(clause)) if (!intent.includeStates.includes(s)) intent.includeStates.push(s);
    } else if (groupMatch) {
      // "show only blocked attacks grouped by merchant" — the leading half carries the state filter.
      const head = clause.slice(0, groupMatch.index);
      if (/\b(only|just|show)\b/.test(head)) statesIn(head).forEach((s) => intent.includeStates.push(s));
    }

    const over = /\b(over|above|more than|greater than|>)\s*\$?\s*(\d+(?:\.\d+)?)/.exec(clause);
    if (over) intent.minAmountUsd = Number(over[2]);
    const under = /\b(under|below|less than|<)\s*\$?\s*(\d+(?:\.\d+)?)/.exec(clause);
    if (under) intent.maxAmountUsd = Number(under[2]);

    const sort = /\b(sort(ed)?|rank(ed)?|order(ed)?)\s+by\s+(amount|price|value|spread|time|date|recent)/.exec(clause);
    if (sort) {
      const colId = /spread/.test(sort[5]) ? 'spread_bps' : /time|date|recent/.test(sort[5]) ? 'updated_at' : 'amount';
      intent.sort = { colId, sort: /\b(asc|ascending|lowest|smallest|oldest)\b/.test(clause) ? 'asc' : 'desc' };
    }
  }

  intent.includeStates = intent.includeStates.filter((s) => !intent.excludeStates.includes(s));
  if (intent.groupBy.length) intent.summary.unshift(`group by ${intent.groupBy.join(' › ')}`);
  if (intent.excludeStates.length) intent.summary.push(`exclude ${intent.excludeStates.join(', ')}`);
  if (intent.includeStates.length) intent.summary.push(`only ${intent.includeStates.join(', ')}`);
  if (intent.minAmountUsd != null) intent.summary.push(`amount > $${intent.minAmountUsd}`);
  if (intent.maxAmountUsd != null) intent.summary.push(`amount < $${intent.maxAmountUsd}`);
  if (intent.sort) intent.summary.push(`sort ${intent.sort.colId} ${intent.sort.sort}`);
  return intent;
}

export const ALL_STATES: EscrowState[] = [
  'INITIATED',
  'MANDATE_VERIFIED',
  'BLOCKED_FIREWALL',
  'BLOCKED_PRICE_GOUGING',
  'STEP_UP_REQUIRED',
  'PAYPAL_AUTHORIZED',
  'SLA_SCHEDULED',
  'TRACKING_VERIFIED',
  'PAYPAL_CAPTURED',
  'PAYPAL_VOIDED',
  'DISPUTE_FILED',
  'DISPUTE_EVIDENCE_SUBMITTED',
];

/** Builds the AG Grid filter model for an intent (state = set filter, amount = number filter). */
export function intentToFilterModel(intent: CopilotIntent): Record<string, unknown> {
  const model: Record<string, unknown> = {};
  if (intent.includeStates.length || intent.excludeStates.length) {
    const base = intent.includeStates.length ? intent.includeStates : ALL_STATES;
    model.state = { filterType: 'set', values: base.filter((s) => !intent.excludeStates.includes(s)) };
  }
  const conds: Record<string, unknown>[] = [];
  if (intent.minAmountUsd != null) conds.push({ filterType: 'number', type: 'greaterThan', filter: intent.minAmountUsd });
  if (intent.maxAmountUsd != null) conds.push({ filterType: 'number', type: 'lessThan', filter: intent.maxAmountUsd });
  if (conds.length === 1) model.amount = conds[0];
  if (conds.length === 2) model.amount = { filterType: 'number', operator: 'AND', conditions: conds };
  return model;
}
