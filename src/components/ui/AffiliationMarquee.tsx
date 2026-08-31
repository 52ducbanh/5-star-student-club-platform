import { Sparkles } from 'lucide-react'
import logoStrip from '../../assets/SV5T.svg'

export function AffiliationMarquee() {
  return (
    <div className="affiliation-marquee" aria-label="Các biểu trưng đồng hành cùng 5SS UET">
      <span className="affiliation-marquee__label">
        <Sparkles size={13} aria-hidden="true" />
        Dấu ấn sinh viên UET
      </span>

      <div className="affiliation-marquee__viewport" aria-hidden="true">
        <div className="affiliation-marquee__track">
          <div className="affiliation-marquee__group">
            <img
              src={logoStrip}
              alt=""
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="affiliation-marquee__group" aria-hidden="true">
            <img
              src={logoStrip}
              alt=""
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
