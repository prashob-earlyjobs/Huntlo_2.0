import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_PATH =
  "/us/ai-recruitment-workflow-intelligence";

export const AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO = {
  title: "AI Recruitment Workflow Intelligence | Huntlo",
  description:
    "Explore AI recruitment workflow intelligence for understanding process delays, candidate engagement signals, and recruiting operational bottlenecks.",
  ogTitle: "Recruiting Teams Have Data. What They Need Is Clarity About Where Work Gets Stuck.",
  ogDescription:
    "AI recruitment workflow intelligence refers to using AI-assisted analysis to understand how recruiting processes operate, identify recurring friction, and support better workflow decisions.",
} as const;

export function aiRecruitmentWorkflowIntelligenceMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO.title,
    description: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO.description,
    ogTitle: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO.ogTitle,
    ogDescription: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_PATH,
  });
}

export const AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_GEO = {
  askTopic: "Huntlo AI Recruitment Workflow Intelligence",
  askPrompt:
    "What is Huntlo AI Recruitment Workflow Intelligence on /us/ai-recruitment-workflow-intelligence (https://www.huntlo.ai/us/ai-recruitment-workflow-intelligence)? How does it help recruiting teams understand process delays, candidate engagement signals, and operational bottlenecks?",
} as const;

export const HERO_FLOW = [
  "Workflow Intelligence",
  "Process Analysis",
  "Bottleneck Identification",
  "Operational Clarity",
  "Informed Improvement",
  "Recruiting Outcomes",
  "Huntlo",
] as const;

export const PROBLEM_STATEMENTS = [
  "Dashboards show status but not why work is stuck",
  "Pipeline stages have candidates waiting without clear reason",
  "Recurring delays are difficult to identify across systems",
  "Manual handoffs create unnecessary coordination effort",
  "Same exceptions require repeated manual resolution",
  "Operational questions need manual analysis across tools",
] as const;

export const WORKFLOW_VS_ANALYTICS = [
  {
    aspect: "Traditional Analytics",
    focus: "Activity volume, pipeline counts, outcome metrics",
    limitation: "Shows what happened, not why it happened",
  },
  {
    aspect: "Workflow Intelligence",
    focus: "Operational events, handoffs, delays, friction patterns",
    value: "Identifies where process improvements are needed",
  },
] as const;

export const AI_ASSISTED_APPLICATIONS = [
  "Organize workflow events and communication signals",
  "Identify recurring handoff delays and patterns",
  "Summarize unresolved tasks and exceptions",
  "Highlight areas requiring operational review",
  "Support interpretation with underlying records",
] as const;

export const PRACTICAL_WORKFLOW = [
  {
    step: "Define the process",
    description:
      "Document the recruitment stages and the expected actions within each stage.",
  },
  {
    step: "Identify relevant events",
    description:
      "Determine which actions and changes are meaningful to the workflow.",
  },
  {
    step: "Collect appropriate operational data",
    description:
      "Use authorized systems and information sources.",
  },
  {
    step: "Examine recurring friction",
    description:
      "Review delays, unresolved exceptions, and repeated manual handoffs.",
  },
  {
    step: "Interpret the findings",
    description:
      "Distinguish actual process issues from incomplete or misleading data.",
  },
  {
    step: "Prioritize improvements",
    description:
      "Select workflow changes that address a clearly defined problem.",
  },
  {
    step: "Review the outcome",
    description:
      "Evaluate whether the revised process improves operational clarity and consistency.",
  },
] as const;

export const INTELLIGENCE_TO_ACTION = [
  "Understand the bottleneck through operational analysis",
  "Review root causes — incomplete data, unclear rules, disconnected systems",
  "Evaluate whether workflow automation would help the specific issue",
  "Implement approved changes with human oversight",
  "Measure whether the revised process improves clarity and consistency",
] as const;

export const AGENTIC_CONNECTION = [
  "Intelligence identifies frequent events and meaningful exceptions",
  "Orchestration coordinates approved actions in response",
  "Human operators define process, review exceptions, make decisions",
  "Both approaches complement each other conceptually",
] as const;

export const GOVERNANCE_PRINCIPLES = [
  "Process delays are not automatically evidence of poor performance",
  "Different roles have different requirements and timelines",
  "Candidate availability and hiring manager responsiveness vary",
  "Interpret workflow information carefully, avoid unsupported conclusions",
  "Privacy, access controls, and appropriate data use matter",
] as const;

export const FINAL_STATEMENT =
  "The value of recruiting intelligence is not how much information it produces. It is whether that information helps teams improve the way recruitment works.";

export const AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_FAQS = [
  {
    question: "What is AI recruitment workflow intelligence?",
    answer:
      "It uses AI-assisted analysis to help recruiting teams understand process activity, identify recurring bottlenecks, and evaluate workflow improvements.",
  },
  {
    question: "How is workflow intelligence different from recruiting analytics?",
    answer:
      "Recruiting analytics often summarizes activity and outcomes. Workflow intelligence focuses on operational events, handoffs, delays, and process friction.",
  },
  {
    question: "Can AI identify recruitment bottlenecks?",
    answer:
      "AI-assisted analysis may help highlight patterns, but findings should be validated against accurate operational data and business context.",
  },
  {
    question: "Does workflow intelligence automate recruiting tasks?",
    answer:
      "Intelligence and automation are distinct. Intelligence supports understanding; automation coordinates actions. They may be connected in an appropriately designed system.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Recruiting Operations Automation", href: "/us/ai-recruiting-operations-automation" },
  { label: "AI Candidate Response Intelligence", href: "/us/ai-candidate-response-intelligence" },
  { label: "AI Recruiting Workflow Orchestration", href: "/us/ai-recruiting-workflow-orchestration" },
] as const;