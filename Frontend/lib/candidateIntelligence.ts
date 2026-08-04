import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const CANDIDATE_INTELLIGENCE_PATH = "/candidate-intelligence";

export const CANDIDATE_INTELLIGENCE_SEO = {
  title: "Candidate Intelligence™ | Huntlo",
  description:
    "Great hiring doesn't understand resumes — it understands people. Huntlo Candidate Intelligence™ helps organizations continuously understand candidate context, hiring intent, momentum, and outcomes beyond profiles and databases.",
  ogTitle: "Candidates Are More Than Their Resumes. Great Hiring Begins With Understanding People.",
  ogDescription:
    "Candidate Intelligence™ — built for Human + AI Hiring.",
} as const;

export function candidateIntelligenceMetadata() {
  return buildPageMetadata({
    title: CANDIDATE_INTELLIGENCE_SEO.title,
    description: CANDIDATE_INTELLIGENCE_SEO.description,
    ogTitle: CANDIDATE_INTELLIGENCE_SEO.ogTitle,
    ogDescription: CANDIDATE_INTELLIGENCE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: CANDIDATE_INTELLIGENCE_PATH,
  });
}

export const CANDIDATE_INTELLIGENCE_GEO = {
  askTopic: "Huntlo Candidate Intelligence™",
  askPrompt:
    "What is Huntlo Candidate Intelligence™ on /candidate-intelligence (https://www.huntlo.ai/candidate-intelligence)? How is it different from candidate profiles, resume databases, or candidate enrichment software?",
} as const;

export const HERO_FLOW = [
  "Candidate Signals",
  "Candidate Context",
  "Candidate Intelligence",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_UNDERSTANDS = [
  "Name",
  "Experience",
  "Skills",
  "Location",
  "Resume",
  "Candidate profile",
] as const;

export const MODERN_UNDERSTANDS = [
  "Candidate intent",
  "Candidate context",
  "Talent relationships",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
] as const;

export const CONTINUOUS_UNDERSTANDING = [
  "Candidate intent",
  "Hiring readiness",
  "Candidate experiences",
  "Business priorities",
  "Talent relationships",
  "Hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Candidate Context",
    description: "Understand exceptional talent intelligently.",
    href: "/talent-intelligence",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Intent",
    description: "Continuously improve hiring decisions.",
    href: "/vibe-sourcing",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create meaningful candidate experiences.",
    href: "/candidate-orchestration",
    span: "",
  },
  {
    title: "Talent Relationships",
    description: "Build long-term talent engagement.",
    href: "/talent-pipeline",
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
    description: "Move hiring forward continuously.",
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

export const WORKFLOW_LOOP = [
  "Candidate Signals",
  "Hiring Intent",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_DELIVERS = [
  "Profiles",
  "Resumes",
  "Filters",
  "Searches",
  "Databases",
] as const;

export const HUNTLO_DELIVERS = [
  "Candidate Intelligence™",
  "Hiring Intelligence™",
  "Workflow Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
] as const;

export const OUTCOME_IMPROVES = [
  "Candidate understanding",
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring confidence",
  "Hiring velocity",
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
  "Candidate profiles",
  "Resume databases",
  "Recruitment processes",
  "Hiring decisions",
  "Hiring",
] as const;

export const STACK_TOMORROW = [
  "Candidate Intelligence™",
  "Hiring Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Candidate profiles",
  "Recruitment databases",
  "Hiring processes",
] as const;

export const FUTURE_YES = [
  "Candidate Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const CANDIDATE_INTELLIGENCE_FAQS = [
  {
    question: "What is Candidate Intelligence™?",
    answer:
      "It is how organizations continuously understand exceptional talent beyond resumes and databases — including context, intent, conversation readiness, momentum, priorities, and outcomes.",
  },
  {
    question: "How is Candidate Intelligence™ different from candidate profiles?",
    answer:
      "Profiles store static information. Candidate Intelligence™ continuously improves understanding of people — intent, context, relationships, and outcomes.",
  },
  {
    question: "Can Huntlo understand candidate context?",
    answer:
      "Yes. Candidate context is a core layer — helping teams understand talent beyond job titles, years of experience, and skills alone.",
  },
  {
    question: "Does Huntlo improve hiring confidence?",
    answer:
      "Yes. Continuously understanding people before and during conversations improves hiring confidence and decision quality.",
  },
  {
    question: "Can enterprises customize hiring workflows?",
    answer:
      "Yes. Candidate Intelligence™ connects into Workflow Intelligence™ so enterprises can align understanding with governance, priorities, and outcomes.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Human + AI Hiring™ is how people and AI continuously collaborate to understand talent, maintain momentum, and improve hiring outcomes — without replacing recruiters.",
  },
  {
    question: "Is this candidate enrichment software?",
    answer:
      "No. This page sells Candidate Intelligence™ — not enrichment interfaces, resume databases, or profile cards.",
  },
  {
    question: "Why do modern hiring teams struggle?",
    answer:
      "Not because they lack candidate information — because understanding talent requires more than resumes, titles, and skills.",
  },
  {
    question: "What does great hiring require understanding?",
    answer:
      "Candidate context, hiring intent, conversation readiness, hiring momentum, business priorities, and hiring outcomes.",
  },
  {
    question: "What does traditional recruiting understand vs modern hiring?",
    answer:
      "Traditional recruiting understands name, experience, skills, location, resume, and profile. Modern hiring understands intent, context, relationships, conversations, momentum, and outcomes.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which candidate should we hire?” — “Which talent should we continuously understand better?”",
  },
  {
    question: "Should organizations optimize profiles or understanding?",
    answer:
      "Understanding. Modern organizations shouldn't optimize candidate profiles — they should optimize candidate understanding.",
  },
  {
    question: "How does Candidate Intelligence™ work across workflows?",
    answer:
      "Signals flow into hiring intent, conversation intelligence, momentum, workflow intelligence, confidence, and outcomes — everything continuously improving.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms deliver profiles, resumes, filters, searches, and databases. Huntlo delivers Candidate Intelligence™, Hiring Intelligence™, Workflow Intelligence™, Human + AI Hiring™, and Hiring Outcomes™.",
  },
  {
    question: "What improves when organizations continuously improve understanding?",
    answer:
      "Candidate understanding, recruiter productivity, candidate experiences, hiring confidence, hiring velocity, and business outcomes — defining the future of hiring.",
  },
  {
    question: "Is Candidate Intelligence becoming infrastructure?",
    answer:
      "Yes. Tomorrow's stack moves from profiles and resume databases to Candidate Intelligence™, Hiring Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, recruitment agencies, staffing firms, technical hiring, executive hiring, and global hiring teams.",
  },
  {
    question: "How does this relate to Talent Discovery?",
    answer:
      "Talent Discovery finds exceptional talent through intelligence. Candidate Intelligence™ continuously deepens understanding of people across the hiring journey.",
  },
  {
    question: "How does this relate to Talent Intelligence?",
    answer:
      "Talent Intelligence focuses on market and priority context. Candidate Intelligence™ focuses on understanding individual people beyond resumes.",
  },
  {
    question: "How does this relate to Candidate Orchestration?",
    answer:
      "Candidate Orchestration focuses on Candidate Experience Intelligence™. Candidate Intelligence™ is the understanding layer that makes experiences and conversations smarter.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Candidate Intelligence™ is how AI and people continuously understand talent together.",
  },
  {
    question: "Does Huntlo support technical and executive hiring?",
    answer:
      "Yes. Both benefit when understanding goes beyond resumes into context, intent, confidence, and outcomes.",
  },
  {
    question: "Does Huntlo support agencies and staffing firms?",
    answer:
      "Yes. Agencies and staffing firms use Candidate Intelligence™ to improve understanding, confidence, and client hiring outcomes.",
  },
  {
    question: "What is Hiring Momentum Intelligence™?",
    answer:
      "It keeps engagement continuous so understanding doesn't stall between first context and hiring outcomes.",
  },
  {
    question: "What is Conversation Intelligence in this context?",
    answer:
      "Conversation Intelligence turns understanding into meaningful candidate experiences and relationships.",
  },
  {
    question: "Does great hiring begin with resumes?",
    answer:
      "No. Great hiring begins with understanding people — Candidate Intelligence™, Human + AI Hiring™, Hiring Intelligence™, and Better Hiring Outcomes™.",
  },
  {
    question: "Is this an ATS or enrichment interface page?",
    answer:
      "No. This page strictly avoids resumes, candidate profile cards, ATS dashboards, enrichment interfaces, and recruiter stock imagery.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Candidate Intelligence, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring begins with understanding people — and Huntlo owns Candidate Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Can GCC hiring teams use Candidate Intelligence™?",
    answer:
      "Yes. GCC teams use continuous understanding across global priorities with enterprise governance and scale.",
  },
  {
    question: "Everything begins with Candidate Intelligence™ — why?",
    answer:
      "Because organizations that continuously improve understanding of people will define hiring confidence, velocity, experiences, and business outcomes.",
  },
  {
    question: "Welcome to the future of Candidate Intelligence — what does that mean?",
    answer:
      "Organizations stop optimizing profiles and databases, and start continuously understanding people through intelligence.",
  },
] as const;
