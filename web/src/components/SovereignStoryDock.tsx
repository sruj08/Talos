'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { StoryChapterId, useTalosClearing } from '../context/TalosClearingContext';

export const STORY_CHAPTERS: Array<{
  id: StoryChapterId;
  label: string;
  href: string;
  anchor: string;
}> = [
  { id: 'OVERVIEW', label: 'Overview Flow', href: '/', anchor: '#top' },
  { id: 'CHAPTER_1_MANDATE', label: 'Mandate Studio', href: '/mandates', anchor: '#chapter-mandates' },
  { id: 'CHAPTER_2_ARENA', label: 'Red-Team Arena', href: '/simulator', anchor: '#chapter-simulator' },
  { id: 'CHAPTER_3_BLOTTER', label: 'Escrow Ledger', href: '/blotter', anchor: '#chapter-blotter' },
  { id: 'CHAPTER_4_SLA', label: 'SLA & Forensics', href: '/sla', anchor: '#chapter-sla' },
];

export function SovereignStoryChapterDock() {
  const { activeChapter, setActiveChapter } = useTalosClearing();

  return (
    <footer className="py-8 flex justify-center px-6" data-testid="story-chapter-dock">
      <div className="sovereign-card px-2 py-1.5 flex flex-wrap items-center gap-1">
        <span className="px-3 py-1 font-mono text-xs text-ink-muted">
          Workspace
        </span>
        {STORY_CHAPTERS.map((chap, idx) => {
          const isActive = activeChapter === chap.id;
          return (
            <Link
              key={chap.id}
              href={chap.href}
              onClick={(e) => {
                setActiveChapter(chap.id);
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  e.preventDefault();
                  document.querySelector(chap.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              data-testid={`dock-chapter-${chap.id.toLowerCase()}`}
              className={`relative h-9 inline-flex items-center gap-2 px-3 text-xs font-medium rounded-control transition-colors duration-150 ease-unslop whitespace-nowrap active:scale-[0.98] ${
                isActive ? 'text-ink' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId="story-dock-active-pill"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 tone-paypal -z-10"
                />
              ) : null}
              <span className="font-mono text-[11px] text-ink-muted">0{idx + 1}</span>
              <span>{chap.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
