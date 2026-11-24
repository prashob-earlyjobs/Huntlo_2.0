import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const STAFFING_AGENCY_SCREENING_PATH = "/agents/staffing-agency-screening";

/** Product must approve Live/Pilot/Planned before indexation. */
export const STAFFING_AGENCY_SCREENING_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const STAFFING_AGENCY_SCREENING_SEO = {
  title: "Staffing Agency Screening | AI Voice Workflows | Huntlo",
  description:
    "Explore multi-client staffing with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function staffingAgencyScreeningMetadata(): Metadata {
  const base = buildPageMetadata({
    title: STAFFING_AGENCY_SCREENING_SEO.title,
    description: STAFFING_AGENCY_SCREENING_SEO.description,
    ogTitle: STAFFING_AGENCY_SCREENING_SEO.title,
    ogDescription: STAFFING_AGENCY_SCREENING_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: STAFFING_AGENCY_SCREENING_PATH,
  });

  const indexable = isIndexableCapability(
    STAFFING_AGENCY_SCREENING_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function staffingAgencyScreeningPageUrl(): string {
  return absoluteUrl(STAFFING_AGENCY_SCREENING_PATH);
}

export const STAFFING_AGENCY_SCREENING: ScreeningWorkflowConfig = {
  path: STAFFING_AGENCY_SCREENING_PATH,
  capabilityStatus: STAFFING_AGENCY_SCREENING_CAPABILITY_STATUS,
  seo: STAFFING_AGENCY_SCREENING_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    {
      name: "Staffing Agency Screening",
      href: STAFFING_AGENCY_SCREENING_PATH,
    },
  ],
  hero: {
    h1: "Staffing Agency Screening That Moves Work Forward",
    answerFirst:
      "An agency serves clients with different screening rubrics. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Multi-client staffing",
  },
  why: {
    id: "why-workflow",
    h2: "Why does multi-client staffing need a better workflow?",
    answerFirst:
      "Multi-client staffing creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats agency screening as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: an agency serves clients with different screening rubrics. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches multi-client staffing as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "Industry scenario.",
  },
  how: {
    id: "workflow",
    h2: "How does a screening voice workflow work?",
    answerFirst:
      "Start with an approved audience and legal basis, run a purpose-specific conversation, record what was said and what remains uncertain, then hand a reviewable record to a recruiter. Prefer statuses such as “needs review” over invented certainty.",
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
      'For staffing agency screening, the proposed interface shows a transcript and criteria rubric. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For multi-client staffing, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
      "The agent might begin by confirming that this is a convenient time, then ask only questions necessary for the stated purpose.",
      "If the person is interested, the next stage is made explicit. If they need clarification, the system routes the question to an authorised owner.",
      "If the number is wrong or the person opts out, outreach stops according to policy.",
      "The team sees a time-stamped outcome rather than an unverified label.",
    ],
    notice:
      "Product workflow.",
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
      "In multi-client staffing, value comes when an authorised person can move the process forward without asking the same questions again.",
    ],
  },
  trust: {
    id: "trust",
    h2: "How do you maintain trust and accountability?",
    answerFirst:
      "Screening answers inform recruiters; they must not automatically reject people. Explain purpose, respect opt-outs, restrict access, set retention, enable corrections and keep human escalation visible — including separating confidential feedback from hiring decisions.",
    points: [
      "A screening answer informs a recruiter; it must not automatically reject a person.",
      "Explain the purpose of contact and respect opt-outs. Restrict personal information to people who need it, set retention periods and provide a correction route.",
      "Test the experience with interruptions, noisy environments, unclear answers and different communication styles.",
      "Human escalation should be visible and easy to request.",
      "Sensitive information must not be reused across unrelated purposes simply because a shared platform can technically store it.",
      "In particular, confidential employee feedback should remain separate from individual hiring or rehire decisions.",
    ],
  },
  useCases: {
    intro:
      "Focused scenarios for multi-client staffing — not a claim of universal automation.",
    items: [
      {
        title: "Client rubric selection",
        body: "Apply the approved screening questions for a specific client requisition before outreach begins.",
      },
      {
        title: "Cross-client cohort pilots",
        body: "Launch a limited cohort with client-specific criteria before expanding volume across desks.",
      },
      {
        title: "Recruiter handoff by client",
        body: "Route needs-review records to the owner responsible for that client's requisition.",
      },
      {
        title: "Opt-out and wrong-number handling",
        body: "Stop outreach according to policy and keep the status reviewable for the next owner.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Multi-client staffing is common in agencies that fill roles across manufacturing, logistics, retail and office support — where each client may require a different screening rubric and accountable owner.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Product workflow overview.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${STAFFING_AGENCY_SCREENING_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is staffing agency screening?",
      answer:
        "It is a purpose-built conversational workflow for multi-client staffing, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
    headline: "Make multi-client staffing more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    { label: "AI Screening Agent", href: "/agents/ai-screening-agent" },
    { label: "AI Hiring Agent", href: "/agents/ai-hiring-agent" },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo screening call for a client packing role through your staffing agency. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes — which client is this for?",
    },
    {
      speaker: "Agent",
      text: "This is for Client A’s night-shift packing requisition. Are you available for nights, and can you reach the Pune site?",
    },
    {
      speaker: "Candidate",
      text: "Nights work. I can reach Pune. I have packing experience from last year.",
    },
    {
      speaker: "Agent",
      text: "Thanks. A recruiter will review your answers against Client A’s rubric and follow up. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Client requisition", value: "Client A · packing", status: "recorded" },
    { criterion: "Night shift", value: "Available", status: "recorded" },
    { criterion: "Site reachability", value: "Pune OK", status: "recorded" },
    { criterion: "Experience detail", value: "Needs recruiter confirmation", status: "uncertain" },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoTitle: "Agency criteria board",
  demoSubtitle: "Transcript + client rubric — silent simulation",
  aiAskTopic: "Huntlo staffing agency screening voice workflow",
  aiAskPrompt: `What is Huntlo staffing agency screening on ${STAFFING_AGENCY_SCREENING_PATH} (https://www.huntlo.ai${STAFFING_AGENCY_SCREENING_PATH})? How does a multi-client staffing voice workflow collect answers and route a human-reviewed next action?`,
};
