import { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, TriangleAlert, X } from 'lucide-react';
import { Flame } from 'lucide-react';
import { DEV_MODE, MIN_SESSION_MIN } from '../engine';
import type { FinishSessionArgs } from '../state/store';
import { useIntegrity } from '../components/useIntegrity';
import type { SessionConfig } from '../types';

function fmt(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ActiveSession({ cfg, onFinish, onAbort }: { cfg: SessionConfig; onFinish: (args: FinishSessionArgs) => void; onAbort: () => void }) {
  const totalSec = cfg.plannedMin * 60;
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useMemo(() => new Date().toISOString(), []);
  const { verified, reset } = useIntegrity(true);
  const finished = useRef(false);

  const remaining = Math.max(0, totalSec - elapsed);

  useEffect(() => {
    reset();
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (actualSec: number, completedFull: boolean) => {
    if (finished.current) return;
    finished.current = true;
    const actualMin = completedFull ? cfg.plannedMin : Math.floor(actualSec / 60);
    onFinish({
      intention: cfg.intention,
      vibe: cfg.vibe,
      plannedMin: cfg.plannedMin,
      actualMin,
      verified,
      startedAt,
      endedAt: new Date().toISOString(),
    });
  };

  // Natural completion.
  useEffect(() => {
    if (elapsed >= totalSec && !finished.current) finish(totalSec, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, totalSec]);

  const ring = (1 - remaining / totalSec) * 100;
  const eligible = Math.floor(elapsed / 60) >= MIN_SESSION_MIN;

  return (
    <div className="relative flex min-h-full flex-col items-center justify-between bg-ink p-7 text-center">
      {/* top: intention + lock */}
      <div className="w-full pt-10">
        <div className="kicker flex items-center justify-center gap-2 text-acc">
          <Lock size={13} strokeWidth={2.5} /> Locked in · {cfg.vibe}
        </div>
        <h2 className="mx-auto mt-3 max-w-[300px] font-grotesk text-2xl font-semibold leading-snug text-cream">
          {cfg.intention}
        </h2>
      </div>

      {/* center: countdown ring */}
      <div className="relative flex items-center justify-center">
        <svg width="260" height="260" viewBox="0 0 260 260" className="-rotate-90">
          <circle cx="130" cy="130" r="120" fill="none" stroke="var(--line)" strokeWidth="3" />
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="var(--acc)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - ring / 100)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div className="stat-num text-6xl tabular-nums text-cream">{fmt(remaining)}</div>
          <div className="mono mt-1 text-xs text-faint">{cfg.plannedMin} MIN PLANNED</div>
        </div>
      </div>

      {/* integrity state */}
      <div className="w-full">
        {verified ? (
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surf px-4 py-2">
            <Flame size={15} className="text-acc" fill="var(--acc)" />
            <span className="text-sm text-mut">Committed, phone-free time. Don't leave the app.</span>
          </div>
        ) : (
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-acc bg-acc-soft px-4 py-2">
            <TriangleAlert size={15} className="text-acc" />
            <span className="text-sm text-cream">You left — this session won't count toward your rank.</span>
          </div>
        )}

        <button
          onClick={() => finish(elapsed, false)}
          className="inline-flex items-center gap-1.5 text-sm text-faint transition-colors hover:text-mut"
        >
          <X size={15} /> End early {eligible ? '(still counts)' : `(needs ${MIN_SESSION_MIN}m to count)`}
        </button>

        {DEV_MODE && (
          <div className="mt-4 flex justify-center gap-4 text-xs text-faint">
            <button onClick={() => setElapsed((e) => Math.min(totalSec, e + 60 * 5))} className="underline underline-offset-2 hover:text-mut">
              dev: +5 min
            </button>
            <button onClick={() => finish(totalSec, true)} className="underline underline-offset-2 hover:text-mut">
              dev: skip to finish
            </button>
            <button onClick={onAbort} className="underline underline-offset-2 hover:text-mut">
              dev: abort
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
