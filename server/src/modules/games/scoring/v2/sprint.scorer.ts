/**
 * STARPRINT v2 SPRINT scorer.
 *
 * Observed traits: Sharpness, Initiative, Adaptation, Persistence, Precision
 * Connection = null (structurally unobserved)
 * Insight = null (structurally unobserved — wait, spec says only Connection is null)
 *
 * From the spec: "Connection is structurally unobserved."
 * All other 6 traits are observed. Insight gets small signal from reaction quality.
 *
 * Scoring signals from per-attempt evidence:
 *   - Stars collected / available → Sharpness, Precision
 *   - Lane changes (non-collision-forced) → Initiative
 *   - Collisions / obstacles encountered → Adaptation (how well they adapt after collision)
 *   - Completion / reaching finish → Persistence
 *   - Obstacles avoided / encountered → Precision, Sharpness
 *   - Attempt improvement (attempt 2 better than 1) → Persistence, Adaptation
 *   - Unnecessary actions → small negative weight for Precision
 *
 * Best attempt semantics:
 *   - If 2 attempts, use the better performing one for primary signals
 *   - Attempt improvement itself contributes to Persistence/Adaptation
 *
 * Key accounting rules:
 *   - Collision counted once per obstacle (client ensures this, server trusts event log)
 *   - Collided obstacle cannot later count as "avoided"
 *   - obstaclesEncountered = total distinct obstacle events
 *   - obstaclesAvoided = cleared without collision
 */

import type { SprintAttemptV2, SprintRawResultV2 } from '@5ss/contracts';
import type { LocalTraitContributionInput } from '../v2/hidden-profile.engine';
import {
  getTrackObstacleIds,
  getTrackCollectibleIds,
} from '../../questions/sprint-tracks-v2.config';

const HARD_CAP_MS = 30000;

interface AttemptMetrics {
  obstaclesEncountered: number;
  obstaclesAvoided: number;
  collisionCount: number;
  starsAvailable: number;
  starsCollected: number;
  laneChanges: number;
  jumps: number;
  completed: boolean;
  durationMs: number;
  avoidRatio: number;
  collectRatio: number;
}

function extractAttemptMetrics(
  attempt: SprintAttemptV2,
  trackId: string,
): AttemptMetrics {
  const trackObstacleIds = getTrackObstacleIds(trackId);
  const trackCollectibleIds = getTrackCollectibleIds(trackId);

  const collidedObstacleIds = new Set<string>();
  const clearedObstacleIds = new Set<string>();
  const collectedIds = new Set<string>();
  let laneChanges = 0;
  let jumps = 0;

  for (const event of attempt.events) {
    if (event.type === 'action') {
      if (event.action === 'move-left' || event.action === 'move-right') {
        laneChanges++;
      } else if (event.action === 'jump') {
        jumps++;
      }
    } else if (event.type === 'collision') {
      if (trackObstacleIds.has(event.obstacleId)) {
        collidedObstacleIds.add(event.obstacleId);
        // Remove from cleared if it was already there (shouldn't happen in valid events)
        clearedObstacleIds.delete(event.obstacleId);
      }
    } else if (event.type === 'obstacle-cleared') {
      // Only count as cleared if not already collided
      if (
        trackObstacleIds.has(event.obstacleId) &&
        !collidedObstacleIds.has(event.obstacleId)
      ) {
        clearedObstacleIds.add(event.obstacleId);
      }
    } else if (event.type === 'collectible-collected') {
      if (trackCollectibleIds.has(event.collectibleId)) {
        collectedIds.add(event.collectibleId);
      }
    }
  }

  const obstaclesEncountered = collidedObstacleIds.size + clearedObstacleIds.size;
  const obstaclesAvoided = clearedObstacleIds.size;
  const collisionCount = collidedObstacleIds.size;
  const starsAvailable = trackCollectibleIds.size;
  const starsCollected = collectedIds.size;
  const avoidRatio = obstaclesEncountered > 0
    ? obstaclesAvoided / obstaclesEncountered
    : 1.0;
  const collectRatio = starsAvailable > 0 ? starsCollected / starsAvailable : 0;

  return {
    obstaclesEncountered,
    obstaclesAvoided,
    collisionCount,
    starsAvailable,
    starsCollected,
    laneChanges,
    jumps,
    completed: attempt.completed,
    durationMs: Math.min(attempt.durationMs, HARD_CAP_MS),
    avoidRatio,
    collectRatio,
  };
}

function bestAttempt(
  metrics: AttemptMetrics[],
): AttemptMetrics {
  if (metrics.length === 1) return metrics[0];
  // Best = higher avoidRatio, tiebreak by collectRatio, tiebreak by completion
  return metrics.reduce((best, curr) => {
    if (curr.avoidRatio > best.avoidRatio) return curr;
    if (curr.avoidRatio === best.avoidRatio && curr.collectRatio > best.collectRatio) return curr;
    if (
      curr.avoidRatio === best.avoidRatio &&
      curr.collectRatio === best.collectRatio &&
      curr.completed &&
      !best.completed
    )
      return curr;
    return best;
  });
}

export function scoreSprintV2(rawResult: SprintRawResultV2): LocalTraitContributionInput {
  const { trackId, attempts } = rawResult;

  const allMetrics = attempts.map((a) => extractAttemptMetrics(a, trackId));
  const best = bestAttempt(allMetrics);

  // Track total available opportunities across all attempts
  const obstaclesEncountered = Math.max(best.obstaclesEncountered, 1); // avoid /0

  // --- Sharpness: quick reactions (avoid + collect) ---
  const sharpnessMax = 1.0;
  const sharpnessRaw =
    best.avoidRatio * 0.6 + best.collectRatio * 0.4;

  // --- Precision: accurate lane transitions (avoid ratio + low unnecessary) ---
  const precisionMax = 1.0;
  const unnecessaryActionPenalty = Math.min(
    best.laneChanges / Math.max(obstaclesEncountered * 2, 1),
    1.0,
  );
  const precisionRaw = best.avoidRatio * 0.7 + (1 - unnecessaryActionPenalty * 0.3) * 0.3;

  // --- Initiative: proactive lane changes and jumps ---
  const initiativeMax = 0.8;
  // Initiative: having a decent number of proactive actions (not just reacting)
  const actionRate = Math.min(
    (best.laneChanges + best.jumps) / Math.max(obstaclesEncountered, 1),
    2.0,
  ) / 2.0; // normalize to [0,1]
  const initiativeRaw = actionRate * 0.8;

  // --- Adaptation: recovery after collision → still performing well ---
  const adaptationMax = 1.0;
  let adaptationRaw = 0;
  if (allMetrics.length >= 2) {
    // Attempt improvement
    const m1 = allMetrics[0];
    const m2 = allMetrics[1];
    const improved = m2.avoidRatio > m1.avoidRatio || m2.collectRatio > m1.collectRatio;
    adaptationRaw = (best.avoidRatio * 0.5) + (improved ? 0.5 : 0.2);
  } else {
    // Single attempt: adaptation from maintaining performance through collisions
    adaptationRaw =
      best.collisionCount > 0
        ? (best.avoidRatio * 0.6 + (1 - best.collisionCount / obstaclesEncountered) * 0.4)
        : best.avoidRatio * 0.7;
  }

  // --- Persistence: completion + staying in the run ---
  const persistenceMax = 1.0;
  const completionBonus = best.completed ? 0.5 : 0.2;
  const stayedInBonus = (best.durationMs / HARD_CAP_MS) * 0.5;
  const persistenceRaw = completionBonus + stayedInBonus;

  // --- Insight: pattern recognition (small signal from jump timing) ---
  // SPRINT primarily observes Sharpness/Initiative/Adaptation/Persistence/Precision
  // Insight gets a small signal based on jump precision relative to barriers
  const insightMax = 0.3;
  const insightRaw = (best.avoidRatio * 0.3);

  return {
    sharpness: { rawContribution: sharpnessRaw, maximumAvailableContribution: sharpnessMax },
    insight: { rawContribution: insightRaw, maximumAvailableContribution: insightMax },
    precision: { rawContribution: Math.min(precisionRaw, precisionMax), maximumAvailableContribution: precisionMax },
    initiative: { rawContribution: Math.min(initiativeRaw, initiativeMax), maximumAvailableContribution: initiativeMax },
    connection: null,
    adaptation: { rawContribution: Math.min(adaptationRaw, adaptationMax), maximumAvailableContribution: adaptationMax },
    persistence: { rawContribution: Math.min(persistenceRaw, persistenceMax), maximumAvailableContribution: persistenceMax },
  };
}
