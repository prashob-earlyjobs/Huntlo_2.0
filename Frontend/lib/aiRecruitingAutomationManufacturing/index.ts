import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_AUTOMATION_MANUFACTURING_PATH =
  "/us/ai-recruiting-automation-manufacturing";

export const AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO = {
  title: "AI Recruiting Automation for Manufacturing Hiring | Huntlo",
  description:
    "Explore AI recruiting workflows for manufacturing employers managing plant-level hiring, candidate engagement, screening coordination, and interviews.",
  ogTitle: "Your Production Schedule Moves Fast. Your Hiring Workflow Should Keep Up.",
  ogDescription:
    "AI recruiting automation for manufacturing helps organizations design coordinated recruitment workflows around plant-level hiring requirements, candidate communication, and operational handoffs.",
} as const;

export function aiRecruitingAutomationManufacturingMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO.title,
    description: AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO.description,
    ogTitle: AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO.ogTitle,
    ogDescription: AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_AUTOMATION_MANUFACTURING_PATH,
  });
}

export const AI_RECRUITING_AUTOMATION_MANUFACTURING_GEO = {
  askTopic: "Huntlo AI recruiting automation for manufacturing hiring",
  askPrompt:
    "What is AI recruiting automation for manufacturing hiring on Huntlo at /us/ai-recruiting-automation-manufacturing (https://www.huntlo.ai/us/ai-recruiting-automation-manufacturing)? How do AI-assisted workflows support plant-level hiring, candidate engagement, screening coordination, and interview scheduling?",
} as const;

export const MANUFACTURING_HIRING_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Requirement intake",
    detail:
      "Document the facility, role, shift expectations, essential qualifications, and approved screening criteria.",
  },
  {
    stage: "02",
    title: "Candidate engagement",
    detail:
      "Communicate the opportunity through appropriate channels and provide relevant role information.",
  },
  {
    stage: "03",
    title: "Response management",
    detail:
      "Organize candidate interest, availability questions, location concerns, and requests for clarification.",
  },
  {
    stage: "04",
    title: "Recruiter review",
    detail:
      "Present relevant information for human assessment of the candidate's next step.",
  },
  {
    stage: "05",
    title: "Interview coordination",
    detail:
      "Support scheduling and communication with plant hiring managers where permitted by connected systems.",
  },
  {
    stage: "06",
    title: "Exception handling",
    detail:
      "Identify unresolved questions, changes in availability, and situations requiring personal intervention.",
  },
  {
    stage: "07",
    title: "Operational visibility",
    detail:
      "Help recruitment teams understand which activities remain pending across facilities.",
  },
] as const;

export const MANUFACTURING_HIRING_INTERNAL_LINKS = [
  {
    label: "AI Recruiting Automation for Multi-Location Hiring",
    href: "/us/ai-recruiting-automation-multi-location",
  },
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  { label: "AI Recruiting Agents", href: "/us/ai-recruiting-agents" },
] as const;

export const AI_RECRUITING_AUTOMATION_MANUFACTURING_FAQS = [
  {
    question: "What is AI manufacturing recruiting automation?",
    answer:
      "It uses AI-assisted software workflows to support recurring manufacturing recruitment activities, including candidate engagement, response handling, and interview coordination.",
  },
  {
    question: "Can AI support recruitment across multiple plants?",
    answer:
      "It may support multi-facility workflows when the implementation includes appropriate location rules, permissions, and operational visibility.",
  },
  {
    question: "Can AI verify technical qualifications automatically?",
    answer:
      "Technical qualifications and certifications require appropriate verification. Automated outputs should not replace authoritative checks or human accountability.",
  },
  {
    question: "How can manufacturing recruiters begin using automation?",
    answer:
      "Start with a repeatable process that has clear requirements, frequent handoffs, and defined human review points.",
  },
] as const;