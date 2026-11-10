import React from 'react';
import './globals.css';
import './rail-system.css';
import './enterprise-shell.css';
import './talos-experience.css';
import { TalosClearingProvider } from '../context/TalosClearingContext';
import { SimulatorRunProvider } from '../context/SimulatorRunContext';

export const metadata = {
  title: 'TALOS | Zero-trust checkout for AI shopping agents',
  description:
    'TALOS is the firewall and reversible PayPal escrow referee that keeps AI shopping agents from getting scammed, overcharged, or stuck with undelivered goods.',
};

const PREPAINT_FX_SCRIPT = `(function(){try{var d=document.documentElement;var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var hc=navigator.hardwareConcurrency||8;d.setAttribute('data-fx',rm||hc<=2?'static':'high');var t=d.getAttribute('data-theme')||'light';d.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark" data-fx="high" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_FX_SCRIPT }} />
      </head>
      <body className="sovereign-canvas antialiased">
        <TalosClearingProvider>
          <SimulatorRunProvider>{children}</SimulatorRunProvider>
        </TalosClearingProvider>
      </body>
    </html>
  );
}

