import React from 'react';
import { MandateStudio } from '../components/MandateStudio';
import { PoisonedStoreSim } from '../components/PoisonedStoreSim';
import { AgStudioBlotter } from '../components/AgStudioBlotter';
import { BryntumSlaBoard } from '../components/BryntumSlaBoard';
import { PayPalStepUpModal } from '../components/PayPalStepUpModal';

export default function PactPayCommandCenterPage() {
  return (
    <main className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PactPay (AegisPay) Command Center</h1>
          <p className="text-sm text-slate-400">
            Rust rmcp + lol_html Security Kernel · Go APIMatic PayPal Escrow · Channel3 Price Oracle · AG Studio · Bryntum SLA Board
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MandateStudio />
        <PoisonedStoreSim />
      </div>
      <AgStudioBlotter />
      <BryntumSlaBoard />
      <PayPalStepUpModal />
    </main>
  );
}
