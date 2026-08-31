import { useRef, useEffect, useCallback, useState } from "react"
import { useStarprintStore } from "../../store/useStarprintStore"
import { submitGameWithReconciliation } from "../../services/gameSubmission"
import type { SprintRawResult } from "../../types/game.types"

const GAME_DURATION_MS = 20000
const GROUND_Y = 200
const PLAYER_X = 80
const PLAYER_SIZE = 32
const GRAVITY = 0.6
const JUMP_FORCE = -14
const OBSTACLE_SPEED = 4
const COLLECTIBLE_SPEED = 3

interface GameObject { x: number; y: number; width: number; height: number; counted?: boolean }
interface GameState {
  running: boolean; startTime: number; playerY: number; playerVY: number; onGround: boolean
  obstacles: GameObject[]; collectibles: GameObject[]
  obstaclesEncountered: number; obstaclesAvoided: number; collisions: number
  collectiblesAvailable: number; collectiblesCollected: number; jumpCount: number
  lastObstacle: number; lastCollectible: number; rafId: number
}

export function SprintGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState>({
    running: false, startTime: 0, playerY: GROUND_Y - PLAYER_SIZE, playerVY: 0, onGround: true,
    obstacles: [], collectibles: [], obstaclesEncountered: 0, obstaclesAvoided: 0, collisions: 0,
    collectiblesAvailable: 0, collectiblesCollected: 0, jumpCount: 0, lastObstacle: 0, lastCollectible: 0, rafId: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(GAME_DURATION_MS / 1000)
  const finalResultRef = useRef<SprintRawResult | null>(null)
  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  const submitFinal = useCallback(async (rawResult: SprintRawResult) => {
    if (!sessionId) return
    setSubmitting(true)
    setError(null)
    finalResultRef.current = rawResult

    const res = await submitGameWithReconciliation({
      sessionId,
      gameId: "sprint",
      rawResult,
      nextStep: "SUPPORT",
      markGameCompleted,
      addGameResult,
      setStep,
    })

    if (!res.success) {
      setError(res.error || "Lỗi gửi kết quả. Thử lại?")
    }
    setSubmitting(false)
  }, [sessionId, markGameCompleted, addGameResult, setStep])

  const jump = useCallback(() => {
    const s = stateRef.current
    if (s.onGround && s.running) { s.playerVY = JUMP_FORCE; s.onGround = false; s.jumpCount++ }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const s = stateRef.current
    Object.assign(s, {
      running: true, startTime: Date.now(), playerY: GROUND_Y - PLAYER_SIZE, playerVY: 0, onGround: true,
      obstacles: [], collectibles: [], obstaclesEncountered: 0, obstaclesAvoided: 0, collisions: 0,
      collectiblesAvailable: 0, collectiblesCollected: 0, jumpCount: 0, lastObstacle: 0, lastCollectible: 0,
    })
    const handleKey = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump() } }
    window.addEventListener("keydown", handleKey)
    const countdownInterval = setInterval(() => {
      const elapsed = Date.now() - s.startTime
      setCountdown(Math.ceil(Math.max(0, GAME_DURATION_MS - elapsed) / 1000))
    }, 200)
    function drawStar(c: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
      c.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2; const ia = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2
        if (i === 0) c.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); else c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
        c.lineTo(cx + r * 0.42 * Math.cos(ia), cy + r * 0.42 * Math.sin(ia))
      }; c.closePath()
    }
    function loop() {
      if (!s.running) return
      const elapsed = Date.now() - s.startTime
      if (elapsed >= GAME_DURATION_MS) {
        s.running = false
        cancelAnimationFrame(s.rafId)
        clearInterval(countdownInterval)
        setIsFinished(true)
        const rawResult: SprintRawResult = {
          gameId: "sprint", durationMs: GAME_DURATION_MS,
          obstaclesEncountered: s.obstaclesEncountered, obstaclesAvoided: s.obstaclesAvoided,
          collisions: s.collisions, collectiblesAvailable: s.collectiblesAvailable,
          collectiblesCollected: s.collectiblesCollected, jumpCount: s.jumpCount,
        }
        void submitFinal(rawResult)
        return
      }
      const W = canvas!.width; const H = canvas!.height
      ctx!.clearRect(0, 0, W, H)
      const bg = ctx!.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#0b234d"); bg.addColorStop(1, "#091a38")
      ctx!.fillStyle = bg; ctx!.fillRect(0, 0, W, H)
      ctx!.fillStyle = "rgba(255,255,255,0.3)"
      for (let i = 0; i < 15; i++) ctx!.fillRect(((i * 137 + elapsed * 0.02) % W), (i * 47) % (GROUND_Y - 20), 1, 1)
      ctx!.fillStyle = "#1a4080"; ctx!.fillRect(0, GROUND_Y + PLAYER_SIZE - 4, W, H)
      s.playerVY += GRAVITY; s.playerY += s.playerVY
      if (s.playerY >= GROUND_Y - PLAYER_SIZE) { s.playerY = GROUND_Y - PLAYER_SIZE; s.playerVY = 0; s.onGround = true }
      ctx!.save(); ctx!.shadowBlur = 16; ctx!.shadowColor = "#ffd467"; ctx!.fillStyle = "#ffd467"
      drawStar(ctx!, PLAYER_X, s.playerY + PLAYER_SIZE / 2, PLAYER_SIZE / 2); ctx!.fill(); ctx!.restore()
      if (elapsed - s.lastObstacle > 1400 + Math.random() * 900) { s.obstacles.push({ x: W, y: GROUND_Y - 36, width: 22, height: 36, counted: false }); s.obstaclesEncountered++; s.lastObstacle = elapsed }
      if (elapsed - s.lastCollectible > 1800 + Math.random() * 1200) { s.collectibles.push({ x: W + 40, y: GROUND_Y - 72, width: 16, height: 16 }); s.collectiblesAvailable++; s.lastCollectible = elapsed }
      const pL = PLAYER_X - PLAYER_SIZE / 2 + 6; const pR = PLAYER_X + PLAYER_SIZE / 2 - 6
      const pT = s.playerY + 4; const pB = s.playerY + PLAYER_SIZE - 4
      s.obstacles = s.obstacles.filter((ob) => {
        ob.x -= OBSTACLE_SPEED
        const hit = ob.x < pR && ob.x + ob.width > pL && ob.y < pB && ob.y + ob.height > pT
        if (hit) { s.collisions++; ctx!.fillStyle = "#ff6584"; ctx!.shadowBlur = 10; ctx!.shadowColor = "#ff6584" }
        else { if (!ob.counted && ob.x + ob.width < PLAYER_X - PLAYER_SIZE / 2) { s.obstaclesAvoided++; ob.counted = true }; ctx!.fillStyle = "#9a7bef"; ctx!.shadowBlur = 0 }
        ctx!.fillRect(ob.x, ob.y, ob.width, ob.height); ctx!.shadowBlur = 0; return ob.x > -ob.width
      })
      s.collectibles = s.collectibles.filter((col) => {
        col.x -= COLLECTIBLE_SPEED
        const collected = col.x < pR && col.x + col.width > pL && col.y < pB && col.y + col.height > pT
        if (collected) { s.collectiblesCollected++; return false }
        ctx!.save(); ctx!.fillStyle = "#6cd5f7"; ctx!.shadowBlur = 10; ctx!.shadowColor = "#6cd5f7"
        ctx!.beginPath(); ctx!.arc(col.x + 8, col.y + 8, 8, 0, Math.PI * 2); ctx!.fill(); ctx!.restore()
        return col.x > -col.width
      })
      ctx!.fillStyle = "rgba(108,213,247,0.15)"; ctx!.fillRect(0, H - 4, W, 4)
      ctx!.fillStyle = "#6cd5f7"; ctx!.fillRect(0, H - 4, W * (elapsed / GAME_DURATION_MS), 4)
      s.rafId = requestAnimationFrame(loop)
    }
    s.rafId = requestAnimationFrame(loop)
    return () => { s.running = false; cancelAnimationFrame(s.rafId); clearInterval(countdownInterval); window.removeEventListener("keydown", handleKey) }
  }, [jump, submitFinal])

  const retrySubmit = () => {
    if (finalResultRef.current) {
      void submitFinal(finalResultRef.current)
    }
  }

  return (
    <div className="game-step sprint-game">
      <div className="game-progress">🏃 SPRINT · {countdown}s</div>
      <p className="sprint-game__hint">Space/↑ hoặc chạm màn hình để nhảy!</p>
      <canvas ref={canvasRef} width={480} height={260} className="sprint-game__canvas" onClick={jump}
        style={{ cursor: isFinished ? "default" : "pointer", touchAction: "manipulation" }} aria-label="SPRINT game canvas" role="img" />
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
