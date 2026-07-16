import type { EvaluationCriterion } from './screening.model.js';

/**
 * Map Hunar `result` object (legacy parseHunarCallResult fields + evaluation keys)
 * into score breakdown / recommendation. Does not invent provider fields.
 */
export function mapEvaluationScores(input: {
  result: Record<string, unknown> | null;
  criteria: EvaluationCriterion[];
  minScore?: number;
}): {
  scoreBreakdown: Record<string, number>;
  overallScore: number | null;
  recommendation: string | null;
  extractedVariables: Record<string, unknown>;
} {
  const extractedVariables: Record<string, unknown> = {};
  const scoreBreakdown: Record<string, number> = {};

  if (input.result) {
    for (const [key, value] of Object.entries(input.result)) {
      extractedVariables[key] = value;
      if (typeof value === 'number' && Number.isFinite(value)) {
        scoreBreakdown[key] = value;
      }
    }
  }

  for (const criterion of input.criteria || []) {
    const raw =
      input.result?.[criterion.id] ??
      input.result?.[criterion.label] ??
      input.result?.[criterion.label.toLowerCase().replace(/\s+/g, '_')];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      scoreBreakdown[criterion.id] = raw;
    }
  }

  let overallScore: number | null = null;
  const numericScores = Object.values(scoreBreakdown);
  if (numericScores.length > 0) {
    if (input.criteria?.length) {
      let weighted = 0;
      let weightSum = 0;
      for (const criterion of input.criteria) {
        const score = scoreBreakdown[criterion.id];
        if (typeof score !== 'number') continue;
        const weight = criterion.weight > 0 ? criterion.weight : 1;
        weighted += score * weight;
        weightSum += weight;
      }
      overallScore = weightSum > 0 ? Math.round(weighted / weightSum) : average(numericScores);
    } else {
      overallScore = average(numericScores);
    }
  } else if (input.result) {
    overallScore = deriveScoreFromOutcome(input.result);
  }

  const recommendation = deriveRecommendation(input.result, overallScore, input.minScore ?? 70);

  return { scoreBreakdown, overallScore, recommendation, extractedVariables };
}

function average(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Heuristic only over known Hunar result keys from EJHunterLanding. */
function deriveScoreFromOutcome(result: Record<string, unknown>): number | null {
  const interest = String(result.interest_level || '').trim().toLowerCase();
  const outcome = String(result.final_outcome || '').trim().toLowerCase();
  const status = String(result.candidate_status || '').trim().toLowerCase();

  if (interest.includes('high') || outcome.includes('interested') || status.includes('interested')) {
    return 85;
  }
  if (interest.includes('medium') || interest.includes('maybe') || outcome.includes('callback')) {
    return 70;
  }
  if (
    interest.includes('low') ||
    outcome.includes('not_interested') ||
    outcome.includes('not interested') ||
    status.includes('not_interested')
  ) {
    return 35;
  }
  return null;
}

function deriveRecommendation(
  result: Record<string, unknown> | null,
  overallScore: number | null,
  minScore: number
): string | null {
  if (result) {
    const outcome = String(result.final_outcome || '').trim().toLowerCase();
    if (outcome.includes('not_interested') || outcome.includes('not interested')) {
      return 'reject';
    }
    if (outcome.includes('interested') || outcome.includes('shortlist')) {
      return 'shortlist';
    }
    if (outcome.includes('callback') || String(result.callback_requested || '').trim()) {
      return 'review';
    }
  }
  if (overallScore == null) return null;
  if (overallScore >= minScore) return 'shortlist';
  if (overallScore < minScore - 15) return 'reject';
  return 'review';
}

export function minutesFromDuration(durationSeconds: number | null, durationMinutes: number | null) {
  if (typeof durationMinutes === 'number' && durationMinutes > 0) {
    return Math.max(1, Math.ceil(durationMinutes));
  }
  if (typeof durationSeconds === 'number' && durationSeconds > 0) {
    return Math.max(1, Math.ceil(durationSeconds / 60));
  }
  return 1;
}
