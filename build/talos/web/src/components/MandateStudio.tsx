'use client';

import React from 'react';
import { ChevronDown, KeyRound, ShieldCheck } from 'lucide-react';
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
    <section
      id="chapter-mandate"
      className="sovereign-card p-6 space-y-5"
      data-testid="mandate-studio"
      data-mandate-status={signedMandate.status}
      aria-label="Mandate Clearing Studio"
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Mandate Clearing Studio
          </h2>
          <span
            data-testid="mandate-status-badge"
            className="inline-flex items-center gap-2 text-xs text-ink-secondary font-medium tabular-nums whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
            <span>Ed25519 mandate active</span>
          </span>
        </div>
        <p data-subhead="true" className="text-xs text-ink-secondary">
          Issue Ed25519 cryptographic spending limits, Channel3 spread caps, and delivery SLAs
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSignSubmit(e)}
        data-testid="kya-mandate-form"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs"
      >
        <label className="block space-y-1.5" data-testid="mandate-budget-input">
          <span className="text-xs text-ink-secondary label-optical tabular-nums">
            Autonomous budget ceiling ({formatUsdInr(signedMandate.max_amount_cents)})
          </span>
          <input
            type="number"
            step="1"
            value={budgetUsd}
            onChange={(e) => setBudgetUsd(e.target.value)}
            data-testid="input-mandate-budget"
            className="sovereign-field w-full px-3 py-2.5 text-xs tabular-nums"
          />
        </label>
        <label className="block space-y-1.5" data-testid="mandate-spread-input">
          <span className="text-xs text-ink-secondary label-optical tabular-nums">
            Maximum Channel3 spread ({(maxSpreadBps / 100).toFixed(0)}% / {maxSpreadBps} bps)
          </span>
          <input
            type="number"
            step="50"
            value={maxSpreadBps}
            aria-label={`Max Channel3 Spread (${(maxSpreadBps / 100).toFixed(0)}% / ${maxSpreadBps} bps)`}
            onChange={(e) => setMaxSpreadBps(Number(e.target.value))}
            data-testid="input-mandate-spread"
            className="sovereign-field w-full px-3 py-2.5 text-xs tabular-nums"
          />
        </label>
        <label className="block space-y-1.5" data-testid="mandate-sla-input">
          <span className="text-xs text-ink-secondary label-optical tabular-nums">
            Delivery SLA window ({slaHours}h)
          </span>
          <input
            type="number"
            step="1"
            value={slaHours}
            aria-label={`Delivery SLA Window (${slaHours}h)`}
            onChange={(e) => setSlaHours(Number(e.target.value))}
            data-testid="input-mandate-sla"
            className="sovereign-field w-full px-3 py-2.5 text-xs tabular-nums"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-ink-secondary label-optical">
            Allowed merchant categories
          </span>
          <input
            type="text"
            value={categoriesInput}
            onChange={(e) => setCategoriesInput(e.target.value)}
            data-testid="input-mandate-categories"
            className="sovereign-field w-full px-3 py-2.5 text-xs"
          />
        </label>

        <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            <KeyRound className="w-4 h-4 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
            <span>Mandate UUID:</span>
            <code className="font-mono text-ink">{signedMandate.mandate_id}</code>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSealExpanded((v) => !v)}
              className="btn-sovereign-neutral min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.96]"
            >
              <span>Cryptographic seal</span>
              <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="submit"
              disabled={signing}
              data-testid="btn-sign-mandate"
              className="btn-paypal-primary specular-sweep-btn relative overflow-hidden min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.97]"
            >
              <span className="specular-sweep-sheen" aria-hidden="true" />
              <ShieldCheck className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              <span data-testid="sign-mandate-btn">
                {signing ? 'Signing Ed25519...' : 'Sign Ed25519 KYA Mandate'}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Expandable 0fr -> 1fr Cryptographic Proof Drawer */}
      <div
        className={`grid bento-drawer-transition ${sealExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-90'}`}
      >
        <div className="overflow-hidden">
          <div
            data-testid="mandate-crypto-proof"
            className="sovereign-subcard p-4 space-y-2 text-xs text-ink-secondary"
          >
            <div>
              <span className="text-ink-muted">Ed25519 public key: </span>
              <code data-testid="mandate-pubkey-hex" className="font-mono text-ink-emerald break-all">
                {signedMandate.ed25519_pubkey_hex}
              </code>
            </div>
            <div>
              <span className="text-ink-muted">Ed25519 signature hash (128-hex): </span>
              <code data-testid="mandate-signature-hex" className="font-mono text-ink-paypal break-all">
                <span data-testid="mandate-signature-hash">{signedMandate.ed25519_signature_hex}</span>
              </code>
            </div>
            <div>
              <span className="text-ink-muted">RFC 9421 Signature-Input: </span>
              <code data-testid="mandate-rfc9421-header" className="font-mono text-ink-amber break-all">
                {signedMandate.rfc9421_signature_input}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
