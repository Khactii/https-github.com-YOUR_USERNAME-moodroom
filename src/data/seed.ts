import { levelForXP, type Session, type User } from '../engine';
import { addDays, toLocalDateStr } from '../engine';

interface SeedSpec {
  username: string;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  freezes: number;
  weeklyMinutes: number;
  badges: string[];
  bio: string;
}

// ~12 mock users so the leaderboard and feed feel alive from first launch.
const SEED: SeedSpec[] = [
  { username: 'maya', totalXP: 142000, currentStreak: 63, longestStreak: 63, freezes: 1, weeklyMinutes: 1240, badges: ['Titan', '60-day flame'], bio: 'Locked in. Day 63 of Titan Mode.' },
  { username: 'devon', totalXP: 88000, currentStreak: 41, longestStreak: 47, freezes: 1, weeklyMinutes: 980, badges: ['Sage', 'Early riser'], bio: 'PhD by attrition.' },
  { username: 'priya', totalXP: 61000, currentStreak: 47, longestStreak: 47, freezes: 1, weeklyMinutes: 1100, badges: ['Sage', '40-day flame'], bio: 'Day 47 of Monk Mode.' },
  { username: 'leo', totalXP: 53000, currentStreak: 12, longestStreak: 38, freezes: 0, weeklyMinutes: 640, badges: ['Sage'], bio: 'Earning it back.' },
  { username: 'sam', totalXP: 34000, currentStreak: 28, longestStreak: 28, freezes: 1, weeklyMinutes: 870, badges: ['Monk', '21-day flame'], bio: 'Bar exam season.' },
  { username: 'aisha', totalXP: 26000, currentStreak: 19, longestStreak: 22, freezes: 0, weeklyMinutes: 720, badges: ['Monk'], bio: 'Shipping the novel.' },
  { username: 'noah', totalXP: 21000, currentStreak: 9, longestStreak: 15, freezes: 0, weeklyMinutes: 410, badges: ['Monk'], bio: 'Indie hacker.' },
  { username: 'kenji', totalXP: 14000, currentStreak: 7, longestStreak: 7, freezes: 1, weeklyMinutes: 520, badges: ['Apprentice', '7-day flame'], bio: 'First week locked.' },
  { username: 'zoe', totalXP: 9200, currentStreak: 4, longestStreak: 11, freezes: 0, weeklyMinutes: 280, badges: ['Apprentice'], bio: 'Studying for MCAT.' },
  { username: 'omar', totalXP: 6100, currentStreak: 14, longestStreak: 14, freezes: 1, weeklyMinutes: 600, badges: ['Apprentice', '14-day flame'], bio: 'Consistency > intensity.' },
  { username: 'tess', totalXP: 3400, currentStreak: 2, longestStreak: 5, freezes: 0, weeklyMinutes: 150, badges: ['Novice'], bio: 'New here. Locking in.' },
  { username: 'rafa', totalXP: 1200, currentStreak: 1, longestStreak: 3, freezes: 0, weeklyMinutes: 90, badges: ['Novice'], bio: 'Day one (again).' },
];

/** The user's one private Focus Circle (demoes the crew mechanic). */
export const CIRCLE_NAME = 'Deep Work Crew';
export const CIRCLE_IDS = ['u_me', 'u_priya', 'u_kenji', 'u_omar', 'u_sam', 'u_zoe'];

function makeUser(spec: SeedSpec): User {
  return {
    id: `u_${spec.username}`,
    username: spec.username,
    initial: spec.username[0].toUpperCase(),
    totalXP: spec.totalXP,
    level: levelForXP(spec.totalXP),
    currentStreak: spec.currentStreak,
    longestStreak: spec.longestStreak,
    lastSessionDate: toLocalDateStr(), // seeded as active today so streaks read as live
    freezes: spec.freezes,
    badges: spec.badges,
    bio: spec.bio,
    weeklyMinutes: spec.weeklyMinutes,
  };
}

export function seedMockUsers(): User[] {
  return SEED.map(makeUser);
}

export function makeMe(username: string): User {
  const clean = username.trim() || 'you';
  return {
    id: 'u_me',
    username: clean,
    initial: clean[0].toUpperCase(),
    totalXP: 0,
    level: 'Novice',
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    freezes: 0,
    badges: [],
    bio: 'Locking in.',
    weeklyMinutes: 0,
    isMe: true,
  };
}

// A few seeded feed entries from mock users so the Feed isn't empty at launch.
export function seedFeed(users: User[]): Session[] {
  const today = toLocalDateStr();
  const pick = (name: string) => users.find((u) => u.username === name)!;
  const entry = (
    user: User,
    intention: string,
    actualMin: number,
    xpEarned: number,
    daysAgo: number,
  ): Session => ({
    id: `seed_${user.username}_${daysAgo}`,
    userId: user.id,
    intention,
    vibe: 'Deep Focus',
    plannedMin: actualMin,
    actualMin,
    startedAt: `${addDays(today, -daysAgo)}T09:00:00`,
    endedAt: `${addDays(today, -daysAgo)}T09:${String(actualMin).padStart(2, '0')}:00`,
    verified: true,
    voided: false,
    xpEarned,
  });

  return [
    entry(pick('maya'), 'Grant proposal', 90, 108, 0),
    entry(pick('priya'), 'Thesis chapter 4', 50, 60, 0),
    entry(pick('kenji'), 'Leetcode grind', 50, 60, 0),
    entry(pick('sam'), 'Contracts outline', 25, 30, 0),
    entry(pick('omar'), 'Deep read', 50, 60, 1),
    entry(pick('aisha'), 'Draft ch. 9', 90, 108, 1),
  ];
}
