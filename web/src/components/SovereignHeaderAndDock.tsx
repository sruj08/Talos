'use client';

// Architectural Header & KPI Stage · @heroui/react & Unslop Graphite Tokens
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';
import { Moon, ShieldCheck, Sun } from 'lucide-react';
import { useTalosClearing } from '../context/TalosClearingContext';
import { STORY_CHAPTERS, SovereignStoryChapterDock } from './SovereignStoryDock';

export { STORY_CHAPTERS, SovereignStoryChapterDock };

export function SovereignTopTelemetryBar() {
  const {
    theme, toggleTheme, mode, rows, kpiMetrics, activeChapter, setActiveChapter,
  } = useTalosClearing();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const hasVoidOrCapture = rows.some((r) => r.state === 'PAYPAL_CAPTURED' || r.state === 'PAYPAL_VOIDED');
  const pipelineStage = hasVoidOrCapture ? 'CAPTURED / VOIDED' : 'AUTHORIZED';
  const pipelineProgressPct = hasVoidOrCapture ? 100 : 38;

  return (
    <header className="w-full" data-testid="sovereign-telemetry-header">
      <div className="relative z-40 sovereign-glass">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <Link
              href="/"
              onClick={() => setActiveChapter('OVERVIEW')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink tracking-tight whitespace-nowrap shrink-0"
            >
              <span className="w-2 h-2 rounded-xs dot-paypal" aria-hidden="true" />
              <span>TALOS</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 shrink-0" aria-label="Clearinghouse workspaces" data-testid="top-chapter-nav">
              {STORY_CHAPTERS.map((ch) => (
                <Link
                  key={ch.id}
                  href={ch.href}
                  onClick={() => setActiveChapter(ch.id)}
                  data-testid={`nav-chapter-${ch.id.toLowerCase()}`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-control transition-colors duration-150 ease-unslop whitespace-nowrap ${
                    activeChapter === ch.id ? 'bg-secondary text-ink' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {ch.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-xs whitespace-nowrap">
            <div className="hidden lg:flex items-center gap-3 font-mono text-ink-secondary tabular-nums whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
                <span>Rust KYA &lt;1ms</span>
              </span>
              <span className="text-ink-muted">·</span>
              <span className="whitespace-nowrap">Go 2PC online</span>
              <span className="text-ink-muted">·</span>
              <span data-testid="ws-connection-badge" className="inline-flex items-center gap-1.5 text-ink whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-xs dot-paypal" aria-hidden="true" />
                <span>PayPal Sandbox ({mode})</span>
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              data-testid="theme-toggle-btn"
              aria-label={theme === 'dark' ? 'Switch to Daylight theme' : 'Switch to Dark theme'}
              title={theme === 'dark' ? 'Switch to Daylight theme' : 'Switch to Dark theme'}
              className="btn-sovereign-neutral inline-flex items-center justify-center w-8 h-8 rounded-control active:scale-[0.98]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-6 pb-2 space-y-6">
        <div className="sovereign-card relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none hidden lg:block absolute inset-y-0 right-0 w-[42%] select-none" aria-hidden="true">
            <img
              src="/assets/talos-clearing-artifact.png"
              alt=""
              className="w-full h-full object-cover object-center hero-artifact-img"
            />
            <div className="absolute inset-0 hero-artifact-vignette" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-ink-secondary">
              <ShieldCheck className="w-4 h-4 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
              <span>Ed25519 Know-Your-Agent · DeBERTa-v3 ONNX · PayPal Orders v2 2PC</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
                TALOS Command Center
              </h1>
              <p className="text-sm text-ink-secondary leading-relaxed max-w-[60ch]">
                Zero-trust agentic commerce clearinghouse and reversible PayPal escrow referee
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono" data-testid="paypal-2pc-pipeline-bar">
              <span className="text-ink-muted">PayPal 2PC Pipeline:</span>
              <span className={pipelineStage === 'AUTHORIZED' ? 'text-ink font-medium' : 'text-ink-muted'}>
                AUTHORIZED
              </span>
              <span className="text-ink-muted">→</span>
              <span className="text-ink-muted">SLA VERIFIED</span>
              <span className="text-ink-muted">→</span>
              <span className={pipelineStage === 'CAPTURED / VOIDED' ? 'text-ink-emerald font-medium' : 'text-ink-muted'}>
                CAPTURED / VOIDED
              </span>
              <div className="w-20 h-1 rounded-xs overflow-hidden bar-track ml-1" aria-hidden="true">
                <div
                  className="h-full dot-paypal transition-all duration-300 ease-unslop"
                  style={{ width: `${pipelineProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <section
          aria-label="Key clearinghouse telemetry"
          data-testid="kpi-header-bar"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div data-testid="kpi-protected-gmv" className="sovereign-card p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span>Protected GMV</span>
              <span className="font-mono text-xs text-ink-muted">01</span>
            </div>
            <div className="text-2xl font-medium text-ink tabular-nums tracking-tight">
              {hydrated ? (
                <span className="inline-flex items-baseline gap-2">
                  <NumberFlow value={kpiMetrics.protectedGmvCents / 100} format={{ style: 'currency', currency: 'USD' }} />
                  <span className="text-xs font-mono text-ink-muted">
                    ({kpiMetrics.protectedGmvUsd.split('(')[1] || '₹20,93,280)'}
                  </span>
                </span>
              ) : (
                kpiMetrics.protectedGmvUsd
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-ink-muted tabular-nums">
              <span>2PC PayPal Sandbox escrows</span>
              <span className="font-mono text-ink-emerald whitespace-nowrap">+14% vs 30d</span>
            </div>
          </div>

          <div data-testid="kpi-blocked-injections" className="sovereign-card p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span>Blocked Prompt Injections</span>
              <span className="font-mono text-xs text-ink-muted">02</span>
            </div>
            <div className="text-2xl font-medium text-ink tabular-nums tracking-tight">
              {hydrated ? (
                <span className="inline-flex items-baseline gap-1.5">
                  <NumberFlow value={kpiMetrics.blockedInjectionsCount} />
                  <span>Blocked</span>
                </span>
              ) : (
                `${kpiMetrics.blockedInjectionsCount} Blocked`
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-ink-muted tabular-nums">
              <span>lol_html &amp; DeBERTa (&lt;4ms)</span>
              <span className="font-mono text-ink-secondary whitespace-nowrap">100% recall</span>
            </div>
          </div>

          <div data-testid="kpi-channel3-savings" className="sovereign-card p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span>Channel3 Savings</span>
              <span className="font-mono text-xs text-ink-muted">03</span>
            </div>
            <div className="text-2xl font-medium text-ink-paypal tabular-nums tracking-tight">
              {hydrated ? (
                <span className="inline-flex items-baseline gap-2">
                  <NumberFlow value={kpiMetrics.channel3SavingsCents / 100} format={{ style: 'currency', currency: 'USD' }} />
                  <span className="text-xs font-mono text-ink-muted">
                    ({kpiMetrics.channel3SavingsUsd.split('(')[1] || '₹3,46,080)'}
                  </span>
                </span>
              ) : (
                kpiMetrics.channel3SavingsUsd
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-ink-muted tabular-nums">
              <span>Cross-merchant reroutes</span>
              <span className="font-mono text-ink-secondary whitespace-nowrap">-380 bps</span>
            </div>
          </div>

          <div data-testid="kpi-active-paypal-auths" className="sovereign-card p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span>Active PayPal Authorizations</span>
              <span className="font-mono text-xs text-ink-muted">04</span>
            </div>
            <div className="text-2xl font-medium text-ink tabular-nums tracking-tight">
              {hydrated ? (
                <span className="inline-flex items-baseline gap-1.5">
                  <NumberFlow value={kpiMetrics.activePayPalAuthCount} />
                  <span>Active Holds</span>
                </span>
              ) : (
                `${kpiMetrics.activePayPalAuthCount} Active Holds`
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-ink-muted tabular-nums">
              <span>APIMatic SDK &amp; RFC 9421</span>
              <span className="font-mono text-ink-secondary whitespace-nowrap">29d honor</span>
            </div>
          </div>
        </section>
      </div>
    </header>
  );
}
