'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AgentRun } from '../lib/sim/run-types';

export type PlayerState = 'idle' | 'playing' | 'paused' | 'done';

export const STEP_INTERVAL_MS = 900;

/**
 * Plays an AgentRun one step at a time. Pausable, replayable and skippable,
 * with no work scheduled while paused or finished.
 */
export function useAgentRunPlayer(run: AgentRun, onComplete?: (run: AgentRun) => void) {
  const [index, setIndex] = useState(-1);
  const [state, setState] = useState<PlayerState>('idle');
  const completeRef = useRef(onComplete);
  const reportedRef = useRef<AgentRun | null>(null);
  completeRef.current = onComplete;

  // A new script resets the player to its first frame.
  useEffect(() => {
    setIndex(-1);
    setState('idle');
    reportedRef.current = null;
  }, [run]);

  useEffect(() => {
    if (state !== 'playing') return undefined;
    if (index >= run.steps.length - 1) {
      setState('done');
      return undefined;
    }
    const timer = window.setTimeout(() => setIndex((i) => i + 1), index < 0 ? 120 : STEP_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [index, run.steps.length, state]);

  useEffect(() => {
    if (state === 'done' && reportedRef.current !== run) {
      reportedRef.current = run;
      completeRef.current?.(run);
    }
  }, [run, state]);

  const play = useCallback(() => {
    if (state === 'done') {
      setIndex(-1);
      reportedRef.current = null;
    }
    setState('playing');
  }, [state]);

  const pause = useCallback(() => setState((s) => (s === 'playing' ? 'paused' : s)), []);

  const replay = useCallback(() => {
    reportedRef.current = null;
    setIndex(-1);
    setState('playing');
  }, []);

  const skipToEnd = useCallback(() => {
    setIndex(run.steps.length - 1);
    setState('done');
  }, [run.steps.length]);

  const step = index >= 0 ? run.steps[index] : null;
  const progress = run.steps.length ? (index + 1) / run.steps.length : 0;

  return { index, step, state, progress, play, pause, replay, skipToEnd };
}
