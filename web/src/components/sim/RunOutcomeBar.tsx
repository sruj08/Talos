'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CalendarClock, FileSpreadsheet, ShieldCheck, ShieldX, UserCheck } from 'lucide-react';
import { formatUsd } from '../../lib/sim/storefront-catalog';
import type { RunOutcome } from '../../lib/sim/run-types';

export function RunOutcomeBar({ outcome }: { outcome: RunOutcome }) {
  const reduce = useReducedMotion();
  const protectedRun = outcome.mode === 'PROTECTED';
  const stats = protectedRun
    ? [
        { label: 'Saved', value: formatUsd(outcome.savedUsd, true), tone: 'text-ink', show: outcome.savedUsd > 0 },
        { label: 'Paid after delivery', value: formatUsd(outcome.settledUsd, true), tone: 'text-ink', show: outcome.settledUsd > 0 },
        { label: 'Refunded in 0s', value: formatUsd(outcome.refundedUsd, true), tone: 'text-ink', show: outcome.refundedUsd > 0 },
        { label: 'Awaiting your approval', value: formatUsd(outcome.pendingApprovalUsd, true), tone: 'text-ink', show: outcome.pendingApprovalUsd > 0 },
      ]
    : [
        { label: 'Lost irreversibly', value: formatUsd(-outcome.lostUsd, true), tone: 'text-ink', show: outcome.lostUsd > 0 },
        { label: 'Paid with no recourse', value: formatUsd(outcome.settledUsd, true), tone: 'text-ink', show: outcome.settledUsd > 0 },
      ];

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
      className="tx-card p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center gap-3.5 lg:gap-5"
      data-testid="sim-run-outcome"
      data-outcome-kind={outcome.kind}
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5 min-w-0 lg:max-w-[38%]">
        {protectedRun ? (
          <ShieldCheck className="h-5 w-5 text-ink shrink-0" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <ShieldX className="h-5 w-5 text-ink-secondary shrink-0" strokeWidth={1.75} aria-hidden="true" />
        )}
        <p className="text-sm sm:text-base font-semibold text-ink leading-snug">{outcome.headline}</p>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-2 flex-1">
        {stats.filter((s) => s.show).map((s) => (
          <div key={s.label}>
            <dt className="text-xs text-ink-muted">{s.label}</dt>
            <dd className={`text-lg font-semibold tx-num ${s.tone}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      {protectedRun ? (
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href="/blotter" className="btn-paypal-primary !min-h-[40px] !py-2 !text-sm" data-testid="sim-follow-ledger">
            <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Open in CFO ledger
          </Link>
          <Link href="/sla" className="btn-paypal-secondary !min-h-[40px] !py-2 !text-sm" data-testid="sim-follow-sla">
            <CalendarClock className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Carrier SLA
          </Link>
          {outcome.pendingApprovalUsd > 0 ? (
            <Link href="/step-up" className="btn-checkout-yellow !min-h-[40px] !py-2 !text-sm" data-testid="sim-follow-step-up">
              <UserCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Approve $450
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-ink-secondary shrink-0 max-w-[30ch]">Switch to TALOS + PayPal and replay the same run.</p>
      )}
    </motion.section>
  );
}
