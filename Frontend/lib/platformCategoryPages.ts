import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const PLATFORM_PATH = "/platform";

export type PlatformCategoryLink = {
  title: string;
  description: string;
  href: string;
};

export type PlatformCategoryBentoCard = PlatformCategoryLink & {
  span?: "md:col-span-2";
};

export type PlatformCategoryFaq = {
  question: string;
  answer: string;
};

export type PlatformCategoryPageContent = {
  slug: string;
  path: string;
  name: string;
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  geo: { askTopic: string; askPrompt: string };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    paragraphs: string[];
    primaryCta: string;
  };
  visual: {
    pair: [string, string];
    steps: string[];
    highlight: string;
    coreLabel: string;
    core: string;
  };
  problem: {
    eyebrow: string;
    title: string;
    intro: string;
    listLabel: string;
    list: string[];
    struggleLabel: string;
    struggle: string[];
  };
  definition: {
    title: string;
    answer: string;
    points: string[];
    closing: string;
  };
  split: {
    eyebrow: string;
    title: string;
    intro: string;
    leftLabel: string;
    rightLabel: string;
    rows: { stage: string; left: string; right: string }[];
  };
  bento: {
    eyebrow: string;
    title: string;
    cards: PlatformCategoryBentoCard[];
  };
  stack: {
    eyebrow: string;
    title: string;
    todayLabel: string;
    today: string[];
    tomorrowLabel: string;
    tomorrow: string[];
  };
  principles: {
    eyebrow: string;
    title: string;
    intro: string;
    not: string[];
    yes: string[];
  };
  faqIntro: string;
  faqs: PlatformCategoryFaq[];
  related: PlatformCategoryLink[];
  finalCta: {
    titleLead: string;
    titleAccent: string;
    body: string;
    ghost: { label: string; href: string };
  };
};

export const PLATFORM_ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions" },
  { label: "GCCs", href: "/solutions/global-capability-centers" },
  { label: "Staffing firms", href: "/solutions/it-staffing" },
  { label: "Recruitment agencies", href: "/solutions/rpo" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Startups and technical hiring", href: "/solutions" },
] as const;

export const PLATFORM_ENTERPRISE_SUPPORTS = [
  "Approved templates",
  "Role-based permissions",
  "Audit trails for AI actions",
  "ATS and CRM coexistence",
  "Email, WhatsApp and calendar integrations",
  "Multi-recruiter workflows",
] as const;

const CARD = {
  sourcing: {
    title: "AI Candidate Sourcing",
    description: "Intent-driven discovery of active and passive talent.",
    href: "/capabilities/ai-candidate-sourcing",
  },
  outreach: {
    title: "AI Candidate Outreach",
    description: "Personalized engagement across Email and WhatsApp.",
    href: "/capabilities/ai-candidate-outreach",
  },
  screening: {
    title: "AI Candidate Screening",
    description: "Rubric-based evaluation against role criteria.",
    href: "/capabilities/ai-candidate-screening",
  },
  voice: {
    title: "AI Voice Interviews",
    description: "Structured preliminary phone screens with transcripts.",
    href: "/capabilities/ai-voice-interviews",
  },
  scheduling: {
    title: "AI Interview Scheduling",
    description: "Candidate self-booking with panel calendar sync.",
    href: "/capabilities/ai-interview-scheduling",
  },
  engagement: {
    title: "AI Candidate Engagement",
    description: "Well-timed follow-ups between stages.",
    href: "/capabilities/ai-candidate-engagement",
  },
  automation: {
    title: "Recruitment Workflow Automation",
    description: "Cross-stage triggers and automated status progression.",
    href: "/capabilities/recruitment-workflow-automation",
  },
  crm: {
    title: "AI Recruitment CRM",
    description: "One living record for every candidate.",
    href: "/capabilities/ai-recruitment-crm",
  },
  capabilities: {
    title: "All AI Hiring Capabilities",
    description: "Explore every connected capability.",
    href: "/capabilities",
  },
} satisfies Record<string, PlatformCategoryLink>;

const LINK = {
  platform: {
    title: "Huntlo Platform",
    description: "Platform overview of connected hiring execution.",
    href: PLATFORM_PATH,
  },
  infrastructure: {
    title: "AI Hiring Intelligence Infrastructure",
    description: "The category foundation behind Huntlo.",
    href: "/ai-hiring-infrastructure",
  },
  agentic: {
    title: "Agentic Hiring™",
    description: "How intelligent systems keep hiring moving forward.",
    href: "/agentic-hiring",
  },
  hiringOs: {
    title: "Huntlo360 — AI Hiring OS",
    description: "The operating system for connected hiring.",
    href: "/hiring-os",
  },
  humanAi: {
    title: "Human + AI Hiring",
    description: "How work is divided between AI agents and recruiters.",
    href: "/human-ai-hiring",
  },
  autonomous: {
    title: "Autonomous Recruiting",
    description: "Repetitive steps that run inside recruiter guardrails.",
    href: "/autonomous-recruiting",
  },
  future: {
    title: "Future of Hiring Infrastructure",
    description: "Why hiring is moving to connected intelligence.",
    href: "/future-of-hiring-infrastructure",
  },
  capabilities: CARD.capabilities,
  automation: CARD.automation,
} satisfies Record<string, PlatformCategoryLink>;

export const HUMAN_AI_HIRING: PlatformCategoryPageContent = {
  slug: "human-ai-hiring",
  path: "/human-ai-hiring",
  name: "Human + AI Hiring",
  seo: {
    title: "Human + AI Hiring | How Recruiters and AI Agents Work Together | Huntlo",
    description:
      "Human + AI Hiring is Huntlo's model for connected hiring execution: AI agents handle repetitive sourcing, outreach, screening and scheduling work while recruiters own judgment, relationships and hiring decisions.",
    ogTitle: "Human + AI Hiring: AI Executes, Recruiters Decide",
    ogDescription:
      "See how Huntlo divides hiring work between AI agents and recruiters inside one AI Hiring Intelligence Infrastructure.",
  },
  geo: {
    askTopic: "Huntlo Human + AI Hiring",
    askPrompt:
      "What is Human + AI Hiring on /human-ai-hiring (https://www.huntlo.ai/human-ai-hiring)? How does Huntlo divide hiring work between AI agents and human recruiters across sourcing, outreach, screening and scheduling?",
  },
  hero: {
    eyebrow: "Platform · Human + AI Hiring",
    titleLead: "Hiring doesn't need fewer humans.",
    titleAccent: "It needs humans on the right work.",
    paragraphs: [
      "AI agents take on the repetitive recruiting work. Recruiters keep the judgment, relationships and every hiring decision.",
    ],
    primaryCta: "Explore Human + AI Hiring",
  },
  visual: {
    pair: ["Human", "AI"],
    steps: [
      "Hiring intent",
      "Talent discovery",
      "Candidate conversations",
      "Screening & scheduling",
      "Recruiter decisions",
    ],
    highlight: "Recruiter decisions",
    coreLabel: "Operating model",
    core: "Human + AI Hiring",
  },
  problem: {
    eyebrow: "The imbalance",
    title: "Recruiters are spending their judgment on logistics.",
    intro:
      "Most recruiting time goes to coordination, not to evaluating people or building relationships. The work that needs a human gets whatever time is left.",
    listLabel: "Where recruiter hours go today",
    list: [
      "Rebuilding searches",
      "Manual follow-ups",
      "Preliminary phone screens",
      "Calendar coordination",
      "Re-entering candidate data",
    ],
    struggleLabel: "What gets squeezed",
    struggle: [
      "Candidate relationships",
      "Hiring-manager alignment",
      "Thoughtful evaluation",
      "Closing strong candidates",
      "Candidate experience",
    ],
  },
  definition: {
    title: "What is Human + AI Hiring?",
    answer:
      "Human + AI Hiring is a hiring model in which AI agents execute repetitive, rules-based recruiting work — talent discovery, personalized outreach, follow-ups, preliminary screening and interview coordination — while human recruiters set intent, apply judgment, build relationships and make every hiring decision.",
    points: [
      "AI handles execution at scale",
      "Recruiters set intent and standards",
      "AI actions are visible and reviewable",
      "Humans own relationships and closing",
      "Final hiring decisions stay with people",
      "Context flows across every stage",
    ],
    closing: "AI provides execution speed. Humans provide judgment and connection.",
  },
  split: {
    eyebrow: "Who does what",
    title: "How work is divided across the hiring workflow.",
    intro:
      "Every stage has a clear split: AI agents carry the repetitive load, and recruiters keep the moments that need judgment, empathy or negotiation.",
    leftLabel: "AI agents handle",
    rightLabel: "Recruiters own",
    rows: [
      {
        stage: "Discovery",
        left: "Translate role briefs into talent signals and surface active and passive candidates.",
        right: "Calibrate requirements, set non-negotiable standards and review shortlists.",
      },
      {
        stage: "Outreach",
        left: "Draft personalized messages and automate follow-up timing across Email and WhatsApp.",
        right: "Step into high-priority conversations and build relationships.",
      },
      {
        stage: "Screening",
        left: "Evaluate profiles against role criteria and run structured preliminary voice screens.",
        right: "Review qualification outcomes, override where needed and decide who advances.",
      },
      {
        stage: "Scheduling",
        left: "Coordinate panel availability, candidate self-booking and reminders.",
        right: "Prepare interviewers and brief candidates on what to expect.",
      },
      {
        stage: "Interviews & decisions",
        left: "Keep transcripts, scores and context together in one candidate record.",
        right: "Run behavioral interviews, negotiate offers and make the final decision.",
      },
      {
        stage: "Talent pools & CRM",
        left: "Log interaction history and keep past candidates within reach.",
        right: "Nurture long-term relationships and community ties.",
      },
    ],
  },
  bento: {
    eyebrow: "Capabilities behind the model",
    title: "Where AI agents carry the load.",
    cards: [
      { ...CARD.sourcing, span: "md:col-span-2" },
      CARD.outreach,
      CARD.screening,
      { ...CARD.voice, span: "md:col-span-2" },
      CARD.scheduling,
      CARD.automation,
      { ...CARD.crm, span: "md:col-span-2" },
      { ...CARD.capabilities, span: "md:col-span-2" },
    ],
  },
  stack: {
    eyebrow: "The shift",
    title: "From human-only or AI-only to Human + AI.",
    todayLabel: "Human-only or AI-only",
    today: [
      "Recruiters buried in logistics",
      "Automation without judgment",
      "Disconnected tools",
      "Inconsistent candidate experiences",
    ],
    tomorrowLabel: "Human + AI Hiring",
    tomorrow: [
      "AI agents handle repetitive execution",
      "Recruiters focus on judgment",
      "One connected workflow",
      "Visible, reviewable AI actions",
      "Consistent candidate experiences",
    ],
  },
  principles: {
    eyebrow: "Guardrails",
    title: "Principles that keep people accountable.",
    intro:
      "Human + AI Hiring only works when it is clear where AI stops and human responsibility begins.",
    not: ["Replacing recruiters", "Black-box decisions", "Automating relationships"],
    yes: [
      "Recruiters set intent and criteria",
      "AI actions are logged and reviewable",
      "Recruiters can override AI assessments",
      "Sensitive conversations stay human",
      "Final decisions stay with the hiring team",
    ],
  },
  faqIntro:
    "Clear answers about how Huntlo divides hiring work between AI agents and recruiters.",
  faqs: [
    {
      question: "What is Human + AI Hiring?",
      answer:
        "Human + AI Hiring is a hiring model in which AI agents execute repetitive recruiting work — talent discovery, personalized outreach, follow-ups, preliminary screening and interview coordination — while recruiters set intent, apply judgment, build relationships and make every hiring decision.",
    },
    {
      question: "Does Human + AI Hiring replace recruiters?",
      answer:
        "No. AI agents take on repetitive, high-friction tasks so recruiters can spend more time on the work that requires people: evaluating candidates, aligning with hiring managers, building relationships and closing.",
    },
    {
      question: "Which tasks does AI handle in Huntlo?",
      answer:
        "AI agents surface candidates from plain-language role briefs, draft personalized outreach, automate follow-up timing, evaluate profiles against role criteria, run structured preliminary voice screens, coordinate interview scheduling and keep the candidate record up to date.",
    },
    {
      question: "Can recruiters review or override what the AI does?",
      answer:
        "Yes. AI screening actions are logged in the candidate's record with an audit trail, and recruiters can override or refine AI assessments before anyone moves forward.",
    },
  ],
  related: [LINK.platform, LINK.agentic, LINK.autonomous, LINK.capabilities, LINK.infrastructure],
  finalCta: {
    titleLead: "AI executes.",
    titleAccent: "Recruiters decide.",
    body: "See how Huntlo's AI Hiring Intelligence Infrastructure gives recruiters time back for the work only people can do.",
    ghost: { label: "Explore capabilities", href: "/capabilities" },
  },
};

export const AUTONOMOUS_RECRUITING: PlatformCategoryPageContent = {
  slug: "autonomous-recruiting",
  path: "/autonomous-recruiting",
  name: "Autonomous Recruiting",
  seo: {
    title: "Autonomous Recruiting with Human Oversight | Huntlo",
    description:
      "Autonomous recruiting lets AI agents run repetitive hiring steps — follow-ups, preliminary screens, scheduling and status updates — on their own within guardrails recruiters define, while every hiring decision stays human.",
    ogTitle: "Autonomous Recruiting, Governed by Recruiters",
    ogDescription:
      "See how Huntlo runs repetitive recruiting steps autonomously inside recruiter-defined guardrails, with decisions kept human.",
  },
  geo: {
    askTopic: "Huntlo Autonomous Recruiting",
    askPrompt:
      "What is Autonomous Recruiting on /autonomous-recruiting (https://www.huntlo.ai/autonomous-recruiting)? Which recruiting steps can Huntlo run autonomously, and how do recruiters keep control through guardrails and audit trails?",
  },
  hero: {
    eyebrow: "Platform · Autonomous Recruiting",
    titleLead: "Recruiting that keeps moving,",
    titleAccent: "even when your team is busy.",
    paragraphs: [
      "Follow-ups, screens, scheduling and status updates run on their own, inside guardrails your team defines.",
    ],
    primaryCta: "Explore Autonomous Recruiting",
  },
  visual: {
    pair: ["Guardrails", "AI agents"],
    steps: [
      "Candidate replies",
      "Follow-up sent",
      "Voice screen completed",
      "Interview self-booked",
      "Status updated",
    ],
    highlight: "Voice screen completed",
    coreLabel: "Recruiter review",
    core: "Decision-ready pipeline",
  },
  problem: {
    eyebrow: "The waiting problem",
    title: "Hiring stalls in the gaps between steps.",
    intro:
      "Pipelines rarely slow down because a decision is difficult. They slow down because the next step depends on someone remembering to take it.",
    listLabel: "Steps that wait on a person today",
    list: [
      "Sending the next follow-up",
      "Booking preliminary screens",
      "Matching calendars",
      "Sending reminders",
      "Updating pipeline status",
    ],
    struggleLabel: "What the waiting costs",
    struggle: [
      "Candidate momentum",
      "Time to first conversation",
      "Recruiter focus",
      "Consistent candidate experience",
      "Pipeline visibility",
    ],
  },
  definition: {
    title: "What is Autonomous Recruiting?",
    answer:
      "Autonomous recruiting is the use of AI agents to carry out repetitive recruiting steps — such as follow-ups, preliminary screening calls, interview scheduling, reminders and status updates — without waiting for a recruiter to trigger each one, while recruiters define the guardrails and make every hiring decision.",
    points: [
      "Steps run when candidates act",
      "Guardrails set by recruiters",
      "Approved templates only",
      "Every AI action logged",
      "Exceptions escalate to people",
      "Hiring decisions stay human",
    ],
    closing: "Autonomy for execution. Accountability for people.",
  },
  split: {
    eyebrow: "Levels of autonomy",
    title: "What runs autonomously — and what never does.",
    intro:
      "Huntlo separates the steps that can run on their own from the steps that always require a person.",
    leftLabel: "Runs autonomously",
    rightLabel: "Always human",
    rows: [
      {
        stage: "Outreach",
        left: "Follow-ups for non-responders and closing messages sent on schedule.",
        right: "Messaging strategy and high-priority conversations.",
      },
      {
        stage: "Screening",
        left: "Structured preliminary voice screens and evaluation against role criteria.",
        right: "Reviewing outcomes, overriding assessments and deciding who advances.",
      },
      {
        stage: "Scheduling",
        left: "Scheduling links, confirmations, reminders and rescheduling.",
        right: "Interview logistics exceptions and panel preparation.",
      },
      {
        stage: "Pipeline updates",
        left: "Status progression when candidates reply, qualify or book.",
        right: "Moving candidates to offer or closing them out.",
      },
      {
        stage: "Engagement",
        left: "Well-timed nudges and answers to common role questions.",
        right: "Sensitive conversations, negotiation and closing.",
      },
      {
        stage: "Records",
        left: "Logging transcripts, replies and outcomes to the candidate record.",
        right: "Interpreting context and making the hiring call.",
      },
    ],
  },
  bento: {
    eyebrow: "Capabilities that run autonomously",
    title: "The steps Huntlo can take off your plate.",
    cards: [
      { ...CARD.automation, span: "md:col-span-2" },
      CARD.engagement,
      CARD.voice,
      { ...CARD.scheduling, span: "md:col-span-2" },
      CARD.outreach,
      CARD.screening,
      { ...CARD.crm, span: "md:col-span-2" },
      { ...CARD.capabilities, span: "md:col-span-2" },
    ],
  },
  stack: {
    eyebrow: "The shift",
    title: "From manual coordination to governed autonomy.",
    todayLabel: "Manual coordination",
    today: [
      "Reminders tracked by memory",
      "Screens booked one by one",
      "Calendars matched over email",
      "Statuses updated by hand",
    ],
    tomorrowLabel: "Autonomous Recruiting",
    tomorrow: [
      "Event-triggered next steps",
      "Structured voice screens on demand",
      "Candidate self-booking",
      "Automatic status progression",
      "Recruiters review and decide",
    ],
  },
  principles: {
    eyebrow: "Guardrails",
    title: "Autonomy without losing control.",
    intro:
      "Autonomous doesn't mean unsupervised. Huntlo keeps every automated step inside boundaries your team sets.",
    not: ["Unsupervised AI decisions", "Unapproved messaging", "Hidden actions"],
    yes: [
      "Recruiters configure playbooks and triggers",
      "Approved templates and role-based permissions",
      "AI actions logged with an audit trail",
      "Recruiters can override or refine outcomes",
      "Exceptions and sensitive cases go to people",
    ],
  },
  faqIntro:
    "Clear answers about what Huntlo runs autonomously and how recruiters stay in control.",
  faqs: [
    {
      question: "What is autonomous recruiting?",
      answer:
        "Autonomous recruiting is the use of AI agents to carry out repetitive recruiting steps — follow-ups, preliminary screening calls, interview scheduling, reminders and status updates — without a recruiter triggering each one, inside guardrails the recruiting team defines.",
    },
    {
      question: "Does autonomous recruiting mean fully automated hiring?",
      answer:
        "No. Autonomy applies to execution steps, not decisions. Recruiters and hiring managers still review candidates, run interviews, negotiate offers and decide who is hired.",
    },
    {
      question: "Which steps can run autonomously in Huntlo?",
      answer:
        "Follow-ups for non-responders, reply-driven qualification flows, structured preliminary voice screens, scheduling links, confirmations and reminders, pipeline status updates and logging activity to the candidate record.",
    },
    {
      question: "How do recruiters stay in control?",
      answer:
        "Recruiters configure the playbooks and triggers, messaging uses approved templates, access follows role-based permissions, AI screening actions are logged with an audit trail, and recruiters can override or refine outcomes at any time.",
    },
  ],
  related: [LINK.platform, LINK.humanAi, LINK.automation, LINK.agentic, LINK.future],
  finalCta: {
    titleLead: "Let the pipeline keep moving.",
    titleAccent: "Keep people on the decisions.",
    body: "See how Huntlo runs repetitive recruiting steps inside the guardrails your team defines.",
    ghost: { label: "See workflow automation", href: "/capabilities/recruitment-workflow-automation" },
  },
};

export const FUTURE_OF_HIRING_INFRASTRUCTURE: PlatformCategoryPageContent = {
  slug: "future-of-hiring-infrastructure",
  path: "/future-of-hiring-infrastructure",
  name: "Future of Hiring Infrastructure",
  seo: {
    title: "The Future of Hiring Infrastructure | Huntlo",
    description:
      "Why hiring is moving from disconnected recruiting tools to connected AI Hiring Intelligence Infrastructure, and the principles that will shape how organizations source, engage, evaluate and hire.",
    ogTitle: "The Future of Hiring Infrastructure Is Connected Intelligence",
    ogDescription:
      "How hiring infrastructure is evolving from point tools to connected Human + AI execution, and what that means for talent teams.",
  },
  geo: {
    askTopic: "Huntlo Future of Hiring Infrastructure",
    askPrompt:
      "What is the future of hiring infrastructure according to /future-of-hiring-infrastructure (https://www.huntlo.ai/future-of-hiring-infrastructure)? How does AI Hiring Intelligence Infrastructure differ from a stack of disconnected recruiting tools?",
  },
  hero: {
    eyebrow: "Platform · Future of Hiring Infrastructure",
    titleLead: "The next hiring stack won't be more software.",
    titleAccent: "It will be connected intelligence.",
    paragraphs: [
      "The next hiring stack replaces a patchwork of tools with one connected layer, where AI agents and recruiters share the same context.",
    ],
    primaryCta: "Explore the future of hiring",
  },
  visual: {
    pair: ["Point tools", "Connected layer"],
    steps: [
      "Systems of record",
      "Point solutions",
      "AI features",
      "Connected execution",
      "Hiring intelligence",
    ],
    highlight: "Connected execution",
    coreLabel: "What comes next",
    core: "AI Hiring Intelligence Infrastructure",
  },
  problem: {
    eyebrow: "How we got here",
    title: "Each new tool solved one task and added one more seam.",
    intro:
      "Hiring infrastructure grew by accumulation. Every stage got its own tool, and every handoff between tools became a place where context — and candidates — were lost.",
    listLabel: "The typical hiring stack",
    list: [
      "ATS",
      "Sourcing extensions",
      "Email tools",
      "Scheduling links",
      "Assessment platforms",
      "Spreadsheets",
    ],
    struggleLabel: "The seams between them",
    struggle: [
      "Re-keyed candidate data",
      "Lost conversation context",
      "Slow handoffs between stages",
      "Inconsistent candidate experiences",
      "Reporting assembled by hand",
    ],
  },
  definition: {
    title: "What is the future of hiring infrastructure?",
    answer:
      "The future of hiring infrastructure is a connected layer — which Huntlo calls AI Hiring Intelligence Infrastructure — where sourcing, outreach, screening, interviews, scheduling and candidate records share one operational state, AI agents execute repetitive work across stages, and recruiters govern the system and make the decisions.",
    points: [
      "One shared operational state",
      "Intent-driven discovery",
      "Conversations, not blasts",
      "Governed automation",
      "Human accountability",
      "Works alongside your ATS",
    ],
    closing: "Recruitment became software. Hiring is becoming intelligence.",
  },
  split: {
    eyebrow: "Infrastructure shifts",
    title: "Six shifts shaping the next hiring stack.",
    intro:
      "Across every stage of hiring, the direction of change is the same: from disconnected, manual steps to connected, governed execution.",
    leftLabel: "Yesterday",
    rightLabel: "Tomorrow",
    rows: [
      {
        stage: "Architecture",
        left: "Disconnected point solutions and legacy databases.",
        right: "One connected layer with shared candidate context.",
      },
      {
        stage: "Discovery",
        left: "Static Boolean keywords and passive job-board postings.",
        right: "Intent-driven discovery from plain-language role briefs.",
      },
      {
        stage: "Engagement",
        left: "Generic mass outreach with manual follow-up.",
        right: "Personalized, multi-channel conversations.",
      },
      {
        stage: "Evaluation",
        left: "Keyword parsing and manual preliminary phone calls.",
        right: "Rubric-based screening and structured voice screens.",
      },
      {
        stage: "Coordination",
        left: "Manual handoffs and calendar back-and-forth.",
        right: "Event-triggered workflows and candidate self-scheduling.",
      },
      {
        stage: "Recruiter role",
        left: "Buried in data entry and logistics.",
        right: "Focused on judgment, relationships and closing.",
      },
    ],
  },
  bento: {
    eyebrow: "Building blocks",
    title: "What connected hiring infrastructure is made of.",
    cards: [
      { ...LINK.infrastructure, span: "md:col-span-2" },
      LINK.hiringOs,
      LINK.agentic,
      { ...LINK.humanAi, span: "md:col-span-2" },
      LINK.autonomous,
      {
        title: "Workflow Orchestration",
        description: "How hiring stages coordinate with each other.",
        href: "/workflow-orchestration",
      },
      { ...LINK.capabilities, span: "md:col-span-2" },
      {
        title: "Integrations",
        description: "Connect email, WhatsApp and calendar tools.",
        href: "/integrations",
        span: "md:col-span-2",
      },
    ],
  },
  stack: {
    eyebrow: "The shift",
    title: "From a tool stack to an intelligence layer.",
    todayLabel: "Today's tool stack",
    today: [
      "A tool for every stage",
      "Context lost at every handoff",
      "Automation without shared state",
      "Recruiters as system integrators",
    ],
    tomorrowLabel: "Connected hiring infrastructure",
    tomorrow: [
      "Shared operational state",
      "AI agents across every stage",
      "Human + AI execution",
      "Visibility from first contact to hire",
      "Better hiring decisions",
    ],
  },
  principles: {
    eyebrow: "Principles",
    title: "What future-ready hiring infrastructure should guarantee.",
    intro:
      "Whatever tools a team chooses, the next generation of hiring infrastructure should be judged against a few clear principles.",
    not: ["More disconnected tools", "Automation without oversight", "Data trapped in silos"],
    yes: [
      "Context that follows the candidate",
      "Automation governed by recruiters",
      "Decisions that stay human",
      "Interoperability with existing systems",
      "Transparent, auditable AI actions",
    ],
  },
  faqIntro:
    "Clear answers for talent leaders planning the next generation of their hiring stack.",
  faqs: [
    {
      question: "What is hiring infrastructure?",
      answer:
        "Hiring infrastructure is the combination of systems, data and workflows an organization uses to find, engage, evaluate and hire candidates — typically an ATS plus tools for sourcing, outreach, scheduling, assessments and reporting.",
    },
    {
      question: "Why is hiring infrastructure changing?",
      answer:
        "Because stacking a separate tool on every stage creates seams: candidate data is re-keyed, conversation context is lost and handoffs slow down. Connected infrastructure lets every stage share the same context, and AI agents can execute repetitive work across stages.",
    },
    {
      question: "Will future hiring infrastructure replace the ATS?",
      answer:
        "Not necessarily. Huntlo is designed to complement existing ATS and recruitment CRM systems — handling sourcing, outreach and screening context and feeding qualified candidates into the systems teams already use.",
    },
    {
      question: "What role do recruiters play in future hiring infrastructure?",
      answer:
        "Recruiters move from coordinating tools to governing outcomes: they set hiring intent and criteria, review AI outputs, build relationships, run interviews and make hiring decisions.",
    },
  ],
  related: [LINK.platform, LINK.infrastructure, LINK.hiringOs, LINK.agentic, LINK.humanAi],
  finalCta: {
    titleLead: "Recruitment became software.",
    titleAccent: "Hiring is becoming intelligence.",
    body: "See how Huntlo is building AI Hiring Intelligence Infrastructure for connected Human + AI hiring.",
    ghost: { label: "Explore AI Hiring Infrastructure", href: "/ai-hiring-infrastructure" },
  },
};

export const PLATFORM_HUB_LINKS = [
  {
    title: "Huntlo Platform",
    description:
      "The platform overview: sourcing, outreach, screening, interviews and scheduling connected in one AI Hiring Intelligence Infrastructure.",
    href: PLATFORM_PATH,
    icon: "apps",
    badge: "Overview",
  },
  {
    title: "AI Hiring Intelligence Infrastructure",
    description:
      "The category foundation: connected Human + AI hiring execution instead of disconnected recruiting tools.",
    href: "/ai-hiring-infrastructure",
    icon: "hub",
    badge: "Category",
  },
  {
    title: "Agentic Hiring™",
    description:
      "How intelligent systems continuously move hiring forward alongside hiring teams.",
    href: "/agentic-hiring",
    icon: "auto_awesome",
    badge: "Agentic AI",
  },
  {
    title: "Huntlo360 — AI Hiring OS",
    description:
      "The operating system connecting talent discovery, candidate engagement and hiring execution.",
    href: "/hiring-os",
    icon: "dashboard",
    badge: "Hiring OS",
  },
  {
    title: "Human + AI Hiring",
    description:
      "How work is divided: AI agents execute repetitive work, recruiters own judgment and decisions.",
    href: "/human-ai-hiring",
    icon: "handshake",
    badge: "Operating model",
  },
  {
    title: "Autonomous Recruiting",
    description:
      "Repetitive recruiting steps that run on their own inside guardrails recruiters define.",
    href: "/autonomous-recruiting",
    icon: "bolt",
    badge: "Governed autonomy",
  },
  {
    title: "Future of Hiring Infrastructure",
    description:
      "Why hiring is moving from a stack of tools to one connected intelligence layer.",
    href: "/future-of-hiring-infrastructure",
    icon: "rocket_launch",
    badge: "Perspective",
  },
] as const;

export const PLATFORM_CATEGORY_PAGES = [
  HUMAN_AI_HIRING,
  AUTONOMOUS_RECRUITING,
  FUTURE_OF_HIRING_INFRASTRUCTURE,
] as const;

export function platformCategoryMetadata(page: PlatformCategoryPageContent) {
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    ogTitle: page.seo.ogTitle,
    ogDescription: page.seo.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: page.path,
  });
}
