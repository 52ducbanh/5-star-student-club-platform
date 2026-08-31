import type { ReactNode } from 'react'

type PageIntroProps = {
  eyebrow: string
  title: ReactNode
  description: string
  aside?: ReactNode
}

export function PageIntro({ eyebrow, title, description, aside }: PageIntroProps) {
  return (
    <header className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro__description">{description}</p>
      </div>
      {aside && <div className="page-intro__aside">{aside}</div>}
    </header>
  )
}
