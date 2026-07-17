import { getEnv } from '../../config/env.js';
import type {
  InterestLabel,
  IntentLabel,
} from '../../modules/conversations/reply-classification.model.js';

export const GEMINI_CONVERSATIONS_MODEL = 'gemini-2.5-flash';

/** AI never makes irreversible hiring decisions. */
export type ConversationAiGuardrails = {
  autoHire: false;
  autoReject: false;
  autoQualify: false;
  requiresHumanForFinalQualification: true;
};

export const CONVERSATION_AI_GUARDRAILS: ConversationAiGuardrails = {
  autoHire: false,
  autoReject: false,
  autoQualify: false,
  requiresHumanForFinalQualification: true,
};

export const DEFAULT_CLASSIFY_CONFIDENCE_THRESHOLD = 0.72;

export type ClassifyReplyInput = {
  bodyText: string;
  subject?: string | null;
  priorMessages?: Array<{ direction: string; bodyText: string }>;
  qualificationQuestions?: Array<{ id: string; prompt: string }>;
};

export type ClassifyReplyResult = {
  interest: InterestLabel;
  intent: IntentLabel;
  extractedVariables: Record<string, unknown>;
  confidence: number;
  model: string;
  suggestedQualificationStatus: 'in_progress' | 'handed_off' | null;
  handoffRecommended: boolean;
  summary: string;
  guardrails: ConversationAiGuardrails;
};

export type ConversationDraftInput = {
  tone?: string;
  channel?: 'email' | 'whatsapp';
  candidateName?: string;
  jobTitle?: string | null;
  jobDescription?: string | null;
  lastCandidateMessage?: string | null;
  instructions?: string;
};

export type ConversationDraftResult = {
  subject: string | null;
  body: string;
  tone: string;
  model: string;
  isDraft: true;
  /** Always false — drafts never send themselves. */
  autoSend: false;
  guardrails: ConversationAiGuardrails;
};

export type AnswerFromJdInput = {
  candidateName?: string | null;
  jobTitle?: string | null;
  jobDescription?: string | null;
  locations?: string[];
  workplaceType?: string | null;
  requirements?: string[];
  requiredSkills?: string[];
  salaryRange?: string | null;
  candidateQuestion: string;
  channel?: 'email' | 'whatsapp';
};

export type AnswerFromJdResult = {
  body: string;
  canAnswer: boolean;
  compensationRelated: boolean;
  model: string;
};

function normalizeTone(tone?: string): string {
  const t = (tone || 'Professional').toLowerCase();
  if (t.includes('friend')) return 'Friendly';
  if (t.includes('direct')) return 'Direct';
  return 'Professional';
}

function heuristicClassify(input: ClassifyReplyInput): ClassifyReplyResult {
  const text = `${input.subject || ''} ${input.bodyText}`.toLowerCase();
  let interest: InterestLabel = 'unclear';
  let intent: IntentLabel = 'other';
  let confidence = 0.55;
  const extractedVariables: Record<string, unknown> = {};

  if (/\b(stop|unsubscribe|opt[-\s]?out|do not contact|remove me)\b/.test(text)) {
    interest = 'opt_out';
    intent = 'opt_out';
    confidence = 0.92;
  } else if (/\b(not interested|no thanks|pass|decline)\b/.test(text)) {
    interest = 'not_interested';
    intent = 'decline';
    confidence = 0.8;
  } else if (/\b(interested|yes|sounds good|happy to|open to|available)\b/.test(text)) {
    interest = 'interested';
    intent = 'provide_info';
    confidence = 0.78;
  } else if (/\b(call|schedule|calendly|meet|interview)\b/.test(text)) {
    interest = 'interested';
    intent = 'request_call';
    confidence = 0.74;
  } else if (/\?/.test(text)) {
    interest = 'neutral';
    intent = 'ask_question';
    confidence = 0.6;
  }

  const notice = text.match(/(\d+)\s*(?:days?|day)\s*notice/);
  if (notice) extractedVariables.notice_period_days = Number(notice[1]);

  const handoffRecommended =
    interest === 'interested' && confidence >= DEFAULT_CLASSIFY_CONFIDENCE_THRESHOLD;

  return {
    interest,
    intent,
    extractedVariables,
    confidence,
    model: `${GEMINI_CONVERSATIONS_MODEL}-heuristic`,
    suggestedQualificationStatus: handoffRecommended ? 'handed_off' : interest === 'unclear' ? null : 'in_progress',
    handoffRecommended,
    summary: `Heuristic classification: ${interest}/${intent}`,
    guardrails: CONVERSATION_AI_GUARDRAILS,
  };
}

async function callGeminiJson(prompt: string): Promise<Record<string, unknown> | null> {
  const env = getEnv();
  const key = env.GEMINI_API_KEY?.trim();
  if (!key) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONVERSATIONS_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function classifyConversationReply(
  input: ClassifyReplyInput
): Promise<ClassifyReplyResult> {
  const fallback = heuristicClassify(input);
  const questions = (input.qualificationQuestions || [])
    .map((q) => `- ${q.id}: ${q.prompt}`)
    .join('\n');

  const prompt = `You classify recruiting candidate replies. Never decide hire/reject/qualify as final.
Return JSON with keys: interest (${INTEREST_HINT}), intent (${INTENT_HINT}), extractedVariables (object), confidence (0-1), suggestedQualificationStatus (in_progress|handed_off|null), handoffRecommended (boolean), summary (string).

Subject: ${input.subject || '(none)'}
Body: ${input.bodyText}
Prior messages: ${JSON.stringify(input.priorMessages || []).slice(0, 4000)}
Qualification questions:
${questions || '(none)'}
`;

  try {
    const parsed = await callGeminiJson(prompt);
    if (!parsed) return fallback;

    const interest = normalizeInterest(String(parsed.interest || fallback.interest));
    const intent = normalizeIntent(String(parsed.intent || fallback.intent));
    const confidence = clamp01(Number(parsed.confidence ?? fallback.confidence));

    return {
      interest,
      intent,
      extractedVariables:
        parsed.extractedVariables && typeof parsed.extractedVariables === 'object'
          ? (parsed.extractedVariables as Record<string, unknown>)
          : fallback.extractedVariables,
      confidence,
      model: GEMINI_CONVERSATIONS_MODEL,
      suggestedQualificationStatus:
        parsed.suggestedQualificationStatus === 'handed_off' ||
        parsed.suggestedQualificationStatus === 'in_progress'
          ? parsed.suggestedQualificationStatus
          : null,
      handoffRecommended: Boolean(parsed.handoffRecommended),
      summary: String(parsed.summary || fallback.summary).slice(0, 400),
      guardrails: CONVERSATION_AI_GUARDRAILS,
    };
  } catch {
    return fallback;
  }
}

export async function draftConversationReply(
  input: ConversationDraftInput
): Promise<ConversationDraftResult> {
  const tone = normalizeTone(input.tone);
  const channel = input.channel || 'email';
  const name = input.candidateName || 'there';
  const role = input.jobTitle || 'the role';
  const jd = (input.jobDescription || '').slice(0, 5000);

  const offlineBody =
    tone === 'Friendly'
      ? `Hi ${name} — thanks for the reply! Happy to share more about ${role} and find a time that works.`
      : tone === 'Direct'
        ? `Hi ${name}, thanks for getting back. Are you available for a quick call about ${role} this week?`
        : `Hi ${name},\n\nThank you for your response. I'd like to continue the conversation about ${role} and answer any questions you have.\n\nBest regards`;

  const offline: ConversationDraftResult = {
    subject: channel === 'email' ? `Re: ${role}` : null,
    body: offlineBody,
    tone,
    model: `${GEMINI_CONVERSATIONS_MODEL}-offline`,
    isDraft: true,
    autoSend: false,
    guardrails: CONVERSATION_AI_GUARDRAILS,
  };

  const prompt = `Draft a short recruiter ${channel} reply. Tone: ${tone}.
Candidate: ${name}. Role: ${role}.
Job description (use only this for factual answers; if missing say you'll confirm with the team):
${jd || '(none)'}
Last candidate message: ${input.lastCandidateMessage || '(none)'}
Extra instructions: ${input.instructions || '(none)'}
Return JSON: { "subject": string|null, "body": string }.
Do not invent salary, visa, or benefits not in the JD. Do not claim offers were made. Do not auto-qualify or reject.`;

  try {
    const parsed = await callGeminiJson(prompt);
    if (!parsed?.body) return offline;
    return {
      subject: parsed.subject ? String(parsed.subject) : offline.subject,
      body: String(parsed.body).slice(0, 10000),
      tone,
      model: GEMINI_CONVERSATIONS_MODEL,
      isDraft: true,
      autoSend: false,
      guardrails: CONVERSATION_AI_GUARDRAILS,
    };
  } catch {
    return offline;
  }
}

/**
 * Auto-reply to a candidate question using only the job description.
 * Used by outreach qualification when AI reply is enabled.
 */
export async function answerCandidateQuestionFromJd(
  input: AnswerFromJdInput
): Promise<AnswerFromJdResult> {
  const name = (input.candidateName || 'there').trim().split(/\s+/)[0] || 'there';
  const role = input.jobTitle || 'this role';
  const jdParts = [
    input.jobDescription ? input.jobDescription.slice(0, 6000) : '',
    input.locations?.length ? `Locations: ${input.locations.join(', ')}` : '',
    input.workplaceType ? `Workplace: ${input.workplaceType}` : '',
    input.requirements?.length
      ? `Requirements: ${input.requirements.slice(0, 15).join('; ')}`
      : '',
    input.requiredSkills?.length
      ? `Skills: ${input.requiredSkills.slice(0, 20).join(', ')}`
      : '',
    input.salaryRange ? `Compensation: ${input.salaryRange}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const compensationRelated =
    /\b(salary|ctc|compen|pay|package|lpa|rs\.?|₹|cost to company)\b/i.test(
      input.candidateQuestion
    );

  const offline: AnswerFromJdResult = {
    body: jdParts
      ? `Hi ${name} — thanks for asking. Based on the ${role} brief: ${jdParts.slice(0, 400)}${jdParts.length > 400 ? '…' : ''}\n\nHappy to clarify anything else.`
      : `Hi ${name} — thanks for the question about ${role}. I'll confirm the details with the hiring team and get back to you shortly.`,
    canAnswer: Boolean(jdParts),
    compensationRelated,
    model: `${GEMINI_CONVERSATIONS_MODEL}-offline`,
  };

  const prompt = `You are a recruiting assistant. Answer the candidate's question using ONLY the job description context below.
Return JSON: { "body": string, "canAnswer": boolean, "compensationRelated": boolean }.
Rules:
- If the JD does not contain the answer, set canAnswer=false and write a short honest reply that you will confirm with the hiring team (do not invent facts).
- Keep the reply concise (WhatsApp-friendly, under 600 characters when possible).
- Do not ask qualification screening questions here.
- Do not promise offers, visas, or salaries unless present in the JD.
- compensationRelated=true if the question is about pay/CTC/salary/benefits money.

Candidate first name: ${name}
Role: ${role}
Channel: ${input.channel || 'email'}
Candidate question: ${input.candidateQuestion.slice(0, 1500)}

Job context:
${jdParts || '(no JD available)'}
`;

  try {
    const parsed = await callGeminiJson(prompt);
    if (!parsed?.body) return offline;
    return {
      body: String(parsed.body).slice(0, 4000),
      canAnswer: parsed.canAnswer === undefined ? Boolean(jdParts) : Boolean(parsed.canAnswer),
      compensationRelated:
        parsed.compensationRelated === undefined
          ? compensationRelated
          : Boolean(parsed.compensationRelated),
      model: GEMINI_CONVERSATIONS_MODEL,
    };
  } catch {
    return offline;
  }
}

const INTEREST_HINT = 'interested|not_interested|neutral|unclear|opt_out';
const INTENT_HINT = 'ask_question|provide_info|request_call|decline|opt_out|other';

function normalizeInterest(value: string): InterestLabel {
  const v = value.toLowerCase().replace(/\s+/g, '_');
  if (v.includes('opt')) return 'opt_out';
  if (v.includes('not')) return 'not_interested';
  if (v.includes('interest')) return 'interested';
  if (v.includes('neutral')) return 'neutral';
  return 'unclear';
}

function normalizeIntent(value: string): IntentLabel {
  const v = value.toLowerCase().replace(/\s+/g, '_');
  if (v.includes('opt')) return 'opt_out';
  if (v.includes('decline')) return 'decline';
  if (v.includes('call') || v.includes('schedule')) return 'request_call';
  if (v.includes('ask') || v.includes('question')) return 'ask_question';
  if (v.includes('provide') || v.includes('info')) return 'provide_info';
  return 'other';
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
