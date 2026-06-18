import { describe, expect, it } from 'vitest';
import { computeSessionXP } from './xp';
import { applyQualifyingSession, evaluateDayBoundary } from './streak';
import { levelForXP, levelProgress, levelThresholds } from './level';
import { rankUsers, weeklyScore } from './leaderboard';
import { applySession } from './session';
import { addDays, daysBetween, startOfWeek, toLocalDateStr } from './dates';
import { DEV_MODE } from './constants';
import type { User } from './types';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u_me',
    username: 'me',
    initial: 'M',
    totalXP: 0,
    level: 'Novice',
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    freezes: 0,
    badges: [],
    weeklyMinutes: 0,
    isMe: true,
    ...overrides,
  };
}

describe('dates', () => {
  it('computes whole calendar days between dates', () => {
    expect(daysBetween('2026-06-10', '2026-06-11')).toBe(1);
    expect(daysBetween('2026-06-10', '2026-06-10')).toBe(0);
    expect(daysBetween('2026-06-11', '2026-06-10')).toBe(-1);
    expect(daysBetween('2026-06-01', '2026-07-01')).toBe(30);
  });

  it('addDays wraps months', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01');
  });

  it('startOfWeek lands on a Monday', () => {
    // 2026-06-18 is a Thursday -> Monday is 2026-06-15
    expect(startOfWeek(new Date(2026, 5, 18))).toBe('2026-06-15');
  });
});

describe('XP', () => {
  it('awards 1 XP per verified minute', () => {
    expect(computeSessionXP({ actualMin: 50, completedFull: false, verified: true, verifiedMinutesToday: 0, xpEarnedToday: 0 }).xp).toBe(50);
  });

  it('adds the +20% completion bonus', () => {
    expect(computeSessionXP({ actualMin: 50, completedFull: true, verified: true, verifiedMinutesToday: 0, xpEarnedToday: 0 }).xp).toBe(60);
  });

  it('halves XP beyond 240 verified minutes in a day', () => {
    // 20 minutes worked, but 230 already done today: 10 @ full + 10 @ half = 15
    const r = computeSessionXP({ actualMin: 20, completedFull: false, verified: true, verifiedMinutesToday: 230, xpEarnedToday: 0 });
    expect(r.xp).toBe(15);
  });

  it('clamps to the 300 XP daily cap', () => {
    const r = computeSessionXP({ actualMin: 100, completedFull: false, verified: true, verifiedMinutesToday: 0, xpEarnedToday: 280 });
    expect(r.xp).toBe(20);
    expect(r.capped).toBe(true);
  });

  it('gives unverified sessions 0.25x and no bonus', () => {
    const r = computeSessionXP({ actualMin: 40, completedFull: true, verified: false, verifiedMinutesToday: 0, xpEarnedToday: 0 });
    expect(r.xp).toBe(10);
    expect(r.completionBonusApplied).toBe(false);
  });
});

describe('streak', () => {
  it('starts at 1 on the first qualifying session', () => {
    const r = applyQualifyingSession({ currentStreak: 0, longestStreak: 0, freezes: 0, lastSessionDate: null }, '2026-06-18');
    expect(r.currentStreak).toBe(1);
    expect(r.outcome).toBe('first');
  });

  it('does not double-count a second session the same day', () => {
    const r = applyQualifyingSession({ currentStreak: 3, longestStreak: 3, freezes: 0, lastSessionDate: '2026-06-18' }, '2026-06-18');
    expect(r.currentStreak).toBe(3);
    expect(r.outcome).toBe('same-day');
  });

  it('extends on the next day', () => {
    const r = applyQualifyingSession({ currentStreak: 3, longestStreak: 3, freezes: 0, lastSessionDate: '2026-06-17' }, '2026-06-18');
    expect(r.currentStreak).toBe(4);
    expect(r.outcome).toBe('extended');
  });

  it('banks a freeze at every 7-day milestone (capped at 1)', () => {
    const r = applyQualifyingSession({ currentStreak: 6, longestStreak: 6, freezes: 0, lastSessionDate: '2026-06-17' }, '2026-06-18');
    expect(r.currentStreak).toBe(7);
    expect(r.freezes).toBe(1);
    expect(r.freezeEarned).toBe(true);
  });

  it('consumes a banked freeze to bridge a single missed day', () => {
    const r = applyQualifyingSession({ currentStreak: 7, longestStreak: 7, freezes: 1, lastSessionDate: '2026-06-16' }, '2026-06-18');
    expect(r.currentStreak).toBe(8);
    expect(r.freezes).toBe(0);
    expect(r.outcome).toBe('frozen');
  });

  it('resets to 1 after a missed day with no freeze', () => {
    const r = applyQualifyingSession({ currentStreak: 5, longestStreak: 5, freezes: 0, lastSessionDate: '2026-06-16' }, '2026-06-18');
    expect(r.currentStreak).toBe(1);
    expect(r.outcome).toBe('reset');
    expect(r.longestStreak).toBe(5); // longest preserved
  });

  it('evaluateDayBoundary resets a stale streak with no freeze', () => {
    const r = evaluateDayBoundary({ currentStreak: 5, longestStreak: 9, freezes: 0, lastSessionDate: '2026-06-15' }, '2026-06-18');
    expect(r.currentStreak).toBe(0);
    expect(r.outcome).toBe('reset');
  });

  it('evaluateDayBoundary leaves an alive streak untouched', () => {
    const r = evaluateDayBoundary({ currentStreak: 5, longestStreak: 9, freezes: 0, lastSessionDate: '2026-06-17' }, '2026-06-18');
    expect(r.currentStreak).toBe(5);
  });
});

describe('levels', () => {
  it('uses DEV_MODE thresholds', () => {
    const t = levelThresholds();
    if (DEV_MODE) {
      expect(t.Apprentice).toBe(50);
      expect(t.Titan).toBe(1000);
    } else {
      expect(t.Apprentice).toBe(5000);
    }
  });

  it('maps XP to the right level', () => {
    const t = levelThresholds();
    expect(levelForXP(0)).toBe('Novice');
    expect(levelForXP(t.Apprentice)).toBe('Apprentice');
    expect(levelForXP(t.Titan + 999)).toBe('Titan');
  });

  it('reports progress toward the next level', () => {
    const t = levelThresholds();
    const p = levelProgress(t.Apprentice);
    expect(p.level).toBe('Apprentice');
    expect(p.next).toBe('Monk');
    expect(p.pct).toBeCloseTo(0, 5);
  });

  it('caps progress at Titan', () => {
    const t = levelThresholds();
    const p = levelProgress(t.Titan + 5000);
    expect(p.next).toBeNull();
    expect(p.pct).toBe(1);
  });
});

describe('leaderboard', () => {
  it('weights consistency: minutes + streak*60', () => {
    expect(weeklyScore({ weeklyMinutes: 120, currentStreak: 3 })).toBe(300);
  });

  it('ranks by weekly score descending', () => {
    const users = [
      makeUser({ id: 'a', weeklyMinutes: 100, currentStreak: 0 }),
      makeUser({ id: 'b', weeklyMinutes: 0, currentStreak: 5 }), // 300
      makeUser({ id: 'c', weeklyMinutes: 250, currentStreak: 0 }),
    ];
    const ranked = rankUsers(users);
    expect(ranked.map((r) => r.user.id)).toEqual(['b', 'c', 'a']);
    expect(ranked[0].rank).toBe(1);
  });
});

describe('applySession (orchestration / Phase 1 DoD)', () => {
  it('a verified session updates XP, streak and persists-ready user', () => {
    const me = makeUser();
    const res = applySession(me, {
      intention: 'Write the essay',
      vibe: 'Deep',
      plannedMin: 50,
      actualMin: 50,
      verified: true,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      verifiedMinutesToday: 0,
      xpEarnedToday: 0,
      today: '2026-06-18',
    });
    expect(res.reward.xpEarned).toBe(60); // 50 + 20% completion
    expect(res.user.totalXP).toBe(60);
    expect(res.user.currentStreak).toBe(1);
    expect(res.reward.countsTowardStreak).toBe(true);
    expect(res.user.weeklyMinutes).toBe(50);
  });

  it('a second verified session the same day adds XP but does not double the streak', () => {
    const me = makeUser({ totalXP: 60, currentStreak: 1, longestStreak: 1, lastSessionDate: '2026-06-18', weeklyMinutes: 50 });
    const res = applySession(me, {
      intention: 'More',
      vibe: 'Deep',
      plannedMin: 25,
      actualMin: 25,
      verified: true,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      verifiedMinutesToday: 50,
      xpEarnedToday: 60,
      today: '2026-06-18',
    });
    expect(res.user.totalXP).toBe(90); // +30
    expect(res.user.currentStreak).toBe(1); // unchanged
    expect(res.reward.streak.outcome).toBe('same-day');
  });

  it('an unverified session earns 0.25x and does not extend the streak or weekly minutes', () => {
    const me = makeUser({ currentStreak: 2, longestStreak: 2, lastSessionDate: '2026-06-17', weeklyMinutes: 100 });
    const res = applySession(me, {
      intention: 'Distracted',
      vibe: 'Deep',
      plannedMin: 40,
      actualMin: 40,
      verified: false,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      verifiedMinutesToday: 0,
      xpEarnedToday: 0,
      today: '2026-06-18',
    });
    expect(res.reward.xpEarned).toBe(10); // 40 * 0.25
    expect(res.user.currentStreak).toBe(2); // unchanged
    expect(res.user.weeklyMinutes).toBe(100); // unverified excluded
    expect(res.reward.countsTowardStreak).toBe(false);
  });

  it('a session under 15 minutes does not count toward the streak', () => {
    const me = makeUser();
    const res = applySession(me, {
      intention: 'Quick',
      vibe: 'Deep',
      plannedMin: 10,
      actualMin: 10,
      verified: true,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      verifiedMinutesToday: 0,
      xpEarnedToday: 0,
      today: '2026-06-18',
    });
    expect(res.reward.countsTowardStreak).toBe(false);
    expect(res.user.currentStreak).toBe(0);
    expect(res.user.totalXP).toBe(12); // still earns personal XP (10 + 20% completion)
  });

  it('a simulated missed day resets the streak unless a freeze is banked', () => {
    const yesterdayMissed = makeUser({ currentStreak: 4, longestStreak: 4, freezes: 0, lastSessionDate: '2026-06-16' });
    const noFreeze = applySession(yesterdayMissed, {
      intention: 'Back', vibe: 'Deep', plannedMin: 25, actualMin: 25, verified: true,
      startedAt: '', endedAt: '', verifiedMinutesToday: 0, xpEarnedToday: 0, today: '2026-06-18',
    });
    expect(noFreeze.user.currentStreak).toBe(1);

    const withFreeze = makeUser({ currentStreak: 4, longestStreak: 4, freezes: 1, lastSessionDate: '2026-06-16' });
    const frozen = applySession(withFreeze, {
      intention: 'Back', vibe: 'Deep', plannedMin: 25, actualMin: 25, verified: true,
      startedAt: '', endedAt: '', verifiedMinutesToday: 0, xpEarnedToday: 0, today: '2026-06-18',
    });
    expect(frozen.user.currentStreak).toBe(5);
    expect(frozen.user.freezes).toBe(0);
  });

  it('today defaults to local today when omitted', () => {
    const res = applySession(makeUser(), {
      intention: 'x', vibe: 'Deep', plannedMin: 25, actualMin: 25, verified: true,
      startedAt: '', endedAt: '', verifiedMinutesToday: 0, xpEarnedToday: 0,
    });
    expect(res.user.lastSessionDate).toBe(toLocalDateStr());
  });
});
