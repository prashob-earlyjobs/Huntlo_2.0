import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_INTERVIEW_SCHEDULING_AUTOMATION_PATH =
  "/us/ai-interview-scheduling-automation";

export const AI_INTERVIEW_SCHEDULING_AUTOMATION_SEO = {
  title: "AI Interview Scheduling Automation Software | Huntlo",
  description:
    "Automate interview scheduling: candidate self-booking, panel coordination, reminders, and rescheduling—with recruiter control when exceptions need a human.",
  ogTitle: "The Interview Is Important. The Scheduling Work Shouldn't Take Over the Day.",
  ogDescription:
    "AI-assisted interview scheduling automation helps teams organize repetitive coordination while preserving human control over exceptions.",
} as const;

export function aiInterviewSchedulingAutomationMetadata() {
  return buildPageMetadata({
    title: AI_INTERVIEW_SCHEDULING_AUTOMATION_SEO.title,
    description: AI_INTERVIEW_SCHEDULING_AUTOMATION_SEO.description,
    ogTitle: AI_INTERVIEW_SCHEDULING_AUTOMATION_SEO.ogTitle,
    ogDescription: AI_INTERVIEW_SCHEDULING_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_INTERVIEW_SCHEDULING_AUTOMATION_PATH,
  });
}

export const AI_INTERVIEW_SCHEDULING_AUTOMATION_GEO = {
  askTopic: "Huntlo AI interview scheduling automation",
  askPrompt:
    "What is AI interview scheduling automation on Huntlo at /us/ai-interview-scheduling-automation (https://www.huntlo.ai/us/ai-interview-scheduling-automation)? How does it coordinate availability, confirmations, reminders, and rescheduling while keeping recruiters in control?",
} as const;

export const FRICTION_THREAD = [
  {
    from: "candidate",
    label: "Candidate",
    body: "I can do Tuesday 2–4pm or Wednesday morning.",
  },
  {
    from: "manager",
    label: "Hiring manager",
    body: "Both conflict with an all-hands. Can we try Thursday?",
  },
  {
    from: "candidate",
    label: "Next morning",
    body: "Thursday works - afternoon preferred.",
  },
  {
    from: "system",
    label: "Calendar",
    body: "Thursday afternoon is no longer open. Recruiter restarts the loop.",
  },
] as const;

export const WORKFLOW_STAGES = [
  {
    step: "01",
    title: "Candidate readiness",
    detail:
      "Confirm that the candidate has reached the appropriate stage and understands the purpose of the interview.",
    checkpoint: false,
  },
  {
    step: "02",
    title: "Availability collection",
    detail: "Gather suitable time windows through an approved communication process.",
    checkpoint: false,
  },
  {
    step: "03",
    title: "Scheduling coordination",
    detail:
      "Match available options using the calendar systems and permissions supported by the implementation.",
    checkpoint: false,
  },
  {
    step: "04",
    title: "Confirmation",
    detail: "Communicate the agreed schedule, interview format and relevant instructions.",
    checkpoint: false,
  },
  {
    step: "05",
    title: "Reminders and changes",
    detail: "Handle routine reminders and identify rescheduling requests that require further action.",
    checkpoint: true,
  },
  {
    step: "06",
    title: "Recruiter visibility",
    detail: "Make the current status and unresolved scheduling issues easy to review.",
    checkpoint: false,
  },
] as const;

export const HUMAN_BOUNDARIES = [
  {
    title: "Executive and panel interviews",
    description:
      "Complex panel discussions and senior interviews often need personal coordination rather than a fully automated path.",
  },
  {
    title: "Accessibility and sensitive context",
    description:
      "Accessibility requests and sensitive candidate circumstances should route to a recruiter who can assist thoughtfully.",
  },
  {
    title: "Ambiguous exceptions",
    description:
      "When a request is unclear, recruiters should be able to intervene before the workflow sends another automated message.",
  },
  {
    title: "Responsible communication",
    description:
      "Avoid excessive reminders, calendar conflicts, or exposing unnecessary candidate information.",
  },
] as const;

export const CANDIDATE_CLARITY = [
  {
    title: "Interview type and duration",
    description: "Candidates should know what they are attending and how long it is expected to take.",
  },
  {
    title: "Preparation and change requests",
    description:
      "Share what preparation is required and how to request a change without starting a new email chain.",
  },
  {
    title: "Confirmation status",
    description:
      "Recruiters should know whether the candidate has confirmed and whether an exception remains unresolved.",
  },
  {
    title: "Hiring manager context",
    description:
      "Managers should receive the information needed to participate without repeatedly asking for updates.",
  },
] as const;

export const EXCEPTION_QUEUE = [
  { name: "Jordan Lee", issue: "Reschedule request", status: "Needs review" },
  { name: "Priya Shah", issue: "Panel conflict", status: "Escalated" },
  { name: "Marcus Chen", issue: "Confirmed · Reminder set", status: "On track" },
] as const;

export const INTERNAL_LINKS = [
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  { label: "Automated Candidate Follow-Up", href: "/automated-candidate-follow-up" },
  { label: "Agentic AI Recruiting Software", href: "/us/agentic-ai-recruiting-software" },
] as const;

export const AI_INTERVIEW_SCHEDULING_AUTOMATION_FAQS = [
  {
    question: "What is AI interview scheduling automation?",
    answer:
      "It uses automation and, where appropriate, AI-assisted interpretation to help coordinate interview availability, confirmations, reminders and scheduling changes.",
  },
  {
    question: "Can AI reschedule interviews automatically?",
    answer:
      "That depends on the software's verified capabilities, calendar permissions and workflow rules. Complex or sensitive changes may require recruiter approval.",
  },
  {
    question: "Does scheduling automation improve candidate experience?",
    answer:
      "It can help make communication more timely and consistent when implemented carefully. Candidate experience also depends on clarity, accessibility and human support.",
  },
  {
    question: "Is AI scheduling suitable for staffing agencies?",
    answer:
      "Staffing agencies can benefit from evaluating coordinated scheduling workflows, particularly when managing multiple candidates and client interview processes.",
  },
] as const;
