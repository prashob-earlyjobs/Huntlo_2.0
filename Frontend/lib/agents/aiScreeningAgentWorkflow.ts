import type { Metadata } from "next";

import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_SCREENING_AGENT_WORKFLOW_PATH = "/solutions/ai-screening";

/** Product must approve Live/Pilot/Planned before indexation. */
export const AI_SCREENING_AGENT_WORKFLOW_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const AI_SCREENING_AGENT_WORKFLOW_SEO = {
  title: "AI Screening Agent | AI Voice Workflows | Huntlo",
  description:
    "Explore general candidate qualification with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function aiScreeningAgentWorkflowMetadata(): Metadata {
  const base = buildPageMetadata({
    title: AI_SCREENING_AGENT_WORKFLOW_SEO.title,
    description: AI_SCREENING_AGENT_WORKFLOW_SEO.description,
    ogTitle: AI_SCREENING_AGENT_WORKFLOW_SEO.title,
    ogDescription: AI_SCREENING_AGENT_WORKFLOW_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: AI_SCREENING_AGENT_WORKFLOW_PATH,
  });

  const indexable = isIndexableCapability(
    AI_SCREENING_AGENT_WORKFLOW_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export const AI_SCREENING_AGENT_WORKFLOW_BREADCRUMBS = [
  { name: "Home", href: "/" },
  { name: "Solutions", href: "/solutions/ai-hiring-agents" },
  { name: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
  { name: "AI Screening", href: AI_SCREENING_AGENT_WORKFLOW_PATH },
] as const;

export const HERO = {
  h1: "AI Screening Agent That Moves Work Forward",
  /** Answer-first product explanation (~50–70 words). */
  answerFirst:
    "A staffing recruiter needs to speak to new applicants. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
  primaryCta: { label: "Explore the Workflow", href: "#workflow" },
  secondaryCta: { label: "Book a Demo" },
} as const;

export const WHY_SECTION = {
  id: "why-workflow",
  h2: "Why does general candidate qualification need a better workflow?",
  paragraphs: [
    "Picture a typical day: a staffing recruiter needs to speak to new applicants. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
    "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
    "Huntlo approaches general candidate qualification as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
  ],
  notice:
    "This is an illustrative industry scenario, not a claim about a named Huntlo customer.",
} as const;

export const HOW_SECTION = {
  id: "workflow",
  h2: "How does a screening voice workflow work?",
  steps: [
    {
      title: "Start with an approved audience",
      body: "Confirm an appropriate legal basis for contact before outreach begins.",
    },
    {
      title: "Select a purpose-specific conversation",
      body: "Cover role fit, location, shift preference, availability and interest — only what the purpose requires.",
    },
    {
      title: "Explain and respect choice",
      body: "Explain why the person is being contacted, keep questions short and allow them to decline or request a human.",
    },
    {
      title: "Record what was said",
      body: "Capture what the person actually said and what remains uncertain. The resulting record goes to recruiter review.",
    },
  ],
  interfaceNote:
    'For AI Screening Agent, the proposed interface shows a transcript and criteria rubric. A status such as "needs review" is more useful than an invented certainty.',
  verificationNote:
    "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
} as const;

export const EXAMPLE_SECTION = {
  id: "operational-example",
  h2: "What would a real operational example look like?",
  paragraphs: [
    "For general candidate qualification, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
    "The agent might begin by confirming that this is a convenient time, then ask only questions necessary for the stated purpose.",
    "If the person is interested, the next stage is made explicit. If they need clarification, the system routes the question to an authorised owner.",
    "If the number is wrong or the person opts out, outreach stops according to policy.",
    "The team sees a time-stamped outcome rather than an unverified label.",
  ],
  notice:
    "This practical scenario describes a possible workflow; it should not be represented as a live integration or client case study.",
} as const;

export const USEFUL_SECTION = {
  id: "useful-results",
  h2: "What makes the result useful to a team?",
  points: [
    "The output should show the conversation objective, relevant responses, unresolved points, last contact and assigned action.",
    "A reviewer must be able to open supporting evidence and correct an inaccurate summary.",
    "Compare completed workflows, answer quality, follow-up time and human override rates.",
    "Do not treat dialled calls, generated transcripts or positive sentiment as business outcomes by themselves.",
    "In general candidate qualification, value comes when an authorised person can move the process forward without asking the same questions again.",
  ],
} as const;

export const TRUST_SECTION = {
  id: "trust",
  h2: "How do you maintain trust and accountability?",
  points: [
    "A screening answer informs a recruiter; it must not automatically reject a person.",
    "Explain the purpose of contact and respect opt-outs. Restrict personal information to people who need it, set retention periods and provide a correction route.",
    "Test the experience with interruptions, noisy environments, unclear answers and different communication styles.",
    "Human escalation should be visible and easy to request.",
    "Sensitive information must not be reused across unrelated purposes simply because a shared platform can technically store it.",
    "In particular, confidential employee feedback should remain separate from individual hiring or rehire decisions.",
  ],
} as const;

export const USE_CASES = [
  {
    title: "Staffing intake",
    body: "Confirm interest, location and shift preference before a recruiter invests call time.",
  },
  {
    title: "Role-fit qualification",
    body: "Collect short answers against an approved rubric and flag items that need human judgment.",
  },
  {
    title: "Availability checks",
    body: "Record joining timeline and schedule constraints as structured fields for the next owner.",
  },
  {
    title: "Opt-out handling",
    body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
  },
] as const;

export const INDUSTRY_CONTEXT = {
  title: "Industry context",
  body: "General candidate qualification is common in staffing, high-volume frontline hiring and multi-location workforce operations — where conversation volume creates recording and handoff work, not just dialing work.",
} as const;

export const LIMITATION_NOTICE = {
  title: "Limitations and product truth",
  items: [
    "Illustrative workflow only — not a live customer case study or audio demo.",
    "No automatic employment decisions from unreviewed AI responses.",
    "Integrations, languages and automated actions require verification before deployment claims.",
    `Capability status: ${AI_SCREENING_AGENT_WORKFLOW_CAPABILITY_STATUS}. Indexation follows product approval.`,
  ],
} as const;

export const AI_SCREENING_AGENT_WORKFLOW_FAQS = [
  {
    question: "What is AI Screening Agent?",
    answer:
      "It is a purpose-built conversational workflow for general candidate qualification, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
  },
  {
    question: "Does the agent make employment decisions?",
    answer:
      "No final employment decision should be delegated to an unreviewed AI response. Responsible teams approve criteria and retain human oversight.",
  },
  {
    question: "What happens when somebody does not answer?",
    answer:
      "Record the attempt, follow permitted retry rules and retain an unresolved status. Silence is not a rejection, acceptance or proof of attendance.",
  },
  {
    question: "Can it connect to an ATS, HRIS or calendar?",
    answer:
      "Integration scope depends on the employer's systems and Huntlo's verified connectors. Do not assume a specific integration is available.",
  },
  {
    question: "How should success be measured?",
    answer:
      "Measure completed, verified workflow outcomes, quality of handoff, exceptions resolved and the experience of the people contacted.",
  },
] as const;

export const FINAL_CTA = {
  headline: "Make general candidate qualification more consistent and easier to act on.",
  subhead: "Book a Huntlo workflow discussion.",
} as const;

export const RELATED_LINKS = [
  { label: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
  {
    label: "Candidate Qualification",
    href: "/solutions/candidate-qualification",
  },
  {
    label: "Interview Coordination",
    href: "/solutions/interview-coordination",
  },
] as const;

/** Silent transcript simulation — illustrative, not live audio. */
export const SAMPLE_TRANSCRIPT = [
  {
    speaker: "Agent" as const,
    text: "Hi, this is a Huntlo screening call about the warehouse associate role in Pune. Is now a convenient time?",
  },
  {
    speaker: "Candidate" as const,
    text: "Yes, I can talk for a few minutes.",
  },
  {
    speaker: "Agent" as const,
    text: "Are you still interested in this role, and can you work evening shifts?",
  },
  {
    speaker: "Candidate" as const,
    text: "I'm interested. Evenings are fine after 6 pm.",
  },
  {
    speaker: "Agent" as const,
    text: "Thank you. A recruiter will review your answers and follow up with next steps. You can also ask to speak with a person anytime.",
  },
] as const;

export const SAMPLE_RUBRIC = [
  { criterion: "Interest", value: "Yes", status: "recorded" as const },
  { criterion: "Location", value: "Pune", status: "recorded" as const },
  { criterion: "Shift preference", value: "Evenings after 6 pm", status: "recorded" as const },
  { criterion: "Availability detail", value: "Not fully confirmed", status: "uncertain" as const },
  { criterion: "Overall status", value: "Needs review", status: "review" as const },
] as const;

export function aiScreeningAgentWorkflowPageUrl(): string {
  return absoluteUrl(AI_SCREENING_AGENT_WORKFLOW_PATH);
}
