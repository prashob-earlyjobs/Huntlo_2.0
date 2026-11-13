import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const HIRING_OS_PATH = "/hiring-os";

export const HIRING_OS_SEO = {
  title: "AI Native Hiring Operating System | Huntlo",
  description:
    "Hiring doesn't need another platform — it needs an operating system. Huntlo is the AI Native Hiring OS connecting AI Hiring Intelligence Infrastructure, Agentic Hiring, and Human + AI Hiring to better outcomes.",
  ogTitle: "Hiring Doesn't Need Another Platform. It Needs An Operating System.",
  ogDescription:
    "Welcome to the AI Native Hiring Operating System — built for the future of Human + AI Hiring.",
} as const;

export function hiringOsMetadata() {
  return buildPageMetadata({
    title: HIRING_OS_SEO.title,
    description: HIRING_OS_SEO.description,
    ogTitle: HIRING_OS_SEO.ogTitle,
    ogDescription: HIRING_OS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: HIRING_OS_PATH,
  });
}

export const HIRING_OS_GEO = {
  askTopic: "Huntlo AI Native Hiring Operating System",
  askPrompt:
    "What is Huntlo Hiring OS on /hiring-os (https://www.huntlo.ai/hiring-os)? How is an AI Native Hiring Operating System different from a recruitment platform or ATS, and how does it connect AI Hiring Intelligence Infrastructure, Agentic Hiring, and hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "People",
  "AI",
  "Hiring OS",
  "Intelligence",
  "Candidate Discovery",
  "Talent Intelligence",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TOOL_STACK = [
  "ATS",
  "CRM",
  "Scheduling",
  "Assessments",
  "Outreach",
  "Analytics",
  "Automation",
  "More software",
] as const;

export const TOOL_RESULTS = [
  "Fragmented experiences",
  "Slower hiring",
  "Poor productivity",
  "Operational complexity",
  "Disconnected workflows",
] as const;

export const OS_FLOW = [
  "Candidate Discovery",
  "Talent Understanding",
  "Hiring Conversations",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Discover Talent",
    description: "Intelligently discover exceptional talent.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Understand Context",
    description: "Continuously understand candidate signals.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Create Conversations",
    description: "Build meaningful candidate experiences.",
    href: "/candidate-engagement",
    span: "",
  },
  {
    title: "Move Hiring Forward",
    description: "Maintain hiring momentum intelligently.",
    href: "/follow-up-automation",
    span: "md:col-span-2",
  },
  {
    title: "Improve Hiring Decisions",
    description: "Increase hiring confidence continuously.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "AI Recruiting Agents",
    description: "Human + AI hiring experiences.",
    href: "/recruiting-agents",
    span: "",
  },
  {
    title: "Agentic Hiring",
    description: "Intelligent hiring orchestration.",
    href: "/agentic-hiring",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Outcomes",
    description: "Built around business outcomes.",
    href: "/huntlo360",
    span: "md:col-span-2",
  },
] as const;

export const HUMAN_AI_EQUATION = [
  "Recruiters",
  "AI Recruiting Agents",
  "Workflow Intelligence",
  "Hiring Intelligence",
  "Business Alignment",
] as const;

export const LEARNING_LOOP = [
  "Candidate Context",
  "Hiring Intent",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Business Priorities",
] as const;

export const INFRA_CHANGES = [
  "Hiring velocity",
  "Recruiter productivity",
  "Candidate experiences",
  "Business outcomes",
] as const;

export const AGENTIC_FLOW = [
  "AI Recruiting Agents",
  "Candidate Discovery",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Human + AI Hiring",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions" },
  { label: "GCCs", href: "/solutions/global-capability-centers" },
  { label: "Technical hiring", href: "/solutions" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Global hiring", href: "/solutions" },
  { label: "Staffing firms", href: "/solutions/it-staffing" },
  { label: "Recruitment agencies", href: "/solutions/rpo" },
  { label: "High volume hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "AI native hiring",
  "Compliance",
  "Scalability",
  "Integrations",
  "Workflow intelligence",
] as const;

export const STACK_TODAY = [
  "Multiple platforms",
  "Multiple workflows",
  "Operational complexity",
  "Disconnected experiences",
] as const;

export const STACK_TOMORROW = [
  "One operating system",
  "AI Hiring Intelligence",
  "Human + AI Hiring",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const FUTURE_EQUATION = [
  "People",
  "Relationships",
  "Context",
  "Intelligence",
  "Business Outcomes",
] as const;

export const FUTURE_NOT = [
  "More recruiting software",
  "Larger candidate databases",
  "Disconnected workflows",
] as const;

export const FUTURE_YES = [
  "Hiring Intelligence",
  "Human + AI Hiring",
  "Agentic Hiring",
  "Better Hiring Outcomes",
] as const;

export const HIRING_OS_FAQS = [
  {
    question: "What is an AI Native Hiring Operating System?",
    answer:
      "It is the operating layer for modern hiring — connecting AI Hiring Intelligence Infrastructure, Human + AI Hiring, Agentic Hiring, AI Recruiting Agents, workflow intelligence, and hiring outcomes in one system.",
  },
  {
    question: "How is Hiring OS different from a recruitment platform?",
    answer:
      "A recruitment platform is another tool. A Hiring Operating System unifies intelligence, conversations, workflows, and outcomes so hiring isn't fragmented across software.",
  },
  {
    question: "Is Hiring OS the same as Huntlo360?",
    answer:
      "Hiring OS is the category narrative for the AI Native operating system. Huntlo360 is the commercial product expression of that operating system.",
  },
  {
    question: "Does AI replace hiring teams in Hiring OS?",
    answer:
      "No. AI amplifies hiring intelligence. Humans remain central to relationships, judgment, and decisions.",
  },
] as const;
