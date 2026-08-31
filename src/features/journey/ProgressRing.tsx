import { motion, useReducedMotion } from 'motion/react'

export function ProgressRing({ percent, size = 138, color = '#e4cf6c' }: { percent: number; size?: number; color?: string }) {
  const reduceMotion = useReducedMotion()
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)

  return (
    <div className="progress-ring" style={{ width: size, height: size }} aria-label={`${percent}% hoàn thành`}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="progress-ring__track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <motion.circle
          className="progress-ring__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          initial={false}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease: 'easeOut' }}
        />
      </svg>
      <span className="progress-ring__number" key={percent}>
        <motion.strong
          initial={reduceMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
        >
          {percent}%
        </motion.strong>
        <small>hoàn thành</small>
      </span>
    </div>
  )
}
