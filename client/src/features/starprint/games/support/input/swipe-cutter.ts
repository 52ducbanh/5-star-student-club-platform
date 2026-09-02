import type { Point2D, SupportRopeConfig } from '../engine/support-types'
import { swipeHitsRope } from '../engine/geometry'

export interface SwipeCutterOptions {
  getSvgElement: () => SVGSVGElement | null
  getActiveRopes: () => SupportRopeConfig[]
  getObjectPosition: () => Point2D
  onCutRope: (ropeId: string, cutPoint: Point2D) => void
  onTrailUpdate?: (points: Point2D[]) => void
}

export class SwipeCutter {
  private options: SwipeCutterOptions
  private activePointerId: number | null = null
  private points: Point2D[] = []
  private maxTrailPoints = 8
  private isSwiping = false

  constructor(options: SwipeCutterOptions) {
    this.options = options
  }

  public getPoints(): Point2D[] {
    return this.points
  }

  /**
   * Converts viewport client coordinates (clientX, clientY) to SVG viewBox coordinates (0..100).
   */
  public clientToSvg(clientX: number, clientY: number): Point2D | null {
    const svg = this.options.getSvgElement()
    if (!svg) return null

    const ctm = svg.getScreenCTM()
    if (!ctm) return null

    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const transformed = pt.matrixTransform(ctm.inverse())
    return { x: transformed.x, y: transformed.y }
  }

  public handlePointerDown = (e: React.PointerEvent<SVGSVGElement>): void => {
    if (this.activePointerId !== null) return

    const pt = this.clientToSvg(e.clientX, e.clientY)
    if (!pt) return

    this.activePointerId = e.pointerId
    this.isSwiping = true
    this.points = [pt]

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Ignored if capture unsupported
    }

    this.options.onTrailUpdate?.(this.points)
    // Instant tap check on pointer down
    this.checkRopeIntersections(pt, pt, 6.5)
  }

  public handlePointerMove = (e: React.PointerEvent<SVGSVGElement>): void => {
    if (!this.isSwiping || this.activePointerId !== e.pointerId) return

    const pt = this.clientToSvg(e.clientX, e.clientY)
    if (!pt) return

    const prevPt = this.points[this.points.length - 1]
    this.points.push(pt)
    if (this.points.length > this.maxTrailPoints) {
      this.points.shift()
    }

    this.options.onTrailUpdate?.(this.points)

    // Check intersection with active ropes
    if (prevPt) {
      this.checkRopeIntersections(prevPt, pt, 5.5)
    }
  }

  public handlePointerUp = (e: React.PointerEvent<SVGSVGElement>): void => {
    if (this.activePointerId === e.pointerId) {
      const pt = this.clientToSvg(e.clientX, e.clientY)
      if (pt) {
        this.checkRopeIntersections(pt, pt, 6.5)
      }
      this.endSwipe(e.currentTarget, e.pointerId)
    }
  }

  public handlePointerCancel = (e: React.PointerEvent<SVGSVGElement>): void => {
    if (this.activePointerId === e.pointerId) {
      this.endSwipe(e.currentTarget, e.pointerId)
    }
  }

  private endSwipe(target: SVGSVGElement | null, pointerId: number): void {
    this.isSwiping = false
    this.activePointerId = null
    this.points = []
    this.options.onTrailUpdate?.([])

    if (target) {
      try {
        target.releasePointerCapture(pointerId)
      } catch {
        // Ignored
      }
    }
  }

  private checkRopeIntersections(s1: Point2D, s2: Point2D, tolerance = 5.5): void {
    const activeRopes = this.options.getActiveRopes()
    const objPos = this.options.getObjectPosition()

    for (const rope of activeRopes) {
      const r1 = { x: rope.x1, y: rope.y1 }
      const r2 = { x: objPos.x, y: objPos.y }

      const { hit, point } = swipeHitsRope(s1, s2, r1, r2, tolerance)
      if (hit) {
        this.options.onCutRope(rope.ropeId, point)
      }
    }
  }
}
