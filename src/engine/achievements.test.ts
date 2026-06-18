import { describe, expect, it } from 'vitest';
import { evaluateAchievements } from './achievements';
import type { Session, User } from './types';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u_me', username: 'me', initial: 'M', totalXP: 0, level: 'Novice',
    currentStreak: 0, longestStreak: 0, lastSessionDate: null, freezes: 0,
    badges: [], weeklyMinutes: 0, ...overrides,
  };
}

function session(overrides: Partial<Session> = {}): Session {
  return {
    id: 's1', userId: 'u_me', intention: 'x', vibe: 'Deep', plannedMin: 50, actualMin: 50,
    startedAt: '2026-06-18T09:00:00', endedAt: '2026-06-18T09:50:00', verified: true,
    voided: false, xpEarned: 60, ...overrides,
  };
}

describe('achievements', () => {
  it('returns one status per definition', () => {
    const res = evaluateAchievements(makeUser(), []);
    expect(res.length).toBeGreaterThanOrEqual(8);
    expect(res.every((r) => !r.earned)).toBe(true);
  });

  it('earns First Lock after one verified session', () => {
    const res = evaluateAchievements(makeUser(), [session()]);
    expect(res.find((r) => r.def.id === 'first_lock')!.earned).toBe(true);
  });

  it('ignores other users and unverified sessions', () => {
    const sessions = [session({ userId: 'u_other' }), session({ id: 's2', verified: false, voided: true })];
    const res = evaluateAchievements(makeUser(), sessions);
    expect(res.find((r) => r.def.id === 'first_lock')!.earned).toBe(false);
  });

  it('earns Marathoner for a 90-minute session and reports partial progress otherwise', () => {
    const earned = evaluateAchievements(makeUser(), [session({ actualMin: 90 })]);
    expect(earned.find((r) => r.def.id === 'marathon')!.earned).toBe(true);
    const partial = evaluateAchievements(makeUser(), [session({ actualMin: 45 })]);
    expect(partial.find((r) => r.def.id === 'marathon')!.progress).toBeCloseTo(0.5, 5);
  });

  it('earns streak milestones from longestStreak', () => {
    const res = evaluateAchievements(makeUser({ longestStreak: 30 }), []);
    expect(res.find((r) => r.def.id === 'week_warrior')!.earned).toBe(true);
    expect(res.find((r) => r.def.id === 'unbroken')!.earned).toBe(true);
  });

  it('detects early bird and night owl by session hour', () => {
    const early = evaluateAchievements(makeUser(), [session({ startedAt: '2026-06-18T06:30:00' })]);
    expect(early.find((r) => r.def.id === 'early_bird')!.earned).toBe(true);
    const late = evaluateAchievements(makeUser(), [session({ startedAt: '2026-06-18T23:10:00' })]);
    expect(late.find((r) => r.def.id === 'night_owl')!.earned).toBe(true);
  });

  it('earns level achievements at and above the threshold', () => {
    const res = evaluateAchievements(makeUser({ level: 'Titan' }), []);
    expect(res.find((r) => r.def.id === 'monk_mode')!.earned).toBe(true);
    expect(res.find((r) => r.def.id === 'titan')!.earned).toBe(true);
  });
});
