import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RotateCcw, ShieldCheck } from 'lucide-react'
import { AccessibleModal } from '@/shared/components/AccessibleModal'
import { Toast } from '@/shared/components/Toast'
import { journeyCriteria } from './data/journey'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { JourneyConstellation } from './JourneyConstellation'
import { JourneyMobileTrack } from './JourneyMobileTrack'
import { JourneyPanel } from './JourneyPanel'
import { useJourneyProgress } from './useJourneyProgress'

export function JourneyMap() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCriterionParam = searchParams.get('criterion')
  const validInitialId = journeyCriteria.some((c) => c.id === initialCriterionParam)
    ? (initialCriterionParam as string)
    : journeyCriteria[0].id

  const [selectedId, setSelectedId] = useState(validInitialId)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const prefersReduced = useReducedMotion()
  const panelRef = useRef<HTMLElement>(null)
  const toastTimerRef = useRef<number | null>(null)

  // Synchronize when URL search parameters change (e.g. from Hero Badge or Back/Forward navigation)
  useEffect(() => {
    const criterionParam = searchParams.get('criterion')
    if (criterionParam && journeyCriteria.some((c) => c.id === criterionParam)) {
      setSelectedId((prev) => (prev !== criterionParam ? criterionParam : prev))
    }
  }, [searchParams])

  const { progress, toggleItem, resetProgress, completedCount, totalCount, percent } = useJourneyProgress()
  const selected = journeyCriteria.find((criterion) => criterion.id === selectedId) ?? journeyCriteria[0]

  const criterionProgress = useMemo(
    () =>
      Object.fromEntries(
        journeyCriteria.map((criterion) => {
          const done = criterion.checklist.filter((item) => progress[item.id]).length
          return [criterion.id, Math.round((done / criterion.checklist.length) * 100)]
        }),
      ) as Record<string, number>,
    [progress],
  )

  // Safe toast trigger with timer race condition prevention
  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 1800)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const selectCriterion = (id: string) => {
    setSelectedId(id)
    setSearchParams({ criterion: id }, { replace: true })
    if (isMobile && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      if (rect.top > window.innerHeight - 60) {
        panelRef.current.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start',
        })
      }
    }
  }

  const toggle = (id: string) => {
    const willComplete = !progress[id]
    toggleItem(id)
    showToast(willComplete ? '✦ Đã hoàn thành 1 bước rèn luyện!' : 'Đã cập nhật tiến độ')
  }

  const confirmResetProgress = () => {
    resetProgress()
    setConfirmReset(false)
    showToast('Đã đặt lại toàn bộ tiến độ')
  }

  return (
    <>
      <div className="journey-layout">
        {/* Left Column: Interactive Cosmic Journey Map (Desktop) / Mobile Track */}
        <section className="journey-map" aria-label="Bản đồ thiên hà 5 tiêu chí Sinh viên 5 tốt">
          {/* Top Status Bar */}
          <div className="journey-map__status">
            <span className="journey-map__storage-badge">
              <ShieldCheck size={14} aria-hidden="true" />
              Lưu cục bộ trên thiết bị
            </span>
            <span className="journey-map__summary-badge">
              {completedCount}/{totalCount} mục rèn luyện
            </span>
          </div>

          {/* Map Body: Desktop 2D Constellation or Mobile Vertical Track */}
          {isMobile ? (
            <JourneyMobileTrack
              selectedId={selectedId}
              onSelect={selectCriterion}
              criterionProgress={criterionProgress}
              overallPercent={percent}
              completedCount={completedCount}
              totalCount={totalCount}
            />
          ) : (
            <JourneyConstellation
              selectedId={selectedId}
              onSelect={selectCriterion}
              criterionProgress={criterionProgress}
              overallPercent={percent}
              completedCount={completedCount}
              totalCount={totalCount}
            />
          )}

          {/* Bottom Bar with Reset Progress Button */}
          <div className="journey-map__bottom-bar">
            <button
              type="button"
              className="reset-button"
              onClick={() => setConfirmReset(true)}
              disabled={completedCount === 0}
              aria-label="Đặt lại toàn bộ tiến độ rèn luyện đã đánh dấu"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Đặt lại tiến độ</span>
            </button>
          </div>
        </section>

        {/* Right Column: Independent Detail Panel */}
        <aside ref={panelRef} className="journey-panel-wrap" aria-label="Bảng chi tiết tiêu chí rèn luyện">
          <JourneyPanel
            key={selected.id}
            criterion={selected}
            checked={progress}
            onToggle={toggle}
          />
        </aside>
      </div>

      {/* Confirmation Modal for Resetting Local Storage Progress */}
      <AccessibleModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Đặt lại tiến độ rèn luyện?"
      >
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', margin: '0 0 20px' }}>
          Hành động này sẽ xóa toàn bộ các mục bạn đã đánh dấu trên trình duyệt hiện tại. Bạn có chắc chắn muốn bắt đầu lại hành trình từ đầu?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => setConfirmReset(false)}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={confirmResetProgress}
          >
            Đồng ý đặt lại
          </button>
        </div>
      </AccessibleModal>

      {/* Action Feedback Toast Notification */}
      {toast && <Toast message={toast} />}
    </>
  )
}
