import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const WORKFLOW_ORCHESTRATION_PATH = "/workflow-orchestration";

export const WORKFLOW_ORCHESTRATION_SEO = {
  title: "Workflow Orchestration — Intelligent Hiring Workflows | Huntlo",
  description:
    "Huntlo Workflow Orchestration connects candidate discovery, AI recruiting agents, talent intelligence, and hiring outcomes through one intelligent orchestration layer — not disconnected automation.",
  ogTitle: "The Future Of Hiring Won't Be Automated. It Will Be Orchestrated.",
  ogDescription:
    "Modern hiring isn't a sequence of tasks. It's an ecosystem of people, intelligence, decisions, and workflows. Explore Huntlo's intelligent workflow orchestration.",
} as const;

export function workflowOrchestrationMetadata() {
  return buildPageMetadata({
    title: WORKFLOW_ORCHESTRATION_SEO.title,
    description: WORKFLOW_ORCHESTRATION_SEO.description,
    ogTitle: WORKFLOW_ORCHESTRATION_SEO.ogTitle,
    ogDescription: WORKFLOW_ORCHESTRATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: WORKFLOW_ORCHESTRATION_PATH,
  });
}

export const WORKFLOW_ORCHESTRATION_GEO = {
  askTopic: "Huntlo Workflow Orchestration",
  askPrompt:
    "What is Huntlo Workflow Orchestration (https://www.huntlo.ai/workflow-orchestration)? How is workflow orchestration different from workflow automation in recruiting, and how does Huntlo coordinate AI recruiting agents and hiring outcomes?",
} as const;

export const HERO_ORCHESTRATION_NODES = [
  "Candidate Discovery",
  "AI Recruiting Agents",
  "Talent Intelligence",
  "Outreach Workflows",
  "Interview Coordination",
  "Hiring Intelligence",
  "Business Outcomes",
  "Recruiter Decisions",
  "Workflow Intelligence",
  "Enterprise Hiring",
  "Huntlo",
] as const;

export const COMPLEXITY_CHAIN = [
  "Candidate Discovery",
  "Emails",
  "WhatsApp",
  "Talent Pipelines",
  "Interview Scheduling",
  "Assessments",
  "Hiring Managers",
  "Productivity",
  "Analytics",
  "Communication",
  "Follow-ups",
  "Business Outcomes",
] as const;

export const AUTOMATION_SOLVES = [
  "Repetitive tasks",
  "Notifications",
  "Scheduling",
  "Reminders",
] as const;

export const AUTOMATION_DOESNT_SOLVE = [
  "Intelligence",
  "Context",
  "Priorities",
  "Workflow relationships",
  "Hiring outcomes",
] as const;

export const ORCHESTRATION_TRAITS = [
  "Dynamic",
  "Intelligent",
  "Adaptive",
  "Connected",
  "Context Aware",
  "Outcome Driven",
] as const;

export const UNDERSTANDS_BEFORE_NEXT = [
  "Candidate intent",
  "Recruiter priorities",
  "Business outcomes",
  "Workflow intelligence",
  "Hiring velocity",
  "Talent availability",
] as const;

export const MEET_HUNTLO_FLOW = [
  "Candidate Discovery",
  "Talent Intelligence",
  "AI Recruiting Agents",
  "Workflow Intelligence",
  "Recruiter Productivity",
  "Candidate Engagement",
  "Enterprise Hiring",
  "Business Intelligence",
  "Hiring Outcomes",
] as const;

export const LEARNING_SIGNALS = [
  "Candidate Behaviour",
  "Engagement Signals",
  "Interview Outcomes",
  "Hiring Velocity",
  "Recruiter Productivity",
  "Business Priorities",
  "Talent Pipelines",
  "Hiring Decisions",
] as const;

export const AGENT_ENSEMBLE = [
  { name: "AI Sourcing Agent", href: "/sourcing" },
  { name: "AI Outreach Agent", href: "/candidate-pool" },
  { name: "AI Screening Agent", href: "/screening" },
  { name: "AI Interview Agent", href: "/interview" },
  { name: "AI Scheduling Agent", href: "/interview" },
] as const;

export const AGENT_OUTCOMES = [
  "Workflow Intelligence",
  "Recruiter Productivity",
  "Hiring Outcomes",
] as const;

export const CANDIDATE_REMEMBERS = [
  "Responsiveness",
  "Consistency",
  "Communication",
  "Experiences",
  "Relationships",
] as const;

export const ORCHESTRATION_IMPROVES = [
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring outcomes",
] as const;

export const ENTERPRISE_MANAGES = [
  "Recruiters",
  "Workflows",
  "Candidates",
  "Stakeholders",
  "Business priorities",
  "Talent pipelines",
  "Hiring intelligence",
] as const;

export const ENTERPRISE_COORDINATES = [
  "People",
  "Processes",
  "AI",
  "Intelligence",
  "Hiring Outcomes",
] as const;

export const RECRUITER_MORE_TIME = [
  "Building relationships",
  "Making hiring decisions",
  "Understanding talent",
  "Improving candidate experiences",
] as const;

export const AI_MANAGES = [
  "Workflows",
  "Intelligence",
  "Orchestration",
  "Repetitive work",
] as const;

export const HUMANS_MANAGE = [
  "People",
  "Context",
  "Decisions",
  "Business outcomes",
] as const;

export const FUTURE_INTELLIGENCE = [
  "People",
  "Intelligence",
  "Context",
  "Priorities",
  "Business Outcomes",
  "Hiring Decisions",
  "Talent",
  "Recruiters",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Global hiring", href: "/solutions" },
  { label: "High-volume hiring", href: "/solutions" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Scalability",
  "Integrations",
  "Compliance",
  "Audit logs",
  "Workflow customization",
  "Multi-recruiter environments",
] as const;

export const WORKFLOW_ORCHESTRATION_FAQS = [
  {
    question: "What is Workflow Orchestration?",
    answer:
      "Workflow Orchestration is the intelligent coordination of people, AI systems, hiring decisions, and outcomes across recruiting — continuously adapting what should happen next based on context, priorities, and results.",
  },
  {
    question: "How is workflow orchestration different from workflow automation?",
    answer:
      "Automation completes repetitive tasks like notifications, scheduling, and reminders. Orchestration understands what happened, why it happened, and what should happen next — connecting intelligence, context, priorities, and hiring outcomes.",
  },
  {
    question: "What is Workflow Intelligence?",
    answer:
      "Workflow Intelligence is the continuous understanding of candidate signals, recruiter priorities, hiring velocity, talent availability, and business outcomes so workflows can adapt instead of running as fixed sequences.",
  },
  {
    question: "How does Huntlo orchestrate workflows?",
    answer:
      "Huntlo connects candidate discovery, talent intelligence, AI recruiting agents, engagement, recruiter productivity, and hiring outcomes through one intelligent orchestration layer — so recruiters spend less time manually coordinating disconnected processes.",
  },
  {
    question: "What role do AI Recruiting Agents play in orchestration?",
    answer:
      "AI agents operating independently create isolated automation. In Huntlo, sourcing, outreach, screening, interview, and scheduling agents collaborate through workflow intelligence to support recruiter productivity and hiring outcomes together.",
  },
  {
    question: "Can enterprises customize workflows?",
    answer:
      "Yes. Enterprise teams can adapt connected hiring flows across sourcing, engagement, screening, and interviews, with support for governance, integrations, multi-recruiter environments, and operational control.",
  },
  {
    question: "How does workflow intelligence improve productivity?",
    answer:
      "By reducing manual coordination — switching systems, stitching follow-ups, and managing fragmented processes — so recruiters spend more time on relationships, talent understanding, and hiring decisions.",
  },
  {
    question: "Can Huntlo support large recruiting teams?",
    answer:
      "Yes. Huntlo is designed for enterprise hiring teams that manage recruiters, candidates, stakeholders, pipelines, and hiring intelligence across multi-recruiter environments.",
  },
  {
    question: "Why isn't automation enough for modern hiring?",
    answer:
      "Hiring is no longer a simple sequence of tasks. It is simultaneous decisions across discovery, engagement, interviews, and outcomes. Automation can help with repetitive work, but orchestration is needed for context and connected decisions.",
  },
  {
    question: "How does orchestration improve candidate experience?",
    answer:
      "Candidates remember responsiveness, consistency, communication, experiences, and relationships — not software stacks. Orchestration helps keep those moments connected so experience quality improves alongside productivity and outcomes.",
  },
  {
    question: "What does it mean that hiring happens simultaneously?",
    answer:
      "Every action creates another workflow. Discovery, outreach, screening, stakeholder updates, and decisions often run in parallel. Orchestration coordinates that ecosystem instead of forcing everything into a rigid sequence.",
  },
  {
    question: "How is this different from a hiring workflow platform?",
    answer:
      "A workflow platform may track steps. Huntlo focuses on intelligent orchestration — connecting AI agents, talent intelligence, recruiter actions, and outcomes through one continuously adapting layer.",
  },
  {
    question: "Is Huntlo a workflow automation platform?",
    answer:
      "Huntlo includes automation where useful, but the product direction is workflow intelligence and orchestration — coordinating what should happen next across hiring, not only automating isolated tasks.",
  },
  {
    question: "What should recruiters coordinate in the future?",
    answer:
      "Recruiters should coordinate talent — relationships, decisions, context, and business outcomes — while AI helps manage workflows, intelligence, orchestration, and repetitive work.",
  },
  {
    question: "How does Huntlo support GCC and staffing orchestration needs?",
    answer:
      "GCC leaders, staffing firms, and recruitment agencies can use Huntlo to coordinate high-volume and specialized hiring workflows across discovery, engagement, screening, and interview operations.",
  },
  {
    question: "What signals do intelligent workflows learn from?",
    answer:
      "Workflows continuously learn from candidate behaviour, engagement signals, interview outcomes, hiring velocity, recruiter productivity, business priorities, talent pipelines, and hiring decisions.",
  },
  {
    question: "How does orchestration relate to Huntlo Hiring OS and Hiring Workflows?",
    answer:
      "Hiring Workflows describe the connected journey. Workflow Orchestration is how that journey is intelligently coordinated. Huntlo Hiring OS is the operating system that brings those capabilities together.",
  },
  {
    question: "Can workflow orchestration support enterprise governance?",
    answer:
      "Yes. Huntlo is designed to support enterprise governance, scalability, integrations, compliance considerations, audit logs, workflow customization, and multi-recruiter environments.",
  },
  {
    question: "What is AI workflow infrastructure in recruiting?",
    answer:
      "AI workflow infrastructure is the layer that connects agents, intelligence, and hiring operations so AI systems can collaborate with recruiters across the full hiring journey instead of running as isolated tools.",
  },
  {
    question: "Will orchestration replace recruiters?",
    answer:
      "No. Orchestration is designed so AI coordinates workflows while humans remain responsible for people, context, decisions, and business outcomes.",
  },
  {
    question: "What is the difference between purchasing workflow automation and adopting workflow intelligence?",
    answer:
      "Workflow automation buys task completion. Workflow intelligence adopts systems that continuously understand people, context, priorities, talent, and outcomes — then adapt what happens next.",
  },
  {
    question: "How do I get started with Huntlo Workflow Orchestration?",
    answer:
      "Book a demo to see orchestration in the context of your hiring operations, explore Huntlo's Hiring Workflows and Hiring OS pages, or create an account to get started.",
  },
] as const;
