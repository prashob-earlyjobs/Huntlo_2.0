import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const CANDIDATE_ORCHESTRATION_PATH = "/candidate-orchestration";

export const CANDIDATE_ORCHESTRATION_SEO = {
  title: "Candidate Experience Intelligence™ | Huntlo",
  description:
    "Great hiring doesn't move candidates through pipelines — it creates exceptional experiences. Huntlo Candidate Experience Intelligence™ orchestrates conversations, momentum, and hiring outcomes for Human + AI Hiring.",
  ogTitle: "Candidates Don't Experience Hiring Pipelines. They Experience Conversations.",
  ogDescription:
    "Welcome to Candidate Experience Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function candidateOrchestrationMetadata() {
  return buildPageMetadata({
    title: CANDIDATE_ORCHESTRATION_SEO.title,
    description: CANDIDATE_ORCHESTRATION_SEO.description,
    ogTitle: CANDIDATE_ORCHESTRATION_SEO.ogTitle,
    ogDescription: CANDIDATE_ORCHESTRATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: CANDIDATE_ORCHESTRATION_PATH,
  });
}

export const CANDIDATE_ORCHESTRATION_GEO = {
  askTopic: "Huntlo Candidate Experience Intelligence™",
  askPrompt:
    "What is Huntlo Candidate Experience Intelligence™ on /candidate-orchestration (https://www.huntlo.ai/candidate-orchestration)? How is Candidate Orchestration™ different from candidate pipelines or ATS stages, and how does it improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Candidate Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Candidate Experiences",
  "Hiring Momentum",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const CANDIDATES_FORGET = [
  "ATS workflows",
  "Hiring stages",
  "Recruitment processes",
  "Automation sequences",
] as const;

export const CANDIDATES_REMEMBER = [
  "Conversations",
  "Transparency",
  "Responsiveness",
  "Relationships",
  "Experiences",
] as const;

export const ORG_STRUGGLES = [
  "Candidate drop-offs",
  "Hiring delays",
  "Disengagement",
  "Slower hiring cycles",
  "Fragmented experiences",
] as const;

export const EXPERIENCE_FLOW = [
  "Candidate Intent",
  "Candidate Context",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Talent Discovery",
    description: "Understand exceptional talent.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Context",
    description: "Continuously understand candidate signals.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Candidate Conversations",
    description: "Create meaningful relationships.",
    href: "/candidate-engagement",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain candidate engagement intelligently.",
    href: "/follow-up-automation",
    span: "md:col-span-2",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward seamlessly.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Improve hiring decisions continuously.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around people.",
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
  "Candidate Experiences",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const HUMAN_AI_EQUATION = [
  "People",
  "AI Intelligence",
  "Conversation Intelligence",
  "Workflow Intelligence",
] as const;

export const TRADITIONAL_JOURNEY = [
  "Applied",
  "Waiting",
  "Interview",
  "Waiting",
  "Offer",
  "Waiting",
] as const;

export const FUTURE_JOURNEY = [
  "Discover",
  "Understand",
  "Engage",
  "Maintain momentum",
  "Improve confidence",
  "Accelerate outcomes",
] as const;

export const INFRA_CHANGES = [
  "Hiring velocity",
  "Recruiter productivity",
  "Candidate engagement",
  "Hiring confidence",
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
  "Enterprise governance",
  "Human + AI Hiring",
  "Workflow intelligence",
  "Compliance",
  "Scalability",
  "Integrations",
] as const;

export const STACK_TODAY = [
  "Candidate pipeline",
  "Hiring stages",
  "Recruitment processes",
  "Operational complexity",
] as const;

export const STACK_TOMORROW = [
  "Candidate Experience Intelligence™",
  "Conversation Intelligence™",
  "Hiring Momentum™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
] as const;

export const FUTURE_NOT = [
  "Recruitment processes",
  "Hiring stages",
  "Candidate pipelines",
] as const;

export const FUTURE_YES = [
  "Candidate Experience Intelligence™",
  "Human + AI Hiring™",
  "Hiring Momentum Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const CANDIDATE_ORCHESTRATION_FAQS = [
  {
    question: "What is Candidate Experience Intelligence™?",
    answer:
      "It is how hiring continuously orchestrates conversations, experiences, momentum, and outcomes — so candidates experience intelligence, not fragmented pipelines.",
  },
  {
    question: "What is Candidate Orchestration™?",
    answer:
      "Candidate Orchestration™ connects discovery, context, conversations, experiences, momentum, confidence, and outcomes into one intelligent candidate journey.",
  },
  {
    question: "How is this different from a candidate pipeline?",
    answer:
      "Pipelines move people through stages. Candidate Experience Intelligence™ continuously improves how candidates feel, engage, and progress toward hiring outcomes.",
  },
  {
    question: "What do candidates remember?",
    answer:
      "Not ATS workflows, hiring stages, recruitment processes, or automation sequences — they remember conversations, transparency, responsiveness, relationships, and experiences.",
  },
  {
    question: "Why do organizations lose exceptional talent?",
    answer:
      "Not because they lack hiring tools — because experiences fragment across emails, interviews, follow-ups, workflows, and disconnected systems.",
  },
  {
    question: "Should hiring orchestrate stages or experiences?",
    answer:
      "Experiences. Great hiring intelligently orchestrates conversations, experiences, momentum, and hiring outcomes — not stages, reminders, and processes alone.",
  },
  {
    question: "Do recruiters still manage candidate journeys manually?",
    answer:
      "They shouldn't. Candidate Experience Intelligence™ continuously improves journeys without recruiters becoming journey managers.",
  },
  {
    question: "How does Hiring Momentum fit?",
    answer:
      "Hiring Momentum keeps engagement continuous — so candidates don't fall into wait-state gaps between apply, interview, and offer.",
  },
  {
    question: "How does Conversation Intelligence fit?",
    answer:
      "Conversation Intelligence creates meaningful relationships that candidates remember — the core of experience-led hiring.",
  },
  {
    question: "Is candidate experience becoming infrastructure?",
    answer:
      "Yes. Future enterprises will ask how intelligently they can continuously improve candidate experiences — not only which ATS to use.",
  },
  {
    question: "What does tomorrow's candidate journey look like?",
    answer:
      "Discover → Understand → Engage → Maintain Momentum → Improve Confidence → Accelerate Outcomes — powered by Candidate Experience Intelligence™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, recruitment agencies, staffing firms, technical hiring, executive hiring, and global hiring teams.",
  },
  {
    question: "Does AI replace recruiters in candidate experiences?",
    answer:
      "No. People + AI Intelligence + Conversation Intelligence + Workflow Intelligence create hiring outcomes. AI amplifies candidate experiences.",
  },
  {
    question: "Will teams optimize pipelines or experiences?",
    answer:
      "Experiences. Modern organizations won't optimize candidate pipelines — they'll optimize candidate experiences.",
  },
  {
    question: "How does this relate to Huntlo?",
    answer:
      "Huntlo builds Candidate Experience Intelligence™ for Human + AI Hiring — connecting conversations, momentum, and outcomes.",
  },
  {
    question: "Is this an ATS pipeline page?",
    answer:
      "No. This page strictly avoids ATS pipelines, candidate cards, kanban boards, and hiring-stage visuals.",
  },
  {
    question: "What changes when experience becomes infrastructure?",
    answer:
      "Hiring velocity, recruiter productivity, candidate engagement, hiring confidence, and business outcomes — everything intelligently connected.",
  },
  {
    question: "What belongs to the future?",
    answer:
      "Candidate Experience Intelligence™, Human + AI Hiring™, Hiring Momentum Intelligence™, and Better Hiring Outcomes™.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Candidate Experiences, see Huntlo in action, or continue into Conversation Intelligence and Hiring Momentum.",
  },
  {
    question: "How does this relate to Workflow Orchestration?",
    answer:
      "Workflow Orchestration focuses on Hiring Intelligence Orchestration™. Candidate Orchestration focuses on experience, conversations, and momentum from the candidate's perspective.",
  },
  {
    question: "What is the problem if not hiring operations?",
    answer:
      "Candidate experiences — drop-offs, delays, disengagement, slower cycles, and fragmented journeys.",
  },
  {
    question: "Can enterprises scale Candidate Experience Intelligence™?",
    answer:
      "Yes. Supporting governance, Human + AI Hiring, Workflow Intelligence, compliance, scalability, and integrations.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring creates great experiences — and Huntlo owns Candidate Experience Intelligence™ for the future of Human + AI Hiring.",
  },
  {
    question: "Welcome to the future of candidate experiences — what does that mean?",
    answer:
      "Candidates don't remember hiring workflows. They remember how organizations made them feel. The next generation optimizes experiences, not pipelines.",
  },
] as const;
