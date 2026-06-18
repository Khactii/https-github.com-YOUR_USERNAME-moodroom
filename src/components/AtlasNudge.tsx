import { useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { levelProgress, type User } from '../engine';

/**
 * Atlas, the AI coach — STUBBED. A few canned, context-aware nudges. The real
 * Atlas is an LLM coach; here we just pick a fitting line so the surface exists.
 */
function pickNudge(me: User): string {
  const p = levelProgress(me.totalXP);
  if (me.currentStreak === 0) {
    return "Today's the day you start. One 25-minute lock-in and the flame is lit.";
  }
  if (me.freezes > 0) {
    return `You've banked a freeze — your ${me.currentStreak}-day flame is protected if life happens. Now go extend it.`;
  }
  if (p.next && p.xpForNext != null && p.xpForNext <= 120) {
    return `You're ${p.xpForNext} XP from ${p.next}. That's barely two sessions. Want it today?`;
  }
  if (me.currentStreak >= 7) {
    return `Day ${me.currentStreak}. You don't break chains this long — you protect them. Lock in.`;
  }
  return "Momentum compounds. Stack one more honest session onto today.";
}

export function AtlasNudge({ me }: { me: User }) {
  const [dismissed, setDismissed] = useState(false);
  const nudge = useMemo(() => pickNudge(me), [me]);
  if (dismissed) return null;

  return (
    <div className="relative mt-5 rounded-2xl border border-line bg-surf2 p-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-faint hover:text-mut"
        aria-label="dismiss"
      >
        <X size={15} />
      </button>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-acc-soft">
          <Sparkles size={16} className="text-acc" />
        </div>
        <div className="pr-4">
          <div className="kicker text-acc">Atlas</div>
          <p className="mt-1 text-sm leading-relaxed text-cream">{nudge}</p>
        </div>
      </div>
    </div>
  );
}
