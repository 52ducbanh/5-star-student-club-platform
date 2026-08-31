import { ArrowRight, Calendar, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ScrollReveal, StaggerContainer, staggerItem } from '../../components/ui/ScrollReveal'
import { newsItems } from '../../data/activities'

export function ActivitiesSection() {
  const featuredItem = newsItems[0]
  const secondaryItems = newsItems.slice(1, 3)

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

        {/* Editorial Story Layout: 1 Featured Main + 2 Secondary Compact Stories */}
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
                  <div className="activity-featured-card__visual-art" aria-hidden="true">
                    <div className="activity-featured-card__orb activity-featured-card__orb--1" />
                    <div className="activity-featured-card__orb activity-featured-card__orb--2" />
                  </div>
                </div>

                <div className="activity-featured-card__content">
                  <div className="activity-featured-card__meta">
                    <span className="activity-featured-card__date">
                      <Calendar size={13} aria-hidden="true" />
                      {featuredItem.date}
                    </span>
                    <span className="activity-featured-card__tag">{featuredItem.tag}</span>
                  </div>

                  <h3 className="activity-featured-card__title">
                    <Link to={`/hoat-dong?item=${featuredItem.id}`}>{featuredItem.title}</Link>
                  </h3>

                  <p className="activity-featured-card__excerpt">{featuredItem.excerpt}</p>

                  <div className="activity-featured-card__footer">
                    <Link to={`/hoat-dong?item=${featuredItem.id}`} className="btn btn--primary activity-featured-card__cta">
                      Đọc toàn bộ bài viết
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          )}

          {/* Secondary Compact Stories Column */}
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
                  <time className="activity-secondary-card__date">{item.date}</time>
                </div>
                <h4 className="activity-secondary-card__title">
                  <Link to={`/hoat-dong?item=${item.id}`}>{item.title}</Link>
                </h4>
                <p className="activity-secondary-card__excerpt">{item.excerpt}</p>
                <Link to={`/hoat-dong?item=${item.id}`} className="activity-secondary-card__link">
                  <span>Chi tiết</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </motion.article>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
