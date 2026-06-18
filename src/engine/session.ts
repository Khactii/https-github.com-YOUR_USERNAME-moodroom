import { DELIGHT_2X_CHANCE, MIN_SESSION_MIN } from './constants';
import { toLocalDateStr } from './dates';
import { levelForXP, levelProgress, type LevelProgress } from './level';
import { rankOf } from './leaderboard';
import { applyQualifyingSession, type StreakUpdate } from './streak';
import type { Level, Session, User } from './types';
import { computeSessionXP } from './xp';

export interface SessionInput {
  intention: string;
  vibe: string;
  plannedMin: number;
  actualMin: number;
  verified: boolean;
  /** User left the app — visibility broken beyond the grace window. */
  startedAt: string; // ISO
  endedAt: string; // ISO
  /** Verified minutes & XP already earned today, for caps/diminishing returns. */
  verifiedMinutesToday: number;
  xpEarnedToday: number;
  today?: string; // 'YYYY-MM-DD' (defaults to local today; injectable for tests/sim)
  /**
   * Random roll in [0,1) for the surprise 2x-XP delight window. Inject Math.random
   * from the UI; omit (or pass >= DELIGHT_2X_CHANCE) for deterministic, no-bonus
   * behaviour in tests. The bonus is upside-only and never gates honest credit.
   */
  delightRoll?: number;
}

export interface SessionResult {
  user: User;
  session: Session;
  reward: {
    xpEarned: number;
    xpBefore: number;
    xpAfter: number;
    capped: boolean;
    completionBonusApplied: boolean;
    /** A surprise 2x-XP window hit — pure delight on top of fair base credit. */
    doubleXP: boolean;
    bonusXP: number;
    verified: boolean;
    countsTowardStreak: boolean;
    levelBefore: Level;
    levelAfter: Level;
    leveledUp: boolean;
    progressBefore: LevelProgress;
    progressAfter: LevelProgress;
    streak: StreakUpdate;
  };
}

/**
 * Apply a finished session to a user. Pure: returns a new User plus a reward
 * summary the UI animates. Rank deltas are computed separately against the
 * full user list via {@link computeRankDelta}.
 */
export function applySession(user: User, input: SessionInput): SessionResult {
  const today = input.today ?? toLocalDateStr();
  const qualifies = input.verified && input.actualMin >= MIN_SESSION_MIN;
  const completedFull = input.actualMin >= input.plannedMin;

  const xpResult = computeSessionXP({
    actualMin: input.actualMin,
    completedFull,
    verified: input.verified,
    verifiedMinutesToday: input.verifiedMinutesToday,
    xpEarnedToday: input.xpEarnedToday,
  });

  // Surprise 2x window: rare, additive delight that respects the deterministic
  // base. It only ever adds XP on top of work that already earned its fair credit.
  const baseXP = xpResult.xp;
  const doubleXP = input.verified && baseXP > 0 && (input.delightRoll ?? 1) < DELIGHT_2X_CHANCE;
  const bonusXP = doubleXP ? baseXP : 0;
  const totalEarned = baseXP + bonusXP;

  const xpBefore = user.totalXP;
  const xpAfter = xpBefore + totalEarned;
  const levelBefore = user.level;
  const levelAfter = levelForXP(xpAfter);
  const progressBefore = levelProgress(xpBefore);
  const progressAfter = levelProgress(xpAfter);

  // Streak only moves on a qualifying session.
  const streak: StreakUpdate = qualifies
    ? applyQualifyingSession(
        {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          freezes: user.freezes,
          lastSessionDate: user.lastSessionDate,
        },
        today,
      )
    : {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        freezes: user.freezes,
        lastSessionDate: user.lastSessionDate,
        outcome: 'same-day',
        freezeEarned: false,
      };

  // Verified minutes count toward the weekly leaderboard; unverified do not.
  const weeklyMinutes = user.weeklyMinutes + (input.verified ? input.actualMin : 0);

  const nextUser: User = {
    ...user,
    totalXP: xpAfter,
    level: levelAfter,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    freezes: streak.freezes,
    lastSessionDate: streak.lastSessionDate,
    weeklyMinutes,
  };

  const session: Session = {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: user.id,
    intention: input.intention,
    vibe: input.vibe,
    plannedMin: input.plannedMin,
    actualMin: input.actualMin,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    verified: input.verified,
    voided: !input.verified,
    xpEarned: totalEarned,
  };

  return {
    user: nextUser,
    session,
    reward: {
      xpEarned: totalEarned,
      xpBefore,
      xpAfter,
      capped: xpResult.capped,
      completionBonusApplied: xpResult.completionBonusApplied,
      doubleXP,
      bonusXP,
      verified: input.verified,
      countsTowardStreak: qualifies,
      levelBefore,
      levelAfter,
      leveledUp: levelBefore !== levelAfter,
      progressBefore,
      progressAfter,
      streak,
    },
  };
}

/** Rank of `userId` before vs after, given the full user lists. */
export function computeRankDelta(before: User[], after: User[], userId: string) {
  return { before: rankOf(before, userId), after: rankOf(after, userId) };
}
