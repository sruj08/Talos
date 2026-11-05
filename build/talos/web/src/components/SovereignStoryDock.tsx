'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Compass, Layers } from 'lucide-react';
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
    <footer className="py-8 flex justify-center px-4" data-testid="story-chapter-dock">
      <div className="sovereign-glass rounded-outer px-3 py-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-ink-secondary">
          <Compass className="w-3.5 h-3.5 text-ink-paypal" strokeWidth={1.5} aria-hidden="true" />
          <span>Story Flowline</span>
        </span>
        {STORY_CHAPTERS.map((chap) => {
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
              className={`relative min-h-[44px] inline-flex items-center px-3.5 py-1.5 text-xs font-medium rounded-control transition-colors whitespace-nowrap active:scale-[0.96] ${
                isActive ? 'text-ink' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId="story-dock-active-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                  className="absolute inset-0 tone-paypal -z-10"
                />
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>{chap.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
