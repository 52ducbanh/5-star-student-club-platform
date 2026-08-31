import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, Info } from 'lucide-react'

export function Toast({ message, type = 'success' }: { message: string | null; type?: 'success' | 'info' }) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`toast toast--${type}`}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
        >
          {type === 'success' ? <CheckCircle2 size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
