export type Level = 'Novice' | 'Apprentice' | 'Monk' | 'Sage' | 'Titan';

export interface User {
  id: string;
  username: string;
  initial: string; // avatar letter
  totalXP: number;
  level: Level;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null; // 'YYYY-MM-DD' local
  freezes: number;
  badges: string[];
  bio?: string;
  weeklyMinutes: number; // verified minutes this week (for leaderboard)
  isMe?: boolean;
}

export interface Session {
  id: string;
  userId: string;
  intention: string;
  vibe: string; // binaural preset label (stub)
  plannedMin: number;
  actualMin: number;
  startedAt: string; // ISO
  endedAt: string; // ISO
  verified: boolean;
  voided: boolean;
  xpEarned: number;
}
