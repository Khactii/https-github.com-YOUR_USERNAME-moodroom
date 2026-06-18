import {
  COMPLETION_BONUS,
  DAILY_XP_CAP,
  DIMINISHING_AFTER_MIN,
  DIMINISHING_RATE,
  UNVERIFIED_MULTIPLIER,
  XP_PER_MINUTE,
} from './constants';

export interface XPInput {
  /** Verified minutes actually worked in this session. */
  actualMin: number;
  /** True if the user completed the full planned duration without leaving. */
  completedFull: boolean;
  /** Whether the session is verified (phone-free / never left the app). */
  verified: boolean;
  /** Verified minutes already worked earlier today (for diminishing returns). */
  verifiedMinutesToday: number;
  /** XP already earned today (for the daily cap). */
  xpEarnedToday: number;
}

export interface XPResult {
  xp: number;
  gross: number; // before the daily cap clamp
  capped: boolean;
  completionBonusApplied: boolean;
}

/**
 * Deterministic, fair XP math. Variability lives in the celebration layer, never
 * in whether honest work earns credit.
 *
 * - 1 XP / verified minute
 * - +20% for completing the full planned duration
 * - beyond 240 verified min in a day, XP/min halves (kills overnight farming)
 * - daily cap of 300 XP
 * - an unverified session earns 0.25x personal XP only (and never bonus)
 */
export function computeSessionXP(input: XPInput): XPResult {
  const { actualMin, completedFull, verified, verifiedMinutesToday, xpEarnedToday } = input;

  if (actualMin <= 0) {
    return { xp: 0, gross: 0, capped: false, completionBonusApplied: false };
  }

  if (!verified) {
    const xp = Math.round(actualMin * XP_PER_MINUTE * UNVERIFIED_MULTIPLIER);
    return { xp, gross: xp, capped: false, completionBonusApplied: false };
  }

  // Base XP, minute by minute, applying diminishing returns past the daily threshold.
  let base = 0;
  for (let i = 0; i < actualMin; i++) {
    const dayMinuteIndex = verifiedMinutesToday + i;
    const rate = dayMinuteIndex >= DIMINISHING_AFTER_MIN ? XP_PER_MINUTE * DIMINISHING_RATE : XP_PER_MINUTE;
    base += rate;
  }

  const completionBonusApplied = completedFull;
  if (completionBonusApplied) base *= 1 + COMPLETION_BONUS;

  const gross = Math.round(base);
  const remaining = Math.max(0, DAILY_XP_CAP - xpEarnedToday);
  const xp = Math.min(gross, remaining);

  return { xp, gross, capped: xp < gross, completionBonusApplied };
}
