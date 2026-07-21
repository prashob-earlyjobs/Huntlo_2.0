import { appendFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getEnv } from '../../config/env.js';
import type {
  InterestLabel,
  IntentLabel,
} from '../../modules/conversations/reply-classification.model.js';

export const GEMINI_CONVERSATIONS_MODEL = 'gemini-2.5-flash';
/** Always Backend/gemini-email-prompts.txt (not dependent on process.cwd()). */
const GEMINI_EMAIL_PROMPT_LOG = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../gemini-email-prompts.txt'
);

export type EmailPipelineLogInput = {
  id?: string;
  task: string;
  detail?: string;
};

/** Correlates gemini + pipeline lines for one inbound email handling pass. */
let emailPipelineLogContextId: string | undefined;

export function setEmailPipelineLogContextId(id: string | undefined): void {
  emailPipelineLogContextId = id;
}

async function appendEmailPipelineLog(input: EmailPipelineLogInput): Promise<void> {
  const id = input.id ?? emailPipelineLogContextId ?? '—';
  const lines = [
    '================',
    `id: ${id}`,
    `task: ${input.task}`,
  ];
  if (input.detail?.trim()) {
    lines.push(`detail: ${input.detail.trim().replace(/\s+/g, ' ').slice(0, 200)}`);
  }
  lines.push('================', '');
  await appendFile(GEMINI_EMAIL_PROMPT_LOG, lines.join('\n'), 'utf8').catch(() => undefined);
}

/** Pipeline breadcrumbs for email AI (classify → compose → send). */
export async function logEmailPipeline(input: EmailPipelineLogInput): Promise<void> {
  await appendEmailPipelineLog(input);
}

function geminiTaskLabel(logLabel: string): string {
  const map: Record<string, string> = {
    'CLASSIFY EMAIL REPLY': 'gemini · classify reply',
    'EVALUATE SCREENING ANSWER': 'gemini · evaluate answer',
    'COMPOSE QUALIFICATION EMAIL': 'gemini · compose follow-up',
    'COMPOSE QUALIFICATION EMAIL BATCH': 'gemini · compose batch',
  };
  for (const [key, task] of Object.entries(map)) {
    if (logLabel.includes(key)) return task;
  }
  return `gemini · ${logLabel.toLowerCase()}`;
}

function summarizeGeminiJson(logLabel: string, parsed: Record<string, unknown>): string {
  if (logLabel.includes('CLASSIFY')) {
    const vars = parsed.extractedVariables;
    const varKeys =
      vars && typeof vars === 'object' && !Array.isArray(vars)
        ? Object.keys(vars as Record<string, unknown>).join(',')
        : '';
    return [
      `${String(parsed.interest)}/${String(parsed.intent)}`,
      `conf=${parsed.confidence}`,
      varKeys ? `vars=${varKeys}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
  if (logLabel.includes('EVALUATE')) {
    return `answered=${parsed.answersQuestion} knockout=${parsed.knockout}`;
  }
  if (logLabel.includes('COMPOSE')) {
    const body = String(parsed.body || '').replace(/\s+/g, ' ').trim();
    return body.length > 120 ? `${body.slice(0, 120)}…` : body;
  }
  return Object.keys(parsed).slice(0, 6).join(',');
}

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
  /** Full thread history, oldest first. Preferred over lastCandidateMessage alone. */
  conversation?: Array<{ direction: 'inbound' | 'outbound'; bodyText: string }>;
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

const GEMINI_FETCH_TIMEOUT_MS = 12_000;

async function callGeminiJson(
  prompt: string,
  logLabel?: string
): Promise<Record<string, unknown> | null> {
  const env = getEnv();
  const key = env.GEMINI_API_KEY?.trim();
  if (!key) {
    if (logLabel) {
      await logEmailPipeline({ task: `${geminiTaskLabel(logLabel)} skipped`, detail: 'no API key' });
    }
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONVERSATIONS_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });
    if (!response.ok) {
      if (logLabel) {
        await logEmailPipeline({
          task: `${geminiTaskLabel(logLabel)} error`,
          detail: `HTTP ${response.status}`,
        });
      }
      return null;
    }
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      if (logLabel) {
        await logEmailPipeline({
          task: `${geminiTaskLabel(logLabel)} error`,
          detail: 'empty response',
        });
      }
      return null;
    }
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (logLabel) {
        await logEmailPipeline({
          task: `${geminiTaskLabel(logLabel)} ok`,
          detail: summarizeGeminiJson(logLabel, parsed),
        });
      }
      return parsed;
    } catch {
      if (logLabel) {
        await logEmailPipeline({
          task: `${geminiTaskLabel(logLabel)} error`,
          detail: 'invalid JSON',
        });
      }
      return null;
    }
  } catch (error) {
    if (logLabel) {
      await logEmailPipeline({
        task: `${geminiTaskLabel(logLabel)} error`,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  } finally {
    clearTimeout(timer);
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

extractedVariables: when the body answers a listed qualification question, prefer that question's id as the key and a concise normalized value. Do not invent facts.

Subject: ${input.subject || '(none)'}
Body: ${input.bodyText}
Prior messages: ${JSON.stringify(input.priorMessages || []).slice(0, 4000)}
Qualification questions:
${questions || '(none)'}
`;

  try {
    const parsed = await callGeminiJson(prompt, 'CLASSIFY EMAIL REPLY');
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

  const historyLines = (input.conversation || [])
    .map(
      (m) =>
        `${m.direction === 'inbound' ? 'Candidate' : 'Recruiter'}: ${String(
          m.bodyText || ''
        ).slice(0, 800)}`
    )
    .join('\n');

  const latestCandidate =
    input.lastCandidateMessage ||
    [...(input.conversation || [])]
      .reverse()
      .find((m) => m.direction === 'inbound')?.bodyText ||
    '(none)';

  const prompt = `Draft a clear, professional recruiter ${channel} reply. Tone: ${tone} (always stay polished and easy to read).
Candidate: ${name}. Role: ${role}.
Job description (use only this for factual answers; if missing say you'll confirm with the team):
${jd || '(none)'}

Full conversation history (oldest first — use the entire thread for context, not only the last message):
${historyLines || '(none)'}

Latest candidate message: ${String(latestCandidate).slice(0, 1500)}
Extra instructions: ${input.instructions || '(none)'}

Return JSON: { "subject": string|null, "body": string }.
Writing rules:
- Be clear, concise, and professional.
- Address what the candidate raised across the conversation, not only the last line.
- Do not invent salary, visa, or benefits not in the JD. Do not claim offers were made. Do not auto-qualify or reject.`;

  try {
    const parsed = await callGeminiJson(
      prompt,
      channel === 'email' ? 'DRAFT CONVERSATION EMAIL REPLY' : undefined
    );
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
    const parsed = await callGeminiJson(
      prompt,
      (input.channel || 'email') === 'email' ? 'ANSWER CANDIDATE EMAIL FROM JD' : undefined
    );
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

export type ComposeQualificationMessageInput = {
  candidateName?: string | null;
  jobTitle?: string | null;
  campaignName?: string | null;
  channel?: 'email' | 'whatsapp';
  /** Most recent candidate reply we are responding to. */
  latestReply?: string | null;
  /** Recent conversation, oldest first. */
  conversation?: Array<{ direction: 'inbound' | 'outbound'; bodyText: string }>;
  /** Q&A collected so far, for context — never re-ask these. */
  answeredSoFar?: Array<{ question: string; answer: string }>;
  /** The exact screening question that must be asked next. */
  nextQuestionPrompt: string;
  /** 0-based index of the question in the sequence. */
  questionIndex: number;
};

export type ComposeQualificationMessageResult = {
  body: string;
  model: string;
};

/**
 * Compose the next qualification message with Gemini: briefly acknowledge the
 * candidate's reply, then ask the configured screening question naturally.
 * The configured question is authoritative — the model may only rephrase it.
 */
export async function composeQualificationMessage(
  input: ComposeQualificationMessageInput
): Promise<ComposeQualificationMessageResult> {
  const name = (input.candidateName || 'there').trim().split(/\s+/)[0] || 'there';
  const role = input.jobTitle || input.campaignName || 'the role';

  const offlineIntro =
    input.questionIndex === 0
      ? `Thanks for getting back, ${name}! Quick question to move forward:\n\n`
      : `Thanks — next question:\n\n`;
  const offline: ComposeQualificationMessageResult = {
    body: `${offlineIntro}${input.nextQuestionPrompt}`,
    model: `${GEMINI_CONVERSATIONS_MODEL}-offline`,
  };

  const historyLines = (input.conversation || [])
    .slice(-8)
    .map(
      (m) =>
        `${m.direction === 'inbound' ? 'Candidate' : 'Recruiter'}: ${String(
          m.bodyText || ''
        ).slice(0, 400)}`
    )
    .join('\n');

  const answered = (input.answeredSoFar || [])
    .map((qa) => `- Q: ${qa.question} → A: ${qa.answer}`)
    .join('\n');

  const prompt = `You are a recruiting assistant continuing a screening chat over ${input.channel || 'email'} for "${role}".
Write the recruiter's next message. Return JSON: { "body": string }.

Hard rules:
- Start with ONE short, natural acknowledgement of the candidate's latest reply (no re-answering it, no new facts about the job, no invented details).
- Then ask EXACTLY this screening question (you may adjust phrasing slightly to flow naturally, but keep the same meaning and ask nothing else): "${input.nextQuestionPrompt}"
- Do not re-ask anything listed under Already answered.
- Do not qualify, reject, or promise anything.
- Keep it short: 1-3 sentences before the question. No signature, no subject line.
- Address the candidate as ${name}${input.questionIndex > 0 ? ' only if natural (mid-conversation)' : ''}.

Already answered:
${answered || '(nothing yet)'}

Recent conversation (oldest first):
${historyLines || '(none)'}

Candidate's latest reply: ${String(input.latestReply || '').slice(0, 800) || '(none)'}
`;

  try {
    const parsed = await callGeminiJson(
      prompt,
      (input.channel || 'email') === 'email' ? 'COMPOSE QUALIFICATION EMAIL' : undefined
    );
    const body = parsed?.body ? String(parsed.body).trim() : '';
    if (!body) return offline;
    // Guardrail: the configured question must survive composition. If the model
    // dropped it entirely, fall back to the deterministic template.
    const questionCore = input.nextQuestionPrompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const bodyLower = body.toLowerCase();
    const overlap = questionCore.filter((w) => bodyLower.includes(w)).length;
    if (questionCore.length > 0 && overlap < Math.ceil(questionCore.length * 0.4)) {
      return offline;
    }
    return { body: body.slice(0, 4000), model: GEMINI_CONVERSATIONS_MODEL };
  } catch {
    return offline;
  }
}

export type ComposeQualificationEmailBatchInput = Omit<
  ComposeQualificationMessageInput,
  'nextQuestionPrompt'
> & {
  /** All screening questions to include in one email (ordered). */
  nextQuestionPrompts: string[];
  /** First outreach with all questions vs follow-up for missed answers only. */
  batchKind?: 'initial' | 'missed';
};

/**
 * One email with several follow-up screening questions (standard email UX).
 */
export async function composeQualificationEmailBatch(
  input: ComposeQualificationEmailBatchInput
): Promise<ComposeQualificationMessageResult> {
  const prompts = (input.nextQuestionPrompts || []).map((p) => String(p || '').trim()).filter(Boolean);
  if (prompts.length === 0) {
    return composeQualificationMessage({
      ...input,
      nextQuestionPrompt: '',
      questionIndex: input.questionIndex,
    });
  }
  if (prompts.length === 1) {
    return composeQualificationMessage({
      ...input,
      nextQuestionPrompt: prompts[0]!,
      questionIndex: input.questionIndex,
    });
  }

  const name = (input.candidateName || 'there').trim().split(/\s+/)[0] || 'there';
  const role = input.jobTitle || input.campaignName || 'the role';
  const numbered = prompts.map((p, i) => `${i + 1}. ${p}`).join('\n');
  const isInitial = (input.batchKind || 'initial') === 'initial';
  const offline: ComposeQualificationMessageResult = {
    body: isInitial
      ? `Thanks for getting back, ${name}!\n\nCould you reply with answers to these?\n\n${numbered}`
      : `Thanks for your reply, ${name}!\n\nCould you still share answers for these?\n\n${numbered}`,
    model: `${GEMINI_CONVERSATIONS_MODEL}-offline`,
  };

  const historyLines = (input.conversation || [])
    .slice(-8)
    .map(
      (m) =>
        `${m.direction === 'inbound' ? 'Candidate' : 'Recruiter'}: ${String(
          m.bodyText || ''
        ).slice(0, 400)}`
    )
    .join('\n');

  const answered = (input.answeredSoFar || [])
    .map((qa) => `- Q: ${qa.question} → A: ${qa.answer}`)
    .join('\n');

  const questionsBlock = prompts.map((p, i) => `${i + 1}. ${p}`).join('\n');

  const prompt = `You are a recruiting assistant continuing screening over email for "${role}".
Write the recruiter's next email. Return JSON: { "body": string }.

Hard rules:
- Start with ONE short acknowledgement of the candidate's latest reply.
${
  isInitial
    ? '- This is the first screening follow-up after they showed interest. Present ALL screening questions below in ONE email as a clear numbered list (1., 2., …).'
    : '- They answered some questions but missed others. Thank them briefly, then ask ONLY the missed questions below in ONE numbered list. Do not repeat questions already answered.'
}
- You may lightly rephrase each question but keep the same meaning. Do not add extra questions.
- Do not re-ask anything under Already answered.
- Invite them to reply with answers in one message (brief line is enough).
- Keep the tone professional and concise. No signature, no subject line.
- Address the candidate as ${name} if natural.

Screening questions to include (all required):
${questionsBlock}

Already answered:
${answered || '(nothing yet)'}

Recent conversation (oldest first):
${historyLines || '(none)'}

Candidate's latest reply: ${String(input.latestReply || '').slice(0, 800) || '(none)'}
`;

  try {
    const parsed = await callGeminiJson(prompt, 'COMPOSE QUALIFICATION EMAIL BATCH');
    const body = parsed?.body ? String(parsed.body).trim() : '';
    if (!body) return offline;
    const bodyLower = body.toLowerCase();
    const withNumber = prompts.filter((p, i) => {
      const n = `${i + 1}.`;
      return body.includes(n) || bodyLower.includes(p.toLowerCase().slice(0, 24));
    }).length;
    if (withNumber < Math.min(2, prompts.length)) return offline;
    return { body: body.slice(0, 6000), model: GEMINI_CONVERSATIONS_MODEL };
  } catch {
    return offline;
  }
}

export type EvaluateScreeningAnswerInput = {
  question: {
    id: string;
    prompt: string;
    answerType?: string | null;
    knockout?: boolean;
    knockoutCondition?: string | null;
  };
  candidateReply: string;
  /** Recent thread, oldest first. */
  conversation?: Array<{ direction: 'inbound' | 'outbound'; bodyText: string }>;
  extractedVariables?: Record<string, unknown>;
  intent?: string | null;
  channel?: 'email' | 'whatsapp';
  /** Full JD + role context for assessment. */
  jobContext?: string | null;
  campaignName?: string | null;
  /** All configured screening questions (helps map numbered replies). */
  allQuestions?: Array<{ id: string; prompt: string }>;
};

export type EvaluateScreeningAnswerResult = {
  /** Candidate's reply substantively answers the open screening question. */
  answersQuestion: boolean;
  /** Reply is unrelated engagement / deflection / empty of screening info. */
  isNotAnAnswer: boolean;
  /** Candidate is mainly asking us something instead of answering. */
  isCandidateQuestion: boolean;
  /** Normalized value to store when answersQuestion is true. */
  answerValue: string | null;
  knockout: 'pass' | 'fail' | 'unknown';
  reason: string;
  model: string;
};

/**
 * Decide whether the candidate answered the open screening question.
 * All semantics (soft answers, engagement vs answer, knockout) come from Gemini —
 * no keyword/type heuristics.
 */
export async function evaluateScreeningAnswer(
  input: EvaluateScreeningAnswerInput
): Promise<EvaluateScreeningAnswerResult> {
  const reply = String(input.candidateReply || '').trim();
  const offline: EvaluateScreeningAnswerResult = {
    // Fail open: if Gemini is down, accept the raw reply so we do not loop forever.
    answersQuestion: Boolean(reply),
    isNotAnAnswer: !reply,
    isCandidateQuestion: false,
    answerValue: reply || null,
    knockout: 'unknown',
    reason: 'offline-fallback',
    model: `${GEMINI_CONVERSATIONS_MODEL}-offline`,
  };
  if (!reply) {
    return {
      ...offline,
      answersQuestion: false,
      isNotAnAnswer: true,
      answerValue: null,
      reason: 'empty-reply',
    };
  }

  const historyLines = (input.conversation || [])
    .slice(-8)
    .map(
      (m) =>
        `${m.direction === 'inbound' ? 'Candidate' : 'Recruiter'}: ${String(
          m.bodyText || ''
        ).slice(0, 400)}`
    )
    .join('\n');

  const knockoutRule = input.question.knockout
    ? String(input.question.knockoutCondition || '').trim() || '(knockout enabled, no explicit rule)'
    : '(none)';

  const prompt = `You evaluate whether a recruiting candidate answered the open screening question.
Return JSON only:
{
  "answersQuestion": boolean,
  "isNotAnAnswer": boolean,
  "isCandidateQuestion": boolean,
  "answerValue": string | null,
  "knockout": "pass" | "fail" | "unknown",
  "reason": string
}

Rules:
- Use the job description and role context below when judging knockout rules and whether an answer fits the role (do not invent JD facts).
- Judge by meaning in conversation context, NOT by format. Soft / informal / approximate answers that address the open question count as answers.
- answerType is only a storage hint for answerValue shape. NEVER set answersQuestion=false only because the reply is not a number, not yes/no, missing units (e.g. "days"), or not in a preferred format.
- If the open question asks about notice period, availability, or joining timeline, any clear availability signal answers it. Normalize answerValue to a short phrase that preserves their meaning.
- isNotAnAnswer=true ONLY when the reply does not address this question at all (pure engagement like willingness to chat/call, off-topic, or empty of relevant info).
- isCandidateQuestion=true when the candidate is mainly asking us something (they may also answer — set answersQuestion independently).
- answersQuestion and isNotAnAnswer must agree: if they addressed this question, answersQuestion=true and isNotAnAnswer=false.
- answerValue: concise normalized value when answersQuestion is true (keep their meaning; do not invent). null when answersQuestion is false.
- knockout: if a knockout rule is provided, evaluate against it using the answer AND job context (fail only when clearly matched). Otherwise "unknown".
- Prefer conversation context: the last recruiter message is usually the open question.
- If the recruiter's last message listed multiple numbered screening questions and the candidate replied with numbered lines (1., 2., 3.), map each line to the matching question by position and meaning.
- If Classifier extractedVariables already contains a value for id "${input.question.id}", treat it as a strong signal the candidate answered that question (still verify against the reply).

Campaign: ${input.campaignName || '(none)'}
Channel: ${input.channel || 'email'}
Classifier intent hint: ${input.intent || '(none)'}
Classifier extractedVariables: ${JSON.stringify(input.extractedVariables || {}).slice(0, 1500)}

All screening questions (for numbered-reply mapping):
${(input.allQuestions || [])
  .map((q, i) => `${i + 1}. [${q.id}] ${q.prompt}`)
  .join('\n') || '(single question)'}

Job & role context:
${String(input.jobContext || '').slice(0, 9000) || '(none)'}

Open screening question:
- id: ${input.question.id}
- prompt: ${input.question.prompt}
- answerType (storage hint only): ${input.question.answerType || '(unspecified)'}
- knockoutRule: ${knockoutRule}

Recent conversation (oldest first):
${historyLines || '(none)'}

Candidate's latest reply:
${reply.slice(0, 2000)}
`;

  try {
    const parsed = await callGeminiJson(
      prompt,
      (input.channel || 'email') === 'email' ? 'EVALUATE SCREENING ANSWER' : undefined
    );
    if (!parsed) return offline;

    const answersQuestion = Boolean(parsed.answersQuestion);
    const isNotAnAnswer =
      parsed.isNotAnAnswer === undefined ? !answersQuestion : Boolean(parsed.isNotAnAnswer);
    const isCandidateQuestion = Boolean(parsed.isCandidateQuestion);
    const knockoutRaw = String(parsed.knockout || 'unknown').toLowerCase();
    const knockout: 'pass' | 'fail' | 'unknown' =
      knockoutRaw === 'fail' || knockoutRaw === 'pass' ? knockoutRaw : 'unknown';

    // If the model refuses answersQuestion only for format reasons, it often still
    // sets isNotAnAnswer=false. Treat that as answered so we do not re-ask forever.
    const accepted =
      answersQuestion || (!isNotAnAnswer && !isCandidateQuestion && Boolean(reply));

    return {
      answersQuestion: accepted,
      isNotAnAnswer: accepted ? false : isNotAnAnswer,
      isCandidateQuestion,
      answerValue: accepted
        ? String(parsed.answerValue ?? reply).trim().slice(0, 2000) || reply
        : null,
      knockout,
      reason: String(parsed.reason || '').slice(0, 400),
      model: GEMINI_CONVERSATIONS_MODEL,
    };
  } catch {
    return offline;
  }
}

export type AssessQualificationCompleteInput = {
  jobContext: string;
  campaignName?: string | null;
  questions: Array<{
    id: string;
    prompt: string;
    answerType?: string | null;
    knockout?: boolean;
    knockoutCondition?: string | null;
    answer: string;
  }>;
  conversation?: Array<{ direction: 'inbound' | 'outbound'; bodyText: string }>;
  channel?: 'email' | 'whatsapp';
};

export type AssessQualificationCompleteResult = {
  outcome: 'qualified' | 'rejected';
  reason: string;
  failedQuestionId: string | null;
  model: string;
};

/**
 * Final Gemini pass: all screening answers + full JD → qualified vs rejected.
 */
export async function assessQualificationComplete(
  input: AssessQualificationCompleteInput
): Promise<AssessQualificationCompleteResult> {
  const offline: AssessQualificationCompleteResult = {
    outcome: 'qualified',
    reason: 'offline-fallback-all-answers-present',
    failedQuestionId: null,
    model: `${GEMINI_CONVERSATIONS_MODEL}-offline`,
  };

  const qaBlock = input.questions
    .map((q, i) => {
      const ko = q.knockout
        ? `knockout: ${String(q.knockoutCondition || 'enabled').slice(0, 200)}`
        : 'knockout: none';
      return `${i + 1}. [${q.id}] ${q.prompt}\n   answerType: ${q.answerType || '(unspecified)'}\n   ${ko}\n   candidateAnswer: ${q.answer.slice(0, 800)}`;
    })
    .join('\n\n');

  const historyLines = (input.conversation || [])
    .slice(-12)
    .map(
      (m) =>
        `${m.direction === 'inbound' ? 'Candidate' : 'Recruiter'}: ${String(
          m.bodyText || ''
        ).slice(0, 500)}`
    )
    .join('\n');

  const prompt = `You are a recruiting qualification assessor. Decide if the candidate PASSES screening for this role.
Return JSON only:
{
  "outcome": "qualified" | "rejected",
  "reason": string,
  "failedQuestionId": string | null
}

Rules:
- Use ONLY the job description / role context below plus the screening Q&A — do not invent requirements.
- outcome="rejected" ONLY when a knockout rule clearly fails OR an answer is clearly incompatible with stated JD must-haves.
- If answers are vague but not failing knockouts, outcome="qualified".
- failedQuestionId: id of the question that caused rejection, or null if qualified.
- reason: one short sentence for recruiters.

Campaign: ${input.campaignName || '(none)'}
Channel: ${input.channel || 'email'}

Job & role context:
${input.jobContext.slice(0, 9000)}

Screening questions and candidate answers:
${qaBlock || '(none)'}

Recent conversation (oldest first):
${historyLines || '(none)'}
`;

  try {
    const parsed = await callGeminiJson(
      prompt,
      (input.channel || 'email') === 'email' ? 'ASSESS QUALIFICATION COMPLETE' : undefined
    );
    if (!parsed) return offline;
    const outcomeRaw = String(parsed.outcome || 'qualified').toLowerCase();
    const outcome: 'qualified' | 'rejected' =
      outcomeRaw === 'rejected' ? 'rejected' : 'qualified';
    const failedQuestionId = parsed.failedQuestionId
      ? String(parsed.failedQuestionId).trim() || null
      : null;
    return {
      outcome,
      reason: String(parsed.reason || '').slice(0, 500) || offline.reason,
      failedQuestionId,
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
