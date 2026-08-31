import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Desktop-only cursor-following radial glow.
 * Uses requestAnimationFrame for zero-lag tracking.
 * Does not render on touch/mobile devices.
 */
export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const rafId = useRef<number>(0)
  const pos = useRef({ x: -9999, y: -9999 })
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    // Skip on touch devices and when reduced motion is on
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (reducedMotion) return

    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      if (el) {
        el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      }
      rafId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return <div ref={ref} className="mouse-glow" aria-hidden="true" />
}
