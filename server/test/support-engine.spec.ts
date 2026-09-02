import { SupportEngine } from '../../client/src/features/starprint/games/support/engine/support-engine'
import {
  lineSegmentsIntersect,
  getLineIntersection,
  pointToSegmentDistance,
  swipeHitsRope,
} from '../../client/src/features/starprint/games/support/engine/geometry'
import {
  calculateIdleSway,
  calculatePendulumSwing,
  calculateTargetTrajectory,
  calculateRopeRecoil,
} from '../../client/src/features/starprint/games/support/engine/trajectories'
import { SUPPORT_LEVELS } from '../../client/src/features/starprint/games/support/levels/support-levels'

describe('SUPPORT Mini-Game Engine & Geometry Tests', () => {
  describe('Geometry - Line Intersection & Proximity', () => {
    it('detects intersecting line segments', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 10, y: 10 }
      const c = { x: 0, y: 10 }
      const d = { x: 10, y: 0 }
      expect(lineSegmentsIntersect(a, b, c, d)).toBe(true)

      const pt = getLineIntersection(a, b, c, d)
      expect(pt).not.toBeNull()
      expect(pt?.x).toBeCloseTo(5)
      expect(pt?.y).toBeCloseTo(5)
    })

    it('returns false for parallel non-intersecting segments', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 10, y: 0 }
      const c = { x: 0, y: 5 }
      const d = { x: 10, y: 5 }
      expect(lineSegmentsIntersect(a, b, c, d)).toBe(false)
      expect(getLineIntersection(a, b, c, d)).toBeNull()
    })

    it('calculates point to segment distance correctly', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 10, y: 0 }
      const p = { x: 5, y: 3 }
      expect(pointToSegmentDistance(p, a, b)).toBeCloseTo(3)

      const pBefore = { x: -4, y: 0 }
      expect(pointToSegmentDistance(pBefore, a, b)).toBeCloseTo(4)
    })

    it('detects swipe hitting rope within tolerance', () => {
      // Rope from (25, 15) to (48, 33)
      const r1 = { x: 25, y: 15 }
      const r2 = { x: 48, y: 33 }

      // Swipe crossing rope
      const s1 = { x: 20, y: 30 }
      const s2 = { x: 40, y: 10 }
      const hitResult = swipeHitsRope(s1, s2, r1, r2, 4.0)
      expect(hitResult.hit).toBe(true)

      // Swipe missing rope far away
      const miss1 = { x: 80, y: 80 }
      const miss2 = { x: 90, y: 90 }
      const missResult = swipeHitsRope(miss1, miss2, r1, r2, 4.0)
      expect(missResult.hit).toBe(false)
    })
  })

  describe('SupportEngine - State Machine & Validation', () => {
    it('initializes level 1 in HANGING state with all attached ropes', () => {
      const level = SUPPORT_LEVELS[0]
      const engine = new SupportEngine(level, 0, 1000)

      const state = engine.getState()
      expect(state.objectState).toBe('HANGING')
      expect(state.attachedRopes).toEqual(['p1-rope-a', 'p1-rope-b', 'p1-rope-c'])
      expect(state.cutRopes).toEqual([])
      expect(state.completed).toBe(false)
      expect(state.resetCount).toBe(0)
    })

    it('executes valid cut sequence to completion for Level 1', () => {
      const level = SUPPORT_LEVELS[0] // valid: ['p1-rope-a', 'p1-rope-b']
      const engine = new SupportEngine(level, 0, 1000)

      // Cut 1: rope-a (valid prefix)
      const res1 = engine.cutRope('p1-rope-a', 1500)
      expect(res1.success).toBe(true)
      expect(res1.validation.status).toBe('VALID_PREFIX')
      expect(res1.nextState).toBe('HANGING') // 2 ropes still attached

      // Cut 2: rope-b (complete sequence!)
      const res2 = engine.cutRope('p1-rope-b', 2500)
      expect(res2.success).toBe(true)
      expect(res2.validation.status).toBe('COMPLETE')
      expect(res2.nextState).toBe('TARGET')

      const finalState = engine.getState()
      expect(finalState.completed).toBe(true)
      expect(finalState.events).toHaveLength(3) // cut, cut, completed
      expect(finalState.events[0]).toEqual({ type: 'rope-cut', atMs: 1500, ropeId: 'p1-rope-a' })
      expect(finalState.events[1]).toEqual({ type: 'rope-cut', atMs: 2500, ropeId: 'p1-rope-b' })
      expect(finalState.events[2]).toEqual({ type: 'completed', atMs: 2500 })
    })

    it('handles invalid cut and auto-reset correctly', () => {
      const level = SUPPORT_LEVELS[0] // valid: ['p1-rope-a', 'p1-rope-b']
      const engine = new SupportEngine(level, 0, 1000)

      // Cut wrong rope first: p1-rope-c
      const res1 = engine.cutRope('p1-rope-c', 1200)
      expect(res1.success).toBe(true)
      expect(res1.validation.status).toBe('INVALID')
      expect(res1.nextState).toBe('FAILED')

      const failedState = engine.getState()
      expect(failedState.events.some((e) => e.type === 'invalid-state')).toBe(true)

      // Trigger reset
      const resetRes = engine.triggerReset(1800)
      expect(resetRes.eventEmitted.type).toBe('auto-reset')

      const resetState = engine.getState()
      expect(resetState.objectState).toBe('HANGING')
      expect(resetState.attachedRopes).toEqual(['p1-rope-a', 'p1-rope-b', 'p1-rope-c'])
      expect(resetState.cutRopes).toEqual([])
      expect(resetState.resetCount).toBe(1)
      expect(resetState.completed).toBe(false)

      // Player recovers and does correct sequence
      engine.cutRope('p1-rope-a', 2200)
      const resComplete = engine.cutRope('p1-rope-b', 3000)
      expect(resComplete.validation.status).toBe('COMPLETE')
      expect(engine.getState().completed).toBe(true)
    })

    it('enforces idempotency for cut operations', () => {
      const level = SUPPORT_LEVELS[0]
      const engine = new SupportEngine(level, 0, 1000)

      engine.cutRope('p1-rope-a', 1500)
      // Attempt cutting the same rope again
      const dupRes = engine.cutRope('p1-rope-a', 1600)
      expect(dupRes.success).toBe(false)
    })

    it('supports multiple valid sequences for Level 2', () => {
      const level = SUPPORT_LEVELS[1] // valid: ['p2-rope-x', 'p2-rope-z'] OR ['p2-rope-z', 'p2-rope-x']

      // Test ordering 1: X then Z
      const engine1 = new SupportEngine(level, 1, 1000)
      engine1.cutRope('p2-rope-x', 1200)
      const res1 = engine1.cutRope('p2-rope-z', 1800)
      expect(res1.validation.status).toBe('COMPLETE')
      expect(engine1.getState().completed).toBe(true)

      // Test ordering 2: Z then X
      const engine2 = new SupportEngine(level, 1, 1000)
      engine2.cutRope('p2-rope-z', 1200)
      const res2 = engine2.cutRope('p2-rope-x', 1800)
      expect(res2.validation.status).toBe('COMPLETE')
      expect(engine2.getState().completed).toBe(true)
    })

    it('formats puzzle result correctly for contracts', () => {
      const level = SUPPORT_LEVELS[0]
      const engine = new SupportEngine(level, 0, 1000)
      engine.cutRope('p1-rope-a', 1500)
      engine.cutRope('p1-rope-b', 2500)

      const result = engine.getPuzzleResult(2500)
      expect(result.puzzleId).toBe('support-puzzle-1-v2')
      expect(result.durationMs).toBe(2500)
      expect(result.completed).toBe(true)
      expect(result.timedOut).toBe(false)
      expect(result.events.length).toBeGreaterThan(0)
    })
  })

  describe('Deterministic Trajectories', () => {
    it('produces deterministic idle sway', () => {
      const basePos = { x: 50, y: 35 }
      const t1 = calculateIdleSway(1000, basePos, false)
      const t2 = calculateIdleSway(1000, basePos, false)
      expect(t1).toEqual(t2)

      const reduced = calculateIdleSway(1000, basePos, true)
      expect(reduced.x).toBe(50)
      expect(reduced.y).toBe(35)
      expect(reduced.rotation).toBe(0)
    })

    it('produces deterministic pendulum swing', () => {
      const anchor = { x: 25, y: 15 }
      const basePos = { x: 50, y: 35 }
      const s1 = calculatePendulumSwing(500, anchor, basePos, 0.35, false)
      const s2 = calculatePendulumSwing(500, anchor, basePos, 0.35, false)
      expect(s1).toEqual(s2)
    })

    it('produces target trajectory with smooth landing', () => {
      const start = { x: 50, y: 35 }
      const target = { x: 50, y: 80 }
      const initial = calculateTargetTrajectory(0, start, target)
      expect(initial.x).toBe(50)
      expect(initial.y).toBe(35)

      const final = calculateTargetTrajectory(1, start, target)
      expect(final.x).toBe(50)
      expect(final.y).toBe(80)
    })

    it('generates rope recoil and fades over time', () => {
      const anchor = { x: 25, y: 15 }
      const cutPt = { x: 35, y: 25 }
      const objPos = { x: 50, y: 35 }

      const earlyRecoil = calculateRopeRecoil(anchor, cutPt, objPos, 50, 200)
      expect(earlyRecoil).not.toBeNull()
      expect(earlyRecoil?.opacity).toBeCloseTo(0.75)

      const lateRecoil = calculateRopeRecoil(anchor, cutPt, objPos, 250, 200)
      expect(lateRecoil).toBeNull()
    })
  })
})
