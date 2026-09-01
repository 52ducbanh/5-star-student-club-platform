import {
  STARPRINT_VERSIONS,
  STARPRINT_UNVERSIONED_PAYLOAD_FAMILY,
  gameIds,
  isWingPalette,
  starEffects,
  starTypeIds,
  traitIds,
} from '@5ss/contracts';
import type {
  GameRawResultMap,
  LocalTraitProfile,
  TraitId,
  WingPalette,
} from '@5ss/contracts';
import {
  HiddenProfileEvidenceError,
  aggregateGlobalHiddenProfile,
  normalizeLocalTraitProfile,
  normalizeTraitContribution,
} from '../src/modules/games/scoring/v2/hidden-profile.engine';
import type {
  LocalTraitContributionInput,
  TraitContributionEvidence,
} from '../src/modules/games/scoring/v2/hidden-profile.engine';
import { GameType } from '../src/modules/games/entities/game-result.entity';
import { SOLVE_QUESTIONS } from '../src/modules/games/questions/solve-questions.config';
import { SENSE_SCENARIOS } from '../src/modules/games/scoring/scoring.config';
import { validateRawGameResult } from '../src/modules/games/validation/raw-result-validator';

function contributionInput(
  overrides: Partial<Record<TraitId, TraitContributionEvidence | null>> = {},
): LocalTraitContributionInput {
  return {
    sharpness: null,
    insight: null,
    precision: null,
    initiative: null,
    connection: null,
    adaptation: null,
    persistence: null,
    ...overrides,
  };
}

function localProfile(
  overrides: Partial<Record<TraitId, number | null>> = {},
): LocalTraitProfile {
  return {
    sharpness: null,
    insight: null,
    precision: null,
    initiative: null,
    connection: null,
    adaptation: null,
    persistence: null,
    ...overrides,
  };
}

function fullyObservedProfile(value: number): LocalTraitProfile {
  return {
    sharpness: value,
    insight: value,
    precision: value,
    initiative: value,
    connection: value,
    adaptation: value,
    persistence: value,
  };
}

describe('STARPRINT v2 Hidden Profile foundation', () => {
  describe('local profile normalization', () => {
    it('normalizes an observed contribution using the opportunities presented', () => {
      const profile = normalizeLocalTraitProfile(
        contributionInput({
          insight: { rawContribution: 4.55, maximumAvailableContribution: 6.5 },
        }),
      );

      expect(profile.insight).toBeCloseTo(0.7);
      expect(profile.connection).toBeNull();
    });

    it('uses the supplied opportunity maximum instead of a fixed global maximum', () => {
      expect(
        normalizeTraitContribution('sharpness', {
          rawContribution: 2,
          maximumAvailableContribution: 4,
        }),
      ).toBe(0.5);
      expect(
        normalizeTraitContribution('sharpness', {
          rawContribution: 2,
          maximumAvailableContribution: 8,
        }),
      ).toBe(0.25);
    });

    it('clamps negative contributions to the lower bound', () => {
      expect(
        normalizeTraitContribution('precision', {
          rawContribution: -4,
          maximumAvailableContribution: 10,
        }),
      ).toBe(0);
    });

    it('clamps contributions above the available maximum to the upper bound', () => {
      expect(
        normalizeTraitContribution('initiative', {
          rawContribution: 12,
          maximumAvailableContribution: 10,
        }),
      ).toBe(1);
    });

    it('rejects a missing observability declaration instead of inferring null', () => {
      const normalizeIncompleteProfile = () => {
        // @ts-expect-error Every trait requires an explicit structural declaration.
        normalizeLocalTraitProfile({});
      };

      expect(normalizeIncompleteProfile).toThrow(HiddenProfileEvidenceError);
      expect(normalizeIncompleteProfile).toThrow('must be declared');
    });

    it('keeps SPRINT Connection null when it is explicitly structurally unobservable', () => {
      expect(
        normalizeLocalTraitProfile(contributionInput({ connection: null })).connection,
      ).toBeNull();
    });

    it('keeps SOLVE Insight at zero after presented timeout/incorrect opportunities', () => {
      expect(
        normalizeLocalTraitProfile(
          contributionInput({
            insight: { rawContribution: 0, maximumAvailableContribution: 5 },
          }),
        ).insight,
      ).toBe(0);
    });

    it('keeps SENSE Connection at zero when presented scenarios all time out', () => {
      expect(
        normalizeLocalTraitProfile(
          contributionInput({
            connection: { rawContribution: 0, maximumAvailableContribution: 3 },
          }),
        ).connection,
      ).toBe(0);
    });

    it('rejects a zero denominator explicitly', () => {
      expect(() =>
        normalizeTraitContribution('adaptation', {
          rawContribution: 0,
          maximumAvailableContribution: 0,
        }),
      ).toThrow(HiddenProfileEvidenceError);
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
      'rejects non-finite raw contribution %p',
      (rawContribution) => {
        expect(() =>
          normalizeTraitContribution('sharpness', {
            rawContribution,
            maximumAvailableContribution: 1,
          }),
        ).toThrow(HiddenProfileEvidenceError);
      },
    );

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
      'rejects non-finite maximum contribution %p',
      (maximumAvailableContribution) => {
        expect(() =>
          normalizeTraitContribution('sharpness', {
            rawContribution: 0,
            maximumAvailableContribution,
          }),
        ).toThrow(HiddenProfileEvidenceError);
      },
    );
  });

  describe('global profile aggregation', () => {
    it('calculates the unweighted mean across observed games', () => {
      const result = aggregateGlobalHiddenProfile([
        fullyObservedProfile(0.2),
        fullyObservedProfile(0.8),
      ]);

      expect(result.status).toBe('complete');
      if (result.status === 'complete') {
        expect(result.profile.sharpness).toBeCloseTo(0.5);
        expect(result.profile.persistence).toBeCloseTo(0.5);
      }
    });

    it('excludes null values from the mean', () => {
      const result = aggregateGlobalHiddenProfile([
        fullyObservedProfile(0.4),
        { ...fullyObservedProfile(0.8), connection: null },
      ]);

      expect(result.status).toBe('complete');
      if (result.status === 'complete') {
        expect(result.profile.connection).toBeCloseTo(0.4);
        expect(result.observationCounts.connection).toBe(1);
      }
    });

    it('includes numeric zero in the mean', () => {
      const result = aggregateGlobalHiddenProfile([
        fullyObservedProfile(0),
        fullyObservedProfile(1),
      ]);

      expect(result.status).toBe('complete');
      if (result.status === 'complete') {
        expect(result.profile.insight).toBeCloseTo(0.5);
        expect(result.observationCounts.insight).toBe(2);
      }
    });

    it('uses a single observed value unchanged', () => {
      const result = aggregateGlobalHiddenProfile([fullyObservedProfile(0.37)]);

      expect(result.status).toBe('complete');
      if (result.status === 'complete') {
        expect(result.profile.precision).toBeCloseTo(0.37);
      }
    });

    it('handles mixed null, zero, and positive evidence correctly', () => {
      const result = aggregateGlobalHiddenProfile([
        fullyObservedProfile(0),
        fullyObservedProfile(0.6),
        { ...fullyObservedProfile(0.3), sharpness: null },
      ]);

      expect(result.status).toBe('complete');
      if (result.status === 'complete') {
        expect(result.profile.sharpness).toBeCloseTo(0.3);
        expect(result.observationCounts.sharpness).toBe(2);
      }
    });

    it('returns an explicit insufficient-evidence state when nothing is observed', () => {
      const result = aggregateGlobalHiddenProfile([localProfile()]);

      expect(result.status).toBe('insufficient-evidence');
      if (result.status === 'insufficient-evidence') {
        expect(result.profile).toBeNull();
        expect(result.missingTraits).toEqual(traitIds);
        expect(Object.values(result.observationCounts)).toEqual(Array(7).fill(0));
      }
    });

    it('treats an all-zero observed profile as complete evidence', () => {
      const result = aggregateGlobalHiddenProfile([fullyObservedProfile(0)]);

      expect(result.status).toBe('complete');
      if (result.status === 'complete') {
        expect(Object.values(result.profile)).toEqual(Array(7).fill(0));
        expect(Object.values(result.observationCounts)).toEqual(Array(7).fill(1));
        expect(result.missingTraits).toEqual([]);
      }
    });

    it('does not emit a final profile when one trait has no evidence', () => {
      const result = aggregateGlobalHiddenProfile([
        { ...fullyObservedProfile(0.6), connection: null },
      ]);

      expect(result.status).toBe('insufficient-evidence');
      if (result.status === 'insufficient-evidence') {
        expect(result.profile).toBeNull();
        expect(result.missingTraits).toEqual(['connection']);
        expect(result.partialProfile.connection).toBeNull();
        expect(result.partialProfile.sharpness).toBeCloseTo(0.6);
      }
    });

    it('only emits finite values inside [0,1] for a complete profile', () => {
      const result = aggregateGlobalHiddenProfile([
        fullyObservedProfile(0),
        fullyObservedProfile(0.25),
        fullyObservedProfile(1),
      ]);

      expect(result.status).toBe('complete');
      if (result.status === 'complete') {
        for (const value of Object.values(result.profile)) {
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        }
      }
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, -0.1, 1.1])(
      'rejects invalid normalized local value %p',
      (sharpness) => {
        const invalid = {
          ...fullyObservedProfile(0.5),
          sharpness,
        } as LocalTraitProfile;

        expect(() => aggregateGlobalHiddenProfile([invalid])).toThrow(
          HiddenProfileEvidenceError,
        );
      },
    );
  });

  describe('shared contract invariants', () => {
    it('exports exactly the seven official trait identifiers', () => {
      expect(traitIds).toEqual([
        'sharpness',
        'insight',
        'precision',
        'initiative',
        'connection',
        'adaptation',
        'persistence',
      ]);
    });

    it('exports the canonical game order', () => {
      expect(gameIds).toEqual(['solve', 'sense', 'sprint', 'support', 'sync']);
    });

    it('exports exactly the official Star Type and effect identifiers', () => {
      expect(starTypeIds).toEqual([
        'STRATEGIST',
        'SPARK',
        'SYNERGIST',
        'SEEKER',
        'SUSTAINER',
      ]);
      expect(starEffects).toEqual(['SHIMMER', 'SPARK', 'ORBIT', 'FLOW', 'PULSE']);
    });

    it('recognizes only an exact five-color WingPalette shape', () => {
      const palette: WingPalette = ['#111111', '#222222', '#333333', '#444444', '#555555'];

      expect(isWingPalette(palette)).toBe(true);
      expect(isWingPalette(palette.slice(0, 4))).toBe(false);
      expect(isWingPalette([...palette, '#666666'])).toBe(false);
      expect(isWingPalette(['#111111', '#222222', '#333333', '#444444', 5])).toBe(false);
    });

    it('keeps legacy and official version families explicit and distinguishable', () => {
      expect(STARPRINT_UNVERSIONED_PAYLOAD_FAMILY).toBe('legacyV1');
      expect(STARPRINT_VERSIONS.legacyV1.profileModel).toContain('legacy-5d');
      expect(STARPRINT_VERSIONS.officialV2.profileModel).toContain('7d-v2');
      expect(STARPRINT_VERSIONS.legacyV1.rawPayload).not.toBe(
        STARPRINT_VERSIONS.officialV2.rawPayload,
      );
    });
  });

  describe('legacy/v2 isolation', () => {
    it('rejects an official v2 SOLVE payload before the legacy scorer can see it', () => {
      const rawResult: GameRawResultMap['solve'] = {
        gameId: 'solve',
        payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
        contentVersion: STARPRINT_VERSIONS.officialV2.content,
        startedAtMs: 1_000,
        completedAtMs: 2_000,
        answers: [
          {
            questionId: SOLVE_QUESTIONS[0].id,
            selectedOptionId: SOLVE_QUESTIONS[0].options[0].id,
            responseTimeMs: 1_000,
            timedOut: false,
          },
        ],
      };

      expect(() => validateRawGameResult(GameType.SOLVE, rawResult)).toThrow(
        'Versioned game results are not accepted by the legacy submission route',
      );
    });

    it('rejects an official v2 SENSE payload before the legacy scorer can see it', () => {
      const rawResult: GameRawResultMap['sense'] = {
        gameId: 'sense',
        payloadVersion: STARPRINT_VERSIONS.officialV2.rawPayload,
        contentVersion: STARPRINT_VERSIONS.officialV2.content,
        startedAtMs: 1_000,
        completedAtMs: 2_000,
        decisions: [
          {
            scenarioId: SENSE_SCENARIOS[0].id,
            optionId: SENSE_SCENARIOS[0].options[0].id,
            responseTimeMs: 1_000,
            timedOut: false,
          },
        ],
      };

      expect(() => validateRawGameResult(GameType.SENSE, rawResult)).toThrow(
        'Versioned game results are not accepted by the legacy submission route',
      );
    });
  });
});
