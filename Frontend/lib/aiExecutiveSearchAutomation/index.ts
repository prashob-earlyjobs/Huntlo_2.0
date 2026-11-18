import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_EXECUTIVE_SEARCH_AUTOMATION_PATH =
  "/us/ai-executive-search-automation";

export const AI_EXECUTIVE_SEARCH_AUTOMATION_SEO = {
  title: "AI Recruiting Automation for Executive Search | Huntlo",
  description:
    "Explore AI-assisted executive search workflows for research coordination, candidate engagement, follow-ups, and confidential recruiting operations.",
  ogTitle: "Executive Search Is Built on Relationships. The Workflow Around Those Relationships Can Be Better.",
  ogDescription:
    "AI executive search automation focuses on supporting the operational tasks surrounding leadership recruitment while preserving the human relationships and judgment that define executive search.",
} as const;

export function aiExecutiveSearchAutomationMetadata() {
  return buildPageMetadata({
    title: AI_EXECUTIVE_SEARCH_AUTOMATION_SEO.title,
    description: AI_EXECUTIVE_SEARCH_AUTOMATION_SEO.description,
    ogTitle: AI_EXECUTIVE_SEARCH_AUTOMATION_SEO.ogTitle,
    ogDescription: AI_EXECUTIVE_SEARCH_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_EXECUTIVE_SEARCH_AUTOMATION_PATH,
  });
}

export const AI_EXECUTIVE_SEARCH_AUTOMATION_GEO = {
  askTopic: "Huntlo AI recruiting automation for executive search",
  askPrompt:
    "What is AI executive search automation on Huntlo at /us/ai-executive-search-automation (https://www.huntlo.ai/us/ai-executive-search-automation)? How do AI-assisted workflows support research coordination, candidate engagement, follow-ups, and confidential recruiting operations?",
} as const;

export const EXECUTIVE_SEARCH_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Assignment definition",
    detail:
      "Document the leadership requirement, client expectations, confidentiality boundaries, and search criteria.",
  },
  {
    stage: "02",
    title: "Research organization",
    detail:
      "Maintain relevant candidate information and research notes within approved systems.",
  },
  {
    stage: "03",
    title: "Outreach preparation",
    detail:
      "Develop contextually relevant communication for consultant review.",
  },
  {
    stage: "04",
    title: "Candidate engagement",
    detail:
      "Manage appropriate contact and track responses without excessive automated messaging.",
  },
  {
    stage: "05",
    title: "Response coordination",
    detail:
      "Identify interest, questions, scheduling requests, and situations requiring direct consultant attention.",
  },
  {
    stage: "06",
    title: "Interview operations",
    detail:
      "Support scheduling and approved follow-up activities.",
  },
  {
    stage: "07",
    title: "Client communication",
    detail:
      "Maintain clear visibility into search progress without exposing unnecessary candidate information.",
  },
] as const;

export const EXECUTIVE_SEARCH_INTERNAL_LINKS = [
  {
    label: "AI Candidate Re-Engagement Automation",
    href: "/us/ai-candidate-re-engagement-automation",
  },
  {
    label: "AI Recruiting Agents",
    href: "/us/ai-recruiting-agents",
  },
  { label: "AI Recruiting Workflow Orchestration", href: "/us/ai-recruiting-workflow-orchestration" },
] as const;

export const AI_EXECUTIVE_SEARCH_AUTOMATION_FAQS = [
  {
    question: "How can AI support executive search?",
    answer:
      "AI-assisted workflows can support research organization, outreach preparation, response coordination, and selected administrative activities.",
  },
  {
    question: "Can AI replace executive search consultants?",
    answer:
      "No. Executive search relies on professional judgment, confidential relationships, and nuanced candidate evaluation.",
  },
  {
    question: "Is automated outreach appropriate for executive recruitment?",
    answer:
      "It requires careful consideration of relevance, confidentiality, communication permissions, and the expectations of senior-level candidates.",
  },
  {
    question: "What should executive search firms automate first?",
    answer:
      "Begin with internal coordination tasks that are repetitive, measurable, and do not compromise sensitive candidate relationships.",
  },
] as const;