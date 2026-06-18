import { useState } from 'react';
import {
  ArrowLeft, Crown, Flame, Lock, Moon, Mountain, RotateCcw, Share2, Shield, Sparkles, Sunrise, Timer, Trophy,
  type LucideIcon,
} from 'lucide-react';
import { Avatar, Button, Card, Kicker } from '../components/ui';
import { StoryCard } from '../components/StoryCard';
import { useStore } from '../state/store';
import { evaluateAchievements, LEVEL_ORDER, levelProgress, levelThresholds } from '../engine';

const ACH_ICONS: Record<string, LucideIcon> = {
  Lock, Timer, Flame, Shield, Sunrise, Moon, Mountain, Crown,
};

export function Profile({ onBack, onCircle, onPro }: { onBack: () => void; onCircle: () => void; onPro: () => void }) {
  const { me, myRank, sessions, resetAll } = useStore();
  const [showStory, setShowStory] = useState(false);
  if (!me) return null;

  const myVerifiedMin = sessions
    .filter((s) => s.userId === me.id && s.verified)
    .reduce((sum, s) => sum + s.actualMin, 0);
  const totalHours = (myVerifiedMin / 60).toFixed(1);
  const progress = levelProgress(me.totalXP);
  const thresholds = levelThresholds();
  const achievements = evaluateAchievements(me, sessions);
  const earnedCount = achievements.filter((a) => a.earned).length;

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
        <div className="min-w-0">
          <div className="font-grotesk text-2xl font-bold leading-tight">@{me.username}</div>
          <div className="kicker mt-0.5 text-acc">{me.level}</div>
          <p className="mt-1 text-sm text-mut">{me.bio}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => setShowStory(true)} className="py-3 text-sm">
          <Share2 size={16} /> Share story
        </Button>
        <Button variant="outline" onClick={onPro} className="py-3 text-sm">
          <Sparkles size={16} className="text-acc" /> Go Pro
        </Button>
      </div>

      {/* Stats grid */}
      <div className="mt-3 grid grid-cols-2 gap-3">
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

      {/* Achievements */}
      <div className="mt-7">
        <div className="flex items-baseline justify-between">
          <Kicker>Achievements</Kicker>
          <span className="mono text-xs text-faint">{earnedCount}/{achievements.length}</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {achievements.map(({ def, earned, progress: p }) => {
            const Icon = ACH_ICONS[def.icon] ?? Trophy;
            return (
              <div
                key={def.id}
                title={`${def.name} — ${def.desc}`}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center ${
                  earned ? 'border-acc/40 bg-acc-soft' : 'border-line bg-surf'
                }`}
              >
                <Icon size={20} className={earned ? 'text-acc' : 'text-faint'} />
                <span className={`text-[10px] leading-tight ${earned ? 'text-cream' : 'text-faint'}`}>{def.name}</span>
                {!earned && p > 0 && (
                  <div className="h-1 w-full overflow-hidden rounded-full bg-ink">
                    <div className="h-full rounded-full bg-mut" style={{ width: `${p * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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

      <div className="mt-auto pt-7">
        <Button full variant="outline" onClick={onCircle} className="py-4">
          View your Focus Circle
        </Button>
      </div>

      {showStory && <StoryCard me={me} rank={myRank} totalHours={totalHours} onClose={() => setShowStory(false)} />}
    </div>
  );
}
