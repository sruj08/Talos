'use client';
import React from 'react';
import { ForensicDetailPanel } from './ForensicDetailPanel';

export function AgStudioBlotter() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4" data-testid="ag-studio-blotter">
      <h2 className="text-lg font-semibold">3. AG Grid Enterprise & AG Studio Live Escrow Blotter ($10,000 Sponsor Pool — F-08)</h2>
      <p className="text-xs text-slate-400">Streaming applyTransactionAsync updates, Master-Detail DOM Diff Forensics, and Embedded AG Studio AI Financial Copilot.</p>
      <ForensicDetailPanel />
    </section>
  );
}
