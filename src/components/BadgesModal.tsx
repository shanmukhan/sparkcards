import { BADGES } from '../data/badges'
import { useGameStore } from '../store/gameStore'
import clsx from 'clsx'

interface Props {
  onClose: () => void
}

export function BadgesModal({ onClose }: Props) {
  const earned = useGameStore((s) => s.badges)

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">🏅 Badges</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((b) => {
            const has = earned.includes(b.id)
            return (
              <div
                key={b.id}
                className={clsx(
                  'rounded-2xl border p-4 text-center',
                  has ? 'border-yellow-400/50 bg-yellow-400/10' : 'border-white/5 bg-white/[0.02] opacity-40',
                )}
              >
                <div className="text-3xl">{b.emoji}</div>
                <div className="mt-1 text-sm font-bold text-slate-100">{b.title}</div>
                <div className="mt-1 text-[11px] text-slate-400">{b.description}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
