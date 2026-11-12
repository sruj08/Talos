'use client';

import React from 'react';
import { Card } from '@heroui/react';
import { Clock, DollarSign, KeyRound, ShieldCheck, Tag, TrendingUp } from 'lucide-react';
import { formatUsdInr } from '../lib/phase6-events';
import {
  DEFAULT_MANDATE_VALUES,
  DEFAULT_SIGNED_MANDATE,
  MandateFormValues,
  SignedKyaMandate,
  computeDeterministicSignatureHex,
  signKyaMandateRequest,
  useMandateStudio,
} from '../hooks/useMandateStudio';
import { TechnicalProofDrawer } from './TechnicalProofDrawer';

export {
  DEFAULT_MANDATE_VALUES,
  DEFAULT_SIGNED_MANDATE,
  computeDeterministicSignatureHex,
  signKyaMandateRequest,
};
export type { MandateFormValues, SignedKyaMandate };

export interface MandateStudioProps {
  initialValues?: MandateFormValues;
  onMandateSigned?: (mandate: SignedKyaMandate) => void;
}

export function MandateStudio({ initialValues = DEFAULT_MANDATE_VALUES, onMandateSigned }: MandateStudioProps = {}) {
  const {
    budgetUsd,
    setBudgetUsd,
    maxSpreadBps,
    setMaxSpreadBps,
    slaHours,
    setSlaHours,
    categoriesInput,
    setCategoriesInput,
    signedMandate,
    signing,
    sealExpanded,
    setSealExpanded,
    handleSignSubmit,
  } = useMandateStudio(initialValues, onMandateSigned);

  return (
    <Card
      id="chapter-mandate"
      className="tx-card p-5 sm:p-6 flex flex-col justify-between gap-4 h-full"
      data-testid="mandate-studio"
      data-mandate-status={signedMandate.status}
      aria-label="Step 1: Give Your AI a Spending Allowance ($300 Max)"
    >
      <div className="flex flex-col gap-4">
        <Card.Header className="p-0">
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <span className="w-10 h-10 rounded-md icon-medallion-paypal inline-flex items-center justify-center shrink-0 mt-0.5">
                <KeyRound className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] text-ink-muted font-semibold block">Scene 01 · Set the Rules</span>
                <h2 className="text-base font-semibold text-ink leading-snug">Step 1: Give Your AI a Spending Allowance ($300 Max)</h2>
                <p data-subhead="true" className="text-xs text-ink-secondary leading-relaxed">
                  Lock a $300 spending cap, fair-price check, and 48-hour delivery rule
                </p>
              </div>
            </div>
            <span data-testid="mandate-status-badge" className="tx-chip tx-chip--paypal tabular-nums whitespace-nowrap !min-h-[28px] px-2.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              <span>Active · Ed25519</span>
              <span className="sr-only">{` ${signedMandate.status} `}</span>
            </span>
          </div>
        </Card.Header>

        <Card.Content className="p-0 flex flex-col gap-3.5">
          <div
            data-testid="mandate-judge-explainer"
            className="tx-well px-3.5 py-2.5 text-xs text-ink-secondary leading-relaxed"
          >
            <strong className="text-ink font-semibold">Plain-English Rulebook: </strong>
            Before your AI agent visits any online store, you set a hard $300.00 spending limit, block price markups over 15%, and require 48-hour carrier delivery.
          </div>

          <form
            onSubmit={(e) => void handleSignSubmit(e)}
            data-testid="kya-mandate-form"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
          >
            <label className="tx-well p-3 block space-y-1.5" data-testid="mandate-budget-input">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink tabular-nums">
                <DollarSign className="w-3.5 h-3.5 text-ink shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>AI Spending Allowance ({formatUsdInr(signedMandate.max_amount_cents)})</span>
              </span>
              <input
                type="number"
                step="1"
                value={budgetUsd}
                onChange={(e) => setBudgetUsd(e.target.value)}
                data-testid="input-mandate-budget"
                className="paypal-input h-9 w-full px-3 py-1.5 text-xs tabular-nums"
              />
              <span className="block text-[11px] text-ink-muted">$300 max per order without human approval</span>
            </label>
            <label className="tx-well p-3 block space-y-1.5" data-testid="mandate-spread-input">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink tabular-nums">
                <TrendingUp className="w-3.5 h-3.5 text-ink shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Max Channel3 Spread ({(maxSpreadBps / 100).toFixed(0)}% / {maxSpreadBps} bps)</span>
              </span>
              <input
                type="number"
                step="50"
                value={maxSpreadBps}
                aria-label={`Max Channel3 Spread (${(maxSpreadBps / 100).toFixed(0)}% / ${maxSpreadBps} bps)`}
                onChange={(e) => setMaxSpreadBps(Number(e.target.value))}
                data-testid="input-mandate-spread"
                className="paypal-input h-9 w-full px-3 py-1.5 text-xs tabular-nums"
              />
              <span className="block text-[11px] text-ink-muted">Max markup allowed above fair market price</span>
            </label>
            <label className="tx-well p-3 block space-y-1.5" data-testid="mandate-sla-input">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink tabular-nums">
                <Clock className="w-3.5 h-3.5 text-ink shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Delivery SLA Window ({slaHours}h)</span>
              </span>
              <input
                type="number"
                step="1"
                value={slaHours}
                aria-label={`Delivery SLA Window (${slaHours}h)`}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                data-testid="input-mandate-sla"
                className="paypal-input h-9 w-full px-3 py-1.5 text-xs tabular-nums"
              />
              <span className="block text-[11px] text-ink-muted">Auto-refund if carrier does not deliver in 48 hours</span>
            </label>
            <label className="tx-well p-3 block space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Tag className="w-3.5 h-3.5 text-ink shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Allowed store categories</span>
              </span>
              <input
                type="text"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                data-testid="input-mandate-categories"
                className="paypal-input h-9 w-full px-3 py-1.5 text-xs"
              />
              <span className="block text-[11px] text-ink-muted">Restricts AI agent to verified store categories</span>
            </label>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                <KeyRound className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
                <span className="text-ink-muted">Allowance Rule ID:</span>
                <code className="font-mono text-ink-secondary">{signedMandate.mandate_id}</code>
              </div>
              <button
                type="submit"
                disabled={signing}
                data-testid="btn-sign-mandate"
                className="btn-paypal-primary !min-h-[34px] h-8 px-4 py-1 text-xs font-semibold whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span data-testid="sign-mandate-btn">
                  {signing ? 'Locking $300 Allowance...' : 'Lock $300 Spending Allowance'}
                </span>
              </button>
            </div>
          </form>
        </Card.Content>
      </div>

      <Card.Footer className="p-0">
        <TechnicalProofDrawer
          title="Mandate Clearing Studio · Ed25519 & RFC 9421 Cryptographic Proof"
          buttonLabel="View Technical Proof"
          summaryBadge="128-hex Ed25519 + RFC 9421"
          open={sealExpanded}
          onToggle={setSealExpanded}
          testId="mandate-technical-proof-drawer"
          buttonTestId="btn-mandate-technical-proof"
        >
          <div
            data-testid="mandate-crypto-proof"
            className="tx-well p-3.5 space-y-2.5 text-xs text-ink-secondary"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-ink font-semibold">Mandate Clearing Studio · Ed25519 Hardware KYA Seal</div>
                <div className="font-mono text-[11px] text-ink-muted">Key ID: kya-agent-talos-01</div>
              </div>
              <span className="tx-chip font-semibold tabular-nums">
                CAP {formatUsdInr(signedMandate.max_amount_cents)}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-ink-muted shrink-0">Ed25519 public key</span>
                <code data-testid="mandate-pubkey-hex" className="text-ink-secondary break-all">
                  {signedMandate.ed25519_pubkey_hex}
                </code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-ink-muted shrink-0">Signature (128-hex)</span>
                <code data-testid="mandate-signature-hex" className="text-ink break-all">
                  <span data-testid="mandate-signature-hash">{signedMandate.ed25519_signature_hex}</span>
                </code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-ink-muted shrink-0">RFC 9421 input</span>
                <code data-testid="mandate-rfc9421-header" className="text-ink-muted break-all">
                  {signedMandate.rfc9421_signature_input}
                </code>
              </div>
            </div>
          </div>
        </TechnicalProofDrawer>
      </Card.Footer>
    </Card>
  );
}
