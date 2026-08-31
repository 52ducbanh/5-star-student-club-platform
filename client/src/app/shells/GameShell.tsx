import { Outlet } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'

export function GameShell() {
  return (
    <div className="game-shell" data-reduce-motion={useReducedMotion() || undefined}>
      <Outlet />
    </div>
  )
}
