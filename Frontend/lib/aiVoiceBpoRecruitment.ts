import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_BPO_RECRUITMENT_PATH = "/in/ai-voice-bpo-recruitment";

export const AI_VOICE_BPO_RECRUITMENT_SEO = {
  title: "AI Voice Recruitment for BPO Hiring | Huntlo",
  description:
    "Explore AI voice calling workflows for BPO and customer support recruitment, including candidate outreach, initial screening and interview coordination.",
  ogTitle: "BPO Hiring Moves Fast. Candidate Conversations Still Take Time.",
  ogDescription:
    "AI voice recruitment for BPO hiring uses structured automated conversations to support candidate outreach, initial screening and routine coordination while maintaining a clear path to human recruiters.",
} as const;

export function aiVoiceBpoRecruitmentMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_BPO_RECRUITMENT_SEO.title,
    description: AI_VOICE_BPO_RECRUITMENT_SEO.description,
    ogTitle: AI_VOICE_BPO_RECRUITMENT_SEO.ogTitle,
    ogDescription: AI_VOICE_BPO_RECRUITMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_BPO_RECRUITMENT_PATH,
  });
}

export const AI_VOICE_BPO_RECRUITMENT_GEO = {
  askTopic: "Huntlo AI voice recruitment for BPO hiring",
  askPrompt:
    "What is AI voice recruitment for BPO hiring on Huntlo at /in/ai-voice-bpo-recruitment (https://www.huntlo.ai/in/ai-voice-bpo-recruitment)? How do structured automated conversations support candidate outreach, initial screening and interview coordination?",
} as const;

export const BPO_VOICE_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the hiring requirement",
    detail:
      "Document the role, work location, shift expectations, essential criteria and approved candidate information.",
  },
  {
    stage: "02",
    title: "Prepare the screening conversation",
    detail:
      "Create a concise, job-relevant set of questions that avoids inappropriate or discriminatory criteria.",
  },
  {
    stage: "03",
    title: "Review contact permissions",
    detail:
      "Confirm the organization has an appropriate basis for contacting candidates.",
  },
  {
    stage: "04",
    title: "Conduct initial engagement",
    detail:
      "Use an approved voice workflow to explain the opportunity and collect relevant responses.",
  },
  {
    stage: "05",
    title: "Organize candidate outcomes",
    detail:
      "Distinguish interested candidates, candidates requesting clarification, unavailable applicants and those who decline further contact.",
  },
  {
    stage: "06",
    title: "Escalate to recruiters",
    detail:
      "Provide relevant information for human review and next-stage coordination.",
  },
  {
    stage: "07",
    title: "Support interview follow-up",
    detail:
      "Where supported, coordinate appropriate reminders or scheduling-related communication.",
  },
] as const;

export const BPO_VOICE_SCREENING_QUESTIONS = [
  "Does the candidate understand the role?",
  "Are they interested in the opportunity?",
  "Is the work location suitable?",
  "Can they work within the required schedule?",
  "Are they available for the next recruitment stage?",
] as const;

export const BPO_VOICE_INTERNAL_LINKS = [
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
  { label: "AI Recruitment Calling for Staffing Agencies", href: "/in/ai-recruitment-calling-staffing-agencies" },
  { label: "AI Voice Interview Scheduling", href: "/in/ai-voice-interview-scheduling" },
] as const;

export const AI_VOICE_BPO_RECRUITMENT_FAQS = [
  {
    question: "How can AI voice be used in BPO recruitment?",
    answer:
      "AI voice can support structured initial candidate conversations, interest checks, availability confirmation and selected recruitment follow-ups.",
  },
  {
    question: "Can AI calling screen candidates for customer support roles?",
    answer:
      "It can collect responses to approved job-related questions. Human recruiters should remain responsible for appropriate evaluation and hiring decisions.",
  },
  {
    question: "Can AI voice support shift-based hiring?",
    answer:
      "A properly designed screening conversation can ask relevant questions about shift availability. Actual platform capabilities must be verified.",
  },
  {
    question: "Does AI voice recruitment replace BPO recruiters?",
    answer:
      "Its role is to support repetitive communication, not replace recruiters' responsibility for candidate assessment, relationships and hiring decisions.",
  },
] as const;
