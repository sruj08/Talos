'use client';

import React from 'react';
import { useTalosClearing } from '../../context/TalosClearingContext';

export interface TalosLogoMarkProps {
  /** Pixel dimension of the square mark container (default: 36) */
  size?: number;
  className?: string;
}

/**
 * Official TALOS 3D Machined PayPal-Blue Brand Logo Mark (`talos-logo-light.webp` / `talos-logo-dark.webp`).
 * Renders a single transparent-background `.webp` image with hydration-safe attributes.
 */
export function TalosLogoMark({ size = 36, className = '' }: TalosLogoMarkProps) {
  let isDark = false;
  try {
    const ctx = useTalosClearing();
    isDark = ctx?.theme === 'dark';
  } catch {
    isDark = false;
  }

  const src = isDark ? '/assets/talos-logo-dark.webp' : '/assets/talos-logo-light.webp';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
      data-testid="talos-logo-mark"
      suppressHydrationWarning
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        decoding="async"
        suppressHydrationWarning
        className="w-full h-full object-contain block"
      />
    </span>
  );
}
