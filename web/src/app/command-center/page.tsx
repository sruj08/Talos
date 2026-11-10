'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Layers, Play } from 'lucide-react';
import { MandateStudio } from '../../components/MandateStudio';
import { PoisonedStoreSim } from '../../components/PoisonedStoreSim';
import { AgStudioBlotter } from '../../components/AgStudioBlotter';
import { BryntumSlaBoard } from '../../components/BryntumSlaBoard';
import { PayPalStepUpModal } from '../../components/PayPalStepUpModal';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
  SovereignTopTelemetryBar,
} from '../../components/SovereignHeaderAndDock';
import { WorkspaceTabRail } from '../../components/WorkspaceTabRail';
import { DemoStepNumber, useTalosClearing } from '../../context/TalosClearingContext';
import { GUIDED_DEMO_STEPS, executeGuidedDemoStepDomAction } from '../../lib/guided-demo-steps';
import { navigateToRoute } from '../../lib/navigation';

const REVEAL_TRANSITION = {
  duration: 0.36,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function TALOSCommandCenterPage() {
  const {
    demoViewMode,
    setDemoViewMode,
    activeDemoStep,
    setActiveDemoStep,
    workspaceTab,
    setWorkspaceTab,
  } = useTalosClearing();
  const isStepGuide = demoViewMode === 'STEP_GUIDE';
  const currentSpec = GUIDED_DEMO_STEPS.find((s) => s.step === activeDemoStep) || GUIDED_DEMO_STEPS[0];

  const showMandate =
    (!isStepGuide || activeDemoStep === 1) &&
    (workspaceTab === 'ALL' || workspaceTab === 'ALLOWANCE');
  const showSimulator =
    (!isStepGuide || activeDemoStep === 2 || activeDemoStep === 3) &&
    (workspaceTab === 'ALL' || workspaceTab === 'SIMULATOR');
  const showBlotter =
    (!isStepGuide || activeDemoStep === 2 || activeDemoStep === 3) &&
    (workspaceTab === 'ALL' || workspaceTab === 'BLOTTER');
  const showSla =
    (!isStepGuide || activeDemoStep === 3 || activeDemoStep === 4) &&
    (workspaceTab === 'ALL' || workspaceTab === 'SLA');
  const showStepUp =
    (!isStepGuide || activeDemoStep === 4) &&
    (workspaceTab === 'ALL' || workspaceTab === 'STEP_UP');
  const showOperatorHeader = workspaceTab === 'ALL' || workspaceTab === 'BLOTTER';

  const goToWizardStep = (step: DemoStepNumber) => {
    setWorkspaceTab('ALL');
    setActiveDemoStep(step);
    const spec = GUIDED_DEMO_STEPS.find((s) => s.step === step) || GUIDED_DEMO_STEPS[0];
    executeGuidedDemoStepDomAction(spec, { navigate: (href) => navigateToRoute(href) });
  };

  return (
    <div
      className="min-h-screen sovereign-canvas"
      data-testid="talos-command-center"
      data-demo-view-mode={demoViewMode}
      data-workspace-tab={workspaceTab}
    >
      <SovereignTopNavBar />

      <div id="operator-command-center" className={showOperatorHeader ? '' : 'hidden'}>
        <SovereignTopTelemetryBar />
      </div>

      <main className="mx-auto max-w-[1360px] px-4 sm:px-6 py-8 pb-24 flex flex-col gap-10">
        <WorkspaceTabRail />

        {/* Strict Causal Order: Module 01 (MandateStudio Left) -> Module 02 (PoisonedStoreSim Right) */}
        <div
          className={
            isStepGuide
              ? 'grid grid-cols-1 gap-8 items-start'
              : 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
          }
        >
          <motion.div
            id="chapter-mandates"
            className={`lg:col-span-5 ${showMandate ? '' : 'hidden'}`}
            initial={{ opacity: 0.94, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={REVEAL_TRANSITION}
          >
            <MandateStudio />
          </motion.div>
          <motion.div
            id="chapter-simulator"
            className={`lg:col-span-7 ${showSimulator ? '' : 'hidden'}`}
            initial={{ opacity: 0.94, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ ...REVEAL_TRANSITION, delay: 0.05 }}
          >
            <PoisonedStoreSim />
          </motion.div>
        </div>

        {isStepGuide ? (
          <div data-testid="step-by-step-wizard-card" className="tone-paypal p-5 flex flex-col gap-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="font-mono text-xs text-ink-secondary">
                  Step-by-Step Judge Guide · Step {activeDemoStep} of 4 ({currentSpec.badge})
                </div>
                <h2 className="text-base font-bold text-ink">{currentSpec.title}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={activeDemoStep === 1}
                  onClick={() => goToWizardStep((activeDemoStep - 1) as DemoStepNumber)}
                  data-testid="wizard-prev-step-btn"
                  className="btn-paypal-secondary h-9 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold disabled:opacity-40 whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                  <span>Previous Step</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToWizardStep(activeDemoStep)}
                  data-testid="wizard-simulate-step-btn"
                  className="btn-paypal-primary h-9 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                  <span>{currentSpec.ctaLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    activeDemoStep < 4
                      ? goToWizardStep((activeDemoStep + 1) as DemoStepNumber)
                      : setDemoViewMode('COMMAND_CENTER')
                  }
                  data-testid="wizard-next-step-btn"
                  className="btn-paypal-secondary h-9 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold whitespace-nowrap"
                >
                  <span>{activeDemoStep < 4 ? 'Next Step' : 'Finish & View All Modules'}</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDemoViewMode('COMMAND_CENTER')}
                  data-testid="wizard-show-all-btn"
                  className="btn-paypal-secondary h-9 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                  <span>Show All 5 Modules</span>
                </button>
              </div>
            </div>
            <p className="text-ink-secondary leading-relaxed">{currentSpec.whatToLookAt}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1" role="group" aria-label="Jump to wizard step">
              {GUIDED_DEMO_STEPS.map((spec) => (
                <button
                  key={spec.step}
                  type="button"
                  onClick={() => goToWizardStep(spec.step)}
                  data-testid={`wizard-step-pill-${spec.step}`}
                  className={`h-8 inline-flex items-center gap-1.5 px-3 text-xs rounded-pill transition-colors whitespace-nowrap ${
                    activeDemoStep === spec.step
                      ? 'btn-paypal-primary font-bold'
                      : 'btn-paypal-secondary text-ink-secondary'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-xs ${spec.dotClass}`} aria-hidden="true" />
                  <span>Step 0{spec.step}: {spec.title}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <motion.div
          id="chapter-blotter"
          className={showBlotter ? '' : 'hidden'}
          initial={{ opacity: 0.94, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={REVEAL_TRANSITION}
        >
          <AgStudioBlotter />
        </motion.div>

        <motion.div
          id="chapter-sla"
          className={showSla ? '' : 'hidden'}
          initial={{ opacity: 0.94, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={REVEAL_TRANSITION}
        >
          <BryntumSlaBoard />
        </motion.div>

        <motion.div
          className={showStepUp ? '' : 'hidden'}
          initial={{ opacity: 0.94, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={REVEAL_TRANSITION}
        >
          <PayPalStepUpModal />
        </motion.div>
      </main>

      <SovereignStoryChapterDock />
    </div>
  );
}
