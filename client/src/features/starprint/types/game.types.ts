import type { GameId } from '@5ss/contracts'

export type StarprintGameId = GameId

export type StarprintStep =
  | 'INTRO'
  | 'PLAYER_INFO'
  | 'CAMERA'
  | 'SOLVE'
  | 'SENSE'
  | 'SPRINT'
  | 'SUPPORT'
  | 'SYNC'
  | 'COLOR_PICKER'
  | 'GENERATING'
  | 'FINAL_REVEAL'
  | 'RESULT'

export interface MiniGameResult<T = unknown> {
  gameId: StarprintGameId
  rawResult: T
}

export interface SolveRawResult {
  gameId: 'solve'
  answers: Array<{
    questionId: string
    selectedOptionId: string | null
    responseTimeMs: number
  }>
  totalDurationMs: number
}

export interface SenseRawResult {
  gameId: 'sense'
  decisions: Array<{
    scenarioId: string
    optionId: string
    responseTimeMs: number
  }>
  totalDurationMs: number
}

export interface SprintRawResult {
  gameId: 'sprint'
  durationMs: number
  obstaclesEncountered: number
  obstaclesAvoided: number
  collisions: number
  collectiblesAvailable: number
  collectiblesCollected: number
  jumpCount: number
}

export interface SupportRawResult {
  gameId: 'support'
  completed: boolean
  rotations: number
  elapsedMs: number
}

export interface SyncRawResult {
  gameId: 'sync'
  pairsTotal: number
  pairsMatched: number
  mismatches: number
  flips: number
  elapsedMs: number
  completed: boolean
}
