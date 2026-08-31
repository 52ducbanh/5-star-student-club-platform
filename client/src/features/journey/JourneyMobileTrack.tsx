import { BookOpenCheck, Check, ChevronRight, Dumbbell, HandHeart, HeartHandshake, Languages, Sparkles, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { journeyCriteria, type JourneyCriterion } from './data/journey'

const criterionIcons: Record<string, typeof HeartHandshake> = {
  'dao-duc': HeartHandshake,
  'hoc-tap': BookOpenCheck,
  'the-luc': Dumbbell,
  'tinh-nguyen': HandHeart,
  'hoi-nhap': Languages,
}

type JourneyMobileTrackProps = {
  selectedId: string
  onSelect: (id: string) => void
  criterionProgress: Record<string, number>
  overallPercent: number
  completedCount: number
  totalCount: number
}

export function JourneyMobileTrack({
  selectedId,
  onSelect,
  criterionProgress,
  overallPercent,
  completedCount,
  totalCount,
}: JourneyMobileTrackProps) {
  const isAllComplete = overallPercent === 100

  return (
    <div className="journey-mobile-track" aria-label="Lộ trình rèn luyện 5 tiêu chí trên điện thoại">
      {/* Overall Core Summary Card at Top */}
      <div className={`journey-mobile-core ${isAllComplete ? 'is-complete' : ''}`}>
        <div className="journey-mobile-core__left">
          <div className="journey-mobile-core__badge-icon" aria-hidden="true">
            {isAllComplete ? <Sparkles size={22} /> : <Star size={20} />}
          </div>
          <div>
            <span className="journey-mobile-core__label">Tiến độ tổng thể</span>
            <strong className="journey-mobile-core__stat">
              {completedCount}/{totalCount} mục hoàn thành
            </strong>
          </div>
        </div>

        <div className="journey-mobile-core__right">
          <span className="journey-mobile-core__percent">{overallPercent}%</span>
        </div>
      </div>

      {/* Vertical Cosmic Spine & 5 Criterion Cards */}
      <div className="journey-mobile-list" aria-label="Danh sách 5 chặng tiêu chí">
        {journeyCriteria.map((criterion: JourneyCriterion) => {
          const nodePercent = criterionProgress[criterion.id] ?? 0
          const isSelected = selectedId === criterion.id
          const isComplete = nodePercent === 100
          const Icon = criterionIcons[criterion.id] ?? Sparkles

          return (
            <motion.button
              key={criterion.id}
              type="button"
              aria-pressed={isSelected}
              className={`journey-mobile-card ${isSelected ? 'is-selected' : ''} ${isComplete ? 'is-complete' : ''}`}
              style={{ '--planet-color': criterion.color } as React.CSSProperties}
              onClick={() => onSelect(criterion.id)}
              whileTap={{ scale: 0.98 }}
            >
              {/* Planet Mini Orb */}
              <div className="journey-mobile-card__orb" aria-hidden="true">
                <Icon size={18} />
              </div>

              {/* Card Body */}
              <div className="journey-mobile-card__content">
                <div className="journey-mobile-card__header">
                  <span className="journey-mobile-card__order">Chặng 0{criterion.order}</span>
                  <strong className="journey-mobile-card__title">{criterion.title}</strong>
                </div>

                {/* Progress bar */}
                <div className="journey-mobile-card__meter">
                  <div
                    className="journey-mobile-card__meter-fill"
                    style={{ width: `${nodePercent}%`, backgroundColor: criterion.color }}
                  />
                </div>
              </div>

              {/* Status pill badge */}
              <div className="journey-mobile-card__status">
                {isComplete ? (
                  <span className="status-chip status-chip--complete">
                    <Check size={12} strokeWidth={3} /> Đã xong
                  </span>
                ) : isSelected ? (
                  <span className="status-chip status-chip--focus">
                    Đang xem <ChevronRight size={12} />
                  </span>
                ) : (
                  <span className="status-chip status-chip--percent">
                    {nodePercent}%
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
