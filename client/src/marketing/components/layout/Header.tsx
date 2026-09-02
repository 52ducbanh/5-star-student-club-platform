import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
} from 'lucide-react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  siteConfig,
  aboutNavigation,
  primaryNavigation,
  exploreNavigation,
  headerCta,
} from '@/config/site'
import { useLoading } from '@/app/providers/LoadingProvider'
import { navigateToSection, navigateToHomeTop } from '@/shared/utils/navigation'

export function Header() {
  const { isExiting, isLoaded } = useLoading()
  const [menuOpen, setMenuOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const mobileBtnRef = useRef<HTMLButtonElement>(null)
  const exploreBtnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()

  const isRevealed = isExiting || isLoaded || reduceMotion
  const isHome = location.pathname === '/'

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false)
    setExploreOpen(false)
  }, [location.pathname])

  // Lightweight IntersectionObserver Section Spy on Home (Visual only, NO history pushing)
  useEffect(() => {
    if (!isHome) {
      setActiveSection(null)
      return
    }

    const sectionIds = ['gioi-thieu', 'hanh-trinh', 'hoat-dong-noi-bat', 'faq', 'lien-he']
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`)
          }
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0,
      },
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [isHome])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (exploreOpen) {
          setExploreOpen(false)
          exploreBtnRef.current?.focus()
        }
        if (menuOpen) {
          setMenuOpen(false)
          mobileBtnRef.current?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [exploreOpen, menuOpen])

  // Handle click outside explore dropdown
  useEffect(() => {
    if (!exploreOpen) return

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        exploreBtnRef.current &&
        !exploreBtnRef.current.contains(target)
      ) {
        setExploreOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [exploreOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  /** Smart anchor navigation helper */
  const handleAnchorClick = useCallback(
    (hash: string, e?: React.MouseEvent) => {
      if (e) e.preventDefault()
      setExploreOpen(false)
      setMenuOpen(false)
      navigateToSection(hash, location.pathname, navigate)
    },
    [location.pathname, navigate],
  )

  /** Click logo: smooth scroll to top and clear hash */
  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setExploreOpen(false)
      setMenuOpen(false)
      navigateToHomeTop(location.pathname, navigate)
    },
    [location.pathname, navigate],
  )

  // Active status states
  const isAboutSectionActive = isHome && activeSection === '#gioi-thieu'
  const isExploreSectionActive = isHome && exploreNavigation.some((item) => item.hash === activeSection)

  return (
    <motion.header
      className="site-header site-header--glass"
      role="banner"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="site-header__inner">
        {/* Brand / Logo (Acts as Home top) */}
        <NavLink
          to="/"
          onClick={handleLogoClick}
          className="brand-mark"
          aria-label={`Về đầu trang chủ ${siteConfig.shortName}`}
        >
          {siteConfig.logoSrc ? (
            <span className="brand-mark__icon brand-mark__icon--image">
              <img src={siteConfig.logoSrc} alt="" />
            </span>
          ) : (
            <span className="brand-mark__icon" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M5 0L6.12 3.38L9.76 3.09L7.18 5.38L8.09 9.02L5 7L1.91 9.02L2.82 5.38L0.24 3.09L3.88 3.38L5 0Z" />
              </svg>
              <strong>5SS</strong>
            </span>
          )}
          <span className="brand-mark__text">
            <strong>{siteConfig.shortName}</strong>
            <small>Sinh viên 5 Tốt</small>
          </span>
        </NavLink>

        {/* Desktop Navigation (Giới thiệu + Primary Routes + Explore Dropdown) */}
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {/* 1. Giới thiệu (Top-level anchor to #gioi-thieu) */}
          <a
            href={aboutNavigation.href}
            className={`nav-link${isAboutSectionActive ? ' is-active' : ''}`}
            onClick={(e) => handleAnchorClick(aboutNavigation.hash, e)}
          >
            {aboutNavigation.label}
          </a>

          {/* 2. Primary Page-level routes: Hành trình 5 Tốt, Hoạt động */}
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          {/* 3. Explore Dropdown for Home secondary sections (FAQ, Liên hệ) */}
          <div className="explore-dropdown-wrapper">
            <button
              ref={exploreBtnRef}
              type="button"
              className={`explore-trigger${isExploreSectionActive ? ' is-section-active' : ''}`}
              aria-expanded={exploreOpen}
              aria-controls="explore-dropdown-menu"
              onClick={() => setExploreOpen((v) => !v)}
            >
              <span>Khám phá</span>
              <ChevronDown size={13} className="explore-chevron" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {exploreOpen && (
                <motion.div
                  ref={dropdownRef}
                  id="explore-dropdown-menu"
                  className="explore-dropdown-menu"
                  aria-label="Khám phá các mục thông tin 5SS"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="explore-dropdown-header" aria-hidden="true">
                    Khám phá 5SS UET
                  </div>

                  {exploreNavigation.map((item) => {
                    const isItemActive = isHome && activeSection === item.hash
                    const IconComponent = item.hash === '#faq' ? HelpCircle : MessageCircle

                    return (
                      <button
                        key={item.hash}
                        type="button"
                        className={`explore-dropdown-item${isItemActive ? ' is-active' : ''}`}
                        onClick={(e) => handleAnchorClick(item.hash, e)}
                      >
                        <span className="explore-dropdown-item__icon" aria-hidden="true">
                          <IconComponent size={16} />
                        </span>
                        <span className="explore-dropdown-item__content">
                          <span className="explore-dropdown-item__title">{item.label}</span>
                          <span className="explore-dropdown-item__desc">{item.description}</span>
                        </span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Header Action CTA + Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="/#lien-he"
            className="nav-cta"
            aria-label="Liên hệ"
            onClick={(e) => handleAnchorClick('#lien-he', e)}
          >
            Liên hệ
            <ArrowRight size={13} aria-hidden="true" />
          </a>

          <button
            ref={mobileBtnRef}
            className="mobile-menu-btn"
            type="button"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav-panel"
            aria-label="Điều hướng trên di động"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="mobile-nav-panel__inner">
              {/* 1. Giới thiệu (Top-level anchor) */}
              <a
                href={aboutNavigation.href}
                className={`mobile-nav-link${isAboutSectionActive ? ' is-active' : ''}`}
                onClick={(e) => handleAnchorClick(aboutNavigation.hash, e)}
              >
                {aboutNavigation.label}
              </a>

              {/* 2. Primary Routes */}
              {primaryNavigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => `mobile-nav-link${isActive ? ' is-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}

              {/* 3. Mobile Explore Group (FAQ, Liên hệ) */}
              <div className="mobile-explore-group">
                <div className="mobile-explore-title">Khám phá 5SS</div>
                {exploreNavigation.map((item) => (
                  <button
                    key={item.hash}
                    type="button"
                    className={`mobile-explore-sublink${isHome && activeSection === item.hash ? ' is-active' : ''}`}
                    onClick={(e) => handleAnchorClick(item.hash, e)}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* 4. Mobile CTA */}
              {headerCta.isExternal && headerCta.href ? (
                <a
                  href={headerCta.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--primary mobile-nav-cta"
                  onClick={() => setMenuOpen(false)}
                >
                  {headerCta.label}
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary mobile-nav-cta"
                  onClick={(e) => handleAnchorClick(headerCta.hash, e)}
                >
                  {headerCta.label}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
