import {
  SPRINT_CONFIG,
  calculateEntityTopPercent,
  isEntityInVisibleWindow,
  calculateEntityPerspective,
  calculateJumpElevation,
  evaluateEventInteraction,
  type EvaluatedTrackEvent,
} from '../../client/src/features/starprint/games/sprint/sprint-engine';
import { SPRINT_TRACKS_V2 } from '../src/modules/games/questions/sprint-tracks-v2.config';

describe('SPRINT Mini-Game Engine & Interaction Tests', () => {
  describe('Visual Coordinates, Visibility Window & Forward-Motion Perspective', () => {
    it('calculates continuous topPercent without clamping to 0', () => {
      const atMs = 3000;
      // Far-future event (atMs - 5000 = -2000ms): topPercent is negative (-80%), NOT clamped to 0
      expect(calculateEntityTopPercent(atMs, -2000)).toBeCloseTo(-100);

      // At visible spawn entrance (atMs - 2800 = 200ms): topPercent = -12%
      expect(calculateEntityTopPercent(atMs, 200)).toBeCloseTo(-12);

      // Enters stage boundary (atMs - 2500 = 500ms): topPercent = 0%
      expect(calculateEntityTopPercent(atMs, 500)).toBeCloseTo(0);

      // Halfway through approach (atMs - 1250 = 1750ms): topPercent = 50%
      expect(calculateEntityTopPercent(atMs, 1750)).toBeCloseTo(50);

      // At player line (atMs - 550 = 2450ms): topPercent = 78%
      expect(calculateEntityTopPercent(atMs, 2450)).toBeCloseTo(78);

      // Exiting bottom (atMs = 3000ms): topPercent = 100%
      expect(calculateEntityTopPercent(atMs, 3000)).toBeCloseTo(100);

      // Past bottom (atMs + 250 = 3250ms): topPercent = 110%
      expect(calculateEntityTopPercent(atMs, 3250)).toBeCloseTo(110);
    });

    it('isEntityInVisibleWindow admits only entities in active approach window', () => {
      // Far future events must NOT be rendered (prevents top-border clutter)
      expect(isEntityInVisibleWindow(-15)).toBe(false);
      expect(isEntityInVisibleWindow(-100)).toBe(false);

      // Entering above stage (-12% to 0%)
      expect(isEntityInVisibleWindow(-12)).toBe(true);
      expect(isEntityInVisibleWindow(-5)).toBe(true);
      expect(isEntityInVisibleWindow(0)).toBe(true);

      // On visible track (0% to 100%)
      expect(isEntityInVisibleWindow(50)).toBe(true);
      expect(isEntityInVisibleWindow(78)).toBe(true);
      expect(isEntityInVisibleWindow(100)).toBe(true);

      // Unmount threshold past bottom edge (> 106%)
      expect(isEntityInVisibleWindow(105)).toBe(true);
      expect(isEntityInVisibleWindow(107)).toBe(false);
    });

    it('calculateEntityPerspective smoothly scales from distance to player baseline', () => {
      // Spawn at distance (top -12%): scale 0.72, opacity 0.35
      const spawnP = calculateEntityPerspective(-12);
      expect(spawnP.scale).toBeCloseTo(0.72);
      expect(spawnP.opacity).toBeCloseTo(0.35);

      // Mid-track (top 33%): scale ~0.86, opacity ~0.67
      const midP = calculateEntityPerspective(33);
      expect(midP.scale).toBeGreaterThan(0.72);
      expect(midP.scale).toBeLessThan(1.0);
      expect(midP.opacity).toBeGreaterThan(0.35);

      // Player baseline (top 78%): scale 1.0, opacity 1.0
      const playerP = calculateEntityPerspective(78);
      expect(playerP.scale).toBeCloseTo(1.0);
      expect(playerP.opacity).toBeCloseTo(1.0);
    });
  });

  describe('Jump Elevation Profile & Timing', () => {
    it('returns 0 when grounded or jumpStartTime is null', () => {
      expect(calculateJumpElevation(null, 1000)).toBe(0);
      expect(calculateJumpElevation(1000, 900)).toBe(0); // before jump
      expect(calculateJumpElevation(1000, 1600)).toBe(0); // after jump completed (> 550ms)
    });

    it('calculates parabolic elevation curve with apex at midpoint', () => {
      const jumpStart = 1000;
      // Apex at midpoint (1000 + 275ms = 1275ms) -> elevation 1.0
      expect(calculateJumpElevation(jumpStart, 1275)).toBeCloseTo(1.0);

      // Quarter-way (1000 + 137.5ms = 1137.5ms) -> 4 * 0.25 * 0.75 = 0.75
      expect(calculateJumpElevation(jumpStart, 1137.5)).toBeCloseTo(0.75);

      // Sufficient clearance in the mid-flight zone (e.g. 100ms in)
      const earlyAirborne = calculateJumpElevation(jumpStart, 1100);
      expect(earlyAirborne).toBeGreaterThan(SPRINT_CONFIG.JUMP_CLEARANCE_THRESHOLD);

      // Landed state (550ms after jump)
      expect(calculateJumpElevation(jumpStart, 1550)).toBeCloseTo(0);
    });

    it('identifies late/early jumps as insufficient clearance', () => {
      const jumpStart = 1000;
      // Very early in jump (first 20ms): not high enough yet
      const tooEarly = calculateJumpElevation(jumpStart, 1020);
      expect(tooEarly).toBeLessThan(SPRINT_CONFIG.JUMP_CLEARANCE_THRESHOLD);

      // Very late in jump (530ms into 550ms jump): already landing on ground
      const tooLate = calculateJumpElevation(jumpStart, 1530);
      expect(tooLate).toBeLessThan(SPRINT_CONFIG.JUMP_CLEARANCE_THRESHOLD);
    });
  });

  describe('Interaction Evaluation & Deduplication', () => {
    const starEvent: EvaluatedTrackEvent = {
      id: 'test-star-1',
      type: 'collectible-star',
      atMs: 2000,
      lane: 1,
    };

    const barrierEvent: EvaluatedTrackEvent = {
      id: 'test-barrier-1',
      type: 'obstacle-barrier',
      atMs: 2000,
      lane: 1,
    };

    const blockerEvent: EvaluatedTrackEvent = {
      id: 'test-blocker-1',
      type: 'obstacle-blocker',
      atMs: 2000,
      lane: 1,
    };

    it('collects star when player is in matching lane at collision plane', () => {
      // At player line (topPercent ≈ 78%, elapsed = 1450ms)
      const res = evaluateEventInteraction(starEvent, 1450, 1, 0);
      expect(res.resolved).toBe(true);
      expect(res.resolution).toBe('COLLECTED');
      expect(res.emittedEvent).toEqual({
        type: 'collectible-collected',
        atMs: 1450,
        collectibleId: 'test-star-1',
      });
    });

    it('marks star as missed when player is in different lane and star passes collision plane', () => {
      // Passed collision zone (topPercent > 88%, elapsed = 1800ms)
      const res = evaluateEventInteraction(starEvent, 1800, 0, 0);
      expect(res.resolved).toBe(true);
      expect(res.resolution).toBe('MISSED');
      expect(res.emittedEvent).toBeUndefined();
    });

    it('clears low barrier when player is in same lane and jumping with sufficient height', () => {
      const jumpElevation = 0.8; // Airborne
      const res = evaluateEventInteraction(barrierEvent, 1450, 1, jumpElevation);
      expect(res.resolved).toBe(true);
      expect(res.resolution).toBe('JUMP_CLEARED');
      expect(res.emittedEvent).toEqual({
        type: 'obstacle-cleared',
        atMs: 1450,
        obstacleId: 'test-barrier-1',
      });
    });

    it('collides with low barrier when player is in same lane but grounded', () => {
      const jumpElevation = 0; // Grounded
      const res = evaluateEventInteraction(barrierEvent, 1450, 1, jumpElevation);
      expect(res.resolved).toBe(true);
      expect(res.resolution).toBe('COLLIDED');
      expect(res.emittedEvent).toEqual({
        type: 'collision',
        atMs: 1450,
        obstacleId: 'test-barrier-1',
      });
    });

    it('collides with low barrier when jump is late/early (insufficient elevation)', () => {
      const jumpElevation = 0.2; // Below clearance threshold 0.35
      const res = evaluateEventInteraction(barrierEvent, 1450, 1, jumpElevation);
      expect(res.resolved).toBe(true);
      expect(res.resolution).toBe('COLLIDED');
    });

    it('dodges low barrier when player is in a different lane', () => {
      const res = evaluateEventInteraction(barrierEvent, 1450, 0, 0);
      expect(res.resolved).toBe(true);
      expect(res.resolution).toBe('DODGED');
      expect(res.emittedEvent).toEqual({
        type: 'obstacle-cleared',
        atMs: 1450,
        obstacleId: 'test-barrier-1',
      });
    });

    it('collides with lane blocker when player is in same lane regardless of jump state', () => {
      // Even if jumping high, blocker is tall and cannot be cleared by jumping
      const resJumping = evaluateEventInteraction(blockerEvent, 1450, 1, 1.0);
      expect(resJumping.resolved).toBe(true);
      expect(resJumping.resolution).toBe('COLLIDED');
      expect(resJumping.emittedEvent).toEqual({
        type: 'collision',
        atMs: 1450,
        obstacleId: 'test-blocker-1',
      });

      const resGrounded = evaluateEventInteraction(blockerEvent, 1450, 1, 0);
      expect(resGrounded.resolved).toBe(true);
      expect(resGrounded.resolution).toBe('COLLIDED');
    });

    it('dodges lane blocker when player is in a different lane', () => {
      const res = evaluateEventInteraction(blockerEvent, 1450, 2, 0);
      expect(res.resolved).toBe(true);
      expect(res.resolution).toBe('DODGED');
      expect(res.emittedEvent).toEqual({
        type: 'obstacle-cleared',
        atMs: 1450,
        obstacleId: 'test-blocker-1',
      });
    });
  });

  describe('Extended Track Pacing, Duration & Fairness Invariants', () => {
    it.each(SPRINT_TRACKS_V2)('validates duration, bounds, and spacing for %s', (track) => {
      // 1. Target duration range: ~26s, hard cap: 30s
      expect(track.expectedDurationMs).toBeGreaterThanOrEqual(26000);
      expect(track.expectedDurationMs).toBeLessThanOrEqual(27000);
      expect(track.hardCapMs).toBe(30000);

      // 2. Substantial gameplay content: at least 18 events
      expect(track.events.length).toBeGreaterThanOrEqual(18);

      // 3. Unique IDs and strictly increasing timestamps
      const seenIds = new Set<string>();
      let prevAtMs = -1;

      for (const event of track.events) {
        expect(seenIds.has(event.id)).toBe(false);
        seenIds.add(event.id);

        expect(event.atMs).toBeGreaterThan(prevAtMs);
        prevAtMs = event.atMs;
      }

      // 4. Last challenge completes before expectedDurationMs with >= 1000ms finish breathing room
      const lastEvent = track.events[track.events.length - 1];
      const finishBufferMs = track.expectedDurationMs - lastEvent.atMs;
      expect(finishBufferMs).toBeGreaterThanOrEqual(1000);

      // 5. Fairness: Min spacing between any adjacent events is at least 700ms (mostly >= 1000ms)
      for (let i = 1; i < track.events.length; i++) {
        const gap = track.events[i].atMs - track.events[i - 1].atMs;
        expect(gap).toBeGreaterThanOrEqual(700);
      }
    });
  });
});
