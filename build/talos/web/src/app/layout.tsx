import React from 'react';
import './globals.css';

export const metadata = {
  title: 'TALOS — Zero-Trust Agentic Commerce Firewall & PayPal Escrow Referee',
  description: 'Rust KYA Firewall + Go APIMatic Escrow Orchestrator + AG Studio + Bryntum Scheduler Pro + Channel3 + PayPal Sandbox',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 antialiased">{children}</body>
    </html>
  );
}
