import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { resolveStarCardAvatar, DEFAULT_STAR_AVATAR } from '../utils/avatar'
import type { LegacyStarEffect, StarEffect, WingPalette } from '@5ss/contracts'

interface Props {
  palette: WingPalette | readonly string[] | string[]
  effect: LegacyStarEffect | StarEffect
  photoUrl: string | null
  completedWings: number // 0-5
  size?: number
  animated?: boolean
}

export function StarPrintSVG({
  palette,
  effect,
  photoUrl,
  completedWings,
  size = 280,
  animated = true,
}: Props) {
  const reduceMotion = useReducedMotion()
  const rawId = useId()
  const uniqueId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const clipId = `sp-photo-clip-${uniqueId}`
  const glowId = `sp-glow-${uniqueId}`
  const pentagonBgId = `sp-pentagon-bg-${uniqueId}`

  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.44
  const innerR = size * 0.23
  const cornerDist = outerR * 0.14

  // Outer star tips (apex points)
  const tips = Array.from({ length: 5 }, (_, i) => {
    const tipAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2
    return {
      x: cx + outerR * Math.cos(tipAngle),
      y: cy + outerR * Math.sin(tipAngle),
    }
  })

  // Inner star valleys (which are exactly the 5 vertices of the central pentagon)
  const valleys = Array.from({ length: 5 }, (_, i) => {
    const valleyAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2 + Math.PI / 5
    return {
      x: cx + innerR * Math.cos(valleyAngle),
      y: cy + innerR * Math.sin(valleyAngle),
    }
  })

  // Rounded apex control points for the 5 outer tips
  const roundedTips = tips.map((tip, i) => {
    const prevValley = valleys[(i + 4) % 5]
    const nextValley = valleys[i]

    const dIn = Math.hypot(prevValley.x - tip.x, prevValley.y - tip.y)
    const dOut = Math.hypot(nextValley.x - tip.x, nextValley.y - tip.y)

    const pStart = {
      x: tip.x + (cornerDist / dIn) * (prevValley.x - tip.x),
      y: tip.y + (cornerDist / dIn) * (prevValley.y - tip.y),
    }

    const pEnd = {
      x: tip.x + (cornerDist / dOut) * (nextValley.x - tip.x),
      y: tip.y + (cornerDist / dOut) * (nextValley.y - tip.y),
    }

    return { pStart, pEnd, apex: tip }
  })

  // 5 wings - each attached to one edge of the central pentagon
  const wingPaths = Array.from({ length: 5 }, (_, i) => {
    const prevValley = valleys[(i + 4) % 5]
    const nextValley = valleys[i]
    const rt = roundedTips[i]

    return [
      `M ${prevValley.x.toFixed(2)} ${prevValley.y.toFixed(2)}`,
      `L ${rt.pStart.x.toFixed(2)} ${rt.pStart.y.toFixed(2)}`,
      `Q ${rt.apex.x.toFixed(2)} ${rt.apex.y.toFixed(2)}, ${rt.pEnd.x.toFixed(2)} ${rt.pEnd.y.toFixed(2)}`,
      `L ${nextValley.x.toFixed(2)} ${nextValley.y.toFixed(2)}`,
      'Z',
    ].join(' ')
  })

  // Central regular pentagon path: Valley 4 (top-left) -> 0 (top-right) -> 1 (right) -> 2 (bottom) -> 3 (left) -> Z
  const pentagonPath = [
    `M ${valleys[4].x.toFixed(2)} ${valleys[4].y.toFixed(2)}`,
    `L ${valleys[0].x.toFixed(2)} ${valleys[0].y.toFixed(2)}`,
    `L ${valleys[1].x.toFixed(2)} ${valleys[1].y.toFixed(2)}`,
    `L ${valleys[2].x.toFixed(2)} ${valleys[2].y.toFixed(2)}`,
    `L ${valleys[3].x.toFixed(2)} ${valleys[3].y.toFixed(2)}`,
    'Z',
  ].join(' ')

  // Continuous outer star border path with rounded tips
  const starOutlinePath = [
    `M ${roundedTips[0].pStart.x.toFixed(2)} ${roundedTips[0].pStart.y.toFixed(2)}`,
    ...Array.from({ length: 5 }, (_, i) => {
      const rt = roundedTips[i]
      const v = valleys[i]
      const nextRt = roundedTips[(i + 1) % 5]
      return [
        `Q ${rt.apex.x.toFixed(2)} ${rt.apex.y.toFixed(2)}, ${rt.pEnd.x.toFixed(2)} ${rt.pEnd.y.toFixed(2)}`,
        `L ${v.x.toFixed(2)} ${v.y.toFixed(2)}`,
        i < 4 ? `L ${nextRt.pStart.x.toFixed(2)} ${nextRt.pStart.y.toFixed(2)}` : '',
      ].filter(Boolean).join(' ')
    }),
    'Z',
  ].join(' ')

  // Geometric center of the pentagon bounding box
  const pentagonYMid = cy + 0.0955 * innerR
  const avatarSize = innerR * 2.05

  const outerStrokeWidth = Math.max(2, (size / 280) * 2.8)
  const pentagonStrokeWidth = Math.max(1.8, (size / 280) * 2.2)

  const glowColor = palette[0] ?? '#ffd467'
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const resolvedPhotoUrl = (failedUrl && failedUrl === photoUrl)
    ? DEFAULT_STAR_AVATAR
    : resolveStarCardAvatar(photoUrl)

  const shouldAnimate = animated && !reduceMotion

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ maxWidth: '100%', height: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
      className={`starprint-svg effect-${effect.toLowerCase()}`}
      role="img"
      aria-label="STARPRINT ngôi sao cá nhân"
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
          <stop offset="60%" stopColor="#ffd467" stopOpacity="0.12" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipId}>
          <path d={pentagonPath} />
        </clipPath>
        <radialGradient id={pentagonBgId} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#f4f7ff" />
          <stop offset="100%" stopColor="#e2e8f8" />
        </radialGradient>
      </defs>

      {/* Ambient celestial glow */}
      <circle cx={cx} cy={cy} r={outerR * 1.3} fill={`url(#${glowId})`} />

      {/* 5 wings forming the outer star body */}
      {wingPaths.map((d, i) => {
        const wingColor = i < completedWings ? palette[i % palette.length] ?? '#ffd467' : 'rgba(255,255,255,0.1)'
        return (
          <motion.path
            key={i}
            d={d}
            fill={wingColor}
            stroke="rgba(241, 201, 75, 0.4)"
            strokeWidth="1.2"
            initial={shouldAnimate ? { opacity: 0, scale: 0.85 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
          />
        )
      })}

      {/* Outer 5-pointed star golden outline with rounded tips */}
      <path
        d={starOutlinePath}
        fill="none"
        stroke="#ffd467"
        strokeWidth={outerStrokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Central pentagon background */}
      <path d={pentagonPath} fill={`url(#${pentagonBgId})`} />

      {/* Center avatar or mascot inside pentagon */}
      {resolvedPhotoUrl ? (
        <image
          href={resolvedPhotoUrl}
          x={cx - avatarSize / 2}
          y={pentagonYMid - avatarSize / 2}
          width={avatarSize}
          height={avatarSize}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
          onError={() => {
            setFailedUrl(photoUrl ?? DEFAULT_STAR_AVATAR)
          }}
        />
      ) : (
        <g clipPath={`url(#${clipId})`} opacity="0.65">
          <circle cx={cx} cy={pentagonYMid - 8} r={innerR * 0.22} fill="none" stroke="#636082" strokeWidth="2.5" />
          <path
            d={`M ${cx - innerR * 0.35} ${pentagonYMid + innerR * 0.3} A ${innerR * 0.35} ${innerR * 0.35} 0 0 1 ${cx + innerR * 0.35} ${pentagonYMid + innerR * 0.3}`}
            fill="none"
            stroke="#636082"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Central pentagon golden outline */}
      <path
        d={pentagonPath}
        fill="none"
        stroke="#ffd467"
        strokeWidth={pentagonStrokeWidth}
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  )
}
