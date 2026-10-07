import type { createHunarVoiceAgent } from '../../providers/hunar/hunar.client.js';

type HunarAgentWriteInput = Parameters<typeof createHunarVoiceAgent>[0] & {
  questions: DemoQuestion[];
};

export const AI_VOICE_DEMO_LIMIT = 5;

export const AI_VOICE_DEMO_JOBS = [
  'Customer Care Executive',
  'Business Development Executive',
  'MERN Developer',
  'Delivery Partner',
  'Real Estate Property Visit – Feedback Call',
  'Real Estate Property Requirement Call',
  'Real Estate Alice Greens Call',
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
  'Real Estate Property Visit – Feedback Call': [
    {
      id: 'overall-experience',
      question: 'How was your overall experience during the {company} property visit?',
    },
    {
      id: 'expectations',
      question:
        'Did the {company} property meet your expectations based on the information shared with you?',
    },
    {
      id: 'liked-most',
      question:
        'What did you like most about the {company} property — location, amenities, layout, or something else?',
    },
    {
      id: 'concerns',
      question:
        'Do you have any concerns regarding the {company} property, pricing, location, or amenities?',
    },
    {
      id: 'interest',
      question:
        'After the visit, how interested are you in moving forward with this {company} property? Options: Very Interested, Interested, Need More Information, Not Interested.',
    },
    {
      id: 'sales-follow-up',
      question:
        'Would you like the {company} sales team to contact you to discuss the next steps or arrange another visit?',
    },
  ],
  'Real Estate Property Requirement Call': [
    {
      id: 'property-type',
      question:
        'What type of {company} property are you looking for? Options: 1 BHK, 2 BHK, 3 BHK, 4 BHK, Plot, Villa, or Commercial.',
    },
    {
      id: 'location',
      question: 'Which location or areas are you primarily looking for with {company}?',
    },
    {
      id: 'size',
      question: 'What is your preferred {company} property size or configuration?',
    },
    {
      id: 'budget',
      question: 'What is your approximate budget for the {company} property?',
    },
    {
      id: 'purpose',
      question: 'Are you looking for the {company} property for self-use or investment?',
    },
    {
      id: 'timeline',
      question:
        'When are you planning to purchase the {company} property? Options: Immediately, Within 3 months, 3–6 months, or 6+ months.',
    },
    {
      id: 'visit',
      question:
        'Would you be interested in visiting a {company} property? If yes, when would be a convenient time for you?',
    },
  ],
  'Real Estate Alice Greens Call': [
    {
      id: 'product',
      question: 'Are you exploring a residential plot or a 3 BHK luxury villa?',
    },
    {
      id: 'location',
      question:
        'The project is on Roorkee Bypass Road, opposite Jaipuria School. Does this location work for you?',
    },
    {
      id: 'size',
      question:
        'There are 259 plots from 1,100 to 2,162 square feet, and 60 three-BHK villas from 1,209 to 1,681 square feet. Which option interests you?',
    },
    {
      id: 'purpose',
      question: 'Are you looking at this project for self-use or as an investment?',
    },
    {
      id: 'timeline',
      question:
        'When are you planning to decide? Options: Immediately, Within 3 months, 3–6 months, or 6+ months.',
    },
    {
      id: 'sales-follow-up',
      question:
        'For pricing and further details, the sales consultant team can contact you. Would you like them to call you?',
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

export function demoQuestionsFor(job: AiVoiceDemoJob, company: string): DemoQuestion[] {
  const name = company.trim();
  return QUESTIONS[job].map((row) => ({
    ...row,
    question: row.question.replaceAll('{company}', name),
  }));
}

function isRealEstateCall(job: AiVoiceDemoJob): boolean {
  return job.startsWith('Real Estate');
}

export function buildDemoAgentInput(job: AiVoiceDemoJob, company: string): HunarAgentWriteInput {
  const questions = demoQuestionsFor(job, company);
  const questionList = questions.map((row, index) => `${index + 1}. ${row.question}`).join('\n');
  const realEstate = isRealEstateCall(job);
  const feedback = job === 'Real Estate Property Visit – Feedback Call';
  const alice = job === 'Real Estate Alice Greens Call';

  return {
    name: `Huntlo demo · ${job}`.slice(0, 64),
    personaName: 'Roshni',
    objective: realEstate
      ? alice
        ? `Introduce the ${company} project once, then capture plot or villa interest. For pricing, arrange a sales consultant follow-up.`
        : feedback
          ? `Collect property-visit feedback for ${company} and capture interest level and whether the sales team should follow up.`
          : `Understand the property requirements for a ${company} buyer and capture type, location, budget, timeline, and visit interest.`
      : `Screen the caller for the ${job} role at ${company} and capture interest, notice period, and salary expectations.`,
    introduction: realEstate
      ? alice
        ? `Hello, this is Roshni calling on behalf of ${company}. This is a ${job} about premium residential plots and 3 BHK luxury villas on the Haridwar–Delhi Highway. Do you have a minute?`
        : feedback
          ? `Hello, this is Roshni calling on behalf of ${company}. This is a ${job} about your recent property visit. Do you have a minute?`
          : `Hello, this is Roshni calling on behalf of ${company}. This is a ${job} to understand the property you are looking for. Do you have a minute?`
      : `Hello, this is Roshni calling on behalf of ${company} about the ${job} opening. This is a short screening call. Do you have a minute?`,
    agentPrompt: [
      realEstate
        ? `You are Roshni, a warm and professional caller from ${company}.`
        : `You are Roshni, a warm and professional AI recruiter calling on behalf of ${company}.`,
      alice
        ? `The company is ${company}. Say it once in the opening only. Do not say it in any question.`
        : `The company is ${company}. Say this company name when you introduce yourself. Do not replace it with Huntlo or leave it out.`,
      `Call type: ${job}.`,
      realEstate
        ? alice
          ? `You are calling the person who requested a Huntlo demo. Greet them from Alice World. Say the company name only once, in the opening. Do not say the company name or the project name again. After the opening, say the project or this project. Ask each question exactly as written. Do not insert the company name into a question. Do not read the call type or job title aloud. Share a short overview, then ask the questions. Answer follow-ups only from the project facts below.`
          : feedback
            ? `You are calling the person who requested a Huntlo demo. Treat them as someone who recently visited a ${company} property and collect feedback.`
            : `You are calling the person who requested a Huntlo demo. Treat them as a property buyer and capture their requirements for ${company}.`
        : `You are calling the person who requested a Huntlo demo. Screen them the way you would screen a candidate for the ${job} role at ${company}.`,
      alice
        ? [
            `Project facts for ${company}:`,
            `Premium residential plots and 3 BHK luxury villas.`,
            `Location: NH-334, Haridwar–Delhi Highway, Roorkee Bypass Road, opposite Jaipuria School. Centrally located between Haridwar and Roorkee.`,
            `Alice World has 20+ years of legacy in construction and 4+ years in real estate. Portfolio of 1.5 million+ sq. ft. of residential and commercial development. 6.75 lakh+ sq. ft. delivered. 8.5 lakh+ sq. ft. under development. Trusted by 650+ families.`,
            `Land parcel: about 100 bigha. Plots: 259, sizes 1,100 to 2,162 sq. ft. Villas: 60 three-BHK luxury villas, sizes 1,209 to 1,681 sq. ft.`,
            `Approvals and amenities: HRDA and RERA approved, 2-tier gated security, semi and fully loaded luxury villas, grand temple, swimming pool, 9 themed parks, badminton court, walking track, yoga and meditation zone, dedicated kids' play area.`,
            `Nearby: IIT Roorkee, COER Engineering and Nursing College, Quadra Hospital, Jaipuria School, Montfort School, Patanjali Yogpeeth and Research Institute, Crystal World Water and Amusement Park, restaurants and daily conveniences, and the upcoming RRTS corridor.`,
            `Home loans are available through SBI and other leading banks.`,
            `Do not quote a price. If they ask about pricing or want more detail, say the sales consultant team will contact them.`,
          ].join(' ')
        : `Keep the call short. Ask one question at a time, listen, and follow up only when an answer is unclear.`,
      alice
        ? `Keep the call short. Ask one question at a time, listen, and follow up only when an answer is unclear.`
        : realEstate
          ? `When a question lists options, offer those options and record the closest match. Do not invent property details, prices, or locations that were not provided.`
          : `Do not invent salary, location, or benefits that were not provided.`,
      alice
        ? `When a question lists options, offer those options and record the closest match. Do not invent prices, sizes, or locations beyond these project facts.`
        : realEstate
          ? `Close by thanking them and confirming the next step they agreed to.`
          : `Close by thanking them and saying a recruiter will review the screen.`,
      alice ? `Close by thanking them. For pricing and further details, confirm that the sales consultant team will contact them.` : '',
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
