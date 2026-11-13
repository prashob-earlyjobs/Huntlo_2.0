import type { ProductEvidence } from "@/lib/productSurfaceTypes";
import { INFRASTRUCTURE_ARCHITECTURE_SURFACE } from "@/lib/productSurfaces";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_HIRING_INFRASTRUCTURE_PATH = "/ai-hiring-infrastructure";

export const AI_HIRING_INFRASTRUCTURE_SEO = {
  title: "AI Hiring Intelligence Infrastructure | Huntlo",
  description:
    "AI Hiring Intelligence Infrastructure connects talent discovery, candidate context, conversations and recruiting workflows in one Human + AI layer, with AI agents executing and recruiters in control.",
  ogTitle: "Hiring Is Becoming Intelligence Infrastructure",
  ogDescription:
    "How one connected Human + AI layer replaces a stack of disconnected recruiting tools, with recruiters keeping judgment and control.",
} as const;

export const AI_HIRING_EVIDENCE: ProductEvidence = {
  eyebrow: "Definition",
  title: "What is AI Hiring Intelligence Infrastructure?",
  intro:
    "AI Hiring Intelligence Infrastructure is a connected layer where talent discovery, candidate context, conversations and recruiting workflows share one state. AI agents execute repetitive work across stages, and recruiters govern the system and make every hiring decision.",
  points: [
    {
      title: "Channels in, context shared",
      body: "Email, WhatsApp, calendar and voice activity lands in one candidate record instead of separate tools.",
    },
    {
      title: "Agents act across stages",
      body: "Sourcing, outreach, screening and scheduling agents read and update the same hiring context.",
    },
    {
      title: "Recruiters govern",
      body: "Approved templates, review gates, permissions and audit trails decide what agents may do.",
    },
    {
      title: "Your ATS stays in place",
      body: "The infrastructure works alongside your system of record rather than replacing it.",
    },
  ],
  surface: INFRASTRUCTURE_ARCHITECTURE_SURFACE,
};

export function aiHiringInfrastructureMetadata() {
  return buildPageMetadata({
    title: AI_HIRING_INFRASTRUCTURE_SEO.title,
    description: AI_HIRING_INFRASTRUCTURE_SEO.description,
    ogTitle: AI_HIRING_INFRASTRUCTURE_SEO.ogTitle,
    ogDescription: AI_HIRING_INFRASTRUCTURE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_HIRING_INFRASTRUCTURE_PATH,
  });
}

export const AI_HIRING_GEO = {
  askTopic: "Huntlo AI Hiring Intelligence Infrastructure",
  askPrompt:
    "What is Huntlo AI Hiring Intelligence Infrastructure on /ai-hiring-infrastructure (https://www.huntlo.ai/ai-hiring-infrastructure)? How does it differ from recruiting software or automation, and how does it power Human + AI Hiring, Agentic Hiring, and hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "People",
  "AI",
  "Hiring Intelligence",
  "Candidate Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const OPERATIONAL_STACK = [
  "15+ tools",
  "Hundreds of workflows",
  "Thousands of conversations",
  "Multiple stakeholders",
  "Millions of decisions",
  "One hiring outcome",
] as const;

export const FEELS_LIKE_SOFTWARE = [
  "ATS",
  "CRM",
  "Scheduling",
  "Outreach",
  "Assessments",
  "Automation",
  "Analytics",
  "More software",
] as const;

export const FEELS_LIKE_INTELLIGENCE = [
  "Candidate Discovery",
  "Talent Intelligence",
  "Human + AI Hiring",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "AI Intelligence",
  "Hiring Intelligence",
  "Business Alignment",
  "Workflow Intelligence",
] as const;

export const AGENTIC_FLOW = [
  "Candidates discovered",
  "Hiring intent understood",
  "Candidate conversations begin",
  "Hiring momentum maintained",
  "Workflows intelligently coordinated",
  "Hiring confidence continuously improves",
  "Better hiring outcomes",
] as const;

export const AGENTIC_MANAGES = [
  "Workflows",
  "Follow-ups",
  "Interviews",
  "Candidate experiences",
  "Hiring coordination",
] as const;

export const AI_AGENTS = [
  "AI Discovery Agents",
  "AI Conversation Agents",
  "AI Workflow Agents",
  "AI Hiring Agents",
  "AI Intelligence Agents",
  "Hiring Outcomes",
] as const;

export const DISCOVERY_IMPROVES = [
  "Hiring velocity",
  "Talent quality",
  "Recruiter productivity",
  "Hiring confidence",
  "Business outcomes",
] as const;

export const LEARNING_LOOP = [
  "Candidate Context",
  "Business Priorities",
  "Hiring Confidence",
  "Workflow Intelligence",
  "Candidate Experiences",
  "Business Outcomes",
  "Hiring Outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Candidate Discovery",
    description: "Discover exceptional talent intelligently.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Talent Intelligence",
    description: "Understand talent continuously.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create meaningful candidate experiences.",
    href: "/candidate-engagement",
    span: "",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring intelligently.",
    href: "/workflow-orchestration",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Confidence",
    description: "Improve hiring decisions.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "AI Recruiting Agents",
    description: "Human + AI hiring.",
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

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions" },
  { label: "GCCs", href: "/solutions/global-capability-centers" },
  { label: "Technical hiring", href: "/solutions" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Global hiring", href: "/solutions" },
  { label: "Staffing firms", href: "/solutions/it-staffing" },
  { label: "Recruitment agencies", href: "/solutions/rpo" },
] as const;

export const STACK_TODAY = [
  "Recruiting software",
  "Hiring workflows",
  "Operational complexity",
  "More tools",
] as const;

export const STACK_TOMORROW = [
  "AI Hiring Intelligence Infrastructure",
  "Human + AI Hiring",
  "Agentic Hiring",
  "AI Recruiting Agents",
  "Hiring Outcomes",
] as const;

export const FUTURE_NOT = [
  "Better recruiting tools",
  "More automation",
  "Larger candidate databases",
] as const;

export const FUTURE_YES = [
  "Hiring Intelligence",
  "Human + AI Hiring",
  "Agentic Hiring",
  "Better Hiring Outcomes",
] as const;

export const AI_HIRING_FAQS = [
  {
    question: "What is AI Hiring Intelligence Infrastructure?",
    answer:
      "AI Hiring Intelligence Infrastructure is a connected layer where talent discovery, candidate context, conversations and recruiting workflows share one state. AI agents execute repetitive work across stages; recruiters govern the system and make every hiring decision.",
  },
  {
    question: "How is it different from recruiting software?",
    answer:
      "Most recruiting software solves one stage, so context is re-entered at every handoff. Hiring intelligence infrastructure keeps one shared record across sourcing, outreach, screening and scheduling, and lets AI agents act on it within recruiter-defined rules.",
  },
  {
    question: "Does Huntlo replace our ATS or CRM?",
    answer:
      "No. Your ATS remains the system of record for requisitions, applications and offers. Huntlo is the execution layer that runs discovery, engagement, screening and scheduling alongside it.",
  },
  {
    question: "How do recruiters keep control?",
    answer:
      "Recruiters set role criteria, approve outreach templates and campaigns, review shortlists before they advance and make every hiring decision. AI actions are logged so they can be reviewed.",
  },
  {
    question: "Will recruiters be replaced?",
    answer:
      "No. AI agents take on repetitive execution such as follow-ups, preliminary screens and scheduling. Relationships, judgment and hiring decisions stay with people.",
  },
] as const;
