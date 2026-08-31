export const gameIds = ["solve", "sense", "sync", "support", "sprint"] as const;

export type GameId = (typeof gameIds)[number];

export interface SubmitGameRequest {
  rawResult: unknown;
}

export interface SubmitGameResponse {
  success: boolean;
  completedGameIds: GameId[];
}
