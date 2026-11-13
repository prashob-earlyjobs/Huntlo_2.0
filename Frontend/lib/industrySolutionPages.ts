export const SOLUTIONS_PATH = "/solutions";

export function solutionPath(slug: string) {
  return `${SOLUTIONS_PATH}/${slug}`;
}

export type SolutionIconItem = {
  icon: string;
  title: string;
  body: string;
};

export type SolutionLink = {
  href: string;
  title: string;
  description: string;
};

export type SolutionUseCase = SolutionIconItem & {
  capability: { label: string; href: string };
};

export type SolutionFaq = {
  question: string;
  answer: string;
};

export type SolutionComparisonRow = {
  dimension: string;
  conventional: string;
  huntlo: string;
};

export type SolutionVisual = {
  input: { label: string; text: string };
  middle: { label: string; items: { icon: string; label: string }[] };
  output: { label: string; liveLabel: string; pills: [string, string]; note: string };
  flow: string[];
};

export type SolutionPage = {
  slug: string;
  /** H1 and primary page name. */
  name: string;
  /** Final breadcrumb label. */
  breadcrumb: string;
  icon: string;
  cardDescription: string;
  /** Row in the hub's "which solution fits" table. */
  fit: { motion: string; startWith: string };
  seo: { title: string; description: string };
  hero: { accent: string; summary: string; chips: string[] };
  answer: { question: string; text: string };
  visual: SolutionVisual;
  problem: { title: string; intro: string; items: SolutionIconItem[] };
  approach: { title: string; intro: string; ai: string[]; recruiters: string[] };
  workflow: { title: string; intro: string; steps: SolutionIconItem[] };
  useCases: { title: string; items: SolutionUseCase[] };
  evidence: { points: string[]; qualification: string };
  comparison: { title: string; rows: SolutionComparisonRow[] };
  faqs: SolutionFaq[];
  related: SolutionLink[];
  cta: { title: string; body: string };
};

const CAP = {
  sourcing: { label: "AI Candidate Sourcing", href: "/capabilities/ai-candidate-sourcing" },
  vibe: { label: "Vibe Sourcing", href: "/capabilities/vibe-sourcing" },
  screening: { label: "AI Candidate Screening", href: "/capabilities/ai-candidate-screening" },
  matching: { label: "AI Candidate Matching", href: "/capabilities/ai-candidate-matching" },
  outreach: { label: "AI Candidate Outreach", href: "/capabilities/ai-candidate-outreach" },
  engagement: { label: "AI Candidate Engagement", href: "/capabilities/ai-candidate-engagement" },
  scheduling: { label: "AI Interview Scheduling", href: "/capabilities/ai-interview-scheduling" },
  voice: { label: "AI Voice Interviews", href: "/capabilities/ai-voice-interviews" },
  assessments: {
    label: "AI Recruitment Assessments",
    href: "/capabilities/ai-recruitment-assessments",
  },
  crm: { label: "AI Recruitment CRM", href: "/capabilities/ai-recruitment-crm" },
  pools: { label: "AI Talent Pool Management", href: "/capabilities/ai-talent-pool-management" },
  analytics: { label: "AI Recruitment Analytics", href: "/capabilities/ai-recruitment-analytics" },
  automation: {
    label: "Recruitment Workflow Automation",
    href: "/capabilities/recruitment-workflow-automation",
  },
} as const;

const RPO: SolutionPage = {
  slug: "rpo",
  name: "AI Platform for RPO Companies",
  breadcrumb: "RPO",
  icon: "hub",
  cardDescription:
    "Run sourcing, outreach, screening and scheduling across client programs from one workspace.",
  fit: {
    motion: "Multi-client programs run by shared delivery teams",
    startWith: "Per-requisition workspaces, outreach and voice screening",
  },
  seo: {
    title: "AI Platform for RPO Companies | Huntlo",
    description:
      "Run sourcing, outreach, screening and scheduling for every client program from one workspace. See how Huntlo supports RPO delivery teams with AI agents and recruiter control.",
  },
  hero: {
    accent: "Deliver every client program from one connected layer.",
    summary:
      "Huntlo gives RPO delivery teams a workspace for each client requisition. AI agents handle sourcing, outreach, voice screening and scheduling, while recruiters own client relationships and hiring recommendations.",
    chips: [
      "Workspace per requisition",
      "Email + WhatsApp outreach",
      "AI voice screening",
      "Works alongside client ATS",
    ],
  },
  answer: {
    question: "What is an AI platform for RPO companies?",
    text: "An AI platform for RPO companies runs the repeatable steps of recruiting — sourcing, outreach, screening and scheduling — across many client programs at once, so delivery teams can take on more requisitions without adding the same amount of manual work. In Huntlo, AI agents execute those steps inside each client's workflow, and recruiters review every shortlist and own client communication.",
  },
  visual: {
    input: { label: "Client program", text: "Client A · Operations hiring across three cities" },
    middle: {
      label: "Huntlo delivery workflow",
      items: [
        { icon: "travel_explore", label: "Sourcing" },
        { icon: "forum", label: "Outreach" },
        { icon: "record_voice_over", label: "Voice screening" },
        { icon: "event_available", label: "Scheduling" },
      ],
    },
    output: {
      label: "Client-ready pipeline",
      liveLabel: "Per requisition",
      pills: ["Shortlist", "Interviews booked"],
      note: "Recruiters review every candidate before submission.",
    },
    flow: ["Source", "Engage", "Screen", "Schedule", "Submit"],
  },
  problem: {
    title: "Why RPO delivery gets harder as programs grow",
    intro:
      "RPO margins depend on recruiter capacity. Every new client program adds requisitions, stakeholders and reporting, but most of the added work is coordination rather than recruiting judgment.",
    items: [
      {
        icon: "layers",
        title: "Context switching across client programs",
        body: "Recruiters move between client systems, spreadsheets and inboxes, rebuilding searches and candidate notes for each program.",
      },
      {
        icon: "schedule",
        title: "Coordination consumes delivery capacity",
        body: "Follow-ups, availability checks and interview scheduling take hours that could go to client conversations and candidate assessment.",
      },
      {
        icon: "query_stats",
        title: "Inconsistent visibility for clients",
        body: "Pipeline status lives in different tools, so preparing client updates means compiling activity by hand.",
      },
    ],
  },
  approach: {
    title: "How Huntlo helps RPO teams",
    intro:
      "Huntlo separates execution from judgment. AI agents run the repeatable steps for each client requisition; recruiters set criteria, review outcomes and manage the client relationship.",
    ai: [
      "Source candidates for each requisition from plain-language role briefs",
      "Run Email and WhatsApp outreach with automated follow-ups",
      "Run preliminary voice screens on availability, notice period and pay expectations",
      "Send self-booking links, confirmations and reminders",
    ],
    recruiters: [
      "Agree role criteria and hiring standards with each client",
      "Review shortlists and override AI assessments",
      "Handle negotiations, sensitive conversations and offers",
      "Own client reporting and program decisions",
    ],
  },
  workflow: {
    title: "How Huntlo works for RPO delivery",
    intro:
      "Each client requisition runs through the same four connected stages, so delivery stays consistent across programs.",
    steps: [
      {
        icon: "assignment",
        title: "Set up the requisition",
        body: "Create a campaign workspace for the role and describe the requirements in plain language.",
      },
      {
        icon: "travel_explore",
        title: "Source and engage",
        body: "Huntlo surfaces active and passive candidates and starts personalized Email and WhatsApp outreach.",
      },
      {
        icon: "record_voice_over",
        title: "Screen and qualify",
        body: "Voice screens and rubric-based screening produce transcripts, scores and qualification summaries.",
      },
      {
        icon: "event_available",
        title: "Schedule and submit",
        body: "Qualified candidates self-book interviews, and recruiters submit reviewed shortlists to the client.",
      },
    ],
  },
  useCases: {
    title: "Where RPO teams use Huntlo",
    items: [
      {
        icon: "groups",
        title: "Multi-client delivery",
        body: "Separate campaign workspaces keep each client's requisitions, candidates and replies organized.",
        capability: CAP.crm,
      },
      {
        icon: "trending_up",
        title: "Volume hiring programs",
        body: "Outreach and follow-ups run in parallel across large candidate lists without manual chasing.",
        capability: CAP.outreach,
      },
      {
        icon: "record_voice_over",
        title: "Preliminary screening at scale",
        body: "Voice screens confirm the basics before recruiters spend time on interviews.",
        capability: CAP.voice,
      },
      {
        icon: "event_available",
        title: "Interview coordination",
        body: "Self-booking with calendar sync reduces back-and-forth with candidates and client panels.",
        capability: CAP.scheduling,
      },
      {
        icon: "folder_shared",
        title: "Reusable talent pools",
        body: "Save and tag strong candidates for future requisitions, within the data rules agreed with each client.",
        capability: CAP.pools,
      },
      {
        icon: "monitoring",
        title: "Program reporting",
        body: "Outreach, replies and pipeline progression are tracked per campaign for client updates.",
        capability: CAP.analytics,
      },
    ],
  },
  evidence: {
    points: [
      "Each requisition has a campaign workspace with reply tracking and pipeline visibility.",
      "Outreach runs across Email and WhatsApp, with WhatsApp messages sent through approved templates.",
      "Huntlo complements existing ATS and CRM systems rather than replacing them.",
    ],
    qualification:
      "Results depend on role criteria, market conditions and candidate availability; Huntlo does not guarantee fill rates or time-to-hire. Sharing candidate data between client programs should follow your contracts and privacy policies.",
  },
  comparison: {
    title: "How Huntlo differs from a conventional RPO tool stack",
    rows: [
      {
        dimension: "Sourcing",
        conventional: "Boolean searches rebuilt for each client and job board",
        huntlo: "Plain-language role briefs drive intent-based discovery",
      },
      {
        dimension: "Follow-up",
        conventional: "Manual reminders tracked in spreadsheets or inboxes",
        huntlo: "Automated follow-ups triggered by candidate response",
      },
      {
        dimension: "Screening",
        conventional: "A recruiter phone screen for every applicant",
        huntlo: "AI voice screens with transcripts; recruiters review and decide",
      },
      {
        dimension: "Client reporting",
        conventional: "Activity compiled by hand from several tools",
        huntlo: "Campaign-level activity tracked as the work happens",
      },
    ],
  },
  faqs: [
    {
      question: "Can Huntlo work with our clients' ATS?",
      answer:
        "Yes. Huntlo complements existing ATS and CRM systems rather than replacing them. Delivery teams typically run sourcing, outreach, screening and scheduling in Huntlo and keep the client's system of record for submissions and offers.",
    },
    {
      question: "Does Huntlo replace RPO recruiters?",
      answer:
        "No. AI agents handle repeatable execution such as outreach, follow-ups and preliminary screening. Recruiters set criteria, review every shortlist, manage client relationships and make hiring recommendations.",
    },
    {
      question: "Can we keep client programs separate?",
      answer:
        "Yes. Each requisition runs in its own campaign workspace with its own candidates, outreach and replies, so delivery teams can keep programs organized.",
    },
    {
      question: "Does Huntlo guarantee faster time-to-fill?",
      answer:
        "No. Huntlo reduces manual coordination, but outcomes depend on role requirements, market conditions and candidate availability. Measure results against your own baseline.",
    },
  ],
  related: [
    {
      href: "/solutions/it-staffing",
      title: "AI Platform for IT Staffing",
      description: "Technical sourcing and screening for staffing desks.",
    },
    {
      href: "/autonomous-recruiting",
      title: "Autonomous Recruiting",
      description: "Repetitive recruiting steps that run inside guardrails.",
    },
    {
      href: "/capabilities/recruitment-workflow-automation",
      title: "Recruitment Workflow Automation",
      description: "Automated follow-ups, scheduling and status updates.",
    },
    {
      href: "/hiring-os",
      title: "Huntlo360 — AI Hiring OS",
      description: "The operating system connecting discovery, engagement and execution.",
    },
  ],
  cta: {
    title: "Scale RPO delivery without scaling coordination",
    body: "See how Huntlo runs sourcing, outreach, screening and scheduling across your client programs.",
  },
};

const EXECUTIVE_SEARCH: SolutionPage = {
  slug: "executive-search",
  name: "AI Platform for Executive Search",
  breadcrumb: "Executive Search",
  icon: "workspace_premium",
  cardDescription:
    "Map senior talent faster while consultants lead every approach and recommendation.",
  fit: {
    motion: "Retained, confidential senior searches",
    startWith: "Market mapping and candidate prioritization",
  },
  seo: {
    title: "AI Platform for Executive Search Firms | Huntlo",
    description:
      "Map senior talent, prioritize candidates and coordinate outreach for every search. See how Huntlo supports executive search consultants while partners own every relationship.",
  },
  hero: {
    accent: "Map senior talent faster. Keep every relationship personal.",
    summary:
      "Huntlo helps executive search teams build market maps, prioritize senior candidates and coordinate outreach and scheduling, while partners and consultants lead every conversation and recommendation.",
    chips: [
      "Intent-based talent mapping",
      "Trajectory and domain signals",
      "Consultant-led outreach",
      "One record per candidate",
    ],
  },
  answer: {
    question: "What is an AI platform for executive search?",
    text: "An AI platform for executive search helps search firms research markets, identify and prioritize senior candidates, and coordinate outreach and scheduling, so consultants spend more of their time with clients and candidates. In Huntlo, AI handles research and coordination; consultants decide who to approach, how to approach them and whom to present.",
  },
  visual: {
    input: {
      label: "Search brief",
      text: "CFO · listed fintech · regulated-markets experience",
    },
    middle: {
      label: "Huntlo search research",
      items: [
        { icon: "account_tree", label: "Talent mapping" },
        { icon: "timeline", label: "Career trajectory" },
        { icon: "domain", label: "Domain depth" },
        { icon: "fact_check", label: "Shortlist review" },
      ],
    },
    output: {
      label: "Consultant longlist",
      liveLabel: "Partner review",
      pills: ["Longlist", "Priority targets"],
      note: "Consultants decide who is approached and how.",
    },
    flow: ["Brief", "Map", "Prioritize", "Approach", "Present"],
  },
  problem: {
    title: "Why executive search research is hard to scale",
    intro:
      "Retained search depends on market knowledge and trust. Research, mapping and coordination take weeks of associate time before consultants can focus on the conversations that matter.",
    items: [
      {
        icon: "travel_explore",
        title: "Senior talent is mostly passive",
        body: "The strongest candidates rarely apply. Finding them means mapping companies, teams and career paths by hand.",
      },
      {
        icon: "manage_search",
        title: "Keyword search misses context",
        body: "Titles vary across companies and markets, so keyword searches miss relevant leaders and surface poor fits.",
      },
      {
        icon: "lock",
        title: "Approaches must stay discreet",
        body: "Senior candidates expect careful, personal outreach, which is hard to coordinate across a search team.",
      },
    ],
  },
  approach: {
    title: "How Huntlo helps executive search teams",
    intro:
      "Huntlo accelerates research and coordination, not judgment. AI builds and prioritizes the market map; consultants decide who to approach, what to say and whom to present.",
    ai: [
      "Build longlists from plain-language search briefs",
      "Surface career trajectory, seniority and domain signals",
      "Personalize outreach from candidate context for consultant review",
      "Coordinate scheduling once candidates engage",
    ],
    recruiters: [
      "Define the brief and success profile with the client",
      "Decide which candidates to approach and when",
      "Lead every senior conversation personally",
      "Assess leadership fit and present the shortlist",
    ],
  },
  workflow: {
    title: "How Huntlo works for executive search",
    intro: "Searches move through four stages, with consultants approving each transition.",
    steps: [
      {
        icon: "description",
        title: "Capture the search brief",
        body: "Describe the role, context and success profile in plain language.",
      },
      {
        icon: "account_tree",
        title: "Map the market",
        body: "Huntlo surfaces relevant leaders using trajectory, seniority and domain signals.",
      },
      {
        icon: "rate_review",
        title: "Prioritize and approach",
        body: "Consultants review the longlist and approve personalized outreach.",
      },
      {
        icon: "event_available",
        title: "Coordinate conversations",
        body: "Engaged candidates book time with consultants, and notes stay in one record.",
      },
    ],
  },
  useCases: {
    title: "Where executive search teams use Huntlo",
    items: [
      {
        icon: "account_tree",
        title: "Market mapping",
        body: "Build structured longlists across target companies and adjacent industries.",
        capability: CAP.sourcing,
      },
      {
        icon: "diversity_3",
        title: "Leadership-style research",
        body: "Describe the leadership style a client needs and surface candidates with relevant context.",
        capability: CAP.vibe,
      },
      {
        icon: "compare_arrows",
        title: "Candidate prioritization",
        body: "Rank candidates by skill depth, seniority and domain relevance before outreach.",
        capability: CAP.matching,
      },
      {
        icon: "mail",
        title: "Personalized approaches",
        body: "Personalize messages from candidate context, with consultants reviewing before anything is sent.",
        capability: CAP.outreach,
      },
      {
        icon: "contacts",
        title: "Search records",
        body: "Keep conversations, outreach history and status in one candidate record.",
        capability: CAP.crm,
      },
      {
        icon: "event_available",
        title: "Interview coordination",
        body: "Schedule consultant and client conversations without email back-and-forth.",
        capability: CAP.scheduling,
      },
    ],
  },
  evidence: {
    points: [
      "Intent-driven talent discovery replaces static Boolean keyword searches.",
      "Compatibility considers skill depth, seniority and domain relevance, not just title overlap.",
      "Conversations, outreach history and screening transcripts are kept in one candidate record.",
    ],
    qualification:
      "Talent signals come from available professional information and are indicators, not assessments of a person. Consultants should validate leadership fit, references and confidential details directly.",
  },
  comparison: {
    title: "How Huntlo differs from manual search research",
    rows: [
      {
        dimension: "Research",
        conventional: "Associates build lists company by company",
        huntlo: "Longlists generated from a plain-language brief",
      },
      {
        dimension: "Relevance",
        conventional: "Title and keyword matches",
        huntlo: "Career trajectory, seniority and domain signals",
      },
      {
        dimension: "Outreach",
        conventional: "Individually written messages tracked in inboxes",
        huntlo: "Personalized messages reviewed by consultants, with history per candidate",
      },
      {
        dimension: "Decisions",
        conventional: "Consultant judgment",
        huntlo: "Consultant judgment — Huntlo adds research, not decisions",
      },
    ],
  },
  faqs: [
    {
      question: "Is Huntlo suitable for confidential searches?",
      answer:
        "Huntlo keeps search activity in your workspace with role-based permissions, and consultants control who is approached and what is sent. Confidentiality commitments to clients and candidates remain your firm's responsibility.",
    },
    {
      question: "Does Huntlo contact candidates automatically?",
      answer:
        "Only through the outreach your team configures. Most executive search firms keep consultants in control of first approaches and use automation for follow-ups and scheduling.",
    },
    {
      question: "Can Huntlo assess leadership quality?",
      answer:
        "No. Huntlo surfaces signals such as career trajectory, seniority and domain experience. Leadership assessment, referencing and recommendations stay with your consultants.",
    },
    {
      question: "Does Huntlo replace our search database?",
      answer:
        "No. Huntlo complements existing ATS and CRM systems, adding discovery, outreach and coordination on top of the records you already keep.",
    },
  ],
  related: [
    {
      href: "/capabilities/vibe-sourcing",
      title: "Vibe Sourcing",
      description: "Discovery based on working style and team fit, not just keywords.",
    },
    {
      href: "/capabilities/ai-candidate-matching",
      title: "AI Candidate Matching",
      description: "Prioritize candidates by skill depth, seniority and domain.",
    },
    {
      href: "/human-ai-hiring",
      title: "Human + AI Hiring",
      description: "How work is divided between AI agents and recruiters.",
    },
    {
      href: "/solutions/rpo",
      title: "AI Platform for RPO Companies",
      description: "Multi-client delivery for RPO programs.",
    },
  ],
  cta: {
    title: "Spend less time researching and more time advising",
    body: "See how Huntlo supports market mapping, prioritization and coordination for executive search.",
  },
};

const IT_STAFFING: SolutionPage = {
  slug: "it-staffing",
  name: "AI Platform for IT Staffing",
  breadcrumb: "IT Staffing",
  icon: "code",
  cardDescription:
    "Source engineers by skill depth, confirm availability and submit stronger shortlists.",
  fit: {
    motion: "Fast-moving technical and contract requisitions",
    startWith: "Skill-depth matching and availability screens",
  },
  seo: {
    title: "AI Platform for IT Staffing Agencies | Huntlo",
    description:
      "Source developers and engineers by skill depth, screen availability and rates by voice, and submit reviewed shortlists. See how Huntlo helps IT staffing teams move on technical requisitions.",
  },
  hero: {
    accent: "Fill technical requisitions faster with skill-aware sourcing.",
    summary:
      "Huntlo helps IT staffing recruiters find engineers by skill depth rather than keywords, confirm availability and rates with voice screens, and submit reviewed shortlists while client requisitions are still open.",
    chips: [
      "Skill-depth matching",
      "Availability and rate screens",
      "Email + WhatsApp outreach",
      "Role-based assessments",
    ],
  },
  answer: {
    question: "What is an AI platform for IT staffing?",
    text: "An AI platform for IT staffing helps agencies source, screen and submit technical candidates — developers, engineers, data and cloud specialists — quickly enough to compete on open requisitions. Huntlo matches candidates on skill depth and seniority, runs preliminary screens on availability and rates, and keeps recruiters in charge of every submission.",
  },
  visual: {
    input: { label: "Client requisition", text: "Senior Java developer · contract · hybrid" },
    middle: {
      label: "Huntlo technical workflow",
      items: [
        { icon: "code", label: "Skill depth" },
        { icon: "travel_explore", label: "Sourcing" },
        { icon: "record_voice_over", label: "Availability screen" },
        { icon: "quiz", label: "Assessment" },
      ],
    },
    output: {
      label: "Submission-ready",
      liveLabel: "Recruiter review",
      pills: ["Matched", "Screened"],
      note: "Recruiters confirm technical fit before submitting.",
    },
    flow: ["Requisition", "Match", "Screen", "Assess", "Submit"],
  },
  problem: {
    title: "Why IT staffing desks lose requisitions",
    intro:
      "In IT staffing, the first strong submission often wins. Speed matters, but so does technical accuracy, and both suffer when recruiters work from keyword searches and manual follow-up.",
    items: [
      {
        icon: "code",
        title: "Keywords miss technical depth",
        body: "A matching keyword doesn't show whether someone has production experience with a stack, or at what seniority.",
      },
      {
        icon: "timer",
        title: "Speed decides who places",
        body: "Several agencies often work the same requisition, so slow sourcing and screening lose placements.",
      },
      {
        icon: "sync_problem",
        title: "Availability changes constantly",
        body: "Contractors move between projects quickly, so availability, notice period and rate need confirming for every submission.",
      },
    ],
  },
  approach: {
    title: "How Huntlo helps IT staffing teams",
    intro:
      "Huntlo runs the high-volume technical groundwork so recruiters can focus on client relationships and accurate submissions.",
    ai: [
      "Match candidates on skill depth, seniority and domain relevance",
      "Start Email and WhatsApp outreach as soon as a requisition opens",
      "Confirm availability, notice period and rate expectations by voice",
      "Send role-based assessments and schedule client interviews",
    ],
    recruiters: [
      "Clarify requirements with the client's hiring manager",
      "Review technical fit before any submission",
      "Negotiate rates and manage counteroffers",
      "Own the client relationship and the placement",
    ],
  },
  workflow: {
    title: "How Huntlo works for IT staffing",
    intro: "Each technical requisition follows four connected steps from intake to submission.",
    steps: [
      {
        icon: "assignment",
        title: "Take the requisition",
        body: "Paste the client brief or describe the stack, seniority and engagement type.",
      },
      {
        icon: "travel_explore",
        title: "Match and engage",
        body: "Huntlo surfaces candidates by skill depth and starts outreach across Email and WhatsApp.",
      },
      {
        icon: "record_voice_over",
        title: "Screen and assess",
        body: "Voice screens confirm availability and rates; role-based assessments check technical skills.",
      },
      {
        icon: "send",
        title: "Review and submit",
        body: "Recruiters review transcripts, scores and profiles, then submit the strongest candidates.",
      },
    ],
  },
  useCases: {
    title: "Where IT staffing teams use Huntlo",
    items: [
      {
        icon: "badge",
        title: "Contract and contract-to-hire roles",
        body: "Confirm availability and rate expectations before candidates reach the client.",
        capability: CAP.voice,
      },
      {
        icon: "compare_arrows",
        title: "Skill-based matching",
        body: "Prioritize candidates by stack depth and seniority, not title overlap.",
        capability: CAP.matching,
      },
      {
        icon: "quiz",
        title: "Technical assessments",
        body: "Add role-based assessments between screening and client interviews.",
        capability: CAP.assessments,
      },
      {
        icon: "forum",
        title: "Fast outreach",
        body: "Reach candidates across Email and WhatsApp with automated follow-ups.",
        capability: CAP.outreach,
      },
      {
        icon: "folder_shared",
        title: "Bench and redeployment pools",
        body: "Tag candidates by skills and availability so they can be re-engaged for new requisitions.",
        capability: CAP.pools,
      },
      {
        icon: "fact_check",
        title: "Rubric-based screening",
        body: "Evaluate applicants against role criteria with context-aware rubrics.",
        capability: CAP.screening,
      },
    ],
  },
  evidence: {
    points: [
      "Compatibility considers skill depth, seniority and domain relevance, not just title overlap.",
      "Voice screens verify availability, notice period, compensation expectations and role interest.",
      "Assessments are role-based, with automated scoring and skill breakdowns.",
    ],
    qualification:
      "Match scores and assessment results are estimates based on the information available. Recruiters should verify technical claims, work authorization and references before submission, and confirm the assessment features available for their workspace with the Huntlo team.",
  },
  comparison: {
    title: "How Huntlo differs from keyword-based IT sourcing",
    rows: [
      {
        dimension: "Matching",
        conventional: "Keyword and title overlap",
        huntlo: "Skill depth, seniority and domain relevance",
      },
      {
        dimension: "Availability checks",
        conventional: "A recruiter call to every candidate",
        huntlo: "Voice screens with transcripts and summaries",
      },
      {
        dimension: "Technical validation",
        conventional: "Left to the client interview",
        huntlo: "Role-based assessments before submission",
      },
      {
        dimension: "Follow-up",
        conventional: "Manual, and often missed on busy desks",
        huntlo: "Automated follow-ups based on candidate response",
      },
    ],
  },
  faqs: [
    {
      question: "Can Huntlo source niche technical skills?",
      answer:
        "Huntlo searches by skill depth, seniority and domain relevance from a plain-language brief. Coverage for very niche skills depends on the talent signals available, so recruiters should review results and refine the brief.",
    },
    {
      question: "Does Huntlo check rates and availability?",
      answer:
        "Yes. AI voice screens ask about availability, notice period, rate or compensation expectations and role interest, and produce a transcript and qualification summary for recruiters to review.",
    },
    {
      question: "Can we use Huntlo alongside our ATS?",
      answer:
        "Yes. Huntlo complements existing ATS and CRM systems rather than replacing them, so submissions can continue through your current system or the client's vendor portal.",
    },
    {
      question: "Does Huntlo guarantee more placements?",
      answer:
        "No. Huntlo reduces manual sourcing and coordination, but placements depend on client requirements, market rates and candidate availability.",
    },
  ],
  related: [
    {
      href: "/solutions/rpo",
      title: "AI Platform for RPO Companies",
      description: "Multi-client delivery for RPO programs.",
    },
    {
      href: "/solutions/global-capability-centers",
      title: "AI Hiring for GCCs",
      description: "Technology and specialist hiring for capability centers.",
    },
    {
      href: "/recruiting-agents",
      title: "AI Recruiting Agents",
      description: "The agents that run sourcing, outreach and screening.",
    },
    {
      href: "/compare",
      title: "Compare Huntlo",
      description: "How Huntlo compares with other recruiting tools.",
    },
  ],
  cta: {
    title: "Submit stronger technical candidates, sooner",
    body: "See how Huntlo handles technical sourcing, screening and assessments for IT staffing desks.",
  },
};

const HEALTHCARE: SolutionPage = {
  slug: "healthcare-recruitment",
  name: "AI Healthcare Recruitment",
  breadcrumb: "Healthcare Recruitment",
  icon: "local_hospital",
  cardDescription:
    "Reach clinical talent between shifts, screen availability and schedule around rosters.",
  fit: {
    motion: "Continuous, shift-based clinical and support hiring",
    startWith: "WhatsApp outreach, availability screens and self-scheduling",
  },
  seo: {
    title: "AI Healthcare Recruitment Software | Huntlo",
    description:
      "Reach nurses, allied health and support staff with Email and WhatsApp outreach, voice screens and self-scheduling. Recruiters keep control of credential checks and hiring decisions.",
  },
  hero: {
    accent: "Reach clinical talent faster, with recruiters on every decision.",
    summary:
      "Huntlo helps healthcare recruiters engage nurses, allied health professionals and support staff over Email and WhatsApp, confirm shift preferences and availability by voice, and schedule interviews around busy rosters.",
    chips: [
      "Shift and availability screens",
      "WhatsApp outreach",
      "Self-scheduling",
      "Credential checks stay with recruiters",
    ],
  },
  answer: {
    question: "What is AI healthcare recruitment?",
    text: "AI healthcare recruitment uses AI to handle the repetitive parts of hiring clinical and non-clinical staff — finding candidates, outreach, preliminary screening and interview scheduling — so recruiters can focus on credential verification, compliance and candidate relationships. Huntlo automates engagement and coordination; it does not verify licences or make clinical judgments.",
  },
  visual: {
    input: { label: "Hiring need", text: "Registered nurses · ICU · rotating shifts" },
    middle: {
      label: "Huntlo engagement workflow",
      items: [
        { icon: "forum", label: "WhatsApp outreach" },
        { icon: "record_voice_over", label: "Shift screen" },
        { icon: "event_available", label: "Self-scheduling" },
        { icon: "verified_user", label: "Recruiter checks" },
      ],
    },
    output: {
      label: "Interview-ready",
      liveLabel: "Recruiter verified",
      pills: ["Available", "Interview booked"],
      note: "Licences and credentials are verified by your team.",
    },
    flow: ["Need", "Engage", "Screen", "Schedule", "Verify"],
  },
  problem: {
    title: "Why healthcare hiring stalls",
    intro:
      "Healthcare teams hire continuously, often for shift-based roles with tight start dates. Candidates are busy, hard to reach during working hours and frequently weighing several offers.",
    items: [
      {
        icon: "schedule",
        title: "Candidates work irregular hours",
        body: "Clinical staff are on shift when recruiters call, so phone-first outreach leads to missed connections and long delays.",
      },
      {
        icon: "event_busy",
        title: "Scheduling around rosters is slow",
        body: "Coordinating interviews between candidates on rotating shifts and busy hiring managers takes days of back-and-forth.",
      },
      {
        icon: "rule",
        title: "Screening basics take recruiter time",
        body: "Confirming shift preferences, location and start dates for every applicant leaves less time for credential checks and candidate care.",
      },
    ],
  },
  approach: {
    title: "How Huntlo helps healthcare recruiters",
    intro:
      "Huntlo handles engagement and coordination around candidates' schedules. Recruiters keep ownership of credential verification, compliance checks and every hiring decision.",
    ai: [
      "Reach candidates by Email and WhatsApp, which they can answer between shifts",
      "Run voice screens on availability, shift preferences and start dates",
      "Let candidates self-book interviews from synced calendars",
      "Send confirmations and reminders to candidates and managers",
    ],
    recruiters: [
      "Verify licences, registrations and credentials",
      "Run compliance and background checks",
      "Assess clinical experience with ward or facility leads",
      "Make offers and manage onboarding handoffs",
    ],
  },
  workflow: {
    title: "How Huntlo works for healthcare recruitment",
    intro: "Healthcare requisitions move through four steps designed around candidates' working hours.",
    steps: [
      {
        icon: "assignment",
        title: "Define the role",
        body: "Describe the role, setting, shift pattern and must-have requirements.",
      },
      {
        icon: "forum",
        title: "Engage candidates",
        body: "Huntlo sources candidates and starts Email and WhatsApp outreach with automated follow-ups.",
      },
      {
        icon: "record_voice_over",
        title: "Screen availability",
        body: "Voice screens confirm availability, shift preferences and start dates, with transcripts for review.",
      },
      {
        icon: "event_available",
        title: "Schedule and verify",
        body: "Candidates self-book interviews while recruiters complete credential and compliance checks.",
      },
    ],
  },
  useCases: {
    title: "Where healthcare recruiters use Huntlo",
    items: [
      {
        icon: "forum",
        title: "Shift-friendly outreach",
        body: "Message candidates where they can reply between shifts, with automated follow-ups.",
        capability: CAP.engagement,
      },
      {
        icon: "record_voice_over",
        title: "Preliminary screening",
        body: "Confirm availability, shift preferences and location before interviews.",
        capability: CAP.voice,
      },
      {
        icon: "event_available",
        title: "Interview scheduling",
        body: "Self-booking with reminders keeps candidates and hiring managers aligned.",
        capability: CAP.scheduling,
      },
      {
        icon: "folder_shared",
        title: "Pools for recurring roles",
        body: "Keep engaged candidates organized for future openings in similar roles.",
        capability: CAP.pools,
      },
      {
        icon: "travel_explore",
        title: "Specialist sourcing",
        body: "Find candidates for specialist and hard-to-fill roles from plain-language briefs.",
        capability: CAP.sourcing,
      },
      {
        icon: "autorenew",
        title: "Automated status updates",
        body: "Keep candidates informed as they move through the process.",
        capability: CAP.automation,
      },
    ],
  },
  evidence: {
    points: [
      "Outreach runs across Email and WhatsApp, with WhatsApp messages sent through approved templates.",
      "Voice screens verify availability, notice period, compensation expectations and role interest.",
      "Candidates self-book through panel calendar sync, with automated confirmations and reminders.",
    ],
    qualification:
      "Huntlo does not verify professional licences, registrations or clinical competence. Credential verification, background checks and compliance with healthcare employment regulations remain the responsibility of your recruiting and compliance teams.",
  },
  comparison: {
    title: "How Huntlo differs from phone-first healthcare recruiting",
    rows: [
      {
        dimension: "First contact",
        conventional: "Phone calls during working hours",
        huntlo: "Email and WhatsApp messages candidates can answer between shifts",
      },
      {
        dimension: "Screening",
        conventional: "A recruiter call for every applicant",
        huntlo: "Voice screens with transcripts; recruiters review",
      },
      {
        dimension: "Scheduling",
        conventional: "Back-and-forth across rosters",
        huntlo: "Self-booking from synced calendars, with reminders",
      },
      {
        dimension: "Credential checks",
        conventional: "Recruiter-led",
        huntlo: "Still recruiter-led — Huntlo frees time for them",
      },
    ],
  },
  faqs: [
    {
      question: "Does Huntlo verify nursing licences or credentials?",
      answer:
        "No. Huntlo automates engagement, preliminary screening and scheduling. Licence, registration and credential verification remain with your recruiting and compliance teams.",
    },
    {
      question: "Can Huntlo help with high-volume healthcare hiring?",
      answer:
        "Yes. Outreach, follow-ups, voice screens and scheduling run in parallel across large candidate lists, so recruiters can focus on verification and candidate conversations.",
    },
    {
      question: "Which channels does Huntlo use to reach candidates?",
      answer:
        "Huntlo runs outreach across Email and WhatsApp, with WhatsApp messages sent through approved templates, and uses voice for preliminary screening.",
    },
    {
      question: "Does Huntlo make hiring decisions?",
      answer:
        "No. AI evaluations support recruiter and hiring-manager judgment. Clinical fit, compliance checks and final decisions stay with your team.",
    },
  ],
  related: [
    {
      href: "/solutions/manufacturing-recruitment",
      title: "AI Manufacturing Recruitment",
      description: "Shift-based hiring across plants and sites.",
    },
    {
      href: "/solutions/bpo-recruitment",
      title: "AI BPO Recruitment",
      description: "High-volume screening and scheduling.",
    },
    {
      href: "/human-ai-hiring",
      title: "Human + AI Hiring",
      description: "How work is divided between AI agents and recruiters.",
    },
    {
      href: "/autonomous-recruiting",
      title: "Autonomous Recruiting",
      description: "Repetitive recruiting steps that run inside guardrails.",
    },
  ],
  cta: {
    title: "Hire clinical staff without the scheduling chase",
    body: "See how Huntlo handles outreach, screening and scheduling for healthcare recruitment teams.",
  },
};

const MANUFACTURING: SolutionPage = {
  slug: "manufacturing-recruitment",
  name: "AI Manufacturing Recruitment",
  breadcrumb: "Manufacturing Recruitment",
  icon: "precision_manufacturing",
  cardDescription:
    "Staff plants and shifts with WhatsApp outreach, shift screens and site scheduling.",
  fit: {
    motion: "Multi-site frontline and skilled hiring",
    startWith: "WhatsApp outreach and shift and location screens",
  },
  seo: {
    title: "AI Manufacturing Recruitment Software | Huntlo",
    description:
      "Hire plant, production and engineering talent across sites. Huntlo runs WhatsApp outreach, shift and location screens and interview scheduling so recruiters can focus on skills and fit.",
  },
  hero: {
    accent: "Staff every shift and site with less manual coordination.",
    summary:
      "Huntlo helps manufacturing recruiters reach operators, technicians and engineers on WhatsApp and Email, confirm shift, location and availability by voice, and schedule site interviews, with recruiters and plant leaders deciding who joins.",
    chips: [
      "Multi-site hiring",
      "WhatsApp-first outreach",
      "Shift and location screens",
      "Plant and engineering roles",
    ],
  },
  answer: {
    question: "What is AI manufacturing recruitment?",
    text: "AI manufacturing recruitment applies AI to the repetitive work of hiring production, maintenance, quality and engineering staff — sourcing, outreach, preliminary screening and interview scheduling across plants and shifts. Huntlo automates that execution so recruiters and plant managers can focus on skills, safety and fit.",
  },
  visual: {
    input: { label: "Plant requirement", text: "CNC operators · night shift · two sites" },
    middle: {
      label: "Huntlo site hiring workflow",
      items: [
        { icon: "forum", label: "WhatsApp outreach" },
        { icon: "record_voice_over", label: "Shift screen" },
        { icon: "location_on", label: "Location fit" },
        { icon: "event_available", label: "Site interviews" },
      ],
    },
    output: {
      label: "Shift-ready pipeline",
      liveLabel: "By site",
      pills: ["Qualified", "Interview booked"],
      note: "Plant leaders confirm skills and safety readiness.",
    },
    flow: ["Requirement", "Reach", "Screen", "Schedule", "Select"],
  },
  problem: {
    title: "Why manufacturing hiring is hard to keep up with",
    intro:
      "Manufacturing teams hire for many sites, shifts and skill levels at once. Demand changes with production plans, and frontline candidates expect quick responses.",
    items: [
      {
        icon: "factory",
        title: "Many sites, many shifts",
        body: "Each plant has its own shift patterns, locations and hiring managers, which multiplies coordination.",
      },
      {
        icon: "phone_disabled",
        title: "Frontline candidates are hard to reach",
        body: "Operators and technicians rarely check job portals or email, so slow or mismatched outreach loses them.",
      },
      {
        icon: "engineering",
        title: "Skilled roles are scarce",
        body: "Maintenance technicians, quality specialists and engineers need targeted sourcing alongside volume hiring.",
      },
    ],
  },
  approach: {
    title: "How Huntlo helps manufacturing recruiters",
    intro:
      "Huntlo runs outreach, screening and scheduling across sites, so recruiters and plant leaders spend their time assessing skills and fit.",
    ai: [
      "Reach candidates on WhatsApp and Email, with follow-ups",
      "Screen for shift availability, location and start date by voice",
      "Source skilled technicians and engineers from plain-language briefs",
      "Schedule site interviews and send reminders",
    ],
    recruiters: [
      "Plan headcount with plant and production leaders",
      "Assess technical skills and safety readiness",
      "Coordinate trade tests and site visits",
      "Make offers and manage onboarding",
    ],
  },
  workflow: {
    title: "How Huntlo works for manufacturing recruitment",
    intro:
      "Every site requisition follows the same four steps, so hiring stays consistent across plants.",
    steps: [
      {
        icon: "assignment",
        title: "Set the site requirement",
        body: "Define the role, shift, site and must-have skills for each requisition.",
      },
      {
        icon: "forum",
        title: "Reach candidates",
        body: "Huntlo sources candidates and starts WhatsApp and Email outreach with automated follow-ups.",
      },
      {
        icon: "record_voice_over",
        title: "Screen for fit",
        body: "Voice screens confirm shift availability, location and start dates.",
      },
      {
        icon: "event_available",
        title: "Schedule site interviews",
        body: "Qualified candidates self-book interviews and get reminders; plant leaders make the final call.",
      },
    ],
  },
  useCases: {
    title: "Where manufacturing recruiters use Huntlo",
    items: [
      {
        icon: "factory",
        title: "Multi-site requisitions",
        body: "Run a separate campaign workspace for each plant and role.",
        capability: CAP.crm,
      },
      {
        icon: "forum",
        title: "Frontline outreach",
        body: "Reach operators and technicians on WhatsApp through approved templates.",
        capability: CAP.outreach,
      },
      {
        icon: "record_voice_over",
        title: "Shift and location screening",
        body: "Confirm shift availability and commute fit before interviews.",
        capability: CAP.voice,
      },
      {
        icon: "engineering",
        title: "Skilled and engineering roles",
        body: "Source maintenance, quality and engineering talent by skill depth.",
        capability: CAP.sourcing,
      },
      {
        icon: "event_available",
        title: "Site interview scheduling",
        body: "Coordinate interviews across plants and shifts with self-booking.",
        capability: CAP.scheduling,
      },
      {
        icon: "monitoring",
        title: "Hiring visibility by site",
        body: "Track outreach, replies and pipeline progression for each campaign.",
        capability: CAP.analytics,
      },
    ],
  },
  evidence: {
    points: [
      "Outreach runs across Email and WhatsApp, with WhatsApp messages sent through approved templates.",
      "Voice screens verify availability, notice period, compensation expectations and role interest.",
      "Each requisition has a campaign workspace with reply tracking and pipeline visibility.",
    ],
    qualification:
      "Huntlo does not assess safety competence or run trade tests. Skills validation, safety training and statutory checks remain with your recruiting and plant teams, and outcomes depend on local labour markets and role requirements.",
  },
  comparison: {
    title: "How Huntlo differs from manual plant hiring",
    rows: [
      {
        dimension: "Outreach",
        conventional: "Job portal posts and phone calls",
        huntlo: "WhatsApp and Email outreach with automated follow-ups",
      },
      {
        dimension: "Screening",
        conventional: "Walk-ins and recruiter calls",
        huntlo: "Voice screens on shift, location and start date",
      },
      {
        dimension: "Coordination",
        conventional: "A spreadsheet for each site",
        huntlo: "A campaign workspace for each site requisition",
      },
      {
        dimension: "Selection",
        conventional: "Plant leaders decide",
        huntlo: "Plant leaders still decide — with screened, scheduled candidates",
      },
    ],
  },
  faqs: [
    {
      question: "Can Huntlo handle hiring across multiple plants?",
      answer:
        "Yes. Each site requisition runs in its own campaign workspace, with outreach, screening and scheduling tracked separately for each plant and role.",
    },
    {
      question: "Does Huntlo work for frontline and blue-collar roles?",
      answer:
        "Yes. WhatsApp outreach and short voice screens suit frontline candidates who rarely use email or job portals. Recruiters review every screening outcome.",
    },
    {
      question: "Can Huntlo source engineers and skilled technicians?",
      answer:
        "Yes. Huntlo searches by skill depth, seniority and domain relevance from a plain-language brief, alongside volume hiring for production roles.",
    },
    {
      question: "Does Huntlo run trade tests or safety checks?",
      answer:
        "No. Trade tests, safety training and statutory checks stay with your recruiting and plant teams. Huntlo handles outreach, preliminary screening and scheduling.",
    },
  ],
  related: [
    {
      href: "/solutions/bpo-recruitment",
      title: "AI BPO Recruitment",
      description: "High-volume screening and scheduling.",
    },
    {
      href: "/solutions/healthcare-recruitment",
      title: "AI Healthcare Recruitment",
      description: "Shift-friendly outreach for clinical hiring.",
    },
    {
      href: "/capabilities/recruitment-workflow-automation",
      title: "Recruitment Workflow Automation",
      description: "Automated follow-ups, scheduling and status updates.",
    },
    {
      href: "/hiring-os",
      title: "Huntlo360 — AI Hiring OS",
      description: "The operating system connecting discovery, engagement and execution.",
    },
  ],
  cta: {
    title: "Keep every shift staffed",
    body: "See how Huntlo runs outreach, screening and scheduling across your plants.",
  },
};

const BPO: SolutionPage = {
  slug: "bpo-recruitment",
  name: "AI BPO Recruitment",
  breadcrumb: "BPO Recruitment",
  icon: "support_agent",
  cardDescription:
    "Screen and schedule large applicant volumes for support and operations ramps.",
  fit: {
    motion: "High-volume batch and ramp hiring",
    startWith: "Voice screening and automated follow-ups",
  },
  seo: {
    title: "AI BPO Recruitment Software for High-Volume Hiring | Huntlo",
    description:
      "Screen and schedule large applicant volumes for customer support and operations roles. Huntlo runs voice screens, WhatsApp follow-ups and self-scheduling while recruiters make the final call.",
  },
  hero: {
    accent: "Run high-volume hiring without high-volume busywork.",
    summary:
      "Huntlo helps BPO and customer-experience recruiters engage large applicant pools, run voice screens that capture spoken responses, and schedule interviews automatically, so recruiters can focus on final assessments and ramp plans.",
    chips: [
      "High-volume screening",
      "Voice screens with transcripts",
      "WhatsApp follow-ups",
      "Batch and ramp hiring",
    ],
  },
  answer: {
    question: "What is AI BPO recruitment?",
    text: "AI BPO recruitment uses AI to manage the volume in business process outsourcing hiring — engaging applicants, running preliminary voice screens, sending follow-ups and scheduling interviews for customer support, operations and back-office roles. Huntlo automates that execution; recruiters review results and make every hiring decision.",
  },
  visual: {
    input: { label: "Ramp requirement", text: "Customer support associates · voice process" },
    middle: {
      label: "Huntlo volume workflow",
      items: [
        { icon: "forum", label: "Outreach" },
        { icon: "record_voice_over", label: "Voice screen" },
        { icon: "grading", label: "Response scores" },
        { icon: "event_available", label: "Scheduling" },
      ],
    },
    output: {
      label: "Batch-ready shortlist",
      liveLabel: "Recruiter review",
      pills: ["Screened", "Interviews booked"],
      note: "Recruiters review every screening outcome.",
    },
    flow: ["Ramp", "Engage", "Screen", "Schedule", "Select"],
  },
  problem: {
    title: "Why BPO hiring overwhelms recruiting teams",
    intro:
      "BPO teams often hire large batches against tight ramp dates. Applicant volumes are high, drop-off is common and every candidate needs a screening conversation.",
    items: [
      {
        icon: "groups",
        title: "Applicant volume outpaces recruiters",
        body: "Hundreds of applicants per ramp means recruiters can't call everyone quickly, and good candidates accept other offers.",
      },
      {
        icon: "call",
        title: "Screening calls are repetitive",
        body: "The same availability, shift and location questions are asked in every first call.",
      },
      {
        icon: "person_remove",
        title: "Drop-off between stages",
        body: "Candidates disappear between application, screening and interview when follow-ups are slow.",
      },
    ],
  },
  approach: {
    title: "How Huntlo helps BPO recruiters",
    intro:
      "Huntlo runs the repetitive first stages at volume, so recruiters spend their time on final assessments and candidates who are ready to join.",
    ai: [
      "Engage applicants on WhatsApp and Email as soon as they apply",
      "Run voice screens with the questions your team configures",
      "Produce transcripts, response scores and qualification summaries",
      "Send self-booking links, confirmations and reminders",
    ],
    recruiters: [
      "Set screening questions and pass criteria for each process",
      "Review screening outcomes and override AI assessments",
      "Run final rounds such as communication and process assessments",
      "Plan batches and joining dates with operations",
    ],
  },
  workflow: {
    title: "How Huntlo works for BPO recruitment",
    intro: "Each ramp moves through four steps that run in parallel across the applicant pool.",
    steps: [
      {
        icon: "assignment",
        title: "Configure the ramp",
        body: "Define the process, shift, location and screening questions.",
      },
      {
        icon: "forum",
        title: "Engage applicants",
        body: "Huntlo contacts applicants on WhatsApp and Email and follows up automatically.",
      },
      {
        icon: "record_voice_over",
        title: "Voice screen at volume",
        body: "Every applicant gets a voice screen, with a transcript and response scores for review.",
      },
      {
        icon: "event_available",
        title: "Schedule final rounds",
        body: "Qualified candidates self-book final interviews; recruiters make the selections.",
      },
    ],
  },
  useCases: {
    title: "Where BPO recruiters use Huntlo",
    items: [
      {
        icon: "groups",
        title: "Batch and ramp hiring",
        body: "Run outreach, screening and scheduling in parallel for large hiring batches.",
        capability: CAP.automation,
      },
      {
        icon: "record_voice_over",
        title: "Voice process screening",
        body: "Capture spoken responses with transcripts and scores for recruiter review.",
        capability: CAP.voice,
      },
      {
        icon: "forum",
        title: "Applicant re-engagement",
        body: "Automated follow-ups bring back applicants who stop responding.",
        capability: CAP.engagement,
      },
      {
        icon: "quiz",
        title: "Process assessments",
        body: "Add role-based assessments before final rounds.",
        capability: CAP.assessments,
      },
      {
        icon: "event_available",
        title: "Final-round scheduling",
        body: "Self-booking fills interview slots without manual coordination.",
        capability: CAP.scheduling,
      },
      {
        icon: "monitoring",
        title: "Ramp tracking",
        body: "Track outreach, replies and pipeline progression for each campaign.",
        capability: CAP.analytics,
      },
    ],
  },
  evidence: {
    points: [
      "Each voice screen produces a transcript, response scores and a structured qualification summary.",
      "Screening actions are logged with an audit trail, and recruiters can override AI assessments.",
      "Follow-ups are triggered by candidate engagement and response behavior.",
    ],
    qualification:
      "Voice screening covers preliminary qualification only and does not certify language proficiency. Scores reflect answers to the configured questions; final assessments and hiring decisions remain with your team.",
  },
  comparison: {
    title: "How Huntlo differs from manual BPO screening",
    rows: [
      {
        dimension: "First response",
        conventional: "Applicants wait for a recruiter call",
        huntlo: "Outreach starts as soon as candidates apply",
      },
      {
        dimension: "Screening capacity",
        conventional: "Limited by recruiter call hours",
        huntlo: "Voice screens run in parallel across the pool",
      },
      {
        dimension: "Screening record",
        conventional: "Notes in spreadsheets",
        huntlo: "A transcript, scores and summary for each candidate",
      },
      {
        dimension: "Decision",
        conventional: "Recruiter",
        huntlo: "Recruiter — with an audit trail and override",
      },
    ],
  },
  faqs: [
    {
      question: "Can Huntlo screen hundreds of applicants for one ramp?",
      answer:
        "Yes. Outreach, voice screens and scheduling run in parallel across the applicant pool. Recruiters review transcripts, scores and summaries instead of making every first call.",
    },
    {
      question: "Does Huntlo assess English or communication skills?",
      answer:
        "Voice screens capture spoken responses with transcripts and response scores against the questions you configure. They support recruiter review but do not certify language proficiency; final communication assessments stay with your team.",
    },
    {
      question: "Can recruiters override AI screening results?",
      answer:
        "Yes. Screening actions are logged with an audit trail, and recruiters can override AI assessments at any point.",
    },
    {
      question: "Does Huntlo reduce candidate drop-off?",
      answer:
        "Huntlo sends follow-ups automatically based on candidate response, which helps keep applicants moving. Drop-off also depends on pay, location and timing, so results vary by process.",
    },
  ],
  related: [
    {
      href: "/solutions/campus-recruitment",
      title: "AI Campus Recruitment",
      description: "Graduate drives with assessments and scheduling.",
    },
    {
      href: "/solutions/manufacturing-recruitment",
      title: "AI Manufacturing Recruitment",
      description: "Shift-based hiring across plants and sites.",
    },
    {
      href: "/capabilities/ai-candidate-screening",
      title: "AI Candidate Screening",
      description: "Rubric-based evaluation against role criteria.",
    },
    {
      href: "/autonomous-recruiting",
      title: "Autonomous Recruiting",
      description: "Repetitive recruiting steps that run inside guardrails.",
    },
  ],
  cta: {
    title: "Hit your ramp dates with less manual screening",
    body: "See how Huntlo runs high-volume outreach, voice screening and scheduling for BPO hiring.",
  },
};

const GCC: SolutionPage = {
  slug: "global-capability-centers",
  name: "AI Hiring for GCCs",
  breadcrumb: "GCCs",
  icon: "public",
  cardDescription:
    "Build specialist teams for global capability centers with governed, connected hiring.",
  fit: {
    motion: "Team build-outs for specialist functions",
    startWith: "Skill matching and governed automation",
  },
  seo: {
    title: "AI Hiring for Global Capability Centers (GCCs) | Huntlo",
    description:
      "Build engineering, data and operations teams for your global capability center. Huntlo connects sourcing, screening and scheduling with the governance a parent organization expects.",
  },
  hero: {
    accent: "Build global capability centers on connected hiring.",
    summary:
      "Huntlo helps Global Capability Centers (GCCs) hire engineering, data, finance and operations talent at scale, with skill-aware sourcing, governed automation and one view of hiring activity across teams.",
    chips: [
      "Technology and specialist roles",
      "Governed automation",
      "Role-based permissions",
      "Works with your ATS",
    ],
  },
  answer: {
    question: "What is AI hiring for GCCs?",
    text: "AI hiring for GCCs means using AI agents to run sourcing, outreach, screening and scheduling for the teams a Global Capability Center builds — engineering, data, finance, operations and shared services — while keeping hiring governed and visible to leaders at the parent organization. Huntlo provides that connected execution layer, with recruiters and hiring managers making the decisions.",
  },
  visual: {
    input: { label: "Team build plan", text: "Data engineering pod · Bengaluru center" },
    middle: {
      label: "Huntlo GCC workflow",
      items: [
        { icon: "code", label: "Skill matching" },
        { icon: "forum", label: "Outreach" },
        { icon: "fact_check", label: "Screening" },
        { icon: "admin_panel_settings", label: "Governance" },
      ],
    },
    output: {
      label: "Hiring view",
      liveLabel: "Leadership visibility",
      pills: ["Pipeline by team", "Interviews booked"],
      note: "Hiring managers approve every selection.",
    },
    flow: ["Plan", "Source", "Screen", "Interview", "Hire"],
  },
  problem: {
    title: "Why GCC hiring is hard to scale",
    intro:
      "GCCs grow in waves, often adding whole teams at once. Markets for engineering and specialist roles are competitive, and parent organizations expect consistent, governed hiring.",
    items: [
      {
        icon: "trending_up",
        title: "Hiring in waves",
        body: "New capabilities and transitions need many specialist roles filled in parallel, often across several functions.",
      },
      {
        icon: "code",
        title: "Competitive specialist markets",
        body: "Engineering, data and cloud talent is in demand from many employers, so slow processes lose candidates.",
      },
      {
        icon: "admin_panel_settings",
        title: "Governance across geographies",
        body: "Leaders at headquarters need visibility into hiring activity and confidence that processes are consistent.",
      },
    ],
  },
  approach: {
    title: "How Huntlo helps GCC talent teams",
    intro:
      "Huntlo gives GCC talent teams one execution layer for sourcing, engagement, screening and scheduling, governed by templates and permissions.",
    ai: [
      "Source specialist talent by skill depth and seniority",
      "Run Email and WhatsApp outreach with automated follow-ups",
      "Screen candidates against role criteria with context-aware rubrics",
      "Coordinate interviews across hiring managers and time zones",
    ],
    recruiters: [
      "Plan team build-outs with business leaders",
      "Define role criteria and hiring standards",
      "Assess technical and cultural fit with hiring managers",
      "Approve offers and report to stakeholders",
    ],
  },
  workflow: {
    title: "How Huntlo works for GCC hiring",
    intro: "Each team build-out moves through four connected stages.",
    steps: [
      {
        icon: "assignment",
        title: "Plan the team build",
        body: "Define roles, skills and seniority for each team or pod.",
      },
      {
        icon: "travel_explore",
        title: "Source and engage",
        body: "Huntlo surfaces specialist talent and starts personalized outreach.",
      },
      {
        icon: "fact_check",
        title: "Screen and assess",
        body: "Rubric-based screening, voice screens and role-based assessments qualify candidates.",
      },
      {
        icon: "event_available",
        title: "Interview and decide",
        body: "Candidates self-book with hiring managers across time zones; managers make the selections.",
      },
    ],
  },
  useCases: {
    title: "Where GCC talent teams use Huntlo",
    items: [
      {
        icon: "code",
        title: "Engineering and data teams",
        body: "Match candidates on skill depth, seniority and domain relevance.",
        capability: CAP.matching,
      },
      {
        icon: "travel_explore",
        title: "Specialist sourcing",
        body: "Discover active and passive talent from plain-language briefs.",
        capability: CAP.sourcing,
      },
      {
        icon: "fact_check",
        title: "Consistent screening",
        body: "Apply the same role rubrics across every team and location.",
        capability: CAP.screening,
      },
      {
        icon: "schedule",
        title: "Cross-time-zone scheduling",
        body: "Self-booking with calendar sync handles time zones automatically.",
        capability: CAP.scheduling,
      },
      {
        icon: "admin_panel_settings",
        title: "Governed automation",
        body: "Approved templates and role-based permissions keep execution controlled.",
        capability: CAP.automation,
      },
      {
        icon: "monitoring",
        title: "Leadership visibility",
        body: "Managers see outreach activity, reply rates and pipeline health on supported plans.",
        capability: CAP.analytics,
      },
    ],
  },
  evidence: {
    points: [
      "Approved templates and role-based permissions keep automated execution governed.",
      "Candidates self-book through panel calendar sync, with time zones handled.",
      "Huntlo complements existing ATS and CRM systems rather than replacing them.",
    ],
    qualification:
      "Hiring speed depends on role complexity, market conditions and interview panel availability. Available reporting varies by plan and workspace; confirm governance and reporting requirements with the Huntlo team.",
  },
  comparison: {
    title: "How Huntlo differs from a fragmented GCC hiring stack",
    rows: [
      {
        dimension: "Sourcing",
        conventional: "Agencies and job boards for each function",
        huntlo: "Intent-based discovery across functions",
      },
      {
        dimension: "Screening",
        conventional: "Varies by recruiter and team",
        huntlo: "Shared role rubrics with recruiter review",
      },
      {
        dimension: "Scheduling",
        conventional: "Email coordination across time zones",
        huntlo: "Self-booking with calendar sync and time-zone handling",
      },
      {
        dimension: "Governance",
        conventional: "Activity scattered across tools",
        huntlo: "Templates, permissions and campaign-level tracking",
      },
    ],
  },
  faqs: [
    {
      question: "Which roles can GCCs hire with Huntlo?",
      answer:
        "GCC teams use Huntlo for engineering, data, cloud, finance, operations and shared-services roles. Sourcing works from plain-language briefs, so the same workflow supports technical and non-technical teams.",
    },
    {
      question: "Can Huntlo work with our parent company's ATS?",
      answer:
        "Yes. Huntlo complements existing ATS and CRM systems rather than replacing them, so GCCs can keep the system of record their parent organization uses.",
    },
    {
      question: "How does Huntlo keep automated hiring governed?",
      answer:
        "Automations run only the steps your team configures, using approved templates and role-based permissions. Screening actions are logged, and recruiters can override AI assessments.",
    },
    {
      question: "Does Huntlo help GCCs hire across time zones?",
      answer:
        "Yes. Candidates self-book interviews through panel calendar sync, with time zones handled, and automated reminders keep candidates and panels aligned.",
    },
  ],
  related: [
    {
      href: "/gcc-hiring-platform",
      title: "GCC Hiring Platform",
      description: "Huntlo's platform view for global capability centers.",
    },
    {
      href: "/ai-recruiting-for-gccs",
      title: "AI Recruiting for GCCs",
      description: "How AI recruiting agents support GCC talent teams.",
    },
    {
      href: "/solutions/it-staffing",
      title: "AI Platform for IT Staffing",
      description: "Technical sourcing and screening for staffing desks.",
    },
    {
      href: "/ai-hiring-infrastructure",
      title: "AI Hiring Intelligence Infrastructure",
      description: "The category foundation behind Huntlo.",
    },
  ],
  cta: {
    title: "Build your GCC teams on connected hiring",
    body: "See how Huntlo supports sourcing, screening and scheduling for global capability centers.",
  },
};

const CAMPUS: SolutionPage = {
  slug: "campus-recruitment",
  name: "AI Campus Recruitment",
  breadcrumb: "Campus Recruitment",
  icon: "school",
  cardDescription:
    "Run multi-campus drives with student outreach, assessments and round scheduling.",
  fit: {
    motion: "Seasonal graduate and intern drives",
    startWith: "Assessments and interview-round scheduling",
  },
  seo: {
    title: "AI Campus Recruitment Software | Huntlo",
    description:
      "Manage campus drives and graduate hiring at scale. Huntlo runs student outreach, assessments, voice screens and interview scheduling so campus teams can focus on employer brand and selection.",
  },
  hero: {
    accent: "Run campus drives at scale, without the spreadsheets.",
    summary:
      "Huntlo helps campus recruiting teams engage students across institutions, run role-based assessments and preliminary voice screens, and schedule interview rounds, while recruiters and hiring managers select every hire.",
    chips: [
      "Multi-campus drives",
      "Role-based assessments",
      "Student outreach",
      "Interview-round scheduling",
    ],
  },
  answer: {
    question: "What is AI campus recruitment?",
    text: "AI campus recruitment uses AI to manage the volume and coordination of graduate and intern hiring — student outreach, assessments, preliminary screening and interview scheduling across campuses. Huntlo automates those steps so campus teams can focus on employer brand, institution relationships and final selection.",
  },
  visual: {
    input: { label: "Campus drive", text: "Graduate engineer trainees · six campuses" },
    middle: {
      label: "Huntlo campus workflow",
      items: [
        { icon: "school", label: "Student outreach" },
        { icon: "quiz", label: "Assessments" },
        { icon: "record_voice_over", label: "Voice screen" },
        { icon: "event_available", label: "Interview rounds" },
      ],
    },
    output: {
      label: "Selection-ready",
      liveLabel: "Panel review",
      pills: ["Assessed", "Round booked"],
      note: "Hiring managers make every final selection.",
    },
    flow: ["Drive", "Engage", "Assess", "Interview", "Offer"],
  },
  problem: {
    title: "Why campus hiring is hard to coordinate",
    intro:
      "Campus hiring compresses large volumes into short seasons. Teams juggle multiple institutions, assessment rounds and interview panels, often from spreadsheets.",
    items: [
      {
        icon: "school",
        title: "Many campuses, short windows",
        body: "Each institution has its own calendar and process, and drives often overlap within the same few weeks.",
      },
      {
        icon: "quiz",
        title: "Assessment rounds create bottlenecks",
        body: "Shortlisting hundreds of students across tests and interviews takes significant recruiter and panel time.",
      },
      {
        icon: "mark_email_unread",
        title: "Students go quiet between rounds",
        body: "Without timely updates, students lose track of next steps or accept other offers.",
      },
    ],
  },
  approach: {
    title: "How Huntlo helps campus recruiting teams",
    intro:
      "Huntlo runs outreach, assessments, screening and scheduling across drives, so campus teams can focus on institutions, employer brand and selection.",
    ai: [
      "Send drive invitations and reminders by Email and WhatsApp",
      "Deliver role-based assessments with automated scoring",
      "Run preliminary voice screens on interest, location and availability",
      "Schedule interview rounds and send status updates",
    ],
    recruiters: [
      "Manage relationships with placement offices",
      "Set assessment criteria and cut-offs",
      "Run final interviews with hiring managers",
      "Make offers and plan onboarding cohorts",
    ],
  },
  workflow: {
    title: "How Huntlo works for campus recruitment",
    intro: "Each campus drive moves through four steps, run in parallel across institutions.",
    steps: [
      {
        icon: "assignment",
        title: "Set up the drive",
        body: "Define roles, eligibility and assessment criteria for each campus.",
      },
      {
        icon: "forum",
        title: "Engage students",
        body: "Huntlo sends invitations, reminders and follow-ups across Email and WhatsApp.",
      },
      {
        icon: "quiz",
        title: "Assess and screen",
        body: "Role-based assessments and voice screens produce scores and summaries for review.",
      },
      {
        icon: "event_available",
        title: "Schedule interview rounds",
        body: "Shortlisted students self-book interviews; hiring managers make the final selections.",
      },
    ],
  },
  useCases: {
    title: "Where campus recruiting teams use Huntlo",
    items: [
      {
        icon: "school",
        title: "Multi-campus drives",
        body: "Run a campaign workspace for each campus or role.",
        capability: CAP.crm,
      },
      {
        icon: "quiz",
        title: "Online assessments",
        body: "Score role-based assessments with skill breakdowns.",
        capability: CAP.assessments,
      },
      {
        icon: "forum",
        title: "Student engagement",
        body: "Keep students informed between rounds with automated follow-ups.",
        capability: CAP.engagement,
      },
      {
        icon: "record_voice_over",
        title: "Preliminary screening",
        body: "Confirm interest, location preferences and availability by voice.",
        capability: CAP.voice,
      },
      {
        icon: "event_available",
        title: "Interview-round scheduling",
        body: "Fill panel slots through self-booking with reminders.",
        capability: CAP.scheduling,
      },
      {
        icon: "folder_shared",
        title: "Graduate talent pools",
        body: "Keep strong students organized for future cohorts and internships.",
        capability: CAP.pools,
      },
    ],
  },
  evidence: {
    points: [
      "Assessments are role-based, with automated scoring, skill breakdowns and performance summaries.",
      "Candidates self-book through panel calendar sync, with automated confirmations and reminders.",
      "Pooled candidates can be added to outreach campaigns in one step.",
    ],
    qualification:
      "Assessment scores measure performance on the specific tasks assigned and should be one input among several. Confirm the assessment features available for your workspace with the Huntlo team, and follow institution guidelines for student communication.",
  },
  comparison: {
    title: "How Huntlo differs from spreadsheet-based campus hiring",
    rows: [
      {
        dimension: "Invitations",
        conventional: "Mass emails through placement offices",
        huntlo: "Email and WhatsApp invitations with automated reminders",
      },
      {
        dimension: "Shortlisting",
        conventional: "Manual review of test results",
        huntlo: "Automated assessment scoring with skill breakdowns",
      },
      {
        dimension: "Scheduling",
        conventional: "Panels coordinated by email",
        huntlo: "Self-booked interview rounds with reminders",
      },
      {
        dimension: "Selection",
        conventional: "Hiring managers decide",
        huntlo: "Hiring managers still decide — with assessed, scheduled students",
      },
    ],
  },
  faqs: [
    {
      question: "Can Huntlo manage drives across several campuses?",
      answer:
        "Yes. Each campus or role can run in its own campaign workspace, with invitations, assessments and scheduling tracked separately.",
    },
    {
      question: "Does Huntlo provide assessments for graduates?",
      answer:
        "Huntlo supports role-based assessments with automated scoring and skill breakdowns, placed between screening and interviews. Confirm the assessment features available for your workspace with the Huntlo team.",
    },
    {
      question: "Can students book their own interview slots?",
      answer:
        "Yes. Shortlisted students self-book through panel calendar sync, and automated confirmations and reminders keep students and panels aligned.",
    },
    {
      question: "Does Huntlo select candidates automatically?",
      answer:
        "No. Assessment scores and screening summaries support decisions; recruiters and hiring managers make every final selection.",
    },
  ],
  related: [
    {
      href: "/solutions/bpo-recruitment",
      title: "AI BPO Recruitment",
      description: "High-volume screening and scheduling.",
    },
    {
      href: "/capabilities/ai-recruitment-assessments",
      title: "AI Recruitment Assessments",
      description: "Role-based assessments with automated scoring.",
    },
    {
      href: "/solutions/global-capability-centers",
      title: "AI Hiring for GCCs",
      description: "Specialist team build-outs for capability centers.",
    },
    {
      href: "/human-ai-hiring",
      title: "Human + AI Hiring",
      description: "How work is divided between AI agents and recruiters.",
    },
  ],
  cta: {
    title: "Run your next campus season on connected hiring",
    body: "See how Huntlo manages outreach, assessments and scheduling for campus drives.",
  },
};

export const SOLUTION_PAGES: SolutionPage[] = [
  RPO,
  EXECUTIVE_SEARCH,
  IT_STAFFING,
  HEALTHCARE,
  MANUFACTURING,
  BPO,
  GCC,
  CAMPUS,
];

export function getSolutionPage(slug: string) {
  return SOLUTION_PAGES.find((page) => page.slug === slug);
}

export const SOLUTIONS_HUB = {
  name: "AI Hiring Solutions",
  seo: {
    title: "AI Hiring Solutions by Industry and Hiring Model | Huntlo",
    description:
      "Explore Huntlo AI hiring solutions for RPO, executive search, IT staffing, healthcare, manufacturing, BPO, GCCs and campus recruitment — one connected platform, configured for each hiring model.",
  },
  hero: {
    accent: "One hiring platform, configured for how your team hires.",
    summary:
      "Huntlo is AI Hiring Intelligence Infrastructure. The same connected layer for sourcing, outreach, screening and scheduling adapts to the volumes, channels and decision points of each industry and hiring model.",
    chips: ["8 hiring models", "Supported capabilities only", "Recruiters in control"],
  },
  answer: {
    question: "What are Huntlo AI hiring solutions?",
    text: "Huntlo AI hiring solutions apply one platform — AI agents for sourcing, outreach, screening and scheduling, with recruiters in control — to the specific needs of different hiring models. An RPO provider, an executive search firm and a BPO ramp use the same capabilities, configured for different volumes, channels and decision points.",
  },
  foundation: {
    title: "One platform behind every solution",
    intro:
      "Every solution is built from the same live Huntlo capabilities. Each solution page lists only what is supported today.",
    items: [
      {
        icon: "travel_explore",
        title: "Sourcing and matching",
        body: "Intent-based discovery from plain-language briefs, prioritized by skill depth and seniority.",
        capability: CAP.sourcing,
      },
      {
        icon: "forum",
        title: "Outreach and engagement",
        body: "Email and WhatsApp outreach with follow-ups triggered by candidate response.",
        capability: CAP.outreach,
      },
      {
        icon: "record_voice_over",
        title: "Voice screening",
        body: "Preliminary voice screens with transcripts, scores and recruiter override.",
        capability: CAP.voice,
      },
      {
        icon: "quiz",
        title: "Assessments",
        body: "Role-based assessments with automated scoring and skill breakdowns.",
        capability: CAP.assessments,
      },
      {
        icon: "event_available",
        title: "Interview scheduling",
        body: "Self-booking through calendar sync, with confirmations and reminders.",
        capability: CAP.scheduling,
      },
      {
        icon: "autorenew",
        title: "Workflow automation",
        body: "Governed automation with approved templates and role-based permissions.",
        capability: CAP.automation,
      },
    ] satisfies SolutionUseCase[],
  },
  related: [
    {
      href: "/platform",
      title: "Huntlo Platform",
      description: "Platform overview of connected hiring execution.",
    },
    {
      href: "/capabilities",
      title: "AI Hiring Capabilities",
      description: "Every live capability behind Huntlo solutions.",
    },
    {
      href: "/human-ai-hiring",
      title: "Human + AI Hiring",
      description: "How work is divided between AI agents and recruiters.",
    },
    {
      href: "/compare",
      title: "Compare Huntlo",
      description: "How Huntlo compares with other recruiting tools.",
    },
  ] satisfies SolutionLink[],
  faqs: [
    {
      question: "Is Huntlo a different product for each industry?",
      answer:
        "No. Every solution uses the same Huntlo platform and capabilities. Solutions differ in how sourcing, outreach, screening and scheduling are configured for each hiring model.",
    },
    {
      question: "Which solution should we start with?",
      answer:
        "Start with the hiring model closest to how your team works today. RPO and staffing teams usually begin with sourcing and outreach, while volume hiring teams such as BPO and campus start with voice screening and scheduling.",
    },
    {
      question: "Does Huntlo replace our ATS?",
      answer:
        "No. Huntlo complements existing ATS and CRM systems, adding AI-driven sourcing, engagement, screening and scheduling around the system of record you already use.",
    },
    {
      question: "Do AI agents make hiring decisions?",
      answer:
        "No. AI agents run repeatable execution steps. Recruiters and hiring managers set criteria, review outcomes, can override AI assessments and make every hiring decision.",
    },
  ] satisfies SolutionFaq[],
  cta: {
    title: "Find the right setup for your hiring model",
    body: "Talk to the Huntlo team about how sourcing, outreach, screening and scheduling fit the way you hire.",
  },
};
