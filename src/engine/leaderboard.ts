import { STREAK_MINUTE_VALUE } from './constants';
import type { User } from './types';

/** Consistency-weighted weekly score. A day of streak ~= an hour of work. */
export function weeklyScore(user: Pick<User, 'weeklyMinutes' | 'currentStreak'>): number {
  return user.weeklyMinutes + user.currentStreak * STREAK_MINUTE_VALUE;
}

export interface RankedUser {
  user: User;
  score: number;
  rank: number; // 1-indexed
}

/** Rank users by weeklyScore descending. Ties broken by streak, then total XP. */
export function rankUsers(users: User[]): RankedUser[] {
  return [...users]
    .map((user) => ({ user, score: weeklyScore(user) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.user.currentStreak !== a.user.currentStreak) return b.user.currentStreak - a.user.currentStreak;
      return b.user.totalXP - a.user.totalXP;
    })
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function rankOf(users: User[], userId: string): number | null {
  const found = rankUsers(users).find((r) => r.user.id === userId);
  return found ? found.rank : null;
}
