import type { NavigateFunction } from 'react-router-dom'

/**
 * Universal Section Navigation Helper
 * Handles both intra-page smooth scrolling on Home and inter-page routing with anchor scrolling.
 */
export function navigateToSection(
  hash: string,
  pathname: string,
  navigate: NavigateFunction,
  onComplete?: () => void,
) {
  const cleanHash = hash.startsWith('#') ? hash : `#${hash}`
  const targetId = cleanHash.slice(1)

  const scrollToTarget = () => {
    const el = document.getElementById(targetId)
    if (el) {
      const isMobile = window.innerWidth <= 768
      const headerOffset = isMobile ? 68 : 80

      if (window.__lenis) {
        window.__lenis.scrollTo(el, { offset: -headerOffset, duration: 1.2 })
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }

  if (pathname === '/' && window.location.hash === cleanHash) {
    // Re-selecting the active anchor should still return to its current section.
    scrollToTarget()
  } else {
    // Keep React Router as the sole owner of browser history so Back/Forward
    // can replay the anchor and trigger AppShell's hash-scroll effect.
    navigate({ pathname: '/', hash: cleanHash })
  }

  onComplete?.()
}

/**
 * Cleanly navigate to Home and scroll to top, clearing any hash.
 */
export function navigateToHomeTop(
  pathname: string,
  navigate: NavigateFunction,
  onComplete?: () => void,
) {
  if (pathname === '/') {
    if (window.location.hash) {
      navigate('/')
    } else {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.2 })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  } else {
    navigate('/')
  }
  onComplete?.()
}
