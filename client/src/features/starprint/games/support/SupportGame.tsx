import { useState, useCallback, useEffect, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { SUPPORT_PUZZLES_CLIENT, type ClientSupportPuzzle } from './support-puzzles'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SupportEventV2, SupportPuzzleResultV2, SupportRawResultV2 } from '@5ss/contracts'

const PUZZLE_TIME_LIMIT_S = 10
const PUZZLES = SUPPORT_PUZZLES_CLIENT

export function SupportGame() {
  const [currentP, setCurrentP] = useState(0)
  const [cutRopes, setCutRopes] = useState<Set<string>>(new Set())
  const [cutSequence, setCutSequence] = useState<string[]>([])
  const [isResetting, setIsResetting] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [timeLeft, setTimeLeft] = useState(PUZZLE_TIME_LIMIT_S)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gameStartRef = useRef(Date.now())
  const puzzleStartRef = useRef(Date.now())
  const eventsRef = useRef<SupportEventV2[]>([])
  const puzzleResultsRef = useRef<SupportPuzzleResultV2[]>([])
  const finalResultRef = useRef<SupportRawResultV2 | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  const submitFinal = useCallback(
    async (rawResult: SupportRawResultV2) => {
      if (!sessionId) return
      setSubmitting(true)
      setError(null)
      finalResultRef.current = rawResult

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

  const advancePuzzle = useCallback(
    (completed: boolean, timedOut: boolean) => {
      const puzzle = PUZZLES[currentP]
      const elapsed = Math.min(Date.now() - puzzleStartRef.current, PUZZLE_TIME_LIMIT_S * 1000)

      const resultRecord: SupportPuzzleResultV2 = {
        puzzleId: puzzle.puzzleId,
        completed,
        timedOut,
        durationMs: elapsed,
        events: [...eventsRef.current],
      }

      const nextResults = [...puzzleResultsRef.current, resultRecord]
      puzzleResultsRef.current = nextResults

      if (currentP < PUZZLES.length - 1) {
        setCurrentP((prev) => prev + 1)
        setCutRopes(new Set())
        setCutSequence([])
        setIsResetting(false)
        setIsSolved(false)
        setTimeLeft(PUZZLE_TIME_LIMIT_S)
        eventsRef.current = []
        puzzleStartRef.current = Date.now()
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

  // Timer per puzzle
  useEffect(() => {
    if (submitting || isSolved) return

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
  }, [currentP, submitting, isSolved])

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && !submitting && !isSolved) {
      advancePuzzle(false, true)
    }
  }, [timeLeft, submitting, isSolved, advancePuzzle])

  // Check cut validity against puzzle sequences
  const handleCutRope = (ropeId: string) => {
    if (cutRopes.has(ropeId) || isResetting || isSolved || submitting) return

    const atMs = Date.now() - puzzleStartRef.current
    eventsRef.current.push({
      type: 'rope-cut',
      atMs,
      ropeId,
    })

    const nextCuts = [...cutSequence, ropeId]
    setCutSequence(nextCuts)
    setCutRopes((prev) => new Set([...prev, ropeId]))

    const puzzle: ClientSupportPuzzle = PUZZLES[currentP]

    // Check if nextCuts matches a complete solution
    const isComplete = puzzle.validSequences.some(
      (seq) => seq.length === nextCuts.length && seq.every((c, i) => c === nextCuts[i]),
    )

    if (isComplete) {
      setIsSolved(true)
      setTimeout(() => {
        advancePuzzle(true, false)
      }, 700)
      return
    }

    // Check if nextCuts is a valid prefix of any solution
    const isValidPrefix = puzzle.validSequences.some(
      (seq) => seq.length > nextCuts.length && nextCuts.every((c, i) => c === seq[i]),
    )

    if (!isValidPrefix) {
      // Wrong cut sequence! Trigger invalid state and auto-reset
      eventsRef.current.push({
        type: 'invalid-state',
        atMs: Date.now() - puzzleStartRef.current,
      })
      setIsResetting(true)

      setTimeout(() => {
        eventsRef.current.push({
          type: 'auto-reset',
          atMs: Date.now() - puzzleStartRef.current,
        })
        // Reset ropes for the same puzzle; timer continues!
        setCutRopes(new Set())
        setCutSequence([])
        setIsResetting(false)
      }, 600)
    }
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  const puzzle = PUZZLES[currentP]

  return (
    <div className="game-step support-game" role="region" aria-label="Trò chơi SUPPORT cắt dây hỗ trợ">
      <div className="game-progress" aria-live="polite">
        <span className="game-progress__badge">🤝 SUPPORT</span>
        <span className="game-progress__step">Câu đố {currentP + 1}/{PUZZLES.length}</span>
        <span className={`game-progress__timer ${timeLeft <= 3 ? 'timer--urgent' : ''}`} aria-label={`Thời gian: ${timeLeft}s`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div className="game-progress-bar" role="progressbar" aria-valuenow={((currentP + 1) / PUZZLES.length) * 100} aria-valuemin={0} aria-valuemax={100}>
        <div className="game-progress-bar__fill" style={{ width: `${((currentP + 1) / PUZZLES.length) * 100}%` }} />
      </div>

      <div className="support-instruction">
        <h3>{puzzle.title}</h3>
        <p>{puzzle.instruction}</p>
        <span className="support-hint">✂️ Chạm hoặc click vào dây để cắt</span>
      </div>

      {/* Cut-the-Rope SVG Stage */}
      <div className="support-stage-container">
        <svg viewBox="0 0 100 100" className="support-svg-stage" aria-label="Khu vực dây treo năng lượng">
          <defs>
            <radialGradient id="target-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5fe3a1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#5fe3a1" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="object-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd467" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff9900" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Target Portal at Bottom */}
          <circle cx={puzzle.targetPos.x} cy={puzzle.targetPos.y} r="12" fill="url(#target-glow)" />
          <circle cx={puzzle.targetPos.x} cy={puzzle.targetPos.y} r="7" fill="#1b2a4a" stroke="#5fe3a1" strokeWidth="1.5" />
          <text x={puzzle.targetPos.x} y={puzzle.targetPos.y + 2.5} textAnchor="middle" fontSize="6" fill="#5fe3a1">
            🌀
          </text>

          {/* Ropes */}
          {puzzle.ropes.map((rope) => {
            const isCut = cutRopes.has(rope.ropeId)
            const midX = (rope.x1 + rope.x2) / 2
            const midY = (rope.y1 + rope.y2) / 2

            if (isCut) return null

            return (
              <g key={rope.ropeId} className="rope-group" onClick={() => handleCutRope(rope.ropeId)} role="button" aria-label={`Cắt ${rope.label}`}>
                {/* Visual Line */}
                <line
                  x1={rope.x1}
                  y1={rope.y1}
                  x2={rope.x2}
                  y2={rope.y2}
                  stroke="#ffd467"
                  strokeWidth="1.8"
                  strokeDasharray="2,1"
                  className="rope-visual-line"
                />
                {/* Anchor dot */}
                <circle cx={rope.x1} cy={rope.y1} r="2.5" fill="#ffd467" />
                {/* Large Hit Area for mobile finger tap */}
                <line
                  x1={rope.x1}
                  y1={rope.y1}
                  x2={rope.x2}
                  y2={rope.y2}
                  stroke="transparent"
                  strokeWidth="10"
                  className="rope-hit-area"
                />
                {/* Scissors icon badge at midpoint */}
                <circle cx={midX} cy={midY} r="3.5" fill="#1a1f36" stroke="#ffd467" strokeWidth="0.8" />
                <text x={midX} y={midY + 1.2} textAnchor="middle" fontSize="3.5" fill="#fff" pointerEvents="none">
                  ✂️
                </text>
              </g>
            )
          })}

          {/* Object (Star Energy Core) */}
          <g
            className={`support-object ${isSolved ? 'object--solved' : ''} ${isResetting ? 'object--invalid' : ''}`}
            style={{
              transformOrigin: `${puzzle.objectPos.x}% ${puzzle.objectPos.y}%`,
            }}
          >
            <circle
              cx={isSolved ? puzzle.targetPos.x : puzzle.objectPos.x}
              cy={isSolved ? puzzle.targetPos.y : puzzle.objectPos.y}
              r="6.5"
              fill="url(#object-glow)"
              stroke="#ffd467"
              strokeWidth="1"
            />
            <text
              x={isSolved ? puzzle.targetPos.x : puzzle.objectPos.x}
              y={(isSolved ? puzzle.targetPos.y : puzzle.objectPos.y) + 2.5}
              textAnchor="middle"
              fontSize="6"
              fill="#fff"
            >
              ⭐
            </text>
          </g>
        </svg>

        {isResetting && (
          <div className="support-status-overlay invalid-overlay" aria-live="polite">
            <span>Sai trình tự · Đang cân bằng lại...</span>
          </div>
        )}

        {isSolved && (
          <div className="support-status-overlay solved-overlay" aria-live="polite">
            <span>Thành công! Đưa sao vào cổng 🌟</span>
          </div>
        )}
      </div>

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
