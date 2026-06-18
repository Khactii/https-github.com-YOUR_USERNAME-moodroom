/**
 * Local-calendar date helpers. The streak/leaderboard math is keyed on the
 * user's local calendar day, never UTC.
 */

/** Format a Date as 'YYYY-MM-DD' in local time. */
export function toLocalDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole calendar days from `a` to `b` (both 'YYYY-MM-DD'). Positive if b is later. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / 86400000);
}

/** Add `n` days to a 'YYYY-MM-DD' string, returning a 'YYYY-MM-DD' string. */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return toLocalDateStr(dt);
}

/** Monday (local) of the week containing `d`, as 'YYYY-MM-DD'. Week resets Monday. */
export function startOfWeek(d: Date = new Date()): string {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (dt.getDay() + 6) % 7; // 0 = Monday
  dt.setDate(dt.getDate() - dow);
  return toLocalDateStr(dt);
}
