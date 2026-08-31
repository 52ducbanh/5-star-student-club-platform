import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface LoadingStarPentagonProps {
  activeCount: number // 0 to 5
  isComplete: boolean
}

const CRITERIA_COLORS = [
  '#ffd467', // Đạo đức tốt - Warm Sun Gold
  '#6cd5f7', // Học tập tốt - Sky Cyan
  '#5fe3a1', // Thể lực tốt - Mint Spring Green
  '#ff8b72', // Tình nguyện tốt - Coral Orange
  '#b794f6', // Hội nhập tốt - Dreamy Lavender Violet
]

const CRITERIA_NAMES = [
  'Đạo đức tốt',
  'Học tập tốt',
  'Thể lực tốt',
  'Tình nguyện tốt',
  'Hội nhập tốt',
]

export function LoadingStarPentagon({ activeCount, isComplete }: LoadingStarPentagonProps) {
  const prefersReduced = useReducedMotion()
  const radius = 80
  const centerX = 130
  const centerY = 130

  const points = Array.from({ length: 5 }).map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      color: CRITERIA_COLORS[i],
      name: CRITERIA_NAMES[i],
    }
  })

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg width="260" height="260" viewBox="0 0 260 260" className="overflow-visible">
        <defs>
          <linearGradient id="candyCenterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd86a" />
            <stop offset="35%" stopColor="#75cfe5" />
            <stop offset="70%" stopColor="#2f7bd8" />
            <stop offset="100%" stopColor="#184585" />
          </linearGradient>

          <filter id="candyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient constellation orbit circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(159, 215, 245, 0.2)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Outer rotating halo ring (disabled if reduced motion) */}
        {!prefersReduced && (
          <motion.circle
            cx={centerX}
            cy={centerY}
            r={radius + 16}
            fill="none"
            stroke="rgba(117, 207, 229, 0.3)"
            strokeWidth="1"
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '130px', originY: '130px' }}
          />
        )}

        {/* Energy lines connecting active nodes to center & perimeter */}
        {points.map((point, index) => {
          const nextPoint = points[(index + 1) % 5]
          const isActive = index < activeCount
          const isNextActive = ((index + 1) % 5) < activeCount

          return (
            <g key={`lines-${index}`}>
              {/* Outer perimeter lines */}
              <motion.line
                x1={point.x}
                y1={point.y}
                x2={nextPoint.x}
                y2={nextPoint.y}
                stroke={isActive && isNextActive ? point.color : 'rgba(159, 215, 245, 0.1)'}
                strokeWidth={isActive && isNextActive ? '2' : '1'}
                strokeOpacity={isActive && isNextActive ? 0.85 : 0.25}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isActive && isNextActive ? 1 : 0 }}
                transition={{ duration: prefersReduced ? 0.05 : 0.5, ease: 'easeOut' }}
              />

              {/* Radial beam to center when active */}
              <motion.line
                x1={point.x}
                y1={point.y}
                x2={centerX}
                y2={centerY}
                stroke={point.color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isActive ? (isComplete ? 0.9 : 0.5) : 0,
                  strokeWidth: isComplete ? 2 : 1.5,
                }}
                transition={{ duration: prefersReduced ? 0.05 : 0.4 }}
              />
            </g>
          )
        })}

        {/* Central 5SS Glowing Star */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Ambient center pulse glow */}
          <motion.circle
            r="26"
            fill="url(#candyCenterGradient)"
            opacity={isComplete ? 0.45 : 0.15}
            filter="url(#candyGlow)"
            animate={
              prefersReduced
                ? { scale: 1, opacity: isComplete ? 0.45 : 0.15 }
                : isComplete
                ? { scale: [1, 1.35, 1.2], opacity: [0.3, 0.6, 0.5] }
                : { scale: [0.95, 1.05, 0.95], opacity: [0.15, 0.25, 0.15] }
            }
            transition={{ duration: 1.8, repeat: prefersReduced ? 0 : Infinity, ease: 'easeInOut' }}
          />

          {/* Central 5-Point SVG Star */}
          <motion.path
            d="M 0,-18 L 5.5,-5.5 L 19,-5.5 L 8.5,3 L 12.5,16 L 0,8.5 L -12.5,16 L -8.5,3 L -19,-5.5 L -5.5,-5.5 Z"
            fill="url(#candyCenterGradient)"
            stroke="#ffffff"
            strokeWidth="1.5"
            animate={
              prefersReduced
                ? { scale: 1 }
                : isComplete
                ? { scale: [1, 1.18, 1.1], rotate: [0, 10, 0] }
                : { scale: 0.95 + (activeCount / 5) * 0.15 }
            }
            transition={{ duration: 0.6 }}
          />

          {/* 5SS Text inside star */}
          <text
            y="2"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#0b234d"
            fontSize="7.5"
            fontWeight="900"
            fontFamily="var(--font-heading)"
            letterSpacing="0.04em"
          >
            5SS
          </text>
        </g>

        {/* 5 Criteria Nodes */}
        {points.map((point, index) => {
          const isActive = index < activeCount

          return (
            <g key={`node-${index}`} transform={`translate(${point.x}, ${point.y})`}>
              {/* Outer pulsing ring for active nodes */}
              {isActive && !prefersReduced && (
                <motion.circle
                  r="13"
                  fill="none"
                  stroke={point.color}
                  strokeWidth="1.5"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.85, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.2 }}
                />
              )}

              {/* Node base circle */}
              <circle
                r="7.5"
                fill={isActive ? point.color : 'rgba(14, 46, 94, 0.9)'}
                stroke={isActive ? '#ffffff' : 'rgba(159, 215, 245, 0.4)'}
                strokeWidth="1.5"
                filter={isActive ? 'url(#candyGlow)' : 'none'}
              />

              {/* Node order number */}
              <text
                y="1"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? '#0b234d' : 'rgba(182, 222, 245, 0.7)'}
                fontSize="7.5"
                fontWeight="900"
              >
                {index + 1}
              </text>
            </g>
          )
        })}
      </svg>

      {/* 5 Active Criteria Status Pills Below */}
      <div className="flex items-center gap-2 mt-4">
        {CRITERIA_COLORS.map((color, index) => {
          const isActive = index < activeCount
          return (
            <motion.div
              key={index}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: isActive ? color : 'rgba(159, 215, 245, 0.2)',
                boxShadow: isActive ? `0 0 10px ${color}` : 'none',
              }}
              animate={prefersReduced ? { scale: 1 } : isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            />
          )
        })}
      </div>
    </div>
  )
}
