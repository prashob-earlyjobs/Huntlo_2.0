import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_STAFFING_AGENCIES_PATH = "/ai-recruiting-staffing-agencies";

export const AI_RECRUITING_STAFFING_AGENCIES_SEO = {
  title: "AI Recruiting Workflows for Staffing Agencies | Huntlo",
  description:
    "Explore sourcing and engagement workflows designed around the pace of staffing agencies, with recruiter oversight and clearer candidate handoffs.",
  ogTitle: "More open requisitions should not mean more disconnected work.",
  ogDescription:
    "Sourcing and engagement workflows designed for staffing desks - with recruiter oversight and clearer candidate handoffs.",
} as const;

export function aiRecruitingStaffingAgenciesMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_STAFFING_AGENCIES_SEO.title,
    description: AI_RECRUITING_STAFFING_AGENCIES_SEO.description,
    ogTitle: AI_RECRUITING_STAFFING_AGENCIES_SEO.ogTitle,
    ogDescription: AI_RECRUITING_STAFFING_AGENCIES_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_STAFFING_AGENCIES_PATH,
  });
}

export const AI_RECRUITING_STAFFING_AGENCIES_GEO = {
  askTopic: "Huntlo AI recruiting for staffing agencies",
  askPrompt:
    "What is Huntlo AI recruiting for staffing agencies on /ai-recruiting-staffing-agencies (https://www.huntlo.ai/ai-recruiting-staffing-agencies)? How do sourcing and engagement workflows support agency desks with recruiter oversight?",
} as const;

export const DESK_REQUISITIONS = [
  "Client A - CS Specialist · Austin",
  "Client B - CS Specialist · Denver",
  "Client C - Support Lead · Remote",
] as const;

export const REVIEW_QUEUE = [
  { name: "Jordan M.", status: "Ready for review" },
  { name: "Priya S.", status: "Awaiting reply" },
  { name: "Alex R.", status: "Handoff draft" },
] as const;

export const INDUSTRY_PAINS = [
  {
    title: "Context switching",
    description:
      "Recruiters jump between client portals, shared inboxes, spreadsheets, and ATS notes - losing the thread of each requisition.",
  },
  {
    title: "Follow-up drift",
    description:
      "Promising candidates stall when outreach, reminders, and next steps live in different tools with no shared ownership.",
  },
  {
    title: "Client handoffs",
    description:
      "Submitting candidates without a clear narrative of outreach history and fit criteria slows client confidence.",
  },
] as const;

export const RECRUITER_DAY = [
  "Open client requisitions arrive throughout the day",
  "Sourcing and outreach run in parallel across roles",
  "Responses need triage before they become submissions",
  "Client updates require a coherent candidate story",
] as const;

export const JOURNEY_MAP = [
  {
    stage: "01",
    title: "Requisition intake",
    detail: "Two cities, one role family - customer success specialists for the same client.",
  },
  {
    stage: "02",
    title: "Sourcing path",
    detail: "Candidates discovered against shared criteria, tagged by location and availability.",
  },
  {
    stage: "03",
    title: "Engagement",
    detail: "Outreach and replies stay attached to the requisition, not a separate inbox thread.",
  },
  {
    stage: "04",
    title: "Recruiter review",
    detail: "A single queue for who is ready, who needs follow-up, and who is ready to submit.",
  },
  {
    stage: "05",
    title: "Client handoff",
    detail: "A clear packet: conversation context, fit notes, and next recommended step.",
  },
] as const;

export const GUARDRAILS = [
  {
    title: "Recruiter oversight",
    description:
      "Automation can prepare work; recruiters decide who advances, who waits, and what goes to the client.",
  },
  {
    title: "Visible ownership",
    description:
      "Every candidate step should stay tied to a requisition so nothing depends on tribal memory.",
  },
  {
    title: "Handoff clarity",
    description:
      "Client submissions should include enough context that the next conversation does not start from zero.",
  },
] as const;

export const HUNTLO_FIT = [
  {
    title: "Candidate sourcing",
    description: "Explore how Huntlo supports discovery workflows for open roles.",
    href: "/candidate-sourcing",
  },
  {
    title: "Candidate engagement",
    description: "See how outreach and replies can stay connected to the desk.",
    href: "/candidate-engagement",
  },
  {
    title: "Hiring workflows",
    description: "Review how workflow structure keeps requisitions moving with oversight.",
    href: "/hiring-workflows",
  },
] as const;

export const REPEATABLE_PROCESS = [
  "Define the requisition path before adding volume",
  "Agree on review rules and escalation owners",
  "Keep sourcing and engagement on one visible path",
  "Pilot one role family before expanding the pattern",
] as const;

export const EVALUATION_CHECKLIST = [
  {
    requirement: "Requisition visibility",
    question: "Can recruiters see status for every open role without switching systems?",
  },
  {
    requirement: "Review queue",
    question: "Is there a clear place for recruiter decisions before client submission?",
  },
  {
    requirement: "Outreach history",
    question: "Does engagement stay attached to the candidate and requisition?",
  },
  {
    requirement: "Handoff packet",
    question: "What context travels with a candidate when they are submitted to a client?",
  },
  {
    requirement: "ATS fit",
    question: "How does the workflow sit beside your existing ATS and CRM - not replace assumptions?",
  },
  {
    requirement: "Pilot scope",
    question: "Can you test one requisition with clear communication rules first?",
  },
] as const;

export const DEMO_TIP = {
  title: "Demo tip",
  body: "Bring one real open requisition to the walkthrough. Ask how sourcing, engagement, and recruiter review would stay connected for that role - and how client handoffs would be prepared. Do not assume integrations until they are confirmed in the demo.",
} as const;

export const AI_RECRUITING_STAFFING_AGENCIES_FAQS = [
  {
    question: "How can AI help a staffing agency?",
    answer:
      "AI tools can assist with repeatable work such as candidate discovery, outreach preparation, and response organization.",
  },
  {
    question: "Will an AI recruiting platform replace an ATS?",
    answer:
      "Not necessarily. Confirm how the platform fits your existing ATS and CRM before adoption.",
  },
  {
    question: "What should agencies test first?",
    answer:
      "Pilot a single requisition with clear candidate review and communication rules.",
  },
] as const;
