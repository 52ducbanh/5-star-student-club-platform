/**
 * STARPRINT v2 SENSE scorer.
 *
 * No right/wrong answer. Measures behavioral tendencies.
 *
 * Internal tendencies: CARE | ACT | ALIGN | ADAPT | REFLECT
 * All 7 official traits are observed (none are null for SENSE).
 *
 * Scoring process:
 *   1. For each scenario decision, resolve selected option's tendencies
 *   2. Map each tendency to 7-trait contribution weights (from TENDENCY_TO_TRAIT_MAP)
 *   3. Sum weighted contributions per trait across all scenarios
 *   4. Apply a LOW-WEIGHT response-time modifier (deliberative bonus, not moral judgment)
 *   5. Timeout = record evidence with 0 contribution (not null)
 *
 * Response time boundaries:
 *   0 <= t < 3000ms   → fast
 *   3000 <= t < 7000ms → neutral (modifier = 1.0)
 *   7000 <= t <= 10000ms → deliberative (+small Insight/Precision bonus)
 *
 * No consistency bonus for mixed/tied dominant tendencies.
 */

import type { SenseRawResultV2 } from '@5ss/contracts';
import type { LocalTraitContributionInput } from '../v2/hidden-profile.engine';
import {
  SENSE_SCENARIO_MAP_V2,
  TENDENCY_TO_TRAIT_MAP,
} from '../../questions/sense-scenarios-v2.config';

const SCENARIO_TIME_LIMIT_MS = 10000;
const DELIBERATIVE_THRESHOLD_MS = 7000;

/** Low-weight response-time modifier per trait */
function applyTimeModifier(
  traitContrib: Record<string, number>,
  traitMax: Record<string, number>,
  responseTimeMs: number,
): void {
  const clampedTime = Math.max(0, Math.min(SCENARIO_TIME_LIMIT_MS, responseTimeMs));
  const timeModifierWeight = 0.04; // intentionally small

  if (clampedTime >= DELIBERATIVE_THRESHOLD_MS) {
    // Deliberative: small bonus to Insight and Precision
    traitContrib['insight'] += timeModifierWeight;
    traitMax['insight'] += timeModifierWeight;
    traitContrib['precision'] += timeModifierWeight;
    traitMax['precision'] += timeModifierWeight;
  }
  // Fast (< 3s): no modifier applied (speed is NOT morally superior)
  // Neutral: no modifier
}

export function scoreSenseV2(rawResult: SenseRawResultV2): LocalTraitContributionInput {
  const { decisions } = rawResult;

  const traitIds = [
    'sharpness',
    'insight',
    'precision',
    'initiative',
    'connection',
    'adaptation',
    'persistence',
  ] as const;

  const raw: Record<string, number> = Object.fromEntries(
    traitIds.map((t) => [t, 0]),
  );
  const max: Record<string, number> = Object.fromEntries(
    traitIds.map((t) => [t, 0]),
  );

  for (const decision of decisions) {
    const scenario = SENSE_SCENARIO_MAP_V2.get(decision.scenarioId);
    if (!scenario) continue;

    if (decision.timedOut || decision.optionId === null) {
      // Timeout: all traits still have observation opportunity, but zero contribution
      for (const trait of traitIds) {
        max[trait] += 0.1; // small sentinel opportunity (ensures non-null)
        // raw stays 0
      }
      continue;
    }

    const option = scenario.options.find((o) => o.id === decision.optionId);
    if (!option) continue;

    // Sum tendency contributions for this option
    for (const tendencyWeight of option.tendencies) {
      const traitWeights = TENDENCY_TO_TRAIT_MAP[tendencyWeight.tendency];
      for (const [trait, weight] of Object.entries(traitWeights)) {
        if (!(trait in raw)) continue;
        const contribution = weight * tendencyWeight.weight;
        raw[trait] += contribution;
        max[trait] += weight; // maximum available regardless of which option was chosen
      }
    }

    // Apply low-weight response time modifier
    applyTimeModifier(raw, max, decision.responseTimeMs);
  }

  // Ensure all traits have positive max (all 7 observed)
  // If a scenario was timed out, the sentinel above ensures max > 0.
  // If no scenarios were answered at all, set a minimum opportunity.
  if (decisions.length === 0) {
    for (const trait of traitIds) {
      max[trait] = 0.1;
      // raw stays 0
    }
  }

  return {
    sharpness: { rawContribution: raw.sharpness, maximumAvailableContribution: Math.max(max.sharpness, 0.001) },
    insight: { rawContribution: raw.insight, maximumAvailableContribution: Math.max(max.insight, 0.001) },
    precision: { rawContribution: raw.precision, maximumAvailableContribution: Math.max(max.precision, 0.001) },
    initiative: { rawContribution: raw.initiative, maximumAvailableContribution: Math.max(max.initiative, 0.001) },
    connection: { rawContribution: raw.connection, maximumAvailableContribution: Math.max(max.connection, 0.001) },
    adaptation: { rawContribution: raw.adaptation, maximumAvailableContribution: Math.max(max.adaptation, 0.001) },
    persistence: { rawContribution: raw.persistence, maximumAvailableContribution: Math.max(max.persistence, 0.001) },
  };
}
