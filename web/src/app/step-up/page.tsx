'use client';

import React from 'react';
import { AppShell } from '../../components/shell/AppShell';
import { LastRunBanner } from '../../components/shell/LastRunBanner';
import { PayPalStepUpModal } from '../../components/PayPalStepUpModal';
import { useTalosClearing } from '../../context/TalosClearingContext';

export default function StepUpChapterPage() {
  const { setWorkspaceTab } = useTalosClearing();
  React.useEffect(() => {
    setWorkspaceTab('STEP_UP');
  }, [setWorkspaceTab]);

  return (
    <AppShell
      testId="chapter-route-step-up"
      title="Human approval"
      subtitle="Carts above the signed cap wait here, safely, until a person co-signs with PayPal."
    >
      <LastRunBanner focus="approval" />
      <div id="chapter-step-up" className="w-full">
        <PayPalStepUpModal />
      </div>
    </AppShell>
  );
}
