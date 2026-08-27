export interface BadgeMeta {
  id: string
  emoji: string
  title: string
  description: string
}

export const BADGES: BadgeMeta[] = [
  { id: 'first-spark', emoji: '✨', title: 'First Spark', description: 'Earned your very first XP.' },
  { id: 'streak-3', emoji: '🔥', title: '3-Day Streak', description: 'Played 3 days in a row.' },
  { id: 'streak-7', emoji: '🔥', title: 'Week of Wonder', description: 'Played 7 days in a row.' },
  { id: 'collector-10', emoji: '🃏', title: 'Card Collector', description: 'Mastered 10 cards.' },
  { id: 'collector-25', emoji: '📚', title: 'Master Collector', description: 'Mastered 25 cards.' },
  { id: 'explorer-unlocked', emoji: '🧭', title: 'Explorer Unlocked', description: 'Unlocked the Explorer band.' },
  { id: 'builder-unlocked', emoji: '🛠️', title: 'Builder Unlocked', description: 'Unlocked the Builder band.' },
  { id: 'innovator-unlocked', emoji: '🚀', title: 'Innovator Unlocked', description: 'Unlocked the Innovator band.' },
  { id: 'level-5', emoji: '⭐', title: 'Rising Star', description: 'Reached level 5.' },
  { id: 'level-10', emoji: '🌟', title: 'Shining Star', description: 'Reached level 10.' },
]

export const badgeById = (id: string): BadgeMeta | undefined => BADGES.find((b) => b.id === id)
