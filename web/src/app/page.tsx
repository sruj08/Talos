'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MandateStudio } from '../components/MandateStudio';
import { PoisonedStoreSim } from '../components/PoisonedStoreSim';
import { AgStudioBlotter } from '../components/AgStudioBlotter';
import { BryntumSlaBoard } from '../components/BryntumSlaBoard';
import { PayPalStepUpModal } from '../components/PayPalStepUpModal';
import {
  SovereignStoryChapterDock,
  SovereignTopTelemetryBar,
} from '../components/SovereignHeaderAndDock';

const REVEAL_TRANSITION = {
  duration: 0.36,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function TALOSCommandCenterPage() {
  return (
    <div className="min-h-screen sovereign-canvas" data-testid="talos-command-center">
      <SovereignTopTelemetryBar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 pb-24 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <motion.div
            id="chapter-mandates"
            className="scroll-mt-20"
            initial={{ opacity: 0.94, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={REVEAL_TRANSITION}
          >
            <MandateStudio />
          </motion.div>
          <motion.div
            id="chapter-simulator"
            className="scroll-mt-20"
            initial={{ opacity: 0.94, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ ...REVEAL_TRANSITION, delay: 0.05 }}
          >
            <PoisonedStoreSim />
          </motion.div>
        </div>

        <motion.div
          id="chapter-blotter"
          className="scroll-mt-20"
          initial={{ opacity: 0.94, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={REVEAL_TRANSITION}
        >
          <AgStudioBlotter />
        </motion.div>

        <motion.div
          id="chapter-sla"
          className="scroll-mt-20"
          initial={{ opacity: 0.94, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={REVEAL_TRANSITION}
        >
          <BryntumSlaBoard />
        </motion.div>

        <motion.div
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
