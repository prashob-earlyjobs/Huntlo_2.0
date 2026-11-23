import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_INTERVIEW_WORKFLOW_AUTOMATION_PATH =
  "/us/ai-interview-workflow-automation";

export const AI_INTERVIEW_WORKFLOW_AUTOMATION_SEO = {
  title: "AI Interview Workflow Automation Software | Huntlo",
  description:
    "Automate interview workflows beyond scheduling: confirmations, reminders, feedback routing, and candidate updates—while humans keep evaluation and hiring decisions.",
  ogTitle: "Scheduling the Interview Is Only One Part of the Interview Workflow.",
  ogDescription:
    "AI interview workflow automation coordinates the operational activities surrounding interviews — from preparation and communication to feedback, next-stage routing, and candidate updates — while preserving human responsibility for evaluation and decisions.",
} as const;

export function aiInterviewWorkflowAutomationMetadata() {
  return buildPageMetadata({
    title: AI_INTERVIEW_WORKFLOW_AUTOMATION_SEO.title,
    description: AI_INTERVIEW_WORKFLOW_AUTOMATION_SEO.description,
    ogTitle: AI_INTERVIEW_WORKFLOW_AUTOMATION_SEO.ogTitle,
    ogDescription: AI_INTERVIEW_WORKFLOW_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_INTERVIEW_WORKFLOW_AUTOMATION_PATH,
  });
}

export const AI_INTERVIEW_WORKFLOW_AUTOMATION_GEO = {
  askTopic: "Huntlo AI interview workflow automation",
  askPrompt:
    "What is AI interview workflow automation on Huntlo at /us/ai-interview-workflow-automation (https://www.huntlo.ai/us/ai-interview-workflow-automation)? How do AI-assisted workflows coordinate interview stages, candidate communication, recruiter handoffs, and follow-ups while preserving human evaluation and decisions?",
} as const;

export const HANDOFF_CARD_ITEMS = [
  {
    stage: "Scheduling",
    owner: "Recruiter ↔ Candidate",
    detail:
      "Availability, confirmations and calendar invites are coordinated across disconnected tools.",
  },
  {
    stage: "Interview",
    owner: "Interviewer ↔ Candidate",
    detail:
      "Interviewers need relevant context; the candidate needs preparation details and clear instructions.",
  },
  {
    stage: "Feedback",
    owner: "Interviewer → Hiring manager",
    detail:
      "Feedback must be collected before a hiring decision can be made.",
  },
  {
    stage: "Follow-up",
    owner: "Recruiter ↔ Candidate",
    detail:
      "Timely updates on next steps keep candidates informed and reduce uncertainty.",
  },
] as const;

export const JOURNEY_STAGES = [
  {
    stage: "01",
    title: "Interview readiness",
    detail:
      "Confirm the candidate has reached the appropriate stage and understands the next step.",
  },
  {
    stage: "02",
    title: "Interview preparation",
    detail:
      "Provide approved details about the format, location, participants, and relevant instructions.",
  },
  {
    stage: "03",
    title: "Scheduling coordination",
    detail:
      "Support availability collection and confirmations where connected systems permit.",
  },
  {
    stage: "04",
    title: "Attendance and exceptions",
    detail:
      "Organize relevant changes, candidate questions, and scheduling conflicts.",
  },
  {
    stage: "05",
    title: "Feedback coordination",
    detail:
      "Help the recruiting team track whether appropriate interviewer feedback has been received.",
  },
  {
    stage: "06",
    title: "Next-stage routing",
    detail:
      "Identify the workflow actions required after an authorized human decision.",
  },
  {
    stage: "07",
    title: "Candidate communication",
    detail:
      "Support timely, accurate updates through approved channels.",
  },
] as const;

export const AGENTIC_EVENTS = [
  {
    event: "Candidate requests a schedule change",
    coordination: "Update the calendar invitation and notify affected participants.",
    checkpoint: "Recruiter approves if the change is significant or conflicts persist.",
  },
  {
    event: "Interview completes",
    coordination: "Trigger a feedback request to the appropriate interviewer.",
    checkpoint: "Human submits feedback; the system never fabricates evaluations.",
  },
  {
    event: "Hiring manager records a decision",
    coordination: "Determine the next candidate communication and route subsequent actions.",
    checkpoint: "Final hiring decisions remain with authorized humans.",
  },
  {
    event: "Candidate asks for an update",
    coordination: "Share approved status information through supported channels.",
    checkpoint: "Sensitive or ambiguous questions route to a recruiter.",
  },
] as const;

export const CANDIDATE_EXPERIENCE_POINTS = [
  {
    title: "Clarity on next steps",
    detail:
      "Candidates should understand what happens next and whom to contact about scheduling issues.",
  },
  {
    title: "Consistent information",
    detail:
      "A well-designed workflow reduces contradictory messages from different people.",
  },
  {
    title: "Respect for needs and privacy",
    detail:
      "Accessibility needs, privacy requirements, and communication preferences should be honored.",
  },
  {
    title: "Transparent, not less personal",
    detail:
      "Automation should make the process more transparent — not less personal.",
  },
] as const;

export const AI_INTERVIEW_WORKFLOW_AUTOMATION_INTERNAL_LINKS = [
  {
    label: "AI Interview Scheduling Automation",
    href: "/us/ai-interview-scheduling-automation",
  },
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  {
    label: "Agentic AI Recruiting Software",
    href: "/us/agentic-ai-recruiting-software",
  },
] as const;

export const AI_INTERVIEW_WORKFLOW_AUTOMATION_FAQS = [
  {
    question: "What is AI interview workflow automation?",
    answer:
      "It uses AI-assisted workflows to coordinate recurring activities around interviews, including communication, scheduling, feedback handoffs, and next-stage coordination.",
  },
  {
    question:
      "How is interview workflow automation different from scheduling automation?",
    answer:
      "Scheduling automation focuses on arranging meetings. Interview workflow automation addresses the broader process before and after the interview.",
  },
  {
    question: "Can AI automate interview feedback?",
    answer:
      "Software may support feedback collection and organization, but evaluations and consequential hiring decisions require appropriate human responsibility.",
  },
  {
    question: "Can interview workflows integrate with an ATS?",
    answer:
      "Potentially, depending on verified integrations, permissions, and available data access.",
  },
] as const;