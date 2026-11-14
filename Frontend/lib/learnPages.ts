import type { BreadcrumbSchemaItem } from "@/lib/jsonLd";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const LEARN_PATH = "/learn";

export const LEARN_SEO = {
  title: "AI Hiring Knowledge Centre | Huntlo",
  description:
    "Learn AI hiring intelligence, recruiting agents, agentic hiring, candidate intelligence, orchestration and how AI hiring works alongside ATS platforms.",
  ogTitle: "AI Hiring Knowledge Centre",
  ogDescription:
    "Clear definitions, worked examples and honest limitations for the core concepts behind AI-assisted hiring — with links to the Huntlo capabilities that apply them.",
} as const;

export const LEARN_OG_IMAGE = OG_IMAGES.resources;

export function learnMetadata() {
  return buildPageMetadata({
    title: LEARN_SEO.title,
    description: LEARN_SEO.description,
    ogTitle: LEARN_SEO.ogTitle,
    ogDescription: LEARN_SEO.ogDescription,
    ogImage: LEARN_OG_IMAGE,
    path: LEARN_PATH,
  });
}

export type LearnCategory =
  | "Foundations"
  | "Agents and orchestration"
  | "Candidate and conversation insight";

export const LEARN_CATEGORIES: { name: LearnCategory; intro: string }[] = [
  {
    name: "Foundations",
    intro: "The core idea of AI hiring intelligence, and how AI hiring platforms relate to the applicant tracking systems most teams already use.",
  },
  {
    name: "Agents and orchestration",
    intro: "How AI agents take on recruiting tasks, and how orchestration connects agents, recruiters and systems into one workflow.",
  },
  {
    name: "Candidate and conversation insight",
    intro: "How hiring teams build an evidence-based understanding of each candidate from profiles, assessments and conversations.",
  },
];

export type LearnLink = {
  name: string;
  href: string;
  icon: string;
  description: string;
};

export type LearnCard = {
  icon: string;
  title: string;
  body: string;
};

export type LearnTable = {
  title: string;
  intro: string;
  /** First header labels the row-label column. */
  headers: string[];
  rows: { label: string; href?: string; cells: string[] }[];
};

export type LearnFaq = {
  question: string;
  /** Supports [label](/path) links and **bold**; stripped to plain text for JSON-LD. */
  answer: string;
};

export type LearnSource = {
  title: string;
  publisher: string;
  url: string;
  /** Publication date (ISO). Omit for living product pages and give `accessed` instead. */
  date?: string;
  /** ISO date the page was last checked, for sources without a fixed publication date. */
  accessed?: string;
};

export type LearnFlow = {
  label: string;
  /** `sequence` renders arrowed steps; `sources` renders inputs that combine into `result`. */
  kind: "sequence" | "sources";
  steps: { label: string; detail?: string }[];
  result?: string;
};

export type LearnPage = {
  slug: string;
  /** Breadcrumb label and card title. */
  name: string;
  /** The page H1. */
  title: string;
  category: LearnCategory;
  /** Hub card summary. */
  summary: string;
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  /** Short, self-contained answer shown directly under the H1. */
  definition: string;
  /** One-line human-oversight statement shown with the definition. */
  oversight: string;
  /** Diagram shown in the first viewport, beneath the definition. */
  flow: LearnFlow;
  /** Separates the general industry concept from Huntlo's own (often trademarked) term. */
  termStatus: { industry: string; huntlo: string };
  keyFacts: { label: string; value: string }[];
  whyItMatters: { title: string; intro: string; points: LearnCard[] };
  howItWorks: {
    title: string;
    intro: string;
    steps: LearnCard[];
    example: { title: string; scenario: string };
  };
  /** Optional extra table rendered after "How it works" (types, side-by-side comparisons). */
  breakdown?: LearnTable;
  benefits: string[];
  limitations: string[];
  misconceptions: { myth: string; reality: string }[];
  comparison: LearnTable;
  faqs: LearnFaq[];
  /** 3–5 contextual links to parent, sibling, capability and platform pages. */
  related: LearnLink[];
  sources: LearnSource[];
  /** ISO date (YYYY-MM-DD). */
  published: string;
  /** ISO date (YYYY-MM-DD). */
  lastUpdated: string;
};

const SOURCES = {
  euAiAct: {
    title: "Regulation (EU) 2024/1689 (Artificial Intelligence Act)",
    publisher: "Official Journal of the European Union, via EUR-Lex",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    date: "2024-07-12",
  },
  gdpr: {
    title: "Regulation (EU) 2016/679 (General Data Protection Regulation), including Article 22",
    publisher: "Official Journal of the European Union, via EUR-Lex",
    url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    date: "2016-04-27",
  },
  nistAiRmf: {
    title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
    publisher: "U.S. National Institute of Standards and Technology (NIST)",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    date: "2023-01-26",
  },
  nycAedt: {
    title: "Automated Employment Decision Tools (Local Law 144 of 2021)",
    publisher: "NYC Department of Consumer and Worker Protection",
    url: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
    date: "2023-07-05",
  },
  linkedinHiringRelease: {
    title: "2026 LinkedIn Hiring Release features",
    publisher: "LinkedIn Talent Solutions",
    url: "https://business.linkedin.com/hire/product-update/hire-release",
    accessed: "2026-11-13",
  },
  seekoutAi: {
    title: "AI Features in SeekOut",
    publisher: "SeekOut Help Center",
    url: "https://support.seekout.com/en/articles/13719568-ai-features-in-seekout",
    accessed: "2026-11-13",
  },
  hireezAi: {
    title: "AI Sourcing | Automated Candidate Sourcing",
    publisher: "hireEZ",
    url: "https://hireez.com/ai-sourcing/",
    accessed: "2026-11-13",
  },
  eightfoldProducts: {
    title: "Talent Intelligence Platform",
    publisher: "Eightfold AI",
    url: "https://eightfold.ai/products/",
    accessed: "2026-11-13",
  },
} satisfies Record<string, LearnSource>;

const LINKS = {
  infrastructure: {
    name: "AI Hiring Intelligence Infrastructure",
    href: "/ai-hiring-infrastructure",
    icon: "hub",
    description: "Huntlo's category: the intelligence layer that connects every hiring stage.",
  },
  agenticHiring: {
    name: "Agentic Hiring™",
    href: "/agentic-hiring",
    icon: "smart_toy",
    description: "How Huntlo applies agentic hiring with recruiters in control.",
  },
  humanAi: {
    name: "Human + AI Hiring",
    href: "/human-ai-hiring",
    icon: "diversity_3",
    description: "Where recruiters and AI agents each add the most value.",
  },
  recruitingAgents: {
    name: "Huntlo AI Recruiting Agents",
    href: "/recruiting-agents",
    icon: "groups",
    description: "Huntlo's sourcing, outreach, screening, interview and scheduling agents.",
  },
  candidateIntelligence: {
    name: "Huntlo Candidate Intelligence™",
    href: "/candidate-intelligence",
    icon: "person_search",
    description: "The product view of candidate intelligence inside Huntlo.",
  },
  conversationIntelligence: {
    name: "Huntlo Conversation Intelligence™",
    href: "/outreach-engine",
    icon: "forum",
    description: "Outreach built around meaningful candidate conversations.",
  },
  orchestration: {
    name: "Hiring Intelligence Orchestration™",
    href: "/workflow-orchestration",
    icon: "account_tree",
    description: "How Huntlo connects people, context and workflow stages.",
  },
  hiringOs: {
    name: "Huntlo360 — AI Hiring OS",
    href: "/hiring-os",
    icon: "dashboard",
    description: "One operating system for sourcing, engagement and hiring execution.",
  },
  huntlo360: {
    name: "Huntlo360",
    href: "/huntlo360",
    icon: "dashboard",
    description: "Huntlo's hiring operating system for Human + AI hiring.",
  },
  integrations: {
    name: "Huntlo Integrations",
    href: "/integrations",
    icon: "extension",
    description: "Tools and channels Huntlo connects with today.",
  },
  compare: {
    name: "Compare Huntlo",
    href: "/compare",
    icon: "compare_arrows",
    description: "Fair, side-by-side comparisons with other recruiting tools.",
  },
  whatsapp: {
    name: "WhatsApp Recruiting",
    href: "/whatsapp-recruiting",
    icon: "chat",
    description: "Real-time candidate conversations on WhatsApp.",
  },
  sourcingCap: {
    name: "AI Candidate Sourcing",
    href: "/capabilities/ai-candidate-sourcing",
    icon: "person_search",
    description: "Capability: intent-driven discovery of active and passive talent.",
  },
  screeningCap: {
    name: "AI Candidate Screening",
    href: "/capabilities/ai-candidate-screening",
    icon: "fact_check",
    description: "Capability: criteria-based evaluation reviewed by recruiters.",
  },
  matchingCap: {
    name: "AI Candidate Matching",
    href: "/capabilities/ai-candidate-matching",
    icon: "join_inner",
    description: "Capability: compatibility between candidates and open roles.",
  },
  outreachCap: {
    name: "AI Candidate Outreach",
    href: "/capabilities/ai-candidate-outreach",
    icon: "send",
    description: "Capability: personalised outreach over email and WhatsApp.",
  },
  engagementCap: {
    name: "AI Candidate Engagement",
    href: "/capabilities/ai-candidate-engagement",
    icon: "mark_chat_read",
    description: "Capability: timely follow-ups that keep candidates engaged.",
  },
  voiceCap: {
    name: "AI Voice Interviews",
    href: "/capabilities/ai-voice-interviews",
    icon: "record_voice_over",
    description: "Capability: structured preliminary phone screens with transcripts.",
  },
  schedulingCap: {
    name: "AI Interview Scheduling",
    href: "/capabilities/ai-interview-scheduling",
    icon: "event_available",
    description: "Capability: candidate self-booking coordinated with panel calendars.",
  },
  crmCap: {
    name: "AI Recruitment CRM",
    href: "/capabilities/ai-recruitment-crm",
    icon: "contacts",
    description: "Capability: one living record for every candidate relationship.",
  },
  talentPoolCap: {
    name: "AI Talent Pool Management",
    href: "/capabilities/ai-talent-pool-management",
    icon: "groups",
    description: "Capability: organised, reusable talent pools for future roles.",
  },
  analyticsCap: {
    name: "AI Recruitment Analytics",
    href: "/capabilities/ai-recruitment-analytics",
    icon: "query_stats",
    description: "Capability: visibility into outreach, replies and pipeline progress.",
  },
  automationCap: {
    name: "Recruitment Workflow Automation",
    href: "/capabilities/recruitment-workflow-automation",
    icon: "schema",
    description: "Capability: cross-stage triggers and automated status changes.",
  },
  learnIntelligence: {
    name: "What Is AI Hiring Intelligence?",
    href: "/learn/what-is-ai-hiring-intelligence",
    icon: "school",
    description: "Guide: the concept that connects hiring data into decisions.",
  },
  learnAgentic: {
    name: "What Is Agentic Hiring?",
    href: "/learn/what-is-agentic-hiring",
    icon: "school",
    description: "Guide: AI agents pursuing hiring goals under recruiter oversight.",
  },
  learnAgents: {
    name: "What Are AI Recruiting Agents?",
    href: "/learn/what-are-ai-recruiting-agents",
    icon: "school",
    description: "Guide: the main types of recruiting agents and their limits.",
  },
  learnCandidate: {
    name: "What Is Candidate Intelligence?",
    href: "/learn/what-is-candidate-intelligence",
    icon: "school",
    description: "Guide: an evidence-based view of each candidate over time.",
  },
  learnConversation: {
    name: "Conversation Intelligence in Recruitment",
    href: "/learn/conversation-intelligence-recruitment",
    icon: "school",
    description: "Guide: insight from candidate emails, messages and calls.",
  },
  learnOrchestration: {
    name: "What Is AI Hiring Orchestration?",
    href: "/learn/ai-hiring-orchestration",
    icon: "school",
    description: "Guide: the layer that coordinates agents, people and systems.",
  },
  learnAts: {
    name: "AI Hiring vs Traditional ATS",
    href: "/learn/ai-hiring-vs-ats",
    icon: "school",
    description: "Guide: what each system does and when to use both.",
  },
} satisfies Record<string, LearnLink>;

const PUBLISHED = "2026-11-13";

export const LEARN_PAGES: LearnPage[] = [
  {
    slug: "what-is-ai-hiring-intelligence",
    name: "AI Hiring Intelligence",
    title: "What Is AI Hiring Intelligence?",
    category: "Foundations",
    summary:
      "How AI connects candidate, conversation and pipeline data so recruiters can make faster, better-evidenced decisions.",
    seo: {
      title: "What Is AI Hiring Intelligence? Definition & Examples | Huntlo",
      description:
        "Learn what AI hiring intelligence is, how it combines candidate, conversation and pipeline data, and how recruiters use it to make better decisions.",
      ogTitle: "What Is AI Hiring Intelligence?",
      ogDescription:
        "A plain-language definition of AI hiring intelligence, how it works in practice, where it helps and where human judgment still matters.",
    },
    definition:
      "AI hiring intelligence is the use of artificial intelligence to connect and interpret recruitment data such as candidate profiles, conversations, assessments and pipeline activity. Its purpose is to help recruiters make better-evidenced decisions and automate selected tasks while keeping people responsible for consequential hiring decisions.",
    oversight:
      "AI organises the evidence and suggests next steps. Recruiters and hiring managers stay responsible for every consequential decision.",
    flow: {
      label: "Inputs, intelligence, actions",
      kind: "sequence",
      steps: [
        { label: "Inputs", detail: "Profiles, conversations, assessments, pipeline events" },
        { label: "Intelligence", detail: "Connected and interpreted against role criteria" },
        { label: "Actions", detail: "Suggested next steps" },
        { label: "Human decision", detail: "A recruiter approves, edits or rejects" },
      ],
    },
    termStatus: {
      industry:
        "An emerging industry term rather than a formal standard. Vendors and analysts use it for AI that connects and interprets hiring data across tools.",
      huntlo:
        "Huntlo uses \u201CAI Hiring Intelligence Infrastructure\u201D as the name of its own product category. This guide explains the general concept; Huntlo's implementation is described separately.",
    },
    keyFacts: [
      { label: "Type", value: "Recruitment technology concept" },
      { label: "Term status", value: "Emerging industry term, not a formal standard" },
      { label: "Works on", value: "Profiles, conversations, assessments and pipeline events" },
      { label: "Used by", value: "Recruiters, talent acquisition leaders and hiring managers" },
      { label: "Huntlo category", value: "AI Hiring Intelligence Infrastructure" },
    ],
    whyItMatters: {
      title: "Why does AI hiring intelligence matter in recruitment?",
      intro:
        "Hiring information is usually scattered across job boards, inboxes, spreadsheets, calendars and an applicant tracking system. Each tool holds a fragment, so decisions are often made on partial context.",
      points: [
        {
          icon: "call_split",
          title: "Context is fragmented",
          body: "Sourcing notes, outreach replies, screening answers and interview feedback often live in different tools, so no one sees the whole picture of a candidate.",
        },
        {
          icon: "hourglass_empty",
          title: "Recruiter time goes to admin",
          body: "Re-reading profiles, re-keying data and chasing updates takes time away from advising hiring managers and building candidate relationships.",
        },
        {
          icon: "balance",
          title: "Evaluations are inconsistent",
          body: "Without shared criteria, two recruiters can judge the same candidate differently. Structured intelligence makes the evidence behind each decision visible and comparable.",
        },
      ],
    },
    howItWorks: {
      title: "How does AI hiring intelligence work?",
      intro:
        "Most implementations follow four layers, moving from raw signals to a recommended next step that a person can accept, change or reject.",
      steps: [
        {
          icon: "input",
          title: "Capture signals",
          body: "Profiles, applications, messages, call transcripts, assessment results and calendar events are collected from connected tools.",
        },
        {
          icon: "link",
          title: "Connect them to one record",
          body: "Signals are de-duplicated and linked to a single candidate record and the requisitions that candidate is being considered for.",
        },
        {
          icon: "psychology",
          title: "Interpret against role criteria",
          body: "AI compares the evidence with the requirements the team defined, summarises strengths and highlights gaps or unknowns.",
        },
        {
          icon: "assistant_direction",
          title: "Recommend the next step",
          body: "The system suggests an action — reach out, screen, schedule or pause — which a recruiter approves or a configured workflow carries out.",
        },
      ],
      example: {
        title: "Example: hiring a senior backend engineer",
        scenario:
          "A recruiter describes the role in plain language: five or more years of backend experience, distributed systems, and fintech exposure preferred. The system surfaces candidates whose career history matches, explains why each one fits, and flags unknowns such as notice period. After outreach, replies and a short voice screen are added to each record, so the hiring manager reviews one consolidated summary instead of five separate threads. The recruiter still decides who advances.",
      },
    },
    breakdown: {
      title: "Where should recruiters keep human oversight?",
      intro:
        "AI hiring intelligence can prepare evidence at every stage, but accountable decisions stay with people. This is a typical split.",
      headers: ["Decision point", "What AI can do", "What stays with people"],
      rows: [
        {
          label: "Defining the role",
          cells: [
            "Suggest criteria from the brief and similar past roles",
            "The hiring manager and recruiter agree the criteria",
          ],
        },
        {
          label: "Building a shortlist",
          cells: ["Rank candidates against the criteria and explain each ranking", "The recruiter reviews, edits and approves"],
        },
        {
          label: "Screening outcomes",
          cells: ["Summarise answers and flag gaps or unknowns", "The recruiter decides who advances or is declined"],
        },
        {
          label: "Final selection",
          cells: ["Consolidate evidence for the interview panel", "The hiring manager makes the decision"],
        },
        {
          label: "Reviewing outcomes",
          cells: ["Report pass-through rates by stage", "The team audits for bias and adjusts criteria"],
        },
      ],
    },
    benefits: [
      "Decisions draw on a candidate's full history rather than a single document.",
      "Repetitive review and data entry shrink, freeing recruiter time for conversations.",
      "Shared criteria make evaluations more consistent and easier to audit.",
      "Pipeline visibility helps leaders spot stalled stages earlier.",
    ],
    limitations: [
      "Output quality depends on the data captured; stale or incomplete profiles produce weaker recommendations.",
      "Models can reproduce bias present in historical data, so criteria and outcomes need regular review.",
      "Recruitment AI is regulated in some jurisdictions — the EU AI Act, for example, classifies AI used for recruitment and candidate selection as high-risk.",
      "It cannot judge motivation, trust or team chemistry the way an experienced interviewer can.",
    ],
    misconceptions: [
      {
        myth: "AI hiring intelligence makes the hiring decision.",
        reality:
          "It organises evidence and suggests next steps. Accountable decisions stay with recruiters and hiring managers.",
      },
      {
        myth: "It is just resume keyword matching.",
        reality:
          "Keyword parsing reads one document. Hiring intelligence connects profiles, conversations, assessments and pipeline activity.",
      },
      {
        myth: "More data always means better hiring.",
        reality: "Relevant, accurate and lawfully processed data matters far more than volume.",
      },
    ],
    comparison: {
      title: "How is AI hiring intelligence different from related concepts?",
      intro:
        "Several terms describe parts of the same picture. This table shows where each one sits relative to AI hiring intelligence.",
      headers: ["Concept", "Primary focus", "How it relates"],
      rows: [
        {
          label: "Candidate intelligence",
          href: LINKS.learnCandidate.href,
          cells: [
            "Understanding one candidate in depth",
            "A subset: hiring intelligence applied to an individual person.",
          ],
        },
        {
          label: "Conversation intelligence",
          href: LINKS.learnConversation.href,
          cells: [
            "Insight from candidate emails, messages and calls",
            "One input stream that feeds the wider picture.",
          ],
        },
        {
          label: "AI hiring orchestration",
          href: LINKS.learnOrchestration.href,
          cells: [
            "Coordinating steps and hand-offs",
            "Acts on intelligence by moving candidates through the workflow.",
          ],
        },
        {
          label: "Applicant tracking system (ATS)",
          href: LINKS.learnAts.href,
          cells: [
            "Recording applications and hiring stages",
            "Stores records; hiring intelligence interprets them.",
          ],
        },
      ],
    },
    faqs: [
      {
        question: "Is AI hiring intelligence the same as an AI recruiting tool?",
        answer:
          "Not quite. Many AI recruiting tools automate a single task, such as resume parsing or scheduling. Hiring intelligence refers to the connected layer that interprets information across tasks, so what is learned in sourcing, outreach and screening informs every later step.",
      },
      {
        question: "Does AI hiring intelligence replace recruiters?",
        answer:
          "No. It reduces manual review and coordination, but recruiters still set criteria, build relationships, negotiate and make or recommend decisions. Huntlo is designed around this [Human + AI hiring](/human-ai-hiring) model.",
      },
      {
        question: "What data does AI hiring intelligence use?",
        answer:
          "Typically candidate profiles and applications, outreach and reply history, screening and interview notes or transcripts, assessment results, and pipeline events. Organisations should document which sources they use and process them under their privacy policies.",
      },
      {
        question: "How does Huntlo apply AI hiring intelligence?",
        answer:
          "Huntlo describes its category as [AI Hiring Intelligence Infrastructure](/ai-hiring-infrastructure). Sourcing, screening, outreach, voice screening, scheduling and the recruitment CRM share one candidate record, so context collected in one stage is available in the next.",
      },
    ],
    related: [
      LINKS.infrastructure,
      LINKS.learnCandidate,
      LINKS.screeningCap,
      LINKS.analyticsCap,
      LINKS.learnOrchestration,
    ],
    sources: [SOURCES.euAiAct, SOURCES.nistAiRmf],
    published: PUBLISHED,
    lastUpdated: PUBLISHED,
  },

  {
    slug: "what-is-agentic-hiring",
    name: "Agentic Hiring",
    title: "What Is Agentic Hiring?",
    category: "Agents and orchestration",
    summary:
      "A recruiting model where AI agents plan and complete multi-step hiring tasks while recruiters set goals and make decisions.",
    seo: {
      title: "What Is Agentic Hiring? How AI Agents Work in Recruiting | Huntlo",
      description:
        "Agentic hiring: AI agents plan and complete multi-step hiring tasks under recruiter oversight. Learn how it works and where humans stay in control.",
      ogTitle: "What Is Agentic Hiring?",
      ogDescription:
        "How agentic hiring works, a week-long example, and the guardrails that keep recruiters accountable for decisions.",
    },
    definition:
      "Agentic hiring is a recruiting model in which AI agents can plan and perform multi-step tasks toward a hiring goal, such as sourcing candidates, sending outreach, following up or coordinating interviews. Recruiters define objectives, permissions and approval points, while people remain responsible for final hiring decisions.",
    oversight:
      "Autonomy applies to tasks, not outcomes. Recruiters set goals, approve key actions and make final decisions.",
    flow: {
      label: "Goal, plan, act, human review",
      kind: "sequence",
      steps: [
        { label: "Goal", detail: "The recruiter sets the target and guardrails" },
        { label: "Plan", detail: "Agents break the goal into tasks" },
        { label: "Act", detail: "Agents work through approved tools" },
        { label: "Human review", detail: "Recruiters review and decide" },
      ],
    },
    termStatus: {
      industry:
        "An industry-wide term. LinkedIn, SeekOut, hireEZ and Eightfold all publicly describe agentic recruiting capabilities, so the concept does not belong to any one vendor.",
      huntlo:
        "Huntlo uses \u201CAgentic Hiring\u2122\u201D as the name of its own Human + AI approach. The trademark covers Huntlo's implementation, not the general idea.",
    },
    keyFacts: [
      { label: "Type", value: "Recruiting operating model" },
      { label: "Term status", value: "Industry term used by many vendors" },
      { label: "Core unit", value: "AI agents with defined goals and permissions" },
      { label: "Human role", value: "Set goals, approve key actions, decide" },
      { label: "Builds on", value: "AI recruiting agents and hiring orchestration" },
    ],
    whyItMatters: {
      title: "Why does agentic hiring matter?",
      intro:
        "Traditional automation follows fixed if-this-then-that rules. It struggles when a candidate replies with a question, asks to reschedule or raises salary. Agentic systems are designed to handle these variations within limits the team defines.",
      points: [
        {
          icon: "sync_alt",
          title: "Coordination volume",
          body: "A single hire can involve dozens of messages, reminders and calendar changes. Agents absorb much of this coordination so it does not depend on a recruiter's inbox.",
        },
        {
          icon: "bolt",
          title: "Speed to candidate",
          body: "Strong candidates often weigh several options. Agents can reply and follow up outside office hours, so momentum is not lost overnight.",
        },
        {
          icon: "center_focus_strong",
          title: "Recruiter focus",
          body: "When routine steps run in the background, recruiters spend more time on intake, advising hiring managers and closing candidates.",
        },
      ],
    },
    howItWorks: {
      title: "How does agentic hiring work?",
      intro:
        "An agentic hiring workflow combines four elements: a goal, a set of tools, guardrails, and human checkpoints. See [AI recruiting agents](/learn/what-are-ai-recruiting-agents) for the individual agent types.",
      steps: [
        {
          icon: "flag",
          title: "Set the goal and guardrails",
          body: "The recruiter defines the role, criteria, channels and tone, and decides which actions need approval before they happen.",
        },
        {
          icon: "checklist",
          title: "Agents plan the work",
          body: "The goal is broken into tasks: search for candidates, shortlist, draft outreach, follow up and offer interview slots.",
        },
        {
          icon: "build",
          title: "Agents act through connected tools",
          body: "Agents search for talent, send approved messages by email or WhatsApp, run voice screens and book interviews, logging each action.",
        },
        {
          icon: "how_to_reg",
          title: "Humans review and decide",
          body: "Recruiters review shortlists and summaries, step into important conversations and choose who advances.",
        },
      ],
      example: {
        title: "Example: one week of agentic hiring for a sales role",
        scenario:
          "On Monday, a recruiter sets the goal: ten qualified conversations for an enterprise account executive role in Bengaluru, with outreach approved before it is sent. A sourcing agent builds a shortlist; the recruiter removes three profiles and approves the message. Over the week, an outreach agent sends follow-ups, answers common questions from approved role notes and books screening calls with interested candidates. By Friday, the recruiter is reviewing call summaries and spending their time with the strongest five.",
      },
    },
    benefits: [
      "Hiring keeps moving between a recruiter's working sessions.",
      "Agents handle replies and exceptions that rigid rule-based automation cannot.",
      "Every agent action can be logged, making each step traceable.",
      "Teams can coordinate more candidates without adding headcount at the same rate.",
    ],
    limitations: [
      "Agents can misread context or make mistakes, so high-impact and candidate-facing actions need approval.",
      "Poorly defined goals or permissions create poor candidate experiences at scale.",
      "Automated decisions about people are regulated in some places — GDPR Article 22, for example, restricts decisions based solely on automated processing.",
      "Senior, sensitive or negotiation-heavy conversations should stay human-led.",
    ],
    misconceptions: [
      {
        myth: "Agentic hiring means fully autonomous hiring.",
        reality:
          "Well-designed agentic hiring keeps people accountable for decisions. Autonomy applies to tasks, not outcomes.",
      },
      {
        myth: "Agentic hiring is just a chatbot.",
        reality:
          "A chatbot answers questions. An agent pursues a goal across several steps and tools.",
      },
      {
        myth: "Agentic hiring is one vendor's concept.",
        reality:
          "It is an industry-wide term. Many recruiting platforms market agentic features; Huntlo's Agentic Hiring\u2122 names its own implementation.",
      },
    ],
    comparison: {
      title: "How is agentic hiring different from generative AI, automation and assistants?",
      intro:
        "These terms are often used interchangeably. The clearest way to separate them is to ask who, or what, decides the next step.",
      headers: ["Approach", "Who decides the next step", "Recruiting example"],
      rows: [
        {
          label: "Generative AI",
          cells: [
            "The person prompting it; it produces content rather than taking actions",
            "Draft a job description or a first outreach message.",
          ],
        },
        {
          label: "Workflow automation",
          href: LINKS.automationCap.href,
          cells: ["Pre-written rules", "Send a reminder 24 hours before an interview."],
        },
        {
          label: "AI assistant",
          cells: [
            "The person, one request at a time",
            "Suggest search terms when a recruiter asks for them.",
          ],
        },
        {
          label: "AI agents",
          href: LINKS.learnAgents.href,
          cells: [
            "The agent, within its task and permissions",
            "Follow up with candidates and book screens under approved rules.",
          ],
        },
        {
          label: "Agentic orchestration",
          href: LINKS.learnOrchestration.href,
          cells: [
            "A coordination layer across agents, people and systems",
            "Hand a screened candidate to scheduling and notify the hiring manager.",
          ],
        },
        {
          label: "Autonomous recruiting",
          href: "/autonomous-recruiting",
          cells: [
            "Agents across most steps, with human oversight",
            "End-to-end pipelines with approval checkpoints.",
          ],
        },
      ],
    },
    faqs: [
      {
        question: "Is agentic hiring the same as AI recruiting?",
        answer:
          "AI recruiting is a broad term for any use of AI in hiring. Agentic hiring is a specific model in which AI agents carry out multi-step work toward a goal, rather than performing one isolated task.",
      },
      {
        question: "What should stay human in agentic hiring?",
        answer:
          "Defining the role with hiring managers, final hiring decisions, compensation discussions, sensitive conversations and exceptions. Huntlo treats these as recruiter-owned moments.",
      },
      {
        question: "How do you keep agentic hiring safe and fair?",
        answer:
          "Define what agents can and cannot do, require approval for high-impact actions, log every action, review outcomes for unintended bias and tell candidates when they are interacting with AI. The NIST AI Risk Management Framework offers a useful structure for this.",
      },
      {
        question: "Is agentic hiring a Huntlo term?",
        answer:
          "No. Agentic hiring is used across recruitment technology; LinkedIn, SeekOut, hireEZ and Eightfold all describe agentic recruiting features on their own sites. Huntlo uses Agentic Hiring™ as the name of its own Human + AI model, in which AI agents handle coordination and recruiters own judgment. The [Agentic Hiring page](/agentic-hiring) explains that product approach.",
      },
    ],
    related: [
      LINKS.agenticHiring,
      LINKS.learnAgents,
      LINKS.learnOrchestration,
      LINKS.humanAi,
      LINKS.automationCap,
    ],
    sources: [
      SOURCES.gdpr,
      SOURCES.nistAiRmf,
      SOURCES.linkedinHiringRelease,
      SOURCES.seekoutAi,
      SOURCES.hireezAi,
      SOURCES.eightfoldProducts,
    ],
    published: PUBLISHED,
    lastUpdated: PUBLISHED,
  },

  {
    slug: "what-are-ai-recruiting-agents",
    name: "AI Recruiting Agents",
    title: "What Are AI Recruiting Agents?",
    category: "Agents and orchestration",
    summary:
      "The main types of AI recruiting agents — sourcing, outreach, screening, voice interview and scheduling — and where humans check their work.",
    seo: {
      title: "What Are AI Recruiting Agents? Types, Uses & Limits | Huntlo",
      description:
        "AI recruiting agents handle hiring tasks like sourcing, outreach, screening and scheduling within limits recruiters set. Learn the main types and their limits.",
      ogTitle: "What Are AI Recruiting Agents?",
      ogDescription:
        "A guide to the six common types of AI recruiting agents, how they work together, and the human checkpoints each one needs.",
    },
    definition:
      "AI recruiting agents are software systems that use AI to perform defined recruitment tasks, such as finding candidates, drafting outreach, screening applicants or arranging interviews. Unlike simple automation, an agent may choose the next action based on context, but it should operate within permissions, auditability and human-defined decision boundaries.",
    oversight:
      "Agents act within written permissions and every action is logged. Recruiters approve consequential decisions.",
    flow: {
      label: "Common agent types along the hiring process",
      kind: "sequence",
      steps: [
        { label: "Sourcing" },
        { label: "Outreach" },
        { label: "Screening" },
        { label: "Interview" },
        { label: "Scheduling" },
      ],
      result: "An orchestration layer passes context between agents, with a recruiter checkpoint at each stage.",
    },
    termStatus: {
      industry:
        "A general industry term. Many recruiting platforms describe sourcing, screening, outreach or scheduling agents.",
      huntlo:
        "Huntlo names its agents by task. Those are Huntlo's implementations of the general idea and are described separately below.",
    },
    keyFacts: [
      { label: "Type", value: "Task-specific software agents" },
      { label: "Term status", value: "General industry term" },
      { label: "Common types", value: "Sourcing, outreach, screening, interview, scheduling, orchestration" },
      { label: "Controlled by", value: "Goals, permissions and approvals" },
      { label: "Part of", value: "Agentic hiring" },
    ],
    whyItMatters: {
      title: "Why do AI recruiting agents matter?",
      intro:
        "Much of a recruiter's week goes to tasks that are necessary but repetitive: searching, messaging, following up and booking calls. Agents take on these tasks so each step happens promptly and consistently.",
      points: [
        {
          icon: "task_alt",
          title: "Task coverage",
          body: "Agents keep routine work moving across every open role, not only the ones a recruiter had time for that day.",
        },
        {
          icon: "rule",
          title: "Consistency",
          body: "Every candidate gets the same screening questions and timely follow-ups, rather than a process that varies by workload.",
        },
        {
          icon: "schedule",
          title: "Responsiveness",
          body: "Agents can answer common questions and offer interview slots shortly after a candidate replies, including outside working hours.",
        },
      ],
    },
    howItWorks: {
      title: "How do AI recruiting agents work?",
      intro:
        "Whatever the task, most recruiting agents follow the same loop of context, action, reasoning and hand-off.",
      steps: [
        {
          icon: "assignment",
          title: "Receive a task and context",
          body: "The agent is given a role, criteria, tone, channels and approved information it may share with candidates.",
        },
        {
          icon: "build",
          title: "Use connected tools",
          body: "It works through talent search, email, WhatsApp, voice calls and calendars rather than only generating text.",
        },
        {
          icon: "psychology",
          title: "Reason over results",
          body: "It interprets responses — interest, a question, a decline — and picks the next permitted action.",
        },
        {
          icon: "forward",
          title: "Report and hand off",
          body: "It logs what it did, summarises the outcome and passes the candidate to a recruiter or the next agent.",
        },
      ],
      example: {
        title: "Example: one candidate, three agents",
        scenario:
          "A sourcing agent identifies a data analyst who matches the role. After the recruiter approves, an outreach agent sends a personalised email and, three days later, a WhatsApp follow-up. The candidate replies with interest and asks about remote work, which the agent answers from the approved role notes. A scheduling agent then offers screening slots. The recruiter sees the full thread on one record and joins the conversation at the screening stage.",
      },
    },
    breakdown: {
      title: "What types of AI recruiting agents are there?",
      intro:
        "This is a vendor-neutral taxonomy. Most AI recruiting agents fall into six types, each tied to a stage of the hiring process and each with a natural human checkpoint.",
      headers: ["Agent type", "What it does", "Human checkpoint"],
      rows: [
        {
          label: "Sourcing agent",
          href: LINKS.sourcingCap.href,
          cells: [
            "Turns a role brief into a ranked list of active and passive candidates.",
            "Recruiter reviews and edits the shortlist.",
          ],
        },
        {
          label: "Outreach agent",
          href: LINKS.outreachCap.href,
          cells: [
            "Drafts personalised messages and sends follow-ups over email or WhatsApp.",
            "Recruiter approves messaging and takes over priority replies.",
          ],
        },
        {
          label: "Screening agent",
          href: LINKS.screeningCap.href,
          cells: [
            "Evaluates profiles against role criteria and flags gaps.",
            "Recruiter confirms who advances.",
          ],
        },
        {
          label: "Voice interview agent",
          href: LINKS.voiceCap.href,
          cells: [
            "Runs structured preliminary phone screens and produces transcripts and summaries.",
            "Recruiter reviews answers before the next round.",
          ],
        },
        {
          label: "Scheduling agent",
          href: LINKS.schedulingCap.href,
          cells: [
            "Offers available slots, books interviews and sends reminders.",
            "Escalates conflicts; recruiter handles exceptions and panel preparation.",
          ],
        },
        {
          label: "Orchestration agent",
          href: LINKS.learnOrchestration.href,
          cells: [
            "Coordinates which agent or person acts next and passes context between stages.",
            "Policy and stage rules set by the team; recruiters can pause or override.",
          ],
        },
      ],
    },
    benefits: [
      "Repetitive tasks are completed promptly, including outside working hours.",
      "Every candidate goes through the same steps and questions.",
      "Agent activity logs show exactly what happened and when.",
      "Recruiters can support more open roles while keeping candidate communication timely.",
    ],
    limitations: [
      "Agents only know what they are given; outdated role notes lead to wrong answers.",
      "They need monitoring for errors, tone and unintended bias.",
      "Some candidates prefer a person for certain conversations, so offer a clear route to one.",
      "Rules such as New York City's Local Law 144 require bias audits and candidate notices for certain automated employment decision tools.",
    ],
    misconceptions: [
      {
        myth: "An AI recruiting agent is the same as a chatbot.",
        reality:
          "A chatbot responds to prompts in one window. An agent acts across tools to complete a task.",
      },
      {
        myth: "Agents work best with no oversight.",
        reality:
          "Agents perform best with clear goals and review points; unchecked agents can repeat a mistake at scale.",
      },
      {
        myth: "You need a separate tool for each agent.",
        reality:
          "Agents are most useful when they share one candidate record, so context passes from task to task.",
      },
    ],
    comparison: {
      title: "How do AI recruiting agents differ from related tools?",
      intro: "Agents are often confused with chatbots and workflow rules. The difference is whether the software pursues a task across tools.",
      headers: ["Tool or concept", "What it does", "Difference from an AI recruiting agent"],
      rows: [
        {
          label: "Recruiting chatbot",
          cells: [
            "Answers candidate questions in a chat window",
            "Responds to prompts; does not pursue a goal across several tools.",
          ],
        },
        {
          label: "Workflow automation",
          href: LINKS.automationCap.href,
          cells: [
            "Runs pre-defined rules and triggers",
            "Follows fixed paths; agents choose actions within limits.",
          ],
        },
        {
          label: "Agentic hiring",
          href: LINKS.learnAgentic.href,
          cells: [
            "An operating model built on agents and human oversight",
            "The model; agents are its building blocks.",
          ],
        },
        {
          label: "AI hiring orchestration",
          href: LINKS.learnOrchestration.href,
          cells: [
            "Coordinates agents, people and systems",
            "Decides which agent acts next rather than doing one task itself.",
          ],
        },
      ],
    },
    faqs: [
      {
        question: "Can AI recruiting agents hire someone on their own?",
        answer:
          "They should not. Agents can source, message, screen and schedule, but hiring decisions carry legal and human consequences and should be made by accountable people. Huntlo's agents support recruiters; they do not make final hiring decisions.",
      },
      {
        question: "Do candidates know they are talking to an AI agent?",
        answer:
          "They should. Being transparent about AI involvement is good practice and a legal requirement in some places. Configure outreach and voice screens to disclose AI use and offer a route to a person.",
      },
      {
        question: "Which AI recruiting agent should a team start with?",
        answer:
          "Start where the bottleneck is. Teams short on pipeline usually begin with sourcing and outreach; teams with many applicants often begin with screening and scheduling.",
      },
      {
        question: "How should teams evaluate AI recruiting agents?",
        answer:
          "Ask what the agent can do without approval, how its actions are logged, which data it uses, how candidates are told about AI involvement, how mistakes are corrected and how outcomes are monitored for bias. Pilot on one role family and compare the results with your current process before expanding.",
      },
      {
        question: "Which AI recruiting agents does Huntlo offer?",
        answer:
          "Huntlo provides agents for sourcing, outreach, screening, voice interviews and scheduling, connected through one candidate record. The [AI Recruiting Agents page](/recruiting-agents) describes how they work together.",
      },
    ],
    related: [
      LINKS.recruitingAgents,
      LINKS.learnAgentic,
      LINKS.voiceCap,
      LINKS.outreachCap,
      LINKS.learnOrchestration,
    ],
    sources: [SOURCES.nycAedt, SOURCES.euAiAct],
    published: PUBLISHED,
    lastUpdated: PUBLISHED,
  },

  {
    slug: "what-is-candidate-intelligence",
    name: "Candidate Intelligence",
    title: "What Is Candidate Intelligence?",
    category: "Candidate and conversation insight",
    summary:
      "A connected, evidence-based view of each candidate's skills, experience, interest and history with your team.",
    seo: {
      title: "What Is Candidate Intelligence in Recruitment? | Huntlo",
      description:
        "Candidate intelligence is an evidence-based view of a candidate's skills, experience, interest and history with your team. See how it works, with an example.",
      ogTitle: "What Is Candidate Intelligence?",
      ogDescription:
        "How hiring teams build and maintain an accurate, lawful view of each candidate — and why it beats a resume snapshot.",
    },
    definition:
      "Candidate intelligence is a structured, evidence-based view of a person's skills, experience, career history, role interest and interactions with an organisation. It combines information from profiles, applications, assessments and conversations so recruiters can understand context and make better-informed decisions.",
    oversight:
      "AI-assembled candidate intelligence is not automatically objective. Recruiters check its sources, gaps and confidence before acting on it.",
    flow: {
      label: "Evidence sources",
      kind: "sources",
      steps: [
        { label: "Profiles" },
        { label: "Applications" },
        { label: "Assessments" },
        { label: "Conversations" },
        { label: "Recruiter notes" },
      ],
      result: "Candidate intelligence",
    },
    termStatus: {
      industry:
        "A general recruitment concept, sometimes called candidate insight. It is not tied to any one product.",
      huntlo:
        "Huntlo uses \u201CCandidate Intelligence\u2122\u201D for its own product view. The trademark covers Huntlo's implementation, not the general concept.",
    },
    keyFacts: [
      { label: "Type", value: "Recruitment concept" },
      { label: "Term status", value: "General recruitment concept" },
      { label: "Scope", value: "One candidate, over time" },
      { label: "Draws on", value: "Profiles, messages, screens, assessments, past applications" },
      { label: "Supports", value: "Matching, personalised outreach and screening" },
    ],
    whyItMatters: {
      title: "Why does candidate intelligence matter?",
      intro:
        "A resume is a snapshot written for a different purpose. Recruiters need to know what a candidate has actually done, what they want next, and how they have interacted with the company before.",
      points: [
        {
          icon: "description",
          title: "Beyond the resume",
          body: "Career progression, project scope and domain experience often say more about fit than job titles do.",
        },
        {
          icon: "history",
          title: "Relationship memory",
          body: "Past finalists and earlier conversations are easy to forget. A connected record makes them reusable when a new role opens.",
        },
        {
          icon: "chat_bubble",
          title: "Better conversations",
          body: "Outreach and interviews improve when recruiters reference real context rather than generic templates.",
        },
      ],
    },
    howItWorks: {
      title: "How does candidate intelligence work?",
      intro:
        "Candidate intelligence is built up over time rather than created once. It typically follows four stages.",
      steps: [
        {
          icon: "inbox",
          title: "Gather",
          body: "Start with the application, resume and professional profile information the team has a lawful basis to use.",
        },
        {
          icon: "add_circle",
          title: "Enrich over time",
          body: "Add outreach replies, screening answers, assessment results and interview feedback as the candidate progresses.",
        },
        {
          icon: "compare",
          title: "Interpret against roles",
          body: "Compare the evidence with role requirements, highlighting strengths, gaps and unknowns to verify.",
        },
        {
          icon: "update",
          title: "Keep it current",
          body: "Update the record when candidates change roles or preferences, and follow retention and deletion policies.",
        },
      ],
      example: {
        title: "Example: rediscovering a past finalist",
        scenario:
          "Eight months ago, a candidate reached the final round for a product manager role but accepted another offer. Their record holds interview feedback, salary expectations and a note that they wanted to lead a payments product. When a payments product manager role opens, the record surfaces in the talent pool with that context, and the recruiter's first message references the earlier conversation instead of starting from zero.",
      },
    },
    breakdown: {
      title: "How do you keep candidate intelligence trustworthy?",
      intro:
        "Candidate intelligence is only as reliable as the evidence behind it. These six checks keep it honest.",
      headers: ["Check", "What to look for", "Why it matters"],
      rows: [
        {
          label: "Source provenance",
          cells: [
            "Each fact shows where it came from and when it was captured.",
            "Recruiters can judge how far to trust it.",
          ],
        },
        {
          label: "Missing or incomplete information",
          cells: [
            "Gaps are marked as unknown instead of being filled with guesses.",
            "A missing signal is not evidence of a weakness.",
          ],
        },
        {
          label: "Confidence",
          cells: [
            "Inferences are labelled with how strongly the evidence supports them.",
            "Stops a weak signal from reading as a fact.",
          ],
        },
        {
          label: "Recruiter review",
          cells: [
            "A person checks the evidence before it affects a decision.",
            "Keeps accountability with people.",
          ],
        },
        {
          label: "Candidate-data privacy",
          cells: [
            "Data is collected on a lawful basis and kept only as long as policy allows.",
            "Required under privacy laws such as the GDPR.",
          ],
        },
        {
          label: "Risk of inference",
          cells: [
            "No inferring protected characteristics or personality from indirect signals.",
            "Inference can introduce bias and is restricted in some jurisdictions.",
          ],
        },
      ],
    },
    benefits: [
      "Shortlists are based on evidence, not job titles alone.",
      "Outreach is personalised with real context.",
      "Past candidates can be rediscovered quickly when new roles open.",
      "Recruiters and hiring managers share the same view of each candidate.",
    ],
    limitations: [
      "Profiles can be outdated or incomplete, so confirm current details directly with the candidate.",
      "Inferences about soft skills or culture fit are indicators, not facts.",
      "Collecting and storing candidate data must follow privacy law, such as the GDPR, and clear retention rules.",
      "Leaning too heavily on past signals can overlook people who are changing careers.",
    ],
    misconceptions: [
      {
        myth: "Candidate intelligence means collecting as much data as possible.",
        reality: "It means holding relevant, accurate and lawfully processed information tied to hiring decisions.",
      },
      {
        myth: "It is the same as a background check.",
        reality:
          "Background checks verify specific facts late in the process; candidate intelligence informs fit and engagement throughout.",
      },
      {
        myth: "A match score is the candidate intelligence.",
        reality:
          "A score is a summary. The value lies in the evidence behind it, which recruiters should be able to inspect.",
      },
    ],
    comparison: {
      title: "How does candidate intelligence differ from related concepts?",
      intro: "Candidate intelligence is about one person. Related terms either zoom out to markets and processes or zoom in to a single input.",
      headers: ["Concept", "Scope", "Difference"],
      rows: [
        {
          label: "Talent intelligence",
          href: "/talent-intelligence",
          cells: [
            "Talent markets and pools of people",
            "Looks at groups and markets; candidate intelligence looks at one person.",
          ],
        },
        {
          label: "Resume parsing",
          cells: [
            "Extracting fields from one document",
            "One input among many, with no history or interpretation.",
          ],
        },
        {
          label: "Conversation intelligence",
          href: LINKS.learnConversation.href,
          cells: [
            "Insight from candidate conversations",
            "Feeds candidate intelligence with interest, questions and objections.",
          ],
        },
        {
          label: "AI hiring intelligence",
          href: LINKS.learnIntelligence.href,
          cells: [
            "The whole hiring process",
            "Candidate intelligence is one part of it.",
          ],
        },
      ],
    },
    faqs: [
      {
        question: "Is candidate intelligence the same as a candidate profile?",
        answer:
          "A profile is a record of facts. Candidate intelligence adds interpretation and history: how those facts relate to a role, what the candidate has said and how they have engaged over time.",
      },
      {
        question: "Where does candidate intelligence data come from?",
        answer:
          "Usually from applications and resumes, professional profiles, outreach replies, screening and interview notes, assessments and past applications. Organisations should document their sources and their lawful basis for processing.",
      },
      {
        question: "How does Huntlo support candidate intelligence?",
        answer:
          "Huntlo keeps sourcing context, outreach history, voice screening transcripts and notes on one candidate record in its [AI Recruitment CRM](/capabilities/ai-recruitment-crm), so the next recruiter or stage starts with full context. The [Candidate Intelligence™ page](/candidate-intelligence) covers the product approach.",
      },
    ],
    related: [
      LINKS.candidateIntelligence,
      LINKS.matchingCap,
      LINKS.crmCap,
      LINKS.talentPoolCap,
      LINKS.learnConversation,
    ],
    sources: [SOURCES.gdpr],
    published: PUBLISHED,
    lastUpdated: PUBLISHED,
  },

  {
    slug: "conversation-intelligence-recruitment",
    name: "Conversation Intelligence",
    title: "What Is Conversation Intelligence in Recruitment?",
    category: "Candidate and conversation insight",
    summary:
      "How AI analyses candidate emails, messages and calls to surface interest, questions and commitments — and where to be careful.",
    seo: {
      title: "Conversation Intelligence in Recruitment: What It Is | Huntlo",
      description:
        "Conversation intelligence in recruitment analyses candidate emails, messages and calls to surface interest, questions and objections. See how it works.",
      ogTitle: "What Is Conversation Intelligence in Recruitment?",
      ogDescription:
        "How recruiting teams capture and analyse candidate conversations responsibly — with a voice-screen example and the legal points to check.",
    },
    definition:
      "Conversation intelligence in recruitment uses AI to capture and analyse candidate interactions such as email, chat and calls to identify questions, interests, objections and commitments. Used responsibly, it can help recruiters maintain context and respond consistently, but consent, data retention and human review remain important.",
    oversight:
      "Candidates are told about recording and AI analysis up front, and recruiters verify key facts before acting on them.",
    flow: {
      label: "From conversation to record",
      kind: "sequence",
      steps: [
        { label: "Notice and consent", detail: "The candidate is informed first" },
        { label: "Capture", detail: "Messages sync; calls are recorded" },
        { label: "Analyse", detail: "Intent and stated facts are extracted" },
        { label: "Recruiter review", detail: "Key facts are verified" },
      ],
    },
    termStatus: {
      industry:
        "A term borrowed from sales technology and now used across recruiting tools for analysing candidate conversations.",
      huntlo:
        "Huntlo uses \u201CConversation Intelligence\u2122\u201D for its own outreach approach. The trademark covers Huntlo's implementation, not the general technique.",
    },
    keyFacts: [
      { label: "Type", value: "Analysis capability" },
      { label: "Term status", value: "General industry term, from sales technology" },
      { label: "Inputs", value: "Emails, messages, call recordings and transcripts" },
      { label: "Outputs", value: "Summaries, intent and follow-up actions" },
      { label: "Requires", value: "Clear disclosure and, where needed, consent" },
    ],
    whyItMatters: {
      title: "Why does conversation intelligence matter in recruiting?",
      intro:
        "Much of what decides whether a candidate moves forward is said in conversations, not written on a resume. Without capture, those details live in one recruiter's memory or inbox.",
      points: [
        {
          icon: "quickreply",
          title: "Intent is in the replies",
          body: "\u201CMaybe later\u201D, \u201Cwhat is the budget?\u201D and \u201CI can't relocate\u201D each call for a different next step.",
        },
        {
          icon: "swap_horiz",
          title: "Hand-offs lose context",
          body: "When a candidate moves from recruiter to hiring manager, important details are often summarised from memory or lost.",
        },
        {
          icon: "rule",
          title: "Consistent screening",
          body: "When answers to structured screening questions are captured, candidates can be compared on the same basis.",
        },
      ],
    },
    howItWorks: {
      title: "How does conversation intelligence work?",
      intro: "Conversation intelligence turns unstructured conversations into structured, actionable records in four steps.",
      steps: [
        {
          icon: "mic",
          title: "Capture",
          body: "Messages sync from connected channels; calls are recorded after the candidate has been informed.",
        },
        {
          icon: "subtitles",
          title: "Transcribe and structure",
          body: "Speech is converted to text and split into questions, answers and speakers.",
        },
        {
          icon: "label",
          title: "Analyse",
          body: "Replies are classified by intent — interested, not now, question, decline — and stated facts such as notice period, location and expected salary are extracted.",
        },
        {
          icon: "task",
          title: "Act and record",
          body: "The system suggests a reply or next step, updates the candidate record and alerts the recruiter to priority conversations.",
        },
      ],
      example: {
        title: "Example: a voice screen summary",
        scenario:
          "A candidate completes a ten-minute AI voice screen for a customer support lead role. The recruiter receives a summary: currently serving a 30-day notice period, open to night shifts, expected salary within the role's range, and a question about whether the role is hybrid. The open question is flagged so the recruiter can answer it personally before the panel interview.",
      },
    },
    breakdown: {
      title: "Notice, consent and data controls",
      intro:
        "Candidate conversations are personal data. Check each of these controls before analysing them. This is general guidance, not legal advice.",
      headers: ["Control", "Good practice", "Why it matters"],
      rows: [
        {
          label: "Notice and consent",
          cells: [
            "Tell candidates before a call or analysis begins, and obtain consent where local law requires it.",
            "Recording rules vary by country and state.",
          ],
        },
        {
          label: "Recording and transcription disclosure",
          cells: [
            "State at the start of each call that it is recorded, transcribed and analysed by AI, and offer a route to a person.",
            "Candidates should always know when they are talking to AI.",
          ],
        },
        {
          label: "Retention",
          cells: [
            "Set how long recordings, transcripts and summaries are kept, and delete them on schedule.",
            "Keeping data longer than needed raises risk and can breach privacy law.",
          ],
        },
        {
          label: "Access controls",
          cells: [
            "Limit access to recordings and transcripts to the people involved in the hire.",
            "Conversations often include salary, health or other personal details.",
          ],
        },
        {
          label: "Bias and inference limits",
          cells: [
            "Analyse what candidates say, not their accent, tone or inferred emotion.",
            "The EU AI Act prohibits workplace emotion recognition, and inferences can encode bias.",
          ],
        },
      ],
    },
    benefits: [
      "Fewer missed or forgotten candidate replies.",
      "Accurate records without manual note-taking.",
      "Smoother hand-offs between recruiters and hiring managers.",
      "Structured answers that make candidates easier to compare fairly.",
    ],
    limitations: [
      "Transcription can struggle with poor audio, strong accents or mixed languages, so verify key facts.",
      "Intent classification is probabilistic and will sometimes be wrong.",
      "Recording and consent rules vary by country and state; disclose recording and AI analysis up front.",
      "The EU AI Act prohibits emotion-recognition systems in the workplace, so analysis should focus on what candidates say rather than inferred emotions.",
    ],
    misconceptions: [
      {
        myth: "Conversation intelligence is just call recording.",
        reality: "Recording captures a conversation. Intelligence structures and summarises it so the team can act.",
      },
      {
        myth: "It can tell whether a candidate is being honest.",
        reality:
          "It is not a lie detector. Use it to capture what candidates say, then verify important facts directly.",
      },
      {
        myth: "Only phone calls count.",
        reality: "Email and messaging threads often hold the clearest signals of interest and intent.",
      },
    ],
    comparison: {
      title: "How is recruitment conversation intelligence different from related tools?",
      intro: "Similar techniques are used across sales, interviewing and screening. What differs is the conversation being analysed and the signals that matter.",
      headers: ["Tool or concept", "Focus", "Difference"],
      rows: [
        {
          label: "Sales conversation intelligence",
          cells: [
            "Buyer calls and deals",
            "Similar techniques, different signals: buying objections rather than candidate interest, notice period and expectations.",
          ],
        },
        {
          label: "Interview intelligence",
          href: "/interview-orchestration",
          cells: [
            "Structured interviews and panel feedback",
            "A narrower slice focused on formal interviews.",
          ],
        },
        {
          label: "Candidate intelligence",
          href: LINKS.learnCandidate.href,
          cells: ["The whole candidate record", "Conversation intelligence is one of its inputs."],
        },
        {
          label: "AI voice interviews",
          href: LINKS.voiceCap.href,
          cells: [
            "Conducting preliminary screening calls",
            "Produces conversations; conversation intelligence analyses them.",
          ],
        },
      ],
    },
    faqs: [
      {
        question: "Is it legal to record recruitment calls?",
        answer:
          "It depends on the jurisdiction. Many places require informing the candidate, or obtaining their consent, before recording. Check local law and disclose recording and AI analysis at the start of every call.",
      },
      {
        question: "Which channels does conversation intelligence cover?",
        answer:
          "Typically email, chat and messaging apps such as WhatsApp, and phone or video calls. Coverage depends on which channels are connected to your recruiting system.",
      },
      {
        question: "How does Huntlo use conversation intelligence?",
        answer:
          "Huntlo keeps email and WhatsApp outreach threads and [AI voice interview](/capabilities/ai-voice-interviews) transcripts on the candidate record and summarises key answers for recruiters. The [Conversation Intelligence™ page](/outreach-engine) describes the outreach approach in more depth.",
      },
    ],
    related: [
      LINKS.conversationIntelligence,
      LINKS.voiceCap,
      LINKS.engagementCap,
      LINKS.whatsapp,
      LINKS.learnCandidate,
    ],
    sources: [SOURCES.euAiAct, SOURCES.gdpr],
    published: PUBLISHED,
    lastUpdated: PUBLISHED,
  },

  {
    slug: "ai-hiring-orchestration",
    name: "AI Hiring Orchestration",
    title: "What Is AI Hiring Orchestration?",
    category: "Agents and orchestration",
    summary:
      "The coordination layer that decides which agent, recruiter or system acts next, so candidates move between stages without manual hand-offs.",
    seo: {
      title: "What Is AI Hiring Orchestration? Recruiting Workflows Explained | Huntlo",
      description:
        "AI hiring orchestration coordinates AI agents, recruiters and hiring systems so candidates move between stages without manual hand-offs. Learn how it works.",
      ogTitle: "What Is AI Hiring Orchestration?",
      ogDescription:
        "How orchestration closes the gaps between hiring stages, with an example from reply to booked interview.",
    },
    definition:
      "AI hiring orchestration is the coordination layer that determines which recruiter, AI agent or connected system should act next in a recruitment workflow. It passes context between stages so sourcing, outreach, screening, interviewing and follow-up can progress without unnecessary manual hand-offs.",
    oversight:
      "Approval steps and recruiter tasks are part of the workflow design, and people can pause or override any step.",
    flow: {
      label: "Event, route, act, hand off",
      kind: "sequence",
      steps: [
        { label: "Event", detail: "A reply, a completed screen, feedback" },
        { label: "Route", detail: "Decide who or what acts next" },
        { label: "Act", detail: "An agent, recruiter or system acts" },
        { label: "Hand off", detail: "Context moves to the next stage" },
      ],
    },
    termStatus: {
      industry:
        "A general term borrowed from software and workflow engineering, now used by many recruiting platforms.",
      huntlo:
        "Huntlo uses \u201CHiring Intelligence Orchestration\u2122\u201D for its own implementation, described separately below.",
    },
    keyFacts: [
      { label: "Type", value: "Workflow coordination layer" },
      { label: "Term status", value: "General industry term" },
      { label: "Coordinates", value: "AI agents, recruiters, hiring managers and connected tools" },
      { label: "Key elements", value: "Events, rules, approvals and a shared candidate record" },
      { label: "Related to", value: "Workflow automation and agentic hiring" },
    ],
    whyItMatters: {
      title: "Why does AI hiring orchestration matter?",
      intro:
        "Adding AI to individual steps does not fix a slow process if the steps are still disconnected. Delays usually happen between stages: a screened candidate waits for someone to send interview slots, or feedback sits in an inbox.",
      points: [
        {
          icon: "hourglass_top",
          title: "Gaps between stages",
          body: "Idle time between steps, not the steps themselves, is often where candidates lose interest.",
        },
        {
          icon: "link_off",
          title: "Context loss",
          body: "Each hand-off is a chance for notes, answers and preferences to be dropped.",
        },
        {
          icon: "visibility",
          title: "Visibility",
          body: "Teams need to know where every candidate is and who owns the next step.",
        },
      ],
    },
    howItWorks: {
      title: "How does AI hiring orchestration work?",
      intro: "Orchestration listens for events across the hiring process and routes the next action to the right agent, person or system.",
      steps: [
        {
          icon: "account_tree",
          title: "Model the workflow",
          body: "Define the stages, owners and exit criteria for each role or role family.",
        },
        {
          icon: "notifications_active",
          title: "Listen for events",
          body: "Watch for a reply, a completed screen, a submitted assessment or logged interview feedback.",
        },
        {
          icon: "alt_route",
          title: "Route the next action",
          body: "Trigger an agent, assign a recruiter task, request an approval or notify the hiring manager.",
        },
        {
          icon: "monitoring",
          title: "Track and adjust",
          body: "Monitor time in stage and drop-off, then refine rules and approvals as the team learns.",
        },
      ],
      example: {
        title: "Example: from reply to booked interview",
        scenario:
          "A candidate replies \u201CYes, interested\u201D to an outreach email at 9 pm. The orchestration layer marks them as interested and sends an AI voice screen invitation. When the screen is completed and meets the criteria the recruiter set, the candidate is offered interview slots from the hiring manager's calendar. The recruiter is notified at each step and can pause or override. If the candidate does not respond within the configured window, a follow-up is sent.",
      },
    },
    breakdown: {
      title: "Orchestration vs automation",
      intro:
        "Automation is one predefined action. Orchestration coordinates actions, actors and candidate state across the whole workflow.",
      headers: ["Dimension", "Automation", "Orchestration"],
      rows: [
        {
          label: "Unit of work",
          cells: ["One predefined action", "A sequence of actions across stages"],
        },
        {
          label: "Who acts",
          cells: ["A single system", "Recruiters, AI agents and connected tools"],
        },
        {
          label: "State",
          cells: [
            "Usually unaware of where the candidate is overall",
            "Tracks each candidate's stage, owner and history",
          ],
        },
        {
          label: "Exceptions",
          cells: [
            "Stops, or follows a fixed fallback",
            "Routes to the right person or agent, or asks for approval",
          ],
        },
        {
          label: "Example",
          cells: [
            "Send a reminder 24 hours before an interview",
            "A reply triggers a screen; a passed screen offers interview slots and notifies the hiring manager",
          ],
        },
      ],
    },
    benefits: [
      "Fewer idle gaps between hiring stages.",
      "A consistent process across recruiters and roles.",
      "Context travels with the candidate from stage to stage.",
      "Clear ownership and an audit trail for every step.",
    ],
    limitations: [
      "Orchestration is only as good as the workflow it runs — automating a broken process makes it faster, not better.",
      "Steps that happen outside connected tools still need manual updates.",
      "Over-automation can feel impersonal; keep human touchpoints at key moments.",
      "Rules need maintenance as roles, teams and regulations change.",
    ],
    misconceptions: [
      {
        myth: "Orchestration only matters for high-volume hiring.",
        reality:
          "Hand-off delays affect any role. Even a few candidates can stall when no one owns the next step.",
      },
      {
        myth: "Orchestration removes recruiters from the loop.",
        reality: "Approval steps and recruiter tasks are part of the workflow design.",
      },
      {
        myth: "You have to replace your ATS to orchestrate hiring.",
        reality:
          "Orchestration can sit alongside a system of record. What matters is that stages and data are connected.",
      },
    ],
    comparison: {
      title: "How is AI hiring orchestration different from related concepts?",
      intro: "Orchestration is the layer that connects the other pieces. Here is how it relates to each.",
      headers: ["Concept", "Scope", "Difference"],
      rows: [
        {
          label: "Recruitment workflow automation",
          href: LINKS.automationCap.href,
          cells: [
            "Individual triggers and actions",
            "The building blocks; orchestration sequences them across the hiring process.",
          ],
        },
        {
          label: "AI recruiting agents",
          href: LINKS.learnAgents.href,
          cells: [
            "Completing specific tasks",
            "Agents do the work; orchestration decides which agent acts next.",
          ],
        },
        {
          label: "Applicant tracking system (ATS)",
          href: LINKS.learnAts.href,
          cells: [
            "Recording applications and stages",
            "Records status; orchestration moves candidates between statuses.",
          ],
        },
        {
          label: "Agentic hiring",
          href: LINKS.learnAgentic.href,
          cells: [
            "An operating model",
            "Orchestration is the coordination layer that makes the model work.",
          ],
        },
      ],
    },
    faqs: [
      {
        question: "What is the difference between hiring orchestration and an ATS workflow?",
        answer:
          "Many ATS workflows move a candidate to a new stage when someone clicks a button. Orchestration listens for events across channels and tools and triggers the next action — including AI agent tasks — automatically, with human approval where required.",
      },
      {
        question: "Do I need AI agents to use orchestration?",
        answer:
          "No. Orchestration can coordinate people and rule-based steps on its own. AI agents extend it by handling tasks such as screening calls and follow-ups.",
      },
      {
        question: "How does Huntlo approach AI hiring orchestration?",
        answer:
          "Huntlo connects sourcing, outreach, voice screening, scheduling and the recruitment CRM on one candidate record, with [workflow automation](/capabilities/recruitment-workflow-automation) moving candidates between stages. The [Hiring Intelligence Orchestration™ page](/workflow-orchestration) explains the product approach.",
      },
    ],
    related: [
      LINKS.orchestration,
      LINKS.automationCap,
      LINKS.schedulingCap,
      LINKS.huntlo360,
      LINKS.learnAgents,
    ],
    sources: [],
    published: PUBLISHED,
    lastUpdated: PUBLISHED,
  },

  {
    slug: "ai-hiring-vs-ats",
    name: "AI Hiring vs ATS",
    title: "AI Hiring vs Traditional ATS: What Is the Difference?",
    category: "Foundations",
    summary:
      "What an applicant tracking system does, what AI hiring platforms add, and why most teams end up using both.",
    seo: {
      title: "AI Hiring vs ATS: Differences, Use Cases & How They Work Together",
      description:
        "An ATS records applications; AI hiring platforms help find, engage and evaluate candidates. Compare what each does, where they overlap and when to use both.",
      ogTitle: "AI Hiring vs Traditional ATS: What Is the Difference?",
      ogDescription:
        "A side-by-side comparison of applicant tracking systems and AI hiring platforms, with an example of how they work together.",
    },
    definition:
      "An ATS primarily records jobs, applications, candidate stages and hiring activity. AI hiring platforms can add active capabilities such as sourcing, screening, outreach and workflow automation. In practice, many employers use AI hiring tools alongside an ATS rather than replacing the system of record entirely.",
    oversight:
      "Whichever system runs a step, recruiters review AI screening output and own hiring decisions.",
    flow: {
      label: "How the two systems typically share the work",
      kind: "sequence",
      steps: [
        { label: "Requisition opens", detail: "Recorded in the ATS" },
        { label: "Source and engage", detail: "AI hiring platform" },
        { label: "Screen and schedule", detail: "AI, with recruiter review" },
        { label: "Outcome recorded", detail: "Back in the ATS" },
      ],
    },
    termStatus: {
      industry:
        "Both are general industry terms. Many modern ATS products now include AI and agentic features, so the useful distinction is system role, not age.",
      huntlo:
        "Huntlo describes itself as an AI hiring platform that works alongside an ATS. It is not positioned as a traditional ATS.",
    },
    keyFacts: [
      { label: "Type", value: "Comparison of two system roles" },
      { label: "Term status", value: "General industry terms" },
      { label: "ATS role", value: "System of record and compliance trail" },
      { label: "AI hiring role", value: "Sourcing, engagement, screening and coordination" },
      { label: "Typical set-up", value: "Used together" },
      { label: "Deciding factor", value: "Where your hiring bottleneck is" },
    ],
    whyItMatters: {
      title: "Why does the difference matter?",
      intro:
        "Teams often expect their ATS to fill pipelines or speed up screening, then find it was designed to track candidates rather than find or engage them. Knowing which tool does which job prevents buying the wrong one.",
      points: [
        {
          icon: "login",
          title: "Inbound versus outbound",
          body: "An ATS is built around people who apply. Many roles also need outbound sourcing of passive candidates.",
        },
        {
          icon: "edit_note",
          title: "Recording versus doing",
          body: "An ATS records that a step happened. AI hiring platforms carry out more of the steps themselves.",
        },
        {
          icon: "dataset",
          title: "Different data models",
          body: "An ATS is organised around requisitions and stages; AI hiring is organised around candidate context and conversations.",
        },
      ],
    },
    howItWorks: {
      title: "How do AI hiring platforms and an ATS work together?",
      intro:
        "In a typical set-up, each system does what it is best at. How data moves between them depends on the integration available.",
      steps: [
        {
          icon: "work",
          title: "The requisition opens",
          body: "The role, approvals and job posting are managed in the ATS as the official record.",
        },
        {
          icon: "person_search",
          title: "AI sources and engages",
          body: "The AI hiring platform finds passive candidates and runs personalised outreach and follow-up.",
        },
        {
          icon: "fact_check",
          title: "AI screens and schedules",
          body: "Applicants and interested candidates are screened against criteria, voice-screened and booked into interviews — with recruiter review.",
        },
        {
          icon: "sync",
          title: "Outcomes reach the system of record",
          body: "Shortlisted candidates and key notes are synced or exported to the ATS, or smaller teams run the full process in one platform.",
        },
      ],
      example: {
        title: "Example (illustrative): a high-volume support hiring drive",
        scenario:
          "A team needs 40 customer support hires in six weeks. Their ATS holds the requisitions and receives about 1,500 applications. An AI hiring platform screens applicants against the agreed criteria, runs short voice screens with those who meet them, and books interviews for the strongest candidates. Recruiters spend their time in interviews and offer conversations, while the ATS remains the official record of every stage.",
      },
    },
    breakdown: {
      title: "AI hiring vs ATS: side-by-side comparison",
      intro:
        "Capabilities vary by vendor, and many modern ATS products now include AI and agentic features. This table compares system roles, the traditional system-of-record model and AI-first hiring platforms, not old versus new technology.",
      headers: ["Dimension", "Traditional ATS", "AI hiring platform"],
      rows: [
        {
          label: "Primary purpose",
          cells: ["Track applicants and hiring stages", "Find, engage and evaluate candidates"],
        },
        {
          label: "Candidate source",
          cells: ["Mainly inbound applications and referrals", "Inbound plus outbound sourcing of passive talent"],
        },
        {
          label: "Screening",
          cells: [
            "Keyword filters, knockout questions and manual review",
            "Criteria-based evaluation, voice screens and assessments, reviewed by recruiters",
          ],
        },
        {
          label: "Outreach",
          cells: ["Status emails and templates", "Personalised multi-step outreach over email and messaging"],
        },
        {
          label: "Scheduling",
          cells: ["Manual coordination or basic booking links", "Automated slot offers, reminders and rescheduling"],
        },
        {
          label: "Data focus",
          cells: ["Requisitions, stages and compliance records", "Candidate context, conversations and intent"],
        },
        {
          label: "Recruiter role",
          cells: ["Updates records and moves candidates", "Sets criteria, reviews AI output and owns decisions"],
        },
      ],
    },
    benefits: [
      "Pipelines are filled through outbound sourcing, not only applications.",
      "The time between application and first conversation shortens.",
      "The ATS remains the official record for approvals and compliance.",
      "Recruiters spend less time on manual screening and scheduling.",
    ],
    limitations: [
      "Without a solid integration, a second tool can add duplicate data entry — check how data syncs.",
      "AI screening needs well-defined criteria and regular bias review.",
      "Recruiters need time and training to trust and review AI output.",
      "Rules such as New York City's Local Law 144 may require bias audits for automated screening tools.",
    ],
    misconceptions: [
      {
        myth: "AI hiring replaces the ATS.",
        reality: "For most organisations it complements the ATS, which stays the system of record.",
      },
      {
        myth: "An ATS is legacy software and AI hiring is its modern replacement.",
        reality:
          "Many modern ATS products include AI and agentic features. Compare system role, record-keeping versus active work, not age.",
      },
      {
        myth: "AI hiring is only for high-volume roles.",
        reality:
          "It also helps niche and senior searches, where outbound sourcing and personalised outreach matter most.",
      },
    ],
    comparison: {
      title: "How do other hiring systems compare?",
      intro: "An ATS and an AI hiring platform are two of several systems in a hiring stack.",
      headers: ["System", "What it is", "Relationship"],
      rows: [
        {
          label: "Recruitment CRM",
          href: LINKS.crmCap.href,
          cells: [
            "Manages candidate relationships before and after they apply",
            "Often sits between AI sourcing and the ATS.",
          ],
        },
        {
          label: "Hiring operating system",
          href: LINKS.hiringOs.href,
          cells: [
            "One workspace across hiring stages",
            "Brings AI hiring capabilities together in one place.",
          ],
        },
        {
          label: "AI hiring orchestration",
          href: LINKS.learnOrchestration.href,
          cells: ["A coordination layer", "Moves candidates between stages across tools."],
        },
        {
          label: "HRIS",
          cells: ["Employee records after hire", "Takes over once the candidate becomes an employee."],
        },
      ],
    },
    faqs: [
      {
        question: "Do I still need an ATS if I use an AI hiring platform?",
        answer:
          "Larger organisations usually do, because the ATS holds requisitions, approvals and compliance records. Some smaller teams run their whole process in an AI hiring platform. Decide based on your reporting, compliance and integration needs.",
      },
      {
        question: "Can an AI hiring platform integrate with my ATS?",
        answer:
          "Many can, but depth varies — from exporting candidates to two-way sync of stages and notes. Ask vendors which fields sync, in which direction and how often. Huntlo's [integrations page](/integrations) lists current options.",
      },
      {
        question: "Is AI screening more accurate than ATS keyword filters?",
        answer:
          "It can consider more context than exact keyword matches, but accuracy depends on clear criteria and good data. Treat AI screening output as input to recruiter judgment and audit outcomes regularly.",
      },
      {
        question: "Where does Huntlo fit?",
        answer:
          "Huntlo is an AI hiring platform — described as AI Hiring Intelligence Infrastructure — covering sourcing, outreach, screening, voice interviews, scheduling and a recruitment CRM. It is designed to work alongside your existing hiring systems rather than as a traditional ATS.",
      },
    ],
    related: [
      LINKS.integrations,
      LINKS.hiringOs,
      LINKS.screeningCap,
      LINKS.compare,
      LINKS.learnOrchestration,
    ],
    sources: [SOURCES.nycAedt],
    published: PUBLISHED,
    lastUpdated: PUBLISHED,
  },
];

/** Recommended reading order: concept → insight → agents → model → coordination → buying decision. */
export const LEARN_CLUSTER_ORDER = [
  "what-is-ai-hiring-intelligence",
  "what-is-candidate-intelligence",
  "conversation-intelligence-recruitment",
  "what-are-ai-recruiting-agents",
  "what-is-agentic-hiring",
  "ai-hiring-orchestration",
  "ai-hiring-vs-ats",
] as const;

export function learnPath(slug: string) {
  return `${LEARN_PATH}/${slug}`;
}

export function getLearnPage(slug: string) {
  return LEARN_PAGES.find((page) => page.slug === slug);
}

/** Single source for both the visible trail and BreadcrumbList JSON-LD. */
export function learnBreadcrumbs(page?: LearnPage): BreadcrumbSchemaItem[] {
  const trail: BreadcrumbSchemaItem[] = [
    { name: "Home", href: "/" },
    { name: "Learn", href: LEARN_PATH },
  ];
  if (page) trail.push({ name: page.name, href: learnPath(page.slug) });
  return trail;
}

/** Removes the inline link and bold markup supported by `RichText`. */
export function plainText(text: string) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

export function formatLearnDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
