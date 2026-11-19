import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const RECRUITING_WORKFLOW_AUTOMATION_PATH = "/recruiting-workflow-automation";

export const RECRUITING_WORKFLOW_AUTOMATION_SEO = {
  title: "Recruiting Workflow Automation for Hiring Teams | Huntlo",
  description:
    "Explore a more connected recruiting workflow, from candidate discovery to outreach and recruiter review. See how Huntlo can support your team.",
  ogTitle: "Your recruiting workflow should move with your team-not against it.",
  ogDescription:
    "Connect discovery, outreach, response handling, and recruiter review - with oversight preserved at every handoff.",
} as const;

export function recruitingWorkflowAutomationMetadata() {
  return buildPageMetadata({
    title: RECRUITING_WORKFLOW_AUTOMATION_SEO.title,
    description: RECRUITING_WORKFLOW_AUTOMATION_SEO.description,
    ogTitle: RECRUITING_WORKFLOW_AUTOMATION_SEO.ogTitle,
    ogDescription: RECRUITING_WORKFLOW_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: RECRUITING_WORKFLOW_AUTOMATION_PATH,
  });
}

export const RECRUITING_WORKFLOW_AUTOMATION_GEO = {
  askTopic: "Huntlo recruiting workflow automation",
  askPrompt:
    "What is recruiting workflow automation on Huntlo at /recruiting-workflow-automation (https://www.huntlo.ai/recruiting-workflow-automation)? How does it connect sourcing, outreach, response handling, and recruiter review while preserving oversight?",
} as const;

export const HERO_STAGES = [
  { label: "Discover", detail: "Role-fit talent", gate: false },
  { label: "Outreach", detail: "First touch", gate: false },
  { label: "Respond", detail: "Reply triage", gate: false },
  { label: "Review", detail: "Human gate", gate: true },
  { label: "Advance", detail: "Next step", gate: false },
] as const;

export const HANDOFF_STACK = [
  {
    title: "Sourcing → outreach",
    description: "Candidate context often resets when discovery tools and messaging tools do not share a path.",
  },
  {
    title: "Outreach → reply",
    description: "Responses land in inboxes that are not tied to the vacancy, so triage becomes tribal knowledge.",
  },
  {
    title: "Reply → recruiter review",
    description: "Without a clear review gate, promising conversations stall between automation and judgment.",
  },
  {
    title: "Review → next step",
    description: "Scheduling, screening, or pass decisions need an explicit owner - not another disconnected task.",
  },
] as const;

export const AUTOMATION_MEANS = [
  {
    title: "Repeatable steps, connected",
    description:
      "Automation should link sourcing, outreach, response handling, and handoffs - not create another siloed sequence tool.",
  },
  {
    title: "Oversight stays human",
    description:
      "Recruiters still own relationships, evaluation, and hiring decisions. Automation prepares the path; people decide.",
  },
  {
    title: "Exceptions are first-class",
    description:
      "A useful workflow makes the exception path as clear as the happy path - pauses, escalations, and reassignment included.",
  },
] as const;

export const PRACTICAL_WORKFLOW = [
  {
    stage: "01",
    title: "Search",
    detail: "Monday morning: a staffing team opens a client vacancy and defines fit criteria before volume.",
    gate: false,
  },
  {
    stage: "02",
    title: "Source",
    detail: "Candidates are discovered against that criteria and attached to the same vacancy thread.",
    gate: false,
  },
  {
    stage: "03",
    title: "Outreach",
    detail: "First-touch messaging runs with context from the role - not a generic blast.",
    gate: false,
  },
  {
    stage: "04",
    title: "Response",
    detail: "Replies and silence both surface in one place so triage does not depend on inbox archaeology.",
    gate: false,
  },
  {
    stage: "05",
    title: "Recruiter review",
    detail: "A human gate decides who advances, who waits, and what the next conversation should be.",
    gate: true,
  },
] as const;

export const EXCEPTION_PATHS = [
  {
    title: "No reply",
    description: "A restrained follow-up path with a clear end - not endless reminders.",
  },
  {
    title: "Interested, not ready",
    description: "Park with context so the next outreach resumes from the last known intent.",
  },
  {
    title: "Wrong fit",
    description: "A clean pass with a reason, so the vacancy does not keep recycling the same profile.",
  },
  {
    title: "Needs human judgment",
    description: "Escalate to recruiter review before any client-facing or irreversible step.",
  },
] as const;

export const PLATFORM_LOOK_FOR = [
  {
    title: "Connected stages",
    description: "Discovery, outreach, responses, and review should share one visible path per vacancy.",
  },
  {
    title: "Explicit review gates",
    description: "You should be able to mark where a person must decide before work continues.",
  },
  {
    title: "Clear exception handling",
    description: "Ask how silence, opt-outs, and ambiguous replies interrupt the flow.",
  },
  {
    title: "Pilot-friendly scope",
    description: "Start with one high-friction workflow and one real vacancy - not a full-stack rewrite.",
  },
] as const;

export const TRUST_UI_ROWS = [
  { candidate: "Maya Chen", stage: "Outreach sent", next: "Awaiting reply" },
  { candidate: "Jordan Hale", stage: "Reply received", next: "Review gate" },
  { candidate: "Sam Okonkwo", stage: "Review complete", next: "Schedule screen" },
] as const;

export const EVALUATION_FRAMING = {
  title: "A better next step",
  body: "Evaluate Huntlo against one workflow your team already runs. Ask how discovery, outreach, response handling, and recruiter review would stay connected for a real vacancy - and where human gates remain required.",
} as const;

export const DEMO_QUESTION = {
  title: "A useful question for your next product demo",
  body: "Show me the exception path for a candidate who replies with interest but is unavailable for two weeks. Where does automation pause, who owns the next step, and how does context survive until outreach resumes?",
} as const;

export const RECRUITING_WORKFLOW_AUTOMATION_FAQS = [
  {
    question: "What is recruiting workflow automation?",
    answer:
      "It connects repeatable recruiting steps, such as sourcing, outreach, response handling, and handoffs, while preserving recruiter oversight.",
  },
  {
    question: "Does automation replace a recruiter?",
    answer:
      "No. Recruiters still own candidate relationships, evaluation, and hiring decisions.",
  },
  {
    question: "Where should a team start?",
    answer:
      "Choose one high-friction workflow, document the steps, and test it with a real vacancy.",
  },
] as const;
