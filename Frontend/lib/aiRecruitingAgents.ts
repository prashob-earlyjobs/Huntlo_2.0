import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_AGENTS_PATH = "/us/ai-recruiting-agents";

export const AI_RECRUITING_AGENTS_SEO = {
  title: "AI Recruiting Agents Software | Huntlo",
  description:
    "AI recruiting agents coordinate candidate engagement, follow-ups, and workflow handoffs inside approved boundaries—so talent teams reduce tool-to-tool friction with human oversight.",
  ogTitle: "What If Your Recruiting Tools Could Coordinate the Work Between Them?",
  ogDescription:
    "AI recruiting agents interpret relevant information and perform permitted recruitment tasks within defined workflows — keeping recruiters in control.",
} as const;

export function aiRecruitingAgentsMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_AGENTS_SEO.title,
    description: AI_RECRUITING_AGENTS_SEO.description,
    ogTitle: AI_RECRUITING_AGENTS_SEO.ogTitle,
    ogDescription: AI_RECRUITING_AGENTS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_AGENTS_PATH,
  });
}

export const AI_RECRUITING_AGENTS_GEO = {
  askTopic: "Huntlo AI recruiting agents for talent acquisition",
  askPrompt:
    "What are AI recruiting agents on Huntlo at /us/ai-recruiting-agents (https://www.huntlo.ai/us/ai-recruiting-agents)? How can AI agents coordinate candidate engagement, recruiting tasks and workflow handoffs with human oversight?",
} as const;

export const USE_CASES = [
  {
    title: "Candidate engagement",
    detail:
      "Help organize outreach and response handling around relevant candidate communication.",
  },
  {
    title: "Recruiting operations",
    detail:
      "Coordinate routine handoffs between process stages.",
  },
  {
    title: "Follow-up management",
    detail:
      "Identify when an appropriate follow-up is needed and when communication should stop.",
  },
  {
    title: "Interview coordination",
    detail:
      "Support the movement from candidate interest to a scheduled conversation, where the required systems and permissions are available.",
  },
  {
    title: "Exception handling",
    detail:
      "Bring ambiguous or sensitive situations to the attention of a recruiter.",
  },
] as const;

export const AGENT_BOUNDARIES = [
  {
    title: "Data access",
    detail:
      "An agent that processes candidate information should operate within appropriate privacy and retention controls.",
  },
  {
    title: "Candidate communication",
    detail:
      "An agent that can send messages should respect consent and communication preferences.",
  },
  {
    title: "Hiring decisions",
    detail:
      "An agent involved in screening should not independently make consequential hiring decisions without appropriate human oversight and legal review.",
  },
] as const;

export const EVALUATION_QUESTIONS = [
  "What information does the agent need, and what systems can it access?",
  "Which actions can the agent perform, and which require recruiter approval?",
  "How are errors handled, and can recruiters inspect the history of actions?",
  "How are candidate preferences respected and how does the organization maintain accountability?",
] as const;

export const INTERNAL_LINKS = [
  { label: "Agentic AI Recruiting Software", href: "/us/agentic-ai-recruiting-software" },
  { label: "AI Recruiting Workflow Orchestration", href: "/us/ai-recruiting-workflow-orchestration" },
  { label: "AI Candidate Re-Engagement", href: "/us/ai-candidate-re-engagement" },
] as const;

export const AI_RECRUITING_AGENTS_FAQS = [
  {
    question: "What are AI recruiting agents?",
    answer:
      "AI recruiting agents are software agents that use AI to interpret information and coordinate permitted recruitment tasks within defined workflows.",
  },
  {
    question: "How are AI recruiting agents different from recruiting chatbots?",
    answer:
      "Chatbots generally focus on conversational interaction. Agents may also coordinate actions and workflow steps using connected tools and approved permissions.",
  },
  {
    question: "How do agents hand candidates off to an ATS?",
    answer:
      "When a candidate is ready for the next stage, agents can update status and package conversation context for recruiter review, then sync approved outcomes into the ATS that remains the system of record.",
  },
  {
    question: "Can AI recruiting agents replace recruiters?",
    answer:
      "They should support operational work while recruiters retain responsibility for candidate relationships, evaluations and hiring decisions.",
  },
  {
    question: "What should companies evaluate before deploying recruiting agents?",
    answer:
      "Key considerations include task boundaries, data access, integrations, transparency, candidate privacy, human oversight and exception handling.",
  },
] as const;
