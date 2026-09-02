import { memo } from 'react'
import type { Point2D } from '../engine/support-types'

export interface TargetProps {
  targetPos: Point2D
  isSolved: boolean
}

export const Target = memo(function Target({ targetPos, isSolved }: TargetProps) {
  return (
    <g className={`support-target ${isSolved ? 'target--active' : ''}`} pointerEvents="none">
      {/* Outer Glow Halo */}
      <circle
        cx={targetPos.x}
        cy={targetPos.y}
        r={isSolved ? 15 : 12}
        fill="url(#target-glow)"
        style={{
          transition: 'r 0.3s ease',
        }}
      />
      {/* Center Target Portal Circle */}
      <circle
        cx={targetPos.x}
        cy={targetPos.y}
        r="7"
        fill="#1b2a4a"
        stroke={isSolved ? '#5fe3a1' : '#5fe3a1'}
        strokeWidth={isSolved ? '2' : '1.5'}
      />
      {/* Portal Icon */}
      <text
        x={targetPos.x}
        y={targetPos.y + 2.5}
        textAnchor="middle"
        fontSize="6"
        fill="#5fe3a1"
      >
        🌀
      </text>
    </g>
  )
})
