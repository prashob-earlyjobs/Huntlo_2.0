import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_WORKFLOW_INTEGRATION_PATH =
  "/us/ai-recruiting-workflow-integration";

export const AI_RECRUITING_WORKFLOW_INTEGRATION_SEO = {
  title: "AI Recruiting Workflow Integration Software | Huntlo",
  description:
    "Connect ATS, engagement, and interview systems with AI recruiting workflow integration—so events, context, and approved actions move without manual copy-paste.",
  ogTitle:
    "Your Recruiting Tools Should Work Together. Your Recruiters Shouldn't Have to Connect Everything Manually.",
  ogDescription:
    "AI recruiting workflow integration focuses on connecting recruitment activities across systems so information, events, and approved actions move through a coordinated process.",
} as const;

export function aiRecruitingWorkflowIntegrationMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_WORKFLOW_INTEGRATION_SEO.title,
    description: AI_RECRUITING_WORKFLOW_INTEGRATION_SEO.description,
    ogTitle: AI_RECRUITING_WORKFLOW_INTEGRATION_SEO.ogTitle,
    ogDescription: AI_RECRUITING_WORKFLOW_INTEGRATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_WORKFLOW_INTEGRATION_PATH,
  });
}

export const AI_RECRUITING_WORKFLOW_INTEGRATION_GEO = {
  askTopic: "Huntlo AI recruiting workflow integration",
  askPrompt:
    "What is AI recruiting workflow integration on Huntlo at /us/ai-recruiting-workflow-integration (https://www.huntlo.ai/us/ai-recruiting-workflow-integration)? How do connected recruiting workflows coordinate candidate engagement, recruiting systems, interview coordination, and operational handoffs?",
} as const;

export const FRAGMENTED_SYSTEMS = [
  {
    name: "Applicant tracking",
    detail: "Candidate records and hiring stages",
    note: "Authoritative record",
  },
  {
    name: "Sourcing platform",
    detail: "Candidate discovery and lists",
    note: "Discovery layer",
  },
  {
    name: "Communication tools",
    detail: "Outreach, replies, follow-ups",
    note: "Conversation layer",
  },
  {
    name: "Calendar and scheduling",
    detail: "Interview slots and invitations",
    note: "Coordination layer",
  },
  {
    name: "Reporting",
    detail: "Pipeline and activity visibility",
    note: "Review layer",
  },
  {
    name: "Recruiter memory",
    detail: "Context held by people, not systems",
    note: "The connection layer",
  },
] as const;

export const INTEGRATION_LAYERS = [
  {
    layer: "01",
    title: "Data exchange",
    detail:
      "Defined information moves between systems with a known source of truth, such as candidate records, stage changes, or interview details.",
    guardrail: "Requires supported APIs and permissions.",
  },
  {
    layer: "02",
    title: "Workflow automation",
    detail:
      "A recurring action follows from a defined event, such as an approved follow-up after a candidate reply or a task when a stage changes.",
    guardrail: "Requires explicit action rules.",
  },
  {
    layer: "03",
    title: "Agentic coordination",
    detail:
      "Contextual interpretation may connect an event to an approved next step when the situation is not fully predictable from fixed rules.",
    guardrail: "Requires human review boundaries.",
  },
] as const;

export const INTEGRATION_FRAMEWORK = [
  {
    step: "01",
    title: "Map the existing systems",
    detail:
      "Identify where candidate records, communications, scheduling information, and workflow states are maintained.",
  },
  {
    step: "02",
    title: "Define the process",
    detail:
      "Document what should happen when a candidate progresses through recruitment.",
  },
  {
    step: "03",
    title: "Identify relevant events",
    detail:
      "Determine which changes should initiate operational actions.",
  },
  {
    step: "04",
    title: "Establish permissions",
    detail:
      "Specify which systems and users are authorized to read, write, or update information.",
  },
  {
    step: "05",
    title: "Design action rules",
    detail:
      "Define the activities that can be automated and those requiring approval.",
  },
  {
    step: "06",
    title: "Handle exceptions",
    detail:
      "Create a process for failed integrations, conflicting information, and ambiguous events.",
  },
  {
    step: "07",
    title: "Maintain operational visibility",
    detail:
      "Ensure recruiters can understand what happened and what remains pending.",
  },
] as const;

export const AGENTIC_SCENARIOS = [
  {
    event: "A candidate asks for a callback",
    coordination: "Communication and scheduling coordination",
    boundary: "Recruiter confirms the committed time.",
  },
  {
    event: "A hiring requirement changes",
    coordination: "Review of active outreach affected by the change",
    boundary: "Recruiter approves revised messaging.",
  },
  {
    event: "A vacancy closes",
    coordination: "Review of pending candidate communications",
    boundary: "Recruiter decides how to close the loop.",
  },
  {
    event: "An interview is rescheduled",
    coordination: "Updates to invitations, candidate notice, and internal tasks",
    boundary: "Coordinator confirms the final arrangement.",
  },
] as const;

export const GOVERNANCE_PRINCIPLES = [
  {
    title: "One authoritative record",
    detail:
      "Each piece of candidate information should have a known system of record so automation does not act on a stale copy.",
  },
  {
    title: "Scoped permissions",
    detail:
      "Connected systems should read and write only the information their role in the workflow requires.",
  },
  {
    title: "Reviewable actions",
    detail:
      "Automated actions should leave a visible trace so recruiters and administrators can explain what happened.",
  },
  {
    title: "Exception paths",
    detail:
      "Failed syncs, conflicting records, and ambiguous events need an owner and a defined escalation route.",
  },
  {
    title: "Human employment decisions",
    detail:
      "Interpretation may organize work, but consequential hiring judgments remain with people.",
  },
] as const;

export const INTEGRATION_INTERNAL_LINKS = [
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  {
    label: "AI Recruiting Operations Automation",
    href: "/us/ai-recruiting-operations-automation",
  },
  {
    label: "AI Candidate Pipeline Automation",
    href: "/us/ai-candidate-pipeline-automation",
  },
] as const;

export const AI_RECRUITING_WORKFLOW_INTEGRATION_FAQS = [
  {
    question: "What is AI recruiting workflow integration?",
    answer:
      "It refers to connecting recruitment systems and activities through software workflows that may use AI-assisted interpretation and coordination.",
  },
  {
    question: "How is integration different from automation?",
    answer:
      "Integration connects systems or exchanges information. Automation coordinates actions. A recruiting workflow may use both.",
  },
  {
    question: "Can AI recruiting software integrate with an ATS?",
    answer:
      "That depends on the platform's verified integrations, available APIs, permissions, and technical requirements.",
  },
  {
    question: "What should teams evaluate before integrating recruiting tools?",
    answer:
      "Review data accuracy, access permissions, system compatibility, exception handling, privacy requirements, and human oversight.",
  },
] as const;
