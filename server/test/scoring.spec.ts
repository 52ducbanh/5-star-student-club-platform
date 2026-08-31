import { ScoringService } from '../src/modules/games/scoring/scoring.service';
import { GameType, GameResult } from '../src/modules/games/entities/game-result.entity';
import { TypeEngine } from '../src/modules/starprints/domain/type-engine';
import { PaletteEngine } from '../src/modules/starprints/domain/palette-engine';

describe('STARPRINT Domain Engines', () => {
  let scoringService: ScoringService;
  let typeEngine: TypeEngine;
  let paletteEngine: PaletteEngine;

  beforeEach(() => {
    scoringService = new ScoringService();
    typeEngine = new TypeEngine();
    paletteEngine = new PaletteEngine();
  });

  describe('ScoringService', () => {
    it('should score SOLVE deterministically based on correctness & duration', () => {
      const rawResult = {
        answers: [
          { questionId: 'q1', selectedOptionId: 'b' },
          { questionId: 'q2', selectedOptionId: 'c' },
        ],
        totalDurationMs: 12500,
      };

      const result = scoringService.calculateGameScore(GameType.SOLVE, rawResult);
      expect(result.correctCount).toBe(2);
      expect(Math.round(result.score)).toBe(50);
      expect(result.focus).toBeCloseTo(32.5);
      expect(result.explore).toBeCloseTo(17.5);
    });

    it('should score SENSE deterministically based on scenario decision vectors', () => {
      const rawResult = {
        decisions: [
          { scenarioId: 's1', optionId: 'a' }, // focus:0.8, explore:0.3, energy:0.5, social:0.7, adapt:0.5
          { scenarioId: 's2', optionId: 'b' }, // focus:0.7, explore:0.5, energy:0.3, social:0.9, adapt:0.6
          { scenarioId: 's3', optionId: 'c' }, // focus:0.5, explore:0.5, energy:0.4, social:0.9, adapt:0.7
        ],
      };

      const result = scoringService.calculateGameScore(GameType.SENSE, rawResult);
      expect(result.focus).toBeCloseTo((2.0 / 3) * 100);
      expect(result.social).toBeCloseTo((2.5 / 3) * 100);
    });

    it('should score SPRINT deterministically based on obstacles avoided and collectibles collected', () => {
      const rawResult = {
        durationMs: 20000,
        obstaclesEncountered: 10,
        obstaclesAvoided: 8,
        collisions: 2,
        collectiblesAvailable: 10,
        collectiblesCollected: 9,
        jumpCount: 15,
      };

      const result = scoringService.calculateGameScore(GameType.SPRINT, rawResult);
      // avoidRatio: 0.8, collectRatio: 0.9 -> base = 0.8*0.6 + 0.9*0.4 = 0.48 + 0.36 = 0.84 -> score: 84
      expect(Math.round(result.score)).toBe(84);
      expect(result.energy).toBeCloseTo(50.4);
      expect(result.adapt).toBeCloseTo(33.6);
    });

    it('should score SUPPORT deterministically based on completion and rotation efficiency', () => {
      const rawResult = {
        completed: true,
        rotations: 6,
        elapsedMs: 10000,
      };

      const result = scoringService.calculateGameScore(GameType.SUPPORT, rawResult);
      expect(result.score).toBeGreaterThan(50);
      expect(result.social).toBeGreaterThan(0);
      expect(result.focus).toBeGreaterThan(0);
    });

    it('should score SYNC deterministically based on matching pairs and flips efficiency', () => {
      const rawResult = {
        pairsTotal: 4,
        pairsMatched: 4,
        mismatches: 1,
        flips: 9,
        elapsedMs: 12000,
        completed: true,
      };

      const result = scoringService.calculateGameScore(GameType.SYNC, rawResult);
      expect(result.score).toBeGreaterThan(80);
      expect(result.social).toBeCloseTo(result.adapt);
    });

    it('should aggregate profiles from 5 games into a bounded 0-100 vector', () => {
      const results: GameResult[] = [
        { id: '1', sessionId: 's1', gameId: GameType.SOLVE, rawResult: { answers: [{ questionId: 'q1', selectedOptionId: 'b' }, { questionId: 'q2', selectedOptionId: 'c' }, { questionId: 'q3', selectedOptionId: 'c' }, { questionId: 'q4', selectedOptionId: 'c' }], totalDurationMs: 8000 }, createdAt: new Date(), session: null as any },
        { id: '2', sessionId: 's1', gameId: GameType.SENSE, rawResult: { decisions: [{ scenarioId: 's1', optionId: 'a' }, { scenarioId: 's2', optionId: 'b' }, { scenarioId: 's3', optionId: 'a' }] }, createdAt: new Date(), session: null as any },
        { id: '3', sessionId: 's1', gameId: GameType.SPRINT, rawResult: { durationMs: 20000, obstaclesEncountered: 10, obstaclesAvoided: 9, collisions: 1, collectiblesAvailable: 10, collectiblesCollected: 8, jumpCount: 12 }, createdAt: new Date(), session: null as any },
        { id: '4', sessionId: 's1', gameId: GameType.SUPPORT, rawResult: { completed: true, rotations: 5, elapsedMs: 9000 }, createdAt: new Date(), session: null as any },
        { id: '5', sessionId: 's1', gameId: GameType.SYNC, rawResult: { pairsTotal: 4, pairsMatched: 4, mismatches: 0, flips: 8, elapsedMs: 8000, completed: true }, createdAt: new Date(), session: null as any },
      ];

      const profile = scoringService.aggregateProfiles(results);
      expect(profile.focus).toBeGreaterThanOrEqual(0);
      expect(profile.focus).toBeLessThanOrEqual(100);
      expect(profile.explore).toBeGreaterThanOrEqual(0);
      expect(profile.explore).toBeLessThanOrEqual(100);
      expect(profile.energy).toBeGreaterThanOrEqual(0);
      expect(profile.energy).toBeLessThanOrEqual(100);
      expect(profile.social).toBeGreaterThanOrEqual(0);
      expect(profile.social).toBeLessThanOrEqual(100);
      expect(profile.adapt).toBeGreaterThanOrEqual(0);
      expect(profile.adapt).toBeLessThanOrEqual(100);
    });
  });

  describe('TypeEngine', () => {
    it('should assign NAVIGATOR when focus is highest', () => {
      const type = typeEngine.determineType({ focus: 95, explore: 60, energy: 50, social: 70, adapt: 65 });
      expect(type.id).toBe('navigator');
      expect(type.effect).toBe('flow');
    });

    it('should assign EXPLORER when explore is highest', () => {
      const type = typeEngine.determineType({ focus: 60, explore: 95, energy: 50, social: 70, adapt: 65 });
      expect(type.id).toBe('explorer');
      expect(type.effect).toBe('shimmer');
    });

    it('should assign CATALYST when energy is highest', () => {
      const type = typeEngine.determineType({ focus: 60, explore: 50, energy: 95, social: 70, adapt: 65 });
      expect(type.id).toBe('catalyst');
      expect(type.effect).toBe('spark');
    });

    it('should assign CONNECTOR when social is highest', () => {
      const type = typeEngine.determineType({ focus: 60, explore: 50, energy: 70, social: 95, adapt: 65 });
      expect(type.id).toBe('connector');
      expect(type.effect).toBe('orbit');
    });

    it('should assign VISIONARY when adapt is highest', () => {
      const type = typeEngine.determineType({ focus: 60, explore: 50, energy: 70, social: 65, adapt: 95 });
      expect(type.id).toBe('visionary');
      expect(type.effect).toBe('pulse');
    });

    it('should resolve ties deterministically (focus > explore > energy > social > adapt)', () => {
      const type = typeEngine.determineType({ focus: 80, explore: 80, energy: 80, social: 80, adapt: 80 });
      expect(type.id).toBe('navigator');
    });
  });

  describe('PaletteEngine', () => {
    it('should generate 5 hex color palette deterministically', () => {
      const palette1 = paletteEngine.generatePalette('#3b82f6');
      const palette2 = paletteEngine.generatePalette('#3b82f6');
      expect(palette1).toHaveLength(5);
      expect(palette1).toEqual(palette2);
      palette1.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });
});
