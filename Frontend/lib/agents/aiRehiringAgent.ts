import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_REHIRING_AGENT_PATH = "/agents/ai-rehiring-agent";

/** Product must approve Live/Pilot/Planned before indexation. */
export const AI_REHIRING_AGENT_CAPABILITY_STATUS: CapabilityStatus = "planned";

export const AI_REHIRING_AGENT_SEO = {
  title: "AI Rehiring Agent | AI Voice Workflows | Huntlo",
  description:
    "Explore alumni talent re-engagement with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function aiRehiringAgentMetadata(): Metadata {
  const base = buildPageMetadata({
    title: AI_REHIRING_AGENT_SEO.title,
    description: AI_REHIRING_AGENT_SEO.description,
    ogTitle: AI_REHIRING_AGENT_SEO.title,
    ogDescription: AI_REHIRING_AGENT_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: AI_REHIRING_AGENT_PATH,
  });

  const indexable = isIndexableCapability(AI_REHIRING_AGENT_CAPABILITY_STATUS);

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function aiRehiringAgentPageUrl(): string {
  return absoluteUrl(AI_REHIRING_AGENT_PATH);
}

export const AI_REHIRING_AGENT: ScreeningWorkflowConfig = {
  path: AI_REHIRING_AGENT_PATH,
  capabilityStatus: AI_REHIRING_AGENT_CAPABILITY_STATUS,
  seo: AI_REHIRING_AGENT_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    { name: "AI Rehiring Agent", href: AI_REHIRING_AGENT_PATH },
  ],
  hero: {
    h1: "AI Rehiring Agent That Moves Work Forward",
    answerFirst:
      "An employer has vacancies and previously known workers. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Alumni talent re-engagement",
  },
  why: {
    id: "why-workflow",
    h2: "Why does alumni talent re-engagement need a better workflow?",
    answerFirst:
      "Alumni talent re-engagement creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats re-engagement as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: an employer has vacancies and previously known workers. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches alumni talent re-engagement as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
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
      'For ai rehiring agent, the proposed interface shows a previous-versus-current talent profile. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For alumni talent re-engagement, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In alumni talent re-engagement, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for alumni talent re-engagement.",
    intro:
      "Purpose-specific rehiring coordination — not a claim of universal automation.",
    items: [
      {
        title: "Alumni interest check",
        body: "Confirm whether previously known workers are open to current vacancies with short, optional voice questions.",
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
    body: "Alumni talent re-engagement is common in high-turnover operations, staffing agencies and employers with seasonal or site-based roles — where prior relationships create outreach volume that still needs recording and handoff work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${AI_REHIRING_AGENT_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is ai rehiring agent?",
      answer:
        "It is a purpose-built conversational workflow for alumni talent re-engagement, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make alumni talent re-engagement more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    {
      label: "Seasonal Workforce Rehiring",
      href: "/agents/seasonal-workforce-rehiring",
    },
    {
      label: "Dormant Candidate Reactivation",
      href: "/agents/dormant-candidate-reactivation",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is an optional Huntlo call about a current opening that may match your past role. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "I can talk briefly — what is the role?",
    },
    {
      speaker: "Agent",
      text: "Are you open to returning, and what availability or location constraints should we record?",
    },
    {
      speaker: "Candidate",
      text: "I am interested if shifts stay daytime. I can work the north site from next month.",
    },
    {
      speaker: "Agent",
      text: "Recorded. Rehire eligibility review will follow. You can decline further contact or ask for a person anytime.",
    },
  ],
  sampleRubric: [
    {
      criterion: "Current interest",
      value: "Open if daytime shifts",
      status: "recorded",
    },
    {
      criterion: "Availability",
      value: "From next month",
      status: "recorded",
    },
    {
      criterion: "Location",
      value: "North site preferred",
      status: "recorded",
    },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "talent-profile",
  previousProfile: [
    { label: "Prior role", value: "Warehouse associate" },
    { label: "Tenure", value: "14 months · left voluntarily" },
    { label: "Last site", value: "North warehouse" },
    { label: "Skills on file", value: "Forklift · inventory" },
  ],
  currentProfile: [
    {
      label: "Current interest",
      value: "Open if daytime shifts",
      status: "recorded",
    },
    {
      label: "Availability",
      value: "From next month",
      status: "recorded",
    },
    {
      label: "Location preference",
      value: "North site",
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
      title: "Review daytime-shift interest",
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
  demoTitle: "Huntlo AI Rehiring Agent",
  demoSubtitle: "Previous vs current talent profile — silent simulation",
  demoFooter: "Huntlo Voice · Alumni talent re-engagement · Illustrative outcome",
  aiAskTopic: "Huntlo AI Rehiring Agent voice workflow",
  aiAskPrompt: `What is the Huntlo AI Rehiring Agent on ${AI_REHIRING_AGENT_PATH} (https://www.huntlo.ai${AI_REHIRING_AGENT_PATH})? How does an alumni talent re-engagement voice workflow collect answers and route a human-reviewed next action?`,
};
