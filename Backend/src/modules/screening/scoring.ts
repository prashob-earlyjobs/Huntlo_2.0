import type { EvaluationCriterion } from './screening.model.js';

/**
 * Map Hunar `result` object (legacy parseHunarCallResult fields + evaluation keys)
 * into score breakdown / recommendation. Does not invent provider fields.
 */
export function mapEvaluationScores(input: {
  result: Record<string, unknown> | null;
  criteria: EvaluationCriterion[];
  minScore?: number;
  knockouts?: string[];
}): {
  scoreBreakdown: Record<string, number>;
  overallScore: number | null;
  recommendation: string | null;
  extractedVariables: Record<string, unknown>;
  triggeredKnockouts: string[];
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

  // Product rule: overall score is the Communication score only.
  // Question answers are captured as string fields (*_answer), not scored.
  let overallScore: number | null = null;
  const communicationScore =
    typeof scoreBreakdown.communication === 'number'
      ? scoreBreakdown.communication
      : typeof scoreBreakdown.Communication === 'number'
        ? scoreBreakdown.Communication
        : null;

  if (communicationScore != null) {
    overallScore = Math.round(communicationScore);
  } else if (input.criteria?.length) {
    const communicationCriterion = input.criteria.find(
      (criterion) =>
        criterion.id === 'communication' ||
        criterion.label.toLowerCase().includes('communication')
    );
    if (communicationCriterion) {
      const score = scoreBreakdown[communicationCriterion.id];
      if (typeof score === 'number') {
        overallScore = Math.round(score);
      }
    }
  }

  if (overallScore == null && input.result) {
    overallScore = deriveScoreFromOutcome(input.result);
  }

  const configuredKnockouts = (input.knockouts || []).map((value) => value.trim()).filter(Boolean);
  const triggeredKnockouts = detectTriggeredKnockouts(input.result, configuredKnockouts);

  let recommendation = deriveRecommendation(
    input.result,
    overallScore,
    input.minScore ?? 70
  );

  // Configured knockouts always force Reject, regardless of score or provider outcome.
  if (triggeredKnockouts.length > 0) {
    recommendation = 'reject';
  }

  return {
    scoreBreakdown,
    overallScore,
    recommendation,
    extractedVariables,
    triggeredKnockouts,
  };
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
  }

  // When we have a computed score, the configured shortlist threshold is authoritative.
  if (overallScore != null) {
    if (overallScore >= minScore) return 'shortlist';
    if (overallScore < minScore - 15) return 'reject';
    return 'review';
  }

  if (result) {
    const outcome = String(result.final_outcome || '').trim().toLowerCase();
    if (outcome.includes('interested') || outcome.includes('shortlist')) {
      return 'shortlist';
    }
    if (outcome.includes('callback') || String(result.callback_requested || '').trim()) {
      return 'review';
    }
  }

  return null;
}

/**
 * Resolve which configured knockout rules fired from the provider result.
 * Prefers an explicit `knockouts_triggered` array when present, then field heuristics.
 */
export function detectTriggeredKnockouts(
  result: Record<string, unknown> | null,
  configured: string[]
): string[] {
  if (!result || configured.length === 0) return [];

  const triggered = new Set<string>();
  const explicit = result.knockouts_triggered ?? result.knockoutsTriggered ?? result.failed_knockouts;
  if (Array.isArray(explicit)) {
    const normalizedExplicit = explicit.map((value) => String(value).trim().toLowerCase());
    for (const rule of configured) {
      const needle = rule.trim().toLowerCase();
      if (normalizedExplicit.some((value) => value === needle || value.includes(needle) || needle.includes(value))) {
        triggered.add(rule);
      }
    }
  }

  for (const rule of configured) {
    if (triggered.has(rule)) continue;
    if (knockoutMatchesResult(rule, result)) triggered.add(rule);
  }

  return Array.from(triggered);
}

function knockoutMatchesResult(rule: string, result: Record<string, unknown>): boolean {
  const key = rule.trim().toLowerCase();

  if (key.includes('notice period')) {
    const days = firstNumber(
      result.notice_period_days,
      result.notice_period,
      result.noticePeriod,
      result.noticePeriodDays
    );
    if (days != null && days > 90) return true;
    const text = firstString(
      result.notice_period,
      result.noticePeriod,
      result.notice_period_answer,
      result.noticePeriod_answer
    );
    if (text && /(\d+)\s*day/.test(text)) {
      const match = text.match(/(\d+)\s*day/i);
      if (match && Number(match[1]) > 90) return true;
    }
    if (text && /(3\s*months?|90\+|over\s*90)/i.test(text)) return true;
  }

  if (key.includes('hybrid') || key.includes('office location') || key.includes('relocation')) {
    const open = firstBoolean(
      result.open_to_hybrid,
      result.open_to_office,
      result.open_to_relocation,
      result.location_flexible
    );
    if (open === false) return true;
    const preference = firstString(
      result.location_preference,
      result.work_mode,
      result.preferred_work_mode,
      result.location_answer,
      result.work_mode_answer,
      result.hybrid_answer
    );
    if (preference && /(remote\s*only|wfh\s*only|not\s*open)/i.test(preference)) return true;
  }

  if (key.includes('salary')) {
    const salaryFit = firstNumber(result.salaryFit, result.salary_fit, result.salary_fit_score);
    if (salaryFit != null && salaryFit < 40) return true;
    const aboveBand = firstBoolean(
      result.salary_above_band,
      result.salaryExpectationAboveBand,
      result.salary_out_of_range
    );
    if (aboveBand === true) return true;
    const salaryAnswer = firstString(
      result.salary_answer,
      result.salary_expectation_answer,
      result.compensation_answer
    );
    if (salaryAnswer && /(above\s*band|out\s*of\s*range|too\s*high)/i.test(salaryAnswer)) {
      return true;
    }
  }

  if (key.includes('relevant experience') || key.includes('no relevant')) {
    const experience = firstNumber(result.experience, result.experience_score, result.roleFit, result.role_fit);
    if (experience != null && experience < 35) return true;
    const flag = firstBoolean(result.no_relevant_experience, result.lacks_relevant_experience);
    if (flag === true) return true;
    const experienceAnswer = firstString(
      result.experience_answer,
      result.relevant_experience_answer,
      result.role_fit_answer
    );
    if (experienceAnswer && /(no\s*relevant|not\s*relevant|lacks?\s*experience)/i.test(experienceAnswer)) {
      return true;
    }
  }

  if (key.includes('consent') || key.includes('recording')) {
    const consent = firstBoolean(
      result.recording_consent,
      result.consent,
      result.consent_given,
      result.declined_recording_consent
    );
    if (key.includes('declined')) {
      if (consent === false) return true;
      if (result.declined_recording_consent === true) return true;
      const consentAnswer = firstString(
        result.consent_answer,
        result.recording_consent_answer
      );
      if (consentAnswer && /(declin|refus|no\b|not\s*okay|don'?t)/i.test(consentAnswer)) {
        return true;
      }
    }
  }

  // Generic boolean flag using a slug of the rule label.
  const slug = key.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (slug && result[slug] === true) return true;

  return false;
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function firstBoolean(...values: unknown[]): boolean | null {
  for (const value of values) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
      if (['false', 'no', 'n', '0'].includes(normalized)) return false;
    }
  }
  return null;
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
