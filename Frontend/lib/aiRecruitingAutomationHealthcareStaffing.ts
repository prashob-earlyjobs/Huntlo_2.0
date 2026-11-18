import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_PATH =
  "/us/ai-recruiting-automation-healthcare-staffing";

export const AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO = {
  title: "AI Recruiting Automation for Healthcare Staffing | Huntlo",
  description:
    "Explore AI recruiting workflows for healthcare staffing teams managing candidate engagement, scheduling coordination and recruitment operations.",
  ogTitle: "Healthcare Staffing Requires Speed. It Also Requires Careful Coordination.",
  ogDescription:
    "AI recruiting automation for healthcare staffing focuses on coordinating appropriate recruitment activities while preserving human review of qualifications, compliance requirements and hiring decisions.",
} as const;

export function aiRecruitingAutomationHealthcareStaffingMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO.title,
    description: AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO.description,
    ogTitle: AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO.ogTitle,
    ogDescription: AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_PATH,
  });
}

export const AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_GEO = {
  askTopic: "Huntlo AI recruiting automation for healthcare staffing",
  askPrompt:
    "What is AI recruiting automation for healthcare staffing on Huntlo at /us/ai-recruiting-automation-healthcare-staffing (https://www.huntlo.ai/us/ai-recruiting-automation-healthcare-staffing)? How do AI-assisted workflows support candidate engagement, scheduling coordination and recruitment operations while preserving human review?",
} as const;

export const HEALTHCARE_STAFFING_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Requirement intake",
    detail:
      "Document the role, location, schedule, essential qualifications and approved recruitment criteria.",
  },
  {
    stage: "02",
    title: "Candidate identification",
    detail:
      "Review potentially relevant candidates using appropriate sourcing and database processes.",
  },
  {
    stage: "03",
    title: "Candidate engagement",
    detail:
      "Communicate the opportunity and gather initial interest through approved channels.",
  },
  {
    stage: "04",
    title: "Response management",
    detail:
      "Distinguish interested candidates, scheduling questions, qualification-related questions and requests for clarification.",
  },
  {
    stage: "05",
    title: "Human verification",
    detail:
      "Route credentialing, licensing and other consequential matters to authorized personnel.",
  },
  {
    stage: "06",
    title: "Interview coordination",
    detail: "Support scheduling and follow-up within approved workflows.",
  },
  {
    stage: "07",
    title: "Operational visibility",
    detail:
      "Make unresolved exceptions and pending actions understandable to the recruiting team.",
  },
] as const;

export const HEALTHCARE_STAFFING_INTERNAL_LINKS = [
  { label: "AI Recruiting Agents", href: "/us/ai-recruiting-agents" },
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  {
    label: "AI Recruiting for Staffing Agencies",
    href: "/ai-recruiting-staffing-agencies",
  },
] as const;

export const AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_FAQS = [
  {
    question: "How can AI support healthcare staffing recruitment?",
    answer:
      "AI-assisted workflows can help organize candidate engagement, routine follow-ups, response handling and interview coordination.",
  },
  {
    question: "Can AI verify healthcare credentials automatically?",
    answer:
      "Credential verification requires appropriate authoritative sources, approved processes and human accountability. No such capability should be assumed without verification.",
  },
  {
    question: "Can agentic AI help healthcare staffing agencies?",
    answer:
      "It may support coordination across recruitment tasks when implemented with clear permissions, appropriate oversight and verified integrations.",
  },
  {
    question: "What makes healthcare recruitment automation different?",
    answer:
      "Healthcare recruitment may involve professional licensing, credentialing, scheduling and other role-specific requirements that require careful human review.",
  },
] as const;
