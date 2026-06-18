import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Swords, Trophy } from 'lucide-react';
import { Avatar, Button, Kicker } from '../components/ui';
import { useStore } from '../state/store';
import type { User } from '../engine';

type Phase = 'setup' | 'racing' | 'result';
const DURATIONS = [25, 50];

// Demo clock: 1 real second = 1 simulated focus-minute, so a race is watchable.
const SIM_MIN_PER_SEC = 1;
const TICK_MS = 100;

function clock(simMin: number): string {
  const total = Math.max(0, Math.round(simMin * 60));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function BossBattle({ onBack }: { onBack: () => void }) {
  const { me, circleRanked } = useStore();
  const opponents = useMemo(() => circleRanked.map((r) => r.user).filter((u) => u.id !== me?.id), [circleRanked, me]);

  const [phase, setPhase] = useState<Phase>('setup');
  const [opponent, setOpponent] = useState<User | null>(opponents[0] ?? null);
  const [target, setTarget] = useState(25);
  const [mine, setMine] = useState(0);
  const [theirs, setTheirs] = useState(0);
  const [winner, setWinner] = useState<'me' | 'them' | null>(null);
  const paceRef = useRef(1);

  useEffect(() => {
    if (phase !== 'racing') return;
    const id = setInterval(() => {
      const step = (SIM_MIN_PER_SEC * TICK_MS) / 1000;
      setMine((m) => Math.min(target, m + step));
      setTheirs((t) => Math.min(target, t + step * paceRef.current));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase, target]);

  // Decide a winner the moment either side completes.
  useEffect(() => {
    if (phase !== 'racing') return;
    if (mine >= target) {
      setWinner('me');
      setPhase('result');
    } else if (theirs >= target) {
      setWinner('them');
      setPhase('result');
    }
  }, [mine, theirs, target, phase]);

  const start = () => {
    if (!opponent) return;
    // Opponent pace scales loosely with their streak, plus a little variance.
    const streakEdge = Math.min(0.2, opponent.currentStreak / 300);
    paceRef.current = 0.85 + streakEdge + Math.random() * 0.2;
    setMine(0);
    setTheirs(0);
    setWinner(null);
    setPhase('racing');
  };

  if (!me || !opponent) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-ink p-6 text-center text-mut">
        No crew members to battle yet.
        <Button variant="outline" onClick={onBack} className="mt-4 px-6 py-3">Back</Button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-ink p-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 self-start pt-2 text-sm text-mut hover:text-cream">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mt-3 text-center">
        <Kicker>1v1 · Boss Battle</Kicker>
        <h1 className="mt-1 font-grotesk text-3xl font-bold">Race to {target}m</h1>
        <p className="mt-1 text-sm text-faint">Whoever banks the focus first wins. Practice bout — doesn't affect rank.</p>
      </div>

      {/* Fighters */}
      <div className="mt-6 flex items-stretch gap-3">
        <Fighter user={me} you progress={mine} target={target} active={phase !== 'setup'} />
        <div className="flex items-center">
          <Swords size={22} className="text-acc" />
        </div>
        <Fighter user={opponent} progress={theirs} target={target} active={phase !== 'setup'} />
      </div>

      {phase === 'setup' && (
        <div className="mt-8">
          <Kicker className="text-mut">Pick your opponent</Kicker>
          <div className="mt-2 flex flex-wrap gap-2">
            {opponents.slice(0, 6).map((o) => (
              <button
                key={o.id}
                onClick={() => setOpponent(o)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                  opponent.id === o.id ? 'border-acc bg-acc-soft text-cream' : 'border-line bg-surf text-mut'
                }`}
              >
                <Avatar initial={o.initial} size={22} /> @{o.username}
              </button>
            ))}
          </div>

          <Kicker className="mt-5 text-mut">Distance</Kicker>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setTarget(d)}
                className={`rounded-2xl border py-4 transition-all ${
                  target === d ? 'border-acc bg-acc-soft text-cream' : 'border-line bg-surf text-mut'
                }`}
              >
                <div className="stat-num text-2xl">{d}</div>
                <div className="kicker text-faint">min</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-6">
        {phase === 'setup' && (
          <Button full onClick={start} className="py-4 text-base">
            <Swords size={18} /> Start the battle
          </Button>
        )}
        {phase === 'racing' && (
          <p className="text-center text-sm text-mut">
            Stay locked in… <span className="mono text-faint">(demo clock is accelerated)</span>
          </p>
        )}
        {phase === 'result' && (
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-acc bg-acc-soft px-4 py-2">
              <Trophy size={16} className="text-acc" />
              <span className="font-grotesk font-semibold">
                {winner === 'me' ? `You beat @${opponent.username}!` : `@${opponent.username} edged you out.`}
              </span>
            </div>
            <Button full onClick={() => setPhase('setup')} className="py-4">
              Rematch
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Fighter({ user, progress, target, you, active }: { user: User; progress: number; target: number; you?: boolean; active: boolean }) {
  const pct = Math.min(100, (progress / target) * 100);
  return (
    <div className={`flex-1 rounded-2xl border p-3 ${you ? 'border-acc/50 bg-acc-soft' : 'border-line bg-surf'}`}>
      <div className="flex flex-col items-center">
        <Avatar initial={user.initial} size={44} accent={you} />
        <div className="mt-2 truncate font-grotesk text-sm font-semibold">{you ? 'You' : `@${user.username}`}</div>
        <div className="stat-num mt-1 text-lg tabular-nums">{active ? clock(progress) : clock(0)}</div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink">
        <div className="h-full rounded-full bg-acc transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
