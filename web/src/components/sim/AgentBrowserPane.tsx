'use client';

import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Lock, PackageCheck, RotateCw, ShieldAlert } from 'lucide-react';
import { CATALOG, STOREFRONTS, inflatedAskUsd } from '../../lib/sim/storefront-catalog';
import type { AgentRun, RunStep } from '../../lib/sim/run-types';
import { AgentCursor } from './AgentCursor';
import { StorefrontProductCard } from './StorefrontProductCard';

interface AgentBrowserPaneProps {
  run: AgentRun;
  step: RunStep | null;
}

export function AgentBrowserPane({ run, step }: AgentBrowserPaneProps) {
  const paneRef = useRef<HTMLDivElement>(null);
  const storeId = step?.store ?? (run.hazards.injectOverride || run.hazards.inflatePrice ? 'shadowgear' : 'audiopro');
  const store = STOREFRONTS[storeId];
  const sku = run.primarySku;
  const median = CATALOG[sku].medianUsd;
  const primaryPrice = storeId === 'shadowgear' && run.hazards.inflatePrice ? inflatedAskUsd(median) : median;
  const cart = step?.cart ?? [];
  const focus = step?.cursor ?? null;
  const injectionOn = run.hazards.injectOverride && storeId === 'shadowgear';
  const injectionVisible = step ? step.injectionVisible : run.hazards.injectOverride;
  const injection = injectionOn ? (injectionVisible ? 'visible' : 'stripped') : null;
  const verified = store.trust === 'VERIFIED';

  return (
    <div className="sim-browser" data-testid="agent-browser-pane" ref={paneRef}>
      <div className="sim-browser-bar">
        <div className="hidden sm:flex items-center gap-2 text-ink-muted" aria-hidden="true">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          <RotateCw className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className={`sim-url ${focus === 'url' ? 'sim-target-active' : ''}`} data-cursor-target="url" data-testid="agent-browser-url">
          <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span className="truncate">{store.url}</span>
        </div>
        <span className={`tx-chip ${verified ? 'tx-chip--emerald' : 'tx-chip--crimson'}`} data-testid="agent-browser-trust">
          {verified ? <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> : <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />}
          <span className="hidden sm:inline">{store.trustLabel}</span>
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">{store.name}</h3>
          <span className="text-xs text-ink-muted">{store.shipping}</span>
        </div>

        <div className={`grid gap-4 ${run.hazards.overCapItem ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'}`}>
          <StorefrontProductCard
            sku={sku}
            priceUsd={primaryPrice}
            cursorKey="primary"
            focus={focus}
            inCart={cart.some((l) => l.sku === sku)}
            injection={injection}
          />
          {run.hazards.overCapItem ? (
            <StorefrontProductCard
              sku="genelec"
              priceUsd={CATALOG.genelec.medianUsd}
              cursorKey="genelec"
              focus={focus}
              inCart={cart.some((l) => l.sku === 'genelec')}
              overCap
            />
          ) : (
            <div className="hidden sm:flex tx-well p-4 flex-col justify-center gap-2" aria-hidden="true">
              <p className="text-sm font-medium text-ink">Agent brief</p>
              <p className="text-sm text-ink-secondary">Buy one {CATALOG[sku].shortTitle} under the ${run.capUsd} allowance, delivered within 48 hours.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div
            data-cursor-target="checkout"
            className={`btn-checkout-yellow flex-1 !text-sm font-semibold pointer-events-none ${focus === 'checkout' ? 'sim-target-active' : ''}`}
            aria-hidden="true"
          >
            {run.mode === 'PROTECTED' ? 'Checkout with PayPal Escrow' : 'Pay seller directly'}
          </div>
          <div
            data-cursor-target="tracker"
            className={`flex-1 tx-well px-4 py-2.5 flex items-center gap-2 text-sm text-ink-secondary ${focus === 'tracker' ? 'sim-target-active' : ''}`}
          >
            <PackageCheck className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>{focus === 'tracker' ? 'FedEx shipment tracking' : 'Shipment not started'}</span>
          </div>
        </div>
      </div>

      <AgentCursor paneRef={paneRef} target={step?.cursor ?? null} status={step?.status ?? null} tone={step?.tone ?? 'neutral'} />
      <p className="sr-only" aria-live="polite" data-testid="agent-live-status">{step?.status ?? 'Agent idle'}</p>
    </div>
  );
}
