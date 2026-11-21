import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const EXIT_INTERVIEW_AGENT_PATH = "/agents/exit-interview-agent";

/** Product must approve Live/Pilot/Planned before indexation. */
export const EXIT_INTERVIEW_AGENT_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const EXIT_INTERVIEW_AGENT_SEO = {
  title: "Exit Interview Agent | AI Voice Workflows | Huntlo",
  description:
    "Explore voluntary exit feedback with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function exitInterviewAgentMetadata(): Metadata {
  const base = buildPageMetadata({
    title: EXIT_INTERVIEW_AGENT_SEO.title,
    description: EXIT_INTERVIEW_AGENT_SEO.description,
    ogTitle: EXIT_INTERVIEW_AGENT_SEO.title,
    ogDescription: EXIT_INTERVIEW_AGENT_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: EXIT_INTERVIEW_AGENT_PATH,
  });

  const indexable = isIndexableCapability(
    EXIT_INTERVIEW_AGENT_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function exitInterviewAgentPageUrl(): string {
  return absoluteUrl(EXIT_INTERVIEW_AGENT_PATH);
}

export const EXIT_INTERVIEW_AGENT: ScreeningWorkflowConfig = {
  path: EXIT_INTERVIEW_AGENT_PATH,
  capabilityStatus: EXIT_INTERVIEW_AGENT_CAPABILITY_STATUS,
  seo: EXIT_INTERVIEW_AGENT_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    { name: "Exit Interview Agent", href: EXIT_INTERVIEW_AGENT_PATH },
  ],
  hero: {
    h1: "Exit Interview Agent That Moves Work Forward",
    answerFirst:
      "A departing employee wants a respectful way to explain their experience. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Voluntary exit feedback",
  },
  why: {
    id: "why-workflow",
    h2: "Why does voluntary exit feedback need a better workflow?",
    answerFirst:
      "Voluntary exit feedback creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats exit feedback as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a departing employee wants a respectful way to explain their experience. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches voluntary exit feedback as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
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
      'For exit interview agent, the proposed interface shows a protected feedback themes dashboard. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For voluntary exit feedback, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In voluntary exit feedback, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for voluntary exit feedback.",
    intro:
      "Purpose-specific exit interview coordination — not a claim of universal automation.",
    items: [
      {
        title: "Respectful exit listening",
        body: "Offer a short, optional voice conversation so departing employees can explain their experience with dignity.",
      },
      {
        title: "Theme without pressure",
        body: "Keep questions short and allow decline or human request so exit outreach stays respectful.",
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
    body: "Voluntary exit feedback is common in multi-site employers, high-turnover operations and HR teams that need respectful listening at departure — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${EXIT_INTERVIEW_AGENT_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is exit interview agent?",
      answer:
        "It is a purpose-built conversational workflow for voluntary exit feedback, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make voluntary exit feedback more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    {
      label: "AI Survey Agent",
      href: "/agents/ai-survey-agent",
    },
    {
      label: "Candidate Experience Surveys",
      href: "/agents/candidate-experience-surveys",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is an optional Huntlo exit conversation. Is now a convenient time to share feedback about your experience?",
    },
    {
      speaker: "Candidate",
      text: "Yes — I would like to keep this brief and respectful.",
    },
    {
      speaker: "Agent",
      text: "What most shaped your decision to leave, and is there anything that still feels unresolved?",
    },
    {
      speaker: "Candidate",
      text: "Schedule flexibility was the main issue. I am unsure whether feedback reached leadership.",
    },
    {
      speaker: "Agent",
      text: "Recorded. Authorised HR will review your answers. You can decline further contact or ask for a person anytime.",
    },
  ],
  sampleRubric: [
    {
      criterion: "Exit reason",
      value: "Schedule flexibility",
      status: "recorded",
    },
    {
      criterion: "Unresolved point",
      value: "Unsure feedback reached leadership",
      status: "recorded",
    },
    {
      criterion: "Follow-up",
      value: "Leadership visibility not confirmed",
      status: "uncertain",
    },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "feedback-themes",
  feedbackThemes: [
    {
      theme: "Workplace experience",
      signal: "Schedule flexibility cited as primary reason",
      status: "recorded",
    },
    {
      theme: "Recurring themes",
      signal: "Leadership visibility of feedback uncertain",
      status: "needs_review",
    },
    {
      theme: "Optional follow-up",
      signal: "Authorised HR owner not yet confirmed",
      status: "uncertain",
    },
  ],
  actionQueue: [
    {
      title: "Review schedule-flexibility theme",
      owner: "HR ops",
      status: "needs_review",
    },
    {
      title: "Assign exit-theme owner",
      owner: "People ops",
      status: "assigned",
    },
    {
      title: "Stop outreach if the person opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Exit Interview Agent",
  demoSubtitle: "Protected feedback themes — silent simulation",
  demoFooter: "Huntlo Voice · Voluntary exit feedback · Illustrative outcome",
  aiAskTopic: "Huntlo Exit Interview Agent voice workflow",
  aiAskPrompt: `What is the Huntlo Exit Interview Agent on ${EXIT_INTERVIEW_AGENT_PATH} (https://www.huntlo.ai${EXIT_INTERVIEW_AGENT_PATH})? How does a voluntary exit feedback voice workflow collect answers and route a human-reviewed next action?`,
};
