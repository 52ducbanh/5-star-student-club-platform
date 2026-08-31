import { useState, useEffect, useCallback, useRef } from "react"
import { useStarprintStore } from "../../store/useStarprintStore"
import { submitGameWithReconciliation } from "../../services/gameSubmission"
import type { SyncRawResult } from "../../types/game.types"

const PAIRS = [
  { pairId: "p1", symbol: "🌍" }, { pairId: "p2", symbol: "🤝" },
  { pairId: "p3", symbol: "💡" }, { pairId: "p4", symbol: "🌐" },
]

type CardState = "hidden" | "revealed" | "matched"
interface Card { id: string; pairId: string; symbol: string; state: CardState }

function createCards(): Card[] {
  const cards: Card[] = PAIRS.flatMap((pair) => [
    { id: `${pair.pairId}-a`, pairId: pair.pairId, symbol: pair.symbol, state: "hidden" as CardState },
    { id: `${pair.pairId}-b`, pairId: pair.pairId, symbol: pair.symbol, state: "hidden" as CardState },
  ])
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

const GAME_DURATION_MS = 25000

export function SyncGame() {
  const [cards, setCards] = useState<Card[]>(createCards)
  const [flipped, setFlipped] = useState<string[]>([])
  const [mismatches, setMismatches] = useState(0)
  const [totalFlips, setTotalFlips] = useState(0)
  const [pairsMatched, setPairsMatched] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [start] = useState(() => Date.now())
  const [locked, setLocked] = useState(false)
  const [isTerminal, setIsTerminal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const finalResultRef = useRef<SyncRawResult | null>(null)
  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  const submitFinal = useCallback(async (matched: number, isCompleted: boolean, currentMismatches: number, currentFlips: number) => {
    if (!sessionId) return
    setSubmitting(true)
    setError(null)
    const rawResult: SyncRawResult = {
      gameId: "sync",
      pairsTotal: PAIRS.length,
      pairsMatched: matched,
      mismatches: currentMismatches,
      flips: currentFlips,
      elapsedMs: Date.now() - start,
      completed: isCompleted,
    }
    finalResultRef.current = rawResult

    const res = await submitGameWithReconciliation({
      sessionId,
      gameId: "sync",
      rawResult,
      nextStep: "COLOR_PICKER",
      markGameCompleted,
      addGameResult,
      setStep,
    })

    if (!res.success) {
      setError(res.error || "Lỗi gửi kết quả. Thử lại?")
    }
    setSubmitting(false)
  }, [start, sessionId, setStep, markGameCompleted, addGameResult])

  useEffect(() => {
    if (isTerminal || pairsMatched >= PAIRS.length) return
    const interval = setInterval(() => {
      const el = Date.now() - start
      setElapsed(el)
      if (el >= GAME_DURATION_MS) {
        clearInterval(interval)
        setIsTerminal(true)
        setLocked(true)
        void submitFinal(pairsMatched, false, mismatches, totalFlips)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [isTerminal, pairsMatched, start, mismatches, totalFlips, submitFinal])

  const flipCard = (id: string) => {
    if (locked || isTerminal || submitting) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.state !== "hidden" || flipped.includes(id)) return
    const newFlips = totalFlips + 1
    setTotalFlips(newFlips)
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, state: "revealed" } : c)))

    if (newFlipped.length === 2) {
      setLocked(true)
      const cardA = cards.find((c) => c.id === newFlipped[0])!
      const cardB = cards.find((c) => c.id === newFlipped[1])!
      if (cardA.pairId === cardB.pairId) {
        const newMatched = pairsMatched + 1
        setPairsMatched(newMatched)
        setCards((prev) => prev.map((c) => (newFlipped.includes(c.id) ? { ...c, state: "matched" } : c)))
        setFlipped([])
        setLocked(false)
        if (newMatched >= PAIRS.length) {
          setIsTerminal(true)
          void submitFinal(newMatched, true, mismatches, newFlips)
        }
      } else {
        const newMismatches = mismatches + 1
        setMismatches(newMismatches)
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (newFlipped.includes(c.id) ? { ...c, state: "hidden" } : c)))
          setFlipped([])
          setLocked(false)
        }, 900)
      }
    }
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      const { pairsMatched: pm, completed: done, mismatches: mm, flips: fl } = finalResultRef.current
      void submitFinal(pm, done, mm, fl)
    }
  }

  const remaining = Math.max(0, GAME_DURATION_MS - elapsed)

  return (
    <div className="game-step sync-game">
      <div className="game-progress">🌐 SYNC · {Math.ceil(remaining / 1000)}s · {pairsMatched}/{PAIRS.length} cặp</div>
      <h2>Tìm cặp đôi hòa nhịp</h2>
      <p>Tìm và ghép các cặp biểu tượng tương ứng!</p>
      <div className="sync-game__board">
        {cards.map((card) => (
          <button
            key={card.id}
            className={["sync-card", card.state].join(" ")}
            onClick={() => flipCard(card.id)}
            disabled={card.state === "matched" || locked || isTerminal || submitting}
            aria-label={card.state === "hidden" ? "Lật thẻ" : card.symbol}
            aria-pressed={card.state !== "hidden"}
          >
            {card.state !== "hidden" ? card.symbol : "?"}
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
