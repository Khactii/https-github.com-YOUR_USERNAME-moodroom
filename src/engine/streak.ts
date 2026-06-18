import { MAX_FREEZES, STREAK_FREEZE_MILESTONE } from './constants';
import { daysBetween } from './dates';

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  freezes: number;
  lastSessionDate: string | null;
}

export interface StreakUpdate extends StreakState {
  /** What happened, for the UI to choose its message/animation. */
  outcome: 'first' | 'extended' | 'same-day' | 'frozen' | 'reset';
  freezeEarned: boolean;
}

/**
 * Apply a qualifying session (>= MIN_SESSION_MIN, verified) on `today`.
 *
 * - same calendar day as last session: no double-count
 * - exactly the next day: streak extends
 * - a single missed day: auto-consume a banked freeze to bridge it; otherwise reset to 1
 * - longer gap: reset to 1 ("earn it back", never a harsh punishment)
 * - reaching a 7-day milestone banks a freeze (capped at MAX_FREEZES)
 */
export function applyQualifyingSession(state: StreakState, today: string): StreakUpdate {
  let { currentStreak, longestStreak, freezes } = state;
  const { lastSessionDate } = state;
  let outcome: StreakUpdate['outcome'];

  if (!lastSessionDate) {
    currentStreak = 1;
    outcome = 'first';
  } else {
    const diff = daysBetween(lastSessionDate, today);
    if (diff <= 0) {
      // Already counted today — XP still accrues elsewhere, streak unchanged.
      return {
        currentStreak,
        longestStreak,
        freezes,
        lastSessionDate: today,
        outcome: 'same-day',
        freezeEarned: false,
      };
    } else if (diff === 1) {
      currentStreak += 1;
      outcome = 'extended';
    } else {
      const missedDays = diff - 1;
      if (missedDays === 1 && freezes > 0) {
        freezes -= 1;
        currentStreak += 1;
        outcome = 'frozen';
      } else {
        currentStreak = 1;
        outcome = 'reset';
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  let freezeEarned = false;
  if (currentStreak > 0 && currentStreak % STREAK_FREEZE_MILESTONE === 0 && freezes < MAX_FREEZES) {
    freezes = Math.min(MAX_FREEZES, freezes + 1);
    freezeEarned = true;
  }

  return { currentStreak, longestStreak, freezes, lastSessionDate: today, outcome, freezeEarned };
}

/**
 * Evaluate the streak at a day boundary with no session (e.g. on app open).
 * Resets a stale streak unless a freeze can bridge a single missed day.
 * Used to surface the "earn it back" state and to simulate a missed day.
 */
export function evaluateDayBoundary(state: StreakState, today: string): StreakUpdate {
  const { lastSessionDate, longestStreak } = state;
  let { currentStreak, freezes } = state;

  if (!lastSessionDate || currentStreak === 0) {
    return { ...state, outcome: 'same-day', freezeEarned: false };
  }

  const diff = daysBetween(lastSessionDate, today);
  if (diff <= 1) {
    // today or yesterday — streak still alive, nothing to do.
    return { ...state, outcome: 'same-day', freezeEarned: false };
  }

  const missedDays = diff - 1;
  if (missedDays === 1 && freezes > 0) {
    freezes -= 1;
    return {
      currentStreak,
      longestStreak,
      freezes,
      lastSessionDate: today, // freeze keeps the chain anchored to today
      outcome: 'frozen',
      freezeEarned: false,
    };
  }

  currentStreak = 0;
  return {
    currentStreak,
    longestStreak,
    freezes,
    lastSessionDate,
    outcome: 'reset',
    freezeEarned: false,
  };
}
