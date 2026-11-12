'use client';

import React, { useState } from 'react';
import { ChevronDown, Code2, ShieldCheck } from 'lucide-react';

export interface TechnicalProofDrawerProps {
  title?: string;
  buttonLabel?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (nextOpen: boolean) => void;
  testId?: string;
  buttonTestId?: string;
  summaryBadge?: string;
  children: React.ReactNode;
}

export function TechnicalProofDrawer(
  props: TechnicalProofDrawerProps
): React.JSX.Element {
  const {
    title = 'Cryptographic & Runtime Verification Telemetry',
    buttonLabel = 'View Technical Proof',
    defaultOpen = false,
    open,
    onToggle,
    testId,
    buttonTestId,
    summaryBadge = 'Ed25519 + RFC 9421 + ONNX AST',
    children,
  } = props;

  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const isControlled = typeof open === 'boolean';
  const isOpen = isControlled ? open : internalOpen;

  const handleToggle = () => {
    const nextState = !isOpen;
    if (!isControlled) {
      setInternalOpen(nextState);
    }
    if (onToggle) {
      onToggle(nextState);
    }
  };

  return (
    <div className="w-full">
      <div className="tx-well px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="icon-medallion-paypal h-7 w-7">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink truncate">
              {title}
            </p>
            <p className="text-[11px] text-ink-muted truncate">
              On-demand audit drawer ({summaryBadge})
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid={buttonTestId ?? 'btn-toggle-technical-proof'}
          aria-expanded={isOpen}
          onClick={handleToggle}
          className="btn-paypal-secondary !min-h-[30px] h-7 px-3 py-1 text-xs font-semibold"
        >
          <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{buttonLabel}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        data-testid={testId ?? 'technical-proof-drawer'}
        data-proof-open={isOpen ? 'true' : 'false'}
        className={`grid bento-drawer-transition ${
          isOpen
            ? 'grid-rows-[1fr] opacity-100 mt-3'
            : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
