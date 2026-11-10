'use client';

import React from 'react';
import Link from 'next/link';
import { MonitorPlay } from 'lucide-react';
import { AppShell } from '../../components/shell/AppShell';
import { CommandOverview } from '../../components/command/CommandOverview';
import { OperatorSuite } from '../../components/command/OperatorSuite';
import { useTalosClearing } from '../../context/TalosClearingContext';

export default function TALOSCommandCenterPage() {
  const { setWorkspaceTab } = useTalosClearing();
  React.useEffect(() => {
    setWorkspaceTab('ALL');
  }, [setWorkspaceTab]);

  return (
    <AppShell
      testId="talos-command-center"
      title="TALOS Command Center"
      subtitle="Live protection across every agent, hold and delivery."
      actions={
        <Link href="/simulator" className="btn-paypal-primary" data-testid="overview-run-sim">
          <MonitorPlay className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Run a simulation
        </Link>
      }
    >
      <CommandOverview />
      <div className="pt-6">
        <OperatorSuite />
      </div>
    </AppShell>
  );
}
