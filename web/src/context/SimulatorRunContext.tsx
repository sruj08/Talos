'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePoisonedStoreSim } from '../hooks/usePoisonedStoreSim';
import {
  GUIDED_SCENARIOS,
  GuidedScenarioId,
  HazardKey,
  Hazards,
  RunMode,
  RunOutcome,
} from '../lib/sim/run-types';

export interface RunRecord extends RunOutcome {
  runId: string;
  finishedAt: string;
}

export interface SimulatorRunContextValue {
  hazards: Hazards;
  mode: RunMode;
  capUsd: number;
  allowanceSignedAt: string | null;
  history: RunRecord[];
  lastRun: RunRecord | null;
  totals: { savedUsd: number; lostUsd: number; settledUsd: number; refundedUsd: number; runs: number };
  setMode: (mode: RunMode) => void;
  toggleHazard: (key: HazardKey) => void;
  applyScenario: (id: GuidedScenarioId) => void;
  setAllowance: (capUsd: number) => void;
  recordOutcome: (outcome: RunOutcome) => void;
}

const SimulatorRunContext = createContext<SimulatorRunContextValue | null>(null);

function sumBy(history: RunRecord[], key: 'savedUsd' | 'lostUsd' | 'settledUsd' | 'refundedUsd'): number {
  return history.reduce((acc, r) => acc + r[key], 0);
}

function useSimulatorRunState(): SimulatorRunContextValue {
  const acts = usePoisonedStoreSim();
  const [hazards, setHazards] = useState<Hazards>(GUIDED_SCENARIOS.SCAM.hazards);
  const [mode, setMode] = useState<RunMode>('PROTECTED');
  const [capUsd, setCapUsd] = useState<number>(300);
  const [allowanceSignedAt, setAllowanceSignedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<RunRecord[]>([]);

  const toggleHazard = useCallback((key: HazardKey) => {
    setHazards((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const applyScenario = useCallback((id: GuidedScenarioId) => {
    setHazards({ ...GUIDED_SCENARIOS[id].hazards });
  }, []);

  const setAllowance = useCallback((next: number) => {
    setCapUsd(Math.max(1, Math.round(next)));
    setAllowanceSignedAt(new Date().toISOString());
  }, []);

  const { runAct1PoisonedAttack, runAct2HappyPathCapture, runAct3SlaBreachAndStepUp } = acts;

  const recordOutcome = useCallback(
    (outcome: RunOutcome) => {
      const record: RunRecord = {
        ...outcome,
        runId: `run-${Date.now().toString(36)}`,
        finishedAt: new Date().toISOString(),
      };
      setHistory((prev) => [record, ...prev].slice(0, 12));
      // Protected runs settle through the same escrow events the ledger, SLA board and step-up desk consume.
      if (outcome.ledgerAct === 'ACT_1') void runAct1PoisonedAttack();
      if (outcome.ledgerAct === 'ACT_2') void runAct2HappyPathCapture();
      if (outcome.ledgerAct === 'ACT_3') void runAct3SlaBreachAndStepUp();
    },
    [runAct1PoisonedAttack, runAct2HappyPathCapture, runAct3SlaBreachAndStepUp]
  );

  return useMemo(
    () => ({
      hazards,
      mode,
      capUsd,
      allowanceSignedAt,
      history,
      lastRun: history[0] ?? null,
      totals: {
        savedUsd: sumBy(history, 'savedUsd'),
        lostUsd: sumBy(history, 'lostUsd'),
        settledUsd: sumBy(history, 'settledUsd'),
        refundedUsd: sumBy(history, 'refundedUsd'),
        runs: history.length,
      },
      setMode,
      toggleHazard,
      applyScenario,
      setAllowance,
      recordOutcome,
    }),
    [allowanceSignedAt, applyScenario, capUsd, hazards, history, mode, recordOutcome, setAllowance, toggleHazard]
  );
}

export function SimulatorRunProvider({ children }: { children: React.ReactNode }) {
  const value = useSimulatorRunState();
  return <SimulatorRunContext.Provider value={value}>{children}</SimulatorRunContext.Provider>;
}

/** Falls back to local state when rendered outside the provider (static render tests). */
export function useSimulatorRun(): SimulatorRunContextValue {
  const ctx = useContext(SimulatorRunContext);
  const local = useSimulatorRunState();
  return ctx ?? local;
}
