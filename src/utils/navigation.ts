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

  if (pathname === '/') {
    // Already on Home: smooth scroll to element without page reload
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

      // Update URL hash without polluting history excessively
      window.history.pushState(null, '', cleanHash)
    }
  } else {
    // On sub-page: navigate to Home with hash
    navigate(`/${cleanHash}`)
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
      window.history.pushState(null, '', '/')
    }
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.2 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } else {
    navigate('/')
  }
  onComplete?.()
}
