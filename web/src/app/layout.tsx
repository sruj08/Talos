import React from 'react';
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './rail-system.css';
import './enterprise-shell.css';
import './talos-experience.css';
import { TalosClearingProvider } from '../context/TalosClearingContext';
import { SimulatorRunProvider } from '../context/SimulatorRunContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata = {
  title: 'TALOS | Zero-trust checkout for AI shopping agents',
  description:
    'TALOS is the firewall and reversible PayPal escrow referee that keeps AI shopping agents from getting scammed, overcharged, or stuck with undelivered goods.',
  icons: {
    icon: [
      { url: '/assets/talos-logo-light.webp', media: '(prefers-color-scheme: light)', type: 'image/webp' },
      { url: '/assets/talos-logo-dark.webp', media: '(prefers-color-scheme: dark)', type: 'image/webp' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      data-fx="high"
      suppressHydrationWarning
    >
      <body className="sovereign-canvas antialiased" suppressHydrationWarning>
        <TalosClearingProvider>
          <SimulatorRunProvider>{children}</SimulatorRunProvider>
        </TalosClearingProvider>
      </body>
    </html>
  );
}
