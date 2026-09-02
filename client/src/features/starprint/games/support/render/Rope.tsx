import { memo } from 'react'
import type { SupportRopeConfig, Point2D } from '../engine/support-types'
import { calculateRopePath, calculateRopeRecoil } from '../engine/trajectories'

export interface RopeProps {
  rope: SupportRopeConfig
  isCut: boolean
  cutPoint: Point2D | null
  cutTimestamp: number | null
  currentTimestamp: number
  objectPos: Point2D
  onTapCut: (ropeId: string, point: Point2D) => void
}

export const Rope = memo(function Rope({
  rope,
  isCut,
  cutPoint,
  cutTimestamp,
  currentTimestamp,
  objectPos,
  onTapCut,
}: RopeProps) {
  const anchor = { x: rope.x1, y: rope.y1 }

  if (isCut) {
    if (!cutPoint || !cutTimestamp) return null

    const elapsed = currentTimestamp - cutTimestamp
    const recoil = calculateRopeRecoil(anchor, cutPoint, objectPos, elapsed, 220)
    if (!recoil) return null

    return (
      <g className="rope-recoil" opacity={recoil.opacity} pointerEvents="none">
        <path
          d={recoil.upperPath}
          fill="none"
          stroke="#ffd467"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={recoil.lowerPath}
          fill="none"
          stroke="#ffd467"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    )
  }

  const pathD = calculateRopePath(anchor, objectPos, 2.5)
  const midX = (rope.x1 + objectPos.x) / 2
  const midY = (rope.y1 + objectPos.y) / 2 + 1.25

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTapCut(rope.ropeId, { x: midX, y: midY })
  }

  return (
    <g
      className="rope-group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Cắt ${rope.label}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTapCut(rope.ropeId, { x: midX, y: midY })
        }
      }}
    >
      {/* Shadow */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Visual Line */}
      <path
        d={pathD}
        fill="none"
        stroke="#ffd467"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="rope-visual-line"
      />
      {/* Anchor dot */}
      <circle cx={rope.x1} cy={rope.y1} r="2.5" fill="#ffd467" />

      {/* Large Hit Area for tap / click fallback */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="14"
        className="rope-hit-area"
        style={{ cursor: 'pointer' }}
      />

      {/* Scissors badge at midpoint */}
      <circle
        cx={midX}
        cy={midY}
        r="3.5"
        fill="#1a1f36"
        stroke="#ffd467"
        strokeWidth="0.8"
      />
      <text
        x={midX}
        y={midY + 1.2}
        textAnchor="middle"
        fontSize="3.5"
        fill="#fff"
        pointerEvents="none"
      >
        ✂️
      </text>
    </g>
  )
})
