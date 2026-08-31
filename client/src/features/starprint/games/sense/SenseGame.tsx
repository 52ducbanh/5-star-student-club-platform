import { useState, useCallback, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import type { SenseRawResult } from '../../types/game.types'

const SCENARIOS = [
  {
    id: 's1',
    situation: 'Bạn nhận ra đồng đội đang mắc lỗi nhỏ trong bài thuyết trình quan trọng. Bạn sẽ?',
    options: [
      { id: 'a', text: 'Nhắn tin riêng ngay để sửa kịp' },
      { id: 'b', text: 'Chờ sau buổi nói với đồng đội' },
      { id: 'c', text: 'Ghi chú giúp đội rút kinh nghiệm sau' },
    ],
  },
  {
    id: 's2',
    situation: 'Nhóm dự án bất đồng về hướng đi. Bạn làm gì?',
    options: [
      { id: 'a', text: 'Đề xuất vote nhanh để tiếp tục' },
      { id: 'b', text: 'Nghe từng quan điểm rồi tổng hợp' },
      { id: 'c', text: 'Đề xuất thử nghiệm nhỏ cả hai hướng' },
    ],
  },
  {
    id: 's3',
    situation: 'Có deadline cấp bách nhưng đồng đội cần giúp đỡ. Bạn?',
    options: [
      { id: 'a', text: 'Dành 10 phút hỗ trợ ngắn, sau đó tập trung lại' },
      { id: 'b', text: 'Hoàn thành phần mình trước rồi hỗ trợ' },
      { id: 'c', text: 'Cùng ưu tiên lại để cả nhóm xử lý' },
    ],
  },
]

export function SenseGame() {
  const [currentS, setCurrentS] = useState(0)
  const [decisions, setDecisions] = useState<SenseRawResult['decisions']>([])
  const [scenarioStart, setScenarioStart] = useState(() => Date.now())
  const [gameStart] = useState(() => Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const finalResultRef = useRef<SenseRawResult | null>(null)
  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  const submitFinal = useCallback(
    async (rawResult: SenseRawResult) => {
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
        setError(res.error || 'Lỗi kết nối server. Vui lòng thử lại.')
      }
      setSubmitting(false)
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  const chooseOption = useCallback(
    async (optionId: string) => {
      if (submitting) return
      const elapsed = Date.now() - scenarioStart
      const newDecisions: SenseRawResult['decisions'] = [
        ...decisions,
        { scenarioId: SCENARIOS[currentS].id, optionId, responseTimeMs: elapsed },
      ]

      if (currentS < SCENARIOS.length - 1) {
        setDecisions(newDecisions)
        setCurrentS((s) => s + 1)
        setScenarioStart(Date.now())
      } else {
        const rawResult: SenseRawResult = {
          gameId: 'sense',
          decisions: newDecisions,
          totalDurationMs: Date.now() - gameStart,
        }
        await submitFinal(rawResult)
      }
    },
    [decisions, currentS, scenarioStart, gameStart, submitting, submitFinal],
  )

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  const s = SCENARIOS[currentS]

  return (
    <div className="game-step sense-game">
      <div className="game-progress">💫 SENSE · Tình huống {currentS + 1}/{SCENARIOS.length}</div>
      <p className="sense-game__situation">{s.situation}</p>
      <div className="sense-game__options">
        {s.options.map((opt) => (
          <button
            key={opt.id}
            className="sense-game__option btn btn--outline"
            onClick={() => chooseOption(opt.id)}
            disabled={submitting}
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
