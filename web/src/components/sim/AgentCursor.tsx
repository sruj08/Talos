'use client';

import React, { useLayoutEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Bot } from 'lucide-react';
import type { CursorTarget, RunStep } from '../../lib/sim/run-types';

interface AgentCursorProps {
  paneRef: React.RefObject<HTMLDivElement | null>;
  target: CursorTarget | null;
  status: string | null;
  tone: RunStep['tone'];
}

const TONE_CLASS: Record<RunStep['tone'], string> = {
  neutral: 'tx-chip tx-chip--paypal',
  danger: 'tx-chip tx-chip--crimson',
  success: 'tx-chip tx-chip--emerald',
  warning: 'tx-chip tx-chip--amber',
};

/** The autonomous agent's pointer. It glides (critically damped spring) to whatever the agent is inspecting. */
export function AgentCursor({ paneRef, target, status, tone }: AgentCursorProps) {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 24, y: 24 });

  useLayoutEffect(() => {
    const pane = paneRef.current;
    if (!pane || !target) return;
    const el = pane.querySelector<HTMLElement>(`[data-cursor-target="${target}"]`);
    if (!el) return;
    const p = pane.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left - p.left + r.width * 0.6, 8), p.width - 180);
    const y = Math.min(Math.max(r.top - p.top + r.height * 0.55, 8), p.height - 56);
    setPos({ x, y });
  }, [paneRef, target, status]);

  if (!target) return null;

  return (
    <motion.div
      className="sim-cursor"
      data-testid="agent-cursor"
      aria-hidden="true"
      initial={false}
      animate={{ x: pos.x, y: pos.y }}
      transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.6 }}
    >
      <div className="flex items-start gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#003087] text-white shadow-[0_2px_12px_rgba(0,20,53,0.25)]">
          <Bot className="h-4 w-4" strokeWidth={1.75} />
        </span>
        {status ? (
          <motion.span
            key={status}
            className={`${TONE_CLASS[tone]} shadow-[0_2px_12px_rgba(0,20,53,0.12)] !bg-[var(--surface)]`}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {status}
          </motion.span>
        ) : null}
      </div>
    </motion.div>
  );
}
