import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_PATH =
  "/in/ai-voice-candidate-database-reactivation";

export const AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_SEO = {
  title: "AI Voice Candidate Database Reactivation | Huntlo",
  description:
    "Explore AI voice workflows for reconnecting with previous candidates, checking current availability, and organizing recruitment database follow-ups.",
  ogTitle: "Your Recruitment Database Is Full of Candidates. How Many Are Still Available?",
  ogDescription:
    "AI voice candidate database reactivation workflows that use structured automated conversations to reconnect with previous candidates, confirm current interest, and organize relevant responses for recruiter review.",
} as const;

export function aiVoiceCandidateDatabaseReactivationMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_SEO.title,
    description: AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_SEO.description,
    ogTitle: AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_SEO.ogTitle,
    ogDescription: AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_PATH,
  });
}

export const AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_GEO = {
  askTopic: "Huntlo AI voice candidate database reactivation",
  askPrompt:
    "What is AI voice candidate database reactivation on Huntlo at /in/ai-voice-candidate-database-reactivation (https://www.huntlo.ai/in/ai-voice-candidate-database-reactivation)? How do AI voice workflows reconnect with previous candidates, confirm current interest, and organize relevant responses for recruiter review?",
} as const;

export const OUTDATED_REASONS = [
  {
    title: "Circumstances change",
    detail:
      "A candidate may have been actively searching when the record was created. Their circumstances can change. Availability, location preferences, experience, and career interests may evolve.",
  },
  {
    title: "Historical information is not a guarantee",
    detail:
      "Even a well-maintained database cannot guarantee that historical information remains accurate. A candidate who was available three months ago may now be employed. Another may have changed location.",
  },
  {
    title: "Refresh before presenting",
    detail:
      "Recruiters need to refresh relevant details before presenting a candidate for a new opportunity. A structured reactivation process can support that work.",
  },
] as const;

export const DEFINITION_POINTS = [
  {
    title: "What it supports",
    detail:
      "AI voice candidate reactivation uses automated voice conversations to support renewed contact with previous candidates. Potential applications include interest checks, availability confirmation, location preference questions, and callback coordination.",
  },
  {
    title: "What it organizes",
    detail:
      "Depending on verified product capabilities, responses may be organized for recruiter review. The process should begin with appropriate contact eligibility checks.",
  },
  {
    title: "What it must not do",
    detail:
      "A historical candidate record does not automatically authorize unlimited future communication. The opportunity being discussed should be relevant, and candidates should have a clear way to decline further contact.",
  },
  {
    title: "What the value is",
    detail:
      "The objective is not to repeatedly contact everyone in a database. It is to make existing candidate relationships more useful through relevant and responsible communication.",
  },
] as const;

export const REACTIVATION_POINTS = [
  {
    title: "Old preferences may have changed",
    detail:
      "A candidate who previously applied for a sales role may not be interested in the same type of opportunity today. Another candidate may have gained new experience.",
  },
  {
    title: "New availability",
    detail:
      "Someone who was unavailable earlier may now be open to a conversation. A useful reactivation workflow should focus on current circumstances.",
  },
  {
    title: "Do not assume unchanged qualifications",
    detail:
      "It should not assume that old preferences or qualifications remain unchanged. The first conversation should establish whether the new opportunity is relevant.",
  },
  {
    title: "Establish relevance",
    detail:
      "The first conversation should establish whether the new opportunity is relevant and whether the candidate wants to continue.",
  },
] as const;

export const CONVERSATION_TRANSCRIPT = [
  {
    speaker: "AI" as const,
    text: "Hi, I'm calling from Huntlo Recruitment about a new opportunity. You previously applied for a sales role with us. Is now a good time?",
  },
  { speaker: "Candidate" as const, text: "Yes, I remember applying." },
  {
    speaker: "AI" as const,
    text: "We have a Business Development role at a different location. It's a full-time position with a competitive package. Would that be relevant to you currently?",
  },
  { speaker: "Candidate" as const, text: "Yes, I'm interested in that role." },
  {
    speaker: "AI" as const,
    text: "And are you available to start within the next month?",
  },
  { speaker: "Candidate" as const, text: "Yes, I can start within two weeks." },
  {
    speaker: "AI" as const,
    text: "Great. Would you like me to share the details with a recruiter who can follow up?",
  },
  { speaker: "Candidate" as const, text: "Yes, please." },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Identify the hiring requirement",
    detail:
      "Document the role, location, essential criteria, and approved candidate information.",
  },
  {
    stage: "02",
    title: "Review historical candidate records",
    detail:
      "Identify potentially relevant profiles and assess the age and quality of the information.",
  },
  {
    stage: "03",
    title: "Check contact eligibility",
    detail:
      "Review permissions, suppression preferences, and applicable data retention requirements.",
  },
  {
    stage: "04",
    title: "Prepare a relevant conversation",
    detail:
      "Explain why the candidate is being contacted and provide accurate opportunity details.",
  },
  {
    stage: "05",
    title: "Conduct initial re-engagement",
    detail:
      "Ask concise questions about current interest and availability.",
  },
  {
    stage: "06",
    title: "Organize responses",
    detail:
      "Distinguish interested candidates, unavailable candidates, information requests, callbacks, and declines.",
  },
  {
    stage: "07",
    title: "Route for recruiter review",
    detail:
      "Provide relevant information for human assessment and appropriate next steps.",
  },
] as const;

export const VOICE_CHANNEL_POINTS = [
  {
    title: "Some candidates prefer voice",
    detail:
      "Some candidates may respond more readily to a short phone conversation than to an email. Others may prefer messaging or direct recruiter contact.",
  },
  {
    title: "Respect preferences",
    detail:
      "A responsible reactivation strategy should consider these preferences. Voice can be one communication option, not an assumption that every candidate wants to be called.",
  },
  {
    title: "Avoid repeated outreach",
    detail:
      "The process should also avoid repeated outreach to candidates who have declined contact.",
  },
] as const;

export const ACTIONABLE_DATA_POINTS = [
  {
    title: "Understand what remains relevant",
    detail:
      "A candidate database is valuable when recruiters can understand which information remains relevant. Reactivation conversations can help establish whether candidates are interested in current opportunities.",
  },
  {
    title: "Do not rely on automated assessments",
    detail:
      "But automated responses should not become unquestioned assessments of suitability. Recruiters should review relevant information before progressing candidates.",
  },
  {
    title: "Follow approved processes",
    detail:
      "Any required qualification or eligibility checks must follow approved processes.",
  },
] as const;

export const PRIVACY_POINTS = [
  {
    title: "Personal information is involved",
    detail:
      "Candidate databases contain personal information. Organizations must consider applicable Indian privacy, telecom, consent, and recording requirements.",
  },
  {
    title: "Relevant and authorized contact",
    detail:
      "Contact should be relevant and appropriately authorized. Candidates should know who is calling and why.",
  },
  {
    title: "Clear opt-out",
    detail:
      "They should have a clear way to request no further communication. A reactivation strategy that ignores these principles can damage candidate trust.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Voice Candidate Follow-Up Automation", href: "/in/ai-voice-candidate-follow-up" },
  { label: "AI Recruitment Call Management Software", href: "/in/ai-recruitment-call-management" },
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
] as const;

export const AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_FAQS = [
  {
    question: "What is AI voice candidate database reactivation?",
    answer:
      "It uses automated voice conversations to support renewed contact with previous candidates and gather current interest or availability information.",
  },
  {
    question: "Can AI calling help staffing agencies reuse existing databases?",
    answer:
      "It may support relevant re-engagement workflows when candidate permissions, data quality, and human review are appropriately managed.",
  },
  {
    question: "Is database reactivation the same as candidate sourcing?",
    answer:
      "No. Sourcing identifies potential candidates. Reactivation reconnects with people already present in an organization's candidate records.",
  },
  {
    question: "Can old candidate records be contacted automatically?",
    answer:
      "Not without considering applicable permissions, privacy requirements, data retention, and communication preferences.",
  },
] as const;