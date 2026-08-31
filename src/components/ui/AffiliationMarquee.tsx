import { Sparkles } from 'lucide-react'
import logoStrip from '../../assets/SV5T.svg'

const stripCopiesPerCycle = [0, 1, 2]

export function AffiliationMarquee() {
  return (
    <div
      className="affiliation-marquee"
      aria-label="Các biểu trưng đồng hành cùng 5SS UET"
      title="Biểu trưng Hội Sinh viên & Các đơn vị đồng hành UET"
    >
      <span className="affiliation-marquee__label">
        <Sparkles size={14} aria-hidden="true" />
        Dấu ấn sinh viên UET
      </span>

      <div className="affiliation-marquee__viewport" aria-hidden="true">
        <div className="affiliation-marquee__track">
          {[0, 1].map((cycle) => (
            <div
              className="affiliation-marquee__group"
              aria-hidden="true"
              key={cycle}
            >
              {stripCopiesPerCycle.map((copy) => (
                <img
                  src={logoStrip}
                  alt=""
                  decoding="async"
                  draggable={false}
                  key={`${cycle}-${copy}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
