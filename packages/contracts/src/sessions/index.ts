import type { GameId } from "../games";

export type SessionStatus =
  | "IN_PROGRESS"
  | "READY_TO_GENERATE"
  | "GENERATED"
  | "PUBLISHED";

export interface CreateSessionRequest {
  nickname: string;
}

export interface SessionResponse {
  id: string;
  nickname: string;
  photoUrl: string | null;
  status: SessionStatus;
  completedGameIds: GameId[];
  starprintId: string | null;
  assignedSolveQuestionIds?: string[];
  assignedSenseScenarioIds?: string[];
  assignedSprintTrackId?: string;
}
