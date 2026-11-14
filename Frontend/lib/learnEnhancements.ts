import type { ProductSurface } from "@/lib/productSurfaceTypes";
import {
  AGENT_ACTIVITY_SURFACE,
  AUTONOMOUS_RULE_SURFACE,
  CAPABILITY_SURFACES,
  INFRASTRUCTURE_ARCHITECTURE_SURFACE,
  SHARED_CONTEXT_SURFACE,
} from "@/lib/productSurfaces";

export type LearnProductView = {
  title: string;
  intro: string;
  points: string[];
  surface: ProductSurface;
  link: { label: string; href: string };
};

/** How each guide's concept appears in Huntlo, kept apart from the vendor-neutral definition. */
export const LEARN_PRODUCT_VIEWS: Record<string, LearnProductView> = {
  "what-is-ai-hiring-intelligence": {
    title: "How AI hiring intelligence looks in Huntlo",
    intro:
      "Huntlo implements the concept as a layered system: channels feed AI agents, agents work from one shared hiring context, and recruiter controls govern what they may do.",
    points: [
      "Channels, agents and context sit in one layer",
      "Recruiter controls sit above every agent",
      "Your ATS stays the system of record",
    ],
    surface: INFRASTRUCTURE_ARCHITECTURE_SURFACE,
    link: { label: "AI Hiring Intelligence Infrastructure", href: "/ai-hiring-infrastructure" },
  },
  "what-is-agentic-hiring": {
    title: "How agentic hiring looks in Huntlo",
    intro:
      "In Huntlo, agentic hiring shows up as an activity log: agents act on candidate events within an approved campaign, and request recruiter review before decisions.",
    points: [
      "Agents act on events as they happen",
      "Campaigns are recruiter-approved",
      "Decisions wait for a recruiter",
    ],
    surface: AGENT_ACTIVITY_SURFACE,
    link: { label: "Agentic Hiring", href: "/agentic-hiring" },
  },
  "what-are-ai-recruiting-agents": {
    title: "How AI recruiting agents are governed in Huntlo",
    intro:
      "Huntlo agents run from rules a recruiter writes: a trigger, a condition, an action, a review gate and a named owner, with every run logged.",
    points: [
      "Each agent action follows a written rule",
      "Review gates before shortlist decisions",
      "An execution log for every run",
    ],
    surface: AUTONOMOUS_RULE_SURFACE,
    link: { label: "Autonomous Recruiting", href: "/autonomous-recruiting" },
  },
  "what-is-candidate-intelligence": {
    title: "How candidate intelligence looks in Huntlo",
    intro:
      "Huntlo presents candidate intelligence as a match rationale: why a candidate ranks where they do across skills, seniority, domain and trajectory, with gaps flagged for screening.",
    points: [
      "Reasons, not just a score",
      "Gaps flagged for the recruiter to probe",
      "The recruiter decides who is shortlisted",
    ],
    surface: CAPABILITY_SURFACES["ai-candidate-matching"],
    link: { label: "AI Candidate Matching", href: "/capabilities/ai-candidate-matching" },
  },
  "conversation-intelligence-recruitment": {
    title: "How conversation intelligence looks in Huntlo",
    intro:
      "In Huntlo, a preliminary voice screen produces a transcript, a rubric of configured criteria and a summary that goes to the recruiter.",
    points: [
      "Transcript kept with the candidate record",
      "Answers mapped to configured criteria",
      "Summary routed to the recruiter for a decision",
    ],
    surface: CAPABILITY_SURFACES["ai-voice-interviews"],
    link: { label: "AI Voice Interviews", href: "/capabilities/ai-voice-interviews" },
  },
  "ai-hiring-orchestration": {
    title: "How orchestration looks in Huntlo",
    intro:
      "Huntlo orchestrates work with trigger and action rules that connect stages, such as a reply that starts a screen and a passed screen that offers interview slots.",
    points: [
      "Candidate events trigger the next step",
      "Recruiter approval built into the flow",
      "Every automated step is auditable",
    ],
    surface: CAPABILITY_SURFACES["recruitment-workflow-automation"],
    link: { label: "Recruitment Workflow Automation", href: "/capabilities/recruitment-workflow-automation" },
  },
  "ai-hiring-vs-ats": {
    title: "How Huntlo works alongside an ATS",
    intro:
      "Huntlo keeps one shared candidate record that agents and recruiters both act on, while your ATS remains the system of record for requisitions and offers.",
    points: [
      "One record across discovery, outreach and screening",
      "Agent and recruiter actions on one timeline",
      "Runs alongside your existing ATS",
    ],
    surface: SHARED_CONTEXT_SURFACE,
    link: { label: "AI hiring operating system", href: "/hiring-os" },
  },
};

export const LEARN_EDITORIAL_STANDARDS = [
  {
    icon: "short_text",
    title: "Answer first",
    body: "Every guide opens with a short, self-contained definition you can quote.",
  },
  {
    icon: "balance",
    title: "Vendor-neutral definitions",
    body: "Concepts are explained independently of any product. Each guide says whether a term is an industry concept or a Huntlo name, and labels Huntlo examples separately.",
  },
  {
    icon: "report",
    title: "Limitations stated",
    body: "Each guide lists what the approach cannot do and the misconceptions to avoid.",
  },
  {
    icon: "menu_book",
    title: "Sources and review dates",
    body: "External references are cited, and every guide shows when it was last reviewed.",
  },
] as const;

export const LEARN_HUB_FAQS = [
  {
    question: "What is the Huntlo Knowledge Centre?",
    answer:
      "A set of plain-language guides to the core concepts in AI-assisted hiring, including AI hiring intelligence, agentic hiring, AI recruiting agents, candidate and conversation intelligence, orchestration, and how AI hiring platforms differ from an ATS.",
  },
  {
    question: "Are the guides about Huntlo?",
    answer:
      "The definitions are vendor-neutral. Several of these terms, such as agentic hiring, are used across the recruiting industry, and Huntlo uses trademarked names like Agentic Hiring™ only for its own implementation. Each guide says which is which and shows Huntlo's approach in a separate, clearly labelled section.",
  },
  {
    question: "Where should I start?",
    answer:
      "Start with “What Is AI Hiring Intelligence?”, then follow the reading path: candidate and conversation intelligence, AI recruiting agents, agentic hiring, orchestration, and finally AI hiring versus a traditional ATS.",
  },
  {
    question: "How current are the guides?",
    answer:
      "Every guide shows its first-published and last-updated dates, and lists the external sources it references, such as the EU AI Act and the NIST AI Risk Management Framework.",
  },
] as const;
