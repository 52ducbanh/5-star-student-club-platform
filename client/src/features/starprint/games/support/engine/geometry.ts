import type { Point2D } from './support-types'

/**
 * Robust 2D line segment intersection (CCW / orientation method)
 */
export function lineSegmentsIntersect(
  a: Point2D,
  b: Point2D,
  c: Point2D,
  d: Point2D,
): boolean {
  const ccw = (p1: Point2D, p2: Point2D, p3: Point2D) => {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x)
  }
  return (
    ccw(a, c, d) !== ccw(b, c, d) &&
    ccw(a, b, c) !== ccw(a, b, d)
  )
}

/**
 * Calculates intersection point of two line segments, or null if they do not intersect.
 */
export function getLineIntersection(
  a: Point2D,
  b: Point2D,
  c: Point2D,
  d: Point2D,
): Point2D | null {
  const det = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x)
  if (Math.abs(det) < 1e-8) return null

  const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det
  const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det

  if (lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1) {
    return {
      x: a.x + lambda * (b.x - a.x),
      y: a.y + lambda * (b.y - a.y),
    }
  }
  return null
}

/**
 * Distance from point P to line segment AB
 */
export function pointToSegmentDistance(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const l2 = dx * dx + dy * dy
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/**
 * Checks if a swipe segment (s1 -> s2) intersects or comes within tolerance of a rope segment (r1 -> r2).
 * Tolerance is in SVG coordinate units (0..100 space, e.g. tolerance = 4.0 ~ 13-16px on a 320-400px stage).
 */
export function swipeHitsRope(
  s1: Point2D,
  s2: Point2D,
  r1: Point2D,
  r2: Point2D,
  tolerance = 4.0,
): { hit: boolean; point: Point2D } {
  // 1. Direct segment intersection
  const directPt = getLineIntersection(s1, s2, r1, r2)
  if (directPt) return { hit: true, point: directPt }

  // 2. Proximity check
  const dist1 = pointToSegmentDistance(s1, r1, r2)
  const dist2 = pointToSegmentDistance(s2, r1, r2)
  const dist3 = pointToSegmentDistance(r1, s1, s2)
  const dist4 = pointToSegmentDistance(r2, s1, s2)
  const minDist = Math.min(dist1, dist2, dist3, dist4)

  if (minDist <= tolerance) {
    return {
      hit: true,
      point: {
        x: (s1.x + s2.x + r1.x + r2.x) / 4,
        y: (s1.y + s2.y + r1.y + r2.y) / 4,
      },
    }
  }

  return { hit: false, point: { x: 0, y: 0 } }
}
