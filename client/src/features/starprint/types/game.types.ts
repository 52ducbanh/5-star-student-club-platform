import type {
  GameId,
  GameRawResultMap,
  LegacyGameRawResultMap,
  LegacySenseRawResult,
  LegacySolveRawResult,
  LegacySprintRawResult,
  LegacySupportRawResult,
  LegacySyncRawResult,
  SenseRawResultV2,
  SolveRawResultV2,
  SprintRawResultV2,
  SupportRawResultV2,
  SyncRawResultV2,
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
  rawResult: GameRawResultMap[TGameId] | LegacyGameRawResultMap[TGameId]
}

export type SolveRawResult = SolveRawResultV2 | LegacySolveRawResult
export type SenseRawResult = SenseRawResultV2 | LegacySenseRawResult
export type SprintRawResult = SprintRawResultV2 | LegacySprintRawResult
export type SupportRawResult = SupportRawResultV2 | LegacySupportRawResult
export type SyncRawResult = SyncRawResultV2 | LegacySyncRawResult
