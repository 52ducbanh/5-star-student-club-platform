import { useState, useCallback, useEffect, useRef } from 'react'
import { useStarprintStore } from '../../store/useStarprintStore'
import { submitGameWithReconciliation } from '../../services/gameSubmission'
import { gameSfx } from '../../services/gameSfx'
import { SYNC_CARDS_CLIENT, SYNC_DECK_ID, shuffleDeckWithSeed, type ClientSyncCard } from './sync-deck'
import { STARPRINT_VERSIONS } from '@5ss/contracts'
import type { SyncRawResultV2, SyncEventV2 } from '@5ss/contracts'

const GAME_DURATION_S = 30
const TOTAL_PAIRS = 10

export function SyncGame() {
  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  // Initialize shuffled deck using sessionId as deterministic seed
  const [cards] = useState<ClientSyncCard[]>(() =>
    shuffleDeckWithSeed(SYNC_CARDS_CLIENT, sessionId || 'default-sync-seed'),
  )

  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [isLocked, setIsLocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gameStartRef = useRef(Date.now())
  const eventsRef = useRef<SyncEventV2[]>([])
  const finalResultRef = useRef<SyncRawResultV2 | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isFinishedRef = useRef(false)

  // Initialize SFX on mount and preload card images
  useEffect(() => {
    gameSfx.initOnFirstUserGesture()
    cards.forEach((c) => {
      if (c.displayType === 'image' && c.imageUrl) {
        const img = new Image()
        img.src = c.imageUrl
      }
    })
  }, [cards])

  const submitFinal = useCallback(
    async (rawResult: SyncRawResultV2) => {
      if (!sessionId || isFinishedRef.current) return
      isFinishedRef.current = true
      setSubmitting(true)
      setError(null)
      finalResultRef.current = rawResult

      gameSfx.play('mini_complete')

      const res = await submitGameWithReconciliation({
        sessionId,
        gameId: 'sync',
        rawResult,
        nextStep: 'COLOR_PICKER',
        markGameCompleted,
        addGameResult,
        setStep,
      })

      if (!res.success) {
        setError(res.error || 'Lỗi kết nối khi gửi kết quả. Vui lòng bấm thử lại.')
        setSubmitting(false)
        isFinishedRef.current = false
      }
    },
    [sessionId, markGameCompleted, addGameResult, setStep],
  )

  const finishGame = useCallback(
    (completed: boolean) => {
      if (isFinishedRef.current) return
      const elapsed = Math.min(Date.now() - gameStartRef.current, GAME_DURATION_S * 1000)

      const rawResult: SyncRawResultV2 = {
        gameId: 'sync',
        payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
        contentVersion: STARPRINT_VERSIONS.officialV2.content,
        startedAtMs: gameStartRef.current,
        completedAtMs: Date.now(),
        deckId: SYNC_DECK_ID,
        cardOrder: cards.map((c) => c.cardId),
        durationMs: elapsed,
        completed,
        events: [...eventsRef.current],
      }

      void submitFinal(rawResult)
    },
    [cards, submitFinal],
  )

  // 30s Countdown Timer
  useEffect(() => {
    if (submitting) return

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
  }, [submitting])

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && !submitting && !isFinishedRef.current) {
      gameSfx.play('timer_timeout')
      finishGame(matchedPairs.size === TOTAL_PAIRS)
    }
  }, [timeLeft, submitting, matchedPairs, finishGame])

  const handleCardClick = (index: number) => {
    if (isLocked || submitting || isFinishedRef.current) return

    const card = cards[index]
    if (!card || matchedPairs.has(card.pairId)) return
    if (flippedIndices.includes(index)) return // already face up

    gameSfx.play('sync_flip')

    const atMs = Date.now() - gameStartRef.current
    eventsRef.current.push({
      type: 'card-selected',
      atMs,
      cardId: card.cardId,
    })

    if (flippedIndices.length === 0) {
      // First card flipped
      setFlippedIndices([index])
    } else if (flippedIndices.length === 1) {
      // Second card flipped
      const firstIndex = flippedIndices[0]
      const firstCard = cards[firstIndex]
      const nextFlipped = [firstIndex, index]
      setFlippedIndices(nextFlipped)

      const isMatch = firstCard.pairId === card.pairId
      eventsRef.current.push({
        type: 'pair-resolved',
        atMs: Date.now() - gameStartRef.current,
        firstCardId: firstCard.cardId,
        secondCardId: card.cardId,
        matched: isMatch,
      })

      if (isMatch) {
        // Matched!
        gameSfx.play('sync_match')
        gameSfx.vibrate(25)
        const nextMatched = new Set([...matchedPairs, card.pairId])
        setMatchedPairs(nextMatched)
        setFlippedIndices([])

        // Check if all 10 pairs matched early
        if (nextMatched.size === TOTAL_PAIRS) {
          setTimeout(() => {
            finishGame(true)
          }, 500)
        }
      } else {
        // Mismatch: lock interactions for 600ms to allow memorization, then flip back
        gameSfx.play('sync_mismatch')
        gameSfx.vibrate([10, 20])
        setIsLocked(true)
        setTimeout(() => {
          setFlippedIndices([])
          setIsLocked(false)
        }, 600)
      }
    }
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  return (
    <div className="game-step sync-game" role="region" aria-label="Trò chơi SYNC ghép cặp ngữ nghĩa">
      <div className="game-progress" aria-live="polite">
        <span className="game-progress__badge">🔄 SYNC</span>
        <span className="game-progress__step">
          Đã ghép: {matchedPairs.size}/{TOTAL_PAIRS} cặp
        </span>
        <span
          className={`game-progress__timer ${timeLeft <= 5 ? 'timer--urgent' : ''}`}
          aria-label={`Thời gian: ${timeLeft} giây`}
        >
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div
        className="game-progress-bar"
        role="progressbar"
        aria-valuenow={(matchedPairs.size / TOTAL_PAIRS) * 100}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="game-progress-bar__fill"
          style={{ width: `${(matchedPairs.size / TOTAL_PAIRS) * 100}%` }}
        />
      </div>

      <p className="game-micro-intro">
        Lật tìm các cặp thẻ tương đồng ngữ nghĩa trước khi hết giờ (30s · 10 cặp)
      </p>

      {/* 20 Cards Grid (Responsive ~4x5 on mobile, ~5x4 on desktop) */}
      <div className="sync-grid" role="group" aria-label="Lưới thẻ ghép cặp">
        {cards.map((c, i) => {
          const isMatched = matchedPairs.has(c.pairId)
          const isFlipped = flippedIndices.includes(i) || isMatched

          return (
            <button
              key={c.cardId}
              type="button"
              className={`sync-card ${isFlipped ? 'card--flipped' : ''} ${isMatched ? 'card--matched' : ''}`}
              onClick={() => handleCardClick(i)}
              disabled={isFlipped || isLocked || submitting}
              aria-label={isFlipped ? c.display : `Thẻ số ${i + 1}`}
            >
              <div className="sync-card__inner">
                <div className="sync-card__front">
                  <span>?</span>
                </div>
                <div className="sync-card__back">
                  {c.displayType === 'image' && c.imageUrl ? (
                    <div className="sync-card__image-wrap">
                      <img
                        src={c.imageUrl}
                        alt={c.display}
                        className="sync-card__img"
                        loading="eager"
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <span className={`sync-card__content ${c.displayType === 'emoji' ? 'content--emoji' : 'content--concept'}`}>
                      {c.display}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="game-error-box" role="alert">
          <p className="field-error">{error}</p>
          <button type="button" className="btn btn--primary" onClick={retrySubmit}>
            Thử gửi lại 🔄
          </button>
        </div>
      )}

      {submitting && <p className="game-submitting" aria-live="polite">Đang ghi nhận kết quả SYNC...</p>}
    </div>
  )
}
