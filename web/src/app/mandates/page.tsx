'use client';

import React from 'react';
import { AppShell } from '../../components/shell/AppShell';
import { MandateStudio } from '../../components/MandateStudio';
import { AllowanceCardPreview } from '../../components/mandate/AllowanceCardPreview';
import { useTalosClearing } from '../../context/TalosClearingContext';
import { useSimulatorRun } from '../../context/SimulatorRunContext';

export default function MandatesChapterPage() {
  const { setWorkspaceTab } = useTalosClearing();
  const { setAllowance } = useSimulatorRun();
  React.useEffect(() => {
    setWorkspaceTab('ALLOWANCE');
  }, [setWorkspaceTab]);

  return (
    <AppShell
      testId="chapter-route-mandates"
      title="Spending allowance"
      subtitle="Set the rules your agent can never break: budget, fair-price spread, categories and delivery deadline."
    >
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6 items-start">
        <div id="chapter-mandates">
          <MandateStudio onMandateSigned={(m) => setAllowance(m.max_amount_cents / 100)} />
        </div>
        <div className="xl:sticky xl:top-20">
          <AllowanceCardPreview />
        </div>
      </div>
    </AppShell>
  );
}
