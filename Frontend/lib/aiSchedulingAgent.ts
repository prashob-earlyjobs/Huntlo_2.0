import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_SCHEDULING_AGENT_PATH = "/ai-scheduling-agent";

export const AI_SCHEDULING_AGENT_SEO = {
  title: "AI Scheduling Agent & AI Workflow Intelligence | Huntlo",
  description:
    "Huntlo AI Workflow Intelligence helps recruiting teams move hiring forward intelligently — combining conversation intelligence, hiring momentum, and workflow orchestration so hiring never waits for fragmented operations.",
  ogTitle: "Great Hiring Isn't About Managing Workflows. It's About Moving Hiring Forward Intelligently.",
  ogDescription:
    "Hiring should never wait for workflows. Workflows should move hiring forward automatically. Explore Huntlo AI Workflow Intelligence.",
} as const;

export function aiSchedulingAgentMetadata() {
  return buildPageMetadata({
    title: AI_SCHEDULING_AGENT_SEO.title,
    description: AI_SCHEDULING_AGENT_SEO.description,
    ogTitle: AI_SCHEDULING_AGENT_SEO.ogTitle,
    ogDescription: AI_SCHEDULING_AGENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_SCHEDULING_AGENT_PATH,
  });
}

export const AI_SCHEDULING_AGENT_GEO = {
  askTopic: "Huntlo AI Workflow Intelligence",
  askPrompt:
    "What is Huntlo AI Workflow Intelligence on /ai-scheduling-agent (https://www.huntlo.ai/ai-scheduling-agent)? How is an AI Scheduling Agent different from scheduling automation, and how does it improve hiring velocity and Agentic Hiring?",
} as const;

export const HERO_WORKFLOW_FLOW = [
  "Candidate Discovery",
  "Conversation Intelligence",
  "Hiring Readiness",
  "Workflow Intelligence",
  "Interview Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const RECRUITER_MANAGES = [
  "Sourcing",
  "Engagement",
  "Interviews",
  "Follow-ups",
  "Assessments",
  "Scheduling",
  "Hiring decisions",
  "Candidate experiences",
] as const;

export const CANDIDATE_FEELS = [
  "Delays",
  "Confusion",
  "Inconsistent communication",
  "Disconnected hiring journeys",
] as const;

export const TRADITIONAL_FLOW = [
  "Source",
  "Schedule",
  "Wait",
  "Interview",
  "Wait",
  "Follow up",
  "Repeat",
] as const;

export const MODERN_FLOW = [
  "Discover talent",
  "Understand context",
  "Create conversations",
  "Maintain momentum",
  "Coordinate hiring",
  "Improve decisions",
  "Accelerate outcomes",
] as const;

export const WORKFLOW_COMBINES = [
  "Candidate Context",
  "Hiring Intent",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Business Priorities",
  "Workflow Intelligence",
  "Hiring Outcomes",
] as const;

export const LEARNING_LOOP = [
  "Candidate Signals",
  "Hiring Momentum",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Business Priorities",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const MEET_HUNTLO_FLOW = [
  "Candidate Discovery",
  "Candidate Intelligence",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "AI Scheduling Agents",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const WORKFLOW_IMPROVES = [
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring velocity",
  "Business alignment",
  "Hiring confidence",
  "Talent outcomes",
] as const;

export const AGENT_FLOW = [
  "AI Scheduling Agent",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Candidate Experiences",
  "Business Alignment",
  "Hiring Outcomes",
  "Recruiter Decisions",
] as const;

export const CANDIDATES_REMEMBER = [
  "Experiences",
  "Conversations",
  "Transparency",
  "Responsiveness",
  "Relationships",
] as const;

export const CANDIDATES_FORGET = [
  "Interview slots",
  "Calendar invites",
  "Scheduling emails",
  "Hiring workflows",
] as const;

export const INFRA_CHANGES = [
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring velocity",
  "Business outcomes",
] as const;

export const FUTURE_EQUATION = [
  "People",
  "Relationships",
  "Context",
  "Workflow Intelligence",
  "Hiring Outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Global hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Compliance",
  "Integrations",
  "Scalability",
  "AI workflows",
  "Recruiter productivity",
] as const;

export const AI_SCHEDULING_AGENT_FAQS = [
  {
    question: "What is an AI Scheduling Agent?",
    answer:
      "An AI Scheduling Agent helps recruiting teams move hiring forward intelligently by coordinating workflows around context, conversations, readiness, and outcomes — not by managing calendars alone.",
  },
  {
    question: "How is it different from scheduling automation?",
    answer:
      "Scheduling automation focuses on slots, invites, and calendar availability. AI Workflow Intelligence focuses on which hiring outcome should happen next — so workflows create velocity instead of operational complexity.",
  },
  {
    question: "What is AI Workflow Intelligence?",
    answer:
      "AI Workflow Intelligence continuously understands candidate context, hiring intent, conversation intelligence, hiring confidence, business priorities, workflow intelligence, and hiring outcomes — before recruiters coordinate fragmented workflows.",
  },
  {
    question: "Can Huntlo orchestrate hiring workflows?",
    answer:
      "Yes. Huntlo connects discovery, conversations, readiness, scheduling intelligence, interview intelligence, and hiring momentum so hiring moves forward without recruiters becoming workflow managers.",
  },
  {
    question: "How do AI Recruiting Agents improve recruiter productivity?",
    answer:
      "AI Scheduling Agents continuously learn from signals, momentum, workflow intelligence, and outcomes — helping reduce delays, fragmentation, and coordination overhead while humans stay responsible for decisions.",
  },
  {
    question: "Can enterprises customize hiring workflows?",
    answer:
      "Yes. Enterprise teams can operate connected AI workflow intelligence with governance, compliance, integrations, scalability, and multi-recruiter support.",
  },
  {
    question: "What is Agentic Hiring?",
    answer:
      "Agentic Hiring is Human + AI hiring where intelligent agents help discovery, conversations, readiness, workflows, and interviews move forward — while humans lead relationships and decisions.",
  },
  {
    question: "Is this a calendar or ATS workflow builder?",
    answer:
      "No. The page and product direction focus on AI Workflow Intelligence — intelligent orchestration for hiring outcomes — rather than calendars, ATS builders, kanban boards, or automation diagrams.",
  },
  {
    question: "Why isn't scheduling the real bottleneck?",
    answer:
      "Hiring slows when workflows fragment across conversations, decisions, interviews, and experiences. The gap is usually workflow intelligence — not the ability to schedule interviews.",
  },
  {
    question: "What should teams ask instead of which workflow happens next?",
    answer:
      "Ask which hiring outcome should happen next — based on context, intent, conversations, confidence, and business priorities.",
  },
  {
    question: "Is Workflow Intelligence becoming infrastructure?",
    answer:
      "Yes. Modern organizations will ask how hiring can intelligently move itself forward, not only which scheduling software to use.",
  },
  {
    question: "Who is AI Scheduling Agent built for?",
    answer:
      "CHROs, enterprise leaders, VP Talent Acquisition, founders, recruitment leaders, GCC leaders, technical hiring teams, and staffing leaders building Agentic Hiring.",
  },
  {
    question: "Does Huntlo replace human coordination?",
    answer:
      "No. Huntlo is built for Human + AI hiring. AI Scheduling Agents improve continuity and momentum while humans remain responsible for relationships, judgment, and decisions.",
  },
  {
    question: "How does this relate to Scheduling Intelligence?",
    answer:
      "Scheduling Intelligence focuses on seamless candidate experiences around interview timing. AI Workflow Intelligence and AI Scheduling Agents deepen orchestration across the full hiring journey.",
  },
  {
    question: "What do candidates remember about scheduling?",
    answer:
      "Candidates don't remember interview slots, calendar invites, scheduling emails, or hiring workflows. They remember experiences, conversations, transparency, responsiveness, and relationships.",
  },
  {
    question: "Is modern recruiting workflow-driven or intelligence-driven?",
    answer:
      "Intelligence-driven. Modern recruiting isn't becoming workflow driven — it's becoming intelligence driven.",
  },
  {
    question: "Will AI Scheduling Agents never stop learning?",
    answer:
      "They continuously learn from workflow intelligence, hiring momentum, candidate experiences, business alignment, hiring outcomes, and recruiter decisions.",
  },
  {
    question: "How does this fit Huntlo's broader stack?",
    answer:
      "Huntlo is AI Hiring Intelligence Infrastructure. AI Scheduling Agents connect Candidate Discovery, Candidate Intelligence, Conversation Intelligence, Workflow Intelligence, Hiring Outcomes, and AI Hiring Infrastructure.",
  },
  {
    question: "How does workflow intelligence create hiring velocity?",
    answer:
      "Future teams optimize hiring outcomes rather than workflows alone — continuously improving productivity, experiences, velocity, alignment, confidence, and talent outcomes.",
  },
  {
    question: "Can Huntlo support high-volume and enterprise operations?",
    answer:
      "Yes. The approach is built for enterprise, GCC, technical, executive, agency, staffing, and global hiring environments.",
  },
  {
    question: "Should hiring feel operational or intelligent?",
    answer:
      "Intelligent. Great hiring shouldn't feel operational. It should feel intelligent — with workflows that move hiring forward automatically.",
  },
  {
    question: "How do I get started with Huntlo AI Workflow Intelligence?",
    answer:
      "Book a demo to see AI Workflow Intelligence in your process, explore Workflow Orchestration and related pages, or create an account to get started.",
  },
] as const;
