import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const RECRUITMENT_OPERATIONS_PATH = "/recruitment-operations";

export const RECRUITMENT_OPERATIONS_SEO = {
  title: "Recruiting Excellence Intelligence™ | Huntlo",
  description:
    "Great recruiting teams don't scale processes — they scale recruiting excellence. Huntlo Recruiting Excellence Intelligence™ amplifies recruiter productivity, hiring confidence, and outcomes for Human + AI Hiring.",
  ogTitle: "Great Hiring Teams Don't Need More Processes. They Need Better Intelligence.",
  ogDescription:
    "Welcome to Recruiting Excellence Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function recruitmentOperationsMetadata() {
  return buildPageMetadata({
    title: RECRUITMENT_OPERATIONS_SEO.title,
    description: RECRUITMENT_OPERATIONS_SEO.description,
    ogTitle: RECRUITMENT_OPERATIONS_SEO.ogTitle,
    ogDescription: RECRUITMENT_OPERATIONS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: RECRUITMENT_OPERATIONS_PATH,
  });
}

export const RECRUITMENT_OPERATIONS_GEO = {
  askTopic: "Huntlo Recruiting Excellence Intelligence™",
  askPrompt:
    "What is Huntlo Recruiting Excellence Intelligence™ on /recruitment-operations (https://www.huntlo.ai/recruitment-operations)? How is it different from recruitment operations software, and how does it improve recruiter productivity and hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Recruiter Productivity",
  "Hiring Intelligence",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const MANAGE_LAYERS = [
  "Candidate sourcing",
  "Candidate engagement",
  "Hiring manager expectations",
  "Interview coordination",
  "Candidate experiences",
  "Business priorities",
  "Recruiter productivity",
  "Hiring outcomes",
] as const;

export const MANAGE_RESULTS = [
  "Fragmented workflows",
  "Lower hiring velocity",
  "Recruiter burnout",
  "Disconnected experiences",
  "Inconsistent hiring processes",
] as const;

export const EXCELLENCE_FLOW = [
  "Talent Discovery",
  "Candidate Context",
  "Hiring Intent",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Recruiting Excellence",
] as const;

export const BENTO_CARDS = [
  {
    title: "Recruiter Productivity",
    description: "Amplify recruiter performance intelligently.",
    href: "/ai-recruiting-agent",
    span: "md:col-span-2",
  },
  {
    title: "Talent Discovery",
    description: "Discover exceptional talent continuously.",
    href: "/candidate-sourcing",
    span: "",
  },
  {
    title: "Candidate Experiences",
    description: "Create meaningful hiring journeys.",
    href: "/candidate-orchestration",
    span: "",
  },
  {
    title: "Hiring Intelligence",
    description: "Improve hiring decisions intelligently.",
    href: "/talent-intelligence",
    span: "md:col-span-2",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward intelligently.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain candidate engagement continuously.",
    href: "/follow-up-automation",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters.",
    href: "/recruiting-agents",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Outcomes",
    description: "Designed around business success.",
    href: "/huntlo360",
    span: "md:col-span-2",
  },
] as const;

export const TRADITIONAL_OPTIMIZES = [
  "Emails sent",
  "Interviews scheduled",
  "Outreach volume",
  "Recruiter utilization",
] as const;

export const FUTURE_OPTIMIZES = [
  "Hiring confidence",
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring outcomes",
  "Business alignment",
  "Talent quality",
] as const;

export const HUMAN_AI_EQUATION = [
  "Recruiters",
  "AI Recruiting Agents",
  "Workflow Intelligence",
  "Hiring Intelligence",
] as const;

export const INFRA_CHANGES = [
  "Hiring velocity",
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring outcomes",
  "Business success",
] as const;

export const STACK_TODAY = [
  "Recruitment operations",
  "Hiring processes",
  "Operational complexity",
  "Disconnected systems",
  "More software",
] as const;

export const STACK_TOMORROW = [
  "Recruiting Excellence Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Talent acquisition teams", href: "/solutions" },
  { label: "Recruiting leaders", href: "/solutions/enterprise-hiring" },
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Executive hiring teams", href: "/solutions/executive-search" },
  { label: "Global hiring teams", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "AI Native Hiring",
  "Compliance",
  "Scalability",
  "Workflow Intelligence",
  "Human + AI Hiring",
] as const;

export const FUTURE_NOT = [
  "Recruiting processes",
  "Recruitment operations",
  "Workflow management",
] as const;

export const FUTURE_YES = [
  "Recruiting Excellence Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const RECRUITMENT_OPERATIONS_FAQS = [
  {
    question: "What is Recruiting Excellence Intelligence™?",
    answer:
      "It is how recruiting teams continuously improve recruiter productivity, hiring confidence, velocity, candidate experiences, and business outcomes — instead of scaling processes and operational complexity.",
  },
  {
    question: "Is this recruitment operations software?",
    answer:
      "No. This page sells Recruiting Excellence Intelligence™ — not recruitment operations, hiring process tools, or operational management screens.",
  },
  {
    question: "Why do modern recruiting teams struggle?",
    answer:
      "Not because they lack hiring tools — because hiring becomes fragmented across conversations, workflows, systems, and stakeholders.",
  },
  {
    question: "What should great recruiting teams optimize?",
    answer:
      "Recruiter productivity, hiring confidence, hiring velocity, candidate experiences, and business outcomes — not processes, tools, and operational complexity alone.",
  },
  {
    question: "What does modern recruiting require?",
    answer:
      "Intelligence — not operational complexity from managing more sourcing, engagement, coordination, and priorities without a unifying layer.",
  },
  {
    question: "How does Recruiting Excellence Intelligence™ work?",
    answer:
      "Talent discovery flows into candidate context, hiring intent, conversation intelligence, workflow intelligence, confidence, outcomes, and recruiting excellence — continuously improving without leaders managing operational complexity.",
  },
  {
    question: "How is recruiter productivity becoming intelligence?",
    answer:
      "Traditional recruiting optimizes emails, interviews, outreach volume, and utilization. Future recruiting optimizes confidence, experiences, productivity, outcomes, alignment, and talent quality.",
  },
  {
    question: "Does AI replace recruiters?",
    answer:
      "No. AI amplifies recruiting excellence. Recruiters + AI Recruiting Agents + Workflow Intelligence + Hiring Intelligence create hiring outcomes.",
  },
  {
    question: "Is recruiting excellence becoming infrastructure?",
    answer:
      "Yes. Future recruiting leaders will ask how intelligently their hiring organization can continuously improve itself — not which recruitment operations software to buy.",
  },
  {
    question: "What does tomorrow's recruiting organization look like?",
    answer:
      "Recruiting Excellence Intelligence™ → Human + AI Hiring™ → Hiring Intelligence™ → Hiring Outcomes™ → AI Hiring Infrastructure™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Talent acquisition teams, recruiting leaders, enterprises, GCCs, staffing firms, executive hiring teams, and global hiring teams.",
  },
  {
    question: "What changes when excellence becomes infrastructure?",
    answer:
      "Hiring velocity, recruiter productivity, candidate experiences, hiring outcomes, and business success — everything intelligently connected.",
  },
  {
    question: "How does this relate to Huntlo?",
    answer:
      "Huntlo builds Recruiting Excellence Intelligence™ for Human + AI Hiring — amplifying recruiters through intelligence, workflows, and outcomes.",
  },
  {
    question: "How does this relate to Talent Operations?",
    answer:
      "Talent Operations positions Hiring Operations Intelligence™ for the enterprise. Recruitment Operations positions Recruiting Excellence Intelligence™ for recruiting leaders and teams.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is the category of Human + AI Hiring. Recruiting Excellence Intelligence™ is how recruiting organizations scale excellence inside that future.",
  },
  {
    question: "Did recruiting become operational?",
    answer:
      "Yes. Recruiting became operational. Hiring is becoming intelligence.",
  },
  {
    question: "What will the next generation optimize?",
    answer:
      "Recruiting Excellence Intelligence™, Human + AI Hiring™, Hiring Intelligence™, and Better Hiring Outcomes™ — not recruiting processes or workflow management alone.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Recruiting Excellence, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "Is this an ATS or KPI dashboard page?",
    answer:
      "No. This page strictly avoids ATS dashboards, recruiter KPI charts, operational management screens, kanban boards, and stock recruiter imagery.",
  },
  {
    question: "Can enterprises scale Recruiting Excellence Intelligence™?",
    answer:
      "Yes. Supporting enterprise governance, AI Native Hiring, compliance, scalability, Workflow Intelligence, and Human + AI Hiring.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great recruiting teams scale intelligence — and Huntlo owns Recruiting Excellence Intelligence™ for the future of Human + AI Hiring.",
  },
  {
    question: "What is the difference between processes and excellence?",
    answer:
      "Processes scale operational complexity. Excellence continuously improves recruiter productivity, confidence, experiences, and outcomes.",
  },
  {
    question: "Everything begins with Hiring Intelligence — why?",
    answer:
      "Because future recruiting measures confidence, experiences, productivity, outcomes, alignment, and talent quality — all grounded in Hiring Intelligence.",
  },
  {
    question: "Welcome to the future of recruiting excellence — what does that mean?",
    answer:
      "Organizations stop optimizing recruitment operations and start scaling Recruiting Excellence Intelligence™ for Human + AI Hiring.",
  },
] as const;
