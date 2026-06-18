import type { Session, User } from '../engine';

/**
 * Persistence boundary. Today it's localStorage; swap this single module for an
 * API client later without touching the engine or UI.
 */
export interface PersistedState {
  version: number;
  meId: string | null;
  users: User[];
  sessions: Session[];
  /** XP earned today, keyed by 'YYYY-MM-DD', for the daily cap & diminishing returns. */
  daily: Record<string, { xp: number; verifiedMinutes: number }>;
  /** Monday (local) of the tracked leaderboard week; weeklyMinutes reset when it changes. */
  weekStart: string;
}

const KEY = 'werc.state.v2';
const VERSION = 2;

export function emptyState(): PersistedState {
  return { version: VERSION, meId: null, users: [], sessions: [], daily: {}, weekStart: '' };
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // best-effort; prototype only
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
