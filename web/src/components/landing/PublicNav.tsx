'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

const LINKS = [
  { href: '/story', label: 'Product tour', testId: 'public-nav-story' },
  { href: '/simulator', label: 'Live demo', testId: 'public-nav-simulator' },
  { href: '/command-center', label: 'Workspace', testId: 'public-nav-workspace' },
] as const;

export function PublicNav() {
  const pathname = usePathname() ?? '/';
  return (
    <header className="sticky top-0 z-40 paypal-nav-shell" data-testid="public-nav">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="text-base font-semibold text-ink shrink-0" data-testid="public-nav-home">
            TALOS
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-testid={l.testId}
                aria-current={pathname === l.href ? 'page' : undefined}
                className="tx-tab !min-h-[40px]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/login" className="tx-tab !min-h-[40px] hidden sm:inline-flex" data-testid="nav-signin-link">
            Sign in
          </Link>
          <Link href="/simulator" className="btn-paypal-primary !min-h-[40px] !py-2 !text-sm" data-testid="public-nav-launch">
            Launch live demo
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
