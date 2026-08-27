import { motion } from 'framer-motion'
import type { Band, Subject } from '../data/types'
import { BAND_INFO, SUBJECT_INFO } from '../data/types'
import { useGameStore } from '../store/gameStore'

interface Props {
  subject: Subject
  onSelect: (band: Band) => void
  onBack: () => void
}

const BANDS: Band[] = ['foundations', 'explorer', 'builder', 'innovator']

export function BandPicker({ subject, onSelect, onBack }: Props) {
  const isBandUnlocked = useGameStore((s) => s.isBandUnlocked)
  const bandCorrectCounts = useGameStore((s) => s.bandCorrectCounts)
  const info = SUBJECT_INFO[subject]

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-slate-400 hover:text-white">
        ← Back to subjects
      </button>
      <h2 className="mb-1 flex items-center gap-2 text-2xl font-extrabold">
        <span>{info.emoji}</span> {info.label}
      </h2>
      <p className="mb-5 text-sm text-slate-400">Choose a grade band to start a game session.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BANDS.map((band, i) => {
          const unlocked = isBandUnlocked(band)
          const b = BAND_INFO[band]
          return (
            <motion.button
              key={band}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              disabled={!unlocked}
              onClick={() => unlocked && onSelect(band)}
              className={`rounded-2xl border p-5 text-left transition ${
                unlocked
                  ? 'border-white/10 bg-white/5 hover:bg-white/10'
                  : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{b.label}</span>
                {!unlocked && <span>🔒</span>}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{b.grades}</div>
              <div className="mt-2 text-sm text-slate-300">{b.blurb}</div>
              {!unlocked && (
                <div className="mt-2 text-xs text-amber-400">
                  Unlock by getting {Math.max(0, 12 - bandCorrectCounts[prevBand(band)])} more correct answers in the
                  previous band
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function prevBand(band: Band): Band {
  const order: Band[] = ['foundations', 'explorer', 'builder', 'innovator']
  const idx = order.indexOf(band)
  return order[Math.max(0, idx - 1)]
}
