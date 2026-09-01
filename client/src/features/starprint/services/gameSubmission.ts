import { starprintApi } from './starprintApi'
import type { LegacyGameRawResultMap } from '@5ss/contracts'
import type { MiniGameResult, StarprintGameId, StarprintStep } from '../types/game.types'

export interface SubmitAndReconcileOptions<TGameId extends StarprintGameId> {
  sessionId: string
  gameId: TGameId
  rawResult: LegacyGameRawResultMap[TGameId]
  nextStep: StarprintStep
  markGameCompleted: (gameId: StarprintGameId) => void
  addGameResult: (result: MiniGameResult<TGameId>) => void
  setStep: (step: StarprintStep) => void
}

export async function submitGameWithReconciliation<TGameId extends StarprintGameId>({
  sessionId,
  gameId,
  rawResult,
  nextStep,
  markGameCompleted,
  addGameResult,
  setStep,
}: SubmitAndReconcileOptions<TGameId>): Promise<{ success: boolean; error?: string }> {
  try {
    await starprintApi.submitGame(sessionId, gameId, { rawResult })
    addGameResult({ gameId, rawResult })
    markGameCompleted(gameId)
    setStep(nextStep)
    return { success: true }
  } catch (err: any) {
    // If request failed (network error, timeout, or duplicate status), check if server actually recorded it
    try {
      const session = await starprintApi.getSession(sessionId)
      if (session.completedGameIds.includes(gameId)) {
        addGameResult({ gameId, rawResult })
        markGameCompleted(gameId)
        setStep(nextStep)
        return { success: true }
      }
    } catch {
      // Reconcile failed, proceed to surface error
    }

    const message =
      err?.message && !err.message.includes('Object')
        ? err.message
        : 'Lỗi kết nối máy chủ khi ghi nhận kết quả. Vui lòng bấm thử gửi lại bên dưới.'
    return { success: false, error: message }
  }
}
