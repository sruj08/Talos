'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  CalendarClock,
  FileSpreadsheet,
  KeyRound,
  LayoutDashboard,
  MonitorPlay,
  Moon,
  Sun,
  UserCheck,
} from 'lucide-react';
import { useTalosClearing } from '../../context/TalosClearingContext';
import { useSimulatorRun } from '../../context/SimulatorRunContext';

export const APP_NAV = [
  { href: '/command-center', label: 'Overview', icon: LayoutDashboard, testId: 'app-nav-command-center' },
  { href: '/simulator', label: 'Live simulator', icon: MonitorPlay, testId: 'app-nav-simulator' },
  { href: '/mandates', label: 'Spending allowance', icon: KeyRound, testId: 'app-nav-mandates' },
  { href: '/blotter', label: 'CFO escrow ledger', icon: FileSpreadsheet, testId: 'app-nav-blotter' },
  { href: '/sla', label: 'Delivery SLA', icon: CalendarClock, testId: 'app-nav-sla' },
  { href: '/step-up', label: 'Human approval', icon: UserCheck, testId: 'app-nav-step-up' },
] as const;

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  testId: string;
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, actions, testId, children }: AppShellProps) {
  const pathname = usePathname() ?? '';
  const { theme, toggleTheme, mode, authSession } = useTalosClearing();
  const { capUsd } = useSimulatorRun();
  const live = mode === 'LIVE_WS';

  return (
    <div className="min-h-[100dvh] sovereign-canvas lg:grid lg:grid-cols-[232px_minmax(0,1fr)]" data-testid={testId}>
      <aside className="app-shell-rail hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-[100dvh] px-3 py-4 gap-6" aria-label="Product workspaces">
        <Link href="/" className="px-3 text-base font-semibold text-ink" data-testid="app-shell-home">
          TALOS
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Workspaces">
          {APP_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} data-testid={item.testId} className="tx-tab">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2 px-1">
          <Link href="/" className="tx-tab w-full" data-testid="app-shell-back-to-site">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Back to site
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        <header className="app-shell-top sticky top-0 z-40">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-14">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="lg:hidden text-base font-semibold text-ink">TALOS</Link>
              <span className="hidden lg:inline text-sm text-ink-secondary truncate">Clearinghouse workspace</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/command-center"
                data-testid="ws-connection-badge"
                data-connection-mode={mode}
                className="tx-chip !min-h-[32px] tx-chip--paypal"
                title={live ? 'Live orchestrator stream' : 'Deterministic sandbox replay'}
              >
                <span className={`w-1.5 h-1.5 rounded-xs ${live ? 'dot-emerald' : 'dot-paypal'}`} aria-hidden="true" />
                <span>PayPal Sandbox</span>
                <span className="hidden md:inline text-ink-muted">{live ? 'Live' : 'Replay'}</span>
              </Link>
              <span className="tx-chip !min-h-[32px] tx-num hidden sm:inline-flex" data-testid="app-shell-cap-badge">
                Cap ${capUsd}
              </span>
              {authSession.authenticated ? (
                <span className="tx-chip !min-h-[32px] hidden md:inline-flex" data-testid="auth-session-badge">
                  {authSession.displayName}
                </span>
              ) : (
                <Link href="/login" className="tx-chip !min-h-[32px] hidden md:inline-flex" data-testid="nav-signin-link">
                  Pick a role
                </Link>
              )}
              <button
                type="button"
                onClick={toggleTheme}
                data-testid="theme-toggle-btn"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="inline-flex items-center justify-center w-10 h-10 rounded-md text-ink-secondary hover:bg-[var(--surface-well)]"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1.6} aria-hidden="true" /> : <Moon className="w-4 h-4" strokeWidth={1.6} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <nav className="lg:hidden flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Workspaces">
            {APP_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
                className="tx-tab whitespace-nowrap !min-h-[40px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold text-ink">{title}</h1>
              {subtitle ? <p className="text-sm text-ink-secondary max-w-[68ch]">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
