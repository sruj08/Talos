'use client';

import React from 'react';
import { AppShell } from '../../components/shell/AppShell';
import { LiveAgentSimulator } from '../../components/sim/LiveAgentSimulator';
import { PoisonedStoreSim } from '../../components/PoisonedStoreSim';
import { useTalosClearing } from '../../context/TalosClearingContext';

export default function SimulatorPage() {
  const { setWorkspaceTab } = useTalosClearing();
  React.useEffect(() => {
    setWorkspaceTab('SIMULATOR');
  }, [setWorkspaceTab]);

  return (
    <AppShell
      testId="chapter-route-simulator"
      title="Live agent simulator"
      subtitle="Watch an AI agent shop on the left while TALOS checks every move on the right. Toggle a hazard and try to break it."
    >
      <LiveAgentSimulator />

      <details className="tx-card p-4 sm:p-5 group" data-testid="simulator-technical-arena">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 min-h-[44px]">
          <span className="text-base font-semibold text-ink">Technical arena: run the raw 3-act API flows</span>
          <span className="text-sm text-ink-secondary group-open:hidden">Show</span>
          <span className="text-sm text-ink-secondary hidden group-open:inline">Hide</span>
        </summary>
        <div id="chapter-simulator" className="pt-4">
          <PoisonedStoreSim />
        </div>
      </details>
    </AppShell>
  );
}
