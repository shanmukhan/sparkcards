// Regenerates public/cards.json from the bundled card data in src/data/*.ts —
// the file the running app fetches at startup to pick up content updates
// (e.g. a monthly refresh) without requiring a full app rebuild/redeploy.
//
// Run with: npm run generate:cards

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(here, '..', 'src', 'data')

const { mathsCards } = await import(path.join(dataDir, 'maths.ts'))
const { physicsCards } = await import(path.join(dataDir, 'physics.ts'))
const { electronicsCards } = await import(path.join(dataDir, 'electronics.ts'))
const { astronomyCards } = await import(path.join(dataDir, 'astronomy.ts'))
const { lightTimeCards } = await import(path.join(dataDir, 'lightTime.ts'))
const { circuitsCards } = await import(path.join(dataDir, 'circuits.ts'))

const cards = [
  ...mathsCards,
  ...physicsCards,
  ...electronicsCards,
  ...astronomyCards,
  ...lightTimeCards,
  ...circuitsCards,
]

const ids = new Set()
for (const c of cards) {
  if (ids.has(c.id)) throw new Error(`Duplicate card id: ${c.id}`)
  ids.add(c.id)
  if (c.choices.length !== 4) throw new Error(`Card ${c.id} does not have exactly 4 choices`)
  if (c.answerIndex < 0 || c.answerIndex > 3) throw new Error(`Card ${c.id} has an out-of-range answerIndex`)
}

const payload = {
  version: new Date().toISOString().slice(0, 10),
  updatedAt: new Date().toISOString(),
  cards,
}

const outPath = path.join(here, '..', 'public', 'cards.json')
await writeFile(outPath, JSON.stringify(payload, null, 2) + '\n')
console.log(`Wrote ${cards.length} cards to ${path.relative(process.cwd(), outPath)}`)
