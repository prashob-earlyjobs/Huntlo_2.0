import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const SEASONAL_WORKFORCE_REHIRING_PATH =
  "/agents/seasonal-workforce-rehiring";

/** Product must approve Live/Pilot/Planned before indexation. */
export const SEASONAL_WORKFORCE_REHIRING_CAPABILITY_STATUS: CapabilityStatus =
  "planned";

export const SEASONAL_WORKFORCE_REHIRING_SEO = {
  title: "Seasonal Workforce Rehiring | AI Voice Workflows | Huntlo",
  description:
    "Explore seasonal return campaigns with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function seasonalWorkforceRehiringMetadata(): Metadata {
  const base = buildPageMetadata({
    title: SEASONAL_WORKFORCE_REHIRING_SEO.title,
    description: SEASONAL_WORKFORCE_REHIRING_SEO.description,
    ogTitle: SEASONAL_WORKFORCE_REHIRING_SEO.title,
    ogDescription: SEASONAL_WORKFORCE_REHIRING_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: SEASONAL_WORKFORCE_REHIRING_PATH,
  });

  const indexable = isIndexableCapability(
    SEASONAL_WORKFORCE_REHIRING_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function seasonalWorkforceRehiringPageUrl(): string {
  return absoluteUrl(SEASONAL_WORKFORCE_REHIRING_PATH);
}

export const SEASONAL_WORKFORCE_REHIRING: ScreeningWorkflowConfig = {
  path: SEASONAL_WORKFORCE_REHIRING_PATH,
  capabilityStatus: SEASONAL_WORKFORCE_REHIRING_CAPABILITY_STATUS,
  seo: SEASONAL_WORKFORCE_REHIRING_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    {
      name: "Seasonal Workforce Rehiring",
      href: SEASONAL_WORKFORCE_REHIRING_PATH,
    },
  ],
  hero: {
    h1: "Seasonal Workforce Rehiring That Moves Work Forward",
    answerFirst:
      "A peak-season operation needs experienced returning workers. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Seasonal return campaigns",
  },
  why: {
    id: "why-workflow",
    h2: "Why does seasonal return campaigns need a better workflow?",
    answerFirst:
      "Seasonal return campaigns create interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats return outreach as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a peak-season operation needs experienced returning workers. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches seasonal return campaigns as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "Industry scenario.",
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
      'For seasonal workforce rehiring, the proposed interface shows a previous-versus-current talent profile. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For seasonal return campaigns, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In seasonal return campaigns, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for seasonal return campaigns.",
    intro:
      "Purpose-specific rehiring coordination — not a claim of universal automation.",
    items: [
      {
        title: "Peak-season return check",
        body: "Confirm whether experienced seasonal workers are open to returning for the upcoming peak with short, optional voice questions.",
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
    body: "Seasonal return campaigns are common in retail peaks, logistics surges, hospitality seasons and other operations that need experienced returning workers — where prior relationships create outreach volume that still needs recording and handoff work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Product workflow overview.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${SEASONAL_WORKFORCE_REHIRING_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is seasonal workforce rehiring?",
      answer:
        "It is a purpose-built conversational workflow for seasonal return campaigns, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make seasonal return campaigns more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    {
      label: "AI Rehiring Agent",
      href: "/agents/ai-rehiring-agent",
    },
    {
      label: "Dormant Candidate Reactivation",
      href: "/agents/dormant-candidate-reactivation",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is an optional Huntlo call about returning for the upcoming peak season. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "I can talk briefly — which sites and dates?",
    },
    {
      speaker: "Agent",
      text: "Are you open to returning, and what availability or location constraints should we record?",
    },
    {
      speaker: "Candidate",
      text: "I am interested for evenings if the south hub is open from November.",
    },
    {
      speaker: "Agent",
      text: "Recorded. Rehire eligibility review will follow. You can decline further contact or ask for a person anytime.",
    },
  ],
  sampleRubric: [
    {
      criterion: "Current interest",
      value: "Open for evening peak shifts",
      status: "recorded",
    },
    {
      criterion: "Availability",
      value: "From November",
      status: "recorded",
    },
    {
      criterion: "Location",
      value: "South hub preferred",
      status: "recorded",
    },
    { criterion: "Overall status", value: "Needs review", status: "review" },
  ],
  demoVariant: "talent-profile",
  previousProfile: [
    { label: "Prior role", value: "Seasonal fulfilment associate" },
    { label: "Last peak", value: "Q4 · completed season" },
    { label: "Last site", value: "South hub" },
    { label: "Skills on file", value: "Pick · pack · scanner" },
  ],
  currentProfile: [
    {
      label: "Current interest",
      value: "Open for evening peak shifts",
      status: "recorded",
    },
    {
      label: "Availability",
      value: "From November",
      status: "recorded",
    },
    {
      label: "Location preference",
      value: "South hub",
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
      title: "Review evening-peak interest",
      owner: "Seasonal ops",
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
  demoTitle: "Huntlo Seasonal Workforce Rehiring",
  demoSubtitle: "Previous vs current talent profile — silent simulation",
  demoFooter:
    "Huntlo Voice AI · Seasonal return campaigns",
  aiAskTopic: "Huntlo Seasonal Workforce Rehiring voice workflow",
  aiAskPrompt: `What is Huntlo Seasonal Workforce Rehiring on ${SEASONAL_WORKFORCE_REHIRING_PATH} (https://www.huntlo.ai${SEASONAL_WORKFORCE_REHIRING_PATH})? How does a seasonal return campaign voice workflow collect answers and route a human-reviewed next action?`,
};
