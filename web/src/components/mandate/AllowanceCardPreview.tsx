'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, BadgeCheck, KeyRound } from 'lucide-react';
import {
  Tilt,
  TiltContent,
} from '@animate-ui/react/primitives/effects/tilt';
import { Shine } from '@animate-ui/react/primitives/effects/shine';
import { useSimulatorRun } from '../../context/SimulatorRunContext';
import { useTalosClearing } from '../../context/TalosClearingContext';
import { formatUsd } from '../../lib/sim/storefront-catalog';
import { TalosLogoMark } from '../brand/TalosLogoMark';

/** Visual PayPal AI Allowance card that mirrors whatever cap was last signed. */
export function AllowanceCardPreview() {
  const reduce = useReducedMotion();
  const { capUsd, allowanceSignedAt } = useSimulatorRun();
  const { authSession } = useTalosClearing();
  const holder = authSession.authenticated ? authSession.displayName : 'Your AI agent';

  return (
    <div className="space-y-4" data-testid="allowance-card-preview">
      <Tilt maxTilt={3} perspective={1100} className="block">
        <TiltContent>
          <Shine
            enableOnHover
            color="rgba(255, 255, 255, 0.22)"
            duration={850}
            className="block rounded-[16px]"
          >
            <motion.div
              key={capUsd}
              initial={reduce ? false : { rotateX: 8, opacity: 0.6 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="rounded-lg bg-[#F2F7FF] dark:bg-[#061A3E] text-[#001435] dark:text-white p-5 space-y-6 border border-[#B8D3F8] dark:border-[#1B4284] aspect-[1.586/1] flex flex-col justify-between shadow-sm"
              style={{ transformPerspective: 900 }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <TalosLogoMark size={24} />
                  <span>PayPal AI Allowance</span>
                </span>
                <KeyRound className="h-5 w-5 opacity-80" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs opacity-70">Spending cap</p>
                <p
                  className="text-4xl sm:text-5xl font-semibold tabular-nums"
                  data-testid="allowance-card-cap"
                >
                  {formatUsd(capUsd, true)}
                </p>
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
          </Shine>
        </TiltContent>
      </Tilt>

      <div className="tx-card p-4 space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <BadgeCheck
            className={`h-4 w-4 ${allowanceSignedAt ? 'text-ink-emerald' : 'text-ink-muted'}`}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="text-ink font-medium">
            {allowanceSignedAt ? 'Signed with Ed25519' : 'Default $300 allowance active'}
          </span>
        </div>
        <p className="text-ink-secondary">
          {allowanceSignedAt
            ? `Signed at ${new Date(allowanceSignedAt).toLocaleTimeString()}. The simulator now enforces this cap.`
            : 'Sign a new mandate on the left. The simulator and every workspace pick it up instantly.'}
        </p>
        <Link
          href="/simulator"
          className="inline-flex items-center gap-1.5 font-medium text-ink-paypal min-h-[36px]"
          data-testid="allowance-test-in-sim"
        >
          Test this cap in the simulator
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
