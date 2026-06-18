import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Flame, Lock, X } from 'lucide-react';
import { Button } from './ui';
import type { User } from '../engine';

/**
 * Shareable vertical story card — the "Day 47 of Monk Mode" flex. Exported to a
 * PNG via html-to-image so it can be posted. WERC makes deep work something you post.
 */
export function StoryCard({
  me,
  rank,
  totalHours,
  onClose,
}: {
  me: User;
  rank: number | null;
  totalHours: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const exportPng = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: '#15120e' });
      const a = document.createElement('a');
      a.download = `werc-${me.username}.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      /* prototype: best-effort export */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-ink/95 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="kicker text-mut">Share your flex</span>
        <button onClick={onClose} className="text-faint hover:text-cream" aria-label="close">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {/* The exported surface (9:16). */}
        <div
          ref={cardRef}
          className="flex w-[270px] flex-col justify-between rounded-3xl border border-line bg-ink p-6"
          style={{ aspectRatio: '9 / 16' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-acc" strokeWidth={2.5} />
              <span className="mono text-sm font-bold tracking-[0.2em]">WERC</span>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
              <Flame size={16} className="text-acc" fill="var(--acc)" />
              <span className="stat-num text-lg">{me.currentStreak}</span>
              <span className="kicker text-faint">day flame</span>
            </div>
            <h2 className="mt-4 font-grotesk text-[32px] font-bold leading-[1.05] text-cream">
              Day {Math.max(me.currentStreak, 1)} of
              <br />
              <span className="text-acc">{me.level} Mode</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total hours" value={totalHours} />
            <Stat label="Longest streak" value={`${me.longestStreak}d`} />
            <Stat label="Level" value={me.level} />
            <Stat label="Rank" value={rank ? `#${rank}` : '—'} />
          </div>

          <div>
            <div className="font-grotesk text-lg font-semibold">@{me.username}</div>
            <div className="kicker mt-1 text-faint">locked in with WERC</div>
          </div>
        </div>
      </div>

      <Button full onClick={exportPng} disabled={busy} className="py-4">
        <Download size={18} /> {busy ? 'Rendering…' : 'Export as PNG'}
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surf p-2.5">
      <div className="stat-num text-xl leading-none text-cream">{value}</div>
      <div className="kicker mt-1 text-[9px] text-faint">{label}</div>
    </div>
  );
}
