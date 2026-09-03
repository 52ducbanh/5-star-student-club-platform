import { AccessibleModal } from '@/shared/components/AccessibleModal'
import { MediaPlaceholder } from '@/shared/components/MediaPlaceholder'
import { formatDisplayDate, formatTimeRange } from '@/shared/utils/formatDate'
import { CalendarDays, Clock3, ExternalLink, MapPin, TicketCheck } from 'lucide-react'
import type { EventItem } from '@5ss/contracts'
import { RegistrationForm } from '../RegistrationForm'
import { renderParagraphWithLinks } from './NewsDetailModal'

interface EventDetailModalProps {
  event: EventItem | null
  isOpen: boolean
  onClose: () => void
  registering: boolean
  onStartRegistering: () => void
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  registering,
  onStartRegistering,
}: EventDetailModalProps) {
  return (
    <AccessibleModal
      open={isOpen}
      onClose={onClose}
      title={registering ? 'Đăng ký tham gia sự kiện' : event?.title ?? 'Chi tiết sự kiện'}
      size="large"
    >
      {event && (
        registering ? (
          <RegistrationForm
            eventId={event.id}
            eventTitle={event.title}
            onDone={onClose}
          />
        ) : (
          <article className="detail-article event-detail">
            <MediaPlaceholder
              src={event.imageUrl}
              alt={`Ảnh sự kiện: ${event.title}`}
              variant="cyan"
              label="Ảnh sự kiện"
            />
            <span className={`status-badge status-badge--${event.status}`}>
              {event.status === 'upcoming' ? '● Sắp diễn ra' : '○ Đã kết thúc'}
            </span>
            <div className="event-detail__meta">
              <span>
                <CalendarDays size={15} /> {formatDisplayDate(event.startAt)}
              </span>
              <span>
                <Clock3 size={15} /> {formatTimeRange(event.startAt, event.endAt)}
              </span>
              <span>
                <MapPin size={15} /> {event.location}
              </span>
            </div>
            {event.body.map((p, idx) => (
              <p key={idx}>{renderParagraphWithLinks(p)}</p>
            ))}
            {(() => {
              const googleFormLine = event.body.find(
                (p) => p.includes('docs.google.com/forms') || p.includes('forms.gle'),
              )
              const formMatch = googleFormLine?.match(/https?:\/\/[^\s]+/)
              const formUrl = formMatch ? formMatch[0] : null

              if (formUrl) {
                return (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ExternalLink size={16} /> Đăng ký qua Google Form ↗
                    </a>
                  </div>
                )
              }

              if (event.registrationAvailable) {
                return (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={onStartRegistering}
                    style={{ marginTop: '8px' }}
                  >
                    <TicketCheck size={16} /> Đăng ký tham gia
                  </button>
                )
              }

              return null
            })()}
          </article>
        )
      )}
    </AccessibleModal>
  )
}
