import { DEV_MODE, LEVEL_ORDER, LEVEL_THRESHOLDS_BASE } from './constants';
import type { Level } from './types';

/** Effective thresholds, divided by 100 in DEV_MODE for fast testing. */
export function levelThresholds(): Record<Level, number> {
  const divisor = DEV_MODE ? 100 : 1;
  const out = {} as Record<Level, number>;
  for (const lvl of LEVEL_ORDER) {
    out[lvl] = Math.round(LEVEL_THRESHOLDS_BASE[lvl] / divisor);
  }
  return out;
}

export function levelForXP(xp: number): Level {
  const t = levelThresholds();
  let current: Level = 'Novice';
  for (const lvl of LEVEL_ORDER) {
    if (xp >= t[lvl]) current = lvl;
  }
  return current;
}

export interface LevelProgress {
  level: Level;
  next: Level | null;
  floor: number; // XP at the start of the current level
  ceiling: number | null; // XP needed for the next level (null at max)
  xpIntoLevel: number;
  xpForNext: number | null; // XP remaining to next level (null at max)
  pct: number; // 0..1 progress toward next level (1 at max)
}

export function levelProgress(xp: number): LevelProgress {
  const t = levelThresholds();
  const level = levelForXP(xp);
  const idx = LEVEL_ORDER.indexOf(level);
  const next = idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
  const floor = t[level];
  const ceiling = next ? t[next] : null;
  const xpIntoLevel = xp - floor;

  if (ceiling === null) {
    return { level, next, floor, ceiling, xpIntoLevel, xpForNext: null, pct: 1 };
  }
  const span = ceiling - floor;
  const pct = span > 0 ? Math.min(1, xpIntoLevel / span) : 1;
  return { level, next, floor, ceiling, xpIntoLevel, xpForNext: Math.max(0, ceiling - xp), pct };
}
