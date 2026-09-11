import { getEnv } from '../../config/env.js';
import {
  parseYearsExperienceRangeFromText,
  type WlSearchRangeFilter,
} from '../future-jobs/futureJobs.filterMapping.js';
import { GEMINI_JOBS_MODEL } from './gemini.jobs.js';

const MAX_PROMPT_CHARS = 700;
const MAX_JD_CHARS = 20_000;
const MAX_YOE_PROMPT_CHARS = 4_000;

type GeminiCallResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'key_missing' | 'api_error' | 'empty' };

async function callGeminiJson(prompt: string): Promise<GeminiCallResult> {
  const apiKey = getEnv().GEMINI_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: 'key_missing' };

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_JOBS_MODEL}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error('[gemini.search-prompt] generateContent failed', res.status, errBody.slice(0, 400));
    return { ok: false, reason: 'api_error' };
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) return { ok: false, reason: 'empty' };
  return { ok: true, text };
}

export function extractSearchPromptFromGeminiText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  if (unfenced !== trimmed) return extractSearchPromptFromGeminiText(unfenced);

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === 'string' && parsed.trim()) {
      return parsed.trim().slice(0, MAX_PROMPT_CHARS);
    }
    if (parsed && typeof parsed === 'object' && 'prompt' in parsed) {
      const prompt = (parsed as { prompt: unknown }).prompt;
      if (typeof prompt === 'string' && prompt.trim()) {
        return prompt.trim().slice(0, MAX_PROMPT_CHARS);
      }
    }
  } catch {
    if (trimmed.length > 40 && !trimmed.startsWith('{')) {
      return trimmed.slice(0, MAX_PROMPT_CHARS);
    }
  }
  return null;
}

/**
 * Rewrite a full job description into a natural-language talent-search brief
 * for Future Jobs POST /wl/search (`jdText`).
 */
export async function rewriteJobAsSearchPrompt(
  jdText: string
): Promise<{ prompt: string | null; source: 'gemini' | 'unavailable' }> {
  const text = String(jdText || '').trim();
  if (!text) return { prompt: null, source: 'unavailable' };

  const result = await callGeminiJson(
    [
      'You convert a hiring job description into a short LinkedIn-style people-search query.',
      'A recruiter will paste your output into a candidate search tool (natural language, not Boolean).',
      'Write 2–4 sentences in a single short paragraph. No bullet lists.',
      'Include only: target title/seniority, location, years of experience, must-have skills (and at most 3 nice-to-haves), workplace, and one notable requirement.',
      'Omit benefits, EEO, salary, company boilerplate, and long JD copy.',
      'Do not invent skills, locations, or years that are not in the job description.',
      'Do not mention Huntlo, Gemini, or that you rewrote a JD.',
      'Return ONLY JSON: {"prompt":"..."}',
      `Keep prompt under ${MAX_PROMPT_CHARS} characters.`,
      `Job description:\n${text.slice(0, MAX_JD_CHARS)}`,
    ].join('\n')
  );

  if (!result.ok) return { prompt: null, source: 'unavailable' };
  const prompt = extractSearchPromptFromGeminiText(result.text);
  if (!prompt) return { prompt: null, source: 'unavailable' };
  return { prompt, source: 'gemini' };
}

function coerceYearsRange(min: unknown, max: unknown): WlSearchRangeFilter | null {
  const lo = typeof min === 'number' && Number.isFinite(min) ? min : null;
  const hi = typeof max === 'number' && Number.isFinite(max) ? max : null;
  if (lo == null && hi == null) return null;
  const finalLo = lo != null ? lo : hi!;
  const finalHi = hi != null ? hi : lo!;
  return {
    type: 'RANGE',
    value: [Math.min(finalLo, finalHi), Math.max(finalLo, finalHi)],
  };
}

export function extractYearsRangeFromGeminiText(text: string): WlSearchRangeFilter | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  if (unfenced !== trimmed) return extractYearsRangeFromGeminiText(unfenced);

  try {
    const parsed = JSON.parse(trimmed) as {
      min?: unknown;
      max?: unknown;
      yearsExpMin?: unknown;
      yearsExpMax?: unknown;
    };
    return coerceYearsRange(
      parsed.min ?? parsed.yearsExpMin,
      parsed.max ?? parsed.yearsExpMax
    );
  } catch {
    return null;
  }
}

/**
 * Extract years-of-experience RANGE from a recruiter NL prompt for `/wl/search` filters.
 * Uses Gemini when configured; falls back to a local heuristic.
 */
export async function extractYearsExperienceRangeFromPrompt(
  prompt: string
): Promise<{ range: WlSearchRangeFilter | null; source: 'gemini' | 'heuristic' | 'none' }> {
  const text = String(prompt || '').trim();
  if (!text) return { range: null, source: 'none' };

  const result = await callGeminiJson(
    [
      'Extract years of experience from this recruiter people-search prompt.',
      'Return ONLY JSON: {"min":number|null,"max":number|null}.',
      'Rules:',
      '- "4-7 years" / "4 to 7 years" → {"min":4,"max":7}',
      '- "around 2 years" / "about 2 years" → {"min":1,"max":3}',
      '- "at least 5 years" → {"min":5,"max":null}',
      '- "up to 3 years" → {"min":null,"max":3}',
      '- "2 years of experience" → {"min":2,"max":2}',
      '- If no years mentioned → {"min":null,"max":null}',
      'Do not invent years that are not implied by the prompt.',
      `Prompt:\n${text.slice(0, MAX_YOE_PROMPT_CHARS)}`,
    ].join('\n')
  );

  if (result.ok) {
    const range = extractYearsRangeFromGeminiText(result.text);
    if (range) return { range, source: 'gemini' };
  }

  const heuristic = parseYearsExperienceRangeFromText(text);
  if (heuristic) return { range: heuristic, source: 'heuristic' };
  return { range: null, source: 'none' };
}
