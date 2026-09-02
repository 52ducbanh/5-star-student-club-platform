import { normalizeMediaUrl } from '@/shared/services/http/apiClient'

export const DEFAULT_STAR_AVATAR = '/assets/starprint/default-star-avatar.png'

/**
 * Authoritative avatar resolver for STAR CARD.
 * Custom photo URL -> normalized full URL
 * No photo / empty / null -> /assets/starprint/default-star-avatar.png
 */
export function resolveStarCardAvatar(photoUrl?: string | null): string {
  if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.trim() === '') {
    return DEFAULT_STAR_AVATAR
  }
  const normalized = normalizeMediaUrl(photoUrl)
  return normalized || DEFAULT_STAR_AVATAR
}
