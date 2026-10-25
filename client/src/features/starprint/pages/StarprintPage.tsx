import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useStarprintStore } from "../store/useStarprintStore"
import { ApiError, ensureServerReady } from "@/shared/services/http/apiClient"
import { starprintApi } from "../services/starprintApi"
import { StarprintIntro } from "../components/StarprintIntro"
import { PlayerInfoStep } from "../components/PlayerInfoStep"
import { CameraStep } from "../components/CameraStep"
import { SolveGame } from "../games/solve/SolveGame"
import { SenseGame } from "../games/sense/SenseGame"
import { SprintGame } from "../games/sprint/SprintGame"
import { SupportGame } from "../games/support/SupportGame"
import { SyncGame } from "../games/sync/SyncGame"
import { ColorPickerStep } from "../components/ColorPickerStep"
import { GeneratingStep } from "../components/GeneratingStep"
import { FinalReveal } from "../components/FinalReveal"
import { ConstellationNav } from "../components/ConstellationNav"

export default function StarprintPage() {
  const { sessionId, currentStep, setStep, restoreFromSession, reset } = useStarprintStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [restoring, setRestoring] = useState(Boolean(sessionId))
  const [restoreError, setRestoreError] = useState(false)
  const [restoreAttempt, setRestoreAttempt] = useState(0)

  useEffect(() => {
    document.title = "STARPRINT | 5SS UET"
  }, [])

  // Handle explicit ?new=1 query to start a fresh game
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get("new") === "1") {
      reset()
      navigate("/starprint", { replace: true })
    }
  }, [location.search, reset, navigate])

  // Restore in-progress session on accidental reload
  useEffect(() => {
    if (!sessionId) { setRestoring(false); return }
    const params = new URLSearchParams(location.search)
    if (params.get("new") === "1") return

    let cancelled = false
    setRestoring(true)
    setRestoreError(false)
    ensureServerReady()
      .then(() => starprintApi.getSession(sessionId))
      .then((session) => {
        if (cancelled) return
        if ((session.status === "GENERATED" || session.status === "PUBLISHED") && session.starprintId) {
          navigate(`/starprint/result/${session.starprintId}`, { replace: true })
          return
        }
        restoreFromSession(session)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.statusCode === 404 || err.code === "SESSION_NOT_FOUND")) reset()
        else setRestoreError(true)
      })
      .finally(() => { if (!cancelled) setRestoring(false) })
    return () => { cancelled = true }
  }, [sessionId, location.search, restoreFromSession, reset, navigate, restoreAttempt])

  const handleStartFresh = () => {
    reset()
    setStep("PLAYER_INFO")
  }

  const renderStep = () => {
    if (restoring) return <div className="game-loading"><p>Đang khôi phục phiên chơi...</p></div>
    if (restoreError) return <div className="game-error"><p>Máy chủ chưa sẵn sàng. Tiến trình của bạn vẫn được giữ.</p><button className="btn btn--primary" onClick={() => setRestoreAttempt(n => n + 1)}>Thử kết nối lại</button></div>
    switch (currentStep) {
      case "INTRO": return <StarprintIntro onStart={handleStartFresh} />
      case "PLAYER_INFO": return <PlayerInfoStep />
      case "CAMERA": return <CameraStep />
      case "SOLVE": return <SolveGame />
      case "SENSE": return <SenseGame />
      case "SPRINT": return <SprintGame />
      case "SUPPORT": return <SupportGame />
      case "SYNC": return <SyncGame />
      case "COLOR_PICKER": return <ColorPickerStep />
      case "GENERATING": return <GeneratingStep />
      case "FINAL_REVEAL": return <FinalReveal />
      default: return <StarprintIntro onStart={handleStartFresh} />
    }
  }

  return (
    <div className="starprint-container">
      <ConstellationNav />
      {currentStep !== "INTRO" && currentStep !== "GENERATING" && currentStep !== "FINAL_REVEAL" && (
        <button
          onClick={handleStartFresh}
          className="starprint-reset-btn"
          title="Bắt đầu lại từ đầu"
          aria-label="Chơi lại từ đầu"
        >
          <span className="reset-btn-icon">🔄</span>
          <span className="reset-btn-label"> Bắt đầu lại</span>
        </button>
      )}
      {renderStep()}
    </div>
  )
}
