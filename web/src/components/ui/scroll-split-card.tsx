'use client';

import React, { useRef, useState, type ReactNode, type RefObject } from 'react';
import { cn } from '@/lib/utils';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { Layers, Sparkles } from 'lucide-react';

export interface ScrollSplitCardItem {
  stageCode?: string;
  metric?: string;
  metricLabel?: string;
  protocolTag?: string;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  accentColor?: string;
  icon?: ReactNode;
}

export interface ScrollSplitCardProps {
  className?: string;
  imageSrc: string;
  cards: ScrollSplitCardItem[];
  containerRef?: RefObject<HTMLElement | null>;
  startHint?: string;
  endHint?: string;
}

function SplitFace({
  i,
  imageSrc,
  card,
  borderRadius,
}: {
  i: number;
  imageSrc: string;
  card: ScrollSplitCardItem;
  borderRadius: MotionValue<string>;
}) {
  const stageCode = card.stageCode ?? `STAGE 0${i + 1}`;
  const metric = card.metric ?? (i === 0 ? '$300.00' : i === 1 ? '2.84ms' : '+$231.00');
  const metricLabel = card.metricLabel ?? (i === 0 ? 'Ed25519 Cap' : i === 1 ? 'DOM Sanitizer' : 'PayPal Escrow');
  const protocolTag = card.protocolTag ?? (i === 0 ? 'RFC 9421' : i === 1 ? 'lol_html' : 'Orders v2');

  return (
    <>
      <motion.div
        className="absolute inset-0 overflow-hidden bg-[#06152D] border border-[#173668]"
        style={{
          zIndex: 2,
          borderRadius,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <div
          className="absolute inset-0 h-full w-[300%] opacity-90"
          style={{
            left: `${-100 * i}%`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#06152D]/90 px-2 py-1 font-mono text-[11px] font-semibold text-[#F1F5F9] border border-[rgba(147,197,253,0.22)]">
            <span className="w-1.5 h-1.5 rounded-xs bg-[#60A5FA]" />
            {stageCode}
          </span>
          <span className="rounded-[4px] bg-[#06152D]/90 px-2 py-0.5 font-mono text-[11px] text-[#93C5FD] border border-[rgba(147,197,253,0.18)]">
            {protocolTag}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 rounded-[8px] bg-[#06152D]/92 p-3 border border-[rgba(147,197,253,0.20)] pointer-events-none space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-white">{card.title}</span>
            <span className="font-mono text-sm font-bold tabular-nums text-[#93C5FD]">{metric}</span>
          </div>
          <p className="text-xs text-[#CBD5E1] truncate">{metricLabel}</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col justify-between overflow-hidden p-5 bg-[#081C3D] text-[#F8FAFC] border border-[#1B4284]"
        style={{
          transform: 'rotateY(180deg)',
          zIndex: 1,
          borderRadius,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-[rgba(59,130,246,0.16)] border border-[rgba(147,197,253,0.26)] text-[#93C5FD]">
            {card.icon}
          </span>
          <span className="rounded-[4px] bg-[rgba(59,130,246,0.14)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#93C5FD] border border-[rgba(147,197,253,0.22)]">
            {stageCode} · {protocolTag}
          </span>
        </div>

        <div className="rounded-[8px] bg-[#051229] p-3.5 border border-[rgba(147,197,253,0.18)] space-y-1">
          <p className="font-mono text-[11px] text-[#93C5FD]">{metricLabel}</p>
          <p className="text-2xl sm:text-3xl tx-num-display text-white">{metric}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white">{card.title}</h3>
          <p className="text-xs leading-relaxed text-[#CBD5E1]">{card.description}</p>
        </div>
      </motion.div>
    </>
  );
}

export function ScrollSplitCard({
  className,
  imageSrc,
  cards,
  containerRef: externalContainerRef,
  startHint = 'Scroll or click any stage to inspect specifications',
  endHint = 'Three stages. One PayPal-backed clearinghouse',
}: ScrollSplitCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [manualFlipped, setManualFlipped] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: externalContainerRef,
    offset: ['start 90%', 'center 42%'],
  });

  const leftX = useTransform(scrollYProgress, [0, 0.35, 1], [0, -8, -12]);
  const rightX = useTransform(scrollYProgress, [0, 0.35, 1], [0, 8, 12]);
  const borderRadiusLeft = useTransform(scrollYProgress, [0, 0.45], ['10px 0px 0px 10px', '10px']);
  const borderRadiusMiddle = useTransform(scrollYProgress, [0, 0.45], ['0px', '10px']);
  const borderRadiusRight = useTransform(scrollYProgress, [0, 0.45], ['0px 10px 10px 0px', '10px']);

  const radii = [borderRadiusLeft, borderRadiusMiddle, borderRadiusRight];
  const xs = [leftX, undefined, rightX] as const;

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <div className="w-full rounded-[12px] tx-card p-4 sm:p-5 space-y-3.5">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <p className="paypal-label text-ink-secondary">
            {manualFlipped ? endHint : startHint}
          </p>
          <button
            type="button"
            onClick={() => setManualFlipped((v) => !v)}
            className="btn-paypal-secondary !min-h-[32px] !px-3 !py-1 !text-xs"
          >
            {manualFlipped ? (
              <>
                <Layers className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Show Optical Hardware Plate</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Flip Stage Specs</span>
              </>
            )}
          </button>
        </div>

        <div
          style={{ perspective: '1200px' }}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-0 h-auto md:h-[300px] w-full max-w-5xl mx-auto"
        >
          {cards.slice(0, 3).map((card, i) => (
            <motion.div
              key={card.title}
              onClick={() => setManualFlipped((v) => !v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setManualFlipped((v) => !v);
                }
              }}
              aria-label={`${card.title} stage card`}
              className="relative h-[240px] md:h-full cursor-pointer select-none"
              style={{
                x: xs[i],
                zIndex: i,
                transformStyle: 'preserve-3d',
              }}
              animate={{
                rotateY: manualFlipped ? 180 : 0,
              }}
              transition={{ type: 'spring', bounce: 0, duration: 0.42 }}
            >
              <SplitFace i={i} imageSrc={imageSrc} card={card} borderRadius={radii[i]} />
            </motion.div>
          ))}
        </div>

        <div className="w-full flex items-center justify-between text-[11px] text-ink-muted font-mono pt-0.5">
          <span>OPTICAL TRIPTYCH · MANDATE CAP / DOM FIREWALL / PAYPAL 2PC VAULT</span>
          <span className="tx-num">3 STAGES · 2.84MS</span>
        </div>
      </div>
    </div>
  );
}
