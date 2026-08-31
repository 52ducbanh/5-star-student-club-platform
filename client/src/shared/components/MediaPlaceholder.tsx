import { Image, Sparkles } from 'lucide-react'

type MediaPlaceholderProps = {
  src?: string | null
  alt: string
  label?: string
  variant?: 'cyan' | 'blue' | 'violet' | 'gold' | 'green'
  className?: string
  lazy?: boolean
}

export function MediaPlaceholder({
  src,
  alt,
  label = 'Ảnh sẽ được cập nhật',
  variant = 'blue',
  className = '',
  lazy = true,
}: MediaPlaceholderProps) {
  if (src) {
    return (
      <img
        className={`media-placeholder media-placeholder--image ${className}`.trim()}
        src={src}
        alt={alt}
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
