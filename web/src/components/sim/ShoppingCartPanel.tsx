'use client';

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { formatUsd } from '../../lib/sim/storefront-catalog';
import type { CartLine, RunMode } from '../../lib/sim/run-types';

interface ShoppingCartPanelProps {
  lines: CartLine[];
  capUsd: number;
  mode: RunMode;
}

export function ShoppingCartPanel({ lines, capUsd, mode }: ShoppingCartPanelProps) {
  const reduce = useReducedMotion();
  const subtotal = lines.reduce((acc, l) => acc + l.priceUsd, 0);
  const autoSpend = lines.filter((l) => !l.needsApproval).reduce((acc, l) => acc + l.priceUsd, 0);
  const over = subtotal > capUsd;
  const ratio = Math.min(1, subtotal / Math.max(capUsd, 1));

  return (
    <section className="tx-card p-4 space-y-3" data-testid="live-shopping-cart" aria-label="Agent shopping cart">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShoppingCart className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Live cart
        </h3>
        <span className="text-xs text-ink-muted tx-num">{lines.length} {lines.length === 1 ? 'item' : 'items'}</span>
      </div>

      <ul className="space-y-2 min-h-[44px]" aria-live="polite">
        <AnimatePresence initial={false}>
          {lines.length === 0 ? (
            <li key="empty" className="text-sm text-ink-muted">Empty. Press play to let the agent shop.</li>
          ) : (
            lines.map((l) => (
              <motion.li
                key={`${l.sku}-${l.storeId}`}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-ink truncate">{l.title}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {l.needsApproval ? <span className="tx-chip tx-chip--amber">Needs approval</span> : null}
                  <span className="tx-num font-medium text-ink">{formatUsd(l.priceUsd)}</span>
                </span>
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </ul>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-secondary">Subtotal vs ${capUsd} allowance</span>
          <span className={`tx-num font-semibold ${over ? 'text-ink-amber' : 'text-ink'}`} data-testid="cart-subtotal">
            {formatUsd(subtotal)}
          </span>
        </div>
        <div className="h-1.5 rounded-xs bg-[var(--surface-well)] overflow-hidden" aria-hidden="true">
          <motion.div
            className={`h-full rounded-xs ${over ? 'bg-[#FFB600]' : 'bg-[#0070E0]'}`}
            style={{ transformOrigin: 'left center' }}
            initial={false}
            animate={{ scaleX: ratio }}
            transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.4 }}
          />
        </div>
        {over ? (
          <p className="text-xs text-ink-secondary">
            {mode === 'PROTECTED'
              ? `Agent may spend ${formatUsd(autoSpend)} alone. The rest waits for Approve with PayPal.`
              : 'No allowance enforced. The agent spends past the cap.'}
          </p>
        ) : null}
      </div>
    </section>
  );
}
