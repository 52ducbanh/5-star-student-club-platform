import { useEffect, useState, useCallback } from "react"
import { useParams, useLocation, Link, useNavigate } from "react-router-dom"
import { starprintApi } from "../services/starprintApi"
import { useStarprintStore } from "../store/useStarprintStore"
import { ApiError } from "@/shared/services/http/apiClient"
import type { StarprintRenderData } from "../types/api.types"
import { StarCard } from "../components/StarCard"
import { exportStarCardToPng } from "../components/StarCardExport"
import { PublishConsent } from "../components/PublishConsent"

interface StarprintResultPageProps {
  readOnly?: boolean
}

export default function StarprintResultPage({ readOnly }: StarprintResultPageProps = {}) {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const isPublicView = Boolean(readOnly || location.pathname.startsWith('/star/'))
  const { sessionId: storeSessionId, reset } = useStarprintStore()
  const [starprint, setStarprint] = useState<StarprintRenderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorType, setErrorType] = useState<"not_found" | "network" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    document.title = isPublicView ? "STAR CARD | 5SS UET" : "STARPRINT Kết Quả | 5SS UET"
  }, [isPublicView])

  const fetchStarprint = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setErrorType(null)
    setErrorMessage(null)
    try {
      const data = await starprintApi.getStarprint(id)
      setStarprint(data)
      setLoading(false)
    } catch (err: any) {
      if (err instanceof ApiError && (err.statusCode === 404 || err.code === "STARPRINT_NOT_FOUND")) {
        setErrorType("not_found")
        setErrorMessage("Không tìm thấy kết quả STARPRINT này trong hệ thống.")
      } else {
        setErrorType("network")
        setErrorMessage(err?.message || "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.")
      }
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchStarprint()
  }, [fetchStarprint])

  const handleCreateNew = () => {
    reset()
    navigate("/starprint?new=1", { replace: true })
  }

  if (!id) {
    return (
      <div className="game-error">
        <p>Mã kết quả không hợp lệ.</p>
        <button onClick={handleCreateNew} className="btn btn--primary">Tạo STARPRINT mới ✨</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="game-loading">
        <p>Đang tải kết quả STARPRINT...</p>
      </div>
    )
  }

  if (errorType === "not_found") {
    return (
      <div className="game-error">
        <h2>Không tìm thấy kết quả</h2>
        <p>{errorMessage}</p>
        <button onClick={handleCreateNew} className="btn btn--primary">
          Bắt đầu tạo STARPRINT mới ✨
        </button>
      </div>
    )
  }

  if (errorType === "network" || !starprint) {
    return (
      <div className="game-error">
        <h2>Lỗi kết nối máy chủ</h2>
        <p>{errorMessage}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={fetchStarprint} className="btn btn--primary">
            Thử tải lại 🔄
          </button>
          <button onClick={handleCreateNew} className="btn btn--outline">
            Tạo lượt chơi mới
          </button>
        </div>
      </div>
    )
  }

  const handleCopyLink = () => {
    if (!starprint) return
    const publicId = starprint.publicStarId || id
    const shareUrl = `${window.location.origin}/star/${publicId}`
    void navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
  }

  const handleDownload = async () => {
    if (!starprint || isExporting) return
    setIsExporting(true)
    try {
      await exportStarCardToPng(starprint)
    } catch (err) {
      console.error('Failed to export PNG:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="starprint-result-page">
      <div className="starprint-result-layout">
        {/* LEFT COLUMN: STAR CARD preview + primary actions */}
        <div className="starprint-result-layout__card">
          <StarCard starprint={starprint} />

          <div className="starprint-result-layout__actions">
            <button
              onClick={handleDownload}
              className="btn btn--primary"
              aria-label="Tải thẻ STAR CARD Digital về máy"
              disabled={isExporting}
            >
              {isExporting ? '⏳ Đang tạo ảnh HD...' : '📥 Tải thẻ STAR CARD Digital (PNG)'}
            </button>
            <button
              onClick={handleCopyLink}
              className="btn btn--outline"
              aria-label="Sao chép liên kết chia sẻ"
            >
              {copied ? 'Đã chép liên kết! ✓' : '🔗 Sao chép liên kết'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Consent panel (Owner only) or Public Info + CTAs */}
        <div className="starprint-result-layout__panel">
          {isPublicView ? (
            <div className="publish-consent">
              <div className="publish-consent__header">
                <span className="publish-consent__icon">✨</span>
                <strong>Ngôi sao đang tỏa sáng trên 5SS Sky</strong>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5 }}>
                Ngôi sao này đã được định danh độc bản tại sự kiện Khai hội 5SS UET 2026. Bạn có thể khám phá toàn bộ bầu trời hoặc tạo riêng cho mình một STARPRINT độc bản!
              </p>
            </div>
          ) : (
            id && (
              <PublishConsent
                starprintId={id}
                sessionId={starprint.sessionId || storeSessionId || ''}
                initialPhysicalCard={starprint.physicalCardRequested}
                initialMediaPermission={starprint.mediaPermission}
              />
            )
          )}

          <div className="starprint-result-layout__ctas">
            {isPublicView ? (
              <>
                <Link to="/starprint?new=1" className="btn btn--primary">Tạo STARPRINT của bạn ✨</Link>
                <Link to="/sky" className="btn btn--outline">Khám phá 5SS Sky 🌌</Link>
                <Link to="/" className="btn btn--ghost">← Về trang chủ</Link>
              </>
            ) : (
              <>
                <Link to="/sky" className="btn btn--primary">Xem 5SS Sky ✨</Link>
                <button onClick={handleCreateNew} className="btn btn--outline">Tạo ngôi sao mới 🔄</button>
                <Link to="/" className="btn btn--ghost">Về trang chủ</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}