import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import type { SessionQuestion } from '../game/session'

interface Props {
  question: SessionQuestion
  onAnswered: (correct: boolean) => void
  onContinue: () => void
}

const RARITY_RING: Record<string, string> = {
  common: 'ring-slate-500/40',
  rare: 'ring-sky-400/60',
  epic: 'ring-fuchsia-400/70',
  legendary: 'ring-amber-300/80',
}

export function GameCard({ question, onAnswered, onContinue }: Props) {
  const [picked, setPicked] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const { card, choiceOrder } = question

  function pick(choiceIdx: number) {
    if (picked !== null) return
    setPicked(choiceIdx)
    const correct = choiceIdx === card.answerIndex
    setTimeout(() => setRevealed(true), 550)
    onAnswered(correct)
  }

  return (
    <div className="mx-auto max-w-xl">
      {question.isBoss && (
        <div className="mb-3 text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-red-500 px-4 py-1 text-xs font-black uppercase tracking-wide text-white shadow">
            ⚡ Boss Card — Double XP!
          </span>
        </div>
      )}

      <div className={clsx('perspective')}>
        <motion.div
          className={clsx(
            'preserve-3d relative min-h-[420px] rounded-3xl bg-slate-900 p-6 shadow-2xl ring-2',
            RARITY_RING[card.rarity],
          )}
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* FRONT */}
          <div className={clsx('backface-hidden', revealed && 'invisible absolute inset-0')}>
            <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400">
              <span>{card.rarity}</span>
              <span className="text-3xl leading-none">{card.emoji}</span>
            </div>
            <h3 className="mb-4 text-xl font-extrabold text-white">{card.title}</h3>
            <p className="mb-6 text-lg text-slate-200">{card.question}</p>

            <div className="space-y-3">
              {choiceOrder.map((choiceIdx) => {
                const isCorrect = choiceIdx === card.answerIndex
                const isPicked = picked === choiceIdx
                let style = 'border-white/10 bg-white/5 hover:bg-white/10'
                if (picked !== null) {
                  if (isCorrect) style = 'border-emerald-400 bg-emerald-500/20'
                  else if (isPicked) style = 'border-rose-400 bg-rose-500/20'
                  else style = 'border-white/5 bg-white/[0.02] opacity-60'
                }
                return (
                  <button
                    key={choiceIdx}
                    disabled={picked !== null}
                    onClick={() => pick(choiceIdx)}
                    className={clsx('w-full rounded-xl border px-4 py-3 text-left font-semibold transition', style)}
                  >
                    {card.choices[choiceIdx]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* BACK */}
          <div
            className={clsx(
              'backface-hidden absolute inset-0 flex flex-col p-6',
              !revealed && 'invisible',
            )}
            style={{ transform: 'rotateY(180deg)' }}
          >
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex h-full flex-col"
                >
                  <div className="mb-2 text-3xl">{picked === card.answerIndex ? '🎉' : '💡'}</div>
                  <h4 className="mb-2 text-lg font-extrabold text-white">
                    {picked === card.answerIndex ? 'Correct!' : 'Not quite — here\'s why'}
                  </h4>
                  <p className="mb-3 text-sm text-slate-200">{card.explanation}</p>
                  <div className="mb-3 rounded-xl bg-sky-500/10 p-3">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-sky-300">
                      🌍 In the real world
                    </div>
                    <p className="text-sm text-slate-200">{card.realWorldExample}</p>
                  </div>
                  <div className="mb-4 rounded-xl bg-fuchsia-500/10 p-3">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-fuchsia-300">
                      ✨ Fun fact
                    </div>
                    <p className="text-sm text-slate-200">{card.funFact}</p>
                  </div>
                  <button
                    onClick={onContinue}
                    className="mt-auto rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 font-bold text-white shadow hover:opacity-90"
                  >
                    Continue →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
