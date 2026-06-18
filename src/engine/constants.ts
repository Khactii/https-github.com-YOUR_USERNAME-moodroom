import type { Level } from './types';

/**
 * DEV_MODE divides level thresholds by 100 so you can actually level up while
 * testing. Flip to false for production-realistic thresholds.
 */
export const DEV_MODE = true;

// ---- XP rules ----
export const XP_PER_MINUTE = 1; // 1 XP per verified minute
export const COMPLETION_BONUS = 0.2; // +20% for finishing the full planned duration
export const DAILY_XP_CAP = 300; // max XP earnable per local day
export const DIMINISHING_AFTER_MIN = 240; // beyond this many verified min/day, xp/min halves
export const DIMINISHING_RATE = 0.5;
export const MIN_SESSION_MIN = 15; // minimum real session to count toward streak/rank
export const UNVERIFIED_MULTIPLIER = 0.25; // unverified session earns 0.25x personal XP only

// ---- Integrity ----
export const VISIBILITY_GRACE_MS = 3000; // leaving the app longer than this voids verification

// ---- Streaks ----
export const STREAK_FREEZE_MILESTONE = 7; // earn 1 freeze at every 7-day streak milestone
export const MAX_FREEZES = 1; // max banked freezes

// ---- Leaderboard ----
// weeklyScore = verifiedMinutesThisWeek + (currentStreak * STREAK_MINUTE_VALUE)
export const STREAK_MINUTE_VALUE = 60; // a day of streak ~= an hour of work

// ---- Levels ----
export const LEVEL_THRESHOLDS_BASE: Record<Level, number> = {
  Novice: 0,
  Apprentice: 5000,
  Monk: 20000,
  Sage: 50000,
  Titan: 100000,
};

export const LEVEL_ORDER: Level[] = ['Novice', 'Apprentice', 'Monk', 'Sage', 'Titan'];
