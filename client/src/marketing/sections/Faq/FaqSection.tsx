import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { ScrollReveal, StaggerContainer } from '@/shared/components/ScrollReveal'
import { staggerItem, framerEase } from '@/shared/components/scrollRevealVariants'
import { faqItems } from '@/marketing/data/faq'

const FAQ_PREVIEW_COUNT = 5

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0].id)
  const [showAll, setShowAll] = useState(false)

  const visibleFaqs = showAll ? faqItems : faqItems.slice(0, FAQ_PREVIEW_COUNT)

  return (
    <section id="faq" className="home-section home-section--dark" aria-labelledby="faq-heading">
      <div className="home-section__inner container--narrow">
        {/* Section Header */}
        <ScrollReveal className="home-section__header" distance={65} duration={1.15}>
          <p className="section-label">Giải đáp nhanh</p>
          <h2 id="faq-heading">
            Câu hỏi{' '}
            <span className="text-gradient">thường gặp</span>
          </h2>
          <p className="home-section__desc">
            Những câu trả lời giúp bạn hiểu cách hoạt động của CLB và tránh nhầm lẫn với quy định chính thức.
          </p>
        </ScrollReveal>

        {/* FAQ Accordion List */}
        <StaggerContainer className="faq-list" stagger={0.10}>
          {visibleFaqs.map((item, index) => {
            const open = openId === item.id
            return (
              <motion.article
                key={item.id}
                variants={staggerItem}
                className={`faq-item${open ? ' is-open' : ''}`}
                role="listitem"
              >
                <h3 className="faq-item__header">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`${item.id}-answer`}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="faq-item__trigger"
                  >
                    <span className="faq-item__num" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="faq-item__question">{item.question}</span>
                    <ChevronDown className="faq-item__chevron" size={18} aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`${item.id}-answer`}
                      className="faq-item__answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: framerEase }}
                    >
                      <p>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </StaggerContainer>

        {/* Show More Questions Toggle */}
        {!showAll && faqItems.length > FAQ_PREVIEW_COUNT && (
          <ScrollReveal className="home-section__cta-wrap" delay={0.15} distance={40} duration={1.0}>
            <button
              type="button"
              className="btn btn--outline faq-show-more"
              onClick={() => setShowAll(true)}
            >
              Xem thêm {faqItems.length - FAQ_PREVIEW_COUNT} câu hỏi
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
