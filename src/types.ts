export interface SessionConfig {
  intention: string;
  vibe: string;
  plannedMin: number;
}

/** Tabs in the persistent bottom nav. */
export type Tab = 'home' | 'feed' | 'leaderboard' | 'profile';

/**
 * All app views: the tabs, the full-screen session flow, and the Phase 3
 * flex screens (Focus Circle, boss battle, Pro paywall) shown as overlays.
 */
export type View = Tab | 'active' | 'complete' | 'circle' | 'boss' | 'paywall';
