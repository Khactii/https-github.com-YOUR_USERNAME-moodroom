# WERC — _"the Strava / Duolingo of focus"_

Pronounced **"work"** (/wɜːk/). A social app for deep work that makes the reward
land the instant you finish: XP, a streak you fight to keep, and a public rank
that climbs while others watch.

> Lock in. Get rewarded the second you finish.

This repo is a **clickable prototype** to feel and demo the core loop — not
production. Stack: Vite + React + TypeScript + Tailwind, client-only, state
persisted to `localStorage`.

## Run it

```bash
npm install
npm run dev      # start the prototype
npm test         # run the engine unit tests
npm run build    # typecheck + production build
```

Open the dev URL on a ~390px-wide viewport (or use your browser's device
toolbar) for the intended mobile-first feel.

## The loop

`Trigger → Lock in → Reward → Invest`. Set an intention, lock in for a fixed
duration in a full-screen phone-free state, and the instant you finish the
reward screen animates your XP, streak, level and rank.

## Architecture

All game rules live in **`/src/engine`** — pure, framework-agnostic, unit-tested
TypeScript with **no React imports**, so it ports directly to the production
React Native + Expo app. The UI never computes rules inline; it calls the engine.

```
src/
  engine/        # pure rules: xp, streak, level, leaderboard, session, dates
    *.test.ts    # 28 unit tests covering the spec + Phase 1 definition-of-done
  storage/       # localStorage persistence boundary (swap for an API later)
  state/         # React store wiring engine + storage to the UI
  data/          # ~12 seeded mock users + feed so social feels alive day one
  components/    # shared UI: cards, flame, integrity hook, count-up
  screens/       # Onboarding, Home, ActiveSession, SessionComplete, Profile
```

### The rules (see `src/engine/constants.ts`)

- **XP**: 1 XP / verified minute · +20% for completing the full duration ·
  300 XP/day cap · XP/min halves past 240 verified min/day · 15-min minimum to
  count · unverified sessions earn 0.25× personal XP only.
- **Streaks**: a verified ≥15-min session per local day extends the flame. A
  banked **freeze** (earned at every 7-day milestone, max 1) auto-bridges a
  single missed day; otherwise the streak resets to an encouraging "earn it
  back" state.
- **Levels**: Novice → Apprentice → Monk → Sage → Titan.
  `DEV_MODE` (on by default) divides thresholds by 100 so you can level up while
  testing.
- **Integrity** ("WERC's GPS"): the Page Visibility API marks a session
  unverified if you leave the app for >3s; the Wake Lock API keeps the screen
  awake. We measure **committed, phone-free time** — never "focus."
- **Leaderboard** (weekly, resets Monday): consistency-weighted
  `weeklyScore = verifiedMinutesThisWeek + currentStreak * 60`.

### Guardrails

Variable delight, **fixed fairness** — surprise lives only in the celebration
layer, never in whether honest work earns credit. No pay-to-win XP, no cruel
punishment for a lapse, reward the work — never merely opening the app.

## Status

**Phase 1 (core loop) is complete:** Onboarding → Home → Active session (with
integrity enforcement) → animated reward → Profile, full engine, persistence.

Stubbed throughout (per spec): payments / Pro, real auth, real binaural audio,
the Atlas AI coach, push notifications. Phases 2 (Leaderboard, Feed, tab nav)
and 3 (Focus Circle, badges, story-card export, boss battle, paywall UI) are
scoped but not yet built.

### Demo tips

In `DEV_MODE` the Active session has **+5 min** / **skip to finish** controls,
Home has **simulate missed day**, and Profile has **reset demo**. To see the
unverified path, switch browser tabs for >3s mid-session.
