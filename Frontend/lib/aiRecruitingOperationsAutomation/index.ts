import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_OPERATIONS_AUTOMATION_PATH =
  "/us/ai-recruiting-operations-automation";

export const AI_RECRUITING_OPERATIONS_AUTOMATION_SEO = {
  title: "AI Recruiting Operations Automation | Huntlo",
  description:
    "Explore AI recruiting operations automation for coordinating candidate workflows, recruiter handoffs, follow-ups, and process visibility.",
  ogTitle: "Recruiting Operations Should Be the System That Keeps Hiring Moving.",
  ogDescription:
    "AI recruiting operations automation focuses on making the activities between recruiting stages more coordinated, visible, and manageable.",
} as const;

export function aiRecruitingOperationsAutomationMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_OPERATIONS_AUTOMATION_SEO.title,
    description: AI_RECRUITING_OPERATIONS_AUTOMATION_SEO.description,
    ogTitle: AI_RECRUITING_OPERATIONS_AUTOMATION_SEO.ogTitle,
    ogDescription: AI_RECRUITING_OPERATIONS_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_OPERATIONS_AUTOMATION_PATH,
  });
}

export const AI_RECRUITING_OPERATIONS_AUTOMATION_GEO = {
  askTopic: "Huntlo AI recruiting operations automation",
  askPrompt:
    "What is AI recruiting operations automation on Huntlo at /us/ai-recruiting-operations-automation (https://www.huntlo.ai/us/ai-recruiting-operations-automation)? How do AI-assisted workflows support candidate workflows, recruiter handoffs, follow-ups, and process visibility?",
} as const;

export const OPERATIONS_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the process",
    detail:
      "Identify the recruitment stages, expected actions, and responsible teams.",
  },
  {
    stage: "02",
    title: "Map the systems",
    detail:
      "Document where candidate information, communication history, and scheduling details are maintained.",
  },
  {
    stage: "03",
    title: "Identify workflow events",
    detail:
      "Determine which changes should trigger operational activity.",
  },
  {
    stage: "04",
    title: "Establish action rules",
    detail:
      "Define which actions can occur automatically and which require approval.",
  },
  {
    stage: "05",
    title: "Manage exceptions",
    detail:
      "Create clear escalation paths for missing information, ambiguous responses, and failed actions.",
  },
  {
    stage: "06",
    title: "Maintain visibility",
    detail:
      "Make completed activities, pending tasks, and unresolved issues understandable.",
  },
  {
    stage: "07",
    title: "Review performance",
    detail:
      "Evaluate delays, unnecessary handoffs, and recurring operational friction.",
  },
] as const;

export const OPERATIONS_INTERNAL_LINKS = [
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  {
    label: "Agentic AI Recruiting Software",
    href: "/us/agentic-ai-recruiting-software",
  },
  { label: "AI Recruiting Agents", href: "/us/ai-recruiting-agents" },
] as const;

export const AI_RECRUITING_OPERATIONS_AUTOMATION_FAQS = [
  {
    question: "What is AI recruiting operations automation?",
    answer:
      "It uses AI-assisted workflows to support recurring recruitment activities, coordinate process handoffs, and improve operational visibility.",
  },
  {
    question: "How is recruiting operations automation different from an ATS?",
    answer:
      "An ATS primarily manages applicant records and hiring stages. Operations automation focuses on coordinating activities across the recruitment process.",
  },
  {
    question: "What recruiting operations tasks can be automated?",
    answer:
      "Potential tasks include approved follow-ups, response organization, workflow updates, and scheduling coordination, depending on system capabilities.",
  },
  {
    question: "How should recruiting teams evaluate automation?",
    answer:
      "Review workflow relevance, permissions, integrations, exception handling, candidate experience, transparency, and human oversight.",
  },
] as const;