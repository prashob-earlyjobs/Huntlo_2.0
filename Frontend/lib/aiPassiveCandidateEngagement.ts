import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_PASSIVE_CANDIDATE_ENGAGEMENT_PATH = "/us/ai-passive-candidate-engagement";

export const AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO = {
  title: "AI Passive Candidate Engagement Software | Huntlo",
  description:
    "Engage passive talent with personalized AI outreach, reply handling, and recruiter-led follow-up—so warm prospects don’t go cold between touches.",
  ogTitle: "The Best Candidate for Your Next Role May Not Be Looking for a Job.",
  ogDescription:
    "AI-assisted passive candidate engagement workflows that help recruiters identify relevant professionals, prepare contextual outreach, and coordinate thoughtful follow-up.",
} as const;

export function aiPassiveCandidateEngagementMetadata() {
  return buildPageMetadata({
    title: AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO.title,
    description: AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO.description,
    ogTitle: AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO.ogTitle,
    ogDescription: AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_PASSIVE_CANDIDATE_ENGAGEMENT_PATH,
  });
}

export const AI_PASSIVE_CANDIDATE_ENGAGEMENT_GEO = {
  askTopic: "Huntlo AI passive candidate engagement software",
  askPrompt:
    "What is AI passive candidate engagement on Huntlo at /us/ai-passive-candidate-engagement (https://www.huntlo.ai/us/ai-passive-candidate-engagement)? How do AI-assisted workflows support outreach preparation, response organization, and follow-up coordination for professionals who are not actively seeking work?",
} as const;

export const COMPARISON_ROWS = [
  {
    label: "Interest signal",
    active: "Already applied — demonstrated interest",
    passive: "Not currently looking — relevance must be established first",
  },
  {
    label: "First contact",
    active: "Acknowledges an existing application",
    passive: "Explains why the opportunity may be relevant to the individual",
  },
  {
    label: "Expectation",
    active: "Candidate expects a recruiting conversation",
    passive: "Candidate may not expect contact at all",
  },
  {
    label: "Failure mode",
    active: "Generic rejection or slow response",
    passive: "Irrelevant or repeated outreach damages the relationship",
  },
] as const;

export const DEFINITION_POINTS = [
  {
    title: "What it supports",
    detail:
      "AI-assisted software may support selected activities such as outreach preparation, communication coordination, response organization, and follow-up management.",
  },
  {
    title: "What an agentic workflow may do",
    detail:
      "An agentic workflow may be designed to interpret candidate responses and identify the next permitted action — a candidate requesting information is different from one requesting later contact or declining.",
  },
  {
    title: "What it must not do",
    detail:
      "Automation should not invent answers, misrepresent an opportunity, or continue contacting someone who has declined. A decline should remove the candidate from active follow-up.",
  },
  {
    title: "What the value is",
    detail:
      "The value lies in treating these conversations as meaningful interactions rather than simple campaign events.",
  },
] as const;

export const PERSONALIZATION_PRINCIPLES = [
  {
    title: "Not just a first name",
    detail:
      "Adding a candidate's first name to an outreach template is not meaningful personalization. A relevant message should be grounded in the role and the candidate's professional background.",
  },
  {
    title: "Relevance before assumptions",
    detail:
      "Recruiters should understand which aspects of the opportunity may be relevant and avoid making unsupported assumptions about career interests.",
  },
  {
    title: "AI assists, recruiters decide",
    detail:
      "AI-assisted workflows can help organize outreach preparation, but recruiters should remain responsible for reviewing sensitive or high-value communications.",
  },
  {
    title: "Relevance, accuracy, respect",
    detail:
      "The quality of the candidate experience depends on relevance, accuracy, and respect — not on message volume.",
  },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the talent requirement",
    detail:
      "Document the role, essential qualifications, and relevant candidate criteria.",
  },
  {
    stage: "02",
    title: "Identify potentially relevant professionals",
    detail:
      "Use approved sourcing processes and appropriate data sources.",
  },
  {
    stage: "03",
    title: "Review outreach suitability",
    detail:
      "Consider data accuracy, contact permissions, relevance, and communication preferences.",
  },
  {
    stage: "04",
    title: "Prepare contextual outreach",
    detail:
      "Explain the opportunity clearly and avoid exaggerated claims.",
  },
  {
    stage: "05",
    title: "Organize candidate responses",
    detail:
      "Distinguish interest, information requests, later-contact preferences, and declines.",
  },
  {
    stage: "06",
    title: "Coordinate appropriate follow-up",
    detail:
      "Use approved workflows while maintaining recruiter oversight.",
  },
  {
    stage: "07",
    title: "Preserve relationship context",
    detail:
      "Maintain useful information about the conversation in accordance with applicable privacy and retention requirements.",
  },
] as const;

export const AGENTIC_SITUATIONS = [
  {
    situation: "Remote work question",
    detail:
      "A candidate may ask whether the role offers remote work. Agentic workflow concepts can help coordinate the answer — but automation should not invent answers.",
  },
  {
    situation: "Timing request",
    detail:
      "Another may request a conversation after completing a major project. The workflow should respect that timing and schedule appropriately.",
  },
  {
    situation: "Seniority clarification",
    detail:
      "A third may be interested but need clarification about the seniority of the position. A human recruiter should remain available for nuance.",
  },
] as const;

export const QUALITY_SIGNALS = [
  {
    title: "Relevance",
    detail:
      "Messages are grounded in the candidate's background and the opportunity — not generic templates.",
  },
  {
    title: "Understanding",
    detail:
      "Candidates understand the opportunity, the organization, and what happens next.",
  },
  {
    title: "Appropriate progression",
    detail:
      "Conversations progress appropriately — interest routes to screening, declines end contact.",
  },
  {
    title: "No unnecessary friction",
    detail:
      "The goal is a process that helps recruiters establish worthwhile conversations without unnecessary administrative friction.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Candidate Re-Engagement Automation", href: "/us/ai-candidate-re-engagement" },
  { label: "AI Recruiting Agents", href: "/us/ai-recruiting-agents" },
  { label: "Automated Candidate Follow-Up", href: "/automated-candidate-follow-up" },
] as const;

export const AI_PASSIVE_CANDIDATE_ENGAGEMENT_FAQS = [
  {
    question: "What is passive candidate engagement?",
    answer:
      "Passive candidate engagement involves building relevant recruitment conversations with professionals who are not actively applying for new jobs.",
  },
  {
    question: "How can AI support passive candidate outreach?",
    answer:
      "AI-assisted workflows may help with outreach preparation, response organization, and follow-up coordination, depending on verified software capabilities.",
  },
  {
    question: "Is automated outreach appropriate for passive candidates?",
    answer:
      "It requires careful attention to relevance, applicable communication requirements, contact preferences, and respectful follow-up practices.",
  },
  {
    question: "How is passive candidate engagement different from candidate re-engagement?",
    answer:
      "Passive engagement focuses on professionals who may not have previously interacted with the organization. Re-engagement focuses on renewing conversations with existing candidates or talent pool members.",
  },
] as const;