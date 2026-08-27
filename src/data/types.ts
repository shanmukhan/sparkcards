export type Subject = 'maths' | 'physics' | 'electronics' | 'astronomy' | 'lighttime' | 'circuits'

export type Band = 'foundations' | 'explorer' | 'builder' | 'innovator'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export const BAND_INFO: Record<Band, { label: string; grades: string; blurb: string }> = {
  foundations: { label: 'Foundations', grades: 'Class 1–2', blurb: 'First steps into big ideas' },
  explorer: { label: 'Explorer', grades: 'Class 3–5', blurb: 'Investigate how the world works' },
  builder: { label: 'Builder', grades: 'Class 6–8', blurb: 'Build real understanding' },
  innovator: { label: 'Innovator', grades: 'Class 9–10', blurb: 'Think like a scientist' },
}

export const SUBJECT_INFO: Record<Subject, { label: string; emoji: string; color: string }> = {
  maths: { label: 'Maths', emoji: '🔢', color: 'from-sky-400 to-blue-600' },
  physics: { label: 'Physics', emoji: '⚡', color: 'from-amber-400 to-orange-600' },
  electronics: { label: 'Electronics', emoji: '🔌', color: 'from-emerald-400 to-teal-600' },
  astronomy: { label: 'Astronomy', emoji: '🪐', color: 'from-violet-400 to-purple-700' },
  lighttime: { label: 'Light & Time', emoji: '💡', color: 'from-yellow-300 to-amber-600' },
  circuits: { label: 'Circuits Basics', emoji: '🔋', color: 'from-rose-400 to-red-600' },
}

export interface Card {
  id: string
  subject: Subject
  band: Band
  rarity: Rarity
  title: string
  question: string
  choices: string[]
  answerIndex: number
  explanation: string
  realWorldExample: string
  funFact: string
  emoji: string
}
