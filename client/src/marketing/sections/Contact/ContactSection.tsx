import { Mail, MapPin, MessageCircle, Music2, Phone, Send, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { ScrollReveal, StaggerContainer } from '@/shared/components/ScrollReveal'
import { staggerItem } from '@/shared/components/scrollRevealVariants'
import { ContactForm } from '@/features/forms/ContactForm'
import { contactConfig } from '@/config/contact'

const contactChannels = [
  { key: 'facebook', title: 'Facebook', icon: MessageCircle, ...contactConfig.facebook },
  { key: 'tiktok', title: 'TikTok', icon: Music2, ...contactConfig.tiktok },
  { key: 'email', title: 'Email', icon: Mail, ...contactConfig.email },
  { key: 'phone', title: 'Số điện thoại', icon: Phone, ...contactConfig.phone },
]

export function ContactSection() {
  return (
    <section id="lien-he" className="home-section home-section--contact" aria-labelledby="contact-heading">
      {/* Ambient Finale Light Glow */}
      <div className="contact-finale-glow" aria-hidden="true" />

      <div className="home-section__inner container">
        {/* Section Header with Grand Finale Calling */}
        <ScrollReveal className="home-section__header" distance={65} duration={1.15}>
          <div className="flex items-center gap-2 mb-3">
            <span className="section-label">Kết nối & Đồng hành</span>
            <Sparkles size={13} className="text-[#ffd467]" aria-hidden="true" />
          </div>
          <h2 id="contact-heading">
            Hành trình của bạn{' '}
            <span className="text-gradient">bắt đầu từ đây</span>
          </h2>
          <p className="home-section__desc">
            Dù bạn đang ở bước đầu tìm hiểu hay đã sẵn sàng bứt phá các tiêu chí, 5SS UET luôn sẵn sàng lắng nghe và đồng
            hành cùng bạn.
          </p>
        </ScrollReveal>

        <StaggerContainer className="contact-layout" stagger={0.18}>
          {/* Left Column: Channels & Map */}
          <motion.div variants={staggerItem} className="contact-info">
            <div className="contact-channels">
              {contactChannels.map(({ key, title, icon: Icon, label, href }) => {
                const inner = (
                  <>
                    <span className="contact-channel__icon">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <small>{title}</small>
                      <strong>{label}</strong>
                    </div>
                  </>
                )
                return href ? (
                  <a key={key} href={href} target="_blank" rel="noreferrer" className="contact-channel">
                    {inner}
                  </a>
                ) : (
                  <div key={key} className="contact-channel contact-channel--placeholder">
                    {inner}
                  </div>
                )
              })}
            </div>

            <div className="contact-address">
              <span className="contact-channel__icon">
                <MapPin size={18} aria-hidden="true" />
              </span>
              <div>
                <small>Địa chỉ trường</small>
                <strong>{contactConfig.address.label}</strong>
                <span className="text-[11.5px] text-[#b6def5] block mt-0.5 opacity-80">
                  {contactConfig.address.campus}
                </span>
              </div>
            </div>

            {contactConfig.address.mapUrl ? (
              <div className="map-frame-wrap">
                <iframe
                  className="map-frame"
                  src={contactConfig.address.mapUrl}
                  title="Bản đồ địa điểm CLB Sinh viên 5 Tốt UET"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="map-placeholder" role="img" aria-label="Khung bản đồ UET chờ cập nhật URL chính xác">
                <div className="map-placeholder__grid" aria-hidden="true" />
                <span className="map-placeholder__pin">
                  <MapPin size={24} aria-hidden="true" />
                </span>
                <div>
                  <strong>Bản đồ sẽ được cập nhật</strong>
                  <small>Chưa nhúng vị trí khi URL chính xác chưa được xác nhận.</small>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Contact Simulation Form */}
          <motion.div variants={staggerItem} className="contact-form-wrap">
            <div className="contact-form-card">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="section-label mb-0">Gửi lời nhắn</p>
                <div className="contact-form-card__beacon" aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffd467]" />
                  <span className="text-[10px] font-bold text-[#b6def5] uppercase tracking-wider">Bản mô phỏng</span>
                </div>
              </div>
              <h3>Chúng mình muốn nghe từ bạn</h3>
              <p>Form mô phỏng gửi câu hỏi hoặc ý kiến đóng góp cho CLB Sinh viên 5 Tốt UET.</p>
              <ContactForm />
              <span className="contact-form-card__note">
                <Send size={12} aria-hidden="true" />
                Không lưu thông tin cá nhân sau khi hoàn tất phiên
              </span>
            </div>
          </motion.div>
        </StaggerContainer>
      </div>
    </section>
  )
}
