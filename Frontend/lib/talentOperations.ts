import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const TALENT_OPERATIONS_PATH = "/talent-operations";

export const TALENT_OPERATIONS_SEO = {
  title: "Hiring Operations Intelligence™ | Huntlo",
  description:
    "Great organizations don't scale hiring teams — they scale hiring intelligence. Huntlo Hiring Operations Intelligence™ continuously improves workflows, confidence, and outcomes for Human + AI Hiring.",
  ogTitle: "Hiring Doesn't Scale Through More Processes. It Scales Through Better Intelligence.",
  ogDescription:
    "Welcome to Hiring Operations Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function talentOperationsMetadata() {
  return buildPageMetadata({
    title: TALENT_OPERATIONS_SEO.title,
    description: TALENT_OPERATIONS_SEO.description,
    ogTitle: TALENT_OPERATIONS_SEO.ogTitle,
    ogDescription: TALENT_OPERATIONS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: TALENT_OPERATIONS_PATH,
  });
}

export const TALENT_OPERATIONS_GEO = {
  askTopic: "Huntlo Hiring Operations Intelligence™",
  askPrompt:
    "What is Huntlo Hiring Operations Intelligence™ on /talent-operations (https://www.huntlo.ai/talent-operations)? How is it different from talent operations, recruitment operations, or HR operations software, and how does it improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Business Priorities",
  "Hiring Intelligence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Talent Intelligence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const COMPLEXITY_LAYERS = [
  "Hiring teams",
  "Candidate experiences",
  "Workflows",
  "Conversations",
  "Hiring decisions",
  "Business priorities",
  "Global operations",
  "More software",
] as const;

export const COMPLEXITY_RESULTS = [
  "Slower hiring",
  "Fragmented experiences",
  "Operational complexity",
  "Disconnected systems",
  "Lower hiring velocity",
] as const;

export const OPERATIONS_FLOW = [
  "Business Priorities",
  "Candidate Context",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Enterprise Success",
] as const;

export const BENTO_CARDS = [
  {
    title: "Talent Discovery",
    description: "Understand exceptional talent continuously.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Intelligence",
    description: "Improve hiring decisions intelligently.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create meaningful candidate experiences.",
    href: "/candidate-orchestration",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain hiring velocity continuously.",
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
    title: "Human + AI Hiring",
    description: "Amplify hiring teams intelligently.",
    href: "/recruiting-agents",
    span: "",
  },
  {
    title: "Enterprise Intelligence",
    description: "Built for scalability.",
    href: "/ai-hiring-infrastructure",
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
  "Business Priorities",
  "Candidate Context",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Momentum",
  "Business Outcomes",
  "Enterprise Success",
] as const;

export const HUMAN_AI_EQUATION = [
  "People",
  "AI Intelligence",
  "Workflow Intelligence",
  "Hiring Intelligence",
] as const;

export const INFRA_CHANGES = [
  "Hiring velocity",
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring confidence",
  "Business outcomes",
] as const;

export const STACK_TODAY = [
  "Recruitment operations",
  "Hiring processes",
  "Operational complexity",
  "Disconnected experiences",
  "More software",
] as const;

export const STACK_TOMORROW = [
  "Hiring Operations Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "AI Hiring Infrastructure™",
  "Better Hiring Outcomes™",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Fortune 500 companies", href: "/solutions/enterprise-hiring" },
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Compliance",
  "Scalability",
  "Enterprise Intelligence",
  "Human + AI Hiring",
  "Global hiring operations",
] as const;

export const OUTCOME_NOT = [
  "Recruiting processes",
  "Hiring operations",
  "Workflow automation",
] as const;

export const OUTCOME_YES = [
  "Hiring confidence",
  "Talent intelligence",
  "Business outcomes",
  "Recruiter productivity",
  "Hiring intelligence",
] as const;

export const FUTURE_NOT = [
  "Recruitment processes",
  "Hiring operations",
  "Operational complexity",
] as const;

export const FUTURE_YES = [
  "Hiring Operations Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const TALENT_OPERATIONS_FAQS = [
  {
    question: "What is Hiring Operations Intelligence™?",
    answer:
      "It is how enterprises continuously improve hiring through intelligence — workflows, confidence, momentum, and outcomes — instead of scaling processes and operational overhead.",
  },
  {
    question: "Is this talent operations software?",
    answer:
      "No. This page sells Hiring Operations Intelligence™, Workflow Intelligence™, and AI Hiring Infrastructure™ — not Talent Ops, recruitment ops, or HR ops tools.",
  },
  {
    question: "Why don't great organizations scale hiring teams?",
    answer:
      "They scale hiring intelligence, candidate experiences, business outcomes, and recruiter productivity — not recruiting teams, workflows, and operational processes alone.",
  },
  {
    question: "Why do modern organizations struggle?",
    answer:
      "Not because they lack hiring operations — because hiring remains fragmented across tools, conversations, workflows, and business priorities.",
  },
  {
    question: "What does modern hiring require?",
    answer:
      "Intelligence — not operational overhead from more teams, more software, and more processes.",
  },
  {
    question: "How does Hiring Operations Intelligence™ work?",
    answer:
      "Business priorities flow into candidate context, conversation intelligence, workflow intelligence, confidence, momentum, outcomes, and enterprise success — continuously improving without managing operational complexity.",
  },
  {
    question: "Will enterprises optimize recruitment operations or hiring outcomes?",
    answer:
      "Hiring outcomes. Modern enterprises won't optimize recruitment operations — they'll optimize hiring outcomes.",
  },
  {
    question: "Does AI replace enterprise operations?",
    answer:
      "No. AI amplifies enterprise hiring — not enterprise operations. People + AI + Workflow Intelligence + Hiring Intelligence create hiring outcomes.",
  },
  {
    question: "Are hiring operations becoming infrastructure?",
    answer:
      "Yes. Future organizations will ask how intelligently hiring can continuously improve itself — not which recruitment operations software to purchase.",
  },
  {
    question: "What does tomorrow's enterprise hiring stack look like?",
    answer:
      "Hiring Operations Intelligence™ → Human + AI Hiring™ → Hiring Intelligence™ → AI Hiring Infrastructure™ → Better Hiring Outcomes™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Fortune 500 companies, enterprises, GCCs, global hiring teams, staffing firms, technical hiring, and executive hiring.",
  },
  {
    question: "What changes when operations become intelligence?",
    answer:
      "Hiring velocity, recruiter productivity, candidate experiences, hiring confidence, and business outcomes — everything intelligently connected.",
  },
  {
    question: "How does this relate to Huntlo?",
    answer:
      "Huntlo builds Hiring Operations Intelligence™ for Human + AI Hiring — connecting priorities, workflows, confidence, and outcomes.",
  },
  {
    question: "How does this relate to AI Hiring Infrastructure?",
    answer:
      "AI Hiring Infrastructure™ is the foundation. Hiring Operations Intelligence™ is how enterprises scale hiring intelligence across that infrastructure.",
  },
  {
    question: "How does this relate to Workflow Orchestration?",
    answer:
      "Workflow Orchestration focuses on Hiring Intelligence Orchestration™. Talent Operations positions enterprise Hiring Operations Intelligence™ as the operations category.",
  },
  {
    question: "What will defining organizations optimize?",
    answer:
      "Hiring confidence, talent intelligence, business outcomes, recruiter productivity, and hiring intelligence — everything begins with Hiring Intelligence.",
  },
  {
    question: "Did recruitment operations become software?",
    answer:
      "Yes. Recruitment operations became software. Hiring operations are becoming intelligence.",
  },
  {
    question: "What will the next decade scale?",
    answer:
      "Hiring Operations Intelligence™, Human + AI Hiring™, Hiring Intelligence™, and Better Hiring Outcomes™ — not recruitment processes or operational complexity.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Hiring Operations, see Huntlo in action, or continue into Agentic Hiring™ and Hiring Intelligence.",
  },
  {
    question: "Is this an HR dashboard or ATS page?",
    answer:
      "No. This page strictly avoids HR dashboards, ATS interfaces, operations charts, kanban boards, and recruiter stock imagery.",
  },
  {
    question: "Can enterprises scale Hiring Operations Intelligence™?",
    answer:
      "Yes. Supporting governance, compliance, scalability, Enterprise Intelligence, Human + AI Hiring, and global hiring operations.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great organizations scale hiring intelligence — and Huntlo owns Hiring Operations Intelligence™ for the future of Human + AI Hiring.",
  },
  {
    question: "What is the difference between operations and intelligence?",
    answer:
      "Operations scale processes and overhead. Intelligence continuously improves hiring velocity, experiences, confidence, and outcomes.",
  },
  {
    question: "Welcome to the future of enterprise hiring — what does that mean?",
    answer:
      "Enterprises stop scaling recruitment processes and start scaling Hiring Operations Intelligence™ for Human + AI Hiring.",
  },
] as const;
