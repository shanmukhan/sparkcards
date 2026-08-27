import { useState } from 'react'
import type { Subject } from '../data/types'
import { SUBJECT_INFO } from '../data/types'
import { ALL_CARDS } from '../data/cards'
import { useGameStore } from '../store/gameStore'
import clsx from 'clsx'

interface Props {
  onBack: () => void
}

const SUBJECTS = Object.keys(SUBJECT_INFO) as Subject[]

export function CollectionScreen({ onBack }: Props) {
  const [filter, setFilter] = useState<Subject | 'all'>('all')
  const getMastery = useGameStore((s) => s.getMastery)
  const masteredCards = useGameStore((s) => s.masteredCards)

  const cards = ALL_CARDS.filter((c) => filter === 'all' || c.subject === filter)

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-slate-400 hover:text-white">
        ← Back
      </button>
      <h2 className="mb-1 text-2xl font-extrabold">🃏 Your Collection</h2>
      <p className="mb-4 text-sm text-slate-400">
        {masteredCards.length} / {ALL_CARDS.length} cards mastered
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={clsx('rounded-full px-3 py-1 text-sm font-semibold', filter === 'all' ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-300')}
        >
          All
        </button>
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx('rounded-full px-3 py-1 text-sm font-semibold', filter === s ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-300')}
          >
            {SUBJECT_INFO[s].emoji} {SUBJECT_INFO[s].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {cards.map((card) => {
          const mastery = getMastery(card.id)
          const isMastered = mastery.level >= 5
          const isSeen = mastery.seen > 0
          return (
            <div
              key={card.id}
              className={clsx(
                'rounded-2xl border p-3 text-center transition',
                isMastered
                  ? 'border-amber-400/60 bg-amber-400/10'
                  : isSeen
                    ? 'border-white/10 bg-white/5'
                    : 'border-white/5 bg-white/[0.02] opacity-40',
              )}
            >
              <div className="text-3xl">{isSeen ? card.emoji : '❔'}</div>
              <div className="mt-1 truncate text-xs font-bold text-slate-200">{isSeen ? card.title : '???'}</div>
              <div className="mt-1 text-[10px] uppercase text-slate-500">{isMastered ? '⭐ Mastered' : isSeen ? `Level ${mastery.level}/5` : 'Locked'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
