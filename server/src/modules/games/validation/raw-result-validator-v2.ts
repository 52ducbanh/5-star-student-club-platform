/**
 * Server-side v2 raw result validators.
 *
 * Validates official v2 payloads (payloadVersion: 'starprint-raw-v2').
 * Rejects NaN, Infinity, negative times, unknown IDs, duplicate IDs,
 * wrong item counts, impossible chronology, and client-invented assignments.
 *
 * Exact item counts:
 *   SOLVE   = 5 responses (one per question, 5 required)
 *   SENSE   = 3 responses (one per scenario)
 *   SPRINT  = 1 or 2 attempts (max 2)
 *   SUPPORT = 3 puzzles (all must be present)
 *   SYNC    = 1 deck run (20-card deck)
 */

import {
  SOLVE_QUESTION_MAP_V2,
} from '../questions/solve-questions-v2.config';
import {
  SENSE_SCENARIO_MAP_V2,
} from '../questions/sense-scenarios-v2.config';

import {
  SPRINT_TRACK_MAP_V2,
  getTrackObstacleIds,
  getTrackCollectibleIds,
} from '../questions/sprint-tracks-v2.config';
import {
  SUPPORT_PUZZLES_V2,
  SUPPORT_PUZZLE_MAP_V2,
} from '../questions/support-puzzles-v2.config';
import {
  SYNC_CARD_MAP_V2,
  SYNC_CARDS_V2,
  SYNC_DECK_ID_V2,
} from '../questions/sync-deck-v2.config';
import { STARPRINT_VERSIONS } from '@5ss/contracts';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/exceptions/domain-error.enum';
import type {
  SolveRawResultV2,
  SenseRawResultV2,
  SprintRawResultV2,
  SupportRawResultV2,
  SyncRawResultV2,
} from '@5ss/contracts';

const V2_PAYLOAD_VERSION = STARPRINT_VERSIONS.officialV2.rawPayload;
const SOLVE_REQUIRED_COUNT = 5;
const SENSE_REQUIRED_COUNT = 3;
const SPRINT_MAX_ATTEMPTS = 2;
const SUPPORT_REQUIRED_COUNT = 3;

function reject(message: string): never {
  throw new DomainException(DomainErrorCode.INVALID_GAME_RESULT, message);
}

function assertFiniteNonNegative(value: unknown, field: string): void {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    reject(`${field} must be a finite non-negative number, got: ${value}`);
  }
}

export function validateSolveRawResultV2(raw: SolveRawResultV2): void {
  if (raw.payloadVersion !== V2_PAYLOAD_VERSION) {
    reject(`SOLVE v2: unexpected payloadVersion ${raw.payloadVersion}`);
  }
  if (!Array.isArray(raw.answers)) {
    reject('SOLVE v2: answers must be an array');
  }
  if (raw.answers.length !== SOLVE_REQUIRED_COUNT) {
    reject(
      `SOLVE v2: expected exactly ${SOLVE_REQUIRED_COUNT} answers, got ${raw.answers.length}`,
    );
  }

  const seenIds = new Set<string>();
  for (const answer of raw.answers) {
    if (!SOLVE_QUESTION_MAP_V2.has(answer.questionId)) {
      reject(`SOLVE v2: unknown questionId: ${answer.questionId}`);
    }
    if (seenIds.has(answer.questionId)) {
      reject(`SOLVE v2: duplicate questionId: ${answer.questionId}`);
    }
    seenIds.add(answer.questionId);

    const question = SOLVE_QUESTION_MAP_V2.get(answer.questionId)!;
    if (
      answer.selectedOptionId !== null &&
      !question.options.some((o) => o.id === answer.selectedOptionId)
    ) {
      reject(
        `SOLVE v2: invalid selectedOptionId '${answer.selectedOptionId}' for question ${answer.questionId}`,
      );
    }
    assertFiniteNonNegative(answer.responseTimeMs, 'responseTimeMs');
    if (typeof answer.timedOut !== 'boolean') {
      reject('SOLVE v2: timedOut must be a boolean');
    }
    // If timedOut, selectedOptionId must be null
    if (answer.timedOut && answer.selectedOptionId !== null) {
      reject('SOLVE v2: timedOut answer must have selectedOptionId = null');
    }
  }

  if (seenIds.size !== SOLVE_REQUIRED_COUNT) {
    reject(`SOLVE v2: expected exactly ${SOLVE_REQUIRED_COUNT} distinct questions`);
  }
}

export function validateSenseRawResultV2(raw: SenseRawResultV2): void {
  if (raw.payloadVersion !== V2_PAYLOAD_VERSION) {
    reject(`SENSE v2: unexpected payloadVersion ${raw.payloadVersion}`);
  }
  if (!Array.isArray(raw.decisions)) {
    reject('SENSE v2: decisions must be an array');
  }
  if (raw.decisions.length !== SENSE_REQUIRED_COUNT) {
    reject(
      `SENSE v2: expected exactly ${SENSE_REQUIRED_COUNT} decisions, got ${raw.decisions.length}`,
    );
  }

  const seenIds = new Set<string>();
  for (const decision of raw.decisions) {
    if (!SENSE_SCENARIO_MAP_V2.has(decision.scenarioId)) {
      reject(`SENSE v2: unknown scenarioId: ${decision.scenarioId}`);
    }
    if (seenIds.has(decision.scenarioId)) {
      reject(`SENSE v2: duplicate scenarioId: ${decision.scenarioId}`);
    }
    seenIds.add(decision.scenarioId);

    const scenario = SENSE_SCENARIO_MAP_V2.get(decision.scenarioId)!;
    if (
      !decision.timedOut &&
      decision.optionId !== null &&
      !scenario.options.some((o) => o.id === decision.optionId)
    ) {
      reject(
        `SENSE v2: invalid optionId '${decision.optionId}' for scenario ${decision.scenarioId}`,
      );
    }
    if (typeof decision.timedOut !== 'boolean') {
      reject('SENSE v2: timedOut must be a boolean');
    }
    assertFiniteNonNegative(decision.responseTimeMs, 'responseTimeMs');
  }

  if (seenIds.size !== SENSE_REQUIRED_COUNT) {
    reject(`SENSE v2: expected exactly ${SENSE_REQUIRED_COUNT} distinct scenarios`);
  }
}


export function validateSprintRawResultV2(raw: SprintRawResultV2): void {
  if (raw.payloadVersion !== V2_PAYLOAD_VERSION) {
    reject(`SPRINT v2: unexpected payloadVersion ${raw.payloadVersion}`);
  }
  if (!SPRINT_TRACK_MAP_V2.has(raw.trackId)) {
    reject(`SPRINT v2: unknown trackId: ${raw.trackId}`);
  }
  if (!Array.isArray(raw.attempts) || raw.attempts.length === 0) {
    reject('SPRINT v2: attempts must be a non-empty array');
  }
  if (raw.attempts.length > SPRINT_MAX_ATTEMPTS) {
    reject(`SPRINT v2: maximum ${SPRINT_MAX_ATTEMPTS} attempts allowed, got ${raw.attempts.length}`);
  }

  const validObstacleIds = getTrackObstacleIds(raw.trackId);
  const validCollectibleIds = getTrackCollectibleIds(raw.trackId);

  for (const attempt of raw.attempts) {
    if (attempt.attemptNumber !== 1 && attempt.attemptNumber !== 2) {
      reject(`SPRINT v2: attemptNumber must be 1 or 2, got ${attempt.attemptNumber}`);
    }
    assertFiniteNonNegative(attempt.durationMs, 'attempt.durationMs');
    if (attempt.durationMs > 30001) {
      // Allow 1ms tolerance
      reject(`SPRINT v2: attempt durationMs exceeds 30s hard cap: ${attempt.durationMs}`);
    }
    if (typeof attempt.completed !== 'boolean') {
      reject('SPRINT v2: attempt.completed must be a boolean');
    }
    if (!Array.isArray(attempt.events)) {
      reject('SPRINT v2: attempt.events must be an array');
    }

    let prevAtMs = -1;
    const seenObstacleCollisions = new Set<string>();
    const seenObstacleClears = new Set<string>();

    for (const event of attempt.events) {
      assertFiniteNonNegative(event.atMs, 'event.atMs');
      if (event.atMs < prevAtMs) {
        reject(`SPRINT v2: event timestamps must be non-decreasing (got ${event.atMs} after ${prevAtMs})`);
      }
      prevAtMs = event.atMs;

      if (event.type === 'collision') {
        if (!validObstacleIds.has(event.obstacleId)) {
          reject(`SPRINT v2: unknown obstacleId in collision: ${event.obstacleId}`);
        }
        if (seenObstacleCollisions.has(event.obstacleId)) {
          reject(`SPRINT v2: duplicate collision event for obstacleId: ${event.obstacleId}`);
        }
        if (seenObstacleClears.has(event.obstacleId)) {
          reject(`SPRINT v2: obstacleId ${event.obstacleId} cannot be both cleared and collided`);
        }
        seenObstacleCollisions.add(event.obstacleId);
      } else if (event.type === 'obstacle-cleared') {
        if (!validObstacleIds.has(event.obstacleId)) {
          reject(`SPRINT v2: unknown obstacleId in obstacle-cleared: ${event.obstacleId}`);
        }
        if (seenObstacleCollisions.has(event.obstacleId)) {
          reject(`SPRINT v2: collided obstacleId cannot also be cleared: ${event.obstacleId}`);
        }
        if (seenObstacleClears.has(event.obstacleId)) {
          reject(`SPRINT v2: duplicate obstacle-cleared event: ${event.obstacleId}`);
        }
        seenObstacleClears.add(event.obstacleId);
      } else if (event.type === 'collectible-collected') {
        if (!validCollectibleIds.has(event.collectibleId)) {
          reject(`SPRINT v2: unknown collectibleId: ${event.collectibleId}`);
        }
      }
    }
  }

  // Validate attempt numbers are sequential
  for (let i = 0; i < raw.attempts.length; i++) {
    if (raw.attempts[i].attemptNumber !== i + 1) {
      reject(`SPRINT v2: attempt at index ${i} should have attemptNumber ${i + 1}`);
    }
  }
}

export function validateSupportRawResultV2(raw: SupportRawResultV2): void {
  if (raw.payloadVersion !== V2_PAYLOAD_VERSION) {
    reject(`SUPPORT v2: unexpected payloadVersion ${raw.payloadVersion}`);
  }
  if (!Array.isArray(raw.puzzles)) {
    reject('SUPPORT v2: puzzles must be an array');
  }
  if (raw.puzzles.length !== SUPPORT_REQUIRED_COUNT) {
    reject(
      `SUPPORT v2: expected exactly ${SUPPORT_REQUIRED_COUNT} puzzles, got ${raw.puzzles.length}`,
    );
  }

  const seenPuzzleIds = new Set<string>();
  for (const puzzle of raw.puzzles) {
    if (!SUPPORT_PUZZLE_MAP_V2.has(puzzle.puzzleId)) {
      reject(`SUPPORT v2: unknown puzzleId: ${puzzle.puzzleId}`);
    }
    if (seenPuzzleIds.has(puzzle.puzzleId)) {
      reject(`SUPPORT v2: duplicate puzzleId: ${puzzle.puzzleId}`);
    }
    seenPuzzleIds.add(puzzle.puzzleId);

    assertFiniteNonNegative(puzzle.durationMs, 'puzzle.durationMs');
    if (typeof puzzle.completed !== 'boolean') {
      reject('SUPPORT v2: puzzle.completed must be a boolean');
    }
    if (typeof puzzle.timedOut !== 'boolean') {
      reject('SUPPORT v2: puzzle.timedOut must be a boolean');
    }
    if (!Array.isArray(puzzle.events)) {
      reject('SUPPORT v2: puzzle.events must be an array');
    }

    const puzzleDef = SUPPORT_PUZZLE_MAP_V2.get(puzzle.puzzleId)!;
    const validRopeIds = new Set(puzzleDef.ropes.map((r) => r.ropeId));

    let prevAtMs = -1;
    for (const event of puzzle.events) {
      assertFiniteNonNegative(event.atMs, 'puzzle.event.atMs');
      if (event.atMs < prevAtMs) {
        reject(`SUPPORT v2: event timestamps must be non-decreasing`);
      }
      prevAtMs = event.atMs;

      if (event.type === 'rope-cut') {
        if (!validRopeIds.has(event.ropeId)) {
          reject(`SUPPORT v2: unknown ropeId in cut: ${event.ropeId}`);
        }
      }
    }
  }

  // Ensure all required puzzles are covered
  const requiredIds = new Set(SUPPORT_PUZZLES_V2.map((p) => p.puzzleId));
  for (const id of requiredIds) {
    if (!seenPuzzleIds.has(id)) {
      reject(`SUPPORT v2: missing required puzzleId: ${id}`);
    }
  }
}

export function validateSyncRawResultV2(raw: SyncRawResultV2): void {
  if (raw.payloadVersion !== V2_PAYLOAD_VERSION) {
    reject(`SYNC v2: unexpected payloadVersion ${raw.payloadVersion}`);
  }
  if (raw.deckId !== SYNC_DECK_ID_V2) {
    reject(`SYNC v2: unknown deckId: ${raw.deckId} (expected ${SYNC_DECK_ID_V2})`);
  }
  if (!Array.isArray(raw.cardOrder)) {
    reject('SYNC v2: cardOrder must be an array');
  }
  if (raw.cardOrder.length !== SYNC_CARDS_V2.length) {
    reject(
      `SYNC v2: cardOrder must contain exactly ${SYNC_CARDS_V2.length} cards, got ${raw.cardOrder.length}`,
    );
  }

  // Validate all card IDs in cardOrder are unique and known
  const seenCardIds = new Set<string>();
  for (const cardId of raw.cardOrder) {
    if (!SYNC_CARD_MAP_V2.has(cardId)) {
      reject(`SYNC v2: unknown cardId in cardOrder: ${cardId}`);
    }
    if (seenCardIds.has(cardId)) {
      reject(`SYNC v2: duplicate cardId in cardOrder: ${cardId}`);
    }
    seenCardIds.add(cardId);
  }

  assertFiniteNonNegative(raw.durationMs, 'durationMs');
  if (raw.durationMs > 30001) {
    reject(`SYNC v2: durationMs exceeds 30s hard cap: ${raw.durationMs}`);
  }
  if (typeof raw.completed !== 'boolean') {
    reject('SYNC v2: completed must be a boolean');
  }
  if (!Array.isArray(raw.events)) {
    reject('SYNC v2: events must be an array');
  }

  let prevAtMs = -1;
  for (const event of raw.events) {
    assertFiniteNonNegative(event.atMs, 'sync.event.atMs');
    if (event.atMs < prevAtMs) {
      reject(`SYNC v2: event timestamps must be non-decreasing`);
    }
    prevAtMs = event.atMs;

    if (event.type === 'card-selected') {
      if (!SYNC_CARD_MAP_V2.has(event.cardId)) {
        reject(`SYNC v2: unknown cardId in card-selected: ${event.cardId}`);
      }
    } else if (event.type === 'pair-resolved') {
      if (!SYNC_CARD_MAP_V2.has(event.firstCardId)) {
        reject(`SYNC v2: unknown firstCardId: ${event.firstCardId}`);
      }
      if (!SYNC_CARD_MAP_V2.has(event.secondCardId)) {
        reject(`SYNC v2: unknown secondCardId: ${event.secondCardId}`);
      }
      if (event.firstCardId === event.secondCardId) {
        reject(`SYNC v2: firstCardId and secondCardId cannot be the same`);
      }
    }
  }
}
