import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const CANDIDATE_SOURCING_PATH = "/candidate-sourcing";

export const CANDIDATE_SOURCING_SEO = {
  title: "AI Native Candidate Discovery™ | AI Candidate Sourcing | Huntlo",
  description:
    "Stop searching for candidates. Start discovering exceptional talent intelligently. Huntlo AI Native Candidate Discovery™ helps recruiting teams understand context, intent, and outcomes — not just keywords and filters.",
  ogTitle: "Great Hiring Doesn't Begin With Searches. It Begins With Understanding Talent.",
  ogDescription:
    "Welcome to AI Native Candidate Discovery™ — built for the future of Human + AI Hiring.",
} as const;

export function candidateSourcingMetadata() {
  return buildPageMetadata({
    title: CANDIDATE_SOURCING_SEO.title,
    description: CANDIDATE_SOURCING_SEO.description,
    ogTitle: CANDIDATE_SOURCING_SEO.ogTitle,
    ogDescription: CANDIDATE_SOURCING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: CANDIDATE_SOURCING_PATH,
  });
}

export const CANDIDATE_SOURCING_GEO = {
  askTopic: "Huntlo AI Native Candidate Discovery™",
  askPrompt:
    "What is Huntlo AI Native Candidate Discovery™ on /candidate-sourcing (https://www.huntlo.ai/candidate-sourcing)? How is Candidate Discovery Intelligence different from AI candidate sourcing software, Boolean search, or candidate search platforms?",
} as const;

export const HERO_DISCOVERY_FLOW = [
  "Hiring Intent",
  "Candidate Context",
  "Talent Discovery",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TODAY_RECRUITER_WORK = [
  "Searching",
  "Filtering",
  "Exporting",
  "Messaging",
  "Following up",
  "Repeating everything again",
] as const;

export const FUTURE_RECRUITER_WORK = [
  "Describe talent",
  "Understand context",
  "Discover candidates",
  "Create conversations",
  "Improve hiring outcomes",
] as const;

export const DISCOVERY_UNDERSTANDS = [
  "Candidate signals",
  "Hiring intent",
  "Candidate context",
  "Talent intelligence",
  "Hiring priorities",
  "Business outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "AI Talent Discovery",
    description: "Discover exceptional candidates intelligently.",
    href: "/people-scout",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Intelligence",
    description: "Understand talent beyond resumes.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Candidate Context",
    description: "Maintain hiring momentum continuously.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "Talent Relationships",
    description: "Create meaningful candidate experiences.",
    href: "/talent-pipeline",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Intelligence",
    description: "Improve hiring confidence continuously.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Amplify recruiting teams intelligently.",
    href: "/recruiting-agents",
    span: "",
  },
] as const;

export const WORKFLOW_HELPS = [
  "Discover exceptional talent.",
  "Build talent intelligence continuously.",
  "Maintain hiring momentum.",
  "Improve recruiter productivity.",
  "Create meaningful candidate experiences.",
  "Accelerate hiring outcomes.",
] as const;

export const TRADITIONAL_REQUIRES = [
  "Boolean searches",
  "Filters",
  "Manual searches",
  "Manual outreach",
  "Disconnected systems",
] as const;

export const HUNTLO_DELIVERS = [
  "Talent Discovery Intelligence™",
  "Candidate Intelligence™",
  "Workflow Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Founders & startups", href: "/solutions/startups" },
  { label: "Talent acquisition teams", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Compliance",
  "Scalability",
  "Integrations",
  "Enterprise Intelligence",
] as const;

export const INFRA_CHANGES = [
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring velocity",
  "Hiring confidence",
  "Business outcomes",
] as const;

export const CANDIDATE_SOURCING_FAQS = [
  {
    question: "What is AI Native Candidate Discovery™?",
    answer:
      "It is how recruiting teams intelligently discover exceptional talent by understanding context, intent, experience, and hiring outcomes — not just keywords and filters.",
  },
  {
    question: "What is AI Candidate Discovery?",
    answer:
      "AI Candidate Discovery continuously interprets candidate signals, hiring intent, and talent intelligence so recruiters discover who they should engage — before manual searching begins.",
  },
  {
    question: "How is Huntlo different from AI candidate sourcing software?",
    answer:
      "Sourcing is often treated as a commodity search workflow. Huntlo positions discovery as intelligence — Talent Discovery Intelligence™ connected to conversations, momentum, and hiring outcomes.",
  },
  {
    question: "How is Huntlo different from sourcing platforms?",
    answer:
      "Traditional sourcing platforms emphasize Boolean searches, filters, exports, and lists. Huntlo helps teams describe talent, understand context, discover candidates, create conversations, and improve outcomes.",
  },
  {
    question: "Is this a candidate sourcing platform?",
    answer:
      "Commercially, teams searching for a candidate sourcing platform will find Huntlo — but the product category we own is AI Native Candidate Discovery™, not another search utility.",
  },
  {
    question: "What is Candidate Discovery Intelligence™?",
    answer:
      "It is Huntlo continuously understanding candidate signals, hiring intent, candidate context, talent intelligence, hiring priorities, and business outcomes before recruiters begin searching.",
  },
  {
    question: "What is Talent Discovery Intelligence™?",
    answer:
      "Talent Discovery Intelligence™ is how Huntlo continuously surfaces exceptional talent through context and intent — the intelligent alternative to repetitive candidate search.",
  },
  {
    question: "Can Huntlo support technical hiring?",
    answer:
      "Yes. Technical recruiters and engineering hiring teams use discovery to understand skills, context, and intent beyond keyword matching.",
  },
  {
    question: "How does Huntlo improve recruiter productivity?",
    answer:
      "By reducing repetitive searching, filtering, exporting, messaging, and follow-up loops — so recruiters spend more time on conversations and hiring outcomes.",
  },
  {
    question: "Does Huntlo support global hiring?",
    answer:
      "Yes. Huntlo supports enterprises, GCCs, staffing firms, recruitment agencies, and global hiring teams with scalable discovery workflows.",
  },
  {
    question: "Can enterprises customize hiring workflows?",
    answer:
      "Yes. Discovery connects into Workflow Intelligence™ so enterprises can align talent discovery with hiring priorities, governance, and outcomes.",
  },
  {
    question: "Who is AI Native Candidate Discovery™ built for?",
    answer:
      "Recruiters, talent acquisition teams, founders, recruitment agencies, GCC hiring teams, staffing firms, technical recruiters, and enterprise hiring teams.",
  },
  {
    question: "Why shouldn't candidate discovery feel like work?",
    answer:
      "Because tomorrow's teams describe talent, understand context, discover candidates, create conversations, and improve outcomes — instead of endlessly searching and repeating.",
  },
  {
    question: "Does Huntlo replace Boolean search?",
    answer:
      "Huntlo is designed so teams rely less on Boolean-first sourcing and more on continuous discovery. This page intentionally avoids Boolean search visuals and candidate lists.",
  },
  {
    question: "What is a candidate discovery software vs candidate search software?",
    answer:
      "Search software finds profiles matching filters. Discovery software continuously understands who exceptional talent is and when conversations should begin.",
  },
  {
    question: "Is Huntlo an AI recruiting platform?",
    answer:
      "Huntlo is an AI hiring intelligence platform. Candidate Discovery is how teams enter that intelligence layer from talent discovery.",
  },
  {
    question: "Is Huntlo a candidate intelligence platform?",
    answer:
      "Yes in capability — Candidate Intelligence™ is a core layer of discovery, helping teams understand talent beyond resumes.",
  },
  {
    question: "How does discovery connect across hiring workflows?",
    answer:
      "Huntlo helps organizations discover talent, build talent intelligence, maintain momentum, improve productivity, create experiences, and accelerate outcomes — everything intelligently connected.",
  },
  {
    question: "Why Huntlo instead of traditional sourcing tools?",
    answer:
      "Traditional tools require Boolean searches, filters, manual searches, manual outreach, and disconnected systems. Huntlo delivers discovery, candidate, workflow, and Human + AI hiring intelligence toward outcomes.",
  },
  {
    question: "Is candidate discovery becoming intelligence?",
    answer:
      "Yes. Future organizations will ask how intelligently they can continuously discover exceptional talent — not which sourcing software to purchase.",
  },
  {
    question: "What changes when discovery becomes intelligence?",
    answer:
      "Recruiter productivity, candidate experiences, hiring velocity, hiring confidence, and business outcomes.",
  },
  {
    question: "How does this relate to People Scout?",
    answer:
      "People Scout deepens Talent Discovery Intelligence. /candidate-sourcing is the commercial category page for AI Native Candidate Discovery™ and AI candidate sourcing intent.",
  },
  {
    question: "How does this relate to Vibe Sourcing?",
    answer:
      "Vibe Sourcing emphasizes intent-driven discovery. Candidate Discovery is the broader commercial category connecting intent, context, conversations, and outcomes.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Candidate Discovery is where AI and recruiters collaborate to discover exceptional talent from the first interaction.",
  },
  {
    question: "Does Huntlo help recruitment agencies and staffing firms?",
    answer:
      "Yes. Agencies and staffing firms use discovery to improve talent quality, velocity, and client hiring outcomes.",
  },
  {
    question: "Can founders use Huntlo for early hiring?",
    answer:
      "Yes. Founders and startup teams use discovery to find exceptional talent without building heavy sourcing operations.",
  },
  {
    question: "Does Huntlo support GCC hiring teams?",
    answer:
      "Yes. GCC hiring teams use discovery to scale talent understanding across global priorities and enterprise governance.",
  },
  {
    question: "What is hiring intent in candidate discovery?",
    answer:
      "Hiring intent helps discovery prioritize relevance and readiness so conversations start with stronger context than keyword matches alone.",
  },
  {
    question: "What is candidate context?",
    answer:
      "Candidate context is the continuous understanding of signals, experience, and priorities that makes discovery intelligent rather than transactional.",
  },
  {
    question: "How do I see Candidate Discovery in action?",
    answer:
      "Book a demo, explore Candidate Discovery on this page, try Huntlo in product workflows, or continue into Agentic Hiring™.",
  },
  {
    question: "Is this page about candidate databases or ATS sourcing?",
    answer:
      "No. This page strictly avoids candidate databases, Boolean search visuals, ATS dashboards, candidate lists, and recruiter stock imagery.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That exceptional hiring begins with exceptional talent discovery — and Huntlo owns AI Native Candidate Discovery™ for Human + AI Hiring.",
  },
] as const;
