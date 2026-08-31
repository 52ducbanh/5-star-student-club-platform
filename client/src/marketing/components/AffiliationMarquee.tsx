import { Sparkles } from 'lucide-react'
import logoStrip from '../assets/SV5T.svg'

const marqueeCopies = [0, 1, 2, 3]

export function AffiliationMarquee() {
  return (
    <section
      className="affiliation-showcase"
      aria-label="Dấu ấn sinh viên UET - Các biểu trưng đồng hành cùng 5SS UET"
    >
      <div className="affiliation-showcase__inner container--wide">
        {/* Subtle section header / kicker */}
        <div className="affiliation-showcase__header">
          <span className="affiliation-showcase__kicker">
            <Sparkles size={13} aria-hidden="true" />
            Dấu ấn sinh viên UET
          </span>
        </div>

        {/* Desktop Static Showcase (>= 1024px) */}
        <div className="affiliation-showcase__desktop">
          <div className="affiliation-showcase__logo-container">
            <img
              src={logoStrip}
              alt="Các biểu trưng đồng hành cùng Sinh viên 5 Tốt UET"
              className="affiliation-showcase__logo-img"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>

        {/* Tablet & Mobile Marquee Viewport (< 1024px) */}
        <div className="affiliation-showcase__mobile-viewport" aria-hidden="true">
          <div className="affiliation-showcase__track">
            {marqueeCopies.map((copyIndex) => (
              <div
                className="affiliation-showcase__group"
                aria-hidden="true"
                key={copyIndex}
              >
                <img
                  src={logoStrip}
                  alt=""
                  className="affiliation-showcase__mobile-img"
                  decoding="async"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
