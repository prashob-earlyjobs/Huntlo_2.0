import { createHash } from 'node:crypto';

import { getEnv } from '../../config/env.js';
import type { HyrefastResponseItem } from '../hyrefast/hyrefast.client.js';

export const GEMINI_SCREENING_VIDEO_MODEL = 'gemini-2.5-flash';

export type VideoInterviewEvaluation = {
  communication: number;
  overallScore: number;
  recommendation: 'shortlist' | 'reject';
  summary: string;
  strengths: string[];
  concerns: string[];
  model: string;
  fingerprint: string;
};

function clampScore(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function asStringList(value: unknown, max = 6): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, max);
}

export function fingerprintVideoResponses(responses: HyrefastResponseItem[]): string {
  const payload = responses
    .map(
      (item) =>
        `${item.id}|${item.transcriptionStatus}|${item.transcriptionText || item.responseText || ''}`
    )
    .join('\n');
  return createHash('sha256').update(payload).digest('hex').slice(0, 24);
}

/** Video interviews: score >= 50 → shortlist, otherwise reject. */
export function recommendationFromCommunicationScore(
  score: number,
  _minShortlistScore = 50
): VideoInterviewEvaluation['recommendation'] {
  const communication = Math.max(0, Math.min(100, Math.round(score)));
  return communication >= 50 ? 'shortlist' : 'reject';
}

function buildTranscriptBlock(responses: HyrefastResponseItem[]): string {
  return responses
    .map((item) => {
      const answer =
        item.transcriptionText ||
        item.responseText ||
        (item.isSkipped ? '[skipped]' : '[no transcript]');
      const duration =
        typeof item.responseDuration === 'number'
          ? ` (${Math.round(item.responseDuration)}s)`
          : '';
      return `Q${item.questionNumber}${duration}: ${item.questionText || 'Question'}\nA: ${answer}`;
    })
    .join('\n\n');
}

async function callGeminiJson(prompt: string): Promise<string | null> {
  const apiKey = getEnv().GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_SCREENING_VIDEO_MODEL}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error(
      '[gemini.screening-video] generateContent failed',
      res.status,
      errBody.slice(0, 400)
    );
    return null;
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

/**
 * Score a completed Hyrefast video interview from question transcripts.
 * Returns communication 0–100 plus strengths/concerns for the summary UI.
 */
export async function evaluateVideoInterviewResponses(input: {
  candidateName?: string;
  jobTitle?: string | null;
  screeningName?: string;
  minShortlistScore?: number;
  responses: HyrefastResponseItem[];
}): Promise<VideoInterviewEvaluation | null> {
  const usable = input.responses.filter(
    (item) =>
      !item.isSkipped &&
      Boolean(String(item.transcriptionText || item.responseText || '').trim())
  );
  if (usable.length === 0) return null;

  const fingerprint = fingerprintVideoResponses(input.responses);
  const transcript = buildTranscriptBlock(usable);

  const prompt = [
    'You are evaluating an async video screening interview for a recruiting ATS.',
    'Score only communication quality from the candidate transcripts (clarity, structure, relevance, confidence, completeness).',
    'Do not invent facts that are not in the transcripts.',
    'Return ONLY JSON with this shape:',
    JSON.stringify({
      communication: 'number 0-100',
      summary: '2-4 sentences for recruiters',
      strengths: ['short bullet', 'short bullet'],
      concerns: ['short bullet'],
    }),
    'Do not return a recommendation — Huntlo will shortlist if communication >= 50, otherwise reject.',
    `Candidate: ${input.candidateName || 'Unknown'}`,
    `Role: ${input.jobTitle || input.screeningName || 'Video screening'}`,
    'Interview transcripts:',
    transcript,
  ].join('\n\n');

  const text = await callGeminiJson(prompt);
  if (!text) return null;

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }

  const communication = clampScore(parsed.communication);
  if (communication == null) return null;

  // Video-only product rule: >= 50 shortlist, else reject.
  const recommendation = recommendationFromCommunicationScore(communication);

  const strengths = asStringList(parsed.strengths);
  const concerns = asStringList(parsed.concerns);
  const summary =
    String(parsed.summary || '').trim() ||
    `Communication scored ${communication}/100 based on the video interview responses.`;

  return {
    communication,
    overallScore: communication,
    recommendation,
    summary,
    strengths:
      strengths.length > 0
        ? strengths
        : communication >= 50
          ? ['Clear and relevant spoken answers']
          : [],
    concerns:
      concerns.length > 0
        ? concerns
        : communication < 50
          ? ['Communication needs improvement for this role']
          : [],
    model: GEMINI_SCREENING_VIDEO_MODEL,
    fingerprint,
  };
}
