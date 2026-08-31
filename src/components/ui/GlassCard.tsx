import type { ReactNode, HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <div className={`glass-card ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
