import type { Point2D } from './support-types'

export interface VisualObjectTransform {
  x: number
  y: number
  rotation: number // degrees
  scaleX: number
  scaleY: number
}

/**
 * Calculates subtle idle sway for the hanging object when in HANGING state.
 * Smooth harmonic motion. Reduced if prefers-reduced-motion is true.
 */
export function calculateIdleSway(
  timeMs: number,
  basePos: Point2D,
  reduceMotion = false,
): VisualObjectTransform {
  if (reduceMotion) {
    return {
      x: basePos.x,
      y: basePos.y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    }
  }

  const t = timeMs * 0.0018
  const swayX = 1.4 * Math.sin(t)
  const swayY = 0.4 * Math.cos(t * 2)
  const rotation = 3.5 * Math.sin(t) // 3.5 degrees max sway

  return {
    x: basePos.x + swayX,
    y: basePos.y + swayY,
    rotation,
    scaleX: 1,
    scaleY: 1,
  }
}

/**
 * Calculates deterministic pendulum swing around a remaining anchor when 1 rope is left.
 */
export function calculatePendulumSwing(
  elapsedSinceCutMs: number,
  anchor: Point2D,
  basePos: Point2D,
  initialAngleRad: number,
  reduceMotion = false,
): VisualObjectTransform {
  const dx = basePos.x - anchor.x
  const dy = basePos.y - anchor.y
  const ropeLength = Math.max(10, Math.hypot(dx, dy))

  if (reduceMotion) {
    return {
      x: anchor.x + ropeLength * Math.sin(0),
      y: anchor.y + ropeLength * Math.cos(0),
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    }
  }

  const t = elapsedSinceCutMs * 0.001
  const damping = 0.75
  const omega = 4.2 // rad/s
  const theta = initialAngleRad * Math.exp(-damping * t) * Math.cos(omega * t)

  const x = anchor.x + ropeLength * Math.sin(theta)
  const y = anchor.y + ropeLength * Math.cos(theta)
  const rotation = theta * (180 / Math.PI)

  return {
    x,
    y,
    rotation,
    scaleX: 1,
    scaleY: 1,
  }
}

/**
 * Calculates smooth deterministic flight to target upon winning (TARGET state).
 * tRatio is clamped between 0 and 1 over ~750ms.
 */
export function calculateTargetTrajectory(
  tRatio: number,
  startPos: Point2D,
  targetPos: Point2D,
): VisualObjectTransform {
  const clampedT = Math.max(0, Math.min(1, tRatio))
  // Ease-out cubic with gentle overshoot
  const ease = 1 - Math.pow(1 - clampedT, 3)

  const x = startPos.x + (targetPos.x - startPos.x) * ease
  const y = startPos.y + (targetPos.y - startPos.y) * ease

  // Soft squash/bounce upon reaching portal
  let scaleX = 1
  let scaleY = 1
  if (clampedT > 0.8) {
    const bounceT = (clampedT - 0.8) / 0.2
    scaleX = 1 + 0.2 * Math.sin(bounceT * Math.PI)
    scaleY = 1 - 0.15 * Math.sin(bounceT * Math.PI)
  }

  return {
    x,
    y,
    rotation: (1 - clampedT) * 10,
    scaleX,
    scaleY,
  }
}

/**
 * Calculates failure animation (jolt / tilt before auto-reset).
 */
export function calculateFailureTrajectory(
  tRatio: number,
  startPos: Point2D,
): VisualObjectTransform {
  const clampedT = Math.max(0, Math.min(1, tRatio))
  // Wobble / shake
  const shakeX = Math.sin(clampedT * Math.PI * 6) * 4 * (1 - clampedT)
  const dropY = Math.min(12, 20 * clampedT * clampedT)
  const rotation = Math.sin(clampedT * Math.PI * 5) * 18 * (1 - clampedT)

  return {
    x: startPos.x + shakeX,
    y: startPos.y + dropY,
    rotation,
    scaleX: 1,
    scaleY: 1,
  }
}

/**
 * Calculates SVG quadratic bezier curve path for a taut/hanging rope.
 */
export function calculateRopePath(
  anchor: Point2D,
  objPos: Point2D,
  sag = 2.0,
): string {
  const cpx = (anchor.x + objPos.x) / 2
  const cpy = (anchor.y + objPos.y) / 2 + sag
  return `M ${anchor.x} ${anchor.y} Q ${cpx} ${cpy} ${objPos.x} ${objPos.y}`
}

/**
 * Calculates recoiling stub paths when a rope is cut.
 * Returns upper and lower stub path strings and opacity.
 */
export function calculateRopeRecoil(
  anchor: Point2D,
  cutPoint: Point2D,
  objPos: Point2D,
  elapsedSinceCutMs: number,
  durationMs = 200,
): { upperPath: string; lowerPath: string; opacity: number } | null {
  if (elapsedSinceCutMs >= durationMs) return null

  const progress = elapsedSinceCutMs / durationMs
  const opacity = 1 - progress

  // Upper stub shrinks towards anchor
  const upperCurX = cutPoint.x + (anchor.x - cutPoint.x) * progress * 0.6
  const upperCurY = cutPoint.y + (anchor.y - cutPoint.y) * progress * 0.6
  const upperPath = `M ${anchor.x} ${anchor.y} L ${upperCurX} ${upperCurY}`

  // Lower stub shrinks towards object
  const lowerCurX = cutPoint.x + (objPos.x - cutPoint.x) * progress * 0.6
  const lowerCurY = cutPoint.y + (objPos.y - cutPoint.y) * progress * 0.6
  const lowerPath = `M ${lowerCurX} ${lowerCurY} L ${objPos.x} ${objPos.y}`

  return { upperPath, lowerPath, opacity }
}
