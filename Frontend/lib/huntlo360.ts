import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const HUNTLO360_PATH = "/huntlo360";

export const HUNTLO360_SEO = {
  title: "Huntlo360 — Hiring Operating System | Huntlo",
  description:
    "Huntlo360 is the Hiring Operating System for Human + AI hiring — AI Hiring Intelligence Infrastructure that connects discovery, conversations, workflows, agents, and outcomes in one intelligent layer.",
  ogTitle: "Hiring Doesn't Need Another Tool. It Needs An Operating System.",
  ogDescription:
    "Welcome to Huntlo360 — the Hiring Operating System built for the future of Human + AI Hiring.",
} as const;

export function huntlo360Metadata() {
  return buildPageMetadata({
    title: HUNTLO360_SEO.title,
    description: HUNTLO360_SEO.description,
    ogTitle: HUNTLO360_SEO.ogTitle,
    ogDescription: HUNTLO360_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: HUNTLO360_PATH,
  });
}

export const HUNTLO360_GEO = {
  askTopic: "Huntlo360 Hiring Operating System",
  askPrompt:
    "What is Huntlo360 on /huntlo360 (https://www.huntlo.ai/huntlo360)? How is a Hiring Operating System different from an ATS or AI recruiting platform, and how does Huntlo360 deliver AI Hiring Intelligence Infrastructure for Agentic Hiring?",
} as const;

export const HERO_FLOW = [
  "Candidate Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Hiring Readiness",
  "Interview Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Huntlo360",
] as const;

export const TOOL_STACK = [
  "ATS",
  "Sourcing platforms",
  "Scheduling tools",
  "Email platforms",
  "Assessments",
  "Interview tools",
  "Analytics",
  "Automation",
  "More software",
] as const;

export const TOOL_RESULTS = [
  "Slower hiring",
  "Fragmented workflows",
  "Poor candidate experiences",
  "Operational complexity",
  "Lower recruiter productivity",
] as const;

export const HUNTLO360_COMBINES = [
  "Candidate Discovery",
  "Candidate Context Intelligence",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Interview Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "AI Recruiting Agents",
  "Hiring Outcomes",
] as const;

export const OS_WORKFLOWS = [
  {
    title: "Discover",
    description: "Source candidates intelligently.",
  },
  {
    title: "Understand",
    description: "Continuously understand candidate context.",
  },
  {
    title: "Engage",
    description: "Create meaningful candidate conversations.",
  },
  {
    title: "Evaluate",
    description: "Improve hiring confidence.",
  },
  {
    title: "Coordinate",
    description: "Intelligently orchestrate hiring workflows.",
  },
  {
    title: "Decide",
    description: "Create better hiring outcomes.",
  },
] as const;

export const INFRASTRUCTURE_FLOW = [
  "Candidates discovered",
  "Candidate intent understood",
  "Conversations intelligently created",
  "Hiring momentum maintained",
  "Interview workflows coordinated",
  "Hiring decisions continuously improved",
  "Business outcomes accelerated",
] as const;

export const HUMAN_AI_EQUATION = [
  "Recruiters",
  "AI Recruiting Agents",
  "Workflow Intelligence",
  "Hiring Intelligence",
  "Business Alignment",
] as const;

export const LEARNING_LOOP = [
  "Candidate Signals",
  "Hiring Intent",
  "Business Priorities",
  "Workflow Intelligence",
  "Candidate Experiences",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const ENTERPRISES_DONT_NEED = [
  "Another ATS",
  "Another sourcing tool",
  "Another automation platform",
  "Another scheduling tool",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Global hiring", href: "/solutions" },
  { label: "High volume hiring", href: "/solutions/enterprise-hiring" },
] as const;

export const STACK_TODAY = [
  "Multiple tools",
  "Multiple workflows",
  "Operational complexity",
  "Fragmented experiences",
] as const;

export const STACK_TOMORROW = [
  "One intelligence layer",
  "One Hiring Operating System",
  "Agentic Hiring",
  "Human + AI Hiring",
  "Better hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Candidate Discovery",
    description: "AI-powered talent discovery.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Intelligence",
    description: "Continuously understand talent.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Candidate Conversations",
    description: "Meaningful candidate engagement.",
    href: "/candidate-engagement",
    span: "",
  },
  {
    title: "Hiring Intelligence",
    description: "Better hiring decisions.",
    href: "/talent-intelligence",
    span: "md:col-span-2",
  },
  {
    title: "Workflow Intelligence",
    description: "Intelligent hiring orchestration.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "AI Recruiting Agents",
    description: "Human + AI hiring.",
    href: "/recruiting-agents",
    span: "",
  },
  {
    title: "Enterprise Infrastructure",
    description: "Built to scale globally.",
    href: "/ai-hiring-infrastructure",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Outcomes",
    description: "Designed around business outcomes.",
    href: "/agentic-hiring",
    span: "md:col-span-2",
  },
] as const;

export const BUILT_FOR_TEAMS = [
  { label: "CHROs", href: "/solutions/enterprise-hiring" },
  { label: "Talent Acquisition teams", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Founders", href: "/solutions/startups" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Global hiring teams", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Integrations",
  "Scalability",
  "Compliance",
  "Recruiter productivity",
  "AI workflows",
] as const;

export const FUTURE_NOT = [
  "ATS platforms",
  "Recruiting automation",
  "Disconnected workflows",
] as const;

export const FUTURE_YES = [
  "Agentic Hiring",
  "Hiring Intelligence",
  "Human + AI Collaboration",
  "Better Hiring Outcomes",
] as const;

export const HUNTLO360_FAQS = [
  {
    question: "What is Huntlo360?",
    answer:
      "Huntlo360 is Huntlo's Hiring Operating System — AI Hiring Intelligence Infrastructure that connects discovery, context, conversations, readiness, interviews, workflows, momentum, AI Recruiting Agents, and hiring outcomes in one intelligent layer.",
  },
  {
    question: "How is Huntlo360 different from an ATS?",
    answer:
      "An ATS organizes records and processes. Huntlo360 is an operating system for hiring intelligence — continuously moving hiring forward across discovery, conversations, workflows, and outcomes rather than adding another system of record.",
  },
  {
    question: "What is a Hiring Operating System?",
    answer:
      "A Hiring Operating System unifies how hiring moves — from Candidate Discovery through conversations, confidence, interviews, workflows, and outcomes — so teams operate on intelligence instead of 15 disconnected tools.",
  },
  {
    question: "Can Huntlo replace multiple hiring tools?",
    answer:
      "Huntlo360 reduces fragmentation by combining the intelligence and orchestration layer across discovery, engagement, evaluation, coordination, and decisions — so teams spend less time switching tabs and more time hiring.",
  },
  {
    question: "What is AI Hiring Intelligence Infrastructure?",
    answer:
      "It is the connected layer beneath Agentic Hiring — combining candidate context, conversations, readiness, confidence, interviews, workflows, momentum, agents, and business alignment into hiring outcomes.",
  },
  {
    question: "How do AI Recruiting Agents work?",
    answer:
      "AI Recruiting Agents help discovery, conversations, workflows, interviews, and decisions move forward continuously — amplifying hiring teams within Human + AI Hiring rather than replacing recruiters.",
  },
  {
    question: "Can Huntlo support enterprise hiring?",
    answer:
      "Yes. Huntlo360 is built for enterprise, GCC, technical, executive, global, and high-volume hiring with governance, integrations, scalability, and compliance in mind.",
  },
  {
    question: "Can enterprises customize hiring workflows?",
    answer:
      "Yes. Teams can operate connected workflows through one intelligence layer while supporting enterprise governance, integrations, and multi-stakeholder hiring.",
  },
  {
    question: "Is Huntlo360 another AI recruiting platform?",
    answer:
      "No. Huntlo360 is positioned as a Hiring Operating System and AI Hiring Intelligence Infrastructure for Agentic Hiring — not a feature stack of sourcing + outreach + scheduling alone.",
  },
  {
    question: "Does Huntlo replace recruiters?",
    answer:
      "No. Huntlo doesn't replace recruiters. It amplifies hiring teams through Human + AI Hiring — recruiters + AI Recruiting Agents + workflow and hiring intelligence aligned to outcomes.",
  },
  {
    question: "What problem does Huntlo360 solve?",
    answer:
      "Modern teams suffer from fragmented hiring workflows across multiple platforms, disconnected conversations, and operational complexity — not a simple talent shortage.",
  },
  {
    question: "How does Huntlo360 relate to Agentic Hiring?",
    answer:
      "Huntlo360 is the operating system for Agentic Hiring — where intelligent systems and humans collaborate so hiring continuously moves toward better outcomes.",
  },
  {
    question: "What workflows does one operating system cover?",
    answer:
      "Discover, Understand, Engage, Evaluate, Coordinate, and Decide — every hiring workflow intelligently connected.",
  },
  {
    question: "Is Huntlo360 the same as Hiring OS?",
    answer:
      "Huntlo360 is the commercial product narrative for Huntlo's Hiring Operating System. Related category pages deepen Agentic Hiring, infrastructure, and intelligence layers that ladder into Huntlo360.",
  },
  {
    question: "Who is Huntlo360 built for?",
    answer:
      "CHROs, VP Talent Acquisition, founders, GCC leaders, recruitment agencies, enterprise leaders, technical hiring teams, and staffing firms.",
  },
  {
    question: "Will hiring stay software-heavy?",
    answer:
      "Hiring has become software heavy. It needs to become intelligence driven — one intelligence layer instead of more disconnected tools.",
  },
  {
    question: "What does tomorrow's hiring stack look like?",
    answer:
      "One intelligence layer → one Hiring Operating System → Agentic Hiring → Human + AI Hiring → better hiring outcomes.",
  },
  {
    question: "How does Huntlo360 improve recruiter productivity?",
    answer:
      "By reducing operational complexity and fragmented workflows — so recruiters aren't workflow managers and hiring momentum stays continuous.",
  },
  {
    question: "How does Huntlo360 improve candidate experiences?",
    answer:
      "Conversations, momentum, and workflows stay connected — reducing delays, confusion, and disconnected hiring journeys.",
  },
  {
    question: "Does Huntlo360 include Candidate Discovery?",
    answer:
      "Yes. Candidate Discovery is part of the Huntlo360 intelligence layer, connected to context, conversations, readiness, and outcomes.",
  },
  {
    question: "Does Huntlo360 include Workflow Intelligence?",
    answer:
      "Yes. Workflow Intelligence helps orchestrate hiring continuously so outcomes move forward without tab-switching chaos.",
  },
  {
    question: "Does Huntlo360 include Interview Intelligence?",
    answer:
      "Yes. Interview workflows and confidence are part of the connected operating system — not a disconnected interview tool.",
  },
  {
    question: "Is Huntlo360 built for GCCs and global hiring?",
    answer:
      "Yes. It supports GCC hiring, global hiring teams, and enterprise-scale operations with governance and integrations.",
  },
  {
    question: "Can staffing firms and agencies use Huntlo360?",
    answer:
      "Yes. Recruitment agencies and staffing firms can operate connected hiring intelligence across client and high-volume needs.",
  },
  {
    question: "How does Huntlo360 never stop learning?",
    answer:
      "It continuously understands candidate signals, hiring intent, business priorities, workflow intelligence, experiences, confidence, outcomes, and recruiter productivity.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That Huntlo is the intelligence and orchestration layer powering the future of Human + AI hiring — not another AI recruiting feature collection.",
  },
  {
    question: "How does Huntlo360 ladder from other Huntlo pages?",
    answer:
      "Pages across discovery, conversation, readiness, interview, workflow, momentum, agents, and Agentic Hiring culminate in Huntlo360 as the unified Hiring Operating System.",
  },
  {
    question: "What is commercial intent for Huntlo360?",
    answer:
      "This page is designed for demo conversions and enterprise positioning — the highest-intent commercial narrative for Huntlo.",
  },
  {
    question: "Do enterprises need another sourcing or scheduling tool?",
    answer:
      "No. Modern enterprises need AI Hiring Intelligence Infrastructure — not another ATS, sourcing tool, automation platform, or scheduling tool alone.",
  },
  {
    question: "What defines the next generation of hiring?",
    answer:
      "Agentic Hiring, Hiring Intelligence, Human + AI Collaboration, and better hiring outcomes — not ATS platforms, recruiting automation, or disconnected workflows.",
  },
  {
    question: "How do I get started with Huntlo360?",
    answer:
      "Book an enterprise demo, explore Huntlo360 on this page, see Huntlo in action, or continue into Agentic Hiring and AI Hiring Infrastructure.",
  },
  {
    question: "Where does Huntlo360 sit in Huntlo's positioning?",
    answer:
      "AI Hiring Intelligence Infrastructure → Agentic Hiring → Human + AI Hiring → Hiring Operating System → Huntlo360.",
  },
] as const;
