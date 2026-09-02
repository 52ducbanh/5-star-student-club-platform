/**
 * Pure TypeScript engine and calculation helpers for STARPRINT v2 SPRINT mini-game.
 *
 * Implements deterministic visual coordinates, jump elevation profiling,
 * collision/clearance/deduplication evaluation, and obstacle state management.
 */

import type { SprintLane } from './sprint-tracks';
import type { SprintEventV2 } from '@5ss/contracts';

export type SprintTrackEventType = 'obstacle-blocker' | 'obstacle-barrier' | 'collectible-star';

export const SPRINT_CONFIG = {
  SPAWN_AHEAD_MS: 2500,
  PLAYER_Y_PERCENT: 78,
  JUMP_DURATION_MS: 550,
  JUMP_CLEARANCE_THRESHOLD: 0.35, // Min jump height needed to clear a low barrier
  STUMBLE_DURATION_MS: 380, // Recoil / shake / speed dip duration
  RECOVERY_DURATION_MS: 500, // Safe anti-chain-hit recovery window
  COLLISION_ZONE_TOP_MIN: 68, // Entity top% min for collision zone
  COLLISION_ZONE_TOP_MAX: 88, // Entity top% max for collision zone
} as const;

export type EntityResolution =
  | 'APPROACHING'
  | 'COLLECTED'
  | 'JUMP_CLEARED'
  | 'DODGED'
  | 'COLLIDED'
  | 'MISSED'
  | 'PASSED';

export interface EvaluatedTrackEvent {
  id: string;
  type: SprintTrackEventType;
  atMs: number;
  lane: SprintLane;
}

/**
 * Calculates the continuous top% visual position for an entity given current elapsed time.
 * At (atMs - 2800ms), topPercent = -12% (offscreen spawn above track).
 * At (atMs - SPAWN_AHEAD_MS [2500ms]), topPercent = 0% (enters visible stage).
 * At (atMs - 550ms), topPercent = 78% (player collision line).
 * At atMs, topPercent = 100% (passes player to bottom).
 */
export function calculateEntityTopPercent(atMs: number, elapsedMs: number): number {
  const timeToPlayer = atMs - elapsedMs;
  return 100 - (timeToPlayer / SPRINT_CONFIG.SPAWN_AHEAD_MS) * 100;
}

/**
 * Checks if an entity is currently within the active visible approach window.
 * Entities enter naturally from just beyond the top edge (-12%) and remain visible
 * until passing beyond the bottom edge (106%).
 * Far-future entities (< -12%) are NOT rendered, preventing top-stacking.
 */
export function isEntityInVisibleWindow(topPercent: number): boolean {
  return topPercent >= -12 && topPercent <= 106;
}

/**
 * Calculates subtle forward-motion perspective scaling and opacity.
 * Far-distance objects (top -12%) start smaller (scale 0.72) and slightly dimmer (opacity 0.35).
 * As they approach the player plane (top 78%), they smoothly scale to 1.0 and full opacity.
 */
export function calculateEntityPerspective(topPercent: number): { scale: number; opacity: number } {
  // Normalized progress from spawn (-12%) to player baseline (78%)
  const progress = Math.min(1, Math.max(0, (topPercent + 12) / 90));
  const scale = 0.72 + progress * 0.28;
  const opacity = Math.min(1, 0.35 + progress * 0.65);
  return { scale, opacity };
}

/**
 * Calculates normalized jump elevation [0, 1] using a smooth parabolic arc.
 * Returns 0 if grounded (not jumping or jump completed).
 */
export function calculateJumpElevation(jumpStartTimeMs: number | null, currentElapsedMs: number): number {
  if (jumpStartTimeMs === null) return 0;
  const t = currentElapsedMs - jumpStartTimeMs;
  if (t < 0 || t > SPRINT_CONFIG.JUMP_DURATION_MS) return 0;

  // Normalized time u in [0, 1]
  const u = t / SPRINT_CONFIG.JUMP_DURATION_MS;
  // Parabolic formula: 4 * u * (1 - u), apex at u = 0.5 where h = 1.0
  return Math.max(0, Math.min(1, 4 * u * (1 - u)));
}

/**
 * Evaluates whether an approaching event interacts with the player at the current frame.
 */
export function evaluateEventInteraction(
  event: EvaluatedTrackEvent,
  elapsedMs: number,
  playerLane: SprintLane,
  jumpElevation: number,
): {
  resolved: boolean;
  resolution: EntityResolution;
  emittedEvent?: SprintEventV2;
} {
  const topPercent = calculateEntityTopPercent(event.atMs, elapsedMs);

  // Still approaching before collision zone
  if (topPercent < SPRINT_CONFIG.COLLISION_ZONE_TOP_MIN) {
    return { resolved: false, resolution: 'APPROACHING' };
  }

  // Inside or passing through the collision zone [68%, 88%]
  const inSameLane = playerLane === event.lane;

  if (event.type === 'collectible-star') {
    if (inSameLane) {
      return {
        resolved: true,
        resolution: 'COLLECTED',
        emittedEvent: {
          type: 'collectible-collected',
          atMs: elapsedMs,
          collectibleId: event.id,
        },
      };
    }
    // Star in another lane passed the collision zone
    if (topPercent >= SPRINT_CONFIG.COLLISION_ZONE_TOP_MAX) {
      return { resolved: true, resolution: 'MISSED' };
    }
    return { resolved: false, resolution: 'APPROACHING' };
  }

  if (event.type === 'obstacle-barrier') {
    if (inSameLane) {
      if (jumpElevation >= SPRINT_CONFIG.JUMP_CLEARANCE_THRESHOLD) {
        // Successfully cleared the barrier with sufficient jump height!
        return {
          resolved: true,
          resolution: 'JUMP_CLEARED',
          emittedEvent: {
            type: 'obstacle-cleared',
            atMs: elapsedMs,
            obstacleId: event.id,
          },
        };
      }
      // Collided with low barrier because player didn't jump or jump was poorly timed
      return {
        resolved: true,
        resolution: 'COLLIDED',
        emittedEvent: {
          type: 'collision',
          atMs: elapsedMs,
          obstacleId: event.id,
        },
      };
    }
    // Barrier in another lane -> safely cleared by lane choice
    return {
      resolved: true,
      resolution: 'DODGED',
      emittedEvent: {
        type: 'obstacle-cleared',
        atMs: elapsedMs,
        obstacleId: event.id,
      },
    };
  }

  if (event.type === 'obstacle-blocker') {
    if (inSameLane) {
      // Blocker cannot be jumped over
      return {
        resolved: true,
        resolution: 'COLLIDED',
        emittedEvent: {
          type: 'collision',
          atMs: elapsedMs,
          obstacleId: event.id,
        },
      };
    }
    // Blocker in another lane -> dodged
    return {
      resolved: true,
      resolution: 'DODGED',
      emittedEvent: {
        type: 'obstacle-cleared',
        atMs: elapsedMs,
        obstacleId: event.id,
      },
    };
  }

  return { resolved: false, resolution: 'APPROACHING' };
}
