import { useEffect, useState, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { starprintApi } from "../services/starprintApi"
import { useStarprintStore } from "../store/useStarprintStore"
import { ApiError } from "@/shared/services/http/apiClient"
import type { StarprintRenderData } from "../types/api.types"
import { StarPrintSVG } from "../components/StarPrintSVG"
import { PublishConsent } from "../components/PublishConsent"

export default function StarprintResultPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { reset } = useStarprintStore()
  const [starprint, setStarprint] = useState<StarprintRenderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorType, setErrorType] = useState<"not_found" | "network" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.title = "STARPRINT Kết Quả | 5SS UET"
  }, [])

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

  const handleDownload = () => {
    if (!starprint) return
    const svgElement = document.querySelector('.starprint-result-page__star svg') as SVGSVGElement | null
    if (!svgElement) return

    try {
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svgElement)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const URL = window.URL || window.webkitURL || window
      const blobURL = URL.createObjectURL(svgBlob)

      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = 2
        canvas.width = 500 * scale
        canvas.height = 560 * scale
        const context = canvas.getContext('2d')
        if (context) {
          context.scale(scale, scale)
          context.fillStyle = '#0b0f19'
          context.fillRect(0, 0, 500, 560)
          context.drawImage(image, 50, 20, 400, 400)

          context.fillStyle = '#ffffff'
          context.font = 'bold 20px system-ui, sans-serif'
          context.textAlign = 'center'
          context.fillText(starprint.nickname, 250, 450)

          context.fillStyle = '#ffd467'
          context.font = '16px system-ui, sans-serif'
          context.fillText(starprint.type.name, 250, 480)

          context.fillStyle = 'rgba(255,255,255,0.6)'
          context.font = '12px system-ui, sans-serif'
          context.fillText(starprint.publicStarId ? `Mã: ${starprint.publicStarId}` : '', 250, 510)

          const pngData = canvas.toDataURL('image/png')
          const downloadLink = document.createElement('a')
          downloadLink.download = `starprint-${starprint.publicStarId || starprint.nickname}.png`
          downloadLink.href = pngData
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        }
        URL.revokeObjectURL(blobURL)
      }
      image.src = blobURL
    } catch {
      // Fallback: direct SVG download
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svgElement)
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `starprint-${starprint.publicStarId || starprint.nickname}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="starprint-result-page">
      <div className="starprint-result-page__star">
        <StarPrintSVG
          palette={starprint.palette}
          effect={starprint.effect}
          photoUrl={starprint.photoUrl}
          completedWings={5}
          size={260}
        />
      </div>
      <div className="starprint-result-page__info">
        <h1>{starprint.nickname}</h1>
        <h2>{starprint.type.name}</h2>
        {starprint.type.tagline && <p className="starprint-tagline"><em>"{starprint.type.tagline}"</em></p>}
        <p>{starprint.type.description}</p>
        {starprint.publicStarId && (
          <div className="starprint-public-id" style={{ margin: '8px 0', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            Mã định danh: <code>{starprint.publicStarId}</code>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', margin: '12px 0' }}>
          <button onClick={handleDownload} className="btn btn--primary" aria-label="Tải ảnh STARPRINT về máy">
            📥 Tải ảnh STARPRINT
          </button>
          <button onClick={handleCopyLink} className="btn btn--outline" aria-label="Sao chép liên kết chia sẻ">
            {copied ? 'Đã chép liên kết! ✓' : '🔗 Sao chép liên kết'}
          </button>
        </div>

        {id && <PublishConsent starprintId={id} />}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
          <Link to="/sky" className="btn btn--primary">Xem 5SS Sky ✨</Link>
          <button onClick={handleCreateNew} className="btn btn--outline">Chơi lại / Tạo ngôi sao mới 🔄</button>
          <Link to="/" className="btn btn--ghost">Về trang chủ</Link>
        </div>
      </div>
    </div>
  )
}
