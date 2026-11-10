'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, BadgeCheck, KeyRound } from 'lucide-react';
import { useSimulatorRun } from '../../context/SimulatorRunContext';
import { useTalosClearing } from '../../context/TalosClearingContext';
import { formatUsd } from '../../lib/sim/storefront-catalog';

/** Visual PayPal AI Allowance card that mirrors whatever cap was last signed. */
export function AllowanceCardPreview() {
  const reduce = useReducedMotion();
  const { capUsd, allowanceSignedAt } = useSimulatorRun();
  const { authSession } = useTalosClearing();
  const holder = authSession.authenticated ? authSession.displayName : 'Your AI agent';

  return (
    <div className="space-y-4" data-testid="allowance-card-preview">
      <motion.div
        key={capUsd}
        initial={reduce ? false : { rotateX: 8, opacity: 0.6 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        className="rounded-[16px] bg-[#003087] text-white p-6 space-y-8 shadow-[0_24px_50px_rgba(0,48,135,0.3)] aspect-[1.586/1] flex flex-col justify-between"
        style={{ transformPerspective: 900 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">PayPal AI Allowance</span>
          <KeyRound className="h-5 w-5 opacity-80" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs opacity-70">Spending cap</p>
          <p className="text-4xl sm:text-5xl font-semibold tabular-nums" data-testid="allowance-card-cap">{formatUsd(capUsd, true)}</p>
        </div>
        <div className="flex items-end justify-between gap-3 text-xs">
          <div>
            <p className="opacity-70">Holder</p>
            <p className="font-semibold text-sm">{holder}</p>
          </div>
          <div className="text-right">
            <p className="opacity-70">Rules</p>
            <p className="font-semibold tabular-nums">15% spread, 48h SLA</p>
          </div>
        </div>
      </motion.div>

      <div className="tx-card p-4 space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <BadgeCheck className={`h-4 w-4 ${allowanceSignedAt ? 'text-ink-emerald' : 'text-ink-muted'}`} strokeWidth={1.75} aria-hidden="true" />
          <span className="text-ink font-medium">{allowanceSignedAt ? 'Signed with Ed25519' : 'Default $300 allowance active'}</span>
        </div>
        <p className="text-ink-secondary">
          {allowanceSignedAt
            ? `Signed at ${new Date(allowanceSignedAt).toLocaleTimeString()}. The simulator now enforces this cap.`
            : 'Sign a new mandate on the left. The simulator and every workspace pick it up instantly.'}
        </p>
        <Link href="/simulator" className="inline-flex items-center gap-1.5 font-medium text-ink-paypal min-h-[36px]" data-testid="allowance-test-in-sim">
          Test this cap in the simulator
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
