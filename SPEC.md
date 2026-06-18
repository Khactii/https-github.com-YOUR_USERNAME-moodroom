# WERC — Build Spec

> The canonical product spec for WERC. Phase 1 (the core loop) is built; Phases
> 2–3 are scoped here for reference. See `README.md` for how to run it.

## 1. What you're building

WERC is a social app for deep work — "the Strava / Duolingo of focus."
Pronounced "work" (/wɜːk/).

**The thesis:** Deep work normally pays off late — a grade, a launch, a paycheck
arrives weeks after the effort, so the brain never connects work to reward. WERC
makes the reward land the instant you finish: XP, a streak you fight to keep, and
a public rank that climbs while others watch. We sell the social graph + instant
gratification, not a timer.

Positioning anchors:

- "Lock in. Get rewarded the second you finish."
- "Strava made a run something you post. WERC makes deep work something you post."
- Sell identity ("someone who locks in"), not behavior ("build a habit").
- Frame streaks as a flame you protect (loss aversion), never just a number.

## 2. Scope & stack

Mobile-first web app (design for ~390px, responsive to desktop). Clickable
prototype. Vite + React + TypeScript + Tailwind, client-only, `localStorage`
persistence (wrapped so it's swappable for an API). Seeded mock users.

All game logic lives in a pure, framework-agnostic `/src/engine` (no React),
unit-tested, portable to React Native. UI calls the engine; never computes rules
inline.

Stubbed: payments/Pro, real auth, real binaural audio, the Atlas AI coach, push
notifications. Production target (not built here): React Native + Expo + backend.

## 3. Brand tokens

```
--ink:    #15120E   --surf:   #1E1A13   --surf2:  #262017
--cream:  #F2EAD9   --mut:    rgba(242,234,217,0.58)
--faint:  rgba(242,234,217,0.32)
--acc:    #FF5436   --acc-soft: rgba(255,84,54,0.10)
--line:   rgba(242,234,217,0.12)
```

Type: Space Grotesk (display/body) + Space Mono (mono kickers/labels/stats,
UPPERCASE, wide tracking). Dark, moody, premium, flat — no gradients. Accent for
emphasis only. lucide-react outline icons (flame/lock/trophy).

## 4. Core mechanics

- **Loop:** Trigger → Lock in → Reward → Invest.
- **XP:** 1/verified min; +20% full-completion bonus; 300 XP/day cap; halve
  XP/min past 240 verified min/day; 15-min minimum to count; unverified = 0.25×
  personal XP, no streak, no leaderboard.
- **Levels:** Novice 0 → Apprentice 5,000 → Monk 20,000 → Sage 50,000 →
  Titan 100,000. `DEV_MODE` divides thresholds by 100.
- **Streaks + freeze:** ≥1 verified ≥15-min session per local day extends. Miss a
  day → reset to 0 unless a banked freeze (max 1, earned per 7-day milestone) is
  auto-consumed. Track current + longest. "Earn it back," never a guilt trip.
- **Integrity ("WERC's GPS"):** Page Visibility API → unverified after a 3s grace
  window; Wake Lock to keep the screen awake. Honest unit: committed, phone-free
  time, never "focus."
- **Leaderboard (weekly, resets Monday):**
  `weeklyScore = verifiedMinutesThisWeek + currentStreak * 60`, descending.
- **Variable delight, fixed fairness:** deterministic, fair credit math;
  variability only in the celebration layer.

## 5. Data model

See `src/engine/types.ts` for `User` and `Session`.

## 6. Screens

Onboarding · Home (launchpad) · Active session (lock screen) · Session complete
(the reward) · Profile · Leaderboard · Feed · Focus Circle. Bottom tab nav:
Home · Feed · Leaderboard · Profile.

## 7. Build phases

- **Phase 1 — core loop (built):** Onboarding → Home → Active session (integrity)
  → animated reward → Profile. Full engine + persistence.
- **Phase 2 — social:** Leaderboard, Feed, bottom tab nav.
- **Phase 3 — depth:** Focus Circle, badges, exportable story card, 1v1 boss
  battle, stubbed Atlas nudge + stubbed Pro paywall.

## 8. Phase 1 — definition of done (met)

- [x] Pick a username; land on Home showing level + streak.
- [x] Start a session with intention + duration; enter a full-screen lock state.
- [x] Leaving the tab >3s flags the session unverified with a clear message.
- [x] Completion reward animates XP count-up, streak change, level progress, rank delta.
- [x] XP, streak (with freeze logic), and level computed by the engine, persisted across refresh.
- [x] A second same-day verified session adds XP without double-counting the streak; a
      simulated missed day resets the streak (unless a freeze is banked).
- [x] Matches the brand tokens.

## 9. Guardrails

Healthy by design (freezes, no cruel punishment, no pay-to-win XP). Variable
delight, fixed fairness. Honest unit. Engine purity with tests.
