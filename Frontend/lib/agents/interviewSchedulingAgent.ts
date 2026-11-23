import type { Metadata } from "next";

import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const INTERVIEW_SCHEDULING_AGENT_PATH = "/solutions/interview-coordination";

/** Product must approve Live/Pilot/Planned before indexation. */
export const INTERVIEW_SCHEDULING_AGENT_CAPABILITY_STATUS: CapabilityStatus = "planned";

export const INTERVIEW_SCHEDULING_AGENT_SEO = {
  title: "Interview Scheduling Agent | AI Voice Workflows | Huntlo",
  description:
    "Explore interview scheduling with Huntlo AI voice workflows. See practical use cases, human-reviewed outcomes and a clear path from conversation to action.",
} as const;

export function interviewSchedulingAgentMetadata(): Metadata {
  const base = buildPageMetadata({
    title: INTERVIEW_SCHEDULING_AGENT_SEO.title,
    description: INTERVIEW_SCHEDULING_AGENT_SEO.description,
    ogTitle: INTERVIEW_SCHEDULING_AGENT_SEO.title,
    ogDescription: INTERVIEW_SCHEDULING_AGENT_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: INTERVIEW_SCHEDULING_AGENT_PATH,
  });

  const indexable = isIndexableCapability(
    INTERVIEW_SCHEDULING_AGENT_CAPABILITY_STATUS
  );

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function interviewSchedulingAgentPageUrl(): string {
  return absoluteUrl(INTERVIEW_SCHEDULING_AGENT_PATH);
}

export const INTERVIEW_SCHEDULING_AGENT: ScreeningWorkflowConfig = {
  path: INTERVIEW_SCHEDULING_AGENT_PATH,
  capabilityStatus: INTERVIEW_SCHEDULING_AGENT_CAPABILITY_STATUS,
  seo: INTERVIEW_SCHEDULING_AGENT_SEO,
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "Solutions", href: "/solutions/ai-hiring-agents" },
    { name: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { name: "Interview Coordination", href: INTERVIEW_SCHEDULING_AGENT_PATH },
  ],
  hero: {
    h1: "Interview Scheduling Agent That Moves Work Forward",
    answerFirst:
      "A candidate and manager struggle to agree on a time. Huntlo helps teams organise relevant voice conversations, capture structured answers and direct the result to the right person. Move beyond repeated calls toward clear, reviewable actions.",
    primaryCta: { label: "Explore the Workflow", href: "#workflow" },
    secondaryCta: { label: "Book a Demo" },
    capabilityLabel: "Interview scheduling",
  },
  why: {
    id: "why-workflow",
    h2: "Why does interview scheduling need a better workflow?",
    answerFirst:
      "Interview scheduling creates interpretation, recording and handoff work — not just dial volume. Missed answers delay action; vague summaries trigger repeat calls; poorly timed messages damage trust. Huntlo treats scheduling as an operational journey with defined learning goals and owners.",
    paragraphs: [
      "Picture a typical day: a candidate and manager struggle to agree on a time. The problem is not merely the number of people to contact. The problem is that each conversation creates information somebody must interpret, record and act upon.",
      "A missed answer may cause a delay; a vague summary may cause another call; a poorly timed message may damage trust.",
      "Huntlo approaches interview scheduling as an operational journey rather than a call-volume target. The team defines what must be learned, which answers need attention and who owns the next step.",
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
      'For interview scheduling agent, the proposed interface shows an interview journey and action queue. A status such as "needs review" is more useful than an invented certainty.',
    verificationNote:
      "Availability of particular integrations, automated actions and languages must be verified before a public deployment claim.",
  },
  example: {
    id: "operational-example",
    h2: "What would a real operational example look like?",
    answerFirst:
      "An operator selects a cohort, reviews approved questions and launches a limited pilot. The agent confirms timing, asks only necessary questions, routes clarifications to an owner and stops outreach on wrong numbers or opt-outs — leaving a time-stamped outcome.",
    paragraphs: [
      "For interview scheduling, an operator could select a relevant cohort, review the approved questions and launch a limited outreach pilot.",
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
      "In interview scheduling, value comes when an authorised person can move the process forward without asking the same questions again.",
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
    title: "Focused scenarios for interview scheduling.",
    intro:
      "Purpose-specific scheduling coordination — not a claim of universal automation.",
    items: [
      {
        title: "Availability alignment",
        body: "Capture candidate and manager windows so the team can propose a workable slot without another round of calls.",
      },
      {
        title: "Reminder discipline",
        body: "Confirm upcoming interviews and record whether the person acknowledged, rescheduled or needed help.",
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
    body: "Interview scheduling is common in high-volume hiring, multi-location workforce operations and teams coordinating candidates with busy hiring managers — where conversation volume creates recording and handoff work, not just dialing work.",
  },
  limitationNotice: {
    title: "Limitations and product truth",
    items: [
      "Product workflow overview.",
      "No automatic employment decisions from unreviewed AI responses.",
      "Integrations, languages and automated actions require verification before deployment claims.",
      `Capability status: ${INTERVIEW_SCHEDULING_AGENT_CAPABILITY_STATUS}. Indexation follows product approval.`,
    ],
  },
  faqs: [
    {
      question: "What is interview scheduling agent?",
      answer:
        "It is a purpose-built conversational workflow for interview scheduling, designed to collect relevant answers and route an accountable next action. Confirm actual product availability before publication.",
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
      "Make interview scheduling more consistent and easier to act on.",
    subhead: "Book a Huntlo workflow discussion.",
  },
  relatedLinks: [
    { label: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { label: "AI Screening", href: "/solutions/ai-screening" },
    {
      label: "Candidate Qualification",
      href: "/solutions/candidate-qualification",
    },
  ],
  sampleTranscript: [
    {
      speaker: "Agent",
      text: "Hi, this is a Huntlo call to schedule your interview for the warehouse associate role. Is now a convenient time?",
    },
    {
      speaker: "Candidate",
      text: "Yes — I have been waiting to lock a time with the manager.",
    },
    {
      speaker: "Agent",
      text: "Which of these windows work for you: Tuesday 10–12, Wednesday 2–4, or Thursday morning?",
    },
    {
      speaker: "Candidate",
      text: "Wednesday after 2 pm works. I still need to know which site entrance to use.",
    },
    {
      speaker: "Agent",
      text: "Thanks. An interviewer will review your availability and follow up on the entrance question. You can ask to speak with a person anytime.",
    },
  ],
  sampleRubric: [
    { criterion: "Availability", value: "Wed after 2 pm", status: "recorded" },
    { criterion: "Site entrance", value: "Needs owner reply", status: "uncertain" },
    { criterion: "Reminder consent", value: "Interested", status: "recorded" },
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
      label: "Availability capture",
      detail: "Windows recorded",
      state: "done",
    },
    {
      label: "Unresolved point",
      detail: "Site entrance unclear",
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
      title: "Confirm Wednesday interview after 2 pm",
      owner: "Interviewer",
      status: "needs_review",
    },
    {
      title: "Share site entrance instructions",
      owner: "Hiring manager",
      status: "assigned",
    },
    {
      title: "Stop outreach if candidate opts out",
      owner: "Policy",
      status: "stopped",
    },
  ],
  demoTitle: "Huntlo Interview Scheduling",
  demoSubtitle: "Interview journey + action queue — silent simulation",
  demoFooter: "Huntlo Voice AI · Interview scheduling",
  aiAskTopic: "Huntlo Interview Scheduling Agent voice workflow",
  aiAskPrompt: `What is the Huntlo Interview Scheduling Agent on ${INTERVIEW_SCHEDULING_AGENT_PATH} (https://www.huntlo.ai${INTERVIEW_SCHEDULING_AGENT_PATH})? How does an interview scheduling voice workflow collect answers and route a human-reviewed next action?`,
};
