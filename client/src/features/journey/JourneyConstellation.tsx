import { BookOpenCheck, Check, Dumbbell, HandHeart, HeartHandshake, Languages, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { journeyCriteria, type JourneyCriterion } from './data/journey'
import {
  JOURNEY_COORDINATES,
  JOURNEY_CORE_COORDINATE,
  JOURNEY_STAGE_VIEWBOX,
} from './journeyCoordinates'
import { JourneyCoreStar } from './JourneyCoreStar'

const criterionIcons: Record<string, typeof HeartHandshake> = {
  'dao-duc': HeartHandshake,
  'hoc-tap': BookOpenCheck,
  'the-luc': Dumbbell,
  'tinh-nguyen': HandHeart,
  'hoi-nhap': Languages,
}

type JourneyConstellationProps = {
  selectedId: string
  onSelect: (id: string) => void
  criterionProgress: Record<string, number>
  overallPercent: number
  completedCount: number
  totalCount: number
}

export function JourneyConstellation({
  selectedId,
  onSelect,
  criterionProgress,
  overallPercent,
  completedCount,
  totalCount,
}: JourneyConstellationProps) {
  const reduceMotion = useReducedMotion()

  const daoDuc = JOURNEY_COORDINATES['dao-duc']
  const hocTap = JOURNEY_COORDINATES['hoc-tap']
  const theLuc = JOURNEY_COORDINATES['the-luc']
  const tinhNguyen = JOURNEY_COORDINATES['tinh-nguyen']
  const hoiNhap = JOURNEY_COORDINATES['hoi-nhap']
  const core = JOURNEY_CORE_COORDINATE

  // Polygon points for outer constellation orbit connecting 5 planets in order
  const orbitPoints = `${daoDuc.x},${daoDuc.y} ${hocTap.x},${hocTap.y} ${theLuc.x},${theLuc.y} ${tinhNguyen.x},${tinhNguyen.y} ${hoiNhap.x},${hoiNhap.y}`

  return (
    <div className="journey-map-stage" aria-label="Bản đồ thiên hà 5 tiêu chí">
      {/* Background Constellation Ambient Aura */}
      <div className="journey-constellation__ambient" aria-hidden="true" />

      {/* SVG Constellation Connections */}
      <svg
        className="journey-constellation__svg"
        viewBox={`0 0 ${JOURNEY_STAGE_VIEWBOX.width} ${JOURNEY_STAGE_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="spoke-gradient-gold" x1={core.x} y1={core.y} x2={daoDuc.x} y2={daoDuc.y} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffd467" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffd467" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="spoke-gradient-blue" x1={core.x} y1={core.y} x2={hocTap.x} y2={hocTap.y} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6cd5f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6cd5f7" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="spoke-gradient-green" x1={core.x} y1={core.y} x2={theLuc.x} y2={theLuc.y} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5fe3a1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#5fe3a1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="spoke-gradient-orange" x1={core.x} y1={core.y} x2={tinhNguyen.x} y2={tinhNguyen.y} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff8b72" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff8b72" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="spoke-gradient-violet" x1={core.x} y1={core.y} x2={hoiNhap.x} y2={hoiNhap.y} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#b794f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b794f6" stopOpacity="0.2" />
          </linearGradient>
          <filter id="constellation-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Orbit Connecting 5 Planets */}
        <polygon points={orbitPoints} className="journey-constellation__orbit-track" />

        {/* Core Spokes connecting Center to Each Node */}
        <line
          x1={core.x}
          y1={core.y}
          x2={daoDuc.x}
          y2={daoDuc.y}
          className={`journey-spoke ${selectedId === 'dao-duc' ? 'is-focused' : ''} ${criterionProgress['dao-duc'] === 100 ? 'is-complete' : ''}`}
          stroke="url(#spoke-gradient-gold)"
        />

        <line
          x1={core.x}
          y1={core.y}
          x2={hocTap.x}
          y2={hocTap.y}
          className={`journey-spoke ${selectedId === 'hoc-tap' ? 'is-focused' : ''} ${criterionProgress['hoc-tap'] === 100 ? 'is-complete' : ''}`}
          stroke="url(#spoke-gradient-blue)"
        />

        <line
          x1={core.x}
          y1={core.y}
          x2={theLuc.x}
          y2={theLuc.y}
          className={`journey-spoke ${selectedId === 'the-luc' ? 'is-focused' : ''} ${criterionProgress['the-luc'] === 100 ? 'is-complete' : ''}`}
          stroke="url(#spoke-gradient-green)"
        />

        <line
          x1={core.x}
          y1={core.y}
          x2={tinhNguyen.x}
          y2={tinhNguyen.y}
          className={`journey-spoke ${selectedId === 'tinh-nguyen' ? 'is-focused' : ''} ${criterionProgress['tinh-nguyen'] === 100 ? 'is-complete' : ''}`}
          stroke="url(#spoke-gradient-orange)"
        />

        <line
          x1={core.x}
          y1={core.y}
          x2={hoiNhap.x}
          y2={hoiNhap.y}
          className={`journey-spoke ${selectedId === 'hoi-nhap' ? 'is-focused' : ''} ${criterionProgress['hoi-nhap'] === 100 ? 'is-complete' : ''}`}
          stroke="url(#spoke-gradient-violet)"
        />
      </svg>

      {/* Central Core Star Anchor */}
      <div
        className="journey-core-anchor"
        style={{
          left: core.left,
          top: core.top,
        }}
      >
        <JourneyCoreStar
          percent={overallPercent}
          completedCount={completedCount}
          totalCount={totalCount}
        />
      </div>

      {/* 5 Planetary Node Anchors with Isolated Transforms */}
      {journeyCriteria.map((criterion: JourneyCriterion) => {
        const coords = JOURNEY_COORDINATES[criterion.id] ?? { left: '50%', top: '50%' }
        const nodePercent = criterionProgress[criterion.id] ?? 0
        const isSelected = selectedId === criterion.id
        const isComplete = nodePercent === 100
        const isStarted = nodePercent > 0 && nodePercent < 100
        const Icon = criterionIcons[criterion.id] ?? Sparkles

        return (
          <div
            key={criterion.id}
            className="journey-planet-anchor"
            style={{
              left: coords.left,
              top: coords.top,
              '--planet-color': criterion.color,
            } as React.CSSProperties}
          >
            <motion.button
              type="button"
              className={`journey-planet-node ${isSelected ? 'is-selected' : ''} ${isComplete ? 'is-complete' : ''} ${isStarted ? 'is-started' : 'is-untouched'}`}
              onClick={() => onSelect(criterion.id)}
              whileHover={reduceMotion ? undefined : { scale: 1.05 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              aria-label={`${criterion.title}, hoàn thành ${nodePercent} phần trăm. Nhấp để xem và cập nhật checklist.`}
              aria-pressed={isSelected}
            >
              {/* Focus status indicator */}
              {isSelected && (
                <span className="journey-planet-node__focus-tag" aria-hidden="true">
                  ✦ Đang xem
                </span>
              )}

              {/* Planet Orb with Progress Meter */}
              <div className="journey-planet-node__body">
                {/* Circular Progress border ring */}
                <svg className="journey-planet-node__meter" viewBox="0 0 68 68" aria-hidden="true">
                  <circle cx="34" cy="34" r="30" className="meter-track" />
                  <circle
                    cx="34"
                    cy="34"
                    r="30"
                    className="meter-fill"
                    style={{
                      strokeDasharray: 188.5,
                      strokeDashoffset: 188.5 * (1 - nodePercent / 100),
                    }}
                  />
                </svg>

                <div className="journey-planet-node__orb">
                  <Icon size={22} className="planet-icon" aria-hidden="true" />
                </div>

                {/* Status Pill Badge */}
                <span className="journey-planet-node__badge">
                  {isComplete ? <Check size={11} strokeWidth={3} /> : `${nodePercent}%`}
                </span>
              </div>

              {/* Planet Label */}
              <div className="journey-planet-node__info">
                <span className="journey-planet-node__order">0{criterion.order}</span>
                <strong className="journey-planet-node__title">{criterion.shortName}</strong>
              </div>
            </motion.button>
          </div>
        )
      })}
    </div>
  )
}
