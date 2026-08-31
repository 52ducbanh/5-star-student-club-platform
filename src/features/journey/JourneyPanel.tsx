import { useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Footprints,
  HandHeart,
  ListChecks,
  Route,
  Sparkles,
  Target,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { JourneyCriterion } from '../../data/journey'

type JourneyPanelProps = {
  criterion: JourneyCriterion
  checked: Record<string, boolean>
  onToggle: (id: string) => void
}

const detailGroups = [
  { key: 'conditions', title: 'Điều kiện cần đạt', icon: ListChecks },
  { key: 'support', title: 'Hoạt động CLB hỗ trợ', icon: HandHeart },
  { key: 'roadmap', title: 'Lộ trình gợi ý', icon: Route },
  { key: 'evidence', title: 'Minh chứng cần chuẩn bị', icon: FileCheck2 },
] as const

export function JourneyPanel({ criterion, checked, onToggle }: JourneyPanelProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const prefersReduced = useReducedMotion()

  const completedCount = criterion.checklist.filter((item) => checked[item.id]).length
  const totalCount = criterion.checklist.length
  const percent = Math.round((completedCount / totalCount) * 100)
  const isComplete = completedCount === totalCount

  // Find the next incomplete item to propose as the Next Best Action
  const nextItem = criterion.checklist.find((item) => !checked[item.id])

  return (
    <div className="journey-panel" style={{ '--criterion-color': criterion.color } as React.CSSProperties}>
      {/* 1. Header & Progress Bar */}
      <div className="journey-panel__header">
        <div className="journey-panel__topline">
          <span className="journey-panel__badge">Chặng 0{criterion.order}/05</span>
          <span className="journey-panel__status-count">
            {completedCount}/{totalCount} mục đã hoàn thành
          </span>
        </div>

        <h2 className="journey-panel__title">{criterion.title}</h2>
        <p className="journey-panel__meaning">{criterion.meaning}</p>

        {/* Progress meter bar */}
        <div className="journey-panel__bar-wrap">
          <div className="journey-panel__bar-track">
            <motion.div
              className="journey-panel__bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: prefersReduced ? 0.05 : 0.4, ease: 'easeOut' }}
              style={{ backgroundColor: criterion.color }}
            />
          </div>
          <span className="journey-panel__bar-label">{percent}%</span>
        </div>
      </div>

      {/* 2. Next Best Action Spotlight */}
      <div className={`journey-next-action ${isComplete ? 'is-complete' : ''}`}>
        {isComplete ? (
          <div className="journey-next-action__complete">
            <Sparkles size={20} className="next-action-icon-complete" aria-hidden="true" />
            <div>
              <strong>Tuyệt vời! Bạn đã hoàn thành chặng này</strong>
              <p>Toàn bộ gợi ý rèn luyện cho {criterion.title} đã được đánh dấu.</p>
            </div>
          </div>
        ) : nextItem ? (
          <div className="journey-next-action__pending">
            <div className="journey-next-action__title-row">
              <span className="journey-next-action__tag">
                <Target size={13} aria-hidden="true" /> Gợi ý bước tiếp theo
              </span>
            </div>
            <p className="journey-next-action__text">{nextItem.label}</p>
            <button
              type="button"
              className="btn btn--sm journey-next-action__cta"
              onClick={() => onToggle(nextItem.id)}
            >
              <Check size={14} aria-hidden="true" /> Đánh dấu đã hoàn thành
            </button>
          </div>
        ) : null}
      </div>

      {/* 3. Checklist Items */}
      <section className="journey-checklist" aria-labelledby={`checklist-${criterion.id}`}>
        <div className="journey-checklist__header">
          <h3 id={`checklist-${criterion.id}`}>
            <Footprints size={17} aria-hidden="true" /> Danh sách rèn luyện gợi ý
          </h3>
        </div>

        <div className="journey-checklist__items">
          {criterion.checklist.map((item, idx) => {
            const isChecked = Boolean(checked[item.id])
            const isNext = !isChecked && item.id === nextItem?.id

            return (
              <label
                key={item.id}
                className={`journey-checklist__item ${isChecked ? 'is-checked' : ''} ${isNext ? 'is-next' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(item.id)}
                  aria-label={item.label}
                />
                <span className="custom-checkbox" aria-hidden="true">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="journey-checklist__label">
                  <span className="item-order">0{idx + 1}.</span>
                  {item.label}
                </span>
                {isNext && <span className="next-badge" aria-hidden="true">Bước tiếp theo</span>}
              </label>
            )
          })}
        </div>
      </section>

      {/* 4. Collapsible Guidance Details & Support Resources */}
      <section className="journey-guidance-accordion">
        <button
          type="button"
          className="journey-guidance-toggle"
          onClick={() => setDetailsOpen((v) => !v)}
          aria-expanded={detailsOpen}
          aria-controls={`guidance-content-${criterion.id}`}
        >
          <span>Xem chi tiết định hướng & minh chứng</span>
          {detailsOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>

        <AnimatePresence>
          {detailsOpen && (
            <motion.div
              id={`guidance-content-${criterion.id}`}
              className="journey-guidance-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: prefersReduced ? 0.05 : 0.25, ease: 'easeOut' }}
            >
              <div className="journey-panel__details">
                {detailGroups.map(({ key, title, icon: Icon }) => (
                  <section key={key} className="guidance-group">
                    <h4>
                      <Icon size={15} aria-hidden="true" /> {title}
                    </h4>
                    <ul className={key === 'roadmap' ? 'numbered-list' : undefined}>
                      {criterion[key].map((item, index) => (
                        <li key={item}>
                          <span className="list-bullet" aria-hidden="true">
                            {key === 'roadmap' ? index + 1 : <Check size={11} />}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
