import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const HIRING_WORKFLOWS_PATH = "/hiring-workflows";

export const HIRING_WORKFLOWS_SEO = {
  title: "Hiring Workflows — Intelligent Recruiting Workflows | Huntlo",
  description:
    "Huntlo connects candidate discovery, intelligence, engagement, and hiring operations into intelligent hiring workflows designed for modern recruiting teams.",
  ogTitle: "The Future of Hiring Isn't Faster Workflows. It's Better Hiring Workflows.",
  ogDescription:
    "Modern recruiting isn't slowed down by individual tasks — it's slowed down by disconnected workflows. Explore Huntlo's intelligent hiring workflows.",
} as const;

export function hiringWorkflowsMetadata() {
  return buildPageMetadata({
    title: HIRING_WORKFLOWS_SEO.title,
    description: HIRING_WORKFLOWS_SEO.description,
    ogTitle: HIRING_WORKFLOWS_SEO.ogTitle,
    ogDescription: HIRING_WORKFLOWS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: HIRING_WORKFLOWS_PATH,
  });
}

export const HIRING_WORKFLOWS_GEO = {
  askTopic: "Huntlo Hiring Workflows",
  askPrompt:
    "What are Huntlo Hiring Workflows (https://www.huntlo.ai/hiring-workflows)? How do intelligent hiring workflows connect candidate discovery, engagement, screening, and recruiter productivity?",
} as const;

export const HERO_FLOW = [
  "Hiring Requirement",
  "Candidate Discovery",
  "Talent Intelligence",
  "AI Engagement",
  "Candidate Conversations",
  "AI Screening",
  "Assessments",
  "Interview Intelligence",
  "Hiring Decisions",
  "Business Outcomes",
  "Successful Hire",
] as const;

export const OPERATIONAL_COMPLEXITY = [
  "Candidate Discovery",
  "Emails",
  "WhatsApp",
  "Follow-ups",
  "Interviews",
  "Hiring managers",
  "Talent pipelines",
  "Scheduling",
  "Assessments",
  "Analytics",
  "Communication",
  "More communication",
  "More follow-ups",
  "Hiring decisions",
] as const;

export const DISCONNECTED_RESULTS = [
  "Slower hiring",
  "Candidate drop-offs",
  "Repetitive work",
  "Recruiter fatigue",
  "Poor candidate experiences",
  "Fragmented intelligence",
  "Operational inefficiencies",
] as const;

export const WORKFLOW_UNDERSTANDS = [
  "Context",
  "Hiring priorities",
  "Candidate signals",
  "Recruiter actions",
  "Business outcomes",
  "Talent intelligence",
] as const;

export const WORKFLOW_IMPROVES = [
  "Discovery",
  "Intelligence",
  "Engagement",
  "Coordination",
  "Automation",
  "Productivity",
  "Hiring Outcomes",
] as const;

export const CONNECTED_WORKFLOW = [
  { label: "Job Requirement", href: "/platform" },
  { label: "Candidate Discovery", href: "/sourcing" },
  { label: "AI Intelligence", href: "/people-scout" },
  { label: "Candidate Engagement", href: "/candidate-pool" },
  { label: "Outreach Workflows", href: "/candidate-pool" },
  { label: "Screening", href: "/screening" },
  { label: "Interview Coordination", href: "/interview" },
  { label: "Hiring Intelligence", href: "/platform" },
  { label: "Recruiter Decisions", href: "/hiring-os" },
  { label: "Business Outcomes", href: "/platform" },
  { label: "Hire", href: "/platform" },
] as const;

export const DISCOVERY_INFLUENCES = [
  "Engagement",
  "Screening",
  "Interviews",
  "Productivity",
  "Hiring decisions",
] as const;

export const CANDIDATE_REMEMBERS = [
  "Responsiveness",
  "Communication",
  "Consistency",
  "Candidate experiences",
] as const;

export const RECRUITER_MORE_TIME = [
  "Hiring",
  "Evaluating talent",
  "Building relationships",
  "Making hiring decisions",
] as const;

export const RECRUITER_LESS_TIME = [
  "Updating systems",
  "Switching tabs",
  "Managing processes",
  "Following up manually",
] as const;

export const HIRING_INTELLIGENCE = [
  "Talent pipelines",
  "Engagement signals",
  "Hiring readiness",
  "Candidate intent",
  "Recruiter productivity",
  "Workflow performance",
  "Business outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "High-volume hiring", href: "/solutions" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Scalability",
  "Compliance",
  "Integrations",
  "Governance",
  "Enterprise workflows",
  "Audit logs",
] as const;

export const FUTURE_UNDERSTANDS = [
  "People",
  "Intelligence",
  "Priorities",
  "Business needs",
  "Productivity",
  "Talent",
] as const;

export const AI_MANAGES = [
  "Workflows",
  "Intelligence",
  "Coordination",
  "Repetitive tasks",
] as const;

export const RECRUITERS_MANAGE = [
  "People",
  "Relationships",
  "Hiring decisions",
  "Business impact",
] as const;

export const HIRING_WORKFLOWS_FAQS = [
  {
    question: "What are Hiring Workflows?",
    answer:
      "Hiring Workflows are the connected sequences of decisions and actions that move a role from requirement to hire — including discovery, engagement, screening, interviews, coordination, and hiring decisions.",
  },
  {
    question: "How are intelligent hiring workflows different from traditional recruiting processes?",
    answer:
      "Traditional processes often treat stages as disconnected steps across tools. Intelligent hiring workflows connect context, candidate signals, recruiter actions, and outcomes so work flows continuously instead of fragmenting across systems.",
  },
  {
    question: "What is Workflow Intelligence?",
    answer:
      "Workflow Intelligence helps teams understand how discovery, engagement, screening, interviews, productivity, and business outcomes interact — so recruiters can improve the full journey, not just isolated tasks.",
  },
  {
    question: "Can hiring workflows be customized?",
    answer:
      "Huntlo supports connected hiring flows across sourcing, outreach, screening, and interviews. Teams can adapt how candidates move through those workflows based on their hiring process and priorities.",
  },
  {
    question: "Can enterprises customize workflows?",
    answer:
      "Yes. Enterprise teams can operate connected workflows for sourcing, engagement, screening, and interview coordination, with support for integrations, governance, and multi-recruiter hiring operations.",
  },
  {
    question: "How does Huntlo improve recruiter productivity?",
    answer:
      "By reducing time spent switching tabs, updating systems, managing fragmented processes, and following up manually — so recruiters spend more time evaluating talent, building relationships, and making hiring decisions.",
  },
  {
    question: "Why do disconnected workflows slow hiring?",
    answer:
      "Disconnected workflows create slower coordination, candidate drop-offs, repetitive work, recruiter fatigue, fragmented intelligence, and weaker candidate experiences — even when individual tools are strong.",
  },
  {
    question: "Is candidate discovery a workflow?",
    answer:
      "Yes. Candidate discovery influences engagement, screening, interviews, productivity, and hiring decisions. It is where hiring begins inside a larger connected journey — not an isolated activity.",
  },
  {
    question: "Is candidate engagement a workflow?",
    answer:
      "Yes. Candidates remember responsiveness, communication, consistency, and experience quality. Engagement workflows should continuously improve those moments rather than add operational complexity.",
  },
  {
    question: "What is hiring intelligence in Huntlo workflows?",
    answer:
      "Hiring intelligence helps teams understand talent pipelines, engagement signals, hiring readiness, candidate intent, recruiter productivity, workflow performance, and business outcomes before decisions are made.",
  },
  {
    question: "How does Huntlo support large hiring teams?",
    answer:
      "Huntlo is designed for multi-recruiter operations with connected workflows across discovery, engagement, screening, and interviews, plus enterprise needs like integrations, governance, scalability, and audit logs.",
  },
  {
    question: "What industries benefit most from intelligent hiring workflows?",
    answer:
      "Enterprise hiring teams, GCCs, technical hiring teams, high-volume hiring organizations, staffing firms, and recruitment agencies benefit most when workflows must stay connected at scale.",
  },
  {
    question: "Does Huntlo replace an ATS?",
    answer:
      "Huntlo is designed as hiring infrastructure and a Hiring Operating System that connects workflows end to end. Teams can use Huntlo alongside existing systems where integrations are supported.",
  },
  {
    question: "How is this different from adding more recruiting software?",
    answer:
      "Adding more software rarely fixes disconnected processes. Intelligent workflow design connects discovery, intelligence, engagement, coordination, and outcomes through one operating layer.",
  },
  {
    question: "What does it mean that hiring happens in connected decisions?",
    answer:
      "Every hiring decision influences another. Discovery affects engagement, engagement affects interviews, and interviews affect outcomes. Connected workflows reflect that reality instead of treating stages as isolated boxes.",
  },
  {
    question: "How do hiring workflows improve candidate experience?",
    answer:
      "Connected workflows reduce delays and inconsistency by keeping outreach, follow-ups, screening, and interview coordination moving — so candidates experience responsiveness rather than operational friction.",
  },
  {
    question: "What is the future of hiring workflows?",
    answer:
      "The future is software that works around recruiters — continuously understanding people, intelligence, priorities, business needs, productivity, and talent while adapting around hiring outcomes.",
  },
  {
    question: "Will recruiters still manage workflows in the future?",
    answer:
      "The future recruiter will design hiring outcomes more than manage software. AI can help manage workflows, intelligence, coordination, and repetitive tasks while recruiters manage people, relationships, decisions, and business impact.",
  },
  {
    question: "How does Huntlo connect AI recruiting agents to workflows?",
    answer:
      "AI recruiting agents support sourcing, outreach, screening, interviews, and scheduling inside connected hiring workflows — assisting recruiters continuously rather than operating as isolated automations.",
  },
  {
    question: "Is Huntlo suitable for GCC and staffing workflows?",
    answer:
      "Yes. GCC leaders, staffing firms, and recruitment agencies can use Huntlo to run scalable, connected hiring workflows across specialized and high-volume recruiting needs.",
  },
  {
    question: "Where can I learn how Huntlo's Hiring OS relates to workflows?",
    answer:
      "Explore the Huntlo Hiring OS and AI Hiring Infrastructure pages for the broader operating model, then use Hiring Workflows to understand how connected decisions run day to day.",
  },
  {
    question: "How do I get started with Huntlo hiring workflows?",
    answer:
      "Book a demo to see workflows in the context of your hiring process, explore the Huntlo platform, or create an account to start connecting discovery, engagement, and hiring operations.",
  },
] as const;
