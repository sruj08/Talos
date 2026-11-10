'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type RailTone = 'crimson' | 'paypal' | 'emerald' | 'amber' | 'obsidian';

const TONE_CLASS: Record<RailTone, string> = {
  crimson: 'rail-card--crimson',
  paypal: 'rail-card--paypal',
  emerald: 'rail-card--emerald',
  amber: 'rail-card--amber',
  obsidian: 'rail-card--obsidian',
};

export interface RailCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: RailTone;
  eyebrow?: string;
  title?: string;
  metric?: React.ReactNode;
  children?: React.ReactNode;
}

export function RailCard({
  tone = 'paypal',
  eyebrow,
  title,
  metric,
  children,
  className,
  ...props
}: RailCardProps) {
  return (
    <div className={cn('rail-card', TONE_CLASS[tone], className)} {...props}>
      {eyebrow ? <span className="paypal-label text-ink-muted">{eyebrow}</span> : null}
      {title ? <h2 className="paypal-title-sm text-ink">{title}</h2> : null}
      {children}
      {metric ? <div className="font-mono text-sm font-medium text-ink tabular-nums">{metric}</div> : null}
    </div>
  );
}
