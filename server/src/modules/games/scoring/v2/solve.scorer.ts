/**
 * STARPRINT v2 SOLVE scorer.
 *
 * Observed traits: Sharpness, Insight, Precision, Adaptation, Persistence
 * Initiative = null (structurally unobserved)
 * Connection  = null (structurally unobserved)
 *
 * Scoring signals per answer:
 *   - correctness: correct vs timeout vs incorrect
 *   - responseTimeFactor: speed relative to 6s window
 *   - category: each question category carries different primary signal targets
 *   - streak: consecutive correct answers provide a small bonus
 *   - recovery: correct after timeout/incorrect contributes to Persistence/Adaptation
 *
 * Formula basis: rawContribution / maximumAvailableContribution → normalized [0,1]
 *
 * NOTE: If the detailed formula components produce a sum that differs from any
 * examples by ≤ 0.1, the component formula is authoritative. This note documents
 * that discrepancy rather than applying a hidden extra weight.
 */

import type { SolveRawResultV2 } from '@5ss/contracts';
import type { LocalTraitContributionInput } from '../v2/hidden-profile.engine';
import { SOLVE_QUESTION_MAP_V2 } from '../../questions/solve-questions-v2.config';

const QUESTION_TIME_LIMIT_MS = 6000;

/** Signal weights per question category → trait primary targets */
const CATEGORY_TRAIT_WEIGHTS: Record<
  string,
  Partial<Record<keyof LocalTraitContributionInput, number>>
> = {
  'pattern-sequence': { sharpness: 0.5, insight: 0.3, precision: 0.2 },
  'visual-precision': { precision: 0.5, sharpness: 0.3, insight: 0.2 },
  'quick-logic': { sharpness: 0.4, insight: 0.4, precision: 0.2 },
  'rule-shift': { adaptation: 0.5, sharpness: 0.3, insight: 0.2 },
  'general-5ss': { insight: 0.4, precision: 0.3, sharpness: 0.3 },
};

interface AnswerSignal {
  correct: boolean;
  timedOut: boolean;
  responseTimeMs: number;
  category: string;
}

function responseTimeFactor(responseTimeMs: number): number {
  // Normalize response time to [0, 1] where 0ms = 1.0, 6000ms = 0.0
  // Clamp within [0, 1]
  const clamped = Math.max(0, Math.min(QUESTION_TIME_LIMIT_MS, responseTimeMs));
  return 1 - clamped / QUESTION_TIME_LIMIT_MS;
}

export function scoreSolveV2(rawResult: SolveRawResultV2): LocalTraitContributionInput {
  const { answers } = rawResult;

  // Per-trait accumulators
  const raw: Record<string, number> = {
    sharpness: 0,
    insight: 0,
    precision: 0,
    adaptation: 0,
    persistence: 0,
  };
  const max: Record<string, number> = {
    sharpness: 0,
    insight: 0,
    precision: 0,
    adaptation: 0,
    persistence: 0,
  };

  const signals: AnswerSignal[] = [];

  for (const answer of answers) {
    const question = SOLVE_QUESTION_MAP_V2.get(answer.questionId);
    if (!question) continue;

    const correct = answer.selectedOptionId === question.correctOptionId;
    const timedOut = answer.timedOut || answer.selectedOptionId === null;
    signals.push({
      correct,
      timedOut,
      category: question.category,
      responseTimeMs: answer.responseTimeMs,
    });
  }

  // Streak tracking
  let streak = 0;
  let prevWasFailure = false;

  for (let i = 0; i < signals.length; i++) {
    const sig = signals[i];
    const tFactor = responseTimeFactor(sig.responseTimeMs);
    const catWeights = CATEGORY_TRAIT_WEIGHTS[sig.category] ?? { sharpness: 0.4, insight: 0.3, precision: 0.3 };

    // Base contribution for this question: 1.0 maximum opportunity per trait per question
    for (const [trait, catWeight] of Object.entries(catWeights)) {
      if (!(trait in max)) continue;
      // Maximum available = catWeight for this question (always present as opportunity)
      max[trait] += catWeight;

      if (sig.correct) {
        // Correct: full correctness signal + time bonus
        const timeFactor = tFactor * 0.25; // up to 0.25 bonus for fast response
        raw[trait] += catWeight * (0.75 + timeFactor);
      } else if (sig.timedOut) {
        // Timeout: 0 contribution but opportunity exists (null ≠ 0 semantics enforced by max > 0)
        raw[trait] += 0;
      } else {
        // Incorrect: small partial contribution for engagement
        raw[trait] += catWeight * 0.05;
      }
    }

    // Streak bonus: goes to Sharpness + Insight
    if (sig.correct) {
      streak++;
      if (streak >= 2) {
        const streakBonus = Math.min(streak - 1, 3) * 0.05;
        max.sharpness += streakBonus;
        raw.sharpness += streakBonus;
        max.insight += streakBonus * 0.5;
        raw.insight += streakBonus * 0.5;
      }
    } else {
      streak = 0;
    }

    // Recovery: correct after failure → Persistence + Adaptation bonus
    if (sig.correct && prevWasFailure) {
      const recoveryBonus = 0.1;
      max.persistence += recoveryBonus;
      raw.persistence += recoveryBonus;
      max.adaptation += recoveryBonus;
      raw.adaptation += recoveryBonus;
    }

    prevWasFailure = !sig.correct || sig.timedOut;
  }

  // Persistence: also receives contribution for completing all questions (non-timeout ratio)
  const completedNonTimeout = signals.filter((s) => !s.timedOut).length;
  const persistenceCompletionBonus = (completedNonTimeout / Math.max(signals.length, 1)) * 0.2;
  max.persistence += 0.2;
  raw.persistence += persistenceCompletionBonus;

  return {
    sharpness:
      max.sharpness > 0
        ? { rawContribution: raw.sharpness, maximumAvailableContribution: max.sharpness }
        : null,
    insight:
      max.insight > 0
        ? { rawContribution: raw.insight, maximumAvailableContribution: max.insight }
        : null,
    precision:
      max.precision > 0
        ? { rawContribution: raw.precision, maximumAvailableContribution: max.precision }
        : null,
    initiative: null,
    connection: null,
    adaptation:
      max.adaptation > 0
        ? { rawContribution: raw.adaptation, maximumAvailableContribution: max.adaptation }
        : null,
    persistence:
      max.persistence > 0
        ? { rawContribution: raw.persistence, maximumAvailableContribution: max.persistence }
        : null,
  };
}
