import { memo } from 'react'
import type { Point2D } from '../engine/support-types'

export interface SwipeTrailProps {
  points: Point2D[]
}

export const SwipeTrail = memo(function SwipeTrail({ points }: SwipeTrailProps) {
  if (points.length < 2) return null

  const pointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <g className="swipe-trail" pointerEvents="none">
      {/* Outer soft blade glow */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke="#ffd467"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      {/* Core laser / slash trail */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </g>
  )
})
