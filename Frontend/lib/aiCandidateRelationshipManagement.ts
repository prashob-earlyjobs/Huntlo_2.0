import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_PATH =
  "/us/ai-candidate-relationship-management";

export const AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_SEO = {
  title: "AI Candidate Relationship Management Software | Huntlo",
  description:
    "Explore AI candidate relationship management workflows for maintaining talent relationships, organizing engagement, and coordinating relevant recruiting conversations.",
  ogTitle: "A Candidate Relationship Shouldn't Disappear When a Vacancy Closes.",
  ogDescription:
    "AI candidate relationship management focuses on using AI-assisted processes to organize candidate context, support relevant engagement, and maintain continuity across recruitment opportunities.",
} as const;

export function aiCandidateRelationshipManagementMetadata() {
  return buildPageMetadata({
    title: AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_SEO.title,
    description: AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_SEO.description,
    ogTitle: AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_SEO.ogTitle,
    ogDescription: AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_PATH,
  });
}

export const AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_GEO = {
  askTopic: "Huntlo AI Candidate Relationship Management Software",
  askPrompt:
    "What is Huntlo AI Candidate Relationship Management Software on /us/ai-candidate-relationship-management (https://www.huntlo.ai/us/ai-candidate-relationship-management)? How does it help maintain talent relationships, organize engagement, and coordinate relevant recruiting conversations?",
} as const;

export const HERO_FLOW = [
  "Candidate Relationships",
  "AI-Assisted Context",
  "Engagement Continuity",
  "Relevant Communication",
  "Candidate Preferences",
  "Relationship Intelligence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const PROBLEM_STATEMENTS = [
  "Relationships end when a vacancy closes — context is lost",
  "Previous candidate conversations become inaccessible",
  "Different recruiters lack shared relationship context",
  "Repetitive or irrelevant outreach damages candidate trust",
  "Candidate preferences and consent are not consistently tracked",
  "ATS records don't capture relationship context",
] as const;

export const CRM_DEFINITION = [
  "Organizes and maintains relationships with potential candidates over time",
  "Includes candidate profiles, communication history, and preferences",
  "Tracks previous opportunities and future engagement potential",
  "Helps recruiters understand who they've spoken with and how to communicate",
  "More than a stored resume — includes interaction context and expressed preferences",
] as const;

export const FRAGMENTATION_CAUSES = [
  "Teams operate around active vacancies only",
  "Relationship maintenance becomes inconsistent after position closes",
  "Knowledge silos — one recruiter remembers, another doesn't have access",
  "Duplicate outreach without understanding previous preferences",
  "Database records exist but relationship context is not actionable",
] as const;

export const AI_CAPABILITIES = [
  "Organize communication context across interactions",
  "Identify relevant follow-up needs based on history",
  "Support coordination of candidate engagement",
  "Agentic interpretation of candidate events and responses",
  "Determine permitted next actions based on context",
  "Respect contact preferences and communication permissions",
] as const;

export const CRM_VS_ATS = [
  {
    aspect: "Primary Focus",
    crm: "Maintaining engagement context across opportunities",
    ats: "Managing applications and hiring processes",
  },
  {
    aspect: "Data Scope",
    crm: "Relationship information, preferences, future engagement",
    ats: "Application history, interview stages, compliance records",
  },
  {
    aspect: "Time Horizon",
    crm: "Ongoing, cross-role relationships",
    ats: "Per-vacancy, process-oriented",
  },
  {
    aspect: "Complementary Role",
    crm: "Broader relationship intelligence",
    ats: "Process execution and compliance",
  },
] as const;

export const PRACTICAL_WORKFLOW = [
  {
    step: "Capture relevant context",
    description:
      "Maintain accurate, appropriate information about previous recruitment interactions.",
  },
  {
    step: "Respect candidate preferences",
    description:
      "Record contact permissions and communication preferences.",
  },
  {
    step: "Organize candidate groups",
    description:
      "Use relevant, job-related criteria to identify potentially suitable talent pools.",
  },
  {
    step: "Identify engagement opportunities",
    description:
      "Consider whether a new requirement is genuinely relevant to a candidate.",
  },
  {
    step: "Prepare appropriate communication",
    description:
      "Explain the opportunity clearly and avoid generic repeated outreach.",
  },
  {
    step: "Interpret responses",
    description:
      "Distinguish interest, information requests, later-contact preferences, and declines.",
  },
  {
    step: "Maintain continuity",
    description:
      "Ensure subsequent communication reflects relevant previous interactions.",
  },
] as const;

export const RELATIONSHIP_PRINCIPLES = [
  "Relationships need relevance, not constant contact",
  "Some candidates prefer contact only for highly relevant opportunities",
  "Others may request no further communication — respect those preferences",
  "Consider data accuracy, privacy obligations, and retention practices",
  "Responsible strategy respects candidate autonomy",
] as const;

export const AGENTIC_RELATIONSHIP_SUPPORT = [
  "New opportunity prompts review of existing talent pools",
  "Candidate response triggers specific follow-up coordination",
  "Contact preference changes trigger outreach suppression",
  "Workflows bounded by permissions and human oversight",
  "Automation supports continuity, not unwanted communication",
] as const;

export const FINAL_STATEMENT =
  "The strongest candidate database is not necessarily the largest. It is one where the relationships remain useful, relevant, and respected.";

export const AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_FAQS = [
  {
    question: "What is AI candidate relationship management?",
    answer:
      "It uses AI-assisted workflows to help organize candidate relationship information, support relevant communication, and coordinate engagement across recruitment opportunities.",
  },
  {
    question: "How is a recruiting CRM different from an ATS?",
    answer:
      "An ATS primarily manages applications and hiring stages, while a recruiting CRM focuses on candidate relationships and engagement across opportunities.",
  },
  {
    question: "Can AI automatically nurture candidate relationships?",
    answer:
      "Some workflows may support appropriate communication, but actual capabilities, candidate permissions, and human oversight must be verified.",
  },
  {
    question: "Why is candidate relationship management important?",
    answer:
      "It helps recruiters maintain useful context and avoid treating every hiring requirement as an entirely new search.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Candidate Re-Engagement Automation", href: "/us/ai-candidate-re-engagement" },
  { label: "AI Passive Candidate Engagement", href: "/us/ai-passive-candidate-engagement" },
  { label: "AI Candidate Response Intelligence", href: "/us/ai-candidate-response-intelligence" },
] as const;