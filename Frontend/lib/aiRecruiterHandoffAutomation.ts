import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITER_HANDOFF_AUTOMATION_PATH =
  "/us/ai-recruiter-handoff-automation";

export const AI_RECRUITER_HANDOFF_AUTOMATION_SEO = {
  title: "AI Recruiter Handoff Automation Software | Huntlo",
  description:
    "Pass candidates between recruiters without losing context: AI handoff automation packages conversation history, next actions, and ownership for clean ATS-ready transitions.",
  ogTitle:
    "Candidate Conversations Shouldn't Lose Context When They Move Between Recruiters.",
  ogDescription:
    "AI recruiter handoff automation focuses on coordinating the transfer of relevant candidate context, responsibilities, and next actions between recruitment team members.",
} as const;

export function aiRecruiterHandoffAutomationMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITER_HANDOFF_AUTOMATION_SEO.title,
    description: AI_RECRUITER_HANDOFF_AUTOMATION_SEO.description,
    ogTitle: AI_RECRUITER_HANDOFF_AUTOMATION_SEO.ogTitle,
    ogDescription: AI_RECRUITER_HANDOFF_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITER_HANDOFF_AUTOMATION_PATH,
  });
}

export const AI_RECRUITER_HANDOFF_AUTOMATION_GEO = {
  askTopic: "Huntlo AI recruiter handoff automation",
  askPrompt:
    "What is AI recruiter handoff automation on Huntlo at /us/ai-recruiter-handoff-automation (https://www.huntlo.ai/us/ai-recruiter-handoff-automation)? How do AI-assisted workflows coordinate candidate transitions, preserve conversation context, and support recruiting team coordination?",
} as const;

export const HANDOFF_PARTICIPANTS = [
  {
    role: "Sourcer",
    owns: "Identifies the candidate and opens the conversation",
    hands: "Interest, initial questions, agreed next step",
  },
  {
    role: "Recruiter",
    owns: "Runs the screening conversation and manages expectations",
    hands: "Fit assessment, candidate preferences, commitments made",
  },
  {
    role: "Coordinator",
    owns: "Arranges interviews and keeps participants aligned",
    hands: "Availability, confirmed times, rescheduling context",
  },
  {
    role: "Hiring manager",
    owns: "Evaluates the candidate against the requirement",
    hands: "Interview feedback and the decision to progress",
  },
] as const;

export const HANDOFF_QUESTIONS = [
  {
    number: "01",
    question: "What opportunity and candidate does this concern?",
    detail:
      "The handoff should name the specific role and candidate so the next person does not have to infer it from a message thread.",
  },
  {
    number: "02",
    question: "What relevant information has already been confirmed?",
    detail:
      "Confirmed availability, stated preferences, and commitments should travel with the conversation.",
  },
  {
    number: "03",
    question: "What action needs to happen next?",
    detail:
      "A pending callback, unanswered question, or scheduled step should be explicit rather than remembered.",
  },
  {
    number: "04",
    question: "Who is responsible for that action?",
    detail:
      "Every handoff needs a named owner so the transition does not stall between teams.",
  },
] as const;

export const HANDOFF_WORKFLOW = [
  {
    step: "Identify the transition",
    detail:
      "Determine when responsibility moves from one recruiter or team to another.",
  },
  {
    step: "Gather relevant context",
    detail:
      "Review appropriate candidate information, communication history, and current process status.",
  },
  {
    step: "Identify pending commitments",
    detail:
      "Capture callback requests, outstanding questions, and agreed next steps.",
  },
  {
    step: "Establish ownership",
    detail:
      "Assign the next action to the authorized person or team.",
  },
  {
    step: "Confirm the handoff",
    detail:
      "Make the transition visible to the relevant participants.",
  },
  {
    step: "Manage exceptions",
    detail:
      "Escalate missing information, conflicting records, and ambiguous responsibilities.",
  },
  {
    step: "Preserve continuity",
    detail:
      "Ensure subsequent candidate communication reflects the relevant previous conversation.",
  },
] as const;

export const HANDOFF_TRIGGERS = [
  {
    trigger: "Initial screening completed",
    handoff: "Move the candidate to the recruiter or panel that owns the next stage.",
  },
  {
    trigger: "Interview confirmed",
    handoff: "Pass confirmed details and candidate questions to the coordinator.",
  },
  {
    trigger: "Client requests more information",
    handoff: "Route the request to the team member authorized to answer it.",
  },
  {
    trigger: "Candidate needs a specialist",
    handoff: "Connect the conversation to the recruiter who owns that expertise.",
  },
] as const;

export const CONTINUITY_PRINCIPLES = [
  {
    title: "One conversation, several people",
    detail:
      "A candidate should not have to repeat confirmed information because internal responsibility changed.",
  },
  {
    title: "Share only what is relevant",
    detail:
      "Handoffs should transfer the context needed for the next action, not every detail on record.",
  },
  {
    title: "Reviewable summaries",
    detail:
      "Automated context summaries should remain visible and correctable because they may omit nuance.",
  },
  {
    title: "Visible ownership",
    detail:
      "Each pending action should show who owns it so nothing quietly waits between teams.",
  },
] as const;

export const HANDOFF_INTERNAL_LINKS = [
  {
    label: "AI Recruiting Operations Automation",
    href: "/us/ai-recruiting-operations-automation",
  },
  {
    label: "AI Interview Workflow Automation",
    href: "/us/ai-interview-workflow-automation",
  },
  {
    label: "AI Candidate Response Intelligence",
    href: "/us/ai-candidate-response-intelligence",
  },
] as const;

export const AI_RECRUITER_HANDOFF_AUTOMATION_FAQS = [
  {
    question: "What is recruiter handoff automation?",
    answer:
      "It uses software workflows to coordinate the transfer of relevant candidate information, responsibilities, and next actions between recruiting team members.",
  },
  {
    question: "How can AI support recruiter collaboration?",
    answer:
      "AI-assisted workflows may help organize conversation context and pending actions, subject to verified capabilities and human review.",
  },
  {
    question: "Can automated handoffs replace recruiter communication?",
    answer:
      "No. Complex situations and sensitive candidate matters may still require direct communication between team members.",
  },
  {
    question: "What makes a good recruiting handoff?",
    answer:
      "Clear context, accurate information, defined ownership, appropriate permissions, and an understandable next action.",
  },
] as const;
