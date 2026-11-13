import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const HIRING_WORKFLOWS_PATH = "/hiring-workflows";

export const HIRING_WORKFLOWS_SEO = {
  title: "Intelligent Hiring Workflows™ | Huntlo",
  description:
    "Hiring isn't slowed down by people — it's slowed down by workflows. Huntlo Intelligent Hiring Workflows™ continuously move hiring outcomes forward with Workflow Intelligence and Human + AI Hiring.",
  ogTitle: "Great Hiring Doesn't Follow Workflows. Great Workflows Continuously Improve Hiring Outcomes.",
  ogDescription:
    "Welcome to Intelligent Hiring Workflows™ — built for the future of Human + AI Hiring.",
} as const;

export function hiringWorkflowsMetadata() {
  return buildPageMetadata({
    title: HIRING_WORKFLOWS_SEO.title,
    description: HIRING_WORKFLOWS_SEO.description,
    ogTitle: HIRING_WORKFLOWS_SEO.ogTitle,
    ogDescription: HIRING_WORKFLOWS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: HIRING_WORKFLOWS_PATH,
  });
}

export const HIRING_WORKFLOWS_GEO = {
  askTopic: "Huntlo Intelligent Hiring Workflows™",
  askPrompt:
    "What are Huntlo Intelligent Hiring Workflows™ on /hiring-workflows (https://www.huntlo.ai/hiring-workflows)? How is Workflow Intelligence different from recruitment workflow automation, and how does it improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Candidate Discovery",
  "Hiring Intent",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_WORKFLOW = [
  "Candidate applied",
  "Recruiter reviews",
  "Email sent",
  "Interview scheduled",
  "Follow up",
  "Evaluation",
  "Offer shared",
  "Repeat",
] as const;

export const TRADITIONAL_PROBLEMS = [
  "Fragmented experiences",
  "Disconnected systems",
  "Recruiter fatigue",
  "Slower hiring cycles",
  "Poor candidate experiences",
] as const;

export const INTELLIGENT_FLOW = [
  "Candidate Context",
  "Hiring Intent",
  "Candidate Conversations",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Business Alignment",
  "Hiring Outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Talent Discovery",
    description: "Understand talent intelligently.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Context",
    description: "Continuously learn candidate signals.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Hiring Conversations",
    description: "Create meaningful engagement.",
    href: "/candidate-engagement",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Never lose exceptional talent.",
    href: "/follow-up-automation",
    span: "md:col-span-2",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward intelligently.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Improve hiring decisions continuously.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "AI Recruiting Agents",
    description: "Built around Human + AI hiring.",
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
  "Hiring Intent",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const RECRUITER_MANAGES = [
  "Follow-ups",
  "Candidate experiences",
  "Hiring coordination",
  "Workflow transitions",
  "Operational complexity",
] as const;

export const HUMAN_AI_EQUATION = [
  "People",
  "AI Intelligence",
  "Workflow Intelligence",
  "Hiring Intelligence",
] as const;

export const TRADITIONAL_METRICS = [
  "Emails sent",
  "Interviews scheduled",
  "Response rates",
  "Time to hire",
] as const;

export const MODERN_METRICS = [
  "Hiring confidence",
  "Talent quality",
  "Candidate experiences",
  "Hiring velocity",
  "Business outcomes",
  "Recruiter productivity",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Global hiring", href: "/solutions" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "High volume hiring", href: "/solutions/enterprise-hiring" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Workflow intelligence",
  "Compliance",
  "Scalability",
  "Human + AI Hiring",
  "Enterprise integrations",
] as const;

export const STACK_TODAY = [
  "Recruitment workflows",
  "Manual coordination",
  "Operational complexity",
  "Disconnected experiences",
  "More software",
] as const;

export const STACK_TOMORROW = [
  "Intelligent Hiring Workflows™",
  "Workflow Intelligence",
  "Human + AI Hiring",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const INFRA_CHANGES = [
  "Hiring velocity",
  "Recruiter productivity",
  "Hiring confidence",
  "Business outcomes",
  "Candidate experiences",
] as const;

export const FUTURE_YES = [
  "Intelligent Hiring Workflows™",
  "Human + AI Hiring",
  "Agentic Hiring™",
  "Better Hiring Outcomes™",
] as const;

export const HIRING_WORKFLOWS_FAQS = [
  {
    question: "What are Intelligent Hiring Workflows™?",
    answer:
      "Intelligent Hiring Workflows™ continuously move hiring outcomes forward through context, intent, conversations, Workflow Intelligence, momentum, alignment, and outcomes — without recruiters becoming workflow managers.",
  },
  {
    question: "How are they different from recruitment workflow automation?",
    answer:
      "Automation moves candidates between stages. Intelligent Hiring Workflows™ use Hiring Intelligence and Workflow Intelligence to improve outcomes — not just operational throughput.",
  },
  {
    question: "Is hiring slowed down by people or workflows?",
    answer:
      "By workflows. Teams struggle because hiring lives across disconnected tools, fragmented workflows, delayed conversations, and operational complexity.",
  },
  {
    question: "What is Workflow Intelligence?",
    answer:
      "Workflow Intelligence continuously learns from candidate signals, hiring intent, conversations, momentum, and confidence so hiring moves forward intelligently.",
  },
  {
    question: "Do recruiters still manage workflows manually?",
    answer:
      "They shouldn't. Modern recruiting shouldn't require continuous management of follow-ups, experiences, coordination, transitions, and operational complexity.",
  },
  {
    question: "What metrics matter for modern hiring workflows?",
    answer:
      "Hiring confidence, talent quality, candidate experiences, hiring velocity, business outcomes, and recruiter productivity — not only emails sent or interviews scheduled.",
  },
  {
    question: "How does this relate to Agentic Hiring™?",
    answer:
      "Intelligent Hiring Workflows™ are how Agentic Hiring™ and Human + AI Hiring continuously orchestrate momentum and outcomes.",
  },
  {
    question: "Can enterprises customize hiring workflows?",
    answer:
      "Yes. Built for enterprises, GCCs, technical, executive, global, staffing, agency, and high-volume hiring with governance, compliance, and integrations.",
  },
  {
    question: "What does tomorrow's workflow stack look like?",
    answer:
      "Intelligent Hiring Workflows™ → Workflow Intelligence → Human + AI Hiring → Hiring Outcomes → AI Hiring Infrastructure.",
  },
  {
    question: "Will future teams buy workflow automation software?",
    answer:
      "They'll ask how intelligently hiring can continuously move itself forward — changing velocity, productivity, confidence, outcomes, and experiences.",
  },
  {
    question: "How do AI Recruiting Agents fit?",
    answer:
      "AI Recruiting Agents operate within Human + AI Hiring to support discovery, conversations, workflows, and outcomes inside Intelligent Hiring Workflows™.",
  },
  {
    question: "Is this a Zapier-style workflow builder?",
    answer:
      "No. This page sells Workflow Intelligence and hiring outcomes — not automation diagrams, kanban boards, or ATS dashboards.",
  },
  {
    question: "What should workflows exist to do?",
    answer:
      "Not manage processes alone. Continuously improve hiring outcomes.",
  },
  {
    question: "How does Hiring Momentum fit?",
    answer:
      "Hiring Momentum keeps exceptional talent moving — so workflows don't stall between conversations, decisions, and outcomes.",
  },
  {
    question: "Who is this page for?",
    answer:
      "Enterprise leaders, TA teams, GCC leaders, staffing firms, agencies, and global hiring teams building Workflow Intelligence ownership.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Hiring Workflows, see Huntlo in action, or continue into Workflow Orchestration and Agentic Hiring™.",
  },
  {
    question: "How does this relate to Hiring OS?",
    answer:
      "Hiring OS is the operating system. Intelligent Hiring Workflows™ are how hiring continuously moves outcomes forward inside that system.",
  },
  {
    question: "Does AI replace hiring teams in workflows?",
    answer:
      "No. People + AI Intelligence + Workflow Intelligence + Hiring Intelligence create hiring outcomes. AI amplifies hiring teams.",
  },
  {
    question: "What belongs to the future?",
    answer:
      "Intelligent Hiring Workflows™, Human + AI Hiring, Agentic Hiring™, and Better Hiring Outcomes™.",
  },
  {
    question: "Why were traditional workflows never designed for modern hiring?",
    answer:
      "Applied → review → email → schedule → follow up → evaluate → offer → repeat creates fragmentation, fatigue, slower cycles, and poor experiences.",
  },
  {
    question: "What should modern hiring require?",
    answer:
      "Intelligence — not operational complexity.",
  },
  {
    question: "Where does Huntlo sit?",
    answer:
      "Huntlo builds Intelligent Hiring Workflows™ for Human + AI Hiring — connecting Workflow Intelligence to hiring outcomes.",
  },
  {
    question: "Is this thought leadership or a feature page?",
    answer:
      "Both commercially and categorically: Workflow Intelligence ownership and thought leadership for Intelligent Hiring Workflows™.",
  },
  {
    question: "How does this improve candidate experiences?",
    answer:
      "By keeping conversations, momentum, and coordination connected — reducing delays and fragmented journeys.",
  },
] as const;
