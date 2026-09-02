import { StarprintIdentityCard } from './StarprintIdentityCard'
import type { LegacyStarEffect, StarEffect, WingPalette } from '@5ss/contracts'

export interface StarCardData {
  id: string
  publicStarId?: string | null
  nickname: string
  photoUrl?: string | null
  palette: WingPalette | readonly string[] | string[]
  wingPalette?: WingPalette | null
  type: {
    id?: string
    name: string
    tagline?: string
    description?: string
  }
  effect: LegacyStarEffect | StarEffect
  baseColor?: string
}

export interface StarCardProps {
  starprint: StarCardData
  className?: string
  id?: string
  mode?: 'display' | 'export'
}

export function StarCard({
  starprint,
  className = '',
  id = 'star-card-digital',
  mode = 'display',
}: StarCardProps) {
  const colors = starprint.wingPalette && starprint.wingPalette.length === 5
    ? starprint.wingPalette
    : starprint.palette
  const publicId = starprint.publicStarId || starprint.id
  const description = starprint.type.tagline || starprint.type.description || 'Think with purpose.'

  return (
    <StarprintIdentityCard
      nickname={starprint.nickname}
      typeName={starprint.type.name}
      description={description}
      starId={publicId}
      palette={colors}
      effect={starprint.effect}
      photoUrl={starprint.photoUrl || null}
      className={className}
      id={id}
      mode={mode}
    />
  )
}

