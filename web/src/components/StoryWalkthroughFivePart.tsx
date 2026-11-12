'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code2,
  Compass,
  Lock,
  Play,
  ScanEye,
  ShieldAlert,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { GUIDED_DEMO_STEPS, executeGuidedDemoStepDomAction } from '../lib/guided-demo-steps';
import { navigateToRoute } from '../lib/navigation';
import { FIVE_PART_STORY_STAGES, StoryStageSpec } from '../lib/storytelling-parts';

export interface StoryWalkthroughFivePartProps {
  onSimulateStage?: (stage: StoryStageSpec) => void;
}

const STAGE_ICONS = [Wallet, Code2, ShieldAlert, ScanEye, CheckCircle2] as const;

const STAGE_ROUTES: Record<number, string> = {
  1: '/mandates',
  2: '/simulator',
  3: '/simulator',
  4: '/blotter',
  5: '/sla',
};

const ACTION_TO_STEP: Record<StoryStageSpec['actionType'], 1 | 2 | 3 | 4> = {
  SIGN_MANDATE: 1,
  ACT_1: 2,
  ACT_2: 3,
  ACT_3: 4,
};

export function StoryWalkthroughFivePart({ onSimulateStage }: StoryWalkthroughFivePartProps) {
  const [activeStageNumber, setActiveStageNumber] = useState<1 | 2 | 3 | 4 | 5>(1);

  const activeStage =
    FIVE_PART_STORY_STAGES.find((s) => s.stageNumber === activeStageNumber) ||
    FIVE_PART_STORY_STAGES[0];
  const ActiveStageIcon = STAGE_ICONS[activeStageNumber - 1] || Wallet;

  const triggerLiveStageAction = (stage: StoryStageSpec) => {
    setActiveStageNumber(stage.stageNumber);
    onSimulateStage?.(stage);
    const stepNum = ACTION_TO_STEP[stage.actionType];
    const spec = GUIDED_DEMO_STEPS.find((s) => s.step === stepNum);
    if (spec) {
      executeGuidedDemoStepDomAction(spec);
    }
    const targetRoute = STAGE_ROUTES[stage.stageNumber] || '/simulator';
    navigateToRoute(targetRoute);
  };

  const handlePrevStage = () => {
    const prev = (activeStageNumber > 1 ? activeStageNumber - 1 : 5) as 1 | 2 | 3 | 4 | 5;
    setActiveStageNumber(prev);
  };

  const handleNextStage = () => {
    const next = (activeStageNumber < 5 ? activeStageNumber + 1 : 1) as 1 | 2 | 3 | 4 | 5;
    setActiveStageNumber(next);
  };

  return (
    <section
      data-testid="storytelling-walkthrough-5part"
      data-active-story-stage={activeStageNumber}
      aria-label="Five-Part Real-World Storytelling Walkthrough"
      className="py-6 flex flex-col gap-6"
    >
      {/* Header & Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="w-11 h-11 icon-medallion-paypal" aria-hidden="true">
            <Compass className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <div className="flex flex-col gap-0.5">
            <h2 className="paypal-title-md text-ink">
              Real-World AI Shopping Story in Five Visual Stages
            </h2>
            <p data-subhead="true" className="paypal-body-sm text-ink-secondary">
              Follow how an everyday AI purchase gets attacked and how TALOS intervenes
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-testid="story-prev-btn"
            onClick={handlePrevStage}
            className="btn-paypal-secondary h-10 inline-flex items-center gap-1.5 px-4 text-xs font-bold whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Previous Stage</span>
          </button>
          <span className="text-xs text-ink-secondary tabular-nums px-2">
            Stage 0{activeStageNumber} of 05
          </span>
          <button
            type="button"
            data-testid="story-next-btn"
            onClick={handleNextStage}
            className="btn-paypal-secondary h-10 inline-flex items-center gap-1.5 px-4 text-xs font-bold whitespace-nowrap"
          >
            <span>Next Stage</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 5 Visual Icon Stepper Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" role="tablist" aria-label="Five-part story stages">
        {FIVE_PART_STORY_STAGES.map((stage, idx) => {
          const isSelected = stage.stageNumber === activeStageNumber;
          const StageIcon = STAGE_ICONS[idx] || Wallet;
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-testid={stage.id}
              onClick={() => setActiveStageNumber(stage.stageNumber)}
              className={`p-5 rounded-lg text-left flex flex-col justify-between gap-3 transition-[transform,background-color,border-color,color] ${
                isSelected ? `${stage.toneClass} font-bold shadow-sm` : 'paypal-feature-card text-ink-secondary'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`w-12 h-12 ${stage.medallionClass}`} aria-hidden="true">
                  <StageIcon className="w-6 h-6" strokeWidth={1.75} />
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary tabular-nums">
                  <span className={`w-1.5 h-1.5 rounded-xs ${stage.dotClass}`} aria-hidden="true" />
                  <span>0{stage.stageNumber}</span>
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-bold text-ink leading-snug">{stage.shortLabel}</div>
                <div className="text-xs text-ink-secondary line-clamp-1">{stage.questionAnswered}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Visual Showcase */}
      <div
        data-testid="story-active-stage-detail"
        className="paypal-feature-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
      >
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <span className={`w-12 h-12 ${activeStage.medallionClass}`} aria-hidden="true">
                <ActiveStageIcon className="w-6 h-6" strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="inline-flex items-center gap-2 text-xs text-ink-secondary">
                  <span className={`w-1.5 h-1.5 rounded-xs ${activeStage.dotClass}`} aria-hidden="true" />
                  <span>{activeStage.badge}</span>
                  <span>·</span>
                  <span>{activeStage.questionAnswered}</span>
                </div>
                <h3 className="paypal-title-sm text-ink">{activeStage.title}</h3>
              </div>
            </div>

            <button
              type="button"
              data-testid="story-stage-simulate-btn"
              onClick={() => triggerLiveStageAction(activeStage)}
              className="btn-paypal-primary min-h-11 max-w-full inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-left sm:whitespace-nowrap"
            >
              <Play className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>{activeStage.ctaLabel}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <p className="paypal-body text-ink-secondary">{activeStage.plainNarrative}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sovereign-subcard p-4 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 font-bold text-ink">
                <span className="w-8 h-8 icon-medallion-paypal" aria-hidden="true">
                  <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <span>Human Buyer View</span>
              </div>
              <p className="text-ink-secondary leading-relaxed">{activeStage.buyerPerspective}</p>
            </div>

            <div className="sovereign-subcard p-4 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 font-bold text-ink">
                <span className="w-8 h-8 icon-medallion-amber" aria-hidden="true">
                  <ScanEye className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <span>Under the Hood</span>
              </div>
              <p className="text-ink-secondary leading-relaxed">{activeStage.underTheHood}</p>
            </div>

            <div className="sovereign-subcard p-4 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 font-bold text-ink">
                <span className={`w-8 h-8 ${activeStage.medallionClass}`} aria-hidden="true">
                  <Lock className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <span>Wallet Outcome</span>
              </div>
              <p className="text-ink tabular-nums leading-relaxed">
                {activeStage.financialConsequence}
              </p>
            </div>
          </div>
        </div>

        {/* Visual 3D Escrow & Security Pipeline Illustration */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="relative h-56 sm:h-64 w-full rounded-lg overflow-hidden sovereign-well">
            <img
              src="/assets/talos-escrow-visual.png"
              alt="TALOS Security Gate inspecting storefront card, PayPal Escrow Vault Sphere, and Verified Delivery Parcel"
              className="w-full h-full object-cover object-center hero-artifact-img"
            />
            <div className="absolute inset-x-3 bottom-3 sovereign-glass px-3.5 py-2.5 rounded-pill flex items-center justify-between gap-2 text-xs tabular-nums">
              <span className="text-ink font-bold">{activeStage.shortLabel}</span>
              <span className="text-ink-paypal">{activeStage.financialConsequence.split('·')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
