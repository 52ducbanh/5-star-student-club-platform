import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { getSenseScenariosForSession } from './sense-scenarios'
import { gameSfx } from '../../services/gameSfx'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SenseDecisionV2, SenseRawResultV2 } from '@5ss/contracts'

const SCENARIO_DURATION_S = 10

interface SenseFeedbackState {
  type: 'SELECTED' | 'TIMEOUT'
  selectedId: string | null
}

export function SenseGame() {
  const { sessionId, assignedSenseScenarioIds, setStep, markGameCompleted, addGameResult } = useStarprintStore()
  const scenarios = useMemo(() => getSenseScenariosForSession(assignedSenseScenarioIds), [assignedSenseScenarioIds])

  const [currentS, setCurrentS] = useState(0)
  const decisionsRef = useRef<SenseDecisionV2[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(SCENARIO_DURATION_S)
  const [feedback, setFeedback] = useState<SenseFeedbackState | null>(null)

  const scenarioStartRef = useRef(Date.now())
  const gameStartRef = useRef(Date.now())
  const decidedRef = useRef(false)
  const finalResultRef = useRef<SenseRawResultV2 | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize SFX on mount
  useEffect(() => {
    gameSfx.initOnFirstUserGesture()
  }, [])

  const submitFinal = useCallback(
    async (rawResult: SenseRawResultV2) => {
      if (!sessionId) return
      setSubmitting(true)
      setError(null)
      finalResultRef.current = rawResult

      gameSfx.play('mini_complete')

      const res = await submitGameWithReconciliation({
        sessionId,
        gameId: 'sense',
        rawResult,
        nextStep: 'SPRINT',
        markGameCompleted,
        addGameResult,
        setStep,
      })

      if (!res.success) {
        setError(res.error || 'Lỗi kết nối máy chủ khi ghi nhận kết quả. Vui lòng bấm thử lại.')
        setIsLocked(false)
      }
      setSubmitting(false)
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  const recordAndAdvance = useCallback(
    async (optionId: string | null, timedOut: boolean) => {
      // Synchronously lock input to prevent double clicks and timer races
      if (decidedRef.current) return
      decidedRef.current = true
      setIsLocked(true)

      const responseTimeMs = Math.min(Date.now() - scenarioStartRef.current, SCENARIO_DURATION_S * 1000)
      const currentScenario = scenarios[currentS]
      const decisionRecord: SenseDecisionV2 = {
        scenarioId: currentScenario.id,
        optionId,
        responseTimeMs,
        timedOut,
      }
      decisionsRef.current.push(decisionRecord)

      let delayMs = 650
      if (timedOut) {
        setFeedback({ type: 'TIMEOUT', selectedId: null })
        gameSfx.play('timer_timeout')
        gameSfx.vibrate(25)
        delayMs = 800
      } else {
        setFeedback({ type: 'SELECTED', selectedId: optionId })
        gameSfx.play('sense_confirm')
        gameSfx.vibrate(15)
        delayMs = 650
      }

      if (currentS < scenarios.length - 1) {
        setTimeout(() => {
          setFeedback(null)
          setCurrentS((prev) => prev + 1)
          setTimeLeft(SCENARIO_DURATION_S)
          scenarioStartRef.current = Date.now()
          decidedRef.current = false
          setIsLocked(false)
        }, delayMs)
      } else {
        setTimeout(async () => {
          const rawResult: SenseRawResultV2 = {
            gameId: 'sense',
            payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
            contentVersion: STARPRINT_VERSIONS.officialV2.content,
            startedAtMs: gameStartRef.current,
            completedAtMs: Date.now(),
            decisions: [...decisionsRef.current],
          }
          await submitFinal(rawResult)
        }, delayMs)
      }
    },
    [currentS, scenarios, submitFinal],
  )

  // Scenario timer
  useEffect(() => {
    if (submitting || isLocked) return

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
  }, [currentS, submitting, isLocked])

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && !submitting && !decidedRef.current) {
      void recordAndAdvance(null, true)
    }
  }, [timeLeft, submitting, recordAndAdvance])

  const handleOptionClick = (optionId: string) => {
    if (isLocked || submitting || decidedRef.current) return
    gameSfx.play('ui_select')
    void recordAndAdvance(optionId, false)
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  const s = scenarios[currentS] || scenarios[0]

  return (
    <div className="game-step sense-game" role="region" aria-label="Trò chơi SENSE">
      <div className="game-progress" aria-live="polite">
        <span className="game-progress__badge">💫 SENSE</span>
        <span className="game-progress__step">
          Tình huống {currentS + 1}/{scenarios.length} · {s.categoryLabel}
        </span>
        <span
          className={`game-progress__timer ${timeLeft <= 3 ? 'timer--urgent' : ''}`}
          aria-label={`Thời gian còn lại: ${timeLeft} giây`}
        >
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div
        className="game-progress-bar"
        role="progressbar"
        aria-valuenow={((currentS + 1) / scenarios.length) * 100}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="game-progress-bar__fill"
          style={{ width: `${((currentS + 1) / scenarios.length) * 100}%` }}
        />
      </div>

      <p className="game-micro-intro">Chọn cách bạn có xu hướng phản ứng tự nhiên nhất (10s/tình huống)</p>

      <p className="sense-game__situation">{s.situation}</p>

      <div className="sense-game__options" role="group" aria-label="Các phương án xử lý">
        {s.options.map((opt) => {
          let stateClass = ''
          if (feedback) {
            if (opt.id === feedback.selectedId) {
              stateClass = 'sense-option--selected'
            } else {
              stateClass = 'sense-option--dimmed'
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              className={`sense-game__option btn--outline ${stateClass}`}
              onClick={() => handleOptionClick(opt.id)}
              disabled={submitting || isLocked}
            >
              <span className="sense-game__option-id">{opt.id}.</span>
              <span className="sense-game__option-text">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {feedback && (
        <div className="sense-feedback-banner" role="status" aria-live="polite">
          {feedback.type === 'SELECTED' && '✨ Đã ghi nhận phản xạ của bạn.'}
          {feedback.type === 'TIMEOUT' && '⌛ Đã hết thời gian tình huống.'}
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

      {submitting && <p className="game-submitting" aria-live="polite">Đang ghi nhận kết quả...</p>}
    </div>
  )
}
