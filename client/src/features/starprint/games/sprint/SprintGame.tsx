import { useState, useCallback, useEffect, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { SPRINT_TRACKS, type SprintLane, type ClientTrackDefinition } from './sprint-tracks'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SprintEventV2, SprintAttemptV2, SprintRawResultV2 } from '@5ss/contracts'

type GamePhase = 'TUTORIAL' | 'RUNNING' | 'ATTEMPT_END' | 'SUBMITTING'

export function SprintGame() {
  const [phase, setPhase] = useState<GamePhase>('TUTORIAL')
  const [attemptNumber, setAttemptNumber] = useState<1 | 2>(1)
  const [lane, setLane] = useState<SprintLane>(1)
  const [isJumping, setIsJumping] = useState(false)
  const [isStumbling, setIsStumbling] = useState(false)
  const [starsCount, setStarsCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [tutorialCountdown, setTutorialCountdown] = useState(3)
  const [error, setError] = useState<string | null>(null)

  // Track selection: deterministic choice based on sessionId, or fallback to Track A
  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()
  const trackRef = useRef<ClientTrackDefinition>(SPRINT_TRACKS[0])

  useEffect(() => {
    if (sessionId) {
      // Pick stable track from sessionId
      const charCode = sessionId.charCodeAt(0) || 0
      trackRef.current = SPRINT_TRACKS[charCode % SPRINT_TRACKS.length]
    }
  }, [sessionId])

  const gameStartRef = useRef(Date.now())
  const attemptStartRef = useRef(Date.now())
  const laneRef = useRef<SprintLane>(1)
  const isJumpingRef = useRef(false)
  const eventsRef = useRef<SprintEventV2[]>([])
  const attemptsRef = useRef<SprintAttemptV2[]>([])
  const collidedObstaclesRef = useRef<Set<string>>(new Set())
  const processedEventsRef = useRef<Set<string>>(new Set())
  const animFrameRef = useRef<number | null>(null)
  const finalResultRef = useRef<SprintRawResultV2 | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Sync state with refs for event loop
  useEffect(() => {
    laneRef.current = lane
  }, [lane])

  useEffect(() => {
    isJumpingRef.current = isJumping
  }, [isJumping])

  // Tutorial timer
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
    if (phase !== 'RUNNING' || isJumpingRef.current) return
    setIsJumping(true)
    eventsRef.current.push({
      type: 'action',
      atMs: Date.now() - attemptStartRef.current,
      action: 'jump',
      fromLane: laneRef.current,
      toLane: laneRef.current,
    })
    setTimeout(() => {
      setIsJumping(false)
    }, 550)
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

    if (attemptNumber === 1) {
      setPhase('ATTEMPT_END')
    } else {
      // 2nd attempt completed -> finish game
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

      // Process track events
      for (const event of track.events) {
        if (processedEventsRef.current.has(event.id)) continue

        // Check if event time has arrived
        if (elapsed >= event.atMs - 100 && elapsed <= event.atMs + 400) {
          const currentLane = laneRef.current
          const jumping = isJumpingRef.current

          if (event.type === 'collectible-star') {
            if (currentLane === event.lane) {
              processedEventsRef.current.add(event.id)
              eventsRef.current.push({
                type: 'collectible-collected',
                atMs: elapsed,
                collectibleId: event.id,
              })
              setStarsCount((prev) => prev + 1)
            } else if (elapsed > event.atMs + 200) {
              processedEventsRef.current.add(event.id)
            }
          } else if (event.type === 'obstacle-blocker') {
            if (currentLane === event.lane) {
              // Collision!
              if (!collidedObstaclesRef.current.has(event.id)) {
                collidedObstaclesRef.current.add(event.id)
                processedEventsRef.current.add(event.id)
                eventsRef.current.push({
                  type: 'collision',
                  atMs: elapsed,
                  obstacleId: event.id,
                })
                setIsStumbling(true)
                setTimeout(() => setIsStumbling(false), 600)
              }
            } else {
              // Successfully avoided
              processedEventsRef.current.add(event.id)
              eventsRef.current.push({
                type: 'obstacle-cleared',
                atMs: elapsed,
                obstacleId: event.id,
              })
            }
          } else if (event.type === 'obstacle-barrier') {
            if (currentLane === event.lane) {
              if (jumping) {
                // Successfully jumped over barrier!
                processedEventsRef.current.add(event.id)
                eventsRef.current.push({
                  type: 'obstacle-cleared',
                  atMs: elapsed,
                  obstacleId: event.id,
                })
              } else if (!collidedObstaclesRef.current.has(event.id)) {
                // Collided with barrier!
                collidedObstaclesRef.current.add(event.id)
                processedEventsRef.current.add(event.id)
                eventsRef.current.push({
                  type: 'collision',
                  atMs: elapsed,
                  obstacleId: event.id,
                })
                setIsStumbling(true)
                setTimeout(() => setIsStumbling(false), 600)
              }
            } else {
              // In another lane -> avoided
              processedEventsRef.current.add(event.id)
              eventsRef.current.push({
                type: 'obstacle-cleared',
                atMs: elapsed,
                obstacleId: event.id,
              })
            }
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
  }, [phase, endAttempt])

  const startRetry = () => {
    // Exact same track, fresh attempt
    setAttemptNumber(2)
    setLane(1)
    laneRef.current = 1
    setIsJumping(false)
    setIsStumbling(false)
    setStarsCount(0)
    setProgress(0)
    eventsRef.current = []
    collidedObstaclesRef.current = new Set()
    processedEventsRef.current = new Set()
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
      trackId: trackRef.current.trackId,
      attempts: attemptsRef.current,
    }
    void submitFinal(rawResult)
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  const track = trackRef.current
  const elapsed = phase === 'RUNNING' ? Date.now() - attemptStartRef.current : 0

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
        <span className="game-progress__step">Lượt chạy {attemptNumber}/2 · Đường chạy 3 làn</span>
        <span className="game-progress__stars" aria-label={`Thu thập: ${starsCount} ngôi sao`}>
          ⭐ {starsCount}
        </span>
      </div>

      <div className="game-progress-bar" role="progressbar" aria-valuenow={progress * 100} aria-valuemin={0} aria-valuemax={100}>
        <div className="game-progress-bar__fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {phase === 'TUTORIAL' && (
        <div className="sprint-tutorial-overlay" role="dialog" aria-modal="true" aria-label="Hướng dẫn chơi SPRINT">
          <h3>Sẵn sàng xuất phát!</h3>
          <p>
            🎮 <strong>Phím mũi tên / A D</strong>: Chuyển làn trái - phải<br />
            🚀 <strong>Phím Space / W</strong>: Nhảy qua chướng ngại vật thấp<br />
            📱 <strong>Trên điện thoại</strong>: Vuốt trái/phải để đổi làn, chạm hoặc vuốt lên để nhảy
          </p>
          <div className="sprint-tutorial-countdown" aria-live="assertive">
            Bắt đầu sau: <span>{tutorialCountdown}</span>
          </div>
        </div>
      )}

      {/* 3-Lane Track Simulation View */}
      <div className="sprint-stage">
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
            track.events.map((e) => {
              const timeToPlayer = e.atMs - elapsed
              // Show elements approaching in the 2.5s window
              if (timeToPlayer < -200 || timeToPlayer > 2500) return null
              const topPercent = Math.max(0, Math.min(100, 100 - (timeToPlayer / 2500) * 100))
              const leftPercent = e.lane === 0 ? 16.6 : e.lane === 1 ? 50 : 83.3

              return (
                <div
                  key={e.id}
                  className={`sprint-entity entity--${e.type} ${collidedObstaclesRef.current.has(e.id) ? 'entity--hit' : ''}`}
                  style={{
                    top: `${topPercent}%`,
                    left: `${leftPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  aria-hidden="true"
                >
                  {e.type === 'collectible-star' ? '⭐' : e.type === 'obstacle-barrier' ? '🚧' : '🛑'}
                </div>
              )
            })}

          {/* Player Avatar */}
          <div
            className={`sprint-player ${isJumping ? 'player--jumping' : ''} ${isStumbling ? 'player--stumble' : ''}`}
            style={{
              left: lane === 0 ? '16.6%' : lane === 1 ? '50%' : '83.3%',
              transform: 'translate(-50%, -50%)',
            }}
            aria-label={`Người chơi đang ở làn ${lane === 0 ? 'Trái' : lane === 1 ? 'Giữa' : 'Phải'}`}
          >
            <div className="sprint-player__icon">⚡</div>
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
            disabled={phase !== 'RUNNING' || isJumping}
            aria-label="Nhảy"
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
      </div>

      {phase === 'ATTEMPT_END' && (
        <div className="sprint-attempt-modal" role="dialog" aria-modal="true" aria-label="Kết thúc lượt 1">
          <h3>🏁 Lượt chạy 1 hoàn thành!</h3>
          <p>
            Bạn đã hoàn thành đường chạy với <strong>{starsCount}</strong> sao thu thập được.<br />
            Bạn có thể thử lại lượt 2 trên <strong>cùng đường chạy</strong> để cải thiện thành tích, hoặc tiếp tục chặng tiếp theo.
          </p>
          <div className="sprint-attempt-actions">
            <button type="button" className="btn btn--outline" onClick={startRetry}>
              🔄 Thử lại lượt 2
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
