import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const CANDIDATE_SOURCING_PATH = "/candidate-sourcing";

export const CANDIDATE_SOURCING_SEO = {
  title: "AI Candidate Sourcing & Candidate Discovery | Huntlo",
  description:
    "Huntlo Candidate Discovery helps recruiting teams continuously discover talent through skills intelligence, hiring intent, and AI discovery agents — beyond traditional candidate search.",
  ogTitle: "The Future Of Recruiting Isn't Candidate Search. It's Candidate Discovery.",
  ogDescription:
    "The best candidates don't search for jobs. Why are recruiters still searching for candidates? Explore Huntlo Candidate Discovery.",
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
  askTopic: "Huntlo Candidate Discovery",
  askPrompt:
    "What is Huntlo Candidate Discovery (https://www.huntlo.ai/candidate-sourcing)? How is candidate discovery different from candidate search, and how does Huntlo use AI discovery agents and talent intelligence?",
} as const;

export const HERO_DISCOVERY_FLOW = [
  "Candidate Signals",
  "Skills Intelligence",
  "Talent Intelligence",
  "Hiring Intent",
  "AI Discovery Agents",
  "Candidate Discovery",
  "Engagement Intelligence",
  "Recruiter Productivity",
  "Huntlo",
] as const;

export const CANDIDATE_REALITY = [
  "Growing",
  "Learning",
  "Contributing",
  "Building",
  "Moving",
  "Changing roles",
  "Creating signals continuously",
] as const;

export const UNDERSTAND_BEFORE_SEARCH = [
  "Skills",
  "Experiences",
  "Hiring intent",
  "Engagement signals",
  "Talent relationships",
] as const;

export const AGED_SEARCH_CHAIN = [
  "LinkedIn",
  "Job boards",
  "Boolean search",
  "Filters",
  "Spreadsheets",
  "Emails",
  "Follow-ups",
  "More searching",
  "Repeat",
] as const;

export const DISCOVERY_COMBINES = [
  "Candidate Intelligence",
  "Talent Intelligence",
  "Hiring Intent",
  "Skills Intelligence",
  "Engagement Signals",
  "AI Recruiting Agents",
  "Workflow Intelligence",
] as const;

export const CONTINUOUS_UNDERSTANDING = [
  "Skills",
  "Experience",
  "Intent Signals",
  "Candidate Behaviour",
  "Engagement",
  "Hiring Readiness",
  "Talent Markets",
  "Recruiter Priorities",
  "Business Outcomes",
] as const;

export const MEET_HUNTLO_FLOW = [
  { label: "Candidate Discovery", href: "/sourcing" },
  { label: "Talent Intelligence", href: "/people-scout" },
  { label: "AI Recruiting Agents", href: "/agentic-hiring" },
  { label: "Workflow Intelligence", href: "/workflow-orchestration" },
  { label: "Candidate Engagement", href: "/candidate-pool" },
  { label: "Hiring Infrastructure", href: "/ai-hiring-infrastructure" },
  { label: "Recruiter Productivity", href: "/hiring-os" },
  { label: "Enterprise Hiring", href: "/solutions" },
] as const;

export const DISCOVERY_IMPROVES = [
  "Recruiter productivity",
  "Talent quality",
  "Candidate experiences",
  "Engagement",
  "Hiring velocity",
  "Workflow intelligence",
  "Business outcomes",
] as const;

export const AI_DISCOVERY_ANIMATION = [
  "AI Discovery Agent",
  "Candidate Signals",
  "Skills Intelligence",
  "Hiring Intent",
  "Talent Intelligence",
  "Candidate Discovery",
  "Recruiter Decisions",
  "Hiring Outcomes",
] as const;

export const INTELLIGENCE_LEARNS = [
  "Context",
  "Priorities",
  "Engagement",
  "Relationships",
  "Business outcomes",
] as const;

export const FUTURE_EQUATION = [
  "Intelligence",
  "AI",
  "People",
  "Context",
  "Signals",
  "Workflows",
  "Business Outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "High-volume hiring", href: "/solutions" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Compliance",
  "Scalability",
  "Integrations",
  "Governance",
  "Recruiter workflows",
] as const;

export const CANDIDATE_SOURCING_FAQS = [
  {
    question: "What is Candidate Discovery?",
    answer:
      "Candidate Discovery is a continuous approach to finding talent by understanding skills, hiring intent, engagement signals, and talent relationships — so recruiters discover who they should look for, not only search for known profiles.",
  },
  {
    question: "How is Candidate Discovery different from Candidate Search?",
    answer:
      "Search requires recruiters to already know what they are looking for. Discovery helps recruiters understand who they should be looking for by combining candidate signals, skills intelligence, and hiring intent before manual searching begins.",
  },
  {
    question: "What are Candidate Signals?",
    answer:
      "Candidate signals are the continuous indicators talent creates as they grow, learn, contribute, build, move, and change roles — information modern recruiting teams can use to discover relevant candidates earlier.",
  },
  {
    question: "What is Hiring Intent?",
    answer:
      "Hiring intent refers to signals that help teams understand candidate readiness and relevance for opportunities — so discovery can prioritize talent more intelligently than keyword matching alone.",
  },
  {
    question: "What is Skills Intelligence?",
    answer:
      "Skills Intelligence helps recruiting teams understand candidate capabilities and experience context beyond basic keyword filters, supporting stronger discovery and better shortlists.",
  },
  {
    question: "Can Candidate Discovery improve recruiter productivity?",
    answer:
      "Yes. By reducing hours spent on repetitive searching across LinkedIn, job boards, Boolean strings, filters, and spreadsheets, recruiters can spend more time hiring, evaluating talent, and engaging candidates.",
  },
  {
    question: "How does Huntlo discover talent?",
    answer:
      "Huntlo combines candidate discovery, talent intelligence, AI recruiting agents, workflow intelligence, and engagement through one connected infrastructure layer — helping teams move from manual searching to continuous discovery.",
  },
  {
    question: "What role do AI Recruiting Agents play in discovery?",
    answer:
      "AI Discovery Agents help interpret candidate signals, skills intelligence, hiring intent, and talent intelligence so recruiters can make stronger decisions and move into engagement and hiring outcomes faster.",
  },
  {
    question: "Is Candidate Discovery the same as AI Candidate Sourcing?",
    answer:
      "AI Candidate Sourcing is often associated with finding candidates faster. Candidate Discovery goes further by treating sourcing as continuous intelligence — understanding talent before and during hiring workflows, not only running searches.",
  },
  {
    question: "Why do the best candidates not apply anymore?",
    answer:
      "Many of the strongest candidates are not waiting in applicant pipelines. They are growing, learning, contributing, and changing roles — leaving signals that discovery systems can help recruiting teams understand earlier.",
  },
  {
    question: "Does Huntlo replace Boolean search?",
    answer:
      "Huntlo is designed so recruiters rely less on manual Boolean searching and more on continuous candidate discovery powered by intelligence and AI agents. Product sourcing workflows support natural-language discovery rather than forcing Boolean-first sourcing.",
  },
  {
    question: "How does talent intelligence power discovery?",
    answer:
      "Talent intelligence helps discovery become intelligence-driven rather than search-driven by learning context, priorities, engagement, relationships, and business outcomes before hiring decisions begin.",
  },
  {
    question: "Is Candidate Discovery becoming recruiting infrastructure?",
    answer:
      "Yes. The shift from asking where to search toward asking what talent to discover next is becoming a core infrastructure change for modern recruiting teams.",
  },
  {
    question: "Who is Candidate Discovery built for?",
    answer:
      "Recruiters, staffing firms, enterprises, founders, TA leaders, recruitment agencies, GCC hiring teams, and technical recruiters who need stronger discovery than fragmented search workflows.",
  },
  {
    question: "How does discovery improve hiring decisions?",
    answer:
      "Better discovery improves recruiter productivity, talent quality, candidate experiences, engagement, hiring velocity, workflow intelligence, and business outcomes by starting with stronger talent understanding.",
  },
  {
    question: "Can enterprise teams use Huntlo for candidate discovery?",
    answer:
      "Yes. Huntlo supports enterprise, technical, high-volume, executive, GCC, staffing, and agency hiring needs with compliance considerations, scalability, integrations, governance, and recruiter workflows.",
  },
  {
    question: "How is this different from Huntlo's /sourcing product page?",
    answer:
      "The sourcing product page focuses on Huntlo Source capabilities. This Candidate Discovery page explains the category shift from search to continuous discovery and how Huntlo approaches that future.",
  },
  {
    question: "What should recruiters ask instead of where can I search?",
    answer:
      "The future recruiter asks: what talent should I be discovering next? That question reflects a move from tool-based searching to intelligence-driven discovery.",
  },
  {
    question: "Does Candidate Discovery stop after finding profiles?",
    answer:
      "No. Discovery connects into engagement, workflow intelligence, recruiter productivity, and hiring outcomes — because finding candidates is only the beginning of the hiring journey.",
  },
  {
    question: "How does Candidate Discovery relate to Agentic Hiring?",
    answer:
      "Agentic Hiring describes Human + AI collaboration. Candidate Discovery is where AI discovery agents and recruiters collaborate to understand talent continuously before and during hiring workflows.",
  },
  {
    question: "Can Candidate Discovery help technical and high-volume hiring?",
    answer:
      "Yes. Technical and high-volume teams benefit when discovery continuously surfaces relevant talent instead of relying on repetitive manual search cycles.",
  },
  {
    question: "How do I get started with Huntlo Candidate Discovery?",
    answer:
      "Book a demo to see discovery in the context of your hiring needs, explore Huntlo Source for product workflows, or create an account to get started.",
  },
] as const;
