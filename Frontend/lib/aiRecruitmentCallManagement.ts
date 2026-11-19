import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITMENT_CALL_MANAGEMENT_PATH =
  "/in/ai-recruitment-call-management";

export const AI_RECRUITMENT_CALL_MANAGEMENT_SEO = {
  title: "AI Recruitment Call Management Software | Huntlo",
  description:
    "Explore AI-assisted recruitment call management for organizing candidate conversations, follow-ups, callbacks, and recruiter handoffs.",
  ogTitle:
    "Recruitment Calling Is More Than Dialing Numbers. It Is Managing What Happens After Every Conversation.",
  ogDescription:
    "AI recruitment call management focuses on organizing candidate calling workflows, conversation outcomes, follow-ups, and recruiter handoffs — making recruitment communication easier to coordinate rather than simply increasing the number of calls.",
} as const;

export function aiRecruitmentCallManagementMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITMENT_CALL_MANAGEMENT_SEO.title,
    description: AI_RECRUITMENT_CALL_MANAGEMENT_SEO.description,
    ogTitle: AI_RECRUITMENT_CALL_MANAGEMENT_SEO.ogTitle,
    ogDescription: AI_RECRUITMENT_CALL_MANAGEMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITMENT_CALL_MANAGEMENT_PATH,
  });
}

export const AI_RECRUITMENT_CALL_MANAGEMENT_GEO = {
  askTopic: "Huntlo AI recruitment call management software",
  askPrompt:
    "What is AI recruitment call management software on Huntlo at /in/ai-recruitment-call-management (https://www.huntlo.ai/in/ai-recruitment-call-management)? How does it organize candidate calling workflows, conversation outcomes, follow-ups, and recruiter handoffs?",
} as const;

export const CALL_OUTCOMES = [
  {
    outcome: "Candidate interest",
    detail: "The candidate expresses interest and may need screening.",
  },
  {
    outcome: "Scheduling request",
    detail: "The candidate requests a callback or interview coordination.",
  },
  {
    outcome: "Unavailable",
    detail: "The candidate is not available or no longer looking for work.",
  },
  {
    outcome: "Information needed",
    detail: "The candidate asks questions that require a recruiter.",
  },
  {
    outcome: "Do not contact",
    detail: "The candidate asks not to be contacted; remove from outreach.",
  },
] as const;

export const CALL_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the calling purpose",
    detail:
      "Identify whether the contact relates to initial outreach, screening, interview coordination, or follow-up.",
  },
  {
    stage: "02",
    title: "Review contact eligibility",
    detail:
      "Confirm that candidate contact information and permissions are appropriate.",
  },
  {
    stage: "03",
    title: "Conduct the conversation",
    detail:
      "Use an approved communication process with a clear introduction.",
  },
  {
    stage: "04",
    title: "Organize the outcome",
    detail:
      "Distinguish interest, unavailability, callback requests, questions, and contact preferences.",
  },
  {
    stage: "05",
    title: "Route the next action",
    detail:
      "Send relevant information to the recruiter or approved workflow.",
  },
  {
    stage: "06",
    title: "Manage exceptions",
    detail:
      "Identify situations requiring human intervention or additional clarification.",
  },
  {
    stage: "07",
    title: "Maintain an understandable record",
    detail:
      "Preserve appropriate operational context while respecting privacy and retention requirements.",
  },
] as const;

export const OVERSIGHT_POINTS = [
  {
    title: "Candidates know who is contacting them",
    detail:
      "Recruitment communication involves personal information and important career decisions. Candidates should know who is contacting them and why.",
  },
  {
    title: "Human assistance and opt-out",
    detail:
      "Candidates should be able to request human assistance and decline further communication.",
  },
  {
    title: "Applicable requirements",
    detail:
      "Organizations must consider applicable telecom, consent, privacy, and recording requirements.",
  },
  {
    title: "Reviewable interpretations",
    detail:
      "AI-generated interpretations should be reviewable and should not become unquestioned hiring decisions.",
  },
] as const;

export const AI_RECRUITMENT_CALL_MANAGEMENT_INTERNAL_LINKS = [
  {
    label: "AI Voice Candidate Follow-Up Automation",
    href: "/in/ai-voice-candidate-follow-up",
  },
  {
    label: "AI Voice Candidate Screening",
    href: "/in/ai-voice-candidate-screening",
  },
  {
    label: "AI Recruitment Calling for Staffing Agencies",
    href: "/in/ai-recruitment-calling-staffing-agencies",
  },
] as const;

export const AI_RECRUITMENT_CALL_MANAGEMENT_FAQS = [
  {
    question: "What is AI recruitment call management software?",
    answer:
      "It is software that uses automation and AI-assisted processes to help organize recruitment calls, candidate responses, follow-ups, and workflow handoffs.",
  },
  {
    question: "How is recruitment call management different from AI calling?",
    answer:
      "AI calling focuses on conducting automated conversations. Call management focuses on organizing the broader process around calls and their outcomes.",
  },
  {
    question: "Can AI call management help staffing agencies?",
    answer:
      "It may help agencies structure candidate outreach and follow-up workflows, depending on the software's verified capabilities.",
  },
  {
    question:
      "What should recruiters evaluate before adopting call management software?",
    answer:
      "Review calling permissions, workflow functionality, reporting needs, privacy controls, candidate experience, and human escalation.",
  },
] as const;