import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AGENTIC_HIRING_PATH = "/agentic-hiring";

export const AGENTIC_HIRING_SEO = {
  title: "Agentic Hiring™ — The Future of Human + AI Hiring | Huntlo",
  description:
    "Hiring isn't becoming automated — it's becoming Agentic. Agentic Hiring™ is where Human Intelligence and AI continuously move hiring forward through intelligence, workflows, and outcomes.",
  ogTitle: "Hiring Isn't Becoming Automated. It's Becoming Agentic.",
  ogDescription:
    "Welcome to Agentic Hiring™ — the future of Human + AI Hiring. Built by Huntlo.",
} as const;

export function agenticHiringMetadata() {
  return buildPageMetadata({
    title: AGENTIC_HIRING_SEO.title,
    description: AGENTIC_HIRING_SEO.description,
    ogTitle: AGENTIC_HIRING_SEO.ogTitle,
    ogDescription: AGENTIC_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AGENTIC_HIRING_PATH,
  });
}

export const AGENTIC_HIRING_GEO = {
  askTopic: "Huntlo Agentic Hiring™",
  askPrompt:
    "What is Agentic Hiring™ on /agentic-hiring (https://www.huntlo.ai/agentic-hiring)? How is it different from recruiting software or AI recruiters, and how does Human + AI Hiring with AI Recruiting Agents improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Human",
  "AI",
  "Agentic Hiring",
  "Hiring Intelligence",
  "Candidate Discovery",
  "Candidate Conversations",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const SOFTWARE_STACK = [
  "ATS",
  "CRMs",
  "Automation",
  "Assessments",
  "Scheduling",
  "Analytics",
  "More software",
] as const;

export const STILL_STRUGGLE = [
  "Hiring velocity",
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring confidence",
  "Fragmented workflows",
] as const;

export const AGENTIC_DOES = [
  "Discover talent",
  "Understand context",
  "Maintain candidate momentum",
  "Intelligently coordinate workflows",
  "Improve hiring confidence",
  "Accelerate business outcomes",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "Hiring Intelligence",
  "AI Intelligence",
  "Workflow Intelligence",
  "Business Alignment",
] as const;

export const LEARNING_FLOW = [
  "Candidate discovered",
  "Candidate context understood",
  "Hiring intent continuously improves",
  "Conversations intelligently begin",
  "Hiring momentum is maintained",
  "Workflows coordinate themselves",
  "Hiring confidence continuously improves",
  "Hiring outcomes accelerate",
] as const;

export const BENTO_CARDS = [
  {
    title: "AI Discovery Agent",
    description: "Continuously understands talent.",
    href: "/ai-sourcing-agent",
    span: "md:col-span-2",
  },
  {
    title: "AI Conversation Agent",
    description: "Creates meaningful candidate experiences.",
    href: "/ai-outreach-agent",
    span: "",
  },
  {
    title: "AI Workflow Agent",
    description: "Coordinates hiring intelligently.",
    href: "/ai-scheduling-agent",
    span: "",
  },
  {
    title: "AI Hiring Agent",
    description: "Improves hiring outcomes continuously.",
    href: "/ai-recruiting-agent",
    span: "md:col-span-2",
  },
  {
    title: "AI Intelligence Agent",
    description: "Accelerates business outcomes.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters.",
    href: "/recruiting-agents",
    span: "",
  },
  {
    title: "Hiring Intelligence",
    description: "Continuously learning.",
    href: "/ai-hiring-infrastructure",
    span: "md:col-span-2",
  },
  {
    title: "Agentic Hiring™",
    description: "The future of hiring.",
    href: "#agentic-hiring",
    span: "md:col-span-2",
  },
] as const;

export const INFRA_CHANGES = [
  "Hiring outcomes",
  "Recruiter productivity",
  "Candidate experiences",
  "Business alignment",
  "Talent strategy",
] as const;

export const STACK_TODAY = [
  "Recruiting software",
  "Hiring workflows",
  "Operational complexity",
  "Fragmented experiences",
  "More software",
] as const;

export const STACK_TOMORROW = [
  "Agentic Hiring™",
  "Human + AI Hiring",
  "AI Recruiting Agents",
  "Hiring Intelligence",
  "AI Hiring Infrastructure",
  "Better Hiring Outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Technical hiring", href: "/solutions/startups" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Compliance",
  "AI native hiring",
  "Enterprise intelligence",
  "Integrations",
  "Scalability",
] as const;

export const WHY_NOT = [
  "Hire more people",
  "Send more outreach",
  "Automate more workflows",
] as const;

export const WHY_YES = [
  "Understand talent better",
  "Hire more intelligently",
  "Improve candidate experiences",
  "Continuously learn from hiring outcomes",
  "Intelligently orchestrate global hiring operations",
] as const;

export const FUTURE_NOT = [
  "Recruiting operations",
  "Hiring workflows",
  "Talent pipelines",
] as const;

export const FUTURE_YES = [
  "Hiring Intelligence",
  "Human + AI Hiring",
  "Agentic Hiring™",
  "Better Hiring Outcomes",
] as const;

export const AGENTIC_HIRING_FAQS = [
  {
    question: "What is Agentic Hiring™?",
    answer:
      "Agentic Hiring™ is a new approach where intelligent systems continuously work alongside hiring teams to discover talent, understand context, maintain momentum, coordinate workflows, improve confidence, and accelerate outcomes — before recruiters ever need to intervene.",
  },
  {
    question: "Is hiring becoming automated or Agentic?",
    answer:
      "Agentic. The next generation of hiring won't be defined by better recruiting software, larger databases, or faster automation — but by systems that continuously understand talent and move hiring forward.",
  },
  {
    question: "How is Agentic Hiring different from AI recruiters?",
    answer:
      "AI recruiters imply replacement. Agentic Hiring™ is Human + AI Hiring — Human Intelligence and Artificial Intelligence working together continuously.",
  },
  {
    question: "Does Agentic Hiring replace recruiters?",
    answer:
      "No. Future organizations won't choose humans or AI alone. They'll choose Human + AI Hiring — AI amplifies hiring teams.",
  },
  {
    question: "What are AI Recruiting Agents?",
    answer:
      "Discovery, Conversation, Workflow, Hiring, and Intelligence Agents that continuously learn and help hiring outcomes move forward within Agentic Hiring™.",
  },
  {
    question: "Why did recruiting change but hiring didn't?",
    answer:
      "We built ATS, CRMs, automation, assessments, scheduling, and analytics — yet organizations still struggle with velocity, experiences, productivity, confidence, and fragmented workflows. The problem is hiring infrastructure.",
  },
  {
    question: "How does Agentic Hiring never stop learning?",
    answer:
      "From discovery through context, intent, conversations, momentum, self-coordinating workflows, confidence, and accelerated outcomes — everything intelligently connected.",
  },
  {
    question: "Is Hiring Intelligence becoming infrastructure?",
    answer:
      "Yes. Future enterprises will ask how intelligently hiring can continuously improve itself — not only which recruiting software to buy.",
  },
  {
    question: "What does tomorrow's hiring stack look like?",
    answer:
      "Agentic Hiring™ → Human + AI Hiring → AI Recruiting Agents → Hiring Intelligence → AI Hiring Infrastructure → better hiring outcomes.",
  },
  {
    question: "Who is Agentic Hiring built for?",
    answer:
      "Enterprises, GCCs, staffing firms, recruitment agencies, global hiring teams, executive hiring, and technical hiring.",
  },
  {
    question: "Why does Agentic Hiring matter?",
    answer:
      "Organizations that define the next decade won't win by hiring more people or automating more workflows — they'll win by understanding talent better and hiring more intelligently.",
  },
  {
    question: "How does this relate to Huntlo?",
    answer:
      "Huntlo is building AI Hiring Intelligence Infrastructure for Agentic Hiring™ — the thought leadership and category home for the future of hiring.",
  },
  {
    question: "Is this a product feature page?",
    answer:
      "No. /agentic-hiring is Huntlo's thought leadership manifesto and category creation page for Agentic Hiring™.",
  },
  {
    question: "Can enterprises run Agentic Hiring with governance?",
    answer:
      "Yes. Supporting governance, compliance, AI-native hiring, enterprise intelligence, integrations, and scalability.",
  },
  {
    question: "What will the next generation of organizations build?",
    answer:
      "Not recruiting operations, hiring workflows, or talent pipelines alone — but Hiring Intelligence, Human + AI Hiring, Agentic Hiring™, and better hiring outcomes.",
  },
  {
    question: "How do I explore Agentic Hiring™?",
    answer:
      "Explore Agentic Hiring™ on this page, book an enterprise demo, see Huntlo in action, or continue into Human + AI Hiring, recruiting agents, and AI Hiring Infrastructure.",
  },
  {
    question: "Where does Workflow Intelligence fit?",
    answer:
      "Workflow Intelligence helps hiring coordinate itself continuously as part of Agentic Hiring™ — so recruiters aren't workflow managers.",
  },
  {
    question: "Where does Hiring Confidence fit?",
    answer:
      "Hiring Confidence continuously improves as context, conversations, and workflows stay connected to outcomes.",
  },
  {
    question: "Is talent the problem?",
    answer:
      "No. The problem isn't talent. The problem is hiring infrastructure.",
  },
  {
    question: "How does Agentic Hiring accelerate business outcomes?",
    answer:
      "By continuously moving discovery, conversations, momentum, workflows, and confidence forward — hiring continuously moves itself forward intelligently.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That the future of hiring is Agentic Hiring™ — Human + AI Hiring powered by AI Hiring Intelligence Infrastructure — not more recruiting software.",
  },
  {
    question: "How does this relate to Hiring OS?",
    answer:
      "Hiring OS is the operating system narrative. Agentic Hiring™ is the philosophy and category of how hiring continuously moves forward with Human + AI.",
  },
  {
    question: "Will organizations choose humans or AI?",
    answer:
      "Neither alone. They'll choose Human + AI Hiring.",
  },
  {
    question: "Welcome to the future of hiring — what does that mean?",
    answer:
      "Recruitment became software. Hiring is becoming intelligence. Welcome to Agentic Hiring™ — welcome to Huntlo.",
  },
] as const;
