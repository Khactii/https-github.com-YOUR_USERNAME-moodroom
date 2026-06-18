import { levelThresholds } from './level';
import type { Level, Session, User } from './types';

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  /** lucide-react icon name, resolved by the UI. */
  icon: string;
}

export interface AchievementStatus {
  def: AchievementDef;
  earned: boolean;
  /** 0..1 progress toward earning it (1 when earned). */
  progress: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_lock', name: 'First Lock', desc: 'Finish your first verified session', icon: 'Lock' },
  { id: 'marathon', name: 'Marathoner', desc: 'Complete a single 90-minute session', icon: 'Timer' },
  { id: 'week_warrior', name: 'Week Warrior', desc: 'Reach a 7-day streak', icon: 'Flame' },
  { id: 'unbroken', name: 'Unbroken', desc: 'Reach a 30-day streak', icon: 'Shield' },
  { id: 'early_bird', name: 'Early Bird', desc: 'Lock in before 7am', icon: 'Sunrise' },
  { id: 'night_owl', name: 'Night Owl', desc: 'Lock in after 10pm', icon: 'Moon' },
  { id: 'monk_mode', name: 'Monk Mode', desc: 'Reach the Monk level', icon: 'Mountain' },
  { id: 'titan', name: 'Titan', desc: 'Reach the Titan level', icon: 'Crown' },
];

const LEVEL_RANK: Record<Level, number> = { Novice: 0, Apprentice: 1, Monk: 2, Sage: 3, Titan: 4 };

/**
 * Evaluate which achievements a user has earned. Pure: derived entirely from the
 * user's stats and their own verified sessions. Progress is best-effort for the UI.
 */
export function evaluateAchievements(user: User, sessions: Session[]): AchievementStatus[] {
  const mine = sessions.filter((s) => s.userId === user.id && s.verified);
  const longestSession = mine.reduce((m, s) => Math.max(m, s.actualMin), 0);
  const hasEarly = mine.some((s) => new Date(s.startedAt).getHours() < 7);
  const hasLate = mine.some((s) => new Date(s.startedAt).getHours() >= 22);
  const levelRank = LEVEL_RANK[user.level];
  const t = levelThresholds();

  const clamp = (n: number) => Math.max(0, Math.min(1, n));

  const map: Record<string, { earned: boolean; progress: number }> = {
    first_lock: { earned: mine.length >= 1, progress: clamp(mine.length / 1) },
    marathon: { earned: longestSession >= 90, progress: clamp(longestSession / 90) },
    week_warrior: { earned: user.longestStreak >= 7, progress: clamp(user.longestStreak / 7) },
    unbroken: { earned: user.longestStreak >= 30, progress: clamp(user.longestStreak / 30) },
    early_bird: { earned: hasEarly, progress: hasEarly ? 1 : 0 },
    night_owl: { earned: hasLate, progress: hasLate ? 1 : 0 },
    monk_mode: { earned: levelRank >= LEVEL_RANK.Monk, progress: clamp(user.totalXP / t.Monk) },
    titan: { earned: levelRank >= LEVEL_RANK.Titan, progress: clamp(user.totalXP / t.Titan) },
  };

  return ACHIEVEMENTS.map((def) => ({ def, earned: map[def.id].earned, progress: map[def.id].progress }));
}
