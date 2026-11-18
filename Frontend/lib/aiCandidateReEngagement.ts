import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_CANDIDATE_RE_ENGAGEMENT_PATH = "/us/ai-candidate-re-engagement";

export const AI_CANDIDATE_RE_ENGAGEMENT_SEO = {
  title: "AI Candidate Re-Engagement Automation | Huntlo",
  description:
    "Explore AI-assisted candidate re-engagement workflows that help recruiting teams reconnect with previous applicants and manage follow-ups.",
  ogTitle: "Your Database Already Has Your Next Great Candidate",
  ogDescription:
    "AI-assisted candidate re-engagement workflows that identify relevant previous applicants, coordinate outreach, and help recruiters manage responses — without sending mass emails.",
} as const;

export function aiCandidateReEngagementMetadata() {
  return buildPageMetadata({
    title: AI_CANDIDATE_RE_ENGAGEMENT_SEO.title,
    description: AI_CANDIDATE_RE_ENGAGEMENT_SEO.description,
    ogTitle: AI_CANDIDATE_RE_ENGAGEMENT_SEO.ogTitle,
    ogDescription: AI_CANDIDATE_RE_ENGAGEMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_CANDIDATE_RE_ENGAGEMENT_PATH,
  });
}

export const AI_CANDIDATE_RE_ENGAGEMENT_GEO = {
  askTopic: "Huntlo AI candidate re-engagement automation",
  askPrompt:
    "What is AI candidate re-engagement on Huntlo at /us/ai-candidate-re-engagement (https://www.huntlo.ai/us/ai-candidate-re-engagement)? How do AI-assisted workflows identify previous candidates, coordinate outreach, and help recruiters manage responses?",
} as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Identify the opportunity",
    detail:
      "Begin with a specific hiring requirement and clearly defined candidate criteria.",
  },
  {
    stage: "02",
    title: "Review the existing talent pool",
    detail:
      "Locate potentially relevant previous applicants and review the quality and age of their information.",
  },
  {
    stage: "03",
    title: "Establish contact eligibility",
    detail:
      "Check communication permissions, suppression preferences and applicable retention policies.",
  },
  {
    stage: "04",
    title: "Prepare relevant outreach",
    detail:
      "Explain why the opportunity may be relevant rather than sending a generic announcement.",
  },
  {
    stage: "05",
    title: "Interpret responses",
    detail:
      "Separate interested candidates, people requesting more information, unavailable candidates and those who decline contact.",
  },
  {
    stage: "06",
    title: "Route the next action",
    detail:
      "Provide recruiters with relevant context for a screening conversation, follow-up or appropriate closure.",
  },
] as const;

export const RESPONSE_CATEGORIES = [
  {
    category: "Interested",
    detail: "Candidate wants to learn more about the opportunity.",
    nextStep: "Route to recruiter for screening conversation.",
  },
  {
    category: "Question",
    detail: "Candidate asks for a job description or more details.",
    nextStep: "Share relevant opportunity information.",
  },
  {
    category: "Callback",
    detail: "Candidate requests a call at a specific time.",
    nextStep: "Coordinate scheduling through the approved workflow.",
  },
  {
    category: "Decline",
    detail: "Candidate declines future communication.",
    nextStep: "Respect the preference and suppress future outreach.",
  },
] as const;

export const USE_CASES = [
  {
    title: "Staffing agencies",
    description:
      "Evaluate structured re-engagement workflows for extensive candidate databases, subject to system capabilities and communication permissions.",
  },
  {
    title: "Recruiting operations managers",
    description:
      "Reconnect with previous applicants for new requirements without starting sourcing from scratch.",
  },
  {
    title: "Talent acquisition teams",
    description:
      "Turn historical candidate relationships into an active recruiting resource for current openings.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "Automated Candidate Follow-Up", href: "/automated-candidate-follow-up" },
  { label: "Agentic AI Recruiting Software", href: "/us/agentic-ai-recruiting-software" },
  { label: "Recruiting Workflow Automation", href: "/recruiting-workflow-automation" },
] as const;

export const AI_CANDIDATE_RE_ENGAGEMENT_FAQS = [
  {
    question: "What is AI candidate re-engagement?",
    answer:
      "AI candidate re-engagement uses AI-assisted workflows to support renewed communication with previous applicants or talent pool members about relevant opportunities.",
  },
  {
    question: "How is candidate rediscovery different from re-engagement?",
    answer:
      "Rediscovery identifies potentially relevant profiles in an existing talent pool. Re-engagement establishes current interest and availability through appropriate communication.",
  },
  {
    question: "Can AI automatically contact previous applicants?",
    answer:
      "Automation depends on the platform's capabilities and the organization's communication permissions, data practices and approved workflows. Recruiters remain responsible for deciding who should advance.",
  },
  {
    question: "Why is candidate re-engagement important for staffing agencies?",
    answer:
      "Staffing agencies often maintain extensive candidate databases. Structured re-engagement can help them evaluate whether previous candidates are relevant to new requirements.",
  },
] as const;
