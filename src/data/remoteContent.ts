import type { Card } from './types'
import { SUBJECT_INFO, BAND_INFO } from './types'
import { replaceAllCards } from './cards'

const REMOTE_URL = '/cards.json'
const CACHE_KEY = 'sparkcards:cached-cards:v1'
const CACHE_META_KEY = 'sparkcards:cached-cards-meta:v1'
const FETCH_TIMEOUT_MS = 4000
const MIN_VALID_CARDS = 20

function isValidCard(c: unknown): c is Card {
  if (typeof c !== 'object' || c === null) return false
  const card = c as Record<string, unknown>
  return (
    typeof card.id === 'string' &&
    typeof card.subject === 'string' &&
    card.subject in SUBJECT_INFO &&
    typeof card.band === 'string' &&
    card.band in BAND_INFO &&
    typeof card.rarity === 'string' &&
    ['common', 'rare', 'epic', 'legendary'].includes(card.rarity) &&
    typeof card.title === 'string' &&
    typeof card.question === 'string' &&
    Array.isArray(card.choices) &&
    card.choices.length === 4 &&
    card.choices.every((x) => typeof x === 'string') &&
    typeof card.answerIndex === 'number' &&
    card.answerIndex >= 0 &&
    card.answerIndex < 4 &&
    typeof card.explanation === 'string' &&
    typeof card.realWorldExample === 'string' &&
    typeof card.funFact === 'string' &&
    typeof card.emoji === 'string'
  )
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timer)
  }
}

function loadFromCache(): boolean {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return false
    const parsed: unknown = JSON.parse(cached)
    if (!Array.isArray(parsed)) return false
    const valid = parsed.filter(isValidCard)
    if (valid.length < MIN_VALID_CARDS) return false
    replaceAllCards(valid)
    return true
  } catch {
    return false
  }
}

/**
 * Tries to fetch a fresh cards.json from the server so content (new questions,
 * monthly refreshes) can update without shipping a new app build. Falls back
 * to the last successfully cached fetch, then to the bundled cards already in
 * ALL_CARDS if neither is available — the app always works offline.
 */
export async function refreshCardsFromRemote(): Promise<'remote' | 'cache' | 'bundled'> {
  try {
    const res = await fetchWithTimeout(REMOTE_URL, FETCH_TIMEOUT_MS)
    if (!res.ok) throw new Error(`cards.json responded with ${res.status}`)
    const data: unknown = await res.json()
    const rawCards = Array.isArray((data as { cards?: unknown })?.cards) ? (data as { cards: unknown[] }).cards : []
    const valid = rawCards.filter(isValidCard)
    if (valid.length < MIN_VALID_CARDS) throw new Error(`only ${valid.length} valid cards in cards.json, ignoring`)

    replaceAllCards(valid)
    localStorage.setItem(CACHE_KEY, JSON.stringify(valid))
    localStorage.setItem(CACHE_META_KEY, JSON.stringify({ fetchedAt: Date.now() }))
    return 'remote'
  } catch (err) {
    console.warn('SparkCards: remote content refresh failed, falling back.', err)
    return loadFromCache() ? 'cache' : 'bundled'
  }
}
