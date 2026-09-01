/**
 * STARPRINT v2 scoring dispatcher.
 *
 * Dispatches raw v2 game results to their per-game scorers and returns
 * the LocalTraitProfile for storage and later aggregation.
 *
 * This service is stateless and pure — no NestJS injectable needed at the dispatcher level.
 * The GamesService calls scoreV2() after v2 validation passes.
 */

import type {
  GameId,
  GameRawResultMap,
  LocalTraitProfile,
  SolveRawResultV2,
  SenseRawResultV2,
  SprintRawResultV2,
  SupportRawResultV2,
  SyncRawResultV2,
} from '@5ss/contracts';
import { normalizeLocalTraitProfile } from '../v2/hidden-profile.engine';
import { scoreSolveV2 } from './solve.scorer';
import { scoreSenseV2 } from './sense.scorer';
import { scoreSprintV2 } from './sprint.scorer';
import { scoreSupportV2 } from './support.scorer';
import { scoreSyncV2 } from './sync.scorer';

/**
 * Compute the normalized 7D LocalTraitProfile from a validated v2 raw result.
 * The returned profile is ready to store in game_results.localTraitProfile (JSONB).
 */
export function computeV2LocalProfile(
  gameId: GameId,
  rawResult: GameRawResultMap[GameId],
): LocalTraitProfile {
  let input;

  switch (gameId) {
    case 'solve':
      input = scoreSolveV2(rawResult as SolveRawResultV2);
      break;
    case 'sense':
      input = scoreSenseV2(rawResult as SenseRawResultV2);
      break;
    case 'sprint':
      input = scoreSprintV2(rawResult as SprintRawResultV2);
      break;
    case 'support':
      input = scoreSupportV2(rawResult as SupportRawResultV2);
      break;
    case 'sync':
      input = scoreSyncV2(rawResult as SyncRawResultV2);
      break;
    default: {
      const exhaustive: never = gameId;
      throw new Error(`Unknown v2 gameId: ${exhaustive}`);
    }
  }

  return normalizeLocalTraitProfile(input);
}
