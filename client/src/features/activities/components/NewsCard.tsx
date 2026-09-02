import { motion, useReducedMotion } from 'motion/react'
import type { NewsItem } from '@5ss/contracts'
import { MediaPlaceholder } from '@/shared/components/MediaPlaceholder'
import { formatDisplayDate } from '@/shared/utils/formatDate'

type NewsCardProps = {
  item: NewsItem
  variant?: 'featured' | 'secondary' | 'regular'
  onClick: () => void
  mediaFit?: 'cover' | 'contain' | 'poster'
  index?: number
}

const VARIANTS: Array<'cyan' | 'blue' | 'violet' | 'gold' | 'green'> = [
  'violet',
  'cyan',
  'blue',
  'gold',
  'green',
]

export function NewsCard({
  item,
  variant = 'regular',
  onClick,
  mediaFit = 'cover',
  index = 0,
}: NewsCardProps) {
  const reduceMotion = useReducedMotion()
  const placeholderVariant = VARIANTS[index % VARIANTS.length]

  return (
    <motion.button
      type="button"
      className={`news-card news-card--${variant}`}
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: variant === 'featured' ? -5 : -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <div className="news-card__media">
        <MediaPlaceholder
          src={item.imageUrl}
          alt={`Ảnh bài viết: ${item.title}`}
          label={`Tin ${String(index + 1).padStart(2, '0')}`}
          variant={placeholderVariant}
          fit={mediaFit}
          aspectRatio="16/9"
        />
        <span className="news-card__tag">{item.tag}</span>
      </div>

      <div className="news-card__body">
        <time className="news-card__date">{formatDisplayDate(item.publishedAt)}</time>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__excerpt">{item.excerpt}</p>
        <span className="news-card__cta">
          {variant === 'featured' ? 'Đọc toàn bộ bài viết' : 'Đọc bài viết'}{' '}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </motion.button>
  )
}
