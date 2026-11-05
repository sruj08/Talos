import React from 'react';
import './globals.css';
import { TalosClearingProvider } from '../context/TalosClearingContext';

export const metadata = {
  title: 'TALOS — Sovereign Zero-Trust Agentic Commerce Clearinghouse',
  description:
    'Institutional Zero-Trust Agentic Commerce Firewall, PayPal Two-Phase Commit Escrow Referee, and Autonomous Buyers Club',
};

const PREPAINT_FX_SCRIPT = `(function(){try{var d=document.documentElement;var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var hc=navigator.hardwareConcurrency||8;d.setAttribute('data-fx',rm||hc<=2?'static':'high');var t=d.getAttribute('data-theme')||'dark';d.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-fx="high" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_FX_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Figtree:wght@400..800&family=Fraunces:opsz,wght@9..144,400..700&family=Mukta:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="sovereign-canvas antialiased">
        <TalosClearingProvider>{children}</TalosClearingProvider>
      </body>
    </html>
  );
}
