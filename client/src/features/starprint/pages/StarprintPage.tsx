import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useStarprintStore } from "../store/useStarprintStore"
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

export default function StarprintPage() {
  const { sessionId, currentStep, setStep, restoreFromSession, reset } = useStarprintStore()
  const navigate = useNavigate()
  const location = useLocation()

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
    if (!sessionId) return
    const params = new URLSearchParams(location.search)
    if (params.get("new") === "1") return

    starprintApi
      .getSession(sessionId)
      .then((session) => {
        if ((session.status === "GENERATED" || session.status === "PUBLISHED") && session.starprintId) {
          navigate(`/starprint/result/${session.starprintId}`, { replace: true })
          return
        }
        restoreFromSession(session)
      })
      .catch(() => { reset() })
  }, [sessionId, location.search, restoreFromSession, reset, navigate])

  const handleStartFresh = () => {
    reset()
    setStep("PLAYER_INFO")
  }

  const renderStep = () => {
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
      {currentStep !== "INTRO" && currentStep !== "GENERATING" && currentStep !== "FINAL_REVEAL" && (
        <button
          onClick={handleStartFresh}
          className="starprint-reset-btn"
          title="Bắt đầu lại từ đầu"
          aria-label="Chơi lại từ đầu"
        >
          🔄 Bắt đầu lại
        </button>
      )}
      {renderStep()}
    </div>
  )
}
