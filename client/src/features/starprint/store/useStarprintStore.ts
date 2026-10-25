import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StarprintStep, StarprintGameId, MiniGameResult } from '../types/game.types'
import type { StarprintRenderData } from '../types/api.types'
import { gameSessionStorage, isLocalPortrait } from '../utils/sessionStorage'

interface StarprintGameState {
  sessionId: string | null
  nickname: string
  photoPreviewUrl: string | null
  currentStep: StarprintStep
  completedGameIds: StarprintGameId[]
  gameResults: MiniGameResult[]
  selectedColor: string | null
  starprint: StarprintRenderData | null
  assignedSolveQuestionIds?: string[]
  assignedSenseScenarioIds?: string[]
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
  setAssignments(solveIds?: string[], senseIds?: string[]): void
  restoreFromSession(session: {
    completedGameIds: string[]
    assignedSolveQuestionIds?: string[]
    assignedSenseScenarioIds?: string[]
    photoUrl?: string | null
  }): void
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
      setSessionId: (id) => set((state) => ({ sessionId: id, photoPreviewUrl: state.sessionId === id ? state.photoPreviewUrl : null })),
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
      setAssignments: (solveIds, senseIds) =>
        set({ assignedSolveQuestionIds: solveIds, assignedSenseScenarioIds: senseIds }),
      restoreFromSession: (session) => {
        const completedGameIds = session.completedGameIds as StarprintGameId[]
        set((state) => {
          const assignments = {
            assignedSolveQuestionIds: session.assignedSolveQuestionIds ?? state.assignedSolveQuestionIds,
            assignedSenseScenarioIds: session.assignedSenseScenarioIds ?? state.assignedSenseScenarioIds,
          }
          const restoredPhoto = isLocalPortrait(state.photoPreviewUrl) ? state.photoPreviewUrl : null
          if (completedGameIds.length === 0 && (state.currentStep === 'CAMERA' || state.currentStep === 'PLAYER_INFO')) {
            return { completedGameIds, photoPreviewUrl: restoredPhoto, ...assignments }
          }
          const nextStep = deriveStepFromCompletedGames(completedGameIds)
          return { completedGameIds, photoPreviewUrl: restoredPhoto, currentStep: nextStep, ...assignments }
        })
      },
      reset: () => set(initialState),
    }),
    {
      name: 'starprint-session',
      storage: createJSONStorage(() => gameSessionStorage),
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<StarprintGameState>
        return { ...state, photoPreviewUrl: isLocalPortrait(state.photoPreviewUrl) ? state.photoPreviewUrl : null }
      },
      merge: (persisted, current) => {
        const state = persisted as Partial<StarprintGameState>
        return { ...current, ...state, photoPreviewUrl: isLocalPortrait(state?.photoPreviewUrl) ? state.photoPreviewUrl : null }
      },
      partialize: (state) => ({
        sessionId: state.sessionId,
        nickname: state.nickname,
        photoPreviewUrl: state.photoPreviewUrl,
        currentStep: state.currentStep,
        completedGameIds: state.completedGameIds,
        selectedColor: state.selectedColor,
        assignedSolveQuestionIds: state.assignedSolveQuestionIds,
        assignedSenseScenarioIds: state.assignedSenseScenarioIds,
      }),
    },
  ),
)
