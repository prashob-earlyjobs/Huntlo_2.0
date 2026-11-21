import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const HIGH_VOLUME_CANDIDATE_SCREENING_PATH =
  "/agents/high-volume-candidate-screening";

/** Product must approve Live/Pilot/Planned before indexation. */
export const HIGH_VOLUME_CANDIDATE_SCREENING_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const HIGH_VOLUME_CANDIDATE_SCREENING_SEO = {
  title: "High-Volume Candidate Screening | AI Voice Workflows | Huntlo",
  description:
    "Explore large applicant queues with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function highVolumeCandidateScreeningMetadata(): Metadata {
  const base = buildPageMetadata({
    title: HIGH_VOLUME_CANDIDATE_SCREENING_SEO.title,
    description: HIGH_VOLUME_CANDIDATE_SCREENING_SEO.description,
    ogTitle: HIGH_VOLUME_CANDIDATE_SCREENING_SEO.title,
    ogDescription: HIGH_VOLUME_CANDIDATE_SCREENING_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: HIGH_VOLUME_CANDIDATE_SCREENING_PATH,
  });

  const indexable = isIndexableCapability(
    HIGH_VOLUME_CANDIDATE_SCREENING_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function highVolumeCandidateScreeningPageUrl(): string {
  return absoluteUrl(HIGH_VOLUME_CANDIDATE_SCREENING_PATH);
}

export const HIGH_VOLUME_CANDIDATE_SCREENING: ScreeningWorkflowConfig = {
  path: HIGH_VOLUME_CANDIDATE_SCREENING_PATH,
  capabilityStatus: HIGH_VOLUME_CANDIDATE_SCREENING_CAPABILITY_STATUS,
  seo: HIGH_VOLUME_CANDIDATE_SCREENING_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    {
      name: "High-Volume Candidate Screening",
      href: HIGH_VOLUME_CANDIDATE_SCREENING_PATH,
    },
  ],
  hero: {
    h1: "High-Volume Candidate Screening That Moves Work Forward",
    answerFirst:
      "A recruitment campaign produces hundreds of applications. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Large applicant queues",
  },
  why: {
    id: "why-workflow",
    h2: "Why does large applicant queues need a better workflow?",
    answerFirst:
      "Large applicant queues create interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats the queue as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a recruitment campaign produces hundreds of applications. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches large applicant queues as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
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
      'For high-volume candidate screening, the proposed interface shows a transcript and criteria rubric. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For large applicant queues, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In large applicant queues, value comes when an authorised person can move the process forward without asking the same questions again.",
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
      "Focused scenarios for large applicant queues — not a claim of universal automation.",
    items: [
      {
        title: "Campaign intake surge",
        body: "Organise first-contact answers when a recruitment campaign produces hundreds of applications at once.",
      },
      {
        title: "Cohort pilot outreach",
        body: "Launch a limited cohort with approved questions before expanding volume.",
      },
      {
        title: "Queue triage for review",
        body: "Surface needs-review records so recruiters act on uncertain answers first.",
      },
      {
        title: "Retry and opt-out discipline",
        body: "Record unanswered attempts, follow retry rules and stop contact when people decline.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Large applicant queues are common in staffing, retail, logistics and multi-location workforce operations — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${HIGH_VOLUME_CANDIDATE_SCREENING_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is high-volume candidate screening?",
      answer:
        "It is a purpose-built conversational workflow for large applicant queues, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make large applicant queues more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    { label: "AI Screening Agent", href: "/agents/ai-screening-agent" },
    { label: "BPO Voice Screening", href: "/agents/bpo-voice-screening" },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo call about the store associate applications from this week's campaign. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes — I applied a few days ago.",
    },
    {
      speaker: "Agent",
      text: "Are you still interested, and which location works best for you?",
    },
    {
      speaker: "Candidate",
      text: "Still interested. The Andheri store is closest.",
    },
    {
      speaker: "Agent",
      text: "Thanks. A recruiter will review your answers against the campaign criteria and follow up. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Campaign interest", value: "Yes", status: "recorded" },
    { criterion: "Preferred location", value: "Andheri store", status: "recorded" },
    { criterion: "Shift preference", value: "Not captured in this turn", status: "uncertain" },
    { criterion: "Queue position", value: "Awaiting recruiter triage", status: "review" },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoTitle: "Queue review panel",
  demoSubtitle: "Transcript + campaign criteria — silent simulation",
  aiAskTopic: "Huntlo high-volume candidate screening voice workflow",
  aiAskPrompt: `What is Huntlo high-volume candidate screening on ${HIGH_VOLUME_CANDIDATE_SCREENING_PATH} (https://www.huntlo.ai${HIGH_VOLUME_CANDIDATE_SCREENING_PATH})? How does a large applicant queue voice workflow collect answers and route a human-reviewed next action?`,
};
