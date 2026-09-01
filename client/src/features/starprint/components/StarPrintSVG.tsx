import { motion } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { normalizeMediaUrl } from '@/shared/services/http/apiClient'

import type { LegacyStarEffect, StarEffect, WingPalette } from '@5ss/contracts'

interface Props {
  palette: WingPalette | readonly string[] | string[]
  effect: LegacyStarEffect | StarEffect
  photoUrl: string | null
  completedWings: number // 0-5
  size?: number
}

function starPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  let path = ''
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return path + ' Z'
}

export function StarPrintSVG({ palette, effect, photoUrl, completedWings, size = 280 }: Props) {
  const reduceMotion = useReducedMotion()
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.44
  const innerR = size * 0.2
  const photoR = size * 0.18

  const wingColors = Array.from({ length: 5 }, (_, i) => {
    if (i < completedWings) return palette[i % palette.length] ?? '#ffd467'
    return 'rgba(255,255,255,0.12)'
  })

  const glowColor = palette[0] ?? '#ffd467'
  const resolvedPhotoUrl = normalizeMediaUrl(photoUrl)

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={`starprint-svg effect-${effect.toLowerCase()}`}
      role="img"
      aria-label="STARPRINT ngôi sao cá nhân"
    >
      <defs>
        <radialGradient id="sp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
        {palette.map((color, i) => (
          <radialGradient key={i} id={`sp-wing-${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </radialGradient>
        ))}
        <clipPath id="sp-photo-clip">
          <circle cx={cx} cy={cy} r={photoR} />
        </clipPath>
        <filter id="sp-blur-glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow */}
      <circle cx={cx} cy={cy} r={outerR * 1.2} fill="url(#sp-glow)" />

      {/* 5 wings - each is a path segment of the star */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        const wingPath = `M ${cx} ${cy} L ${cx + outerR * Math.cos(angle - Math.PI / 5)} ${cy + outerR * Math.sin(angle - Math.PI / 5)} L ${cx + outerR * 0.98 * Math.cos(angle)} ${cy + outerR * 0.98 * Math.sin(angle)} L ${cx + outerR * Math.cos(angle + Math.PI / 5)} ${cy + outerR * Math.sin(angle + Math.PI / 5)} Z`
        return (
          <motion.path
            key={i}
            d={wingPath}
            fill={i < completedWings ? palette[i % palette.length] ?? '#ffd467' : 'rgba(255,255,255,0.1)'}
            stroke={i < completedWings ? wingColors[i] : 'rgba(255,255,255,0.2)'}
            strokeWidth="1"
            initial={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        )
      })}

      {/* Star outline */}
      <path d={starPath(cx, cy, outerR, innerR, 5)} fill="none" stroke={glowColor} strokeWidth="1" opacity="0.6" />

      {/* Center photo or default icon */}
      {resolvedPhotoUrl ? (
        <image
          href={resolvedPhotoUrl}
          x={cx - photoR}
          y={cy - photoR}
          width={photoR * 2}
          height={photoR * 2}
          clipPath="url(#sp-photo-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <circle cx={cx} cy={cy} r={photoR} fill={glowColor} opacity="0.3" />
      )}
    </svg>
  )
}
