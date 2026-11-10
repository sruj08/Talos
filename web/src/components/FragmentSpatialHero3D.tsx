'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Play,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export interface FragmentSpatialHero3DProps {
  activeStage?: number;
  simPlaying?: boolean;
  onStartSimulation?: () => void;
  onSelectStage?: (stageIndex: number) => void;
}

interface StageCueItem {
  index: number;
  label: string;
  metric: string;
  summary: string;
}

const STAGE_CUES: StageCueItem[] = [
  {
    index: 0,
    label: 'Stage 1: $300 Rule',
    metric: '$300.00 Max Cap',
    summary: 'Human sets a plain-English $300 PayPal spending allowance for the AI agent.',
  },
  {
    index: 1,
    label: 'Stage 2: $480 Scam Blocked',
    metric: '2.84ms Intercept',
    summary: 'Normal AI loses $480 to hidden trap; TALOS strips trap and buys for $249 (saves $231).',
  },
  {
    index: 2,
    label: 'Stage 3: $249 FedEx Escrow',
    metric: '26h / 48h Verified',
    summary: 'PayPal holds $249 safely until FedEx delivers on time; late orders refund in 0s.',
  },
  {
    index: 3,
    label: 'Stage 4: CFO Ledger',
    metric: '+$231.00 Saved',
    summary: 'Live transaction table, SLA timeline, and PayPal escrow float economics update immediately.',
  },
];

export function FragmentSpatialHero3D(
  props: FragmentSpatialHero3DProps
): React.JSX.Element {
  const {
    activeStage = 1,
    simPlaying = false,
    onStartSimulation,
    onSelectStage,
  } = props;

  const [selectedStage, setSelectedStage] = useState<number>(activeStage);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  const currentStageIndex =
    typeof props.activeStage === 'number' ? props.activeStage : selectedStage;
  const activeCue =
    STAGE_CUES[Math.max(0, Math.min(STAGE_CUES.length - 1, currentStageIndex))] ??
    STAGE_CUES[1];

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-yRatio * 7).toFixed(2)),
      ry: Number((xRatio * 9).toFixed(2)),
    });
  };

  const handlePointerLeave = () => setTilt({ rx: 0, ry: 0 });

  const handleStageSelect = (idx: number) => {
    setSelectedStage(idx);
    onSelectStage?.(idx);
  };

  return (
    <div
      data-testid="fragment-spatial-hero-3d"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="sovereign-pill">Interactive 3D clearinghouse stage</span>
        <span className="font-mono tabular-nums text-xs font-medium text-ink-emerald">
          {simPlaying ? '60s Live Simulation Active' : activeCue.metric}
        </span>
      </div>

      <div
        className="fragment-stage-obsidian relative overflow-hidden p-4 sm:p-5 rounded-lg"
        style={{
          transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="hero-artifact-img relative mx-auto max-w-full overflow-hidden">
          <img
            src="/assets/talos-fragment-shield-3d.svg"
            alt="TALOS 3D Spatial Shield intercepting $480 scam trap and locking $249 in PayPal Escrow"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div data-testid="spatial-shard-hostile-trap" className="tone-crimson p-3" style={{ transform: 'translateZ(16px)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-ink-crimson">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Scam Trap Blocked</span>
            </div>
            <p className="mt-2 font-mono tabular-nums text-sm font-medium text-ink">$480.00 Rejected</p>
            <p className="mt-1 text-xs text-ink-secondary">Normal AI loses $480 to hidden web text</p>
          </div>

          <div data-testid="spatial-shard-talos-shield" className="tone-paypal p-3" style={{ transform: 'translateZ(30px)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-ink-paypal">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>TALOS 3D Shield</span>
            </div>
            <p className="mt-2 font-mono tabular-nums text-sm font-medium text-ink">2.84ms Clean Scan</p>
            <p className="mt-1 text-xs text-ink-secondary">Enforces $300 allowance & fair market price</p>
          </div>

          <div data-testid="spatial-shard-paypal-vault" className="tone-emerald p-3" style={{ transform: 'translateZ(44px)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-ink-emerald">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>PayPal Escrow Vault</span>
            </div>
            <p className="mt-2 font-mono tabular-nums text-sm font-medium text-ink">$249.00 Held (+$231 Saved)</p>
            <p className="mt-1 text-xs text-ink-secondary">Paid to seller only after FedEx delivery</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2 text-xs text-ink-secondary max-w-[52ch]">
            <CheckCircle2 className="h-3.5 w-3.5 text-ink-emerald shrink-0 mt-0.5" aria-hidden="true" />
            <span>{activeCue.summary}</span>
          </div>
          {onStartSimulation ? (
            <button
              type="button"
              data-testid="spatial-hero-replay-btn"
              onClick={onStartSimulation}
              className="btn-paypal-secondary !min-h-[36px] !px-3 !py-2 !text-xs"
            >
              <Play className="h-3 w-3" aria-hidden="true" />
              <span>Run 60s Flow</span>
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STAGE_CUES.map((cue) => {
            const isSelected = cue.index === activeCue.index;
            return (
              <button
                key={cue.index}
                type="button"
                data-testid={`spatial-stage-cue-${cue.index + 1}`}
                onClick={() => handleStageSelect(cue.index)}
                className={isSelected ? 'paypal-tab-pill-active w-full justify-start' : 'paypal-tab-pill w-full justify-start'}
              >
                {cue.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
