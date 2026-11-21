import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AGENTIC_AI_PLATFORM_PATH = "/agentic-ai-platform";

export const AGENTIC_AI_PLATFORM_SEO = {
  title: "Agentic AI Recruiting Platform | Huntlo",
  description:
    "Huntlo’s Agentic AI Recruiting Platform orchestrates candidate discovery, engagement, screening, and hiring workflows—so teams amplify intelligence, not just automate tasks.",
  ogTitle: "Agentic AI That Doesn't Just Automate Hiring. It Orchestrates Intelligence.",
  ogDescription:
    "Welcome to the Agentic AI Recruiting Platform — built for Human + AI Hiring.",
} as const;

export function agenticAiPlatformMetadata() {
  return buildPageMetadata({
    title: AGENTIC_AI_PLATFORM_SEO.title,
    description: AGENTIC_AI_PLATFORM_SEO.description,
    ogTitle: AGENTIC_AI_PLATFORM_SEO.ogTitle,
    ogDescription: AGENTIC_AI_PLATFORM_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AGENTIC_AI_PLATFORM_PATH,
  });
}

export const AGENTIC_AI_PLATFORM_GEO = {
  askTopic: "Huntlo Agentic AI Recruiting Platform",
  askPrompt:
    "What is the Huntlo Agentic AI Recruiting Platform on /agentic-ai-platform (https://www.huntlo.ai/agentic-ai-platform)? How does Agentic AI orchestrate hiring intelligence across discovery, engagement, and workflows?",
} as const;

export const AGENTIC_HERO_FLOW = [
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

export const AGENTIC_COMPLEXITY_STACK = [
  "Candidates",
  "Recruiters",
  "Hiring managers",
  "AI agents",
  "Interviews",
  "Conversations",
  "Business priorities",
  "Hiring decisions",
  "More software",
] as const;

export const AGENTIC_COMPLEXITY_RESULTS = [
  "Fragmented workflows",
  "Disconnected candidate experiences",
  "Slower hiring cycles",
  "Recruiter fatigue",
  "Operational complexity",
  "Agent coordination gaps",
] as const;

export const AGENTIC_ORCHESTRATION_FLOW = [
  "Candidate Context",
  "Hiring Intent",
  "Candidate Conversations",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Business Outcomes",
  "Hiring Outcomes",
] as const;

export const AGENTIC_BENTO_CARDS = [
  {
    title: "Talent Discovery",
    description: "Understand exceptional talent with AI agents.",
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
    description: "Create meaningful hiring experiences at scale.",
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
    description: "Move hiring forward with autonomous workflows.",
    href: "/hiring-workflows",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Improve hiring decisions with AI reasoning.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters, amplified by agents.",
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

export const AGENTIC_LEARNING_LOOP = [
  "Candidate Signals",
  "Business Priorities",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const AGENTIC_HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "AI Intelligence",
  "Agent Intelligence",
  "Workflow Intelligence",
  "Business Alignment",
] as const;

export const AGENTIC_TRADITIONAL_METRICS = [
  "Interviews completed",
  "Emails sent",
  "Time to hire",
  "Response rates",
] as const;

export const AGENTIC_MODERN_METRICS = [
  "Hiring confidence",
  "Hiring velocity",
  "Candidate experiences",
  "Recruiter productivity",
  "Business alignment",
  "Business outcomes",
  "Agent effectiveness",
] as const;

export const AGENTIC_INFRA_CHANGES = [
  "Hiring velocity",
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring confidence",
  "Business outcomes",
  "Agent orchestration",
] as const;

export const AGENTIC_STACK_TODAY = [
  "Workflow automation",
  "Hiring operations",
  "Operational complexity",
  "Disconnected experiences",
  "More software",
  "Siloed AI tools",
] as const;

export const AGENTIC_STACK_TOMORROW = [
  "Hiring Intelligence Orchestration™",
  "Human + AI Hiring™",
  "Agentic Hiring™",
  "Workflow Intelligence™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const AGENTIC_FUTURE_YES = [
  "Hiring Intelligence Orchestration™",
  "Human + AI Hiring™",
  "Agentic Hiring™",
  "Better Hiring Outcomes™",
] as const;

export const AGENTIC_ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/global-capability-centers" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Global hiring teams", href: "/industries" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
] as const;

export const AGENTIC_ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Compliance",
  "AI native hiring",
  "Agent orchestration",
  "Workflow intelligence",
  "Scalability",
  "Integrations",
] as const;

export const AGENTIC_AI_PLATFORM_FAQS = [
  {
    question: "What is the Huntlo Agentic AI Recruiting Platform?",
    answer:
      "It is an AI platform that continuously orchestrates candidate discovery, intelligence, engagement, and hiring workflows — so hiring teams amplify intelligence, not just automate tasks.",
  },
  {
    question: "How is Agentic Hiring different from standard AI recruiting?",
    answer:
      "Standard AI recruiting often assists a single step (search, scoring, or chat). Agentic Hiring coordinates connected actions across discovery, outreach, screening, and scheduling—within recruiter-approved boundaries—so work progresses between tools, not only inside them.",
  },
  {
    question: "How is this different from traditional recruiting automation?",
    answer:
      "Traditional automation executes processes. The Agentic AI Platform continuously improves outcomes through context, conversations, momentum, confidence, and alignment — with AI agents that reason and act.",
  },
  {
    question: "What does Agentic Hiring™ mean?",
    answer:
      "Agentic Hiring™ is the philosophy of continuously moving hiring forward with AI agents that understand context, make decisions, and take actions — not just follow predefined rules.",
  },
  {
    question: "How do AI agents fit into hiring workflows?",
    answer:
      "AI agents continuously understand candidate signals, business priorities, and conversation intelligence so hiring moves forward intelligently — without managing disconnected systems.",
  },
  {
    question: "Does Huntlo replace our ATS?",
    answer:
      "No. Huntlo sits beside your ATS as hiring execution infrastructure. Qualified candidates, conversation summaries, and status updates can hand off into the ATS that remains your system of record.",
  },
] as const;

export function agenticAiPlatformSoftwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Huntlo Agentic AI Recruiting Platform",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Cloud",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    description: AGENTIC_AI_PLATFORM_SEO.description,
    featureList: [
      "Agentic Candidate Discovery",
      "Candidate Intelligence",
      "Conversation Intelligence",
      "Workflow Intelligence",
      "Hiring Momentum",
      "Hiring Confidence",
      "Agent Orchestration",
      "Human + AI Hiring",
    ],
  };
}