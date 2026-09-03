import { Sparkles } from 'lucide-react'
import { StarPrintSVG } from './StarPrintSVG'
import type { LegacyStarEffect, StarEffect, WingPalette } from '@5ss/contracts'

export interface StarprintIdentityCardProps {
  nickname: string
  typeName: string
  description?: string
  starId: string
  palette: WingPalette | readonly string[] | string[]
  effect: LegacyStarEffect | StarEffect
  photoUrl: string | null
  season?: string
  className?: string
  id?: string
  mode?: 'display' | 'export'
}

const VIETNAMESE_TO_ENGLISH_STAR_TYPES: Record<string, string> = {
  'CHIẾN LƯỢC GIA': 'STRATEGIST',
  'NGỌN LỬA': 'SPARK',
  'NGƯỜI KẾT NỐI': 'SYNERGIST',
  'NGƯỜI TÌM KIẾM': 'SEEKER',
  'NGƯỜI KIÊN TRÌ': 'SUSTAINER',
  'NGƯỜI ĐỊNH HƯỚNG': 'NAVIGATOR',
  'NGƯỜI KHÁM PHÁ': 'EXPLORER',
  'CHẤT XÚC TÁC': 'CATALYST',
  'NGƯỜI TRUYỀN LỬA': 'CATALYST',
  'NGƯỜI TIÊN PHONG': 'VISIONARY',
}

const ARCHETYPE_ENGLISH_TAGLINES: Record<string, string> = {
  STRATEGIST: 'Think with purpose.',
  SPARK: 'Turn energy into action.',
  SYNERGIST: 'Connect to create more.',
  SEEKER: 'Stay curious. Keep moving.',
  SUSTAINER: 'Keep the light going.',
  NAVIGATOR: 'Chart the course forward.',
  EXPLORER: 'Discover new horizons.',
  CATALYST: 'Ignite positive momentum.',
  CONNECTOR: 'Connect to create more.',
  VISIONARY: 'Shape tomorrow today.',
}

function compactTypeName(typeName: string): string {
  const clean = typeName.split('(')[0]?.trim() || typeName
  const normalizedKey = clean.toUpperCase().replace(/^THE\s+/i, '').trim()
  const baseName = VIETNAMESE_TO_ENGLISH_STAR_TYPES[normalizedKey] || normalizedKey
  return `THE ${baseName}`
}

function compactStarId(starId: string): string {
  if (starId.startsWith('STAR-') || starId.startsWith('5SS-')) {
    return starId
  }
  const normalized = starId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return `5SS-${normalized.slice(0, 6).padEnd(6, '0')}`
}

function resolveEnglishTagline(typeName: string, description?: string): string {
  const clean = typeName.split('(')[0]?.trim() || typeName
  const normalizedKey = clean.toUpperCase().replace(/^THE\s+/i, '').trim()
  const canonicalKey = VIETNAMESE_TO_ENGLISH_STAR_TYPES[normalizedKey] || normalizedKey
  const fallback = ARCHETYPE_ENGLISH_TAGLINES[canonicalKey] || 'Think with purpose.'
  if (!description) return fallback
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(description)
  if (hasVietnamese) {
    return fallback
  }
  return description
}

export function StarprintIdentityCard({
  nickname,
  typeName,
  description,
  starId,
  palette,
  effect,
  photoUrl,
  season = '2026 - 2027',
  className = '',
  id = 'star-card-digital',
  mode = 'display',
}: StarprintIdentityCardProps) {
  const displayStarId = compactStarId(starId)
  const displayTagline = resolveEnglishTagline(typeName, description)
  const starSize = mode === 'export' ? 380 : 255

  return (
    <article
      id={id}
      className={`starprint-id-card ${mode === 'export' ? 'starprint-id-card--export' : ''} ${className}`}
      aria-label={`STARPRINT of ${nickname}`}
    >
      <header className="starprint-id-card__header">
        <div className="starprint-id-card__brand" aria-label="5SS">
          <span className="starprint-id-card__brand-mark" aria-hidden="true">
            <Sparkles size={mode === 'export' ? 18 : 13} strokeWidth={2.4} />
          </span>
          <span>5SS</span>
        </div>
        <span className="starprint-id-card__season">{season}</span>
      </header>

      <div className="starprint-id-card__body">
        <div className="starprint-id-card__star" aria-hidden="true">
          <StarPrintSVG
            palette={palette}
            effect={effect}
            photoUrl={photoUrl}
            completedWings={5}
            size={starSize}
            animated={mode !== 'export'}
          />
        </div>

        <div className="starprint-id-card__identity">
          <h2>{nickname}</h2>
          <span className="starprint-id-card__type">{compactTypeName(typeName)}</span>
          {displayTagline && (
            <p className="starprint-id-card__tagline">{displayTagline.replace(/^"|"$/g, '')}</p>
          )}
        </div>
      </div>

      <footer className="starprint-id-card__footer">
        <span>Star ID:</span>
        <strong title={starId}>{displayStarId}</strong>
      </footer>
    </article>
  )
}
