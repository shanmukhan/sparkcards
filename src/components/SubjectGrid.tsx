import { motion } from 'framer-motion'
import type { Subject } from '../data/types'
import { SUBJECT_INFO } from '../data/types'

interface Props {
  onSelect: (subject: Subject) => void
}

const SUBJECTS: Subject[] = ['maths', 'physics', 'electronics', 'astronomy']

export function SubjectGrid({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SUBJECTS.map((subject, i) => {
        const info = SUBJECT_INFO[subject]
        return (
          <motion.button
            key={subject}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(subject)}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${info.color} p-6 text-left shadow-lg shadow-black/30`}
          >
            <div className="text-5xl">{info.emoji}</div>
            <div className="mt-3 text-2xl font-extrabold text-white drop-shadow">{info.label}</div>
            <div className="mt-1 text-sm font-medium text-white/80">Tap to explore card packs</div>
            <div className="pointer-events-none absolute -right-6 -top-6 text-8xl opacity-20">{info.emoji}</div>
          </motion.button>
        )
      })}
    </div>
  )
}
