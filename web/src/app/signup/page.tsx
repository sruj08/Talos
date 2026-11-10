'use client';

import React from 'react';
import { PayPalAuthPortal } from '../../components/PayPalAuthPortal';
import { PublicNav } from '../../components/landing/PublicNav';
import { PublicFooter } from '../../components/landing/LandingClosing';

export default function SignupPage() {
  return (
    <div className="surface-editorial min-h-[100dvh] flex flex-col" data-testid="signup-page">
      <PublicNav />
      <main className="mx-auto max-w-[1240px] w-full px-4 sm:px-8 py-10 sm:py-14 flex-1">
        <PayPalAuthPortal mode="signup" />
      </main>
      <PublicFooter />
    </div>
  );
}
