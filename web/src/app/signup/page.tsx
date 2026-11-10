'use client';

import React from 'react';
import { PayPalAuthPortal } from '../../components/PayPalAuthPortal';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../../components/SovereignHeaderAndDock';

export default function SignupPage() {
  return (
    <div className="min-h-screen sovereign-canvas flex flex-col justify-between" data-testid="signup-page">
      <SovereignTopNavBar />
      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-10 flex-1">
        <div className="enterprise-band-blue rounded-lg p-6 sm:p-8">
          <PayPalAuthPortal mode="signup" />
        </div>
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
