import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_CANDIDATE_PIPELINE_AUTOMATION_PATH = "/us/ai-candidate-pipeline-automation";

export const AI_CANDIDATE_PIPELINE_AUTOMATION_SEO = {
  title: "AI Candidate Pipeline Automation Software | Huntlo",
  description:
    "Keep pipelines moving with AI candidate pipeline automation: stage triggers, follow-ups, and recruiter handoffs so candidates advance without manual chasing.",
  ogTitle: "A Recruiting Pipeline Is Only Useful When Candidates Keep Moving Through It.",
  ogDescription:
    "AI-assisted candidate pipeline automation that coordinates recurring recruiting activities across pipeline stages so candidates, recruiters, and hiring managers have a clearer path to the next action.",
} as const;

export function aiCandidatePipelineAutomationMetadata() {
  return buildPageMetadata({
    title: AI_CANDIDATE_PIPELINE_AUTOMATION_SEO.title,
    description: AI_CANDIDATE_PIPELINE_AUTOMATION_SEO.description,
    ogTitle: AI_CANDIDATE_PIPELINE_AUTOMATION_SEO.ogTitle,
    ogDescription: AI_CANDIDATE_PIPELINE_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_CANDIDATE_PIPELINE_AUTOMATION_PATH,
  });
}

export const AI_CANDIDATE_PIPELINE_AUTOMATION_GEO = {
  askTopic: "Huntlo AI candidate pipeline automation",
  askPrompt:
    "What is AI candidate pipeline automation on Huntlo at /us/ai-candidate-pipeline-automation (https://www.huntlo.ai/us/ai-candidate-pipeline-automation)? How do AI-assisted workflows coordinate recruiting stages, candidate communication, follow-ups, and recruiter handoffs?",
} as const;

export const VISIBILITY_GAPS = [
  {
    title: "Stage labels do not explain next actions",
    detail:
      "A candidate in screening may be waiting for a recruiter. Another may need to provide information. A third may have requested a callback. All three could appear in the same stage while requiring different actions.",
  },
  {
    title: "Pending work is invisible",
    detail:
      "A pipeline shows where candidates are recorded, but it does not always show what is pending, what information is missing, or who needs to respond.",
  },
  {
    title: "Operational friction repeats",
    detail:
      "When handoffs are delayed or require repeated manual work, candidates wait longer and recruiters spend time checking rather than progressing.",
  },
] as const;

export const DEFINITION_POINTS = [
  {
    title: "What it supports",
    detail:
      "AI-assisted software workflows may support response organization, follow-up coordination, interview handoffs, and process updates across the recruitment pipeline.",
  },
  {
    title: "What an agentic workflow may do",
    detail:
      "An agentic workflow may interpret relevant events and initiate permitted actions within defined boundaries. A completed interview may trigger a feedback coordination workflow. A candidate requesting a reschedule may require a different path.",
  },
  {
    title: "What it must not do",
    detail:
      "Automated interpretations should be reviewable. The system should not independently reject candidates or make unsupported assessments of suitability.",
  },
  {
    title: "What the value is",
    detail:
      "The opportunity is not simply to move records between columns. It is to make the process behind those records more dependable.",
  },
] as const;

export const EVENT_TRIGGERS = [
  {
    event: "Candidate expresses interest",
    detail:
      "An interested candidate should be routed to the appropriate next step — a screening conversation, an information request, or a recruiter review.",
  },
  {
    event: "Screening is completed",
    detail:
      "A completed screening may trigger a feedback coordination workflow or route the candidate for recruiter assessment.",
  },
  {
    event: "Interview is scheduled",
    detail:
      "A scheduled interview creates a set of communication and preparation actions that should be coordinated.",
  },
  {
    event: "Feedback is submitted",
    detail:
      "Submitted feedback should route to the appropriate stakeholder and update the candidate's pending status.",
  },
  {
    event: "Hiring manager makes a decision",
    detail:
      "A decision creates next actions — communication, offer coordination, or appropriate closure.",
  },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define pipeline stages",
    detail:
      "Establish clear stages that reflect the organization's actual recruitment process.",
  },
  {
    stage: "02",
    title: "Identify required actions",
    detail:
      "Document what needs to happen before a candidate moves to the next stage.",
  },
  {
    stage: "03",
    title: "Connect communication events",
    detail:
      "Recognize relevant candidate responses and requests.",
  },
  {
    stage: "04",
    title: "Coordinate handoffs",
    detail:
      "Route pending tasks to the appropriate recruiter or hiring stakeholder.",
  },
  {
    stage: "05",
    title: "Manage exceptions",
    detail:
      "Identify scheduling conflicts, missing information, and unresolved questions.",
  },
  {
    stage: "06",
    title: "Maintain human decision authority",
    detail:
      "Ensure consequential candidate progression and hiring decisions follow approved review processes.",
  },
  {
    stage: "07",
    title: "Review operational friction",
    detail:
      "Identify stages where handoffs are frequently delayed or require repeated manual work.",
  },
] as const;

export const AGENTIC_EXAMPLES = [
  {
    title: "Different interview time",
    detail:
      "A candidate who requests a different interview time should not automatically be treated as unresponsive. The workflow should route the request for coordination.",
  },
  {
    title: "Clarification needed",
    detail:
      "A candidate who asks for clarification should not be advanced without the required information. The workflow should pause progression and route the question.",
  },
  {
    title: "Exception handling",
    detail:
      "An agentic workflow can be designed to recognize these situations and route them appropriately. However, automated interpretations should be reviewable.",
  },
] as const;

export const PIPELINE_QUESTIONS = [
  {
    title: "What is pending?",
    detail:
      "Recruiters need to understand what information is missing and what action is required before a candidate can progress.",
  },
  {
    title: "Who needs to respond?",
    detail:
      "A useful pipeline automation strategy identifies which recruiter or hiring stakeholder is responsible for the next action.",
  },
  {
    title: "Which candidate requires a personal conversation?",
    detail:
      "Some situations require human judgment. The pipeline should make these cases visible rather than buried in a stage label.",
  },
  {
    title: "Which workflow has encountered an exception?",
    detail:
      "When a handoff fails or information is missing, the pipeline should surface the exception so it can be resolved.",
  },
] as const;

export const CANDIDATE_EXPERIENCE_POINTS = [
  {
    title: "Communication is the experience",
    detail:
      "Candidates experience the recruitment pipeline through communication. They do not see internal stage labels. They notice whether interview details are clear, whether their questions receive answers, and whether the process progresses appropriately.",
  },
  {
    title: "Timely and accurate",
    detail:
      "Automation should support timely, accurate communication while respecting privacy and candidate preferences.",
  },
  {
    title: "Understandable even when complex",
    detail:
      "The candidate experience should remain understandable even when the underlying workflow is complex.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Recruiting Operations Automation", href: "/us/ai-recruiting-operations-automation" },
  { label: "AI Interview Workflow Automation", href: "/us/ai-interview-workflow-automation" },
  { label: "Agentic AI Recruiting Software", href: "/us/agentic-ai-recruiting-software" },
] as const;

export const AI_CANDIDATE_PIPELINE_AUTOMATION_FAQS = [
  {
    question: "What is AI candidate pipeline automation?",
    answer:
      "It uses AI-assisted workflows to coordinate recurring activities across recruiting stages, including communication, follow-ups, and process handoffs.",
  },
  {
    question: "How is pipeline automation different from an ATS?",
    answer:
      "An ATS manages candidate records and stages. Pipeline automation focuses on coordinating actions that help the process progress.",
  },
  {
    question: "Can AI move candidates through recruitment stages?",
    answer:
      "Some workflows may support approved status updates, but consequential decisions require appropriate human oversight and verified system capabilities.",
  },
  {
    question: "What should recruiting teams automate first?",
    answer:
      "Start with a pipeline stage that has frequent repetitive handoffs, clear action rules, and measurable operational delays.",
  },
] as const;