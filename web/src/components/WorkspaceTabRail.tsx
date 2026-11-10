'use client';

import React from 'react';
import Link from 'next/link';
import { useTalosClearing, WorkspaceTabId } from '../context/TalosClearingContext';

const WORKSPACE_TABS: Array<{
  id: WorkspaceTabId;
  label: string;
  href: string;
  testId: string;
}> = [
  { id: 'ALL', label: 'All modules', href: '/command-center', testId: 'ws-tab-all' },
  { id: 'ALLOWANCE', label: 'Allowance Rules', href: '/mandates', testId: 'ws-tab-allowance' },
  { id: 'SIMULATOR', label: '3-Scenario Simulator', href: '/simulator', testId: 'ws-tab-simulator' },
  { id: 'BLOTTER', label: 'CFO Escrow Table', href: '/blotter', testId: 'ws-tab-blotter' },
  { id: 'SLA', label: '48h Delivery Timeline', href: '/sla', testId: 'ws-tab-sla' },
  { id: 'STEP_UP', label: 'PayPal Step-Up Co-Sign', href: '/step-up', testId: 'ws-tab-step-up' },
];

export function WorkspaceTabRail() {
  const { workspaceTab, setWorkspaceTab } = useTalosClearing();

  return (
    <div className="enterprise-product-tab-rail flex flex-col gap-3" data-testid="workspace-tab-rail">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <span className="paypal-label text-ink-secondary">Workspace</span>
          <h2 className="paypal-title-sm text-ink">Focus one module or keep the full suite open</h2>
        </div>
        <span className="text-xs text-ink-muted tabular-nums">
          State syncs live via TalosClearingContext
        </span>
      </div>

      <div
        role="tablist"
        aria-label="TALOS workspace modules"
        className="flex flex-wrap items-center gap-2"
      >
        {WORKSPACE_TABS.map((tab) => {
          const isActive = workspaceTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              data-testid={tab.testId}
              onClick={() => setWorkspaceTab(tab.id)}
              className={
                isActive
                  ? 'paypal-tab-pill-active inline-flex min-h-[44px] items-center px-4 py-2 text-sm'
                  : 'paypal-tab-pill inline-flex min-h-[44px] items-center px-4 py-2 text-sm'
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
