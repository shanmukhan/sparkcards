# Architecture

## Stack

- **React 19 + TypeScript**, scaffolded with Vite (`react-ts` template)
- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.js` needed — v4 is CSS-first, see `src/index.css`)
- **Zustand** with the `persist` middleware for game state, backed by `localStorage`
- **Framer Motion** for the card-flip and entrance animations
- **clsx** for conditional class composition
- No backend, no router library — navigation is a small in-memory state machine in `App.tsx` (five screens; a real router wasn't worth the dependency at this size)

## Folder structure

```
src/
  data/
    types.ts        Subject/Band/Rarity/Card types, SUBJECT_INFO/BAND_INFO display metadata
    maths.ts         20 cards (5 per band)
    physics.ts        20 cards
    electronics.ts     20 cards
    astronomy.ts        20 cards
    cards.ts         ALL_CARDS = concatenation of the four subject files, cardById()
    badges.ts        Badge metadata (id, emoji, title, description) — ids must match gameStore's BADGE_DEFS
  game/
    session.ts       buildSession(): weighted card selection + boss-card injection for one play session
  store/
    gameStore.ts     Zustand store: XP/coins/streak/mastery/badges, all persisted; band-unlock logic; badge-earning checks
  components/
    TopBar.tsx        Level/XP bar, coins, streak, badges/collection entry points
    SubjectGrid.tsx    Home screen subject picker
    BandPicker.tsx     Grade-band picker with lock states
    GameCard.tsx       The flip card itself — front (question) / back (explanation+example+fact)
    PlayScreen.tsx     Orchestrates one session: builds it, tracks progress, calls into the store per answer
    ResultsScreen.tsx  Session summary: XP/coins earned, newly-earned badges
    CollectionScreen.tsx  Full card gallery filterable by subject, shows per-card mastery state
    BadgesModal.tsx    Full badge list (earned vs locked)
  App.tsx             Five-screen state machine: home / bands / play / results / collection
```

## Data flow

1. **Content is static** — `ALL_CARDS` is built once at module load from the four subject files and never mutated. All per-player state (mastery, XP, etc.) lives separately in the Zustand store, keyed by `card.id`. This keeps content and progress decoupled: shipping new/edited cards never touches saved progress, and wiping progress never touches content.
2. **`buildSession(subject, band, getMastery, length)`** (in `game/session.ts`) is a pure function: given the card pool and a mastery lookup, it returns a shuffled, weighted list of `SessionQuestion` (card + shuffled choice order + boss flag). `PlayScreen` calls it once per session via `useMemo`.
3. **`PlayScreen`** walks through the session's questions one at a time. Each answer calls `useGameStore().answerCard(cardId, correct)`, which is the single place mastery/XP/coins/badges get updated. `PlayScreen` accumulates the session's totals locally (not stored) purely to hand them to `ResultsScreen` at the end.
4. **Badge evaluation** happens synchronously inside `answerCard` (compares badge state before/after) so a badge earned mid-session is available to `ResultsScreen` immediately — no separate polling/effect needed.
5. **Persistence** is automatic: `zustand/persist` serializes the whole store to `localStorage` under the key `sparkcards-progress` on every state change and rehydrates it on load. There is currently no schema-versioning/migration logic — acceptable for an MVP, but worth adding (a `version` + `migrate` option to `persist`) before shipping a breaking change to the store shape.

## Card ID convention

IDs follow `<subject-code>-<band-code>-<n>`, e.g. `ph-b-3` = Physics, Builder band, 3rd card. `gameStore.ts`'s `cardIdToBand()` parses the band code back out of the ID to attribute correct answers to the right band's unlock counter — this is a light coupling between the ID format and unlock logic; if that's ever a problem, switch to reading `card.band` directly via `cardById()` instead of parsing the ID string.

## Styling conventions

- Dark theme only (`bg-slate-950` base) — no light-mode toggle exists yet
- Subject color identity comes from `SUBJECT_INFO[subject].color`, a Tailwind gradient class pair, reused across the subject grid and any subject-scoped UI
- Rarity has its own color language (ring color on the card, via `RARITY_RING` in `GameCard.tsx`) — kept independent from subject color so the two visual systems don't collide

## Known limitations to be aware of

- No automated test suite yet — verification so far is `tsc --noEmit`, a production build, and a Playwright smoke pass through the full user flow (see project plan for what's next)
- No accessibility pass — no keyboard-only path through the flip card, no `aria-live` on the reveal, no reduced-motion handling
- No sound
- `localStorage` is per-browser/per-device — there is no cross-device sync
