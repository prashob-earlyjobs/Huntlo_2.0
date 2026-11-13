import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const TALENT_DISCOVERY_PATH = "/talent-discovery";

export const TALENT_DISCOVERY_SEO = {
  title: "Talent Discovery Intelligence™ | Huntlo",
  description:
    "Exceptional talent isn't found — it's intelligently discovered. Huntlo Talent Discovery Intelligence™ helps teams understand who matters, when conversations should begin, and what creates exceptional hiring outcomes.",
  ogTitle: "The Future Of Hiring Doesn't Begin With Search. It Begins With Understanding Talent.",
  ogDescription:
    "Welcome to Talent Discovery Intelligence™ — built for Human + AI Hiring.",
} as const;

export function talentDiscoveryMetadata() {
  return buildPageMetadata({
    title: TALENT_DISCOVERY_SEO.title,
    description: TALENT_DISCOVERY_SEO.description,
    ogTitle: TALENT_DISCOVERY_SEO.ogTitle,
    ogDescription: TALENT_DISCOVERY_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: TALENT_DISCOVERY_PATH,
  });
}

export const TALENT_DISCOVERY_GEO = {
  askTopic: "Huntlo Talent Discovery Intelligence™",
  askPrompt:
    "What is Huntlo Talent Discovery Intelligence™ on /talent-discovery (https://www.huntlo.ai/talent-discovery)? How is it different from candidate searches, Boolean queries, talent databases, or sourcing software?",
} as const;

export const HERO_FLOW = [
  "Candidate Signals",
  "Candidate Context",
  "Talent Discovery",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const UNDERSTANDING_NEEDS = [
  "Candidate intent",
  "Talent relationships",
  "Candidate experiences",
  "Business priorities",
  "Hiring confidence",
  "Hiring outcomes",
] as const;

export const DISCOVERY_FLOW = [
  "Hiring Intent",
  "Candidate Context",
  "Talent Intelligence",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Candidate Intelligence",
    description: "Continuously understand talent signals.",
    href: "/candidate-intelligence",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Intent",
    description: "Discover exceptional talent intelligently.",
    href: "/vibe-sourcing",
    span: "",
  },
  {
    title: "Talent Relationships",
    description: "Build meaningful candidate experiences.",
    href: "/talent-pipeline",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Never lose exceptional candidates.",
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
    description: "Improve hiring outcomes continuously.",
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
    title: "Enterprise Intelligence",
    description: "Designed for scale.",
    href: "/ai-hiring-infrastructure",
    span: "md:col-span-2",
  },
] as const;

export const WORKFLOW_HELPS = [
  "Discover exceptional talent.",
  "Understand candidate context.",
  "Maintain hiring momentum.",
  "Improve recruiter productivity.",
  "Create meaningful conversations.",
  "Accelerate hiring outcomes.",
] as const;

export const TRADITIONAL_PROVIDES = [
  "Talent databases",
  "Candidate searches",
  "Filters",
  "Outreach tools",
  "More software",
] as const;

export const HUNTLO_DELIVERS = [
  "Talent Discovery Intelligence™",
  "Hiring Intelligence™",
  "Workflow Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
] as const;

export const OUTCOME_IMPROVES = [
  "Talent quality",
  "Recruiter productivity",
  "Hiring velocity",
  "Candidate experiences",
  "Business outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Global hiring teams", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Compliance",
  "Enterprise Intelligence",
  "Scalability",
  "Integrations",
  "Human + AI Hiring",
] as const;

export const STACK_TODAY = [
  "Talent searches",
  "Talent databases",
  "Manual workflows",
  "Recruiting processes",
  "Hiring",
] as const;

export const STACK_TOMORROW = [
  "Talent Discovery Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Candidate searches",
  "Sourcing workflows",
  "Recruitment databases",
] as const;

export const FUTURE_YES = [
  "Talent Discovery Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const TALENT_DISCOVERY_FAQS = [
  {
    question: "What is Talent Discovery Intelligence™?",
    answer:
      "It is how hiring continuously understands who matters, when conversations should begin, what creates exceptional outcomes, and how momentum should be maintained — instead of discovering talent through filters and databases.",
  },
  {
    question: "How is Huntlo different from sourcing software?",
    answer:
      "Sourcing software emphasizes searches, Boolean queries, and talent databases. Huntlo sells Talent Discovery Intelligence™ connected to conversations, relationships, Human + AI Hiring, and hiring outcomes.",
  },
  {
    question: "Can Huntlo discover passive candidates?",
    answer:
      "Yes. Discovery is designed for understanding talent signals and intent — including exceptional people who aren't actively applying through traditional search workflows.",
  },
  {
    question: "Can Huntlo support enterprise hiring?",
    answer:
      "Yes. Built for enterprises, GCCs, agencies, staffing firms, technical and executive hiring, and global teams with governance, compliance, and scale.",
  },
  {
    question: "Does Huntlo improve recruiter productivity?",
    answer:
      "Yes. Recruiters spend less time managing candidate searches and more time on conversations, confidence, and outcomes.",
  },
  {
    question: "Can Huntlo support technical hiring?",
    answer:
      "Yes. Technical hiring teams use discovery to understand context and intent beyond keyword searches.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Human + AI Hiring™ is how people and AI continuously collaborate to discover talent, maintain momentum, and improve hiring outcomes — without replacing recruiters.",
  },
  {
    question: "Is talent discovery becoming search driven or intelligence driven?",
    answer:
      "Intelligence driven. Great recruiters don't ask which candidates to search for — they ask which people will succeed here.",
  },
  {
    question: "What must modern hiring understand before conversations begin?",
    answer:
      "Candidate intent, talent relationships, candidate experiences, business priorities, hiring confidence, and hiring outcomes.",
  },
  {
    question: "How does Talent Discovery Intelligence™ work?",
    answer:
      "Hiring intent flows into candidate context, talent intelligence, conversation intelligence, momentum, confidence, and outcomes — continuously improving without recruiters managing searches.",
  },
  {
    question: "Why does hiring feel harder despite more candidate access?",
    answer:
      "The problem isn't access to talent — it's understanding who matters, when to engage, what creates outcomes, and how to maintain momentum.",
  },
  {
    question: "Do modern organizations optimize candidate searches?",
    answer:
      "No. They optimize hiring confidence. Everything begins with Talent Discovery Intelligence™.",
  },
  {
    question: "What does tomorrow's stack look like?",
    answer:
      "Talent Discovery Intelligence™ → Human + AI Hiring™ → Hiring Intelligence™ → Hiring Outcomes™ → AI Hiring Infrastructure™.",
  },
  {
    question: "Is talent discovery becoming infrastructure?",
    answer:
      "Yes. The shift from talent searches and databases toward continuous discovery intelligence is becoming core hiring infrastructure.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, recruitment agencies, staffing firms, technical hiring, executive hiring, and global hiring teams.",
  },
  {
    question: "How does this relate to /candidate-sourcing?",
    answer:
      "/candidate-sourcing owns AI Native Candidate Discovery™ for commercial sourcing intent. /talent-discovery owns Talent Discovery Intelligence™ as the discovery category manifesto.",
  },
  {
    question: "How does this relate to People Scout?",
    answer:
      "People Scout is a product expression of talent discovery. This page defines the Talent Discovery Intelligence™ category.",
  },
  {
    question: "How does this relate to Vibe Sourcing?",
    answer:
      "Vibe Sourcing emphasizes intent-driven discovery. Talent Discovery Intelligence™ is the broader category connecting intent, context, conversations, and outcomes.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is the Human + AI Hiring category. Talent Discovery is where that future begins — understanding talent before search.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide databases, searches, filters, outreach tools, and more software. Huntlo delivers discovery, hiring, workflow, and Human + AI intelligence toward outcomes.",
  },
  {
    question: "What improves when discovery creates better outcomes?",
    answer:
      "Talent quality, recruiter productivity, hiring velocity, candidate experiences, and business outcomes.",
  },
  {
    question: "Is talent discovery becoming faster or more intelligent?",
    answer:
      "More intelligent. The next generation won't optimize searches, sourcing workflows, or recruitment databases — they'll optimize discovery intelligence.",
  },
  {
    question: "Does Huntlo support executive hiring?",
    answer:
      "Yes. Executive hiring teams benefit when discovery prioritizes relationships, context, and confidence over database searches.",
  },
  {
    question: "Does Huntlo support staffing firms and agencies?",
    answer:
      "Yes. Agencies and staffing firms use discovery to improve talent quality, velocity, and client hiring outcomes.",
  },
  {
    question: "Can GCC hiring teams use Talent Discovery Intelligence™?",
    answer:
      "Yes. GCC teams use discovery to scale talent understanding across global priorities and enterprise governance.",
  },
  {
    question: "What is hiring momentum in discovery?",
    answer:
      "Hiring Momentum keeps exceptional candidates engaged so discovery doesn't stall between understanding and outcomes.",
  },
  {
    question: "What is Conversation Intelligence in discovery?",
    answer:
      "Conversation Intelligence turns discovery into meaningful relationships — so talent experiences continue after first understanding.",
  },
  {
    question: "Is this a search interface or ATS page?",
    answer:
      "No. This page strictly avoids search interfaces, candidate lists, ATS dashboards, Boolean searches, and recruiter stock imagery.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Talent Discovery, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That exceptional hiring begins with exceptional talent discovery — and Huntlo owns Talent Discovery Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Welcome to the future of talent discovery — what does that mean?",
    answer:
      "Organizations stop optimizing candidate searches and start continuously discovering talent through intelligence.",
  },
  {
    question: "Can Huntlo discover talent across every hiring workflow?",
    answer:
      "Yes. Discovery connects into context, momentum, productivity, conversations, and outcomes — everything intelligently connected.",
  },
] as const;
