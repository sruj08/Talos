'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Kbd } from '@heroui/react';
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
  Wallet,
} from 'lucide-react';
import { useTalosClearing } from '../../context/TalosClearingContext';
import { useSimulatorRun } from '../../context/SimulatorRunContext';
import { TalosLogoMark } from '../brand/TalosLogoMark';

export const APP_NAV = [
  { href: '/command-center', label: 'Overview', icon: LayoutDashboard, keyHint: '1', testId: 'app-nav-command-center' },
  { href: '/simulator', label: 'Live simulator', icon: MonitorPlay, keyHint: '2', testId: 'app-nav-simulator' },
  { href: '/mandates', label: 'Spending allowance', icon: KeyRound, keyHint: '3', testId: 'app-nav-mandates' },
  { href: '/blotter', label: 'CFO escrow ledger', icon: FileSpreadsheet, keyHint: '4', testId: 'app-nav-blotter' },
  { href: '/sla', label: 'Delivery SLA', icon: CalendarClock, keyHint: '5', testId: 'app-nav-sla' },
  { href: '/step-up', label: 'Human approval', icon: UserCheck, keyHint: '6', testId: 'app-nav-step-up' },
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
      <aside className="app-shell-rail hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-[100dvh] px-3 py-3.5 gap-4" aria-label="Product workspaces">
        <Link href="/" className="px-2 inline-flex items-center gap-2.5 text-sm font-semibold text-ink" data-testid="app-shell-home">
          <TalosLogoMark size={36} />
          <span>TALOS</span>
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Workspaces">
          {APP_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                data-testid={item.testId}
                className="tx-tab w-full justify-between !min-h-[34px] !py-1.5 !px-2.5"
              >
                <span className="inline-flex items-center gap-2 min-w-0">
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span className="truncate text-xs sm:text-sm">{item.label}</span>
                </span>
                <Kbd className="tx-key text-[11px] text-ink-muted px-1.5 py-0.5 rounded-sm bg-[var(--surface-well)]">
                  <Kbd.Content>{item.keyHint}</Kbd.Content>
                </Kbd>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1 px-1">
          <Link href="/" className="tx-tab w-full !min-h-[34px]" data-testid="app-shell-back-to-site">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Back to site</span>
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        <header className="app-shell-top sticky top-0 z-40">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-12">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <TalosLogoMark size={30} />
                <span>TALOS</span>
              </Link>
              <span className="hidden lg:inline text-xs font-medium text-ink-secondary truncate">Clearinghouse workspace</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/command-center"
                data-testid="ws-connection-badge"
                data-connection-mode={mode}
                className="tx-chip !min-h-[28px]"
                title={live ? 'Live orchestrator stream' : 'Deterministic sandbox replay'}
              >
                <span className={`w-1.5 h-1.5 rounded-xs ${live ? 'dot-emerald' : 'dot-paypal'}`} aria-hidden="true" />
                <span>PayPal Sandbox</span>
                <span className="hidden md:inline text-ink-muted">{live ? 'Live' : 'Replay'}</span>
              </Link>
              <span className="tx-chip !min-h-[28px] tx-num hidden sm:inline-flex" data-testid="app-shell-cap-badge">
                <Wallet className="h-3.5 w-3.5 text-ink-secondary" strokeWidth={1.75} aria-hidden="true" />
                <span>Cap ${capUsd}</span>
              </span>
              {authSession.authenticated ? (
                <span className="tx-chip !min-h-[28px] hidden md:inline-flex" data-testid="auth-session-badge">
                  {authSession.displayName}
                </span>
              ) : (
                <Link href="/login" className="tx-chip !min-h-[28px] hidden md:inline-flex" data-testid="nav-signin-link">
                  Pick a role
                </Link>
              )}
              <button
                type="button"
                onClick={toggleTheme}
                data-testid="theme-toggle-btn"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-secondary border border-[var(--border)] bg-[var(--surface-well)] hover:text-ink"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" /> : <Moon className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <nav className="lg:hidden flex gap-1 overflow-x-auto px-3 pb-1.5" aria-label="Workspaces">
            {APP_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
                  className="tx-tab whitespace-nowrap !min-h-[34px] !py-1 !px-2.5"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-ink">{title}</h1>
              {subtitle ? <p className="text-xs sm:text-sm text-ink-secondary max-w-[68ch]">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
