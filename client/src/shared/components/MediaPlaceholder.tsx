import { Image, Sparkles } from 'lucide-react'
import { normalizeMediaUrl } from '@/shared/services/http/apiClient'

type MediaPlaceholderProps = {
  src?: string | null
  alt: string
  label?: string
  variant?: 'cyan' | 'blue' | 'violet' | 'gold' | 'green'
  className?: string
  lazy?: boolean
  fit?: 'cover' | 'contain' | 'poster'
  aspectRatio?: '16/9' | '16/10' | '4/3' | '1/1' | 'auto'
}

export function MediaPlaceholder({
  src,
  alt,
  label = 'Ảnh sẽ được cập nhật',
  variant = 'blue',
  className = '',
  lazy = true,
  fit = 'cover',
  aspectRatio,
}: MediaPlaceholderProps) {
  const resolvedSrc = normalizeMediaUrl(src)
  const style = aspectRatio && aspectRatio !== 'auto'
    ? { aspectRatio: aspectRatio.replace('/', ' / '), minHeight: 0 }
    : undefined

  if (resolvedSrc) {
    if (fit === 'poster') {
      return (
        <div
          className={`media-placeholder media-placeholder--poster ${className}`.trim()}
          style={style}
          role="img"
          aria-label={alt}
        >
          <img
            className="media-placeholder__blur-bg"
            src={resolvedSrc}
            alt=""
            aria-hidden="true"
            loading={lazy ? 'lazy' : 'eager'}
          />
          <img
            className="media-placeholder__fg"
            src={resolvedSrc}
            alt={alt}
            loading={lazy ? 'lazy' : 'eager'}
          />
        </div>
      )
    }

    const fitClass = fit === 'contain' ? ' media-placeholder--contain' : ''
    return (
      <img
        className={`media-placeholder media-placeholder--image${fitClass} ${className}`.trim()}
        src={resolvedSrc}
        alt={alt}
        style={style}
        loading={lazy ? 'lazy' : 'eager'}
      />
    )
  }

  return (
    <div className={`media-placeholder media-placeholder--${variant} ${className}`.trim()} role="img" aria-label={alt}>
      <span className="media-placeholder__orbit" aria-hidden="true" />
      <Sparkles className="media-placeholder__spark" size={18} aria-hidden="true" />
      <Image size={24} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
