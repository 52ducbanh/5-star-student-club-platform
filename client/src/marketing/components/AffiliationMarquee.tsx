import { useRef } from 'react'
import { Sparkles } from 'lucide-react'
import logoUet from '../assets/logo-uet.png'
import logoDoan from '../assets/logo-doan.png'
import logoHsv from '../assets/logo-hsv.png'
import logoSv5t from '../assets/logo-sv5t.png'

interface AffiliationLogo {
  id: string
  name: string
  src: string
  alt: string
}

const AFFILIATION_LOGOS: AffiliationLogo[] = [
  {
    id: 'uet',
    name: 'Trường Đại học Công nghệ - ĐHQGHN',
    src: logoUet,
    alt: 'Biểu trưng Trường Đại học Công nghệ, ĐHQGHN',
  },
  {
    id: 'doan',
    name: 'Đoàn TNCS Hồ Chí Minh',
    src: logoDoan,
    alt: 'Biểu trưng Đoàn TNCS Hồ Chí Minh - Trường ĐH Công nghệ',
  },
  {
    id: 'hsv',
    name: 'Hội Sinh viên Việt Nam',
    src: logoHsv,
    alt: 'Biểu trưng Hội Sinh viên Việt Nam - Trường ĐH Công nghệ',
  },
  {
    id: 'sv5t',
    name: 'Sinh viên 5 Tốt UET',
    src: logoSv5t,
    alt: 'Biểu trưng Danh hiệu Sinh viên 5 Tốt - 5SS UET',
  },
]

// Repeat the 4 logos 3 times per sequence (12 logos per sequence) for continuous smooth stream
const SEQUENCE_LOGOS = [
  ...AFFILIATION_LOGOS,
  ...AFFILIATION_LOGOS,
  ...AFFILIATION_LOGOS,
]

export function AffiliationMarquee() {
  const trackRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (trackRef.current) {
      const anims = trackRef.current.getAnimations()
      anims.forEach((anim) => {
        anim.playbackRate = 0.35 // Slows down gently on hover
      })
    }
  }

  const handleMouseLeave = () => {
    if (trackRef.current) {
      const anims = trackRef.current.getAnimations()
      anims.forEach((anim) => {
        anim.playbackRate = 1.0 // Resumes normal smooth speed
      })
    }
  }

  return (
    <section
      className="affiliation-showcase"
      aria-label="Dấu ấn sinh viên UET - Các biểu trưng đồng hành cùng 5SS UET"
    >
      <div className="affiliation-showcase__inner">
        {/* Stable and centered section header */}
        <div className="affiliation-showcase__header">
          <span className="affiliation-showcase__kicker">
            <Sparkles size={13} aria-hidden="true" />
            Dấu ấn sinh viên UET
          </span>
        </div>

        {/* Compact centered conveyor viewport with smooth edge masks */}
        <div
          className="affiliation-showcase__viewport"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div ref={trackRef} className="affiliation-showcase__track">
            {/* Primary sequence (accessible) */}
            <div className="affiliation-showcase__sequence" aria-hidden={false}>
              {SEQUENCE_LOGOS.map((logo, idx) => (
                <div key={`seq1-${logo.id}-${idx}`} className="affiliation-showcase__item">
                  <img
                    src={logo.src}
                    alt={idx < AFFILIATION_LOGOS.length ? logo.alt : ''}
                    className="affiliation-showcase__img"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Duplicate sequence for seamless loop */}
            <div className="affiliation-showcase__sequence" aria-hidden={true}>
              {SEQUENCE_LOGOS.map((logo, idx) => (
                <div key={`seq2-${logo.id}-${idx}`} className="affiliation-showcase__item">
                  <img
                    src={logo.src}
                    alt=""
                    className="affiliation-showcase__img"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
