import { useEffect, useState } from 'react';
import { ArrowUp, Check, Flame, Snowflake, TriangleAlert, TrendingUp } from 'lucide-react';
import { Button, Card, Kicker } from '../components/ui';
import { useCountUp } from '../components/useCountUp';
import type { SessionResult } from '../engine';

export type RewardResult = SessionResult & { rankBefore: number | null; rankAfter: number | null };

function streakHeadline(r: RewardResult): string {
  const s = r.reward.streak;
  if (!r.reward.countsTowardStreak) return 'Counts for you';
  switch (s.outcome) {
    case 'first':
      return 'Streak started';
    case 'extended':
      return s.currentStreak === s.longestStreak ? 'Longest yet' : 'Streak extended';
    case 'frozen':
      return 'Freeze saved your flame';
    case 'reset':
      return 'Earn it back';
    default:
      return 'Streak held';
  }
}

export function SessionComplete({ result, onDone }: { result: RewardResult; onDone: () => void }) {
  const { reward } = result;
  const verified = reward.verified;
  const xp = useCountUp(reward.xpEarned, 1400);
  const [showRest, setShowRest] = useState(false);
  const [progressFill, setProgressFill] = useState(reward.progressBefore.pct);

  useEffect(() => {
    const t1 = setTimeout(() => setShowRest(true), 700);
    const t2 = setTimeout(() => setProgressFill(reward.leveledUp ? 1 : reward.progressAfter.pct), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reward]);

  const rankImproved = result.rankBefore != null && result.rankAfter != null && result.rankAfter < result.rankBefore;

  return (
    <div className="flex min-h-full flex-col p-6 pb-8">
      {/* Hero XP */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {verified ? (
          <div className="kicker mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surf px-3 py-1.5 text-acc">
            <Check size={13} strokeWidth={3} /> Verified · phone-free
          </div>
        ) : (
          <div className="kicker mb-4 inline-flex items-center gap-2 rounded-full border border-acc bg-acc-soft px-3 py-1.5 text-cream">
            <TriangleAlert size={13} /> Unverified
          </div>
        )}

        <div className="animate-pop">
          <div className={`stat-num text-[88px] leading-none ${verified ? 'text-acc' : 'text-mut'}`}>+{xp}</div>
          <div className="kicker mt-1 text-faint">XP earned</div>
        </div>

        <p className="mt-5 max-w-[300px] text-[15px] leading-relaxed text-mut">
          {verified ? (
            <>
              {reward.completionBonusApplied && <span className="text-cream">+20% completion bonus. </span>}
              You locked in. {result.session.actualMin} minutes of committed, phone-free time.
            </>
          ) : (
            <>
              You left the app, so this earned <span className="text-cream">0.25× personal XP</span> — it didn't count toward
              your rank or streak, but it still counts for you.
            </>
          )}
        </p>
        {reward.capped && <p className="mt-2 text-xs text-faint">Daily XP cap reached — rest is on the house.</p>}
      </div>

      {/* Detail cards */}
      <div className={`space-y-3 transition-all duration-500 ${showRest ? 'opacity-100' : 'translate-y-2 opacity-0'}`}>
        {/* Streak */}
        <Card elevated className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Flame
              size={30}
              className={reward.streak.currentStreak > 0 ? 'text-acc animate-flame-pulse' : 'text-faint'}
              fill={reward.streak.currentStreak > 0 ? 'var(--acc)' : 'none'}
            />
            <div>
              <div className="stat-num text-2xl">
                {reward.streak.currentStreak} day{reward.streak.currentStreak === 1 ? '' : 's'}
              </div>
              <div className="kicker text-acc">{streakHeadline(result)}</div>
            </div>
          </div>
          {reward.streak.freezeEarned && (
            <div className="flex items-center gap-1.5 rounded-full border border-line bg-surf px-3 py-1.5 text-xs text-cream">
              <Snowflake size={14} /> +1 freeze
            </div>
          )}
        </Card>

        {/* Level progress */}
        <Card elevated className="p-4">
          <div className="flex items-baseline justify-between">
            <Kicker className="text-mut">{reward.leveledUp ? 'Level up' : reward.progressAfter.level}</Kicker>
            <span className="mono text-xs text-faint">
              {reward.leveledUp ? `${reward.levelBefore} → ${reward.levelAfter}` : reward.progressAfter.next ?? 'MAX'}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink">
            <div className="h-full rounded-full bg-acc transition-all duration-1000 ease-out" style={{ width: `${progressFill * 100}%` }} />
          </div>
          {reward.leveledUp && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-acc">
              <ArrowUp size={15} /> You're now {reward.levelAfter}.
            </div>
          )}
        </Card>

        {/* Rank */}
        {verified && (
          <Card elevated className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className={rankImproved ? 'text-acc' : 'text-mut'} />
              <div className="kicker text-mut">Weekly rank</div>
            </div>
            <div className="flex items-center gap-2 stat-num text-xl">
              {result.rankBefore != null && rankImproved ? (
                <>
                  <span className="text-faint">#{result.rankBefore}</span>
                  <ArrowUp size={16} className="text-acc" />
                  <span className="text-cream">#{result.rankAfter}</span>
                </>
              ) : (
                <span className="text-cream">{result.rankAfter ? `#${result.rankAfter}` : '—'}</span>
              )}
            </div>
          </Card>
        )}
      </div>

      <Button full onClick={onDone} className="mt-6 py-4 text-base">
        Done
      </Button>
    </div>
  );
}
