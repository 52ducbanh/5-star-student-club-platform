import { Sparkles } from 'lucide-react'
import { siteConfig } from '../../config/site'

type BrandMarkProps = {
  compact?: boolean
  className?: string
}

export function BrandMark({ compact = false, className = '' }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${compact ? 'brand-mark--compact' : ''} ${className}`.trim()}>
      {siteConfig.logoSrc ? (
        <span className="brand-mark__icon brand-mark__icon--image">
          <img src={siteConfig.logoSrc} alt={`Logo ${siteConfig.shortName}`} />
        </span>
      ) : (
        <span className="brand-mark__icon" aria-hidden="true">
          <Sparkles size={compact ? 16 : 20} strokeWidth={2.2} />
          <strong>5SS</strong>
        </span>
      )}
      <span className="brand-mark__text">
        <strong>{siteConfig.shortName}</strong>
        {!compact && <small>Sinh viên 5 Tốt</small>}
      </span>
    </span>
  )
}
