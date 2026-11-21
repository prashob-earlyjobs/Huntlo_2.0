import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const ONBOARDING_DOCUMENT_READINESS_PATH =
  "/agents/onboarding-document-readiness";

/** Product must approve Live/Pilot/Planned before indexation. */
export const ONBOARDING_DOCUMENT_READINESS_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const ONBOARDING_DOCUMENT_READINESS_SEO = {
  title: "Onboarding Document Readiness | AI Voice Workflows | Huntlo",
  description:
    "Explore onboarding checklist reminders with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function onboardingDocumentReadinessMetadata(): Metadata {
  const base = buildPageMetadata({
    title: ONBOARDING_DOCUMENT_READINESS_SEO.title,
    description: ONBOARDING_DOCUMENT_READINESS_SEO.description,
    ogTitle: ONBOARDING_DOCUMENT_READINESS_SEO.title,
    ogDescription: ONBOARDING_DOCUMENT_READINESS_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: ONBOARDING_DOCUMENT_READINESS_PATH,
  });

  const indexable = isIndexableCapability(
    ONBOARDING_DOCUMENT_READINESS_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function onboardingDocumentReadinessPageUrl(): string {
  return absoluteUrl(ONBOARDING_DOCUMENT_READINESS_PATH);
}

export const ONBOARDING_DOCUMENT_READINESS: ScreeningWorkflowConfig = {
  path: ONBOARDING_DOCUMENT_READINESS_PATH,
  capabilityStatus: ONBOARDING_DOCUMENT_READINESS_CAPABILITY_STATUS,
  seo: ONBOARDING_DOCUMENT_READINESS_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    {
      name: "Onboarding Document Readiness",
      href: ONBOARDING_DOCUMENT_READINESS_PATH,
    },
  ],
  hero: {
    h1: "Onboarding Document Readiness That Moves Work Forward",
    answerFirst:
      "An HR team needs to chase missing document-status updates. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Onboarding checklist reminders",
  },
  why: {
    id: "why-workflow",
    h2: "Why does onboarding checklist reminders need a better workflow?",
    answerFirst:
      "Onboarding checklist reminders create interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats document readiness as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: an HR team needs to chase missing document-status updates. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches onboarding checklist reminders as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "This is an illustrative industry scenario, not a claim about a named Huntlo customer.",
  },
  how: {
    id: "workflow",
    h2: "How does a onboarding voice workflow work?",
    answerFirst:
      "Start with an approved audience and legal basis, run a purpose-specific conversation covering start date, location, approved instructions and unresolved questions, record what was said and what remains uncertain, then hand a reviewable record to HR exception handling. Prefer statuses such as “needs review” over invented certainty.",
    steps: [
      {
        title: "Start with an approved audience",
        body: "Confirm an appropriate legal basis for contact before outreach begins.",
      },
      {
        title: "Select a purpose-specific conversation",
        body: "Use start date, location, approved instructions and unresolved questions — only what the purpose requires.",
      },
      {
        title: "Explain and respect choice",
        body: "Explain why the person is being contacted, keep questions short and allow them to decline or request a human.",
      },
      {
        title: "Record what was said",
        body: "Capture what the person actually said and what remains uncertain. The resulting record goes to HR exception handling.",
      },
    ],
    interfaceNote:
      'For onboarding document readiness, the proposed interface shows an offer-to-day-one timeline. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For onboarding checklist reminders, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In onboarding checklist reminders, value comes when an authorised person can move the process forward without asking the same questions again.",
    ],
  },
  trust: {
    id: "trust",
    h2: "How do you maintain trust and accountability?",
    answerFirst:
      "A joining-intent confirmation is not proof that the person attended. Explain purpose, respect opt-outs, restrict access, set retention, enable corrections and keep human escalation visible — including separating confidential feedback from hiring decisions.",
    points: [
      "A joining-intent confirmation is not proof that the person attended.",
      "Explain the purpose of contact and respect opt-outs. Restrict personal information to people who need it, set retention periods and provide a correction route.",
      "Test the experience with interruptions, noisy environments, unclear answers and different communication styles.",
      "Human escalation should be visible and easy to request.",
      "Sensitive information must not be reused across unrelated purposes simply because a shared platform can technically store it.",
      "In particular, confidential employee feedback should remain separate from individual hiring or rehire decisions.",
    ],
  },
  useCases: {
    title: "Focused scenarios for onboarding checklist reminders.",
    intro:
      "Purpose-specific document readiness outreach — not a claim of universal automation.",
    items: [
      {
        title: "Missing document chase",
        body: "Ask only about outstanding checklist items and record what was submitted versus what remains open.",
      },
      {
        title: "Status clarification",
        body: "Capture whether a document was sent, blocked or misunderstood so HR can act once.",
      },
      {
        title: "Exception routing",
        body: "Send unclear or sensitive blockers to HR exception handling instead of inventing certainty.",
      },
      {
        title: "Opt-out discipline",
        body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Onboarding checklist reminders are common in high-volume hiring, regulated roles and multi-location workforce operations — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${ONBOARDING_DOCUMENT_READINESS_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is onboarding document readiness?",
      answer:
        "It is a purpose-built conversational workflow for onboarding checklist reminders, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make onboarding checklist reminders more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    {
      label: "AI Onboarding Agent",
      href: "/agents/ai-onboarding-agent",
    },
    {
      label: "Frontline Workforce Onboarding",
      href: "/agents/frontline-workforce-onboarding",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo call about outstanding onboarding documents before your start. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes — I uploaded my ID, but I am stuck on the bank form.",
    },
    {
      speaker: "Agent",
      text: "Thanks. Which checklist items are still missing or unclear for you?",
    },
    {
      speaker: "Candidate",
      text: "The bank form and the medical declaration. I need the correct portal link.",
    },
    {
      speaker: "Agent",
      text: "Understood. HR will review this and follow up with the portal link. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "ID document", value: "Uploaded", status: "recorded" },
    {
      criterion: "Bank form",
      value: "Blocked — needs link",
      status: "uncertain",
    },
    {
      criterion: "Medical declaration",
      value: "Still outstanding",
      status: "uncertain",
    },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "offer-timeline",
  journeyStages: [
    {
      label: "Offer accepted",
      detail: "Contact approved",
      state: "done",
    },
    {
      label: "Checklist",
      detail: "Gaps identified",
      state: "done",
    },
    {
      label: "Reminder",
      detail: "Time confirmed",
      state: "done",
    },
    {
      label: "Open docs",
      detail: "Bank & medical",
      state: "active",
    },
    {
      label: "HR review",
      detail: "Needs review",
      state: "pending",
    },
    {
      label: "Day one",
      detail: "Owner assigned",
      state: "pending",
    },
  ],
  actionQueue: [
    {
      title: "Send correct portal link for bank form",
      owner: "HR ops",
      status: "needs_review",
    },
    {
      title: "Confirm medical declaration status",
      owner: "HR ops",
      status: "assigned",
    },
    {
      title: "Stop outreach if candidate opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Onboarding Document Readiness",
  demoSubtitle: "Offer-to-day-one timeline — silent simulation",
  demoFooter:
    "Huntlo Voice · Onboarding checklist reminders · Illustrative outcome",
  aiAskTopic: "Huntlo Onboarding Document Readiness voice workflow",
  aiAskPrompt: `What is Huntlo Onboarding Document Readiness on ${ONBOARDING_DOCUMENT_READINESS_PATH} (https://www.huntlo.ai${ONBOARDING_DOCUMENT_READINESS_PATH})? How does an onboarding checklist reminders voice workflow collect answers and route a human-reviewed next action?`,
};
