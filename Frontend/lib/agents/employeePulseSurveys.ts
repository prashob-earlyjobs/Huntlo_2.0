import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const EMPLOYEE_PULSE_SURVEYS_PATH = "/solutions/workforce-feedback";

/** Product must approve Live/Pilot/Planned before indexation. */
export const EMPLOYEE_PULSE_SURVEYS_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const EMPLOYEE_PULSE_SURVEYS_SEO = {
  title: "Employee Pulse Surveys | AI Voice Workflows | Huntlo",
  description:
    "Explore recurring pulse feedback with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function employeePulseSurveysMetadata(): Metadata {
  const base = buildPageMetadata({
    title: EMPLOYEE_PULSE_SURVEYS_SEO.title,
    description: EMPLOYEE_PULSE_SURVEYS_SEO.description,
    ogTitle: EMPLOYEE_PULSE_SURVEYS_SEO.title,
    ogDescription: EMPLOYEE_PULSE_SURVEYS_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: EMPLOYEE_PULSE_SURVEYS_PATH,
  });

  const indexable = isIndexableCapability(
    EMPLOYEE_PULSE_SURVEYS_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function employeePulseSurveysPageUrl(): string {
  return absoluteUrl(EMPLOYEE_PULSE_SURVEYS_PATH);
}

export const EMPLOYEE_PULSE_SURVEYS: ScreeningWorkflowConfig = {
  path: EMPLOYEE_PULSE_SURVEYS_PATH,
  capabilityStatus: EMPLOYEE_PULSE_SURVEYS_CAPABILITY_STATUS,
  seo: EMPLOYEE_PULSE_SURVEYS_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "Solutions", href: "/solutions/ai-retention-agents" },
    { name: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { name: "Workforce Feedback", href: EMPLOYEE_PULSE_SURVEYS_PATH },
  ],
  hero: {
    h1: "Employee Pulse Surveys That Moves Work Forward",
    answerFirst:
      "An employer wants recurring signals about working conditions. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Recurring pulse feedback",
  },
  why: {
    id: "why-workflow",
    h2: "Why does recurring pulse feedback need a better workflow?",
    answerFirst:
      "Recurring pulse feedback creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats pulse feedback as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: an employer wants recurring signals about working conditions. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches recurring pulse feedback as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "This is an illustrative industry scenario, not a claim about a named Huntlo customer.",
  },
  how: {
    id: "workflow",
    h2: "How does a survey voice workflow work?",
    answerFirst:
      "Start with an approved audience and legal basis, run a purpose-specific conversation covering workplace experience, recurring themes and optional follow-up, record what was said and what remains uncertain, then hand a reviewable record to authorised HR follow-up. Prefer statuses such as “needs review” over invented certainty.",
    steps: [
      {
        title: "Start with an approved audience",
        body: "Confirm an appropriate legal basis for contact before outreach begins.",
      },
      {
        title: "Select a purpose-specific conversation",
        body: "Use workplace experience, recurring themes and optional follow-up — only what the purpose requires.",
      },
      {
        title: "Explain and respect choice",
        body: "Explain why the person is being contacted, keep questions short and allow them to decline or request a human.",
      },
      {
        title: "Record what was said",
        body: "Capture what the person actually said and what remains uncertain. The resulting record goes to authorised HR follow-up.",
      },
    ],
    interfaceNote:
      'For employee pulse surveys, the proposed interface shows a protected feedback themes dashboard. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For recurring pulse feedback, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
      "The agent might begin by confirming that this is a convenient time, then ask only questions necessary for the stated purpose.",
      "If the person is interested, the next stage is made explicit. If they need clarification, the system routes the question to an authorised owner.",
      "If the number is wrong or the person opts out, outreach stops according to policy.",
      "The team sees a time-stamped outcome rather than an unverified label.",
    ],
    notice:
      "This practical scenario describes a possible workflow; it should not be represented as a live integration or client case study.",
  },
  useful: {
    id: "useful-results",
    h2: "What makes the result useful to a team?",
    answerFirst:
      "Useful output shows the conversation objective, relevant responses, unresolved points, last contact and assigned action. Reviewers must open evidence, correct summaries and measure completed handoffs — not dials, transcripts or sentiment alone.",
    points: [
      "The output should show the conversation objective, relevant responses, unresolved points, last contact and assigned action.",
      "A reviewer must be able to open supporting evidence and correct an inaccurate summary.",
      "Compare completed workflows, answer quality, follow-up time and human override rates.",
      "Do not treat dialled calls, generated transcripts or positive sentiment as business outcomes by themselves.",
      "In recurring pulse feedback, value comes when an authorised person can move the process forward without asking the same questions again.",
    ],
  },
  trust: {
    id: "trust",
    h2: "How do you maintain trust and accountability?",
    answerFirst:
      "Do not promise anonymity unless collection, access and reporting genuinely preserve it. Explain purpose, respect opt-outs, restrict access, set retention, enable corrections and keep human escalation visible — including separating confidential feedback from hiring decisions.",
    points: [
      "Do not promise anonymity unless collection, access and reporting genuinely preserve it.",
      "Explain the purpose of contact and respect opt-outs. Restrict personal information to people who need it, set retention periods and provide a correction route.",
      "Test the experience with interruptions, noisy environments, unclear answers and different communication styles.",
      "Human escalation should be visible and easy to request.",
      "Sensitive information must not be reused across unrelated purposes simply because a shared platform can technically store it.",
      "In particular, confidential employee feedback should remain separate from individual hiring or rehire decisions.",
    ],
  },
  useCases: {
    title: "Focused scenarios for recurring pulse feedback.",
    intro:
      "Purpose-specific pulse coordination — not a claim of universal automation.",
    items: [
      {
        title: "Working-conditions pulse",
        body: "Capture recurring signals about working conditions so HR can review themes with evidence.",
      },
      {
        title: "Cadence without noise",
        body: "Keep questions short and optional so pulse outreach stays respectful across cycles.",
      },
      {
        title: "Theme escalation",
        body: "Route themes that need attention to authorised HR follow-up instead of inventing certainty.",
      },
      {
        title: "Opt-out discipline",
        body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Recurring pulse feedback is common in multi-site employers, frontline operations and HR teams that need regular listening cycles — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${EMPLOYEE_PULSE_SURVEYS_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is employee pulse surveys?",
      answer:
        "It is a purpose-built conversational workflow for recurring pulse feedback, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
  ],
  finalCta: {
    headline:
      "Make recurring pulse feedback more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    {
      label: "Employee Check-ins",
      href: "/solutions/employee-check-ins",
    },
    {
      label: "HR Follow-ups",
      href: "/solutions/hr-follow-ups",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a short optional Huntlo pulse check about working conditions this cycle. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes — I can answer a couple of questions.",
    },
    {
      speaker: "Agent",
      text: "How would you describe working conditions this week, and is there anything that needs follow-up?",
    },
    {
      speaker: "Candidate",
      text: "Overall manageable, but break-room cooling has been unreliable again.",
    },
    {
      speaker: "Agent",
      text: "Thanks. Authorised HR will review recurring themes. You can decline future pulses or ask for a person anytime.",
    },
  ],
  sampleRubric: [
    {
      criterion: "Working conditions",
      value: "Manageable this week",
      status: "recorded",
    },
    {
      criterion: "Recurring theme",
      value: "Break-room cooling unreliable",
      status: "recorded",
    },
    {
      criterion: "Follow-up",
      value: "Facilities attention needed",
      status: "uncertain",
    },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "feedback-themes",
  feedbackThemes: [
    {
      theme: "Workplace experience",
      signal: "Conditions described as manageable",
      status: "recorded",
    },
    {
      theme: "Recurring themes",
      signal: "Break-room cooling — repeated signal",
      status: "needs_review",
    },
    {
      theme: "Optional follow-up",
      signal: "Facilities owner not yet confirmed",
      status: "uncertain",
    },
  ],
  actionQueue: [
    {
      title: "Review facilities cooling theme",
      owner: "HR ops",
      status: "needs_review",
    },
    {
      title: "Assign facilities follow-up",
      owner: "Site facilities",
      status: "assigned",
    },
    {
      title: "Honour opt-out for future pulses",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Employee Pulse Surveys",
  demoSubtitle: "Protected feedback themes — silent simulation",
  demoFooter: "Huntlo Voice · Recurring pulse feedback · Illustrative outcome",
  aiAskTopic: "Huntlo Employee Pulse Surveys voice workflow",
  aiAskPrompt: `What are Huntlo Employee Pulse Surveys on ${EMPLOYEE_PULSE_SURVEYS_PATH} (https://www.huntlo.ai${EMPLOYEE_PULSE_SURVEYS_PATH})? How does a recurring pulse feedback voice workflow collect answers and route a human-reviewed next action?`,
};
