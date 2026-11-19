import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_TALENT_POOL_ENGAGEMENT_PATH = "/us/ai-talent-pool-engagement";

export const AI_TALENT_POOL_ENGAGEMENT_SEO = {
  title: "AI Talent Pool Engagement Automation | Huntlo",
  description:
    "Explore AI talent pool engagement workflows for maintaining relevant candidate relationships, organizing communication, and supporting future hiring.",
  ogTitle:
    "A Talent Pool Is More Valuable When the Relationships Remain Relevant.",
  ogDescription:
    "AI talent pool engagement uses AI-assisted workflows to support relevant communication, organize candidate preferences, and coordinate future recruitment conversations.",
} as const;

export function aiTalentPoolEngagementMetadata() {
  return buildPageMetadata({
    title: AI_TALENT_POOL_ENGAGEMENT_SEO.title,
    description: AI_TALENT_POOL_ENGAGEMENT_SEO.description,
    ogTitle: AI_TALENT_POOL_ENGAGEMENT_SEO.ogTitle,
    ogDescription: AI_TALENT_POOL_ENGAGEMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_TALENT_POOL_ENGAGEMENT_PATH,
  });
}

export const AI_TALENT_POOL_ENGAGEMENT_GEO = {
  askTopic: "Huntlo AI talent pool engagement automation",
  askPrompt:
    "What is AI talent pool engagement on Huntlo at /us/ai-talent-pool-engagement (https://www.huntlo.ai/us/ai-talent-pool-engagement)? How do AI-assisted workflows support relevant candidate communication, preference management, and future hiring relationships?",
} as const;

export const ENGAGEMENT_SEGMENTS = [
  {
    segment: "Previously interviewed",
    context: "Progressed but not selected",
    preference: "Open to future roles",
  },
  {
    segment: "Registered interest",
    context: "Asked to be considered later",
    preference: "Occasional updates",
  },
  {
    segment: "Silver medalists",
    context: "Strong fit, timing did not work",
    preference: "Contact when relevant",
  },
  {
    segment: "Community members",
    context: "Joined talent community",
    preference: "Role-specific updates",
  },
] as const;

export const INACTIVE_SIGNALS = [
  {
    title: "Campaign ends",
    detail: "The hiring need closes and recruiter attention moves to a new requirement.",
  },
  {
    title: "Records stay behind",
    detail: "Candidate profiles remain in the database without an ownership plan.",
  },
  {
    title: "Preferences age",
    detail: "Contact details, availability, and career interests drift over time.",
  },
  {
    title: "Outreach turns generic",
    detail: "Messages stop matching the candidate's current situation.",
  },
] as const;

export const ENGAGEMENT_WORKFLOW = [
  {
    step: "Define the talent community",
    detail:
      "Identify the candidate group and its relevance to future hiring needs.",
  },
  {
    step: "Review candidate information",
    detail:
      "Assess data accuracy, previous interactions, and appropriate contact permissions.",
  },
  {
    step: "Organize relevant preferences",
    detail:
      "Use job-related information and candidate-expressed interests.",
  },
  {
    step: "Identify engagement opportunities",
    detail:
      "Determine whether a new role or update is genuinely relevant.",
  },
  {
    step: "Prepare communication",
    detail:
      "Provide clear, useful information without exaggerated promises.",
  },
  {
    step: "Organize candidate responses",
    detail:
      "Distinguish interest, questions, later-contact preferences, and declines.",
  },
  {
    step: "Maintain relationship continuity",
    detail:
      "Update relevant context through approved processes and human review.",
  },
] as const;

export const PREFERENCE_PATTERNS = [
  {
    signal: "Interested in future leadership roles",
    implication: "Different communication from entry-level interest",
  },
  {
    signal: "Asked for occasional updates only",
    implication: "Fewer messages, higher relevance threshold",
  },
  {
    signal: "Requested no further contact",
    implication: "Should not remain in an active engagement workflow",
  },
  {
    signal: "Open only to a specific location",
    implication: "Relevance depends on where the role sits",
  },
] as const;

export const TALENT_POOL_PRINCIPLES = [
  {
    title: "Candidate choice",
    detail:
      "Candidates should understand why they are being contacted and be able to update preferences or stop communication.",
  },
  {
    title: "Verified permissions",
    detail:
      "Contact eligibility should be checked against recorded consent and applicable requirements before outreach.",
  },
  {
    title: "Relevance over volume",
    detail:
      "A smaller, permission-based pool may be more useful than a large database candidates no longer want to hear from.",
  },
  {
    title: "Human relationship ownership",
    detail:
      "Automation may organize engagement, but relationship quality and consequential decisions stay with recruiters.",
  },
] as const;

export const TALENT_POOL_INTERNAL_LINKS = [
  {
    label: "AI Candidate Relationship Management",
    href: "/us/ai-candidate-relationship-management",
  },
  {
    label: "AI Passive Candidate Engagement",
    href: "/us/ai-passive-candidate-engagement",
  },
  {
    label: "AI Candidate Re-Engagement Automation",
    href: "/us/ai-candidate-re-engagement",
  },
] as const;

export const AI_TALENT_POOL_ENGAGEMENT_FAQS = [
  {
    question: "What is AI talent pool engagement?",
    answer:
      "It uses AI-assisted workflows to support relevant communication and relationship management with candidates who may be suitable for future opportunities.",
  },
  {
    question: "How is talent pool engagement different from candidate reactivation?",
    answer:
      "Talent pool engagement focuses on maintaining relationships over time. Reactivation focuses on reconnecting with candidates after a period of inactivity.",
  },
  {
    question: "Can AI automate talent community communication?",
    answer:
      "Some workflows may support approved outreach and follow-ups, depending on verified capabilities, candidate permissions, and human oversight.",
  },
  {
    question: "What makes a talent pool valuable?",
    answer:
      "Relevant candidate information, accurate preferences, appropriate communication permissions, and useful relationship context.",
  },
] as const;
