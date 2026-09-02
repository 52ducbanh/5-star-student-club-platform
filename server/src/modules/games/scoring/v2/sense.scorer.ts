import type { SenseRawResultV2, TraitId } from '@5ss/contracts';
import type { LocalTraitContributionInput } from '../v2/hidden-profile.engine';
import {
  SENSE_SCENARIO_MAP_V2,
  TENDENCY_TO_TRAIT_MAP,
  SenseTendency,
} from '../../questions/sense-scenarios-v2.config';

/**
 * Official BA SENSE Maximum Available Trait Thresholds
 * Source: spec SENSE Normalization Sheet (GID 473422769 / 1646145535)
 */
export const SENSE_OFFICIAL_MAX_TRAITS: Record<TraitId, number> = {
  sharpness: 0.992,
  insight: 2.476,
  precision: 1.750,
  initiative: 2.872,
  connection: 3.102,
  adaptation: 2.838,
  persistence: 1.188,
};

const TRAIT_IDS: readonly TraitId[] = [
  'sharpness',
  'insight',
  'precision',
  'initiative',
  'connection',
  'adaptation',
  'persistence',
];

export function scoreSenseV2(rawResult: SenseRawResultV2): LocalTraitContributionInput {
  const { decisions } = rawResult;

  const raw: Record<TraitId, number> = {
    sharpness: 0,
    insight: 0,
    precision: 0,
    initiative: 0,
    connection: 0,
    adaptation: 0,
    persistence: 0,
  };

  const primaryTendencies: (SenseTendency | null)[] = [];
  // Track base contributions produced strictly by primary tendencies for consistency calculation
  const primaryBaseContribs: Record<TraitId, number>[] = [];

  for (const decision of decisions) {
    const scenario = SENSE_SCENARIO_MAP_V2.get(decision.scenarioId);
    if (!scenario) continue;

    if (decision.timedOut || decision.optionId === null) {
      primaryTendencies.push(null);
      continue;
    }

    const optId = decision.optionId.toLowerCase();
    const option = scenario.options.find(
      (o) => o.id.toLowerCase() === optId || (o.optionId && o.optionId.toLowerCase() === optId),
    );
    if (!option) {
      primaryTendencies.push(null);
      continue;
    }

    // Identify primary tendency (first entry)
    const primTendency = option.tendencies[0]?.tendency ?? null;
    primaryTendencies.push(primTendency);

    const thisPrimaryContrib: Record<TraitId, number> = {
      sharpness: 0,
      insight: 0,
      precision: 0,
      initiative: 0,
      connection: 0,
      adaptation: 0,
      persistence: 0,
    };

    // 1. Sum tendency contributions for this option
    for (let i = 0; i < option.tendencies.length; i++) {
      const { tendency, weight } = option.tendencies[i];
      const traitWeights = TENDENCY_TO_TRAIT_MAP[tendency];
      if (!traitWeights) continue;

      for (const trait of TRAIT_IDS) {
        const val = (traitWeights[trait] ?? 0) * weight;
        raw[trait] += val;
        if (i === 0) {
          // strictly from primary tendency
          thisPrimaryContrib[trait] += val;
        }
      }
    }
    primaryBaseContribs.push(thisPrimaryContrib);

    // 2. Official response-time modifiers (Section 2.9)
    const timeMs = decision.responseTimeMs;
    if (timeMs <= 3000) {
      // 0–3s fast: sharpness +0.20, initiative +0.10
      raw.sharpness += 0.20;
      raw.initiative += 0.10;
    } else if (timeMs >= 7000 && timeMs <= 10000) {
      // 7–10s deliberative: insight +0.10, precision +0.10
      raw.insight += 0.10;
      raw.precision += 0.10;
    }
    // 3–7s neutral: no modifier
  }

  // 3. Consistency Bonus (BA Google Sheet GID 1646145535, rows 10-13)
  // If all 3 situations share the exact same primary tendency, add 10% of the
  // contribution generated strictly by that repeated tendency.
  if (
    primaryTendencies.length === 3 &&
    primaryTendencies[0] !== null &&
    primaryTendencies[0] === primaryTendencies[1] &&
    primaryTendencies[1] === primaryTendencies[2]
  ) {
    for (const trait of TRAIT_IDS) {
      const sumPrimaryBase =
        (primaryBaseContribs[0]?.[trait] ?? 0) +
        (primaryBaseContribs[1]?.[trait] ?? 0) +
        (primaryBaseContribs[2]?.[trait] ?? 0);
      raw[trait] += sumPrimaryBase * 0.10;
    }
  }

  return {
    sharpness: {
      rawContribution: raw.sharpness,
      maximumAvailableContribution: SENSE_OFFICIAL_MAX_TRAITS.sharpness,
    },
    insight: {
      rawContribution: raw.insight,
      maximumAvailableContribution: SENSE_OFFICIAL_MAX_TRAITS.insight,
    },
    precision: {
      rawContribution: raw.precision,
      maximumAvailableContribution: SENSE_OFFICIAL_MAX_TRAITS.precision,
    },
    initiative: {
      rawContribution: raw.initiative,
      maximumAvailableContribution: SENSE_OFFICIAL_MAX_TRAITS.initiative,
    },
    connection: {
      rawContribution: raw.connection,
      maximumAvailableContribution: SENSE_OFFICIAL_MAX_TRAITS.connection,
    },
    adaptation: {
      rawContribution: raw.adaptation,
      maximumAvailableContribution: SENSE_OFFICIAL_MAX_TRAITS.adaptation,
    },
    persistence: {
      rawContribution: raw.persistence,
      maximumAvailableContribution: SENSE_OFFICIAL_MAX_TRAITS.persistence,
    },
  };
}
