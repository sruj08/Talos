'use client';

import React from 'react';
import { AppShell } from '../../components/shell/AppShell';
import { LastRunBanner } from '../../components/shell/LastRunBanner';
import { BryntumSlaBoard } from '../../components/BryntumSlaBoard';
import { useTalosClearing } from '../../context/TalosClearingContext';

export default function SlaChapterPage() {
  const { setWorkspaceTab } = useTalosClearing();
  React.useEffect(() => {
    setWorkspaceTab('SLA');
  }, [setWorkspaceTab]);

  return (
    <AppShell
      testId="chapter-route-sla"
      title="Delivery SLA and auto-refund"
      subtitle="29-day PayPal holds against 48-hour carrier deadlines. Push a shipment past its deadline and the refund fires."
    >
      <LastRunBanner focus="sla" />
      <div id="chapter-sla">
        <BryntumSlaBoard />
      </div>
    </AppShell>
  );
}
