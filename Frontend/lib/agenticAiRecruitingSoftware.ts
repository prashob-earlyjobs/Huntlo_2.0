import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AGENTIC_AI_RECRUITING_SOFTWARE_PATH = "/us/agentic-ai-recruiting-software";

export const AGENTIC_AI_RECRUITING_SOFTWARE_SEO = {
  title: "Agentic AI Recruiting Software | Huntlo",
  description:
    "Agentic AI recruiting software that connects sourcing, outreach, screening, and follow-ups—so workflows move between tools while recruiters keep control.",
  ogTitle: "Recruiting Needs More Than Another AI Tool. It Needs a Workflow That Moves.",
  ogDescription:
    "Agentic AI recruiting workflows that respond to events, carry out permitted actions, and involve a recruiter when judgment is required.",
} as const;

export function agenticAiRecruitingSoftwareMetadata() {
  return buildPageMetadata({
    title: AGENTIC_AI_RECRUITING_SOFTWARE_SEO.title,
    description: AGENTIC_AI_RECRUITING_SOFTWARE_SEO.description,
    ogTitle: AGENTIC_AI_RECRUITING_SOFTWARE_SEO.ogTitle,
    ogDescription: AGENTIC_AI_RECRUITING_SOFTWARE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AGENTIC_AI_RECRUITING_SOFTWARE_PATH,
  });
}

export const AGENTIC_AI_RECRUITING_SOFTWARE_GEO = {
  askTopic: "Huntlo agentic AI recruiting software",
  askPrompt:
    "What is agentic AI recruiting software on Huntlo at /us/agentic-ai-recruiting-software (https://www.huntlo.ai/us/agentic-ai-recruiting-software)? How do agentic workflows connect sourcing, outreach, screening, and follow-ups while keeping recruiters in control?",
} as const;

export const HERO_FLOW = [
  { label: "Candidate reply", detail: "Interest + reschedule request", kind: "event" as const },
  { label: "Agent action", detail: "Interpret · check next steps", kind: "agent" as const },
  { label: "Recruiter approval", detail: "Human judgment gate", kind: "human" as const },
] as const;

export const PROBLEM_COLUMNS = [
  {
    title: "Fragmented tools",
    description:
      "ATS, sourcing, email, databases, and scheduling each hold a piece of the work - none owns the path between them.",
  },
  {
    title: "Manual handoffs",
    description:
      "Every reply, stage change, and availability update waits for someone to remember what happens next.",
  },
  {
    title: "Missed follow-ups",
    description:
      "When coordination lives in inboxes, candidates stall between outreach, screening, and interview.",
  },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Candidate discovery",
    detail:
      "Start with a defined hiring requirement, relevant candidate information, and criteria approved by the hiring team.",
  },
  {
    stage: "02",
    title: "Candidate engagement",
    detail:
      "Coordinate personalized outreach and follow-up through approved communication channels.",
  },
  {
    stage: "03",
    title: "Response handling",
    detail:
      "Interpret incoming responses and identify whether the next action involves scheduling, clarification, recruiter review, or stopping communication.",
  },
  {
    stage: "04",
    title: "Interview coordination",
    detail:
      "Support scheduling and reminders while escalating conflicts or requests outside the approved workflow.",
  },
  {
    stage: "05",
    title: "Recruiter oversight",
    detail:
      "Keep recruiters informed about actions, unresolved exceptions, and decisions that require human involvement.",
  },
] as const;

export const APPROVAL_QUEUE = [
  {
    candidate: "Priya N.",
    signal: "Interested · different interview time",
    action: "Propose slots",
    status: "Needs approval",
  },
  {
    candidate: "Marcus T.",
    signal: "Asked about remote policy",
    action: "Clarify · recruiter reply",
    status: "Escalated",
  },
  {
    candidate: "Elena R.",
    signal: "Confirmed screening",
    action: "Send calendar hold",
    status: "Ready",
  },
] as const;

export const USE_CASES = [
  {
    title: "Staffing agencies",
    description:
      "Evaluate agentic workflows for repetitive engagement, follow-up coordination, and interview operations - subject to system capabilities and compliance requirements.",
  },
  {
    title: "Internal talent acquisition",
    description:
      "Connect discovery, outreach, and screening so TA teams spend less time chasing handoffs across open roles.",
  },
  {
    title: "Recruiting operations",
    description:
      "Surface exceptions before they become delays, with clear ownership of what automation may do and what people must decide.",
  },
] as const;

export const PRODUCTIVITY_QUESTIONS = [
  "Can recruiters spend less time checking whether someone replied?",
  "Can candidate conversations continue without being lost between tools?",
  "Can managers identify exceptions before they become delays?",
  "Can candidates receive timely, relevant communication rather than repeated generic reminders?",
] as const;

export const INTERNAL_LINKS = [
  { label: "Recruiting Workflow Automation", href: "/recruiting-workflow-automation" },
  { label: "Automated Candidate Follow-Up", href: "/automated-candidate-follow-up" },
  { label: "AI Recruiting for Staffing Agencies", href: "/ai-recruiting-staffing-agencies" },
  { label: "AI Recruiting Agents", href: "/recruiting-agents" },
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  {
    label: "AI Interview Scheduling Automation",
    href: "/us/ai-interview-scheduling-automation",
  },
] as const;

export const AGENTIC_AI_RECRUITING_SOFTWARE_FAQS = [
  {
    question: "What is agentic AI recruiting software?",
    answer:
      "Agentic AI recruiting software uses AI-driven agents to coordinate connected recruitment tasks, such as engagement, response handling and workflow progression, within defined operational boundaries.",
  },
  {
    question: "How is Agentic Hiring different from standard AI recruiting?",
    answer:
      "Standard AI recruiting usually assists one step—search, scoring, or chat. Agentic Hiring coordinates permitted actions across connected stages so work progresses between systems, with recruiters reviewing exceptions and decisions.",
  },
  {
    question: "How is agentic recruiting different from an ATS?",
    answer:
      "An ATS primarily organizes candidate records and hiring processes. Agentic recruiting focuses on coordinating actions and responses across a workflow. The two can be complementary.",
  },
  {
    question: "Does agentic AI replace recruiters?",
    answer:
      "It should not replace human accountability for hiring decisions. Its practical role is to reduce repetitive coordination and surface situations that need recruiter judgment.",
  },
  {
    question: "Can agentic AI support staffing agencies?",
    answer:
      "Yes. Staffing agencies can evaluate agentic workflows for repetitive activities such as candidate engagement, follow-up coordination and interview operations, subject to system capabilities and compliance requirements.",
  },
] as const;
