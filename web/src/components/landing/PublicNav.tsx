'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Compass, LayoutDashboard, LogIn, MonitorPlay } from 'lucide-react';
import { TalosLogoMark } from '../brand/TalosLogoMark';

const LINKS = [
  { href: '/story', label: 'Product tour', icon: Compass, testId: 'public-nav-story' },
  { href: '/simulator', label: 'Live demo', icon: MonitorPlay, testId: 'public-nav-simulator' },
  { href: '/command-center', label: 'Workspace', icon: LayoutDashboard, testId: 'public-nav-workspace' },
] as const;

export function PublicNav() {
  const pathname = usePathname() ?? '/';
  return (
    <header className="sticky top-0 z-40 paypal-nav-shell" data-testid="public-nav">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-sm sm:text-base font-semibold text-ink shrink-0"
            data-testid="public-nav-home"
          >
            <TalosLogoMark size={36} />
            <span>TALOS</span>
            <span className="tx-chip hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              PayPal 2PC
            </span>
          </Link>
          <nav
            className="hidden md:flex items-center gap-1 p-1 rounded-md bg-[var(--surface-well)] border border-[var(--border)]"
            aria-label="Primary"
          >
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-testid={l.testId}
                  aria-current={pathname === l.href ? 'page' : undefined}
                  className="tx-tab !min-h-[32px] !py-1 !px-2.5"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/login" className="tx-tab !min-h-[34px] hidden sm:inline-flex" data-testid="nav-signin-link">
            <LogIn className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
            <span>Sign in</span>
          </Link>
          <Link
            href="/simulator"
            className="btn-paypal-primary !min-h-[36px] !px-4 !py-1.5 !text-xs sm:!text-sm"
            data-testid="public-nav-launch"
          >
            <span>Launch live demo</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
