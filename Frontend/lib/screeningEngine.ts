import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const SCREENING_ENGINE_PATH = "/screening-engine";

export const SCREENING_ENGINE_SEO = {
  title: "Hiring Confidence Intelligence™ | Screening Engine | Huntlo",
  description:
    "Great hiring doesn't screen better — it makes better hiring decisions. Huntlo Hiring Confidence Intelligence™ helps organizations understand candidate context, intent, momentum, and outcomes beyond resumes and rankings.",
  ogTitle: "Great Hiring Doesn't Begin With Screening. It Begins With Hiring Confidence.",
  ogDescription:
    "Welcome to Hiring Confidence Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function screeningEngineMetadata() {
  return buildPageMetadata({
    title: SCREENING_ENGINE_SEO.title,
    description: SCREENING_ENGINE_SEO.description,
    ogTitle: SCREENING_ENGINE_SEO.ogTitle,
    ogDescription: SCREENING_ENGINE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: SCREENING_ENGINE_PATH,
  });
}

export const SCREENING_ENGINE_GEO = {
  askTopic: "Huntlo Hiring Confidence Intelligence™",
  askPrompt:
    "What is Huntlo Hiring Confidence Intelligence™ on /screening-engine (https://www.huntlo.ai/screening-engine)? How is it different from resume screening, candidate matching, or ranking algorithms?",
} as const;

export const HERO_FLOW = [
  "Candidate Signals",
  "Candidate Context",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Workflow Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_UNDERSTANDS = [
  "Resume",
  "Experience",
  "Skills",
  "Matching scores",
  "Candidate rankings",
  "Hiring decisions",
] as const;

export const FUTURE_UNDERSTANDS = [
  "Candidate intent",
  "Candidate context",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Business alignment",
  "Hiring outcomes",
] as const;

export const CONFIDENCE_UNDERSTANDS = [
  "Candidate context",
  "Hiring intent",
  "Business priorities",
  "Hiring momentum",
  "Talent relationships",
  "Hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Candidate Intelligence",
    description: "Understand talent intelligently.",
    href: "/candidate-intelligence",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Intent",
    description: "Improve hiring decisions continuously.",
    href: "/vibe-sourcing",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create better candidate experiences.",
    href: "/outreach-engine",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Increase decision-making confidence.",
    href: "/ai-screening-agent",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain candidate engagement intelligently.",
    href: "/follow-up-automation",
    span: "",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward seamlessly.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters.",
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
  "Candidate Context",
  "Hiring Confidence",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Business Alignment",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "Resume screening",
  "Candidate matching",
  "Scorecards",
  "Rankings",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "Hiring Confidence Intelligence™",
  "Hiring Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const OUTCOME_IMPROVES = [
  "Hiring confidence",
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring velocity",
  "Business outcomes",
  "Talent quality",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "AI Intelligence",
  "Hiring Intelligence",
  "Business Alignment",
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
  "Resume screening",
  "Candidate matching",
  "Candidate rankings",
  "Recruitment processes",
] as const;

export const STACK_TOMORROW = [
  "Hiring Confidence Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Resume screening",
  "Candidate matching",
  "Ranking algorithms",
] as const;

export const FUTURE_YES = [
  "Hiring Confidence Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const SCREENING_ENGINE_FAQS = [
  {
    question: "What is Hiring Confidence Intelligence™?",
    answer:
      "It is how organizations continuously understand candidate context, hiring intent, momentum, priorities, and outcomes — so hiring decisions are made with confidence, not just filters and rankings.",
  },
  {
    question: "How is Huntlo different from resume screening software?",
    answer:
      "Resume screening filters and scores profiles. Hiring Confidence Intelligence™ continuously improves decision confidence through context, conversations, and business alignment.",
  },
  {
    question: "Can Huntlo improve hiring decisions?",
    answer:
      "Yes. Great hiring doesn't begin with screening — it begins with hiring confidence grounded in understanding people and outcomes.",
  },
  {
    question: "How does Huntlo understand candidate context?",
    answer:
      "Candidate context is a core layer — helping teams understand talent beyond resumes, matching scores, and rankings.",
  },
  {
    question: "Can enterprises customize screening workflows?",
    answer:
      "Yes. Hiring Confidence connects into Workflow Intelligence™ so enterprises can align decisions with governance, priorities, and outcomes.",
  },
  {
    question: "Does Huntlo support technical hiring?",
    answer:
      "Yes. Technical hiring teams use confidence intelligence to understand context and intent beyond keyword matching and rankings.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Human + AI Hiring™ is how people and AI continuously collaborate. AI doesn't replace hiring decisions — it amplifies hiring confidence.",
  },
  {
    question: "Why do modern organizations struggle with hiring decisions?",
    answer:
      "Not because they lack candidate information — because exceptional decisions require understanding more than resumes, scores, and matching algorithms.",
  },
  {
    question: "What does great hiring continuously understand?",
    answer:
      "Candidate context, hiring intent, conversation readiness, hiring momentum, business priorities, and hiring outcomes.",
  },
  {
    question: "What does traditional recruiting understand vs future hiring?",
    answer:
      "Traditional recruiting understands resumes, experience, skills, matching scores, rankings, and decisions. Future hiring understands intent, context, conversations, confidence, alignment, and outcomes.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which candidate scored highest?” — “Which hiring decision creates the best business outcome?”",
  },
  {
    question: "Is screening becoming intelligence?",
    answer:
      "Yes. Organizations shouldn't optimize candidate filtering — they should optimize hiring confidence.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide resume screening, matching, scorecards, rankings, and more software. Huntlo provides Hiring Confidence Intelligence™, Hiring Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "What outcomes does hiring confidence create?",
    answer:
      "Improved hiring confidence, recruiter productivity, candidate experiences, hiring velocity, business outcomes, and talent quality.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, recruitment agencies, staffing firms, technical hiring, executive hiring, and global hiring teams.",
  },
  {
    question: "How does this relate to AI Screening Agents?",
    answer:
      "AI Screening Agents are a product expression of decision support. /screening-engine owns Hiring Confidence Intelligence™ as the category.",
  },
  {
    question: "How does this relate to Candidate Intelligence?",
    answer:
      "Candidate Intelligence™ deepens understanding of people. Hiring Confidence Intelligence™ turns that understanding into better hiring decisions.",
  },
  {
    question: "How does this relate to Conversation Intelligence?",
    answer:
      "Conversation Intelligence strengthens experiences and context. Hiring Confidence uses that intelligence to improve decision quality.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Hiring Confidence Intelligence™ is how AI amplifies decision confidence without replacing human judgment.",
  },
  {
    question: "What does tomorrow's stack look like?",
    answer:
      "Hiring Confidence Intelligence™ → Human + AI Hiring™ → Hiring Intelligence™ → Hiring Outcomes™ → AI Hiring Infrastructure™.",
  },
  {
    question: "Does great hiring optimize screening or confidence?",
    answer:
      "Confidence. The next decade won't optimize resume screening, matching, or ranking algorithms — it will optimize Hiring Confidence Intelligence™.",
  },
  {
    question: "Is this a scorecard or ATS ranking page?",
    answer:
      "No. This page strictly avoids resume scorecards, ATS dashboards, candidate ranking systems, filtering interfaces, and recruiter stock imagery.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Hiring Confidence™, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring begins with confidence — and Huntlo owns Hiring Confidence Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Everything begins with Hiring Confidence Intelligence™ — why?",
    answer:
      "Because exceptional organizations continuously improve confidence, productivity, experiences, velocity, outcomes, and talent quality through better decisions.",
  },
  {
    question: "Can executive hiring use Hiring Confidence Intelligence™?",
    answer:
      "Yes. Executive hiring benefits when decisions are grounded in context, relationships, and outcomes — not rankings alone.",
  },
  {
    question: "Can staffing firms and agencies use Hiring Confidence?",
    answer:
      "Yes. Agencies and staffing firms use confidence intelligence to improve decision quality and client hiring outcomes.",
  },
  {
    question: "What is business alignment in hiring confidence?",
    answer:
      "Business alignment connects talent understanding to priorities and outcomes — so decisions create enterprise success, not only shortlists.",
  },
  {
    question: "Does AI replace hiring decisions?",
    answer:
      "No. Human Intelligence + AI Intelligence + Hiring Intelligence + Business Alignment create hiring outcomes. AI amplifies hiring confidence.",
  },
  {
    question: "Welcome to the future of hiring confidence — what does that mean?",
    answer:
      "Organizations stop optimizing screening and start continuously improving Hiring Confidence Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Can Huntlo support GCC and global hiring decisions?",
    answer:
      "Yes. Built for global scale with governance, compliance, Enterprise Intelligence, and Human + AI Hiring.",
  },
  {
    question: "How does Hiring Momentum fit with hiring confidence?",
    answer:
      "Hiring Momentum keeps engagement continuous so confidence doesn't stall between understanding and outcomes.",
  },
] as const;
