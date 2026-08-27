import type { Card } from './types'
import { mathsCards } from './maths'
import { physicsCards } from './physics'
import { electronicsCards } from './electronics'
import { astronomyCards } from './astronomy'
import { lightTimeCards } from './lightTime'
import { circuitsCards } from './circuits'

const BUNDLED_CARDS: Card[] = [
  ...mathsCards,
  ...physicsCards,
  ...electronicsCards,
  ...astronomyCards,
  ...lightTimeCards,
  ...circuitsCards,
]

/**
 * A live, mutable card pool. Kept as the same array reference everywhere it's
 * imported so a runtime content refresh (see data/remoteContent.ts) can swap
 * its contents in place without every importer needing to re-import.
 */
export const ALL_CARDS: Card[] = [...BUNDLED_CARDS]

export function replaceAllCards(newCards: Card[]): void {
  ALL_CARDS.length = 0
  ALL_CARDS.push(...newCards)
}

export function resetToBundledCards(): void {
  replaceAllCards(BUNDLED_CARDS)
}

export const cardById = (id: string): Card | undefined => ALL_CARDS.find((c) => c.id === id)

export * from './types'
