import type { HunarAgentWriteInput } from '../../providers/hunar/hunar.client.js';

export const AI_VOICE_DEMO_LIMIT = 2;

export const AI_VOICE_DEMO_JOBS = [
  'Customer Care Executive',
  'Business Development Executive',
  'MERN Developer',
  'Delivery Partner',
] as const;

export type AiVoiceDemoJob = (typeof AI_VOICE_DEMO_JOBS)[number];

type DemoQuestion = {
  id: string;
  question: string;
};

const QUESTIONS: Record<AiVoiceDemoJob, DemoQuestion[]> = {
  'Customer Care Executive': [
    {
      id: 'support-experience',
      question: 'Are you currently working in customer support or a similar role?',
    },
    {
      id: 'years',
      question: 'How many years of customer-facing experience do you have?',
    },
    {
      id: 'channels',
      question: 'Are you comfortable handling phone and chat queries for a full shift?',
    },
    {
      id: 'notice',
      question: 'What is your notice period?',
    },
    {
      id: 'salary',
      question: 'What monthly salary are you expecting?',
    },
  ],
  'Business Development Executive': [
    {
      id: 'sales-experience',
      question: 'Do you have experience in sales or business development?',
    },
    {
      id: 'targets',
      question: 'Have you worked against monthly targets or quotas?',
    },
    {
      id: 'mode',
      question: 'Are you open to inside sales, field sales, or both?',
    },
    {
      id: 'notice',
      question: 'What is your notice period?',
    },
    {
      id: 'salary',
      question: 'What monthly salary are you expecting?',
    },
  ],
  'MERN Developer': [
    {
      id: 'stack',
      question:
        'How many years have you worked with MongoDB, Express, React, and Node.js?',
    },
    {
      id: 'shipped',
      question: 'Have you built and shipped a full-stack web application?',
    },
    {
      id: 'apis',
      question: 'Are you comfortable building REST APIs and React interfaces?',
    },
    {
      id: 'notice',
      question: 'What is your notice period?',
    },
    {
      id: 'ctc',
      question: 'What annual CTC are you expecting?',
    },
  ],
  'Delivery Partner': [
    {
      id: 'vehicle',
      question: 'Do you have a valid driving licence and your own vehicle?',
    },
    {
      id: 'shifts',
      question: 'Are you available for same-day delivery shifts?',
    },
    {
      id: 'areas',
      question: 'Which areas can you cover for deliveries?',
    },
    {
      id: 'start',
      question: 'How soon can you start?',
    },
  ],
};

const RESULT_FIELDS = [
  'summary',
  'interest_level',
  'candidate_status',
  'final_outcome',
  'callback_requested',
  'callback_time',
  'candidate_questions',
  'objections_or_concerns',
  'ctc',
  'notice_period',
  'skills',
  'education',
  'location',
];

export function isAiVoiceDemoJob(value: string): value is AiVoiceDemoJob {
  return (AI_VOICE_DEMO_JOBS as readonly string[]).includes(value);
}

export function demoQuestionsFor(job: AiVoiceDemoJob): DemoQuestion[] {
  return QUESTIONS[job];
}

export function buildDemoAgentInput(job: AiVoiceDemoJob, company: string): HunarAgentWriteInput {
  const questions = demoQuestionsFor(job);
  const questionList = questions.map((row, index) => `${index + 1}. ${row.question}`).join('\n');

  return {
    name: `Huntlo demo · ${job}`.slice(0, 64),
    personaName: 'Roshni',
    objective: `Screen the caller for the ${job} role at ${company} and capture interest, notice period, and salary expectations.`,
    introduction: `Hello, this is Roshni calling on behalf of ${company} about the ${job} opening. This is a short screening call. Do you have a minute?`,
    agentPrompt: [
      `You are Roshni, a warm and professional AI recruiter calling on behalf of ${company}.`,
      `The hiring company is ${company}. Say this company name when you introduce the role. Do not replace it with Huntlo or leave it out.`,
      `You are calling the person who requested a Huntlo demo. Screen them the way you would screen a candidate for the ${job} role at ${company}.`,
      `Keep the call short. Ask one question at a time, listen, and follow up only when an answer is unclear.`,
      `Do not invent salary, location, or benefits that were not provided.`,
      `Close by thanking them and saying a recruiter will review the screen.`,
      ``,
      `Questions to ask:`,
      questionList,
    ].join('\n'),
    resultPrompt: `Extract structured screening results for these fields: ${RESULT_FIELDS.join(', ')}. Be concise and factual.`,
    resultSchema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        interest_level: { type: 'string' },
        candidate_status: { type: 'string' },
        final_outcome: { type: 'string' },
        callback_requested: { type: 'boolean' },
        callback_time: { type: 'string' },
        candidate_questions: { type: 'array', items: { type: 'string' } },
        objections_or_concerns: { type: 'array', items: { type: 'string' } },
        ctc: { type: 'string' },
        notice_period: { type: 'string' },
        skills: { type: 'string' },
        education: { type: 'string' },
        location: { type: 'string' },
      },
    },
    questions,
  };
}
