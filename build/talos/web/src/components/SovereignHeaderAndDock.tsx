'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { Surface } from '@heroui/react';
import {
  Activity,
  Clock,
  FileCheck2,
  Lock,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { useTalosClearing } from '../context/TalosClearingContext';
import { STORY_CHAPTERS, SovereignStoryChapterDock } from './SovereignStoryDock';

export { STORY_CHAPTERS, SovereignStoryChapterDock };

export function SovereignTopTelemetryBar() {
  const { kpiMetrics, mode, activeChapter, setActiveChapter, theme, toggleTheme } = useTalosClearing();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <header id="top" className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-6 space-y-5">
      <div className="sovereign-glass rounded-outer px-5 py-4 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 shrink-0 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
            <h1 className="font-display text-2xl sm:text-3xl font-medium text-ink">
              TALOS Command Center
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-ink-secondary tabular-nums" data-testid="header-status-pills">
            <span className="inline-flex items-center gap-2 font-medium text-ink-emerald">
              <span>Rust KYA kernel &lt;1ms</span>
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-ink-emerald">
              <span>Go 2PC engine online</span>
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <span className="w-1.5 h-1.5 rounded-xs dot-paypal" aria-hidden="true" />
              <span>PayPal Sandbox live ({mode})</span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle institutional light or dark mode"
              data-testid="theme-toggle-btn"
              className="btn-sovereign-neutral min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-2 active:scale-[0.96]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-ink-amber" strokeWidth={1.5} />
              ) : (
                <Moon className="w-4 h-4 text-ink-paypal" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
        <p data-subhead="true" className="text-xs sm:text-sm text-ink-secondary">
          Zero-trust agentic commerce clearinghouse and reversible PayPal escrow referee
        </p>
      </div>

      <Surface className="sovereign-card px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-2.5 text-xs tabular-nums"
          data-testid="clearing-pipeline-strip"
        >
          <span className="inline-flex items-center gap-1.5 text-ink-secondary font-medium">
            <Lock className="w-4 h-4 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
            <span>PayPal 2PC Pipeline:</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink-paypal font-medium">
            <span>AUTHORIZED</span>
          </span>
          <span className="text-ink-muted" aria-hidden="true">&rarr;</span>
          <span className="inline-flex items-center gap-1.5 text-ink-amber font-medium">
            <span>SLA VERIFIED</span>
          </span>
          <span className="text-ink-muted" aria-hidden="true">&rarr;</span>
          <span className="inline-flex items-center gap-1.5 text-ink-emerald font-medium">
            <span>CAPTURED / VOIDED</span>
          </span>
          <span className="w-16 h-1.5 rounded-xs bar-track overflow-hidden inline-flex items-center" aria-hidden="true">
            <motion.span
              layout
              initial={{ scaleX: 0.66 }}
              animate={{ scaleX: kpiMetrics.activePayPalAuthCount < 2 ? 1 : 0.66 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
              className="h-full w-full origin-left rounded-xs dot-paypal"
              data-testid="pipeline-spring-bar"
            />
          </span>
        </div>

        <nav aria-label="Story chapter navigation" className="flex flex-wrap items-center gap-1">
          {STORY_CHAPTERS.map((chap) => {
            const isActive = activeChapter === chap.id;
            return (
              <Link
                key={chap.id}
                href={chap.href}
                onClick={(e) => {
                  setActiveChapter(chap.id);
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    document.querySelector(chap.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                data-testid={`nav-chapter-${chap.id.toLowerCase()}`}
                className={`relative min-h-[44px] inline-flex items-center px-3 py-2 text-xs font-medium rounded-control transition-colors whitespace-nowrap active:scale-[0.96] ${
                  isActive ? 'tone-paypal' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {chap.label}
              </Link>
            );
          })}
        </nav>
      </Surface>

      <section
        aria-label="Executive Financial Telemetry KPI Strip"
        data-testid="kpi-header-bar"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Surface data-testid="kpi-protected-gmv" className="sovereign-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-ink-secondary label-optical">
            <span>Protected GMV</span>
            <FileCheck2 className="w-4 h-4 text-ink-emerald" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="text-xl font-semibold text-ink-emerald tabular-nums">
            {hydrated ? (
              <span className="inline-flex items-baseline gap-1.5">
                <NumberFlow value={kpiMetrics.protectedGmvCents / 100} format={{ style: 'currency', currency: 'USD' }} />
                <span className="text-sm text-ink-secondary">
                  ({kpiMetrics.protectedGmvUsd.split('(')[1] || '₹20,93,280)'}
                </span>
              </span>
            ) : (
              kpiMetrics.protectedGmvUsd
            )}
          </div>
          <p className="text-xs text-ink-muted tabular-nums">Reversible 2PC PayPal Sandbox escrows</p>
        </Surface>

        <Surface data-testid="kpi-blocked-injections" className="sovereign-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-ink-secondary label-optical">
            <span>Blocked Prompt Injections</span>
            <ShieldAlert className="w-4 h-4 text-ink-crimson" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="text-xl font-semibold text-ink-crimson tabular-nums">
            {hydrated ? (
              <span className="inline-flex items-baseline gap-1.5">
                <NumberFlow value={kpiMetrics.blockedInjectionsCount} />
                <span>Blocked</span>
              </span>
            ) : (
              `${kpiMetrics.blockedInjectionsCount} Blocked`
            )}
          </div>
          <p className="text-xs text-ink-muted tabular-nums">Rust lol_html and DeBERTa-v3 ONNX (&lt;4ms)</p>
        </Surface>

        <Surface data-testid="kpi-channel3-savings" className="sovereign-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-ink-secondary label-optical">
            <span>Channel3 Savings</span>
            <Activity className="w-4 h-4 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="text-xl font-semibold text-ink-paypal tabular-nums">
            {hydrated ? (
              <span className="inline-flex items-baseline gap-1.5">
                <NumberFlow value={kpiMetrics.channel3SavingsCents / 100} format={{ style: 'currency', currency: 'USD' }} />
                <span className="text-sm text-ink-secondary">
                  ({kpiMetrics.channel3SavingsUsd.split('(')[1] || '₹3,46,080)'}
                </span>
              </span>
            ) : (
              kpiMetrics.channel3SavingsUsd
            )}
          </div>
          <p className="text-xs text-ink-muted tabular-nums">Autonomous price-gouging reroutes</p>
        </Surface>

        <Surface data-testid="kpi-active-paypal-auths" className="sovereign-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-ink-secondary label-optical">
            <span>Active PayPal Authorizations</span>
            <Clock className="w-4 h-4 text-ink-amber" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="text-xl font-semibold text-ink-amber tabular-nums">
            {hydrated ? (
              <span className="inline-flex items-baseline gap-1.5">
                <NumberFlow value={kpiMetrics.activePayPalAuthCount} />
                <span>Active Holds</span>
              </span>
            ) : (
              `${kpiMetrics.activePayPalAuthCount} Active Holds`
            )}
          </div>
          <p className="text-xs text-ink-muted tabular-nums">APIMatic Go SDK v1.1.0 and RFC 9421</p>
        </Surface>
      </section>
    </header>
  );
}
