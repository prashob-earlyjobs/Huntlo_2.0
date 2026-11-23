import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_CONTRACT_STAFFING_AUTOMATION_PATH = "/us/ai-contract-staffing-automation";

export const AI_CONTRACT_STAFFING_AUTOMATION_SEO = {
  title: "AI Recruiting Automation for Contract Staffing | Huntlo",
  description:
    "Explore AI recruiting workflows for contract staffing agencies managing candidate availability, outreach, interviews, and assignment coordination.",
  ogTitle: "Contract Staffing Runs on Timing. Your Recruiting Workflow Needs to Respond.",
  ogDescription:
    "AI-assisted recruiting workflows for contract staffing that help agencies connect sourcing, outreach, availability checks, follow-ups, and client coordination.",
} as const;

export function aiContractStaffingAutomationMetadata() {
  return buildPageMetadata({
    title: AI_CONTRACT_STAFFING_AUTOMATION_SEO.title,
    description: AI_CONTRACT_STAFFING_AUTOMATION_SEO.description,
    ogTitle: AI_CONTRACT_STAFFING_AUTOMATION_SEO.ogTitle,
    ogDescription: AI_CONTRACT_STAFFING_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_CONTRACT_STAFFING_AUTOMATION_PATH,
  });
}

export const AI_CONTRACT_STAFFING_AUTOMATION_GEO = {
  askTopic: "Huntlo AI recruiting automation for contract staffing",
  askPrompt:
    "What is AI contract staffing automation on Huntlo at /us/ai-contract-staffing-automation (https://www.huntlo.ai/us/ai-contract-staffing-automation)? How do AI-assisted workflows connect sourcing, outreach, availability checks, follow-ups, and client coordination for contract staffing agencies?",
} as const;

export const DIFFERENCES = [
  {
    title: "Timing considerations",
    detail:
      "A candidate may be suitable for a role but unavailable until an existing assignment ends. A client may have a defined start date.",
  },
  {
    title: "Assignment constraints",
    detail:
      "A contract may require a particular duration, location, or work arrangement. These details affect whether an opportunity is relevant at a particular time.",
  },
  {
    title: "Availability is a moving target",
    detail:
      "Historical suitability does not guarantee current availability. When candidate availability is tracked inconsistently, teams may spend time contacting people who cannot proceed.",
  },
] as const;

export const DEFINITION_POINTS = [
  {
    title: "What it supports",
    detail:
      "AI-assisted software workflows may support candidate outreach, availability checks, response organization, follow-up coordination, and interview operations.",
  },
  {
    title: "What an agentic workflow may do",
    detail:
      "An agentic workflow may interpret relevant events and coordinate permitted next actions — a candidate available next month requires different handling from someone who can begin immediately.",
  },
  {
    title: "What it must not do",
    detail:
      "Automation should not promise candidate availability, make unsupported qualification judgments, or independently confirm contractual terms.",
  },
  {
    title: "What the value is",
    detail:
      "The value lies in connecting recurring contract recruitment activities into structured workflows that help recruiters manage changing candidate and assignment information.",
  },
] as const;

export const AVAILABILITY_SIGNALS = [
  {
    title: "Historical vs current",
    detail:
      "A candidate database may contain accurate historical experience but outdated availability information. Contract recruiters need to know whether candidates are interested in a specific assignment now.",
  },
  {
    title: "Timing expectations",
    detail:
      "They may also need to understand when a candidate expects to complete an existing commitment. That information can change over time.",
  },
  {
    title: "Structured refresh",
    detail:
      "A structured engagement workflow helps recruiters refresh relevant details rather than rely entirely on older records.",
  },
  {
    title: "Confirmation, not guarantee",
    detail:
      "Candidate availability should be treated as information requiring confirmation, not an automatic guarantee.",
  },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the assignment",
    detail:
      "Document the approved role, essential qualifications, location, duration, and expected start date.",
  },
  {
    stage: "02",
    title: "Review relevant candidates",
    detail:
      "Identify potentially suitable candidates through approved sourcing and database processes.",
  },
  {
    stage: "03",
    title: "Confirm current interest",
    detail:
      "Use appropriate communication to understand whether the opportunity is relevant.",
  },
  {
    stage: "04",
    title: "Gather availability information",
    detail:
      "Ask role-specific questions about timing and assignment preferences.",
  },
  {
    stage: "05",
    title: "Organize candidate responses",
    detail:
      "Distinguish available candidates, later availability, information requests, and declines.",
  },
  {
    stage: "06",
    title: "Route for recruiter review",
    detail:
      "Provide relevant context for human assessment and client submission decisions.",
  },
  {
    stage: "07",
    title: "Coordinate interviews and next steps",
    detail:
      "Support approved scheduling and follow-up activities where connected systems permit.",
  },
] as const;

export const AGENTIC_EVENTS = [
  {
    event: "Assignment start date revised",
    detail:
      "A client may revise the assignment start date. An agentic workflow can be designed to identify this event and coordinate appropriate next steps.",
  },
  {
    event: "Candidate extends existing contract",
    detail:
      "A candidate may extend an existing contract. The workflow should refresh availability information and route the candidate for updated review.",
  },
  {
    event: "Interview needs rescheduling",
    detail:
      "An interview may need to be rescheduled. The workflow should coordinate the rescheduling through approved systems where connected systems permit.",
  },
] as const;

export const OVERSIGHT_CHECKPOINTS = [
  {
    title: "Assignment terms",
    detail:
      "Contract duration, location, and work arrangement should be verified by recruiters — not independently confirmed by automation.",
  },
  {
    title: "Candidate qualification",
    detail:
      "Qualification judgments and client submission decisions remain under human control.",
  },
  {
    title: "Contractual decisions",
    detail:
      "Contractual terms and consequential hiring decisions require appropriate human review and authorization.",
  },
  {
    title: "Candidate relationships",
    detail:
      "Automation should not create repeated unwanted contact or pressure candidates to accept unsuitable assignments.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Recruiting Automation for Recruitment Agencies", href: "/recruitment-agency-automation" },
  { label: "AI Candidate Re-Engagement Automation", href: "/us/ai-candidate-re-engagement" },
  { label: "AI Recruiting Workflow Orchestration", href: "/us/ai-recruiting-workflow-orchestration" },
] as const;

export const AI_CONTRACT_STAFFING_AUTOMATION_FAQS = [
  {
    question: "What is AI contract staffing automation?",
    answer:
      "It uses AI-assisted workflows to support recurring contract recruitment activities such as candidate engagement, availability checks, and interview coordination.",
  },
  {
    question: "Can AI help recruiters track contract candidate availability?",
    answer:
      "Software workflows may help organize availability-related responses, but candidate availability should be confirmed and reviewed appropriately.",
  },
  {
    question: "How is contract staffing automation different from permanent recruitment automation?",
    answer:
      "Contract staffing often places greater emphasis on assignment timing, duration, and current candidate availability.",
  },
  {
    question: "Can AI automate contract staffing decisions?",
    answer:
      "AI should not independently make consequential hiring or contractual decisions without appropriate human review and authorization.",
  },
] as const;