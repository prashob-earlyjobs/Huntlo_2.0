import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_INTERVIEWS_PATH = "/agents/ai-voice-interviews";

/** Product must approve Live/Pilot/Planned before indexation. */
export const AI_VOICE_INTERVIEWS_CAPABILITY_STATUS: CapabilityStatus = "planned";

export const AI_VOICE_INTERVIEWS_SEO = {
  title: "AI Voice Interviews | AI Voice Workflows | Huntlo",
  description:
    "Explore structured first-round interviews with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function aiVoiceInterviewsMetadata(): Metadata {
  const base = buildPageMetadata({
    title: AI_VOICE_INTERVIEWS_SEO.title,
    description: AI_VOICE_INTERVIEWS_SEO.description,
    ogTitle: AI_VOICE_INTERVIEWS_SEO.title,
    ogDescription: AI_VOICE_INTERVIEWS_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_INTERVIEWS_PATH,
  });

  const indexable = isIndexableCapability(AI_VOICE_INTERVIEWS_CAPABILITY_STATUS);

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function aiVoiceInterviewsPageUrl(): string {
  return absoluteUrl(AI_VOICE_INTERVIEWS_PATH);
}

export const AI_VOICE_INTERVIEWS: ScreeningWorkflowConfig = {
  path: AI_VOICE_INTERVIEWS_PATH,
  capabilityStatus: AI_VOICE_INTERVIEWS_CAPABILITY_STATUS,
  seo: AI_VOICE_INTERVIEWS_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: AGENTS_HUB_PATH },
    { name: "AI Voice Interviews", href: AI_VOICE_INTERVIEWS_PATH },
  ],
  hero: {
    h1: "AI Voice Interviews That Moves Work Forward",
    answerFirst:
      "A recruiter needs comparable first-round responses. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Structured first-round interviews",
  },
  why: {
    id: "why-workflow",
    h2: "Why does structured first-round interviews need a better workflow?",
    answerFirst:
      "Structured first-round interviews create interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats first rounds as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a recruiter needs comparable first-round responses. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches structured first-round interviews as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
    ],
    notice:
      "Industry scenario.",
  },
  how: {
    id: "workflow",
    h2: "How does a hiring voice workflow work?",
    answerFirst:
      "Start with an approved audience and legal basis, run a purpose-specific conversation covering structured questions, availability, reminders and stage status, record what was said and what remains uncertain, then hand a reviewable record to interviewer review. Prefer statuses such as “needs review” over invented certainty.",
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
      'For AI Voice Interviews, the proposed interface shows an interview journey and action queue. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For structured first-round interviews, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In structured first-round interviews, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for structured first-round interviews.",
    intro:
      "Comparable first-round responses with human-reviewed handoffs — not a claim of universal automation.",
    items: [
      {
        title: "Comparable first rounds",
        body: "Ask the same approved questions so recruiters can compare responses across candidates.",
      },
      {
        title: "Structured answer capture",
        body: "Record short answers and flag uncertain points for interviewer judgment.",
      },
      {
        title: "Stage handoff",
        body: "Make the next interview stage explicit when the person is interested.",
      },
      {
        title: "Retry and opt-out discipline",
        body: "Record unanswered attempts, follow retry rules and stop contact when people decline.",
      },
    ],
  },
  industryContext: {
    title: "Industry context",
    body: "Structured first-round interviews are common in high-volume hiring, campus and frontline pipelines — where recruiters need comparable answers and clear handoffs rather than inconsistent call notes.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Product workflow overview.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${AI_VOICE_INTERVIEWS_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is AI Voice Interviews?",
      answer:
        "It is a purpose-built conversational workflow for structured first-round interviews, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make structured first-round interviews more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Agents", href: AGENTS_HUB_PATH },
    { label: "AI Hiring Agent", href: "/agents/ai-hiring-agent" },
    {
      label: "Interview Scheduling Agent",
      href: "/agents/interview-scheduling-agent",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo first-round interview call for the customer support role. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes, I can talk for about ten minutes.",
    },
    {
      speaker: "Agent",
      text: "In one or two sentences, why are you interested in this role, and when could you join?",
    },
    {
      speaker: "Candidate",
      text: "I like helping customers resolve issues. I could join in three weeks if selected.",
    },
    {
      speaker: "Agent",
      text: "Thank you. An interviewer will review your answers and share next steps. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Role interest", value: "Customer support focus", status: "recorded" },
    { criterion: "Join timeline", value: "About three weeks", status: "recorded" },
    { criterion: "Depth of answer", value: "Needs interviewer judgment", status: "uncertain" },
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
      label: "Structured questions",
      detail: "First-round answers captured",
      state: "done",
    },
    {
      label: "Comparable record",
      detail: "Ready for side-by-side review",
      state: "active",
    },
    {
      label: "Interviewer review",
      detail: "Needs review",
      state: "pending",
    },
    {
      label: "Next stage",
      detail: "Owner decides progression",
      state: "pending",
    },
  ],
  actionQueue: [
    {
      title: "Review first-round answers for comparability",
      owner: "Recruiter",
      status: "needs_review",
    },
    {
      title: "Decide progression to panel",
      owner: "Hiring manager",
      status: "assigned",
    },
    {
      title: "Stop outreach on opt-out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Voice AI Interviews",
  demoSubtitle: "Interview journey + action queue — silent simulation",
  demoFooter: "Huntlo Voice AI · First-round interview",
  aiAskTopic: "Huntlo AI Voice Interviews workflow",
  aiAskPrompt: `What is Huntlo AI Voice Interviews on ${AI_VOICE_INTERVIEWS_PATH} (https://www.huntlo.ai${AI_VOICE_INTERVIEWS_PATH})? How does a structured first-round interview voice workflow collect answers and route a human-reviewed next action?`,
};
