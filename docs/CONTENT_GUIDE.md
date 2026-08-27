# Content Guide

## Card schema

Defined in `src/data/types.ts`:

```ts
interface Card {
  id: string             // "<subject-code>-<band-code>-<n>", e.g. "ph-b-3"
  subject: Subject        // 'maths' | 'physics' | 'electronics' | 'astronomy'
  band: Band               // 'foundations' | 'explorer' | 'builder' | 'innovator'
  rarity: Rarity            // 'common' | 'rare' | 'epic' | 'legendary'
  title: string              // short card name shown on the front
  question: string            // the question posed to the player
  choices: string[]             // exactly 4 answer options
  answerIndex: number            // index into choices[] of the correct answer
  explanation: string              // why the answer is correct — shown on flip
  realWorldExample: string          // REQUIRED framing: where this shows up in real life
  funFact: string                    // a hook fact, distinct from the explanation
  emoji: string                       // single emoji used as the card's visual icon
}
```

`realWorldExample` is not optional in spirit even though TypeScript can't enforce "make it good" — it's the entire point of this game (see project plan's "Why cards, why these subjects"). Every new card must answer "where would a kid actually encounter this?" concretely, not "it's used in science" generically.

## Grade bands

| Band | Grades | File(s) |
|---|---|---|
| `foundations` | Class 1–2 | id middle segment `f` |
| `explorer` | Class 3–5 | id middle segment `e` |
| `builder` | Class 6–8 | id middle segment `b` |
| `innovator` | Class 9–10 | id middle segment `i` |

Display labels/blurbs for bands live in `BAND_INFO` (`src/data/types.ts`) — edit there, not in components, if wording needs to change.

## Current inventory

80 cards total: 4 subjects × 4 bands × 5 cards each.

| Subject | File | Foundations | Explorer | Builder | Innovator |
|---|---|---|---|---|---|
| Maths | `src/data/maths.ts` | counting, shapes, grouping, clocks, length | fractions, money/change, perimeter, averages, map scale | percentages, linear equations, speed=distance/time, probability, volume | trigonometric ratios (shadow height), quadratics (projectile), compound interest, standard deviation, primes |
| Physics | `src/data/physics.ts` | push/pull forces, shadows, magnetism, melting, sound | levers, rainbows/refraction, buoyancy, friction, states of matter | Newton's 1st/2nd/3rd laws, energy conversion (solar), lenses | work & power, Doppler effect, thermodynamics, EM spectrum, orbital free-fall |
| Electronics | `src/data/electronics.ts` | batteries/torches, switches, conductors/insulators, battery depletion, complete circuits | series vs parallel, electromagnets, light sensors (LDR), fuses | Ohm's law, resistors, LED efficiency, AC vs DC, transistors | semiconductors, logic gates (AND), analog vs digital, diodes, Kirchhoff's current law |
| Astronomy | `src/data/astronomy.ts` | day/night (rotation), the Moon, stars, Earth's uniqueness, telescopes | moon phases, seasons (axial tilt), Saturn's rings, eclipses, comets | gravity & orbits, light-years, satellites, Mars, the Milky Way | stellar life cycles/supernovas, black holes, exoplanet detection, the Big Bang/redshift, escape velocity |

## Adding a new card

1. Pick the subject file (`src/data/<subject>.ts`) and band section (each file is grouped by band with a comment header).
2. Follow the existing `id` convention: `<subject-code>-<band-code>-<next-number>` (e.g. next Maths/Builder card after `ma-b-5` is `ma-b-6`).
3. Fill every field — `choices` must have exactly 4 entries, `answerIndex` must point at the correct one.
4. Pick a `rarity` roughly by how conceptually "impressive" the card is, not difficulty — rarity drives visual flair and boss-card selection, not gating.
5. No registration step needed elsewhere: `cards.ts` spreads each subject file's export into `ALL_CARDS` automatically, and `gameStore.ts`'s `cardIdToBand()` parses the band straight from the id you chose.
6. Run `npx tsc -b --noEmit` to catch typos (e.g. `answerIndex` out of range won't be caught by types, so double check manually).

## Adding a new subject

More structural — requires touching a few more places than adding a card:

1. Add the subject to the `Subject` union and to `SUBJECT_INFO` (label, emoji, Tailwind gradient) in `src/data/types.ts`.
2. Create `src/data/<newsubject>.ts` following the same band-grouped pattern as the existing four files.
3. Spread it into `ALL_CARDS` in `src/data/cards.ts`.
4. Update `SUBJECTS` arrays in `SubjectGrid.tsx` and `CollectionScreen.tsx` (small, static arrays — not derived from `SUBJECT_INFO` today; consider deriving them via `Object.keys(SUBJECT_INFO)` if a 5th subject actually gets added, to avoid this manual step in future).

## Adding a new grade band

More invasive — the band-unlock logic in `gameStore.ts` (`BAND_ORDER`, the id-parsing in `cardIdToBand`) assumes exactly four bands in a fixed order. If finer-grained per-grade content is ever needed (Phase 5 in the project plan), that's the place to redesign, not just extend.
