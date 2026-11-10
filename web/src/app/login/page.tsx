'use client';

import React from 'react';
import { PayPalAuthPortal } from '../../components/PayPalAuthPortal';
import {
  SovereignStoryChapterDock,
  SovereignTopNavBar,
} from '../../components/SovereignHeaderAndDock';

export default function LoginPage() {
  return (
    <div className="min-h-screen sovereign-canvas flex flex-col justify-between" data-testid="login-page">
      <SovereignTopNavBar />
      <main className="mx-auto max-w-[1360px] w-full px-4 sm:px-6 py-10 flex-1">
        <div className="enterprise-band-chrome rounded-lg p-6 sm:p-8">
          <PayPalAuthPortal mode="login" />
        </div>
      </main>
      <SovereignStoryChapterDock />
    </div>
  );
}
