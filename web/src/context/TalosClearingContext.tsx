'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { EscrowBlotterRow, KpiMetricsSummary, useEscrowStream } from '../hooks/useEscrowStream';
import { EscrowLifecycleState } from '../lib/phase6-events';

export type StoryChapterId =
  | 'OVERVIEW'
  | 'CHAPTER_1_MANDATE'
  | 'CHAPTER_2_ARENA'
  | 'CHAPTER_3_BLOTTER'
  | 'CHAPTER_4_SLA';

export type FxTier = 'high' | 'static';
export type InstitutionalTheme = 'dark' | 'light';

export interface TalosClearingContextValue {
  connected: boolean;
  mode: 'LIVE_WS' | 'SIMULATION_FALLBACK';
  rows: EscrowBlotterRow[];
  kpiMetrics: KpiMetricsSummary;
  activeChapter: StoryChapterId;
  setActiveChapter: (chapter: StoryChapterId) => void;
  fxTier: FxTier;
  theme: InstitutionalTheme;
  toggleTheme: () => void;
  updateRowState: (escrowId: string, newState: EscrowLifecycleState, patch?: Partial<EscrowBlotterRow>) => void;
  resetRows: () => void;
}

const TalosClearingContext = createContext<TalosClearingContextValue | null>(null);

function resolveChapterFromPath(pathname: string | null): StoryChapterId | null {
  if (!pathname) return null;
  if (pathname.startsWith('/mandates')) return 'CHAPTER_1_MANDATE';
  if (pathname.startsWith('/simulator')) return 'CHAPTER_2_ARENA';
  if (pathname.startsWith('/blotter')) return 'CHAPTER_3_BLOTTER';
  if (pathname.startsWith('/sla')) return 'CHAPTER_4_SLA';
  if (pathname === '/') return 'OVERVIEW';
  return null;
}

export function TalosClearingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const stream = useEscrowStream();
  const [activeChapter, setActiveChapter] = useState<StoryChapterId>('OVERVIEW');
  const [fxTier, setFxTier] = useState<FxTier>('high');
  const [theme, setTheme] = useState<InstitutionalTheme>('dark');

  useEffect(() => {
    const mapped = resolveChapterFromPath(pathname);
    if (mapped) {
      setActiveChapter(mapped);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const cores = navigator.hardwareConcurrency || 8;
    const resolvedFx: FxTier = reducedMotion || cores <= 2 ? 'static' : 'high';
    setFxTier(resolvedFx);
    document.documentElement.setAttribute('data-fx', resolvedFx);
    document.documentElement.setAttribute('data-theme', theme);

    if (resolvedFx === 'static') return;

    let rafId = 0;
    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };
      rafId = window.requestAnimationFrame(raf);
    } catch {
      // Headless or SSR environment without full scroll container support
    }
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      return next;
    });
  }, []);

  const value = useMemo<TalosClearingContextValue>(
    () => ({
      connected: stream.connected,
      mode: stream.mode,
      rows: stream.rows,
      kpiMetrics: stream.kpiMetrics,
      activeChapter,
      setActiveChapter,
      fxTier,
      theme,
      toggleTheme,
      updateRowState: stream.updateRowState,
      resetRows: stream.resetRows,
    }),
    [activeChapter, fxTier, stream, theme, toggleTheme]
  );

  return <TalosClearingContext.Provider value={value}>{children}</TalosClearingContext.Provider>;
}

export function useTalosClearing(): TalosClearingContextValue {
  const ctx = useContext(TalosClearingContext);
  const fallback = useEscrowStream();
  const [activeChapter, setActiveChapter] = useState<StoryChapterId>('OVERVIEW');
  const [theme, setTheme] = useState<InstitutionalTheme>('dark');

  if (ctx) return ctx;

  return {
    connected: fallback.connected,
    mode: fallback.mode,
    rows: fallback.rows,
    kpiMetrics: fallback.kpiMetrics,
    activeChapter,
    setActiveChapter,
    fxTier: 'high',
    theme,
    toggleTheme: () => setTheme((p) => (p === 'dark' ? 'light' : 'dark')),
    updateRowState: fallback.updateRowState,
    resetRows: fallback.resetRows,
  };
}
