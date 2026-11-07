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
      className="sovereign-card p-6 space-y-6 h-full flex flex-col justify-between"
      data-testid="mandate-studio"
      data-mandate-status={signedMandate.status}
      aria-label="Mandate Clearing Studio"
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs text-ink-muted">01</span>
              <h2 className="text-lg font-medium text-ink">
                Mandate Clearing Studio
              </h2>
            </div>
            <span
              data-testid="mandate-status-badge"
              className="inline-flex items-center gap-2 font-mono text-xs text-ink-secondary tabular-nums whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              <span>{signedMandate.status}</span>
            </span>
          </div>
          <p data-subhead="true" className="text-xs text-ink-secondary">
            Issue Ed25519 cryptographic spending limits, Channel3 spread caps, and delivery SLAs
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSignSubmit(e)}
          data-testid="kya-mandate-form"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
        >
          <label className="block space-y-2" data-testid="mandate-budget-input">
            <span className="text-xs text-ink-secondary tabular-nums">
              Autonomous budget ceiling ({formatUsdInr(signedMandate.max_amount_cents)})
            </span>
            <input
              type="number"
              step="1"
              value={budgetUsd}
              onChange={(e) => setBudgetUsd(e.target.value)}
              data-testid="input-mandate-budget"
              className="sovereign-field h-10 w-full px-3 py-2 text-xs tabular-nums"
            />
          </label>
          <label className="block space-y-2" data-testid="mandate-spread-input">
            <span className="text-xs text-ink-secondary tabular-nums">
              Max Channel3 Spread ({(maxSpreadBps / 100).toFixed(0)}% / {maxSpreadBps} bps)
            </span>
            <input
              type="number"
              step="50"
              value={maxSpreadBps}
              aria-label={`Max Channel3 Spread (${(maxSpreadBps / 100).toFixed(0)}% / ${maxSpreadBps} bps)`}
              onChange={(e) => setMaxSpreadBps(Number(e.target.value))}
              data-testid="input-mandate-spread"
              className="sovereign-field h-10 w-full px-3 py-2 text-xs tabular-nums"
            />
          </label>
          <label className="block space-y-2" data-testid="mandate-sla-input">
            <span className="text-xs text-ink-secondary tabular-nums">
              Delivery SLA Window ({slaHours}h)
            </span>
            <input
              type="number"
              step="1"
              value={slaHours}
              aria-label={`Delivery SLA Window (${slaHours}h)`}
              onChange={(e) => setSlaHours(Number(e.target.value))}
              data-testid="input-mandate-sla"
              className="sovereign-field h-10 w-full px-3 py-2 text-xs tabular-nums"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-ink-secondary">
              Allowed merchant categories
            </span>
            <input
              type="text"
              value={categoriesInput}
              onChange={(e) => setCategoriesInput(e.target.value)}
              data-testid="input-mandate-categories"
              className="sovereign-field h-10 w-full px-3 py-2 text-xs"
            />
          </label>

          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-ink-secondary">
              <KeyRound className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              <span className="text-ink-muted">Mandate UUID</span>
              <code className="font-mono text-ink-secondary">{signedMandate.mandate_id}</code>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSealExpanded((v) => !v)}
                className="btn-sovereign-neutral h-10 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
              >
                <span>Cryptographic seal</span>
                <ChevronDown className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="submit"
                disabled={signing}
                data-testid="btn-sign-mandate"
                className="btn-paypal-primary h-10 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                <span data-testid="sign-mandate-btn">
                  {signing ? 'Signing Ed25519...' : 'Sign Ed25519 KYA Mandate'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tactile Ed25519 Hardware Instrument Moment */}
      <div
        className={`grid bento-drawer-transition ${sealExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-90'}`}
      >
        <div className="overflow-hidden">
          <div
            data-testid="mandate-crypto-proof"
            className="sovereign-well p-4 space-y-3 text-xs text-ink-secondary"
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                {/* Hardware Security Module Contact Pad */}
                <span
                  aria-hidden="true"
                  className="inline-grid grid-cols-2 gap-0.5 p-1 rounded-xs sovereign-subcard w-7 h-5"
                >
                  <span className="rounded-[1px] bar-track" />
                  <span className="rounded-[1px] bar-track" />
                  <span className="rounded-[1px] bar-track" />
                  <span className="rounded-[1px] bar-track" />
                </span>
                <div>
                  <div className="font-mono text-[11px] text-ink font-medium">ED25519 HARDWARE KYA SEAL</div>
                  <div className="font-mono text-[11px] text-ink-muted">Key ID: kya-agent-talos-01</div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-ink-paypal tabular-nums">
                CAP {formatUsdInr(signedMandate.max_amount_cents)}
              </span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
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
        </div>
      </div>
    </section>
  );
}
