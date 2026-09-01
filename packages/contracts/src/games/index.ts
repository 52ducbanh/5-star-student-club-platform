import type { STARPRINT_VERSIONS } from "../versions";

/** Canonical runtime order for the five STARPRINT stages. */
export const gameIds = ["solve", "sense", "sprint", "support", "sync"] as const;

export type GameId = (typeof gameIds)[number];

// ---------------------------------------------------------------------------
// Legacy v1 payloads
// ---------------------------------------------------------------------------

/**
 * Payloads emitted by the currently active provisional games.
 *
 * They intentionally remain separate from `GameRawResultMap`, which describes
 * the official v2 evidence format. Legacy payloads must continue through the
 * legacy validator/scorer until each game receives its own migration.
 */
export interface LegacySolveRawResult {
  gameId: "solve";
  answers: Array<{
    questionId: string;
    selectedOptionId: string | null;
    responseTimeMs: number;
  }>;
  totalDurationMs: number;
}

export interface LegacySenseRawResult {
  gameId: "sense";
  decisions: Array<{
    scenarioId: string;
    optionId: string;
    responseTimeMs: number;
  }>;
  totalDurationMs: number;
}

export interface LegacySprintRawResult {
  gameId: "sprint";
  durationMs: number;
  obstaclesEncountered: number;
  obstaclesAvoided: number;
  collisions: number;
  collectiblesAvailable: number;
  collectiblesCollected: number;
  jumpCount: number;
}

export interface LegacySupportRawResult {
  gameId: "support";
  completed: boolean;
  rotations: number;
  elapsedMs: number;
}

export interface LegacySyncRawResult {
  gameId: "sync";
  pairsTotal?: number;
  pairsMatched: number;
  mismatches: number;
  flips: number;
  elapsedMs: number;
  completed: boolean;
}

export interface LegacyGameRawResultMap {
  solve: LegacySolveRawResult;
  sense: LegacySenseRawResult;
  sprint: LegacySprintRawResult;
  support: LegacySupportRawResult;
  sync: LegacySyncRawResult;
}

export type LegacyGameRawResult = LegacyGameRawResultMap[GameId];

// ---------------------------------------------------------------------------
// Official v2 raw behavioral evidence contracts
// ---------------------------------------------------------------------------

export interface GameRawResultV2Base<TGameId extends GameId> {
  gameId: TGameId;
  payloadVersion: (typeof STARPRINT_VERSIONS)["officialV2"]["rawPayload"];
  contentVersion: (typeof STARPRINT_VERSIONS)["officialV2"]["content"];
  startedAtMs: number;
  completedAtMs: number;
}

export interface SolveAnswerV2 {
  questionId: string;
  selectedOptionId: string | null;
  responseTimeMs: number;
  timedOut: boolean;
}

export interface SolveRawResultV2 extends GameRawResultV2Base<"solve"> {
  answers: SolveAnswerV2[];
}

export interface SenseDecisionV2 {
  scenarioId: string;
  optionId: string | null;
  responseTimeMs: number;
  timedOut: boolean;
}

export interface SenseRawResultV2 extends GameRawResultV2Base<"sense"> {
  decisions: SenseDecisionV2[];
}

export type SprintLane = 0 | 1 | 2;
export type SprintAction = "move-left" | "move-right" | "jump";

export type SprintEventV2 =
  | {
      type: "action";
      atMs: number;
      action: SprintAction;
      fromLane: SprintLane;
      toLane: SprintLane;
    }
  | {
      type: "collision";
      atMs: number;
      obstacleId: string;
    }
  | {
      type: "obstacle-cleared";
      atMs: number;
      obstacleId: string;
    }
  | {
      type: "collectible-collected";
      atMs: number;
      collectibleId: string;
    };

export interface SprintAttemptV2 {
  attemptNumber: 1 | 2;
  durationMs: number;
  completed: boolean;
  events: SprintEventV2[];
}

export interface SprintRawResultV2 extends GameRawResultV2Base<"sprint"> {
  trackId: string;
  attempts: SprintAttemptV2[];
}

export type SupportEventV2 =
  | { type: "rope-cut"; atMs: number; ropeId: string }
  | { type: "invalid-state"; atMs: number }
  | { type: "auto-reset"; atMs: number }
  | { type: "completed"; atMs: number };

export interface SupportPuzzleResultV2 {
  puzzleId: string;
  durationMs: number;
  completed: boolean;
  timedOut: boolean;
  events: SupportEventV2[];
}

export interface SupportRawResultV2 extends GameRawResultV2Base<"support"> {
  puzzles: SupportPuzzleResultV2[];
}

export type SyncEventV2 =
  | { type: "card-selected"; atMs: number; cardId: string }
  | {
      type: "pair-resolved";
      atMs: number;
      firstCardId: string;
      secondCardId: string;
      matched: boolean;
    };

export interface SyncRawResultV2 extends GameRawResultV2Base<"sync"> {
  deckId: string;
  cardOrder: string[];
  durationMs: number;
  completed: boolean;
  events: SyncEventV2[];
}

/** Official v2 map. Server-side validators will adopt each entry per game. */
export interface GameRawResultMap {
  solve: SolveRawResultV2;
  sense: SenseRawResultV2;
  sprint: SprintRawResultV2;
  support: SupportRawResultV2;
  sync: SyncRawResultV2;
}

export type GameRawResult = GameRawResultMap[GameId];

/** Current endpoint request. It stays explicitly legacy until route migration. */
export interface SubmitGameRequest<
  TRawResult extends LegacyGameRawResult = LegacyGameRawResult,
> {
  rawResult: TRawResult;
}

/** Future v2 request; derived profile/type/palette values are intentionally absent. */
export interface SubmitGameV2Request<TGameId extends GameId = GameId> {
  rawResult: GameRawResultMap[TGameId];
}

export interface SubmitGameResponse {
  success: boolean;
  completedGameIds: GameId[];
}
