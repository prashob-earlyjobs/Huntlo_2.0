import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const HIGH_VOLUME_HIRING_WORKFLOWS_PATH =
  "/agents/high-volume-hiring-workflows";

/** Product must approve Live/Pilot/Planned before indexation. */
export const HIGH_VOLUME_HIRING_WORKFLOWS_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const HIGH_VOLUME_HIRING_WORKFLOWS_SEO = {
  title: "High-Volume Hiring Workflows | AI Voice Workflows | Huntlo",
  description:
    "Explore bulk recruitment campaigns with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function highVolumeHiringWorkflowsMetadata(): Metadata {
  const base = buildPageMetadata({
    title: HIGH_VOLUME_HIRING_WORKFLOWS_SEO.title,
    description: HIGH_VOLUME_HIRING_WORKFLOWS_SEO.description,
    ogTitle: HIGH_VOLUME_HIRING_WORKFLOWS_SEO.title,
    ogDescription: HIGH_VOLUME_HIRING_WORKFLOWS_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: HIGH_VOLUME_HIRING_WORKFLOWS_PATH,
  });

  const indexable = isIndexableCapability(
    HIGH_VOLUME_HIRING_WORKFLOWS_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function highVolumeHiringWorkflowsPageUrl(): string {
  return absoluteUrl(HIGH_VOLUME_HIRING_WORKFLOWS_PATH);
}

export const HIGH_VOLUME_HIRING_WORKFLOWS: ScreeningWorkflowConfig = {
  path: HIGH_VOLUME_HIRING_WORKFLOWS_PATH,
  capabilityStatus: HIGH_VOLUME_HIRING_WORKFLOWS_CAPABILITY_STATUS,
  seo: HIGH_VOLUME_HIRING_WORKFLOWS_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    {
      name: "High-Volume Hiring Workflows",
      href: HIGH_VOLUME_HIRING_WORKFLOWS_PATH,
    },
  ],
  hero: {
    h1: "High-Volume Hiring Workflows That Moves Work Forward",
    answerFirst:
      "A new site needs many people through several hiring stages. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Bulk recruitment campaigns",
  },
  why: {
    id: "why-workflow",
    h2: "Why does bulk recruitment campaigns need a better workflow?",
    answerFirst:
      "Bulk recruitment campaigns create interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats campaigns as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a new site needs many people through several hiring stages. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches bulk recruitment campaigns as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "Industry scenario.",
  },
  how: {
    id: "workflow",
    h2: "How does a hiring voice workflow work?",
    answerFirst:
      "Start with an approved audience and legal basis, run a purpose-specific conversation covering structured questions, interview availability, reminders and stage status, record what was said and what remains uncertain, then hand a reviewable record to interviewer review. Prefer statuses such as “needs review” over invented certainty.",
    steps: [
      {
        title: "Start with an approved audience",
        body: "Confirm an appropriate legal basis for contact before outreach begins.",
      },
      {
        title: "Select a purpose-specific conversation",
        body: "Use structured questions, interview availability, reminders and stage status — only what the purpose requires.",
      },
      {
        title: "Explain and respect choice",
        body: "Explain why the person is being contacted, keep questions short and allow them to decline or request a human.",
      },
      {
        title: "Record what was said",
        body: "Capture what the person actually said and what remains uncertain. The resulting record goes to interviewer review.",
      },
    ],
    interfaceNote:
      'For high-volume hiring workflows, the proposed interface shows an interview journey and action queue. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For bulk recruitment campaigns, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In bulk recruitment campaigns, value comes when an authorised person can move the process forward without asking the same questions again.",
    ],
  },
  trust: {
    id: "trust",
    h2: "How do you maintain trust and accountability?",
    answerFirst:
      "Final hiring decisions belong to accountable people, not an automated score. Explain purpose, respect opt-outs, restrict access, set retention, enable corrections and keep human escalation visible — including separating confidential feedback from hiring decisions.",
    points: [
      "Final hiring decisions belong to accountable people, not an automated score.",
      "Explain the purpose of contact and respect opt-outs. Restrict personal information to people who need it, set retention periods and provide a correction route.",
      "Test the experience with interruptions, noisy environments, unclear answers and different communication styles.",
      "Human escalation should be visible and easy to request.",
      "Sensitive information must not be reused across unrelated purposes simply because a shared platform can technically store it.",
      "In particular, confidential employee feedback should remain separate from individual hiring or rehire decisions.",
    ],
  },
  useCases: {
    title: "Focused scenarios for bulk recruitment campaigns.",
    intro:
      "Purpose-specific high-volume hiring — not a claim of universal automation.",
    items: [
      {
        title: "Cohort pilot launch",
        body: "Select a limited outreach cohort for a new site and keep stage status visible for every contact.",
      },
      {
        title: "Multi-stage progression",
        body: "Move interested people to the next hiring stage with an explicit, reviewable handoff.",
      },
      {
        title: "Exception triage",
        body: "Route unclear answers and clarifications to an authorised owner instead of inventing certainty.",
      },
      {
        title: "Opt-out discipline",
        body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Bulk recruitment campaigns are common when opening new sites, staffing seasonal peaks or filling many similar roles — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Product workflow overview.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${HIGH_VOLUME_HIRING_WORKFLOWS_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is high-volume hiring workflows?",
      answer:
        "It is a purpose-built conversational workflow for bulk recruitment campaigns, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make bulk recruitment campaigns more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    { label: "AI Hiring Agent", href: "/agents/ai-hiring-agent" },
    {
      label: "Recruitment Agency Hiring Agent",
      href: "/agents/recruitment-agency-hiring-agent",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo call about openings at the new distribution site. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes — I applied for several warehouse roles last week.",
    },
    {
      speaker: "Agent",
      text: "Are you interested in continuing, and which shift windows can you work this month?",
    },
    {
      speaker: "Candidate",
      text: "I am interested. Nights work after the 15th. I still need travel details for the site.",
    },
    {
      speaker: "Agent",
      text: "Thanks. A recruiter will review your stage status and follow up on travel. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Campaign interest", value: "Interested", status: "recorded" },
    { criterion: "Shift windows", value: "Nights after the 15th", status: "recorded" },
    { criterion: "Travel details", value: "Needs owner reply", status: "uncertain" },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "interview-journey",
  journeyStages: [
    {
      label: "Approved contact",
      detail: "Legal basis confirmed",
      state: "done",
    },
    {
      label: "Convenience check",
      detail: "Time confirmed",
      state: "done",
    },
    {
      label: "Stage questions",
      detail: "Interest and shifts captured",
      state: "done",
    },
    {
      label: "Unresolved point",
      detail: "Travel details unclear",
      state: "active",
    },
    {
      label: "Interviewer review",
      detail: "Needs review",
      state: "pending",
    },
    {
      label: "Next action",
      detail: "Owner assigned",
      state: "pending",
    },
  ],
  actionQueue: [
    {
      title: "Advance interested candidate to next stage",
      owner: "Recruiter",
      status: "needs_review",
    },
    {
      title: "Share site travel details",
      owner: "Hiring manager",
      status: "assigned",
    },
    {
      title: "Stop outreach if candidate opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo High-Volume Hiring",
  demoSubtitle: "Interview journey + action queue — silent simulation",
  demoFooter: "Huntlo Voice AI · Bulk recruitment",
  aiAskTopic: "Huntlo High-Volume Hiring Workflows",
  aiAskPrompt: `What are Huntlo High-Volume Hiring Workflows on ${HIGH_VOLUME_HIRING_WORKFLOWS_PATH} (https://www.huntlo.ai${HIGH_VOLUME_HIRING_WORKFLOWS_PATH})? How does a bulk recruitment campaign voice workflow collect answers and route a human-reviewed next action?`,
};
