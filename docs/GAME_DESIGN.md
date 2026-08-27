# Game Design — keeping kids from getting bored

The brief was explicit: kids should want to play this again, not treat it like homework. Every mechanic below exists to answer one of these questions:

- Why would I play a *second* session on the same topic?
- Why does a repeat session not feel identical to the last one?
- What do I have to show for playing, beyond a score I'll forget?

## 1. Sessions are re-composed every time, not fixed quizzes

`src/game/session.ts` builds an 8-question session from a subject+band's card pool using **weighted sampling**, not a fixed order:

- Cards never seen get the highest weight (prioritize discovery)
- Cards due for spaced-repetition review get medium weight
- Cards recently mastered and not yet due get low weight (they still show up sometimes — just less often)
- Answer choice order is reshuffled every time a card appears, so "I remember it's the third option" stops working

With a small pool (5 cards per subject/band today), sessions reuse cards — but which ones, in what order, with which choice layout, changes every run. This is deliberately the cheapest lever for replayability and it works today even with limited content; it gets *more* effective as content grows (Phase 2 in the project plan).

## 2. Spaced repetition mastery, not pass/fail

Each card has a `mastery.level` (0–5) tracked in `gameStore.ts`. A correct answer bumps it up and pushes the card's next-due time further out (1 min → 10 min → 1 hr → 1 day → 3 days → 7 days). A wrong answer drops it and brings the card back sooner. This means:

- Cards a kid struggles with resurface more often, automatically — no manual "review mistakes" step
- Cards a kid has mastered mostly get out of the way, so sessions feel like they're making progress rather than repeating solved problems
- Reaching level 5 marks a card **mastered**, which is what unlocks it visually in the Collection screen

## 3. Boss cards

Every session slots the rarest card in that subject/band pool into the final question, flagged as a "Boss Card" with a 2× XP/coin multiplier and distinct UI treatment (gold banner). This gives every session a built-in climax instead of ending on an arbitrary 8th question.

## 4. Progression the kid can see

- **XP & levels** — `levelForXp()` / `titleForLevel()` in `gameStore.ts`. Titles (Curious Cadet → Junior Scientist → Keen Explorer → Master Builder → Grand Innovator) give a public-facing identity, not just a number.
- **Coins** — earned alongside XP; currently cosmetic/tracked only, reserved for a future "spend coins to unlock a bonus pack" mechanic (Phase 2+).
- **Daily streak** — `touchDailyStreak()` runs once per app load and increments only if the previous play date was yesterday, resetting otherwise. Visible in the top bar with a 🔥 icon.
- **Card rarity** — every card is tagged common/rare/epic/legendary (visual ring color on the card, and it's what determines which card becomes a session's boss card). Rarity isn't difficulty-gated; it's a collectibility layer independent of correctness.
- **Collection** — the Collection screen shows all 80 cards; unseen cards render as `???` silhouettes, seen-but-not-mastered show their mastery level, and mastered cards get a gold treatment. This is the "gotta collect them all" hook.
- **Badges** — 10 milestone badges (first XP, 3/7-day streaks, 10/25 cards mastered, each band unlock, level 5/10) surface as a toast-like reveal on the Results screen the moment they're earned, plus a browsable Badges modal.

## 5. Grade-appropriate difficulty gating

Content is grouped into four bands mapped to real grade ranges (Foundations = Class 1–2, Explorer = 3–5, Builder = 6–8, Innovator = 9–10). A band unlocks once the player has 12 correct answers in the previous band — across any subject, since grade progression is a whole-child thing, not a per-subject thing. This keeps a Class 2 student from face-planting into trigonometry, while letting an ahead-of-grade kid unlock forward quickly since the gate is answers-based, not calendar-based.

## 6. Real-world grounding as an engagement mechanic, not just pedagogy

Every card's reveal side has two distinct panels — "In the real world" and "Fun fact" — deliberately separated from the dry explanation. The explanation answers "why is this true"; the real-world example answers "why do I care"; the fun fact is pure hook, there to be the thing a kid repeats to a parent at dinner. Kids don't come back to re-read an explanation; they come back because the fun fact was cool.
