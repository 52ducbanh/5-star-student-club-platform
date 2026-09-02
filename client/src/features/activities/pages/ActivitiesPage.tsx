import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, CalendarDays, Clock3, ExternalLink, Loader2, MapPin, Newspaper, Sparkles, TicketCheck } from 'lucide-react'
import type { EventItem, DerivedEventStatus, NewsItem } from '@5ss/contracts'
import { AccessibleModal } from '@/shared/components/AccessibleModal'
import { MediaPlaceholder } from '@/shared/components/MediaPlaceholder'
import { PageIntro } from '@/shared/components/PageIntro'
import { ScrollReveal } from '@/shared/components/ScrollReveal'
import { formatDisplayDate, formatTimeRange } from '@/shared/utils/formatDate'
import { activitiesApi } from '../services/activitiesApi'
import { RegistrationForm } from '../RegistrationForm'
import { NewsCard } from '../components/NewsCard'
import { EventCard } from '../components/EventCard'
import { sortNews, sortEvents } from '../utils/activitySorting'

function renderParagraphWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="text-[#5eafe8] underline hover:text-[#90cdf4]"
          style={{ wordBreak: 'break-all' }}
        >
          {part}
        </a>
      )
    }
    return part
  })
}

type ActivityTab = 'news' | 'events'
type EventFilter = 'all' | DerivedEventStatus

export function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<ActivityTab>('news')
  const [filter, setFilter] = useState<EventFilter>('all')
  const [visibleNewsCount, setVisibleNewsCount] = useState(9)
  const [visibleEventsCount, setVisibleEventsCount] = useState(9)

  const [news, setNews] = useState<NewsItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [eventsError, setEventsError] = useState<string | null>(null)

  const [newsDetail, setNewsDetail] = useState<NewsItem | null>(null)
  const [eventDetail, setEventDetail] = useState<EventItem | null>(null)
  const [registering, setRegistering] = useState(false)

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const itemSlug = searchParams.get('item')

  // Fetch full listings on mount
  useEffect(() => {
    let active = true

    activitiesApi.fetchNews()
      .then((data) => {
        if (active) {
          setNews(data)
          setLoadingNews(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to fetch news:', err)
          setNewsError('Không thể tải danh sách tin tức. Vui lòng thử lại.')
          setLoadingNews(false)
        }
      })

    activitiesApi.fetchEvents()
      .then((data) => {
        if (active) {
          setEvents(data)
          setLoadingEvents(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to fetch events:', err)
          setEventsError('Không thể tải danh sách sự kiện. Vui lòng thử lại.')
          setLoadingEvents(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  // Synchronize modal state with URL query param ?item=<slug>
  useEffect(() => {
    if (!itemSlug) {
      setNewsDetail(null)
      setEventDetail(null)
      setRegistering(false)
      return
    }

    // 1. Try to find in loaded news
    const matchedNews = news.find((n) => n.slug === itemSlug)
    if (matchedNews) {
      setTab('news')
      setNewsDetail(matchedNews)
      setEventDetail(null)
      setRegistering(false)
      return
    }

    // 2. Try to find in loaded events
    const matchedEvent = events.find((e) => e.slug === itemSlug)
    if (matchedEvent) {
      setTab('events')
      setEventDetail(matchedEvent)
      setNewsDetail(null)
      return
    }

    // 3. If not yet in loaded arrays, resolve directly via individual slug endpoints
    let active = true
    activitiesApi.fetchNewsItem(itemSlug)
      .then((newsItem) => {
        if (active) {
          setTab('news')
          setNewsDetail(newsItem)
          setEventDetail(null)
          setRegistering(false)
        }
      })
      .catch(() => {
        // If not a news slug, try events
        if (active) {
          activitiesApi.fetchEventItem(itemSlug)
            .then((eventItem) => {
              if (active) {
                setTab('events')
                setEventDetail(eventItem)
                setNewsDetail(null)
              }
            })
            .catch(() => {
              if (active) {
                setNewsDetail(null)
                setEventDetail(null)
                setRegistering(false)
              }
            })
        }
      })

    return () => {
      active = false
    }
  }, [itemSlug, news, events])

  const handleSelectTab = useCallback((newTab: ActivityTab) => {
    setTab(newTab)
    setVisibleNewsCount(9)
    setVisibleEventsCount(9)
  }, [])

  const handleSelectFilter = useCallback((newFilter: EventFilter) => {
    setFilter(newFilter)
    setVisibleEventsCount(9)
  }, [])

  const sortedNews = useMemo(() => sortNews(news), [news])
  const visibleNews = useMemo(() => sortedNews.slice(0, visibleNewsCount), [sortedNews, visibleNewsCount])
  const featuredNews = visibleNews[0]
  const secondaryNews = visibleNews.slice(1, 3)
  const regularNews = visibleNews.slice(3)
  const hasMoreNews = sortedNews.length > visibleNewsCount
  const remainingNewsCount = sortedNews.length - visibleNewsCount

  const sortedEvents = useMemo(() => sortEvents(events, filter), [events, filter])
  const visibleEvents = useMemo(() => sortedEvents.slice(0, visibleEventsCount), [sortedEvents, visibleEventsCount])
  const hasMoreEvents = sortedEvents.length > visibleEventsCount
  const remainingEventsCount = sortedEvents.length - visibleEventsCount

  const openNews = useCallback((item: NewsItem) => {
    setEventDetail(null)
    setNewsDetail(item)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('item', item.slug)
      return next
    })
  }, [setSearchParams])

  const openEvent = useCallback((item: EventItem) => {
    setNewsDetail(null)
    setEventDetail(item)
    setRegistering(false)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('item', item.slug)
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
          aside={<span className="demo-chip"><Sparkles size={14} /> Cập nhật liên tục</span>}
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
              onClick={() => handleSelectTab('news')}
              onKeyDown={(e) => handleTabKeyDown(e, 'news')}
            >
              <Newspaper size={16} aria-hidden="true" />
              Tin tức
              <span className="activity-tab-count">{news.length}</span>
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
              onClick={() => handleSelectTab('events')}
              onKeyDown={(e) => handleTabKeyDown(e, 'events')}
            >
              <CalendarDays size={16} aria-hidden="true" />
              Sự kiện
              <span className="activity-tab-count">{events.length}</span>
            </button>
          </div>
        </ScrollReveal>

        {/* News Section */}
        {tab === 'news' ? (
          <section id="panel-news" role="tabpanel" aria-labelledby="tab-news">
            {loadingNews ? (
              <div className="loading-state" style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.6)' }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
                <p>Đang tải danh sách tin tức...</p>
              </div>
            ) : newsError ? (
              <div className="error-state" style={{ textAlign: 'center', padding: '48px 0', color: '#ff6b6b' }} role="alert">
                <AlertCircle size={28} style={{ margin: '0 auto 12px' }} aria-hidden="true" />
                <p>{newsError}</p>
                <button
                  type="button"
                  className="btn btn--outline"
                  style={{ marginTop: '12px' }}
                  onClick={() => {
                    setLoadingNews(true)
                    setNewsError(null)
                    activitiesApi.fetchNews()
                      .then((d) => { setNews(d); setLoadingNews(false) })
                      .catch((e) => { setNewsError(e?.message || 'Lỗi kết nối máy chủ'); setLoadingNews(false) })
                  }}
                >
                  Thử lại
                </button>
              </div>
            ) : sortedNews.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.6)' }}>
                <Sparkles size={24} className="text-[#ffd467]" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
                <p>Hiện chưa có bài viết tin tức nào.</p>
              </div>
            ) : sortedNews.length === 1 ? (
              <div className="activities-editorial-showcase activities-editorial-showcase--single">
                <NewsCard
                  item={featuredNews}
                  variant="featured"
                  onClick={() => openNews(featuredNews)}
                  mediaFit="poster"
                  index={0}
                />
              </div>
            ) : sortedNews.length === 2 ? (
              <div className="activities-editorial-showcase activities-editorial-showcase--duo">
                <NewsCard
                  item={featuredNews}
                  variant="featured"
                  onClick={() => openNews(featuredNews)}
                  mediaFit="poster"
                  index={0}
                />
                <NewsCard
                  item={secondaryNews[0]}
                  variant="regular"
                  onClick={() => openNews(secondaryNews[0])}
                  mediaFit="poster"
                  index={1}
                />
              </div>
            ) : (
              <>
                <div className="activities-editorial-showcase">
                  <div className="activities-editorial-showcase__main">
                    <NewsCard
                      item={featuredNews}
                      variant="featured"
                      onClick={() => openNews(featuredNews)}
                      mediaFit="poster"
                      index={0}
                    />
                  </div>
                  <div className="activities-editorial-showcase__secondary">
                    {secondaryNews.map((item, idx) => (
                      <NewsCard
                        key={item.id}
                        item={item}
                        variant="secondary"
                        onClick={() => openNews(item)}
                        mediaFit="poster"
                        index={idx + 1}
                      />
                    ))}
                  </div>
                </div>

                {regularNews.length > 0 && (
                  <div className="activities-regular-grid">
                    {regularNews.map((item, idx) => (
                      <NewsCard
                        key={item.id}
                        item={item}
                        variant="regular"
                        onClick={() => openNews(item)}
                        mediaFit="poster"
                        index={idx + 3}
                      />
                    ))}
                  </div>
                )}

                {hasMoreNews && (
                  <div className="activities-load-more">
                    <button
                      type="button"
                      className="btn btn--load-more"
                      onClick={() => setVisibleNewsCount((prev) => prev + 6)}
                    >
                      Xem thêm bài viết ({remainingNewsCount})
                    </button>
                  </div>
                )}
              </>
            )}
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
                    onClick={() => handleSelectFilter(value)}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
            <div className="event-list">
              {loadingEvents ? (
                <div className="loading-state" style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.6)' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
                  <p>Đang tải danh sách sự kiện...</p>
                </div>
              ) : eventsError ? (
                <div className="error-state" style={{ textAlign: 'center', padding: '48px 0', color: '#ff6b6b' }} role="alert">
                  <AlertCircle size={28} style={{ margin: '0 auto 12px' }} aria-hidden="true" />
                  <p>{eventsError}</p>
                  <button
                    type="button"
                    className="btn btn--outline"
                    style={{ marginTop: '12px' }}
                    onClick={() => {
                      setLoadingEvents(true)
                      setEventsError(null)
                      activitiesApi.fetchEvents()
                        .then((d) => { setEvents(d); setLoadingEvents(false) })
                        .catch((e) => { setEventsError(e?.message || 'Lỗi kết nối máy chủ'); setLoadingEvents(false) })
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              ) : visibleEvents.length > 0 ? (
                visibleEvents.map((item, index) => (
                  <EventCard
                    key={item.id}
                    item={item}
                    onClick={() => openEvent(item)}
                    mediaFit="poster"
                    index={index}
                  />
                ))
              ) : (
                <div className="event-empty-state">
                  <Sparkles size={24} className="text-[#ffd467]" aria-hidden="true" />
                  <p>Hiện chưa có sự kiện nào trong danh mục này.</p>
                  {filter !== 'all' && (
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => handleSelectFilter('all')}
                    >
                      Xem tất cả sự kiện
                    </button>
                  )}
                </div>
              )}
            </div>

            {hasMoreEvents && (
              <div className="activities-load-more">
                <button
                  type="button"
                  className="btn btn--load-more"
                  onClick={() => setVisibleEventsCount((prev) => prev + 6)}
                >
                  Xem thêm sự kiện ({remainingEventsCount})
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* News detail modal */}
      <AccessibleModal
        open={Boolean(newsDetail && !eventDetail)}
        onClose={closeNews}
        title={newsDetail?.title ?? 'Chi tiết tin tức'}
        size="large"
      >
        {newsDetail && (
          <article className="detail-article">
            <MediaPlaceholder
              src={newsDetail.imageUrl}
              alt={`Ảnh bìa: ${newsDetail.title}`}
              variant="violet"
              label="Ảnh bài viết"
            />
            <div className="detail-article__meta">
              <span>{newsDetail.tag}</span>
              <time>{formatDisplayDate(newsDetail.publishedAt)}</time>
            </div>
            {newsDetail.body.map((p, idx) => <p key={idx}>{renderParagraphWithLinks(p)}</p>)}
          </article>
        )}
      </AccessibleModal>

      {/* Event detail modal */}
      <AccessibleModal
        open={Boolean(eventDetail && !newsDetail)}
        onClose={closeEvent}
        title={registering ? 'Đăng ký tham gia sự kiện' : eventDetail?.title ?? 'Chi tiết sự kiện'}
        size="large"
      >
        {eventDetail && (registering ? (
          <RegistrationForm
            eventId={eventDetail.id}
            eventTitle={eventDetail.title}
            onDone={closeEvent}
          />
        ) : (
          <article className="detail-article event-detail">
            <MediaPlaceholder
              src={eventDetail.imageUrl}
              alt={`Ảnh sự kiện: ${eventDetail.title}`}
              variant="cyan"
              label="Ảnh sự kiện"
            />
            <span className={`status-badge status-badge--${eventDetail.status}`}>
              {eventDetail.status === 'upcoming' ? '● Sắp diễn ra' : '○ Đã kết thúc'}
            </span>
            <div className="event-detail__meta">
              <span><CalendarDays size={15} /> {formatDisplayDate(eventDetail.startAt)}</span>
              <span><Clock3 size={15} /> {formatTimeRange(eventDetail.startAt, eventDetail.endAt)}</span>
              <span><MapPin size={15} /> {eventDetail.location}</span>
            </div>
            {eventDetail.body.map((p, idx) => <p key={idx}>{renderParagraphWithLinks(p)}</p>)}
            {(() => {
              const googleFormLine = eventDetail.body.find(
                (p) => p.includes('docs.google.com/forms') || p.includes('forms.gle'),
              )
              const formMatch = googleFormLine?.match(/https?:\/\/[^\s]+/)
              const formUrl = formMatch ? formMatch[0] : null

              if (formUrl) {
                return (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ExternalLink size={16} /> Đăng ký qua Google Form ↗
                    </a>
                  </div>
                )
              }

              if (eventDetail.registrationAvailable) {
                return (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setRegistering(true)}
                    style={{ marginTop: '8px' }}
                  >
                    <TicketCheck size={16} /> Đăng ký tham gia
                  </button>
                )
              }

              return null
            })()}
          </article>
        ))}
      </AccessibleModal>
    </main>
  )
}
