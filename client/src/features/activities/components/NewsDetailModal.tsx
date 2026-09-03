import { AccessibleModal } from '@/shared/components/AccessibleModal'
import { MediaPlaceholder } from '@/shared/components/MediaPlaceholder'
import { formatDisplayDate } from '@/shared/utils/formatDate'
import type { NewsItem } from '@5ss/contracts'

export function renderParagraphWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="text-[#5eafe8] underline hover:text-[#90cdf4]"
          style={{ wordBreak: 'break-all' }}
        >
          {part}
        </a>
      )
    }
    return part
  })
}

interface NewsDetailModalProps {
  news: NewsItem | null
  isOpen: boolean
  onClose: () => void
}

export function NewsDetailModal({ news, isOpen, onClose }: NewsDetailModalProps) {
  return (
    <AccessibleModal
      open={isOpen}
      onClose={onClose}
      title={news?.title ?? 'Chi tiết tin tức'}
      size="large"
    >
      {news && (
        <article className="detail-article">
          <MediaPlaceholder
            src={news.imageUrl}
            alt={`Ảnh bìa: ${news.title}`}
            variant="violet"
            label="Ảnh bài viết"
          />
          <div className="detail-article__meta">
            <span>{news.tag}</span>
            <time>{formatDisplayDate(news.publishedAt)}</time>
          </div>
          {news.body.map((p, idx) => (
            <p key={idx}>{renderParagraphWithLinks(p)}</p>
          ))}
        </article>
      )}
    </AccessibleModal>
  )
}
