/**
 * Roshni recruitment screening agent prompt — used as the default Hunar agent_prompt
 * for screening launches and outreach AI voice dials.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadOutreachJobContext } from '../outreach/job-context.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { resolveVoiceTokens } from './voice-dialer.service.js';

const TEMPLATE_PATH = join(dirname(fileURLToPath(import.meta.url)), 'roshni-prompt.md');

let cachedTemplate: string | null = null;

export function getRoshniPromptTemplate(): string {
  if (!cachedTemplate) {
    cachedTemplate = readFileSync(TEMPLATE_PATH, 'utf8');
  }
  return cachedTemplate;
}

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

export const ROSHNI_RESULT_PROMPT = `After the call, analyze the conversation and return only valid JSON.
Use only information explicitly stated during the conversation.
Determine whether the candidate was interested, requested a callback, or was not interested.

Return JSON in this format:
{
  "summary": "",
  "candidate_status": "",
  "interest_level": "",
  "callback_requested": "",
  "callback_time": "",
  "candidate_questions": [],
  "final_outcome": "",
  "experience": "",
  "relevant_experience": "",
  "skills_and_tools": "",
  "recent_project": "",
  "ctc": "",
  "expected_ctc": "",
  "notice_period": "",
  "location": "",
  "education": ""
}

FIELD RULES
- summary: under 50 words
- candidate_status: Confirmed Candidate, Wrong Person, Unable To Verify, or Call Disconnected
- interest_level: Interested, Not Interested, Requested Callback, or Unclear
- callback_requested: Yes or No
- callback_time: callback time or Not provided
- candidate_questions: array of strings from the conversation
- final_outcome: Interested, Not Interested, Callback Scheduled, Wrong Person, Incomplete Call, or Unable To Determine
- experience: total years of work experience
- relevant_experience: years of experience relevant to the role
- skills_and_tools: key skills, tools, or technologies mentioned
- recent_project: recent project or accomplishment described
- ctc: current CTC or salary
- expected_ctc: expected CTC or salary for this role
- notice_period: notice period or how soon they can join
- location: current location
- education: highest educational qualification`;

export const ROSHNI_RESULT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    candidate_status: { type: 'string' },
    interest_level: { type: 'string' },
    callback_requested: { type: 'string' },
    callback_time: { type: 'string' },
    candidate_questions: { type: 'array', items: { type: 'string' } },
    final_outcome: { type: 'string' },
    experience: { type: 'string' },
    relevant_experience: { type: 'string' },
    skills_and_tools: { type: 'string' },
    recent_project: { type: 'string' },
    ctc: { type: 'string' },
    expected_ctc: { type: 'string' },
    notice_period: { type: 'string' },
    location: { type: 'string' },
    education: { type: 'string' },
  },
};

export type RoshniQuestion = { id?: string; prompt: string };

function clip(text: string, max: number): string {
  const t = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function normalizeQuestions(questions?: RoshniQuestion[] | string[] | null): string[] {
  const fromInput = (questions || [])
    .map((q) => (typeof q === 'string' ? q : String(q?.prompt || '').trim()))
    .filter(Boolean);
  // Campaign / screening questions win as-is (cap 12). Defaults only when none provided.
  if (fromInput.length > 0) return fromInput.slice(0, 12);
  return [...DEFAULT_ROSHNI_QUESTIONS];
}

/** Pull outreach qualification questions into the Roshni voice prompt shape. */
export function qualificationQuestionsForRoshni(
  config:
    | {
        questions?: Array<{
          prompt?: string | null;
          knockout?: boolean;
          knockoutCondition?: string | null;
        }> | null;
      }
    | null
    | undefined
): RoshniQuestion[] {
  return (config?.questions || [])
    .map((q) => {
      const prompt = String(q.prompt || '').trim();
      if (!prompt) return null;
      if (q.knockout && String(q.knockoutCondition || '').trim()) {
        return {
          prompt: `${prompt} [Internal knockout — do not read aloud: ${String(q.knockoutCondition).trim()}]`,
        };
      }
      return { prompt };
    })
    .filter((q): q is RoshniQuestion => Boolean(q?.prompt));
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

  const questions = normalizeQuestions(input.questions);
  const questionList = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  const callFlowSteps = questions
    .map((q, i) => {
      const stepNum = i + 4;
      const next =
        i === questions.length - 1 ? 'the closing step' : `Step ${stepNum + 1}`;
      return `${stepNum}. SCREENING Q${i + 1} — Ask: "${q}" Wait for the full answer. Max two probes if vague. Then go to ${next}.`;
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
    ? `- Company name: ${company}\n- You may say you are calling on behalf of ${company}, but keep early disclosure light until screening progresses.`
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
        ? `Ask these ${questions.length} screening question(s) in order. If an answer is vague, ask at most two short clarifying probes, then move on. Apply any internal knockout notes silently — never read knockout rules aloud.`
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
  const tokens = await buildRoshniJdTokens(input);
  const agentPrompt = resolveVoiceTokens(getRoshniPromptTemplate(), tokens);
  const role = tokens.jd_role_screening_label || 'this role';
  const questionCount = tokens.jd_screening_questions_list
    ? tokens.jd_screening_questions_list.split('\n').filter(Boolean).length
    : DEFAULT_ROSHNI_QUESTIONS.length;
  return {
    agentPrompt,
    objective: `Screen the candidate for the ${role}${tokens.jd_company_at_clause} — confirm identity and timing, deliver the role brief, ask ${questionCount} screening question(s), and close with next steps.`,
    introduction: ROSHNI_INTRODUCTION,
    resultPrompt: ROSHNI_RESULT_PROMPT,
    resultSchema: ROSHNI_RESULT_SCHEMA,
    tokens,
  };
}
