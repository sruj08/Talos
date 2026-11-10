'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { EscrowBlotterRow, KpiMetricsSummary, useEscrowStream } from '../hooks/useEscrowStream';
import { EscrowLifecycleState } from '../lib/phase6-events';

export type StoryChapterId =
  | 'OVERVIEW'
  | 'STORYLINE'
  | 'CHAPTER_1_MANDATE'
  | 'CHAPTER_2_ARENA'
  | 'CHAPTER_3_BLOTTER'
  | 'CHAPTER_4_SLA'
  | 'CHAPTER_5_STEP_UP'
  | 'COMMAND_CENTER';

export type FxTier = 'high' | 'static';
export type InstitutionalTheme = 'light' | 'dark';
export type DemoViewMode = 'COMMAND_CENTER' | 'STEP_GUIDE';
export type DemoStepNumber = 1 | 2 | 3 | 4;

export interface TalosClearingContextValue {
  connected: boolean;
  mode: 'LIVE_WS' | 'SIMULATION_FALLBACK';
  rows: EscrowBlotterRow[];
  kpiMetrics: KpiMetricsSummary;
  activeChapter: StoryChapterId;
  setActiveChapter: (chapter: StoryChapterId) => void;
  demoViewMode: DemoViewMode;
  setDemoViewMode: (mode: DemoViewMode) => void;
  activeDemoStep: DemoStepNumber;
  setActiveDemoStep: (step: DemoStepNumber) => void;
  fxTier: FxTier;
  theme: InstitutionalTheme;
  toggleTheme: () => void;
  updateRowState: (escrowId: string, newState: EscrowLifecycleState, patch?: Partial<EscrowBlotterRow>) => void;
  resetRows: () => void;
}

const TalosClearingContext = createContext<TalosClearingContextValue | null>(null);

function resolveChapterFromPath(pathname: string | null): StoryChapterId | null {
  if (!pathname) return null;
  if (pathname.startsWith('/story')) return 'STORYLINE';
  if (pathname.startsWith('/mandates')) return 'CHAPTER_1_MANDATE';
  if (pathname.startsWith('/simulator')) return 'CHAPTER_2_ARENA';
  if (pathname.startsWith('/blotter')) return 'CHAPTER_3_BLOTTER';
  if (pathname.startsWith('/sla')) return 'CHAPTER_4_SLA';
  if (pathname.startsWith('/step-up')) return 'CHAPTER_5_STEP_UP';
  if (pathname.startsWith('/command-center')) return 'COMMAND_CENTER';
  if (pathname === '/') return 'OVERVIEW';
  return null;
}

export function TalosClearingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const stream = useEscrowStream();
  const [activeChapter, setActiveChapter] = useState<StoryChapterId>('OVERVIEW');
  const [demoViewMode, setDemoViewMode] = useState<DemoViewMode>('COMMAND_CENTER');
  const [activeDemoStep, setActiveDemoStep] = useState<DemoStepNumber>(1);
  const [fxTier, setFxTier] = useState<FxTier>('high');
  const [theme, setTheme] = useState<InstitutionalTheme>('light');

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
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
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
      demoViewMode,
      setDemoViewMode,
      activeDemoStep,
      setActiveDemoStep,
      fxTier,
      theme,
      toggleTheme,
      updateRowState: stream.updateRowState,
      resetRows: stream.resetRows,
    }),
    [activeChapter, activeDemoStep, demoViewMode, fxTier, stream, theme, toggleTheme]
  );

  return <TalosClearingContext.Provider value={value}>{children}</TalosClearingContext.Provider>;
}

export function useTalosClearing(): TalosClearingContextValue {
  const ctx = useContext(TalosClearingContext);
  const fallback = useEscrowStream();
  const [activeChapter, setActiveChapter] = useState<StoryChapterId>('OVERVIEW');
  const [demoViewMode, setDemoViewMode] = useState<DemoViewMode>('COMMAND_CENTER');
  const [activeDemoStep, setActiveDemoStep] = useState<DemoStepNumber>(1);
  const [theme, setTheme] = useState<InstitutionalTheme>('light');

  if (ctx) return ctx;

  return {
    connected: fallback.connected,
    mode: fallback.mode,
    rows: fallback.rows,
    kpiMetrics: fallback.kpiMetrics,
    activeChapter,
    setActiveChapter,
    demoViewMode,
    setDemoViewMode,
    activeDemoStep,
    setActiveDemoStep,
    fxTier: 'high',
    theme,
    toggleTheme: () => setTheme((p) => (p === 'light' ? 'dark' : 'light')),
    updateRowState: fallback.updateRowState,
    resetRows: fallback.resetRows,
  };
}

