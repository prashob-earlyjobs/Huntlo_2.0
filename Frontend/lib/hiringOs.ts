import type { ProductEvidence } from "@/lib/productSurfaceTypes";
import { SHARED_CONTEXT_SURFACE } from "@/lib/productSurfaces";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const HIRING_OS_PATH = "/hiring-os";

export const HIRING_OS_SEO = {
  title: "What Is an AI Hiring Operating System? | Huntlo",
  description:
    "An AI hiring operating system connects talent discovery, candidate engagement, screening and workflow execution in one shared layer, so recruiters and AI agents work from the same hiring context.",
  ogTitle: "What Is an AI Hiring Operating System?",
  ogDescription:
    "How an AI hiring OS differs from an ATS or point tools, and how Huntlo360 implements it.",
} as const;

export const HIRING_OS_EVIDENCE: ProductEvidence = {
  eyebrow: "Shared context",
  title: "The defining feature: one record every agent and recruiter uses",
  intro:
    "In a stack of point tools, each stage keeps its own copy of the candidate. In an AI hiring operating system, discovery, engagement, screening, scheduling and analytics all read and update one shared record, so nothing is re-keyed and every action is attributable.",
  points: [
    {
      title: "One candidate record",
      body: "Profile, conversations, transcripts and notes live together across roles.",
    },
    {
      title: "Agents and recruiters on the same timeline",
      body: "You can see whether an agent or a person acted, and when.",
    },
    {
      title: "Modules share state",
      body: "Screening sees what outreach learned; analytics sees both, without exports.",
    },
  ],
  surface: SHARED_CONTEXT_SURFACE,
};

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
    question: "What is an AI hiring operating system?",
    answer:
      "An AI hiring operating system connects talent discovery, candidate engagement, screening and workflow execution in one shared layer, so recruiters and AI agents work from the same hiring context instead of separate tools.",
  },
  {
    question: "How is a hiring OS different from an ATS?",
    answer:
      "An ATS is a system of record for requisitions, applications and offers. A hiring operating system is the execution layer around it: it finds candidates, runs conversations, screens and schedules, and keeps the shared context those steps depend on. The two usually run side by side.",
  },
  {
    question: "Is Hiring OS the same as Huntlo360?",
    answer:
      "No. “AI hiring operating system” is the category this page explains. Huntlo360 is Huntlo's product implementation of that category; see the Huntlo360 page for product details.",
  },
  {
    question: "Does an AI hiring OS replace recruiters?",
    answer:
      "No. AI agents run repetitive execution inside recruiter-defined rules. Recruiters keep relationships, judgment and every hiring decision.",
  },
] as const;
