import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { siteConfig } from '../../config/site'
import { Header } from './Header'
import { Footer } from './Footer'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const initialRoute = useRef(true)

  // Initialize Lenis for buttery smooth inertial scrolling (cuộn chậm & êm)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.5,
    })

    window.__lenis = lenis

    let rafId: number

    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      window.__lenis = undefined
    }
  }, [])

  // Update document title on route change
  const prevTitle = useRef('')
  useEffect(() => {
    if (!location.hash) {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' })
      }
    }

    const routeTitles: Record<string, string> = {
      '/': `${siteConfig.shortName} | Câu lạc bộ Sinh viên 5 Tốt · UET`,
      '/hanh-trinh-5-tot': `Hành trình 5 Tốt | ${siteConfig.shortName}`,
      '/hoat-dong': `Hoạt động & Sự kiện | ${siteConfig.shortName}`,
    }
    const knownRoutes = ['/', '/hanh-trinh-5-tot', '/hoat-dong']
    const newTitle =
      routeTitles[location.pathname] ||
      (!knownRoutes.includes(location.pathname)
        ? `Không tìm thấy trang | ${siteConfig.shortName}`
        : `${siteConfig.name}`)

    if (newTitle !== prevTitle.current) {
      document.title = newTitle
      prevTitle.current = newTitle
    }

    const routeDescriptions: Record<string, string> = {
      '/': 'Không gian số chính thức của CLB Sinh viên 5 Tốt - Trường Đại học Công nghệ (UET - ĐHQGHN).',
      '/hanh-trinh-5-tot': 'Khám phá bản đồ thiên hà 5 tiêu chí Sinh viên 5 Tốt và theo dõi tiến độ rèn luyện cá nhân.',
      '/hoat-dong': 'Tổng hợp tin tức, sự kiện và các buổi workshop nổi bật của CLB Sinh viên 5 Tốt UET.',
    }
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', routeDescriptions[location.pathname] || siteConfig.description)
    }

    if (initialRoute.current) {
      initialRoute.current = false
      return
    }

    const focusTimer = window.setTimeout(() => {
      document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true })
    }, 30)

    return () => window.clearTimeout(focusTimer)
  }, [location.pathname, location.hash, isHome])

  // Handle anchor scroll: when URL has a hash, smooth-scroll to that section
  useEffect(() => {
    const hash = location.hash // e.g. "#gioi-thieu"
    if (!hash) return

    const scrollTimer = window.setTimeout(() => {
      const el = document.querySelector(hash)
      if (el) {
        if (window.__lenis) {
          window.__lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.5 })
        } else {
          const headerOffset = 80
          const top = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - headerOffset
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }
    }, 150)

    return () => window.clearTimeout(scrollTimer)
  }, [location.hash])

  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">
        Chuyển đến nội dung chính
      </a>
      <Header />
      {children}
      <Footer />
    </div>
  )
}
