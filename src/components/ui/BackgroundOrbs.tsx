/**
 * Ambient decorative background orbs.
 * Purely decorative, aria-hidden.
 * Use inside a relative-positioned container.
 */
export function BackgroundOrbs({ count = 3 }: { count?: 2 | 3 }) {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      {count >= 3 && <div className="bg-orb bg-orb--3" />}
    </div>
  )
}
