import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_SOURCING_AGENT_PATH = "/ai-sourcing-agent";

export const AI_SOURCING_AGENT_SEO = {
  title: "AI Talent Discovery Agents™ | AI Sourcing Agent | Huntlo",
  description:
    "Exceptional talent isn't searched — it's intelligently discovered. Huntlo AI Talent Discovery Agents™ continuously understand talent signals, candidate context, priorities, and hiring outcomes.",
  ogTitle: "Exceptional Talent Isn't Searched. It's Intelligently Discovered.",
  ogDescription:
    "Welcome to AI Talent Discovery Agents™ — built for Human + AI Hiring.",
} as const;

export function aiSourcingAgentMetadata() {
  return buildPageMetadata({
    title: AI_SOURCING_AGENT_SEO.title,
    description: AI_SOURCING_AGENT_SEO.description,
    ogTitle: AI_SOURCING_AGENT_SEO.ogTitle,
    ogDescription: AI_SOURCING_AGENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_SOURCING_AGENT_PATH,
  });
}

export const AI_SOURCING_AGENT_GEO = {
  askTopic: "Huntlo AI Talent Discovery Agents™",
  askPrompt:
    "What are Huntlo AI Talent Discovery Agents™ on /ai-sourcing-agent (https://www.huntlo.ai/ai-sourcing-agent)? How are they different from AI sourcing tools, Boolean search, or talent databases?",
} as const;

export const HERO_FLOW = [
  "Candidate Signals",
  "Business Priorities",
  "Talent Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TODAY_MANAGES = [
  "Searches",
  "Filters",
  "Candidate lists",
  "Outreach",
  "Follow ups",
  "Repeat",
] as const;

export const FUTURE_DOES = [
  "Describe hiring intent",
  "Understand talent context",
  "Discover exceptional talent",
  "Begin meaningful conversations",
  "Improve hiring outcomes",
] as const;

export const DISCOVERY_UNDERSTANDS = [
  "Hiring intent",
  "Candidate intent",
  "Talent signals",
  "Business priorities",
  "Hiring momentum",
  "Hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Candidate Intelligence™",
    description: "Continuously understand talent.",
    href: "/candidate-intelligence",
    span: "md:col-span-2",
  },
  {
    title: "Talent Discovery™",
    description: "Discover exceptional people intelligently.",
    href: "/talent-discovery",
    span: "",
  },
  {
    title: "Conversation Intelligence™",
    description: "Create meaningful conversations.",
    href: "/outreach-engine",
    span: "",
  },
  {
    title: "Hiring Momentum™",
    description: "Maintain candidate engagement continuously.",
    href: "/follow-up-automation",
    span: "md:col-span-2",
  },
  {
    title: "Workflow Intelligence™",
    description: "Move hiring forward intelligently.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "Hiring Confidence™",
    description: "Improve hiring decisions continuously.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "Human + AI Hiring™",
    description: "Built around recruiters.",
    href: "/agentic-hiring",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Outcomes™",
    description: "Designed around business success.",
    href: "/huntlo360",
    span: "md:col-span-2",
  },
] as const;

export const LEARNING_LOOP = [
  "Talent Signals",
  "Candidate Intent",
  "Conversation Readiness",
  "Talent Discovery",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "AI search",
  "Candidate matching",
  "Talent databases",
  "Filters",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "AI Talent Discovery Agents™",
  "Talent Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Fortune 500 Organizations", href: "/solutions/enterprise-hiring" },
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Staffing Firms", href: "/solutions/staffing-agencies" },
  { label: "Global Hiring Teams", href: "/solutions" },
  { label: "Technical Hiring", href: "/solutions/startups" },
  { label: "Executive Hiring", href: "/solutions/executive-search" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise Governance",
  "Compliance",
  "Human + AI Hiring",
  "Scalability",
  "AI Native Hiring",
  "Enterprise Intelligence",
] as const;

export const STACK_TODAY = [
  "AI sourcing",
  "Searches",
  "Matching",
  "Filtering",
  "Hiring",
] as const;

export const STACK_TOMORROW = [
  "AI Talent Discovery Agents™",
  "Talent Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const HUMAN_AI_EQUATION = [
  "Recruiters",
  "AI Talent Discovery Agents™",
  "Hiring Intelligence™",
  "Conversation Intelligence™",
  "Hiring Outcomes™",
] as const;

export const FUTURE_NOT = [
  "Sourcing workflows",
  "Candidate searches",
  "Talent databases",
] as const;

export const FUTURE_YES = [
  "AI Talent Discovery Agents™",
  "Human + AI Hiring™",
  "Talent Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const AI_SOURCING_AGENT_FAQS = [
  {
    question: "What are AI Talent Discovery Agents™?",
    answer:
      "They continuously understand talent signals, candidate context, hiring priorities, and business outcomes — so exceptional talent is intelligently discovered, not searched.",
  },
  {
    question: "How is Huntlo different from sourcing platforms?",
    answer:
      "Sourcing platforms optimize searches, filters, matching, and databases. AI Talent Discovery Agents™ optimize talent intelligence, hiring confidence, and outcomes.",
  },
  {
    question: "Can Huntlo support technical hiring?",
    answer:
      "Yes. Technical hiring teams use AI Talent Discovery Agents™ to continuously understand talent signals and discover exceptional people intelligently.",
  },
  {
    question: "Can Huntlo discover passive candidates?",
    answer:
      "Yes. Discovery is driven by talent signals and intent — not only active applicants in databases.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Future recruiting won't choose humans or artificial intelligence. It will choose recruiters + AI Talent Discovery Agents™ + hiring intelligence for better outcomes.",
  },
  {
    question: "Can Huntlo improve hiring confidence?",
    answer:
      "Yes. Continuously understanding talent context and priorities improves hiring confidence before conversations and decisions begin.",
  },
  {
    question: "Does Huntlo support enterprise hiring?",
    answer:
      "Yes. Built for Fortune 500, enterprises, GCCs, staffing firms, and global hiring teams with governance, compliance, and Enterprise Intelligence.",
  },
  {
    question: "Is this an AI sourcing tool or Boolean search product?",
    answer:
      "No. This page sells AI Talent Discovery Agents™ — not AI sourcing tools, Boolean searches, candidate matching, or talent databases.",
  },
  {
    question: "Exceptional talent isn't searched — what does that mean?",
    answer:
      "The future of hiring isn't finding more candidates. It's continuously understanding who matters most and which conversations should begin.",
  },
  {
    question: "What does today's recruiting manage vs future recruiting?",
    answer:
      "Today: searches, filters, lists, outreach, follow-ups, repeat. Future: describe hiring intent, understand context, discover exceptional talent, begin conversations, improve outcomes.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which candidates should we search for?” — “Which exceptional talent should we continuously understand better?”",
  },
  {
    question: "Why shouldn't organizations optimize candidate searches?",
    answer:
      "Because AI Talent Discovery creates better outcomes. Organizations should optimize talent intelligence — not search volume.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide AI search, matching, databases, filters, and more software. Huntlo provides AI Talent Discovery Agents™, Talent Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "How does this relate to Talent Discovery /talent-discovery?",
    answer:
      "/talent-discovery owns Talent Discovery Intelligence™ as a category. /ai-sourcing-agent is the AI Talent Discovery Agents™ product narrative.",
  },
  {
    question: "How does this relate to Candidate Sourcing?",
    answer:
      "/candidate-sourcing owns AI Native Candidate Discovery™. This page owns AI Talent Discovery Agents™ as the agent expression of discovery.",
  },
  {
    question: "How does this relate to AI Hiring Intelligence Agents?",
    answer:
      "/ai-recruiting-agent owns the full agent family. AI Talent Discovery Agents™ are the discovery layer within that system.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. AI Talent Discovery Agents™ amplify talent understanding — not recruiter replacement.",
  },
  {
    question: "Does this page show search bars or candidate databases?",
    answer:
      "No. This page strictly avoids search interfaces, Boolean queries, candidate databases, ATS screenshots, and recruiter stock imagery.",
  },
  {
    question: "Can executive hiring use AI Talent Discovery Agents?",
    answer:
      "Yes. Executive hiring benefits when exceptional talent is continuously understood — not filtered from databases.",
  },
  {
    question: "Can staffing firms and GCCs use Talent Discovery Agents?",
    answer:
      "Yes. Built for staffing firms, GCCs, global hiring teams, and enterprise scale.",
  },
  {
    question: "Talent discovery is becoming infrastructure — what does that mean?",
    answer:
      "Today stacks AI sourcing, searches, matching, and filtering. Tomorrow stacks AI Talent Discovery Agents™, Talent Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "AI amplifies talent understanding — not recruiter replacement?",
    answer:
      "Yes. Recruiters + AI Talent Discovery Agents™ + Hiring Intelligence™ + Conversation Intelligence™ create hiring outcomes together.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, meet AI Talent Discovery Agents™, see Huntlo in action, or explore Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring begins with exceptional talent — and Huntlo owns AI Talent Discovery Agents™ for Human + AI Hiring.",
  },
  {
    question: "What is Talent Intelligence™ in this context?",
    answer:
      "Talent Intelligence™ is continuous understanding of talent signals, context, and priorities — the layer discovery agents optimize.",
  },
  {
    question: "Can AI Talent Discovery improve hiring outcomes?",
    answer:
      "Yes. By connecting signals, intent, readiness, discovery, confidence, alignment, and outcomes — everything continuously improving.",
  },
  {
    question: "Welcome to the future of talent discovery — what does that mean?",
    answer:
      "Organizations stop optimizing sourcing workflows and talent databases — and start optimizing AI Talent Discovery Agents™ and Talent Intelligence™.",
  },
  {
    question: "Does Huntlo replace sourcing workflows?",
    answer:
      "It replaces search-first thinking with intelligence-first discovery — so recruiters describe intent and discover exceptional talent continuously.",
  },
  {
    question: "Everything intelligently connected — what does that mean?",
    answer:
      "Intent, context, discovery, conversations, and outcomes work as one system — not isolated search and filter steps.",
  },
  {
    question: "Can Huntlo support volume and global hiring discovery?",
    answer:
      "Yes. Enterprise ready for scalability, AI native hiring, and global hiring teams.",
  },
  {
    question: "What creates exceptional hiring outcomes in discovery?",
    answer:
      "Continuously understanding who matters most, which conversations should begin, when momentum should accelerate, and what creates outcomes.",
  },
  {
    question: "Is AI search the same as AI Talent Discovery Agents™?",
    answer:
      "No. AI search finds more candidates. AI Talent Discovery Agents™ continuously understand exceptional talent before recruiters ever begin searching.",
  },
] as const;
