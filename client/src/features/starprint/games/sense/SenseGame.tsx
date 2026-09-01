import { useState, useCallback, useEffect, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { SENSE_SCENARIOS_CLIENT } from './sense-scenarios'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SenseDecisionV2, SenseRawResultV2 } from '@5ss/contracts'

const SCENARIO_DURATION_S = 10
const SCENARIOS = SENSE_SCENARIOS_CLIENT

export function SenseGame() {
  const [currentS, setCurrentS] = useState(0)
  const [decisions, setDecisions] = useState<SenseDecisionV2[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(SCENARIO_DURATION_S)

  const scenarioStartRef = useRef(Date.now())
  const gameStartRef = useRef(Date.now())
  const decidedRef = useRef(false)
  const finalResultRef = useRef<SenseRawResultV2 | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  const submitFinal = useCallback(
    async (rawResult: SenseRawResultV2) => {
      if (!sessionId) return
      setSubmitting(true)
      setError(null)
      finalResultRef.current = rawResult

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
        decidedRef.current = false
        setIsLocked(false)
      }
      setSubmitting(false)
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  const recordAndAdvance = useCallback(
    async (optionId: string | null, timedOut: boolean) => {
      // Synchronously lock input to prevent double clicks
      if (decidedRef.current) return
      decidedRef.current = true
      setIsLocked(true)

      const responseTimeMs = Math.min(Date.now() - scenarioStartRef.current, SCENARIO_DURATION_S * 1000)
      const currentScenario = SCENARIOS[currentS]
      const decisionRecord: SenseDecisionV2 = {
        scenarioId: currentScenario.id,
        optionId,
        responseTimeMs,
        timedOut,
      }

      const nextDecisions = [...decisions, decisionRecord]
      setDecisions(nextDecisions)

      if (currentS < SCENARIOS.length - 1) {
        setTimeout(() => {
          setCurrentS((prev) => prev + 1)
          setTimeLeft(SCENARIO_DURATION_S)
          scenarioStartRef.current = Date.now()
          decidedRef.current = false
          setIsLocked(false)
        }, 150)
      } else {
        const rawResult: SenseRawResultV2 = {
          gameId: 'sense',
          payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
          contentVersion: STARPRINT_VERSIONS.officialV2.content,
          startedAtMs: gameStartRef.current,
          completedAtMs: Date.now(),
          decisions: nextDecisions,
        }
        await submitFinal(rawResult)
      }
    },
    [decisions, currentS, submitFinal],
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
        return prev - 1
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
    void recordAndAdvance(optionId, false)
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    } else {
      setError(null)
      decidedRef.current = false
      setIsLocked(false)
      void recordAndAdvance(null, true)
    }
  }

  const s = SCENARIOS[currentS]

  return (
    <div className="game-step sense-game" role="region" aria-label="Trò chơi SENSE">
      <div className="game-progress" aria-live="polite">
        <span className="game-progress__badge">💫 SENSE</span>
        <span className="game-progress__step">Tình huống {currentS + 1}/{SCENARIOS.length} · {s.categoryLabel}</span>
        <span className={`game-progress__timer ${timeLeft <= 3 ? 'timer--urgent' : ''}`} aria-label={`Thời gian còn lại: ${timeLeft} giây`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div className="game-progress-bar" role="progressbar" aria-valuenow={((currentS + 1) / SCENARIOS.length) * 100} aria-valuemin={0} aria-valuemax={100}>
        <div className="game-progress-bar__fill" style={{ width: `${((currentS + 1) / SCENARIOS.length) * 100}%` }} />
      </div>

      <p className="sense-game__situation">{s.situation}</p>

      <div className="sense-game__options" role="group" aria-label="Các phương án xử lý">
        {s.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="sense-game__option btn btn--outline"
            onClick={() => handleOptionClick(opt.id)}
            disabled={submitting || isLocked}
          >
            <span className="sense-game__option-id">{opt.id}.</span> {opt.text}
          </button>
        ))}
      </div>

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
