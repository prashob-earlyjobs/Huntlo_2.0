import type { ProductEvidence } from "@/lib/productSurfaceTypes";
import { AGENT_ACTIVITY_SURFACE } from "@/lib/productSurfaces";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AGENTIC_HIRING_PATH = "/agentic-hiring";

export const AGENTIC_HIRING_SEO = {
  title: "Agentic Hiring™: AI Agents + Recruiter Judgment | Huntlo",
  description:
    "Agentic Hiring combines AI agents with recruiter judgment so talent discovery, candidate conversations and workflow coordination keep moving, without removing people from hiring decisions.",
  ogTitle: "Hiring Isn't Becoming Automated. It's Becoming Agentic.",
  ogDescription:
    "See how Huntlo's AI agents keep hiring moving between stages while recruiters approve campaigns and make every decision.",
} as const;

export const AGENTIC_HIRING_EVIDENCE: ProductEvidence = {
  eyebrow: "Agents at work",
  title: "What agentic hiring looks like on one candidate",
  intro:
    "Agentic hiring means AI agents act on candidate events as they happen, inside the campaign and rules a recruiter approved. This is one candidate's first half hour, from match to booked interview.",
  points: [
    {
      title: "Agents act on events, not reminders",
      body: "A reply opens screening immediately; nobody has to notice it in an inbox first.",
    },
    {
      title: "Recruiters approve the campaign once",
      body: "Outreach runs from a template and sequence a recruiter signed off.",
    },
    {
      title: "Review gates before decisions",
      body: "Agents request review; only a recruiter advances or declines a candidate.",
    },
    {
      title: "Every step is logged",
      body: "The activity trail shows which agent or person acted, and when.",
    },
  ],
  surface: AGENT_ACTIVITY_SURFACE,
};

export function agenticHiringMetadata() {
  return buildPageMetadata({
    title: AGENTIC_HIRING_SEO.title,
    description: AGENTIC_HIRING_SEO.description,
    ogTitle: AGENTIC_HIRING_SEO.ogTitle,
    ogDescription: AGENTIC_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AGENTIC_HIRING_PATH,
  });
}

export const AGENTIC_HIRING_GEO = {
  askTopic: "Huntlo Agentic Hiring™",
  askPrompt:
    "What is Agentic Hiring™ on /agentic-hiring (https://www.huntlo.ai/agentic-hiring)? How is it different from recruiting software or AI recruiters, and how does Human + AI Hiring with AI Recruiting Agents improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Human",
  "AI",
  "Agentic Hiring",
  "Hiring Intelligence",
  "Candidate Discovery",
  "Candidate Conversations",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const SOFTWARE_STACK = [
  "ATS",
  "CRMs",
  "Automation",
  "Assessments",
  "Scheduling",
  "Analytics",
  "More software",
] as const;

export const STILL_STRUGGLE = [
  "Hiring velocity",
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring confidence",
  "Fragmented workflows",
] as const;

export const AGENTIC_DOES = [
  "Discover talent",
  "Understand context",
  "Maintain candidate momentum",
  "Intelligently coordinate workflows",
  "Improve hiring confidence",
  "Accelerate business outcomes",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "Hiring Intelligence",
  "AI Intelligence",
  "Workflow Intelligence",
  "Business Alignment",
] as const;

export const LEARNING_FLOW = [
  "Candidate discovered",
  "Candidate context understood",
  "Hiring intent continuously improves",
  "Conversations intelligently begin",
  "Hiring momentum is maintained",
  "Workflows coordinate themselves",
  "Hiring confidence continuously improves",
  "Hiring outcomes accelerate",
] as const;

export const BENTO_CARDS = [
  {
    title: "AI Discovery Agent",
    description: "Continuously understands talent.",
    href: "/ai-sourcing-agent",
    span: "md:col-span-2",
  },
  {
    title: "AI Conversation Agent",
    description: "Creates meaningful candidate experiences.",
    href: "/ai-outreach-agent",
    span: "",
  },
  {
    title: "AI Workflow Agent",
    description: "Coordinates hiring intelligently.",
    href: "/ai-scheduling-agent",
    span: "",
  },
  {
    title: "AI Hiring Agent",
    description: "Improves hiring outcomes continuously.",
    href: "/ai-recruiting-agent",
    span: "md:col-span-2",
  },
  {
    title: "AI Intelligence Agent",
    description: "Accelerates business outcomes.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters.",
    href: "/recruiting-agents",
    span: "",
  },
  {
    title: "Hiring Intelligence",
    description: "Continuously learning.",
    href: "/ai-hiring-infrastructure",
    span: "md:col-span-2",
  },
  {
    title: "Agentic Hiring™",
    description: "The future of hiring.",
    href: "#agentic-hiring",
    span: "md:col-span-2",
  },
] as const;

export const INFRA_CHANGES = [
  "Hiring outcomes",
  "Recruiter productivity",
  "Candidate experiences",
  "Business alignment",
  "Talent strategy",
] as const;

export const STACK_TODAY = [
  "Recruiting software",
  "Hiring workflows",
  "Operational complexity",
  "Fragmented experiences",
  "More software",
] as const;

export const STACK_TOMORROW = [
  "Agentic Hiring™",
  "Human + AI Hiring",
  "AI Recruiting Agents",
  "Hiring Intelligence",
  "AI Hiring Infrastructure",
  "Better Hiring Outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions" },
  { label: "GCCs", href: "/solutions/global-capability-centers" },
  { label: "Staffing firms", href: "/solutions/it-staffing" },
  { label: "Recruitment agencies", href: "/solutions/rpo" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Technical hiring", href: "/solutions" },
] as const;

export const WHY_NOT = [
  "Hire more people",
  "Send more outreach",
  "Automate more workflows",
] as const;

export const WHY_YES = [
  "Understand talent better",
  "Hire more intelligently",
  "Improve candidate experiences",
  "Continuously learn from hiring outcomes",
  "Intelligently orchestrate global hiring operations",
] as const;

export const FUTURE_NOT = [
  "Recruiting operations",
  "Hiring workflows",
  "Talent pipelines",
] as const;

export const FUTURE_YES = [
  "Hiring Intelligence",
  "Human + AI Hiring",
  "Agentic Hiring™",
  "Better Hiring Outcomes",
] as const;

export const AGENTIC_HIRING_FAQS = [
  {
    question: "What is Agentic Hiring™?",
    answer:
      "Agentic Hiring™ is an approach where AI agents continuously work alongside hiring teams to discover talent, understand candidate context, maintain momentum and coordinate workflows, while recruiters approve campaigns, review outcomes and make every hiring decision.",
  },
  {
    question: "How is Agentic Hiring different from an AI recruiter?",
    answer:
      "An “AI recruiter” implies replacing people. Agentic Hiring splits the work: AI agents run repetitive execution such as outreach, follow-ups, preliminary screens and scheduling, and recruiters keep judgment, relationships and decisions.",
  },
  {
    question: "Does Agentic Hiring replace recruiters?",
    answer:
      "No. Agents remove waiting and coordination work between stages. Recruiters still define requirements, review shortlists, run interviews and decide who is hired.",
  },
  {
    question: "Can enterprises govern AI agents in hiring?",
    answer:
      "Yes. Agents work from approved templates and recruiter-defined rules, request review before shortlist decisions, operate under role-based permissions and log their actions in an audit trail.",
  },
] as const;
