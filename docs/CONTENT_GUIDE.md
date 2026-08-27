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

152 cards total across 6 subjects. The original 4 subjects have 7 cards per band (28 each); the 2 newer subjects have 5 cards per band (20 each).

| Subject | File | Foundations | Explorer | Builder | Innovator |
|---|---|---|---|---|---|
| Maths | `src/data/maths.ts` | counting, shapes, grouping, clocks, length, odd/even, ordinals | fractions, money/change, perimeter, averages, map scale, bar graphs, multiplication | percentages, linear equations, speed=distance/time, probability, volume, ratio/proportion, negative numbers | trigonometric ratios (shadow height), quadratics (projectile), compound interest, standard deviation, primes, Pythagorean theorem, exponential growth |
| Physics | `src/data/physics.ts` | push/pull forces, shadows, magnetism, melting, sound, elasticity, heat conduction | levers, rainbows/refraction, buoyancy, friction, states of matter, pressure (cutting), density | Newton's 1st/2nd/3rd laws, energy conversion (solar), lenses, fluid pressure, pendulums | work & power, Doppler effect, thermodynamics, EM spectrum, orbital free-fall, nuclear fission, crumple zones |
| Electronics | `src/data/electronics.ts` | batteries/torches, switches, conductors/insulators, battery depletion, complete circuits, rechargeables, infrared remotes | series vs parallel, electromagnets, light sensors (LDR), fuses, motors, static electricity | Ohm's law, resistors, LED efficiency, AC vs DC, transistors, solar charging, capacitors | semiconductors, logic gates (AND), analog vs digital, diodes, Kirchhoff's current law, microchips, wireless charging |
| Astronomy | `src/data/astronomy.ts` | day/night (rotation), the Moon, stars, Earth's uniqueness, telescopes, the Sun, space suits | moon phases, seasons (axial tilt), Saturn's rings, eclipses, comets, meteor showers, weightlessness | gravity & orbits, light-years, satellites, Mars, the Milky Way, asteroid belt, Mars rovers | stellar life cycles/supernovas, black holes, exoplanet detection, the Big Bang/redshift, escape velocity, dark matter, habitable zone |
| Light & Time | `src/data/lightTime.ts` | transparency, clocks, hours in a day, light sources, days of the week | mirrors/reflection, stopwatches, speed of light vs sound, why objects have colour, time zones | angle of reflection, why the sky is blue, hourglasses, speed of light, reaction time | prism dispersion, satellite signal delay, fibre optics, atomic clocks, time dilation |
| Circuits Basics | `src/data/circuits.ts` | current as water flow, what voltage does, resistance, more batteries = more push, thick vs thin wire | measuring current (amps), measuring voltage (volts), measuring resistance (ohms), resistive heating, voltage danger | Ohm's law calculations, power (P=VI), electricity bills (kWh), series resistance, multimeters | parallel resistance, resistance vs temperature, Kirchhoff's voltage law, internal resistance, high-voltage transmission |

`lighttime` and `circuits` are separate subjects from `physics`/`electronics` on purpose — they cover Light, Time, and Current/Voltage/Resistance in more depth without duplicating the intro-level cards already in Physics/Electronics.

## Keeping content fresh: the cards.json refresh mechanism

The app is offline-first (all cards ship bundled in the build, in `ALL_CARDS` from `src/data/cards.ts`), but on every startup it also tries to fetch `/cards.json` (see `src/data/remoteContent.ts`) and, if that succeeds and looks valid, swaps in that content instead — falling back to the last cached fetch, then to the bundled cards, if the fetch fails. This means:

- **New cards can reach users without an app rebuild.** Edit the relevant `src/data/<subject>.ts` file, run `npm run generate:cards` (regenerates `public/cards.json` from the current `.ts` files), then run `./scripts/deploy-cards.sh` to push just that one JSON file to the server — no `npm run build`, no redeploying the JS bundle.
- **`npm run build` also regenerates `cards.json` automatically** (see the `build` script in `package.json`), so a full redeploy always ships in-sync content too.
- The fetch is same-origin (`/cards.json`), works from whatever domain/path the app is deployed at, and times out after 4 seconds so a slow/unreachable server never blocks the app from loading with bundled content.

**Monthly content refresh workflow:** add a handful of new cards to existing subjects (or tweak weak ones) once a month, run `npm run generate:cards`, then `./scripts/deploy-cards.sh` — existing players get new questions without reinstalling anything.

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
2. Create `src/data/<newsubject>.ts` following the same band-grouped pattern as the existing files.
3. Spread it into `BUNDLED_CARDS` in `src/data/cards.ts`.
4. Nothing else to update — `SubjectGrid.tsx` and `CollectionScreen.tsx` derive their subject list from `Object.keys(SUBJECT_INFO)`, so a new subject in `SUBJECT_INFO` shows up automatically.
5. Run `npm run generate:cards` so `public/cards.json` includes the new subject's cards too (or just run `npm run build`, which does this for you).

## Adding a new grade band

More invasive — the band-unlock logic in `gameStore.ts` (`BAND_ORDER`, the id-parsing in `cardIdToBand`) assumes exactly four bands in a fixed order. If finer-grained per-grade content is ever needed (Phase 5 in the project plan), that's the place to redesign, not just extend.
