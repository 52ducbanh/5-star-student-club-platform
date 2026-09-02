import { useState, useCallback, useEffect, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { SPRINT_TRACKS, type SprintLane, type ClientTrackDefinition } from './sprint-tracks'
import {
  SPRINT_CONFIG,
  calculateEntityTopPercent,
  isEntityInVisibleWindow,
  calculateEntityPerspective,
  calculateJumpElevation,
  evaluateEventInteraction,
  type EntityResolution,
} from './sprint-engine'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SprintEventV2, SprintAttemptV2, SprintRawResultV2 } from '@5ss/contracts'
import { gameSfx } from '../../services/gameSfx'

type GamePhase = 'TUTORIAL' | 'RUNNING' | 'ATTEMPT_END' | 'SUBMITTING'
type PlayerMotionState = 'GROUNDED' | 'JUMPING' | 'STUMBLING' | 'RECOVERING'

interface FloatingFeedback {
  id: string
  text: string
  lane: SprintLane
  type: 'star' | 'hit' | 'clear'
}

export function SprintGame() {
  const [phase, setPhase] = useState<GamePhase>('TUTORIAL')
  const [attemptNumber, setAttemptNumber] = useState<1 | 2>(1)
  const [lane, setLane] = useState<SprintLane>(1)
  const [motionState, setMotionState] = useState<PlayerMotionState>('GROUNDED')
  const [jumpElevation, setJumpElevation] = useState(0)
  const [starsCount, setStarsCount] = useState(0)
  const [collisionsCount, setCollisionsCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [tutorialCountdown, setTutorialCountdown] = useState(3)
  const [hudPulse, setHudPulse] = useState(false)
  const [stageHit, setStageHit] = useState(false)
  const [stageShake, setStageShake] = useState(false)
  const [floatingFeedbacks, setFloatingFeedbacks] = useState<FloatingFeedback[]>([])
  const [collectedStarIds, setCollectedStarIds] = useState<Set<string>>(new Set())
  const [collidedObstacleIds, setCollidedObstacleIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Track selection: deterministic choice based on sessionId, or fallback to Track A
  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()
  const trackIndex = sessionId ? (sessionId.charCodeAt(0) || 0) % SPRINT_TRACKS.length : 0
  const currentTrack = SPRINT_TRACKS[trackIndex]
  const trackRef = useRef<ClientTrackDefinition>(currentTrack)
  useEffect(() => {
    trackRef.current = currentTrack
  }, [currentTrack])

  const gameStartRef = useRef(Date.now())
  const attemptStartRef = useRef(Date.now())
  const laneRef = useRef<SprintLane>(1)
  const motionStateRef = useRef<PlayerMotionState>('GROUNDED')
  const jumpStartTimeRef = useRef<number | null>(null)
  const stumbleStartTimeRef = useRef<number | null>(null)
  const eventsRef = useRef<SprintEventV2[]>([])
  const attemptsRef = useRef<SprintAttemptV2[]>([])
  const processedEventsRef = useRef<Set<string>>(new Set())
  const collidedObstaclesRef = useRef<Set<string>>(new Set())
  const collectedStarsRef = useRef<Set<string>>(new Set())
  const entityResolutionsRef = useRef<Map<string, EntityResolution>>(new Map())
  const animFrameRef = useRef<number | null>(null)
  const finalResultRef = useRef<SprintRawResultV2 | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Sync state with refs for fast event loop access
  useEffect(() => {
    laneRef.current = lane
  }, [lane])

  useEffect(() => {
    motionStateRef.current = motionState
  }, [motionState])

  // Tutorial countdown timer
  useEffect(() => {
    if (phase !== 'TUTORIAL') return
    const interval = setInterval(() => {
      setTutorialCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase('RUNNING')
          attemptStartRef.current = Date.now()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  // Action handlers
  const moveLeft = useCallback(() => {
    if (phase !== 'RUNNING') return
    setLane((prev) => {
      if (prev > 0) {
        gameSfx.play('sprint_lane')
        const next = (prev - 1) as SprintLane
        eventsRef.current.push({
          type: 'action',
          atMs: Date.now() - attemptStartRef.current,
          action: 'move-left',
          fromLane: prev,
          toLane: next,
        })
        return next
      }
      return prev
    })
  }, [phase])

  const moveRight = useCallback(() => {
    if (phase !== 'RUNNING') return
    setLane((prev) => {
      if (prev < 2) {
        gameSfx.play('sprint_lane')
        const next = (prev + 1) as SprintLane
        eventsRef.current.push({
          type: 'action',
          atMs: Date.now() - attemptStartRef.current,
          action: 'move-right',
          fromLane: prev,
          toLane: next,
        })
        return next
      }
      return prev
    })
  }, [phase])

  const jump = useCallback(() => {
    if (phase !== 'RUNNING') return
    // Cannot jump if already jumping
    if (motionStateRef.current === 'JUMPING') return

    gameSfx.play('sprint_jump')
    const now = Date.now() - attemptStartRef.current
    jumpStartTimeRef.current = now
    setMotionState('JUMPING')

    eventsRef.current.push({
      type: 'action',
      atMs: now,
      action: 'jump',
      fromLane: laneRef.current,
      toLane: laneRef.current,
    })
  }, [phase])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        moveLeft()
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        moveRight()
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moveLeft, moveRight, jump])

  // Mobile Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    touchStartRef.current = null

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      if (dx < 0) moveLeft()
      else moveRight()
    } else if (dy < -30) {
      jump()
    } else if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      jump()
    }
  }

  const triggerFloatingFeedback = useCallback((text: string, currentLane: SprintLane, type: 'star' | 'hit' | 'clear') => {
    const id = `fb-${Date.now()}-${Math.random()}`
    setFloatingFeedbacks((prev) => [...prev, { id, text, lane: currentLane, type }])
    setTimeout(() => {
      setFloatingFeedbacks((prev) => prev.filter((fb) => fb.id !== id))
    }, 650)
  }, [])

  const submitFinal = useCallback(
    async (rawResult: SprintRawResultV2) => {
      if (!sessionId) return
      setPhase('SUBMITTING')
      setError(null)
      finalResultRef.current = rawResult

      const res = await submitGameWithReconciliation({
        sessionId,
        gameId: 'sprint',
        rawResult,
        nextStep: 'SUPPORT',
        markGameCompleted,
        addGameResult,
        setStep,
      })

      if (!res.success) {
        setError(res.error || 'Lỗi kết nối khi gửi kết quả. Vui lòng bấm thử lại.')
        setPhase('ATTEMPT_END')
      }
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  const endAttempt = useCallback((completed: boolean) => {
    const elapsed = Math.min(Date.now() - attemptStartRef.current, trackRef.current.hardCapMs)
    const attemptRecord: SprintAttemptV2 = {
      attemptNumber,
      completed,
      durationMs: elapsed,
      events: [...eventsRef.current],
    }

    const updatedAttempts = [...attemptsRef.current, attemptRecord]
    attemptsRef.current = updatedAttempts
    gameSfx.play('mini_complete')

    if (attemptNumber === 1) {
      setPhase('ATTEMPT_END')
    } else {
      // 2nd attempt completed -> submit final result
      const rawResult: SprintRawResultV2 = {
        gameId: 'sprint',
        payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
        contentVersion: STARPRINT_VERSIONS.officialV2.content,
        startedAtMs: gameStartRef.current,
        completedAtMs: Date.now(),
        trackId: trackRef.current.trackId,
        attempts: updatedAttempts,
      }
      void submitFinal(rawResult)
    }
  }, [attemptNumber, submitFinal])

  // Game Loop
  useEffect(() => {
    if (phase !== 'RUNNING') return

    const track = trackRef.current
    let running = true

    const loop = () => {
      if (!running) return
      const elapsed = Date.now() - attemptStartRef.current
      const currentProgress = Math.min(elapsed / track.expectedDurationMs, 1)
      setProgress(currentProgress)

      // Calculate jump elevation
      const currentElevation = calculateJumpElevation(jumpStartTimeRef.current, elapsed)
      setJumpElevation(currentElevation)

      // Update motion state if jump finished
      if (motionStateRef.current === 'JUMPING' && currentElevation <= 0) {
        jumpStartTimeRef.current = null
        setMotionState('GROUNDED')
      }

      // Update stumble / recovery lifecycle
      if (stumbleStartTimeRef.current !== null) {
        const stumbleElapsed = elapsed - stumbleStartTimeRef.current
        if (stumbleElapsed >= SPRINT_CONFIG.RECOVERY_DURATION_MS) {
          stumbleStartTimeRef.current = null
          if (motionStateRef.current === 'RECOVERING' || motionStateRef.current === 'STUMBLING') {
            setMotionState('GROUNDED')
          }
        } else if (stumbleElapsed >= SPRINT_CONFIG.STUMBLE_DURATION_MS && motionStateRef.current === 'STUMBLING') {
          setMotionState('RECOVERING')
        }
      }

      // Process track events
      for (const event of track.events) {
        if (processedEventsRef.current.has(event.id)) continue

        const { resolved, resolution, emittedEvent } = evaluateEventInteraction(
          event,
          elapsed,
          laneRef.current,
          currentElevation,
        )

        if (resolved) {
          processedEventsRef.current.add(event.id)
          entityResolutionsRef.current.set(event.id, resolution)

          if (emittedEvent) {
            eventsRef.current.push(emittedEvent)
          }

          if (resolution === 'COLLECTED') {
            collectedStarsRef.current.add(event.id)
            setCollectedStarIds((prev) => new Set(prev).add(event.id))
            setStarsCount((prev) => prev + 1)
            setHudPulse(true)
            gameSfx.play('sprint_star')
            gameSfx.vibrate(20)
            setTimeout(() => setHudPulse(false), 350)
            triggerFloatingFeedback('+1 ⭐', event.lane, 'star')
          } else if (resolution === 'COLLIDED') {
            collidedObstaclesRef.current.add(event.id)
            setCollidedObstacleIds((prev) => new Set(prev).add(event.id))
            setCollisionsCount((prev) => prev + 1)
            stumbleStartTimeRef.current = elapsed
            setMotionState('STUMBLING')
            setStageHit(true)
            setStageShake(true)
            if (event.type === 'obstacle-barrier') {
              gameSfx.play('sprint_barrier_hit')
              gameSfx.vibrate([20, 30, 40])
            } else {
              gameSfx.play('sprint_blocker_hit')
              gameSfx.vibrate([30, 40, 50])
            }
            setTimeout(() => setStageHit(false), 300)
            setTimeout(() => setStageShake(false), 250)
            triggerFloatingFeedback(
              event.type === 'obstacle-barrier' ? '🚧 Vấp ngã!' : '🛑 Va chạm!',
              laneRef.current,
              'hit',
            )
          }
        }
      }

      // Check track finish
      if (elapsed >= track.expectedDurationMs || elapsed >= track.hardCapMs) {
        running = false
        endAttempt(true)
        return
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      running = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [phase, endAttempt, triggerFloatingFeedback])

  const startRetry = () => {
    // Exact same track, fresh attempt transient state
    setAttemptNumber(2)
    setLane(1)
    laneRef.current = 1
    setMotionState('GROUNDED')
    motionStateRef.current = 'GROUNDED'
    jumpStartTimeRef.current = null
    stumbleStartTimeRef.current = null
    setJumpElevation(0)
    setStarsCount(0)
    setCollisionsCount(0)
    setCollectedStarIds(new Set())
    setCollidedObstacleIds(new Set())
    setProgress(0)
    setStageHit(false)
    setStageShake(false)
    setFloatingFeedbacks([])
    eventsRef.current = []
    processedEventsRef.current = new Set()
    collidedObstaclesRef.current = new Set()
    collectedStarsRef.current = new Set()
    entityResolutionsRef.current = new Map()
    attemptStartRef.current = Date.now()
    setPhase('RUNNING')
  }

  const acceptFirstAttempt = () => {
    const rawResult: SprintRawResultV2 = {
      gameId: 'sprint',
      payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
      contentVersion: STARPRINT_VERSIONS.officialV2.content,
      startedAtMs: gameStartRef.current,
      completedAtMs: Date.now(),
      trackId: currentTrack.trackId,
      attempts: attemptsRef.current,
    }
    void submitFinal(rawResult)
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  const elapsed = phase === 'RUNNING' ? progress * currentTrack.expectedDurationMs : 0

  return (
    <div
      className="game-step sprint-game"
      role="region"
      aria-label="Trò chơi SPRINT 3 làn chạy"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="game-progress" aria-live="polite">
        <span className="game-progress__badge">🏃 SPRINT</span>
        <span className="game-progress__step">Lượt {attemptNumber}/2 · 3 làn chạy</span>
        <span className={`game-progress__stars ${hudPulse ? 'stars--pulse' : ''}`} aria-label={`Thu thập: ${starsCount} ngôi sao`}>
          ⭐ {starsCount}
        </span>
      </div>

      <div className="game-progress-bar" role="progressbar" aria-valuenow={progress * 100} aria-valuemin={0} aria-valuemax={100}>
        <div className="game-progress-bar__fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <p className="game-micro-intro">Né vật cản, nhảy rào và thu thập sao năng lượng (~26s)</p>

      {phase === 'TUTORIAL' && (
        <div className="sprint-tutorial-overlay" role="dialog" aria-modal="true" aria-label="Hướng dẫn chơi SPRINT">
          <h3>Sẵn sàng xuất phát!</h3>
          <div className="sprint-tutorial-keys">
            <div className="sprint-tutorial-card">
              <span className="sprint-tutorial-icon">⬅️ ➡️</span>
              <p><strong>Đổi làn</strong><br />Phím A D / Mũi tên / Vuốt</p>
            </div>
            <div className="sprint-tutorial-card">
              <span className="sprint-tutorial-icon">⬆️ 🚀</span>
              <p><strong>Nhảy rào thấp</strong><br />Space / W / Vuốt lên</p>
            </div>
          </div>
          <div className="sprint-tutorial-countdown" aria-live="assertive">
            Xuất phát sau: <span>{tutorialCountdown > 0 ? tutorialCountdown : 'CHẠY!'}</span>
          </div>
        </div>
      )}

      {/* 3-Lane Track Simulation View */}
      <div className={`sprint-stage ${stageHit ? 'stage--hit' : ''} ${stageShake ? 'stage--shake' : ''}`}>
        <div className="sprint-lanes">
          <div className={`sprint-lane ${lane === 0 ? 'lane--active' : ''}`}>
            <span className="lane-label">Trái</span>
          </div>
          <div className={`sprint-lane ${lane === 1 ? 'lane--active' : ''}`}>
            <span className="lane-label">Giữa</span>
          </div>
          <div className={`sprint-lane ${lane === 2 ? 'lane--active' : ''}`}>
            <span className="lane-label">Phải</span>
          </div>
        </div>

        {/* Dynamic Obstacles & Collectibles preview */}
        <div className="sprint-elements-layer">
          {phase === 'RUNNING' &&
            currentTrack.events.map((e) => {
              const topPercent = calculateEntityTopPercent(e.atMs, elapsed)
              // Only render entities currently in the active visible approach window [-12%, 106%]
              if (!isEntityInVisibleWindow(topPercent)) return null

              const isCollected = collectedStarIds.has(e.id)
              const isHit = collidedObstacleIds.has(e.id)

              // If star has been collected and passed the player, unmount it
              if (isCollected && topPercent > 86) return null

              const leftPercent = e.lane === 0 ? 16.6 : e.lane === 1 ? 50 : 83.3
              const { scale: entityScale, opacity: baseOpacity } = calculateEntityPerspective(topPercent)
              const entityOpacity = isHit ? 0.85 : baseOpacity

              if (e.type === 'collectible-star') {
                return (
                  <div
                    key={e.id}
                    className={`sprint-entity entity--star ${isCollected ? 'entity--collected' : ''}`}
                    style={{
                      top: `${topPercent}%`,
                      left: `${leftPercent}%`,
                      transform: `translate(-50%, -50%) scale(${entityScale})`,
                      opacity: entityOpacity,
                    }}
                    aria-hidden="true"
                  >
                    <svg className="star-svg" viewBox="0 0 36 36" width="34" height="34" fill="none">
                      <circle cx="18" cy="18" r="14" fill="rgba(255, 212, 103, 0.18)" filter="blur(2px)" />
                      <polygon
                        points="18,3 22,13 33,14 24,22 27,33 18,27 9,33 12,22 3,14 14,13"
                        fill="url(#starGoldGradient)"
                        stroke="#fff"
                        strokeWidth="1.2"
                      />
                      <defs>
                        <linearGradient id="starGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fff2a8" />
                          <stop offset="50%" stopColor="#ffd467" />
                          <stop offset="100%" stopColor="#e59800" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )
              }

              if (e.type === 'obstacle-barrier') {
                return (
                  <div
                    key={e.id}
                    className={`sprint-entity entity--barrier ${isHit ? 'entity--crashed' : ''}`}
                    style={{
                      top: `${topPercent}%`,
                      left: `${leftPercent}%`,
                      transform: `translate(-50%, -50%) scale(${entityScale})`,
                      opacity: entityOpacity,
                    }}
                    aria-hidden="true"
                  >
                    <div className="barrier-hurdle">
                      <div className="barrier-stripes" />
                      <div className="barrier-feet" />
                    </div>
                  </div>
                )
              }

              if (e.type === 'obstacle-blocker') {
                return (
                  <div
                    key={e.id}
                    className={`sprint-entity entity--blocker ${isHit ? 'entity--blocked' : ''}`}
                    style={{
                      top: `${topPercent}%`,
                      left: `${leftPercent}%`,
                      transform: `translate(-50%, -50%) scale(${entityScale})`,
                      opacity: entityOpacity,
                    }}
                    aria-hidden="true"
                  >
                    <div className="blocker-pillar">
                      <div className="blocker-warning-icon">⛔</div>
                      <div className="blocker-grid" />
                    </div>
                  </div>
                )
              }

              return null
            })}

          {/* Floating In-Game Feedbacks */}
          {floatingFeedbacks.map((fb) => {
            const leftPercent = fb.lane === 0 ? 16.6 : fb.lane === 1 ? 50 : 83.3
            return (
              <div
                key={fb.id}
                className={`sprint-feedback-float feedback--${fb.type}`}
                style={{
                  top: '72%',
                  left: `${leftPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                aria-hidden="true"
              >
                {fb.text}
              </div>
            )
          })}

          {/* Player Avatar */}
          <div
            className={`sprint-player ${
              motionState === 'JUMPING'
                ? 'player--jumping'
                : motionState === 'STUMBLING'
                ? 'player--stumble'
                : motionState === 'RECOVERING'
                ? 'player--recovering'
                : ''
            }`}
            style={{
              left: lane === 0 ? '16.6%' : lane === 1 ? '50%' : '83.3%',
              transform: `translate(-50%, calc(-50% - ${jumpElevation * 54}px)) scale(${1 + jumpElevation * 0.2})`,
            }}
            aria-label={`Người chơi ở làn ${lane === 0 ? 'Trái' : lane === 1 ? 'Giữa' : 'Phải'}`}
          >
            <div className="sprint-player__shadow" style={{ opacity: 1 - jumpElevation * 0.7, transform: `scale(${1 - jumpElevation * 0.4})` }} />
            <div className="sprint-player__icon">⚡</div>
          </div>
        </div>
      </div>

      {/* On-screen control buttons for mobile / touch */}
      <div className="sprint-touch-controls" role="group" aria-label="Điều khiển cảm ứng">
        <button
          type="button"
          className="btn btn--outline touch-btn"
          onClick={moveLeft}
          disabled={phase !== 'RUNNING'}
          aria-label="Sang trái"
        >
          ⬅️ Trái
        </button>
        <button
          type="button"
          className="btn btn--primary touch-btn jump-btn"
          onClick={jump}
          disabled={phase !== 'RUNNING' || motionState === 'JUMPING'}
          aria-label="Nhảy qua rào"
        >
          ⬆️ Nhảy
        </button>
        <button
          type="button"
          className="btn btn--outline touch-btn"
          onClick={moveRight}
          disabled={phase !== 'RUNNING'}
          aria-label="Sang phải"
        >
          Phải ➡️
        </button>
      </div>

      {phase === 'ATTEMPT_END' && (
        <div className="sprint-attempt-modal" role="dialog" aria-modal="true" aria-label="Kết thúc lượt 1">
          <h3>🏁 Lượt chạy 1 hoàn thành!</h3>
          <div className="sprint-attempt-summary">
            <div className="summary-metric">
              <span className="metric-label">Sao thu thập:</span>
              <span className="metric-value">⭐ {starsCount}</span>
            </div>
            <div className="summary-metric">
              <span className="metric-label">Số lần va chạm:</span>
              <span className="metric-value">💥 {collisionsCount}</span>
            </div>
          </div>
          <p>
            Bạn có thể thử lại lượt 2 trên <strong>cùng đường chạy</strong> để cải thiện thành tích, hoặc tiếp tục chặng tiếp theo.
          </p>
          <div className="sprint-attempt-actions">
            <button type="button" className="btn btn--outline" onClick={startRetry}>
              🔄 Thử lại cùng đường chạy
            </button>
            <button type="button" className="btn btn--primary" onClick={acceptFirstAttempt}>
              Tiếp tục 🚀
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="game-error-box" role="alert">
          <p className="field-error">{error}</p>
          <button type="button" className="btn btn--primary" onClick={retrySubmit}>
            Thử gửi lại 🔄
          </button>
        </div>
      )}

      {phase === 'SUBMITTING' && <p className="game-submitting" aria-live="polite">Đang ghi nhận kết quả SPRINT...</p>}
    </div>
  )
}
