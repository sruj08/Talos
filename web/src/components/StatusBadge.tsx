import { stateMeta, type Tone } from '@/lib/format';
import type { StreamStatus } from '@/lib/types';

export function StatusBadge({ state }: { state: string | undefined }) {
  const meta = stateMeta(state);
  return (
    <span className={`pill tone-${meta.tone}`} data-state={state} title={state}>
      <span aria-hidden="true">{meta.glyph}</span>
      {meta.label}
    </span>
  );
}

export function TonePill({ tone, children, title }: { tone: Tone; children: React.ReactNode; title?: string }) {
  return (
    <span className={`pill tone-${tone}`} title={title}>
      {children}
    </span>
  );
}

const STREAM_TONE: Record<StreamStatus, { tone: Tone; label: string }> = {
  live: { tone: 'emerald', label: 'LIVE · /ws/events' },
  connecting: { tone: 'neutral', label: 'CONNECTING…' },
  simulated: { tone: 'amber', label: 'SANDBOX REPLAY' },
};

export function StreamPill({ status }: { status: StreamStatus }) {
  const s = STREAM_TONE[status];
  return (
    <span className={`pill tone-${s.tone}`} role="status" aria-live="polite" data-stream={status}>
      <span className={`dot ${status !== 'simulated' ? 'pulse' : ''}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}
