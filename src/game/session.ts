import type { Card, Band, Subject } from '../data/types'
import { ALL_CARDS } from '../data/cards'
import type { Mastery } from '../store/gameStore'

export interface SessionQuestion {
  card: Card
  choiceOrder: number[] // indices into card.choices, shuffled
  isBoss: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Builds a session pulling from a subject+band pool, weighting toward cards that
 * are due for spaced-repetition review or not yet mastered, so repeat sessions
 * feel different even with a small card pool. Occasionally slots in a "boss"
 * card (a rare/legendary card from the pool) as a bonus high-value question.
 */
export function buildSession(
  subject: Subject,
  band: Band,
  getMastery: (id: string) => Mastery,
  length = 8,
): SessionQuestion[] {
  const pool = ALL_CARDS.filter((c) => c.subject === subject && c.band === band)
  if (pool.length === 0) return []

  const now = Date.now()
  const weighted: Card[] = []

  for (const card of pool) {
    const m = getMastery(card.id)
    // Weight: unseen and weak cards appear more often; strong/not-yet-due cards appear less.
    let weight = 3
    if (m.seen === 0) weight = 4
    else if (m.dueAt > now && m.level >= 3) weight = 1
    else if (m.dueAt <= now) weight = 3
    for (let i = 0; i < weight; i++) weighted.push(card)
  }

  const questions: SessionQuestion[] = []
  const shuffledWeighted = shuffle(weighted)
  const usedIds = new Set<string>()

  // First pass: unique cards prioritized by weighting, up to pool size
  for (const card of shuffledWeighted) {
    if (questions.length >= length) break
    if (usedIds.has(card.id)) continue
    usedIds.add(card.id)
    questions.push({ card, choiceOrder: shuffle(card.choices.map((_, i) => i)), isBoss: false })
  }

  // Second pass: fill remaining slots by repeating from the weighted pool (small pools)
  let cursor = 0
  while (questions.length < length && shuffledWeighted.length > 0) {
    const card = shuffledWeighted[cursor % shuffledWeighted.length]
    questions.push({ card, choiceOrder: shuffle(card.choices.map((_, i) => i)), isBoss: false })
    cursor++
  }

  // Mark a boss question: the rarest card in the pool, placed near the end for a finale feel.
  const rarityRank: Record<string, number> = { common: 0, rare: 1, epic: 2, legendary: 3 }
  const bossCandidate = [...pool].sort((a, b) => rarityRank[b.rarity] - rarityRank[a.rarity])[0]
  if (bossCandidate && questions.length > 2) {
    const bossIndex = questions.length - 1
    questions[bossIndex] = {
      card: bossCandidate,
      choiceOrder: shuffle(bossCandidate.choices.map((_, i) => i)),
      isBoss: true,
    }
  }

  return questions
}
