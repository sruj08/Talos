"use client";

import React from "react";

export interface GridPatternOverlayProps {
  squares?: [number, number][];
  className?: string;
}

/**
 * Adapted from 21st.dev/@efferd/components/grid-feature-cards
 * Subtle architectural SVG coordinate grid for minimalist fintech boxes.
 */
export function GridPatternOverlay({
  squares = [
    [2, 1],
    [4, 2],
    [6, 1],
    [5, 3],
  ],
  className = "",
}: GridPatternOverlayProps) {
  const patternId = React.useId();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 right-0 h-24 w-40 overflow-hidden tx-grid-mask ${className}`}
    >
      <svg className="h-full w-full text-ink opacity-[0.04]" viewBox="0 0 160 96" fill="none">
        <defs>
          <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse" x="-1" y="-1">
            <path d="M.5 20V.5H20" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
        <svg x="-1" y="-1" className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect
              key={`${x}-${y}-${index}`}
              strokeWidth="0"
              width="19"
              height="19"
              x={x * 20 + 1}
              y={y * 20 + 1}
              fill="currentColor"
              className="opacity-25"
            />
          ))}
        </svg>
      </svg>
    </div>
  );
}

export type TelemetryTone = "paypal" | "emerald" | "amber" | "crimson" | "neutral";

export interface SegmentedTelemetryBarProps {
  value: number;
  max: number;
  segments?: number;
  tone?: TelemetryTone;
  labelLeft?: string;
  labelRight?: string;
  className?: string;
}

const TONE_FILL_CLASS: Record<TelemetryTone, string> = {
  paypal: "tx-tick-paypal",
  emerald: "tx-tick-emerald",
  amber: "tx-tick-amber",
  crimson: "tx-tick-crimson",
  neutral: "tx-tick-neutral",
};

/**
 * Adapted from 21st.dev/@astralyxdev/components/rate-limit-meter
 * Minimalist monochrome/slate multi-segment telemetry tick meter.
 */
export function SegmentedTelemetryBar({
  value,
  max,
  segments = 20,
  tone = "paypal",
  labelLeft,
  labelRight,
  className = "",
}: SegmentedTelemetryBarProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const activeCount = Math.round(ratio * segments);
  const activeClass = TONE_FILL_CLASS[tone];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(labelLeft || labelRight) && (
        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-ink-muted">
          <span>{labelLeft}</span>
          <span className="text-ink-secondary">{labelRight}</span>
        </div>
      )}
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: segments }).map((_, idx) => {
          const isFilled = idx < activeCount;
          return (
            <span
              key={idx}
              className={`h-1.5 rounded-xs ${isFilled ? activeClass : "tx-tick-empty"}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export interface UptimeStatusRibbonProps {
  serviceName: string;
  uptimePercent?: string;
  ticks?: number;
  tone?: "emerald" | "paypal" | "amber";
}

/**
 * Adapted from 21st.dev/@ham7a311/components/uptime-ribbon
 * Institutional 24-tick verification ribbon for settlement & enclave status panels.
 */
export function UptimeStatusRibbon({
  serviceName,
  uptimePercent = "99.99%",
  ticks = 24,
  tone = "paypal",
}: UptimeStatusRibbonProps) {
  const tickClass = TONE_FILL_CLASS[tone];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium text-ink">
          <span className="w-1.5 h-1.5 rounded-xs dot-emerald" />
          <span>{serviceName}</span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-ink-secondary">{uptimePercent}</span>
      </div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${ticks}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: ticks }).map((_, idx) => (
          <span key={idx} className={`h-2 rounded-xs ${tickClass} opacity-80`} />
        ))}
      </div>
    </div>
  );
}

export interface BreakdownSegment {
  label: string;
  valueLabel: string;
  weight: number;
  tone: TelemetryTone;
}

/**
 * Adapted from 21st.dev/@dhxwhy/components/breakdown-stat-card
 * Splits a financial metric into proportional segments with a high-contrast tabular legend.
 */
export function BreakdownStatRail({
  segments,
  className = "",
}: {
  segments: BreakdownSegment[];
  className?: string;
}) {
  const totalWeight = segments.reduce((acc, item) => acc + Math.max(1, item.weight), 0);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex h-1.5 w-full overflow-hidden rounded-xs gap-0.5" aria-hidden="true">
        {segments.map((seg) => {
          const widthPct = `${Math.round((Math.max(1, seg.weight) / totalWeight) * 100)}%`;
          return (
            <div
              key={seg.label}
              className={`h-full rounded-xs ${TONE_FILL_CLASS[seg.tone]}`}
              style={{ width: widthPct }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px]">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-xs ${TONE_FILL_CLASS[seg.tone]}`} />
            <span className="text-ink-secondary">{seg.label}</span>
            <span className="font-mono font-semibold tabular-nums text-ink">{seg.valueLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
