import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { getSolveQuestionsForSession } from './solve-questions'
import { gameSfx } from '../../services/gameSfx'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SolveAnswerV2, SolveRawResultV2 } from '@5ss/contracts'

const QUESTION_DURATION_S = 6

interface SolveFeedbackState {
  type: 'CORRECT' | 'WRONG' | 'TIMEOUT'
  selectedId: string | null
  correctId: string
  explanation?: string
}

export function SolveGame() {
  const { sessionId, assignedSolveQuestionIds, setStep, markGameCompleted, addGameResult } = useStarprintStore()
  const questions = useMemo(() => getSolveQuestionsForSession(assignedSolveQuestionIds), [assignedSolveQuestionIds])

  const [currentQ, setCurrentQ] = useState(0)
  const answersRef = useRef<SolveAnswerV2[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_S)
  const [feedback, setFeedback] = useState<SolveFeedbackState | null>(null)

  const questionStartRef = useRef(Date.now())
  const gameStartRef = useRef(Date.now())
  const answeredRef = useRef(false)
  const finalResultRef = useRef<SolveRawResultV2 | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize SFX on mount
  useEffect(() => {
    gameSfx.initOnFirstUserGesture()
  }, [])

  const submitFinal = useCallback(
    async (rawResult: SolveRawResultV2) => {
      if (!sessionId) return
      setSubmitting(true)
      setError(null)
      finalResultRef.current = rawResult

      gameSfx.play('mini_complete')

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
        setIsLocked(false)
      }
      setSubmitting(false)
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  const recordAndAdvance = useCallback(
    async (selectedOptionId: string | null, timedOut: boolean) => {
      // Synchronously lock input to prevent double clicks and timer race
      if (answeredRef.current) return
      answeredRef.current = true
      setIsLocked(true)

      const currentQuestion = questions[currentQ]
      const responseTimeMs = Math.min(Date.now() - questionStartRef.current, QUESTION_DURATION_S * 1000)
      const answerRecord: SolveAnswerV2 = {
        questionId: currentQuestion.id,
        selectedOptionId,
        responseTimeMs,
        timedOut,
      }
      answersRef.current.push(answerRecord)

      const isCorrect = selectedOptionId
        ? selectedOptionId.toLowerCase() === currentQuestion.correctOptionId.toLowerCase()
        : false

      let revealDurationMs = 1100
      if (timedOut) {
        setFeedback({
          type: 'TIMEOUT',
          selectedId: null,
          correctId: currentQuestion.correctOptionId,
          explanation: currentQuestion.explanation,
        })
        gameSfx.play('timer_timeout')
        gameSfx.vibrate(35)
        revealDurationMs = 1350
      } else if (isCorrect) {
        setFeedback({
          type: 'CORRECT',
          selectedId: selectedOptionId,
          correctId: currentQuestion.correctOptionId,
          explanation: currentQuestion.explanation,
        })
        gameSfx.play('solve_correct')
        gameSfx.vibrate(25)
        revealDurationMs = 1100
      } else {
        setFeedback({
          type: 'WRONG',
          selectedId: selectedOptionId,
          correctId: currentQuestion.correctOptionId,
          explanation: currentQuestion.explanation,
        })
        gameSfx.play('solve_wrong')
        gameSfx.vibrate([15, 30, 15])
        revealDurationMs = 1450
      }

      if (currentQ < questions.length - 1) {
        setTimeout(() => {
          setFeedback(null)
          setCurrentQ((prev) => prev + 1)
          setTimeLeft(QUESTION_DURATION_S)
          questionStartRef.current = Date.now()
          answeredRef.current = false
          setIsLocked(false)
        }, revealDurationMs)
      } else {
        setTimeout(async () => {
          const rawResult: SolveRawResultV2 = {
            gameId: 'solve',
            payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
            contentVersion: STARPRINT_VERSIONS.officialV2.content,
            startedAtMs: gameStartRef.current,
            completedAtMs: Date.now(),
            answers: [...answersRef.current],
          }
          await submitFinal(rawResult)
        }, revealDurationMs)
      }
    },
    [currentQ, questions, submitFinal],
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
  }, [currentQ, submitting, isLocked])

  // Handle timeout event
  useEffect(() => {
    if (timeLeft === 0 && !submitting && !answeredRef.current) {
      void recordAndAdvance(null, true)
    }
  }, [timeLeft, submitting, recordAndAdvance])

  const handleOptionClick = (optionId: string) => {
    if (isLocked || submitting || answeredRef.current) return
    gameSfx.play('ui_select')
    void recordAndAdvance(optionId, false)
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  const q = questions[currentQ] || questions[0]

  return (
    <div className="game-step solve-game" role="region" aria-label="Trò chơi SOLVE">
      <div className="game-progress" aria-live="polite">
        <span className="game-progress__badge">⚡ SOLVE</span>
        <span className="game-progress__step">
          Câu {currentQ + 1}/{questions.length} · {q.categoryLabel}
        </span>
        <span
          className={`game-progress__timer ${timeLeft <= 2 ? 'timer--urgent' : ''}`}
          aria-label={`Thời gian còn lại: ${timeLeft} giây`}
        >
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div
        className="game-progress-bar"
        role="progressbar"
        aria-valuenow={((currentQ + 1) / questions.length) * 100}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="game-progress-bar__fill"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <p className="game-micro-intro">Chọn đáp án trước khi thời gian kết thúc (6s/câu)</p>

      <h2 className="solve-game__question">{q.question}</h2>

      <div className="solve-game__options" role="group" aria-label="Các lựa chọn câu trả lời">
        {q.options.map((opt) => {
          let stateClass = ''
          let markerSymbol = `${opt.id}.`

          if (feedback) {
            const isThisCorrect = opt.id.toLowerCase() === feedback.correctId.toLowerCase()
            const isThisSelected = opt.id === feedback.selectedId

            if (isThisCorrect) {
              stateClass = 'solve-option--correct'
              markerSymbol = '✓'
            } else if (isThisSelected && feedback.type === 'WRONG') {
              stateClass = 'solve-option--wrong'
              markerSymbol = '✕'
            } else {
              stateClass = 'solve-option--dimmed'
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              className={`solve-game__option btn--outline ${stateClass}`}
              onClick={() => handleOptionClick(opt.id)}
              disabled={submitting || isLocked}
            >
              <span className="solve-game__option-id">{markerSymbol}</span>
              <span className="solve-game__option-text">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {feedback && (
        <div
          className={`solve-feedback-banner feedback--${feedback.type.toLowerCase()}`}
          role="status"
          aria-live="assertive"
        >
          <div className="feedback-headline">
            {feedback.type === 'CORRECT' && '✨ Chính xác!'}
            {feedback.type === 'WRONG' && '💡 Chưa chính xác.'}
            {feedback.type === 'TIMEOUT' && '⌛ Hết thời gian!'}
          </div>
          {feedback.explanation && <p className="feedback-explanation">{feedback.explanation}</p>}
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
