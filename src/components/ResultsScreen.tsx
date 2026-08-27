import { motion } from 'framer-motion'
import { badgeById } from '../data/badges'

interface Props {
  correct: number
  total: number
  xpGained: number
  coinsGained: number
  badgesEarned: string[]
  onPlayAgain: () => void
  onHome: () => void
}

export function ResultsScreen({ correct, total, xpGained, coinsGained, badgesEarned, onPlayAgain, onHome }: Props) {
  const pct = Math.round((correct / total) * 100)
  const message = pct === 100 ? 'Perfect run! You nailed every card! 🌟' : pct >= 70 ? 'Great job — you\'re on fire! 🔥' : 'Nice try — every card makes you sharper! 💪'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md rounded-3xl bg-slate-900 p-8 text-center shadow-2xl"
    >
      <div className="text-6xl">🏆</div>
      <h2 className="mt-2 text-2xl font-extrabold text-white">{message}</h2>
      <p className="mt-1 text-slate-400">
        {correct} / {total} correct
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-fuchsia-500/10 p-4">
          <div className="text-2xl font-black text-fuchsia-300">+{xpGained}</div>
          <div className="text-xs font-semibold uppercase text-slate-400">XP earned</div>
        </div>
        <div className="rounded-2xl bg-amber-500/10 p-4">
          <div className="text-2xl font-black text-amber-300">+{coinsGained}</div>
          <div className="text-xs font-semibold uppercase text-slate-400">Coins earned</div>
        </div>
      </div>

      {badgesEarned.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">New badges!</div>
          <div className="flex flex-wrap justify-center gap-3">
            {badgesEarned.map((id) => {
              const b = badgeById(id)
              if (!b) return null
              return (
                <motion.div
                  key={id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex w-24 flex-col items-center rounded-xl bg-yellow-500/10 p-3"
                >
                  <div className="text-3xl">{b.emoji}</div>
                  <div className="mt-1 text-[11px] font-bold text-yellow-200">{b.title}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button onClick={onHome} className="flex-1 rounded-xl bg-white/10 py-3 font-bold text-slate-200 hover:bg-white/20">
          Home
        </button>
        <button
          onClick={onPlayAgain}
          className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 font-bold text-white shadow hover:opacity-90"
        >
          Play Again
        </button>
      </div>
    </motion.div>
  )
}
