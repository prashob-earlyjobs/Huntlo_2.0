import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_AUTOMATION_MULTI_LOCATION_PATH =
  "/us/ai-recruiting-automation-multi-location";

export const AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO = {
  title: "AI Recruiting Automation for Multi-Location Hiring | Huntlo",
  description:
    "Explore AI recruiting workflows for coordinating candidate engagement, interviews and recruitment operations across multiple hiring locations.",
  ogTitle: "Hiring Across Locations Should Not Mean Managing Separate Operations",
  ogDescription:
    "AI recruiting automation for multi-location hiring helps organizations design coordinated recruitment workflows across locations, teams and hiring processes while preserving local decision-making.",
} as const;

export function aiRecruitingAutomationMultiLocationMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO.title,
    description: AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO.description,
    ogTitle: AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO.ogTitle,
    ogDescription: AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_AUTOMATION_MULTI_LOCATION_PATH,
  });
}

export const AI_RECRUITING_AUTOMATION_MULTI_LOCATION_GEO = {
  askTopic: "Huntlo AI recruiting automation for multi-location hiring",
  askPrompt:
    "What is AI recruiting automation for multi-location hiring on Huntlo at /us/ai-recruiting-automation-multi-location (https://www.huntlo.ai/us/ai-recruiting-automation-multi-location)? How do coordinated recruitment workflows support candidate engagement, interviews and recruitment operations across multiple hiring locations?",
} as const;

export const MULTI_LOCATION_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Establish a common process",
    detail:
      "Define the core recruitment stages and the information required at each step.",
  },
  {
    stage: "02",
    title: "Identify location-specific rules",
    detail:
      "Document which requirements differ by geography, role or hiring team.",
  },
  {
    stage: "03",
    title: "Coordinate candidate engagement",
    detail:
      "Use appropriate outreach and follow-up workflows to maintain communication continuity.",
  },
  {
    stage: "04",
    title: "Route responses",
    detail:
      "Direct candidate questions, availability changes and exceptions to the relevant recruiting team.",
  },
  {
    stage: "05",
    title: "Support interview operations",
    detail:
      "Coordinate approved scheduling activities while preserving local manager control.",
  },
  {
    stage: "06",
    title: "Maintain central visibility",
    detail:
      "Provide recruiting operations leaders with an understandable view of pending actions and unresolved workflow issues.",
  },
] as const;

export const MULTI_LOCATION_INTERNAL_LINKS = [
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  {
    label: "Agentic AI Recruiting Software",
    href: "/us/agentic-ai-recruiting-software",
  },
  {
    label: "AI Recruiting for Staffing Agencies",
    href: "/ai-recruiting-staffing-agencies",
  },
] as const;

export const AI_RECRUITING_AUTOMATION_MULTI_LOCATION_FAQS = [
  {
    question: "What is multi-location recruiting automation?",
    answer:
      "It is the use of software workflows to coordinate recurring recruitment activities across multiple hiring locations and teams.",
  },
  {
    question: "Can AI recruiting automation support different location requirements?",
    answer:
      "Potentially, when the system supports appropriate workflow configuration, permissions and human oversight.",
  },
  {
    question: "How is multi-location automation different from an ATS?",
    answer:
      "An ATS manages recruitment records and process stages. Workflow automation focuses on coordinating activities and handoffs around those records.",
  },
  {
    question: "What should enterprises automate first?",
    answer:
      "Start with a frequent cross-location workflow that has clear rules, measurable delays and limited operational risk.",
  },
] as const;
