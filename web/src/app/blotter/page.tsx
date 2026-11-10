'use client';

import React from 'react';
import { AppShell } from '../../components/shell/AppShell';
import { LastRunBanner } from '../../components/shell/LastRunBanner';
import { AgStudioBlotter } from '../../components/AgStudioBlotter';
import { useTalosClearing } from '../../context/TalosClearingContext';

export default function BlotterChapterPage() {
  const { setWorkspaceTab } = useTalosClearing();
  React.useEffect(() => {
    setWorkspaceTab('BLOTTER');
  }, [setWorkspaceTab]);

  return (
    <AppShell
      testId="chapter-route-blotter"
      title="CFO escrow ledger"
      subtitle="Every settlement, hold, refund and blocked attack, streaming live. Ask the copilot in plain English."
    >
      <LastRunBanner focus="ledger" />
      <div id="chapter-blotter">
        <AgStudioBlotter />
      </div>
    </AppShell>
  );
}
