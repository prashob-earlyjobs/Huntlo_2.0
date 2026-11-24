import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_SURVEY_AGENT_PATH = "/agents/ai-survey-agent";

/** Product must approve Live/Pilot/Planned before indexation. */
export const AI_SURVEY_AGENT_CAPABILITY_STATUS: CapabilityStatus = "planned";

export const AI_SURVEY_AGENT_SEO = {
  title: "AI Survey Agent | AI Voice Workflows | Huntlo",
  description:
    "Explore conversational employee surveys with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function aiSurveyAgentMetadata(): Metadata {
  const base = buildPageMetadata({
    title: AI_SURVEY_AGENT_SEO.title,
    description: AI_SURVEY_AGENT_SEO.description,
    ogTitle: AI_SURVEY_AGENT_SEO.title,
    ogDescription: AI_SURVEY_AGENT_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: AI_SURVEY_AGENT_PATH,
  });

  const indexable = isIndexableCapability(AI_SURVEY_AGENT_CAPABILITY_STATUS);

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function aiSurveyAgentPageUrl(): string {
  return absoluteUrl(AI_SURVEY_AGENT_PATH);
}

export const AI_SURVEY_AGENT: ScreeningWorkflowConfig = {
  path: AI_SURVEY_AGENT_PATH,
  capabilityStatus: AI_SURVEY_AGENT_CAPABILITY_STATUS,
  seo: AI_SURVEY_AGENT_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    { name: "AI Survey Agent", href: AI_SURVEY_AGENT_PATH },
  ],
  hero: {
    h1: "AI Survey Agent That Moves Work Forward",
    answerFirst:
      "Employees need a short, optional way to share concerns. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Conversational employee surveys",
  },
  why: {
    id: "why-workflow",
    h2: "Why does conversational employee surveys need a better workflow?",
    answerFirst:
      "Conversational employee surveys create interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats surveys as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: employees need a short, optional way to share concerns. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches conversational employee surveys as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "Industry scenario.",
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
      'For ai survey agent, the proposed interface shows a protected feedback themes dashboard. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For conversational employee surveys, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In conversational employee surveys, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for conversational employee surveys.",
    intro:
      "Purpose-specific survey coordination — not a claim of universal automation.",
    items: [
      {
        title: "Optional concern sharing",
        body: "Give employees a short, optional voice path to share workplace concerns without inventing certainty.",
      },
      {
        title: "Theme capture",
        body: "Group recurring workplace experience themes so authorised HR can review patterns with evidence.",
      },
      {
        title: "Follow-up routing",
        body: "Send unresolved points to authorised HR follow-up instead of leaving them in a vague call note.",
      },
      {
        title: "Opt-out discipline",
        body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Conversational employee surveys are common in workforce operations, multi-site employers and HR teams that need structured listening — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Product workflow overview.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${AI_SURVEY_AGENT_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is ai survey agent?",
      answer:
        "It is a purpose-built conversational workflow for conversational employee surveys, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make conversational employee surveys more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    {
      label: "AI Survey Agent",
      href: AI_SURVEY_AGENT_PATH,
    },
    {
      label: "Employee Pulse Surveys",
      href: "/agents/employee-pulse-surveys",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is an optional Huntlo survey call about workplace experience. Is now a convenient time, or would you prefer to decline?",
    },
    {
      speaker: "Candidate",
      text: "I can talk briefly. I have one concern about shift handovers.",
    },
    {
      speaker: "Agent",
      text: "Thanks. Can you describe the concern in a few words, and is there anything that still feels unresolved?",
    },
    {
      speaker: "Candidate",
      text: "Handover notes are often incomplete at night. I am unsure who owns the fix.",
    },
    {
      speaker: "Agent",
      text: "Recorded. Authorised HR will review your answers. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    {
      criterion: "Workplace experience",
      value: "Shift handover concern",
      status: "recorded",
    },
    {
      criterion: "Recurring theme",
      value: "Incomplete night notes",
      status: "recorded",
    },
    {
      criterion: "Follow-up owner",
      value: "Unclear who owns the fix",
      status: "uncertain",
    },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "feedback-themes",
  feedbackThemes: [
    {
      theme: "Workplace experience",
      signal: "Shift handover friction mentioned",
      status: "recorded",
    },
    {
      theme: "Recurring themes",
      signal: "Incomplete night notes — pattern flagged",
      status: "needs_review",
    },
    {
      theme: "Optional follow-up",
      signal: "Owner for fix still uncertain",
      status: "uncertain",
    },
  ],
  actionQueue: [
    {
      title: "Review night-shift handover theme",
      owner: "HR ops",
      status: "needs_review",
    },
    {
      title: "Assign site lead for note quality",
      owner: "Site manager",
      status: "assigned",
    },
    {
      title: "Stop outreach if employee opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo AI Survey Agent",
  demoSubtitle: "Protected feedback themes — silent simulation",
  demoFooter: "Huntlo Voice AI · Conversational employee surveys",
  aiAskTopic: "Huntlo AI Survey Agent voice workflow",
  aiAskPrompt: `What is the Huntlo AI Survey Agent on ${AI_SURVEY_AGENT_PATH} (https://www.huntlo.ai${AI_SURVEY_AGENT_PATH})? How does a conversational employee survey voice workflow collect answers and route a human-reviewed next action?`,
};
