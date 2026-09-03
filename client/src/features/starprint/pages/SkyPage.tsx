import { useEffect, useState, useRef, lazy, Suspense, useCallback } from "react"
import { Link } from "react-router-dom"
import { useReducedMotion } from "motion/react"
import { starprintApi } from "../services/starprintApi"
import { normalizeMediaUrl, getSocketBaseUrl } from "@/shared/services/http/apiClient"
import { AccessibleModal } from "@/shared/components/AccessibleModal"
import type { SkyStar } from "../types/api.types"

const StarSkyScene = lazy(() => import("@/three/starprint/StarSkyScene").then(m => ({ default: m.StarSkyScene })))

export default function SkyPage() {
  const reducedMotion = useReducedMotion()
  const [stars, setStars] = useState<SkyStar[]>([])
  const [selectedStar, setSelectedStar] = useState<SkyStar | null>(null)
  const [viewMode, setViewMode] = useState<"3d" | "grid">(() => (reducedMotion ? "grid" : "3d"))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    document.title = "5SS Sky | 5SS UET"
  }, [])

  const fetchSky = useCallback(async (isInitial = false) => {
    if (!isInitial) {
      setLoading(true)
    }
    setError(null)
    try {
      const data = await starprintApi.getSky()
      if (isMountedRef.current) {
        setStars(data)
        setLoading(false)
      }
    } catch {
      if (isMountedRef.current) {
        setError("Không thể tải danh sách ngôi sao từ máy chủ. Vui lòng thử lại.")
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    void fetchSky(true)

    const socketUrl = getSocketBaseUrl()
    let socketInstance: any = null

    import("socket.io-client")
      .then(({ io }) => {
        if (!isMountedRef.current) return
        socketInstance = io(socketUrl, {
          transports: ["websocket", "polling"],
          timeout: 10000,
        })
        socketInstance.on("connect", () => {
          if (isMountedRef.current) setConnected(true)
        })
        socketInstance.on("disconnect", () => {
          if (isMountedRef.current) setConnected(false)
        })
        socketInstance.on("star.created", (data: { star: SkyStar }) => {
          if (isMountedRef.current) {
            setStars((prev) => [data.star, ...prev.filter((s) => s.id !== data.star.id)])
          }
        })
      })
      .catch(() => {})

    return () => {
      isMountedRef.current = false
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [fetchSky])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="game-loading">
          <p>Đang tải dữ liệu 5SS Sky...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="game-error">
          <p className="field-error">{error}</p>
          <button className="btn btn--primary" onClick={() => void fetchSky()}>
            Thử tải lại 🔄
          </button>
        </div>
      )
    }

    if (viewMode === "3d") {
      return (
        <div className="sky-page__3d-container">
          <Suspense
            fallback={
              <div className="game-loading">
                <p>Đang tải bầu trời 3D...</p>
              </div>
            }
          >
            <StarSkyScene stars={stars} onSelectStar={setSelectedStar} />
          </Suspense>
          {stars.length === 0 && (
            <p className="sky-page__empty-overlay">Chưa có ngôi sao nào. Hãy là người đầu tiên tỏa sáng!</p>
          )}
        </div>
      )
    }

    return (
      <div className="sky-page__grid">
        {stars.length === 0 ? (
          <p className="sky-page__empty">Chưa có ngôi sao nào. Hãy là người đầu tiên tỏa sáng!</p>
        ) : (
          stars.map((star) => {
            const photoSrc = normalizeMediaUrl(star.photoUrl)
            return (
              <button
                key={star.id}
                type="button"
                className="sky-star-card"
                onClick={() => setSelectedStar(star)}
                aria-label={`Ngôi sao của ${star.nickname || "Ẩn danh"}, kiểu ${star.type}`}
              >
                {photoSrc && (
                  <img
                    src={photoSrc}
                    alt={star.nickname ? `Chân dung ${star.nickname}` : "Ảnh ngôi sao"}
                    className="sky-star-card__photo"
                  />
                )}
                <div className="sky-star-card__colors">
                  {star.palette.map((color, i) => (
                    <span key={i} className="sky-star-card__dot" style={{ background: color }} />
                  ))}
                </div>
                <div className="sky-star-card__meta">
                  {star.nickname && <strong>{star.nickname}</strong>}
                  <span>{star.type}</span>
                </div>
              </button>
            )
          })
        )}
      </div>
    )
  }

  return (
    <div className="sky-page">
      <header className="sky-page__header">
        <h1>5SS Sky ✨</h1>
        <p>Bầu trời quy tụ những ngôi sao STARPRINT của cộng đồng 5SS UET</p>
        <div className="sky-page__controls">
          {connected && <span className="sky-page__live-badge">● LIVE</span>}
          <div className="sky-page__view-toggle" role="group" aria-label="Chế độ xem">
            <button
              className={`btn btn--sm ${viewMode === "3d" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setViewMode("3d")}
              aria-pressed={viewMode === "3d"}
            >
              🌌 3D Thiên Hà
            </button>
            <button
              className={`btn btn--sm ${viewMode === "grid" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
            >
              📋 Danh Sách
            </button>
          </div>
        </div>
      </header>

      {renderContent()}

      {/* Accessible Modal Dialog for Star Details */}
      <AccessibleModal
        open={Boolean(selectedStar)}
        onClose={() => setSelectedStar(null)}
        title={selectedStar?.nickname || "Ngôi sao 5SS"}
      >
        {selectedStar && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
            {selectedStar.photoUrl && (
              <img
                src={normalizeMediaUrl(selectedStar.photoUrl) || ""}
                alt={selectedStar.nickname ?? "Star"}
                className="sky-modal-photo"
              />
            )}
            <h3 style={{ margin: 0, color: "#ffffff" }}>{selectedStar.nickname || "Ngôi sao 5SS"}</h3>
            <p className="sky-modal-type">{selectedStar.type}</p>
            <div className="sky-modal-palette">
              {selectedStar.palette?.map((c, i) => (
                <span key={i} className="sky-modal-swatch" style={{ background: c }} />
              ))}
            </div>
          </div>
        )}
      </AccessibleModal>

      <footer className="sky-page__footer">
        <Link to="/starprint?new=1" className="btn btn--primary sky-page__cta">
          Tạo STARPRINT của bạn ✨
        </Link>
        <Link to="/" className="btn btn--outline sky-page__home">
          ← Về trang chủ
        </Link>
      </footer>
    </div>
  )
}
