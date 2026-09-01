import { useState, useCallback, useEffect, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { SOLVE_QUESTIONS_CLIENT } from './solve-questions'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SolveAnswerV2, SolveRawResultV2 } from '@5ss/contracts'

const QUESTION_DURATION_S = 6
const QUESTIONS = SOLVE_QUESTIONS_CLIENT

export function SolveGame() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<SolveAnswerV2[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_S)

  const questionStartRef = useRef(Date.now())
  const gameStartRef = useRef(Date.now())
  const answeredRef = useRef(false)
  const finalResultRef = useRef<SolveRawResultV2 | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  const submitFinal = useCallback(
    async (rawResult: SolveRawResultV2) => {
      if (!sessionId) return
      setSubmitting(true)
      setError(null)
      finalResultRef.current = rawResult

      const res = await submitGameWithReconciliation({
        sessionId,
        gameId: 'solve',
        rawResult,
        nextStep: 'SENSE',
        markGameCompleted,
        addGameResult,
        setStep,
      })

      if (!res.success) {
        setError(res.error || 'Lỗi kết nối máy chủ khi ghi nhận kết quả. Vui lòng bấm thử lại.')
        answeredRef.current = false
        setIsLocked(false)
      }
      setSubmitting(false)
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  const recordAndAdvance = useCallback(
    async (selectedOptionId: string | null, timedOut: boolean) => {
      // Synchronously lock input to prevent double clicks
      if (answeredRef.current) return
      answeredRef.current = true
      setIsLocked(true)

      const responseTimeMs = Math.min(Date.now() - questionStartRef.current, QUESTION_DURATION_S * 1000)
      const currentQuestion = QUESTIONS[currentQ]
      const answerRecord: SolveAnswerV2 = {
        questionId: currentQuestion.id,
        selectedOptionId,
        responseTimeMs,
        timedOut,
      }

      const nextAnswers = [...answers, answerRecord]
      setAnswers(nextAnswers)

      if (currentQ < QUESTIONS.length - 1) {
        // Short clean transition (200ms) to prevent flickering, then next question
        setTimeout(() => {
          setCurrentQ((prev) => prev + 1)
          setTimeLeft(QUESTION_DURATION_S)
          questionStartRef.current = Date.now()
          answeredRef.current = false
          setIsLocked(false)
        }, 150)
      } else {
        // Last question completed -> submit raw evidence to server
        const rawResult: SolveRawResultV2 = {
          gameId: 'solve',
          payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
          contentVersion: STARPRINT_VERSIONS.officialV2.content,
          startedAtMs: gameStartRef.current,
          completedAtMs: Date.now(),
          answers: nextAnswers,
        }
        await submitFinal(rawResult)
      }
    },
    [answers, currentQ, submitFinal],
  )

  // Question timer
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
  }, [currentQ, submitting, isLocked])

  // Handle timeout event
  useEffect(() => {
    if (timeLeft === 0 && !submitting && !answeredRef.current) {
      void recordAndAdvance(null, true)
    }
  }, [timeLeft, submitting, recordAndAdvance])

  const handleOptionClick = (optionId: string) => {
    if (isLocked || submitting || answeredRef.current) return
    void recordAndAdvance(optionId, false)
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    } else {
      setError(null)
      answeredRef.current = false
      setIsLocked(false)
      void recordAndAdvance(null, true)
    }
  }

  const q = QUESTIONS[currentQ]

  return (
    <div className="game-step solve-game" role="region" aria-label="Trò chơi SOLVE">
      <div className="game-progress" aria-live="polite">
        <span className="game-progress__badge">⚡ SOLVE</span>
        <span className="game-progress__step">Câu {currentQ + 1}/{QUESTIONS.length} · {q.categoryLabel}</span>
        <span className={`game-progress__timer ${timeLeft <= 2 ? 'timer--urgent' : ''}`} aria-label={`Thời gian còn lại: ${timeLeft} giây`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div className="game-progress-bar" role="progressbar" aria-valuenow={((currentQ + 1) / QUESTIONS.length) * 100} aria-valuemin={0} aria-valuemax={100}>
        <div className="game-progress-bar__fill" style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }} />
      </div>

      <h2 className="solve-game__question">{q.question}</h2>

      <div className="solve-game__options" role="group" aria-label="Các lựa chọn câu trả lời">
        {q.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="solve-game__option btn btn--outline"
            onClick={() => handleOptionClick(opt.id)}
            disabled={submitting || isLocked}
          >
            <span className="solve-game__option-id">{opt.id}.</span> {opt.text}
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
