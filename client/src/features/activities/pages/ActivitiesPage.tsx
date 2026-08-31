import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, Clock3, MapPin, Newspaper, Sparkles, TicketCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { AccessibleModal } from '@/shared/components/AccessibleModal'
import { MediaPlaceholder } from '@/shared/components/MediaPlaceholder'
import { PageIntro } from '@/shared/components/PageIntro'
import { ScrollReveal } from '@/shared/components/ScrollReveal'
import { eventItems, newsItems, type EventItem, type EventStatus, type NewsItem } from '../data/activities'
import { RegistrationForm } from '../RegistrationForm'

type ActivityTab = 'news' | 'events'
type EventFilter = 'all' | EventStatus

const newsVariants = ['cyan', 'blue', 'violet', 'gold', 'green', 'blue'] as const

export function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<ActivityTab>('news')
  const [filter, setFilter] = useState<EventFilter>('all')
  const [newsDetail, setNewsDetail] = useState<NewsItem | null>(null)
  const [eventDetail, setEventDetail] = useState<EventItem | null>(null)
  const [registering, setRegistering] = useState(false)
  const reduceMotion = useReducedMotion()

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const itemId = searchParams.get('item')

  // Synchronize modal state with URL query param as single source of truth
  useEffect(() => {
    if (!itemId) {
      setNewsDetail(null)
      setEventDetail(null)
      setRegistering(false)
      return
    }

    const matchedNews = newsItems.find((n) => n.id === itemId)
    if (matchedNews) {
      setTab('news')
      setNewsDetail(matchedNews)
      setEventDetail(null)
      setRegistering(false)
      return
    }

    const matchedEvent = eventItems.find((e) => e.id === itemId)
    if (matchedEvent) {
      setTab('events')
      setEventDetail(matchedEvent)
      setNewsDetail(null)
      return
    }

    // If item is invalid or not found, clear modals safely
    setNewsDetail(null)
    setEventDetail(null)
    setRegistering(false)
  }, [itemId])

  const visibleEvents = useMemo(
    () => (filter === 'all' ? eventItems : eventItems.filter((e) => e.status === filter)),
    [filter],
  )

  const openNews = useCallback((item: NewsItem) => {
    setEventDetail(null)
    setNewsDetail(item)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('item', item.id)
      return next
    })
  }, [setSearchParams])

  const openEvent = useCallback((item: EventItem) => {
    setNewsDetail(null)
    setEventDetail(item)
    setRegistering(false)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('item', item.id)
      return next
    })
  }, [setSearchParams])

  const closeNews = useCallback(() => {
    setNewsDetail(null)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('item')
      return next
    })
  }, [setSearchParams])

  const closeEvent = useCallback(() => {
    setEventDetail(null)
    setRegistering(false)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('item')
      return next
    })
  }, [setSearchParams])

  // Keyboard navigation for activity tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: ActivityTab) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const nextTab: ActivityTab = currentTab === 'news' ? 'events' : 'news'
      setTab(nextTab)
      const nextIndex = nextTab === 'news' ? 0 : 1
      tabRefs.current[nextIndex]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setTab('news')
      tabRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      setTab('events')
      tabRefs.current[1]?.focus()
    }
  }

  return (
    <main id="main-content" className="content-page activities-page" tabIndex={-1}>
      <div className="container">
        <PageIntro
          eyebrow="Nhịp sống 5SS"
          title={<>Hoạt động & <span className="text-gradient">kết nối</span></>}
          description="Khám phá tin tức, sự kiện và các buổi workshop đồng hành cùng sinh viên UET."
          aside={<span className="demo-chip"><Sparkles size={14} /> Nội dung minh họa</span>}
        />

        {/* Tabs */}
        <ScrollReveal>
          <div className="activity-tabs" role="tablist" aria-label="Loại hoạt động">
            <button
              ref={(el) => { tabRefs.current[0] = el }}
              type="button"
              role="tab"
              id="tab-news"
              aria-selected={tab === 'news'}
              aria-controls="panel-news"
              tabIndex={tab === 'news' ? 0 : -1}
              className={tab === 'news' ? 'is-active' : ''}
              onClick={() => setTab('news')}
              onKeyDown={(e) => handleTabKeyDown(e, 'news')}
            >
              <Newspaper size={16} aria-hidden="true" />
              Tin tức
              <span className="activity-tab-count">{newsItems.length}</span>
            </button>
            <button
              ref={(el) => { tabRefs.current[1] = el }}
              type="button"
              role="tab"
              id="tab-events"
              aria-selected={tab === 'events'}
              aria-controls="panel-events"
              tabIndex={tab === 'events' ? 0 : -1}
              className={tab === 'events' ? 'is-active' : ''}
              onClick={() => setTab('events')}
              onKeyDown={(e) => handleTabKeyDown(e, 'events')}
            >
              <CalendarDays size={16} aria-hidden="true" />
              Sự kiện
              <span className="activity-tab-count">{eventItems.length}</span>
            </button>
          </div>
        </ScrollReveal>

        {/* News grid */}
        {tab === 'news' ? (
          <section id="panel-news" className="news-grid" role="tabpanel" aria-labelledby="tab-news">
            {newsItems.map((item, index) => (
              <motion.button
                key={item.id}
                type="button"
                className={`news-card${index === 0 ? ' news-card--featured' : ''}`}
                onClick={() => openNews(item)}
                whileHover={reduceMotion ? undefined : { y: -5 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <div className="news-card__media">
                  <MediaPlaceholder
                    src={item.image}
                    alt={`Ảnh bìa: ${item.title}`}
                    label={`Tin ${String(index + 1).padStart(2, '0')}`}
                    variant={newsVariants[index]}
                  />
                  <span className="news-card__tag">{item.tag}</span>
                </div>
                <div className="news-card__body">
                  <time className="news-card__date">{item.date}</time>
                  <h3 className="news-card__title">{item.title}</h3>
                  <p className="news-card__excerpt">{item.excerpt}</p>
                  <span className="news-card__cta">
                    Đọc bài viết <span aria-hidden="true">→</span>
                  </span>
                </div>
              </motion.button>
            ))}
          </section>
        ) : (
          <section id="panel-events" role="tabpanel" aria-labelledby="tab-events">
            <div className="event-filter" aria-label="Lọc sự kiện">
              {([['all', 'Tất cả'], ['upcoming', 'Sắp diễn ra'], ['past', 'Đã kết thúc']] as const).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={filter === value ? 'is-active' : ''}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
            <div className="event-list">
              {visibleEvents.length > 0 ? (
                visibleEvents.map((item, index) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    className="event-card"
                    onClick={() => openEvent(item)}
                    whileHover={reduceMotion ? undefined : { y: -3 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <MediaPlaceholder
                      src={item.image}
                      alt={`Ảnh sự kiện: ${item.title}`}
                      label={`Sự kiện ${String(index + 1).padStart(2, '0')}`}
                      variant={item.status === 'upcoming' ? 'cyan' : 'blue'}
                    />
                    <div className="event-card__body">
                      <span className={`status-badge status-badge--${item.status}`}>
                        {item.status === 'upcoming' ? '● Sắp diễn ra' : '○ Đã kết thúc'}
                      </span>
                      <h3 className="event-card__title">{item.title}</h3>
                      <p>{item.excerpt}</p>
                      <div className="event-meta">
                        <span><Clock3 size={13} aria-hidden="true" /> {item.date} · {item.time}</span>
                        <span><MapPin size={13} aria-hidden="true" /> {item.location}</span>
                      </div>
                    </div>
                    <span className="event-card__arrow" aria-hidden="true">→</span>
                  </motion.button>
                ))
              ) : (
                <div className="event-empty-state">
                  <Sparkles size={24} className="text-[#ffd467]" aria-hidden="true" />
                  <p>Hiện chưa có sự kiện nào trong danh mục này.</p>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => setFilter('all')}
                  >
                    Xem tất cả sự kiện
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* News detail modal (mutually exclusive with event modal) */}
      <AccessibleModal
        open={Boolean(newsDetail && !eventDetail)}
        onClose={closeNews}
        title={newsDetail?.title ?? 'Chi tiết tin tức'}
        size="large"
      >
        {newsDetail && (
          <article className="detail-article">
            <MediaPlaceholder
              src={newsDetail.image}
              alt={`Ảnh bìa: ${newsDetail.title}`}
              variant="violet"
              label="Ảnh bài viết sẽ được cập nhật"
            />
            <div className="detail-article__meta">
              <span>{newsDetail.tag}</span>
              <time>{newsDetail.date}</time>
            </div>
            {newsDetail.body.map((p, idx) => <p key={idx}>{p}</p>)}
            <div className="inline-notice inline-notice--compact">
              <Sparkles size={15} />
              <div>
                <strong>Nội dung bài viết mẫu</strong>
                <span>Không phải thông báo chính thức của CLB.</span>
              </div>
            </div>
          </article>
        )}
      </AccessibleModal>

      {/* Event detail modal (mutually exclusive with news modal) */}
      <AccessibleModal
        open={Boolean(eventDetail && !newsDetail)}
        onClose={closeEvent}
        title={registering ? 'Đăng ký tham gia · Bản mô phỏng' : eventDetail?.title ?? 'Chi tiết sự kiện'}
        size="large"
      >
        {eventDetail && (registering ? (
          <RegistrationForm eventTitle={eventDetail.title} onDone={closeEvent} />
        ) : (
          <article className="detail-article event-detail">
            <MediaPlaceholder
              src={eventDetail.image}
              alt={`Ảnh sự kiện: ${eventDetail.title}`}
              variant="cyan"
              label="Ảnh sự kiện sẽ được cập nhật"
            />
            <span className={`status-badge status-badge--${eventDetail.status}`}>
              {eventDetail.status === 'upcoming' ? '● Sắp diễn ra' : '○ Đã kết thúc'}
            </span>
            <div className="event-detail__meta">
              <span><CalendarDays size={15} /> {eventDetail.date}</span>
              <span><Clock3 size={15} /> {eventDetail.time}</span>
              <span><MapPin size={15} /> {eventDetail.location}</span>
            </div>
            {eventDetail.body.map((p, idx) => <p key={idx}>{p}</p>)}
            <div className="inline-notice inline-notice--compact">
              <Sparkles size={15} />
              <div>
                <strong>Sự kiện minh họa</strong>
                <span>Lịch, địa điểm và đăng ký chưa có hiệu lực thực tế.</span>
              </div>
            </div>
            {eventDetail.registrationOpen && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setRegistering(true)}
                style={{ marginTop: '8px' }}
              >
                <TicketCheck size={16} /> Đăng ký tham gia
              </button>
            )}
          </article>
        ))}
      </AccessibleModal>
    </main>
  )
}
