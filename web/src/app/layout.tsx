import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TALOS Command Center',
  description:
    'Zero-Trust Agentic Commerce Firewall & PayPal Escrow Referee — Rust KYA Firewall, Go APIMatic Escrow Orchestrator, AG Grid Enterprise, Channel3 and PayPal Sandbox.',
};

export const viewport: Viewport = {
  themeColor: '#070B14',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
