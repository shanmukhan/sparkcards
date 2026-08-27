import { useEffect, useState } from 'react'
import type { Band, Subject } from './data/types'
import { useGameStore } from './store/gameStore'
import { TopBar } from './components/TopBar'
import { SubjectGrid } from './components/SubjectGrid'
import { BandPicker } from './components/BandPicker'
import { PlayScreen } from './components/PlayScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { CollectionScreen } from './components/CollectionScreen'
import { BadgesModal } from './components/BadgesModal'

type Screen = 'home' | 'bands' | 'play' | 'results' | 'collection'

interface SessionResult {
  correct: number
  total: number
  xpGained: number
  coinsGained: number
  badgesEarned: string[]
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [subject, setSubject] = useState<Subject | null>(null)
  const [band, setBand] = useState<Band | null>(null)
  const [result, setResult] = useState<SessionResult | null>(null)
  const [showBadges, setShowBadges] = useState(false)
  const touchDailyStreak = useGameStore((s) => s.touchDailyStreak)

  useEffect(() => {
    touchDailyStreak()
  }, [touchDailyStreak])

  function goHome() {
    setScreen('home')
    setSubject(null)
    setBand(null)
  }

  return (
    <div className="min-h-screen">
      <TopBar onOpenCollection={() => setScreen('collection')} onOpenBadges={() => setShowBadges(true)} onHome={goHome} />
      <main className="mx-auto max-w-4xl px-4 py-6">
        {screen === 'home' && (
          <div>
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-black tracking-tight text-white">Flip. Answer. Discover. 🚀</h1>
              <p className="mt-1 text-slate-400">Pick a subject and start collecting knowledge cards!</p>
            </div>
            <SubjectGrid
              onSelect={(s) => {
                setSubject(s)
                setScreen('bands')
              }}
            />
          </div>
        )}

        {screen === 'bands' && subject && (
          <BandPicker
            subject={subject}
            onBack={() => setScreen('home')}
            onSelect={(b) => {
              setBand(b)
              setScreen('play')
            }}
          />
        )}

        {screen === 'play' && subject && band && (
          <PlayScreen
            subject={subject}
            band={band}
            onQuit={() => setScreen('bands')}
            onFinish={(r) => {
              setResult(r)
              setScreen('results')
            }}
          />
        )}

        {screen === 'results' && result && (
          <ResultsScreen
            {...result}
            onHome={goHome}
            onPlayAgain={() => setScreen('play')}
          />
        )}

        {screen === 'collection' && <CollectionScreen onBack={goHome} />}
      </main>
      {showBadges && <BadgesModal onClose={() => setShowBadges(false)} />}
    </div>
  )
}
