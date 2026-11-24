import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const PRE_JOINING_ENGAGEMENT_PATH = "/solutions/pre-joining-follow-ups";

/** Product must approve Live/Pilot/Planned before indexation. */
export const PRE_JOINING_ENGAGEMENT_CAPABILITY_STATUS: CapabilityStatus = "planned";

export const PRE_JOINING_ENGAGEMENT_SEO = {
  title: "Pre-Joining Engagement | AI Voice Workflows | Huntlo",
  description:
    "Explore pre-joining communication with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function preJoiningEngagementMetadata(): Metadata {
  const base = buildPageMetadata({
    title: PRE_JOINING_ENGAGEMENT_SEO.title,
    description: PRE_JOINING_ENGAGEMENT_SEO.description,
    ogTitle: PRE_JOINING_ENGAGEMENT_SEO.title,
    ogDescription: PRE_JOINING_ENGAGEMENT_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: PRE_JOINING_ENGAGEMENT_PATH,
  });

  const indexable = isIndexableCapability(
    PRE_JOINING_ENGAGEMENT_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function preJoiningEngagementPageUrl(): string {
  return absoluteUrl(PRE_JOINING_ENGAGEMENT_PATH);
}

export const PRE_JOINING_ENGAGEMENT: ScreeningWorkflowConfig = {
  path: PRE_JOINING_ENGAGEMENT_PATH,
  capabilityStatus: PRE_JOINING_ENGAGEMENT_CAPABILITY_STATUS,
  seo: PRE_JOINING_ENGAGEMENT_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "Solutions", href: "/solutions/ai-onboarding-agents" },
    { name: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
    { name: "Pre-Joining Follow-ups", href: PRE_JOINING_ENGAGEMENT_PATH },
  ],
  hero: {
    h1: "Pre-Joining Engagement That Moves Work Forward",
    answerFirst:
      "A future employee goes quiet before their start date. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Pre-joining communication",
  },
  why: {
    id: "why-workflow",
    h2: "Why does pre-joining communication need a better workflow?",
    answerFirst:
      "Pre-joining communication creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats communication as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a future employee goes quiet before their start date. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches pre-joining communication as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "Industry scenario.",
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
      'For pre-joining engagement, the proposed interface shows an offer-to-day-one timeline. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For pre-joining communication, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In pre-joining communication, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for pre-joining communication.",
    intro:
      "Purpose-specific pre-joining outreach — not a claim of universal automation.",
    items: [
      {
        title: "Quiet-period check-in",
        body: "Reach future employees who go quiet before start date and record what still needs attention.",
      },
      {
        title: "Joining-intent capture",
        body: "Confirm continued interest and open questions without treating silence as a decision.",
      },
      {
        title: "Instruction gaps",
        body: "Surface missing start-day details so an authorised owner can close them once.",
      },
      {
        title: "Opt-out discipline",
        body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Pre-joining communication is common in high-volume hiring, multi-location workforce operations and teams reducing no-shows between offer acceptance and day one — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Product workflow overview.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${PRE_JOINING_ENGAGEMENT_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is pre-joining engagement?",
      answer:
        "It is a purpose-built conversational workflow for pre-joining communication, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make pre-joining communication more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
    {
      label: "Joining Confirmation",
      href: "/solutions/joining-confirmation",
    },
    {
      label: "Day 1 Readiness",
      href: "/solutions/day-1-readiness",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo call before your planned start date. We noticed we have not heard from you recently — is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes — sorry, I have been travelling and missed a few messages.",
    },
    {
      speaker: "Agent",
      text: "Are you still planning to join on the agreed date, and do you have any open questions about location or instructions?",
    },
    {
      speaker: "Candidate",
      text: "I still plan to join, but I need clarity on the reporting manager and shift start time.",
    },
    {
      speaker: "Agent",
      text: "Thanks. HR will review this and follow up. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Joining intent", value: "Still plans to join", status: "recorded" },
    {
      criterion: "Reporting manager",
      value: "Needs owner reply",
      status: "uncertain",
    },
    { criterion: "Shift start", value: "Needs owner reply", status: "uncertain" },
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
      label: "Quiet period",
      detail: "Outreach launched",
      state: "done",
    },
    {
      label: "Check-in",
      detail: "Time confirmed",
      state: "done",
    },
    {
      label: "Open points",
      detail: "Manager & shift",
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
      title: "Confirm continued joining intent",
      owner: "HR ops",
      status: "needs_review",
    },
    {
      title: "Share reporting manager and shift start",
      owner: "Hiring manager",
      status: "assigned",
    },
    {
      title: "Stop outreach if candidate opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Pre-Joining Engagement",
  demoSubtitle: "Offer-to-day-one timeline — silent simulation",
  demoFooter: "Huntlo Voice AI · Pre-joining communication",
  aiAskTopic: "Huntlo Pre-Joining Engagement voice workflow",
  aiAskPrompt: `What is Huntlo Pre-Joining Engagement on ${PRE_JOINING_ENGAGEMENT_PATH} (https://www.huntlo.ai${PRE_JOINING_ENGAGEMENT_PATH})? How does a pre-joining communication voice workflow collect answers and route a human-reviewed next action?`,
};
