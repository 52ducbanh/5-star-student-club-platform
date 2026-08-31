import { useEffect, useState } from 'react'

export interface MousePosition {
  x: number // pixel x
  y: number // pixel y
  normalizedX: number // -1 (left) to 1 (right)
  normalizedY: number // -1 (top) to 1 (bottom)
}

/**
 * Tracks mouse position smoothly for 3D rigs, cursor spotlights, and parallax effects.
 */
export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  })

  useEffect(() => {
    let animationFrameId: number

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const width = window.innerWidth
      const height = window.innerHeight

      animationFrameId = requestAnimationFrame(() => {
        setMousePosition({
          x: clientX,
          y: clientY,
          normalizedX: (clientX / width) * 2 - 1,
          normalizedY: -(clientY / height) * 2 + 1,
        })
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return mousePosition
}
