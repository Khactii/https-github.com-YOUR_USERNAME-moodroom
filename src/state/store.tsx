import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  addDays,
  applySession,
  computeRankDelta,
  evaluateDayBoundary,
  rankOf,
  rankUsers,
  startOfWeek,
  toLocalDateStr,
  type RankedUser,
  type Session,
  type SessionResult,
  type User,
} from '../engine';
import { CIRCLE_IDS, CIRCLE_NAME, makeMe, seedFeed, seedMockUsers, seedWeeklyMinutesById } from '../data/seed';
import { clearState, emptyState, loadState, saveState, type PersistedState } from '../storage/storage';

export interface FinishSessionArgs {
  intention: string;
  vibe: string;
  plannedMin: number;
  actualMin: number;
  verified: boolean;
  startedAt: string;
  endedAt: string;
}

interface StoreValue {
  ready: boolean;
  onboarded: boolean;
  me: User | null;
  users: User[];
  sessions: Session[];
  ranked: RankedUser[];
  circleRanked: RankedUser[];
  circleName: string;
  myRank: number | null;
  todayXP: number;
  // actions
  onboard: (username: string) => void;
  finishSession: (args: FinishSessionArgs) => SessionResult & { rankBefore: number | null; rankAfter: number | null };
  simulateMissedDay: () => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function bootstrap(): PersistedState {
  const existing = loadState();
  if (existing) return existing;
  const users = seedMockUsers();
  const sessions = seedFeed(users);
  return { ...emptyState(), users, sessions, weekStart: startOfWeek() };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => {
    if (typeof window === 'undefined') return emptyState();
    return bootstrap();
  });
  const [ready, setReady] = useState(false);

  // On mount: evaluate the day boundary (stale streaks) and the week boundary
  // (the leaderboard resets Monday — zero my weekly minutes, repopulate the
  // mock board so it isn't empty).
  useEffect(() => {
    setState((prev) => {
      if (!prev.meId) return prev;
      const today = toLocalDateStr();
      const thisWeek = startOfWeek();
      const weekRolled = !!prev.weekStart && prev.weekStart !== thisWeek;
      const seedWeekly = weekRolled ? seedWeeklyMinutesById() : null;

      const users = prev.users.map((u) => {
        let next = u;
        if (u.id === prev.meId) {
          const ev = evaluateDayBoundary(
            { currentStreak: u.currentStreak, longestStreak: u.longestStreak, freezes: u.freezes, lastSessionDate: u.lastSessionDate },
            today,
          );
          next = { ...next, currentStreak: ev.currentStreak, longestStreak: ev.longestStreak, freezes: ev.freezes };
        }
        if (weekRolled) {
          next = { ...next, weeklyMinutes: u.id === prev.meId ? 0 : seedWeekly![u.id] ?? 0 };
        }
        return next;
      });

      return { ...prev, users, weekStart: thisWeek };
    });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const me = useMemo(() => state.users.find((u) => u.id === state.meId) ?? null, [state]);
  const ranked = useMemo(() => rankUsers(state.users), [state.users]);
  const circleRanked = useMemo(
    () => rankUsers(state.users.filter((u) => CIRCLE_IDS.includes(u.id))),
    [state.users],
  );
  const myRank = useMemo(() => (me ? rankOf(state.users, me.id) : null), [state.users, me]);
  const today = toLocalDateStr();
  const todayXP = state.daily[today]?.xp ?? 0;

  const onboard = useCallback((username: string) => {
    setState((prev) => {
      const meUser = makeMe(username);
      const users = prev.users.some((u) => u.id === 'u_me')
        ? prev.users.map((u) => (u.id === 'u_me' ? meUser : u))
        : [...prev.users, meUser];
      return { ...prev, meId: meUser.id, users };
    });
  }, []);

  const finishSession = useCallback<StoreValue['finishSession']>((args) => {
    const today = toLocalDateStr();
    let result!: SessionResult;
    let rankBefore: number | null = null;
    let rankAfter: number | null = null;

    setState((prev) => {
      const meId = prev.meId!;
      const before = prev.users;
      const meUser = before.find((u) => u.id === meId)!;
      const dailyToday = prev.daily[today] ?? { xp: 0, verifiedMinutes: 0 };

      result = applySession(meUser, {
        ...args,
        verifiedMinutesToday: dailyToday.verifiedMinutes,
        xpEarnedToday: dailyToday.xp,
        today,
        delightRoll: Math.random(),
      });

      const after = before.map((u) => (u.id === meId ? result.user : u));
      const delta = computeRankDelta(before, after, meId);
      rankBefore = delta.before;
      rankAfter = delta.after;

      // The daily cap tracks BASE (fair) XP only — the surprise bonus is upside
      // that never eats into tomorrow's earnable credit.
      const baseXP = result.reward.xpEarned - result.reward.bonusXP;
      const cutoff = addDays(today, -14);
      const daily: typeof prev.daily = {};
      for (const [day, v] of Object.entries(prev.daily)) {
        if (day >= cutoff) daily[day] = v;
      }
      daily[today] = {
        xp: dailyToday.xp + baseXP,
        verifiedMinutes: dailyToday.verifiedMinutes + (args.verified ? args.actualMin : 0),
      };

      return {
        ...prev,
        users: after,
        sessions: [result.session, ...prev.sessions],
        daily,
      };
    });

    return { ...result, rankBefore, rankAfter };
  }, []);

  // DEV: rewind lastSessionDate two days so the next session triggers a reset/freeze.
  const simulateMissedDay = useCallback(() => {
    setState((prev) => {
      const meId = prev.meId;
      if (!meId) return prev;
      const users = prev.users.map((u) => {
        if (u.id !== meId) return u;
        const anchor = u.lastSessionDate ?? toLocalDateStr();
        return { ...u, lastSessionDate: addDays(anchor, -2) };
      });
      return { ...prev, users };
    });
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    setState(bootstrap());
  }, []);

  const value: StoreValue = {
    ready,
    onboarded: !!state.meId,
    me,
    users: state.users,
    sessions: state.sessions,
    ranked,
    circleRanked,
    circleName: CIRCLE_NAME,
    myRank,
    todayXP,
    onboard,
    finishSession,
    simulateMissedDay,
    resetAll,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
