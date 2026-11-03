'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PRESET_PROMPTS } from '@/lib/copilot';

export interface CopilotBarProps {
  onRun: (prompt: string) => void;
  log: string[];
}

export function CopilotBar({ onRun, log }: CopilotBarProps) {
  const [prompt, setPrompt] = useState<string>(PRESET_PROMPTS[0]);

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <form
        className="copilot"
        role="search"
        aria-label="AG Studio Copilot"
        onSubmit={(e) => {
          e.preventDefault();
          if (prompt.trim()) onRun(prompt);
        }}
      >
        <Sparkles size={16} aria-hidden="true" color="var(--indigo)" />
        <label htmlFor="copilot-input" className="sr-only">
          Ask AG Studio Copilot
        </label>
        <input
          id="copilot-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. group by merchant risk, filter out prompt-injection attacks, chart authorized vs captured volume"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-indigo">
          Run
        </button>
      </form>
      <div className="chips" aria-label="Copilot presets">
        {PRESET_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            className="chip"
            onClick={() => {
              setPrompt(p);
              onRun(p);
            }}
          >
            {p.length > 48 ? `${p.slice(0, 46)}…` : p}
          </button>
        ))}
      </div>
      {log.length > 0 && (
        <p className="copilot-log" role="status" aria-live="polite" data-testid="copilot-log">
          ▸ {log.join(' · ')}
        </p>
      )}
    </div>
  );
}
