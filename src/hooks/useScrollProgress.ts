import { useEffect, useState } from 'react'

/**
 * Tracks current scroll progress (0 to 1) and scroll direction.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentScroll = window.scrollY
      setScrollY(currentScroll)
      if (totalHeight > 0) {
        setProgress(Math.min(1, Math.max(0, currentScroll / totalHeight)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { progress, scrollY }
}
