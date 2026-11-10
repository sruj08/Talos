'use client';

import React from 'react';
import {
  ScrollProgress,
  ScrollProgressProvider,
} from '@animate-ui/react/primitives/scroll-progress';
import { TooltipProvider } from '@animate-ui/react/primitives/tooltip';
import { AnimateUIProvider } from '@animate-ui/react/provider';

export function LandingScrollChrome({ children }: { children: React.ReactNode }) {
  return (
    <AnimateUIProvider reducedMotion="user">
      <TooltipProvider openDelay={80} closeDelay={120}>
        <ScrollProgressProvider global>
          <div className="scroll-progress-rail" aria-hidden="true">
            <ScrollProgress mode="scaleX" className="scroll-progress-bar h-full w-full" />
          </div>
          {children}
        </ScrollProgressProvider>
      </TooltipProvider>
    </AnimateUIProvider>
  );
}
