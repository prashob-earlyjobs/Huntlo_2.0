import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_INSIDE_SALES_HIRING_PATH = "/in/ai-voice-inside-sales-hiring";

export const AI_VOICE_INSIDE_SALES_HIRING_SEO = {
  title: "AI Voice Recruitment for Inside Sales Hiring | Huntlo",
  description:
    "Explore AI voice recruitment workflows for inside sales hiring, including candidate interest checks, initial screening, and interview coordination in India.",
  ogTitle: "Inside Sales Hiring Needs More Than a Resume. It Starts With a Conversation.",
  ogDescription:
    "AI voice recruitment for inside sales hiring focuses on using structured automated conversations to support initial candidate outreach, role interest checks, and routine recruitment coordination.",
} as const;

export function aiVoiceInsideSalesHiringMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_INSIDE_SALES_HIRING_SEO.title,
    description: AI_VOICE_INSIDE_SALES_HIRING_SEO.description,
    ogTitle: AI_VOICE_INSIDE_SALES_HIRING_SEO.ogTitle,
    ogDescription: AI_VOICE_INSIDE_SALES_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_INSIDE_SALES_HIRING_PATH,
  });
}

export const AI_VOICE_INSIDE_SALES_HIRING_GEO = {
  askTopic: "Huntlo AI Voice Recruitment for Inside Sales Hiring",
  askPrompt:
    "What is Huntlo AI Voice Recruitment for Inside Sales Hiring on /in/ai-voice-inside-sales-hiring (https://www.huntlo.ai/in/ai-voice-inside-sales-hiring)? How does it support candidate interest checks, initial screening, and interview coordination for inside sales roles in India?",
} as const;

export const HERO_FLOW = [
  "Inside Sales Hiring",
  "Voice Conversations",
  "Interest Checks",
  "Screening Coordination",
  "Recruiter Review",
  "Interview Scheduling",
  "Huntlo",
] as const;

export const PROBLEM_STATEMENTS = [
  "Recruiters repeat the same introductory questions throughout the day",
  "Candidates need clarity about role, schedule, and expectations",
  "Generic scripts don't capture role-specific requirements",
  "High-volume hiring makes personal first contact impractical",
  "Initial qualification needs to be organized for recruiter review",
  "Candidates should understand the opportunity before proceeding",
] as const;

export const DISTINCT_NEEDS = [
  "Inside sales roles vary — customer conversations, lead qualification, product explanations",
  "Some positions require prior experience, others suit freshers",
  "Work arrangement (office, remote, hybrid) affects candidate interest",
  "Candidates need to understand expectations before deciding to continue",
  "The initial conversation should be designed around the specific hiring requirement",
] as const;

export const VOICE_RECRUITMENT_CAPABILITIES = [
  "Candidate interest checks and role awareness confirmation",
  "Availability confirmation for work schedule and location",
  "Approved screening questions relevant to the role",
  "Interview-related follow-ups and coordination",
  "Response organization for recruiter review",
] as const;

export const GOOD_FIRST_CALL = [
  "Candidates understand the nature of the sales role",
  "Work arrangement is clearly communicated",
  "Relevant work expectations are explained",
  "Next recruitment stage is described",
  "Candidates can ask questions and get clarification",
  "Human recruiter available for questions beyond approved workflow",
] as const;

export const PRACTICAL_WORKFLOW = [
  {
    step: "Define the hiring requirement",
    description:
      "Document the role, work arrangement, essential criteria, and recruitment process.",
  },
  {
    step: "Prepare candidate outreach",
    description:
      "Review contact information and appropriate permissions.",
  },
  {
    step: "Design approved questions",
    description:
      "Focus on candidate interest, availability, and relevant job requirements.",
  },
  {
    step: "Conduct initial engagement",
    description:
      "Explain the opportunity and gather candidate responses.",
  },
  {
    step: "Organize outcomes",
    description:
      "Distinguish interested candidates, unavailable candidates, information requests, and callback needs.",
  },
  {
    step: "Route for recruiter review",
    description:
      "Provide relevant context for human assessment and next-stage decisions.",
  },
  {
    step: "Support interview coordination",
    description:
      "Where verified capabilities permit, coordinate appropriate reminders and scheduling-related communication.",
  },
] as const;

export const VOICE_VS_ASSESSMENT = [
  "Automated voice conversations collect initial information, not complete assessment",
  "Communication skills and customer judgment require structured human interviews",
  "Role suitability needs appropriate evaluation methods",
  "Avoid unsupported inferences from accent or speaking style",
  "Assessment process must remain job-relevant and appropriately reviewed",
] as const;

export const RESPONSIBLE_CALLING = [
  "Automated calls identify the recruiting organization and purpose",
  "Candidates can request human assistance at any point",
  "Consider applicable Indian telecom, privacy, consent, and recording requirements",
  "Avoid repeated unwanted calls",
  "Respect candidate preferences to decline further contact",
] as const;

export const FINAL_STATEMENT =
  "The objective is not simply to increase the number of calls. It is to make initial candidate engagement more relevant and manageable.";

export const AI_VOICE_INSIDE_SALES_HIRING_FAQS = [
  {
    question: "How can AI voice support inside sales recruitment?",
    answer:
      "AI voice can support structured candidate outreach, interest checks, availability confirmation, and selected follow-up activities.",
  },
  {
    question: "Can AI calling screen telesales candidates?",
    answer:
      "It can potentially collect responses to approved initial questions, but role suitability and communication skills require appropriate evaluation.",
  },
  {
    question: "Is AI voice suitable for fresher sales hiring?",
    answer:
      "It may support routine first-contact communication when the workflow is clear, respectful, and relevant to the role.",
  },
  {
    question: "Can AI voice replace sales recruitment interviews?",
    answer:
      "No. Automated first-contact conversations should not be treated as a substitute for appropriate candidate assessment.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Voice Recruitment for Field Sales Hiring", href: "/in/ai-voice-field-sales-hiring" },
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
  { label: "AI Voice Interview Scheduling", href: "/in/ai-voice-interview-scheduling" },
] as const;