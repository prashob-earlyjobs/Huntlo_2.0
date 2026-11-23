import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const CANDIDATE_EXPERIENCE_SURVEYS_PATH =
  "/agents/candidate-experience-surveys";

/** Product must approve Live/Pilot/Planned before indexation. */
export const CANDIDATE_EXPERIENCE_SURVEYS_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const CANDIDATE_EXPERIENCE_SURVEYS_SEO = {
  title: "Candidate Experience Surveys | AI Voice Workflows | Huntlo",
  description:
    "Explore candidate journey feedback with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function candidateExperienceSurveysMetadata(): Metadata {
  const base = buildPageMetadata({
    title: CANDIDATE_EXPERIENCE_SURVEYS_SEO.title,
    description: CANDIDATE_EXPERIENCE_SURVEYS_SEO.description,
    ogTitle: CANDIDATE_EXPERIENCE_SURVEYS_SEO.title,
    ogDescription: CANDIDATE_EXPERIENCE_SURVEYS_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: CANDIDATE_EXPERIENCE_SURVEYS_PATH,
  });

  const indexable = isIndexableCapability(
    CANDIDATE_EXPERIENCE_SURVEYS_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function candidateExperienceSurveysPageUrl(): string {
  return absoluteUrl(CANDIDATE_EXPERIENCE_SURVEYS_PATH);
}

export const CANDIDATE_EXPERIENCE_SURVEYS: ScreeningWorkflowConfig = {
  path: CANDIDATE_EXPERIENCE_SURVEYS_PATH,
  capabilityStatus: CANDIDATE_EXPERIENCE_SURVEYS_CAPABILITY_STATUS,
  seo: CANDIDATE_EXPERIENCE_SURVEYS_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    {
      name: "Candidate Experience Surveys",
      href: CANDIDATE_EXPERIENCE_SURVEYS_PATH,
    },
  ],
  hero: {
    h1: "Candidate Experience Surveys That Moves Work Forward",
    answerFirst:
      "Recruiters want to learn why applicants disengage. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Candidate journey feedback",
  },
  why: {
    id: "why-workflow",
    h2: "Why does candidate journey feedback need a better workflow?",
    answerFirst:
      "Candidate journey feedback creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats journey feedback as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: recruiters want to learn why applicants disengage. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches candidate journey feedback as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
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
      'For candidate experience surveys, the proposed interface shows a protected feedback themes dashboard. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For candidate journey feedback, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In candidate journey feedback, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for candidate journey feedback.",
    intro:
      "Purpose-specific candidate experience coordination — not a claim of universal automation.",
    items: [
      {
        title: "Disengagement listening",
        body: "Learn why applicants drop off after screening or interview stages with short, optional voice questions.",
      },
      {
        title: "Journey without pressure",
        body: "Keep questions short and allow decline or human request so feedback outreach stays respectful.",
      },
      {
        title: "Theme escalation",
        body: "Route themes that need attention to authorised recruiting follow-up instead of inventing certainty.",
      },
      {
        title: "Opt-out discipline",
        body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Candidate journey feedback is common in high-volume recruiting, staffing agencies and talent teams that need listening after drop-off — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${CANDIDATE_EXPERIENCE_SURVEYS_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is candidate experience surveys?",
      answer:
        "It is a purpose-built conversational workflow for candidate journey feedback, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make candidate journey feedback more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    {
      label: "AI Survey Agent",
      href: "/agents/ai-survey-agent",
    },
    {
      label: "AI Rehiring Agent",
      href: "/agents/ai-rehiring-agent",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is an optional Huntlo call about your recent application experience. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Sure — I can share a quick thought.",
    },
    {
      speaker: "Agent",
      text: "What most affected your decision to pause the process, and is anything still unclear?",
    },
    {
      speaker: "Candidate",
      text: "Interview timing kept shifting. I never got a clear next-step owner.",
    },
    {
      speaker: "Agent",
      text: "Thanks. Authorised recruiting will review your answers. You can decline further contact or ask for a person anytime.",
    },
  ],
  sampleRubric: [
    {
      criterion: "Journey friction",
      value: "Interview timing kept shifting",
      status: "recorded",
    },
    {
      criterion: "Unresolved point",
      value: "No clear next-step owner",
      status: "recorded",
    },
    {
      criterion: "Follow-up",
      value: "Recruiting owner not yet confirmed",
      status: "uncertain",
    },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "feedback-themes",
  feedbackThemes: [
    {
      theme: "Workplace experience",
      signal: "Interview timing described as shifting",
      status: "recorded",
    },
    {
      theme: "Recurring themes",
      signal: "Next-step ownership unclear — pattern flagged",
      status: "needs_review",
    },
    {
      theme: "Optional follow-up",
      signal: "Recruiting owner not yet confirmed",
      status: "uncertain",
    },
  ],
  actionQueue: [
    {
      title: "Review interview-timing theme",
      owner: "Talent ops",
      status: "needs_review",
    },
    {
      title: "Assign journey follow-up owner",
      owner: "Recruiting lead",
      status: "assigned",
    },
    {
      title: "Stop outreach if the candidate opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Candidate Experience Surveys",
  demoSubtitle: "Protected feedback themes — silent simulation",
  demoFooter: "Huntlo VoiceAI · Candidate journey feedback · Illustrative outcome",
  aiAskTopic: "Huntlo Candidate Experience Surveys voice workflow",
  aiAskPrompt: `What are Huntlo Candidate Experience Surveys on ${CANDIDATE_EXPERIENCE_SURVEYS_PATH} (https://www.huntlo.ai${CANDIDATE_EXPERIENCE_SURVEYS_PATH})? How does a candidate journey feedback voice workflow collect answers and route a human-reviewed next action?`,
};
