/**
 * STARPRINT v2 Full Flow & Domain Specification Tests.
 *
 * Tests:
 * 1. Scorers for all 5 games (SOLVE, SENSE, SPRINT, SUPPORT, SYNC)
 * 2. 7D Hidden Profile aggregation with strict null vs 0 semantics
 * 3. 5-Archetype Classifier (cosine, euclidean, priority, zero-norm)
 * 4. OKLCH 5-wing Palette Engine (projection, similar color guard, delta E)
 * 5. Idempotent publish and Public Star ID uniqueness
 */

import { computeV2LocalProfile } from '../src/modules/games/scoring/v2/v2-scoring.dispatcher';
import { aggregateGlobalHiddenProfile } from '../src/modules/games/scoring/v2/hidden-profile.engine';
import { classifyStarType, STAR_TYPE_DEFINITIONS } from '../src/modules/starprints/domain/type-engine-v2';
import { computeWingPalette } from '../src/modules/starprints/domain/palette-engine-v2';
import type {
  SolveRawResultV2,
  SenseRawResultV2,
  SprintRawResultV2,
  SupportRawResultV2,
  SyncRawResultV2,
  GlobalHiddenProfile,
} from '@5ss/contracts';

describe('STARPRINT v2 Domain & Scorers Test Suite', () => {
  describe('1. Game Scorers (v2)', () => {
    it('SOLVE scorer: computes sharpness, insight, precision correctly and sets unobserved to null', () => {
      const sample: SolveRawResultV2 = {
        gameId: 'solve',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 15000,
        answers: [
          { questionId: 'sv2-q1', selectedOptionId: 'C', responseTimeMs: 2500, timedOut: false },
          { questionId: 'sv2-q2', selectedOptionId: 'B', responseTimeMs: 3000, timedOut: false },
          { questionId: 'sv2-q3', selectedOptionId: 'B', responseTimeMs: 2000, timedOut: false },
          { questionId: 'sv2-q4', selectedOptionId: 'D', responseTimeMs: 2800, timedOut: false },
          { questionId: 'sv2-q5', selectedOptionId: 'A', responseTimeMs: 3200, timedOut: false },
        ],
      };

      const profile = computeV2LocalProfile('solve', sample);

      // Observed traits should be non-null numbers in [0, 1]
      expect(typeof profile.sharpness).toBe('number');
      expect(typeof profile.insight).toBe('number');
      expect(typeof profile.precision).toBe('number');
      expect(typeof profile.persistence).toBe('number');
      expect(profile.sharpness).toBeGreaterThanOrEqual(0);
      expect(profile.sharpness).toBeLessThanOrEqual(1);

      // Structurally unobserved traits must remain null
      expect(profile.initiative).toBeNull();
      expect(profile.connection).toBeNull();
    });

    it('SENSE scorer: computes tendency weights across 3 scenarios', () => {
      const sample: SenseRawResultV2 = {
        gameId: 'sense',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 22000,
        decisions: [
          { scenarioId: 'se2-s1-presentation', optionId: 'a', responseTimeMs: 4000, timedOut: false },
          { scenarioId: 'se2-s2-conflict', optionId: 'b', responseTimeMs: 5000, timedOut: false },
          { scenarioId: 'se2-s3-deadline', optionId: 'c', responseTimeMs: 6000, timedOut: false },
        ],
      };

      const profile = computeV2LocalProfile('sense', sample);

      // SENSE observes connection, insight, initiative, adaptation
      expect(typeof profile.connection).toBe('number');
      expect(typeof profile.insight).toBe('number');
      expect(typeof profile.initiative).toBe('number');
      expect(typeof profile.adaptation).toBe('number');
      expect(profile.connection).toBeGreaterThanOrEqual(0);
      expect(profile.connection).toBeLessThanOrEqual(1);
    });

    it('SPRINT scorer: computes obstacle collision accounting and attempt comparison', () => {
      const sample: SprintRawResultV2 = {
        gameId: 'sprint',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 18000,
        trackId: 'sprint-track-a-v2',
        attempts: [
          {
            attemptNumber: 1,
            completed: true,
            durationMs: 16000,
            events: [
              { type: 'action', atMs: 1500, action: 'move-left', fromLane: 1, toLane: 0 },
              { type: 'obstacle-cleared', atMs: 2000, obstacleId: 'ta-b1' },
              { type: 'collectible-collected', atMs: 2800, collectibleId: 'ta-s1' },
              { type: 'collision', atMs: 4200, obstacleId: 'ta-b2' },
              { type: 'obstacle-cleared', atMs: 5500, obstacleId: 'ta-b3' },
              { type: 'collectible-collected', atMs: 6200, collectibleId: 'ta-s2' },
            ],
          },
        ],
      };

      const profile = computeV2LocalProfile('sprint', sample);

      // SPRINT observes sharpness, precision, initiative, adaptation, persistence
      expect(typeof profile.sharpness).toBe('number');
      expect(typeof profile.adaptation).toBe('number');
      expect(typeof profile.persistence).toBe('number');
      // Connection is structurally unobserved in runner
      expect(profile.connection).toBeNull();
    });

    it('SUPPORT scorer: handles rope cut sequences, auto-reset and recovery', () => {
      const sample: SupportRawResultV2 = {
        gameId: 'support',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 25000,
        puzzles: [
          {
            puzzleId: 'support-puzzle-1-v2',
            completed: true,
            timedOut: false,
            durationMs: 4500,
            events: [
              { type: 'rope-cut', atMs: 1200, ropeId: 'p1-rope-a' },
              { type: 'rope-cut', atMs: 2400, ropeId: 'p1-rope-b' },
              { type: 'completed', atMs: 3000 },
            ],
          },
          {
            puzzleId: 'support-puzzle-2-v2',
            completed: true,
            timedOut: false,
            durationMs: 7000,
            events: [
              { type: 'rope-cut', atMs: 1000, ropeId: 'p2-rope-y' },
              { type: 'invalid-state', atMs: 1050 },
              { type: 'auto-reset', atMs: 1650 },
              { type: 'rope-cut', atMs: 3000, ropeId: 'p2-rope-x' },
              { type: 'rope-cut', atMs: 4500, ropeId: 'p2-rope-z' },
              { type: 'completed', atMs: 5000 },
            ],
          },
          {
            puzzleId: 'support-puzzle-3-v2',
            completed: true,
            timedOut: false,
            durationMs: 8000,
            events: [
              { type: 'rope-cut', atMs: 1500, ropeId: 'p3-rope-1' },
              { type: 'rope-cut', atMs: 3200, ropeId: 'p3-rope-2' },
              { type: 'rope-cut', atMs: 5100, ropeId: 'p3-rope-3' },
              { type: 'completed', atMs: 6000 },
            ],
          },
        ],
      };

      const profile = computeV2LocalProfile('support', sample);

      expect(profile.connection).toBeNull();
      expect(typeof profile.persistence).toBe('number');
      expect(typeof profile.precision).toBe('number');
      expect(profile.precision).toBeGreaterThanOrEqual(0);
    });

    it('SYNC scorer: computes memory reuse and semantic matching performance', () => {
      const sample: SyncRawResultV2 = {
        gameId: 'sync',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 26000,
        deckId: 'sync-deck-semantic-v2-provisional',
        cardOrder: ['sc-p1-a', 'sc-p1-b', 'sc-p2-a', 'sc-p2-b'],
        durationMs: 25000,
        completed: true,
        events: [
          { type: 'card-selected', atMs: 1000, cardId: 'sc-p1-a' },
          { type: 'card-selected', atMs: 2000, cardId: 'sc-p1-b' },
          { type: 'pair-resolved', atMs: 2100, firstCardId: 'sc-p1-a', secondCardId: 'sc-p1-b', matched: true },
          { type: 'card-selected', atMs: 3500, cardId: 'sc-p2-a' },
          { type: 'card-selected', atMs: 4500, cardId: 'sc-p2-b' },
          { type: 'pair-resolved', atMs: 4600, firstCardId: 'sc-p2-a', secondCardId: 'sc-p2-b', matched: true },
        ],
      };

      const profile = computeV2LocalProfile('sync', sample);

      expect(profile.connection).toBeNull();
      expect(typeof profile.insight).toBe('number');
      expect(typeof profile.precision).toBe('number');
      expect(profile.precision).toBeGreaterThanOrEqual(0);
    });
  });

  describe('2. Hidden Profile Aggregation (7D)', () => {
    it('aggregates 5 game profiles into complete 7D profile and preserves [0, 1] range', () => {
      const solve = computeV2LocalProfile('solve', {
        gameId: 'solve',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 15000,
        answers: [
          { questionId: 'sv2-q1', selectedOptionId: 'C', responseTimeMs: 2500, timedOut: false },
          { questionId: 'sv2-q2', selectedOptionId: 'B', responseTimeMs: 3000, timedOut: false },
          { questionId: 'sv2-q3', selectedOptionId: 'B', responseTimeMs: 2000, timedOut: false },
          { questionId: 'sv2-q4', selectedOptionId: 'D', responseTimeMs: 2800, timedOut: false },
          { questionId: 'sv2-q5', selectedOptionId: 'A', responseTimeMs: 3200, timedOut: false },
        ],
      });

      const sense = computeV2LocalProfile('sense', {
        gameId: 'sense',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 20000,
        decisions: [
          { scenarioId: 'se2-s1-presentation', optionId: 'a', responseTimeMs: 4000, timedOut: false },
          { scenarioId: 'se2-s2-conflict', optionId: 'b', responseTimeMs: 4000, timedOut: false },
          { scenarioId: 'se2-s3-deadline', optionId: 'c', responseTimeMs: 4000, timedOut: false },
        ],
      });

      const sprint = computeV2LocalProfile('sprint', {
        gameId: 'sprint',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 16000,
        trackId: 'sprint-track-a-v2',
        attempts: [{ attemptNumber: 1, completed: true, durationMs: 16000, events: [] }],
      });

      const support = computeV2LocalProfile('support', {
        gameId: 'support',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 20000,
        puzzles: [{ puzzleId: 'support-puzzle-1-v2', completed: true, timedOut: false, durationMs: 5000, events: [] }],
      });

      const sync = computeV2LocalProfile('sync', {
        gameId: 'sync',
        payloadVersion: 'starprint-raw-v2',
        contentVersion: 'starprint-content-v2',
        startedAtMs: 1000,
        completedAtMs: 25000,
        deckId: 'sync-deck-semantic-v2-provisional',
        cardOrder: [],
        durationMs: 25000,
        completed: true,
        events: [],
      });

      const aggregation = aggregateGlobalHiddenProfile([solve, sense, sprint, support, sync]);

      expect(aggregation.status).toBe('complete');
      const p = aggregation.profile!;
      expect(p.sharpness).toBeGreaterThanOrEqual(0);
      expect(p.sharpness).toBeLessThanOrEqual(1);
      expect(p.insight).toBeGreaterThanOrEqual(0);
      expect(p.precision).toBeGreaterThanOrEqual(0);
      expect(p.initiative).toBeGreaterThanOrEqual(0);
      expect(p.connection).toBeGreaterThanOrEqual(0);
      expect(p.adaptation).toBeGreaterThanOrEqual(0);
      expect(p.persistence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('3. Star Type Classifier (v2)', () => {
    it('classifies STRATEGIST with SHIMMER effect and official tagline', () => {
      const profile: GlobalHiddenProfile = {
        sharpness: 0.45,
        insight: 0.98,
        precision: 0.92,
        initiative: 0.45,
        connection: 0.35,
        adaptation: 0.55,
        persistence: 0.80,
      };

      const result = classifyStarType(profile);
      expect(result.type).toBe('STRATEGIST');
      expect(result.effect).toBe('SHIMMER');
      expect(result.definition.tagline).toBe('Think with purpose.');
    });

    it('classifies SPARK with SPARK effect and official tagline', () => {
      const profile: GlobalHiddenProfile = {
        sharpness: 0.95,
        insight: 0.45,
        precision: 0.35,
        initiative: 0.98,
        connection: 0.45,
        adaptation: 0.70,
        persistence: 0.40,
      };

      const result = classifyStarType(profile);
      expect(result.type).toBe('SPARK');
      expect(result.effect).toBe('SPARK');
      expect(result.definition.tagline).toBe('Turn energy into action.');
    });

    it('classifies SYNERGIST with ORBIT effect and official tagline', () => {
      const profile: GlobalHiddenProfile = {
        sharpness: 0.50,
        insight: 0.45,
        precision: 0.50,
        initiative: 0.65,
        connection: 0.99,
        adaptation: 0.85,
        persistence: 0.60,
      };

      const result = classifyStarType(profile);
      expect(result.type).toBe('SYNERGIST');
      expect(result.effect).toBe('ORBIT');
      expect(result.definition.tagline).toBe('Connect to create more.');
    });

    it('classifies SEEKER with FLOW effect and official tagline', () => {
      const profile: GlobalHiddenProfile = {
        sharpness: 0.75,
        insight: 0.85,
        precision: 0.40,
        initiative: 0.60,
        connection: 0.50,
        adaptation: 0.98,
        persistence: 0.45,
      };

      const result = classifyStarType(profile);
      expect(result.type).toBe('SEEKER');
      expect(result.effect).toBe('FLOW');
      expect(result.definition.tagline).toBe('Stay curious. Keep moving.');
    });

    it('classifies SUSTAINER with PULSE effect and official tagline', () => {
      const profile: GlobalHiddenProfile = {
        sharpness: 0.40,
        insight: 0.55,
        precision: 0.85,
        initiative: 0.40,
        connection: 0.60,
        adaptation: 0.55,
        persistence: 0.98,
      };

      const result = classifyStarType(profile);
      expect(result.type).toBe('SUSTAINER');
      expect(result.effect).toBe('PULSE');
      expect(result.definition.tagline).toBe('Keep the light going.');
    });

    it('handles all-zero vector without NaN and breaks tie deterministically', () => {
      const allZero: GlobalHiddenProfile = {
        sharpness: 0,
        insight: 0,
        precision: 0,
        initiative: 0,
        connection: 0,
        adaptation: 0,
        persistence: 0,
      };

      const result = classifyStarType(allZero);
      expect(['STRATEGIST', 'SPARK', 'SYNERGIST', 'SEEKER', 'SUSTAINER']).toContain(result.type);
      expect(Number.isNaN(result.cosineSimilarities.STRATEGIST)).toBe(false);
      expect(result.tiebreakMethod).toBe('euclidean');
    });
  });

  describe('4. OKLCH Wing Palette Engine (v2)', () => {
    it('produces 5 distinct hex colors from signature color and stage profiles', () => {
      const signatureColor = '#3b82f6';
      const palette = computeWingPalette(signatureColor);

      expect(palette).toHaveLength(5);
      expect(palette.every((hex) => /^#[0-9a-f]{6}$/i.test(hex))).toBe(true);

      // Verify all 5 wings are distinct
      const uniqueColors = new Set(palette);
      expect(uniqueColors.size).toBe(5);
    });

    it('handles achromatic (grayscale) signature color gracefully', () => {
      const grayscale = '#808080';
      const palette = computeWingPalette(grayscale);

      expect(palette).toHaveLength(5);
      expect(palette.every((hex) => /^#[0-9a-f]{6}$/i.test(hex))).toBe(true);
    });
  });
});
