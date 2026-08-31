import { useState, useCallback, useEffect, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import type { SolveRawResult } from '../../types/game.types'

const QUESTIONS = [
  { id: 'q1', question: 'Dãy số: 2, 4, 8, 16, ?', options: [{ id: 'a', text: '24' }, { id: 'b', text: '32' }, { id: 'c', text: '28' }, { id: 'd', text: '20' }] },
  { id: 'q2', question: 'Số nào không thuộc nhóm: 3, 7, 11, 14, 19?', options: [{ id: 'a', text: '3' }, { id: 'b', text: '7' }, { id: 'c', text: '14' }, { id: 'd', text: '11' }] },
  { id: 'q3', question: 'Nếu tất cả A là B, và tất cả B là C. Thì A là gì?', options: [{ id: 'a', text: 'Không phải C' }, { id: 'b', text: 'Có thể là C' }, { id: 'c', text: 'Luôn là C' }, { id: 'd', text: 'Chưa xác định' }] },
  { id: 'q4', question: 'Mẫu dãy số: 1, 1, 2, 3, 5, 8, ?', options: [{ id: 'a', text: '11' }, { id: 'b', text: '12' }, { id: 'c', text: '13' }, { id: 'd', text: '16' }] },
]

export function SolveGame() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<SolveRawResult['answers']>([])
  const [questionStart, setQuestionStart] = useState(() => Date.now())
  const [gameStart] = useState(() => Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(6)
  const answeredRef = useRef(false)
  const finalResultRef = useRef<SolveRawResult | null>(null)
  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  const submitFinal = useCallback(
    async (rawResult: SolveRawResult) => {
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
        setError(res.error || 'Lỗi kết nối server. Vui lòng thử lại.')
        answeredRef.current = false
        setIsLocked(false)
      }
      setSubmitting(false)
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  const answerQuestion = useCallback(
    async (optionId: string | null) => {
      if (answeredRef.current) return
      answeredRef.current = true
      setIsLocked(true)

      const elapsed = Date.now() - questionStart
      const newAnswers: SolveRawResult['answers'] = [
        ...answers,
        { questionId: QUESTIONS[currentQ].id, selectedOptionId: optionId, responseTimeMs: elapsed },
      ]

      if (currentQ < QUESTIONS.length - 1) {
        setAnswers(newAnswers)
        setCurrentQ((q) => q + 1)
        setQuestionStart(Date.now())
        setTimeLeft(6)
        answeredRef.current = false
        setIsLocked(false)
      } else {
        const rawResult: SolveRawResult = {
          gameId: 'solve',
          answers: newAnswers,
          totalDurationMs: Date.now() - gameStart,
        }
        await submitFinal(rawResult)
      }
    },
    [answers, currentQ, questionStart, gameStart, submitFinal],
  )

  useEffect(() => {
    if (submitting || isLocked) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [submitting, isLocked])

  useEffect(() => {
    if (timeLeft === 0 && !submitting && !answeredRef.current) {
      void answerQuestion(null)
    }
  }, [timeLeft, submitting, answerQuestion])

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    } else {
      setError(null)
      answeredRef.current = false
      setIsLocked(false)
      void answerQuestion(null)
    }
  }

  const q = QUESTIONS[currentQ]

  return (
    <div className="game-step solve-game">
      <div className="game-progress">⚡ SOLVE · Câu {currentQ + 1}/{QUESTIONS.length} · ⏱️ {timeLeft}s</div>
      <h2 className="solve-game__question">{q.question}</h2>
      <div className="solve-game__options">
        {q.options.map((opt) => (
          <button
            key={opt.id}
            className="solve-game__option btn btn--outline"
            onClick={() => answerQuestion(opt.id)}
            disabled={submitting || isLocked}
          >
            {opt.text}
          </button>
        ))}
      </div>
      {error && (
        <div className="game-error-box">
          <p className="field-error" role="alert">{error}</p>
          <button className="btn btn--primary" onClick={retrySubmit}>Thử gửi lại 🔄</button>
        </div>
      )}
      {submitting && <p>Đang ghi nhận kết quả...</p>}
    </div>
  )
}
