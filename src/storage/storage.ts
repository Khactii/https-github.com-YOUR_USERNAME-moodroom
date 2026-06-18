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
}

const KEY = 'werc.state.v1';
const VERSION = 1;

export function emptyState(): PersistedState {
  return { version: VERSION, meId: null, users: [], sessions: [], daily: {} };
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
