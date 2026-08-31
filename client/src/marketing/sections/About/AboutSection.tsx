import { Compass, HeartHandshake, Rocket, Sparkles, Target, Quote } from 'lucide-react'
import { motion } from 'motion/react'
import { MediaPlaceholder } from '@/shared/components/MediaPlaceholder'
import { ScrollReveal, StaggerContainer, staggerItem } from '@/shared/components/ScrollReveal'
import { aboutContent } from '@/marketing/data/about'

const valueIcons = [HeartHandshake, Compass, Rocket, Sparkles]

export function AboutSection() {
  return (
    <section id="gioi-thieu" className="home-section home-section--about" aria-labelledby="about-heading">
      <div className="home-section__inner container">
        {/* Section Header with Inspiring Editorial Statement */}
        <ScrollReveal className="home-section__header" distance={65} duration={1.15}>
          <p className="section-label">Về 5SS UET</p>
          <h2 id="about-heading">
            Một cộng đồng cùng nhau{' '}
            <span className="text-gradient">tỏa sáng</span>
          </h2>
          <p className="home-section__desc">{aboutContent.intro}</p>
        </ScrollReveal>

        {/* Editorial Purpose Cards: Mục tiêu & Sứ mệnh */}
        <StaggerContainer className="about-purpose" stagger={0.16}>
          <motion.article variants={staggerItem} className="about-card about-card--primary">
            <div className="about-card__icon">
              <Target size={20} aria-hidden="true" />
            </div>
            <p className="about-card__kicker">Mục tiêu phát triển</p>
            <h3>Biến mục tiêu lớn thành những bước đi vừa sức.</h3>
            <p>{aboutContent.goal}</p>
          </motion.article>
          <motion.article variants={staggerItem} className="about-card">
            <div className="about-card__icon about-card__icon--violet">
              <Compass size={20} aria-hidden="true" />
            </div>
            <p className="about-card__kicker">Sứ mệnh đồng hành</p>
            <h3>Đồng hành bằng kết nối thực chất.</h3>
            <p>{aboutContent.mission}</p>
          </motion.article>
        </StaggerContainer>

        {/* 4 Core Values Header */}
        <ScrollReveal className="home-section__subheader" delay={0.1} distance={55} duration={1.1}>
          <div className="flex items-center gap-2">
            <p className="section-label">Bốn giá trị cốt lõi</p>
            <Sparkles size={14} className="text-[#ffd467]" aria-hidden="true" />
          </div>
          <h3>Định hình bản sắc của người 5SS UET</h3>
        </ScrollReveal>

        {/* 4 Core Values Grid */}
        <StaggerContainer className="value-grid" stagger={0.14}>
          {aboutContent.values.map((value, index) => {
            const Icon = valueIcons[index]
            return (
              <motion.article
                key={value.id}
                variants={staggerItem}
                className="value-card"
                style={{ '--value-color': value.accent } as React.CSSProperties}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.2 }}
              >
                <span className="value-card__order" aria-hidden="true">
                  0{index + 1}
                </span>
                <div className="value-card__icon">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h4 className="value-card__title">{value.title}</h4>
                <strong className="value-card__caption">{value.caption}</strong>
                <p className="value-card__desc">{value.description}</p>
              </motion.article>
            )
          })}
        </StaggerContainer>

        {/* Leader Spotlight */}
        <ScrollReveal className="leader-spotlight-wrap" delay={0.15} distance={65} duration={1.2}>
          <section className="leader-spotlight" aria-labelledby="leader-heading">
            <div className="leader-frame">
              <motion.div
                whileHover={{ rotateY: -3, rotateX: 2, scale: 1.015 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <MediaPlaceholder
                  src={aboutContent.leader.image}
                  alt="Ảnh Chủ nhiệm CLB sẽ được cập nhật"
                  label="Ảnh Chủ nhiệm sẽ được cập nhật"
                  variant="violet"
                  className="leader-frame__img"
                />
              </motion.div>
            </div>

            <div className="leader-content">
              <div className="flex items-center gap-2 mb-2">
                <Quote size={16} className="text-[#ffd467]" aria-hidden="true" />
                <p className="section-label">Thông điệp</p>
              </div>
              <h3 id="leader-heading">Người truyền cảm hứng</h3>
              <blockquote className="leader-quote">{aboutContent.leader.quote}</blockquote>
              <p className="leader-name">{aboutContent.leader.name}</p>
              <span className="leader-role">{aboutContent.leader.role}</span>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </section>
  )
}
