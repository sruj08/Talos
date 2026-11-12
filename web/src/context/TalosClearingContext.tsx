'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { EscrowBlotterRow, KpiMetricsSummary, useEscrowStream } from '../hooks/useEscrowStream';
import { EscrowLifecycleState } from '../lib/phase6-events';
import {
  AuthSession,
  DemoPersona,
  EMPTY_AUTH_SESSION,
  buildPersonaSession,
} from '../lib/auth-personas';

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
export type WorkspaceTabId =
  | 'ALL'
  | 'ALLOWANCE'
  | 'SIMULATOR'
  | 'BLOTTER'
  | 'SLA'
  | 'STEP_UP';

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
  workspaceTab: WorkspaceTabId;
  setWorkspaceTab: (tab: WorkspaceTabId) => void;
  fxTier: FxTier;
  theme: InstitutionalTheme;
  toggleTheme: () => void;
  authSession: AuthSession;
  signInWithPersona: (persona: DemoPersona) => void;
  completeOAuthHandshake: (email: string, workspace: string) => void;
  updateAuthSession: (patch: Partial<AuthSession>) => void;
  signOut: () => void;
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
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTabId>('ALL');
  const [fxTier, setFxTier] = useState<FxTier>('high');
  const [theme, setTheme] = useState<InstitutionalTheme>('light');
  const [authSession, setAuthSession] = useState<AuthSession>(EMPTY_AUTH_SESSION);

  useEffect(() => {
    const mapped = resolveChapterFromPath(pathname);
    if (mapped) setActiveChapter(mapped);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const cores = navigator.hardwareConcurrency || 8;
    const resolvedFx: FxTier = reducedMotion || cores <= 2 ? 'static' : 'high';
    setFxTier(resolvedFx);
    document.documentElement.setAttribute('data-fx', resolvedFx);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
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

  const signInWithPersona = useCallback((persona: DemoPersona) => {
    setAuthSession(buildPersonaSession(persona));
  }, []);

  const completeOAuthHandshake = useCallback((email: string, workspace: string) => {
    setAuthSession((prev) => ({
      ...prev,
      authenticated: true,
      email,
      workspace: workspace || prev.workspace || 'PayPal Sandbox Workspace',
      displayName: prev.displayName || email.split('@')[0] || 'PayPal Operator',
      oauthState: 'connected',
      allowanceUsd: prev.allowanceUsd || 300,
    }));
  }, []);

  const updateAuthSession = useCallback((patch: Partial<AuthSession>) => {
    setAuthSession((prev) => ({ ...prev, ...patch }));
  }, []);

  const signOut = useCallback(() => setAuthSession(EMPTY_AUTH_SESSION), []);

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
      workspaceTab,
      setWorkspaceTab,
      fxTier,
      theme,
      toggleTheme,
      authSession,
      signInWithPersona,
      completeOAuthHandshake,
      updateAuthSession,
      signOut,
      updateRowState: stream.updateRowState,
      resetRows: stream.resetRows,
    }),
    [
      activeChapter,
      activeDemoStep,
      authSession,
      completeOAuthHandshake,
      demoViewMode,
      fxTier,
      signInWithPersona,
      signOut,
      stream,
      theme,
      toggleTheme,
      updateAuthSession,
      workspaceTab,
    ]
  );

  return <TalosClearingContext.Provider value={value}>{children}</TalosClearingContext.Provider>;
}

export function useTalosClearing(): TalosClearingContextValue {
  const ctx = useContext(TalosClearingContext);
  const fallback = useEscrowStream();
  const [activeChapter, setActiveChapter] = useState<StoryChapterId>('OVERVIEW');
  const [demoViewMode, setDemoViewMode] = useState<DemoViewMode>('COMMAND_CENTER');
  const [activeDemoStep, setActiveDemoStep] = useState<DemoStepNumber>(1);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTabId>('ALL');
  const [theme, setTheme] = useState<InstitutionalTheme>('light');
  const [authSession, setAuthSession] = useState<AuthSession>(EMPTY_AUTH_SESSION);

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
    workspaceTab,
    setWorkspaceTab,
    fxTier: 'high',
    theme,
    toggleTheme: () => setTheme((p) => (p === 'light' ? 'dark' : 'light')),
    authSession,
    signInWithPersona: (persona) => setAuthSession(buildPersonaSession(persona)),
    completeOAuthHandshake: (email, workspace) =>
      setAuthSession((prev) => ({
        ...prev,
        authenticated: true,
        email,
        workspace,
        displayName: email.split('@')[0] || 'PayPal Operator',
        oauthState: 'connected',
      })),
    updateAuthSession: (patch) => setAuthSession((prev) => ({ ...prev, ...patch })),
    signOut: () => setAuthSession(EMPTY_AUTH_SESSION),
    updateRowState: fallback.updateRowState,
    resetRows: fallback.resetRows,
  };
}
