'use client';

import React, { useCallback, useMemo } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { useSimulatorRun } from '../../context/SimulatorRunContext';
import { useAgentRunPlayer } from '../../hooks/useAgentRunPlayer';
import { buildAgentRun } from '../../lib/sim/build-agent-run';
import type { AgentRun } from '../../lib/sim/run-types';
import { AgentBrowserPane } from './AgentBrowserPane';
import { HazardControls } from './HazardControls';
import { RunOutcomeBar } from './RunOutcomeBar';
import { ShoppingCartPanel } from './ShoppingCartPanel';
import { XRayEnginePane } from './XRayEnginePane';

/** Flagship split-screen demo: the agent shopping on the left, the TALOS engine on the right. */
export function LiveAgentSimulator() {
  const { hazards, mode, capUsd, recordOutcome } = useSimulatorRun();
  const run = useMemo(() => buildAgentRun(hazards, mode, capUsd), [hazards, mode, capUsd]);
  const onComplete = useCallback((r: AgentRun) => recordOutcome(r.outcome), [recordOutcome]);
  const player = useAgentRunPlayer(run, onComplete);
  const playing = player.state === 'playing';

  return (
    <div className="space-y-5" data-testid="live-agent-simulator" data-player-state={player.state} data-run-mode={mode}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {playing ? (
            <button type="button" onClick={player.pause} className="btn-paypal-primary" data-testid="sim-pause-btn">
              <Pause className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Pause
            </button>
          ) : (
            <button type="button" onClick={player.play} className="btn-paypal-primary" data-testid="sim-play-btn">
              <Play className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {player.state === 'paused' ? 'Resume' : player.state === 'done' ? 'Run again' : 'Start agent'}
            </button>
          )}
          <button type="button" onClick={player.replay} className="btn-paypal-secondary" data-testid="sim-replay-btn" disabled={player.state === 'idle'}>
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Replay
          </button>
          <button type="button" onClick={player.skipToEnd} className="btn-paypal-secondary" data-testid="sim-skip-btn" disabled={player.state === 'done'}>
            <SkipForward className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Skip to result
          </button>
        </div>
        <div className="flex items-center gap-3 min-w-[180px] flex-1 sm:flex-none sm:w-64">
          <div className="h-1.5 flex-1 rounded-xs bg-[var(--surface-well)] overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-xs bg-[#0070E0] origin-left transition-transform duration-300 motion-reduce:transition-none" style={{ transform: `scaleX(${player.progress})` }} />
          </div>
          <span className="text-xs text-ink-muted tx-num" data-testid="sim-step-counter">
            {Math.max(0, player.index + 1)} / {run.steps.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,0.9fr)] gap-5 items-start">
        <aside className="tx-card p-4 xl:sticky xl:top-20" aria-label="Simulation controls">
          <HazardControls disabled={playing} />
        </aside>

        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">On the surface</h2>
            <span className="text-xs text-ink-muted">What the agent sees and does</span>
          </div>
          <AgentBrowserPane run={run} step={player.step} />
          <ShoppingCartPanel lines={player.step?.cart ?? []} capUsd={capUsd} mode={mode} />
        </div>

        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">X-Ray</h2>
            <span className="text-xs text-ink-muted">What TALOS checks, live</span>
          </div>
          <XRayEnginePane run={run} index={player.index} />
        </div>
      </div>

      {player.state === 'done' ? <RunOutcomeBar outcome={run.outcome} /> : null}
    </div>
  );
}
