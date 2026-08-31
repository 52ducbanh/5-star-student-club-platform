import { useState, useEffect, useCallback, useRef } from "react"
import { useStarprintStore } from "../../store/useStarprintStore"
import { submitGameWithReconciliation } from "../../services/gameSubmission"
import type { SupportRawResult } from "../../types/game.types"

type TileType = "straight" | "corner" | "tee" | null
interface Tile { type: TileType; rotation: number; isSource?: boolean; isTarget?: boolean }

// Directions: 0 = North, 1 = East, 2 = South, 3 = West
function getTileOpenings(type: TileType, rotation: number): number[] {
  if (!type) return []
  const rot = rotation % 4
  if (type === "straight") {
    return rot % 2 === 0 ? [1, 3] : [0, 2]
  }
  if (type === "corner") {
    return [rot, (rot + 1) % 4]
  }
  if (type === "tee") {
    return [rot, (rot + 1) % 4, (rot + 3) % 4]
  }
  return []
}

function checkPathConnected(grid: Tile[][]): { connected: boolean; activePath: Set<string> } {
  const activePath = new Set<string>()
  const queue: Array<[number, number]> = [[1, 0]]
  const visited = new Set<string>(["1,0"])
  activePath.add("1,0")

  const oppositeDir = (d: number) => (d + 2) % 4
  const delta: Record<number, [number, number]> = {
    0: [-1, 0], // North
    1: [0, 1],  // East
    2: [1, 0],  // South
    3: [0, -1], // West
  }

  while (queue.length > 0) {
    const [r, c] = queue.shift()!
    if (r === 3 && c === 3) {
      return { connected: true, activePath }
    }

    const currentTile = grid[r][c]
    const openings = getTileOpenings(currentTile.type, currentTile.rotation)
    if (currentTile.isSource && !openings.includes(1)) openings.push(1)

    for (const dir of openings) {
      const [dr, dc] = delta[dir]
      const nr = r + dr
      const nc = c + dc

      if (nr < 0 || nr >= 4 || nc < 0 || nc >= 4) continue
      const neighborKey = `${nr},${nc}`
      if (visited.has(neighborKey)) continue

      const neighborTile = grid[nr][nc]
      if (!neighborTile.type) continue

      const neighborOpenings = getTileOpenings(neighborTile.type, neighborTile.rotation)
      if (neighborTile.isTarget && !neighborOpenings.includes(3) && !neighborOpenings.includes(0)) {
        neighborOpenings.push(3)
      }

      if (neighborOpenings.includes(oppositeDir(dir))) {
        visited.add(neighborKey)
        activePath.add(neighborKey)
        queue.push([nr, nc])
      }
    }
  }

  return { connected: false, activePath }
}

const INITIAL_GRID: Tile[][] = [
  [{ type: null, rotation: 0 }, { type: "straight", rotation: 1 }, { type: "corner", rotation: 2 }, { type: null, rotation: 0 }],
  [{ type: "corner", rotation: 0, isSource: true }, { type: "straight", rotation: 0 }, { type: "tee", rotation: 1 }, { type: "corner", rotation: 3 }],
  [{ type: null, rotation: 0 }, { type: "corner", rotation: 1 }, { type: "straight", rotation: 0 }, { type: "straight", rotation: 0 }],
  [{ type: null, rotation: 0 }, { type: null, rotation: 0 }, { type: "corner", rotation: 0 }, { type: "corner", rotation: 1, isTarget: true }],
]

const GAME_DURATION_MS = 25000

export function SupportGame() {
  const [grid, setGrid] = useState<Tile[][]>(() => INITIAL_GRID.map((row) => row.map((t) => ({ ...t }))))
  const [rotations, setRotations] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [isTerminal, setIsTerminal] = useState(false)
  const [activePath, setActivePath] = useState<Set<string>>(new Set(["1,0"]))
  const [elapsed, setElapsed] = useState(0)
  const [start] = useState(() => Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const finalResultRef = useRef<SupportRawResult | null>(null)
  const { sessionId, setStep, markGameCompleted, addGameResult } = useStarprintStore()

  const submitFinal = useCallback(async (isDone: boolean, elapsedMs: number, totalRotations: number) => {
    if (!sessionId) return
    setSubmitting(true)
    setError(null)
    const rawResult: SupportRawResult = {
      gameId: "support",
      completed: isDone,
      rotations: totalRotations,
      elapsedMs,
    }
    finalResultRef.current = rawResult

    const res = await submitGameWithReconciliation({
      sessionId,
      gameId: "support",
      rawResult,
      nextStep: "SYNC",
      markGameCompleted,
      addGameResult,
      setStep,
    })

    if (!res.success) {
      setError(res.error || "Lỗi gửi kết quả. Thử lại?")
    }
    setSubmitting(false)
  }, [sessionId, markGameCompleted, addGameResult, setStep])

  useEffect(() => {
    if (isTerminal || completed) return
    const interval = setInterval(() => {
      const el = Date.now() - start
      setElapsed(el)
      if (el >= GAME_DURATION_MS) {
        clearInterval(interval)
        setIsTerminal(true)
        void submitFinal(false, el, rotations)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [isTerminal, completed, start, rotations, submitFinal])

  const rotateTile = (row: number, col: number) => {
    if (completed || isTerminal || submitting) return
    const newRotations = rotations + 1
    setRotations(newRotations)

    const nextGrid = grid.map((r, ri) =>
      r.map((t, ci) => (ri === row && ci === col ? { ...t, rotation: (t.rotation + 1) % 4 } : { ...t }))
    )
    setGrid(nextGrid)

    const { connected: isConnected, activePath: newPath } = checkPathConnected(nextGrid)
    setActivePath(newPath)

    if (isConnected) {
      setCompleted(true)
      setIsTerminal(true)
      void submitFinal(true, elapsed, newRotations)
    }
  }

  const retrySubmit = () => {
    if (finalResultRef.current) {
      const { completed: isDone, elapsedMs, rotations: rot } = finalResultRef.current
      void submitFinal(isDone, elapsedMs, rot)
    }
  }

  const remaining = Math.max(0, GAME_DURATION_MS - elapsed)
  const tileSymbols: Record<NonNullable<TileType>, string> = { straight: "━", corner: "┗", tee: "┳" }

  return (
    <div className="game-step support-game">
      <div className="game-progress">🔗 SUPPORT · {Math.ceil(remaining / 1000)}s còn lại</div>
      <h2>Kết nối dòng năng lượng</h2>
      <p>Xoay các ô để nối thông mạch từ trạm nguồn ⚡ đến đích 🎯</p>
      <div className="support-game__grid">
        {grid.map((row, r) =>
          row.map((tile, c) => {
            const isEnergized = activePath.has(`${r},${c}`)
            return (
              <button
                key={`${r}-${c}`}
                className={[
                  "support-tile",
                  tile.isSource ? "source" : "",
                  tile.isTarget ? "target" : "",
                  isEnergized ? "energized" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ transform: `rotate(${tile.rotation * 90}deg)` }}
                onClick={() => rotateTile(r, c)}
                disabled={!tile.type || completed || isTerminal || submitting}
                aria-label={`Ô hàng ${r + 1}, cột ${c + 1}: ${tile.type ?? "trống"}, xoay ${tile.rotation * 90} độ`}
              >
                {tile.isSource ? "⚡" : tile.isTarget ? "🎯" : tile.type ? tileSymbols[tile.type] : ""}
              </button>
            )
          })
        )}
      </div>
      {completed && <p className="game-success" role="status">✨ Mạch kết nối thành công!</p>}
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
