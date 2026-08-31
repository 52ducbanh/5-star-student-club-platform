import { GameType } from '../entities/game-result.entity';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/exceptions/domain-error.enum';
import { SOLVE_QUESTIONS } from '../questions/solve-questions.config';
import { SENSE_SCENARIOS } from '../scoring/scoring.config';

export function validateRawGameResult(gameId: GameType, rawResult: any): void {
  if (!rawResult || typeof rawResult !== 'object') {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'Game result payload must be a non-empty object');
  }

  switch (gameId) {
    case GameType.SOLVE:
      validateSolveResult(rawResult);
      break;
    case GameType.SENSE:
      validateSenseResult(rawResult);
      break;
    case GameType.SPRINT:
      validateSprintResult(rawResult);
      break;
    case GameType.SUPPORT:
      validateSupportResult(rawResult);
      break;
    case GameType.SYNC:
      validateSyncResult(rawResult);
      break;
    default:
      throw new DomainException(DomainErrorCode.INVALID_GAME, `Unsupported game type: ${gameId}`);
  }
}

function validateSolveResult(raw: any) {
  if (!Array.isArray(raw.answers)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SOLVE result must include an answers array');
  }

  if (raw.totalDurationMs !== undefined && (typeof raw.totalDurationMs !== 'number' || raw.totalDurationMs < 0)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SOLVE totalDurationMs must be a non-negative number');
  }

  const validQIds = new Set(SOLVE_QUESTIONS.map((q) => q.id));

  for (const ans of raw.answers) {
    if (!ans || typeof ans !== 'object') {
      throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SOLVE answer items must be objects');
    }
    if (!validQIds.has(ans.questionId)) {
      throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, `Invalid questionId in SOLVE result: ${ans.questionId}`);
    }
    if (ans.selectedOptionId !== null && typeof ans.selectedOptionId !== 'string') {
      throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'selectedOptionId must be a string or null');
    }
    if (ans.responseTimeMs !== undefined && (typeof ans.responseTimeMs !== 'number' || ans.responseTimeMs < 0)) {
      throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'responseTimeMs must be non-negative');
    }
  }
}

function validateSenseResult(raw: any) {
  if (!Array.isArray(raw.decisions)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SENSE result must include a decisions array');
  }

  const validScenarioMap = new Map(SENSE_SCENARIOS.map((s) => [s.id, new Set(s.options.map((o) => o.id))]));
  const seenScenarios = new Set<string>();

  for (const dec of raw.decisions) {
    if (!dec || typeof dec !== 'object') {
      throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SENSE decision items must be objects');
    }
    if (!validScenarioMap.has(dec.scenarioId)) {
      throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, `Invalid scenarioId in SENSE result: ${dec.scenarioId}`);
    }
    if (seenScenarios.has(dec.scenarioId)) {
      throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, `Duplicate scenarioId in SENSE result: ${dec.scenarioId}`);
    }
    seenScenarios.add(dec.scenarioId);

    const validOptionIds = validScenarioMap.get(dec.scenarioId)!;
    if (!validOptionIds.has(dec.optionId)) {
      throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, `Invalid optionId ${dec.optionId} for scenario ${dec.scenarioId}`);
    }
  }
}

function validateSprintResult(raw: any) {
  const { obstaclesAvoided, obstaclesEncountered, collectiblesCollected, collectiblesAvailable, durationMs } = raw;

  if (typeof obstaclesAvoided !== 'number' || obstaclesAvoided < 0) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SPRINT obstaclesAvoided must be >= 0');
  }
  if (typeof obstaclesEncountered !== 'number' || obstaclesEncountered < 0) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SPRINT obstaclesEncountered must be >= 0');
  }
  if (obstaclesAvoided > Math.max(obstaclesEncountered, 100)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'obstaclesAvoided cannot exceed obstaclesEncountered');
  }

  if (collectiblesCollected !== undefined && (typeof collectiblesCollected !== 'number' || collectiblesCollected < 0)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'collectiblesCollected must be >= 0');
  }
  if (collectiblesAvailable !== undefined && (typeof collectiblesAvailable !== 'number' || collectiblesAvailable < 0)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'collectiblesAvailable must be >= 0');
  }
  if (durationMs !== undefined && (typeof durationMs !== 'number' || durationMs < 0)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'durationMs must be >= 0');
  }
}

function validateSupportResult(raw: any) {
  if (typeof raw.completed !== 'boolean') {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SUPPORT completed must be a boolean');
  }
  if (raw.rotations !== undefined && (typeof raw.rotations !== 'number' || raw.rotations < 0)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SUPPORT rotations must be >= 0');
  }
  if (raw.elapsedMs !== undefined && (typeof raw.elapsedMs !== 'number' || raw.elapsedMs < 0)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SUPPORT elapsedMs must be >= 0');
  }
}

function validateSyncResult(raw: any) {
  const { pairsMatched, flips, mismatches, elapsedMs } = raw;

  if (typeof pairsMatched !== 'number' || pairsMatched < 0 || pairsMatched > 4) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SYNC pairsMatched must be between 0 and 4');
  }
  if (typeof flips !== 'number' || flips < 0) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SYNC flips must be >= 0');
  }
  if (mismatches !== undefined && (typeof mismatches !== 'number' || mismatches < 0)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SYNC mismatches must be >= 0');
  }
  if (elapsedMs !== undefined && (typeof elapsedMs !== 'number' || elapsedMs < 0)) {
    throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, 'SYNC elapsedMs must be >= 0');
  }
}
