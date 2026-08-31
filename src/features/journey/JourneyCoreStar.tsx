import { motion, useReducedMotion } from 'motion/react'
import { Sparkles, Star } from 'lucide-react'

type JourneyCoreStarProps = {
  percent: number
  completedCount: number
  totalCount: number
  onClick?: () => void
}

export function JourneyCoreStar({ percent, completedCount, totalCount, onClick }: JourneyCoreStarProps) {
  const reduceMotion = useReducedMotion()
  const isComplete = percent === 100
  const isActive = percent > 0

  return (
    <div
      className={`journey-core-star ${isComplete ? 'is-complete' : ''} ${isActive ? 'is-active' : 'is-dormant'}`}
      onClick={onClick}
      role="region"
      aria-label={`Tiến độ toàn bộ 5 tiêu chí: ${percent}%, ${completedCount} trên ${totalCount} mục đã hoàn thành`}
    >
      {/* Outer energy pulsating halo */}
      <div className="journey-core-star__halo" aria-hidden="true" />
      <div className="journey-core-star__ring" aria-hidden="true" />

      {/* Radiant star core */}
      <div className="journey-core-star__orb">
        <div className="journey-core-star__icon" aria-hidden="true">
          {isComplete ? (
            <Sparkles size={26} className="core-icon-complete" />
          ) : (
            <Star size={24} className="core-icon-star" />
          )}
        </div>

        <span className="journey-core-star__number">
          <motion.strong
            key={percent}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            {percent}%
          </motion.strong>
          <small>{completedCount}/{totalCount} mục</small>
        </span>
      </div>

      <div className="journey-core-star__label">
        <span>{isComplete ? 'Hành trình trọn vẹn' : 'Tiến độ tổng thể'}</span>
      </div>
    </div>
  )
}
