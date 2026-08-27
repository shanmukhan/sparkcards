# SparkCards — Project Plan

## Vision

A card-based learning game spanning Class 1–10 across four subjects — **Maths, Physics, Electronics, Astronomy** — that teaches practical, real-world intuition rather than rote facts, and that kids choose to replay on their own, the way they'd replay any game they enjoy.

## Why "cards" and why these four subjects

- **Cards** are a natural unit for bite-sized learning: one concept, one question, one flip to reveal the "aha." They're also inherently collectible, which is what makes games like this replayable — kids don't grind quizzes, they complete a collection.
- **Maths, Physics, Electronics, Astronomy** were chosen because they chain together into one coherent "how the world works" narrative: Maths gives the tools, Physics explains motion/energy/forces, Electronics shows physics engineered into devices, Astronomy zooms out to the biggest scale. Every card explicitly answers "where do I see this in real life?"

## Design pillars (see [`GAME_DESIGN.md`](GAME_DESIGN.md) for full detail)

1. **Real-world grounding.** Every single card has a `realWorldExample` field — no abstract-only questions.
2. **Replayability over repetition.** Sessions are algorithmically re-composed each time (weighted spaced repetition + shuffled answer order + occasional "boss cards"), so replaying the same pack doesn't feel identical.
3. **Visible progress.** XP levels, coin economy, a growing card Collection, and badges give kids something to show for playing, independent of any single quiz score.
4. **Grade-appropriate gating.** Content is grouped into four bands (Class 1–2, 3–5, 6–8, 9–10) that unlock in order, so difficulty scales with the player instead of overwhelming them.

## Status

**Phase 1 (MVP) is built and verified working** — playable end-to-end in the browser, typechecked, and smoke-tested (home → subject → band → 8-card session with flip/reveal → results → collection).

### What exists today

- React + TypeScript + Vite web app, Tailwind v4 styling, Framer Motion card-flip animation
- 80 cards: 4 subjects × 4 grade bands × 5 cards, each with question, 4 choices, explanation, real-world example, fun fact, rarity
- Zustand store persisted to `localStorage`: XP/levels, coins, daily streak, per-card spaced-repetition mastery, badges, band-unlock gating
- Session builder that weights cards by mastery/due-date and injects a "boss card" bonus round
- Screens: Home (subject picker) → Band picker (with lock states) → Play (flip-card quiz) → Results (XP/coins/badges) → Collection (mastery gallery, filterable by subject)
- 10 badge types (streaks, mastery milestones, band unlocks, level milestones)

## Roadmap (not yet built)

Ordered roughly by expected impact per effort. None of this is committed — pick what's next based on how kids actually respond to the MVP.

### Phase 2 — Content depth
- Expand from 5 to ~15–20 cards per subject/band (currently a thin but representative slice)
- Add a second question *type* per concept (e.g., drag-to-order, fill-in-the-blank, image-based) so mastered concepts get re-tested differently, not just re-shown
- Light narrative/theming per band (e.g., "Foundations" cards have a friendly mascot) to make packs feel distinct

### Phase 3 — More game modes
- **Speed Round**: same content, countdown timer, higher XP multiplier — for kids who want an arcade-y challenge
- **Daily Challenge**: one curated 5-card mix across all subjects, same for everyone that day, with a shareable streak
- **Multiplayer pass-and-play**: two kids alternate turns on the same device, head-to-head score

### Phase 4 — Retention & platform
- PWA manifest + service worker for true offline install (works today via dev server; needs manifest/icons/SW to be installable)
- Sound design (correct/incorrect chimes, flip sound, level-up fanfare) — currently silent
- Parent/teacher view: read-only progress summary, exportable
- Accessibility pass: keyboard navigation, screen-reader labels on the flip card, reduced-motion setting

### Phase 5 — Scale content authoring
- Move card content from TypeScript files to a JSON schema + lightweight validation script, so non-engineers (teachers) can contribute cards via PR without touching code
- Consider per-grade (not just per-band) tagging if band granularity proves too coarse once more content exists

## Explicitly out of scope for now

- Backend/accounts/cloud sync — everything is local-first by design; revisit only if multi-device sync becomes a real ask
- Native mobile packaging — the web app is installable as a PWA once Phase 4 lands; a React Native rewrite is not planned unless app-store distribution becomes a requirement
