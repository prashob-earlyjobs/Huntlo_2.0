import { getEnv } from '../../config/env.js';
import type { OutreachChannel, TemplateCategory } from '../../modules/outreach/outreach-template.model.js';
import { extractVariables } from '../../modules/outreach/variables.js';

export const GEMINI_OUTREACH_MODEL = 'gemini-2.5-flash';

export type OutreachAiAction =
  | 'generate_sequence'
  | 'rewrite'
  | 'change_tone'
  | 'shorten'
  | 'personalize'
  | 'qualification_questions';

export type OutreachAiDraftMeta = {
  isDraft: true;
  action: OutreachAiAction;
  model: string;
  generatedAt: string;
  summary: string;
  /** Always false — AI never launches campaigns. */
  autoLaunch: false;
};

export type GeneratedMessageDraft = {
  name: string;
  channel: OutreachChannel;
  category: TemplateCategory;
  subject: string | null;
  body: string;
  variables: string[];
  language: string;
  status: 'draft';
  generation: OutreachAiDraftMeta;
};

export type GeneratedSequenceDraft = {
  name: string;
  channels: OutreachChannel[];
  steps: Array<{
    id: string;
    order: number;
    type: string;
    channel: OutreachChannel | 'wait' | null;
    delayDays: number;
    subject: string | null;
    body: string | null;
    stopOnReply: boolean;
    note: string | null;
  }>;
  qualificationConfig: {
    enabled: boolean;
    questions: Array<{ id: string; prompt: string; answerType: string; knockout?: boolean }>;
    aiReplyEnabled: boolean;
  };
  schedulingConfig: {
    enabled: boolean;
    provider: string | null;
    eventTypeUri: string | null;
    messageTemplateId: string | null;
  };
  status: 'draft';
  generation: OutreachAiDraftMeta;
};

function meta(action: OutreachAiAction, summary: string, model = GEMINI_OUTREACH_MODEL): OutreachAiDraftMeta {
  return {
    isDraft: true,
    action,
    model,
    generatedAt: new Date().toISOString(),
    summary: summary.slice(0, 240),
    autoLaunch: false,
  };
}

function withVariables(subject: string | null, body: string) {
  return {
    subject,
    body,
    variables: extractVariables(subject, body),
  };
}

/** Deterministic offline drafts when GEMINI_API_KEY is unset (tests + local). */
function offlineRewrite(input: {
  action: OutreachAiAction;
  body: string;
  subject?: string | null;
  tone?: string;
  channel?: OutreachChannel;
  category?: TemplateCategory;
}): GeneratedMessageDraft {
  const channel = input.channel || 'email';
  const category = input.category || 'follow_up';
  let body = input.body.trim();
  let subject = input.subject ?? null;

  switch (input.action) {
    case 'shorten':
      body = body.split('\n').filter(Boolean).slice(0, 4).join('\n\n');
      break;
    case 'change_tone': {
      const tone = (input.tone || 'professional').toLowerCase();
      body = `[${tone} tone]\n\n${body}`;
      break;
    }
    case 'personalize':
      if (!body.includes('{{first_name}}')) {
        body = `Hi {{first_name}},\n\n${body}`;
      }
      break;
    case 'rewrite':
    default:
      body = body.replace(/\s+/g, ' ').trim();
      if (channel === 'email' && subject) {
        subject = subject.replace(/\s+/g, ' ').trim();
      }
      break;
  }

  const vars = withVariables(subject, body);
  return {
    name: 'AI draft message',
    channel,
    category,
    ...vars,
    language: 'en',
    status: 'draft',
    generation: meta(input.action, `Offline ${input.action} draft`),
  };
}

function offlineGenerateSequence(input: {
  jobTitle?: string;
  objective?: string;
  channels?: OutreachChannel[];
}): GeneratedSequenceDraft {
  const job = input.jobTitle || '{{job_title}}';
  const channels = input.channels?.length
    ? input.channels
    : (['email', 'whatsapp'] as OutreachChannel[]);

  const emailBody =
    `Hi {{first_name}},\n\nWe're hiring a ${job} at {{company_name}} in {{location}}. ` +
    `Your experience at {{current_company}} as {{current_role}} stood out.\n\n` +
    `Open to a quick chat?\n\n{{recruiter_name}}`;

  const waBody =
    `Hi {{first_name}}, following up on the ${job} role — happy to share details here. – {{recruiter_name}}`;

  const steps: GeneratedSequenceDraft['steps'] = [
    {
      id: 'step-1',
      order: 0,
      type: 'Send Email',
      channel: 'email',
      delayDays: 0,
      subject: `Quick question about ${job}, {{first_name}}`,
      body: emailBody,
      stopOnReply: true,
      note: null,
    },
    {
      id: 'step-2',
      order: 1,
      type: 'Wait',
      channel: 'wait',
      delayDays: 2,
      subject: null,
      body: null,
      stopOnReply: false,
      note: 'Wait before WhatsApp follow-up',
    },
  ];

  if (channels.includes('whatsapp')) {
    steps.push({
      id: 'step-3',
      order: 2,
      type: 'Send WhatsApp',
      channel: 'whatsapp',
      delayDays: 0,
      subject: null,
      body: waBody,
      stopOnReply: true,
      note: null,
    });
  }

  if (channels.includes('ai_voice')) {
    steps.push({
      id: 'step-voice',
      order: steps.length,
      type: 'Start AI Voice Call',
      channel: 'ai_voice',
      delayDays: 1,
      subject: null,
      body:
        `Introduce yourself for {{recruiter_name}} at {{company_name}}. Confirm interest in ${job}, ` +
        `notice period, and compensation. Close by offering a recruiter call.`,
      stopOnReply: false,
      note: null,
    });
  }

  return {
    name: `Draft sequence — ${job}`.slice(0, 160),
    channels: channels,
    steps,
    qualificationConfig: {
      enabled: true,
      questions: [
        {
          id: 'q1',
          prompt: 'What is your notice period in days?',
          answerType: 'number',
          knockout: true,
        },
        {
          id: 'q2',
          prompt: 'Are you open to working in {{location}}?',
          answerType: 'yes_no',
          knockout: true,
        },
      ],
      aiReplyEnabled: true,
    },
    schedulingConfig: {
      enabled: true,
      provider: 'calendly',
      eventTypeUri: null,
      messageTemplateId: null,
    },
    status: 'draft',
    generation: meta(
      'generate_sequence',
      `Offline sequence draft for ${job}`,
      'offline-draft'
    ),
  };
}

function offlineQualificationQuestions(jobTitle?: string, jobContext?: string) {
  const job = jobTitle || '{{job_title}}';
  const locationHint = /\b(remote|hybrid|onsite|bengaluru|bangalore|mumbai|delhi|pune|hyderabad)\b/i.exec(
    jobContext || ''
  )?.[1];
  return {
    questions: [
      {
        id: 'q1',
        prompt: `How many years of experience do you have relevant to ${job}?`,
        answerType: 'Number',
        knockout: true,
        knockoutCondition: 'Reject if less than 2',
      },
      {
        id: 'q2',
        prompt: 'What is your notice period in days?',
        answerType: 'Number',
        knockout: true,
        knockoutCondition: 'Reject if more than 90',
      },
      {
        id: 'q3',
        prompt: locationHint
          ? `Are you open to ${locationHint} work for this ${job} role?`
          : `Are you open to the work location / workplace type for this ${job} role?`,
        answerType: 'Yes / No',
        knockout: true,
        knockoutCondition: 'Reject if No',
      },
      {
        id: 'q4',
        prompt: 'What is your expected annual compensation?',
        answerType: 'Short text',
        knockout: false,
        knockoutCondition: null,
      },
    ],
    generation: meta('qualification_questions', 'Offline qualification questions draft', 'offline-draft'),
  };
}

async function callGeminiJson(prompt: string): Promise<string | null> {
  const apiKey = getEnv().GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_OUTREACH_MODEL}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

/**
 * Rewrite / tone / shorten / personalize a message. Always returns a draft.
 * Preserves {{allowed}} variables when possible; caller must validate before save.
 */
export async function rewriteOutreachMessage(input: {
  action: Exclude<OutreachAiAction, 'generate_sequence' | 'qualification_questions'>;
  body: string;
  subject?: string | null;
  tone?: string;
  channel?: OutreachChannel;
  category?: TemplateCategory;
  instructions?: string;
}): Promise<GeneratedMessageDraft> {
  const offline = offlineRewrite(input);

  const raw = await callGeminiJson(
    [
      'You rewrite recruiting outreach messages.',
      'Return JSON: {"subject": string|null, "body": string, "name": string}.',
      'Preserve placeholders exactly like {{first_name}}, {{job_title}}, etc.',
      'Do not invent new {{variables}} outside the allowlist.',
      `Action: ${input.action}`,
      input.tone ? `Tone: ${input.tone}` : '',
      input.instructions ? `Instructions: ${input.instructions.slice(0, 500)}` : '',
      `Subject: ${input.subject || ''}`,
      `Body:\n${input.body.slice(0, 8000)}`,
    ]
      .filter(Boolean)
      .join('\n')
  );

  if (!raw) return offline;

  try {
    const parsed = JSON.parse(raw) as {
      subject?: string | null;
      body?: string;
      name?: string;
    };
    const subject = parsed.subject ?? input.subject ?? null;
    const body = String(parsed.body || input.body);
    const vars = withVariables(subject, body);
    return {
      name: String(parsed.name || 'AI draft message').slice(0, 160),
      channel: input.channel || 'email',
      category: input.category || 'follow_up',
      ...vars,
      language: 'en',
      status: 'draft',
      generation: meta(input.action, `${input.action} via Gemini`),
    };
  } catch {
    return offline;
  }
}

export async function generateOutreachSequence(input: {
  jobTitle?: string;
  objective?: string;
  channels?: OutreachChannel[];
  companyName?: string;
}): Promise<GeneratedSequenceDraft> {
  const offline = offlineGenerateSequence(input);
  const raw = await callGeminiJson(
    [
      'Generate a recruiting outreach sequence as JSON.',
      'Shape: {"name":string,"channels":["email"|"whatsapp"|"ai_voice"],"steps":[{"id":string,"order":number,"type":string,"channel":string|null,"delayDays":number,"subject":string|null,"body":string|null,"stopOnReply":boolean,"note":string|null}]}',
      'Use only placeholders: {{first_name}} {{last_name}} {{job_title}} {{company_name}} {{location}} {{recruiter_name}} {{current_company}} {{current_role}}',
      'Never include launch instructions. Content is a draft only.',
      `Job title: ${(input.jobTitle || '').slice(0, 120)}`,
      `Objective: ${(input.objective || '').slice(0, 300)}`,
      `Channels: ${(input.channels || []).join(',')}`,
    ].join('\n')
  );

  if (!raw) return offline;

  try {
    const parsed = JSON.parse(raw) as Partial<GeneratedSequenceDraft>;
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) return offline;
    return {
      ...offline,
      name: String(parsed.name || offline.name).slice(0, 160),
      channels: (parsed.channels as OutreachChannel[]) || offline.channels,
      steps: parsed.steps.map((step, index) => ({
        id: String(step.id || `step-${index + 1}`),
        order: Number(step.order ?? index),
        type: String(step.type || 'Send Email'),
        channel: (step.channel as GeneratedSequenceDraft['steps'][0]['channel']) ?? null,
        delayDays: Number(step.delayDays || 0),
        subject: step.subject ?? null,
        body: step.body ?? null,
        stopOnReply: Boolean(step.stopOnReply),
        note: step.note ?? null,
      })),
      generation: meta('generate_sequence', 'Sequence draft via Gemini'),
    };
  } catch {
    return offline;
  }
}

export async function generateQualificationQuestions(input: {
  jobTitle?: string;
  jobDescription?: string;
  locations?: string[];
  workplaceType?: string | null;
  requirements?: string[];
  requiredSkills?: string[];
  experienceRange?: string | null;
  salaryRange?: string | null;
  instructions?: string;
}) {
  const contextParts = [
    input.jobDescription ? `JD:\n${input.jobDescription.slice(0, 6000)}` : '',
    input.locations?.length ? `Locations: ${input.locations.join(', ')}` : '',
    input.workplaceType ? `Workplace: ${input.workplaceType}` : '',
    input.requirements?.length
      ? `Requirements: ${input.requirements.slice(0, 12).join('; ')}`
      : '',
    input.requiredSkills?.length
      ? `Skills: ${input.requiredSkills.slice(0, 20).join(', ')}`
      : '',
    input.experienceRange ? `Experience: ${input.experienceRange}` : '',
    input.salaryRange ? `Salary: ${input.salaryRange}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const offline = offlineQualificationQuestions(input.jobTitle, contextParts);
  const raw = await callGeminiJson(
    [
      'Generate 3-5 recruiting qualification / knockout screening questions as JSON from the job description.',
      'Questions must be specific to THIS role (skills, location, notice, experience, compensation, must-haves from the JD).',
      'Do NOT invent company policies that are not in the JD. Prefer concrete yes/no or number questions for knockouts.',
      'Shape: {"questions":[{"id":string,"prompt":string,"answerType":"Yes / No"|"Number"|"Short text"|"Single choice","knockout":boolean,"knockoutCondition":string|null}]}',
      'knockoutCondition examples: "Reject if No", "Reject if more than 60", "Reject if less than 3". Use null when knockout is false.',
      'Allowed placeholders only: {{first_name}} {{job_title}} {{company_name}} {{location}} {{recruiter_name}} {{current_company}} {{current_role}} {{last_name}}',
      `Job title: ${(input.jobTitle || '').slice(0, 120)}`,
      contextParts || '(no JD provided — use sensible generic role questions)',
      `Notes: ${(input.instructions || '').slice(0, 400)}`,
    ].join('\n')
  );
  if (!raw) return offline;
  try {
    const parsed = JSON.parse(raw) as {
      questions?: Array<{
        id?: string;
        prompt?: string;
        answerType?: string;
        knockout?: boolean;
        knockoutCondition?: string | null;
      }>;
    };
    if (!Array.isArray(parsed.questions) || !parsed.questions.length) return offline;
    return {
      questions: parsed.questions.slice(0, 8).map((q, i) => ({
        id: String(q.id || `q${i + 1}`),
        prompt: String(q.prompt || '').slice(0, 500),
        answerType: String(q.answerType || 'Short text'),
        knockout: Boolean(q.knockout),
        knockoutCondition: q.knockout
          ? String(q.knockoutCondition || '').slice(0, 200) || null
          : null,
      })),
      generation: meta('qualification_questions', 'Qualification questions via Gemini from JD'),
    };
  } catch {
    return offline;
  }
}
