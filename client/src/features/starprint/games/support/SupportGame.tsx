import { useState, useCallback, useEffect, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { gameSfx } from '../../services/gameSfx'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SupportPuzzleResultV2, SupportRawResultV2 } from '@5ss/contracts'
import { SUPPORT_LEVELS } from './levels/support-levels'
import { SupportEngine } from './engine/support-engine'
import type { SupportObjectState, Point2D } from './engine/support-types'
import { SupportScene } from './SupportScene'

const PUZZLE_TIME_LIMIT_S = 10
const LEVELS = SUPPORT_LEVELS

export function SupportGame() {
  const [currentP, setCurrentP] = useState(0)
  const [timeLeft, setTimeLeft] = useState(PUZZLE_TIME_LIMIT_S)
  const [attachedRopes, setAttachedRopes] = useState<string[]>(() =>
    LEVELS[0].ropes.map((r) => r.ropeId),
  )
  const [cutRopes, setCutRopes] = useState<string[]>([])
  const [objectState, setObjectState] = useState<SupportObjectState>('HANGING')
  const [isResetting, setIsResetting] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gameStartRef = useRef<number>(Date.now())
  const puzzleStartRef = useRef<number>(Date.now())
  const puzzleResultsRef = useRef<SupportPuzzleResultV2[]>([])
  const finalResultRef = useRef<SupportRawResultV2 | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize SFX on mount
  useEffect(() => {
    gameSfx.initOnFirstUserGesture()
  }, [])

  // Pure engine instance
  const engineRef = useRef<SupportEngine>(
    new SupportEngine(LEVELS[0], 0, Date.now()),
  )

  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  // Initialize engine on level change
  useEffect(() => {
    const level = LEVELS[currentP]
    const engine = new SupportEngine(level, currentP, Date.now())
    engineRef.current = engine

    setAttachedRopes(level.ropes.map((r) => r.ropeId))
    setCutRopes([])
    setObjectState('HANGING')
    setIsResetting(false)
    setIsSolved(false)
    setIsInvalid(false)
    setTimeLeft(PUZZLE_TIME_LIMIT_S)
    puzzleStartRef.current = Date.now()
  }, [currentP])

  // Submit final results to server
  const submitFinal = useCallback(
    async (rawResult: SupportRawResultV2) => {
      if (!sessionId) return
      setSubmitting(true)
      setError(null)
      finalResultRef.current = rawResult

      gameSfx.play('mini_complete')

      const res = await submitGameWithReconciliation({
        sessionId,
        gameId: 'support',
        rawResult,
        nextStep: 'SYNC',
        markGameCompleted,
        addGameResult,
        setStep,
      })

      if (!res.success) {
        setError(res.error || 'Lỗi kết nối khi gửi kết quả. Vui lòng bấm thử lại.')
        setSubmitting(false)
      }
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  // Advance to next puzzle or submit game
  const advancePuzzle = useCallback(
    (completed: boolean, timedOut: boolean) => {
      const elapsed = Math.min(Date.now() - puzzleStartRef.current, PUZZLE_TIME_LIMIT_S * 1000)
      const engine = engineRef.current

      if (timedOut) {
        engine.timeout()
        gameSfx.play('timer_timeout')
      } else {
        gameSfx.play('mini_complete')
      }

      const resultRecord = engine.getPuzzleResult(elapsed)
      resultRecord.completed = completed
      resultRecord.timedOut = timedOut

      const nextResults = [...puzzleResultsRef.current, resultRecord]
      puzzleResultsRef.current = nextResults

      if (currentP < LEVELS.length - 1) {
        setCurrentP((prev) => prev + 1)
      } else {
        const rawResult: SupportRawResultV2 = {
          gameId: 'support',
          payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
          contentVersion: STARPRINT_VERSIONS.officialV2.content,
          startedAtMs: gameStartRef.current,
          completedAtMs: Date.now(),
          puzzles: nextResults,
        }
        void submitFinal(rawResult)
      }
    },
    [currentP, submitFinal],
  )

  const advancePuzzleRef = useRef(advancePuzzle)
  useEffect(() => {
    advancePuzzleRef.current = advancePuzzle
  }, [advancePuzzle])

  // Per-puzzle countdown timer (unaffected by resets)
  useEffect(() => {
    if (submitting || isSolved) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        const next = prev - 1
        if (next === 2 || next === 1) {
          gameSfx.play('timer_tick')
        }
        return next
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentP, submitting, isSolved])

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && !submitting && !isSolved) {
      advancePuzzleRef.current(false, true)
    }
  }, [timeLeft, submitting, isSolved])

  // Rope cut handler — shared between swipe-to-cut and tap/click fallback
  const handleCutRope = useCallback(
    (ropeId: string, _cutPoint: Point2D) => {
      if (isResetting || isSolved || submitting) return

      const atMs = Date.now() - puzzleStartRef.current
      const outcome = engineRef.current.cutRope(ropeId, atMs)

      if (!outcome.success) return

      gameSfx.play('support_cut')
      gameSfx.vibrate(15)

      const engineState = engineRef.current.getState()
      setAttachedRopes([...engineState.attachedRopes])
      setCutRopes([...engineState.cutRopes])
      setObjectState(outcome.nextState)

      if (outcome.validation.status === 'COMPLETE') {
        setIsSolved(true)
        gameSfx.play('support_success')
        gameSfx.vibrate(30)
        setTimeout(() => {
          advancePuzzleRef.current(true, false)
        }, 850)
        return
      }

      if (outcome.validation.status === 'INVALID') {
        setIsInvalid(true)
        setIsResetting(true)
        gameSfx.play('support_reset')
        gameSfx.vibrate([20, 20])

        setTimeout(() => {
          const resetAtMs = Date.now() - puzzleStartRef.current
          engineRef.current.triggerReset(resetAtMs)
          const resetState = engineRef.current.getState()

          setAttachedRopes([...resetState.attachedRopes])
          setCutRopes([])
          setObjectState('HANGING')
          setIsInvalid(false)
          setIsResetting(false)
        }, 650)
      }
    },
    [isResetting, isSolved, submitting],
  )

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  const level = LEVELS[currentP]

  return (
    <div className="game-step support-game" role="region" aria-label="Trò chơi SUPPORT cắt dây hỗ trợ">
      <div className="game-progress" aria-live="polite">
        <span className="game-progress__badge">🤝 SUPPORT</span>
        <span className="game-progress__step">Câu đố {currentP + 1}/{LEVELS.length}</span>
        <span className={`game-progress__timer ${timeLeft <= 3 ? 'timer--urgent' : ''}`} aria-label={`Thời gian: ${timeLeft}s`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div
        className="game-progress-bar"
        role="progressbar"
        aria-valuenow={((currentP + 1) / LEVELS.length) * 100}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="game-progress-bar__fill"
          style={{ width: `${((currentP + 1) / LEVELS.length) * 100}%` }}
        />
      </div>

      <p className="game-micro-intro">Vuốt qua dây để đưa ngôi sao tới mục tiêu (~10s/câu đố)</p>

      <div className="support-instruction">
        <h3>{level.title}</h3>
        <p>{level.instruction}</p>
        <span className="support-hint">✂️ Vuốt hoặc chạm để cắt dây</span>
      </div>

      {/* SVG Playfield Scene */}
      <SupportScene
        level={level}
        attachedRopes={attachedRopes}
        cutRopes={cutRopes}
        objectState={objectState}
        onCutRope={handleCutRope}
        isSolved={isSolved}
        isInvalid={isInvalid}
        isResetting={isResetting}
      />

      {error && (
        <div className="game-error-box" role="alert">
          <p className="field-error">{error}</p>
          <button type="button" className="btn btn--primary" onClick={retrySubmit}>
            Thử gửi lại 🔄
          </button>
        </div>
      )}

      {submitting && <p className="game-submitting" aria-live="polite">Đang ghi nhận kết quả SUPPORT...</p>}
    </div>
  )
}
