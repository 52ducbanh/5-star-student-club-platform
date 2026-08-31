import { lazy, Suspense } from 'react'
import { ArrowRight, BookOpenCheck, Dumbbell, HandHeart, HeartHandshake, Languages, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { siteConfig } from '@/config/site'
import { journeyCriteria } from '@/features/journey/data/journey'
import { useLoading } from '@/app/providers/LoadingProvider'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

const HeroGalaxyScene = lazy(() =>
  import('@/three/marketing/HeroGalaxyScene').then((m) => ({ default: m.HeroGalaxyScene })),
)

const criterionIcons = [HeartHandshake, BookOpenCheck, Dumbbell, HandHeart, Languages]
const framerEase = [0.16, 1, 0.3, 1] as const

export function HeroSection() {
  const { isExiting, isLoaded } = useLoading()
  const reduceMotion = useReducedMotion()

  // Reveal triggers as soon as loader starts its exit handoff, or if already loaded / reduced motion
  const isRevealed = isExiting || isLoaded || reduceMotion

  return (
    <section className="home-hero" aria-labelledby="home-title">
      {/* Background Cosmic Star Atmosphere */}
      <motion.div
        className="home-hero__backdrop"
        aria-hidden="true"
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0.6, scale: 1.01 }}
        animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0.6, scale: 1.01 }}
        transition={{ duration: 0.4, ease: framerEase }}
      >
        <span className="home-hero__aurora home-hero__aurora--one" />
        <span className="home-hero__aurora home-hero__aurora--two" />
        <span className="home-hero__star-map" />
        <span className="home-hero__shooting-star home-hero__shooting-star--one" />
        <span className="home-hero__shooting-star home-hero__shooting-star--two" />

        {/* Radiant Dreamy 4-Point Star Flares */}
        <div className="hero-flare hero-flare--left">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>
        <div className="hero-flare hero-flare--right">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>
      </motion.div>

      <div className="home-hero__shell container--wide">
        {/* Left Column: Copy & Primary STARPRINT Action */}
        <div className="home-hero__copy">
          {/* Eyebrow */}
          <div className="hero-eyebrow-row">
            <motion.div
              className="hero-eyebrow"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, delay: 0.12, ease: framerEase }}
            >
              <span className="hero-eyebrow__dot" aria-hidden="true" />
              5SS Galaxy · Hành trình tỏa sáng
            </motion.div>
          </div>

          {/* Staged Line-by-Line Headline */}
          <h1 id="home-title" className="hero-headline">
            {/* Line 1: Câu lạc bộ (~120ms) */}
            <motion.span
              className="hero-headline__club"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 35 }}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
              transition={{ duration: 0.42, delay: 0.12, ease: framerEase }}
            >
              Câu lạc bộ
            </motion.span>

            {/* Line 2: Sinh viên (~190ms) */}
            <motion.span
              className="hero-headline__student"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.46, delay: 0.19, ease: framerEase }}
            >
              Sinh viên
            </motion.span>

            {/* Line 3: 5 Tốt - Primary Candy Focus (~260ms) */}
            <motion.span
              className="hero-headline__accent"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 45, scale: 0.96 }}
              animate={
                isRevealed
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: reduceMotion ? 1 : [0.96, 1.015, 1],
                    }
                  : { opacity: 0, y: 45, scale: 0.96 }
              }
              transition={{ duration: 0.52, delay: 0.26, ease: framerEase }}
            >
              5 Tốt
            </motion.span>
          </h1>

          {/* Intro Description Paragraph (~420ms) */}
          <motion.p
            className="hero-intro"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.42, delay: 0.42, ease: framerEase }}
          >
            Cộng đồng đồng hành cùng sinh viên UET trên hành trình rèn luyện toàn diện,
            kết nối cơ hội và biến từng nỗ lực thành một dấu mốc đáng tự hào.
          </motion.p>

          {/* Slogan Keywords Pills (~480ms) */}
          <div className="hero-values" aria-label={siteConfig.slogan}>
            {siteConfig.slogan.split(' – ').map((value, idx) => (
              <motion.span
                key={value}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.35, delay: 0.48 + idx * 0.04, ease: framerEase }}
              >
                {value}
              </motion.span>
            ))}
          </div>

          {/* Primary Action Button (~540ms) */}
          <div className="hero-actions">
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, delay: 0.54, ease: framerEase }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                className="btn btn--primary hero-primary-cta"
                to="/starprint"
              >
                Tạo STARPRINT của bạn ✨
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </motion.div>
          </div>

          {/* Local Security / Experience Note (~680ms) */}
          <motion.p
            className="hero-local-note"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35, delay: 0.64, ease: framerEase }}
          >
            <ShieldCheck size={14} aria-hidden="true" />
            Trải nghiệm 5 Mini-Games · Tạo dấu ấn ngôi sao cá nhân
          </motion.p>
        </div>

        {/* Right Column: 3D Galaxy & Interactive Orbit Badges + Journey CTA Under Star */}
        <motion.div
          className="home-hero__visual"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
          animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.20, ease: framerEase }}
        >
          <div className="hero-visual__halo" aria-hidden="true" />
          <div className="hero-visual__canvas" aria-hidden="true">
            <Suspense fallback={<div className="galaxy-scene__fallback" />}>
              <HeroGalaxyScene />
            </Suspense>
          </div>

          {/* 5 Orbit Criteria Badges with Precise Deep Linking */}
          <div className="hero-orbit-labels" aria-label="Năm tiêu chí Sinh viên 5 Tốt">
            {journeyCriteria.map((criterion, index) => {
              const Icon = criterionIcons[index]
              return (
                <motion.div
                  key={criterion.id}
                  className={`hero-orbit-label hero-orbit-label--${index + 1}`}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 8 }}
                  animate={isRevealed ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
                  transition={{ duration: 0.45, delay: 0.32 + index * 0.055, ease: framerEase }}
                >
                  <Link
                    to={`/hanh-trinh-5-tot?criterion=${criterion.id}`}
                    className="hero-orbit-label__link"
                    style={{ '--criteria-color': criterion.color } as React.CSSProperties}
                    aria-label={`Khám phá chặng ${criterion.title}`}
                  >
                    <span className="hero-orbit-label__icon" aria-hidden="true">
                      <Icon size={13} />
                    </span>
                    <span className="hero-orbit-label__name">{criterion.shortName}</span>
                    <span className="hero-orbit-label__order">0{criterion.order}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Journey CTA placed directly under the 3D Star (~600ms) */}
          <motion.div
            className="hero-journey-cta-wrap"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.45, delay: 0.60, ease: framerEase }}
          >
            <Link className="hero-journey-cta" to="/hanh-trinh-5-tot" aria-label="Khám phá Hành trình 5 Tốt">
              <span>Hành trình 5 Tốt</span>
              <ArrowRight size={17} className="hero-journey-cta__arrow" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
