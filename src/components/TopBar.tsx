import { useGameStore, levelForXp, titleForLevel } from '../store/gameStore'

interface Props {
  onOpenCollection: () => void
  onOpenBadges: () => void
  onHome: () => void
}

export function TopBar({ onOpenCollection, onOpenBadges, onHome }: Props) {
  const xp = useGameStore((s) => s.xp)
  const coins = useGameStore((s) => s.coins)
  const streakDays = useGameStore((s) => s.streakDays)
  const badges = useGameStore((s) => s.badges)
  const level = levelForXp(xp)
  const xpIntoLevel = xp % 100

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur">
      <button onClick={onHome} className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
        <span className="text-2xl">🃏</span>
        <span className="hidden sm:inline">SparkCards</span>
      </button>

      <div className="flex flex-1 items-center gap-3 max-w-xs">
        <div className="flex flex-col flex-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">
            Lv.{level} · {titleForLevel(level)}
          </span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-violet-500 transition-all"
              style={{ width: `${xpIntoLevel}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm font-bold">
        <span className="flex items-center gap-1 text-amber-300">🪙 {coins}</span>
        <span className="flex items-center gap-1 text-orange-400">🔥 {streakDays}</span>
        <button
          onClick={onOpenBadges}
          className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-yellow-300 hover:bg-white/20"
          title="Badges"
        >
          🏅 {badges.length}
        </button>
        <button
          onClick={onOpenCollection}
          className="rounded-full bg-white/10 px-3 py-1 text-slate-200 hover:bg-white/20"
        >
          Collection
        </button>
      </div>
    </div>
  )
}
