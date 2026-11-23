import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITMENT_AUTOMATION_RPO_PATH = "/us/ai-recruitment-automation-rpo";

export const AI_RECRUITMENT_AUTOMATION_RPO_SEO = {
  title: "AI Recruitment Automation for RPO Providers | Huntlo",
  description:
    "Explore agentic recruitment workflows for RPO teams managing candidate engagement, process coordination and multiple hiring programs.",
  ogTitle: "When You Recruit for Multiple Clients, Workflow Consistency Becomes a Competitive Advantage.",
  ogDescription:
    "AI recruitment workflow automation for RPO providers coordinates repetitive recruitment activities across client programs while preserving program-specific rules and human accountability.",
} as const;

export function aiRecruitmentAutomationRpoMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITMENT_AUTOMATION_RPO_SEO.title,
    description: AI_RECRUITMENT_AUTOMATION_RPO_SEO.description,
    ogTitle: AI_RECRUITMENT_AUTOMATION_RPO_SEO.ogTitle,
    ogDescription: AI_RECRUITMENT_AUTOMATION_RPO_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITMENT_AUTOMATION_RPO_PATH,
  });
}

export const AI_RECRUITMENT_AUTOMATION_RPO_GEO = {
  askTopic: "Huntlo AI recruitment automation for RPO providers",
  askPrompt:
    "What is AI recruitment workflow automation for RPO providers on Huntlo at /us/ai-recruitment-automation-rpo (https://www.huntlo.ai/us/ai-recruitment-automation-rpo)? How does it coordinate repetitive recruitment activities across client programs while preserving program-specific rules and human accountability?",
} as const;

export const RPO_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Document program rules",
    detail:
      "Define outreach triggers, approved communication channels, recruiter review requirements and exception handling for each client program.",
  },
  {
    stage: "02",
    title: "Configure workflow boundaries",
    detail:
      "Set permissions, data separation and approved actions that apply within each program without bleeding across clients.",
  },
  {
    stage: "03",
    title: "Coordinate candidate engagement",
    detail:
      "Run approved outreach and response handling within program rules, with recruiter visibility into activity.",
  },
  {
    stage: "04",
    title: "Handle exceptions",
    detail:
      "Route responses requiring recruiter judgment—schedule changes, withdrawals, ambiguous requests—to the appropriate program manager.",
  },
  {
    stage: "05",
    title: "Review and report",
    detail:
      "Provide visibility into pending actions, resolved exceptions and completed steps across programs.",
  },
] as const;

export const RPO_CLIENT_PROGRAMS = [
  {
    title: "High-volume engagement program",
    detail:
      "Rapid candidate outreach and follow-up for high-volume roles with standardized approval paths.",
  },
  {
    title: "Coordinated interview program",
    detail:
      "Multi-stakeholder interview scheduling across hiring teams with structured review requirements.",
  },
  {
    title: "Structured compliance program",
    detail:
      "Carefully defined recruitment steps with additional review gates and documentation requirements.",
  },
] as const;

export const RPO_EVALUATION_AREAS = [
  {
    title: "Candidate engagement coordination",
    detail:
      "Organize approved communication activities and help teams maintain continuity across candidate conversations.",
  },
  {
    title: "Response management",
    detail:
      "Distinguish routine candidate responses from questions or requests requiring recruiter attention.",
  },
  {
    title: "Interview operations",
    detail:
      "Support the coordination of availability, confirmations and schedule changes where connected systems permit.",
  },
  {
    title: "Workflow visibility",
    detail:
      "Provide an understandable view of pending actions, unresolved exceptions and completed process steps.",
  },
  {
    title: "Program governance",
    detail:
      "Maintain boundaries between client programs, permissions and approved communication practices.",
  },
] as const;

export const RPO_INTERNAL_LINKS = [
  { label: "AI Recruiting Workflow Orchestration", href: "/us/ai-recruiting-workflow-orchestration" },
  { label: "AI Recruiting for Staffing Agencies", href: "/ai-recruiting-staffing-agencies" },
  { label: "AI Recruiting Agents", href: "/us/ai-recruiting-agents" },
] as const;

export const AI_RECRUITMENT_AUTOMATION_RPO_FAQS = [
  {
    question: "How can RPO providers use AI recruitment automation?",
    answer:
      "RPO providers can evaluate AI-assisted workflows for candidate engagement, routine coordination, response management and recruitment process visibility.",
  },
  {
    question: "Why do RPO workflows need different automation rules?",
    answer:
      "Different clients may have distinct systems, approval requirements, communication policies and contractual obligations that automation must respect.",
  },
  {
    question: "Can agentic AI support multiple RPO programs?",
    answer:
      "It may be suitable for multi-program operations when the implementation supports appropriate permissions, data separation, workflow rules and oversight.",
  },
  {
    question: "What should RPO leaders measure?",
    answer:
      "Useful measures include workflow delays, candidate response handling, exception resolution, recruiter workload and process consistency.",
  },
] as const;
