import { ArrowUp, Sparkles, Send, MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { siteConfig, primaryNavigation, footerExploreNavigation } from '@/config/site'
import { contactConfig } from '@/config/contact'
import { navigateToSection, navigateToHomeTop } from '@/shared/utils/navigation'

export function Footer() {
  const year = new Date().getFullYear()
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()

  // Collect available social links only
  const activeSocials = [
    { name: 'Facebook', ...contactConfig.facebook },
    { name: 'TikTok', ...contactConfig.tiktok },
    { name: 'Email', ...contactConfig.email },
    { name: 'Điện thoại', ...contactConfig.phone },
  ].filter((item) => item.href !== null)

  const handleAnchorClick = (hash: string, e: React.MouseEvent) => {
    e.preventDefault()
    navigateToSection(hash, location.pathname, navigate)
  }

  const handleBackToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    navigateToHomeTop(location.pathname, navigate)
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <motion.div
        className="site-footer__inner container--wide"
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Column 1: Brand & Slogan */}
        <div className="site-footer__brand-col">
          <Link
            to="/"
            onClick={handleBackToTop}
            className="site-footer__brand-link"
            aria-label="Về trang chủ 5SS UET"
          >
            <span className="site-footer__logo-wrap" aria-hidden="true">
              <img src={siteConfig.logoSrc || '/assets/sv5t-mark.png?v=2'} alt="" />
            </span>
            <div className="site-footer__brand-text">
              <span className="site-footer__brand-title">{siteConfig.shortName}</span>
              <span className="site-footer__brand-sub">Sinh viên 5 Tốt</span>
            </div>
          </Link>

          <p className="site-footer__slogan">{siteConfig.slogan}</p>
          <p className="site-footer__desc">
            Không gian kết nối và rèn luyện năm tiêu chí Sinh viên 5 Tốt toàn diện dành cho sinh viên Trường Đại học Công nghệ – ĐHQGHN.
          </p>
        </div>

        {/* Column 2: Khám phá */}
        <div className="site-footer__col">
          <h3 className="site-footer__heading">Khám phá</h3>
          <nav className="site-footer__nav" aria-label="Khám phá nội dung">
            {footerExploreNavigation.map((item) => (
              <a
                key={item.hash}
                href={item.href}
                className="site-footer__link"
                onClick={(e) => handleAnchorClick(item.hash, e)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Column 3: Hành trình 5 Tốt */}
        <div className="site-footer__col">
          <h3 className="site-footer__heading">Hành trình 5 Tốt</h3>
          <nav className="site-footer__nav" aria-label="Lộ trình và Hoạt động">
            {primaryNavigation.map((item) => (
              <Link key={item.href} to={item.href} className="site-footer__link">
                {item.label}
              </Link>
            ))}
            <a
              href="/#hanh-trinh"
              className="site-footer__link"
              onClick={(e) => handleAnchorClick('#hanh-trinh', e)}
            >
              5 Tiêu chí rèn luyện
            </a>
          </nav>
        </div>

        {/* Column 4: Kết nối & Back to Top */}
        <div className="site-footer__col site-footer__col--action">
          <h3 className="site-footer__heading">Kết nối</h3>
          {activeSocials.length > 0 ? (
            <div className="site-footer__social-list">
              {activeSocials.map((social) => (
                <a
                  key={social.name}
                  href={social.href!}
                  target="_blank"
                  rel="noreferrer"
                  className="site-footer__social-link"
                >
                  <Send size={13} aria-hidden="true" />
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="site-footer__notice-card">
              <p className="site-footer__notice">
                <Sparkles size={13} className="text-[#ffd467] shrink-0" aria-hidden="true" />
                <span>Kênh truyền thông chính thức sẽ được CLB thông báo sớm.</span>
              </p>
            </div>
          )}

          <div className="site-footer__back-top-wrap">
            <button
              type="button"
              className="site-footer__back-top-btn"
              onClick={handleBackToTop}
              aria-label="Cuộn lên đầu trang"
            >
              <ArrowUp size={14} aria-hidden="true" />
              <span>Lên đầu trang</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Sub-footer */}
      <div className="site-footer__bottom container--wide">
        <div className="site-footer__bottom-left">
          <p className="site-footer__copyright">© {year} {siteConfig.shortName} · Trường Đại học Công nghệ – ĐHQGHN</p>
          <p className="site-footer__academic-note">
            <MapPin size={12} aria-hidden="true" />
            <span>{contactConfig.campusAddress}</span>
          </p>
        </div>
        {siteConfig.demoMode && (
          <p className="site-footer__disclaimer">
            Bản trải nghiệm số · Thiết kế giao diện CLB Sinh viên 5 Tốt
          </p>
        )}
      </div>
    </footer>
  )
}
