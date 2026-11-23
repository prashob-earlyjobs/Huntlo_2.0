import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const DORMANT_CANDIDATE_REACTIVATION_PATH =
  "/agents/dormant-candidate-reactivation";

/** Product must approve Live/Pilot/Planned before indexation. */
export const DORMANT_CANDIDATE_REACTIVATION_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const DORMANT_CANDIDATE_REACTIVATION_SEO = {
  title: "Dormant Candidate Reactivation | AI Voice Workflows | Huntlo",
  description:
    "Explore past applicant outreach with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function dormantCandidateReactivationMetadata(): Metadata {
  const base = buildPageMetadata({
    title: DORMANT_CANDIDATE_REACTIVATION_SEO.title,
    description: DORMANT_CANDIDATE_REACTIVATION_SEO.description,
    ogTitle: DORMANT_CANDIDATE_REACTIVATION_SEO.title,
    ogDescription: DORMANT_CANDIDATE_REACTIVATION_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: DORMANT_CANDIDATE_REACTIVATION_PATH,
  });

  const indexable = isIndexableCapability(
    DORMANT_CANDIDATE_REACTIVATION_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function dormantCandidateReactivationPageUrl(): string {
  return absoluteUrl(DORMANT_CANDIDATE_REACTIVATION_PATH);
}

export const DORMANT_CANDIDATE_REACTIVATION: ScreeningWorkflowConfig = {
  path: DORMANT_CANDIDATE_REACTIVATION_PATH,
  capabilityStatus: DORMANT_CANDIDATE_REACTIVATION_CAPABILITY_STATUS,
  seo: DORMANT_CANDIDATE_REACTIVATION_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    {
      name: "Dormant Candidate Reactivation",
      href: DORMANT_CANDIDATE_REACTIVATION_PATH,
    },
  ],
  hero: {
    h1: "Dormant Candidate Reactivation That Moves Work Forward",
    answerFirst:
      "A previous applicant pool may contain interested talent. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Past applicant outreach",
  },
  why: {
    id: "why-workflow",
    h2: "Why does past applicant outreach need a better workflow?",
    answerFirst:
      "Past applicant outreach creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats reactivation as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a previous applicant pool may contain interested talent. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches past applicant outreach as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "This is an illustrative industry scenario, not a claim about a named Huntlo customer.",
  },
  how: {
    id: "workflow",
    h2: "How does a rehiring voice workflow work?",
    answerFirst:
      "Start with an approved audience and legal basis, run a purpose-specific conversation covering current interest, availability, skills, location and contact permissions, record what was said and what remains uncertain, then hand a reviewable record to rehire eligibility review. Prefer statuses such as “needs review” over invented certainty.",
    steps: [
      {
        title: "Start with an approved audience",
        body: "Confirm an appropriate legal basis for contact before outreach begins.",
      },
      {
        title: "Select a purpose-specific conversation",
        body: "Use current interest, availability, skills, location and contact permissions — only what the purpose requires.",
      },
      {
        title: "Explain and respect choice",
        body: "Explain why the person is being contacted, keep questions short and allow them to decline or request a human.",
      },
      {
        title: "Record what was said",
        body: "Capture what the person actually said and what remains uncertain. The resulting record goes to rehire eligibility review.",
      },
    ],
    interfaceNote:
      'For dormant candidate reactivation, the proposed interface shows a previous-versus-current talent profile. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For past applicant outreach, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In past applicant outreach, value comes when an authorised person can move the process forward without asking the same questions again.",
    ],
  },
  trust: {
    id: "trust",
    h2: "How do you maintain trust and accountability?",
    answerFirst:
      "Past employment or applications cannot alone determine current eligibility. Explain purpose, respect opt-outs, restrict access, set retention, enable corrections and keep human escalation visible — including separating confidential feedback from hiring or rehire decisions.",
    points: [
      "Past employment or applications cannot alone determine current eligibility.",
      "Explain the purpose of contact and respect opt-outs. Restrict personal information to people who need it, set retention periods and provide a correction route.",
      "Test the experience with interruptions, noisy environments, unclear answers and different communication styles.",
      "Human escalation should be visible and easy to request.",
      "Sensitive information must not be reused across unrelated purposes simply because a shared platform can technically store it.",
      "In particular, confidential employee feedback should remain separate from individual hiring or rehire decisions.",
    ],
  },
  useCases: {
    title: "Focused scenarios for past applicant outreach.",
    intro:
      "Purpose-specific rehiring coordination — not a claim of universal automation.",
    items: [
      {
        title: "Dormant pool reactivation",
        body: "Confirm whether previous applicants are open to current openings with short, optional voice questions.",
      },
      {
        title: "Availability without pressure",
        body: "Capture interest, availability and location while allowing decline or a human request.",
      },
      {
        title: "Eligibility handoff",
        body: "Route a previous-versus-current profile to rehire eligibility review instead of inventing certainty.",
      },
      {
        title: "Opt-out discipline",
        body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Past applicant outreach is common when talent pools age faster than openings fill — in high-volume hiring, staffing agencies and employers with recurring similar roles — where prior applications create outreach volume that still needs recording and handoff work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${DORMANT_CANDIDATE_REACTIVATION_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is dormant candidate reactivation?",
      answer:
        "It is a purpose-built conversational workflow for past applicant outreach, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make past applicant outreach more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    {
      label: "AI Rehiring Agent",
      href: "/agents/ai-rehiring-agent",
    },
    {
      label: "Workforce Availability Refresh",
      href: "/agents/workforce-availability-refresh",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is an optional Huntlo call about a role that may match your earlier application. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Sure — I applied months ago. What changed?",
    },
    {
      speaker: "Agent",
      text: "Are you still interested, and what availability or location constraints should we record?",
    },
    {
      speaker: "Candidate",
      text: "I am interested if remote or hybrid is possible. I can start after the 15th.",
    },
    {
      speaker: "Agent",
      text: "Recorded. Rehire eligibility review will follow. You can decline further contact or ask for a person anytime.",
    },
  ],
  sampleRubric: [
    {
      criterion: "Current interest",
      value: "Open if remote or hybrid",
      status: "recorded",
    },
    {
      criterion: "Availability",
      value: "After the 15th",
      status: "recorded",
    },
    {
      criterion: "Location",
      value: "Remote or hybrid preferred",
      status: "recorded",
    },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "talent-profile",
  previousProfile: [
    { label: "Prior application", value: "Customer support associate" },
    { label: "Applied", value: "8 months ago · not placed" },
    { label: "Pipeline stage", value: "Screen complete" },
    { label: "Skills on file", value: "CRM · bilingual" },
  ],
  currentProfile: [
    {
      label: "Current interest",
      value: "Open if remote or hybrid",
      status: "recorded",
    },
    {
      label: "Availability",
      value: "After the 15th",
      status: "recorded",
    },
    {
      label: "Location preference",
      value: "Remote or hybrid",
      status: "recorded",
    },
    {
      label: "Contact permissions",
      value: "Eligible for follow-up",
      status: "needs_review",
    },
  ],
  actionQueue: [
    {
      title: "Review remote/hybrid interest",
      owner: "Talent ops",
      status: "needs_review",
    },
    {
      title: "Confirm rehire eligibility",
      owner: "Hiring manager",
      status: "assigned",
    },
    {
      title: "Stop outreach if the person opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Dormant Candidate Reactivation",
  demoSubtitle: "Previous vs current talent profile — silent simulation",
  demoFooter:
    "Huntlo VoiceAI · Past applicant outreach · Illustrative outcome",
  aiAskTopic: "Huntlo Dormant Candidate Reactivation voice workflow",
  aiAskPrompt: `What is Huntlo Dormant Candidate Reactivation on ${DORMANT_CANDIDATE_REACTIVATION_PATH} (https://www.huntlo.ai${DORMANT_CANDIDATE_REACTIVATION_PATH})? How does a past applicant outreach voice workflow collect answers and route a human-reviewed next action?`,
};
