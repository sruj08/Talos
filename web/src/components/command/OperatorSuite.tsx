'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MandateStudio } from '../MandateStudio';
import { PoisonedStoreSim } from '../PoisonedStoreSim';
import { AgStudioBlotter } from '../AgStudioBlotter';
import { BryntumSlaBoard } from '../BryntumSlaBoard';
import { PayPalStepUpModal } from '../PayPalStepUpModal';
import { useSimulatorRun } from '../../context/SimulatorRunContext';

/** Every module in one place, for operators who want to drive the raw three-act API flows end to end. */
export function OperatorSuite() {
  const reduce = useReducedMotion();
  const { setAllowance } = useSimulatorRun();
  const reveal = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.08 },
        transition: { type: 'spring' as const, bounce: 0, duration: 0.5 },
      };

  return (
    <section className="space-y-6" data-testid="operator-suite" aria-labelledby="operator-suite-title">
      <div className="space-y-1">
        <h2 id="operator-suite-title" className="text-xl font-semibold text-ink">Operator suite</h2>
        <p className="text-sm text-ink-secondary">All five modules side by side. Actions here sync to every workspace.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <motion.div id="chapter-mandates" className="lg:col-span-5" {...reveal}>
          <MandateStudio onMandateSigned={(m) => setAllowance(m.max_amount_cents / 100)} />
        </motion.div>
        <motion.div id="chapter-simulator" className="lg:col-span-7" {...reveal}>
          <PoisonedStoreSim />
        </motion.div>
      </div>

      <motion.div id="chapter-blotter" {...reveal}>
        <AgStudioBlotter />
      </motion.div>
      <motion.div id="chapter-sla" {...reveal}>
        <BryntumSlaBoard />
      </motion.div>
      <motion.div {...reveal}>
        <PayPalStepUpModal />
      </motion.div>
    </section>
  );
}
