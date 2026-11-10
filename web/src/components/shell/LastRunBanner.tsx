'use client';

import React from 'react';
import Link from 'next/link';
import { History, MonitorPlay } from 'lucide-react';
import { useSimulatorRun } from '../../context/SimulatorRunContext';

/** Carries the most recent simulator run into the ledger, SLA and approval workspaces. */
export function LastRunBanner({ focus }: { focus: 'ledger' | 'sla' | 'approval' }) {
  const { lastRun } = useSimulatorRun();

  if (!lastRun) {
    return (
      <div className="tx-well px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm" data-testid="last-run-banner" data-has-run="false">
        <span className="text-ink-secondary">No simulator run yet. Run one and it will appear here.</span>
        <Link href="/simulator" className="inline-flex items-center gap-1.5 font-medium text-ink-paypal min-h-[36px]">
          <MonitorPlay className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Open simulator
        </Link>
      </div>
    );
  }

  const hint =
    focus === 'ledger'
      ? lastRun.escrowId
        ? `Look for row ${lastRun.escrowId}.`
        : 'Unprotected runs never reach the ledger: the money left outside escrow.'
      : focus === 'sla'
        ? lastRun.refundedUsd > 0
          ? 'The late shipment shows as voided on the timeline.'
          : 'Drag a shipment past 48h to fire a VOID.'
        : lastRun.pendingApprovalUsd > 0
          ? 'Your $450 item is waiting below.'
          : 'Nothing from your last run needs approval.';

  return (
    <div
      className={`tx-card px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm`}
      data-testid="last-run-banner"
      data-has-run="true"
    >
      <span className="flex items-center gap-2 min-w-0">
        <History className="h-4 w-4 text-ink-secondary shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-ink font-medium">From your simulator run:</span>
        <span className="text-ink-secondary">{lastRun.headline}</span>
      </span>
      <span className="text-ink-secondary">{hint}</span>
    </div>
  );
}
