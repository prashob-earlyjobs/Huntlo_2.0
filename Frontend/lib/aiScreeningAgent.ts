import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_SCREENING_AGENT_PATH = "/ai-screening-agent";

export const AI_SCREENING_AGENT_SEO = {
  title: "AI Screening Agent & Hiring Decision Intelligence | Huntlo",
  description:
    "Huntlo Hiring Decision Intelligence helps recruiting teams make better hiring decisions — combining candidate context, hiring confidence, and business alignment so talent is understood, not just filtered faster.",
  ogTitle: "Great Hiring Isn't About Screening Faster. It's About Making Better Hiring Decisions.",
  ogDescription:
    "Great candidates shouldn't be filtered faster. They should be better understood. Explore Huntlo AI Screening Agents.",
} as const;

export function aiScreeningAgentMetadata() {
  return buildPageMetadata({
    title: AI_SCREENING_AGENT_SEO.title,
    description: AI_SCREENING_AGENT_SEO.description,
    ogTitle: AI_SCREENING_AGENT_SEO.ogTitle,
    ogDescription: AI_SCREENING_AGENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_SCREENING_AGENT_PATH,
  });
}

export const AI_SCREENING_AGENT_GEO = {
  askTopic: "Huntlo Hiring Decision Intelligence",
  askPrompt:
    "What is Huntlo Hiring Decision Intelligence on /ai-screening-agent (https://www.huntlo.ai/ai-screening-agent)? How is an AI Screening Agent different from candidate screening software, and how does it improve hiring decisions?",
} as const;

export const HERO_DECISION_FLOW = [
  "Candidate Discovery",
  "Candidate Context",
  "Hiring Readiness",
  "Hiring Confidence",
  "Interview Intelligence",
  "Hiring Decision Intelligence",
  "Business Alignment",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const EVALUATE_DIMENSIONS = [
  "People",
  "Context",
  "Communication",
  "Experiences",
  "Business priorities",
  "Hiring intent",
  "Talent alignment",
] as const;

export const TRADITIONAL_SCREENING = [
  "Applications",
  "Resumes",
  "Keywords",
  "Assessments",
  "Interviews",
  "Hire",
] as const;

export const MODERN_HIRING = [
  "Candidate Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Hiring Readiness",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
] as const;

export const DECISION_COMBINES = [
  "Candidate Context",
  "Business Priorities",
  "Hiring Confidence",
  "Interview Intelligence",
  "Workflow Intelligence",
  "Talent Intelligence",
  "Hiring Outcomes",
] as const;

export const LEARNING_LOOP = [
  "Candidate Signals",
  "Business Priorities",
  "Hiring Readiness",
  "Interview Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const MEET_HUNTLO_FLOW = [
  "AI Screening Agents",
  "Candidate Intelligence",
  "Hiring Decision Intelligence",
  "Interview Intelligence",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const DECISION_IMPROVES = [
  "Recruiter productivity",
  "Hiring confidence",
  "Candidate experiences",
  "Hiring velocity",
  "Business alignment",
  "Talent relationships",
] as const;

export const AGENT_FLOW = [
  "AI Screening Agent",
  "Candidate Context",
  "Hiring Confidence",
  "Interview Intelligence",
  "Business Alignment",
  "Hiring Outcomes",
  "Recruiter Decisions",
] as const;

export const INFRA_CHANGES = [
  "Hiring outcomes",
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring confidence",
] as const;

export const FUTURE_EQUATION = [
  "People",
  "Relationships",
  "Context",
  "Business Priorities",
  "Hiring Intelligence",
  "Hiring Outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Global hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Compliance",
  "Scalability",
  "Integrations",
  "Recruiter productivity",
  "AI workflows",
] as const;

export const AI_SCREENING_AGENT_FAQS = [
  {
    question: "What is an AI Screening Agent?",
    answer:
      "An AI Screening Agent helps recruiting teams make better hiring decisions by understanding candidate context, hiring confidence, interview intelligence, and business alignment — not by filtering candidates faster alone.",
  },
  {
    question: "How is it different from candidate screening software?",
    answer:
      "Traditional screening software focuses on resumes, keywords, assessments, and rankings. Hiring Decision Intelligence focuses on which candidate creates the greatest confidence for a hiring outcome.",
  },
  {
    question: "What is Hiring Decision Intelligence?",
    answer:
      "Hiring Decision Intelligence continuously understands candidate context, business priorities, hiring confidence, interview intelligence, workflow intelligence, talent intelligence, and hiring outcomes — before decisions are made.",
  },
  {
    question: "How does Huntlo improve hiring outcomes?",
    answer:
      "Huntlo connects AI Screening Agents with candidate intelligence, hiring decision intelligence, interview intelligence, hiring confidence, and business alignment so decisions are understanding-driven, not filtering-driven.",
  },
  {
    question: "Can enterprises customize hiring workflows?",
    answer:
      "Yes. Enterprise teams can operate connected hiring decision workflows with governance, compliance, integrations, scalability, and multi-recruiter support.",
  },
  {
    question: "How do AI Recruiting Agents improve recruiter productivity?",
    answer:
      "AI Screening Agents continuously learn from signals, readiness, confidence, and outcomes — helping recruiters spend less time on incomplete evaluations and more time on high-confidence decisions.",
  },
  {
    question: "Can Huntlo support technical hiring?",
    answer:
      "Yes. Hiring Decision Intelligence is built for technical hiring teams that need deeper context around skills, readiness, confidence, and business alignment — not keyword matching alone.",
  },
  {
    question: "Is this an ATS scorecard or resume ranking product?",
    answer:
      "No. The page and product direction focus on Hiring Decision Intelligence — understanding talent for better decisions — rather than ATS scorecards, candidate rankings, or resume scoring dashboards.",
  },
  {
    question: "What should teams ask instead of which candidate to reject?",
    answer:
      "Ask which candidate creates the greatest confidence for this hiring outcome — based on context, readiness, interview intelligence, and business alignment.",
  },
  {
    question: "Is hiring becoming screening-driven or intelligence-driven?",
    answer:
      "Intelligence-driven. Modern hiring isn't slowed primarily by inability to screen — it's slowed by decisions made without sufficient context, intelligence, and business alignment.",
  },
  {
    question: "Is hiring intelligence becoming infrastructure?",
    answer:
      "Yes. Future enterprises will ask which hiring decisions create the greatest business outcomes, not only which screening software to purchase.",
  },
  {
    question: "Who is AI Screening Agent built for?",
    answer:
      "Recruiters, hiring managers, CHROs, VP Talent Acquisition, founders, technical hiring teams, GCC leaders, and enterprise leaders who need better decisions — not faster filters.",
  },
  {
    question: "Does Huntlo replace recruiter or hiring manager judgment?",
    answer:
      "No. Huntlo is built for Human + AI hiring. AI Screening Agents improve context and confidence while humans remain responsible for relationships, judgment, and final decisions.",
  },
  {
    question: "How does this relate to Hiring Readiness Intelligence?",
    answer:
      "Hiring Readiness helps identify who is ready for meaningful hiring conversations. Hiring Decision Intelligence deepens confidence, interview intelligence, and business alignment before decisions are made.",
  },
  {
    question: "Will AI Screening Agents never stop learning?",
    answer:
      "They continuously learn from candidate signals, business priorities, readiness, interview intelligence, hiring confidence, outcomes, and recruiter decisions.",
  },
  {
    question: "How does this fit Huntlo's broader stack?",
    answer:
      "Huntlo is AI Hiring Intelligence Infrastructure. AI Screening Agents connect Candidate Intelligence, Hiring Decision Intelligence, Interview Intelligence, Hiring Confidence, Business Alignment, Hiring Outcomes, and AI Hiring Infrastructure.",
  },
  {
    question: "Can Huntlo support executive and GCC hiring?",
    answer:
      "Yes. The approach is built for enterprise, GCC, technical, executive, agency, staffing, and global hiring environments.",
  },
  {
    question: "How do great hiring decisions create great businesses?",
    answer:
      "Future teams optimize hiring outcomes rather than screening workflows — continuously improving productivity, confidence, experiences, velocity, alignment, and talent relationships.",
  },
  {
    question: "What's the difference between evaluating and understanding candidates?",
    answer:
      "Evaluations often focus on applications, resumes, and assessments. Understanding combines people, context, communication, experiences, priorities, intent, and talent alignment into hiring intelligence.",
  },
  {
    question: "How does Huntlo connect screening to interviews?",
    answer:
      "By connecting readiness, confidence, and interview intelligence so the right conversations happen with better context — before and during interviews.",
  },
  {
    question: "Is modern recruiting filtering-driven or understanding-driven?",
    answer:
      "Understanding-driven. The future belongs to understanding candidates, not filtering candidates.",
  },
  {
    question: "How do I get started with Huntlo AI Screening Agents?",
    answer:
      "Book a demo to see Hiring Decision Intelligence in your process, explore Hiring Readiness and related pages, or create an account to get started.",
  },
] as const;
