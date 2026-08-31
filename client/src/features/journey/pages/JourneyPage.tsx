import { HardDrive, Info } from 'lucide-react'
import { PageIntro } from '@/shared/components/PageIntro'
import { ScrollReveal } from '@/shared/components/ScrollReveal'
import { JourneyMap } from '../JourneyMap'
import { journeyDisclaimer } from '../data/journey'

export function JourneyPage() {
  return (
    <main id="main-content" className="content-page journey-page" tabIndex={-1}>
      <div className="container--wide">
        <ScrollReveal>
          <PageIntro
            eyebrow="Hành trình nổi bật"
            title={<>Bản đồ <span className="text-gradient">5 Tốt</span> của bạn</>}
            description="Chạm vào từng chặng, khám phá lộ trình gợi ý và đánh dấu những bước bạn đã hoàn thành."
            aside={<span className="demo-chip"><HardDrive size={14} /> Dữ liệu chỉ lưu trên thiết bị này</span>}
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="inline-notice" role="note">
            <Info size={16} aria-hidden="true" />
            <div>
              <strong>{journeyDisclaimer}</strong>
              <span>Bản trải nghiệm không phải hệ thống xét duyệt hay hồ sơ chính thức.</span>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15} direction="scale">
          <JourneyMap />
        </ScrollReveal>
      </div>
    </main>
  )
}
