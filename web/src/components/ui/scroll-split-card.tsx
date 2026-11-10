'use client';

import React, { useRef, type ReactNode, type RefObject } from 'react';
import { cn } from '@/lib/utils';
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';

export interface ScrollSplitCardItem {
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
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
  boxShadow,
}: {
  i: number;
  imageSrc: string;
  card: ScrollSplitCardItem;
  borderRadius: MotionValue<string>;
  boxShadow: MotionValue<string>;
}) {
  return (
    <>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{
          zIndex: 2,
          borderRadius,
          boxShadow,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <div
          className="absolute inset-0 h-full w-[300%]"
          style={{
            left: `${-100 * i}%`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
          }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 flex flex-col justify-end overflow-hidden p-8"
        style={{
          backgroundColor: card.bgColor,
          color: card.textColor,
          transform: 'rotateY(180deg)',
          zIndex: 1,
          borderRadius,
          boxShadow,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {card.icon}
        <h3 className="paypal-title-sm mt-6">{card.title}</h3>
        <p className="paypal-caption mt-3 max-w-[28ch] opacity-90">{card.description}</p>
      </motion.div>
    </>
  );
}

export function ScrollSplitCard({
  className,
  imageSrc,
  cards,
  containerRef: externalContainerRef,
  startHint = 'Scroll to open the clearing stages',
  endHint = 'Three stages. One PayPal-backed clearinghouse',
}: ScrollSplitCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: externalContainerRef,
    offset: ['start start', 'end end'],
  });

  const leftX = useTransform(scrollYProgress, [0, 0.4, 0.8], [0, -48, -24]);
  const rightX = useTransform(scrollYProgress, [0, 0.4, 0.8], [0, 48, 24]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);
  const rotateY = useTransform(scrollYProgress, [0.4, 0.8], [0, 180]);
  const rotateZLeft = useTransform(scrollYProgress, [0.4, 0.8], [0, 6]);
  const rotateZRight = useTransform(scrollYProgress, [0.4, 0.8], [0, -6]);
  const borderRadiusLeft = useTransform(scrollYProgress, [0, 0.2], ['16px 0px 0px 16px', '16px']);
  const borderRadiusMiddle = useTransform(scrollYProgress, [0, 0.2], ['0px', '16px']);
  const borderRadiusRight = useTransform(scrollYProgress, [0, 0.2], ['0px 16px 16px 0px', '16px']);
  const borderOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 0.2]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 0.4]);
  const boxShadow = useMotionTemplate`inset 0 1px 1px rgba(255, 255, 255, ${borderOpacity}), 0 25px 50px -12px rgba(0, 0, 0, ${shadowOpacity})`;
  const cardsY = useTransform(scrollYProgress, [0.8, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.8, 1], [40, 0]);
  const startTextOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const startTextY = useTransform(scrollYProgress, [0, 0.1], [0, 20]);

  const radii = [borderRadiusLeft, borderRadiusMiddle, borderRadiusRight];
  const xs = [leftX, undefined, rightX] as const;
  const zs = [rotateZLeft, undefined, rotateZRight] as const;

  return (
    <div ref={containerRef} className={cn('relative h-[400vh] w-full', className)}>
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <motion.p
          className="paypal-label text-ink-muted absolute top-[18%] left-0 right-0 text-center"
          style={{ opacity: startTextOpacity, y: startTextY }}
        >
          {startHint}
        </motion.p>

        <motion.div
          style={{ scale, y: cardsY, transformStyle: 'preserve-3d' }}
          className="relative flex h-[400px] w-full max-w-4xl px-4"
        >
          {cards.slice(0, 3).map((card, i) => (
            <motion.div
              key={card.title}
              className="relative h-full flex-1"
              style={{
                x: xs[i],
                rotateY,
                rotateZ: zs[i],
                zIndex: i,
                transformStyle: 'preserve-3d',
              }}
            >
              <SplitFace
                i={i}
                imageSrc={imageSrc}
                card={card}
                borderRadius={radii[i]}
                boxShadow={boxShadow}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="paypal-title-sm text-ink absolute bottom-[16%] left-0 right-0 text-center"
          style={{ opacity: textOpacity, y: textY }}
        >
          {endHint}
        </motion.p>
      </div>
    </div>
  );
}
