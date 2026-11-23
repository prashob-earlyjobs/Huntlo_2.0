import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_HIRING_AGENT_PATH = "/agents/ai-hiring-agent";

/** Product must approve Live/Pilot/Planned before indexation. */
export const AI_HIRING_AGENT_CAPABILITY_STATUS: CapabilityStatus = "planned";

export const AI_HIRING_AGENT_SEO = {
  title: "AI Hiring Agent | AI Voice Workflows | Huntlo",
  description:
    "Explore recruitment coordination with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function aiHiringAgentMetadata(): Metadata {
  const base = buildPageMetadata({
    title: AI_HIRING_AGENT_SEO.title,
    description: AI_HIRING_AGENT_SEO.description,
    ogTitle: AI_HIRING_AGENT_SEO.title,
    ogDescription: AI_HIRING_AGENT_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: AI_HIRING_AGENT_PATH,
  });

  const indexable = isIndexableCapability(AI_HIRING_AGENT_CAPABILITY_STATUS);

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function aiHiringAgentPageUrl(): string {
  return absoluteUrl(AI_HIRING_AGENT_PATH);
}

export const AI_HIRING_AGENT: ScreeningWorkflowConfig = {
  path: AI_HIRING_AGENT_PATH,
  capabilityStatus: AI_HIRING_AGENT_CAPABILITY_STATUS,
  seo: AI_HIRING_AGENT_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    { name: "AI Hiring Agent", href: AI_HIRING_AGENT_PATH },
  ],
  hero: {
    h1: "AI Hiring Agent That Moves Work Forward",
    answerFirst:
      "A qualified applicant waits for the next interview stage. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Recruitment coordination",
  },
  why: {
    id: "why-workflow",
    h2: "Why does recruitment coordination need a better workflow?",
    answerFirst:
      "Recruitment coordination creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats coordination as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a qualified applicant waits for the next interview stage. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches recruitment coordination as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "This is an illustrative industry scenario, not a claim about a named Huntlo customer.",
  },
  how: {
    id: "workflow",
    h2: "How does a hiring voice workflow work?",
    answerFirst:
      "Start with an approved audience and legal basis, run a purpose-specific conversation covering availability, reminders and stage status, record what was said and what remains uncertain, then hand a reviewable record to interviewer review. Prefer statuses such as “needs review” over invented certainty.",
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
      'For AI Hiring Agent, the proposed interface shows an interview journey and action queue. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For recruitment coordination, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In recruitment coordination, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for recruitment coordination.",
    intro:
      "Purpose-specific hiring coordination — not a claim of universal automation.",
    items: [
      {
        title: "Stage-ready confirmation",
        body: "Confirm a qualified applicant is ready for the next interview stage before the team invests calendar time.",
      },
      {
        title: "Availability capture",
        body: "Record interview windows and reminders as structured fields for the interviewer queue.",
      },
      {
        title: "Clarification routing",
        body: "Send unanswered or unclear points to an authorised owner instead of inventing certainty.",
      },
      {
        title: "Opt-out discipline",
        body: "Stop outreach when a number is wrong or the person declines, and keep the status reviewable.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Recruitment coordination is common in high-volume hiring, multi-location workforce operations and teams moving candidates between interview stages — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Illustrative workflow only — not a live customer case study or audio demo.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${AI_HIRING_AGENT_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is AI Hiring Agent?",
      answer:
        "It is a purpose-built conversational workflow for recruitment coordination, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make recruitment coordination more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    { label: "AI Hiring Agent", href: AI_HIRING_AGENT_PATH },
    { label: "AI Voice Interviews", href: "/agents/ai-voice-interviews" },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo call about the next interview stage for the operations associate role. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes — I was waiting to hear about next steps.",
    },
    {
      speaker: "Agent",
      text: "Are you available for a panel interview this Thursday between 2 and 5 pm?",
    },
    {
      speaker: "Candidate",
      text: "Thursday after 3 pm works. I still have a question about the shift pattern.",
    },
    {
      speaker: "Agent",
      text: "Thanks. An interviewer will review your answers and follow up on the shift question. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Stage readiness", value: "Interested", status: "recorded" },
    { criterion: "Panel window", value: "Thu after 3 pm", status: "recorded" },
    { criterion: "Shift question", value: "Needs owner reply", status: "uncertain" },
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
      detail: "Availability captured",
      state: "done",
    },
    {
      label: "Unresolved point",
      detail: "Shift pattern unclear",
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
      title: "Confirm Thursday panel after 3 pm",
      owner: "Interviewer",
      status: "needs_review",
    },
    {
      title: "Answer shift-pattern clarification",
      owner: "Hiring manager",
      status: "assigned",
    },
    {
      title: "Stop outreach if candidate opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Hiring Agent",
  demoSubtitle: "Interview journey + action queue — silent simulation",
  demoFooter: "Huntlo Voice · Hiring coordination · Illustrative outcome",
  aiAskTopic: "Huntlo AI Hiring Agent voice workflow",
  aiAskPrompt: `What is the Huntlo AI Hiring Agent on ${AI_HIRING_AGENT_PATH} (https://www.huntlo.ai${AI_HIRING_AGENT_PATH})? How does a recruitment coordination voice workflow collect answers and route a human-reviewed next action?`,
};
