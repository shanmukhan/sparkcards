import type { Card } from './types'
import { mathsCards } from './maths'
import { physicsCards } from './physics'
import { electronicsCards } from './electronics'
import { astronomyCards } from './astronomy'

export const ALL_CARDS: Card[] = [
  ...mathsCards,
  ...physicsCards,
  ...electronicsCards,
  ...astronomyCards,
]

export const cardById = (id: string): Card | undefined => ALL_CARDS.find((c) => c.id === id)

export * from './types'
