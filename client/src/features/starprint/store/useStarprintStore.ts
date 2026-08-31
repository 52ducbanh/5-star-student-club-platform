import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StarprintStep, StarprintGameId, MiniGameResult } from '../types/game.types'
import type { StarprintRenderData } from '../types/api.types'

interface StarprintGameState {
  sessionId: string | null
  nickname: string
  photoPreviewUrl: string | null
  currentStep: StarprintStep
  completedGameIds: StarprintGameId[]
  gameResults: MiniGameResult[]
  selectedColor: string | null
  starprint: StarprintRenderData | null
}

interface StarprintActions {
  setSessionId(id: string): void
  setNickname(name: string): void
  setPhotoPreviewUrl(url: string | null): void
  setStep(step: StarprintStep): void
  markGameCompleted(gameId: StarprintGameId): void
  addGameResult(result: MiniGameResult): void
  setSelectedColor(color: string): void
  setStarprint(data: StarprintRenderData): void
  restoreFromSession(session: { completedGameIds: string[] }): void
  reset(): void
}

const GAME_ORDER: StarprintGameId[] = ['solve', 'sense', 'sprint', 'support', 'sync']

function deriveStepFromCompletedGames(completedGameIds: string[]): StarprintStep {
  const completed = completedGameIds as StarprintGameId[]
  for (const gameId of GAME_ORDER) {
    if (!completed.includes(gameId)) return gameId.toUpperCase() as StarprintStep
  }
  return 'COLOR_PICKER'
}

const initialState: StarprintGameState = {
  sessionId: null,
  nickname: '',
  photoPreviewUrl: null,
  currentStep: 'INTRO',
  completedGameIds: [],
  gameResults: [],
  selectedColor: null,
  starprint: null,
}

export const useStarprintStore = create<StarprintGameState & StarprintActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSessionId: (id) => set({ sessionId: id }),
      setNickname: (name) => set({ nickname: name }),
      setPhotoPreviewUrl: (url) => set({ photoPreviewUrl: url }),
      setStep: (step) => set({ currentStep: step }),
      markGameCompleted: (gameId) =>
        set((state) => ({
          completedGameIds: state.completedGameIds.includes(gameId)
            ? state.completedGameIds
            : [...state.completedGameIds, gameId],
        })),
      addGameResult: (result) =>
        set((state) => ({ gameResults: [...state.gameResults, result] })),
      setSelectedColor: (color) => set({ selectedColor: color }),
      setStarprint: (data) => set({ starprint: data }),
      restoreFromSession: (session) => {
        const completedGameIds = session.completedGameIds as StarprintGameId[]
        set((state) => {
          // If no games completed yet and user was on CAMERA or PLAYER_INFO, preserve that step
          if (completedGameIds.length === 0 && (state.currentStep === 'CAMERA' || state.currentStep === 'PLAYER_INFO')) {
            return { completedGameIds }
          }
          const nextStep = deriveStepFromCompletedGames(completedGameIds)
          return { completedGameIds, currentStep: nextStep }
        })
      },
      reset: () => set(initialState),
    }),
    {
      name: 'starprint-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        nickname: state.nickname,
        currentStep: state.currentStep,
        completedGameIds: state.completedGameIds,
        selectedColor: state.selectedColor,
      }),
    },
  ),
)
