export interface SessionConfig {
  intention: string;
  vibe: string;
  plannedMin: number;
}

/** Tabs in the persistent bottom nav. */
export type Tab = 'home' | 'feed' | 'leaderboard' | 'profile';

/** All app views: the tabs plus the full-screen session flow. */
export type View = Tab | 'active' | 'complete';
