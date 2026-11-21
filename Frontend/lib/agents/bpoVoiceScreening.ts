import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const BPO_VOICE_SCREENING_PATH = "/agents/bpo-voice-screening";

/** Product must approve Live/Pilot/Planned before indexation. */
export const BPO_VOICE_SCREENING_CAPABILITY_STATUS: CapabilityStatus = "planned";

export const BPO_VOICE_SCREENING_SEO = {
  title: "BPO Voice Screening | AI Voice Workflows | Huntlo",
  description:
    "Explore BPO and customer-support hiring with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function bpoVoiceScreeningMetadata(): Metadata {
  const base = buildPageMetadata({
    title: BPO_VOICE_SCREENING_SEO.title,
    description: BPO_VOICE_SCREENING_SEO.description,
    ogTitle: BPO_VOICE_SCREENING_SEO.title,
    ogDescription: BPO_VOICE_SCREENING_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: BPO_VOICE_SCREENING_PATH,
  });

  const indexable = isIndexableCapability(BPO_VOICE_SCREENING_CAPABILITY_STATUS);

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function bpoVoiceScreeningPageUrl(): string {
  return absoluteUrl(BPO_VOICE_SCREENING_PATH);
}

export const BPO_VOICE_SCREENING: ScreeningWorkflowConfig = {
  path: BPO_VOICE_SCREENING_PATH,
  capabilityStatus: BPO_VOICE_SCREENING_CAPABILITY_STATUS,
  seo: BPO_VOICE_SCREENING_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    { name: "BPO Voice Screening", href: BPO_VOICE_SCREENING_PATH },
  ],
  hero: {
    h1: "BPO Voice Screening That Moves Work Forward",
    answerFirst:
      "A contact centre needs to confirm shift expectations and communication requirements. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "BPO & customer-support hiring",
  },
  why: {
    id: "why-workflow",
    h2: "Why does BPO and customer-support hiring need a better workflow?",
    answerFirst:
      "BPO and customer-support hiring creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats hiring as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a contact centre needs to confirm shift expectations and communication requirements. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches BPO and customer-support hiring as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "This is an illustrative industry scenario, not a claim about a named Huntlo customer.",
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
      'For bpo voice screening, the proposed interface shows a transcript and criteria rubric. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For BPO and customer-support hiring, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In BPO and customer-support hiring, value comes when an authorised person can move the process forward without asking the same questions again.",
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
      "Focused scenarios for BPO and customer-support hiring — not a claim of universal automation.",
    items: [
      {
        title: "Shift expectation checks",
        body: "Confirm night, weekend or rotational shift willingness before a recruiter invests call time.",
      },
      {
        title: "Communication requirements",
        body: "Capture language preference and customer-facing communication comfort as structured fields.",
      },
      {
        title: "Process readiness",
        body: "Record interest in contact-centre workflows and flag unclear answers for human review.",
      },
      {
        title: "Opt-out and wrong-number handling",
        body: "Stop outreach according to policy and keep the status reviewable for the next owner.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "BPO and customer-support hiring is common in contact centres, outsourcing partners and multi-site service operations — where shift fit and communication clarity matter as much as dial volume.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${BPO_VOICE_SCREENING_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is bpo voice screening?",
      answer:
        "It is a purpose-built conversational workflow for BPO and customer-support hiring, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make BPO and customer-support hiring more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    { label: "AI Screening Agent", href: "/agents/ai-screening-agent" },
    {
      label: "Frontline Candidate Screening",
      href: "/agents/frontline-candidate-screening",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo screening call about the customer support associate role. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes, I can talk briefly.",
    },
    {
      speaker: "Agent",
      text: "Can you work rotating shifts, including weekends, and are you comfortable with customer calls in English?",
    },
    {
      speaker: "Candidate",
      text: "Weekends are fine. English calls are okay; Hindi would be better for some customers.",
    },
    {
      speaker: "Agent",
      text: "Thank you. A recruiter will review your answers and follow up with next steps. You can also ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Role interest", value: "Yes", status: "recorded" },
    { criterion: "Shift expectations", value: "Rotating + weekends OK", status: "recorded" },
    { criterion: "Communication", value: "English OK; Hindi preferred", status: "recorded" },
    { criterion: "Language coverage detail", value: "Needs recruiter confirmation", status: "uncertain" },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoTitle: "Contact-centre criteria board",
  demoSubtitle: "Transcript + shift/communication rubric — silent simulation",
  aiAskTopic: "Huntlo BPO voice screening workflow",
  aiAskPrompt: `What is Huntlo BPO voice screening on ${BPO_VOICE_SCREENING_PATH} (https://www.huntlo.ai${BPO_VOICE_SCREENING_PATH})? How does a BPO and customer-support hiring voice workflow collect answers and route a human-reviewed next action?`,
};
