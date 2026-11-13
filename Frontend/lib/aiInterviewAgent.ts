import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_INTERVIEW_AGENT_PATH = "/ai-interview-agent";

export const AI_INTERVIEW_AGENT_SEO = {
  title: "AI Interview Agent & Hiring Conversation Intelligence | Huntlo",
  description:
    "Huntlo Hiring Conversation Intelligence helps recruiting teams create better hiring conversations — combining candidate context, hiring readiness, and interview intelligence so interviews create confidence, not complexity.",
  ogTitle: "Great Hiring Isn't About Conducting Better Interviews. It's About Creating Better Hiring Conversations.",
  ogDescription:
    "Great hiring decisions begin with better conversations. Interviews are conversations — not checkpoints. Explore Huntlo AI Interview Agents.",
} as const;

export function aiInterviewAgentMetadata() {
  return buildPageMetadata({
    title: AI_INTERVIEW_AGENT_SEO.title,
    description: AI_INTERVIEW_AGENT_SEO.description,
    ogTitle: AI_INTERVIEW_AGENT_SEO.ogTitle,
    ogDescription: AI_INTERVIEW_AGENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_INTERVIEW_AGENT_PATH,
  });
}

export const AI_INTERVIEW_AGENT_GEO = {
  askTopic: "Huntlo Hiring Conversation Intelligence",
  askPrompt:
    "What is Huntlo Hiring Conversation Intelligence on /ai-interview-agent (https://www.huntlo.ai/ai-interview-agent)? How is an AI Interview Agent different from interview management software, and how does it improve hiring conversations and decisions?",
} as const;

export const HERO_INTERVIEW_FLOW = [
  "Candidate Discovery",
  "Candidate Context",
  "Hiring Readiness",
  "Interview Intelligence",
  "Hiring Conversations",
  "Business Alignment",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const EVALUATE_DIMENSIONS = [
  "Technical capabilities",
  "Communication skills",
  "Business alignment",
  "Problem-solving abilities",
  "Candidate intent",
  "Hiring readiness",
  "Cultural alignment",
  "Leadership potential",
] as const;

export const TRADITIONAL_HIRING = [
  "Interview scheduled",
  "Interview conducted",
  "Scorecard submitted",
  "Candidate evaluated",
  "Hiring decision",
] as const;

export const MODERN_HIRING = [
  "Candidate Context",
  "Hiring Readiness",
  "Interview Intelligence",
  "Hiring Conversations",
  "Business Alignment",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const CONVERSATION_COMBINES = [
  "Candidate Context",
  "Business Priorities",
  "Hiring Readiness",
  "Interview Intelligence",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const LEARNING_LOOP = [
  "Candidate Signals",
  "Hiring Confidence",
  "Interview Intelligence",
  "Business Alignment",
  "Candidate Experiences",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const MEET_HUNTLO_FLOW = [
  "Candidate Discovery",
  "Candidate Intelligence",
  "Hiring Conversation Intelligence",
  "AI Interview Agents",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const CONVERSATION_IMPROVES = [
  "Hiring confidence",
  "Recruiter productivity",
  "Business alignment",
  "Hiring outcomes",
  "Candidate experiences",
  "Hiring velocity",
] as const;

export const AGENT_FLOW = [
  "AI Interview Agent",
  "Candidate Context",
  "Hiring Readiness",
  "Interview Intelligence",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
  "Recruiter Decisions",
] as const;

export const CANDIDATES_REMEMBER = [
  "Conversations",
  "Experiences",
  "Transparency",
  "Responsiveness",
  "Relationships",
] as const;

export const CANDIDATES_FORGET = [
  "Scorecards",
  "Interview workflows",
  "ATS processes",
  "Scheduling tools",
] as const;

export const INFRA_CHANGES = [
  "Hiring outcomes",
  "Recruiter productivity",
  "Candidate experiences",
  "Business alignment",
] as const;

export const FUTURE_EQUATION = [
  "People",
  "Relationships",
  "Context",
  "Hiring Intelligence",
  "Business Outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Global hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Compliance",
  "Integrations",
  "Scalability",
  "Recruiter productivity",
  "AI workflows",
] as const;

export const AI_INTERVIEW_AGENT_FAQS = [
  {
    question: "What is an AI Interview Agent?",
    answer:
      "An AI Interview Agent helps recruiting teams create better hiring conversations by understanding candidate context, hiring readiness, interview intelligence, and business alignment — so interviews create confidence, not complexity.",
  },
  {
    question: "How is it different from interview management software?",
    answer:
      "Interview management software often centers on scheduling, scorecards, and workflow completion. Hiring Conversation Intelligence focuses on which hiring conversation matters most and how it creates confidence in hiring decisions.",
  },
  {
    question: "What is Hiring Conversation Intelligence?",
    answer:
      "Hiring Conversation Intelligence continuously understands candidate context, business priorities, hiring readiness, interview intelligence, workflow intelligence, hiring confidence, and hiring outcomes — before interviews begin.",
  },
  {
    question: "How does Huntlo improve hiring decisions?",
    answer:
      "Huntlo connects discovery, candidate intelligence, hiring conversation intelligence, AI Interview Agents, hiring confidence, and business alignment so interviews become intelligent conversations designed around business outcomes.",
  },
  {
    question: "Can enterprises customize interview workflows?",
    answer:
      "Yes. Enterprise teams can operate connected interview and hiring conversation workflows with governance, compliance, integrations, scalability, and multi-recruiter support.",
  },
  {
    question: "How do AI Interview Agents improve candidate experiences?",
    answer:
      "By helping conversations begin with context and readiness — so candidates experience meaningful, transparent, responsive interactions rather than transactional interview checkpoints.",
  },
  {
    question: "Can Huntlo support technical hiring?",
    answer:
      "Yes. Hiring Conversation Intelligence is built for technical hiring teams that need deeper context around capabilities, problem-solving, readiness, and business alignment.",
  },
  {
    question: "Is this an AI interviewer avatar or interview bot?",
    answer:
      "No. Huntlo positions AI Interview Agents as part of AI Hiring Intelligence Infrastructure — not AI avatars, interview bots, scorecards, or chatbot interfaces.",
  },
  {
    question: "What should teams ask instead of which interview should happen next?",
    answer:
      "Ask which hiring conversation matters most right now — based on candidate context, readiness, business priorities, and hiring confidence.",
  },
  {
    question: "Is Interview Intelligence becoming infrastructure?",
    answer:
      "Yes. Modern organizations will ask which conversations create the greatest confidence in hiring decisions, not only which interview software to use.",
  },
  {
    question: "Who is AI Interview Agent built for?",
    answer:
      "Recruiters, hiring managers, CHROs, VP Talent Acquisition, founders, enterprise leaders, GCC leaders, and technical hiring teams building Human + AI hiring.",
  },
  {
    question: "Does Huntlo replace human interviews?",
    answer:
      "No. Huntlo is built for Human + AI hiring. AI Interview Agents improve context and conversation quality while humans remain responsible for relationships, judgment, and decisions.",
  },
  {
    question: "How does this relate to Interview Orchestration?",
    answer:
      "Interview Orchestration focuses on Interview Intelligence as a category. The AI Interview Agent page deepens that with Hiring Conversation Intelligence and agent-led continuous learning.",
  },
  {
    question: "What do candidates remember about interviews?",
    answer:
      "Candidates don't remember scorecards, interview workflows, ATS processes, or scheduling tools. They remember conversations, experiences, transparency, responsiveness, and relationships.",
  },
  {
    question: "Is modern recruiting interview-driven or conversation-driven?",
    answer:
      "Conversation-driven. Modern recruiting isn't becoming interview driven — it's becoming conversation and intelligence driven.",
  },
  {
    question: "Will AI Interview Agents never stop learning?",
    answer:
      "They continuously learn from candidate signals, hiring confidence, interview intelligence, business alignment, candidate experiences, hiring outcomes, and recruiter decisions.",
  },
  {
    question: "How does this fit Huntlo's broader stack?",
    answer:
      "Huntlo is AI Hiring Intelligence Infrastructure. AI Interview Agents connect Candidate Discovery, Candidate Intelligence, Hiring Conversation Intelligence, Hiring Confidence, Business Alignment, Hiring Outcomes, and AI Hiring Infrastructure.",
  },
  {
    question: "How do great hiring conversations create great experiences?",
    answer:
      "Future teams optimize candidate experiences rather than interview workflows — continuously improving confidence, productivity, alignment, outcomes, experiences, and velocity.",
  },
  {
    question: "Can Huntlo support executive and GCC hiring?",
    answer:
      "Yes. The approach is built for enterprise, GCC, executive, technical, agency, staffing, and global hiring environments.",
  },
  {
    question: "Should interviews feel like evaluations or conversations?",
    answer:
      "Conversations. Interviews shouldn't feel transactional. They should create confidence, context, and clarity for everyone involved.",
  },
  {
    question: "How does Huntlo connect interviews to hiring outcomes?",
    answer:
      "By connecting context, readiness, interview intelligence, hiring conversations, business alignment, and hiring confidence into one intelligence layer behind decisions.",
  },
  {
    question: "How do I get started with Huntlo AI Interview Agents?",
    answer:
      "Book a demo to see Hiring Conversation Intelligence in your process, explore Interview Intelligence and related pages, or create an account to get started.",
  },
] as const;
