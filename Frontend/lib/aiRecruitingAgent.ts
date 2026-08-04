import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_AGENT_PATH = "/ai-recruiting-agent";

export const AI_RECRUITING_AGENT_SEO = {
  title: "AI Hiring Intelligence Agents™ | Human + AI Hiring | Huntlo",
  description:
    "Hiring isn't becoming automated — it's becoming agentic. Huntlo AI Hiring Intelligence Agents™ power Human + AI Hiring™, Agentic Hiring™, and AI Hiring Infrastructure™ for exceptional outcomes.",
  ogTitle: "Hiring Isn't Becoming Automated. It's Becoming Agentic.",
  ogDescription:
    "Welcome to AI Hiring Intelligence Agents™ — Huntlo's Human + AI Hiring narrative for the future of hiring.",
} as const;

export function aiRecruitingAgentMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_AGENT_SEO.title,
    description: AI_RECRUITING_AGENT_SEO.description,
    ogTitle: AI_RECRUITING_AGENT_SEO.ogTitle,
    ogDescription: AI_RECRUITING_AGENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_AGENT_PATH,
  });
}

export const AI_RECRUITING_AGENT_GEO = {
  askTopic: "Huntlo AI Hiring Intelligence Agents™",
  askPrompt:
    "What are Huntlo AI Hiring Intelligence Agents™ on /ai-recruiting-agent (https://www.huntlo.ai/ai-recruiting-agent)? How do they differ from AI recruiters, and how do they enable Human + AI Hiring™ and Agentic Hiring™?",
} as const;

export const HERO_FLOW = [
  "Hiring Intelligence",
  "Candidate Discovery",
  "Talent Intelligence",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const AGENT_CARDS = [
  {
    title: "AI Discovery Agents™",
    description: "Discover exceptional talent intelligently.",
    href: "/ai-sourcing-agent",
    span: "md:col-span-2",
  },
  {
    title: "AI Conversation Agents™",
    description: "Create meaningful candidate experiences.",
    href: "/ai-outreach-agent",
    span: "",
  },
  {
    title: "AI Hiring Agents™",
    description: "Improve hiring confidence continuously.",
    href: "/ai-screening-agent",
    span: "",
  },
  {
    title: "AI Workflow Agents™",
    description: "Move hiring intelligently.",
    href: "/ai-scheduling-agent",
    span: "md:col-span-2",
  },
  {
    title: "AI Intelligence Agents™",
    description: "Continuously understand talent.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "AI Momentum Agents™",
    description: "Maintain candidate engagement continuously.",
    href: "/follow-up-automation",
    span: "",
  },
  {
    title: "AI Confidence Agents™",
    description: "Improve hiring outcomes intelligently.",
    href: "/screening-engine",
    span: "md:col-span-2",
  },
  {
    title: "Human + AI Hiring™",
    description: "Built around recruiters.",
    href: "/agentic-hiring",
    span: "md:col-span-2",
  },
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "AI Intelligence",
  "Hiring Intelligence",
  "Workflow Intelligence",
  "Conversation Intelligence",
] as const;

export const LEARNING_LOOP = [
  "Candidate Intent",
  "Talent Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Business Outcomes",
  "Huntlo",
] as const;

export const NEVER_SLEEP_SIGNALS = [
  "Candidate Intent",
  "Hiring Intent",
  "Conversation Readiness",
  "Talent Signals",
  "Hiring Momentum",
  "Candidate Experiences",
  "Business Priorities",
  "Hiring Outcomes",
] as const;

export const NEVER_SLEEP_ACROSS = [
  "Hiring workflows",
  "Conversations",
  "Candidate experiences",
  "Talent discovery",
  "Enterprise hiring operations",
] as const;

export const INTELLIGENCE_LAYER = [
  {
    title: "Talent Discovery™",
    description: "Discover exceptional talent.",
    href: "/talent-discovery",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Intelligence™",
    description: "Understand talent continuously.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Conversation Intelligence™",
    description: "Create meaningful experiences.",
    href: "/outreach-engine",
    span: "",
  },
  {
    title: "Hiring Confidence™",
    description: "Improve hiring decisions.",
    href: "/screening-engine",
    span: "md:col-span-2",
  },
  {
    title: "Workflow Intelligence™",
    description: "Move hiring intelligently.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "Capability Intelligence™",
    description: "Understand candidate capabilities.",
    href: "/assessment-engine",
    span: "",
  },
  {
    title: "Interview Intelligence™",
    description: "Improve hiring outcomes.",
    href: "/interview-orchestration",
    span: "md:col-span-2",
  },
  {
    title: "Human + AI Hiring™",
    description: "Built around people.",
    href: "/agentic-hiring",
    span: "md:col-span-2",
  },
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Fortune 500", href: "/solutions/enterprise-hiring" },
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Global Hiring Teams", href: "/solutions" },
  { label: "Staffing Firms", href: "/solutions/staffing-agencies" },
  { label: "Executive Hiring", href: "/solutions/executive-search" },
  { label: "Technical Hiring", href: "/solutions/startups" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Compliance",
  "AI Native Hiring",
  "Enterprise Intelligence",
  "Scalability",
  "Integrations",
] as const;

export const STACK_TODAY = [
  "Recruiters",
  "Recruitment software",
  "Hiring operations",
  "Operational complexity",
  "Hiring",
] as const;

export const STACK_TOMORROW = [
  "Human + AI Hiring™",
  "AI Hiring Intelligence Agents™",
  "Hiring Intelligence™",
  "Agentic Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const INFRA_NOT = [
  "Recruiter utilization",
  "Hiring processes",
  "Operational complexity",
  "Recruitment software",
] as const;

export const INFRA_YES = [
  "Hiring intelligence",
  "Candidate experiences",
  "Hiring confidence",
  "Hiring outcomes",
  "Recruiter productivity",
  "Business success",
] as const;

export const FUTURE_NOT = [
  "Recruiting software",
  "Hiring operations",
  "Recruitment automation",
] as const;

export const FUTURE_YES = [
  "AI Hiring Intelligence Agents™",
  "Human + AI Hiring™",
  "Agentic Hiring™",
  "Better Hiring Outcomes™",
] as const;

export const AI_RECRUITING_AGENT_FAQS = [
  {
    question: "What are AI Hiring Intelligence Agents™?",
    answer:
      "They are how Human Intelligence and Artificial Intelligence continuously work together across discovery, conversations, workflows, confidence, momentum, and outcomes — not AI recruiters replacing people.",
  },
  {
    question: "How is Huntlo different from AI recruiting software?",
    answer:
      "AI recruiting software often sells automation or AI recruiters. Huntlo sells AI Hiring Intelligence Agents™, Human + AI Hiring™, Agentic Hiring™, and AI Hiring Infrastructure™.",
  },
  {
    question: "Does Huntlo replace human recruiters?",
    answer:
      "No. The future of hiring won't be defined by AI recruiters replacing humans. It will be defined by Human + AI Hiring™ creating exceptional outcomes together.",
  },
  {
    question: "What is Agentic Hiring™?",
    answer:
      "Agentic Hiring™ is hiring that continuously understands talent, orchestrates workflows, improves confidence, and accelerates outcomes — powered by AI Hiring Intelligence Agents™.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Future organizations won't choose humans or artificial intelligence. They'll choose Human + AI Hiring™ — continuous collaboration for better hiring outcomes.",
  },
  {
    question: "How do AI Discovery Agents™ work?",
    answer:
      "AI Discovery Agents™ discover exceptional talent intelligently — connecting intent and talent signals into Candidate Discovery and Talent Intelligence.",
  },
  {
    question: "How do AI Conversation Agents™ work?",
    answer:
      "AI Conversation Agents™ create meaningful candidate experiences through Conversation Intelligence™ — not bulk messaging automation.",
  },
  {
    question: "How do AI Workflow Agents™ work?",
    answer:
      "AI Workflow Agents™ move hiring intelligently through Workflow Intelligence™ — reducing operational complexity without recruiter micromanagement.",
  },
  {
    question: "Do AI Hiring Intelligence Agents sleep?",
    answer:
      "No. They continuously understand candidate intent, hiring intent, readiness, talent signals, momentum, experiences, priorities, and outcomes — 24/7 across hiring operations.",
  },
  {
    question: "What is the one intelligence layer?",
    answer:
      "One Intelligence Layer spanning Talent Discovery™, Candidate Intelligence™, Conversation Intelligence™, Hiring Confidence™, Workflow Intelligence™, Capability Intelligence™, Interview Intelligence™, and Human + AI Hiring™.",
  },
  {
    question: "Is this AI automation?",
    answer:
      "No. This page sells AI Hiring Intelligence Agents™ and Agentic Hiring™ — not AI automation diagrams, robots, or recruiter replacement narratives.",
  },
  {
    question: "How does this relate to Agentic Hiring /agentic-hiring?",
    answer:
      "/agentic-hiring owns the Human + AI Hiring category narrative. /ai-recruiting-agent is Huntlo's flagship page for AI Hiring Intelligence Agents™.",
  },
  {
    question: "How does this relate to AI Hiring Infrastructure?",
    answer:
      "AI Hiring Intelligence Agents™ are how organizations experience the infrastructure layer — connecting agents to Hiring Outcomes™ and AI Hiring Infrastructure™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Fortune 500, enterprises, GCCs, global hiring teams, staffing firms, executive hiring, and technical hiring.",
  },
  {
    question: "What does enterprise ready include?",
    answer:
      "Governance, compliance, AI native hiring, Enterprise Intelligence, scalability, and integrations.",
  },
  {
    question: "What is the future hiring stack?",
    answer:
      "Today: recruiters → recruitment software → hiring operations → operational complexity → hiring. Tomorrow: Human + AI Hiring™ → AI Hiring Intelligence Agents™ → Hiring Intelligence™ → Agentic Hiring™ → Hiring Outcomes™ → AI Hiring Infrastructure™.",
  },
  {
    question: "Hiring intelligence is becoming infrastructure — what does that mean?",
    answer:
      "Organizations that define the next decade won't optimize recruiter utilization and recruitment software. They'll optimize intelligence, experiences, confidence, outcomes, productivity, and business success.",
  },
  {
    question: "Recruitment became software. Hiring is becoming intelligence — explain?",
    answer:
      "The next generation won't build recruiting software and automation. They'll build AI Hiring Intelligence Agents™, Human + AI Hiring™, Agentic Hiring™, and better hiring outcomes.",
  },
  {
    question: "Does Agentic Hiring never stop learning?",
    answer:
      "Yes. From candidate intent through discovery, context, conversations, workflows, momentum, confidence, and business outcomes — everything continuously improving into Huntlo.",
  },
  {
    question: "No recruiter micromanagement — what does that mean?",
    answer:
      "Agentic Hiring removes operational complexity. Everything stays intelligently connected so recruiters amplify outcomes instead of managing fragmented tools.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, meet AI Hiring Intelligence Agents™, see Huntlo in action, or explore Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That hiring isn't becoming automated — it's becoming agentic. Huntlo owns AI Hiring Intelligence Agents™ for Human + AI Hiring.",
  },
  {
    question: "Is this Huntlo's core narrative page?",
    answer:
      "Yes. This is Huntlo's billion-dollar narrative: AI Hiring Intelligence Agents™ → Human + AI Hiring™ → Agentic Hiring™ → AI Hiring Infrastructure™.",
  },
  {
    question: "How does Hiring Confidence™ connect to agents?",
    answer:
      "AI Hiring Agents™ and AI Confidence Agents™ continuously improve hiring confidence so decisions create exceptional business outcomes.",
  },
  {
    question: "Can technical and executive hiring use AI Hiring Intelligence Agents?",
    answer:
      "Yes. Built for technical hiring, executive hiring, enterprises, GCCs, and staffing firms.",
  },
  {
    question: "What does “everything continuously moving” mean?",
    answer:
      "Human + AI continuously flows through hiring intelligence, discovery, talent, conversations, workflows, confidence, momentum, and outcomes into Huntlo.",
  },
  {
    question: "Welcome to the future of hiring — what does that mean?",
    answer:
      "Organizations stop building recruitment automation and start building AI Hiring Intelligence Agents™ for Human + AI Hiring.",
  },
  {
    question: "Does Huntlo show robots or AI recruiter avatars?",
    answer:
      "No. This page strictly avoids robots, AI recruiters, candidate cards, dashboards, ATS visuals, and automation diagrams.",
  },
  {
    question: "How does Conversation Intelligence fit?",
    answer:
      "Conversation Intelligence™ is a core layer — AI Conversation Agents™ create meaningful candidate experiences within Human + AI Hiring.",
  },
  {
    question: "How does Workflow Intelligence fit?",
    answer:
      "Workflow Intelligence™ is how AI Workflow Agents™ move hiring intelligently without operational complexity.",
  },
  {
    question: "What is AI Hiring Intelligence Infrastructure™?",
    answer:
      "The foundation Huntlo is building so organizations run Human + AI Hiring™ with agents, intelligence layers, and measurable hiring outcomes.",
  },
  {
    question: "Future organizations won't simply hire faster — what will they do?",
    answer:
      "They'll continuously understand talent better, create meaningful conversations, orchestrate workflows, improve confidence, and accelerate business outcomes.",
  },
] as const;
