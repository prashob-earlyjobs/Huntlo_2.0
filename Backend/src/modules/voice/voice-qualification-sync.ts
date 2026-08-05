/**
 * Bridge Hunar call-result fields into outreach enrollment.qualificationState.answers.
 * Screening already captures per-question `*_answer` keys; outreach dials need the same.
 */

import {
  evaluateKnockout,
  normalizeAnswerRecord,
  type QualificationQuestion,
} from '../outreach/qualification-qa.service.js';
import type { OutreachCampaignDocument } from '../outreach/campaign.model.js';
import type { OutreachEnrollmentDocument } from '../outreach/enrollment.model.js';
import { ROSHNI_RESULT_PROMPT, ROSHNI_RESULT_SCHEMA } from './roshni-prompt.js';

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function answerValue(entry: unknown): string {
  if (entry == null) return '';
  if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
    return String(entry);
  }
  if (typeof entry === 'object' && entry !== null && 'value' in entry) {
    return String((entry as { value?: unknown }).value ?? '');
  }
  return String(entry);
}

function isProvided(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  const lower = v.toLowerCase();
  return lower !== 'not provided' && lower !== 'n/a' && lower !== 'na' && lower !== 'none';
}

/** Stable Hunar result-schema key for a qualification question id. */
export function qualificationAnswerKey(questionId: string): string {
  const slug =
    String(questionId || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'question';
  return `${slug}_answer`;
}

type QuestionLike = {
  id?: string | null;
  prompt?: string | null;
  expectedVariable?: string | null;
};

function answerKeysForQuestion(question: QuestionLike): string[] {
  const keys: string[] = [];
  const id = String(question.id || '').trim();
  if (id) {
    keys.push(qualificationAnswerKey(id));
    keys.push(`${id}_answer`);
    keys.push(id);
  }
  const variable = String(question.expectedVariable || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  if (variable) {
    keys.push(`${variable}_answer`);
    keys.push(variable);
  }
  return keys;
}

/** Map free-text prompt → static Roshni result fields (for agents not yet re-synced). */
export function inferAnswerFromRoshniFields(
  prompt: string,
  result: Record<string, unknown>
): string | null {
  const p = prompt.toLowerCase();
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = asString(result[key]);
      if (isProvided(value)) return value;
    }
    return null;
  };

  if (/notice|how soon|join|available|availability/.test(p)) {
    return pick('notice_period', 'noticePeriod');
  }
  if (/location|hybrid|remote|work.?mode|relocat|wfh|wfo/.test(p)) {
    return pick('location', 'work_mode', 'workplace');
  }
  if (/ctc|salary|compensation|package|pay/.test(p)) {
    if (/expect|desired|looking|target/.test(p)) {
      return pick('expected_ctc', 'expectedCtc');
    }
    return pick('ctc', 'current_ctc', 'currentCtc');
  }
  if (/educat|degree|qualification|college/.test(p)) {
    return pick('education');
  }
  if (/experience|years/.test(p)) {
    if (/relevant/.test(p)) return pick('relevant_experience', 'relevantExperience');
    return pick('experience');
  }
  if (/skill|tech|tool/.test(p)) {
    return pick('skills_and_tools', 'skills');
  }
  if (/project|accomplish/.test(p)) {
    return pick('recent_project', 'recentProject');
  }
  return null;
}

export function extractQualificationAnswer(
  question: QuestionLike,
  result: Record<string, unknown>
): string | null {
  for (const key of answerKeysForQuestion(question)) {
    if (!(key in result)) continue;
    const value = asString(result[key]);
    if (isProvided(value)) return value;
  }
  const prompt = String(question.prompt || '').trim();
  if (prompt) {
    return inferAnswerFromRoshniFields(prompt, result);
  }
  return null;
}

/** Extend Roshni result_schema / result_prompt with per-question answer keys. */
export function extendResultSchemaForQualificationQuestions(
  baseSchema: Record<string, unknown> | null | undefined,
  basePrompt: string | null | undefined,
  questions: QuestionLike[] | null | undefined
): { resultSchema: Record<string, unknown>; resultPrompt: string } {
  const schema: Record<string, unknown> = {
    ...(baseSchema && Object.keys(baseSchema).length ? baseSchema : ROSHNI_RESULT_SCHEMA),
  };
  const properties: Record<string, unknown> = {
    ...((schema.properties as Record<string, unknown>) || {}),
  };

  const answerFields: string[] = [];
  for (const question of questions || []) {
    const id = String(question.id || '').trim();
    const prompt = String(question.prompt || '').trim();
    if (!id || !prompt) continue;
    const answerKey = qualificationAnswerKey(id);
    if (!properties[answerKey]) {
      properties[answerKey] = {
        type: 'string',
        description: `Candidate's spoken answer for "${prompt}". Use "Not provided" when unclear.`,
      };
    }
    answerFields.push(`"${answerKey}": string — answer to "${prompt}"`);
  }

  schema.properties = properties;
  let resultPrompt = String(basePrompt || '').trim() || ROSHNI_RESULT_PROMPT;
  if (answerFields.length > 0) {
    resultPrompt = `${resultPrompt}\n\nAlso include captured qualification answers (text only): ${answerFields.join(', ')}.`;
  }
  return { resultSchema: schema, resultPrompt };
}

/**
 * Write Hunar call-result values into enrollment.qualificationState.answers.
 * Returns true when any answer was written or status changed.
 */
export function applyVoiceResultToQualificationState(input: {
  campaign: Pick<OutreachCampaignDocument, 'qualificationConfig'>;
  enrollment: OutreachEnrollmentDocument;
  result: Record<string, unknown> | null | undefined;
}): boolean {
  if (!input.result || typeof input.result !== 'object') return false;

  const questions = (input.campaign.qualificationConfig?.questions ||
    []) as QualificationQuestion[];
  if (!questions.length) return false;

  const answers: Record<string, unknown> = {
    ...(input.enrollment.qualificationState?.answers || {}),
  };
  let updated = false;
  let anyKnockoutFail = false;

  for (const question of questions) {
    const id = String(question.id || '').trim();
    if (!id) continue;
    if (isProvided(answerValue(answers[id]))) continue;

    const raw = extractQualificationAnswer(question, input.result);
    if (!raw) continue;

    answers[id] = normalizeAnswerRecord(raw, 'ai');
    updated = true;

    if (evaluateKnockout(question, raw) === 'fail') {
      anyKnockoutFail = true;
    }
  }

  if (!updated) return false;

  const allAnswered = questions.every((q) => isProvided(answerValue(answers[q.id])));
  const previousStatus = input.enrollment.qualificationState?.status || 'pending';
  let status = previousStatus;

  if (anyKnockoutFail) {
    status = 'rejected';
  } else if (allAnswered) {
    status = 'qualified';
  } else if (previousStatus === 'pending' || previousStatus === 'qualified') {
    status = 'in_progress';
  }

  input.enrollment.qualificationState = {
    status,
    answers: answers as OutreachEnrollmentDocument['qualificationState']['answers'],
  };
  return true;
}
