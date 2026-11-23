import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const FRONTLINE_CANDIDATE_SCREENING_PATH =
  "/agents/frontline-candidate-screening";

/** Product must approve Live/Pilot/Planned before indexation. */
export const FRONTLINE_CANDIDATE_SCREENING_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const FRONTLINE_CANDIDATE_SCREENING_SEO = {
  title: "Frontline Candidate Screening | AI Voice Workflows | Huntlo",
  description:
    "Explore logistics, retail and warehouse roles with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function frontlineCandidateScreeningMetadata(): Metadata {
  const base = buildPageMetadata({
    title: FRONTLINE_CANDIDATE_SCREENING_SEO.title,
    description: FRONTLINE_CANDIDATE_SCREENING_SEO.description,
    ogTitle: FRONTLINE_CANDIDATE_SCREENING_SEO.title,
    ogDescription: FRONTLINE_CANDIDATE_SCREENING_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: FRONTLINE_CANDIDATE_SCREENING_PATH,
  });

  const indexable = isIndexableCapability(
    FRONTLINE_CANDIDATE_SCREENING_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function frontlineCandidateScreeningPageUrl(): string {
  return absoluteUrl(FRONTLINE_CANDIDATE_SCREENING_PATH);
}

export const FRONTLINE_CANDIDATE_SCREENING: ScreeningWorkflowConfig = {
  path: FRONTLINE_CANDIDATE_SCREENING_PATH,
  capabilityStatus: FRONTLINE_CANDIDATE_SCREENING_CAPABILITY_STATUS,
  seo: FRONTLINE_CANDIDATE_SCREENING_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    {
      name: "Frontline Candidate Screening",
      href: FRONTLINE_CANDIDATE_SCREENING_PATH,
    },
  ],
  hero: {
    h1: "Frontline Candidate Screening That Moves Work Forward",
    answerFirst:
      "A warehouse needs applicants who understand site and shift requirements. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Logistics, retail & warehouse roles",
  },
  why: {
    id: "why-workflow",
    h2: "Why does logistics, retail and warehouse roles need a better workflow?",
    answerFirst:
      "Logistics, retail and warehouse roles create interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats frontline hiring as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a warehouse needs applicants who understand site and shift requirements. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches logistics, retail and warehouse roles as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
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
      'For frontline candidate screening, the proposed interface shows a transcript and criteria rubric. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For logistics, retail and warehouse roles, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In logistics, retail and warehouse roles, value comes when an authorised person can move the process forward without asking the same questions again.",
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
      "Focused scenarios for logistics, retail and warehouse roles — not a claim of universal automation.",
    items: [
      {
        title: "Site and shift fit",
        body: "Confirm the applicant understands site location, commute and shift windows before a recruiter invests more time.",
      },
      {
        title: "Warehouse availability",
        body: "Capture start-date and overtime willingness as structured fields for frontline cohorts.",
      },
      {
        title: "Retail role interest",
        body: "Record interest and flag unclear answers for human review against store criteria.",
      },
      {
        title: "Opt-out and wrong-number handling",
        body: "Stop outreach according to policy and keep the status reviewable for the next owner.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Logistics, retail and warehouse roles are common in distribution centres, store networks and multi-site operations — where site fit and shift clarity matter as much as dial volume.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Product workflow overview.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${FRONTLINE_CANDIDATE_SCREENING_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is frontline candidate screening?",
      answer:
        "It is a purpose-built conversational workflow for logistics, retail and warehouse roles, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make logistics, retail and warehouse roles more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    { label: "AI Screening Agent", href: "/agents/ai-screening-agent" },
    {
      label: "Staffing Agency Screening",
      href: "/agents/staffing-agency-screening",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo screening call about the warehouse associate role at the Bhiwandi site. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes, I can talk for a few minutes.",
    },
    {
      speaker: "Agent",
      text: "Can you reach the Bhiwandi site for early morning shifts, and are you still interested in this role?",
    },
    {
      speaker: "Candidate",
      text: "I can do early mornings. The site is about forty minutes away. Still interested.",
    },
    {
      speaker: "Agent",
      text: "Thank you. A recruiter will review your answers against the site criteria and follow up. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Role interest", value: "Yes", status: "recorded" },
    { criterion: "Site reachability", value: "Bhiwandi · ~40 min", status: "recorded" },
    { criterion: "Shift window", value: "Early morning OK", status: "recorded" },
    { criterion: "Start-date detail", value: "Not captured in this turn", status: "uncertain" },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoTitle: "Frontline criteria board",
  demoSubtitle: "Transcript + site/shift rubric — silent simulation",
  aiAskTopic: "Huntlo frontline candidate screening voice workflow",
  aiAskPrompt: `What is Huntlo frontline candidate screening on ${FRONTLINE_CANDIDATE_SCREENING_PATH} (https://www.huntlo.ai${FRONTLINE_CANDIDATE_SCREENING_PATH})? How does a logistics, retail and warehouse roles voice workflow collect answers and route a human-reviewed next action?`,
};
