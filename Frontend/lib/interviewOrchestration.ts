import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const INTERVIEW_ORCHESTRATION_PATH = "/interview-orchestration";

export const INTERVIEW_ORCHESTRATION_SEO = {
  title: "Interview Intelligence™ | Interview Orchestration | Huntlo",
  description:
    "Great hiring doesn't conduct better interviews — it creates better hiring decisions. Huntlo Interview Intelligence™ continuously understands candidate context, interviewer insights, confidence, and outcomes.",
  ogTitle: "Great Interviews Don't Create Great Hiring. Great Hiring Decisions Do.",
  ogDescription:
    "Welcome to Interview Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function interviewOrchestrationMetadata() {
  return buildPageMetadata({
    title: INTERVIEW_ORCHESTRATION_SEO.title,
    description: INTERVIEW_ORCHESTRATION_SEO.description,
    ogTitle: INTERVIEW_ORCHESTRATION_SEO.ogTitle,
    ogDescription: INTERVIEW_ORCHESTRATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: INTERVIEW_ORCHESTRATION_PATH,
  });
}

export const INTERVIEW_ORCHESTRATION_GEO = {
  askTopic: "Huntlo Interview Intelligence™",
  askPrompt:
    "What is Huntlo Interview Intelligence™ on /interview-orchestration (https://www.huntlo.ai/interview-orchestration)? How is it different from interview scheduling, interview automation, or interview management software?",
} as const;

export const HERO_FLOW = [
  "Candidate Context",
  "Interview Intelligence",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_UNDERSTANDS = [
  "Interview scheduled",
  "Interview completed",
  "Feedback submitted",
  "Candidate ranked",
  "Hiring decision",
] as const;

export const FUTURE_UNDERSTANDS = [
  "Candidate context",
  "Conversation Intelligence",
  "Interview Intelligence",
  "Hiring Confidence",
  "Business alignment",
  "Hiring outcomes",
] as const;

export const INTERVIEW_UNDERSTANDS = [
  "Candidate context",
  "Hiring intent",
  "Interviewer insights",
  "Conversation signals",
  "Hiring confidence",
  "Business priorities",
  "Hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Interview Intelligence",
    description: "Understand candidate conversations intelligently.",
    href: "/ai-interview-agent",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Context",
    description: "Improve hiring decisions continuously.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create exceptional interview experiences.",
    href: "/outreach-engine",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Increase hiring confidence intelligently.",
    href: "/screening-engine",
    span: "md:col-span-2",
  },
  {
    title: "Business Alignment",
    description: "Align hiring with organizational priorities.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters and hiring teams.",
    href: "/recruiting-agents",
    span: "",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward seamlessly.",
    href: "/workflow-orchestration",
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
  "Candidate Context",
  "Interview Intelligence",
  "Hiring Confidence",
  "Conversation Intelligence",
  "Business Alignment",
  "Hiring Momentum",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "Interview scheduling",
  "Interview feedback",
  "Candidate rankings",
  "Workflow automation",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "Interview Intelligence™",
  "Hiring Confidence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const OUTCOME_IMPROVES = [
  "Hiring confidence",
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring outcomes",
  "Interviewer consistency",
  "Business alignment",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "AI Intelligence",
  "Interview Intelligence",
  "Hiring Intelligence",
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
  "Interview scheduling",
  "Interview management",
  "Interview feedback",
  "Hiring decisions",
] as const;

export const STACK_TOMORROW = [
  "Interview Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Interview scheduling",
  "Interview workflows",
  "Feedback collection",
] as const;

export const FUTURE_YES = [
  "Interview Intelligence™",
  "Human + AI Hiring™",
  "Hiring Confidence™",
  "Better Hiring Outcomes™",
] as const;

export const INTERVIEW_ORCHESTRATION_FAQS = [
  {
    question: "What is Interview Intelligence™?",
    answer:
      "It is how organizations continuously understand candidate context, interviewer insights, conversation signals, hiring confidence, priorities, and outcomes — so interviews create better hiring decisions.",
  },
  {
    question: "How is Huntlo different from interview management platforms?",
    answer:
      "Interview management platforms optimize scheduling, feedback forms, and rankings. Interview Intelligence™ optimizes hiring confidence and business outcomes.",
  },
  {
    question: "Can Huntlo improve hiring confidence?",
    answer:
      "Yes. Exceptional hiring continuously understands context, insights, and alignment — so interviews amplify confidence instead of adding fragmentation.",
  },
  {
    question: "Does Huntlo support technical interviews?",
    answer:
      "Yes. Technical hiring teams use Interview Intelligence™ to connect candidate context, conversations, and confidence into better decisions.",
  },
  {
    question: "Can enterprises customize interview workflows?",
    answer:
      "Yes. Interview Intelligence™ connects into Workflow Intelligence™ so enterprises can align interviews with governance, priorities, and outcomes.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Human + AI Hiring™ is how people and AI continuously collaborate. AI doesn't replace interviewers — it amplifies hiring confidence.",
  },
  {
    question: "How does Huntlo improve hiring outcomes?",
    answer:
      "By connecting candidate context, interview intelligence, confidence, alignment, and momentum into hiring outcomes — everything continuously improving.",
  },
  {
    question: "Is this interview scheduling software?",
    answer:
      "No. This page sells Interview Intelligence™ — not calendars, scheduling dashboards, scorecards, or ATS visuals.",
  },
  {
    question: "Why do modern organizations struggle with interviews?",
    answer:
      "Not because they cannot schedule interviews — because interviews remain fragmented across conversations, evaluations, and hiring decisions.",
  },
  {
    question: "What does exceptional hiring continuously understand?",
    answer:
      "Candidate context, interviewer insights, hiring intent, business priorities, hiring confidence, and hiring outcomes.",
  },
  {
    question: "What does traditional recruiting understand vs future hiring?",
    answer:
      "Traditional recruiting understands scheduled, completed, feedback, ranked, and decided. Future hiring understands context, conversations, interview intelligence, confidence, alignment, and outcomes.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which candidate performed best?” — “Which hiring decision creates exceptional business outcomes?”",
  },
  {
    question: "Are interviews becoming intelligence?",
    answer:
      "Yes. Organizations shouldn't optimize interview workflows — they should optimize hiring confidence.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide scheduling, feedback, rankings, workflow automation, and more software. Huntlo provides Interview Intelligence™, Hiring Confidence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "What outcomes does Interview Intelligence create?",
    answer:
      "Improved hiring confidence, candidate experiences, recruiter productivity, hiring outcomes, interviewer consistency, and business alignment.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, recruitment agencies, staffing firms, technical hiring, executive hiring, and global hiring teams.",
  },
  {
    question: "How does this relate to interview scheduling?",
    answer:
      "/interview-scheduling owns Scheduling Intelligence. /interview-orchestration owns Interview Intelligence™ as the decision and conversation category.",
  },
  {
    question: "How does this relate to AI Interview Agents?",
    answer:
      "AI Interview Agents are a product expression of interview support. This page owns Interview Intelligence™ as the category.",
  },
  {
    question: "How does this relate to Hiring Confidence / screening-engine?",
    answer:
      "Hiring Confidence Intelligence™ focuses on decision confidence overall. Interview Intelligence™ deepens confidence through interview conversations and insights.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Interview Intelligence™ is how AI and people continuously improve interview-driven hiring decisions.",
  },
  {
    question: "Do great interviews optimize processes or decisions?",
    answer:
      "Decisions. The next decade won't optimize interview scheduling, workflows, or feedback collection — it will optimize Interview Intelligence™.",
  },
  {
    question: "Does AI replace interviewers?",
    answer:
      "No. Human Intelligence + AI Intelligence + Interview Intelligence + Hiring Intelligence create hiring outcomes. AI amplifies hiring confidence.",
  },
  {
    question: "Is this a calendar or scorecard page?",
    answer:
      "No. This page strictly avoids calendars, scheduling dashboards, scorecards, ATS visuals, and recruiter stock imagery.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Interview Intelligence™, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring begins with great decisions — and Huntlo owns Interview Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Everything begins with Interview Intelligence™ — why?",
    answer:
      "Because exceptional organizations continuously improve confidence, experiences, productivity, outcomes, interviewer consistency, and alignment through intelligent interviews.",
  },
  {
    question: "Can executive hiring use Interview Intelligence™?",
    answer:
      "Yes. Executive hiring benefits when interviews deepen context, confidence, and business alignment — not only process completion.",
  },
  {
    question: "Can staffing firms and agencies use Interview Intelligence?",
    answer:
      "Yes. Agencies and staffing firms use interview intelligence to improve consistency and client hiring outcomes.",
  },
  {
    question: "What is Conversation Intelligence in interviews?",
    answer:
      "Conversation Intelligence creates exceptional interview experiences and turns conversations into signals for hiring confidence.",
  },
  {
    question: "Welcome to the future of Interview Intelligence — what does that mean?",
    answer:
      "Organizations stop optimizing interview processes and start continuously improving Interview Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Can Huntlo support GCC and global interview operations?",
    answer:
      "Yes. Built for global scale with governance, compliance, Enterprise Intelligence, and Human + AI Hiring.",
  },
  {
    question: "How does Hiring Momentum fit with interviews?",
    answer:
      "Hiring Momentum keeps engagement continuous so interview intelligence doesn't stall between conversations and outcomes.",
  },
] as const;
