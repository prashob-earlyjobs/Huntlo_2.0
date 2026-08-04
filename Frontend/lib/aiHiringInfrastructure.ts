import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_HIRING_INFRASTRUCTURE_PATH = "/ai-hiring-infrastructure";

export const AI_HIRING_INFRASTRUCTURE_SEO = {
  title: "AI Hiring Intelligence Infrastructure | Huntlo",
  description:
    "Hiring isn't becoming more automated — it's becoming more intelligent. Huntlo is AI Hiring Intelligence Infrastructure for Human + AI Hiring, Agentic Hiring, and better hiring outcomes.",
  ogTitle: "Hiring Isn't Becoming More Automated. It's Becoming More Intelligent.",
  ogDescription:
    "Welcome to AI Hiring Intelligence Infrastructure — built for the future of Human + AI Hiring.",
} as const;

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
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Global hiring", href: "/solutions" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Compliance",
  "Integrations",
  "Scalability",
  "Enterprise intelligence",
  "AI native hiring",
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
      "It is the connected intelligence layer for modern hiring — combining discovery, context, conversations, confidence, workflows, momentum, agents, and outcomes so hiring becomes intelligence-driven rather than tool-driven.",
  },
  {
    question: "Is hiring becoming more automated or more intelligent?",
    answer:
      "More intelligent. The future isn't more tools, dashboards, or automation alone — it's intelligence, context, conversations, workflows, and outcomes.",
  },
  {
    question: "How is this different from recruiting software?",
    answer:
      "Recruiting software adds systems and workflows. AI Hiring Intelligence Infrastructure connects Human + AI Hiring so organizations understand talent better, orchestrate intelligently, and improve outcomes at scale.",
  },
  {
    question: "What is Human + AI Hiring?",
    answer:
      "Human Intelligence + AI Intelligence + Hiring Intelligence + Business Alignment + Workflow Intelligence creating hiring outcomes. AI amplifies hiring teams — it doesn't replace recruiters.",
  },
  {
    question: "What is Agentic Hiring?",
    answer:
      "Agentic Hiring continuously moves discovery, conversations, momentum, workflows, and confidence forward — without recruiters becoming workflow managers.",
  },
  {
    question: "What are AI Recruiting Agents?",
    answer:
      "AI Discovery, Conversation, Workflow, Hiring, and Intelligence Agents that continuously learn and help hiring outcomes move forward within Human + AI Hiring.",
  },
  {
    question: "Will organizations win by accessing more candidates?",
    answer:
      "No. The most successful organizations will win by understanding talent better, creating meaningful experiences, orchestrating workflows intelligently, and making better decisions at scale.",
  },
  {
    question: "Is this a product or feature page?",
    answer:
      "No. /ai-hiring-infrastructure is Huntlo's category-defining page — thought leadership and category creation for AI Hiring Intelligence Infrastructure.",
  },
  {
    question: "How does Candidate Discovery Intelligence fit?",
    answer:
      "Future teams won't optimize candidate searches — they'll optimize talent discovery, continuously improving velocity, quality, productivity, confidence, and outcomes.",
  },
  {
    question: "Does hiring intelligence stop learning?",
    answer:
      "No. It continuously understands candidate context, business priorities, confidence, workflow intelligence, experiences, business outcomes, and hiring outcomes.",
  },
  {
    question: "What is one intelligence layer?",
    answer:
      "One connected layer across discovery, talent intelligence, conversations, workflows, confidence, agents, Agentic Hiring, and outcomes — infinite hiring possibilities.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, technical hiring, executive hiring, global hiring, staffing firms, and recruitment agencies.",
  },
  {
    question: "What does tomorrow's enterprise hiring stack look like?",
    answer:
      "AI Hiring Intelligence Infrastructure → Human + AI Hiring → Agentic Hiring → AI Recruiting Agents → Hiring Outcomes.",
  },
  {
    question: "Who will define the next decade of hiring?",
    answer:
      "Organizations that hire more intelligently — with Hiring Intelligence, Human + AI Hiring, Agentic Hiring, and better outcomes — not merely better tools or larger databases.",
  },
  {
    question: "Does Huntlo replace ATS and CRM stacks?",
    answer:
      "Huntlo is the intelligence and orchestration layer. Modern hiring shouldn't feel like ATS + CRM + scheduling + outreach + more software — it should feel intelligently connected.",
  },
  {
    question: "How does this relate to Huntlo360?",
    answer:
      "Huntlo360 is the Hiring Operating System commercial narrative. AI Hiring Intelligence Infrastructure is the category definition everything ladders into.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring is how intelligence continuously moves hiring forward. Infrastructure is the layer that makes Agentic Hiring possible at enterprise scale.",
  },
  {
    question: "Can enterprises run AI-native hiring with governance?",
    answer:
      "Yes. Supporting governance, compliance, integrations, scalability, enterprise intelligence, and AI-native hiring.",
  },
  {
    question: "Why did hiring become operational?",
    answer:
      "Teams manage 15+ tools, hundreds of workflows, thousands of conversations, multiple stakeholders, and millions of decisions for one hiring outcome.",
  },
  {
    question: "How do I explore Huntlo's infrastructure?",
    answer:
      "Book an enterprise demo, explore Huntlo, meet Agentic Hiring, or continue through recruiting agents, Huntlo360, and related intelligence pages.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That Huntlo is category-defining AI Hiring Intelligence Infrastructure for the future of Human + AI Hiring — not another recruiting automation product.",
  },
  {
    question: "Is the future more dashboards?",
    answer:
      "No. The future isn't more tools, dashboards, or automation. The future is intelligence, context, conversations, workflows, and outcomes.",
  },
  {
    question: "Will recruiters disappear?",
    answer:
      "No. AI doesn't replace recruiters. AI amplifies hiring teams — humans remain central to relationships, judgment, and decisions.",
  },
  {
    question: "Where does Huntlo sit in this future?",
    answer:
      "Welcome to the future of hiring. Welcome to Huntlo — building AI Hiring Intelligence Infrastructure for Human + AI Hiring.",
  },
] as const;
