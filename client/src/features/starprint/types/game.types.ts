import type {
  GameId,
  LegacyGameRawResultMap,
  LegacySenseRawResult,
  LegacySolveRawResult,
  LegacySprintRawResult,
  LegacySupportRawResult,
  LegacySyncRawResult,
} from '@5ss/contracts'

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

export interface MiniGameResult<TGameId extends GameId = GameId> {
  gameId: TGameId
  rawResult: LegacyGameRawResultMap[TGameId]
}

export type SolveRawResult = LegacySolveRawResult
export type SenseRawResult = LegacySenseRawResult
export type SprintRawResult = LegacySprintRawResult
export type SupportRawResult = LegacySupportRawResult
export type SyncRawResult = LegacySyncRawResult
