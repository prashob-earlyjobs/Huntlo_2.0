import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_WORKFLOW_ORCHESTRATION_PATH =
  "/us/ai-recruiting-workflow-orchestration";

export const AI_RECRUITING_WORKFLOW_ORCHESTRATION_SEO = {
  title: "AI Recruiting Workflow Orchestration Software | Huntlo",
  description:
    "Orchestrate recruiting workflows so each stage triggers the next: connect tasks, candidate responses, and human approvals without relying on manual reminders.",
  ogTitle: "Your Recruiting Workflow Should Not Depend on Someone Remembering the Next Step.",
  ogDescription:
    "AI recruiting workflow orchestration coordinates information and actions across recruiting activities so each stage can trigger an appropriate next step.",
} as const;

export function aiRecruitingWorkflowOrchestrationMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_WORKFLOW_ORCHESTRATION_SEO.title,
    description: AI_RECRUITING_WORKFLOW_ORCHESTRATION_SEO.description,
    ogTitle: AI_RECRUITING_WORKFLOW_ORCHESTRATION_SEO.ogTitle,
    ogDescription: AI_RECRUITING_WORKFLOW_ORCHESTRATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_WORKFLOW_ORCHESTRATION_PATH,
  });
}

export const AI_RECRUITING_WORKFLOW_ORCHESTRATION_GEO = {
  askTopic: "Huntlo AI recruiting workflow orchestration",
  askPrompt:
    "What is AI recruiting workflow orchestration on Huntlo at /us/ai-recruiting-workflow-orchestration (https://www.huntlo.ai/us/ai-recruiting-workflow-orchestration)? How does it coordinate recruiting tasks, candidate responses, and human approvals across a hiring journey?",
} as const;

export const HERO_LAYERS = [
  { label: "Trigger", detail: "Candidate replies" },
  { label: "Context", detail: "Role · history · consent" },
  { label: "Action", detail: "Next permitted step" },
  { label: "Exception", detail: "Escalate if needed" },
  { label: "Review", detail: "Recruiter visibility" },
] as const;

export const BEFORE_AFTER = {
  before: {
    title: "Disconnected tasks",
    items: [
      "Outreach sequence runs in isolation",
      "Reply lands in a separate inbox",
      "Stage update waits on a manual reminder",
      "Hiring manager notified without context",
      "Reschedule request creates a new thread",
    ],
  },
  after: {
    title: "Coordinated workflow",
    items: [
      "Response event triggers the next step",
      "Context travels with the candidate",
      "Permitted actions proceed; exceptions pause",
      "Recruiter sees pending decisions clearly",
      "Scheduling conflicts follow a defined path",
    ],
  },
} as const;

export const EVENT_MODEL = [
  {
    title: "Trigger",
    description: "A candidate responds, a screen completes, or an interview is rescheduled.",
  },
  {
    title: "Context",
    description: "Relevant history, role criteria, consent, and prior actions inform what can happen next.",
  },
  {
    title: "Action",
    description: "The workflow initiates a permitted next step within approved boundaries.",
  },
  {
    title: "Exception",
    description: "Conflicts, questions, missing data, or failed actions follow a clear escalation path.",
  },
  {
    title: "Review",
    description: "Recruiters retain visibility into completed, pending, and human-required work.",
  },
] as const;

export const ORCHESTRATION_STEPS = [
  {
    step: "01",
    title: "Define the workflow objective",
    detail:
      "Start with an outcome, such as moving interested candidates from initial response to a confirmed screening conversation.",
  },
  {
    step: "02",
    title: "Identify the systems involved",
    detail:
      "Document where candidate information, communication history, scheduling details, and recruiter notes are stored.",
  },
  {
    step: "03",
    title: "Establish event triggers",
    detail: "Define which changes should initiate workflow activity.",
  },
  {
    step: "04",
    title: "Set action boundaries",
    detail: "Specify what can happen automatically and what requires human approval.",
  },
  {
    step: "05",
    title: "Manage exceptions",
    detail:
      "Create clear paths for conflicting information, candidate questions, missing data, and failed actions.",
  },
  {
    step: "06",
    title: "Measure workflow performance",
    detail:
      "Review where handoffs are delayed, where candidates disengage, and where recruiters spend time correcting processes.",
  },
] as const;

export const ANATOMY_SECTIONS = [
  {
    eyebrow: "Triggers",
    title: "Design around recruiting events, not just tasks",
    body: "A candidate responds. A screening is completed. An interview is rescheduled. A hiring manager requests more information. A candidate becomes unavailable. Each event changes what the recruiting team needs to do next.",
  },
  {
    eyebrow: "Permissions",
    title: "Consistency without unnecessary rigidity",
    body: "A well-designed orchestration process defines next steps in advance while allowing appropriate flexibility when real-world situations do not match a simple rule.",
  },
  {
    eyebrow: "Human checkpoints",
    title: "Oversight that stays visible",
    body: "Orchestration should not turn recruiting into a system of invisible decisions. Recruiters need to understand which actions were completed, which remain pending, and which require intervention.",
  },
] as const;

export const OPERATIONAL_OUTCOMES = [
  {
    title: "Fewer forgotten handoffs",
    description:
      "The next step is tied to an event - not to someone remembering to check an inbox.",
  },
  {
    title: "Clearer ownership",
    description:
      "Automation and approval boundaries make it obvious who acts and when a person must decide.",
  },
  {
    title: "Better exception handling",
    description:
      "Conflicts and candidate questions follow a defined path instead of stalling the process.",
  },
  {
    title: "Accountable execution",
    description:
      "Teams can see completed work, pending actions, and interventions without adding another isolated dashboard.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "Agentic AI Recruiting Software", href: "/us/agentic-ai-recruiting-software" },
  {
    label: "AI Interview Scheduling Automation",
    href: "/us/ai-interview-scheduling-automation",
  },
  { label: "Recruiting Workflow Automation", href: "/recruiting-workflow-automation" },
  { label: "Automated Candidate Follow-Up", href: "/automated-candidate-follow-up" },
  { label: "Workflow Orchestration", href: "/workflow-orchestration" },
] as const;

export const AI_RECRUITING_WORKFLOW_ORCHESTRATION_FAQS = [
  {
    question: "What is recruitment workflow orchestration?",
    answer:
      "It is the coordination of recruitment tasks, data and decisions across process stages, helping teams manage the actions that connect sourcing, engagement, screening and interviews.",
  },
  {
    question: "How is orchestration different from workflow automation?",
    answer:
      "Automation handles defined tasks or rules. Orchestration coordinates multiple tasks and their dependencies across a broader process.",
  },
  {
    question: "Can orchestration work with an existing ATS?",
    answer:
      "It may complement an ATS, depending on the available integrations, permissions and data access. Specific compatibility must be verified.",
  },
  {
    question: "What should recruiting teams automate first?",
    answer:
      "Start with a frequent, measurable workflow that contains repetitive handoffs, clear decision boundaries and limited operational risk.",
  },
] as const;
