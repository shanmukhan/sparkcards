import { useMemo, useState } from 'react'
import type { Band, Subject } from '../data/types'
import { buildSession } from '../game/session'
import { useGameStore } from '../store/gameStore'
import { GameCard } from './GameCard'

interface Props {
  subject: Subject
  band: Band
  onFinish: (result: { correct: number; total: number; xpGained: number; coinsGained: number; badgesEarned: string[] }) => void
  onQuit: () => void
}

export function PlayScreen({ subject, band, onFinish, onQuit }: Props) {
  const getMastery = useGameStore((s) => s.getMastery)
  const answerCard = useGameStore((s) => s.answerCard)
  const badges = useGameStore((s) => s.badges)

  const questions = useMemo(() => buildSession(subject, band, getMastery, 8), [subject, band])
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  const [coinsGained, setCoinsGained] = useState(0)
  const [badgesBefore] = useState<string[]>(badges)
  const [lastAnsweredCorrect, setLastAnsweredCorrect] = useState<boolean | null>(null)

  const question = questions[index]

  function handleAnswered(correct: boolean) {
    const result = answerCard(question.card.id, correct)
    const multiplier = question.isBoss ? 2 : 1
    setXpGained((v) => v + result.xpGained * multiplier)
    setCoinsGained((v) => v + result.coinsGained * multiplier)
    setLastAnsweredCorrect(correct)
    if (correct) setCorrectCount((v) => v + 1)
  }

  function handleContinue() {
    if (index + 1 >= questions.length) {
      const badgesNow = useGameStore.getState().badges
      const newlyEarned = badgesNow.filter((b) => !badgesBefore.includes(b))
      onFinish({ correct: correctCount, total: questions.length, xpGained, coinsGained, badgesEarned: newlyEarned })
    } else {
      setIndex((v) => v + 1)
      setLastAnsweredCorrect(null)
    }
  }

  if (!question) {
    return (
      <div className="text-center text-slate-400">
        No cards available yet for this band.
        <button onClick={onQuit} className="mt-4 block rounded-xl bg-white/10 px-4 py-2 mx-auto">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mx-auto mb-4 flex max-w-xl items-center justify-between text-sm text-slate-400">
        <button onClick={onQuit} className="font-semibold hover:text-white">
          ✕ Quit
        </button>
        <span>
          Card {index + 1} / {questions.length}
        </span>
        <span className="font-semibold text-emerald-400">✓ {correctCount}</span>
      </div>
      <div className="mx-auto mb-4 h-2 max-w-xl overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>
      <GameCard key={question.card.id + index} question={question} onAnswered={handleAnswered} onContinue={handleContinue} />
      {lastAnsweredCorrect !== null && (
        <div className="mt-3 text-center text-xs text-slate-500">
          {lastAnsweredCorrect ? '+XP earned! Tap Continue to move on.' : 'That\'s okay — read the explanation and keep going!'}
        </div>
      )}
    </div>
  )
}
