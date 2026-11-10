'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { WebGLErrorBoundary, WebGLFallback } from './webgl-error-boundary';
import {
  SILK_DEFAULT_ACCENT,
  SILK_DEFAULT_BASE,
  SILK_DEFAULT_MID,
  SILK_DEFAULT_SHEEN,
  useSilkAuroraGl,
  type SilkAuroraGlSettings,
} from './use-silk-aurora-gl';

export interface SilkAuroraProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  description?: string;
  baseColor?: string;
  midColor?: string;
  sheenColor?: string;
  accentColor?: string;
  speed?: number;
  intensity?: number;
  grain?: number;
  vignette?: number;
  mouseInfluence?: number;
  interactive?: boolean;
  contentClassName?: string;
  children?: React.ReactNode;
}

export function SilkAurora({
  title,
  subtitle,
  description,
  baseColor = SILK_DEFAULT_BASE,
  midColor = SILK_DEFAULT_MID,
  sheenColor = SILK_DEFAULT_SHEEN,
  accentColor = SILK_DEFAULT_ACCENT,
  speed = 1,
  intensity = 1,
  grain = 0.85,
  vignette = 1,
  mouseInfluence = 1,
  interactive = true,
  className,
  contentClassName,
  children,
  style,
  ...props
}: SilkAuroraProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [hasWebGLError, setHasWebGLError] = React.useState(false);

  const settings = React.useMemo<SilkAuroraGlSettings>(
    () => ({
      baseColor,
      midColor,
      sheenColor,
      accentColor,
      speed,
      intensity,
      grain,
      vignette,
      mouseInfluence,
      interactive,
    }),
    [
      accentColor,
      baseColor,
      grain,
      intensity,
      interactive,
      midColor,
      mouseInfluence,
      sheenColor,
      speed,
      vignette,
    ],
  );

  useSilkAuroraGl(containerRef, canvasRef, settings, hasWebGLError, setHasWebGLError);

  const hasOverlay = Boolean(title || subtitle || description || children);
  const overlay = hasOverlay ? (
    <div className={cn('relative z-10 w-full', contentClassName)}>
      {subtitle ? <p className="paypal-label text-ink-muted mb-4">{subtitle}</p> : null}
      {title ? <h2 className="paypal-hero text-ink max-w-[18ch]">{title}</h2> : null}
      {description ? (
        <p className="paypal-body text-ink-secondary mt-6 max-w-[40ch]">{description}</p>
      ) : null}
      {children}
    </div>
  ) : null;

  const shellClass = cn(
    'relative flex w-full items-center overflow-hidden bg-[#07080D] text-[#F8FAFC]',
    className,
  );

  const fallbackShell = (
    <div className={shellClass} style={style} {...props}>
      <WebGLFallback className="absolute inset-0" />
      {overlay}
    </div>
  );

  if (hasWebGLError) {
    return fallbackShell;
  }

  return (
    <WebGLErrorBoundary fallback={fallbackShell}>
      <div ref={containerRef} className={shellClass} style={style} {...props}>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#07080D]"
          style={{ opacity: 0.28 }}
        />
        {overlay}
      </div>
    </WebGLErrorBoundary>
  );
}

export default SilkAurora;
