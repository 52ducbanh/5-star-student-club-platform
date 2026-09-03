import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { SupportLevelConfig, SupportObjectState, Point2D } from './engine/support-types'
import {
  calculateIdleSway,
  calculatePendulumSwing,
  calculateTargetTrajectory,
  calculateFailureTrajectory,
  type VisualObjectTransform,
} from './engine/trajectories'
import { SwipeCutter } from './input/swipe-cutter'
import { Rope } from './render/Rope'
import { HangingObject } from './render/HangingObject'
import { Target } from './render/Target'
import { SwipeTrail } from './render/SwipeTrail'

export interface SupportSceneProps {
  level: SupportLevelConfig
  attachedRopes: string[]
  cutRopes: string[]
  objectState: SupportObjectState
  onCutRope: (ropeId: string, cutPoint: Point2D) => void
  isSolved: boolean
  isInvalid: boolean
  isResetting: boolean
}

export function SupportScene({
  level,
  attachedRopes,
  cutRopes,
  objectState,
  onCutRope,
  isSolved,
  isInvalid,
  isResetting,
}: SupportSceneProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Current visual transform of the star object
  const [objectTransform, setObjectTransform] = useState<VisualObjectTransform>({
    x: level.objectPos.x,
    y: level.objectPos.y,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  })

  // Recoil data for cut ropes
  const [recoilData, setRecoilData] = useState<
    Record<string, { point: Point2D; timestamp: number }>
  >({})

  // Swipe trail points
  const [trailPoints, setTrailPoints] = useState<Point2D[]>([])

  // Animation timing refs
  const stateStartTimestampRef = useRef<number>(performance.now())
  const lastStateRef = useRef<SupportObjectState>(objectState)
  const startPosRef = useRef<Point2D>({ ...level.objectPos })
  const lastCutAnchorRef = useRef<Point2D>({ x: 50, y: 15 })
  const initialSwingAngleRef = useRef<number>(0.35)
  const objectPosRef = useRef<Point2D>({ ...level.objectPos })

  // Detect prefers-reduced-motion
  const prefersReducedMotionRef = useRef<boolean>(false)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotionRef.current = mediaQuery.matches
    const listener = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches
    }
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  // Keep object position in sync with ref for collision / swipe checks
  useEffect(() => {
    objectPosRef.current = { x: objectTransform.x, y: objectTransform.y }
  }, [objectTransform.x, objectTransform.y])

  // Track state transitions to capture start positions and reset timestamps
  useEffect(() => {
    if (lastStateRef.current !== objectState) {
      stateStartTimestampRef.current = performance.now()
      startPosRef.current = { ...objectPosRef.current }
      lastStateRef.current = objectState

      // If swinging, determine remaining anchor
      if (objectState === 'SWINGING' && attachedRopes.length === 1) {
        const remainingRope = level.ropes.find((r) => r.ropeId === attachedRopes[0])
        if (remainingRope) {
          lastCutAnchorRef.current = { x: remainingRope.x1, y: remainingRope.y1 }
          // Direction of swing based on horizontal offset
          const dx = startPosRef.current.x - remainingRope.x1
          initialSwingAngleRef.current = dx >= 0 ? 0.38 : -0.38
        }
      }
    }
  }, [objectState, attachedRopes, level.ropes])

  // Reset positions when level changes or puzzle auto-resets
  useEffect(() => {
    if (isResetting) {
      setRecoilData({})
      setTrailPoints([])
      setObjectTransform({
        x: level.objectPos.x,
        y: level.objectPos.y,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      })
      startPosRef.current = { ...level.objectPos }
      objectPosRef.current = { ...level.objectPos }
    }
  }, [isResetting, level.objectPos])

  const attachedRopesRef = useRef(attachedRopes)
  useEffect(() => {
    attachedRopesRef.current = attachedRopes
  }, [attachedRopes])

  const levelRef = useRef(level)
  useEffect(() => {
    levelRef.current = level
  }, [level])

  const onCutRopeRef = useRef(onCutRope)
  useEffect(() => {
    onCutRopeRef.current = onCutRope
  }, [onCutRope])

  // Cut handler (both from swipe and tap)
  const handleCut = useCallback(
    (ropeId: string, cutPoint: Point2D) => {
      setRecoilData((prev) => ({
        ...prev,
        [ropeId]: { point: cutPoint, timestamp: performance.now() },
      }))
      onCutRopeRef.current(ropeId, cutPoint)
    },
    [],
  )

  // Lazy swipe cutter accessor
  const cutterRef = useRef<SwipeCutter | null>(null)
  const getCutter = useCallback(() => {
    if (!cutterRef.current) {
      cutterRef.current = new SwipeCutter({
        getSvgElement: () => svgRef.current,
        getActiveRopes: () =>
          levelRef.current.ropes.filter((r) => attachedRopesRef.current.includes(r.ropeId)),
        getObjectPosition: () => objectPosRef.current,
        onCutRope: (ropeId, cutPoint) => handleCut(ropeId, cutPoint),
        onTrailUpdate: (pts) => setTrailPoints([...pts]),
      })
    }
    return cutterRef.current
  }, [handleCut])

  // Continuous rAF animation loop for deterministic motion
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0)

  useEffect(() => {
    let rafId: number

    const tick = (now: number) => {
      setCurrentTimestamp(now)
      const elapsedInState = now - stateStartTimestampRef.current
      const reduceMotion = prefersReducedMotionRef.current

      let nextTransform: VisualObjectTransform

      switch (objectState) {
        case 'HANGING':
          nextTransform = calculateIdleSway(now, level.objectPos, reduceMotion)
          break

        case 'SWINGING':
          nextTransform = calculatePendulumSwing(
            elapsedInState,
            lastCutAnchorRef.current,
            startPosRef.current,
            initialSwingAngleRef.current,
            reduceMotion,
          )
          break

        case 'TARGET':
          nextTransform = calculateTargetTrajectory(
            elapsedInState / 750,
            startPosRef.current,
            level.targetPos,
          )
          break

        case 'FAILED':
          nextTransform = calculateFailureTrajectory(elapsedInState / 600, startPosRef.current)
          break

        case 'RESETTING':
          nextTransform = {
            x: level.objectPos.x,
            y: level.objectPos.y,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          }
          break

        case 'FALLING':
        default:
          nextTransform = calculateTargetTrajectory(
            elapsedInState / 750,
            startPosRef.current,
            level.targetPos,
          )
          break
      }

      setObjectTransform(nextTransform)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [objectState, level.objectPos, level.targetPos])

  // Active object position vector for ropes
  const currentObjPos = useMemo<Point2D>(
    () => ({ x: objectTransform.x, y: objectTransform.y }),
    [objectTransform.x, objectTransform.y],
  )

  return (
    <div className="support-stage-container" style={{ touchAction: 'none' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="support-svg-stage"
        aria-label="Khu vực cắt dây hỗ trợ đưa ngôi sao về đích"
        onPointerDown={(e) => getCutter().handlePointerDown(e)}
        onPointerMove={(e) => getCutter().handlePointerMove(e)}
        onPointerUp={(e) => getCutter().handlePointerUp(e)}
        onPointerCancel={(e) => getCutter().handlePointerCancel(e)}
      >
        <defs>
          <radialGradient id="target-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5fe3a1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#5fe3a1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="object-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd467" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ff9900" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Target Portal at Bottom */}
        <Target targetPos={level.targetPos} isSolved={isSolved} />

        {/* Ropes */}
        {level.ropes.map((rope) => {
          const isCut = cutRopes.includes(rope.ropeId)
          const recoil = recoilData[rope.ropeId]

          return (
            <Rope
              key={rope.ropeId}
              rope={rope}
              isCut={isCut}
              cutPoint={recoil ? recoil.point : null}
              cutTimestamp={recoil ? recoil.timestamp : null}
              currentTimestamp={currentTimestamp}
              objectPos={currentObjPos}
              onTapCut={handleCut}
            />
          )
        })}

        {/* Hanging Star Object */}
        <HangingObject
          transform={objectTransform}
          isSolved={isSolved}
          isInvalid={isInvalid}
        />

        {/* Swipe Slash Trail */}
        <SwipeTrail points={trailPoints} />
      </svg>

      {/* Visual Feedback Overlays */}
      {isInvalid && (
        <div className="support-status-overlay invalid-overlay" aria-live="polite">
          <span>Sai trình tự · Đang cân bằng lại...</span>
        </div>
      )}

      {isSolved && (
        <div className="support-status-overlay solved-overlay" aria-live="polite">
          <span>Thành công! Đưa sao vào cổng 🌟</span>
        </div>
      )}
    </div>
  )
}
