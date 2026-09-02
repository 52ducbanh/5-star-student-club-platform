import { memo } from 'react'
import type { VisualObjectTransform } from '../engine/trajectories'

export interface HangingObjectProps {
  transform: VisualObjectTransform
  isSolved: boolean
  isInvalid: boolean
}

export const HangingObject = memo(function HangingObject({
  transform,
  isSolved,
  isInvalid,
}: HangingObjectProps) {
  const { x, y, rotation, scaleX, scaleY } = transform

  return (
    <g
      className={`support-object ${isSolved ? 'object--solved' : ''} ${isInvalid ? 'object--invalid' : ''}`}
      transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scaleX} ${scaleY})`}
      pointerEvents="none"
    >
      <circle
        cx={0}
        cy={0}
        r="6.5"
        fill="url(#object-glow)"
        stroke={isSolved ? '#5fe3a1' : '#ffd467'}
        strokeWidth={isSolved ? '1.8' : '1'}
        style={{
          filter: isSolved ? 'drop-shadow(0 0 8px #5fe3a1)' : undefined,
        }}
      />
      <text
        x={0}
        y={2.5}
        textAnchor="middle"
        fontSize="6"
        fill="#fff"
      >
        ⭐
      </text>
    </g>
  )
})
