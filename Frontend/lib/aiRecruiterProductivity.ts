import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITER_PRODUCTIVITY_PATH = "/us/ai-recruiter-productivity-software";

export const AI_RECRUITER_PRODUCTIVITY_SEO = {
  title: "AI Recruiter Productivity Software | Huntlo",
  description:
    "Explore AI recruiter productivity software for reducing repetitive coordination, organizing candidate engagement, and improving recruiting workflows.",
  ogTitle: "Your Recruiters Were Hired to Recruit. Not to Chase Every Workflow Update.",
  ogDescription:
    "AI recruiter productivity software uses AI-assisted workflows to help recruiters organize repetitive activities, coordinate next steps, and maintain visibility into their recruitment work.",
} as const;

export function aiRecruiterProductivityMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITER_PRODUCTIVITY_SEO.title,
    description: AI_RECRUITER_PRODUCTIVITY_SEO.description,
    ogTitle: AI_RECRUITER_PRODUCTIVITY_SEO.ogTitle,
    ogDescription: AI_RECRUITER_PRODUCTIVITY_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITER_PRODUCTIVITY_PATH,
  });
}

export const AI_RECRUITER_PRODUCTIVITY_GEO = {
  askTopic: "Huntlo AI Recruiter Productivity Software",
  askPrompt:
    "What is Huntlo AI Recruiter Productivity Software on /us/ai-recruiter-productivity-software (https://www.huntlo.ai/us/ai-recruiter-productivity-software)? How does it help recruiters reduce repetitive coordination, organize candidate engagement, and improve recruiting workflows?",
} as const;

export const HERO_FLOW = [
  "Recruiter Productivity",
  "AI-Assisted Workflows",
  "Candidate Engagement",
  "Workflow Coordination",
  "Operational Visibility",
  "Human Judgment",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const PROBLEM_STATEMENTS = [
  "Fragmented tools across sourcing, communication, and records",
  "Manual handoffs between systems consume recruiter attention",
  "Interview coordination scattered across calendars and email",
  "Candidate responses require checking multiple sources",
  "Repetitive follow-ups and status updates",
  "Operational work crowds out candidate relationships",
] as const;

export const PRODUCTIVITY_MEANING = [
  "Operational efficiency — reducing unnecessary handoffs",
  "Quality of recruiting work — not just activity volume",
  "Time for professional judgment — candidate relationships and hiring decisions",
  "Workflow consistency — predictable next actions",
  "Communication quality — relevant, timely candidate interactions",
] as const;

export const TIME_LOST_AREAS = [
  "Switching between sourcing, communication, and ATS tools",
  "Manually connecting candidate responses to original context",
  "Coordinating interviews through calendars and email",
  "Updating candidate records across systems",
  "Tracking which follow-ups are due and when",
  "Finding the latest conversation thread",
] as const;

export const SOFTWARE_CAPABILITIES = [
  "Outreach preparation assistance",
  "Response organization and categorization",
  "Follow-up coordination",
  "Workflow visibility and tracking",
  "Agentic interpretation of candidate events",
  "Permitted action coordination",
] as const;

export const PRACTICAL_WORKFLOW = [
  {
    step: "Start with clear hiring priorities",
    description:
      "Identify active requirements and the actions needed to move each process forward.",
  },
  {
    step: "Organize candidate engagement",
    description:
      "Maintain relevant communication context across approved channels.",
  },
  {
    step: "Identify next actions",
    description:
      "Distinguish routine follow-ups, information requests, scheduling needs, and exceptions.",
  },
  {
    step: "Coordinate permitted activities",
    description:
      "Use approved automation where the action is predictable and appropriately authorized.",
  },
  {
    step: "Escalate complex situations",
    description:
      "Keep sensitive conversations and consequential decisions with recruiters.",
  },
  {
    step: "Review operational visibility",
    description:
      "Understand which actions remain pending and where the process is delayed.",
  },
  {
    step: "Improve recurring workflows",
    description:
      "Identify repetitive tasks that can be simplified without reducing candidate experience.",
  },
] as const;

export const AGENTIC_WORKFLOW_BENEFITS = [
  "Context-aware coordination instead of rigid rules",
  "Distinguishes different candidate response types",
  "Adapts when interviews are rescheduled or requirements change",
  "Prevents outdated workflows from continuing on timers",
  "Helps recruiters focus on situations requiring attention",
] as const;

export const HUMAN_ELEMENT_PRINCIPLES = [
  "Recruiters own candidate relationships and hiring decisions",
  "Automation reduces operational work, not human judgment",
  "Candidate communication remains accurate and appropriate",
  "Hiring managers receive professional advice, not opaque outputs",
  "Impersonal experiences and opaque decisions are avoided",
] as const;

export const FINAL_STATEMENT =
  "The strongest productivity improvement is not doing more administrative work in less time. It is needing less administrative work in the first place.";

export const AI_RECRUITER_PRODUCTIVITY_FAQS = [
  {
    question: "What is AI recruiter productivity software?",
    answer:
      "It uses AI-assisted functionality to support recurring recruiting tasks, coordinate workflows, and reduce unnecessary administrative effort.",
  },
  {
    question: "How can AI improve recruiter productivity?",
    answer:
      "AI-assisted workflows may help organize candidate responses, follow-ups, scheduling activities, and other routine operational tasks.",
  },
  {
    question: "Does AI recruiter productivity software replace recruiters?",
    answer:
      "No. Recruiters remain responsible for candidate relationships, professional judgment, and hiring decisions.",
  },
  {
    question: "What should recruiting teams measure?",
    answer:
      "Useful measures include time spent on repetitive coordination, unresolved handoffs, candidate communication quality, and workflow consistency.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Recruiting Operations Automation", href: "/us/ai-recruiting-operations-automation" },
  { label: "AI Recruiting Agents", href: "/us/ai-recruiting-agents" },
  { label: "AI Recruiting Workflow Orchestration", href: "/us/ai-recruiting-workflow-orchestration" },
] as const;