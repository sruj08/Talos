'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Compass, KeyRound, Layers, Play, ShieldAlert, Sparkles } from 'lucide-react';
import { DemoStepNumber, useTalosClearing } from '../context/TalosClearingContext';
import { GUIDED_DEMO_STEPS, executeGuidedDemoStepDomAction } from '../lib/guided-demo-steps';
import { navigateToRoute } from '../lib/navigation';

const STEP_MEDALLION_ICONS = [
  { Icon: KeyRound, medallion: 'icon-medallion-paypal' },
  { Icon: ShieldAlert, medallion: 'icon-medallion-crimson' },
  { Icon: CheckCircle2, medallion: 'icon-medallion-emerald' },
  { Icon: Clock, medallion: 'icon-medallion-amber' },
] as const;

export function GuidedDemoBanner() {
  const { demoViewMode, setDemoViewMode, activeDemoStep, setActiveDemoStep } = useTalosClearing();
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [autoPlaying, setAutoPlaying] = useState(false);

  const currentSpec = GUIDED_DEMO_STEPS.find((s) => s.step === activeDemoStep) || GUIDED_DEMO_STEPS[0];

  useEffect(() => {
    setCompletedSteps((prev) => (prev.includes(activeDemoStep) ? prev : [...prev, activeDemoStep]));
  }, [activeDemoStep]);

  const triggerStep = (stepNum: DemoStepNumber, shouldNavigate = true, cancelAutoPlay = true) => {
    if (cancelAutoPlay) setAutoPlaying(false);
    const spec = GUIDED_DEMO_STEPS.find((s) => s.step === stepNum) || GUIDED_DEMO_STEPS[0];
    setActiveDemoStep(stepNum);
    setCompletedSteps((prev) => (prev.includes(stepNum) ? prev : [...prev, stepNum]));
    executeGuidedDemoStepDomAction(spec, {
      navigate: shouldNavigate ? (href) => navigateToRoute(href) : undefined,
    });
  };

  useEffect(() => {
    if (!autoPlaying) return;
    const timer = window.setTimeout(() => {
      const nextStep = activeDemoStep < 4 ? ((activeDemoStep + 1) as DemoStepNumber) : null;
      if (nextStep) triggerStep(nextStep, false, false);
      else setAutoPlaying(false);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [autoPlaying, activeDemoStep]);

  const handleStartAutoPlay = () => {
    if (autoPlaying) { setAutoPlaying(false); return; }
    setAutoPlaying(true);
    triggerStep(1, false, false);
  };

  const handleNextStep = () => triggerStep((activeDemoStep < 4 ? activeDemoStep + 1 : 1) as DemoStepNumber, true, true);

  const handleSelectViewMode = (nextMode: 'COMMAND_CENTER' | 'STEP_GUIDE') => {
    setAutoPlaying(false);
    setDemoViewMode(nextMode);
    if (nextMode === 'STEP_GUIDE') {
      navigateToRoute('/story');
    } else {
      navigateToRoute('/command-center');
    }
  };

  return (
    <div className="space-y-5" data-testid="guided-demo-banner">
      {/* 3-Column Visual Orientation Strip */}
      <div
        data-testid="judge-orientation-strip"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
      >
        <div className="paypal-feature-card p-5 flex items-start gap-3.5">
          <span className="w-11 h-11 icon-medallion-crimson" aria-hidden="true">
            <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <div className="space-y-1 min-w-0">
            <div className="font-bold text-sm text-ink">The Problem: Blind AI Spending</div>
            <p className="text-ink-secondary leading-relaxed">
              Hacked websites hide invisible prompt injections or overcharge by +92% ($480 vs $249) when AI agents shop.
            </p>
          </div>
        </div>

        <div className="paypal-feature-card p-5 flex items-start gap-3.5">
          <span className="w-11 h-11 icon-medallion-paypal" aria-hidden="true">
            <Sparkles className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <div className="space-y-1 min-w-0">
            <div className="font-bold text-sm text-ink">The Solution: TALOS Security + Escrow Referee</div>
            <p className="text-ink-secondary leading-relaxed">
              Strips web attacks in &lt;4ms, verifies fair prices via Channel3, and holds funds in PayPal 2PC escrow until delivery.
            </p>
          </div>
        </div>

        <div className="paypal-feature-card p-5 flex items-start gap-3.5">
          <span className="w-11 h-11 icon-medallion-emerald" aria-hidden="true">
            <Compass className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <div className="space-y-1 min-w-0">
            <div className="font-bold text-sm text-ink">How to Experience the Demo</div>
            <p className="text-ink-secondary leading-relaxed">
              Click Steps 01 &rarr; 04 below to open each dedicated workspace page, or switch to Step-by-Step Guide Demo mode.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive 4-Step Judge Walkthrough Bar */}
      <div className="paypal-feature-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 icon-medallion-paypal" aria-hidden="true">
              <Play className="w-5 h-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="paypal-title-sm text-ink">
                Interactive 4-Step Judge Walkthrough
              </h2>
              <p className="paypal-caption text-ink-secondary">
                Click any step below to simulate the live transaction and open its dedicated module page
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="inline-flex items-center gap-1.5"
              data-testid="demo-view-mode-toggle"
              role="group"
              aria-label="Select layout mode"
            >
              <button
                type="button"
                onClick={() => handleSelectViewMode('COMMAND_CENTER')}
                data-testid="mode-command-center-btn"
                className={
                  demoViewMode === 'COMMAND_CENTER'
                    ? 'paypal-tab-pill-active px-3.5 py-2 text-xs inline-flex items-center gap-1.5'
                    : 'paypal-tab-pill px-3.5 py-2 text-xs inline-flex items-center gap-1.5'
                }
              >
                <Layers className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Full Command Center</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectViewMode('STEP_GUIDE')}
                data-testid="mode-step-guide-btn"
                className={
                  demoViewMode === 'STEP_GUIDE'
                    ? 'paypal-tab-pill-active px-3.5 py-2 text-xs inline-flex items-center gap-1.5'
                    : 'paypal-tab-pill px-3.5 py-2 text-xs inline-flex items-center gap-1.5'
                }
              >
                <Compass className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Step-by-Step Guide Demo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleStartAutoPlay}
              data-testid="guided-demo-autoplay-btn"
              data-autoplaying={autoPlaying}
              className="btn-paypal-primary h-10 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>{autoPlaying ? 'Stop Auto-Play' : 'Auto-Play 4-Step Demo'}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              data-testid="guided-demo-next-btn"
              className="btn-paypal-secondary h-10 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 4 Interactive Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUIDED_DEMO_STEPS.map((spec, idx) => {
            const isActive = activeDemoStep === spec.step;
            const isDone = completedSteps.includes(spec.step);
            const { Icon, medallion } = STEP_MEDALLION_ICONS[idx] || STEP_MEDALLION_ICONS[0];
            return (
              <div
                key={spec.step}
                data-testid={`guided-step-${spec.step}`}
                data-completed={isDone}
                className={`p-4 rounded-lg flex flex-col justify-between gap-3.5 text-xs transition-all ${
                  isActive ? 'tone-paypal' : 'sovereign-subcard'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`w-11 h-11 ${medallion}`} aria-hidden="true">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-secondary">
                      <span className={`w-1.5 h-1.5 rounded-xs ${spec.dotClass}`} aria-hidden="true" />
                      <span>{spec.badge}</span>
                    </span>
                  </div>
                  <div className="font-bold text-ink text-sm">{spec.title}</div>
                  <p className="text-ink-secondary leading-relaxed">{spec.plainSummary}</p>
                </div>

                <button
                  type="button"
                  onClick={() => triggerStep(spec.step, true, true)}
                  data-testid={`btn-guided-step-${spec.step}`}
                  className={`h-10 w-full inline-flex items-center justify-center gap-1.5 px-3 text-xs font-bold whitespace-nowrap ${
                    isActive ? 'btn-paypal-primary' : 'btn-paypal-secondary'
                  }`}
                >
                  <span>{spec.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>

        <div
          role="status"
          aria-live="polite"
          data-testid="guided-demo-outcome-banner"
          data-active-step={activeDemoStep}
          className="sovereign-subcard p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
        >
          <div className="space-y-1">
            <div className="font-bold text-sm text-ink">{currentSpec.outcomeBanner}</div>
            <div className="text-ink-secondary">{currentSpec.whatToLookAt}</div>
          </div>
          <span className="text-xs text-ink-muted tabular-nums shrink-0">
            Active Step: {activeDemoStep} / 4
          </span>
        </div>
      </div>
    </div>
  );
}
