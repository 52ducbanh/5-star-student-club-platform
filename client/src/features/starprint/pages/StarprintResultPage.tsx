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
        <p>{starprint.type.description}</p>
        {id && <PublishConsent starprintId={id} />}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "8px" }}>
          <Link to="/sky" className="btn btn--primary">Xem 5SS Sky ✨</Link>
          <button onClick={handleCreateNew} className="btn btn--outline">Chơi lại / Tạo ngôi sao mới 🔄</button>
          <Link to="/" className="btn btn--ghost">Về trang chủ</Link>
        </div>
      </div>
    </div>
  )
}
