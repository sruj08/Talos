import React from 'react';
import './globals.css';
import { TalosClearingProvider } from '../context/TalosClearingContext';

export const metadata = {
  title: 'TALOS — PayPal Autonomous Commerce Protection & Escrow Clearinghouse',
  description:
    'Trust-first Zero-Trust Agentic Commerce Firewall, PayPal Two-Phase Commit Escrow Referee, and Autonomous Buyers Protection',
};

const PREPAINT_FX_SCRIPT = `(function(){try{var d=document.documentElement;var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var hc=navigator.hardwareConcurrency||8;d.setAttribute('data-fx',rm||hc<=2?'static':'high');var t=d.getAttribute('data-theme')||'light';d.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-fx="high" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_FX_SCRIPT }} />
      </head>
      <body className="sovereign-canvas antialiased">
        <TalosClearingProvider>{children}</TalosClearingProvider>
      </body>
    </html>
  );
}

