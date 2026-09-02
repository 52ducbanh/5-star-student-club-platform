import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, ArrowRight, Calendar, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import type { NewsItem } from '@5ss/contracts'
import { ScrollReveal, StaggerContainer, staggerItem } from '@/shared/components/ScrollReveal'
import { formatDisplayDate } from '@/shared/utils/formatDate'
import { activitiesApi } from '@/features/activities/services/activitiesApi'
import { sortNews } from '@/features/activities/utils/activitySorting'
import { MediaPlaceholder } from '@/shared/components/MediaPlaceholder'

export function ActivitiesSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNews = useCallback(() => {
    setLoading(true)
    setError(null)
    activitiesApi.fetchNews()
      .then((items) => {
        setNews(sortNews(items))
        setLoading(false)
      })
      .catch((err) => {
        console.error('ActivitiesSection fetch error:', err)
        setError('Không thể tải dữ liệu hoạt động. Vui lòng thử lại.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  const featuredItem = news[0]
  const secondaryItems = news.slice(1, 3)

  return (
    <section id="hoat-dong-noi-bat" className="home-section home-section--activities" aria-labelledby="activities-heading">
      <div className="home-section__inner container">
        {/* Section Header */}
        <ScrollReveal className="home-section__header home-section__header--row" distance={65} duration={1.15}>
          <div>
            <p className="section-label">Tin tức & Nhịp sống CLB</p>
            <h2 id="activities-heading">
              Những gì đang{' '}
              <span className="text-gradient">diễn ra</span>
            </h2>
          </div>
          <Link to="/hoat-dong" className="btn btn--outline home-section__header-cta">
            Xem tất cả hoạt động <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </ScrollReveal>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.6)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
            <p>Đang tải hoạt động nổi bật...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#ff6b6b' }} role="alert">
            <AlertCircle size={24} style={{ margin: '0 auto 8px' }} aria-hidden="true" />
            <p>{error}</p>
            <button
              type="button"
              className="btn btn--outline"
              style={{ marginTop: '12px' }}
              onClick={loadNews}
            >
              Thử lại
            </button>
          </div>
        ) : news.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(255,255,255,0.6)' }}>
            <Sparkles size={24} className="text-[#ffd467]" style={{ margin: '0 auto 8px' }} aria-hidden="true" />
            <p>Hiện chưa có hoạt động nào được công bố.</p>
          </div>
        ) : (
          /* Editorial Story Layout: 1 Featured Main + 2 Secondary Compact Stories */
          <div className="activities-editorial-layout">
            {/* Main Featured Editorial Story */}
            {featuredItem && (
              <ScrollReveal className="activities-featured-wrap" distance={50} duration={1.1}>
                <article className="activity-featured-card">
                  <div className="activity-featured-card__media">
                    <div className="activity-featured-card__overlay" />
                    <div className="activity-featured-card__badge">
                      <Sparkles size={12} aria-hidden="true" />
                      <span>Nổi bật · {featuredItem.tag}</span>
                    </div>
                    {featuredItem.imageUrl ? (
                      <MediaPlaceholder
                        src={featuredItem.imageUrl}
                        alt={featuredItem.title}
                        fit="poster"
                        aspectRatio="16/9"
                      />
                    ) : (
                      <div className="activity-featured-card__visual-art" aria-hidden="true">
                        <div className="activity-featured-card__orb activity-featured-card__orb--1" />
                        <div className="activity-featured-card__orb activity-featured-card__orb--2" />
                      </div>
                    )}
                  </div>

                  <div className="activity-featured-card__content">
                    <div className="activity-featured-card__meta">
                      <span className="activity-featured-card__date">
                        <Calendar size={13} aria-hidden="true" />
                        {formatDisplayDate(featuredItem.publishedAt)}
                      </span>
                      <span className="activity-featured-card__tag">{featuredItem.tag}</span>
                    </div>

                    <h3 className="activity-featured-card__title">
                      <Link to={`/hoat-dong?item=${featuredItem.slug}`}>{featuredItem.title}</Link>
                    </h3>

                    <p className="activity-featured-card__excerpt">{featuredItem.excerpt}</p>

                    <div className="activity-featured-card__footer">
                      <Link to={`/hoat-dong?item=${featuredItem.slug}`} className="btn btn--primary activity-featured-card__cta">
                        Đọc toàn bộ bài viết
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            )}

            {/* Secondary Compact Stories Column */}
            {secondaryItems.length > 0 && (
              <StaggerContainer className="activities-secondary-col" stagger={0.15}>
                {secondaryItems.map((item) => (
                  <motion.article
                    key={item.id}
                    variants={staggerItem}
                    className="activity-secondary-card"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="activity-secondary-card__top">
                      <span className="activity-secondary-card__tag">{item.tag}</span>
                      <time className="activity-secondary-card__date">{formatDisplayDate(item.publishedAt)}</time>
                    </div>
                    <h4 className="activity-secondary-card__title">
                      <Link to={`/hoat-dong?item=${item.slug}`}>{item.title}</Link>
                    </h4>
                    <p className="activity-secondary-card__excerpt">{item.excerpt}</p>
                    <Link to={`/hoat-dong?item=${item.slug}`} className="activity-secondary-card__link">
                      <span>Chi tiết</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </motion.article>
                ))}
              </StaggerContainer>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
