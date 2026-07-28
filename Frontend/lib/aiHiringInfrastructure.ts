import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_HIRING_INFRASTRUCTURE_PATH = "/ai-hiring-infrastructure";

export const AI_HIRING_INFRASTRUCTURE_SEO = {
  title: "AI Hiring Infrastructure — The Future of Hiring | Huntlo",
  description:
    "Huntlo is AI Hiring Infrastructure for modern recruiting teams — candidate discovery, talent intelligence, AI recruiting agents, and workflow orchestration in one connected layer.",
  ogTitle: "AI Hiring Infrastructure — Powering the Future of Hiring",
  ogDescription:
    "The future of hiring won't be built on more recruiting tools. It will be built on intelligent hiring infrastructure. Meet Huntlo.",
} as const;

export function aiHiringInfrastructureMetadata() {
  return buildPageMetadata({
    title: AI_HIRING_INFRASTRUCTURE_SEO.title,
    description: AI_HIRING_INFRASTRUCTURE_SEO.description,
    ogTitle: AI_HIRING_INFRASTRUCTURE_SEO.ogTitle,
    ogDescription: AI_HIRING_INFRASTRUCTURE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_HIRING_INFRASTRUCTURE_PATH,
  });
}

export const AI_HIRING_GEO = {
  askTopic: "Huntlo AI Hiring Infrastructure",
  askPrompt:
    "What is Huntlo AI Hiring Infrastructure (https://www.huntlo.ai/ai-hiring-infrastructure)? How does it connect candidate discovery, talent intelligence, AI recruiting agents, and hiring workflows for enterprise recruiting teams?",
} as const;

export const INFRASTRUCTURE_PILLARS = [
  {
    title: "Candidate Discovery",
    description:
      "Find relevant talent from natural-language requirements — beyond keyword searches and static databases.",
    href: "/sourcing",
  },
  {
    title: "AI Recruiting Agents",
    description:
      "Purpose-built agents that assist with sourcing, outreach, screening, interviews, and scheduling.",
    href: "/screening",
  },
  {
    title: "Talent Intelligence",
    description:
      "Understand talent markets, pipeline health, engagement signals, and hiring velocity before decisions are made.",
    href: "/people-scout",
  },
  {
    title: "Workflow Orchestration",
    description:
      "Connect sourcing, outreach, screening, assessments, interviews, and follow-ups in one operating layer.",
    href: "/platform",
  },
  {
    title: "Candidate Engagement",
    description:
      "Keep candidates moving with multi-channel communication and timely follow-ups across the hiring journey.",
    href: "/candidate-pool",
  },
  {
    title: "Interview Infrastructure",
    description:
      "Screen, evaluate, and schedule with shared context — transcripts, recordings, and hiring signals included.",
    href: "/interview",
  },
  {
    title: "Hiring Intelligence",
    description:
      "Turn recruiting activity into operational insight so teams can improve velocity, quality, and productivity.",
    href: "/platform",
  },
  {
    title: "Recruiter Productivity",
    description:
      "Remove repetitive process work so recruiters spend more time on judgment, relationships, and decisions.",
    href: "/platform",
  },
  {
    title: "Enterprise Hiring",
    description:
      "Built for staffing firms, enterprises, GCCs, startups, and high-volume hiring teams that need scale and control.",
    href: "/solutions",
  },
] as const;

export const TIMELINE_ERAS = [
  {
    year: "2005",
    label: "Manual hiring",
    items: ["Job boards", "Spreadsheets", "Emails", "Manual hiring"],
    highlight: false,
  },
  {
    year: "2026",
    label: "Tool sprawl",
    items: ["ATS", "CRM", "AI tools", "More tabs", "More tools", "More workflows"],
    highlight: false,
  },
  {
    year: "2030",
    label: "Infrastructure",
    items: ["AI Hiring Infrastructure", "One connected layer", "Huntlo"],
    highlight: true,
  },
] as const;

export const COMPLEXITY_CHAIN = [
  "LinkedIn",
  "ATS",
  "Naukri",
  "Email",
  "WhatsApp",
  "Interview scheduling",
  "Assessments",
  "Candidate tracking",
  "Follow-ups",
  "Reporting",
  "Hiring managers",
  "More follow-ups",
  "Offer management",
] as const;

export const RECRUITING_STACK = [
  "ATS",
  "CRM",
  "Sourcing",
  "Scheduling",
  "Assessments",
  "Communication",
  "Analytics",
  "AI tools",
  "More AI tools",
  "Disconnected workflows",
] as const;

export const AI_CAPABILITIES = [
  "Understand hiring requirements",
  "Identify relevant talent",
  "Discover candidate signals",
  "Personalize communication",
  "Coordinate workflows",
  "Generate hiring intelligence",
  "Automate repetitive work",
  "Assist recruiters at every stage of hiring",
] as const;

export const CONNECTED_LAYER = [
  "Candidate Discovery",
  "Talent Intelligence",
  "AI Recruiting Agents",
  "Workflow Infrastructure",
  "Candidate Engagement",
  "Enterprise Hiring",
  "Recruiter Productivity",
  "Business Intelligence",
  "Huntlo",
] as const;

export const RECRUITER_WORKLOAD = [
  "Candidate sourcing",
  "Screening",
  "Assessments",
  "Interviews",
  "Follow-ups",
  "Candidate engagement",
  "Stakeholder communication",
  "Talent pipelines",
  "Recruiter productivity",
  "Hiring analytics",
] as const;

export const CANDIDATE_INTELLIGENCE_NEEDS = [
  "Intent signals",
  "Engagement intelligence",
  "Candidate context",
  "Hiring readiness",
  "Relationship intelligence",
] as const;

export const TALENT_INTELLIGENCE_TOPICS = [
  "Talent markets",
  "Candidate behavior",
  "Recruiter productivity",
  "Pipeline health",
  "Hiring velocity",
  "Engagement insights",
] as const;

export const AI_AGENTS = [
  { name: "AI Sourcing Agent", href: "/sourcing" },
  { name: "AI Outreach Agent", href: "/candidate-pool" },
  { name: "AI Screening Agent", href: "/screening" },
  { name: "AI Interview Agent", href: "/interview" },
  { name: "AI Scheduling Agent", href: "/interview" },
  { name: "AI Recruiting Agent", href: "/platform" },
] as const;

export const WORKFLOW_ORCHESTRATION = [
  { label: "Sourcing", href: "/sourcing" },
  { label: "Outreach", href: "/candidate-pool" },
  { label: "Screening", href: "/screening" },
  { label: "Assessments", href: "/assessments" },
  { label: "Interviews", href: "/interview" },
  { label: "Communication", href: "/integrations" },
  { label: "Follow-ups", href: "/candidate-pool" },
  { label: "Analytics", href: "/platform" },
  { label: "Productivity", href: "/platform" },
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Startups", href: "/solutions/startups" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "High-volume hiring teams", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Security",
  "Compliance",
  "Integrations",
  "Scalability",
  "Governance",
  "Audit logs",
  "Multi-recruiter workflows",
] as const;

export const FUTURE_RECRUITER_FOCUS = [
  "Evaluating talent",
  "Building relationships",
  "Making hiring decisions",
  "Creating exceptional candidate experiences",
] as const;

export const AI_HIRING_FAQS = [
  {
    question: "What is AI Hiring Infrastructure?",
    answer:
      "AI Hiring Infrastructure is an intelligent layer that connects candidate discovery, talent intelligence, AI recruiting agents, workflow orchestration, candidate engagement, and enterprise hiring — so recruiting teams operate through one connected system instead of disconnected tools.",
  },
  {
    question: "How is AI Hiring Infrastructure different from an ATS?",
    answer:
      "An ATS primarily tracks applicants and hiring stages. AI Hiring Infrastructure goes further by helping teams discover talent, enrich profiles, run outreach, screen candidates, orchestrate workflows, and generate hiring intelligence — not only record what already happened.",
  },
  {
    question: "How is Huntlo different from traditional recruiting software?",
    answer:
      "Most recruiting products solve individual steps — sourcing, scheduling, assessments, or communication. Huntlo is designed as AI Hiring Infrastructure: one connected layer that powers modern hiring workflows end to end.",
  },
  {
    question: "Can AI replace recruiters?",
    answer:
      "No. AI does not replace recruiters. It removes repetitive work so recruiters can focus on judgment, conversations, relationships, and hiring decisions. Recruiters remain at the center of hiring.",
  },
  {
    question: "What are AI Recruiting Agents?",
    answer:
      "AI Recruiting Agents are purpose-built systems that assist recruiters across hiring workflows — including sourcing, outreach, screening, interviews, and scheduling — so teams can move faster without managing every step manually.",
  },
  {
    question: "How does Huntlo work?",
    answer:
      "Huntlo helps recruiting teams search and source candidates, refine results with filters, enrich profiles, run email and WhatsApp outreach, track engagement, qualify interested candidates, conduct AI voice screening, review evaluation results, and schedule interviews from one platform.",
  },
  {
    question: "What is Talent Intelligence?",
    answer:
      "Talent Intelligence helps hiring teams understand talent markets, candidate behavior, pipeline health, hiring velocity, engagement insights, and recruiter productivity — so hiring decisions are informed by signals, not search alone.",
  },
  {
    question: "What is Candidate Intelligence?",
    answer:
      "Candidate Intelligence goes beyond resumes. It includes intent signals, engagement context, hiring readiness, and relationship intelligence so teams can prioritize the right candidates with better context.",
  },
  {
    question: "What is Workflow Infrastructure?",
    answer:
      "Workflow Infrastructure connects the many decisions in hiring — sourcing, outreach, screening, assessments, interviews, communication, follow-ups, and analytics — through one orchestration layer instead of fragmented tools and tabs.",
  },
  {
    question: "What is Candidate Discovery in Huntlo?",
    answer:
      "Candidate Discovery helps recruiters find relevant talent using natural-language requirements and advanced filters, then enrich profiles so outreach and screening start with stronger context.",
  },
  {
    question: "What is Agentic Hiring?",
    answer:
      "Agentic Hiring means recruiters work alongside AI systems that can execute recruiting tasks — discovering candidates, assisting outreach, supporting screening, and helping coordinate workflows — while humans stay accountable for hiring decisions.",
  },
  {
    question: "Who is Huntlo built for?",
    answer:
      "Huntlo is built for CHROs, VP Talent Acquisition leaders, founders, recruitment leaders, staffing owners, enterprise hiring teams, GCC leaders, TA managers, and recruitment consultants who need connected hiring infrastructure.",
  },
  {
    question: "Is Huntlo enterprise ready?",
    answer:
      "Huntlo is designed for enterprise hiring needs including security, compliance considerations, integrations, scalability, governance, audit logs, and multi-recruiter workflows. See the Huntlo security page for current security practices.",
  },
  {
    question: "How secure is Huntlo?",
    answer:
      "Huntlo maintains security practices across application protections, infrastructure controls, vendor evaluation, and incident response. Details are published on the Huntlo security page. For security questions or vulnerability reports, contact security@huntlo.ai.",
  },
  {
    question: "Can Huntlo support GCC hiring?",
    answer:
      "Yes. Huntlo supports Global Capability Center hiring teams that need scalable sourcing, engagement, screening, and recruiting workflows across high-volume and specialized roles.",
  },
  {
    question: "Can staffing firms and recruitment agencies use Huntlo?",
    answer:
      "Yes. Staffing firms and recruitment agencies can use Huntlo to source candidates, run outreach, manage talent pools, screen interested candidates, and keep recruiting operations connected across client workflows.",
  },
  {
    question: "Does Huntlo replace existing recruiting tools?",
    answer:
      "Huntlo is designed as hiring infrastructure, not another disconnected point tool. Teams can use Huntlo to connect major hiring workflows in one layer, and integrate with existing systems where integrations are supported.",
  },
  {
    question: "What hiring workflows does Huntlo support?",
    answer:
      "Huntlo supports candidate sourcing, enrichment, talent pools, email and WhatsApp outreach, engagement tracking, AI voice screening, evaluation review, interview scheduling, and broader recruiting workflow management.",
  },
  {
    question: "How does Huntlo improve recruiter productivity?",
    answer:
      "Huntlo reduces time spent switching between tools and repeating manual work — searching, outreach, follow-ups, screening coordination, and pipeline management — so recruiters can spend more time on high-value hiring decisions.",
  },
  {
    question: "Does Huntlo support candidate engagement?",
    answer:
      "Yes. Huntlo supports candidate engagement through outreach channels such as email and WhatsApp, reply tracking, and workflows that help teams follow up with interested candidates more consistently.",
  },
  {
    question: "What is Enterprise Hiring Infrastructure?",
    answer:
      "Enterprise Hiring Infrastructure is the operating layer enterprises need to run hiring at scale — connecting discovery, engagement, screening, interviews, governance, and multi-recruiter collaboration without relying on disconnected software stacks.",
  },
  {
    question: "How do I get started with Huntlo?",
    answer:
      "You can book a demo to see Huntlo in the context of your hiring workflows, explore the platform pages for product modules, or create an account to get started.",
  },
] as const;
