'use client';

import React from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import {
  GUIDED_SCENARIOS,
  GuidedScenarioId,
  HAZARD_LABELS,
  HazardKey,
  matchGuidedScenario,
} from '../../lib/sim/run-types';
import { useSimulatorRun } from '../../context/SimulatorRunContext';

const HAZARD_ORDER: HazardKey[] = ['injectOverride', 'inflatePrice', 'delayCarrier', 'overCapItem'];

export function HazardControls({ disabled }: { disabled?: boolean }) {
  const { hazards, mode, setMode, toggleHazard, applyScenario } = useSimulatorRun();
  const activeScenario = matchGuidedScenario(hazards);

  return (
    <div className="space-y-3.5" data-testid="sim-hazard-controls">
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-ink">Who is shopping?</h3>
        <div className="grid grid-cols-2 xl:grid-cols-1 gap-1.5" role="radiogroup" aria-label="Agent protection mode">
          {(['UNPROTECTED', 'PROTECTED'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              disabled={disabled}
              onClick={() => setMode(m)}
              data-testid={`sim-mode-${m.toLowerCase()}`}
              className={`tx-toggle !justify-start disabled:opacity-60 ${mode === m ? '!border-[var(--border-strong)] !bg-[var(--surface-well)]' : ''}`}
            >
              {m === 'PROTECTED' ? (
                <ShieldCheck className="h-4 w-4 text-ink shrink-0" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <ShieldOff className="h-4 w-4 text-ink-secondary shrink-0" strokeWidth={1.75} aria-hidden="true" />
              )}
              <span className="font-medium text-xs sm:text-sm">{m === 'PROTECTED' ? 'TALOS + PayPal' : 'Unprotected AI'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-ink">Guided scenarios</h3>
        <div className="grid gap-1.5" role="radiogroup" aria-label="Guided scenario">
          {(Object.keys(GUIDED_SCENARIOS) as GuidedScenarioId[]).map((id) => {
            const s = GUIDED_SCENARIOS[id];
            const selected = activeScenario === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => applyScenario(id)}
                data-testid={`sim-scenario-${id.toLowerCase()}`}
                className={`tx-toggle flex-col !items-start gap-0.5 disabled:opacity-60 ${selected ? '!border-[var(--border-strong)] !bg-[var(--surface-well)]' : ''}`}
              >
                <span className="font-medium text-xs sm:text-sm text-ink">{s.label}</span>
                <span className="text-[11px] text-ink-secondary tx-num">{s.summary}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-ink">Try to break it</h3>
        <div className="grid gap-1.5">
          {HAZARD_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={hazards[key]}
              disabled={disabled}
              onClick={() => toggleHazard(key)}
              data-testid={`sim-hazard-${key}`}
              className="tx-toggle disabled:opacity-60"
            >
              <span className="text-xs sm:text-sm">{HAZARD_LABELS[key]}</span>
              <span className="tx-switch" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
