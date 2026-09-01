import type {
  GlobalHiddenProfile,
  LocalTraitProfile,
  TraitId,
} from '@5ss/contracts';
import { traitIds } from '@5ss/contracts';

export interface TraitContributionEvidence {
  /** Positive behavioral signal accumulated by the authoritative game scorer. */
  rawContribution: number;
  /**
   * Maximum signal available from the valid observation opportunities actually
   * presented. Incorrect answers and timeouts are still opportunities, so an
   * observed trait must keep a positive maximum even when its raw signal is 0.
   */
  maximumAvailableContribution: number;
}

/**
 * Every trait must be declared explicitly. `null` is reserved exclusively for
 * traits this game is structurally not designed to observe. Poor performance,
 * incorrect answers, timeouts, or a lack of positive signal must use evidence
 * with `rawContribution: 0` and a positive opportunity maximum instead.
 */
export type LocalTraitContributionInput = Readonly<
  Record<TraitId, TraitContributionEvidence | null>
>;

export type TraitObservationCounts = Record<TraitId, number>;

export interface CompleteGlobalProfileAggregation {
  status: 'complete';
  profile: GlobalHiddenProfile;
  observationCounts: TraitObservationCounts;
  missingTraits: [];
}

export interface InsufficientGlobalProfileAggregation {
  status: 'insufficient-evidence';
  profile: null;
  /**
   * Useful for pipeline diagnostics only; this state means that at least one
   * trait has no structurally observing source. Numeric zero never causes it.
   */
  partialProfile: LocalTraitProfile;
  observationCounts: TraitObservationCounts;
  missingTraits: TraitId[];
}

export type GlobalProfileAggregationResult =
  | CompleteGlobalProfileAggregation
  | InsufficientGlobalProfileAggregation;

export type HiddenProfileEvidenceErrorCode =
  | 'NON_FINITE_CONTRIBUTION'
  | 'INVALID_MAXIMUM_AVAILABLE_CONTRIBUTION'
  | 'MISSING_TRAIT_OBSERVABILITY_DECLARATION'
  | 'INVALID_LOCAL_PROFILE_VALUE';

export class HiddenProfileEvidenceError extends Error {
  constructor(
    public readonly code: HiddenProfileEvidenceErrorCode,
    public readonly trait: TraitId,
    message: string,
  ) {
    super(message);
    this.name = 'HiddenProfileEvidenceError';
  }
}

function clampUnitInterval(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function normalizeTraitContribution(
  trait: TraitId,
  evidence: TraitContributionEvidence,
): number {
  const { rawContribution, maximumAvailableContribution } = evidence;

  if (!Number.isFinite(rawContribution)) {
    throw new HiddenProfileEvidenceError(
      'NON_FINITE_CONTRIBUTION',
      trait,
      `Raw contribution for ${trait} must be finite.`,
    );
  }

  if (
    !Number.isFinite(maximumAvailableContribution) ||
    maximumAvailableContribution <= 0
  ) {
    throw new HiddenProfileEvidenceError(
      'INVALID_MAXIMUM_AVAILABLE_CONTRIBUTION',
      trait,
      `Maximum available contribution for ${trait} must be finite and greater than zero.`,
    );
  }

  return clampUnitInterval(rawContribution / maximumAvailableContribution);
}

/**
 * Converts authoritative per-trait contributions into a normalized local 7D
 * profile. Game-specific scorers supply maxima from the opportunities that
 * were actually presented; this engine deliberately contains no global caps.
 */
export function normalizeLocalTraitProfile(
  input: LocalTraitContributionInput,
): LocalTraitProfile {
  const profile = {} as Record<TraitId, number | null>;

  for (const trait of traitIds) {
    const evidence = input[trait];

    if (evidence === undefined) {
      throw new HiddenProfileEvidenceError(
        'MISSING_TRAIT_OBSERVABILITY_DECLARATION',
        trait,
        `Trait ${trait} must be declared as observed evidence or explicit structural null.`,
      );
    }

    profile[trait] =
      evidence === null ? null : normalizeTraitContribution(trait, evidence);
  }

  return profile;
}

function validateLocalProfileValue(
  trait: TraitId,
  value: number | null | undefined,
): asserts value is number | null {
  if (value === null) {
    return;
  }

  if (value === undefined || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new HiddenProfileEvidenceError(
      'INVALID_LOCAL_PROFILE_VALUE',
      trait,
      `Local profile value for ${trait} must be null or a finite number in [0,1].`,
    );
  }
}

function isCompleteGlobalHiddenProfile(
  profile: LocalTraitProfile,
): profile is GlobalHiddenProfile {
  return traitIds.every((trait) => profile[trait] !== null);
}

/**
 * Aggregates each trait using an unweighted mean over observed games only.
 * Numeric zero is included; null is excluded. A final numeric profile is not
 * emitted until every trait has at least one observation.
 */
export function aggregateGlobalHiddenProfile(
  localProfiles: readonly LocalTraitProfile[],
): GlobalProfileAggregationResult {
  const partialProfile = {} as Record<TraitId, number | null>;
  const observationCounts = {} as TraitObservationCounts;
  const missingTraits: TraitId[] = [];

  for (const trait of traitIds) {
    let sum = 0;
    let count = 0;

    for (const localProfile of localProfiles) {
      const value = localProfile[trait];
      validateLocalProfileValue(trait, value);

      if (value !== null) {
        sum += value;
        count += 1;
      }
    }

    observationCounts[trait] = count;

    if (count === 0) {
      partialProfile[trait] = null;
      missingTraits.push(trait);
      continue;
    }

    const mean = sum / count;
    if (!Number.isFinite(mean)) {
      throw new HiddenProfileEvidenceError(
        'INVALID_LOCAL_PROFILE_VALUE',
        trait,
        `Aggregated profile value for ${trait} must be finite.`,
      );
    }
    partialProfile[trait] = clampUnitInterval(mean);
  }

  if (missingTraits.length > 0) {
    return {
      status: 'insufficient-evidence',
      profile: null,
      partialProfile,
      observationCounts,
      missingTraits,
    };
  }

  if (!isCompleteGlobalHiddenProfile(partialProfile)) {
    throw new Error('Hidden Profile aggregation invariant failed.');
  }

  return {
    status: 'complete',
    profile: partialProfile,
    observationCounts,
    missingTraits: [],
  };
}
