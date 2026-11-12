import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const CAPABILITIES_PATH = "/capabilities";

export const CAPABILITIES_SEO = {
  title: "AI Hiring Capabilities | Huntlo",
  description:
    "Explore Huntlo's AI hiring capabilities for candidate sourcing, screening, matching, outreach, interviews, assessments, scheduling and connected recruitment workflows.",
  ogTitle: "AI Hiring Capabilities Built for Connected Hiring Execution",
  ogDescription:
    "Explore how Huntlo connects AI-powered sourcing, candidate intelligence, screening, outreach, interviews, assessments, scheduling, and recruitment workflows through one connected hiring platform.",
} as const;

export function capabilitiesMetadata() {
  return buildPageMetadata({
    title: CAPABILITIES_SEO.title,
    description: CAPABILITIES_SEO.description,
    ogTitle: CAPABILITIES_SEO.ogTitle,
    ogDescription: CAPABILITIES_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: CAPABILITIES_PATH,
  });
}

export const CAPABILITIES_GEO = {
  askTopic: "Huntlo AI Hiring Capabilities",
  askPrompt:
    "What are Huntlo's AI hiring capabilities on /capabilities (https://www.huntlo.ai/capabilities)? How does Huntlo connect sourcing, screening, outreach, voice interviews, scheduling, and recruitment workflows into a unified AI hiring intelligence infrastructure for human recruiters?",
} as const;

export type CapabilityCategory =
  | "All"
  | "Sourcing & Discovery"
  | "Screening & Evaluation"
  | "Outreach & Engagement"
  | "Operations & CRM";

export type CapabilityItem = {
  id: string;
  name: string;
  proposedUrl: string;
  category: "Sourcing & Discovery" | "Screening & Evaluation" | "Outreach & Engagement" | "Operations & CRM";
  icon: string;
  badge: string;
  summary: string;
  roleInWorkflow: string;
  /** Live overview or equivalent route if available on current site */
  liveOverviewUrl?: string;
  liveOverviewLabel?: string;
};

export const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  "All",
  "Sourcing & Discovery",
  "Screening & Evaluation",
  "Outreach & Engagement",
  "Operations & CRM",
];

export const CORE_CAPABILITIES: CapabilityItem[] = [
  {
    id: "ai-candidate-sourcing",
    name: "AI Candidate Sourcing",
    proposedUrl: "/capabilities/ai-candidate-sourcing",
    category: "Sourcing & Discovery",
    icon: "person_search",
    badge: "Discovery",
    summary:
      "Synthesizes natural-language role criteria into multi-dimensional talent signals, surfacing verified passive and active candidates across professional networks and technical communities.",
    roleInWorkflow:
      "Forms the initial intake engine of the recruitment funnel, transforming slow manual Boolean searches into real-time, high-precision candidate discovery.",
    liveOverviewUrl: "/candidate-sourcing",
    liveOverviewLabel: "View Sourcing Overview",
  },
  {
    id: "vibe-sourcing",
    name: "Vibe Sourcing",
    proposedUrl: "/capabilities/vibe-sourcing",
    category: "Sourcing & Discovery",
    icon: "psychology",
    badge: "Culture & Fit",
    summary:
      "Discovers exceptional talent based on engineering philosophy, company cultural velocity, and trajectory alignment rather than rigid keyword matching.",
    roleInWorkflow:
      "Prevents false negatives by identifying high-potential candidates whose mindset, problem-solving craft, and communication style mirror your team's ethos.",
    liveOverviewUrl: "/vibe-sourcing",
    liveOverviewLabel: "Explore Vibe Sourcing",
  },
  {
    id: "ai-candidate-screening",
    name: "AI Candidate Screening",
    proposedUrl: "/capabilities/ai-candidate-screening",
    category: "Screening & Evaluation",
    icon: "fact_check",
    badge: "Qualification",
    summary:
      "Evaluates inbound applicants and sourced profiles against objective job requirements, core competencies, and career milestones using context-aware rubric analysis.",
    roleInWorkflow:
      "Filters and calibrates applicant pools within minutes, eliminating resume bias and ensuring every profile receives thorough, consistent baseline evaluation.",
    liveOverviewUrl: "/screening",
    liveOverviewLabel: "View Screening Overview",
  },
  {
    id: "ai-candidate-matching",
    name: "AI Candidate Matching",
    proposedUrl: "/capabilities/ai-candidate-matching",
    category: "Sourcing & Discovery",
    icon: "hub",
    badge: "Compatibility",
    summary:
      "Computes bi-directional match compatibility between candidate career trajectories and requisition requirements, balancing skill depth, seniority, and domain relevance.",
    roleInWorkflow:
      "Prioritizes candidates with the highest statistical likelihood of mutual alignment, optimizing recruiter attention on the most qualified prospects.",
    liveOverviewUrl: "/candidate-orchestration",
    liveOverviewLabel: "View Matching Architecture",
  },
  {
    id: "ai-candidate-outreach",
    name: "AI Candidate Outreach",
    proposedUrl: "/capabilities/ai-candidate-outreach",
    category: "Outreach & Engagement",
    icon: "send",
    badge: "Multi-Channel",
    summary:
      "Automates personalized, multi-touch engagement campaigns across Email and WhatsApp with tailored messaging rooted in candidate accomplishments.",
    roleInWorkflow:
      "Drives initial response velocity and interest by delivering individualized, respectful communications rather than generic blast templates.",
    liveOverviewUrl: "/email-outreach",
    liveOverviewLabel: "View Outreach Engine",
  },
  {
    id: "ai-candidate-engagement",
    name: "AI Candidate Engagement",
    proposedUrl: "/capabilities/ai-candidate-engagement",
    category: "Outreach & Engagement",
    icon: "forum",
    badge: "Nurturing",
    summary:
      "Maintains persistent candidate relationships through smart follow-ups, automated role inquiries resolution, and continuous interaction touchpoints.",
    roleInWorkflow:
      "Prevents candidate ghosting between initial interest and formal interview stages, reinforcing a responsive, premium candidate experience.",
    liveOverviewUrl: "/candidate-engagement",
    liveOverviewLabel: "Explore Engagement",
  },
  {
    id: "ai-interview-scheduling",
    name: "AI Interview Scheduling",
    proposedUrl: "/capabilities/ai-interview-scheduling",
    category: "Operations & CRM",
    icon: "event_available",
    badge: "Coordination",
    summary:
      "Harmonizes panel availability, candidate timezones, interviewer buffers, and calendar holds into automated self-scheduling workflows.",
    roleInWorkflow:
      "Eliminates 3 to 5 days of calendar ping-pong, locking in interview slots quickly before competitive offers or candidate drop-offs occur.",
    liveOverviewUrl: "/interview-scheduling",
    liveOverviewLabel: "View Scheduling Engine",
  },
  {
    id: "ai-voice-interviews",
    name: "AI Voice Interviews",
    proposedUrl: "/capabilities/ai-voice-interviews",
    category: "Screening & Evaluation",
    icon: "record_voice_over",
    badge: "Conversational",
    summary:
      "Conducts structured, conversational preliminary phone interviews to verify salary expectations, notice periods, role interest, and spoken communication skills.",
    roleInWorkflow:
      "Replaces repetitive preliminary phone screens, generating automated transcripts, confidence scores, and structured insights for hiring managers.",
    liveOverviewUrl: "/interview",
    liveOverviewLabel: "Explore Voice Interviews",
  },
  {
    id: "ai-recruitment-assessments",
    name: "AI Recruitment Assessments",
    proposedUrl: "/capabilities/ai-recruitment-assessments",
    category: "Screening & Evaluation",
    icon: "quiz",
    badge: "Benchmarking",
    summary:
      "Delivers scenario-based technical and situational skill evaluations calibrated specifically to day-to-day job expectations and problem-solving standards.",
    roleInWorkflow:
      "Provides verified, objective competency data before committing engineering and leadership hours to in-depth panel interviews.",
    liveOverviewUrl: "/assessments",
    liveOverviewLabel: "View Assessments",
  },
  {
    id: "ai-recruitment-crm",
    name: "AI Recruitment CRM",
    proposedUrl: "/capabilities/ai-recruitment-crm",
    category: "Operations & CRM",
    icon: "contacts",
    badge: "System of Record",
    summary:
      "Centralizes candidate interaction records, conversation transcripts, outreach histories, and relationship timelines into a searchable recruitment memory bank.",
    roleInWorkflow:
      "Unifies dispersed talent interactions across requisitions, creating lasting institutional memory and eliminating redundant candidate touchpoints.",
    liveOverviewUrl: "/people-scout",
    liveOverviewLabel: "View Recruitment CRM",
  },
  {
    id: "ai-talent-pool-management",
    name: "AI Talent Pool Management",
    proposedUrl: "/capabilities/ai-talent-pool-management",
    category: "Operations & CRM",
    icon: "groups",
    badge: "Pipelines",
    summary:
      "Organizes candidate databases into dynamic, self-refreshing talent pools, tracking career movements and flagging past candidates when relevant roles open.",
    roleInWorkflow:
      "Monetizes past silver medalists and historic applicants, letting talent teams start every search with a warm, pre-vetted talent community.",
    liveOverviewUrl: "/candidate-pool",
    liveOverviewLabel: "Explore Talent Pools",
  },
  {
    id: "ai-recruitment-analytics",
    name: "AI Recruitment Analytics",
    proposedUrl: "/capabilities/ai-recruitment-analytics",
    category: "Operations & CRM",
    icon: "query_stats",
    badge: "Intelligence",
    summary:
      "Delivers real-time funnel intelligence, tracking sourcing channel yields, outreach conversion rates, stage velocity, and interviewer conversion.",
    roleInWorkflow:
      "Transitions recruitment leadership from backward-looking retrospective reports to proactive, data-informed pipeline governance.",
  },
  {
    id: "recruitment-workflow-automation",
    name: "Recruitment Workflow Automation",
    proposedUrl: "/capabilities/recruitment-workflow-automation",
    category: "Operations & CRM",
    icon: "schema",
    badge: "Orchestration",
    summary:
      "Executes cross-stage conditional triggers, automated status progressions, webhook syncs, and team alerts without manual recruiter data entry.",
    roleInWorkflow:
      "Connects the entire recruitment pipeline into an autonomous execution loop, freeing human recruiters to focus on candidate relationships and closing.",
    liveOverviewUrl: "/workflow-orchestration",
    liveOverviewLabel: "View Workflow Orchestration",
  },
];

export type WorkflowStage = {
  step: number;
  title: string;
  category: string;
  icon: string;
  description: string;
  aiContribution: string;
  humanContribution: string;
};

export const CONNECTED_WORKFLOW_STAGES: WorkflowStage[] = [
  {
    step: 1,
    title: "Candidate Discovery",
    category: "Inception",
    icon: "travel_explore",
    description: "Translate requisitions into multi-dimensional talent queries and market capability maps.",
    aiContribution: "Scans public signals, talent networks, and community contributions to build targeted talent maps.",
    humanContribution: "Calibrates role requirements, sets non-negotiable cultural standards, and refines senior-level hiring expectations.",
  },
  {
    step: 2,
    title: "Candidate Sourcing",
    category: "Acquisition",
    icon: "person_search",
    description: "Surface and enrich high-fit active and passive profiles matching technical and cultural requirements.",
    aiContribution: "Applies Vibe Sourcing and multi-attribute filters to identify verified, responsive talent.",
    humanContribution: "Reviews prioritized shortlists and adjusts signal weights for competitive market dynamics.",
  },
  {
    step: 3,
    title: "Screening & Matching",
    category: "Evaluation",
    icon: "fact_check",
    description: "Contextual evaluation of candidate qualifications, experience depth, and career velocity.",
    aiContribution: "Scores profile alignment against verified role rubrics and identifies potential skill overlaps.",
    humanContribution: "Applies subjective judgment, contextual nuance, and organizational appetite for growth trajectories.",
  },
  {
    step: 4,
    title: "Outreach & Engagement",
    category: "Communication",
    icon: "campaign",
    description: "Personalized multi-channel sequence delivery across Email and WhatsApp with continuous follow-up.",
    aiContribution: "Drafts tailored outreach referencing specific candidate work and automates follow-up timing.",
    humanContribution: "Steps into high-priority executive conversations and conducts relationship-building introductions.",
  },
  {
    step: 5,
    title: "Interviews & Assessments",
    category: "Verification",
    icon: "record_voice_over",
    description: "Structured preliminary voice phone screens and contextual skills benchmarking.",
    aiContribution: "Executes preliminary conversational screening calls, verifies logistics, and scores objective competencies.",
    humanContribution: "Conducts deep behavioral interviews, team culture assessments, and collaborative problem solving.",
  },
  {
    step: 6,
    title: "Interview Scheduling",
    category: "Logistics",
    icon: "event_available",
    description: "Frictionless calendar reconciliation, panel holds, and candidate self-booking coordination.",
    aiContribution: "Monitors panel calendars in real time, manages timezone conversions, and sends automated preparation reminders.",
    humanContribution: "Prepares interviewers with calibrated evaluation guides and briefs candidates on panel expectations.",
  },
  {
    step: 7,
    title: "Talent Pool & CRM",
    category: "Retention",
    icon: "contacts",
    description: "Centralized institutional recruitment memory, continuous profile enrichment, and warm re-engagement.",
    aiContribution: "Logs communication histories, tracks candidate milestone updates, and surfaces relevant silver medalists.",
    humanContribution: "Nurtures long-term executive relationships and maintains genuine community ties.",
  },
  {
    step: 8,
    title: "Analytics & Automation",
    category: "Governance",
    icon: "insights",
    description: "Continuous pipeline velocity tracking, funnel drop-off analytics, and cross-stage trigger execution.",
    aiContribution: "Measures end-to-end recruitment velocity, predicts pipeline bottlenecks, and triggers downstream handoffs.",
    humanContribution: "Translates talent acquisition metrics into executive headcount planning and strategic resource allocation.",
  },
];

export type ChallengeSolution = {
  challenge: string;
  problem: string;
  solution: string;
  capabilitiesUsed: string[];
  icon: string;
};

export const HIRING_CHALLENGES: ChallengeSolution[] = [
  {
    challenge: "Fragmented Hiring Workflows",
    problem:
      "Recruiters juggle 10+ disjointed tools (sourcing extensions, email blasters, scheduling links, spreadsheets), resulting in lost candidate momentum and duplicate manual data entry.",
    solution:
      "Huntlo provides an unified AI Hiring Intelligence Infrastructure where discovery, communication, screening, and scheduling share a single operational state.",
    capabilitiesUsed: ["Recruitment Workflow Automation", "AI Recruitment CRM"],
    icon: "alt_route",
  },
  {
    challenge: "Disconnected Candidate Information",
    problem:
      "Valuable conversation context, screening notes, and interview feedback remain trapped in personal inboxes or disparate point solutions.",
    solution:
      "A centralized candidate intelligence backbone records all touchpoints, transcripts, and evaluation scores into a living, searchable record.",
    capabilitiesUsed: ["AI Recruitment CRM", "AI Talent Pool Management"],
    icon: "folder_shared",
  },
  {
    challenge: "Manual Recruitment Coordination",
    problem:
      "Talent teams waste up to 40% of their working hours manually chasing calendar availabilities, sending status updates, and logging pipeline data.",
    solution:
      "Autonomous triggers and AI assistants handle meeting coordination, status progression, and candidate reminders without recruiter intervention.",
    capabilitiesUsed: ["AI Interview Scheduling", "Recruitment Workflow Automation"],
    icon: "schedule",
  },
  {
    challenge: "Candidate Discovery & Engagement Bottlenecks",
    problem:
      "Traditional job boards yield declining applicant quality, while generic outbound email blasts produce sub-5% response rates from passive talent.",
    solution:
      "AI Candidate Sourcing and Vibe Sourcing identify high-signal profiles, paired with individualized multi-channel outreach on Email and WhatsApp.",
    capabilitiesUsed: ["AI Candidate Sourcing", "Vibe Sourcing", "AI Candidate Outreach"],
    icon: "mark_email_unread",
  },
  {
    challenge: "Subjective & Inconsistent Screening",
    problem:
      "Keyword-based resume screening filters out high-caliber non-traditional talent, while manual phone screening consumes hundreds of recruiter hours each month.",
    solution:
      "Context-aware AI screening and conversational voice phone interviews objectively evaluate candidate qualifications and verify role requirements at scale.",
    capabilitiesUsed: ["AI Candidate Screening", "AI Voice Interviews", "AI Recruitment Assessments"],
    icon: "rule",
  },
  {
    challenge: "Interview Coordination Drop-offs",
    problem:
      "Multi-day scheduling delays frustrate high-demand candidates, leading to drop-offs before the first conversation takes place.",
    solution:
      "Instant self-scheduling with real-time panel calendar reconciliation secures candidates immediately after qualification.",
    capabilitiesUsed: ["AI Interview Scheduling", "AI Candidate Engagement"],
    icon: "event_busy",
  },
  {
    challenge: "Decaying & Unmonetized Talent Databases",
    problem:
      "Past applicants and runner-up finalists sit idle in legacy ATS archives, forcing teams to pay for fresh sourcing on every new requisition.",
    solution:
      "Continuous talent pool management actively enriches past profiles and automatically alerts recruiters when historical candidates match new openings.",
    capabilitiesUsed: ["AI Talent Pool Management", "AI Candidate Matching"],
    icon: "database",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Define Requisition & Calibrate Multi-Dimensional Signals",
    description:
      "Input your hiring criteria, technical competencies, company vibe, and role milestones. Huntlo's intelligence engine translates the mandate into high-precision search signals and structured evaluation rubrics.",
    icon: "tune",
  },
  {
    number: "02",
    title: "Discover Candidates & Launch Multi-Channel Outreach",
    description:
      "Huntlo surfaces verified active and passive talent across communities and historical talent pools. AI agents launch personalized, context-aware email and WhatsApp sequences that maximize candidate response rates.",
    icon: "send_and_archive",
  },
  {
    number: "03",
    title: "Autonomous Voice Screening & Instant Panel Scheduling",
    description:
      "Qualified respondents undergo structured conversational voice screens verifying availability, salary expectations, and role alignment. Successful candidates immediately choose interview slots via automated panel calendar sync.",
    icon: "phone_in_talk",
  },
  {
    number: "04",
    title: "Unified Decision-Making & Living Talent Intelligence",
    description:
      "Recruiters and hiring managers review comprehensive evaluation summaries, voice transcripts, and assessment metrics. All candidate context flows permanently into your AI Recruitment CRM for continuous pipeline value.",
    icon: "workspace_premium",
  },
];

export const DIFFERENTIATION_ROWS = [
  {
    dimension: "Core Architecture",
    traditional: "Disjointed point solutions & legacy ATS databases",
    huntlo: "Unified AI Hiring Intelligence Infrastructure connecting every stage",
  },
  {
    dimension: "Candidate Sourcing",
    traditional: "Static Boolean keywords and passive job board postings",
    huntlo: "Multi-dimensional signal matching, Vibe Sourcing, and live talent mapping",
  },
  {
    dimension: "Outreach & Engagement",
    traditional: "Generic mass email blasts with low response rates",
    huntlo: "Individualized, multi-channel (Email + WhatsApp) continuous engagement",
  },
  {
    dimension: "Candidate Screening",
    traditional: "Keyword resume parsing and manual 30-min phone calls",
    huntlo: "Objective rubric qualification & autonomous conversational voice screens",
  },
  {
    dimension: "Interview Scheduling",
    traditional: "3–5 days of manual back-and-forth email coordination",
    huntlo: "Instant real-time multi-calendar panel sync & candidate self-booking",
  },
  {
    dimension: "Recruitment CRM & Pools",
    traditional: "Stale, decaying resume archives with zero re-engagement",
    huntlo: "Auto-enriching, living talent pools with proactive rediscovery",
  },
  {
    dimension: "Human Recruiter Role",
    traditional: "Buried in repetitive scheduling, data entry, and manual screening",
    huntlo: "Focused entirely on stakeholder strategy, candidate closing, and human connection",
  },
];

export const CAPABILITIES_FAQS = [
  {
    question: "What are AI hiring capabilities?",
    answer:
      "AI hiring capabilities refer to specialized intelligent technologies and autonomous workflows that execute critical recruitment tasks across the hiring lifecycle. Unlike isolated software features or simple task automation, AI hiring capabilities operate within a connected hiring intelligence infrastructure. They handle multi-dimensional talent sourcing, context-aware screening, personalized multi-channel outreach, conversational voice phone screens, automated interview scheduling, and living talent pool management, allowing recruitment teams to operate with greater speed, consistency, and candidate empathy.",
  },
  {
    question: "What capabilities does Huntlo offer?",
    answer:
      "Huntlo offers 13 connected AI hiring capabilities: AI Candidate Sourcing, Vibe Sourcing, AI Candidate Screening, AI Candidate Matching, AI Candidate Outreach, AI Candidate Engagement, AI Interview Scheduling, AI Voice Interviews, AI Recruitment Assessments, AI Recruitment CRM, AI Talent Pool Management, AI Recruitment Analytics, and Recruitment Workflow Automation. Together, these capabilities form an integrated hiring intelligence infrastructure that supports recruitment teams from initial talent discovery to final hiring decisions.",
  },
  {
    question: "How does AI candidate sourcing work?",
    answer:
      "AI candidate sourcing transforms traditional keyword-based Boolean search into intent-driven talent discovery. Instead of matching simple text strings on resumes, Huntlo analyzes multi-dimensional signals including career trajectories, technical contributions, company velocity, and domain expertise across verified talent networks. This enables hiring teams to surface high-signal passive candidates who match the exact technical competencies and cultural requirements of the open requisition.",
  },
  {
    question: "How does AI candidate screening support recruiters?",
    answer:
      "AI candidate screening supports recruiters by performing objective, rubric-based evaluations of applicant profiles against verified job criteria and performance milestones. Rather than arbitrarily rejecting candidates based on keyword counts, Huntlo evaluates contextual experience, skill depth, and problem-solving background. This eliminates screening bottlenecks, mitigates unconscious bias, and ensures that high-potential candidates from non-traditional paths receive fair and consistent review.",
  },
  {
    question: "What is Vibe Sourcing?",
    answer:
      "Vibe Sourcing is Huntlo's proprietary approach to discovering talent based on nuanced cultural alignment, engineering philosophy, and workplace dynamics. While traditional sourcing focuses strictly on rigid titles and keyword checklists, Vibe Sourcing analyzes working style, team autonomy preferences, and problem-solving ethos to match candidates who will genuinely flourish within an organization's specific operational environment.",
  },
  {
    question: "How do AI interviews and recruitment assessments fit into hiring?",
    answer:
      "AI voice interviews and recruitment assessments provide standardized, objective evaluation early in the hiring process before consuming valuable engineering and executive panel hours. Huntlo conducts structured, natural-voice preliminary phone screens to verify critical logistics, salary expectations, communication clarity, and core role qualifications. Objective situational assessments then verify real-world competency, giving hiring managers verified candidate insights before in-person interviews.",
  },
  {
    question: "How does Huntlo connect different recruitment workflows?",
    answer:
      "Huntlo connects recruitment workflows through a shared operational state and event-driven automation backbone. When a candidate is sourced, their profile data automatically informs personalized outreach messaging. Once they reply, interview scheduling is triggered autonomously without manual handoffs. Screening transcripts, assessment benchmarks, and candidate preferences flow seamlessly into the centralized AI Recruitment CRM, ensuring all context remains intact across every stage.",
  },
  {
    question: "How do AI agents and human recruiters work together?",
    answer:
      "Huntlo is built on a Human + AI Hiring philosophy. AI agents take over repetitive, high-friction operational tasks such as talent identification, multi-channel sequence follow-ups, preliminary voice screening, and calendar scheduling. Human recruiters step into moments requiring strategic discernment, empathy, and relationship building—such as deep behavioral interviews, candidate closing, compensation negotiations, and hiring manager alignment. AI provides the execution speed and intelligence; humans provide the judgment and personal connection.",
  },
];

export const RELATED_PAGES = [
  {
    name: "Huntlo Platform",
    href: "/platform",
    description: "Explore the comprehensive architectural overview of Huntlo's AI recruiting platform.",
    badge: "Platform",
  },
  {
    name: "AI Hiring Intelligence Infrastructure",
    href: "/ai-hiring-infrastructure",
    description: "Understand the category foundations of connected intelligence versus legacy recruiting software.",
    badge: "Category",
  },
  {
    name: "Agentic Hiring™",
    href: "/agentic-hiring",
    description: "Discover how autonomous AI recruiting agents execute end-to-end talent acquisition workflows.",
    badge: "Agentic AI",
  },
  {
    name: "Huntlo360 — AI Hiring OS",
    href: "/hiring-os",
    description: "Unified operating system connecting talent discovery, candidate engagement, and hiring execution.",
    badge: "Hiring OS",
  },
  {
    name: "AI Hiring Solutions",
    href: "/solutions",
    description: "Tailored AI hiring infrastructure for staffing agencies, executive search, startups, and enterprises.",
    badge: "Solutions",
  },
  {
    name: "Vibe Sourcing",
    href: "/vibe-sourcing",
    description: "Culture-first, philosophy-driven candidate discovery that looks beyond rigid resume keywords.",
    badge: "Capability",
  },
];
