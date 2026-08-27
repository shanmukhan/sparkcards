# SparkCards 🃏⚡

A card-based learning game for Class 1–10 covering **Maths, Physics, Electronics, Astronomy, Light & Time, and Circuits Basics** — built to teach real-world intuition, not just facts, and designed so kids want to play again and again.

Flip a card → answer a question → the card flips over to reveal the explanation, a **real-world example**, and a fun fact. Earn XP, coins, and badges, unlock harder grade bands, and build a collection of mastered cards.

## Quick start

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview the production build locally
```

## Documentation

Detailed docs live in [`docs/`](docs):

- [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) — vision, phased roadmap, what's built vs. planned
- [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) — the replayability mechanics (spaced repetition, XP/coins, badges, boss cards, unlock gating) and why each exists
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — tech stack, folder structure, state model, data flow
- [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) — the card schema and how to author/extend content
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — how the app is deployed to the Raspberry Pi, and how the monthly content auto-refresh works

## Tech stack

React 19 + TypeScript + Vite, Tailwind CSS v4, Zustand (persisted to `localStorage`), Framer Motion for the card-flip animation. No backend for game progress — all progress is stored client-side, so the app works fully offline once loaded. Card content is bundled in the build as a fallback, but the app also fetches `cards.json` at startup so new questions can be pushed out (e.g. monthly) without an app rebuild — see [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md#keeping-content-fresh-the-cardsjson-refresh-mechanism).

## Current content

152 hand-written cards across 6 subjects (Maths, Physics, Electronics, Astronomy, Light & Time, Circuits Basics), each with a question, explanation, real-world example, and fun fact. See [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) for the full inventory and how to add more.
