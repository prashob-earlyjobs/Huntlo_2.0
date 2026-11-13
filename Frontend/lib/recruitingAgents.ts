import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const RECRUITING_AGENTS_PATH = "/recruiting-agents";

export const RECRUITING_AGENTS_SEO = {
  title: "AI Recruiting Agents & Agentic Hiring | Huntlo",
  description:
    "The future of hiring is Human + AI. Huntlo AI Recruiting Agents power Agentic Hiring through AI Hiring Intelligence Infrastructure — continuously moving discovery, conversations, workflows, and outcomes forward.",
  ogTitle: "Hiring Was Built For Humans. The Future Will Be Built For Humans + AI.",
  ogDescription:
    "Hiring is about to change more in the next 5 years than it has in the last 50. Welcome to Agentic Hiring — powered by AI Recruiting Agents.",
} as const;

export function recruitingAgentsMetadata() {
  return buildPageMetadata({
    title: RECRUITING_AGENTS_SEO.title,
    description: RECRUITING_AGENTS_SEO.description,
    ogTitle: RECRUITING_AGENTS_SEO.ogTitle,
    ogDescription: RECRUITING_AGENTS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: RECRUITING_AGENTS_PATH,
  });
}

export const RECRUITING_AGENTS_GEO = {
  askTopic: "Huntlo Agentic Hiring & AI Recruiting Agents",
  askPrompt:
    "What are Huntlo AI Recruiting Agents on /recruiting-agents (https://www.huntlo.ai/recruiting-agents)? What is Agentic Hiring, Human + AI Hiring, and AI Hiring Intelligence Infrastructure — and how do they differ from ATS platforms or recruitment automation?",
} as const;

/** Full category ladder — everything built so far. */
export const CATEGORY_LADDER = [
  "Candidate Discovery",
  "Candidate Context Intelligence",
  "Conversation Intelligence",
  "Response Intelligence",
  "Hiring Readiness Intelligence",
  "Hiring Confidence Intelligence",
  "Interview Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum Intelligence",
  "Hiring Decision Intelligence",
  "Business Alignment Intelligence",
  "Hiring Outcomes",
  "AI Recruiting Agents",
  "Agentic Hiring",
  "AI Hiring Intelligence Infrastructure",
  "Huntlo",
] as const;

export const HERO_FLOW = [
  "Human + AI",
  "Agentic Hiring",
  "Hiring Intelligence",
  "Candidate Discovery",
  "Candidate Conversations",
  "Hiring Confidence",
  "Workflow Intelligence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const ORG_STRUGGLES = [
  "Fragmented hiring workflows",
  "Poor candidate experiences",
  "Slower hiring cycles",
  "Disconnected systems",
  "Recruiter productivity",
  "Hiring confidence",
] as const;

export const OPERATIONAL_STACK = [
  "10+ tools",
  "100+ workflows",
  "Thousands of conversations",
  "Multiple stakeholders",
  "One hiring decision",
] as const;

export const NOT_THE_FUTURE = [
  "AI Recruiting",
  "Recruitment Automation",
  "ATS Platforms",
] as const;

export const AGENTIC_UNDERSTANDS = [
  "Candidate Context",
  "Hiring Intent",
  "Business Priorities",
  "Workflow Intelligence",
  "Candidate Experiences",
  "Hiring Confidence",
  "Business Outcomes",
] as const;

export const AI_AGENTS = [
  {
    name: "AI Discovery Agent",
    blurb: "Discovers talent with continuous context, not keyword searches.",
  },
  {
    name: "AI Conversation Agent",
    blurb: "Creates and sustains intelligent candidate conversations.",
  },
  {
    name: "AI Workflow Agent",
    blurb: "Coordinates hiring so momentum never stalls.",
  },
  {
    name: "AI Hiring Agent",
    blurb: "Keeps decisions aligned to intent and outcomes.",
  },
  {
    name: "AI Interview Agent",
    blurb: "Elevates interviews into hiring confidence.",
  },
  {
    name: "AI Intelligence Agent",
    blurb: "Connects signals into hiring intelligence.",
  },
] as const;

export const ENTERPRISES_DONT_NEED = [
  "Another ATS",
  "Another sourcing tool",
  "Another scheduling platform",
] as const;

export const HIRING_CONTINUOUSLY = [
  "Understands candidates",
  "Creates conversations",
  "Maintains hiring momentum",
  "Orchestrates workflows",
  "Improves hiring confidence",
  "Accelerates outcomes",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "AI Intelligence",
  "Hiring Intelligence",
  "Workflow Intelligence",
  "Business Alignment",
  "Candidate Experiences",
] as const;

export const CONTINUOUS_FORWARD = [
  "Candidates discovered",
  "Candidate context understood",
  "Conversations intelligently created",
  "Hiring momentum maintained",
  "Workflows continuously coordinated",
  "Hiring decisions intelligently supported",
  "Business outcomes continuously improved",
] as const;

export const STACK_TODAY = [
  "ATS",
  "CRM",
  "Scheduling",
  "Email",
  "Assessments",
  "Automation",
  "Analytics",
  "More software",
] as const;

export const STACK_TOMORROW = [
  "AI Hiring Intelligence Infrastructure",
  "Agentic Hiring",
  "AI Recruiting Agents",
  "Human + AI Hiring",
  "Hiring Outcomes",
] as const;

export const INFRA_CHANGES = [
  "Hiring velocity",
  "Recruiter productivity",
  "Candidate experiences",
  "Business alignment",
  "Hiring outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "High volume hiring", href: "/solutions/enterprise-hiring" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Integrations",
  "Scalability",
  "Compliance",
  "AI workflows",
  "Enterprise intelligence",
] as const;

export const FUTURE_EQUATION = [
  "People",
  "Relationships",
  "Context",
  "Intelligence",
  "Business Outcomes",
  "Human + AI Collaboration",
] as const;

export const FUTURE_DEFINED_BY = [
  "Agentic Hiring",
  "Hiring Intelligence",
  "Human + AI Collaboration",
  "Better Hiring Outcomes",
] as const;

export const FUTURE_NOT_DEFINED_BY = [
  "ATS platforms",
  "Recruiting automation",
  "Sourcing tools",
] as const;

export const RECRUITING_AGENTS_FAQS = [
  {
    question: "What are AI Recruiting Agents?",
    answer:
      "AI Recruiting Agents are intelligent systems that continuously help discovery, conversations, workflows, interviews, and hiring decisions move forward — so hiring becomes intelligence-driven rather than tool-driven.",
  },
  {
    question: "What is Agentic Hiring?",
    answer:
      "Agentic Hiring is the future of Human + AI hiring — where intelligent agents and humans collaborate across context, conversations, workflows, confidence, and outcomes.",
  },
  {
    question: "What is Human + AI Hiring?",
    answer:
      "Human + AI Hiring means AI amplifies hiring teams instead of replacing them. Recruiters, hiring managers, and candidate experiences remain central — while intelligence continuously moves hiring forward.",
  },
  {
    question: "What is AI Hiring Intelligence Infrastructure?",
    answer:
      "AI Hiring Intelligence Infrastructure is the connected layer beneath Agentic Hiring — combining discovery, context, conversations, readiness, confidence, interviews, workflows, momentum, decisions, and business alignment into hiring outcomes.",
  },
  {
    question: "Can AI replace recruiters?",
    answer:
      "No. Recruiters won't disappear. Hiring managers won't disappear. Candidate experiences won't disappear. What's changing is how intelligently hiring moves forward — with humans leading relationships and decisions.",
  },
  {
    question: "How does Huntlo improve hiring outcomes?",
    answer:
      "Huntlo connects AI Recruiting Agents, Agentic Hiring, and Hiring Intelligence so teams optimize outcomes — velocity, confidence, experiences, and business alignment — not just more software.",
  },
  {
    question: "Can enterprises customize AI workflows?",
    answer:
      "Yes. Enterprise teams can operate connected AI workflows with governance, compliance, integrations, scalability, and multi-stakeholder hiring support.",
  },
  {
    question: "Can Huntlo support enterprise hiring?",
    answer:
      "Yes. The approach is built for enterprises, GCCs, staffing firms, global teams, executive hiring, technical hiring, and high-volume environments.",
  },
  {
    question: "What makes Huntlo different?",
    answer:
      "Huntlo is not another ATS, sourcing tool, or recruitment automation stack. It is AI Hiring Intelligence Infrastructure powered by Agentic Hiring through AI Recruiting Agents for Human + AI Hiring.",
  },
  {
    question: "Is this a product feature page?",
    answer:
      "No. /recruiting-agents is a category page about the future of hiring — Agentic Hiring and AI Recruiting Agents — not a feature checklist.",
  },
  {
    question: "How is this different from recruitment automation?",
    answer:
      "Recruitment automation adds more tools and workflows. Agentic Hiring continuously understands context, intent, priorities, experiences, confidence, and outcomes — so hiring moves intelligently.",
  },
  {
    question: "How is this different from an ATS platform?",
    answer:
      "ATS platforms organize records and processes. AI Hiring Intelligence Infrastructure continuously moves hiring forward across discovery, conversations, workflows, and outcomes.",
  },
  {
    question: "Will recruiters become workflow managers?",
    answer:
      "They shouldn't. Agentic Hiring is designed so workflows coordinate continuously — without recruiters becoming operational bottlenecks.",
  },
  {
    question: "What powers the next generation of hiring?",
    answer:
      "Not more tools, dashboards, or automation alone — but intelligence, workflows, conversations, context, relationships, and outcomes.",
  },
  {
    question: "What is the category ladder Huntlo is building?",
    answer:
      "Candidate Discovery through Conversation, Response, Readiness, Confidence, Interview, Workflow, Momentum, Decision, and Business Alignment Intelligence — into Hiring Outcomes, AI Recruiting Agents, Agentic Hiring, and AI Hiring Intelligence Infrastructure.",
  },
  {
    question: "What happens when every hiring workflow continuously learns?",
    answer:
      "You get Agentic Hiring — systems that improve momentum, confidence, experiences, and outcomes over time.",
  },
  {
    question: "Do modern enterprises need more hiring software?",
    answer:
      "Most already manage 10+ tools and 100+ workflows. They need Hiring Intelligence Infrastructure that connects those motions into better outcomes.",
  },
  {
    question: "What does the future enterprise hiring stack look like?",
    answer:
      "Tomorrow's stack is AI Hiring Intelligence Infrastructure → Agentic Hiring → AI Recruiting Agents → Human + AI Hiring → Hiring Outcomes — not more disconnected software layers.",
  },
  {
    question: "Is Hiring Intelligence becoming infrastructure?",
    answer:
      "Yes. Future enterprises will ask how intelligently hiring can continuously move itself forward — not only which recruiting software to purchase.",
  },
  {
    question: "Who is this page for?",
    answer:
      "CHROs, enterprise leaders, VP Talent Acquisition, founders, recruitment leaders, GCC leaders, technical hiring teams, and staffing leaders shaping the future of hiring.",
  },
  {
    question: "How do AI Recruiting Agents relate to Candidate Discovery?",
    answer:
      "AI Discovery Agents help talent discovery become continuous and intelligence-led — feeding context into conversations, readiness, and outcomes.",
  },
  {
    question: "How do agents improve candidate experiences?",
    answer:
      "By maintaining conversations, momentum, transparency, and responsiveness — so candidates experience intelligent hiring rather than fragmented operations.",
  },
  {
    question: "Does Agentic Hiring replace Human Intelligence?",
    answer:
      "No. It combines Human Intelligence + AI Intelligence + Hiring Intelligence + Workflow Intelligence + Business Alignment + Candidate Experiences into better hiring outcomes.",
  },
  {
    question: "What should teams stop calling Huntlo?",
    answer:
      "Avoid framing Huntlo as only an AI recruiting platform, AI recruiter, recruitment automation software, or candidate sourcing software.",
  },
  {
    question: "What should teams start calling Huntlo?",
    answer:
      "AI Hiring Intelligence Infrastructure — powered by Agentic Hiring through AI Recruiting Agents — designed for Human + AI Hiring to deliver better hiring outcomes.",
  },
  {
    question: "How does Workflow Intelligence fit?",
    answer:
      "Workflow Intelligence helps hiring coordinate continuously around outcomes — so teams optimize velocity and confidence, not operational complexity alone.",
  },
  {
    question: "How does Interview Intelligence fit?",
    answer:
      "Interview Intelligence helps interviews create hiring confidence and better decisions as part of the broader Agentic Hiring system.",
  },
  {
    question: "How does Hiring Momentum Intelligence fit?",
    answer:
      "Hiring Momentum Intelligence keeps progress continuous — reducing stalls between discovery, conversations, workflows, and decisions.",
  },
  {
    question: "Is the future human or AI?",
    answer:
      "Neither alone. The future won't be human or AI — it will be Human + AI.",
  },
  {
    question: "What will define the next decade of hiring?",
    answer:
      "Agentic Hiring, Hiring Intelligence, Human + AI Collaboration, and better hiring outcomes — not ATS platforms, recruiting automation, or sourcing tools alone.",
  },
  {
    question: "How do I explore Agentic Hiring with Huntlo?",
    answer:
      "Book an enterprise demo, explore Huntlo on the platform, or continue through related category pages across discovery, conversation, workflow, and hiring intelligence.",
  },
  {
    question: "Where does Huntlo sit in this future?",
    answer:
      "Huntlo is building AI Hiring Intelligence Infrastructure for Agentic Hiring — so Human + AI teams can continuously move hiring toward better outcomes.",
  },
] as const;
