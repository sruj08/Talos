'use client';

import React from 'react';
import Link from 'next/link';
import { StoryChapterId, useTalosClearing } from '../context/TalosClearingContext';
import { TalosLogoMark } from './brand/TalosLogoMark';

export const STORY_CHAPTERS: Array<{
  id: StoryChapterId;
  label: string;
  href: string;
  anchor: string;
}> = [
  { id: 'OVERVIEW', label: 'Investor Storyline', href: '/', anchor: '/' },
  { id: 'STORYLINE', label: '5-Part Walkthrough', href: '/story', anchor: '/story' },
  { id: 'CHAPTER_1_MANDATE', label: 'Step 1: $300 Rules', href: '/mandates', anchor: '/mandates' },
  { id: 'CHAPTER_2_ARENA', label: 'Step 2: 3 Scenarios', href: '/simulator', anchor: '/simulator' },
  { id: 'CHAPTER_3_BLOTTER', label: 'Step 3: CFO Ledger', href: '/blotter', anchor: '/blotter' },
  { id: 'CHAPTER_4_SLA', label: 'Delivery Timeline', href: '/sla', anchor: '/sla' },
  { id: 'CHAPTER_5_STEP_UP', label: 'Approve with PayPal', href: '/step-up', anchor: '/step-up' },
  { id: 'COMMAND_CENTER', label: 'Operator Suite', href: '/command-center', anchor: '/command-center' },
];

export function SovereignStoryChapterDock() {
  const { activeChapter, setActiveChapter } = useTalosClearing();

  return (
    <footer className="paypal-footer mt-12 flex justify-center px-6" data-testid="story-chapter-dock">
      <div className="mx-auto max-w-[1360px] w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <TalosLogoMark size={28} />
          <span className="paypal-label text-ink">TALOS + PayPal</span>
          <span className="text-ink-muted">·</span>
          <span className="paypal-caption text-ink-secondary">Buyer-Protected AI Shopping &amp; Reversible Delivery Escrow</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {STORY_CHAPTERS.map((chap) => {
            const isActive = activeChapter === chap.id;
            return (
              <Link
                key={chap.id}
                href={chap.href}
                onClick={() => setActiveChapter(chap.id)}
                data-testid={`dock-chapter-${chap.id.toLowerCase()}`}
                className={isActive ? 'paypal-tab-pill-active text-xs px-4 py-2' : 'paypal-tab-pill text-xs px-4 py-2'}
              >
                <span>{chap.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
