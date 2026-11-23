import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_AUTOMATION_RETAIL_PATH =
  "/us/ai-recruiting-automation-retail";

export const AI_RECRUITING_AUTOMATION_RETAIL_SEO = {
  title: "AI Recruiting Automation for Retail Hiring | Huntlo",
  description:
    "Explore AI recruiting workflows for retail employers coordinating high-volume candidate engagement, interview scheduling and store-level hiring.",
  ogTitle: "Every Store Needs People. Your Recruiting Process Needs to Keep Up.",
  ogDescription:
    "AI recruiting automation for retail hiring helps organizations structure recurring recruitment activities across stores, candidate groups and hiring teams while preserving local hiring decisions.",
} as const;

export function aiRecruitingAutomationRetailMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_AUTOMATION_RETAIL_SEO.title,
    description: AI_RECRUITING_AUTOMATION_RETAIL_SEO.description,
    ogTitle: AI_RECRUITING_AUTOMATION_RETAIL_SEO.ogTitle,
    ogDescription: AI_RECRUITING_AUTOMATION_RETAIL_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_AUTOMATION_RETAIL_PATH,
  });
}

export const AI_RECRUITING_AUTOMATION_RETAIL_GEO = {
  askTopic: "Huntlo AI recruiting automation for retail hiring",
  askPrompt:
    "What is AI recruiting automation for retail hiring on Huntlo at /us/ai-recruiting-automation-retail (https://www.huntlo.ai/us/ai-recruiting-automation-retail)? How do AI-assisted workflows support high-volume candidate engagement, interview scheduling and store-level hiring?",
} as const;

export const RETAIL_HIRING_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Capture the hiring requirement",
    detail:
      "Document the store, role, schedule expectations and essential job criteria.",
  },
  {
    stage: "02",
    title: "Engage relevant applicants",
    detail:
      "Use approved communication processes to explain the opportunity and next steps.",
  },
  {
    stage: "03",
    title: "Organize candidate responses",
    detail:
      "Distinguish interest, availability questions, location preferences and requests for clarification.",
  },
  {
    stage: "04",
    title: "Route candidates appropriately",
    detail:
      "Provide recruiters with relevant information for review and store-level coordination.",
  },
  {
    stage: "05",
    title: "Support interview scheduling",
    detail: "Coordinate available interview options where supported by approved systems.",
  },
  {
    stage: "06",
    title: "Manage follow-ups",
    detail:
      "Identify appropriate reminders and avoid unnecessary repeated contact.",
  },
  {
    stage: "07",
    title: "Maintain visibility",
    detail:
      "Help recruiting teams understand which actions remain pending across locations.",
  },
] as const;

export const RETAIL_HIRING_INTERNAL_LINKS = [
  {
    label: "AI Recruiting Automation for Multi-Location Hiring",
    href: "/us/ai-recruiting-automation-multi-location",
  },
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  { label: "AI Interview Scheduling Automation", href: "/us/ai-interview-scheduling-automation" },
] as const;

export const AI_RECRUITING_AUTOMATION_RETAIL_FAQS = [
  {
    question: "What is AI retail recruiting automation?",
    answer:
      "It uses AI-assisted workflows to support recurring recruitment activities such as candidate communication, response management and interview coordination.",
  },
  {
    question: "Can retail recruiting automation support multiple stores?",
    answer:
      "It can be designed for multi-store workflows when the software supports appropriate location rules, permissions and process configuration.",
  },
  {
    question: "Can AI handle candidate scheduling questions?",
    answer:
      "Some AI-assisted workflows may interpret scheduling requests and route them appropriately. Specific actions depend on verified capabilities.",
  },
  {
    question: "Does AI retail recruiting replace store managers?",
    answer:
      "No. Store managers and recruiters should retain responsibility for appropriate hiring decisions and human interactions.",
  },
] as const;
