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
    question: "Does hiring need another platform?",
    answer:
      "No. Modern teams don't struggle because they lack recruiting software — they struggle because hiring lives across fragmented tools and disconnected workflows. They need an operating system.",
  },
  {
    question: "How does Hiring OS relate to AI Hiring Intelligence Infrastructure?",
    answer:
      "Infrastructure is the category layer. Hiring OS is how that intelligence operates day to day — discovery, conversations, workflows, confidence, and outcomes continuously connected.",
  },
  {
    question: "What is Human + AI Hiring inside Hiring OS?",
    answer:
      "Recruiters + AI Recruiting Agents + Workflow Intelligence + Hiring Intelligence + Business Alignment creating hiring outcomes. AI amplifies hiring intelligence — it doesn't replace hiring teams.",
  },
  {
    question: "What is Agentic Hiring?",
    answer:
      "Agentic Hiring continuously moves agents, discovery, conversations, workflows, confidence, and outcomes forward — everything continuously learning within Human + AI Hiring.",
  },
  {
    question: "Will future organizations ask which ATS to buy?",
    answer:
      "They'll ask how intelligently hiring can continuously improve itself — changing velocity, productivity, experiences, and business outcomes.",
  },
  {
    question: "Is Hiring OS the same as Huntlo360?",
    answer:
      "Hiring OS is the category narrative for the AI Native operating system. Huntlo360 is the commercial product expression of that operating system.",
  },
  {
    question: "Can enterprises run Hiring OS at scale?",
    answer:
      "Yes. Built for enterprises, GCCs, technical, executive, global, staffing, agency, and high-volume hiring with governance, compliance, integrations, and scalability.",
  },
  {
    question: "What does tomorrow's enterprise hiring stack look like?",
    answer:
      "One operating system → AI Hiring Intelligence → Human + AI Hiring → Hiring Outcomes → Huntlo.",
  },
  {
    question: "Is modern hiring automation driven or intelligence native?",
    answer:
      "Intelligence native. Future hiring requires people, relationships, context, intelligence, and business outcomes — through a Hiring Operating System and AI Hiring Infrastructure.",
  },
  {
    question: "Who is Hiring OS built for?",
    answer:
      "Enterprise leaders, CHROs, VP Talent Acquisition, GCC leaders, technical hiring teams, staffing firms, recruitment agencies, and global hiring teams.",
  },
  {
    question: "Does Hiring OS include Candidate Discovery?",
    answer:
      "Yes. Discover talent, understand context, create conversations, move hiring forward, improve decisions, and connect agents to outcomes — all inside one OS.",
  },
  {
    question: "Does Hiring OS stop learning?",
    answer:
      "No. It continuously understands candidate context, hiring intent, conversation intelligence, workflow intelligence, confidence, outcomes, and business priorities.",
  },
  {
    question: "How do I get started with Hiring OS?",
    answer:
      "Book an enterprise demo, explore Hiring OS on this page, see Huntlo in action, or continue into Agentic Hiring and AI Hiring Intelligence Infrastructure.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That Huntlo is the AI Native Hiring Operating System for Human + AI Hiring — not another recruitment platform.",
  },
  {
    question: "Will organizations win with more recruiting software?",
    answer:
      "No. The next decade belongs to organizations with Hiring Intelligence, Human + AI Hiring, Agentic Hiring, and better hiring outcomes.",
  },
  {
    question: "Can Hiring OS reduce operational complexity?",
    answer:
      "Yes. No switching tools, no managing fragmented workflows, no disconnected experiences — everything intelligently connected.",
  },
  {
    question: "How does Workflow Intelligence fit?",
    answer:
      "Workflow Intelligence helps hiring move forward continuously inside the OS — so teams optimize outcomes rather than operational complexity.",
  },
  {
    question: "How does this relate to AI Recruiting Agents?",
    answer:
      "AI Recruiting Agents operate within Hiring OS to support discovery, conversations, workflows, confidence, and outcomes as part of Human + AI Hiring.",
  },
  {
    question: "Is this page for enterprise conversion?",
    answer:
      "Yes. /hiring-os is designed for highest enterprise conversion, Hiring OS ownership, commercial intent, and demo bookings.",
  },
  {
    question: "Where does Huntlo sit in this future?",
    answer:
      "Welcome to the AI Native Hiring Operating System. Welcome to Huntlo.",
  },
  {
    question: "Does AI replace hiring teams in Hiring OS?",
    answer:
      "No. AI amplifies hiring intelligence. Humans remain central to relationships, judgment, and decisions.",
  },
  {
    question: "What powers the future of hiring?",
    answer:
      "Not more platforms, automation, or dashboards — but intelligence, conversations, workflows, and outcomes.",
  },
] as const;
