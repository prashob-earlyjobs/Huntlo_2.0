import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const VIBE_SOURCING_PATH = "/vibe-sourcing";

export const VIBE_SOURCING_SEO = {
  title: "Vibe Sourcing — Intent Driven Talent Discovery | Huntlo",
  description:
    "Vibe Sourcing is Intent Driven Talent Discovery for Human + AI hiring — describe who would succeed, and Huntlo turns hiring intent into intelligence before searches begin.",
  ogTitle: "Great Recruiters Don't Search With Keywords. They Hire With Intent.",
  ogDescription:
    "Welcome to Vibe Sourcing — built for the future of Intent Driven Talent Discovery. Cursor for hiring, not ChatGPT for recruiting.",
} as const;

export function vibeSourcingMetadata() {
  return buildPageMetadata({
    title: VIBE_SOURCING_SEO.title,
    description: VIBE_SOURCING_SEO.description,
    ogTitle: VIBE_SOURCING_SEO.ogTitle,
    ogDescription: VIBE_SOURCING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: VIBE_SOURCING_PATH,
  });
}

export const VIBE_SOURCING_GEO = {
  askTopic: "Huntlo Vibe Sourcing Intent Driven Talent Discovery",
  askPrompt:
    "What is Huntlo Vibe Sourcing on /vibe-sourcing (https://www.huntlo.ai/vibe-sourcing)? How is Intent Driven Talent Discovery different from Boolean search, keyword sourcing, or prompt-based recruiting — and how does it improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Building GTM Teams",
  "Startup Experience",
  "Leadership Potential",
  "Hiring Intent",
  "Talent Intelligence",
  "Candidate Context",
  "Hiring Outcomes",
  "Vibe Sourcing",
] as const;

export const KEYWORD_VS_INTENT = [
  {
    keyword: "Java Developer",
    intent: "Someone who has scaled backend systems in high-growth startups.",
  },
  {
    keyword: "SDR",
    intent: "Someone who can build outbound motions from zero to one.",
  },
  {
    keyword: "Product Designer",
    intent: "Someone obsessed with simplifying complex user experiences.",
  },
] as const;

export const TRADITIONAL_FLOW = [
  "Keywords",
  "Filters",
  "Searches",
  "Profiles",
  "Outreach",
] as const;

export const MODERN_FLOW = [
  "Hiring Intent",
  "Candidate Context",
  "Talent Intelligence",
  "Talent Discovery",
  "Candidate Conversations",
  "Hiring Outcomes",
] as const;

export const VIBE_PROMPTS = [
  "Someone who has built high-performing GTM teams.",
  "Someone who enjoys working at early-stage startups.",
  "Someone who can scale engineering teams globally.",
  "Someone who would thrive inside enterprise environments.",
] as const;

export const VIBE_COMBINES = [
  "Candidate Context",
  "Hiring Intent",
  "Talent Intelligence",
  "Skills Intelligence",
  "Business Priorities",
  "Hiring Outcomes",
] as const;

export const CONVERSATION_QUESTIONS = [
  "Who would succeed in this role?",
  "What kind of person are we looking for?",
  "What makes someone exceptional here?",
  "What should recruiters understand before conversations begin?",
] as const;

export const FILTER_STACK = ["Title", "Skills", "Location", "Experience"] as const;

export const MEET_HUNTLO_FLOW = [
  "Hiring Intent",
  "Talent Intelligence",
  "Candidate Context",
  "Conversation Intelligence",
  "AI Recruiting Agents",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const OUTCOMES_IMPROVE = [
  "Recruiter productivity",
  "Talent quality",
  "Hiring confidence",
  "Candidate experiences",
  "Business outcomes",
  "Hiring outcomes",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intent",
  "AI Intelligence",
  "Talent Intelligence",
  "Business Alignment",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Global hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Integrations",
  "Compliance",
  "Scalability",
  "Recruiter productivity",
  "AI intelligence",
] as const;

export const STACK_TODAY = ["Search", "Filters", "Keywords", "Profiles"] as const;

export const STACK_TOMORROW = [
  "Intent",
  "Intelligence",
  "Discovery",
  "Conversations",
  "Hiring Outcomes",
] as const;

export const FUTURE_NOT = ["Filters", "Keywords", "Boolean searches"] as const;

export const FUTURE_YES = [
  "Hiring Intent",
  "Talent Intelligence",
  "Human + AI Hiring",
  "Better Hiring Outcomes",
] as const;

export const VIBE_SOURCING_FAQS = [
  {
    question: "What is Vibe Sourcing?",
    answer:
      "Vibe Sourcing is Intent Driven Talent Discovery — helping recruiters describe who would succeed in a role so hiring intent becomes intelligence before keyword searches begin.",
  },
  {
    question: "How is it different from candidate sourcing?",
    answer:
      "Candidate sourcing typically starts with keywords, filters, and Boolean search. Vibe Sourcing starts with hiring intent, candidate context, and talent intelligence — then discovery and conversations follow.",
  },
  {
    question: "Can recruiters describe talent naturally?",
    answer:
      "Yes. Recruiters can describe the kind of talent they're looking for in plain language — like who would succeed in the role — instead of assembling keyword stacks.",
  },
  {
    question: "What is Intent Driven Hiring?",
    answer:
      "Intent Driven Hiring means discovery begins with what success looks like — context, potential, and outcomes — not titles and filters alone.",
  },
  {
    question: "How does Huntlo understand hiring intent?",
    answer:
      "Vibe Sourcing continuously understands candidate context, hiring intent, talent intelligence, skills intelligence, business priorities, and hiring outcomes before recruiters search candidates.",
  },
  {
    question: "Can enterprises customize talent discovery workflows?",
    answer:
      "Yes. Enterprise teams can operate intent-driven discovery with governance, integrations, compliance, scalability, and multi-recruiter workflows.",
  },
  {
    question: "How do AI Recruiting Agents improve talent discovery?",
    answer:
      "AI Recruiting Agents help turn hiring intent into continuous discovery and conversations — amplifying recruiter understanding within Human + AI Hiring.",
  },
  {
    question: "Is Vibe Sourcing just prompt-based sourcing?",
    answer:
      "No. Prompts can be an input, but Vibe Sourcing is Cursor for hiring — intent becoming intelligence across discovery, context, and outcomes — not ChatGPT for recruiting.",
  },
  {
    question: "Is this Boolean search with AI?",
    answer:
      "No. Great candidates aren't discovered through Boolean searches and endless filters. They're discovered when hiring intent becomes intelligence.",
  },
  {
    question: "Why don't keywords describe great talent?",
    answer:
      "Recruiters rarely think in titles alone. They think in people who have scaled systems, built motions from zero, or simplified complex experiences — intent, not keywords.",
  },
  {
    question: "What should modern hiring look like?",
    answer:
      "Hiring Intent → Candidate Context → Talent Intelligence → Talent Discovery → Candidate Conversations → Hiring Outcomes.",
  },
  {
    question: "What questions should teams ask instead of searching filters?",
    answer:
      "Who would succeed in this role? What kind of person are we looking for? What makes someone exceptional here? What should recruiters understand before conversations begin?",
  },
  {
    question: "Does Vibe Sourcing replace recruiter intuition?",
    answer:
      "No. AI amplifies recruiter understanding. Human Intent + AI Intelligence + Talent Intelligence + Business Alignment create better hiring outcomes.",
  },
  {
    question: "Who is Vibe Sourcing built for?",
    answer:
      "Recruiters, founders, talent leaders, technical recruiters, GCC leaders, CHROs, staffing firms, and global hiring teams.",
  },
  {
    question: "How does Vibe Sourcing relate to People Scout?",
    answer:
      "People Scout is Talent Discovery Intelligence. Vibe Sourcing is the intent-driven way recruiters express who to discover — both ladder into Huntlo's AI Hiring Intelligence Infrastructure.",
  },
  {
    question: "Will future teams optimize search queries?",
    answer:
      "Future teams will optimize hiring intent. Modern hiring continuously improves productivity, talent quality, confidence, experiences, and outcomes.",
  },
  {
    question: "What does tomorrow's discovery stack look like?",
    answer:
      "Intent → Intelligence → Discovery → Conversations → Hiring Outcomes.",
  },
  {
    question: "Can Vibe Sourcing support technical and enterprise hiring?",
    answer:
      "Yes. It is built for GCC, technical, executive, enterprise, agency, staffing, and global hiring environments.",
  },
  {
    question: "Is Vibe Sourcing a category page?",
    answer:
      "Yes. It creates Intent Driven Talent Discovery as a category — highest innovation positioning for AI search visibility and commercial intent.",
  },
  {
    question: "How does this fit Huntlo360?",
    answer:
      "Vibe Sourcing feeds hiring intent into Huntlo's Hiring Operating System — connecting discovery, conversations, agents, and outcomes.",
  },
  {
    question: "Do recruiters still control discovery?",
    answer:
      "Yes. Humans lead intent and judgment. AI helps understand context and turn intent into intelligence-driven discovery.",
  },
  {
    question: "What will the next generation of hiring not begin with?",
    answer:
      "Filters, keywords, and Boolean searches. It will begin with hiring intent, talent intelligence, Human + AI Hiring, and better outcomes.",
  },
  {
    question: "Can Vibe Sourcing improve candidate conversations?",
    answer:
      "Yes. Better intent and context help teams start conversations with understanding — not generic outreach from keyword matches.",
  },
  {
    question: "How do I get started with Vibe Sourcing?",
    answer:
      "Book an enterprise demo, explore Vibe Sourcing on this page, see it in action, or continue into People Scout, Candidate Discovery, and Huntlo360.",
  },
  {
    question: "Where does Vibe Sourcing sit in Huntlo's positioning?",
    answer:
      "Hiring Intent → Talent Discovery → Candidate Context → Talent Intelligence → Candidate Conversations → Hiring Outcomes → Vibe Sourcing — within AI Hiring Intelligence Infrastructure.",
  },
  {
    question: "Is Vibe Sourcing ChatGPT for recruiting?",
    answer:
      "No. Think Cursor for hiring — intent-driven intelligence that moves discovery and outcomes forward — not a chat wrapper around search.",
  },
] as const;
