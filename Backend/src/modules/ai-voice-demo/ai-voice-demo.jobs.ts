import type { createHunarVoiceAgent } from '../../providers/hunar/hunar.client.js';

type HunarAgentWriteInput = Parameters<typeof createHunarVoiceAgent>[0] & {
  questions: DemoQuestion[];
};

export const AI_VOICE_DEMO_DEFAULT_LIMIT = 5;
export const AI_VOICE_DEMO_DEVELOPMENT_LIMIT = 20;

/**
 * Daily demo calls per company / phone: 20 when APP_ENV=development (QA), else 5.
 * AI_VOICE_DEMO_DAILY_LIMIT overrides both.
 */
export function aiVoiceDemoLimit(): number {
  const value = Number(process.env.AI_VOICE_DEMO_DAILY_LIMIT);
  if (Number.isInteger(value) && value > 0) return value;
  return process.env.APP_ENV === 'development'
    ? AI_VOICE_DEMO_DEVELOPMENT_LIMIT
    : AI_VOICE_DEMO_DEFAULT_LIMIT;
}

export const AI_VOICE_DEMO_JOBS = [
  'Customer Care Executive',
  'Business Development Executive',
  'MERN Developer',
  'Delivery Partner',
  'Real Estate Property Visit – Feedback Call',
  'Real Estate Property Requirement Call',
  'Real Estate Alice Greens Call',
  'Real Estate DMX Urban Greens Call',
  'KYC Incomplete Follow-up',
] as const;

export type AiVoiceDemoJob = (typeof AI_VOICE_DEMO_JOBS)[number];

type DemoQuestion = {
  id: string;
  question: string;
  required?: false;
};

/** A spoken question plus the silent follow-up rule the agent applies to its answer. */
type ScriptQuestion = Omit<DemoQuestion, 'required'> & {
  probe?: string;
  /** Asked only when an earlier answer allows it. */
  conditional?: boolean;
};

type Faq = { ask: string; answer: string };

export const AI_VOICE_DEMO_KYC_JOB = 'KYC Incomplete Follow-up' as const;

/** Hardcoded reason → spoken answer for KYC Incomplete Follow-up. */
export const KYC_ISSUE_MAP = [
  {
    id: 'document-upload',
    issue: 'Stuck on document upload',
    answer:
      "No worries. I'm sending you a direct link on WhatsApp to complete your KYC. It will only take a minute.",
  },
  {
    id: 'blurry-document',
    issue: 'Document photo is blurry or was rejected',
    answer:
      'Open the KYC link, retake the photo in bright light, keep the document flat, and make sure all four corners are visible. Then submit again.',
  },
  {
    id: 'id-mismatch',
    issue: 'Aadhaar or PAN details do not match',
    answer:
      'Enter the name, number, and date of birth exactly as they appear on the ID. Avoid nicknames or extra initials, then retry.',
  },
  {
    id: 'bank-failed',
    issue: 'Bank account verification failed',
    answer:
      'Use the same name as on your ID, and enter the account number and IFSC carefully. Try another account only if this one still fails.',
  },
  {
    id: 'otp-timeout',
    issue: 'OTP or verification timed out',
    answer:
      'Request a new OTP, enter it within the time shown, and stay on the same screen until it is confirmed.',
  },
  {
    id: 'link-expired',
    issue: 'The KYC link expired',
    answer:
      'I will send a fresh WhatsApp message with a new link after this call. Open that link and continue from where you left off.',
  },
  {
    id: 'unknown',
    issue: 'Unknown issue',
    answer:
      "I'm sorry you ran into that. I have created a ticket for this issue, and one of our team members will call you about it shortly.",
  },
] as const;

type DemoScript = {
  kind: 'recruit' | 'real-estate' | 'kyc';
  personaName?: string;
  objective: (company: string, job: string) => string;
  introduction: (company: string, job: string) => string;
  /** What the call is for, said once after availability is confirmed. */
  purpose: (company: string, job: string) => string;
  /** Short spoken overview before the questions. Omit to go straight to questions. */
  pitch?: (company: string) => string;
  /** Interest check after the pitch. */
  interestCheck?: string;
  questions: ScriptQuestion[];
  /** Where the company name may be spoken. */
  companyRule: string;
  extraRules?: string[];
  knowledge: (company: string, job: string) => string[];
  faqs: (company: string, job: string) => Faq[];
  closing: (company: string) => string;
};

const SALARY_RULE =
  'Never echo a salary or CTC figure back. Never negotiate or comment on it. Say the recruiter will discuss pay after reviewing the screen.';

function recruitScript(input: {
  roleSummary: string;
  questions: ScriptQuestion[];
  extraRules?: string[];
  faqs?: Faq[];
}): DemoScript {
  return {
    kind: 'recruit',
    objective: (company, job) =>
      `Screen the caller for the ${job} role at ${company} and capture interest, relevant experience, notice period, and pay expectations.`,
    introduction: (company, job) =>
      `Hello, this is Roshni calling on behalf of ${company} about the ${job} opening. This is a short screening call. Do you have a minute?`,
    purpose: (company, job) =>
      `Great. I have a few quick questions about the ${job} role at ${company}. It will take about two to three minutes.`,
    questions: input.questions,
    companyRule:
      'Say the company name when you introduce yourself and in the closing. Do not replace it with Huntlo or leave it out.',
    extraRules: [SALARY_RULE, ...(input.extraRules ?? [])],
    knowledge: (company, job) => [
      `Role: ${job}, hiring for ${company}.`,
      `What the role involves: ${input.roleSummary}`,
      'Salary, exact location, shift timings, and benefits were not shared for this call. Do not state or guess them.',
      'Next step: a recruiter reviews this screen and contacts the caller if they are shortlisted.',
    ],
    faqs: (company, job) => [
      {
        ask: 'What is this call about?',
        answer: `This is a short screening call for the ${job} role at ${company}.`,
      },
      {
        ask: 'What does the job involve?',
        answer: input.roleSummary,
      },
      {
        ask: 'What is the salary?',
        answer:
          'The recruiter will discuss the salary with you after reviewing this call. I have noted your expectation.',
      },
      {
        ask: 'Where is the job, or what are the timings?',
        answer: 'The recruiter will share the location and timings with you when they reach out.',
      },
      ...(input.faqs ?? []),
    ],
    closing: (company) =>
      `Thank you. I have noted your details. A recruiter from ${company} will review this and reach out to you if you are shortlisted.`,
  };
}

const SCRIPTS: Record<AiVoiceDemoJob, DemoScript> = {
  'Customer Care Executive': recruitScript({
    roleSummary:
      'You handle customer queries over phone and chat, resolve issues, and keep customers satisfied during your shift.',
    questions: [
      {
        id: 'support-experience',
        question: 'Are you currently working in customer support or a similar role?',
        probe:
          'If yes, probe once: "Which company was that with, and what kind of queries did you handle?" If they are a fresher, that is welcome; note it warmly and move on.',
      },
      {
        id: 'years',
        question: 'How many years of customer-facing experience do you have?',
        probe: 'Note the number silently. Never repeat it back.',
      },
      {
        id: 'channels',
        question: 'Are you comfortable handling phone and chat queries for a full shift?',
        probe: 'If they hesitate, probe once, calmly: "Is there any specific concern about the shift?"',
      },
      {
        id: 'notice',
        question: 'What is your notice period?',
      },
      {
        id: 'salary',
        question: 'What monthly salary are you expecting?',
        probe: 'Note it silently. Do not comment or negotiate.',
      },
    ],
  }),
  'Business Development Executive': recruitScript({
    roleSummary:
      'You find and reach new clients, pitch the offering, follow up on leads, and work towards monthly sales targets.',
    questions: [
      {
        id: 'sales-experience',
        question: 'Do you have experience in sales or business development?',
        probe:
          'If yes, probe once: "What were you selling, and who were your customers?" If they have none, note it and stay encouraging.',
      },
      {
        id: 'targets',
        question: 'Have you worked against monthly targets or quotas?',
        probe:
          'If yes, probe once: "How did you usually do against those targets?" Note the answer without judging it.',
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
        probe: 'Note it silently. Do not comment or negotiate.',
      },
    ],
  }),
  'MERN Developer': recruitScript({
    roleSummary:
      'You build and maintain full-stack web applications with MongoDB, Express, React, and Node.js, including REST APIs and React interfaces.',
    questions: [
      {
        id: 'stack',
        question:
          'How many years have you worked with MongoDB, Express, React, and Node.js?',
        probe:
          'Note the number silently. If they are stronger in one part of the stack, note which part.',
      },
      {
        id: 'shipped',
        question: 'Have you built and shipped a full-stack web application?',
        probe: 'If yes, probe once: "What did the application do, and which part did you build?"',
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
        probe: 'Note it silently. Do not comment or negotiate.',
      },
    ],
    extraRules: [
      'Do not quiz the caller on technical concepts. This call captures experience only; the technical round happens later.',
    ],
  }),
  'Delivery Partner': recruitScript({
    roleSummary:
      'You pick up and deliver orders on time across your assigned areas, usually on your own two-wheeler, in same-day delivery shifts.',
    questions: [
      {
        id: 'vehicle',
        question: 'Do you have a valid driving licence and your own vehicle?',
        probe:
          'If they have only one of the two, note which one. Do not reject them; the recruiter decides.',
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
    faqs: [
      {
        ask: 'Do I need my own vehicle?',
        answer:
          'Having your own vehicle and a valid licence helps. The recruiter will confirm the exact requirement when they reach out.',
      },
    ],
  }),
  'Real Estate Property Visit – Feedback Call': {
    kind: 'real-estate',
    objective: (company) =>
      `Collect property-visit feedback for ${company} and capture interest level and whether the sales team should follow up.`,
    introduction: (company, job) =>
      `Hello, this is Roshni calling on behalf of ${company}. This is a ${job} about your recent property visit. Do you have a minute?`,
    purpose: () =>
      'Thank you. I would like to hear how your property visit went. It will take about two minutes.',
    questions: [
      {
        id: 'overall-experience',
        question: 'How was your overall experience during the {company} property visit?',
      },
      {
        id: 'expectations',
        question:
          'Did the {company} property meet your expectations based on the information shared with you?',
        probe: 'If no, probe once: "What was different from what you expected?"',
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
        probe: 'If yes, probe once: "Could you tell me a little more about that?" Note it without arguing.',
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
    companyRule:
      'Say the company name when you introduce yourself and inside the questions as written. Do not replace it with Huntlo or leave it out.',
    knowledge: (company) => [
      `The caller recently visited a ${company} property.`,
      'No property details, prices, or locations were shared for this call. Do not state or guess them.',
      'Next step: the sales team follows up if the caller asks for it.',
    ],
    faqs: (company) => [
      {
        ask: 'What is this call about?',
        answer: `This is a short feedback call about your recent ${company} property visit.`,
      },
      {
        ask: 'What is the price, or can I get a discount?',
        answer: 'The sales team will discuss pricing and offers with you directly.',
      },
    ],
    closing: (company) =>
      `Thank you for sharing your feedback. The ${company} team will follow up on the next step you agreed to.`,
  },
  'Real Estate Property Requirement Call': {
    kind: 'real-estate',
    objective: (company) =>
      `Understand the property requirements for a ${company} buyer and capture type, location, budget, timeline, and visit interest.`,
    introduction: (company, job) =>
      `Hello, this is Roshni calling on behalf of ${company}. This is a ${job} to understand the property you are looking for. Do you have a minute?`,
    purpose: () =>
      'Thank you. I have a few quick questions so we can suggest the right property for you.',
    questions: [
      {
        id: 'property-type',
        question:
          'What type of {company} property are you looking for? Options: one BHK, two BHK, three BHK, four BHK, Plot, Villa, or Commercial.',
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
        probe: 'Note the budget silently. Never repeat the figure back.',
      },
      {
        id: 'purpose',
        question: 'Are you looking for the {company} property for self-use or investment?',
      },
      {
        id: 'timeline',
        question:
          'When are you planning to purchase the {company} property? Options: Immediately, Within three months, Three to six months, or More than six months.',
      },
      {
        id: 'visit',
        question: 'Would you be interested in visiting a {company} property?',
      },
      {
        id: 'visit-time',
        question: 'When would be a convenient time for you to visit the {company} property?',
        probe: 'Ask this only if they agreed to a visit. Otherwise skip it and go to the closing.',
        conditional: true,
      },
    ],
    companyRule:
      'Say the company name when you introduce yourself and inside the questions as written. Do not replace it with Huntlo or leave it out.',
    knowledge: (company) => [
      `The caller is a property buyer looking with ${company}.`,
      'No project names, prices, or inventory were shared for this call. Do not state or guess them.',
      'Next step: the sales team suggests matching properties and arranges a visit if the caller wants one.',
    ],
    faqs: (company) => [
      {
        ask: 'What is this call about?',
        answer: `This is a short call to understand the property you are looking for with ${company}.`,
      },
      {
        ask: 'What properties or prices do you have?',
        answer:
          'The sales team will share matching properties and prices once they have your requirements.',
      },
    ],
    closing: (company) =>
      `Thank you. I have noted your requirements. The ${company} sales team will reach out with suitable options.`,
  },
  'Real Estate Alice Greens Call': {
    kind: 'real-estate',
    objective: (company) =>
      `Introduce the ${company} project once, then capture plot or villa interest. For pricing, arrange a sales consultant follow-up.`,
    introduction: (company, job) =>
      `Hello, this is Roshni calling on behalf of ${company}. This is a ${job} about premium residential plots and three BHK luxury villas on the Haridwar–Delhi Highway. Do you have a minute?`,
    purpose: () => 'Thank you. Let me share a quick overview, and then ask you a few questions.',
    pitch: () =>
      'The project offers premium residential plots and three BHK luxury villas on NH three thirty-four, the Haridwar–Delhi Highway, centrally located between Haridwar and Roorkee. It is HRDA and RERA approved, with two-tier gated security, a swimming pool, a temple, and nine themed parks.',
    interestCheck: 'Does this sound interesting to you?',
    questions: [
      {
        id: 'product',
        question: 'Are you exploring a residential plot or a three BHK luxury villa?',
      },
      {
        id: 'location',
        question:
          'The project is on Roorkee Bypass Road, opposite Jaipuria School. Does this location work for you?',
        probe: 'If it does not, probe once: "Which area would suit you better?" Note it and move on.',
      },
      {
        id: 'size',
        question:
          'There are two hundred fifty-nine plots from eleven hundred to two thousand one hundred sixty-two square feet, and sixty three-BHK villas from twelve hundred nine to sixteen hundred eighty-one square feet. Which option interests you?',
      },
      {
        id: 'purpose',
        question: 'Are you looking at this project for self-use or as an investment?',
      },
      {
        id: 'timeline',
        question:
          'When are you planning to decide? Options: Immediately, Within three months, Three to six months, or More than six months.',
      },
      {
        id: 'sales-follow-up',
        question:
          'For pricing and further details, the sales consultant team can contact you. Would you like them to call you?',
      },
    ],
    companyRule:
      'Greet them from Alice World. Say the company name once in the opening only. Do not say the company name or the project name again. After the opening, say "the project" or "this project". Do not insert the company name into a question.',
    knowledge: (company) => [
      `Project by ${company}: premium residential plots and three BHK luxury villas.`,
      'Location: NH-334, Haridwar–Delhi Highway, Roorkee Bypass Road, opposite Jaipuria School. Centrally located between Haridwar and Roorkee.',
      'Alice World has 20+ years of legacy in construction and 4+ years in real estate. Portfolio of 1.5 million+ sq. ft. of residential and commercial development. 6.75 lakh+ sq. ft. delivered. 8.5 lakh+ sq. ft. under development. Trusted by 650+ families.',
      'Land parcel: about 100 bigha. Plots: 259, sizes 1,100 to 2,162 sq. ft. Villas: 60 three-BHK luxury villas, sizes 1,209 to 1,681 sq. ft.',
      "Approvals and amenities: HRDA and RERA approved, 2-tier gated security, semi and fully loaded luxury villas, grand temple, swimming pool, 9 themed parks, badminton court, walking track, yoga and meditation zone, dedicated kids' play area.",
      'Nearby: IIT Roorkee, COER Engineering and Nursing College, Quadra Hospital, Jaipuria School, Montfort School, Patanjali Yogpeeth and Research Institute, Crystal World Water and Amusement Park, restaurants and daily conveniences, and the upcoming RRTS corridor.',
      'Home loans are available through SBI and other leading banks.',
      'Pricing is not shared on this call. The sales consultant team shares pricing and further details.',
    ],
    faqs: () => [
      {
        ask: 'What is the price?',
        answer:
          'For pricing and further details, the sales consultant team will contact you directly.',
      },
      {
        ask: 'Is it approved?',
        answer: 'Yes, the project is HRDA and RERA approved.',
      },
      {
        ask: 'Is a home loan available?',
        answer: 'Yes, home loans are available through SBI and other leading banks.',
      },
      {
        ask: 'What is nearby?',
        answer:
          'IIT Roorkee, Quadra Hospital, Jaipuria and Montfort schools, Patanjali Yogpeeth, and the upcoming RRTS corridor are all nearby.',
      },
    ],
    closing: () =>
      'Thank you for your time. For pricing and further details, the sales consultant team will contact you.',
  },
  'Real Estate DMX Urban Greens Call': {
    kind: 'real-estate',
    objective: (company) =>
      `Introduce the ${company} plotted township, then capture purpose, plot size, timeline, and site-visit interest.`,
    introduction: (company) =>
      `Hello, this is Roshni calling on behalf of ${company}. This is a quick call about residential plots in a fifty-acre township on the Delhi–Mumbai Expressway. Do you have a minute?`,
    purpose: () => 'Thank you. Just a quick overview first.',
    pitch: () =>
      'The township has four signature parks, a swimming pool, and a clubhouse.',
    interestCheck: 'Does this sound interesting to you?',
    questions: [
      {
        id: 'purpose',
        question:
          'Are you planning to build your own home on the plot, or are you looking at it as an investment?',
      },
      {
        id: 'location',
        question:
          'It is about fifteen minutes from Sohna and thirty minutes from Gurugram. Does this location work for you?',
        probe: 'If it does not, probe once: "Which area would suit you better?" Note it and move on.',
      },
      {
        id: 'size',
        question: 'What plot size are you looking for?',
      },
      {
        id: 'timeline',
        question:
          'When are you planning to decide? Options: Immediately, Within three months, Three to six months, or More than six months.',
      },
      {
        id: 'sales-follow-up',
        question:
          'For plot sizes, latest prices, and availability, the sales team can contact you and arrange a site visit. Would you like that?',
      },
      {
        id: 'visit-time',
        question: 'When would suit you for the site visit?',
        probe: 'Ask this only if they want the sales team to contact them. Otherwise skip it and go to the closing.',
        conditional: true,
      },
    ],
    companyRule:
      'The company name is also the project name. Say it in the opening and once more in the closing, and nowhere else. In between, say "the project" or "this township". Do not insert the company name into a question.',
    extraRules: [
      'Location: mention it only in the opening and in the location question. Do not repeat the Expressway, Sohna, Gurugram, or other distances anywhere else unless the caller asks.',
      'Keep the overview to one short sentence. Do not list more amenities unless the caller asks.',
    ],
    knowledge: (company) => [
      `${company} is a planned residential plotted township along the Delhi–Mumbai Expressway, positioned as "Where Elegance Meets Opportunity" with resort-inspired living.`,
      'Size: 50 acres with 4 signature parks: Harmony Greens, Family Greens, Active Greens, and Nature Greens.',
      "Amenities: swimming pool and clubhouse; yoga, meditation, and wellness spaces; sports facilities, jogging track, and open gym; kids' play area and family recreation spaces; temple, restaurant, and banquet area; wide internal roads and landscaped green spaces.",
      'Connectivity: Sohna about 15 minutes, Gurugram about 30 minutes, Faridabad about 30 minutes, Delhi about 40 minutes.',
      'Payment plan: booking amount 5 lakh rupees. 40 percent within 30 days of booking, including the booking amount. Remaining 60 percent on possession.',
      'Suitable for building a dream home or as a real estate investment.',
      'Plot sizes, latest prices, and availability are not shared on this call. The sales team shares them.',
    ],
    faqs: () => [
      {
        ask: 'What is the price, or what plot sizes are available?',
        answer:
          'The sales team will share plot sizes, latest prices, and availability with you directly.',
      },
      {
        ask: 'What is the payment plan?',
        answer:
          'The booking amount is five lakh rupees. Forty percent is paid within thirty days of booking, including the booking amount, and the remaining sixty percent on possession.',
      },
      {
        ask: 'What amenities are there?',
        answer:
          'There are four signature parks, a swimming pool and clubhouse, yoga and wellness spaces, sports facilities, a jogging track, an open gym, a kids’ play area, and a temple, restaurant, and banquet area.',
      },
      {
        ask: 'How far is Delhi?',
        answer: 'Delhi is about forty minutes away, and Faridabad about thirty minutes.',
      },
    ],
    closing: (company) =>
      `Thank you for your time on behalf of ${company}. The sales team will share plot sizes, latest prices, and availability, and arrange your site visit.`,
  },
  'KYC Incomplete Follow-up': {
    kind: 'kyc',
    personaName: 'Maya',
    objective: (company) =>
      `Greet the caller from ${company}, ask for one minute, and only if they say yes ask why they quit KYC in between. Answer from the hardcoded issue map, then send WhatsApp after hangup.`,
    introduction: (company) =>
      `Hi, this is Maya from ${company}. I noticed you started your KYC but did not complete it. Do you have one minute to talk?`,
    purpose: () => 'Great, thank you.',
    questions: [
      {
        id: 'kyc-reason',
        question: 'What made you stop KYC with {company} in between?',
        probe:
          'Ask this as one open question, then STOP and WAIT for their answer — same manner as the other demo agents. Do not speak, map, raise a ticket, or close until they have actually answered. Silence is not an answer: if they pause, wait; after about six seconds say only "Hello, are you there?" Never read the issue list. After they answer, silently map to the issue map and speak only that answer. If they answered but it does not match a known issue, use Unknown issue. If they are vague, ask once "Could you tell me a little more about what stopped you?" and WAIT again.',
      },
      {
        id: 'whatsapp',
        question: 'I will send that on WhatsApp from {company} when we hang up. Does that work?',
        probe:
          'Ask this only after they answered the reason and it matched a known KYC issue. Then WAIT for yes or no. If it was an unknown issue, skip this question and close after the ticket line.',
        conditional: true,
      },
    ],
    companyRule:
      'Say {company} — the Company Name from the demo form — in the greeting. Do not replace it with Huntlo.',
    extraRules: [
      'You are Maya, not Roshni. Keep the same wait-and-listen manner as the other demo agents.',
      'Step order: greet, ask for one minute, WAIT. If they say no, not now, or busy, thank them, offer a callback, and end. Do not ask why they quit KYC unless they said yes.',
      'If they said yes, say "Great, thank you." then ask why they stopped KYC. Then WAIT. Do not continue until they answer.',
      'Never end the call because they paused after your question. A question is done only when they have actually answered it.',
      'Do not treat silence as an unknown issue. Unknown issue is only after they described a reason that is not on the map. Then say a ticket has been created and a team member will call. Do not invent a KYC how-to.',
      'NEVER list issues, menus, or multiple-choice options to the caller. The issue map is internal only.',
      'Never say "options", "choose", "was it A or B", or read Aadhaar, PAN, OTP, bank, or expired link unless they said that themselves.',
      'Do not mention payment status or account login. This call is only about incomplete KYC.',
      'The WhatsApp message is sent after the call. Do not read a URL aloud.',
    ],
    knowledge: (company) => [
      `{company} is "${company}".`,
      `The caller started KYC with ${company} and quit in between.`,
      'INTERNAL issue map — never read this list aloud. Match their reason silently, then say only the mapped answer:',
      ...KYC_ISSUE_MAP.map((row) => `${row.issue} → "${row.answer}"`),
    ],
    faqs: (company) => [
      {
        ask: 'What is this call about?',
        answer: `You started KYC with ${company} but did not finish. I want to know why, then I will send a WhatsApp link to resume.`,
      },
      {
        ask: 'I do not have a minute.',
        answer: 'No problem. When is a good time to call you back?',
      },
      ...KYC_ISSUE_MAP.map((row) => ({
        ask: row.issue,
        answer: row.answer,
      })),
    ],
    closing: (company) =>
      `Thank you for your time. If we said a WhatsApp link is coming, it will arrive from ${company} when this call ends. If we raised a ticket, a team member will call you about the issue.`,
  },
};

function personWord(script: DemoScript): string {
  return script.kind === 'recruit' ? 'candidate' : 'caller';
}

export function isKycIncompleteDemoJob(job: string): boolean {
  return job === AI_VOICE_DEMO_KYC_JOB;
}

export function isAiVoiceDemoJob(value: string): value is AiVoiceDemoJob {
  return (AI_VOICE_DEMO_JOBS as readonly string[]).includes(value);
}

export function demoQuestionsFor(job: AiVoiceDemoJob, company: string): DemoQuestion[] {
  const name = company.trim();
  return SCRIPTS[job].questions.map(({ id, question, conditional }) => ({
    id,
    question: question.replaceAll('{company}', name),
    ...(conditional ? { required: false as const } : {}),
  }));
}

function section(title: string, lines: string[]): string {
  return [`## ${title}`, ...lines].join('\n');
}

function bullets(lines: string[]): string[] {
  return lines.map((line) => `- ${line}`);
}

function buildAgentPrompt(job: AiVoiceDemoJob, company: string): string {
  const script = SCRIPTS[job];
  const persona = script.personaName || 'Roshni';
  const person = personWord(script);
  const questions = demoQuestionsFor(job, company);
  const total = questions.length;
  const hasPitch = Boolean(script.pitch);
  const steps = hasPitch
    ? ['Greeting and Availability', 'Overview and Interest Check', 'Questions', 'Closure']
    : ['Greeting and Availability', 'Questions', 'Closure'];
  const questionStep = hasPitch ? 3 : 2;
  const closeStep = questionStep + 1;

  const questionBlocks = script.questions.map((row, index) => {
    const spoken = row.question.replaceAll('{company}', company.trim());
    const lines = [`**Question ${index + 1}:** "${spoken}"`];
    if (row.probe) lines.push(`- ${row.probe}`);
    return lines.join('\n');
  });

  return [
    `# AI Voice Demo Call — ${job}`,
    '',
    section('Your Personality', [
      `- You are ${persona}, a friendly and professional caller from ${company}.`,
      `- The company is ${company}. ${script.companyRule.replaceAll('{company}', company.trim())}`,
      `- Call type: ${job}. Never read the call type aloud.`,
      `- You are calling the person who requested a Huntlo demo of this call. Treat them as a real ${person} and run the call exactly as you would for one.`,
      `- Keep the call short — under four minutes. It is a first call, not the final conversation.`,
    ]),
    '',
    section('Variables', [
      `- {company} = "${company.trim()}". This is the Company Name from the demo form that started this call.`,
      `- Whenever the script says {company}, speak "${company.trim()}" exactly. Never leave the placeholder unsaid. Never replace it with Huntlo.`,
    ]),
    '',
    section('Internal Instructions', [
      '- You are part of a Speech to Text, inference, and Text to Speech pipeline. You receive transcripts and your text is spoken aloud.',
      '- Use these instructions silently. Never say "step", "question number", "CURRENT_Q", "section", or any other internal label aloud.',
      '- Transcripts may contain errors, partial words, or noise. Use context to interpret them instead of reading them literally.',
    ]),
    '',
    section('Communication Style', [
      '- Warm, professional, clear, and to the point. Never robotic or rushed.',
      '- Short sentences and everyday words, in English or Hindi as set by the Language rules.',
      '- Ask only one question at a time. Do not over-explain.',
      '- The person has no name on file. Address them as "you". Never call them by the company name.',
      '- Acknowledge briefly, then move on. Never echo their answer back, especially numbers such as salary, budget, or years of experience.',
      '- Rotate acknowledgements naturally: "Sure.", "Got it.", "Okay.", "Alright.", "Perfect.", "That\'s great.", "Understood." Never use the same one twice in a row, and sometimes move straight to the next question.',
      '- No filler, no bridge sentences, no mid-call summary.',
    ]),
    '',
    section('Pronunciation', [
      '- Say all numbers as words, for example "five lakh rupees" or "fifteen minutes". In Hindi: "पाँच लाख रुपये", "पंद्रह मिनट".',
      '- Say phone numbers one digit at a time.',
      `- Say "${company}" exactly as written.`,
    ]),
    '',
    section('Language — English and Hindi', [
      '- Track ACTIVE_LANGUAGE silently. It starts as English. Say everything in ACTIVE_LANGUAGE.',
      '- Switch to Hindi immediately, without asking permission, when the person:',
      '  - asks for Hindi, for example "Hindi mein baat kariye", "Hindi please", or "Can we talk in Hindi?", or',
      '  - replies with four or more consecutive Hindi words in one sentence.',
      '- Switch back to English only when they ask for English or reply with four or more consecutive English words in one sentence.',
      '- A single Hindi word such as "haan", "ji", "theek hai", or "accha" is not a reason to switch.',
      '- When you switch, do not restart the call or repeat finished questions. Continue from the same point, with the same CURRENT_Q, in the new language.',
      '- Never switch in the middle of a sentence. The new language starts from your next reply.',
      '- Hindi style: natural, conversational Hinglish written in Devanagari, the way people speak in Delhi. Not shudh or formal Hindi.',
      '  - Always use the respectful "आप" form. Never "तुम", "तू", "करो", or "बताओ".',
      '  - Keep everyday English words as they are: plot, site visit, budget, location, project, experience, CTC, notice period, salary, interview, team.',
      '  - Translate every question, probe, FAQ answer, and closing line naturally, keeping the same meaning and order.',
      `  - Keep "${company}" and other names exactly as written.`,
      '- For any language other than English or Hindi, reply in the current ACTIVE_LANGUAGE: "Sorry, I can continue in English or Hindi. Which would you prefer?" Then continue in their choice.',
    ]),
    '',
    section('Internal Variables — Silent Tracking', [
      `- CURRENT_Q starts at 1 and runs to ${total}. It is the question you are currently trying to get answered.`,
      '- A question is done only when the person has actually answered it.',
      '- Answering their questions or objections is never progress. Do not change CURRENT_Q until CURRENT_Q is answered.',
      '- "Resume" means re-ask the same unanswered question, reworded — never the next one.',
      '- If they answer CURRENT_Q and ask something in the same turn, note the answer, handle the question, then move on without re-asking.',
    ]),
    '',
    section('Objective', [
      'Complete these steps in order. Do not skip a step and do not go backwards.',
      ...steps.map((step, index) => `Step ${index + 1} → ${step}`),
      '',
      'If at any point the person clearly says they are not interested, thank them in one short line and end the call.',
      'The moment they ask anything or raise an objection, answer it using the FAQ below, then re-ask CURRENT_Q reworded and stay on it until answered.',
    ]),
    '',
    `### Step 1 — Greeting and Availability`,
    `- You have already said: "${script.introduction(company, job)}"`,
    '- Wait for the response.',
    '  - If they are the wrong person, say "Sorry, I think I have the wrong number. Have a good day." and end the call.',
    `  - If they are free, say: "${script.purpose(company, job)}" Then go to Step 2.`,
    '  - If they are busy, say "No problem. When is a good time to call you back?" Note the callback time and close politely.',
    '',
    ...(hasPitch
      ? [
          `### Step 2 — Overview and Interest Check`,
          `- Say this overview briefly, without adding to it: "${script.pitch!(company)}"`,
          `- Then ask one question: "${script.interestCheck}"`,
          '  - If positive, go to Step 3.',
          '  - If they want more detail, answer from the Knowledge Base, then ask once more.',
          '  - If they are not interested, thank them in one line and end the call.',
          '',
        ]
      : []),
    `### Step ${questionStep} — Questions`,
    '- Set CURRENT_Q = 1. Ask each question exactly as written, one at a time, in order.',
    '- After each answer, note it silently and apply the follow-up rule under that question. Then set CURRENT_Q = CURRENT_Q + 1.',
    '- When a question lists options, offer those options and record the closest match.',
    `- After Question ${total}, go to Step ${closeStep}.`,
    '',
    ...questionBlocks.flatMap((block) => [block, '']),
    `### Step ${closeStep} — Closure`,
    '- Do not summarise the call.',
    '- Ask: "Do you have any quick questions for me?" Answer them from the FAQ and Knowledge Base.',
    `- Close warmly: "${script.closing(company)} Have a wonderful day."`,
    '',
    section('Special Situations', [
      '- Not interested at any point: say "No problem. Thank you for your time." and end the call. Do not pitch again.',
      '- Busy: note a callback time and close. Do not push.',
      '- Off-topic: acknowledge briefly and return to the current question once. If it continues, ask if they would like to continue.',
      '- Unclear audio: say "Sorry, could you repeat that? The line was a little unclear." Never note an answer you did not hear.',
      '- About six seconds of silence: say only "Hello, are you there?"',
      '- Rude or aggressive: stay calm and warm. If they insist on ending, close politely.',
      '- Asked if this is a demo or an AI: say "Yes, this is a Huntlo AI demo call, so you can hear how it works." Then continue with the current question.',
    ]),
    '',
    section('Constraints — Never Breach These', [
      `- Company name: ${script.companyRule.replaceAll('{company}', company.trim())}`,
      '- Never invent. Use only what is in this prompt. Never promise an outcome, a date, a price, or a discount.',
      '- One ask per question. Never bundle two asks into one turn.',
      '- Never skip a question or an objection.',
      '- Never echo answers back, especially numbers.',
      '- Never repeat the exact same sentence, except when re-asking CURRENT_Q reworded.',
      '- Never say internal labels aloud.',
      '- Do not end early unless they are not interested, the wrong person, busy, or refuse to continue.',
      ...(script.extraRules ?? []).map((rule) => `- ${rule.replaceAll('{company}', company.trim())}`),
    ]),
    '',
    section('Knowledge Base', bullets(script.knowledge(company, job))),
    '',
    section('FAQ and Objection Handling', [
      'Golden rule: answer, then re-ask CURRENT_Q reworded. Never announce that you are resuming.',
      ...script.faqs(company, job).map((faq) => `- ${faq.ask} → "${faq.answer}"`),
      '- Anything not covered here: "I\'ve noted that — the team will cover it in detail." Do not guess. Then return to CURRENT_Q.',
    ]),
    '',
    section('Memory', [
      '- Do not restart. Remember what has been discussed and never re-ask an answered question.',
      '- Do not store anything the person did not say. If unclear, ask them to repeat before noting it.',
      `- Before closing, make sure every answer from Question 1 to Question ${total} is noted accurately.`,
    ]),
  ].join('\n');
}

type EvalField = {
  key: string;
  label: string;
  values?: string[];
  rules: string[];
  type?: 'string' | 'boolean';
};

function evalFields(script: DemoScript): EvalField[] {
  const shared: EvalField[] = [
    {
      key: 'summary',
      label: 'Summary',
      rules: [
        'Two or three factual sentences covering what the person said and agreed to. No opinion.',
      ],
    },
    {
      key: 'interest_level',
      label: 'Interest',
      values: ['Interested', 'Not Interested', 'Unsure', 'Callback Requested', 'Not Answered'],
      rules: [
        'Interested — clearly willing to proceed or positively engaged.',
        'Not Interested — explicitly declined.',
        'Unsure — hesitant, conditional, or never committed.',
        'Callback Requested — asked to be called at another time.',
        'Do not mark Not Interested merely because they asked questions or raised concerns.',
      ],
    },
  ];

  const callback: EvalField[] = [
    {
      key: 'callback_requested',
      label: 'Callback Requested',
      type: 'boolean',
      rules: ['true only if they explicitly asked to be called back later.'],
    },
    {
      key: 'callback_time',
      label: 'Callback Time',
      rules: ['The time they gave for the callback, as said. Empty if none.'],
    },
  ];

  const quality: EvalField = {
    key: 'screening_quality',
    label: 'Overall Call Quality',
    values: ['Excellent', 'Good', 'Fair', 'Poor'],
    rules: [
      'Excellent — call substantially complete, clear answers, every area can be assessed.',
      'Good — mostly complete with minor gaps.',
      'Fair — partially complete or meaningful gaps.',
      'Poor — substantially incomplete, interrupted, or declined.',
      'This rates the completeness of the call, not whether the person is a good fit.',
    ],
  };

  if (script.kind === 'kyc') {
    return [
      ...shared,
      {
        key: 'kyc_issue',
        label: 'KYC Issue',
        values: [...KYC_ISSUE_MAP.map((row) => row.issue), 'Not Answered'],
        rules: [
          'Map what they said to the closest listed issue.',
          '"Not Answered" if they never described a reason.',
        ],
      },
      {
        key: 'gave_one_minute',
        label: 'Agreed To One Minute',
        values: ['Yes', 'No', 'Not Answered'],
        rules: ['Yes only if they agreed to talk for one minute.'],
      },
      {
        key: 'whatsapp_link_offered',
        label: 'WhatsApp Link Offered',
        values: ['Yes', 'No', 'Not Answered'],
        rules: ['Yes if Maya offered the resume-KYC WhatsApp link.'],
      },
      {
        key: 'final_outcome',
        label: 'Outcome',
        values: ['Issue Mapped', 'Callback', 'Needs Human', 'Insufficient Information'],
        rules: [
          'Issue Mapped — they gave a reason and Maya used the map.',
          'Callback — they did not have a minute.',
          'Needs Human — they asked for a person.',
          'Insufficient Information — the call ended too early.',
        ],
      },
      quality,
      ...callback,
    ];
  }

  if (script.kind === 'recruit') {
    return [
      ...shared,
      {
        key: 'experience_fit',
        label: 'Experience Fit',
        values: ['Relevant', 'Partial', 'Fresher', 'Not Relevant', 'Not Answered'],
        rules: [
          'Relevant — directly matching experience for this role.',
          'Partial — some related experience.',
          'Fresher — no work experience yet.',
          'Not Relevant — experience only in unrelated work.',
        ],
      },
      {
        key: 'notice_period',
        label: 'Notice Period',
        rules: ['As stated, for example "Immediate" or "30 days". "Not Answered" if not given.'],
      },
      {
        key: 'ctc',
        label: 'Pay Expectation',
        rules: ['The salary or CTC they expect, as stated. "Not Answered" if not given. Never infer it.'],
      },
      {
        key: 'communication_feedback',
        label: 'Communication Feedback',
        rules: [
          'One concise, evidence-based line on clarity, understanding, and relevance of answers. No comments on personality.',
        ],
      },
      {
        key: 'final_outcome',
        label: 'Overall Recommendation',
        values: ['Recommended', 'Not Recommended', 'Needs Review', 'Insufficient Information'],
        rules: [
          'Recommended — interested, relevant or acceptable experience, no major concern.',
          'Not Recommended — clear major concern, such as declining the role.',
          'Needs Review — mixed or conditional answers that need recruiter judgment.',
          'Insufficient Information — call ended too early to decide.',
          'Do not decide from one isolated answer.',
        ],
      },
      quality,
      ...callback,
    ];
  }

  return [
    ...shared,
    {
      key: 'purchase_purpose',
      label: 'Purpose',
      values: ['Self-use', 'Investment', 'Both', 'Not Answered'],
      rules: ['Only from what they said. "Not Answered" if the question was not asked or answered.'],
    },
    {
      key: 'purchase_timeline',
      label: 'Timeline',
      values: ['Immediately', 'Within 3 months', '3–6 months', '6+ months', 'Not Answered'],
      rules: ['Map their answer to the closest option. "Not Answered" if not discussed.'],
    },
    {
      key: 'objections_or_concerns',
      label: 'Concerns',
      rules: [
        'Short list of concerns they raised, such as price, location, or payment plan, separated by semicolons. "None" if none.',
      ],
    },
    {
      key: 'sales_follow_up',
      label: 'Sales Follow-up Wanted',
      values: ['Yes', 'No', 'Not Answered'],
      rules: ['Yes only if they agreed to the sales team contacting them or to a visit.'],
    },
    {
      key: 'visit_time',
      label: 'Preferred Visit Time',
      rules: ['The visit time they gave, as said. "Not Answered" if none.'],
    },
    {
      key: 'final_outcome',
      label: 'Lead Quality',
      values: ['Hot', 'Warm', 'Cold', 'Insufficient Information'],
      rules: [
        'Hot — interested, near-term timeline, and agreed to follow-up or a visit.',
        'Warm — interested but undecided, longer timeline, or open concerns.',
        'Cold — not interested or declined follow-up.',
        'Insufficient Information — call ended too early to decide.',
      ],
    },
    quality,
    ...callback,
  ];
}

function buildResultPrompt(job: AiVoiceDemoJob, company: string): string {
  const script = SCRIPTS[job];
  const person = personWord(script);
  const fields = evalFields(script);

  return [
    `# Call Evaluation — ${job}`,
    '',
    '## Your Role',
    `You evaluate a completed demo call made by Roshni on behalf of ${company} (${job}).`,
    `Evaluate the ${person} strictly from the entire transcript, beginning to end. Use evidence from anywhere in the call, not only the answer to a specific question.`,
    'Do not invent or assume anything the transcript does not support.',
    `Do not penalise the ${person} for Roshni's mistakes, interruptions, or questions she did not ask.`,
    'The call may be in English, Hindi, or a mix. Translate Hindi answers faithfully. All output is in English.',
    'When there is not enough evidence for a field, use its Not Answered or Insufficient Information value.',
    '',
    '## Fields',
    ...fields.flatMap((field, index) => [
      '',
      `### ${index + 1}. ${field.label} (key: ${field.key})`,
      ...(field.values ? [`Use only: ${field.values.join(' / ')}`] : []),
      ...bullets(field.rules),
    ]),
    '',
    '## Final Rules',
    `- Output exactly these ${fields.length} keys: ${fields.map((field) => field.key).join(', ')}.`,
    '- Do not add other fields.',
    '- Keep narrative fields concise and factual.',
    '- Do not infer missing information.',
  ].join('\n');
}

function buildResultSchema(job: AiVoiceDemoJob): Record<string, unknown> {
  const properties = Object.fromEntries(
    evalFields(SCRIPTS[job]).map((field) => [field.key, { type: field.type ?? 'string' }])
  );
  return { type: 'object', properties };
}

export function buildDemoAgentInput(job: AiVoiceDemoJob, company: string): HunarAgentWriteInput {
  const script = SCRIPTS[job];
  return {
    name: `Huntlo demo · ${job}`.slice(0, 64),
    personaName: script.personaName || 'Roshni',
    objective: script.objective(company, job),
    introduction: script.introduction(company, job),
    agentPrompt: buildAgentPrompt(job, company),
    resultPrompt: buildResultPrompt(job, company),
    resultSchema: buildResultSchema(job),
    questions: demoQuestionsFor(job, company),
  };
}
