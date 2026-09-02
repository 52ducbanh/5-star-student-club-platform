import { Clock3, MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { EventItem } from '@5ss/contracts'
import { MediaPlaceholder } from '@/shared/components/MediaPlaceholder'
import { formatDisplayDate, formatTimeRange } from '@/shared/utils/formatDate'
import { classifyEventTemporal } from '../utils/activitySorting'

type EventCardProps = {
  item: EventItem
  onClick: () => void
  mediaFit?: 'cover' | 'contain' | 'poster'
  index?: number
  variant?: 'featured' | 'regular'
}

export function EventCard({
  item,
  onClick,
  mediaFit = 'cover',
  index = 0,
  variant = 'regular',
}: EventCardProps) {
  const reduceMotion = useReducedMotion()
  const temporalStatus = classifyEventTemporal(item)

  const statusLabel = temporalStatus === 'ongoing'
    ? '● Đang diễn ra'
    : temporalStatus === 'upcoming'
      ? '● Sắp diễn ra'
      : '○ Đã kết thúc'

  return (
    <motion.button
      type="button"
      className={`event-card${variant === 'featured' ? ' event-card--featured' : ''}`}
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="event-card__media-wrap">
        <MediaPlaceholder
          src={item.imageUrl}
          alt={`Ảnh sự kiện: ${item.title}`}
          label={`Sự kiện ${String(index + 1).padStart(2, '0')}`}
          variant={temporalStatus === 'ongoing' ? 'gold' : temporalStatus === 'upcoming' ? 'cyan' : 'blue'}
          fit={mediaFit}
          aspectRatio="16/9"
        />
      </div>

      <div className="event-card__body">
        <span className={`status-badge status-badge--${temporalStatus}`}>
          {statusLabel}
        </span>
        <h3 className="event-card__title">{item.title}</h3>
        <p className="event-card__excerpt">{item.excerpt}</p>
        <div className="event-meta">
          <span>
            <Clock3 size={13} aria-hidden="true" />{' '}
            {formatDisplayDate(item.startAt)} · {formatTimeRange(item.startAt, item.endAt)}
          </span>
          <span>
            <MapPin size={13} aria-hidden="true" /> {item.location}
          </span>
        </div>
      </div>

      <span className="event-card__arrow" aria-hidden="true">→</span>
    </motion.button>
  )
}
