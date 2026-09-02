import type { EventItem, NewsItem } from '@5ss/contracts'

export type TemporalEventStatus = 'ongoing' | 'upcoming' | 'past'

/** Safely parse an ISO date string into milliseconds since epoch, falling back to 0 */
export function parseIsoDate(iso?: string | null): number {
  if (!iso) return 0
  const parsed = Date.parse(iso)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Sorts news articles according to priority:
 * 1. Explicit pinned/featured articles (if present on data model)
 * 2. Newest remaining articles by publishedAt DESC
 */
export function sortNews(items: NewsItem[]): NewsItem[] {
  const cloned = [...items]

  return cloned.sort((a, b) => {
    // 1. Defensively check for optional pinned / featured attributes
    const aPinned = Boolean((a as unknown as { pinned?: boolean; isPinned?: boolean; featured?: boolean; isFeatured?: boolean }).pinned
      ?? (a as unknown as { isPinned?: boolean }).isPinned
      ?? (a as unknown as { featured?: boolean }).featured
      ?? (a as unknown as { isFeatured?: boolean }).isFeatured)
    const bPinned = Boolean((b as unknown as { pinned?: boolean; isPinned?: boolean; featured?: boolean; isFeatured?: boolean }).pinned
      ?? (b as unknown as { isPinned?: boolean }).isPinned
      ?? (b as unknown as { featured?: boolean }).featured
      ?? (b as unknown as { isFeatured?: boolean }).isFeatured)

    if (aPinned && !bPinned) return -1
    if (!aPinned && bPinned) return 1

    // 2. Sort newest published first
    const aTime = parseIsoDate(a.publishedAt)
    const bTime = parseIsoDate(b.publishedAt)
    if (bTime !== aTime) return bTime - aTime

    // Stable secondary sort by id or slug
    return a.id.localeCompare(b.id)
  })
}

/**
 * Classifies an event temporally relative to `now`:
 * - ongoing: startAt <= now <= (endAt ?? startAt)
 * - upcoming: startAt > now
 * - past: (endAt ?? startAt) < now
 */
export function classifyEventTemporal(item: EventItem, now = new Date()): TemporalEventStatus {
  const nowMs = now.getTime()
  const startMs = parseIsoDate(item.startAt)
  const endMs = item.endAt ? parseIsoDate(item.endAt) : startMs

  if (startMs <= nowMs && nowMs <= endMs) {
    return 'ongoing'
  }
  if (startMs > nowMs) {
    return 'upcoming'
  }
  return 'past'
}

/**
 * Sorts and filters events based on their temporal lifecycle:
 * - Ongoing events: soonest ending first
 * - Upcoming events: soonest starting first (nearest upcoming)
 * - Past events: most recently concluded first
 *
 * For 'all': ongoing -> upcoming -> past
 * For 'upcoming': ongoing -> upcoming
 * For 'past': past
 */
export function sortEvents(
  items: EventItem[],
  filter: 'all' | 'upcoming' | 'past' = 'all',
  now = new Date(),
): EventItem[] {
  const ongoing: EventItem[] = []
  const upcoming: EventItem[] = []
  const past: EventItem[] = []

  for (const item of items) {
    const status = classifyEventTemporal(item, now)
    if (status === 'ongoing') ongoing.push(item)
    else if (status === 'upcoming') upcoming.push(item)
    else past.push(item)
  }

  // Ongoing: soonest ending first (ascending endAt)
  ongoing.sort((a, b) => {
    const aEnd = a.endAt ? parseIsoDate(a.endAt) : parseIsoDate(a.startAt)
    const bEnd = b.endAt ? parseIsoDate(b.endAt) : parseIsoDate(b.startAt)
    return aEnd - bEnd
  })

  // Upcoming: soonest starting first (ascending startAt)
  upcoming.sort((a, b) => parseIsoDate(a.startAt) - parseIsoDate(b.startAt))

  // Past: most recent concluded first (descending endAt/startAt)
  past.sort((a, b) => {
    const aEnd = a.endAt ? parseIsoDate(a.endAt) : parseIsoDate(a.startAt)
    const bEnd = b.endAt ? parseIsoDate(b.endAt) : parseIsoDate(b.startAt)
    return bEnd - aEnd
  })

  if (filter === 'upcoming') {
    return [...ongoing, ...upcoming]
  }
  if (filter === 'past') {
    return past
  }
  return [...ongoing, ...upcoming, ...past]
}

/**
 * Determines the featured event for the section:
 * Prefer the first ongoing/upcoming event; if none, the most recent past event.
 */
export function getFeaturedEvent(items: EventItem[], now = new Date()): EventItem | null {
  const sorted = sortEvents(items, 'all', now)
  return sorted[0] ?? null
}
