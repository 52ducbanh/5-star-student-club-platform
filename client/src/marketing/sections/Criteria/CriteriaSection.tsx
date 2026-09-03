import { useState, useRef, lazy, Suspense } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Dumbbell,
  HandHeart,
  HeartHandshake,
  Languages,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ScrollReveal } from '@/shared/components/ScrollReveal'
import { framerEase } from '@/shared/components/scrollRevealVariants'
import { journeyCriteria } from '@/features/journey/data/journey'

const Criteria3DScene = lazy(() =>
  import('@/three/marketing/Criteria3DScene').then((m) => ({ default: m.Criteria3DScene })),
)

const criterionIcons = [HeartHandshake, BookOpenCheck, Dumbbell, HandHeart, Languages]

export function CriteriaSection() {
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const currentCriterion = journeyCriteria[activeCriterionIndex]
  const CurrentIcon = criterionIcons[activeCriterionIndex]
  const highlights = currentCriterion.guidance || []

  // Keyboard navigation for WAI-ARIA tablist
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex: number | null = null

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      nextIndex = (currentIndex + 1) % journeyCriteria.length
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      nextIndex = (currentIndex - 1 + journeyCriteria.length) % journeyCriteria.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = journeyCriteria.length - 1
    }

    if (nextIndex !== null) {
      setActiveCriterionIndex(nextIndex)
      tabRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <section id="hanh-trinh" className="home-section home-section--criteria" aria-labelledby="criteria-heading">
      {/* Dynamic Ambient Color Aura based on Selected Criterion */}
      <div
        className="criteria-ambient-glow"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 70% 45%, ${currentCriterion.color}22 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="home-section__inner container">
        {/* Section Header */}
        <ScrollReveal className="home-section__header" distance={65} duration={1.15}>
          <div className="flex items-center gap-2 mb-3">
            <span className="section-label">05 Chặng Hành Trình</span>
            <span
              className="w-2 h-2 rounded-full transition-colors duration-500"
              style={{ backgroundColor: currentCriterion.color }}
              aria-hidden="true"
            />
          </div>
          <h2 id="criteria-heading">
            Năm tiêu chí{' '}
            <span className="text-gradient">định hình bạn</span>
          </h2>
          <p className="home-section__desc">
            5 nguồn năng lượng hội tụ tạo nên danh hiệu Sinh viên 5 Tốt toàn diện. Chọn một tiêu chí để khám phá
            lộ trình phát triển tương ứng.
          </p>
        </ScrollReveal>

        {/* Master-Detail Interactive Layout */}
        <div className="criteria-signature-layout">
          {/* Left: 5 Interactive Criterion Selectors */}
          <div className="criteria-selector-col" role="tablist" aria-label="Danh sách 5 tiêu chí Sinh viên 5 Tốt">
            {journeyCriteria.map((criterion, index) => {
              const Icon = criterionIcons[index]
              const isSelected = activeCriterionIndex === index

              return (
                <button
                  key={criterion.id}
                  ref={(el) => { tabRefs.current[index] = el }}
                  type="button"
                  role="tab"
                  id={`tab-${criterion.id}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${criterion.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  className={`criteria-selector-card ${isSelected ? 'is-selected' : ''}`}
                  style={{ '--criteria-color': criterion.color } as React.CSSProperties}
                  onClick={() => setActiveCriterionIndex(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                >
                  <span className="criteria-selector-card__order" aria-hidden="true">
                    0{criterion.order}
                  </span>
                  <div className="criteria-selector-card__icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div className="criteria-selector-card__text">
                    <strong className="criteria-selector-card__title">{criterion.title}</strong>
                    <span className="criteria-selector-card__subtitle">{criterion.meaning}</span>
                  </div>
                  {isSelected && (
                    <motion.div
                      layoutId="criteria-active-indicator"
                      className="criteria-selector-card__indicator"
                      transition={{ duration: 0.3, ease: framerEase }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: Signature Deep-Dive Stage (3D Constellation + Detail Showcase) */}
          <div
            className="criteria-stage-col"
            id={`panel-${currentCriterion.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${currentCriterion.id}`}
          >
            {/* 3D Interactive Constellation Viewport */}
            <div className="criteria-stage-canvas-wrap">
              <div className="criteria-stage-header">
                <span className="criteria-stage-chip" style={{ color: currentCriterion.color, borderColor: `${currentCriterion.color}45` }}>
                  <Sparkles size={13} aria-hidden="true" />
                  Chặng 0{currentCriterion.order} · {currentCriterion.title}
                </span>
                <span className="criteria-stage-node-hint">Tương tác 3D đa chiều</span>
              </div>
              <div className="criteria-stage-canvas">
                <Suspense
                  fallback={
                    <div
                      className="w-full h-full flex items-center justify-center rounded-2xl bg-[rgba(14,46,94,0.4)] border border-[rgba(159,215,245,0.2)]"
                      aria-hidden="true"
                    />
                  }
                >
                  <Criteria3DScene activeIndex={activeCriterionIndex} />
                </Suspense>
              </div>
            </div>

            {/* Dynamic Content Panel with Smooth AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCriterion.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.38, ease: framerEase }}
                className="criteria-stage-body"
                style={{ '--active-crit-color': currentCriterion.color } as React.CSSProperties}
              >
                <div className="criteria-stage-body__top">
                  <div className="criteria-stage-body__badge">
                    <CurrentIcon size={22} style={{ color: currentCriterion.color }} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="criteria-stage-body__title">Tiêu chí {currentCriterion.title}</h3>
                    <p className="criteria-stage-body__meaning">{currentCriterion.meaning}</p>
                  </div>
                </div>

                <div className="criteria-stage-highlights">
                  <span className="criteria-stage-highlights__label">Gợi ý rèn luyện</span>
                  <ul>
                    {highlights.map((item, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={15} style={{ color: currentCriterion.color }} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="criteria-stage-action">
                  <Link
                    to={`/hanh-trinh-5-tot?criterion=${currentCriterion.id}`}
                    className="btn btn--primary criteria-stage-btn"
                  >
                    Khám phá chặng này trong Lộ trình
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Global Journey CTA */}
        <ScrollReveal className="home-section__cta-wrap mt-14" delay={0.2} distance={45} duration={1.0}>
          <Link to="/hanh-trinh-5-tot" className="btn btn--outline">
            Mở toàn bộ bản đồ 5 Chặng rèn luyện
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <p className="home-section__cta-note">
            <ShieldCheck size={13} aria-hidden="true" />
            Theo dõi tiến độ cá nhân · Tự đánh giá và lưu trữ tại trình duyệt
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
