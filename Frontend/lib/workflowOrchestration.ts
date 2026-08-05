import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const WORKFLOW_ORCHESTRATION_PATH = "/workflow-orchestration";

export const WORKFLOW_ORCHESTRATION_SEO = {
  title: "Hiring Intelligence Orchestration™ | Huntlo",
  description:
    "Hiring doesn't need better workflows — it needs better intelligence. Huntlo Hiring Intelligence Orchestration™ continuously connects people, context, conversations, workflows, and outcomes for Human + AI Hiring.",
  ogTitle: "Great Hiring Doesn't Orchestrate Tasks. It Orchestrates Intelligence.",
  ogDescription:
    "Welcome to Hiring Intelligence Orchestration™ — built for the future of Human + AI Hiring.",
} as const;

export function workflowOrchestrationMetadata() {
  return buildPageMetadata({
    title: WORKFLOW_ORCHESTRATION_SEO.title,
    description: WORKFLOW_ORCHESTRATION_SEO.description,
    ogTitle: WORKFLOW_ORCHESTRATION_SEO.ogTitle,
    ogDescription: WORKFLOW_ORCHESTRATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: WORKFLOW_ORCHESTRATION_PATH,
  });
}

export const WORKFLOW_ORCHESTRATION_GEO = {
  askTopic: "Huntlo Hiring Intelligence Orchestration™",
  askPrompt:
    "What is Huntlo Hiring Intelligence Orchestration™ on /workflow-orchestration (https://www.huntlo.ai/workflow-orchestration)? How is Workflow Intelligence different from workflow automation, and how does it improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Candidate Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const COMPLEXITY_STACK = [
  "Candidates",
  "Recruiters",
  "Hiring managers",
  "Interviews",
  "Conversations",
  "Business priorities",
  "Hiring decisions",
  "More software",
] as const;

export const COMPLEXITY_RESULTS = [
  "Fragmented workflows",
  "Disconnected candidate experiences",
  "Slower hiring cycles",
  "Recruiter fatigue",
  "Operational complexity",
] as const;

export const ORCHESTRATION_FLOW = [
  "Candidate Context",
  "Hiring Intent",
  "Candidate Conversations",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Business Outcomes",
  "Hiring Outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Talent Discovery",
    description: "Understand exceptional talent.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Intelligence",
    description: "Continuously understand candidate signals.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create meaningful hiring experiences.",
    href: "/candidate-engagement",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain candidate engagement intelligently.",
    href: "/follow-up-automation",
    span: "md:col-span-2",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward intelligently.",
    href: "/hiring-workflows",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Improve hiring decisions continuously.",
    href: "/screening-engine",
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

export const LEARNING_LOOP = [
  "Candidate Signals",
  "Business Priorities",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "AI Intelligence",
  "Workflow Intelligence",
  "Business Alignment",
] as const;

export const TRADITIONAL_METRICS = [
  "Interviews completed",
  "Emails sent",
  "Time to hire",
  "Response rates",
] as const;

export const MODERN_METRICS = [
  "Hiring confidence",
  "Hiring velocity",
  "Candidate experiences",
  "Recruiter productivity",
  "Business alignment",
  "Business outcomes",
] as const;

export const INFRA_CHANGES = [
  "Hiring velocity",
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring confidence",
  "Business outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Compliance",
  "AI native hiring",
  "Workflow intelligence",
  "Scalability",
  "Integrations",
] as const;

export const STACK_TODAY = [
  "Workflow automation",
  "Hiring operations",
  "Operational complexity",
  "Disconnected experiences",
  "More software",
] as const;

export const STACK_TOMORROW = [
  "Hiring Intelligence Orchestration™",
  "Human + AI Hiring™",
  "Workflow Intelligence™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_YES = [
  "Hiring Intelligence Orchestration™",
  "Human + AI Hiring™",
  "Agentic Hiring™",
  "Better Hiring Outcomes™",
] as const;

export const WORKFLOW_ORCHESTRATION_FAQS = [
  {
    question: "What is Hiring Intelligence Orchestration™?",
    answer:
      "It is how hiring continuously connects people, context, conversations, workflows, and business outcomes — so organizations orchestrate intelligence, not just tasks.",
  },
  {
    question: "How is this different from workflow automation?",
    answer:
      "Workflow automation executes processes. Hiring Intelligence Orchestration™ continuously improves outcomes through context, conversations, momentum, confidence, and alignment.",
  },
  {
    question: "Does hiring need better workflows or better intelligence?",
    answer:
      "Better intelligence. Organizations struggle because experiences, conversations, priorities, and decisions remain disconnected — not because workflows don't exist.",
  },
  {
    question: "What should great hiring orchestrate?",
    answer:
      "People, context, conversations, workflows, and business outcomes — not only interviews, reminders, and hiring stages.",
  },
  {
    question: "What is Workflow Intelligence™?",
    answer:
      "Workflow Intelligence™ continuously learns from candidate signals, priorities, conversations, momentum, and confidence so hiring moves forward intelligently.",
  },
  {
    question: "Do teams still manage disconnected systems?",
    answer:
      "They shouldn't. Hiring Intelligence Orchestration™ means no managing fragmented workflows and no coordinating disconnected systems — everything continuously improving.",
  },
  {
    question: "How does Human + AI Hiring fit?",
    answer:
      "Human Intelligence + AI Intelligence + Workflow Intelligence + Business Alignment create hiring outcomes. AI amplifies hiring intelligence — it doesn't replace hiring teams.",
  },
  {
    question: "Is Hiring Intelligence becoming infrastructure?",
    answer:
      "Yes. Future organizations will ask how intelligently hiring can continuously improve itself — not which workflow automation software to buy.",
  },
  {
    question: "What metrics matter now?",
    answer:
      "Hiring confidence, velocity, candidate experiences, recruiter productivity, business alignment, and business outcomes — not only interviews completed or emails sent.",
  },
  {
    question: "What does tomorrow's orchestration stack look like?",
    answer:
      "Hiring Intelligence Orchestration™ → Human + AI Hiring™ → Workflow Intelligence™ → Hiring Outcomes™ → AI Hiring Infrastructure™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, staffing firms, recruitment agencies, global hiring teams, technical hiring, and executive hiring.",
  },
  {
    question: "Is this a Zapier or ATS workflow builder?",
    answer:
      "No. This page sells Hiring Intelligence Orchestration™ — not automation builders, kanban boards, or ATS dashboards.",
  },
  {
    question: "How does this relate to Intelligent Hiring Workflows™?",
    answer:
      "Hiring Workflows is the workflow ownership narrative. Workflow Orchestration / Hiring Intelligence Orchestration™ is the deeper category of continuously orchestrating intelligence across hiring.",
  },
  {
    question: "How does this relate to Agentic Hiring™?",
    answer:
      "Agentic Hiring™ is the philosophy of continuously moving hiring forward. Orchestration is how intelligence, conversations, and workflows stay connected to outcomes.",
  },
  {
    question: "Can enterprises run this with governance?",
    answer:
      "Yes. Supporting enterprise governance, compliance, AI-native hiring, Workflow Intelligence, scalability, and integrations.",
  },
  {
    question: "What will define the next decade?",
    answer:
      "Organizations won't automate hiring alone — they'll intelligently orchestrate it through Hiring Intelligence Orchestration™, Human + AI Hiring™, Agentic Hiring™, and Better Hiring Outcomes™.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Workflow Intelligence, see Huntlo in action, or continue into Agentic Hiring™ and AI Hiring Infrastructure.",
  },
  {
    question: "Does orchestration stop learning?",
    answer:
      "No. It continuously understands candidate signals, business priorities, conversation intelligence, workflow intelligence, momentum, confidence, and outcomes.",
  },
  {
    question: "Why has hiring become increasingly complex?",
    answer:
      "Organizations manage candidates, recruiters, managers, interviews, conversations, priorities, decisions, and more software — making hiring workflow heavy instead of intelligence native.",
  },
  {
    question: "What belongs to the future?",
    answer:
      "Outcome intelligence — not process intelligence alone.",
  },
  {
    question: "Where does Huntlo sit?",
    answer:
      "Huntlo builds Hiring Intelligence Orchestration™ for Human + AI Hiring — connecting Workflow Intelligence to hiring outcomes.",
  },
  {
    question: "Should workflows merely execute processes?",
    answer:
      "No. They should intelligently improve outcomes.",
  },
  {
    question: "Is this category creation?",
    answer:
      "Yes. /workflow-orchestration creates Hiring Intelligence Orchestration™ as Workflow Intelligence ownership and thought leadership.",
  },
  {
    question: "How does Conversation Intelligence fit?",
    answer:
      "Conversation Intelligence keeps hiring experiences meaningful while orchestration connects those conversations to momentum, confidence, and outcomes.",
  },
] as const;
