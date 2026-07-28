import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const HIRING_OS_PATH = "/hiring-os";

export const HIRING_OS_SEO = {
  title: "Hiring Operating System — Huntlo Hiring OS | Huntlo",
  description:
    "Huntlo is the Hiring Operating System for modern recruiting teams — connecting candidate discovery, talent intelligence, AI recruiting agents, and hiring workflows in one platform.",
  ogTitle: "The Hiring Operating System for Modern Recruiting Teams",
  ogDescription:
    "Recruiters don't need more tools. They need an operating system. Meet Huntlo — the Hiring OS that connects discovery, intelligence, workflows, and enterprise hiring.",
} as const;

export function hiringOsMetadata() {
  return buildPageMetadata({
    title: HIRING_OS_SEO.title,
    description: HIRING_OS_SEO.description,
    ogTitle: HIRING_OS_SEO.ogTitle,
    ogDescription: HIRING_OS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: HIRING_OS_PATH,
  });
}

export const HIRING_OS_GEO = {
  askTopic: "Huntlo Hiring Operating System",
  askPrompt:
    "What is Huntlo Hiring OS (https://www.huntlo.ai/hiring-os)? How does a Hiring Operating System differ from an ATS, and how does Huntlo connect candidate discovery, talent intelligence, AI recruiting agents, and recruiting workflows?",
} as const;

export const HERO_FLOW = [
  "Candidate Discovery",
  "Talent Intelligence",
  "AI Recruiting Agents",
  "Interview Infrastructure",
  "Workflow Automation",
  "Candidate Engagement",
  "Recruiter Workspace",
  "Enterprise Workflows",
  "Huntlo Hiring OS",
] as const;

export const TOOL_SWITCHING = [
  "LinkedIn",
  "ATS",
  "CRM",
  "Email",
  "WhatsApp",
  "Scheduling",
  "Assessments",
  "Interview tools",
  "Analytics",
  "Spreadsheets",
  "Hiring managers",
  "Follow-ups",
  "Repeat",
] as const;

export const ADDED_SOFTWARE = [
  "Sourcing software",
  "ATS systems",
  "Assessment tools",
  "Scheduling platforms",
  "Candidate databases",
  "Outreach tools",
  "AI assistants",
  "Productivity software",
] as const;

export const HIRING_OS_LAYER = [
  "Hiring Requirements",
  "Candidate Discovery",
  "Talent Intelligence",
  "AI Recruiting Agents",
  "Candidate Engagement",
  "Screening",
  "Assessments",
  "Interviews",
  "Hiring Decisions",
  "Business Intelligence",
  "Recruiter Productivity",
  "Enterprise Hiring",
] as const;

export const MEET_HUNTLO_CAPABILITIES = [
  "Candidate discovery",
  "Talent intelligence",
  "Workflow orchestration",
  "AI recruiting agents",
  "Recruiter productivity",
  "Enterprise hiring capabilities",
  "Hiring analytics",
  "Candidate engagement",
] as const;

export const FULL_WORKFLOW = [
  { label: "Hiring Requirement", href: "/platform" },
  { label: "Candidate Discovery", href: "/sourcing" },
  { label: "Talent Intelligence", href: "/people-scout" },
  { label: "AI Sourcing Agent", href: "/sourcing" },
  { label: "Candidate Engagement", href: "/candidate-pool" },
  { label: "Screening", href: "/screening" },
  { label: "Assessments", href: "/assessments" },
  { label: "Interviews", href: "/interview" },
  { label: "Hiring Intelligence", href: "/platform" },
  { label: "Offer", href: "/platform" },
  { label: "Hire", href: "/platform" },
] as const;

export const BEYOND_SOURCING = [
  "Discovery",
  "Intelligence",
  "Engagement",
  "Workflows",
  "Automation",
  "Analytics",
  "Human Decisions",
] as const;

export const AI_RECRUITING_TEAM = [
  {
    name: "AI Recruiting Agent",
    summary: "Coordinates recruiting execution across the hiring workflow.",
    detail:
      "Helps recruiters move candidates through discovery, engagement, and qualification with less manual coordination.",
    href: "/platform",
  },
  {
    name: "AI Sourcing Agent",
    summary: "Finds relevant talent from natural-language hiring requirements.",
    detail:
      "Searches and surfaces matched candidates so recruiters start with stronger shortlists, not empty pipelines.",
    href: "/sourcing",
  },
  {
    name: "AI Outreach Agent",
    summary: "Supports personalized multi-channel candidate engagement.",
    detail:
      "Helps teams run email and WhatsApp outreach, track replies, and keep follow-ups consistent.",
    href: "/candidate-pool",
  },
  {
    name: "AI Screening Agent",
    summary: "Qualifies interested candidates with structured screening.",
    detail:
      "Supports AI voice screening so recruiters can review transcripts, recordings, and evaluation results faster.",
    href: "/screening",
  },
  {
    name: "AI Interview Agent",
    summary: "Assists interview preparation and evaluation workflows.",
    detail:
      "Helps hiring teams run AI-supported interview workflows and review evaluation context in one place.",
    href: "/interview",
  },
  {
    name: "AI Scheduling Agent",
    summary: "Reduces back-and-forth around interview coordination.",
    detail:
      "Helps teams schedule interviews and keep candidates moving without endless calendar coordination.",
    href: "/interview",
  },
] as const;

export const ORCHESTRATION_BURDENS = [
  "Emails",
  "Follow-ups",
  "Interviews",
  "Talent pipelines",
  "Assessments",
  "Spreadsheets",
  "Candidate status",
] as const;

export const TALENT_INTELLIGENCE_SIGNALS = [
  "Candidate intent",
  "Hiring readiness",
  "Engagement signals",
  "Recruiter productivity",
  "Pipeline health",
  "Talent markets",
  "Hiring velocity",
] as const;

export const ENTERPRISE_DESIGNED_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "High-volume hiring", href: "/solutions" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Global hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Compliance",
  "Integrations",
  "Governance",
  "Scalability",
  "Audit logs",
  "Enterprise workflows",
] as const;

export const FUTURE_MORE_TIME = [
  "Evaluating talent",
  "Building relationships",
  "Influencing hiring decisions",
  "Improving candidate experiences",
] as const;

export const FUTURE_LESS_TIME = [
  "Updating systems",
  "Following up manually",
  "Coordinating workflows",
  "Switching between applications",
] as const;

export const FUTURE_NOT = ["More tools", "More tabs", "More workflows"] as const;
export const FUTURE_IS = [
  "More intelligence",
  "More productivity",
  "More meaningful conversations",
] as const;

export const HIRING_OS_FAQS = [
  {
    question: "What is a Hiring Operating System?",
    answer:
      "A Hiring Operating System is a connected platform that orchestrates recruiting work — candidate discovery, talent intelligence, engagement, screening, interviews, workflows, and hiring analytics — so teams operate through one intelligent system instead of disconnected tools.",
  },
  {
    question: "How is a Hiring Operating System different from an ATS?",
    answer:
      "An ATS primarily tracks applicants and hiring stages. A Hiring Operating System connects the broader recruiting operation: discovering talent, engaging candidates, running workflows, supporting AI recruiting agents, and generating hiring intelligence — not only recording applicants.",
  },
  {
    question: "How is Huntlo different from traditional recruiting software?",
    answer:
      "Traditional recruiting software usually solves one step at a time. Huntlo is designed as a Hiring Operating System that brings discovery, intelligence, AI agents, workflows, and enterprise hiring capabilities together in one connected infrastructure layer.",
  },
  {
    question: "How does Huntlo work?",
    answer:
      "Huntlo helps teams source candidates, enrich profiles, save talent pools, run email and WhatsApp outreach, track engagement, screen interested candidates, review evaluation results, schedule interviews, and manage recruiting workflows from one platform.",
  },
  {
    question: "What are AI Recruiting Agents in Huntlo?",
    answer:
      "AI Recruiting Agents are purpose-built assistants that support sourcing, outreach, screening, interviews, and scheduling — reducing repetitive work while recruiters stay responsible for hiring decisions.",
  },
  {
    question: "Does Huntlo replace recruiters?",
    answer:
      "No. Huntlo is built so recruiters can recruit — evaluating talent, building relationships, and making hiring decisions — while the Hiring OS helps orchestrate repetitive coordination work.",
  },
  {
    question: "Can recruiters customize workflows?",
    answer:
      "Huntlo is designed to support connected hiring workflows across sourcing, engagement, screening, and interviews. Teams can operate within the platform's recruiting flows and adapt how they move candidates through discovery, outreach, screening, and scheduling.",
  },
  {
    question: "Is Huntlo suitable for enterprise hiring?",
    answer:
      "Yes. Huntlo is designed for enterprise hiring needs including integrations, governance, scalability, audit logs, and multi-recruiter workflows. See the Huntlo security page for current security practices.",
  },
  {
    question: "Can Huntlo support GCC hiring?",
    answer:
      "Yes. Global Capability Center teams can use Huntlo to run scalable sourcing, engagement, screening, and hiring workflows across specialized and high-volume roles.",
  },
  {
    question: "Can staffing firms and recruitment agencies use Huntlo?",
    answer:
      "Yes. Staffing firms and recruitment agencies can use Huntlo to discover candidates, manage engagement, run screening workflows, and keep recruiting operations connected across client hiring needs.",
  },
  {
    question: "Can Huntlo integrate with ATS systems?",
    answer:
      "Huntlo supports integrations as part of its hiring infrastructure. Explore the integrations page for currently supported connection options and how Huntlo fits alongside existing recruiting systems.",
  },
  {
    question: "What is workflow orchestration in a Hiring OS?",
    answer:
      "Workflow orchestration means coordinating the connected steps of hiring — outreach, follow-ups, screening, assessments, interviews, pipelines, and status updates — so recruiters spend less time stitching tools together.",
  },
  {
    question: "What is talent intelligence?",
    answer:
      "Talent intelligence helps teams understand candidate intent, hiring readiness, engagement signals, pipeline health, talent markets, hiring velocity, and recruiter productivity before and during hiring.",
  },
  {
    question: "Why do recruiting teams need a Hiring Operating System?",
    answer:
      "Because hiring doesn't happen in one application. Recruiters often work across sourcing tools, communication platforms, interview systems, databases, and spreadsheets. A Hiring OS connects those workflows instead of adding another disconnected tool.",
  },
  {
    question: "Does more recruiting software create better hiring?",
    answer:
      "Not by itself. Adding sourcing tools, ATS systems, assessment platforms, and AI assistants can still leave workflows disconnected. Modern recruiting needs connected infrastructure, not just more software.",
  },
  {
    question: "Where does candidate discovery fit in Huntlo?",
    answer:
      "Candidate discovery is where hiring begins in Huntlo — finding relevant talent from requirements — then continues through intelligence, engagement, screening, interviews, and hiring decisions.",
  },
  {
    question: "Who is Huntlo Hiring OS built for?",
    answer:
      "Huntlo is built for CHROs, VP Talent Acquisition leaders, recruitment leaders, founders, GCC leaders, staffing owners, recruitment agencies, and talent acquisition managers who need connected hiring operations.",
  },
  {
    question: "How does Huntlo improve recruiter productivity?",
    answer:
      "By reducing time spent switching between applications, coordinating follow-ups, updating systems, and managing fragmented workflows — so recruiters can spend more time on evaluation, relationships, and decisions.",
  },
  {
    question: "Is Huntlo an AI hiring platform or recruiting infrastructure?",
    answer:
      "Both in practice: Huntlo is an AI hiring platform designed as recruiting infrastructure — a Hiring Operating System that connects discovery, intelligence, agents, and workflows.",
  },
  {
    question: "How do I get started with Huntlo Hiring OS?",
    answer:
      "Book a demo to see Huntlo in the context of your recruiting workflows, explore the platform, or create an account to start hiring with a more connected operating system.",
  },
  {
    question: "What makes Huntlo different from a talent operations platform?",
    answer:
      "Talent operations platforms often focus on process tracking. Huntlo focuses on operating hiring end to end — discovering candidates, engaging them, screening, interviewing, and generating hiring intelligence through one connected layer.",
  },
  {
    question: "Does Huntlo support high-volume hiring?",
    answer:
      "Yes. Huntlo is designed to support high-volume hiring teams that need scalable discovery, engagement, screening, and workflow orchestration without relying on disconnected tools.",
  },
] as const;
