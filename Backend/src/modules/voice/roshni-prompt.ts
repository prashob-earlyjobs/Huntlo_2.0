/**
 * Roshni recruitment screening agent prompt — used as the default Hunar agent_prompt
 * for screening launches and outreach AI voice dials.
 *
 * Active defaults resolve DB-first from platform settings, then fall back to the
 * bundled markdown file. Per-screening / per-campaign custom snapshots are unchanged.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PlatformSettingsModel } from '../admin/platform-settings.model.js';
import { loadOutreachJobContext } from '../outreach/job-context.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { resolveVoiceTokens } from './voice-dialer.service.js';

const TEMPLATE_PATH = join(dirname(fileURLToPath(import.meta.url)), 'roshni-prompt.md');

const CACHE_TTL_MS = 60_000;

let bundledTemplate: string | null = null;
let activeCache: {
  introduction: string;
  agentPrompt: string;
  version: number;
  introductionSource: 'db' | 'file';
  agentPromptSource: 'db' | 'file';
  loadedAt: number;
} | null = null;

/** Bundled opening line — also used as the sync constant for offline / static fallbacks. */
export const ROSHNI_INTRODUCTION = 'Hello, am I speaking with {callee_name}?';

export const DEFAULT_ROSHNI_QUESTIONS = [
  'How many years of total work experience do you have?',
  'How many years of experience do you have that is relevant to this role?',
  'Which key skills, tools, or technologies are you strongest in for this role?',
  'Can you briefly share a recent project or accomplishment you are proud of?',
  'What is your current CTC?',
  'What is your expected CTC for this role?',
  'What is your notice period, or how soon can you join?',
  'Where are you currently located, and what is your highest educational qualification?',
] as const;

/**
 * Post-call evaluation prompt sent to Hunar as `result_prompt`.
 * Placeholders `{jd_role_screening_label}` / `{jd_company_at_clause}` are filled at launch.
 */
export const ROSHNI_RESULT_PROMPT = `You are a Call Evaluation AI responsible for analyzing screening calls conducted by Roshni for the {jd_role_screening_label}{jd_company_at_clause}.

Your task is to extract and evaluate the candidate's responses strictly based on what was explicitly stated during the conversation.

Do not infer.
Do not guess.
Do not paraphrase candidate answers for screening questions.
For all screening question fields, capture the candidate's answer in verbatim as closely as possible.
If any detail is missing, write: Not Mentioned.

ERROR HANDLING (CHECK FIRST)

If:
- the candidate did not meaningfully engage, OR
- the call ended before screening could begin, OR
- the transcript/audio is too unclear to evaluate

Output ONLY:

NOT ENGAGED

Do not output anything else.

OUTPUT INSTRUCTIONS

Return output in valid JSON only.
Do not add explanation outside the JSON.
Do not use markdown.
Do not add any extra keys beyond the ones defined below.

FIELD RULES

summary
- Write a concise factual summary in 3 to 4 sentences.
- Cover:
  - whether the candidate engaged
  - whether the candidate showed interest
  - whether the screening was completed or ended early
  - whether the candidate appears eligible based only on explicit responses

interest_level
Use only one of:
- Interested
- Not Interested
- Unsure
- Callback Requested
- Not Mentioned

If the candidate requested a callback, mark interest_level as Callback Requested.

callback_requested
Use only:
- Yes
- No
- Not Mentioned

Mark Yes only if the candidate explicitly requested another call or provided another suitable time.

callback_time
Capture the candidate's exact callback date/time in verbatim.
If callback requested but no specific time was given: Requested but time not specified
Otherwise: Not Mentioned

candidate_status
Use only one of:
- Confirmed Candidate
- Wrong Person
- Unable To Verify
- Call Disconnected
- Not Mentioned

final_outcome
Use only one of:
- Interested
- Not Interested
- Callback Scheduled
- Wrong Person
- Incomplete Call
- Unable To Determine

role_interest_confirmation
Capture the candidate's answer in verbatim confirming whether they are interested in or open to the {jd_role_screening_label}{jd_company_at_clause}.

experience
Capture the candidate's answer in verbatim for total years of work experience.

relevant_experience
Capture the candidate's answer in verbatim for experience relevant to this role.
Include years and domain exactly as stated.

skills_and_tools
Capture the candidate's answer in verbatim for key skills, tools, or technologies.

recent_project
Capture the candidate's answer in verbatim for a recent project or accomplishment.

ctc
Capture the candidate's current CTC/salary answer in verbatim.
If the candidate declines to answer: Declined
Otherwise if missing: Not Mentioned

expected_ctc
Capture the candidate's expected CTC/salary answer in verbatim.
Do not normalize or negotiate the figure.
If the candidate declines to answer: Declined
Otherwise if missing: Not Mentioned

notice_period
Capture the candidate's answer in verbatim for notice period or joining availability.

location
Capture the candidate's current location answer in verbatim.
If education was answered in the same response, also populate education separately.

education
Capture the candidate's highest educational qualification in verbatim.

candidate_questions
Array of strings — questions the candidate explicitly asked during the call. Use [] if none.

ELIGIBILITY SCORE (eligibility_score)
Give a score from:
5 = Strong fit based on explicit responses
4 = Mostly suitable with one minor concern
3 = Partial fit or multiple important details missing
2 = Weak fit based on explicit responses
1 = Clearly unsuitable based on explicit responses

Consider only what was explicitly confirmed regarding:
- Relevant experience
- Skills and role fit
- Interest in the role
- Location / availability
- Salary alignment (only if discussed)
- Notice period / joining timeline (only if discussed)

ELIGIBILITY REASON (eligibility_reason)
Provide a short factual explanation based only on explicit responses.

Examples:
- Candidate has relevant experience, confirmed interest, shared notice period, and location aligns with the role.
- Candidate has relevant experience but expects a significantly higher salary than discussed for the role.
- Candidate has no relevant experience and is not interested in the role.

STRICT RULES
- Extract only information explicitly stated during the call.
- Never infer missing information.
- Keep all screening answers in verbatim.
- Do not paraphrase candidate responses.
- Do not judge communication skills, confidence, tone, or personality.
- Do not include recruiter statements unless explicitly confirmed by the candidate.
- If the candidate requested a callback, mark interest_level as Callback Requested.
- If the call ended early, populate only completed fields and mark the remaining fields as Not Mentioned.
- If the candidate answered a later screening question earlier in the conversation, populate the appropriate field accordingly.
- If the candidate declined to answer any screening question, capture Declined where applicable.
- Ignore explanations provided by the recruiter unless the candidate explicitly agreed or responded to them.`;

export const ROSHNI_RESULT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    interest_level: { type: 'string' },
    callback_requested: { type: 'string' },
    callback_time: { type: 'string' },
    candidate_status: { type: 'string' },
    final_outcome: { type: 'string' },
    role_interest_confirmation: { type: 'string' },
    experience: { type: 'string' },
    relevant_experience: { type: 'string' },
    skills_and_tools: { type: 'string' },
    recent_project: { type: 'string' },
    ctc: { type: 'string' },
    expected_ctc: { type: 'string' },
    notice_period: { type: 'string' },
    location: { type: 'string' },
    education: { type: 'string' },
    candidate_questions: { type: 'array', items: { type: 'string' } },
    eligibility_score: { type: 'string' },
    eligibility_reason: { type: 'string' },
  },
};

export type RoshniQuestion = {
  id?: string;
  prompt: string;
  followUp?: string | null;
  required?: boolean;
  expectedVariable?: string | null;
  knockout?: boolean;
  knockoutCondition?: string | null;
};

export type ActiveRoshniPromptDefaults = {
  introduction: string;
  agentPrompt: string;
  version: number;
  introductionSource: 'db' | 'file';
  agentPromptSource: 'db' | 'file';
  source: 'db' | 'file' | 'mixed';
};

/** Required tokens for admin-saved agent prompts (must remain provider-compatible). */
export const ROSHNI_AGENT_PROMPT_REQUIRED_PLACEHOLDERS = [
  '{callee_name}',
  '{jd_role_screening_label}',
  '{jd_screening_questions_list}',
] as const;

export function getBundledRoshniPromptTemplate(): string {
  if (!bundledTemplate) {
    bundledTemplate = readFileSync(TEMPLATE_PATH, 'utf8');
  }
  return bundledTemplate;
}

/** Sync file-only template — prefer `getActiveRoshniPromptDefaults` / async getters at runtime. */
export function getRoshniPromptTemplate(): string {
  return getBundledRoshniPromptTemplate();
}

export function invalidateRoshniPromptCache(): void {
  activeCache = null;
}

function normalizeStored(value: string | null | undefined): string | null {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function loadActiveDefaults(): Promise<ActiveRoshniPromptDefaults> {
  const now = Date.now();
  if (activeCache && now - activeCache.loadedAt < CACHE_TTL_MS) {
    const source =
      activeCache.introductionSource === activeCache.agentPromptSource
        ? activeCache.introductionSource
        : 'mixed';
    return {
      introduction: activeCache.introduction,
      agentPrompt: activeCache.agentPrompt,
      version: activeCache.version,
      introductionSource: activeCache.introductionSource,
      agentPromptSource: activeCache.agentPromptSource,
      source,
    };
  }

  const bundledAgent = getBundledRoshniPromptTemplate();
  let introduction = ROSHNI_INTRODUCTION;
  let agentPrompt = bundledAgent;
  let version = 0;
  let introductionSource: 'db' | 'file' = 'file';
  let agentPromptSource: 'db' | 'file' = 'file';

  try {
    const doc = await PlatformSettingsModel.findOne({ singletonKey: 'platform' })
      .select('roshniPrompt')
      .lean();
    const stored = doc?.roshniPrompt as
      | { introduction?: string | null; agentPrompt?: string | null; version?: number }
      | null
      | undefined;
    if (stored) {
      version = Number(stored.version || 0);
      const dbIntro = normalizeStored(stored.introduction);
      const dbAgent = normalizeStored(stored.agentPrompt);
      if (dbIntro) {
        introduction = dbIntro;
        introductionSource = 'db';
      }
      if (dbAgent) {
        agentPrompt = dbAgent;
        agentPromptSource = 'db';
      }
    }
  } catch {
    // Mongo unavailable — keep bundled file defaults.
  }

  activeCache = {
    introduction,
    agentPrompt,
    version,
    introductionSource,
    agentPromptSource,
    loadedAt: now,
  };

  const source =
    introductionSource === agentPromptSource ? introductionSource : 'mixed';

  return {
    introduction,
    agentPrompt,
    version,
    introductionSource,
    agentPromptSource,
    source,
  };
}

export async function getActiveRoshniPromptDefaults(): Promise<ActiveRoshniPromptDefaults> {
  return loadActiveDefaults();
}

export async function getActiveRoshniIntroduction(): Promise<string> {
  const defaults = await loadActiveDefaults();
  return defaults.introduction;
}

export async function getActiveRoshniPromptTemplate(): Promise<string> {
  const defaults = await loadActiveDefaults();
  return defaults.agentPrompt;
}

export function missingRoshniPlaceholders(prompt: string): string[] {
  return ROSHNI_AGENT_PROMPT_REQUIRED_PLACEHOLDERS.filter(
    (token) => !prompt.includes(token)
  );
}

function clip(text: string, max: number): string {
  const t = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

type NormalizedVoiceQuestion = {
  spoken: string;
  /** Internal agent guidance — not spoken verbatim. */
  guidance: string;
};

/** Build spoken + internal guidance from a screening / outreach question. */
export function formatRoshniQuestionParts(
  question: RoshniQuestion | string
): NormalizedVoiceQuestion | null {
  if (typeof question === 'string') {
    const spoken = question.trim();
    return spoken ? { spoken, guidance: '' } : null;
  }

  const spoken = String(question.prompt || '').trim();
  if (!spoken) return null;

  const notes: string[] = [];
  if (question.knockout && String(question.knockoutCondition || '').trim()) {
    notes.push(
      `Internal knockout — do not read aloud: ${String(question.knockoutCondition).trim()}`
    );
  }
  const followUp = String(question.followUp || '').trim();
  if (followUp) {
    notes.push(`Follow-up if vague — do not read as a scripted line: ${followUp}`);
  }
  if (question.required) {
    notes.push('Required — get a clear answer before moving on');
  }
  const expectedVariable = String(question.expectedVariable || '').trim();
  if (expectedVariable) {
    notes.push(`Capture answer as ${expectedVariable}`);
  }

  return { spoken, guidance: notes.join('. ') };
}

/** Single-line form used in the screening questions list token. */
export function formatRoshniQuestionForList(question: RoshniQuestion | string): string {
  const parts = formatRoshniQuestionParts(question);
  if (!parts) return '';
  return parts.guidance ? `${parts.spoken} [${parts.guidance}]` : parts.spoken;
}

function normalizeQuestionEntries(
  questions?: RoshniQuestion[] | string[] | null
): NormalizedVoiceQuestion[] {
  const fromInput = (questions || [])
    .map((q) => formatRoshniQuestionParts(q))
    .filter((q): q is NormalizedVoiceQuestion => Boolean(q?.spoken));
  // Campaign / screening questions win as-is (cap 12). Defaults only when none provided.
  if (fromInput.length > 0) return fromInput.slice(0, 12);
  return DEFAULT_ROSHNI_QUESTIONS.map((spoken) => ({ spoken, guidance: '' }));
}

/** Pull outreach qualification questions into the Roshni voice prompt shape. */
export function qualificationQuestionsForRoshni(
  config:
    | {
        questions?: Array<{
          id?: string | null;
          prompt?: string | null;
          followUp?: string | null;
          required?: boolean;
          expectedVariable?: string | null;
          knockout?: boolean;
          knockoutCondition?: string | null;
        }> | null;
      }
    | null
    | undefined
): RoshniQuestion[] {
  return (config?.questions || [])
    .map((q): RoshniQuestion | null => {
      const prompt = String(q.prompt || '').trim();
      if (!prompt) return null;
      const id = String(q.id || '').trim();
      return {
        ...(id ? { id } : {}),
        prompt,
        followUp: q.followUp ?? null,
        required: Boolean(q.required),
        expectedVariable: q.expectedVariable ?? null,
        knockout: Boolean(q.knockout),
        knockoutCondition: q.knockoutCondition ?? null,
      };
    })
    .filter((q): q is RoshniQuestion => q != null);
}

export async function buildRoshniJdTokens(input: {
  jobId?: string | null;
  organizationId?: string | null;
  campaignName?: string | null;
  questions?: RoshniQuestion[] | string[] | null;
}): Promise<Record<string, string>> {
  const [job, org] = await Promise.all([
    loadOutreachJobContext(input.jobId || null),
    input.organizationId
      ? OrganizationModel.findById(input.organizationId).select('name').lean()
      : null,
  ]);

  const role =
    job.title ||
    String(input.campaignName || '').trim() ||
    'this open role';
  const company = String(org?.name || '').trim();
  const hasCompany = Boolean(company);

  const entries = normalizeQuestionEntries(input.questions);
  const questions = entries.map((q) =>
    q.guidance ? `${q.spoken} [${q.guidance}]` : q.spoken
  );
  const questionList = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  const callFlowSteps = entries
    .map((q, i) => {
      const stepNum = i + 4;
      const next =
        i === entries.length - 1 ? 'the closing step' : `Step ${stepNum + 1}`;
      const guidance = q.guidance
        ? ` ${q.guidance}.`
        : ' Max two probes if vague.';
      return `${stepNum}. SCREENING Q${i + 1} — Ask: "${q.spoken}" Wait for the full answer.${guidance} Then go to ${next}.`;
    })
    .join('\n\n');

  const briefBits = [
    job.experienceRange ? `We're looking for about ${job.experienceRange} of experience.` : '',
    job.requiredSkills.length
      ? `Key skills include ${job.requiredSkills.slice(0, 6).join(', ')}.`
      : '',
    job.locations.length ? `The role is based in ${job.locations.slice(0, 3).join(', ')}.` : '',
    job.workplaceType ? `Work mode is ${job.workplaceType}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const roleBrief =
    briefBits ||
    (job.description
      ? clip(job.description, 280)
      : `This is a screening for the ${role} opportunity.`);

  const involves =
    job.requirements.length > 0
      ? clip(job.requirements.slice(0, 4).join('. '), 320)
      : job.description
        ? clip(job.description, 320)
        : `You'll work closely with the team on day-to-day responsibilities for the ${role} role. The hiring team will share the full JD in the next round.`;

  const companyKb = hasCompany
    ? `- Company name: ${company}\n- Do not explain company/role/salary details before screening consent. If asked early, defer to the recruitment team after screening.`
    : `- Company name is not specified in the system. Do not invent a company name. Prefer "we" / "our hiring team".`;

  const roleKb = [
    `- Role title: ${role}`,
    job.experienceRange ? `- Experience: ${job.experienceRange}` : null,
    job.requiredSkills.length
      ? `- Skills: ${job.requiredSkills.slice(0, 12).join(', ')}`
      : null,
    job.locations.length ? `- Locations: ${job.locations.join(', ')}` : null,
    job.workplaceType ? `- Workplace: ${job.workplaceType}` : null,
    job.salaryRange ? `- Salary band (internal only — do not quote unless asked via objection handling): ${job.salaryRange}` : null,
    job.description ? `- JD summary: ${clip(job.description, 1200)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    jd_role_screening_header: `Screening for ${role}`,
    jd_role_screening_label: role,
    jd_company_at_clause: hasCompany ? ` at ${company}` : '',
    jd_company_on_behalf_clause: hasCompany ? ` calling on behalf of ${company}` : '',
    jd_company_from_clause: hasCompany ? ` from ${company}` : '',
    jd_company_se_clause: hasCompany ? ` ${company} से` : '',
    jd_company_mein_clause: hasCompany ? ` ${company} में` : '',
    jd_role_opening_phrase: `an opening for ${role}`,
    jd_role_opportunity_phrase: `a ${role} opportunity`,
    jd_role_candidate_screening_line: `the ${role} role`,
    jd_role_referral_phrase: `the ${role} role`,
    jd_role_hindi_opportunity: role,
    jd_role_hindi_opening: role,
    jd_role_hindi_referral: role,
    jd_role_brief_spoken: `${roleBrief} `,
    jd_role_involves_response: involves,
    jd_company_kb_section: companyKb,
    jd_role_details_kb_section: `### Role Details\n${roleKb}`,
    jd_screening_questions_list: questionList,
    jd_screening_call_flow_steps: callFlowSteps,
    jd_screening_probes_section:
      questions.length > 0
        ? `Ask these ${questions.length} screening question(s) in order. If an answer is vague, ask at most two short clarifying probes (or use any follow-up guidance on that question), then move on. Apply any internal notes (knockouts, required flags, capture keys) silently — never read them aloud.`
        : 'If an answer is vague, ask at most two short clarifying probes, then move on.',
    job_title: role,
    job_description: job.description || '',
    company_name: company,
  };
}

export async function buildRoshniAgentPrompt(input: {
  jobId?: string | null;
  organizationId?: string | null;
  campaignName?: string | null;
  questions?: RoshniQuestion[] | string[] | null;
}): Promise<{
  agentPrompt: string;
  objective: string;
  introduction: string;
  resultPrompt: string;
  resultSchema: Record<string, unknown>;
  tokens: Record<string, string>;
}> {
  const [tokens, defaults] = await Promise.all([
    buildRoshniJdTokens(input),
    loadActiveDefaults(),
  ]);
  const agentPrompt = resolveVoiceTokens(defaults.agentPrompt, tokens);
  const role = tokens.jd_role_screening_label || 'this role';
  const questionCount = tokens.jd_screening_questions_list
    ? tokens.jd_screening_questions_list.split('\n').filter(Boolean).length
    : DEFAULT_ROSHNI_QUESTIONS.length;
  return {
    agentPrompt,
    objective: `Screen the candidate for the ${role}${tokens.jd_company_at_clause} — confirm identity and timing, get screening consent, ask ${questionCount} screening question(s), and close with next steps.`,
    introduction: defaults.introduction,
    resultPrompt: resolveVoiceTokens(ROSHNI_RESULT_PROMPT, {
      ...tokens,
      jd_role_screening_label: tokens.jd_role_screening_label || 'this role',
      jd_company_at_clause: tokens.jd_company_at_clause || '',
    }),
    resultSchema: ROSHNI_RESULT_SCHEMA,
    tokens,
  };
}
