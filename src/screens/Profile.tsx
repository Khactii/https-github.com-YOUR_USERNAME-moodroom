import { ArrowLeft, Award, Flame, RotateCcw, Trophy } from 'lucide-react';
import { Avatar, Button, Card, Kicker } from '../components/ui';
import { useStore } from '../state/store';
import { LEVEL_ORDER, levelProgress, levelThresholds } from '../engine';

export function Profile({ onBack }: { onBack: () => void }) {
  const { me, myRank, sessions, resetAll } = useStore();
  if (!me) return null;

  const myVerifiedMin = sessions
    .filter((s) => s.userId === me.id && s.verified)
    .reduce((sum, s) => sum + s.actualMin, 0);
  const totalHours = (myVerifiedMin / 60).toFixed(1);
  const progress = levelProgress(me.totalXP);
  const thresholds = levelThresholds();

  const stats = [
    { label: 'Total hours', value: totalHours, icon: null },
    { label: 'Current streak', value: me.currentStreak, icon: <Flame size={14} className="text-acc" /> },
    { label: 'Longest streak', value: me.longestStreak, icon: <Flame size={14} className="text-faint" /> },
    { label: 'Rank', value: myRank ? `#${myRank}` : '—', icon: <Trophy size={14} className="text-acc" /> },
  ];

  return (
    <div className="flex min-h-full flex-col p-5 pb-28">
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-mut hover:text-cream">
          <ArrowLeft size={16} /> Home
        </button>
        <button onClick={resetAll} className="inline-flex items-center gap-1.5 text-xs text-faint hover:text-mut">
          <RotateCcw size={13} /> reset demo
        </button>
      </div>

      {/* Identity */}
      <div className="mt-4 flex items-center gap-4">
        <Avatar initial={me.initial} size={64} accent />
        <div>
          <div className="font-grotesk text-2xl font-bold leading-tight">@{me.username}</div>
          <div className="kicker mt-0.5 text-acc">{me.level}</div>
          <p className="mt-1 text-sm text-mut">{me.bio}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="kicker flex items-center gap-1.5 text-faint">
              {s.icon}
              {s.label}
            </div>
            <div className="stat-num mt-1 text-3xl">{s.value}</div>
          </Card>
        ))}
      </div>

      {/* XP / level progress */}
      <Card className="mt-3 p-4">
        <div className="flex items-baseline justify-between">
          <Kicker className="text-mut">{progress.level}</Kicker>
          <span className="mono text-xs text-faint">{me.totalXP} XP</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surf2">
          <div className="h-full rounded-full bg-acc" style={{ width: `${progress.pct * 100}%` }} />
        </div>
      </Card>

      {/* Rank ladder */}
      <div className="mt-7">
        <Kicker>The ladder</Kicker>
        <div className="mt-3 space-y-1.5">
          {LEVEL_ORDER.map((lvl) => {
            const reached = me.totalXP >= thresholds[lvl];
            const current = lvl === me.level;
            return (
              <div
                key={lvl}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  current ? 'border-acc bg-acc-soft' : 'border-line bg-surf'
                }`}
              >
                <span className={`font-grotesk font-semibold ${reached ? 'text-cream' : 'text-faint'}`}>{lvl}</span>
                <span className="mono text-xs text-faint">{thresholds[lvl].toLocaleString()} XP</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="mt-7">
        <Kicker>Badges</Kicker>
        {me.badges.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {me.badges.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surf px-3 py-1.5 text-sm text-cream">
                <Award size={14} className="text-acc" /> {b}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-faint">No badges yet. Finish a 7-day streak to earn your first flame.</p>
        )}
      </div>

      <div className="mt-auto pt-7">
        <Button full variant="outline" onClick={onBack} className="py-4">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
