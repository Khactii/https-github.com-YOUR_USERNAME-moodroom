import { useState } from 'react';
import { ChevronRight, Lock, Trophy, Users, Waves } from 'lucide-react';
import { Avatar, Button, Card, Kicker } from '../components/ui';
import { StreakFlame } from '../components/Flame';
import { AtlasNudge } from '../components/AtlasNudge';
import { useStore } from '../state/store';
import { DEV_MODE, levelProgress } from '../engine';
import type { SessionConfig } from '../types';

const DURATIONS = [25, 50, 90];
const VIBES = ['Deep Focus', 'Rain', 'Lo-fi Hum', 'Silence'];

export function Home({
  onLockIn,
  onProfile,
  onCircle,
}: {
  onLockIn: (cfg: SessionConfig) => void;
  onProfile: () => void;
  onCircle: () => void;
}) {
  const { me, myRank, todayXP, circleName, circleRanked, simulateMissedDay } = useStore();
  const [intention, setIntention] = useState('');
  const [duration, setDuration] = useState(50);
  const [custom, setCustom] = useState('');
  const [vibe, setVibe] = useState(VIBES[0]);

  if (!me) return null;
  const progress = levelProgress(me.totalXP);
  const plannedMin = custom ? Math.max(1, parseInt(custom, 10) || 0) : duration;

  return (
    <div className="flex min-h-full flex-col p-5 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onProfile} className="flex items-center gap-3 text-left">
          <Avatar initial={me.initial} size={44} accent />
          <div>
            <div className="font-grotesk font-semibold leading-tight">@{me.username}</div>
            <div className="kicker text-acc">{me.level}</div>
          </div>
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="kicker text-faint">Rank</div>
            <div className="flex items-center gap-1 stat-num text-lg">
              <Trophy size={15} className="text-acc" />
              {myRank ? `#${myRank}` : '—'}
            </div>
          </div>
          <div className="text-right">
            <div className="kicker text-faint">Streak</div>
            <StreakFlame streak={me.currentStreak} freezes={me.freezes} size="md" />
          </div>
        </div>
      </div>

      {/* Level progress */}
      <Card className="mt-5 p-4">
        <div className="flex items-baseline justify-between">
          <span className="kicker text-mut">{progress.level}</span>
          <span className="mono text-xs text-faint">
            {progress.next ? `${me.totalXP} / ${progress.ceiling} XP` : `${me.totalXP} XP · MAX`}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surf2">
          <div className="h-full rounded-full bg-acc transition-all duration-700" style={{ width: `${progress.pct * 100}%` }} />
        </div>
        {progress.next && (
          <div className="mt-2 text-xs text-faint">
            {progress.xpForNext} XP to <span className="text-mut">{progress.next}</span>
          </div>
        )}
      </Card>

      {/* Atlas coach nudge (stubbed) */}
      <AtlasNudge me={me} />

      {/* Focus Circle entry */}
      <button onClick={onCircle} className="mt-3 w-full text-left">
        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-acc-soft">
              <Users size={17} className="text-acc" />
            </div>
            <div>
              <div className="font-grotesk font-semibold">{circleName}</div>
              <div className="kicker text-faint">{circleRanked.length} members · locking in</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-faint" />
        </Card>
      </button>

      {/* The launchpad */}
      <div className="mt-7">
        <Kicker>Set your intention</Kicker>
        <input
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="What are you locking in on?"
          maxLength={60}
          className="mt-2 w-full rounded-2xl border border-line bg-surf px-4 py-4 font-grotesk text-lg text-cream outline-none placeholder:text-faint focus:border-acc"
        />
      </div>

      <div className="mt-6">
        <Kicker className="text-mut">Duration</Kicker>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDuration(d);
                setCustom('');
              }}
              className={`rounded-2xl border py-4 transition-all ${
                !custom && duration === d ? 'border-acc bg-acc-soft text-cream' : 'border-line bg-surf text-mut'
              }`}
            >
              <div className="stat-num text-2xl">{d}</div>
              <div className="kicker text-faint">min</div>
            </button>
          ))}
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="—"
            inputMode="numeric"
            className={`rounded-2xl border bg-surf text-center font-grotesk text-2xl font-bold outline-none placeholder:text-faint ${
              custom ? 'border-acc text-cream' : 'border-line text-mut'
            }`}
          />
        </div>
      </div>

      <div className="mt-6">
        <Kicker className="text-mut">Vibe</Kicker>
        <div className="mt-2 flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-all ${
                vibe === v ? 'border-acc bg-acc-soft text-cream' : 'border-line bg-surf text-mut'
              }`}
            >
              <Waves size={14} /> {v}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">Audio is a stub in this prototype — the movement is the product, not the timer.</p>
      </div>

      <div className="mt-auto pt-7">
        <Button
          full
          disabled={plannedMin < 1}
          onClick={() => onLockIn({ intention: intention.trim() || 'Deep work', vibe, plannedMin })}
          className="py-5 text-lg"
        >
          <Lock size={20} strokeWidth={2.5} /> Lock In · {plannedMin}m
        </Button>
        <div className="mt-3 flex items-center justify-between text-xs text-faint">
          <span>Today: {todayXP} XP earned</span>
          {DEV_MODE && (
            <button onClick={simulateMissedDay} className="underline decoration-faint underline-offset-2 hover:text-mut">
              dev: simulate missed day
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
