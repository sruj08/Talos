'use client';

import React from 'react';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTalosClearing } from '../context/TalosClearingContext';
import { STORY_CHAPTERS, SovereignStoryChapterDock } from './SovereignStoryDock';
import { TalosLogoMark } from './brand/TalosLogoMark';

export { STORY_CHAPTERS, SovereignStoryChapterDock };
export { SovereignTopTelemetryBar } from './SovereignTopTelemetryBar';

const STORYLINE_STAGE_LINKS = [
  { id: 'stage-hook', label: '5-Second Hook', href: '#stage-hook' },
  { id: 'storyline-scene-1-rules', label: 'Scene 1: $300 Allowance', href: '#storyline-scene-1-rules' },
  { id: 'storyline-scene-2-shop', label: 'Scene 2: 3 Store Scenarios', href: '#storyline-scene-2-shop' },
  { id: 'storyline-scene-3-cfo', label: 'Scene 3: CFO Dashboard', href: '#storyline-scene-3-cfo' },
] as const;

export function SovereignTopNavBar() {
  const {
    theme,
    toggleTheme,
    mode,
    activeChapter,
    setActiveChapter,
    authSession,
    signOut,
  } = useTalosClearing();

  return (
    <div className="sticky top-0 z-40 paypal-nav-shell" data-testid="sovereign-top-navbar">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8 min-w-0">
          <Link
            href="/"
            onClick={() => setActiveChapter('OVERVIEW')}
            className="inline-flex items-center gap-2.5 text-base font-semibold text-ink tracking-tight whitespace-nowrap shrink-0"
          >
            <TalosLogoMark size={34} />
            <span>TALOS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 overflow-x-auto" aria-label="Storyline stages" data-testid="top-chapter-nav">
            {activeChapter === 'OVERVIEW'
              ? STORYLINE_STAGE_LINKS.map((st, idx) => (
                  <a
                    key={st.id}
                    href={st.href}
                    data-testid={`nav-stage-${idx + 1}`}
                    className={idx === 0 ? 'paypal-tab-pill-active' : 'paypal-tab-pill'}
                  >
                    {st.label}
                  </a>
                ))
              : STORY_CHAPTERS.map((ch) => (
                  <Link
                    key={ch.id}
                    href={ch.href}
                    onClick={() => setActiveChapter(ch.id)}
                    data-testid={`nav-chapter-${ch.id.toLowerCase()}`}
                    className={activeChapter === ch.id ? 'paypal-tab-pill-active' : 'paypal-tab-pill'}
                  >
                    {ch.label}
                  </Link>
                ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/command-center"
            onClick={() => setActiveChapter('COMMAND_CENTER')}
            data-testid="ws-connection-badge"
            data-connection-mode={mode}
            className="hidden sm:inline-flex items-center gap-2 paypal-tab-pill"
          >
            <span className="w-1.5 h-1.5 rounded-xs dot-paypal" aria-hidden="true" />
            <span>PayPal Sandbox</span>
          </Link>

          {authSession.authenticated ? (
            <div data-testid="auth-session-badge" className="hidden md:inline-flex items-center gap-2 paypal-tab-pill">
              <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              <span className="text-ink">{authSession.displayName}</span>
              <button type="button" onClick={signOut} data-testid="auth-sign-out-btn" className="text-ink-secondary">
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" data-testid="nav-signin-link" className="hidden sm:inline-flex btn-paypal-secondary !min-h-[36px] !px-4 !py-2 !text-sm">
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
            aria-label={theme === 'dark' ? 'Switch to Daylight theme' : 'Switch to Dark theme'}
            title={theme === 'dark' ? 'Switch to Daylight theme' : 'Switch to Dark theme'}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md text-ink-secondary"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" strokeWidth={1.6} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
