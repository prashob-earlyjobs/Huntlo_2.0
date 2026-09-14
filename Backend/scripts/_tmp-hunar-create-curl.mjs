import { readFileSync, writeFileSync } from 'node:fs';

const TEMPLATE_PATH = new URL('../src/modules/voice/roshni-prompt.md', import.meta.url);
const TS_PATH = new URL('../src/modules/voice/roshni-prompt.ts', import.meta.url);
const agentTemplate = readFileSync(TEMPLATE_PATH, 'utf8');
const ts = readFileSync(TS_PATH, 'utf8');
const ROSHNI_RESULT_PROMPT = ts.split('export const ROSHNI_RESULT_PROMPT = `')[1].split('`;')[0];

const DEFAULT_ROSHNI_QUESTIONS = [
  'How many years of total work experience do you have?',
  'How many years of experience do you have that is relevant to this role?',
  'Which key skills, tools, or technologies are you strongest in for this role?',
  'Can you briefly share a recent project or accomplishment you are proud of?',
  'What is your current CTC?',
  'What is your expected CTC for this role?',
  'What is your notice period, or how soon can you join?',
  'Where are you currently located, and what is your highest educational qualification?',
];

const role = 'this open role';
const entries = DEFAULT_ROSHNI_QUESTIONS.map((spoken) => ({ spoken, guidance: '' }));
const questions = entries.map((q) => q.spoken);
const questionList = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
const callFlowSteps = entries
  .map((q, i) => {
    const stepNum = i + 4;
    const next = i === entries.length - 1 ? 'the closing step' : `Step ${stepNum + 1}`;
    return `${stepNum}. SCREENING Q${i + 1} — Ask: "${q.spoken}" Wait for the full answer. Max two probes if vague. Then go to ${next}.`;
  })
  .join('\n\n');

const tokens = {
  jd_role_screening_header: `Screening for ${role}`,
  jd_role_screening_label: role,
  jd_company_at_clause: '',
  jd_company_on_behalf_clause: '',
  jd_company_from_clause: '',
  jd_company_se_clause: '',
  jd_company_mein_clause: '',
  jd_role_opening_phrase: `an opening for ${role}`,
  jd_role_opportunity_phrase: `a ${role} opportunity`,
  jd_role_candidate_screening_line: `the ${role} role`,
  jd_role_referral_phrase: `the ${role} role`,
  jd_role_hindi_opportunity: role,
  jd_role_hindi_opening: role,
  jd_role_hindi_referral: role,
  jd_role_brief_spoken: `This is a screening for the ${role} opportunity. `,
  jd_role_involves_response: `You'll work closely with the team on day-to-day responsibilities for the ${role} role. The hiring team will share the full JD in the next round.`,
  jd_company_kb_section:
    '- Company name is not specified in the system. Do not invent a company name. Prefer "we" / "our hiring team".',
  jd_role_details_kb_section: `### Role Details\n- Role title: ${role}`,
  jd_screening_questions_list: questionList,
  jd_screening_call_flow_steps: callFlowSteps,
  jd_screening_probes_section: `Ask these ${questions.length} screening question(s) in order. If an answer is vague, ask at most two short clarifying probes (or use any follow-up guidance on that question), then move on. Apply any internal notes (knockouts, required flags, capture keys) silently — never read them aloud.`,
  job_title: role,
  job_description: '',
  company_name: '',
};

function resolveVoiceTokens(template, map) {
  let out = String(template || '');
  const replaceKey = (key, match, dropIfMissing) => {
    const normalized =
      key === 'first_name' || key === 'candidate_name' || key === 'name' ? 'callee_name' : key;
    if (normalized === 'callee_name') return '{callee_name}';
    const value = map[normalized] ?? map[key];
    if (value != null && String(value).length) return String(value);
    return dropIfMissing ? '' : match;
  };
  out = out.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) =>
    replaceKey(String(key), match, true)
  );
  out = out.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) =>
    replaceKey(String(key), match, false)
  );
  out = out.replace(/\{([^{}]+)\}/g, (match, inner) => {
    const key = String(inner).trim();
    if (key === 'callee_name') return '{callee_name}';
    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) return '';
    return key;
  });
  return out.replace(/\{\}/g, '');
}

const payload = {
  name: 'Screening Voice Agent',
  voice_persona: 'NEHA',
  objective: `Screen the candidate for the ${role} — confirm identity and timing, get screening consent, ask 8 screening question(s), and close with next steps.`,
  result_prompt: resolveVoiceTokens(ROSHNI_RESULT_PROMPT, tokens),
  result_schema: {
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
  },
  language: 'ENGLISH',
  persona_name: 'Roshni',
  agent_prompt: resolveVoiceTokens(agentTemplate, tokens),
  introduction: 'Hello, am I speaking with {callee_name}?',
};

const json = JSON.stringify(payload);
const curl = `curl.exe -X POST "https://api.voice.hunar.ai/external/v1/agents/" -H "Content-Type: application/json" -H "Accept: application/json" -H "X-API-Key: YOUR_HUNAR_API_KEY" -d ${JSON.stringify(json)}`;

writeFileSync(new URL('./_tmp-hunar-create.curl.txt', import.meta.url), curl);
process.stdout.write(
  JSON.stringify({
    jsonLen: json.length,
    curlLen: curl.length,
    hasCallee: payload.agent_prompt.includes('{callee_name}'),
    leftoverTokens: [...payload.agent_prompt.matchAll(/\{[a-zA-Z0-9_]+\}/g)].map((m) => m[0]),
  })
);
