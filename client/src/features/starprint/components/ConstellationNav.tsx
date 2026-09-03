import { useState } from 'react'
import { useStarprintStore } from '../store/useStarprintStore'
import { gameSfx } from '../services/gameSfx'
import type { StarprintStep } from '../types/game.types'

const MINI_GAMES: { step: StarprintStep; label: string; icon: string }[] = [
  { step: 'SOLVE', label: 'SOLVE', icon: '⚡' },
  { step: 'SENSE', label: 'SENSE', icon: '💫' },
  { step: 'SPRINT', label: 'SPRINT', icon: '🏃' },
  { step: 'SUPPORT', label: 'SUPPORT', icon: '🤝' },
  { step: 'SYNC', label: 'SYNC', icon: '🎴' },
]

export function ConstellationNav() {
  const { currentStep } = useStarprintStore()
  const [muted, setMuted] = useState(gameSfx.isMuted())

  const handleToggleSound = () => {
    const next = gameSfx.toggleMute()
    setMuted(next)
    if (!next) {
      gameSfx.play('ui_select')
    }
  }

  const isGameActive = MINI_GAMES.some((g) => g.step === currentStep) || currentStep === 'COLOR_PICKER'
  if (!isGameActive) return null

  const currentIndex = MINI_GAMES.findIndex((g) => g.step === currentStep)
  const effectiveIndex = currentIndex >= 0 ? currentIndex : currentStep === 'COLOR_PICKER' ? 5 : -1

  return (
    <nav className="constellation-nav" aria-label="Hành trình 5 trò chơi STARPRINT">
      <div className="constellation-nodes" role="tablist">
        {MINI_GAMES.map((game, idx) => {
          const isCompleted = idx < effectiveIndex
          const isCurrent = idx === effectiveIndex

          return (
            <div
              key={game.step}
              className={`constellation-node ${
                isCompleted ? 'node--completed' : isCurrent ? 'node--active' : 'node--upcoming'
              }`}
              role="tab"
              aria-selected={isCurrent}
              aria-label={`${game.label}: ${isCompleted ? 'Đã hoàn thành' : isCurrent ? 'Đang chơi' : 'Chưa mở'}`}
            >
              <div className="node-dot">
                <span className="node-icon">{isCompleted ? '✦' : game.icon}</span>
              </div>
              <span className="node-label">{game.label}</span>
              {idx < MINI_GAMES.length - 1 && (
                <div
                  className={`node-connector ${idx < effectiveIndex ? 'connector--lit' : ''}`}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className="sound-toggle-btn"
        onClick={handleToggleSound}
        aria-label={muted ? 'Bật âm thanh trò chơi' : 'Tắt âm thanh trò chơi'}
        title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </nav>
  )
}
