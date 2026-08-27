import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Band } from '../data/types'

export interface Mastery {
  level: number // 0-5, spaced-repetition strength
  dueAt: number // epoch ms — when this card should resurface
  seen: number
  correct: number
}

interface GameState {
  xp: number
  coins: number
  streakDays: number
  lastPlayedDate: string | null
  bandCorrectCounts: Record<Band, number>
  mastery: Record<string, Mastery>
  masteredCards: string[] // cards that reached full mastery (level 5) — shown in Collection
  badges: string[]

  // derived helpers exposed as functions
  answerCard: (cardId: string, correct: boolean) => { xpGained: number; coinsGained: number; newlyMastered: boolean }
  touchDailyStreak: () => void
  isBandUnlocked: (band: Band) => boolean
  getMastery: (cardId: string) => Mastery
  newBadgesEarned: (before: string[]) => string[]
}

const BAND_ORDER: Band[] = ['foundations', 'explorer', 'builder', 'innovator']
const UNLOCK_THRESHOLD = 12 // correct answers needed in a band before the next unlocks

const REPETITION_INTERVALS_MS = [
  60_000, // level 0 -> retry in 1 min
  10 * 60_000, // level 1 -> 10 min
  60 * 60_000, // level 2 -> 1 hr
  24 * 60 * 60_000, // level 3 -> 1 day
  3 * 24 * 60 * 60_000, // level 4 -> 3 days
  7 * 24 * 60 * 60_000, // level 5 -> 7 days
]

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function xpForCorrect(cardLevel: number): number {
  // Harder-earned (lower mastery) cards give slightly more XP to reward tackling weak spots.
  return 10 + Math.max(0, 3 - cardLevel) * 2
}

const BADGE_DEFS: { id: string; check: (s: GameState) => boolean }[] = [
  { id: 'first-spark', check: (s) => s.xp >= 10 },
  { id: 'streak-3', check: (s) => s.streakDays >= 3 },
  { id: 'streak-7', check: (s) => s.streakDays >= 7 },
  { id: 'collector-10', check: (s) => s.masteredCards.length >= 10 },
  { id: 'collector-25', check: (s) => s.masteredCards.length >= 25 },
  { id: 'explorer-unlocked', check: (s) => s.bandCorrectCounts.foundations >= UNLOCK_THRESHOLD },
  { id: 'builder-unlocked', check: (s) => s.bandCorrectCounts.explorer >= UNLOCK_THRESHOLD },
  { id: 'innovator-unlocked', check: (s) => s.bandCorrectCounts.builder >= UNLOCK_THRESHOLD },
  { id: 'level-5', check: (s) => levelForXp(s.xp) >= 5 },
  { id: 'level-10', check: (s) => levelForXp(s.xp) >= 10 },
]

export function levelForXp(xp: number): number {
  return 1 + Math.floor(xp / 100)
}

export function titleForLevel(level: number): string {
  if (level >= 15) return 'Grand Innovator'
  if (level >= 10) return 'Master Builder'
  if (level >= 6) return 'Keen Explorer'
  if (level >= 3) return 'Junior Scientist'
  return 'Curious Cadet'
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      coins: 0,
      streakDays: 0,
      lastPlayedDate: null,
      bandCorrectCounts: { foundations: 0, explorer: 0, builder: 0, innovator: 0 },
      mastery: {},
      masteredCards: [],
      badges: [],

      getMastery: (cardId) => {
        return get().mastery[cardId] ?? { level: 0, dueAt: 0, seen: 0, correct: 0 }
      },

      isBandUnlocked: (band) => {
        const idx = BAND_ORDER.indexOf(band)
        if (idx <= 0) return true
        const prevBand = BAND_ORDER[idx - 1]
        return get().bandCorrectCounts[prevBand] >= UNLOCK_THRESHOLD
      },

      answerCard: (cardId, correct) => {
        let xpGained = 0
        let coinsGained = 0
        let newlyMastered = false

        set((state) => {
          const prev = state.mastery[cardId] ?? { level: 0, dueAt: 0, seen: 0, correct: 0 }
          const nextLevel = correct ? Math.min(5, prev.level + 1) : Math.max(0, prev.level - 1)
          const interval = REPETITION_INTERVALS_MS[nextLevel]
          const nextMastery: Mastery = {
            level: nextLevel,
            dueAt: Date.now() + interval,
            seen: prev.seen + 1,
            correct: prev.correct + (correct ? 1 : 0),
          }

          const wasMastered = prev.level >= 5
          const isNowMastered = nextLevel >= 5
          newlyMastered = !wasMastered && isNowMastered

          if (correct) {
            xpGained = xpForCorrect(prev.level)
            coinsGained = 2
          }

          const cardSubjectBand = cardIdToBand(cardId)
          const bandCorrectCounts = { ...state.bandCorrectCounts }
          if (correct && cardSubjectBand) {
            bandCorrectCounts[cardSubjectBand] += 1
          }

          return {
            xp: state.xp + xpGained,
            coins: state.coins + coinsGained,
            mastery: { ...state.mastery, [cardId]: nextMastery },
            masteredCards: newlyMastered ? [...state.masteredCards, cardId] : state.masteredCards,
            bandCorrectCounts,
          }
        })

        // Evaluate badges after state settles
        const before = get().badges
        const earned = get().newBadgesEarned(before)
        if (earned.length) {
          set((state) => ({ badges: [...state.badges, ...earned] }))
        }

        return { xpGained, coinsGained, newlyMastered }
      },

      newBadgesEarned: (before) => {
        const state = get()
        const earned: string[] = []
        for (const def of BADGE_DEFS) {
          if (!before.includes(def.id) && def.check(state)) earned.push(def.id)
        }
        return earned
      },

      touchDailyStreak: () => {
        const today = todayStr()
        set((state) => {
          if (state.lastPlayedDate === today) return {}
          const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
          const continuedStreak = state.lastPlayedDate === yesterday
          return {
            lastPlayedDate: today,
            streakDays: continuedStreak ? state.streakDays + 1 : 1,
          }
        })
      },
    }),
    { name: 'sparkcards-progress' },
  ),
)

function cardIdToBand(cardId: string): Band | null {
  // ids look like "ma-f-1", "ph-b-2" — the middle segment encodes the band
  const parts = cardId.split('-')
  const code = parts[1]
  switch (code) {
    case 'f':
      return 'foundations'
    case 'e':
      return 'explorer'
    case 'b':
      return 'builder'
    case 'i':
      return 'innovator'
    default:
      return null
  }
}
