'use client';

import React from 'react';
import { CheckCircle2, CircleDashed, Gauge, KeyRound, Landmark, Loader2, PauseCircle, ScanSearch, Truck, XCircle } from 'lucide-react';
import { SCENARIO_PRESETS } from '../../hooks/usePoisonedStoreSim';
import { CATALOG, inflatedAskUsd } from '../../lib/sim/storefront-catalog';
import type { AgentRun, LayerStatus, LayerUpdate, XRayLayerId } from '../../lib/sim/run-types';
import { AllowancePassport, CarrierSla, DomScanSnippet, EscrowVault, PriceRadar } from './XRayVisuals';
import { TalosLogoMark } from '../brand/TalosLogoMark';

const LAYERS: Array<{ id: XRayLayerId; title: string; budget: string; icon: typeof KeyRound }> = [
  { id: 'ALLOWANCE', title: 'Allowance passport', budget: '<1ms', icon: KeyRound },
  { id: 'DOM_SCAN', title: 'Webpage trap scanner', budget: '<4ms', icon: ScanSearch },
  { id: 'PRICE_RADAR', title: 'Channel3 price radar', budget: 'live', icon: Gauge },
  { id: 'ESCROW_VAULT', title: 'PayPal escrow vault', budget: '29 days', icon: Landmark },
  { id: 'CARRIER_SLA', title: 'Delivery referee', budget: '48h SLA', icon: Truck },
];

const STATUS_LABEL: Record<LayerStatus, string> = {
  idle: 'Waiting',
  scanning: 'Checking',
  pass: 'Passed',
  blocked: 'Blocked',
  paused: 'Needs approval',
  bypassed: 'Not protected',
  held: 'Holding funds',
  released: 'Paid seller',
  refunded: 'Refunded',
};

function StatusIcon({ status }: { status: LayerStatus }) {
  const cls = 'h-3.5 w-3.5 shrink-0';
  if (status === 'scanning') return <Loader2 className={`${cls} text-ink motion-safe:animate-spin`} strokeWidth={1.75} aria-hidden="true" />;
  if (status === 'blocked' || status === 'bypassed') return <XCircle className={`${cls} text-ink-secondary`} strokeWidth={1.75} aria-hidden="true" />;
  if (status === 'paused' || status === 'held') return <PauseCircle className={`${cls} text-ink-secondary`} strokeWidth={1.75} aria-hidden="true" />;
  if (status === 'idle') return <CircleDashed className={`${cls} text-ink-muted`} strokeWidth={1.75} aria-hidden="true" />;
  return <CheckCircle2 className={`${cls} text-ink`} strokeWidth={1.75} aria-hidden="true" />;
}

export function XRayEnginePane({ run, index }: { run: AgentRun; index: number }) {
  const state = new Map<XRayLayerId, LayerUpdate>();
  for (let i = 0; i <= index && i < run.steps.length; i++) {
    const u = run.steps[i].layer;
    if (u) state.set(u.id, u);
  }
  const step = index >= 0 ? run.steps[index] : null;
  const median = CATALOG[run.primarySku].medianUsd;
  const ask = run.hazards.inflatePrice ? inflatedAskUsd(median) : median;
  const cartUsd = (step?.cart ?? []).reduce((a, l) => a + l.priceUsd, 0);
  const sla = state.get('CARRIER_SLA');
  const slaHours = sla ? (sla.status === 'scanning' ? 12 : run.hazards.delayCarrier ? 56 : 26) : 0;
  const vault = state.get('ESCROW_VAULT');

  return (
    <section className="surface-xray rounded-[16px] p-4 sm:p-5 space-y-3 h-full" data-testid="xray-engine-pane" aria-label="Behind the scenes X-Ray engine">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <TalosLogoMark size={20} />
          Behind the scenes
        </h3>
        <span className={`tx-chip ${run.mode === 'PROTECTED' ? 'tx-chip--emerald' : 'tx-chip--crimson'}`}>
          {run.mode === 'PROTECTED' ? 'TALOS engine on' : 'No protection layer'}
        </span>
      </div>

      <ol className="space-y-2.5">
        {LAYERS.map((layer) => {
          const u = state.get(layer.id);
          const status: LayerStatus = u?.status ?? 'idle';
          const Icon = layer.icon;
          return (
            <li key={layer.id} className="xray-row space-y-2.5" data-status={status} data-testid={`xray-layer-${layer.id.toLowerCase()}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Icon className="h-4 w-4 mt-0.5 text-ink-secondary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{layer.title}</p>
                    <p className="text-xs text-ink-secondary truncate">{u?.note ?? `Budget ${layer.budget}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-ink tx-num">{u?.metric ?? ''}</span>
                  <StatusIcon status={status} />
                  <span className="sr-only">{STATUS_LABEL[status]}</span>
                </div>
              </div>
              {layer.id === 'ALLOWANCE' && u ? <AllowancePassport capUsd={run.capUsd} cartUsd={cartUsd} status={status} /> : null}
              {layer.id === 'DOM_SCAN' && u ? (
                <DomScanSnippet injected={run.hazards.injectOverride} stripped={status === 'blocked'} scanning={status === 'scanning'} priceUsd={ask} />
              ) : null}
              {layer.id === 'PRICE_RADAR' && u && status !== 'bypassed' ? <PriceRadar askUsd={ask} medianUsd={median} active={status !== 'scanning'} /> : null}
              {layer.id === 'ESCROW_VAULT' && vault ? <EscrowVault amountUsd={Number(vault.metric.replace(/[^0-9.]/g, '')) || median} status={status} /> : null}
              {layer.id === 'CARRIER_SLA' && u ? <CarrierSla hoursElapsed={slaHours} status={status} /> : null}
            </li>
          );
        })}
      </ol>

      {run.hazards.injectOverride ? (
        <details className="rounded-md border border-[var(--border)] px-3 py-2 text-xs" data-testid="xray-raw-html-diff">
          <summary className="cursor-pointer text-ink-secondary min-h-[32px] flex items-center">Inspect raw HTML diff</summary>
          <div className="mt-2 space-y-2 font-mono text-[11px] leading-relaxed break-all">
            <p className="text-ink-crimson">- {SCENARIO_PRESETS.ACT_1.rawHtmlExcerpt}</p>
            <p className="text-ink-emerald">+ {SCENARIO_PRESETS.ACT_1.sanitizedHtmlExcerpt}</p>
          </div>
        </details>
      ) : null}
    </section>
  );
}
